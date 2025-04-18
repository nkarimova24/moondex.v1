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
  Stack,
  Box,
  Avatar
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import LogoutIcon from "@mui/icons-material/Logout";
import HistoryIcon from "@mui/icons-material/History";
import { fetchPokemonSets } from "@/app/lib/api/pokemon";
import { PokemonSet } from "@/app/lib/api/types";
import { useAuth, getUserAvatarUrl } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import LanguageToggle from "./LanguageToggle";

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ isOpen: propIsOpen, onToggle }: SidebarProps) {
  const { t } = useLanguage();
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
            <Avatar 
              src={getUserAvatarUrl(user)}
              sx={{ 
                width: 40, 
                height: 40,
                background: 'linear-gradient(to bottom right, #8A3F3F, #612B2B)',
                fontWeight: 'bold',
              }}
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>
                {user?.name}
              </Typography>
              <Typography 
                component={Link}
                href="/profile"
                variant="caption" 
                sx={{ 
                  color: "rgba(255,255,255,0.6)",
                  textDecoration: "none",
                  "&:hover": {
                    color: "rgba(255,255,255,0.9)",
                    textDecoration: "underline"
                  }
                }}
                onClick={isMobile ? handleDrawerToggle : undefined}
              >
                {t("sidebar.goToProfile")}
              </Typography>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
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
          {/* Uncomment when we have a logo */}
          {/* <Image src="/logo.png" alt="MoonDex" width={32} height={32} /> */}
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
            {t("app.name")}
          </Typography>
        </Box>
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
                primary={t("nav.home")}
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
                primary={t("nav.allSets")}
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
                primary={t("nav.browseBySeries")} 
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
    {/*  login/signup buttons */}
      {!isAuthenticated && (
        <Box sx={{ padding: "0 16px 16px 16px" }}>
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
              {t("sidebar.signIn")}
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
              {t("sidebar.signUp")}
            </Button> 
          </Stack>
        </Box>
      )}
      {/* Footer with compact language and changelog */}
      <Box 
        sx={{ 
          padding: "12px",
          flexShrink: 0,
          background: 'linear-gradient(to bottom, rgba(25,25,25,1), rgba(20,20,20,1))',
        }}
      >
        {/* Compact utility links */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 3, 
          mb: 0,
          pb: 0
        }}>
          {/* Language Toggle */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            <LanguageToggle compact={true} />
          </Box>
          
          {/* Changelog Link */}
          <IconButton
            component={Link}
            href="/changelog"
            onClick={isMobile ? handleDrawerToggle : undefined}
            size="small"
            sx={{ 
              color: 'rgba(255,255,255,0.6)',
              '&:hover': { color: 'rgba(255,255,255,0.9)' }
            }}
            title={t("nav.changelog")}
          >
            <HistoryIcon fontSize="small" />
          </IconButton>

          {/* Logout Button */}
          {isAuthenticated && (
            <IconButton
              onClick={handleLogout}
              size="small"
              sx={{ 
                color: 'rgba(255,255,255,0.6)',
                '&:hover': { color: 'rgba(255,255,255,0.9)' }
              }}
              title={t("sidebar.logout")}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
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