"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";

export default function DecksPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/signin");
    }
  }, [isAuthenticated, router]);
  
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Deck Builder</h1>
          <p className="text-gray-400 mt-1">
            Create and manage your Pokémon card decks
          </p>
        </div>
        
        <Button
          variant="contained"
          sx={{ 
            bgcolor: '#8A3F3F', 
            '&:hover': { bgcolor: '#6E2F2F' } 
          }}
        >
          Coming Soon
        </Button>
      </div>
      
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          bgcolor: '#252525', 
          borderRadius: 2,
          textAlign: 'center' 
        }}
      >
        <Typography variant="h5" gutterBottom>
          Deck Builder Coming Soon
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          We're working hard to bring you a powerful deck building experience!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Check back later for updates on this exciting feature.
        </Typography>
      </Paper>
    </div>
  );
}