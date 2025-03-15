"use client";

import { useEffect, useState } from "react";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

const createEmotionCache = () => createCache({ key: "mui", prepend: true });

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [cache, setCache] = useState(createEmotionCache);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCache(createEmotionCache()); 
    setMounted(true);
  }, []);

  if (!mounted) return <>{children}</>; 
  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
