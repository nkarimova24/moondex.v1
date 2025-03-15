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
import { fetchPokemonSets, PokemonSet } from "@/app/lib/api";

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

          <ListItem disablePadding>
            <ListItemButton onClick={handleMainToggle}>
              <ListItemText primary="Sets & Series" sx={{ fontWeight: "bold" }} />
              {expandedMain ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>

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
                          
                          {/* Routingssss to check latersssss*/}
                          <ListItemButton component={Link} href={`/pages/pokedex?setId=${set.id}`} sx={{ pl: 4 }}>
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
