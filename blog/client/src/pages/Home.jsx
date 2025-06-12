// !!!!!!!!!!!!!!
// // editor js, quill.js or similar rich text editor
// // check graphql serializer
// // implement push notification
// // implement subscriber feature
// // implement gql subscriptions
// // toast messages
// // cdn bucket file upload integration
// // https://chat.deepseek.com/a/chat/s/63e47531-2d96-4b5a-8726-f32a7054e6a3
// // https://chat.deepseek.com/a/chat/s/8c4c3883-f673-4d5f-94bb-05cddebf826f

// // integration testing optional vitest, apollo server integrations assert
// // redis optional
// // oauth optional
// // kafka/nats optional
// // refresh token optional
// !!!!!!!!!!!!!!
// // Separate features and ask to ai with part of part
// Kafka, ELasticSearch, Redis, RabbitMQ, Docker, Nats, Push Notifications, Subscriptions, CDN Integration


import { useState, useRef } from "react";
import { 
  useQuery,
  useMutation,
  useSubscription,
  useApolloClient,
} from "@apollo/client";
import QuillEditor from "../components/QuillEditor";
import "react-quill/dist/quill.snow.css";
import { useAuth } from "../context/AuthContext";
import {
  GET_POSTS,
  CREATE_POST,
  DELETE_POST,
  LIKE_POST,
  UNLIKE_POST,
  NEW_POST_SUBSCRIPTION,
  POST_LIKED_SUBSCRIPTION,
  NEW_NOTIFICATION_SUBSCRIPTION,
} from "../graphql";
import toast from "react-hot-toast";

