// src/theme/themePresets.ts
export const themePresets = {
  purple: {
    name: "Purple Dream",
    primary: "#6C5CE7",
    secondary: "#A29BFE",
    accent: "#FF6B9D",
    background: "#FAFBFF",
    paper: "#FFFFFF",
    border: "rgba(0, 0, 0, 0.12)",
    gradient: "linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)",
    messageBubble: {
      own: "#0084FF",
      other: "#00D9A3",
      otherGradient: "linear-gradient(135deg, #00D9A3 0%, #00B894 100%)",
    },
  },
  whatsapp: {
    name: "WhatsApp Green",
    primary: "#25D366",
    secondary: "#128C7E",
    accent: "#34B7F1",
    background: "#F0F2F5",
    paper: "#FFFFFF",
    border: "rgba(0, 0, 0, 0.08)",
    gradient: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
    messageBubble: {
      own: "#DCF8C6",
      other: "#FFFFFF",
      otherGradient: "#FFFFFF",
    },
  },
  telegram: {
    name: "Telegram Blue",
    primary: "#0088CC",
    secondary: "#64B5F6",
    accent: "#FF8A65",
    background: "#E8F4F8",
    paper: "#FFFFFF",
    border: "rgba(0, 136, 204, 0.15)",
    gradient: "linear-gradient(135deg, #0088CC 0%, #64B5F6 100%)",
    messageBubble: {
      own: "#E3F2FD",
      other: "#0088CC",
      otherGradient: "linear-gradient(135deg, #0088CC 0%, #0099E5 100%)",
    },
  },
  discord: {
    name: "Discord Blurple",
    primary: "#5865F2",
    secondary: "#7289DA",
    accent: "#EB459E",
    background: "#F2F3F5",
    paper: "#FFFFFF",
    border: "rgba(88, 101, 242, 0.15)",
    gradient: "linear-gradient(135deg, #5865F2 0%, #7289DA 100%)",
    messageBubble: {
      own: "#E8E9F7",
      other: "#5865F2",
      otherGradient: "linear-gradient(135deg, #5865F2 0%, #6B76F4 100%)",
    },
  },
  sunset: {
    name: "Sunset Orange",
    primary: "#FF6B6B",
    secondary: "#FFA07A",
    accent: "#FFD93D",
    background: "#FFF8F0",
    paper: "#FFFFFF",
    border: "rgba(255, 107, 107, 0.15)",
    gradient: "linear-gradient(135deg, #FF6B6B 0%, #FFA07A 100%)",
    messageBubble: {
      own: "#FFE8E8",
      other: "#FF6B6B",
      otherGradient: "linear-gradient(135deg, #FF6B6B 0%, #FF8585 100%)",
    },
  },
  ocean: {
    name: "Ocean Blue",
    primary: "#0EA5E9",
    secondary: "#38BDF8",
    accent: "#22D3EE",
    background: "#F0F9FF",
    paper: "#FFFFFF",
    border: "rgba(14, 165, 233, 0.15)",
    gradient: "linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)",
    messageBubble: {
      own: "#E0F2FE",
      other: "#0EA5E9",
      otherGradient: "linear-gradient(135deg, #0EA5E9 0%, #0BB5F0 100%)",
    },
  },
  rose: {
    name: "Rose Pink",
    primary: "#EC4899",
    secondary: "#F472B6",
    accent: "#FB7185",
    background: "#FFF1F2",
    paper: "#FFFFFF",
    border: "rgba(236, 72, 153, 0.15)",
    gradient: "linear-gradient(135deg, #EC4899 0%, #F472B6 100%)",
    messageBubble: {
      own: "#FCE7F3",
      other: "#EC4899",
      otherGradient: "linear-gradient(135deg, #EC4899 0%, #EE5BA3 100%)",
    },
  },
  forest: {
    name: "Forest Green",
    primary: "#10B981",
    secondary: "#34D399",
    accent: "#6EE7B7",
    background: "#F0FDF4",
    paper: "#FFFFFF",
    border: "rgba(16, 185, 129, 0.15)",
    gradient: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
    messageBubble: {
      own: "#D1FAE5",
      other: "#10B981",
      otherGradient: "linear-gradient(135deg, #10B981 0%, #14C98E 100%)",
    },
  },
  dark: {
    name: "Dark Mode",
    primary: "#6C5CE7",
    secondary: "#A29BFE",
    accent: "#FF6B9D",
    background: "#1a1a1a",
    paper: "#2d2d2d",
    border: "rgba(255, 255, 255, 0.12)",
    gradient: "linear-gradient(135deg, #6C5CE7 0%, #A29BFE 100%)",
    messageBubble: {
      own: "#3a3a3a",
      other: "#6C5CE7",
      otherGradient: "linear-gradient(135deg, #6C5CE7 0%, #7B6EE8 100%)",
    },
  },
  midnight: {
    name: "Midnight Blue",
    primary: "#3B82F6",
    secondary: "#60A5FA",
    accent: "#818CF8",
    background: "#0F172A",
    paper: "#1E293B",
    border: "rgba(59, 130, 246, 0.2)",
    gradient: "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)",
    messageBubble: {
      own: "#334155",
      other: "#3B82F6",
      otherGradient: "linear-gradient(135deg, #3B82F6 0%, #4F8FF7 100%)",
    },
  },
} as const;

export type ThemeName = keyof typeof themePresets;

export interface ThemeColors {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  paper: string;
  border: string;
  gradient: string;
  messageBubble: {
    own: string;
    other: string;
    otherGradient: string;
  };
}
