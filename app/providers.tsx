"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

const pastelTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#6366F1", // Soft Indigo
      light: "#EEF2FF",
      dark: "#4338CA",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#14B8A6", // Pastel Teal
      light: "#F0FDFA",
      dark: "#0F766E",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1E293B",
      secondary: "#64748B",
    },
    success: {
      main: "#10B981",
      light: "#ECFDF5",
    },
    error: {
      main: "#F43F5E",
      light: "#FFF1F2",
    },
    warning: {
      main: "#F59E0B",
      light: "#FFFBEB",
    },
    info: {
      main: "#3B82F6",
      light: "#EFF6FF",
    },
    divider: "#E2E8F0",
  },
  typography: {
    fontFamily: [
      "Inter",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    h1: { fontWeight: 800, color: "#1E293B" },
    h2: { fontWeight: 800, color: "#1E293B" },
    h3: { fontWeight: 700, color: "#1E293B" },
    h4: { fontWeight: 700, color: "#1E293B" },
    h5: { fontWeight: 700, color: "#1E293B" },
    h6: { fontWeight: 600, color: "#1E293B" },
    subtitle1: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "10px",
          boxShadow: "none",
          padding: "8px 20px",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.15)",
          },
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          border: "1px solid #E2E8F0",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.04)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: "8px",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
          },
        },
      },
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider theme={pastelTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
