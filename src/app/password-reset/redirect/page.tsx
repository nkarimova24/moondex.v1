"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, CircularProgress, Paper, Container } from '@mui/material';

// This is a special route for handling password reset redirects
export default function PasswordResetRedirectPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Try to parse token from URL query params
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id') || urlParams.get('user_id') || urlParams.get('userId');
    const token = urlParams.get('token') || urlParams.get('reset_token');
    
    if (id && token) {
      console.log(`Found ID ${id} and token in query params, redirecting`);
      router.push(`/password-reset/${id}/${token}`);
      return;
    }
    
    // If no params found, redirect to forgot password page
    console.log('No token parameters found, redirecting to forgot password');
    router.push('/forgot-password');
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
          <Typography variant="body1" sx={{ color: '#fff' }}>Processing your password reset request...</Typography>
        </Box>
      </Paper>
    </Container>
  );
} 