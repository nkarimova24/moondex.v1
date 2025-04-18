"use client";

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Box, Typography, CircularProgress, Paper, Container } from '@mui/material';

// This is a special catch-all route for ANY password reset path
// It will redirect users to the properly formatted URL or handle the token directly
export default function PasswordResetCatchAllPage() {
  const router = useRouter();
  const params = useParams();
  
  useEffect(() => {
    // Extract path segments
    const path = params.path;
    if (!path) {
      // If no path segments, the user is at /password-reset
      console.log('At password-reset base URL, looking for token in URL...');
      
      // Try to parse token from URL query params instead
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
      return;
    }
    
    // Convert to array if not already
    const segments = Array.isArray(path) ? path : [path];
    console.log('Password reset path segments:', segments);
    
    // Look for ID and token pattern
    if (segments.length >= 2) {
      const id = segments[0];
      const token = segments[1];
      
      console.log(`Found ID ${id} and token ${token}, redirecting`);
      router.push(`/password-reset/${id}/${token}`);
    } else if (segments.length === 1 && segments[0].includes('/')) {
      // Check if the segment itself contains a slash (happens with certain deployments)
      const parts = segments[0].split('/');
      if (parts.length >= 2) {
        const id = parts[0];
        const token = parts[1];
        
        console.log(`Found ID ${id} and token ${token} in slash-encoded segment, redirecting`);
        router.push(`/password-reset/${id}/${token}`);
      } else {
        router.push('/forgot-password');
      }
    } else {
      // Invalid format, redirect to forgot password
      console.log('Invalid reset token format, redirecting to forgot password');
      router.push('/forgot-password');
    }
  }, [params, router]);
  
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