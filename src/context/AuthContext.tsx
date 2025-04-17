"use client";

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import * as api from '@/app/lib/api/';
import { User, LoginCredentials, RegisterData, AuthResult, UpdateProfileData } from '@/app/lib/api/types';

// Define a more specific error type
interface ApiError extends Error {
  response?: {
    data?: {
      error?: string | Record<string, string>;
      status?: string;
    };
    status?: number;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  register: (userData: RegisterData) => Promise<AuthResult>;
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<AuthResult>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const token = Cookies.get('auth_token');
        
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }
        
        const result = await api.getCurrentUser();
        
        if (result.success && result.user) {
          console.log('Auth check successful, user found:', result.user.name);
          setUser(result.user);
        } else {
          console.log('Auth check failed, no valid user found');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
    
    const interval = setInterval(checkAuth, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Register a new user
  const register = async (userData: RegisterData): Promise<AuthResult> => {
    setLoading(true);
    try {
      const result = await api.register(userData);
      
      if (result.success && result.user) {
        console.log('Registration successful:', result.user.name);
        setUser(result.user);
        return result;
      }
      
      return result;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('Registration error in context:', apiError);
      return { 
        success: false, 
        message: 'Registration failed due to an unexpected error',
      };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials: LoginCredentials): Promise<AuthResult> => {
    setLoading(true);
    try {
      const result = await api.login(credentials);
      
      if (result.success && result.user) {
        console.log('Login successful:', result.user.name);
        setUser(result.user);
        return result;
      }
      
      return result;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('Login error in context:', apiError);
      return { 
        success: false, 
        message: 'Login failed due to an unexpected error',
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    setLoading(true);
    try {
      await api.logout();
      setUser(null);
      router.push('/signin');
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      Cookies.remove('auth_token');
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (data: UpdateProfileData): Promise<AuthResult> => {
    setLoading(true);
    try {
      if (!user || !user.id) {
        return { 
          success: false, 
          message: 'No authenticated user found' 
        };
      }
      
      const result = await api.updateProfile(user.id, data);
      
      if (result.success && result.user) {
        setUser(result.user);
        return result;
      }
      
      return result;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      console.error('Profile update error in context:', apiError);
      return { 
        success: false, 
        message: 'Profile update failed due to an unexpected error',
      };
    } finally {
      setLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user, 
    loading, 
    isAuthenticated: !!user,
    register, 
    login, 
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};