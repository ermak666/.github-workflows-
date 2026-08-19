import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Appearance, View, useColorScheme as useSystemColorScheme } from "react-native";
import { colorScheme as nativewindColorScheme, vars } from "nativewind";

import { SchemeColors, type ColorScheme } from "@/constants/theme";
import { loadReadingPreferences, saveReadingPreferences } from "@/lib/reading-preferences";

type ThemeContextValue = {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  fontScale: number;
  setFontScale: (scale: number) => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  reduceMotion: boolean;
  setReduceMotion: (value: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme() ?? "light";
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(systemScheme);
  const [fontScale, setFontScaleState] = useState(1);
  const [highContrast, setHighContrastState] = useState(false);
  const [reduceMotion, setReduceMotionState] = useState(false);

  const applyScheme = useCallback((scheme: ColorScheme) => {
    nativewindColorScheme.set(scheme);
    Appearance.setColorScheme?.(scheme);
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.dataset.theme = scheme;
      root.classList.toggle("dark", scheme === "dark");
      const palette = SchemeColors[scheme];
      Object.entries(palette).forEach(([token, value]) => {
        root.style.setProperty(`--color-${token}`, value);
      });
    }
  }, []);

  const persist = useCallback((scheme: ColorScheme, scale: number, contrast = highContrast, reduced = reduceMotion) => {
    void saveReadingPreferences({ colorScheme: scheme, fontScale: scale, highContrast: contrast, reduceMotion: reduced });
  }, [highContrast, reduceMotion]);

  const setColorScheme = useCallback((scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    applyScheme(scheme);
    persist(scheme, fontScale);
  }, [applyScheme, fontScale, persist]);

  const setFontScale = useCallback((scale: number) => {
    setFontScaleState(scale);
    persist(colorScheme, scale);
  }, [colorScheme, persist]);

  const setHighContrast = useCallback((value: boolean) => {
    setHighContrastState(value);
    persist(colorScheme, fontScale, value);
  }, [colorScheme, fontScale, persist]);

  const setReduceMotion = useCallback((value: boolean) => {
    setReduceMotionState(value);
    persist(colorScheme, fontScale, highContrast, value);
  }, [colorScheme, fontScale, highContrast, persist]);

  useEffect(() => {
    loadReadingPreferences().then((preferences) => {
      setColorSchemeState(preferences.colorScheme);
      setFontScaleState(preferences.fontScale);
      setHighContrastState(preferences.highContrast);
      setReduceMotionState(preferences.reduceMotion);
      applyScheme(preferences.colorScheme);
    });
  }, [applyScheme]);

  useEffect(() => {
    applyScheme(colorScheme);
  }, [applyScheme, colorScheme]);

  const themeVariables = useMemo(
    () =>
      vars({
        "color-primary": highContrast ? (colorScheme === "dark" ? "#FFFFFF" : "#0000B8") : SchemeColors[colorScheme].primary,
        "color-background": highContrast ? (colorScheme === "dark" ? "#000000" : "#FFFFFF") : SchemeColors[colorScheme].background,
        "color-surface": highContrast ? (colorScheme === "dark" ? "#111111" : "#FFFFFF") : SchemeColors[colorScheme].surface,
        "color-foreground": highContrast ? (colorScheme === "dark" ? "#FFFFFF" : "#000000") : SchemeColors[colorScheme].foreground,
        "color-muted": highContrast ? (colorScheme === "dark" ? "#E5E5E5" : "#1A1A1A") : SchemeColors[colorScheme].muted,
        "color-border": highContrast ? (colorScheme === "dark" ? "#FFFFFF" : "#000000") : SchemeColors[colorScheme].border,
        "color-success": SchemeColors[colorScheme].success,
        "color-warning": SchemeColors[colorScheme].warning,
        "color-error": SchemeColors[colorScheme].error,
      }),
    [colorScheme, highContrast],
  );

  const value = useMemo(
    () => ({
      colorScheme,
      setColorScheme,
      fontScale,
      setFontScale,
      highContrast,
      setHighContrast,
      reduceMotion,
      setReduceMotion,
    }),
    [colorScheme, fontScale, highContrast, reduceMotion, setColorScheme, setFontScale, setHighContrast, setReduceMotion],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={[{ flex: 1 }, themeVariables]}>{children}</View>
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return ctx;
}
