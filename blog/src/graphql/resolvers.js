const webpush = require("web-push");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const uuid = require("uuid");
const { withFilter } = require("graphql-subscriptions");

const prisma = require("../utils/prisma");
const pubsub = require("../utils/pubsub");

const {
  relayConnectionWithProjection,
  getSingleWithProjection,
} = require("../utils/relay");


const users = new Map();

// Events
const NEW_POST_EVENT = "NEW_POST";
const POST_LIKED_EVENT = "POST_LIKED";
const NEW_FOLLOWER_EVENT = "NEW_FOLLOWER";
const NEW_NOTIFICATION_EVENT = "NEW_NOTIFICATION";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Utils
const createAuthToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "24h" });
};

const createNotification = async (
  userId,
  message,
  type,
  relatedItemId = null
) => {
  const notification = await prisma.notification.create({
    data: {
      id: uuid.v4(),
      userId,
      message,
      type,
      relatedItemId,
    },
  });

  pubsub.publish(NEW_NOTIFICATION_EVENT, { newNotification: notification });
  return notification;
};

const sendPushNotification = async (userId, message, type = "DEFAULT") => {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  if (subscriptions.length === 0) return;

  const payload = {
    title: "Blog Notification",
    body: message,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    data: {
      url: `/notifications?type=${type}`,
      createdAt: new Date().toISOString(),
    },
  };

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload)
        );
      } catch (error) {
        if (error.statusCode === 410) {
          await prisma.pushSubscription.delete({
            where: { endpoint: sub.endpoint },
          });
          console.log(`Invalid subscription removed: ${sub.endpoint}`);
        } else {
          console.error(
            `Failed to send notification (${sub.endpoint}):`,
            error
          );
        }
      }
    })
  );
};

