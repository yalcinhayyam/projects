const typeDefs = `#graphql
scalar RichText
scalar DateTime


type Post {
  id: ID!
  authorId: ID!
  title: String!
  content: RichText!
  likesCount: Int!
  createdAt: DateTime!
  updatedAt: DateTime!
  author: User!
  likes: [Like!]!
}

##########################

type PostEdge {
  node: Post!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

type PostConnection {
  edges: [PostEdge!]!
  nodes: [Post!]!
  pageInfo: PageInfo!
}

type Query {
  postsConnection(first: Int, after: String, last: Int, before: String, query: String): PostConnection!
  postsWithQuery(id: ID!): Post!
}
  
##########################




type User {
  id: ID!
  username: String!
  email: String!
  followers: [User!]!
  following: [User!]!
  posts: [Post!]!
  createdAt: DateTime!
  updatedAt: DateTime!
  pushSubscriptions: [PushSubscription!]!
}

type Like {
  id: ID!
  postId: ID!
  userId: ID!
  user: User!
  post: Post!
  createdAt: DateTime!
}

type AuthPayload {
  token: String!
  user: User!
}

type Notification {
  id: ID!
  userId: ID!
  message: String!
  type: NotificationType!
  relatedItemId: ID
  read: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum NotificationType {
  NEW_POST
  NEW_LIKE
  NEW_FOLLOWER
}

input PushSubscriptionInput {
  endpoint: String!
  keys: PushSubscriptionKeysInput!
}

input PushSubscriptionKeysInput {
  p256dh: String!
  auth: String!
}

type PushSubscription {
  id: ID!
  userId: ID!
  endpoint: String!
  p256dh: String!
  auth: String!
  user: User!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Query {
  me: User
  posts: [Post!]!
  post(id: ID!): Post
  users: [User!]!
  user(id: ID!): User
  notifications: [Notification!]!
  unreadNotifications: [Notification!]!
}

type Mutation {
  createPost(title: String!, content: RichText!): Post!
  updatePost(id: ID!, title: String, content: RichText): Post!
  deletePost(id: ID!): String!

  register(username: String!, email: String!, password: String!): AuthPayload!
  login(email: String!, password: String!): AuthPayload!

  likePost(postId: ID!): Post!
  unlikePost(postId: ID!): Post!

  followUser(userId: ID!): User!
  unfollowUser(userId: ID!): String!

  subscribeToPushNotifications(subscription: PushSubscriptionInput!): PushSubscription!
  unsubscribeFromPushNotifications(endpoint: String!): String!

  markNotificationAsRead(notificationId: ID!): Notification!
  markAllNotificationsAsRead: [Notification!]!
}

type Subscription {
  newPost(onlyFollowedAuthors: Boolean): Post!
  postLiked: Post! 
  newFollower(userId: ID): User!
  newNotification: Notification!
}
`;

module.exports = typeDefs;
