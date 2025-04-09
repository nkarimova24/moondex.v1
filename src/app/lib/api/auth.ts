// Authentication API functions
import Cookies from 'js-cookie';
import { authApiClient } from './client';
import { LoginCredentials, RegisterData, AuthResult } from './types';

/**
 * Log in a user
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResult> => {
  try {
    const { data } = await authApiClient.post('/login', credentials);
    
    if (data.status === 'success' && data.data.token) {
      Cookies.set('auth_token', data.data.token, { expires: 7 });
      return { 
        success: true,
        user: {
          name: data.data.name,
          email: data.data.email,
          id: data.data.id,
        },
        token: data.data.token
      };
    }
    return { success: false, message: 'Login failed' };
  } catch (error: any) {
    console.error('Login error:', error.response?.data);
    return { 
      success: false, 
      message: error.response?.data?.error || 'Login failed',
      errors: error.response?.data?.error || {}
    };
  }
};

/**
 * Register a new user
 */
export const register = async (userData: RegisterData): Promise<AuthResult> => {
  try {
    const { data } = await authApiClient.post('/register', userData);
    
    if (data.status === 'success') {
      if (!data.data.token) {
        console.log('Registration successful, attempting login');
        return login({
          email: userData.email,
          password: userData.password
        });
      }
      
      Cookies.set('auth_token', data.data.token, { expires: 7 });
      return { 
        success: true,
        user: {
          name: data.data.name,
          email: data.data.email,
          id: data.data.id,
        },
        token: data.data.token
      };
    }
    
    return { success: false, message: 'Registration failed' };
  } catch (error: any) {
    console.error('Registration error:', error.response?.data);
    return { 
      success: false, 
      message: error.response?.data?.error || 'Registration failed',
      errors: error.response?.data?.error || {}
    };
  }
};

/**
 * Logout the current user
 */
export const logout = async (): Promise<boolean> => {
  try {
    await authApiClient.post('/logout');
    Cookies.remove('auth_token');
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    Cookies.remove('auth_token');
    return false;
  }
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async (): Promise<AuthResult> => {
  try {
    const token = Cookies.get('auth_token');
    if (!token) {
      return { success: false };
    }
    
    console.log('Fetching current user with token');
    const { data } = await authApiClient.get('/user');
    
    if (data.status === 'success' && data.data) {
      return { 
        success: true, 
        user: data.data 
      };
    }
    
    return { success: false };
  } catch (error: any) {
    console.error('Get current user error:', error.response || error);
    
    if (error.response && error.response.status === 401) {
      console.log('Removing invalid auth token');
      Cookies.remove('auth_token');
    }
    
    return { success: false };
  }
};