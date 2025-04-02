"use client";

import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

interface CardFilters {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function CardFilters({ value, onChange, disabled = false }: CardFilters) {
  const handleChange = (event: any) => {
    onChange(event.target.value);
  };

  return (
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
      <InputLabel id="sort-select-label">Sort By</InputLabel>
      <Select
        labelId="sort-select-label"
        id="sort-select"
        value={value}
        label="Sort By"
        onChange={handleChange}
        MenuProps={{
          PaperProps: {
            sx: {
              backgroundColor: "#2A2A2A",
              color: "white",
              "& .MuiMenuItem-root": {
                "&:hover": {
                  backgroundColor: "rgba(138, 63, 63, 0.15)",
                },
                "&.Mui-selected": {
                  backgroundColor: "rgba(138, 63, 63, 0.3)",
                  "&:hover": {
                    backgroundColor: "rgba(138, 63, 63, 0.4)",
                  }
                }
              }
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
        <MenuItem value="rarity">Rarity (Highest first)</MenuItem>
        <MenuItem value="hp-desc">HP (High to Low)</MenuItem>
      </Select>
    </FormControl>
  );
}