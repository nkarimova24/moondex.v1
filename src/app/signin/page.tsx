"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Button, TextField, Box, Typography, Container, Alert, CircularProgress } from "@mui/material";

export default function SignIn() {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const { login, isAuthenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();

  // Redirect already authenticated users to profile page
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      if (user?.password_change_required) {
        // Redirect to temporary password change page if required
        router.push("/change-temporary-password");
      } else {
        // Otherwise redirect to profile
        router.push("/profile");
      }
    }
  }, [isAuthenticated, authLoading, router, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError("");
    setLoading(true);

    try {
      const result = await login(credentials);

      if (result.success) {
        router.push("/profile"); // Redirect to profile instead of home
      } else {
        if (result.errors) {
          setErrors(result.errors);
        }
        if (result.message) {
          setGeneralError(result.message);
        }
        
        if (!result.errors && !result.message) {
          setGeneralError("Login failed. Please check your credentials and try again.");
        }
      }
    } catch (error) {
      setGeneralError("An unexpected error occurred. Please try again.");
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
    <div className="min-h-screen flex items-center justify-center ">
      <Container component="main" maxWidth="xs">
        <Box
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
              textAlign: "center"
            }}
          >
            Sign in
          </Typography>
          
          {generalError && (
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
              {generalError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: "100%" }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={credentials.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
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
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
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
                bgcolor: '#8A3F3F',
                '&:hover': {
                  bgcolor: '#6A2F2F',
                },
                '&:disabled': {
                  bgcolor: 'rgba(138, 63, 63, 0.5)',
                },
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 'bold',
                textTransform: 'none',
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <Box textAlign="center" sx={{ mb: 2 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  '& a': {
                    color: '#8A3F3F',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  },
                }}
              >
                <Link href="/forgot-password">
                  Forgot password?
                </Link>
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  '& a': {
                    color: '#8A3F3F',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  },
                }}
              >
                Don't have an account?{" "}
                <Link href="/signup">
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </div>
  );
}