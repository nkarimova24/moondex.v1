"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Box, Typography, Button, CircularProgress, Paper, Container } from '@mui/material';
import { useLanguage } from '@/context/LanguageContext';
import { confirmPasswordReset, logoutFromAllSessions } from '@/app/lib/api/auth';
import { useAuth } from '@/context/AuthContext';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const ClientPasswordResetPage = () => {
  const { t } = useLanguage();
  const { logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(3);
  
  // Get the current origin for redirection
  const [baseUrl, setBaseUrl] = useState('');
  
  useEffect(() => {
    // Set the base URL for redirects based on the current environment
    if (typeof window !== 'undefined') {
      // Get origin (e.g., http://localhost:3000 or https://moondex.nl)
      setBaseUrl(window.location.origin);
    }
  }, []);

  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        // Get parameters either from Next.js params or directly from the URL if needed
        let userId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
        let token = typeof params.token === 'string' ? params.token : Array.isArray(params.token) ? params.token[0] : '';
        
        // If params are empty (which can happen with static export), try reading from URL
        if ((!userId || !token) && typeof window !== 'undefined') {
          // Extract from URL pathname as a fallback
          const pathParts = window.location.pathname.split('/');
          // URL format should be /password-reset/[id]/[token]
          if (pathParts.length >= 4 && pathParts[1] === 'password-reset') {
            userId = userId || pathParts[2];
            token = token || pathParts[3];
            console.log('Extracted params from URL:', { userId, token });
          }
        }
        
        console.log('Processing password reset with params:', { userId, token });
        
        // Skip processing if we're using the placeholder values from generateStaticParams
        if (userId === 'placeholder-id' && token === 'placeholder-token') {
          console.log('Using placeholder values, not processing reset');
          setError('Invalid or expired password reset link');
          setIsLoading(false);
          return;
        }
        
        if (!userId || !token) {
          throw new Error('Invalid URL parameters');
        }

        // Call the confirmPasswordReset API function with the current origin as the redirect URL
        const response = await confirmPasswordReset(userId, token, baseUrl);
        
        console.log('Password reset response:', response);
        
        if (response.success) {
          setIsSuccess(true);
          
          // Log out from all sessions
          try {
            console.log('Logging out from all sessions');
            await logoutFromAllSessions();
            await logout();
          } catch (logoutError) {
            console.error('Error during logout process:', logoutError);
          }
          
          // Start countdown for redirection
          let secondsLeft = 3;
          setCountdown(secondsLeft);
          
          const countdownInterval = setInterval(() => {
            secondsLeft -= 1;
            setCountdown(secondsLeft);
            
            if (secondsLeft <= 0) {
              clearInterval(countdownInterval);
              // Use the current origin instead of hardcoding moondex.nl
              window.location.href = baseUrl || '/';
            }
          }, 1000);
          
          return () => clearInterval(countdownInterval);
        } else {
          throw new Error(response.message || 'Password reset failed');
        }
      } catch (error) {
        console.error('Password reset failed:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    // Only run the password reset flow if we have the baseUrl
    if (baseUrl) {
      handlePasswordReset();
    }
  }, [params, logout, baseUrl]);

  return (
    <Container maxWidth="sm" sx={{ pt: 8, pb: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Password Reset
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, mb: 4 }}>
          {isLoading && (
            <>
              <CircularProgress size={60} sx={{ mb: 2 }} />
              <Typography variant="body1">Processing your request...</Typography>
            </>
          )}
          
          {isSuccess && (
            <>
              <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" align="center" gutterBottom>
                Password Changed Successfully
              </Typography>
              <Typography variant="body1" align="center">
                You will be redirected in {countdown} seconds...
              </Typography>
              <Typography variant="body2" align="center" sx={{ mt: 2, color: 'text.secondary' }}>
                You have been logged out from all devices for security reasons.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => window.location.href = baseUrl || '/'}
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
                Password Reset Failed
              </Typography>
              <Typography variant="body1" align="center" gutterBottom>
                {error}
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => window.location.href = baseUrl || '/'}
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

export default ClientPasswordResetPage; 