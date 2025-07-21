import { create } from 'zustand';
import { Post, PostState } from '../types';

// Mock data for demo purposes
const mockPosts: Post[] = [
  {
    id: '1',
    title: 'Getting Started with React',
    content: '<p>This is a comprehensive guide to get started with React...</p>',
    coverImageUrl: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    excerpt: 'Learn the basics of React and how to create your first app.',
    authorId: '1',
    author: {
      id: '1',
      username: 'johndoe',
      email: 'john@example.com',
      avatarUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300',
      isSubscribed: true,
      createdAt: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Mastering TypeScript',
    content: '<p>TypeScript adds static typing to JavaScript, making your code more robust...</p>',
    coverImageUrl: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    excerpt: 'A deep dive into TypeScript and its features.',
    authorId: '1',
    author: {
      id: '1',
      username: 'johndoe',
      email: 'john@example.com',
      avatarUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300',
      isSubscribed: true,
      createdAt: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'CSS Grid Layout',
    content: '<p>CSS Grid Layout is a powerful tool for creating complex layouts...</p>',
    coverImageUrl: 'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    excerpt: 'Learn how to use CSS Grid Layout for responsive designs.',
    authorId: '1',
    author: {
      id: '1',
      username: 'johndoe',
      email: 'john@example.com',
      avatarUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300',
      isSubscribed: true,
      createdAt: new Date().toISOString(),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const usePostStore = create<
  PostState & {
    fetchPosts: () => Promise<void>;
    fetchPostById: (id: string) => Promise<void>;
    createPost: (post: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'author'>) => Promise<void>;
    updatePost: (id: string, data: Partial<Post>) => Promise<void>;
    deletePost: (id: string) => Promise<void>;
  }
>((set) => ({
  posts: [],
  currentPost: null,
  isLoading: false,
  error: null,

  fetchPosts: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      set({ posts: mockPosts, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch posts', isLoading: false });
    }
  },

  fetchPostById: async (id) => {
    set({ isLoading: true, error: null, currentPost: null });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      const post = mockPosts.find((p) => p.id === id);
      if (post) {
        set({ currentPost: post, isLoading: false });
      } else {
        set({ error: 'Post not found', isLoading: false });
      }
    } catch (error) {
      set({ error: 'Failed to fetch post', isLoading: false });
    }
  },

  createPost: async (postData) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // In a real app, this would send data to your backend
      const newPost: Post = {
        ...postData,
        id: Math.random().toString(36).substring(2, 9),
        author: mockPosts[0].author, // Using the same author for demo
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      set((state) => ({ 
        posts: [newPost, ...state.posts],
        isLoading: false 
      }));
    } catch (error) {
      set({ error: 'Failed to create post', isLoading: false });
    }
  },

  updatePost: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      set((state) => {
        const updatedPosts = state.posts.map((post) =>
          post.id === id ? { ...post, ...data, updatedAt: new Date().toISOString() } : post
        );
        
        return {
          posts: updatedPosts,
          currentPost: state.currentPost?.id === id 
            ? { ...state.currentPost, ...data, updatedAt: new Date().toISOString() }
            : state.currentPost,
          isLoading: false,
        };
      });
    } catch (error) {
      set({ error: 'Failed to update post', isLoading: false });
    }
  },

  deletePost: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      set((state) => ({
        posts: state.posts.filter((post) => post.id !== id),
        currentPost: state.currentPost?.id === id ? null : state.currentPost,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to delete post', isLoading: false });
    }
  },
}));