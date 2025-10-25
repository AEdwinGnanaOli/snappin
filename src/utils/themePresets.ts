// src/theme/themePresets.ts
export const themePresets = {
  purple: {
    name: "Purple",
    primary: "#6C5CE7",
    secondary: "#A29BFE",
    background: "#F5F7FB",
    paper: "#FFFFFF",
    border: "rgba(0, 0, 0, 0.12)",
  },
  blue: {
    name: "Blue",
    primary: "#3498db",
    secondary: "#74b9ff",
    background: "#F0F8FF",
    paper: "#FFFFFF",
    border: "rgba(52, 152, 219, 0.2)",
  },
  dark: {
    name: "Dark",
    primary: "#6C5CE7",
    secondary: "#A29BFE",
    background: "#1a1a1a",
    paper: "#2d2d2d",
    border: "rgba(255, 255, 255, 0.12)",
  },
} as const;

export type ThemeName = keyof typeof themePresets;

export interface ThemeColors {
  name: string;
  primary: string;
  secondary: string;
  background: string;
  paper: string;
  border: string;
}
