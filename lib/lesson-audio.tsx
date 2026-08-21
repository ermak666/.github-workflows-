import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import { createAudioPlayer, setAudioModeAsync, setIsAudioActiveAsync, type AudioPlayer } from "expo-audio";

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

const PLAYBACK_ERROR_MESSAGE = "Не удалось подготовить запись урока. Проверьте громкость медиа на устройстве и повторите попытку.";

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
    const subscription = subscriptionRef.current;
    subscriptionRef.current = null;
    const player = playerRef.current;
    playerRef.current = null;

    try {
      subscription?.remove();
    } catch (error) {
      console.warn("[lesson-audio] Could not remove the playback listener", error);
    }

    try {
      player?.remove();
    } catch (error) {
      console.warn("[lesson-audio] Could not remove the audio player", error);
    }

    setPosition(0);
    setDuration(0);
  }, []);

  useEffect(() => {
    return () => {
      operationRef.current += 1;
      dispose();
    };
  }, [dispose]);

  const stop = useCallback(() => {
    operationRef.current += 1;
    dispose();
    setActiveLessonId(null);
    setPlaybackState("stopped");
  }, [dispose]);

  const playLesson = useCallback(async (lessonId: LessonVoiceoverId) => {
    const source = lessonVoiceovers[lessonId];
    if (!source) {
      Alert.alert("Озвучка недоступна", PLAYBACK_ERROR_MESSAGE);
      return;
    }

    const operation = operationRef.current + 1;
    operationRef.current = operation;
    dispose();
    setActiveLessonId(null);
    setPlaybackState("stopped");

    try {
      await setIsAudioActiveAsync(true);
      await setAudioModeAsync({
        playsInSilentMode: true,
        interruptionModeAndroid: "duckOthers",
        interruptionMode: "mixWithOthers",
      });
      if (operationRef.current !== operation) return;

      const player = createAudioPlayer(source, { downloadFirst: true, updateInterval: 250 });
      player.volume = 1;
      player.playbackRate = playbackRate;
      playerRef.current = player;
      subscriptionRef.current = player.addListener("playbackStatusUpdate", (status) => {
        if (playerRef.current !== player) return;
        setPosition(status.currentTime ?? 0);
        setDuration(status.duration ?? 0);
        if (status.didJustFinish) stop();
      });

      setActiveLessonId(lessonId);
      setPlaybackState("playing");
      player.play();
    } catch (error) {
      console.warn("[lesson-audio] Playback initialization failed", error);
      if (operationRef.current === operation) {
        stop();
        Alert.alert("Озвучка недоступна", PLAYBACK_ERROR_MESSAGE);
      }
    }
  }, [dispose, playbackRate, stop]);

  const pause = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    try {
      player.pause();
      setPlaybackState("paused");
    } catch (error) {
      console.warn("[lesson-audio] Pause failed", error);
      stop();
    }
  }, [stop]);

  const resume = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    try {
      player.play();
      setPlaybackState("playing");
    } catch (error) {
      console.warn("[lesson-audio] Resume failed", error);
      stop();
    }
  }, [stop]);

  const setPlaybackRate = useCallback((rate: number) => {
    const normalized = [0.8, 1, 1.2].includes(rate) ? rate : 1;
    setPlaybackRateState(normalized);
    if (playerRef.current) playerRef.current.playbackRate = normalized;
  }, []);

  const seekBy = useCallback((seconds: number) => {
    const player = playerRef.current;
    if (!player) return;
    const next = Math.max(0, Math.min(duration || Math.max(position + seconds, 0), position + seconds));
    void player.seekTo(next).then(() => setPosition(next)).catch((error) => {
      console.warn("[lesson-audio] Seek failed", error);
    });
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
