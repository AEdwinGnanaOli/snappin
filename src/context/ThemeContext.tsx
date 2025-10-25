// src/theme/ThemeProvider.tsx
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
} from "react";
import {
  createTheme,
  ThemeProvider as MUIThemeProvider,
  Theme,
} from "@mui/material";
import { themePresets, ThemeColors, ThemeName } from "../utils/themePresets";
import { lightenColor, darkenColor } from "../utils/colorUtils";

interface ThemeContextType {
  currentTheme: ThemeName | "custom";
  themeColors: ThemeColors;
  setTheme: (theme: ThemeName) => void;
  setCustomColors: (colors: ThemeColors) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context)
    throw new Error("useThemeContext must be used within ThemeProvider");
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeName | "custom">(
    "purple"
  );
  const [customColors, setCustomColors] = useState<ThemeColors | null>(null);

  const themeColors = customColors || themePresets[currentTheme];

  const theme: Theme = useMemo(() => {
    const isDark = themeColors.background === "#1a1a1a";

    return createTheme({
      palette: {
        mode: isDark ? "dark" : "light",
        primary: {
          main: themeColors.primary,
          light: lightenColor(themeColors.primary, 20),
          dark: darkenColor(themeColors.primary, 20),
        },
        secondary: { main: themeColors.secondary },
        background: {
          default: themeColors.background,
          paper: themeColors.paper,
        },
        divider: themeColors.border,
      },
      typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      },
    });
  }, [themeColors]);

  const setTheme = (themeName: ThemeName) => {
    setCustomColors(null);
    setCurrentTheme(themeName);
    localStorage.setItem("chatTheme", themeName);
  };

  const handleSetCustomColors = (colors: ThemeColors) => {
    setCustomColors(colors);
    setCurrentTheme("custom");
    localStorage.setItem("chatThemeCustom", JSON.stringify(colors));
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themeColors,
        setTheme,
        setCustomColors: handleSetCustomColors,
      }}
    >
      <MUIThemeProvider theme={theme}>{children}</MUIThemeProvider>
    </ThemeContext.Provider>
  );
};
