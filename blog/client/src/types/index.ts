export interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  followers?: number;
  following?: number;
  isFollowing?: boolean;
  bio?: string;
  joinDate?: string;
  avatarUrl?: string;
  isSubscribed?: boolean;
  createdAt?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: User;
  createdAt: string;
  likes: number;
  comments: number;
  views: number;
  isLiked: boolean;
  tags: string[];
  category: string;
  coverImageUrl?: string;
  excerpt?: string;
  authorId?: string;
  updatedAt?: string;
}

export interface Comment {
  id: number;
  content: string;
  author: User;
  createdAt: string;
  likes: number;
}

export interface AuthData {
  email: string;
  password: string;
  username?: string;
}

export interface NewPost {
  title: string;
  content: string;
  tags: string;
  category: string;
  isDraft: boolean;
  coverImageUrl?: string;
  excerpt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface PostState {
  posts: Post[];
  currentPost: Post | null;
  isLoading: boolean;
  error: string | null;
}