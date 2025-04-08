"use client";

import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Box, 
  Chip, 
  ToggleButton, 
  ToggleButtonGroup, 
  Typography,
  Divider
} from "@mui/material";
import { POKEMON_TYPES, TYPE_COLORS } from "@/app/lib/api";
import { 
  ArrowDownward, 
  ArrowUpward, 
  AttachMoney, 
  LocalFireDepartment, 
  SortByAlpha, 
  Tag 
} from "@mui/icons-material";
import { useState } from "react";

interface CardFilters {
  value: string;
  onChange: (value: string) => void;
  selectedType?: string;
  onTypeChange?: (type: string) => void;
  disabled?: boolean;
}

const SORT_OPTIONS = [
  { value: "number-asc", label: "Number", icon: <ArrowUpward fontSize="small" /> },
  { value: "number-desc", label: "Number", icon: <ArrowDownward fontSize="small" /> },
  { value: "name-asc", label: "Name", icon: <SortByAlpha fontSize="small" /> },
  { value: "name-desc", label: "Name", icon: <SortByAlpha fontSize="small" sx={{ transform: 'scaleY(-1)' }} /> },
  { value: "price-asc", label: "Price", icon: <AttachMoney fontSize="small" /> },
  { value: "price-desc", label: "Price", icon: <AttachMoney fontSize="small" sx={{ fontWeight: 'bold' }} /> },
  { value: "rarity-asc", label: "Rarity", icon: <Tag fontSize="small" /> },
  { value: "rarity-desc", label: "Rarity", icon: <Tag fontSize="small" sx={{ fontWeight: 'bold' }} /> }
];

export default function CardFilters({ 
  value, 
  onChange, 
  selectedType = "All Types", 
  onTypeChange,
  disabled = false 
}: CardFilters) {
  const isSortActive = (optionValue: string) => {
    return value === optionValue;
  };

  const handleSortChange = (newValue: string) => {
    onChange(newValue);
  };

  const getTypeColor = (type: string): string => {
    return TYPE_COLORS[type] || TYPE_COLORS["All Types"];
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => {
      setIsMobile(window.innerWidth < 768);
    });
  }

  return (
    <Box sx={{ mb: 4 }}>
      {/* Sort Controls */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
          Sort By
        </Typography>

        {isMobile ? (
          // Mobile View: Dropdown
          <FormControl 
            variant="outlined"
            size="small"
            fullWidth
            disabled={disabled}
            sx={{ 
              "& .MuiInputLabel-root": {
                color: "rgba(255, 255, 255, 0.7)",
              },
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.2)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(138, 63, 63, 0.5)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#8A3F3F",
                }
              },
              "& .MuiSelect-icon": {
                color: "rgba(255, 255, 255, 0.5)",
              }
            }}
          >
            <Select
              value={value}
              onChange={(e) => onChange(e.target.value)}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: "#2A2A2A",
                    color: "white",
                  }
                }
              }}
            >
              <MenuItem value="number-asc">Number (Low to High)</MenuItem>
              <MenuItem value="number-desc">Number (High to Low)</MenuItem>
              <MenuItem value="name-asc">Name (A to Z)</MenuItem>
              <MenuItem value="name-desc">Name (Z to A)</MenuItem>
              <MenuItem value="price-asc">Price (Low to High)</MenuItem>
              <MenuItem value="price-desc">Price (High to Low)</MenuItem>
              <MenuItem value="rarity-desc">Rarity (Highest First)</MenuItem>
              <MenuItem value="rarity-asc">Rarity (Lowest First)</MenuItem>
            </Select>
          </FormControl>
        ) : (
          // Desktop View: Horizontal buttons
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {SORT_OPTIONS.map((option) => (
              <ToggleButton
                key={option.value}
                value={option.value}
                selected={isSortActive(option.value)}
                onChange={() => handleSortChange(option.value)}
                size="small"
                sx={{
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  color: isSortActive(option.value) ? "white" : "rgba(255, 255, 255, 0.7)",
                  backgroundColor: isSortActive(option.value) ? "#8A3F3F" : "transparent",
                  "&:hover": {
                    backgroundColor: isSortActive(option.value) ? "#6E2F2F" : "rgba(138, 63, 63, 0.15)",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "#8A3F3F",
                    "&:hover": {
                      backgroundColor: "#6E2F2F",
                    }
                  }
                }}
                disabled={disabled}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {option.icon}
                  {option.label}
                </Box>
              </ToggleButton>
            ))}
          </Box>
        )}
      </Box>

      {/* Divider */}
      <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

      {/* Type Filters */}
      {onTypeChange && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
            Filter by Type
          </Typography>

          {isMobile ? (
            <FormControl 
              variant="outlined"
              size="small"
              fullWidth
              disabled={disabled}
              sx={{ 
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(138, 63, 63, 0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#8A3F3F",
                  }
                }
              }}
            >
              <Select
                value={selectedType}
                onChange={(e) => onTypeChange(e.target.value)}
                renderValue={(selected) => (
                  <Chip 
                    label={selected} 
                    size="small" 
                    sx={{ 
                      backgroundColor: getTypeColor(selected),
                      color: selected === "Darkness" ? "white" : "black",
                      fontWeight: "bold"
                    }} 
                  />
                )}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: "#2A2A2A",
                      color: "white",
                    }
                  }
                }}
              >
                {POKEMON_TYPES.map((type) => (
                  <MenuItem key={type} value={type} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip 
                      label={type} 
                      size="small" 
                      sx={{ 
                        backgroundColor: getTypeColor(type),
                        color: type === "Darkness" ? "white" : "black",
                        fontWeight: "bold",
                        mr: 1
                      }} 
                    />
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            // Desktop View: Horizontal type chips
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {POKEMON_TYPES.map((type) => (
                <Chip 
                  key={type}
                  label={type}
                  onClick={() => onTypeChange(type)}
                  color={type === selectedType ? "primary" : "default"}
                  sx={{
                    backgroundColor: type === selectedType ? getTypeColor(type) : 'rgba(255, 255, 255, 0.1)',
                    color: type === selectedType 
                      ? (type === "Darkness" ? "white" : "black") 
                      : "white",
                    fontWeight: type === selectedType ? "bold" : "normal",
                    border: type === selectedType ? '2px solid white' : 'none',
                    cursor: 'pointer',
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
          )}
        </Box>
      )}
    </Box>
  );
}