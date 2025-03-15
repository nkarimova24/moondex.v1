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
  releaseDate: string; 
}


export default function Sidebar() {
  const [sets, setSets] = useState<{ [key: string]: PokemonSet[] }>({});
  const [loading, setLoading] = useState(true);
  const [expandedMain, setExpandedMain] = useState(false); // Hoofdknop toggle
  const [expandedSeries, setExpandedSeries] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchSets = async () => {
      try {
        const response = await fetch("https://api.pokemontcg.io/v2/sets");
        const data = await response.json();
  
        // Filter sets met een geldige releaseDate
        const validSets: PokemonSet[] = data.data.filter(
          (set: PokemonSet) => set.releaseDate
        );
  
        // Sorteer sets op releaseDate (nieuwste eerst)
        const sortedSets = validSets.sort((a, b) => {
          return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
        });
  
        // Groepeer sets per serie
        const groupedSets = sortedSets.reduce<{ [key: string]: PokemonSet[] }>(
          (acc, set) => {
            if (!acc[set.series]) acc[set.series] = [];
            acc[set.series].push(set);
            return acc;
          },
          {}
        );
  
        // Sorteer series op basis van de nieuwste set binnen elke serie
        const sortedSeries = Object.entries(groupedSets)
          .sort(([_, setsA], [__, setsB]) => {
            const latestSetA = new Date(setsA[0].releaseDate).getTime();
            const latestSetB = new Date(setsB[0].releaseDate).getTime();
            return latestSetB - latestSetA;
          });
  
        // Zet de gesorteerde series en sets
        setSets(Object.fromEntries(sortedSeries));

      } catch (error) {
        console.error("Error fetching Pokémon sets:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchSets();
  }, []);
  
  // groupedSets is already calculated in useEffect and stored in sets

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
          backgroundColor: "#212121",
          color: "#fff",
          paddingTop: "10px",
        },
      }}
    >
      <Box>
        <List>
          {/* Home Link */}
          <ListItem disablePadding>
            <ListItemButton component={Link} href="/">
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>

          {/* Sets & Series Main btn */}
          <ListItem disablePadding>
            <ListItemButton onClick={handleMainToggle}>
              <ListItemText primary="Sets & Series" sx={{ fontWeight: "bold" }} />
              {expandedMain ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>

          {/* Sets & Series list */}
          <Collapse in={expandedMain} timeout="auto" unmountOnExit>
            {loading ? (
              <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress color="inherit" />
              </Box>
            ) : (
              <List component="div" disablePadding>
                {Object.entries(sets).map(([series, seriesSets]) => (
                  <div key={series}>
                    <ListItem disablePadding>
                      <ListItemButton onClick={() => handleSeriesToggle(series)} sx={{ pl: 2 }}>
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
                ))}
              </List>
            )}
          </Collapse>
        </List>
      </Box>
    </Drawer>
  );
}
