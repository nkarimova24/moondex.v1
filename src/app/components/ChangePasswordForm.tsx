import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  TextField,
  Button,
  CircularProgress,
  Typography,
  Box,
  Alert
} from '@mui/material';

const ChangePasswordForm = ({ onClose }: { onClose?: () => void }) => {
  const { t } = useLanguage();
  const { changePassword } = useAuth();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
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
      newErrors.currentPassword = t('auth.requiredField');
    }
    
    if (!newPassword) {
      newErrors.newPassword = t('auth.requiredField');
    } else if (newPassword.length < 8) {
      newErrors.newPassword = t('auth.passwordLength');
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = t('auth.requiredField');
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = t('auth.passwordMismatch');
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
    
    try {
      const result = await changePassword(currentPassword, newPassword);
      
      if (result.success) {
        setSuccess(true);
        // Reset form after successful password change
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Close the form after a delay if onClose is provided
        if (onClose) {
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      } else {
        setError(result.message || t('profile.passwordChangeError'));
      }
    } catch (err) {
      setError(t('profile.passwordChangeError'));
      console.error('Error changing password:', err);
    } finally {
      setLoading(false);
    }
  };
  
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
        disabled={loading}
        sx={{ mt: 0 }}
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
        disabled={loading}
        sx={{ mt: 0 }}
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
        disabled={loading}
        sx={{ mt: 0 }}
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
          disabled={loading}
          sx={{
            backgroundColor: '#8A3F3F',
            '&:hover': {
              backgroundColor: '#612B2B',
            }
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            t('button.save')
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default ChangePasswordForm; 