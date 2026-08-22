import { useEffect } from "react";
import { Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useLessonAudio } from "@/lib/lesson-audio";

/**
 * Internal Android runtime smoke route. It is not linked from the UI.
 * The CI workflow opens this route through the registered deep link and
 * requires a real AudioPlayer to report both playing=true and duration>0.
 */
export default function AudioSmokeScreen() {
  const { playbackState, duration, audioError, playLesson } = useLessonAudio();

  useEffect(() => {
    void playLesson("senior-2");
  }, [playLesson]);

  useEffect(() => {
    console.log(`[audio-smoke] state=${playbackState} duration=${duration} error=${audioError ?? "none"}`);
    if (playbackState === "playing" && duration > 0) {
      console.log("[audio-smoke] PASS playing=true duration=positive");
    }
  }, [audioError, duration, playbackState]);

  return (
    <ScreenContainer className="items-center justify-center p-6">
      <View className="rounded-2xl bg-surface p-5">
        <Text className="text-foreground">Внутренняя проверка записанной озвучки.</Text>
      </View>
    </ScreenContainer>
  );
}
