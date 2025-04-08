"use client";

import { useState, useEffect } from "react";
import { 
  Box, 
  Chip, 
  Button,
  IconButton,
  Typography,
  Divider,
  ButtonGroup,
  Slide,
  Paper
} from "@mui/material";
import { POKEMON_TYPES, TYPE_COLORS } from "@/app/lib/api";
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';

interface CardFilters {
  value: string;
  onChange: (value: string) => void;
  selectedType?: string;
  onTypeChange?: (type: string) => void;
  disabled?: boolean;
}

export default function CardFilters({ 
  value, 
  onChange, 
  selectedType = "All Types", 
  onTypeChange,
  disabled = false 
}: CardFilters) {

  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  
  useEffect(() => {
    if (!filterPanelOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.filter-panel') === null && 
          !target.classList.contains('filter-toggle-btn') &&
          !target.closest('.filter-toggle-btn')) {
        setFilterPanelOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [filterPanelOpen]);

  const getTypeColor = (type: string): string => {
    return TYPE_COLORS[type] || TYPE_COLORS["All Types"];
  };

  const sortOptions = [
    { value: "number-asc", label: "#↑", group: "number" },
    { value: "number-desc", label: "#↓", group: "number" },
    { value: "name-asc", label: "A→Z", group: "name" },
    { value: "name-desc", label: "Z→A", group: "name" },
    { value: "price-asc", label: "€↑", group: "price" },
    { value: "price-desc", label: "€↓", group: "price" },
    { value: "rarity-asc", label: "★↑", group: "rarity" },
    { value: "rarity-desc", label: "★↓", group: "rarity" }
  ];

  const sortGroups = {
    number: sortOptions.filter(opt => opt.group === "number"),
    name: sortOptions.filter(opt => opt.group === "name"),
    price: sortOptions.filter(opt => opt.group === "price"),
    rarity: sortOptions.filter(opt => opt.group === "rarity")
  };

  const activeFilterCount = selectedType !== "All Types" ? 1 : 0;

  return (
    <Box sx={{ position: 'relative', mb: 2 }}>
      {/* Filter toggle button with counter */}
      <Button
        className="filter-toggle-btn"
        startIcon={<FilterListIcon />}
        onClick={() => setFilterPanelOpen(!filterPanelOpen)}
        variant="outlined"
        size="small"
        sx={{
          borderColor: "rgba(255, 255, 255, 0.2)",
          color: activeFilterCount > 0 ? "white" : "rgba(255, 255, 255, 0.7)",
          backgroundColor: activeFilterCount > 0 ? "rgba(138, 63, 63, 0.3)" : "transparent",
          "&:hover": {
            backgroundColor: "rgba(138, 63, 63, 0.15)",
            borderColor: "rgba(138, 63, 63, 0.5)",
          },
          "& .MuiButton-startIcon": {
            marginRight: 0.5,
          }
        }}
        disabled={disabled}
      >
        Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
      </Button>

      {/* Custom overlay drawer  */}
      <Slide direction="right" in={filterPanelOpen} mountOnEnter unmountOnExit>
        <Paper
          className="filter-panel"
          sx={{
            position: 'fixed',
            left: 0,
            top: 0,
            height: '100vh',
            width: { xs: '250px', sm: '300px' },
            backgroundColor: '#1A1A1A',
            color: 'white',
            p: 2,
            overflowY: 'auto',
            boxShadow: '4px 0px 10px rgba(0, 0, 0, 0.3)',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            zIndex: 9999,
          }}
          elevation={24}
        >
          {/* Panel header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Filters</Typography>
            <IconButton 
              onClick={() => setFilterPanelOpen(false)}
              sx={{ color: 'white' }}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', mb: 3 }} />

          {/* Sort options section */}
          <Typography variant="subtitle1" gutterBottom>Sort By</Typography>
          
          {Object.entries(sortGroups).map(([groupName, options]) => (
            <Box key={groupName} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                {groupName.charAt(0).toUpperCase() + groupName.slice(1)}
              </Typography>
              
              <ButtonGroup size="small" fullWidth>
                {options.map((option) => (
                  <Button
                    key={option.value}
                    variant={value === option.value ? "contained" : "outlined"}
                    onClick={() => {
                      onChange(option.value);
                    }}
                    disabled={disabled}
                    sx={{
                      borderColor: "rgba(255, 255, 255, 0.2)",
                      color: value === option.value ? "white" : "rgba(255, 255, 255, 0.7)",
                      backgroundColor: value === option.value ? "#8A3F3F" : "transparent",
                      "&:hover": {
                        backgroundColor: value === option.value ? "#6E2F2F" : "rgba(138, 63, 63, 0.15)",
                      }
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
              </ButtonGroup>
            </Box>
          ))}

          <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', my: 2 }} />

          {/* Type filter section */}
          {onTypeChange && (
            <>
              <Typography variant="subtitle1" gutterBottom>Type</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {POKEMON_TYPES.map((type) => (
                  <Chip 
                    key={type}
                    label={type}
                    onClick={() => {
                      onTypeChange(type);
                    }}
                    color={type === selectedType ? "primary" : "default"}
                    sx={{
                      backgroundColor: type === selectedType ? getTypeColor(type) : 'rgba(255, 255, 255, 0.1)',
                      color: type === selectedType 
                        ? (type === "Darkness" ? "white" : "black") 
                        : "white",
                      fontWeight: type === selectedType ? "bold" : "normal",
                      border: type === selectedType ? '2px solid white' : 'none',
                      cursor: 'pointer',
                      mb: 1,
                      "&:hover": {
                        backgroundColor: type === selectedType 
                          ? getTypeColor(type) 
                          : 'rgba(255, 255, 255, 0.2)',
                      }
                    }}
                    disabled={disabled}
                  />
                ))}
              </Box>
            </>
          )}

          {/* Panel footer */}
          <Box sx={{ mt: 3 }}>
            <Button 
              variant="contained" 
              fullWidth
              onClick={() => setFilterPanelOpen(false)}
              sx={{
                backgroundColor: "#8A3F3F",
                "&:hover": {
                  backgroundColor: "#6E2F2F",
                }
              }}
            >
              Apply Filters
            </Button>
          </Box>
        </Paper>
      </Slide>
    </Box>
  );
}