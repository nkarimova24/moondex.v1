'use client';

import { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, CircularProgress, Alert } from '@mui/material';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import MailOutlineIcon from '@mui/icons-material/MailOutline';

export default function PasswordResetPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Send request to the backend API
      const response = await fetch('https://api.moondex.nl/password/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsSubmitted(true);
        toast.success('Password reset instructions have been sent to your email');
      } else {
        toast.error(data.message || 'Failed to request password reset');
      }
    } catch (error) {
      console.error('Error requesting password reset:', error);
      toast.error('An error occurred while requesting password reset');
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
        }}
      >
        <Typography variant="h4" gutterBottom align="center">
          Reset Password
        </Typography>
        
        {isSubmitted ? (
          <Box sx={{ textAlign: 'center', my: 3 }}>
            <MailOutlineIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Check Your Email
            </Typography>
            
            <Alert severity="success" sx={{ mb: 3 }}>
              A confirmation link has been sent to your email address.
            </Alert>
            
            <Typography variant="body1" paragraph>
              If an account exists with the email you provided, we've sent a confirmation link to reset your password.
            </Typography>
            
            <Typography variant="body2" paragraph color="text.secondary">
              Please check your email inbox and click on the link to complete the password reset process.
            </Typography>
            
            <Typography variant="body2" sx={{ mt: 3, fontStyle: 'italic' }} color="text.secondary">
              Don't see the email? Check your spam folder or try again.
            </Typography>
            
            <Box sx={{ mt: 4 }}>
              <Button
                component={Link}
                href="/"
                variant="outlined"
                sx={{ mx: 1 }}
              >
                Back to Home
              </Button>
              <Button
                onClick={() => setIsSubmitted(false)}
                variant="text"
                sx={{ mx: 1 }}
              >
                Try Again
              </Button>
            </Box>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Typography variant="body1" paragraph>
              Enter your email address below and we'll send you instructions to reset your password.
            </Typography>
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Reset Password'
              )}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
} 