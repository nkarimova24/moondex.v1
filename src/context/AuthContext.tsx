"use client";

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import * as api from '@/app/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface AuthResult {
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  register: (userData: RegisterData) => Promise<AuthResult>;
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  logout: () => Promise<void>;
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
      try {
        const result = await api.getCurrentUser();
        if (result.success && result.user) {
          setUser(result.user);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Register user
  const register = async (userData: RegisterData): Promise<AuthResult> => {
    try {
      const result = await api.register(userData);
      
      if (result.success && result.user) {
        setUser(result.user);
      }
      
      return { 
        success: result.success,
        message: result.message,
        errors: result.errors
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: 'Registration failed',
      };
    }
  };

  // Login user
  const login = async (credentials: LoginCredentials): Promise<AuthResult> => {
    try {
      const result = await api.login(credentials);
      
      if (result.success && result.user) {
        setUser(result.user);
      }
      
      return { 
        success: result.success,
        message: result.message,
        errors: result.errors
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: 'Login failed',
      };
    }
  };

  // Logout user
  const logout = async () => {
    await api.logout();
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isAuthenticated: !!user,
      register, 
      login, 
      logout
    }}>
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