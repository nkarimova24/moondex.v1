"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Box, Typography, Button, CircularProgress, Paper, Container } from '@mui/material';
import { useLanguage } from '@/context/LanguageContext';
import { confirmPasswordReset, logoutFromAllSessions } from '@/app/lib/api/auth';
import { useAuth } from '@/context/AuthContext';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Create a new component that will handle direct API responses
const DirectApiResetHandler = () => {
  // This component is loaded in client-side and will ensure the user is properly redirected
  useEffect(() => {
    const handleDirectApiReset = async () => {
      try {
        console.log('Handling direct API response case');
        // Attempt to logout from all sessions
        await logoutFromAllSessions();
        
        // After a short delay, redirect to the main site
        setTimeout(() => {
          window.location.href = 'https://moondex.nl';
        }, 1500);
      } catch (error) {
        console.error('Error during direct API reset handling:', error);
        // Redirect anyway
        window.location.href = 'https://moondex.nl';
      }
    };
    
    handleDirectApiReset();
  }, []);
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      backgroundColor: 'white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999 
    }}>
      <CheckCircleOutlineIcon style={{ fontSize: 80, color: '#4CAF50', marginBottom: 20 }} />
      <h1 style={{ fontSize: 24, marginBottom: 16, textAlign: 'center' }}>Password Reset Successful</h1>
      <p style={{ fontSize: 16, marginBottom: 24, textAlign: 'center' }}>
        Your password has been changed. You have been logged out from all devices.
      </p>
      <p style={{ fontSize: 14, textAlign: 'center' }}>
        Redirecting to MoonDex...
      </p>
      <CircularProgress size={30} style={{ marginTop: 20 }} />
    </div>
  );
};

const PasswordChangeConfirmation = () => {
  const { t } = useLanguage();
  const { logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(3);
  const [isDirectApiResponse, setIsDirectApiResponse] = useState(false);

  useEffect(() => {
    // Check if we're seeing the direct API response
    if (typeof window !== 'undefined' && document.body.textContent && document.body.textContent.includes('{"status":"success"')) {
      setIsDirectApiResponse(true);
      return;
    }
    
    const confirmReset = async () => {
      try {
        const userId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
        const token = typeof params.token === 'string' ? params.token : Array.isArray(params.token) ? params.token[0] : '';
        
        if (!userId || !token) {
          throw new Error('Invalid URL parameters');
        }

        // Pass the redirect URL to the API
        const redirectUrl = 'https://moondex.nl';
        const response = await confirmPasswordReset(userId, token, redirectUrl);
        
        if (response.success) {
          setIsSuccess(true);
          
          // Log out from all sessions
          try {
            console.log('Logging out from all sessions');
            await logoutFromAllSessions();
            
            // Also use the local logout to ensure the current session is properly cleared
            await logout();
          } catch (logoutError) {
            console.error('Error during logout process:', logoutError);
            // Continue with redirection even if logout fails
          }
          
          // Start countdown for redirection
          let secondsLeft = 3;
          setCountdown(secondsLeft);
          
          const countdownInterval = setInterval(() => {
            secondsLeft -= 1;
            setCountdown(secondsLeft);
            
            if (secondsLeft <= 0) {
              clearInterval(countdownInterval);
              // Redirect to moondex.nl home page
              window.location.href = 'https://moondex.nl';
            }
          }, 1000);
          
          return () => clearInterval(countdownInterval);
        } else {
          throw new Error(response.message || 'Password reset failed');
        }
      } catch (error) {
        console.error('Password reset confirmation failed:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    confirmReset();
  }, [params, router, logout]);
  
  // If we detected a direct API response, show our handler component
  if (isDirectApiResponse) {
    return <DirectApiResetHandler />;
  }

  return (
    <Container maxWidth="sm" sx={{ pt: 8, pb: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {t('profile.passwordChangeConfirmation')}
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, mb: 4 }}>
          {isLoading && (
            <>
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="body1">{t('profile.processingRequest')}</Typography>
            </>
          )}
          
          {isSuccess && (
            <>
              <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" align="center" gutterBottom>
                {t('auth.passwordChangeSuccess')}
              </Typography>
              <Typography variant="body1" align="center">
                {t('profile.redirectingToLogin')} ({countdown})
              </Typography>
              <Typography variant="body2" align="center" sx={{ mt: 2, color: 'text.secondary' }}>
                You have been logged out from all devices for security reasons.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => window.location.href = 'https://moondex.nl'}
                sx={{ mt: 3 }}
              >
                Go to Homepage Now
              </Button>
            </>
          )}
          
          {error && (
            <>
              <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" align="center" gutterBottom>
                {t('profile.passwordChangeFailed')}
              </Typography>
              <Typography variant="body1" align="center" gutterBottom>
                {error}
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => window.location.href = 'https://moondex.nl'}
                sx={{ mt: 2 }}
              >
                Return to Homepage
              </Button>
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

// Check if we're viewing a direct API response when this component loads
if (typeof window !== 'undefined' && document.body.textContent && document.body.textContent.includes('{"status":"success"')) {
  // If we detect the JSON response in the body, render our overlay handler
  document.body.innerHTML = '';
  const div = document.createElement('div');
  document.body.appendChild(div);
  div.id = 'reset-overlay-root';
}

export default PasswordChangeConfirmation; 