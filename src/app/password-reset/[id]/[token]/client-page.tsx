"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Box, Typography, CircularProgress, Paper, TextField, Button, Alert } from '@mui/material';

const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000/api';

interface TokenResponse {
  status?: string;
  message?: string;
  valid?: boolean;
}

export default function ClientPasswordResetPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!params) return;

    const id = params.id as string;
    const token = params.token as string;
    
    if (id && token) {
      fetch(`${API_URL}/password/validate-token/${id}/${token}`)
        .then(response => response.json())
        .then((data: TokenResponse) => {
          if (data.status === 'success' || data.valid) {
            setIsTokenValid(true);
            setStatus('valid');
            setMessage('Please enter your new password');
          } else {
            setStatus('error');
            setMessage(data.message || 'Invalid or expired password reset link');
            toast.error(data.message || 'Invalid or expired password reset link');
          }
        })
        .catch(error => {
          console.error('Token validation error:', error);
          setStatus('error');
          setMessage('An error occurred while validating your reset link');
          toast.error('An error occurred while validating your reset link');
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

  const validatePassword = () => {
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) return;
    
    setIsSubmitting(true);
    
    const id = params.id as string;
    const token = params.token as string;
    
    try {
      const response = await fetch(`${API_URL}/password/confirm/${id}/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          new_password: password,
          confirm_password: confirmPassword
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && (data.status === 'success' || data.message?.toLowerCase().includes('success'))) {
        toast.success('Password has been reset successfully');
        setTimeout(() => {
          router.push('/signin');
        }, 2000);
      } else {
        toast.error(data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('An error occurred while resetting your password');
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
          width: '100%'
        }}
      >
        <Typography 
          component="h1" 
          variant="h5" 
          sx={{ 
            fontWeight: "bold",
            mb: 2,
            textAlign: "center",
            color: "#8A3F3F"
          }}
        >
          Reset Your Password
        </Typography>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress sx={{ color: '#8A3F3F' }} />
            <Typography>Validating your password reset link...</Typography>
          </Box>
        ) : !isTokenValid ? (
          <Alert 
            severity="error" 
            sx={{ 
              width: "100%", 
              mt: 2,
              bgcolor: "rgba(211, 47, 47, 0.1)",
              color: "#ff8a80",
              border: "1px solid rgba(211, 47, 47, 0.3)"
            }}
          >
            {message}
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: "100%" }}>
            <Typography
              variant="body1"
              sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 3, textAlign: "center" }}
            >
              Please enter your new password below
            </Typography>
            
            {passwordError && (
              <Alert 
                severity="error" 
                sx={{ 
                  width: "100%", 
                  mb: 2,
                  bgcolor: "rgba(211, 47, 47, 0.1)",
                  color: "#ff8a80",
                  border: "1px solid rgba(211, 47, 47, 0.3)"
                }}
              >
                {passwordError}
              </Alert>
            )}
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="New Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#8A3F3F',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#8A3F3F',
                },
              }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password_confirmation"
              label="Confirm New Password"
              type="password"
              id="password_confirmation"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#fff',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#8A3F3F',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#8A3F3F',
                },
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{
                mt: 3,
                mb: 2,
                bgcolor: '#8A3F3F',
                '&:hover': {
                  bgcolor: '#AC4C4C',
                },
                color: 'white',
                fontWeight: 'bold',
                padding: '12px',
                textTransform: 'none',
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
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