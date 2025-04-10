"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
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
  Box
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
// import LoginIcon from "@mui/icons-material/Login";
// import PersonAddIcon from "@mui/icons-material/PersonAdd";
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
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);
  const [hoveredSet, setHoveredSet] = useState<string | null>(null);
  
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
        boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
        width: 50,
        height: 50,
        transition: 'transform 0.2s ease-in-out',
        '&:active': {
          transform: 'scale(0.95)',
        },
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
      background: 'linear-gradient(to bottom, rgba(45,45,45,0.3), rgba(30,30,30,0.4))',
    }}>
      {isAuthenticated ? (
        <Box>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5, 
              mb: 2,
              p: 1.5,
              borderRadius: 1.5, 
              background: 'linear-gradient(to right, rgba(138, 63, 63, 0.15), rgba(138, 63, 63, 0.05))',
            }}
          >
            <Box 
              sx={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                background: 'linear-gradient(to bottom right, #8A3F3F, #612B2B)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: 'white',
                textTransform: 'uppercase',
              }}
            >
              {user?.name?.[0] || 'U'}
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>
                {user?.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
                {user?.email}
              </Typography>
            </Box>
          </Box>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ 
              borderColor: 'rgba(138, 63, 63, 0.5)',
              color: 'rgba(255,255,255,0.9)',
              background: 'rgba(138, 63, 63, 0.2)',
              '&:hover': {
                borderColor: '#8A3F3F',
                backgroundColor: 'rgba(138, 63, 63, 0.3)'
              },
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Logout
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {/* Sign in/up buttons soon*/}
        </Box>
      )}
    </Box>
  );

  const drawerContent = (
    <>
      <Box
        sx={{
          background: "linear-gradient(145deg, #8A3F3F, #612B2B)",
          padding: "20px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative elements */}
        <Box 
          sx={{ 
            position: 'absolute',
            width: '150px',
            height: '150px',
            borderRadius: '75px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            top: '-80px',
            right: '-40px',
          }}
        />
        
        <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Here you could add a logo image */}
          {/* <Image src="/logo.png" alt="Moondex" width={32} height={32} /> */}
          <Typography 
            variant="h6" 
            component={Link}
            href="/"
            sx={{ 
              fontWeight: 700,
              textDecoration: 'none',
              color: 'white',
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              letterSpacing: "0.5px",
              position: 'relative',
              '&:after': {
                content: '""',
                position: 'absolute',
                bottom: -2,
                left: 0,
                width: 0,
                height: '2px',
                backgroundColor: 'rgba(255,255,255,0.7)',
                transition: 'width 0.3s ease',
              },
              '&:hover:after': {
                width: '100%',
              }
            }}
          >
            MOONDEX
          </Typography>
        </Box>
        
        {isMobile && (
          <IconButton 
            size="small" 
            onClick={handleDrawerToggle}
            sx={{ 
              color: 'white',
              background: 'rgba(0,0,0,0.2)',
              '&:hover': {
                background: 'rgba(0,0,0,0.3)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      <Box 
        ref={sidebarContainerRef}
        sx={{ 
          overflowY: 'auto',
          flexGrow: 1,
          background: 'linear-gradient(to bottom, rgba(30,30,30,1), rgba(25,25,25,1))',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(0,0,0,0.1)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(138, 63, 63, 0.5)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(138, 63, 63, 0.7)',
          },
        }}
      >
        <List sx={{ padding: 0 }}>
          <ListItem disablePadding>
            <ListItemButton 
              component={Link} 
              href="/"
              sx={{ 
                padding: "12px 20px",
                transition: 'all 0.2s ease',
                "&:hover": {
                  backgroundColor: "rgba(138, 63, 63, 0.15)",
                  paddingLeft: '24px',
                  borderLeft: '4px solid #8A3F3F',
                },
                borderLeft: '4px solid transparent',
              }}
              onClick={isMobile ? handleDrawerToggle : undefined}
            >
              <ListItemText 
                primary="Home" 
                primaryTypographyProps={{ 
                  fontWeight: 500,
                  fontSize: "15px",
                  color: 'rgba(255,255,255,0.9)',
                  sx: {
                    '&:hover': {
                      color: 'rgba(255,255,255,0.95)',
                    }
                  }
                }} 
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton 
              component={Link} 
              href="/sets"
              sx={{ 
                padding: "12px 20px",
                transition: 'all 0.2s ease',
                "&:hover": {
                  backgroundColor: "rgba(138, 63, 63, 0.15)",
                  paddingLeft: '24px',
                  borderLeft: '4px solid #8A3F3F',
                },
                borderLeft: '4px solid transparent',
              }}
              onClick={isMobile ? handleDrawerToggle : undefined}
            >
              <ListItemText 
                primary="All Sets" 
                primaryTypographyProps={{ 
                  fontWeight: 500,
                  fontSize: "15px",
                  color: 'rgba(255,255,255,0.9)',
                  sx: {
                    '&:hover': {
                      color: 'rgba(255,255,255,0.95)',
                    }
                  }
                }} 
              />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ my: 1, opacity: 0.1 }} />

          <ListItem disablePadding>
            <ListItemButton 
              onClick={handleMainToggle}
              sx={{ 
                padding: "12px 20px",
                backgroundColor: expandedMain ? "rgba(138, 63, 63, 0.07)" : "transparent",
                "&:hover": {
                  backgroundColor: "rgba(138, 63, 63, 0.15)",
                }
              }}
            >
              <ListItemText 
                primary="Browse by Series" 
                primaryTypographyProps={{ 
                  fontWeight: 600,
                  fontSize: "15px",
                  color: expandedMain ? '#8A3F3F' : 'rgba(255,255,255,0.9)'
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
                    onMouseEnter={() => setHoveredSeries(series)}
                    onMouseLeave={() => setHoveredSeries(null)}
                  >
                    <ListItem disablePadding>
                      <ListItemButton 
                        onClick={() => handleSeriesToggle(series)} 
                        sx={{ 
                          pl: 2,
                          py: 1.5,
                          background: expandedSeries === series 
                            ? 'linear-gradient(to right, rgba(138, 63, 63, 0.15), rgba(138, 63, 63, 0))' 
                            : hoveredSeries === series 
                              ? 'rgba(138, 63, 63, 0.07)'
                              : 'transparent',
                          transition: 'background 0.2s ease',
                          "&:hover": {
                            background: 'linear-gradient(to right, rgba(138, 63, 63, 0.15), rgba(138, 63, 63, 0))',
                          },
                          borderLeft: expandedSeries === series ? '3px solid #8A3F3F' : '3px solid transparent',
                        }}
                      >
                        <ListItemText 
                          primary={series} 
                          secondary={`${seriesSets.length} sets`}
                          primaryTypographyProps={{ 
                            fontWeight: expandedSeries === series ? 600 : 500,
                            fontSize: "14px",
                            color: expandedSeries === series ? "#8A3F3F" : "#E0E0E0",
                          }}
                          secondaryTypographyProps={{
                            fontSize: "12px",
                            color: "rgba(255,255,255,0.5)",
                          }}
                        />
                        {expandedSeries === series ? 
                          <ExpandLess sx={{ color: "#8A3F3F", fontSize: 20 }} /> : 
                          <ExpandMore sx={{ color: "#8A3F3F", fontSize: 20 }} />
                        }
                      </ListItemButton>
                    </ListItem>
                    <Collapse in={expandedSeries === series} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding sx={{ 
                        backgroundColor: "rgba(0,0,0,0.15)",
                      }}>
                        {seriesSets.map((set) => (
                          <ListItem key={set.id} disablePadding
                            onMouseEnter={() => setHoveredSet(set.id)}
                            onMouseLeave={() => setHoveredSet(null)}
                          >
                            <ListItemButton 
                              component={Link} 
                              href={`/pokedex?setId=${set.id}`} 
                              sx={{ 
                                pl: 2, 
                                py: 1,
                                transition: 'all 0.2s ease',
                                position: 'relative',
                                "&:hover": {
                                  backgroundColor: "rgba(138, 63, 63, 0.1)",
                                  pl: 5,
                                },
                                '&:after': {
                                  content: '""',
                                  position: 'absolute',
                                  left: 0,
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  width: 0,
                                  height: '60%',
                                  backgroundColor: '#8A3F3F',
                                  transition: 'width 0.2s ease',
                                  opacity: 0.7,
                                },
                                '&:hover:after': {
                                  width: '3px',
                                }
                              }}
                              onClick={isMobile ? handleDrawerToggle : undefined}
                            >
                              <ListItemText 
                                primary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {set.images?.symbol && (
                                      <Box 
                                        component="span" 
                                        sx={{ 
                                          width: 16, 
                                          height: 16, 
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          overflow: 'hidden',
                                          opacity: hoveredSet === set.id ? 1 : 0.7,
                                        }}
                                      >
                                        <Image 
                                          src={set.images.symbol} 
                                          alt="" 
                                          width={16} 
                                          height={16}
                                          style={{ 
                                            maxWidth: '100%', 
                                            maxHeight: '100%' 
                                          }}
                                        />
                                      </Box>
                                    )}
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        fontSize: '13px',
                                        color: hoveredSet === set.id ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.8)',
                                      }}
                                    >
                                      {set.name}
                                    </Typography>
                                  </Box>
                                }
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
          padding: "12px",
          textAlign: "center",
          flexShrink: 0,
          background: 'linear-gradient(to bottom, rgba(25,25,25,1), rgba(20,20,20,1))',
        }}
      >
        <Typography variant="caption" sx={{ 
          color: "rgba(255,255,255,0.4)", 
          fontSize: "11px",
          letterSpacing: '0.5px',
        }}>
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
              background: "#1A1A1A",
              color: "#fff",
              borderRight: "1px solid rgba(138, 63, 63, 0.3)",
              display: "flex",
              flexDirection: "column",
              boxShadow: '4px 0 15px rgba(0, 0, 0, 0.2)',
              borderRadius: 0,
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
              width: 240,
              background: "#1A1A1A",
              color: "#fff",
              borderRight: "1px solid rgba(138, 63, 63, 0.3)",
              display: "flex",
              flexDirection: "column",
              boxShadow: '4px 0 15px rgba(0, 0, 0, 0.2)',
              borderRadius: 0,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
}