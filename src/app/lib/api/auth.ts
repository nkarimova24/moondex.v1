// Authentication API functions
import Cookies from 'js-cookie';
import { authApiClient } from './client';
import { LoginCredentials, RegisterData, AuthResult, User, UpdateProfileData } from './types';

interface ApiResponse<T> {
  status: string;
  data: T;
}

interface UserResponseData {
  name: string;
  email: string;
  id: number;
  token?: string;
  avatar?: string;
}

interface ApiError extends Error {
  response?: {
    data?: {
      error?: string | Record<string, string>;
      status?: string;
    };
    status?: number;
  };
}

/**
 * Log in a user
 */
/**
 * Log in a user
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResult> => {
  try {
    console.log("Attempting login with:", { email: credentials.email });
    
    const response = await authApiClient.post<ApiResponse<UserResponseData>>('/login', credentials);
    const data = response.data;
    
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
    
    console.warn("Login response without success status or token:", data);
    return { success: false, message: 'Login failed - invalid response format' };
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error('Login error details:', {
      response: apiError.response,
      message: apiError.message,
      stack: apiError.stack
    });
    
    let errorMessage = 'Login failed';
    let errorDetails: Record<string, string> | undefined = undefined;
    
    if (apiError.response?.data?.error) {
      if (typeof apiError.response.data.error === 'string') {
        errorMessage = apiError.response.data.error;
      } else {
        errorDetails = apiError.response.data.error;
      }
    }
    
    return {
      success: false,
      message: errorMessage,
      errors: errorDetails
    };
  }
};

/**
 * Register a new user
 */
export const register = async (userData: RegisterData): Promise<AuthResult> => {
  try {
    const response = await authApiClient.post<ApiResponse<UserResponseData>>('/register', userData);
    const data = response.data;
    
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
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error('Registration error:', apiError.response?.data);
    
    let errorMessage = 'Registration failed';
    let errorDetails: Record<string, string> | undefined = undefined;
    
    if (apiError.response?.data?.error) {
      if (typeof apiError.response.data.error === 'string') {
        errorMessage = apiError.response.data.error;
      } else {
        errorDetails = apiError.response.data.error;
      }
    }
    
    return {
      success: false,
      message: errorMessage,
      errors: errorDetails
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
    const response = await authApiClient.get<ApiResponse<UserResponseData>>('/user');
    const data = response.data;
    
    if (data.status === 'success' && data.data) {
      const userData: User = {
        name: data.data.name,
        email: data.data.email,
        id: data.data.id
      };
      
      return {
        success: true,
        user: userData
      };
    }
    
    return { success: false };
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error('Get current user error:', apiError.response || error);
    
    if (apiError.response && apiError.response.status === 401) {
      console.log('Removing invalid auth token');
      Cookies.remove('auth_token');
    }
    
    return { success: false };
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (userId: number, data: UpdateProfileData): Promise<AuthResult> => {
  try {
    const formData = new FormData();
    
    if (data.name) {
      formData.append('name', data.name);
    }
    
    if (data.avatar) {
      formData.append('avatar', data.avatar);
    }
    
    const response = await authApiClient.post<ApiResponse<UserResponseData>>(`/user/${userId}/profile`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    const responseData = response.data;
    
    if (responseData.status === 'success' && responseData.data) {
      const userData: User = {
        name: responseData.data.name,
        email: responseData.data.email,
        id: responseData.data.id,
        avatar: responseData.data.avatar
      };
      
      return {
        success: true,
        user: userData
      };
    }
    
    return { success: false, message: 'Profile update failed' };
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error('Update profile error:', apiError.response?.data);
    
    let errorMessage = 'Profile update failed';
    let errorDetails: Record<string, string> | undefined = undefined;
    
    if (apiError.response?.data?.error) {
      if (typeof apiError.response.data.error === 'string') {
        errorMessage = apiError.response.data.error;
      } else {
        errorDetails = apiError.response.data.error;
      }
    }
    
    return {
      success: false,
      message: errorMessage,
      errors: errorDetails
    };
  }
};