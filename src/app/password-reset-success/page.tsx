'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Typography, Paper, Button, CircularProgress } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function PasswordResetSuccessPage() {
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(3);
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    // Get any message passed as a query parameter
    const msgParam = searchParams?.get('message');
    if (msgParam) {
      setMessage(decodeURIComponent(msgParam));
    } else {
      setMessage('Your password has been reset successfully.');
    }
    
    // Show success toast
    toast.success('Password reset successful');
    
    // Start countdown for redirection
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = '/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [searchParams]);
  
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
        <CheckCircleOutlineIcon 
          sx={{ 
            fontSize: 64, 
            color: 'success.main',
            mb: 2
          }} 
        />
        
        <Typography variant="h4" gutterBottom>
          Success!
        </Typography>
        
        <Typography variant="body1" paragraph>
          {message}
        </Typography>
        
        <Typography variant="body2" paragraph>
          You have been logged out from all devices for security reasons.
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 3 }}>
          You will be redirected to the homepage in {countdown} seconds...
        </Typography>
        
        <Button 
          component={Link}
          href="/"
          variant="contained" 
          color="primary"
        >
          Go to Homepage Now
        </Button>
      </Paper>
    </Box>
  );
} 