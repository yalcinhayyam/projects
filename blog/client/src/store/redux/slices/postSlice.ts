import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Post, PostState } from "../../../types";
import { gql } from "@apollo/client";
import client from "../../../utils/apollo";

export const fetchPosts = createAsyncThunk(
  "posts/fetchPosts",
  async (_, { rejectWithValue }) => {
    try {
      const GET_POSTS = gql`
        query GetPosts {
          posts {
            id
            title
            content
            likesCount
            createdAt
            updatedAt
            likes {
              id
              user {
                id
                username
              }
            }
            author {
              id
              username
            }
          }
        }
      `;

      const { data, errors, error } = await client.query({
        query: GET_POSTS,
      });

      if (errors || error) {
        return rejectWithValue(errors || error);
      }

      return data.posts;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Fetch single post
export const fetchPost = createAsyncThunk(
  "posts/fetchPost",
  async (id: string, { rejectWithValue }) => {
    try {
      const GET_POST = gql`
        query GetPost($id: ID!) {
          post(id: $id) {
            id
            title
            content
            likesCount
            createdAt
            updatedAt
            author {
              id
              username
            }
            likes {
              id
              user {
                id
                username
              }
            }
          }
        }
      `;

      const { data, errors, error } = await client.query({
        query: GET_POST,
        variables: { id },
      });

      if (errors || error) {
        return rejectWithValue(errors || error);
      }

      return data.post;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Create post
export const createPost = createAsyncThunk(
  "posts/createPost",
  async (
    { title, content }: { title: string; content: string },
    { rejectWithValue }
  ) => {
    try {
      const CREATE_POST = gql`
        mutation CreatePost($title: String!, $content: String!) {
          createPost(title: $title, content: $content) {
            id
            title
            content
            likesCount
            createdAt
            updatedAt
            author {
              id
              username
            }
            likes {
              id
              user {
                id
                username
              }
            }
          }
        }
      `;

      const { data, errors, error } = await client.mutate({
        mutation: CREATE_POST,
        variables: { title, content },
      });

      if (errors || error) {
        return rejectWithValue(errors || error);
      }

      return data.createPost;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Update post
export const updatePost = createAsyncThunk(
  "posts/updatePost",
  async (
    { id, title, content }: { id: string; title?: string; content?: string },
    { rejectWithValue }
  ) => {
    try {
      const UPDATE_POST = gql`
        mutation UpdatePost($id: ID!, $title: String, $content: String) {
          updatePost(id: $id, title: $title, content: $content) {
            id
            title
            content
            updatedAt
          }
        }
      `;

      const { data, errors, error } = await client.mutate({
        mutation: UPDATE_POST,
        variables: { id, title, content },
      });

      if (errors || error) {
        return rejectWithValue(errors || error);
      }

      return data.updatePost;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Delete post
export const deletePost = createAsyncThunk(
  "posts/deletePost",
  async (id: string, { rejectWithValue }) => {
    try {
      const DELETE_POST = gql`
        mutation DeletePost($id: ID!) {
          deletePost(id: $id)
        }
      `;

      const { data, errors, error } = await client.mutate({
        mutation: DELETE_POST,
        variables: { id },
      });

      if (errors || error) {
        return rejectWithValue(errors || error);
      }

      return id;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Like post
export const likePost = createAsyncThunk(
  "posts/likePost",
  async (postId: string, { rejectWithValue }) => {
    try {
      const LIKE_POST = gql`
        mutation LikePost($postId: ID!) {
          likePost(postId: $postId) {
            id
            likesCount
            likes {
              id
              user {
                id
                username
              }
            }
          }
        }
      `;

      const { data, errors, error } = await client.mutate({
        mutation: LIKE_POST,
        variables: { postId },
      });

      if (errors || error) {
        return rejectWithValue(errors || error);
      }

      return data.likePost;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Unlike post
export const unlikePost = createAsyncThunk(
  "posts/unlikePost",
  async (postId: string, { rejectWithValue }) => {
    try {
      const UNLIKE_POST = gql`
        mutation UnlikePost($postId: ID!) {
          unlikePost(postId: $postId) {
            id
            likesCount
            likes {
              id
              user {
                id
                username
              }
            }
          }
        }
      `;

      const { data, errors, error } = await client.mutate({
        mutation: UNLIKE_POST,
        variables: { postId },
      });

      if (errors || error) {
        return rejectWithValue(errors || error);
      }

      return data.unlikePost;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState: PostState = {
  data: null,
  isLoading: false,
  errors: null,
  error: null,
  posts: [],
  currentPost: null,
};

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.errors = null;
      state.error = null;
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
  },
  extraReducers: (builder) => {
    // Common loading/error handling
    const handlePending = (state: PostState) => {
      state.isLoading = true;
      state.errors = null;
      state.error = null;
    };

    const handleRejected = (state: PostState, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.error = action.payload;
    };

    // Fetch Posts
    builder
      .addCase(fetchPosts.pending, handlePending)
      .addCase(fetchPosts.fulfilled, (state, action: PayloadAction<Post[]>) => {
        state.isLoading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, handleRejected);

    // Fetch Post
    builder
      .addCase(fetchPost.pending, handlePending)
      .addCase(fetchPost.fulfilled, (state, action: PayloadAction<Post>) => {
        state.isLoading = false;
        state.currentPost = action.payload;
      })
      .addCase(fetchPost.rejected, handleRejected);

    // Create Post
    builder
      .addCase(createPost.pending, handlePending)
      .addCase(createPost.fulfilled, (state, action: PayloadAction<Post>) => {
        state.isLoading = false;
        state.posts.unshift(action.payload);
      })
      .addCase(createPost.rejected, handleRejected);

    // Update Post
    builder
      .addCase(updatePost.pending, handlePending)
      .addCase(updatePost.fulfilled, (state, action: PayloadAction<Post>) => {
        state.isLoading = false;
        state.posts = state.posts.map((post) =>
          post.id === action.payload.id ? { ...post, ...action.payload } : post
        );
        if (state.currentPost?.id === action.payload.id) {
          state.currentPost = { ...state.currentPost, ...action.payload };
        }
      })
      .addCase(updatePost.rejected, handleRejected);

    // Delete Post
    builder
      .addCase(deletePost.pending, handlePending)
      .addCase(deletePost.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.posts = state.posts.filter((post) => post.id !== action.payload);
        if (state.currentPost?.id === action.payload) {
          state.currentPost = null;
        }
      })
      .addCase(deletePost.rejected, handleRejected);

    // Like Post
    builder
      .addCase(likePost.pending, handlePending)
      .addCase(likePost.fulfilled, (state, action: PayloadAction<Post>) => {
        state.isLoading = false;
        state.posts = state.posts.map((post) =>
          post.id === action.payload.id
            ? {
                ...post,
                likesCount: action.payload.likesCount,
                likes: action.payload.likes,
              }
            : post
        );
        if (state.currentPost?.id === action.payload.id) {
          state.currentPost.likesCount = action.payload.likesCount;
          state.currentPost.likes = action.payload.likes;
        }
      })
      .addCase(likePost.rejected, handleRejected);

    // Unlike Post
    builder
      .addCase(unlikePost.pending, handlePending)
      .addCase(unlikePost.fulfilled, (state, action: PayloadAction<Post>) => {
        state.isLoading = false;
        state.posts = state.posts.map((post) =>
          post.id === action.payload.id
            ? {
                ...post,
                likesCount: action.payload.likesCount,
                likes: action.payload.likes,
              }
            : post
        );
        if (state.currentPost?.id === action.payload.id) {
          state.currentPost.likesCount = action.payload.likesCount;
          state.currentPost.likes = action.payload.likes;
        }
      })
      .addCase(unlikePost.rejected, handleRejected);
  },
});

export const { clearErrors, clearCurrentPost } = postSlice.actions;
export default postSlice.reducer;
