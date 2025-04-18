import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  TextField,
  Button,
  CircularProgress,
  Typography,
  Box,
  Alert,
  Paper,
  Divider
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { toast } from 'react-hot-toast';

const ChangePasswordForm = ({ onClose }: { onClose?: () => void }) => {
  const { t } = useLanguage();
  const { changePassword, user } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);
  
  // Add refs for the form fields
  const currentPasswordRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  
  // Focus management effect
  useEffect(() => {
    // If there's an error and the currentPassword is empty, focus it
    if (error && !currentPassword && currentPasswordRef.current) {
      currentPasswordRef.current.focus();
    }
  }, [error, currentPassword]);
  
  // Form validation
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  
  const validateForm = () => {
    const newErrors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};
    
    if (!currentPassword) {
      newErrors.currentPassword = t('profile.requiredField');
    }
    
    if (!newPassword) {
      newErrors.newPassword = t('profile.requiredField');
    } else if (newPassword.length < 8) {
      newErrors.newPassword = t('profile.passwordLength');
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = t('profile.requiredField');
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = t('profile.passwordMismatch');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    setConfirmationSent(false);
    
    try {
      console.log('Submitting password change with:', { currentPassword, newPasswordLength: newPassword.length });
      const result = await changePassword(currentPassword, newPassword);
      console.log('Password change result:', result);
      
      if (result.success) {
        // Check if the message indicates a confirmation email was sent
        const isConfirmationFlow = 
          result.message?.toLowerCase().includes('confirmation') || 
          result.message?.toLowerCase().includes('email') ||
          result.message?.toLowerCase().includes('verify');
        
        if (isConfirmationFlow) {
          setConfirmationSent(true);
          // Show toast notification for confirmation email
          toast.success('A confirmation email has been sent to your inbox');
        } else {
          setSuccess(true);
          toast.success('Password changed successfully');
        }
        
        // Reset form after successful submission
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Close the form after a delay if onClose is provided and it's not a confirmation flow
        if (onClose && !isConfirmationFlow) {
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      } else {
        // Check if the error contains "current password" or "password incorrect" to provide better feedback
        const isCurrentPasswordError = 
          result.message?.toLowerCase().includes('current password') || 
          result.message?.toLowerCase().includes('password incorrect') ||
          result.message?.toLowerCase().includes('does not match');
        
        setError(result.message || t('profile.passwordChangeError'));
        toast.error(result.message || t('profile.passwordChangeError'));
        
        // Reset only the current password field if that's the issue
        if (isCurrentPasswordError) {
          setCurrentPassword('');
          // Set focus on the current password field
          setTimeout(() => {
            if (currentPasswordRef.current) {
              currentPasswordRef.current.focus();
            }
          }, 0);
        } else {
          // If it's not specifically a current password error, clear all fields
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setError(t('profile.passwordChangeError'));
      toast.error(t('profile.passwordChangeError'));
      // Reset form on unexpected errors
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setLoading(false);
    }
  };
  
  // If confirmation is sent, show a completely different UI
  if (confirmationSent) {
    return (
      <Box sx={{ textAlign: 'center', py: 2 }}>
        <MailOutlineIcon 
          sx={{ 
            fontSize: 64, 
            color: 'primary.main', 
            mb: 2 
          }} 
        />
        
        <Typography variant="h6" gutterBottom>
          Check Your Email
        </Typography>
        
        <Alert 
          severity="info" 
          icon={<InfoIcon />}
          sx={{ 
            mb: 3, 
            backgroundColor: 'rgba(245, 193, 66, 0.1)',
            border: '1px solid rgba(245, 193, 66, 0.3)',
            '& .MuiAlert-icon': {
              color: '#F5C142',
            }
          }}
        >
          <Typography variant="body2">
            A confirmation email has been sent to <strong>{user?.email}</strong>
          </Typography>
        </Alert>
        
        <Typography variant="body1" paragraph>
          Please check your email inbox and click on the confirmation link to complete your password change.
        </Typography>
        
        <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic', color: 'text.secondary' }}>
          Don't see the email? Check your spam folder.
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
          {onClose && (
            <Button 
              onClick={onClose}
              variant="outlined"
            >
              {t('button.close')}
            </Button>
          )}
          
          <Button 
            variant="contained"
            onClick={() => {
              setConfirmationSent(false);
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
            }}
          >
            Try Again
          </Button>
        </Box>
      </Box>
    );
  }
  
  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ 
        mt: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {t('profile.passwordChangeSuccess')}
        </Alert>
      )}
      
      <TextField
        label={t('profile.currentPassword')}
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        fullWidth
        margin="normal"
        variant="outlined"
        error={!!errors.currentPassword}
        helperText={errors.currentPassword}
        disabled={loading || success}
        sx={{ mt: 0 }}
        inputRef={currentPasswordRef}
      />
      
      <TextField
        label={t('profile.newPassword')}
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        fullWidth
        margin="normal"
        variant="outlined"
        error={!!errors.newPassword}
        helperText={errors.newPassword}
        disabled={loading || success}
        sx={{ mt: 0 }}
        inputRef={newPasswordRef}
      />
      
      <TextField
        label={t('profile.confirmNewPassword')}
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        fullWidth
        margin="normal"
        variant="outlined"
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword}
        disabled={loading || success}
        sx={{ mt: 0 }}
        inputRef={confirmPasswordRef}
      />
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        {onClose && (
          <Button 
            onClick={onClose}
            sx={{ mr: 2, color: 'text.secondary' }}
            disabled={loading}
          >
            {t('button.cancel')}
          </Button>
        )}
        
        <Button 
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading || success}
          startIcon={loading && <CircularProgress size={20} color="inherit" />}
        >
          {loading ? t('button.loading') : t('button.saveChanges')}
        </Button>
      </Box>
    </Box>
  );
};

export default ChangePasswordForm; 