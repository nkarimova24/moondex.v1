"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Button, Paper, Container } from '@mui/material';
import { useLanguage } from '@/context/LanguageContext';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export default function PasswordResetSuccessPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  
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
    // Start countdown for redirection
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          router.push('/signin');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(countdownInterval);
  }, [router]);

  return (
    <Container maxWidth="sm" sx={{ pt: 8, pb: 8 }}>
      <Paper elevation={3} sx={{ 
        p: 4, 
        borderRadius: 2,
        bgcolor: "rgba(30, 30, 30, 0.8)",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(10px)",
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
          
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            align="center"
            sx={{ color: "#8A3F3F", fontWeight: "bold" }}
          >
            Password Reset Successful
          </Typography>
          
          <Typography 
            variant="body1" 
            align="center" 
            sx={{ mb: 4, color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Your password has been successfully reset. 
            You have been logged out from all devices for security reasons.
          </Typography>
          
          <Typography 
            variant="body2" 
            align="center"
            sx={{ color: 'rgba(255, 255, 255, 0.5)', mb: 3 }}
          >
            You will be redirected to the login page in {countdown} seconds...
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => router.push('/signin')}
            sx={{ 
              mt: 2,
              bgcolor: '#8A3F3F',
              '&:hover': {
                bgcolor: '#6A2F2F',
              },
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 'bold',
              textTransform: 'none',
            }}
          >
            Go to Login Now
          </Button>
        </Box>
      </Paper>
    </Container>
  );
} 