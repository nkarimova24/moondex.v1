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
  const [mounted, setMounted] = useState(false);
  
  const [cache] = useState(() => {

    return typeof window !== 'undefined' ? createEmotionCache() : null;
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !cache) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}