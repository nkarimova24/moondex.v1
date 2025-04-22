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
  password_change_required?: boolean;
}

interface ApiError extends Error {
  response?: {
    data?: {
      error?: string | Record<string, string>;
      status?: string;
      message?: string;
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
          password_change_required: data.data.password_change_required
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
        avatar: avatarUrl,
        password_change_required: data.data.password_change_required || false
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
      email: data.email,
      hasAvatar: !!data.avatar,
      userId
    });
    
    let emailResult: AuthResult | null = null;
    let avatarResult: AuthResult | null = null;
    
    // If email is changing, use the dedicated email change endpoint
    if (data.email) {
      console.log('Email change detected, using dedicated endpoint');
      try {
        emailResult = await changeEmail(data.email, userId);
        if (!emailResult.success) {
          return emailResult; // Return early if email change failed
        }
        
        // If only email is changing and no other fields, return the email result
        if (!data.name && !data.avatar) {
          return emailResult;
        }
        
        // If email change is successful and we have user data, use it
        if (emailResult.success && emailResult.user) {
          console.log('Email change successful, updating other profile data');
        }
      } catch (emailError) {
        console.error('Error changing email:', emailError);
        return {
          success: false,
          message: 'Failed to update email address'
        };
      }
    }
    
    if (data.avatar) {
      console.log('Avatar detected, using separate upload flow');
      try {
        avatarResult = await uploadProfilePicture(data.avatar, userId);
        
        if (avatarResult.success && !data.name) {
          // If we already have email result with user data, merge it
          if (emailResult && emailResult.success && emailResult.user && avatarResult.user) {
            const mergedUser: User = {
              ...avatarResult.user,
              email: emailResult.user.email
            };
            
            return {
              success: true,
              user: mergedUser,
              message: 'Profile updated successfully'
            };
          }
          
          return avatarResult;
        }
        
        if (avatarResult.success && avatarResult.user) {
          console.log('Avatar upload successful, updating remaining profile data');
          
          if (!data.name) {
            // If we already have email result with user data, merge it
            if (emailResult && emailResult.success && emailResult.user && avatarResult.user) {
              const mergedUser: User = {
                ...avatarResult.user,
                email: emailResult.user.email
              };
              
              return {
                success: true,
                user: mergedUser,
                message: 'Profile updated successfully'
              };
            }
            
            return avatarResult;
          }
        }
      } catch (avatarError) {
        console.error('Error uploading avatar:', avatarError);
      }
    }
    
    // If we only needed to change the email and/or avatar and we're done, return
    if ((!data.name && data.email && emailResult && emailResult.success) &&
        (!data.avatar || (data.avatar && avatarResult && avatarResult.success))) {
      
      // If both operations succeeded with user data, merge the user data
      if (emailResult && emailResult.user && avatarResult && avatarResult.user) {
        const mergedUser: User = {
          ...emailResult.user,
          ...avatarResult.user,
          avatar: avatarResult.user.avatar // Prefer avatar from avatar result
        };
        
        return {
          success: true,
          user: mergedUser,
          message: 'Profile updated successfully'
        };
      }
      
      // Return whichever result has user data, preferring email result
      return emailResult && emailResult.user ? emailResult : avatarResult || emailResult;
    }
    
