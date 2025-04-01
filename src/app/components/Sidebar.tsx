"use client";

import { useState, useEffect } from "react";
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
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { fetchPokemonSets, PokemonSet } from "@/app/lib/api";
import Image from "next/image";

export default function Sidebar() {
  const [sets, setSets] = useState<{ [key: string]: PokemonSet[] }>({});
  const [loading, setLoading] = useState(true);
  const [expandedMain, setExpandedMain] = useState(false);
  const [expandedSeries, setExpandedSeries] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const loadSets = async () => {
      const fetchedSets = await fetchPokemonSets();
      setSets(fetchedSets);
      setLoading(false);
    };

    loadSets();
  }, []);

  const handleMainToggle = () => {
    setExpandedMain((prev) => !prev);
  };

  const handleSeriesToggle = (series: string) => {
    setExpandedSeries((prev) => ({ ...prev, [series]: !prev[series] }));
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 240,
          background: "linear-gradient(to bottom, #242424, #1A1A1A)",
          color: "#fff",
          borderRight: "1px solid rgba(138, 63, 63, 0.3)",
        },
      }}
    >
      {/* Header with Logo/Title */}
      <Box
        sx={{
          background: "linear-gradient(to right,rgb(97, 43, 43), #8A3F3F)",
          padding: "16px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
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
      </Box>

      <Divider sx={{ opacity: 0.2 }} />

      <Box>
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
                  <div key={series}>
                    <ListItem disablePadding>
                      <ListItemButton 
                        onClick={() => handleSeriesToggle(series)} 
                        sx={{ 
                          pl: 3,
                          py: 1.5,
                          backgroundColor: expandedSeries[series] ? "rgba(138, 63, 63, 0.05)" : "transparent",
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
                            color: expandedSeries[series] ? "#8A3F3F" : "#E0E0E0"
                          }} 
                        />
                        {expandedSeries[series] ? 
                          <ExpandLess sx={{ color: "#8A3F3F", fontSize: 20 }} /> : 
                          <ExpandMore sx={{ color: "#8A3F3F", fontSize: 20 }} />
                        }
                      </ListItemButton>
                    </ListItem>
                    <Collapse in={expandedSeries[series]} timeout="auto" unmountOnExit>
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
          
          {/* Additional menu items */}
          {/* <ListItem disablePadding>
            <ListItemButton 
              component={Link} 
              href="/favorites"
              sx={{ 
                padding: "12px 16px",
                "&:hover": {
                  backgroundColor: "rgba(138, 63, 63, 0.15)",
                }
              }}
            >
              <ListItemText 
                primary="Favorites" 
                primaryTypographyProps={{ 
                  fontWeight: 500,
                  fontSize: "15px" 
                }} 
              />
            </ListItemButton>
          </ListItem> */}
          
          {/* <ListItem disablePadding>
            <ListItemButton 
              component={Link} 
              href="/advanced-search"
              sx={{ 
                padding: "12px 16px",
                "&:hover": {
                  backgroundColor: "rgba(138, 63, 63, 0.15)",
                }
              }}
            >
              <ListItemText 
                primary="Advanced Search" 
                primaryTypographyProps={{ 
                  fontWeight: 500,
                  fontSize: "15px" 
                }} 
              />
            </ListItemButton>
          </ListItem> */}
        </List>
      </Box>
      
      {/* Footer */}
      <Box 
        sx={{ 
          marginTop: "auto", 
          padding: "16px",
          textAlign: "center",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          backgroundColor: "rgba(0,0,0,0.2)"
        }}
      >
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>
          © 2025 MOONDEX
        </Typography>
      </Box>
    </Drawer>
  );
}