import { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { Platform } from "react-native";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";

type SoundFeedbackValue = { playTap: () => void; playSuccess: () => void; playAchievement: () => void };
const SoundFeedbackContext = createContext<SoundFeedbackValue | null>(null);

export function SoundFeedbackProvider({ children }: { children: React.ReactNode }) {
  const tap = useAudioPlayer(require("../assets/sounds/tap.wav"));
  const success = useAudioPlayer(require("../assets/sounds/success.wav"));
  const achievement = useAudioPlayer(require("../assets/sounds/achievement.wav"));
  useEffect(() => { if (Platform.OS !== "web") void setAudioModeAsync({ playsInSilentMode: false }); }, []);
  const replay = useCallback((player: typeof tap) => { if (Platform.OS === "web") return; try { player.seekTo(0); player.play(); } catch { /* Sound feedback must never block learning. */ } }, []);
  const value = useMemo(() => ({ playTap: () => replay(tap), playSuccess: () => replay(success), playAchievement: () => replay(achievement) }), [achievement, replay, success, tap]);
  return <SoundFeedbackContext.Provider value={value}>{children}</SoundFeedbackContext.Provider>;
}

export function useSoundFeedback() {
  const value = useContext(SoundFeedbackContext);
  if (!value) return { playTap: () => {}, playSuccess: () => {}, playAchievement: () => {} };
  return value;
}