    // If we're here, we need to update the name or continue with other updates
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

/**
 * Change user's username
 */
export const changeUsername = async (newUsername: string, userId?: number): Promise<AuthResult> => {
  try {
    console.log('Starting username change with:', { newUsername, userId });
    
    let endpoint = '/api/profile/username';
    if (userId) {
      endpoint = `/api/user/${userId}/username`;
    }
    
    const response = await authApiClient.post<any>(endpoint, { username: newUsername });
    
    console.log('Username change response:', response.data);
    
    if (response.data && response.data.status === 'success') {
      // Extract user data from response
      let userData: User | undefined;
      
      if (response.data.data) {
        userData = {
          name: response.data.data.name,
          email: response.data.data.email,
          id: response.data.data.id,
          avatar: response.data.data.avatar || response.data.data.profile_picture
        };
      } else if (response.data.user) {
        userData = {
          name: response.data.user.name, 
          email: response.data.user.email,
          id: response.data.user.id,
          avatar: response.data.user.avatar || response.data.user.profile_picture
        };
      }
      
      if (userData) {
        return {
          success: true,
          user: userData,
          message: response.data.message || 'Username changed successfully'
        };
      }
      
      // If we don't have user data but the request was successful
      return {
        success: true,
        message: response.data.message || 'Username changed successfully'
      };
    }
    
    return { 
      success: false, 
      message: response.data.message || 'Failed to change username' 
    };
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error('Username change error:', apiError.response?.data);
    
    let errorMessage = 'Failed to change username';
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
 * Change user's email address
 */
export const changeEmail = async (newEmail: string, userId?: number): Promise<AuthResult> => {
  try {
    console.log('Starting email change with:', { newEmail, userId });
    
    // Use the correct endpoint based on whether we have a userId
    let endpoint = '/profile/email';
    if (userId) {
      // Reverting to the original endpoint without /update suffix
      endpoint = `/user/${userId}/email`;
    }
    
    const response = await authApiClient.post<any>(endpoint, { 
      email: newEmail,
      notification_from: 'info@MoonDex.nl'  // Add sender email address
    });
    
    console.log('Email change response:', response.data);
    
    if (response.data && response.data.status === 'success') {
      // Extract user data from response
      let userData: User | undefined;
      
      if (response.data.data) {
        userData = {
          name: response.data.data.name,
          email: response.data.data.email,
          id: response.data.data.id,
          avatar: response.data.data.avatar || response.data.data.profile_picture,
          pending_email: response.data.data.pending_email || newEmail
        };
      } else if (response.data.user) {
        userData = {
          name: response.data.user.name, 
          email: response.data.user.email,
          id: response.data.user.id,
          avatar: response.data.user.avatar || response.data.user.profile_picture,
          pending_email: response.data.user.pending_email || newEmail
        };
      }
      
      if (userData) {
        return {
          success: true,
          user: userData,
          message: response.data.message || 'Email change request sent. Please check your new email for confirmation.'
        };
      }
      
      // If we don't have user data but the request was successful
      return {
        success: true,
        message: response.data.message || 'Email change request sent. Please check your new email for confirmation.'
      };
    }
    
    return { 
      success: false, 
      message: response.data.message || 'Failed to change email' 
    };
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Email change error:', apiError.response?.data);
    
    let errorMessage = 'Failed to change email';
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
 * Change user's password
 */
export const changePassword = async (currentPassword: string, newPassword: string, userId?: number): Promise<AuthResult> => {
  try {
    console.log('Starting password change request');
    
    // Remove the /api prefix since the baseURL already includes it
    const endpoint = userId 
      ? `/user/${userId}/change-password` 
      : '/change-password';
    
    // Use the parameter names expected by the backend
    const passwordData = { 
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: newPassword  // Using the same value for confirmation
    };
    
    console.log(`Making password change request to: ${endpoint}`);
    console.log('Password change request data:', JSON.stringify(passwordData).replace(/"current_password":"[^"]*"/, '"current_password":"[REDACTED]"').replace(/"new_password":"[^"]*"/, '"new_password":"[REDACTED]"').replace(/"confirm_password":"[^"]*"/, '"confirm_password":"[REDACTED]"'));
    
    const response = await authApiClient.post<any>(endpoint, passwordData);
    
    console.log('Password change response status:', response.status);
    console.log('Password change response data:', JSON.stringify(response.data));
    
    if (response.data && (response.data.status === 'success' || response.data.message?.includes('success'))) {
      // Extract user data from response if available
      let userData: User | undefined;
      
      if (response.data.data) {
        userData = {
          name: response.data.data.name,
          email: response.data.data.email,
          id: response.data.data.id,
          avatar: response.data.data.avatar || response.data.data.profile_picture
        };
      } else if (response.data.user) {
        userData = {
          name: response.data.user.name, 
          email: response.data.user.email,
          id: response.data.user.id,
          avatar: response.data.user.avatar || response.data.user.profile_picture
        };
      }
      
      if (userData) {
        console.log('Password change successful with user data');
        return {
          success: true,
          user: userData,
          message: response.data.message || 'Password changed successfully'
        };
      }
      
      // If we don't have user data but the request was successful
      console.log('Password change successful without user data');
      return {
        success: true,
        message: response.data.message || 'Password changed successfully'
      };
    }
    
    console.log('Password change failed with server response:', response.data);
    return { 
      success: false, 
      message: response.data.message || 'Failed to change password' 
    };
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Password change error details:', {
      status: apiError.response?.status,
      data: apiError.response?.data,
      message: apiError.message
    });
    
    let errorMessage = 'Failed to change password';
    let errorDetails: Record<string, string> | undefined = undefined;
    
    if (apiError.response?.data?.error) {
      if (typeof apiError.response.data.error === 'string') {
        errorMessage = apiError.response.data.error;
      } else {
        errorDetails = apiError.response.data.error;
        // Create a readable message from the error details
        if (errorDetails) {
          const errorMessages = Object.values(errorDetails);
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join('. ');
          }
        }
      }
    } else if (apiError.response?.data?.message) {
      errorMessage = apiError.response.data.message;
    }
    
    console.log('Final error message for password change:', errorMessage);
    return {
      success: false,
      message: errorMessage,
      errors: errorDetails
    };
  }
};

/**
 * Confirm password reset using the token received via email
 */
export const confirmPasswordReset = async (userId: string, token: string, redirectUrl?: string): Promise<AuthResult> => {
  try {
    console.log('Confirming password reset with:', { userId, token });
    
    interface PasswordResetResponse {
      status?: string;
      message?: string;
      error?: string | Record<string, string>;
      data?: any;
    }
    
    // Add the redirect URL as a query parameter if provided
    let endpoint = `/password/confirm/${userId}/${token}`;
    if (redirectUrl) {
      endpoint += `?redirect=${encodeURIComponent(redirectUrl)}`;
    }
    
    // If this is being called directly by a browser (not via fetch),
    // we should redirect to the success page instead of returning JSON
    const isDirectBrowserRequest = typeof window !== 'undefined' && 
      window.location.pathname.includes(`/password/confirm/${userId}/${token}`);
      
    if (isDirectBrowserRequest) {
      console.log('Direct browser navigation to password reset link detected');
      // This is being accessed directly in the browser, so handle it differently
      try {
        // Try to log out from all sessions first
        await logoutFromAllSessions();
        
        // Redirect to success page
        window.location.href = '/password/reset-success.html';
        
        // Return a dummy success result since we're redirecting anyway
        return {
          success: true,
          message: 'Password reset successful, redirecting...'
        };
      } catch (error) {
        console.error('Error during direct browser navigation flow:', error);
        // Continue with the regular flow if this fails
      }
    }
    
    const response = await authApiClient.get<PasswordResetResponse>(endpoint);
    
    console.log('Password reset confirmation response:', response.data);
    
    // If we get a successful result, try to log out from all sessions
    if (response.data && (response.data.status === 'success' || (response.data.message && response.data.message.includes('success')))) {
      // Try to log out from all sessions
      try {
        await logoutFromAllSessions();
      } catch (logoutError) {
        console.error('Error logging out after password reset:', logoutError);
        // Continue even if logout fails
      }
      
      // Check if this is a direct API access that returned JSON instead of redirecting
      if (typeof window !== 'undefined' && 
          document.body && 
          document.body.textContent && 
          document.body.textContent.trim().startsWith('{') && 
          document.body.textContent.includes('success')) {
        
        console.log('Detected raw JSON response in browser, handling redirection');
        
        // Set a small timeout to let the browser finish processing
        setTimeout(() => {
          // Try to redirect to the success page
          window.location.href = '/password/reset-success.html';
        }, 100);
      }
      
      return {
        success: true,
        message: response.data.message || 'Password reset successful'
      };
    }
    
    return { 
      success: false, 
      message: response.data.message || 'Failed to reset password' 
    };
  } catch (error) {
    const apiError = error as ApiError;
    console.error('Password reset confirmation error:', apiError.response?.data);
    
    let errorMessage = 'Failed to reset password';
    
    if (apiError.response?.data?.error) {
      if (typeof apiError.response.data.error === 'string') {
        errorMessage = apiError.response.data.error;
      } 
    } else if (apiError.response?.data?.message) {
      errorMessage = apiError.response.data.message;
    }
    
    return {
      success: false,
      message: errorMessage
    };
  }
};

/**
 * Logout from all devices/sessions
 */
export const logoutFromAllSessions = async (): Promise<boolean> => {
  try {
    // Try the standard endpoint for logging out from all sessions
    await authApiClient.post('/logout/all');
    console.log('Successfully logged out from all sessions');
    
    // Remove the authentication token from cookies regardless of API response
    Cookies.remove('auth_token');
    
    // Also try to clear any stored user data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
    
    return true;
  } catch (error) {
    console.error('Error logging out from all sessions:', error);
    
    // Even if the API call fails, we should still try to remove the token
    Cookies.remove('auth_token');
    
    // Also try to clear any stored user data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
    
    return false;
  }
};

/**
 * Request a password reset email
 */
export const requestPasswordReset = async (email: string): Promise<{success: boolean; message: string}> => {
  try {
    console.log('Requesting password reset for email:', email);
    
    // Get the current frontend URL for redirection
    const frontendUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://moondex.nl';
    
    // Try different variations of the password reset endpoint
    const endpoints = [
      '/password/reset',
      '/password/email',
      '/forgot-password'
    ];
    
    let response = null;
    let successfulEndpoint = '';
    
    // Try each endpoint until one works
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying password reset endpoint: ${endpoint}`);
        response = await authApiClient.post(endpoint, { 
          email,
          redirect_url: `${frontendUrl}/password-reset`,
          reset_url: `${frontendUrl}/password-reset`, // Alternative parameter name
        });
        
        successfulEndpoint = endpoint;
        console.log(`Password reset request succeeded with endpoint: ${endpoint}`);
        break;
      } catch (endpointError) {
        console.warn(`Endpoint ${endpoint} failed:`, endpointError);
      }
    }
    
    if (!response) {
      console.error('All password reset endpoints failed');
      return {
        success: false,
        message: 'We could not process your password reset request. Please try again later.'
      };
    }
    
    console.log(`Password reset response from ${successfulEndpoint}:`, response.data);
    
    // Check for success response from the API
    if ((response.data as any).status === 'success' || 
        ((response.data as any).message && (response.data as any).message.toLowerCase().includes('sent'))) {
      return {
        success: true,
        message: (response.data as any).message || 'Password reset email sent. Please check your inbox.'
      };
    }
    
    // If we received a response but it wasn't a success
    return {
      success: false,
      message: (response.data as any).message || 'Failed to send password reset email. Please try again.'
    };
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error('Password reset request error:', apiError.response?.data || apiError);
    
    let errorMessage = 'Failed to send password reset email';
    
    if (apiError.response?.data?.error) {
      if (typeof apiError.response.data.error === 'string') {
        errorMessage = apiError.response.data.error;
      }
    } else if (apiError.response?.data?.message) {
      errorMessage = apiError.response.data.message;
    }
    
    return {
      success: false,
      message: errorMessage
    };
  }
};

/**
 * Update a temporary password
 */
export const updateTemporaryPassword = async (newPassword: string, confirmPassword: string): Promise<AuthResult> => {
  try {
    console.log('Updating temporary password');
    
    const response = await authApiClient.post<any>('/update-temporary-password', {
      password: newPassword,
      password_confirmation: confirmPassword
    });
    
    const data = response.data;
    
    if (data.status === 'success') {
      return {
        success: true,
        message: data.message || 'Password has been updated successfully'
      };
    }
    
    return {
      success: false,
      message: data.message || 'Failed to update password'
    };
  } catch (error: unknown) {
    const apiError = error as ApiError;
    console.error('Update temporary password error:', apiError.response?.data);
    
    let errorMessage = 'Failed to update password';
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