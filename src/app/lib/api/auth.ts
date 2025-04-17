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
  profile_picture?: string;
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
    const response = await authApiClient.get<any>('/user');
    
    console.log('FULL USER RESPONSE:', JSON.stringify(response.data));
    
    const data = response.data;
    
    if (data.status === 'success' && data.data) {
      console.log('Current user response data:', data.data);
      
      console.log('Avatar field check:', {
        'data.data.avatar': data.data.avatar,
        'data.data.profile_picture': data.data.profile_picture,
        'data.user.avatar': data.user?.avatar,
        'data.user.profile_picture': data.user?.profile_picture,
        'data.avatar': data.avatar,
        'data.profile_picture': data.profile_picture,
        'data.profile_picture_url': data.profile_picture_url
      });
      
      const avatarUrl = 
        data.data.avatar || 
        data.data.profile_picture || 
        data.user?.avatar || 
        data.user?.profile_picture || 
        data.avatar || 
        data.profile_picture || 
        data.profile_picture_url ||
        undefined;
      
      console.log('Resolved avatar URL:', avatarUrl);
      
      const userData: User = {
        name: data.data.name,
        email: data.data.email,
        id: data.data.id,
        avatar: avatarUrl
      };
      
      console.log('Parsed user data with avatar:', userData);
      
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
export const updateProfile = async (data: UpdateProfileData, userId?: number): Promise<AuthResult> => {
  try {
    console.log('Starting profile update with data:', { 
      name: data.name, 
      hasAvatar: !!data.avatar,
      userId
    });
    
    if (data.avatar) {
      console.log('Avatar detected, using separate upload flow');
      try {
        const avatarResult = await uploadProfilePicture(data.avatar, userId);
        
        if (avatarResult.success && !data.name) {
          return avatarResult;
        }
        
        if (avatarResult.success && avatarResult.user) {
          console.log('Avatar upload successful, updating remaining profile data');
          
          if (!data.name) {
            return avatarResult;
          }
        }
      } catch (avatarError) {
        console.error('Error uploading avatar:', avatarError);
      }
    }
    
    const formData = new FormData();
    
    if (data.name) {
      formData.append('name', data.name);
    }
    
    for (const pair of (formData as any).entries()) {
      console.log(`Form data entry: ${pair[0]}: ${pair[1]}`);
    }
    
    let response;
    
    try {
      if (userId) {
        console.log(`Trying user-specific endpoint with PUT: /user/${userId}/profile`);
        
        try {
          response = await authApiClient.put<any>(`/user/${userId}/profile`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          console.log('Profile update response (PUT):', response.data);
        } catch (putError) {
          console.error('PUT request failed:', putError);
          
          console.log(`Trying PATCH as fallback: /user/${userId}/profile`);
          try {
            response = await authApiClient.patch<any>(`/user/${userId}/profile`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
            console.log('Profile update response (PATCH):', response.data);
          } catch (patchError) {
            console.error('PATCH request also failed:', patchError);
            throw patchError; // Re-throw the patch error
          }
        }
      } else {
        console.log('No user ID provided, using generic endpoint');
        try {
          console.log('Trying PUT request to /profile');
          response = await authApiClient.put<any>('/profile', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        } catch (putError) {
          console.log('PUT failed, trying POST request to /profile');
          response = await authApiClient.post<any>('/profile', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        }
        console.log('Profile update response:', response.data);
      }
      
      if (response.data) {
        if (response.data.user) {
          const userData: User = {
            name: response.data.user.name,
            email: response.data.user.email,
            id: response.data.user.id,
            avatar: response.data.user.profile_picture_url || response.data.user.avatar
          };
          
          console.log('Profile update successful, returning user data:', userData);
          
          return {
            success: true,
            user: userData
          };
        }
        
        if (response.data.data && typeof response.data.data === 'object') {
          const userData: User = {
            name: response.data.data.name,
            email: response.data.data.email,
            id: response.data.data.id,
            avatar: response.data.data.profile_picture_url || response.data.data.avatar
          };
          
          console.log('Profile update successful (format 2), returning user data:', userData);
          
          return {
            success: true,
            user: userData
          };
        }
        
        if (response.data.message && response.data.message.includes('success')) {
          console.log('Profile update appears successful but no user data received, refreshing user data');
          
          return {
            success: true,
            user: {
              name: data.name || '',
              email: '',  
              id: userId || 0
            }
          };
        }
      }
      
      console.log('Profile update response did not contain expected data');
      return { success: false, message: 'Profile update failed - unexpected response format' };
    } catch (error) {
      console.error('Error updating profile data:', error);
      return { 
        success: false, 
        message: 'Failed to update profile information' 
      };
    }
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error('Update profile error:', apiError.response?.data);
    console.error('Error status:', apiError.response?.status);
    
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

/**
 * Upload a profile picture
 */
export const uploadProfilePicture = async (file: File, userId?: number): Promise<AuthResult> => {
  try {
    console.log('Starting profile picture upload');
    
    const formData = new FormData();
    formData.append('avatar', file);
    
    // Add common variations in form field names
    formData.append('profile_picture', file);
    formData.append('image', file);
    formData.append('photo', file);
    
    let response: any = null; 
    
    const endpointsToTry = [
      ...(userId ? [
        { method: 'post', url: `/user/${userId}/avatar` },
        { method: 'put', url: `/user/${userId}/avatar` },
        { method: 'post', url: `/user/${userId}/profile/avatar` },
        { method: 'put', url: `/user/${userId}/profile` },  
        { method: 'post', url: `/user/${userId}/photo` },
      ] : []),
      
      // Generic endpoints that don't need user ID
      { method: 'post', url: '/avatar' },
      { method: 'post', url: '/profile/avatar' },
      { method: 'post', url: '/upload/avatar' },
      { method: 'post', url: '/user/avatar' },
      { method: 'put', url: '/profile' }
    ];
    
    console.log('Will try the following endpoints:', endpointsToTry.map(e => `${e.method.toUpperCase()} ${e.url}`));
    
    // Try each endpoint until one succeeds
    for (const endpoint of endpointsToTry) {
      try {
        console.log(`Trying ${endpoint.method.toUpperCase()} ${endpoint.url}`);
        
        if (endpoint.method === 'post') {
          response = await authApiClient.post<any>(endpoint.url, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        } else if (endpoint.method === 'put') {
          response = await authApiClient.put<any>(endpoint.url, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
        }
        
        console.log(`${endpoint.method.toUpperCase()} ${endpoint.url} succeeded:`, response.data);
        
        break;
      } catch (error) {
        console.warn(`${endpoint.method.toUpperCase()} ${endpoint.url} failed:`, error);
      }
    }
    
    if (!response) {
      console.error('All endpoints failed for avatar upload');
      return { 
        success: false, 
        message: 'Failed to upload profile picture - no working endpoint found' 
      };
    }
    
    // Parse the response
    if (response.data) {
      console.log('Successful avatar upload response with fields:', Object.keys(response.data));
      
      if (response.data.profile_picture) {
        console.log('Found profile_picture field:', response.data.profile_picture);
      }
      if (response.data.profile_picture_url) {
        console.log('Found profile_picture_url field:', response.data.profile_picture_url);
      }
      if (response.data.avatar) {
        console.log('Found avatar field:', response.data.avatar);
      }
      if (response.data.avatar_url) {
        console.log('Found avatar_url field:', response.data.avatar_url);
      }
      
      if (response.data.user) {
        console.log('User object fields:', Object.keys(response.data.user));
        
        if (response.data.user.profile_picture) {
          console.log('Found user.profile_picture:', response.data.user.profile_picture);
        }
        if (response.data.user.avatar) {
          console.log('Found user.avatar:', response.data.user.avatar);
        }
      }
      
      console.log('FULL RESPONSE DATA FROM AVATAR UPLOAD:', JSON.stringify(response.data));
      
      let userData: User | null = null;
      
      const avatarUrl = 
        response.data.user?.avatar || 
        response.data.user?.profile_picture || 
        response.data.data?.avatar || 
        response.data.data?.profile_picture || 
        response.data.avatar_url || 
        response.data.profile_picture_url || 
        response.data.profile_picture || 
        response.data.avatar ||
        response.data.url;
      
      console.log('Extracted avatar URL from response:', avatarUrl);
      
      if (response.data.user) {
        userData = {
          name: response.data.user.name,
          email: response.data.user.email,
          id: response.data.user.id,
          avatar: avatarUrl
        };
      } else if (response.data.data && typeof response.data.data === 'object') {
        userData = {
          name: response.data.data.name,
          email: response.data.data.email,
          id: response.data.data.id,
          avatar: avatarUrl
        };
      } else if (avatarUrl) {
        userData = {
          name: '', 
          email: '', 
          id: userId || 0,
          avatar: avatarUrl
        };
      } else if (response.data.message && response.data.message.includes('success')) {
        userData = {
          name: '', 
          email: '', 
          id: userId || 0,
          avatar: '' 
        };
      }
      
      if (userData) {
        console.log('Avatar upload successful, returning user data:', userData);
        return {
          success: true,
          user: userData
        };
      }
    }
    
    console.log('Avatar upload response did not contain expected data:', response.data);
    return { success: false, message: 'Avatar upload failed - unexpected response format' };
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error('Avatar upload error:', apiError.response?.data);
    console.error('Error status:', apiError.response?.status);
    
    let errorMessage = 'Avatar upload failed';
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