export type ThemeId = "classic" | "dark" | "neon" | "mono";

export type Theme = {
  id: ThemeId;
  name: string;
  whiteKey: string;
  blackKey: string;
  keyBorder: string;
  accent: string;
  labelBg: string;
  labelText: string;
};

export const THEMES: Record<ThemeId, Theme> = {
  classic: {
    id: "classic",
    name: "Classic",
    whiteKey: "#ffffff",
    blackKey: "#111111",
    keyBorder: "#000000",
    accent: "#4dd0e1",
    labelBg: "#000000",
    labelText: "#ffffff",
  },
  dark: {
    id: "dark",
    name: "Dark",
    whiteKey: "#2a2a2a",
    blackKey: "#0a0a0a",
    keyBorder: "#000000",
    accent: "#4dd0e1",
    labelBg: "#ffffff",
    labelText: "#000000",
  },
  neon: {
    id: "neon",
    name: "Neon",
    whiteKey: "#0f0f14",
    blackKey: "#000000",
    keyBorder: "#1a1a24",
    accent: "#a855f7",
    labelBg: "#000000",
    labelText: "#a855f7",
  },
  mono: {
    id: "mono",
    name: "Mono",
    whiteKey: "#ffffff",
    blackKey: "#000000",
    keyBorder: "#000000",
    accent: "#f59e0b",
    labelBg: "#000000",
    labelText: "#ffffff",
  },
};

export const THEME_LIST: Theme[] = Object.values(THEMES);
