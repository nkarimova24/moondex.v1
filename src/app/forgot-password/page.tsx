"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Button, 
  TextField, 
  Box, 
  Typography, 
  Container, 
  Alert, 
  CircularProgress, 
  Paper 
} from "@mui/material";
import { useLanguage } from "@/context/LanguageContext";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';

// Get the API URL from env or use the default
const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000/api';

// Add this interface to fix type issues
interface PasswordResetResponse {
  status?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

export default function ForgotPassword() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate email
      if (!email || !email.includes('@')) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }

      // For development/testing, we can simulate success
      if (process.env.NODE_ENV === 'development') {
        console.log('DEV MODE: Simulating successful password reset email sent');
        setSuccess(true);
        setLoading(false);
        return;
      }

      // Get the current frontend URL for redirection
      const frontendUrl = window.location.origin;
      
      // Try to send the request directly
      try {
        const response = await axios.post<PasswordResetResponse>(`${API_URL}/password/email`, {
          email,
          redirect_url: `${frontendUrl}/password-reset`,
        });
        
        console.log('Password reset response:', response.data);
        
        if (response.data.status === 'success' || 
            (response.data.message && response.data.message.toLowerCase().includes('sent'))) {
          setSuccess(true);
        } else {
          setError(response.data.message || 'Failed to send password reset email');
        }
      } catch (apiError: any) {
        console.error('Password reset API error:', apiError.response?.data);
        
        // Show detailed error message for debugging
        if (apiError.response?.data?.errors) {
          const errorMessages = Object.values(apiError.response.data.errors).flat();
          setError(errorMessages.join(', '));
        } else if (apiError.response?.data?.message) {
          setError(apiError.response.data.message);
        } else {
          setError('Failed to send password reset email. Please try again later.');
        }
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Password reset error:", error);
    } finally {
      setLoading(false);
    }
  };

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
            Reset Password
          </Typography>

          {success ? (
            <Box sx={{ textAlign: "center", mt: 2 }}>
              <CheckCircleOutlineIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="body1" sx={{ color: '#fff', mb: 3 }}>
                If an account exists with that email, we've sent password reset instructions.
                Please check your inbox and spam folder.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push("/signin")}
                sx={{
                  mt: 2,
                  color: "#8A3F3F",
                  borderColor: "#8A3F3F",
                  "&:hover": {
                    borderColor: "#6A2F2F",
                    backgroundColor: "rgba(138, 63, 63, 0.1)",
                  },
                }}
              >
                Back to Sign In
              </Button>
            </Box>
          ) : (
            <>
              <Typography
                variant="body1"
                sx={{ color: "rgba(255, 255, 255, 0.7)", mb: 3, textAlign: "center" }}
              >
                Enter your email address and we'll send you instructions to reset your password.
              </Typography>

              {error && (
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
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: "100%" }}>
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
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: "#fff" }} />
                  ) : (
                    "Send Reset Instructions"
                  )}
                </Button>
                <Box textAlign="center">
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(255, 255, 255, 0.7)",
                      "& a": {
                        color: "#8A3F3F",
                        textDecoration: "none",
                        fontWeight: "bold",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      },
                    }}
                  >
                    Remember your password?{" "}
                    <Link href="/signin">Sign In</Link>
                  </Typography>
                </Box>
              </Box>
            </>
          )}
        </Paper>
      </Container>
    </div>
  );
} 