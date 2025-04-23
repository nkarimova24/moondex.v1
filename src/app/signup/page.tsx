"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Button, TextField, Box, Typography, Container, Alert, CircularProgress } from "@mui/material";

export default function SignUp() {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const { register, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect already authenticated users to profile page
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/profile");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError("");

    if (userData.password !== userData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.confirmPassword,
      });

      if (result.success) {
        // Show a success message
        setGeneralError("");
        
        // Immediate redirect attempt
        router.push("/");
        
        // Also set a fallback redirect timer in case the router.push doesn't trigger immediately
        setTimeout(() => {
          window.location.href = "/";
        }, 1500); // Redirect after 1.5 seconds if router.push doesn't work immediately
      } else {
        if (result.errors) {
          setErrors(result.errors);
        }
        if (result.message) {
          setGeneralError(result.message);
        } else if (result.errors && Object.keys(result.errors).length > 0) {
          // If we have field errors but no general message, use the first error message
          const firstError = Object.values(result.errors)[0];
          setGeneralError(firstError);
        } else {
          setGeneralError("Registration failed. Please try again.");
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
    <div className="min-h-screen flex items-center justify-center">
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
            Create your MoonDex account
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
              id="name"
              label="Username"
              name="name"
              autoComplete="name"
              autoFocus
              value={userData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
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
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={userData.email}
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
              autoComplete="new-password"
              value={userData.password}
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
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={userData.confirmPassword}
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
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
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
                Already have an account?{" "}
                <Link href="/signin">
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </div>
  );
}