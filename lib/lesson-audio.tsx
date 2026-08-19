import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";

import { lessonVoiceovers, type LessonVoiceoverId } from "@/lib/lesson-voiceovers";

type PlaybackState = "stopped" | "playing" | "paused";
type PlayerSubscription = { remove: () => void };

type LessonAudioValue = {
  activeLessonId: string | null;
  playbackState: PlaybackState;
  position: number;
  duration: number;
  playbackRate: number;
  playLesson: (lessonId: LessonVoiceoverId) => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setPlaybackRate: (rate: number) => void;
  seekBy: (seconds: number) => void;
};

const LessonAudioContext = createContext<LessonAudioValue | null>(null);

export function LessonAudioProvider({ children }: { children: React.ReactNode }) {
  const playerRef = useRef<AudioPlayer | null>(null);
  const subscriptionRef = useRef<PlayerSubscription | null>(null);
  const operationRef = useRef(0);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>("stopped");
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState(1);

  const dispose = useCallback(() => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
    playerRef.current?.remove();
    playerRef.current = null;
    setPosition(0);
    setDuration(0);
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
      player.playbackRate = playbackRate;
      playerRef.current = player;
      subscriptionRef.current = player.addListener("playbackStatusUpdate", (status) => {
        setPosition(status.currentTime ?? 0);
        setDuration(status.duration ?? 0);
        if (status.didJustFinish && playerRef.current === player) stop();
      });
      setActiveLessonId(lessonId);
      setPlaybackState("playing");
      player.play();
    } catch {
      if (operationRef.current === operation) stop();
    }
  }, [dispose, playbackRate, stop]);

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

  const setPlaybackRate = useCallback((rate: number) => {
    const normalized = [0.8, 1, 1.2].includes(rate) ? rate : 1;
    setPlaybackRateState(normalized);
    if (playerRef.current) playerRef.current.playbackRate = normalized;
  }, []);

  const seekBy = useCallback((seconds: number) => {
    const player = playerRef.current;
    if (!player) return;
    const next = Math.max(0, Math.min(duration || Math.max(position + seconds, 0), position + seconds));
    player.seekTo(next);
    setPosition(next);
  }, [duration, position]);

  const value = useMemo(() => ({ activeLessonId, playbackState, position, duration, playbackRate, playLesson, pause, resume, stop, setPlaybackRate, seekBy }), [activeLessonId, duration, pause, playbackRate, playbackState, playLesson, position, resume, seekBy, setPlaybackRate, stop]);
  return <LessonAudioContext.Provider value={value}>{children}</LessonAudioContext.Provider>;
}

export function useLessonAudio() {
  const value = useContext(LessonAudioContext);
  if (value) return value;
  return {
    activeLessonId: null,
    playbackState: "stopped" as PlaybackState,
    position: 0,
    duration: 0,
    playbackRate: 1,
    playLesson: async () => {},
    pause: () => {},
    resume: () => {},
    stop: () => {},
    setPlaybackRate: () => {},
    seekBy: () => {},
  };
}
