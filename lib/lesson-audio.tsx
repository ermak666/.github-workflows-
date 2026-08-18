import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";

import { lessonVoiceovers, type LessonVoiceoverId } from "@/lib/lesson-voiceovers";

type PlaybackState = "stopped" | "playing" | "paused";
type PlayerSubscription = { remove: () => void };

type LessonAudioValue = {
  activeLessonId: string | null;
  playbackState: PlaybackState;
  playLesson: (lessonId: LessonVoiceoverId) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
};

const LessonAudioContext = createContext<LessonAudioValue | null>(null);

export function LessonAudioProvider({ children }: { children: React.ReactNode }) {
  const playerRef = useRef<AudioPlayer | null>(null);
  const subscriptionRef = useRef<PlayerSubscription | null>(null);
  const operationRef = useRef(0);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>("stopped");

  const dispose = useCallback(() => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    playerRef.current?.remove();
    playerRef.current = null;
  }, []);

  const stop = useCallback(() => {
    operationRef.current += 1;
    dispose();
    setActiveLessonId(null);
    setPlaybackState("stopped");
  }, [dispose]);

  const playLesson = useCallback(async (lessonId: LessonVoiceoverId) => {
    const operation = operationRef.current + 1;
    operationRef.current = operation;
    dispose();
    setActiveLessonId(null);
    setPlaybackState("stopped");
    try {
      await setAudioModeAsync({ playsInSilentMode: true });
      if (operationRef.current !== operation) return;

      const player = createAudioPlayer(lessonVoiceovers[lessonId]);
      playerRef.current = player;
      subscriptionRef.current = player.addListener("playbackStatusUpdate", (status) => {
        if (status.didJustFinish && playerRef.current === player) stop();
      });
      setActiveLessonId(lessonId);
      setPlaybackState("playing");
      player.play();
    } catch {
      if (operationRef.current === operation) stop();
    }
  }, [dispose, stop]);

  const pause = useCallback(() => {
    if (!playerRef.current) return;
    playerRef.current.pause();
    setPlaybackState("paused");
  }, []);

  const resume = useCallback(() => {
    if (!playerRef.current) return;
    playerRef.current.play();
    setPlaybackState("playing");
  }, []);

  const value = useMemo(() => ({ activeLessonId, playbackState, playLesson, pause, resume, stop }), [activeLessonId, pause, playbackState, playLesson, resume, stop]);
  return <LessonAudioContext.Provider value={value}>{children}</LessonAudioContext.Provider>;
}

export function useLessonAudio() {
  const value = useContext(LessonAudioContext);
  if (value) return value;
  return {
    activeLessonId: null,
    playbackState: "stopped" as PlaybackState,
    playLesson: async () => {},
    pause: () => {},
    resume: () => {},
    stop: () => {},
  };
}
