"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';

export default function ClientPasswordResetPage() {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    // Only run on client-side with the parameters
    if (!params) return;

    const id = params.id as string;
    const token = params.token as string;
    
    if (id && token) {
      // Make API call from client-side
      fetch(`https://api.moondex.nl/password/confirm/${id}/${token}`)
        .then(response => response.json())
        .then(data => {
          setStatus(data.status);
          setMessage(data.message);
          
          // Show toast notification
          if (data.status === 'success') {
            toast.success('Password reset successful. You can now log in with your new password.');
            // Redirect to home page after successful reset
            setTimeout(() => {
              window.location.href = '/';
            }, 3000);
          } else {
            toast.error(data.message || 'Password reset failed.');
          }
        })
        .catch(error => {
          setStatus('error');
          setMessage('An error occurred during password reset.');
          toast.error('An error occurred during password reset.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setStatus('error');
      setMessage('Invalid password reset link. Please request a new one.');
      setIsLoading(false);
      toast.error('Invalid password reset link. Please request a new one.');
    }
  }, [params]);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '50vh',
        padding: 4
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          maxWidth: 500, 
          width: '100%',
          textAlign: 'center'
        }}
      >
        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress />
            <Typography>Processing your password reset request...</Typography>
          </Box>
        ) : (
          <Box 
            sx={{ 
              '& .success': { color: 'success.main' },
              '& .error': { color: 'error.main' }
            }}
          >
            <Typography variant="h5" className={status} gutterBottom>
              {status === 'success' ? 'Success!' : 'Error'}
            </Typography>
            <Typography variant="body1" paragraph>
              {message}
            </Typography>
            {status === 'success' && (
              <Typography variant="body2">
                You will be redirected to the home page shortly...
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
} 