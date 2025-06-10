'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Typography, Paper, Button, CircularProgress } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

// Inner component that uses searchParams
function PasswordResetErrorContent() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    // Get error message from query parameters
    const msgParam = searchParams?.get('message');
    if (msgParam) {
      const decodedMessage = decodeURIComponent(msgParam);
      setMessage(decodedMessage);
      
      // Show error toast
      toast.error(decodedMessage);
    } else {
      setMessage('An error occurred during the password reset process.');
      toast.error('Password reset failed');
    }
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
        <ErrorOutlineIcon 
          sx={{ 
            fontSize: 64, 
            color: 'error.main',
            mb: 2
          }} 
        />
        
        <Typography variant="h4" gutterBottom>
          Password Reset Failed
        </Typography>
        
        <Typography variant="body1" paragraph>
          {message}
        </Typography>
        
        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button 
            component={Link}
            href="/password-reset"
            variant="contained" 
            color="primary"
          >
            Try Again
          </Button>
          
          <Button 
            component={Link}
            href="/"
            variant="outlined"
          >
            Return to Homepage
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

// Main component wrapped with Suspense
export default function PasswordResetErrorPage() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    }>
      <PasswordResetErrorContent />
    </Suspense>
  );
} 