function Home() {
  const { user } = useAuth();
  const client = useApolloClient();
  const { loading, error, data, refetch } = useQuery(GET_POSTS);
  const titleRef = useRef(null);
  const [content, setContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const quillRef = useRef(null);

  const [likePost] = useMutation(LIKE_POST, {
    update: (cache, { data: { likePost: updatedPost } }) => {
      const existingPosts = cache.readQuery({ query: GET_POSTS });

      if (existingPosts) {
        cache.writeQuery({
          query: GET_POSTS,
          data: {
            posts: existingPosts.posts.map((post) => {
              if (post.id === updatedPost.id) {
                return {
                  ...post,
                  likesCount: updatedPost.likesCount,
                  likes: updatedPost.likes,
                };
              }
              return post;
            }),
          },
        });
      }
    },
    onCompleted: () => {
      toast.success("Post liked! ❤️", {
        position: "bottom-right",
        duration: 2000,
      });
    },
    onError: (err) => {
      console.error("Like error:", err);
      toast.error(err.message);
    },
  });

  const [unlikePost] = useMutation(UNLIKE_POST, {
    update: (cache, { data: { unlikePost: updatedPost } }) => {
      try {
        const existingPosts = cache.readQuery({ query: GET_POSTS });
        if (existingPosts) {
          cache.writeQuery({
            query: GET_POSTS,
            data: {
              posts: existingPosts.posts.map((post) =>
                post.id === updatedPost.id ? updatedPost : post
              ),
            },
          });
        }
      } catch (error) {
        console.warn("Cache update failed:", error);
        refetch();
      }
    },
    onCompleted: () => {
      toast.success("Post unliked", {
        position: "bottom-right",
        duration: 2000,
      });
    },
    onError: (err) => {
      console.error("Unlike error:", err);
      toast.error(err.message);
    },
  });

  const handleLike = async (postId) => {
    const post = data.posts.find((p) => p.id === postId);
    if (!post) return;

    const isLiked = post.likes?.some((like) => like.user.id === user.id);

    try {
      if (isLiked) {
        await unlikePost({ variables: { postId } });
      } else {
        await likePost({ variables: { postId } });
      }
    } catch (err) {
      console.error("Like/unlike error:", err);
    }
  };

  const [createPost] = useMutation(CREATE_POST, {
    update: (cache, { data: { createPost: newPost } }) => {
      try {
        const existingPosts = cache.readQuery({ query: GET_POSTS });
        if (existingPosts) {
          cache.writeQuery({
            query: GET_POSTS,
            data: {
              posts: [newPost, ...existingPosts.posts],
            },
          });
        }
      } catch (error) {
        console.warn("Cache update failed:", error);
        refetch();
      }
    },
    onCompleted: () => {
      toast.success("🎉 Post created successfully!", {
        duration: 3000,
        position: "top-center",
      });
      titleRef.current.value = "";
      setContent("");
      setIsCreating(false);
    },
    onError: (err) => {
      console.error("Create post error:", err);
      toast.error(err.message);
      setIsCreating(false);
    },
  });

  const [deletePost] = useMutation(DELETE_POST, {
    update: (cache, { variables: { id } }) => {
      try {
        const existingPosts = cache.readQuery({ query: GET_POSTS });
        if (existingPosts) {
          cache.writeQuery({
            query: GET_POSTS,
            data: {
              posts: existingPosts.posts.filter((post) => post.id !== id),
            },
          });
        }
      } catch (error) {
        console.warn("Cache update failed:", error);
        refetch();
      }
    },
    onCompleted: () => toast.success("🗑️ Post deleted!", {
      position: "bottom-right",
    }),
    onError: (err) => {
      console.error("Delete post error:", err);
      toast.error(err.message);
    },
  });

  useSubscription(NEW_POST_SUBSCRIPTION, {
    variables: { onlyFollowedAuthors: Boolean(user?.following?.length) },
    onData: ({ data: subscriptionData }) => {
      const newPost = subscriptionData?.data?.newPost;
      if (!newPost) return;

      if (newPost.author.id === user?.id) return;

      toast.success(
        `🚀 New post from ${newPost.author.username}: "${newPost.title}"`,
        {
          position: "top-center",
          duration: 5000,
        }
      );
    },
    onError: (err) => {
      console.error("New post subscription error:", err);
    },
    skip: !user,
  });

  useSubscription(NEW_NOTIFICATION_SUBSCRIPTION, {
    onData: ({ data: subscriptionData }) => {
      const notification = subscriptionData?.data?.newNotification;
      if (!notification) return;

      if (notification.type === "NEW_LIKE") {
        toast.success(`❤️ ${notification.message}`, {
          position: "top-center",
          duration: 4000,
        });
      } else if (notification.type === "NEW_FOLLOWER") {
        toast.success(`👤 ${notification.message}`, {
          position: "top-center",
          duration: 4000,
        });
      } else {
        toast(notification.message, {
          position: "top-center",
          duration: 4000,
        });
      }
    },
    onError: (err) => {
      console.error("Notification subscription error:", err);
    },
    skip: !user,
  });

  useSubscription(POST_LIKED_SUBSCRIPTION, {
    onData: ({ data: subscriptionData }) => {
      const updatedPost = subscriptionData?.data?.postLiked;
      if (!updatedPost) return;

      try {
        const existingPosts = client.cache.readQuery({ query: GET_POSTS });
        if (existingPosts) {
          client.cache.writeQuery({
            query: GET_POSTS,
            data: {
              posts: existingPosts.posts.map((post) =>
                post.id === updatedPost.id
                  ? {
                      ...post,
                      likesCount: updatedPost.likesCount,
                      likes: updatedPost.likes,
                    }
                  : post
              ),
            },
          });
        }
      } catch (error) {
        console.warn("Cache update from subscription failed:", error);
      }

      toast.success(
        `💖 Your post "${updatedPost.title}" received a new like!`,
        {
          position: "top-center",
          duration: 4000,
        }
      );
    },
    onError: (err) => {
      console.error("Post like subscription error:", err);
    },
    skip: !user,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    if (!user) {
      toast.error("Please login to create posts");
      setIsCreating(false);
      return;
    }
    const title = titleRef.current.value.trim();
    if (!title || !content.trim()) {
      toast.error("Title and content are required!");
      setIsCreating(false);
      return;
    }

    try {
      await createPost({
        variables: {
          title,
          content,
        },
      });
    } catch (err) {
      console.error("Submit error:", err);
      setIsCreating(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      await deletePost({ variables: { id: postId } });
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 border-t-blue-500 mx-auto mb-6"></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-purple-400 animate-spin mx-auto" style={{animationDelay: '0.5s', animationDuration: '1.5s'}}></div>
            </div>
            <p className="text-slate-600 font-medium text-lg">Loading your feed...</p>
            <p className="text-slate-400 text-sm mt-2">Getting the latest posts</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
        <div className="container mx-auto max-w-2xl pt-20">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-500 text-2xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Oops! Something went wrong</h2>
              <p className="text-red-600 mb-6 bg-red-50 p-4 rounded-lg border border-red-200">
                {error.message}
              </p>
              <button
                onClick={() => refetch()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const posts = data?.posts || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-4 max-w-4xl">
        
        {/* Header */}
        <div className="text-center py-8 mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome to Your Feed
          </h1>
          <p className="text-slate-600">Share your thoughts and connect with others</p>
        </div>

        {/* Create Post Form */}
        {user && (
          <div className="bg-white rounded-2xl shadow-xl mb-8 border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">✨</span>
                Create New Post
              </h2>
              <p className="text-blue-100 mt-1">Share something amazing with the world</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="What's your post about? Give it a catchy title..."
                  ref={titleRef}
                  className="w-full p-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-lg placeholder-slate-400"
                  required
                />
              </div>
              
              <div className="mb-6">
                <div className="border-2 border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all duration-300">
                  <QuillEditor ref={quillRef} value={content} onChange={setContent} />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isCreating || !titleRef.current?.value.trim() || !content.trim()}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg disabled:shadow-none flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Publishing...
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      Publish Post
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Posts List */}
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">No posts yet</h3>
              <p className="text-slate-600 mb-4">The community is waiting for your first post!</p>
              {user && (
                <p className="text-blue-600 font-medium">Be the first to share something amazing! ✨</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post, index) => {
              const isLiked = post.likes?.some(
                (like) => like.user.id === user?.id
              );
              const isOwner = user?.id === post.author.id;

              return (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 border border-slate-100 overflow-hidden transform hover:-translate-y-1"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards'
                  }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {post.author.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer">
                            {post.author.username}
                          </h4>
                          <p className="text-slate-500 text-sm">
                            {new Date(post.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      {isOwner && (
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                          title="Delete post"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>

                    <h3 className="text-2xl font-bold mb-4 text-slate-800 leading-tight">
                      {post.title}
                    </h3>
                    
                    <div
                      className="text-slate-700 mb-6 prose max-w-none prose-headings:text-slate-800 prose-links:text-blue-600 prose-strong:text-slate-800"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-4">
                        {user && (
                          <button
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 transform hover:scale-105 ${
                              isLiked
                                ? "bg-red-50 text-red-500 hover:bg-red-100"
                                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                            }`}
                            title={isLiked ? "Unlike" : "Like"}
                          >
                            <svg 
                              className={`w-5 h-5 transition-all duration-300 ${isLiked ? 'fill-current scale-110' : 'stroke-current'}`} 
                              viewBox="0 0 24 24" 
                              fill={isLiked ? "currentColor" : "none"} 
                              stroke="currentColor" 
                              strokeWidth="2"
                            >
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                            <span className="font-medium">{post.likesCount || 0}</span>
                          </button>
                        )}
                      </div>
                      
                      <div className="text-slate-500 text-sm">
                        {new Date(post.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default Home;