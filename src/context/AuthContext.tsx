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
  refreshUser: () => Promise<void>; // New function to refresh user data
  updateProfile: (data: UpdateProfileData) => Promise<AuthResult>;
  uploadAvatar: (file: File) => Promise<AuthResult>;
  changeEmail: (newEmail: string) => Promise<AuthResult>; // Added changeEmail function
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthResult>; // Added changePassword function
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
  
  useEffect(() => {
    console.log('AuthContext: User state changed:', {
      id: user?.id,
      name: user?.name,
      email: user?.email,
      avatar: user?.avatar,
      profile_picture: (user as any)?.profile_picture
    });
  }, [user]);
  
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
    
    console.error("Registration failed with response:", result);
    return result;
  } catch (err: unknown) {
    const apiError = err as ApiError;
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
    } catch (err: unknown) {
      const apiError = err as ApiError;
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

  // Refresh user data
  const refreshUser = async (): Promise<void> => {
    try {
      console.log('Starting user data refresh');
      const result = await api.getCurrentUser();
      
      if (result.success && result.user) {
        console.log('User data refresh successful:', result.user);
        console.log('Previous user data:', user);
        
        // If the user has an avatar URL from Laravel storage, correct it
        if (result.user.avatar) {
          result.user.avatar = correctLaravelStorageUrl(result.user.avatar) || result.user.avatar;
        }
        
        // Force a full state update
        setUser({...result.user});
      } else {
        console.error('User data refresh failed:', result);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // Update user profile
  const updateProfile = async (data: UpdateProfileData): Promise<AuthResult> => {
    setLoading(true);
    try {
      if (!user) {
        return { 
          success: false, 
          message: 'No authenticated user found' 
        };
      }
      
      // Pass the user ID as well in case we need to use the alternate endpoint
      const result = await api.updateProfile(data, user.id);
      
      if (result.success && result.user) {
        console.log('Profile update successful, server returned:', result.user);
        
        // Get the avatar URL from various possible sources
        const avatarUrl = 
          result.user.avatar || 
          (result.user as any).profile_picture ||
          user.avatar || 
          (user as any).profile_picture;
        
        console.log('Profile update avatar resolution:', {
          'result.user.avatar': result.user.avatar,
          'result.user.profile_picture': (result.user as any).profile_picture,
          'existing user.avatar': user.avatar,
          'existing user.profile_picture': (user as any).profile_picture,
          'resolved': avatarUrl
        });
        
        // Merge the returned user data with existing user data to ensure we don't lose information
        // that wasn't returned from the API
        const updatedUser: User = {
          ...user,
          ...result.user,
          // Keep existing values for empty strings in the result
          name: result.user.name || user.name,
          email: result.user.email || user.email,
          // Preserve pending_email status if present
          pending_email: result.user.pending_email || user.pending_email,
          // Ensure avatar is preserved
          avatar: avatarUrl
        };
        
        console.log('About to update user state with:', updatedUser);
        
        // Create a new object to ensure React detects the change
        setUser({...updatedUser});
      }
      
      return result;
    } catch (error) {
      console.error('Profile update error:', error);
      const apiError = error as ApiError;
      
      let errorMessage = 'Failed to update profile';
      if (apiError.response?.data?.error) {
        if (typeof apiError.response.data.error === 'string') {
          errorMessage = apiError.response.data.error;
        }
      }
      
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // Add this function at the component level to correct Laravel storage URLs
  function correctLaravelStorageUrl(url: string | undefined): string | undefined {
    if (!url) return undefined;
    
    // If the URL starts with http://localhost/storage, it's likely a Laravel storage URL
    if (url.startsWith('http://localhost/storage/')) {
      console.log('Fixing Laravel storage URL:', url);
      
      // Extract the path after /storage/
      const storagePath = url.split('/storage/')[1];
      
      // Construct a URL relative to the current origin
      // This is needed because Laravel's storage:link creates a symlink from public/storage to storage/app/public
      const correctedUrl = `${window.location.origin}/storage/${storagePath}`;
      console.log('Corrected URL:', correctedUrl);
      
      return correctedUrl;
    }
    
    return url;
  }

  /**
   * Upload a profile picture
   */
  const uploadAvatar = async (file: File): Promise<AuthResult> => {
    try {
      console.log('Uploading avatar in context', user?.id);
      setLoading(true);
      
      if (!user) {
        return { 
          success: false, 
          message: 'No authenticated user found' 
        };
      }
      
      const result = await api.uploadProfilePicture(file, user.id);
      
      if (result.success && result.user) {
        // Log raw response data to check field names
        console.log('Raw user data from avatar update:', result.user);
        console.log('Field check - avatar:', result.user.avatar);
        console.log('Field check - profile_picture:', (result.user as any).profile_picture);
        
        // Get the avatar URL from the result, ensuring we have a non-empty string
        const rawAvatarUrl = result.user.avatar || '';
        
        // Correct the URL if it's a Laravel storage URL
        const avatarUrl = correctLaravelStorageUrl(rawAvatarUrl) || '';
        
        console.log('Avatar update response successful:', {
          oldAvatar: user.avatar,
          rawNewAvatar: rawAvatarUrl,
          correctedNewAvatar: avatarUrl
        });
        
        if (!avatarUrl) {
          console.warn('No avatar URL found in API response - will attempt forced refresh');
          // If no avatar URL in the response, refresh user data instead
          await refreshUser();
          return { success: true };
        }
        
        // Create a completely new user object to ensure React detects the change
        const mergedUser: User = {
          ...user,        // Keep all existing properties
          avatar: avatarUrl // Replace only the avatar property
        };
        
        // Log the before and after state
        console.log('About to update user state:', {
          before: JSON.stringify(user),
          after: JSON.stringify(mergedUser)
        });
        
        // Set state with a new object to ensure React detects the change
        setUser({...mergedUser});
        
        // As a last resort, offer a hard reload option after a delay
        setTimeout(() => {
          console.log('Consider forcing a hard page reload to refresh avatar');
          // Uncomment the next line to force a hard page reload
          // window.location.reload();
          
          // Instead, schedule a normal refresh
          refreshUser();
        }, 1000);
        
        return { 
          success: true, 
          user: mergedUser 
        };
      } else {
        console.error('Avatar upload error:', result.message);
        return { 
          success: false, 
          message: result.message || 'Failed to upload avatar', 
          errors: result.errors 
        };
      }
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      return { success: false, message: error.message || 'An unexpected error occurred' };
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
    refreshUser,
    updateProfile,
    uploadAvatar,
    changeEmail: async (newEmail: string) => {
      try {
        setLoading(true);
        if (!user) {
          return { 
            success: false, 
            message: 'No authenticated user found' 
          };
        }
        
        const result = await api.changeEmail(newEmail, user.id);
        
        if (result.success && result.user) {
          console.log('Email change request submitted:', result.user);
          // Create a completely new user object to ensure React detects the change
          setUser({...result.user});
        } else if (result.success) {
          // If we didn't get a user object back but the operation was successful,
          // create a new user object with the pending email to ensure UI updates
          if (user) {
            const updatedUser = {
              ...user,
              pending_email: newEmail
            };
            console.log('Updating user with pending email:', updatedUser);
            setUser(updatedUser);
          }
          // Also refresh user data from the server
          await refreshUser();
        }
        
        return result;
      } catch (error) {
        console.error('Error changing email:', error);
        return { 
          success: false, 
          message: 'Failed to change email' 
        };
      } finally {
        setLoading(false);
      }
    },
    changePassword: async (currentPassword: string, newPassword: string): Promise<AuthResult> => {
      if (!user) {
        return { 
          success: false, 
          message: 'No authenticated user' 
        };
      }

      setLoading(true);
      
      try {
        // Store current avatar URL before making the API call
        const currentAvatarUrl = getUserAvatarUrl(user);
        
        // Call the API function from auth.ts
        const result = await api.changePassword(currentPassword, newPassword, user.id);
        
        if (result.success) {
          // If password change succeeds and returns user data, merge it with existing user data
          if (result.user) {
            // Create a merged user object that preserves existing values if they're missing in the response
            const mergedUser: User = {
              ...user,                                        // Start with all existing user data
              ...result.user,                                // Override with new data from response
              // Ensure we keep these properties even if not returned in response
              name: result.user.name || user.name,
              email: result.user.email || user.email,
              // Preserve avatar - crucial for maintaining profile picture
              avatar: result.user.avatar || user.avatar,
              profile_picture: (result.user as any).profile_picture || (user as any).profile_picture,
              // Other fields to preserve
              pending_email: result.user.pending_email || user.pending_email
            };
            
            console.log('Preserving user data after password change:', {
              before: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                profile_picture: (user as any).profile_picture
              },
              after: {
                id: mergedUser.id,
                name: mergedUser.name,
                email: mergedUser.email,
                avatar: mergedUser.avatar,
                profile_picture: (mergedUser as any).profile_picture
              }
            });
            
            // Update with merged data to maintain all user information
            setUser(mergedUser);
            
            // Optionally update local storage if you're using it
            if (typeof window !== 'undefined') {
              localStorage.setItem('user', JSON.stringify(mergedUser));
            }
          } else {
            // If no user data returned but operation was successful,
            // just preserve the current user state
            console.log('No user data in password change response, preserving current state:', user);
          }
          
          // Refresh user data from server, but don't await it
          // This runs in background and will update state when complete
          refreshUser().catch(err => {
            console.error('Error refreshing user after password change:', err);
          });
        }
        
        return result;
      } catch (error) {
        console.error('Error changing password:', error);
        return { 
          success: false, 
          message: 'Failed to change password' 
        };
      } finally {
        setLoading(false);
      }
    }
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

// Add this utility function to get avatar URLs consistently across the app
export const getUserAvatarUrl = (user: User | null): string | undefined => {
  if (!user) return undefined;
  
  // Get the base URL from either field
  const avatarUrl = user.avatar || user.profile_picture;
  if (!avatarUrl) return undefined;
  
  // Add a cache-busting parameter to the URL to force browser to reload the image
  if (avatarUrl.startsWith('data:')) {
    return avatarUrl; // Don't modify data URLs
  }
  
  // If URL starts with http://localhost/storage, correct it for the current origin
  if (avatarUrl.startsWith('http://localhost/storage/')) {
    // Extract the path after /storage/
    const storagePath = avatarUrl.split('/storage/')[1];
    
    // Construct a URL relative to the current origin
    const correctedUrl = `${window.location.origin}/storage/${storagePath}`;
    
    // Add a timestamp to force the browser to reload the image
    const timestamp = Date.now();
    const separator = correctedUrl.includes('?') ? '&' : '?';
    return `${correctedUrl}${separator}t=${timestamp}`;
  }
  
  // Add a timestamp to force the browser to reload the image
  const timestamp = Date.now();
  const separator = avatarUrl.includes('?') ? '&' : '?';
  return `${avatarUrl}${separator}t=${timestamp}`;
};