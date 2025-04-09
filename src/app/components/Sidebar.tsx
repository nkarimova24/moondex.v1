"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  CircularProgress,
  Typography,
  Divider,
  IconButton,
  Button,
  Stack,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import LogoutIcon from "@mui/icons-material/Logout";
import { fetchPokemonSets } from "@/app/lib/api/pokemon";
import { PokemonSet } from "@/app/lib/api/types";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ isOpen: propIsOpen, onToggle }: SidebarProps) {
  const [sets, setSets] = useState<{ [key: string]: PokemonSet[] }>({});
  const [loading, setLoading] = useState(true);
  const [expandedMain, setExpandedMain] = useState(false);
  const [expandedSeries, setExpandedSeries] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const { user, isAuthenticated, logout } = useAuth();
  const seriesRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const sidebarContainerRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); 
    };
    
    checkMobile();
    
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const isOpen = propIsOpen !== undefined ? propIsOpen : mobileOpen;
  
  const handleDrawerToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setMobileOpen(!mobileOpen);
    }
  };

  useEffect(() => {
    const loadSets = async () => {
      const fetchedSets = await fetchPokemonSets();
      setSets(fetchedSets);
      setLoading(false);
    };

    loadSets();
  }, []);

  useEffect(() => {
    if (expandedSeries && seriesRefs.current[expandedSeries] && sidebarContainerRef.current) {
      const container = sidebarContainerRef.current;
      const element = seriesRefs.current[expandedSeries];
      
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      
      const scrollPosition = elementRect.top - containerRect.top + container.scrollTop - 10;
      
      setTimeout(() => {
        container.scrollTo({ 
          top: scrollPosition, 
          behavior: 'smooth' 
        });
      }, 100);
    }
  }, [expandedSeries]);

  const handleMainToggle = () => {
    setExpandedMain((prev) => !prev);
    if (expandedMain) {
      setExpandedSeries(null);
    }
  };

  const handleSeriesToggle = (series: string) => {
    setExpandedSeries((prev) => (prev === series ? null : series));
  };

  const handleLogout = async () => {
    await logout();
    if (isMobile) {
      handleDrawerToggle();
    }
  };

  const toggleButton = isMobile && (
    <IconButton
      color="inherit"
      aria-label="toggle sidebar"
      onClick={handleDrawerToggle}
      sx={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        zIndex: 1300,
        backgroundColor: '#8A3F3F',
        '&:hover': {
          backgroundColor: '#612B2B',
        },
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        width: 50,
        height: 50,
      }}
    >
      {isOpen ? <CloseIcon /> : <MenuIcon />}
    </IconButton>
  );

  const authButtons = (
    <Box sx={{ 
      padding: "16px",
      borderTop: "1px solid rgba(255,255,255,0.1)",
      flexShrink: 0, 
    }}>
      {isAuthenticated ? (
        <Box>
          <Typography variant="body2" sx={{ mb: 1.5, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>
            Welcome, {user?.name}
          </Typography>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ 
              borderColor: 'rgba(138, 63, 63, 0.5)',
              color: 'rgba(138, 63, 63, 0.9)',
              '&:hover': {
                borderColor: '#8A3F3F',
                backgroundColor: 'rgba(138, 63, 63, 0.1)'
              }
            }}
          >
            Logout
          </Button>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          <Button
            fullWidth
            variant="contained"
            component={Link}
            href="/signin"
            startIcon={<LoginIcon />}
            onClick={isMobile ? handleDrawerToggle : undefined}
            sx={{ 
              backgroundColor: '#8A3F3F',
              '&:hover': {
                backgroundColor: '#612B2B',
              }
            }}
          >
            Sign In
          </Button>
          <Button
            fullWidth
            variant="outlined"
            component={Link}
            href="/signup"
            startIcon={<PersonAddIcon />}
            onClick={isMobile ? handleDrawerToggle : undefined}
            sx={{ 
              borderColor: 'rgba(138, 63, 63, 0.5)',
              color: 'rgba(138, 63, 63, 0.9)',
              '&:hover': {
                borderColor: '#8A3F3F',
                backgroundColor: 'rgba(138, 63, 63, 0.1)'
              }
            }}
          >
            Sign Up
          </Button>
        </Stack>
      )}
    </Box>
  );

  const drawerContent = (
    <>
      <Box
        sx={{
          background: "linear-gradient(to right,rgb(97, 43, 43), #8A3F3F)",
          padding: "16px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          flexShrink: 0,
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700,
            textShadow: "0 1px 2px rgba(0,0,0,0.3)",
            letterSpacing: "0.5px"
          }}
        >
          Moondex
        </Typography>
        
        {isMobile && (
          <IconButton 
            size="small" 
            onClick={handleDrawerToggle}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ opacity: 0.2 }} />

      <Box 
        ref={sidebarContainerRef}
        sx={{ 
          overflowY: 'auto',
          flexGrow: 1, 
        }}
      >
        <List sx={{ padding: 0 }}>
          <ListItem disablePadding>
            <ListItemButton 
              component={Link} 
              href="/"
              sx={{ 
                padding: "12px 16px",
                "&:hover": {
                  backgroundColor: "rgba(138, 63, 63, 0.15)",
                }
              }}
              onClick={isMobile ? handleDrawerToggle : undefined}
            >
              <ListItemText 
                primary="Home" 
                primaryTypographyProps={{ 
                  fontWeight: 500,
                  fontSize: "15px" 
                }} 
              />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ opacity: 0.1 }} />

          <ListItem disablePadding>
            <ListItemButton 
              onClick={handleMainToggle}
              sx={{ 
                padding: "12px 16px",
                backgroundColor: expandedMain ? "rgba(138, 63, 63, 0.07)" : "transparent",
                "&:hover": {
                  backgroundColor: "rgba(138, 63, 63, 0.15)",
                }
              }}
            >
              <ListItemText 
                primary="Sets & Series" 
                primaryTypographyProps={{ 
                  fontWeight: 600,
                  fontSize: "15px"
                }} 
              />
              {expandedMain ? 
                <ExpandLess sx={{ color: "#8A3F3F" }} /> : 
                <ExpandMore sx={{ color: "#8A3F3F" }} />
              }
            </ListItemButton>
          </ListItem>

          <Collapse in={expandedMain} timeout="auto" unmountOnExit>
            {loading ? (
              <Box 
                display="flex" 
                justifyContent="center" 
                p={3}
                sx={{
                  "& .MuiCircularProgress-root": {
                    color: "#8A3F3F"
                  }
                }}
              >
                <CircularProgress size={30} thickness={4} />
              </Box>
            ) : (
              <List component="div" disablePadding>
                {Object.entries(sets).map(([series, seriesSets]) => (
                  <div 
                    key={series}
                    ref={el => { seriesRefs.current[series] = el; }}
                  >
                    <ListItem disablePadding>
                      <ListItemButton 
                        onClick={() => handleSeriesToggle(series)} 
                        sx={{ 
                          pl: 3,
                          py: 1.5,
                          backgroundColor: expandedSeries === series ? "rgba(138, 63, 63, 0.05)" : "transparent",
                          "&:hover": {
                            backgroundColor: "rgba(138, 63, 63, 0.1)",
                          }
                        }}
                      >
                        <ListItemText 
                          primary={series} 
                          primaryTypographyProps={{ 
                            fontWeight: 500,
                            fontSize: "14px",
                            color: expandedSeries === series ? "#8A3F3F" : "#E0E0E0"
                          }} 
                        />
                        {expandedSeries === series ? 
                          <ExpandLess sx={{ color: "#8A3F3F", fontSize: 20 }} /> : 
                          <ExpandMore sx={{ color: "#8A3F3F", fontSize: 20 }} />
                        }
                      </ListItemButton>
                    </ListItem>
                    <Collapse in={expandedSeries === series} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding sx={{ backgroundColor: "rgba(0,0,0,0.15)" }}>
                        {seriesSets.map((set) => (
                          <ListItem key={set.id} disablePadding>
                            <ListItemButton 
                              component={Link} 
                              href={`/pokedex?setId=${set.id}`} 
                              sx={{ 
                                pl: 4, 
                                py: 1,
                                transition: "all 0.2s ease",
                                "&:hover": {
                                  backgroundColor: "rgba(138, 63, 63, 0.1)",
                                  borderLeft: "3px solid #8A3F3F",
                                  pl: "calc(1rem - 3px)"
                                }
                              }}
                              onClick={isMobile ? handleDrawerToggle : undefined}
                            >
                              <ListItemText 
                                primary={set.name} 
                                primaryTypographyProps={{ 
                                  fontSize: "13px",
                                  color: "rgba(255,255,255,0.85)",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis"
                                }} 
                              />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    </Collapse>
                  </div>
                ))}
              </List>
            )}
          </Collapse>
          
          <Divider sx={{ opacity: 0.1, my: 1 }} />
        </List>
      </Box>
      
      {/* Authentication Buttons */}
      {authButtons}
      
      {/* Footer */}
      <Box 
        sx={{ 
          padding: "16px",
          textAlign: "center",
          flexShrink: 0, 
        }}
      >
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>
          © 2025 MOONDEX
        </Typography>
      </Box>
    </>
  );

  return (
    <>
      {toggleButton}
      
      {/* Desktop permanent drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: 240,
            flexShrink: 0,
            zIndex: 1000, 
            display: { xs: 'none', sm: 'block' },
            "& .MuiDrawer-paper": {
              width: 240,
              background: "linear-gradient(to bottom, #242424, #1A1A1A)",
              color: "#fff",
              borderRight: "1px solid rgba(138, 63, 63, 0.3)",
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
      
      {/* Mobile temporary drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={isOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, 
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              width: 280,
              background: "linear-gradient(to bottom, #242424, #1A1A1A)",
              color: "#fff",
              borderRight: "1px solid rgba(138, 63, 63, 0.3)",
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
}