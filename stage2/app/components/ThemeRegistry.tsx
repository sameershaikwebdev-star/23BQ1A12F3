"use client";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { ReactNode, useState } from "react";
import createCache from "@emotion/cache";
import { useServerInsertedHTML } from "next/navigation";
import { CacheProvider } from "@emotion/react";

function NextAppDirEmotionCacheProvider({ children }: { children: ReactNode }) {
  const [{ cache, flush }] = useState(() => {
    const cache = createCache({ key: "css" });
    cache.compat = true;
    const prevInsert = cache.insert.bind(cache);
    let inserted: string[] = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const flush = () => { const p = inserted; inserted = []; return p; };
    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) return null;
    let styles = "";
    for (const name of names) styles += cache.inserted[name];
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(" ")}`}
        dangerouslySetInnerHTML={{ __html: styles }}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
}

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#6c8eff" },
    secondary: { main: "#ff6b8a" },
    background: { default: "#0f1117", paper: "#1a1d27" },
    success: { main: "#4caf88" },
    warning: { main: "#ffb347" },
    error: { main: "#ff6b8a" },
  },
  typography: { fontFamily: "'Roboto', sans-serif" },
  shape: { borderRadius: 12 },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none", border: "1px solid rgba(255,255,255,0.06)" } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600, fontSize: "0.72rem" } } },
    MuiTab: { styleOverrides: { root: { textTransform: "none", fontWeight: 500 } } },
  },
});

export default function ThemeRegistry({ children }: { children: ReactNode }) {
  return (
    <NextAppDirEmotionCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </NextAppDirEmotionCacheProvider>
  );
}
