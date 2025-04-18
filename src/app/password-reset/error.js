'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// This handles errors in password reset routes
export default function PasswordResetError({ error, reset }) {
  const router = useRouter();
  
  useEffect(() => {
    // Log the error
    console.error('Password reset error:', error);
  }, [error]);

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
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
          
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            align="center"
            sx={{ color: "#8A3F3F", fontWeight: "bold" }}
          >
            Password Reset Error
          </Typography>
          
          <Typography 
            variant="body1" 
            align="center" 
            sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.7)' }}
          >
            We encountered an error processing your password reset request.
          </Typography>
          
          <Typography 
            variant="body2" 
            align="center"
            sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 4 }}
          >
            {error?.message || 'The link may be invalid or expired.'}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => reset()}
              sx={{ 
                color: "#8A3F3F",
                borderColor: "#8A3F3F",
                "&:hover": {
                  borderColor: "#6A2F2F",
                  backgroundColor: "rgba(138, 63, 63, 0.1)",
                }
              }}
            >
              Try Again
            </Button>
            
            <Button 
              variant="contained" 
              onClick={() => router.push('/forgot-password')}
              sx={{ 
                bgcolor: '#8A3F3F',
                '&:hover': {
                  bgcolor: '#6A2F2F',
                },
                fontWeight: 'bold',
              }}
            >
              Request New Link
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
} 