const resolvers = {
  RichText: {
    __serialize: (value) => value,
    __parseValue: (value) => value,
    __parseLiteral: (ast) => {
      if (ast.kind === "ObjectValue") {
        const obj = {};
        ast.fields.forEach((field) => {
          obj[field.name.value] = resolvers.RichText.__parseLiteral(
            field.value
          );
        });
        return obj;
      }
      if (ast.kind === "StringValue") return ast.value;
      if (ast.kind === "IntValue") return parseInt(ast.value, 10);
      if (ast.kind === "FloatValue") return parseFloat(ast.value);
      if (ast.kind === "BooleanValue") return ast.value;
      if (ast.kind === "ListValue") {
        return ast.values.map((v) => resolvers.RichText.__parseLiteral(v));
      }
      return null;
    },
  },

  Query: {
    me: (_, __, { user }) => {
      if (!user) throw new Error("Unauthorized");
      return user;
    },

    posts: async () => {
      return await prisma.post.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          author: true,
          likes: { include: { user: true } },
        },
      });
    },

    post: async (_, { id }) => {
      const post = await prisma.post.findUnique({
        where: { id },
        include: {
          author: true,
          likes: { include: { user: true } },
        },
      });
      if (!post) throw new Error("Post not found");
      return post;
    },

    users: async () => {
      return await prisma.user.findMany({
        include: {
          followers: true,
          following: true,
        },
      });
    },

    user: async (_, { id }) => {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          followers: true,
          following: true,
          posts: {
            include: {
              likes: { include: { user: true } },
            },
          },
        },
      });
      if (!user) throw new Error("User not found");
      return user;
    },

    notifications: async (_, __, { user }) => {
      if (!user) throw new Error("Unauthorized");
      return await prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });
    },

    unreadNotifications: async (_, __, { user }) => {
      if (!user) throw new Error("Unauthorized");
      return await prisma.notification.findMany({
        where: {
          userId: user.id,
          read: false,
        },
        orderBy: { createdAt: "desc" },
      });
    },

    postsConnection: async (_, args, context, info) => {
      console.log(
       await  prisma.post.findMany({
          where: {
            AND: [
              { title: { contains: "#4" } },
              { id: { contains: "fbdc14b3-ad69" } },
            ],
          },
        })
      );
      return relayConnectionWithProjection(prisma.post, info, args, {}, {});
    },
    postsWithQuery: async (_, args, context, info) => {
      return getSingleWithProjection(context.prisma.post, info, {
        id: args.id,
      });
    },
  },

  Mutation: {
    createPost: async (_, { title, content }, { user }) => {
      if (!user) throw new Error("Unauthorized");

      const post = await prisma.post.create({
        data: {
          id: uuid.v4(),
          title,
          content,
          authorId: user.id,
          likesCount: 0,
        },
        include: {
          author: true,
          likes: { include: { user: true } },
        },
      });

      const author = await prisma.user.findUnique({
        where: { id: user.id },
        include: { followers: true },
      });

      if (author?.followers.length > 0) {
        await Promise.all(
          author.followers.map(async (follower) => {
            await createNotification(
              follower.id,
              `${user.username} shared a new post: ${title}`,
              "NEW_POST",
              post.id
            );
            await sendPushNotification(
              follower.id,
              `${user.username} shared a new post: ${title}`,
              "NEW_POST"
            );
          })
        );
      }

      pubsub.publish(NEW_POST_EVENT, { newPost: post });
      return post;
    },

    updatePost: async (_, { id, title, content }, { user }) => {
      if (!user) throw new Error("Unauthorized");

      const post = await prisma.post.findUnique({ where: { id } });
      if (!post) throw new Error("Post not found");
      if (post.authorId !== user.id)
        throw new Error("Not authorized to update this post");

      return await prisma.post.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(content && { content }),
        },
        include: {
          author: true,
          likes: { include: { user: true } },
        },
      });
    },

    deletePost: async (_, { id }, { user }) => {
      if (!user) throw new Error("Unauthorized");

      const post = await prisma.post.findUnique({ where: { id } });
      if (!post) throw new Error("Post not found");
      if (post.authorId !== user.id)
        throw new Error("Not authorized to delete this post");

      await prisma.$transaction([
        prisma.like.deleteMany({ where: { postId: id } }),
        prisma.notification.deleteMany({ where: { relatedItemId: id } }),
        prisma.post.delete({ where: { id } }),
      ]);

      return "Post deleted successfully";
    },

    register: async (_, { username, email, password }) => {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email }, { username }],
        },
      });

      if (existingUser) {
        throw new Error("User with this email or username already exists");
      }

      const user = await prisma.user.create({
        data: {
          id: uuid.v4(),
          username,
          email,
          password: await bcrypt.hash(password, 12),
        },
      });

      const token = createAuthToken(user.id);
      return { token, user };
    },

    login: async (_, { email, password }) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error("Invalid credentials");

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) throw new Error("Invalid credentials");

      const token = createAuthToken(user.id);
      return { token, user };
    },

    likePost: async (_, { postId }, { user }) => {
      if (!user) throw new Error("Unauthorized");

      const existingLike = await prisma.like.findFirst({
        where: { postId, userId: user.id },
      });

      if (existingLike) {
        throw new Error("You already liked this post");
      }

      const [like, post] = await prisma.$transaction([
        prisma.like.create({
          data: {
            id: uuid.v4(),
            postId,
            userId: user.id,
          },
        }),
        prisma.post.update({
          where: { id: postId },
          data: { likesCount: { increment: 1 } },
          include: {
            author: true,
            likes: { include: { user: true } },
          },
        }),
      ]);

      if (post.author.id !== user.id) {
        await createNotification(
          post.author.id,
          `${user.username} liked your post: ${post.title}`,
          "NEW_LIKE",
          postId
        );
        await sendPushNotification(
          post.author.id,
          `${user.username} liked your post: ${post.title}`,
          "NEW_LIKE"
        );
        pubsub.publish(POST_LIKED_EVENT, { postLiked: post });
      }

      return post;
    },

    unlikePost: async (_, { postId }, { user }) => {
      if (!user) throw new Error("Unauthorized");

      const existingLike = await prisma.like.findFirst({
        where: { postId, userId: user.id },
      });

      if (!existingLike) {
        throw new Error("You haven't liked this post");
      }

      const [, post] = await prisma.$transaction([
        prisma.like.delete({
          where: { id: existingLike.id },
        }),
        prisma.post.update({
          where: { id: postId },
          data: { likesCount: { decrement: 1 } },
          include: {
            author: true,
            likes: { include: { user: true } },
          },
        }),
      ]);

      return post;
    },

    followUser: async (_, { userId }, { user }) => {
      if (!user) throw new Error("Unauthorized");
      if (user.id === userId) throw new Error("You cannot follow yourself");

      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (!targetUser) throw new Error("User not found");

      const isAlreadyFollowing = await prisma.user.findFirst({
        where: {
          id: user.id,
          following: { some: { id: userId } },
        },
      });

      if (isAlreadyFollowing) {
        throw new Error("You are already following this user");
      }

      const [followedUser] = await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { followers: { connect: { id: user.id } } },
          include: { followers: true, following: true },
        }),
        prisma.user.update({
          where: { id: user.id },
          data: { following: { connect: { id: userId } } },
        }),
      ]);

      await createNotification(
        userId,
        `${user.username} started following you`,
        "NEW_FOLLOWER",
        user.id
      );
      await sendPushNotification(
        userId,
        `${user.username} started following you`,
        "NEW_FOLLOWER"
      );

      pubsub.publish(NEW_FOLLOWER_EVENT, {
        newFollower: user,
        followedUserId: followedUser.id,
      });
      return followedUser;
    },

    unfollowUser: async (_, { userId }, { user }) => {
      if (!user) throw new Error("Unauthorized");
      if (user.id === userId) throw new Error("You cannot unfollow yourself");

      const isFollowing = await prisma.user.findFirst({
        where: {
          id: user.id,
          following: { some: { id: userId } },
        },
      });

      if (!isFollowing) {
        throw new Error("You are not following this user");
      }

      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { followers: { disconnect: { id: user.id } } },
        }),
        prisma.user.update({
          where: { id: user.id },
          data: { following: { disconnect: { id: userId } } },
        }),
      ]);

      return "Successfully unfollowed";
    },

    subscribeToPushNotifications: async (_, { subscription }, { user }) => {
      if (!user) throw new Error("Unauthorized");

      const existing = await prisma.pushSubscription.findUnique({
        where: { endpoint: subscription.endpoint },
      });

      if (existing) {
        if (existing.userId !== user.id) {
          return await prisma.pushSubscription.update({
            where: { endpoint: subscription.endpoint },
            data: { userId: user.id },
          });
        }
        return existing;
      }

      return await prisma.pushSubscription.create({
        data: {
          id: uuid.v4(),
          userId: user.id,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      });
    },

    unsubscribeFromPushNotifications: async (_, { endpoint }, { user }) => {
      if (!user) throw new Error("Unauthorized");

      const result = await prisma.pushSubscription.deleteMany({
        where: { endpoint, userId: user.id },
      });

      if (result.count === 0) {
        throw new Error("Subscription not found or unauthorized");
      }

      return "Successfully unsubscribed";
    },

    markNotificationAsRead: async (_, { notificationId }, { user }) => {
      if (!user) throw new Error("Unauthorized");

      const notification = await prisma.notification.findUnique({
        where: { id: notificationId },
      });

      if (!notification) throw new Error("Notification not found");
      if (notification.userId !== user.id) throw new Error("Unauthorized");

      return await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
      });
    },

    markAllNotificationsAsRead: async (_, __, { user }) => {
      if (!user) throw new Error("Unauthorized");

      await prisma.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true },
      });

      return await prisma.notification.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });
    },
  },
  Subscription: {
    newPost: {
      subscribe: (_, { onlyFollowedAuthors }, { user }) => {
        const baseIterator = pubsub.asyncIterableIterator(NEW_POST_EVENT);

        if (onlyFollowedAuthors && user) {
          return withFilter(
            () => baseIterator,
            async (payload) => {
              const isFollowing = await prisma.user.findFirst({
                where: {
                  id: user.id,
                  following: { some: { id: payload.newPost.authorId } },
                },
              });
              return !!isFollowing;
            }
          )(baseIterator);
        }
        return baseIterator;
      },
    },

    postLiked: {
      subscribe: (_, __, { user }) => {
        if (!user) throw new Error("Unauthorized");

        const baseIterator = pubsub.asyncIterableIterator(POST_LIKED_EVENT);

        return withFilter(
          () => baseIterator,
          (payload) => payload.postLiked.author.id === user.id
        )(baseIterator);
      },
    },

    newFollower: {
      subscribe: (_, { userId }) => {
        const baseIterator = pubsub.asyncIterableIterator(NEW_FOLLOWER_EVENT);
        if (userId) {
          return withFilter(
            () => baseIterator,
            (payload) => payload.followedUserId === userId
          )(baseIterator);
        }
        return baseIterator;
      },
    },

    newNotification: {
      subscribe: (_, __, { user }) => {
        if (!user) throw new Error("Unauthorized");
        const baseIterator = pubsub.asyncIterableIterator(
          NEW_NOTIFICATION_EVENT
        );
        return withFilter(
          () => baseIterator,
          (payload) => payload.newNotification.userId === user.id
        )(baseIterator);
      },
    },
  },
};

module.exports = resolvers;
