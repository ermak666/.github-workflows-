import AsyncStorage from "@react-native-async-storage/async-storage";

import type { ColorScheme } from "@/constants/theme";

const KEY = "python-bez-straha.reading-preferences.v1";

export type ReadingPreferences = {
  colorScheme: ColorScheme;
  fontScale: number;
  highContrast: boolean;
};

export const defaultReadingPreferences: ReadingPreferences = {
  colorScheme: "light",
  fontScale: 1,
  highContrast: false,
};

export async function loadReadingPreferences(): Promise<ReadingPreferences> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return defaultReadingPreferences;
  try {
    const parsed = JSON.parse(raw) as Partial<ReadingPreferences>;
    return {
      colorScheme: parsed.colorScheme === "dark" ? "dark" : "light",
      fontScale: [0.9, 1, 1.15].includes(parsed.fontScale ?? 1) ? parsed.fontScale ?? 1 : 1,
      highContrast: parsed.highContrast === true,
    };
  } catch {
    return defaultReadingPreferences;
  }
}

export async function saveReadingPreferences(value: ReadingPreferences) {
  await AsyncStorage.setItem(KEY, JSON.stringify(value));
}
