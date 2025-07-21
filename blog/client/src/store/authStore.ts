import { create } from 'zustand';
import { AuthState } from '../types';

// Mock data for demo purposes
const mockUser = {
  id: '1',
  username: 'johndoe',
  email: 'john@example.com',
  bio: 'A passionate writer and blogger',
  avatarUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300',
  isSubscribed: true,
  createdAt: new Date().toISOString(),
};

export const useAuthStore = create<
  AuthState & {
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    updateProfile: (data: Partial<Omit<AuthState['user'], 'id' | 'createdAt'>>) => Promise<void>;
  }
>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // In a real app, validate credentials with backend
      if (email === 'john@example.com' && password === 'password') {
        set({ user: mockUser, isAuthenticated: true, isLoading: false });
      } else {
        set({ error: 'Invalid credentials', isLoading: false });
      }
    } catch (error) {
      set({ error: 'An error occurred during login', isLoading: false });
    }
  },

  register: async (username, email, password) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // In a real app, this would send data to your backend
      const newUser = {
        ...mockUser,
        username,
        email,
      };
      
      set({ user: newUser, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ error: 'An error occurred during registration', isLoading: false });
    }
  },

  logout: () => {
    // In a real app, this would also invalidate the session on the backend
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // In a real app, this would send data to your backend
      set((state) => ({
        user: state.user ? { ...state.user, ...data } : null,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'An error occurred while updating profile', isLoading: false });
    }
  },
}));