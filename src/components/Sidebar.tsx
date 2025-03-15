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
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

interface PokemonSet {
  id: string;
  name: string;
  series: string;
}

export default function Sidebar() {
  const [sets, setSets] = useState<PokemonSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSeries, setExpandedSeries] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const response = await fetch("https://api.pokemontcg.io/v2/sets");
        const data = await response.json();
        setSets(data.data);
      } catch (error) {
        console.error("Error fetching Pokémon sets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSets();
  }, []);

  // Groepeer sets per serie
  const groupedSets = sets.reduce((acc, set) => {
    acc[set.series] = acc[set.series] || [];
    acc[set.series].push(set);
    return acc;
  }, {} as { [key: string]: PokemonSet[] });

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
          backgroundColor: "#212121",
          color: "#fff",
          paddingTop: "10px",
        },
      }}
    >
      <Box>
        <List>
          <ListItem disablePadding>
            <ListItemButton component={Link} href="/">
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>

          {loading ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress color="inherit" />
            </Box>
          ) : (
            Object.entries(groupedSets).map(([series, seriesSets]) => (
              <div key={series}>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleSeriesToggle(series)}>
                    <ListItemText primary={series} sx={{ fontWeight: "bold" }} />
                    {expandedSeries[series] ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={expandedSeries[series]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {seriesSets.map((set) => (
                      <ListItem key={set.id} disablePadding>
                        <ListItemButton component={Link} href={`/sets/${set.id}`} sx={{ pl: 4 }}>
                          <ListItemText primary={set.name} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </div>
            ))
          )}
        </List>
      </Box>
    </Drawer>
  );
}
