"use client";

import { useEffect } from 'react';
import { Box, Typography, Paper, Button, Alert } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function PasswordResetConfirmationPage() {
  useEffect(() => {
    // Show success toast
    toast.success('Your password has been reset successfully');
  }, []);

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
          Password Changed
        </Typography>
        
        <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
          Your password has been changed successfully.
        </Alert>
        
        <Typography variant="body1" paragraph>
          You can now log in to your account using your new password.
        </Typography>
        
        <Typography variant="body2" paragraph color="text.secondary">
          For security reasons, you have been logged out from all devices.
        </Typography>
        
        <Box sx={{ mt: 4 }}>
          <Button 
            component={Link}
            href="/signin"
            variant="contained" 
            color="primary"
            sx={{ mx: 1 }}
          >
            Log In Now
          </Button>
          <Button 
            component={Link}
            href="/"
            variant="outlined"
            sx={{ mx: 1 }}
          >
            Return to Home
          </Button>
        </Box>
      </Paper>
    </Box>
  );
} 