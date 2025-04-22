"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  Alert,
  CircularProgress,
} from "@mui/material";

export default function ChangeTemporaryPasswordPage() {
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [success, setSuccess] = useState(false);
  const { user, updateTemporaryPassword, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  // Check if user is authenticated and needs to change password
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        router.push("/signin");
      } else if (user && !user.password_change_required) {
        // Redirect to profile if user doesn't need to change password
        router.push("/profile");
      }
    }
  }, [isAuthenticated, user, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!passwords.newPassword) {
      newErrors.newPassword = "Please enter a new password";
    } else if (passwords.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters long";
    }
    
    if (!passwords.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const result = await updateTemporaryPassword(
        passwords.newPassword,
        passwords.confirmPassword
      );
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/profile");
        }, 2000);
      } else {
        if (result.errors) {
          setErrors(result.errors);
        }
        if (result.message) {
          setGeneralError(result.message);
        }
      }
    } catch (error) {
      setGeneralError("An unexpected error occurred. Please try again.");
      console.error("Error updating temporary password:", error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: '#8A3F3F' }} />
      </Box>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Container component="main" maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            bgcolor: "rgba(30, 30, 30, 0.8)",
            p: 4,
            borderRadius: 2,
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Typography
            component="h1"
            variant="h5"
            sx={{
              color: "#8A3F3F",
              fontWeight: "bold",
              mb: 2,
              textAlign: "center",
            }}
          >
            Change Your Password
          </Typography>
          
          <Typography
            variant="body1"
            sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 3, textAlign: "center" }}
          >
            Your account is using a temporary password. Please create a new password to continue.
          </Typography>

          {success ? (
            <Alert
              severity="success"
              sx={{
                width: "100%",
                mb: 3,
                bgcolor: "rgba(46, 125, 50, 0.1)",
                color: "#69f0ae",
                border: "1px solid rgba(46, 125, 50, 0.3)",
              }}
            >
              Password updated successfully! Redirecting to your profile...
            </Alert>
          ) : (
            <>
              {generalError && (
                <Alert
                  severity="error"
                  sx={{
                    width: "100%",
                    mb: 3,
                    bgcolor: "rgba(211, 47, 47, 0.1)",
                    color: "#ff8a80",
                    border: "1px solid rgba(211, 47, 47, 0.3)",
                  }}
                >
                  {generalError}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: "100%" }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="newPassword"
                  label="New Password"
                  type="password"
                  id="newPassword"
                  autoComplete="new-password"
                  value={passwords.newPassword}
                  onChange={handleChange}
                  error={!!errors.newPassword}
                  helperText={errors.newPassword}
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
                    '& .MuiFormHelperText-root': {
                      color: '#ff8a80',
                    },
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={passwords.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
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
                    '& .MuiFormHelperText-root': {
                      color: '#ff8a80',
                    },
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    mt: 3,
                    mb: 2,
                    bgcolor: "#8A3F3F",
                    "&:hover": {
                      bgcolor: "#6A2F2F",
                    },
                    "&:disabled": {
                      bgcolor: "rgba(138, 63, 63, 0.5)",
                    },
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: "bold",
                    textTransform: "none",
                  }}
                >
                  {loading ? "Updating Password..." : "Update Password"}
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Container>
    </div>
  );
} 