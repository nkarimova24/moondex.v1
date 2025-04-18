"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, CircularProgress, Paper, Container } from '@mui/material';

// This handles 404 errors specifically in the password-reset section
export default function PasswordResetNotFound() {
  const router = useRouter();
  
  useEffect(() => {
    // Extract any password reset parameters from the URL
    const path = window.location.pathname;
    console.log('Password reset 404 page, path:', path);

    // Check if this contains password reset parameters
    if (path.startsWith('/password-reset/')) {
      // Get the parts after /password-reset/
      const parts = path.slice('/password-reset/'.length).split('/');
      
      if (parts.length >= 2) {
        // If there are at least two parts, assume they're ID and token
        const id = parts[0];
        const token = parts[1];
        
        console.log('Found potential password reset params, redirecting', { id, token });
        
        // Wait a moment and redirect to the proper page
        setTimeout(() => {
          router.push(`/password-reset/${id}/${token}`);
        }, 100);
        
        return;
      }
    }
    
    // If we can't determine proper parameters, send to the forgot password page
    console.log('Invalid password reset path, redirecting to forgot password');
    setTimeout(() => {
      router.push('/forgot-password');
    }, 500);
  }, [router]);
  
  return (
    <Container maxWidth="sm" sx={{ pt: 8, pb: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          bgcolor: "rgba(30, 30, 30, 0.8)",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4, mb: 4 }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="body1" sx={{ color: '#fff' }}>Processing your password reset link...</Typography>
        </Box>
      </Paper>
    </Container>
  );
} 