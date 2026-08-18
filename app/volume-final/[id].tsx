import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { BackButton } from "@/components/back-button";
import { CodeCard } from "@/components/code-card";
import { ScreenContainer } from "@/components/screen-container";
import { loadActivityProgress, loadCompletedLessons, recordVolumeFinalSuccess } from "@/lib/course-progress";
import { useColors } from "@/hooks/use-colors";
import { getNextVolume, getVolume, isVolumeComplete } from "@/shared/course-data";
import { getVolumeFinalTask } from "@/shared/volume-final-tasks";

export default function VolumeFinalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const volume = getVolume(id);
  const task = getVolumeFinalTask(id);
  const nextVolume = getNextVolume(id);
  const [completed, setCompleted] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [alreadyPassed, setAlreadyPassed] = useState(false);

  useFocusEffect(useCallback(() => {
    loadCompletedLessons().then(setCompleted);
    loadActivityProgress().then((activity) => setAlreadyPassed(Boolean(activity.volumeFinals?.[id ?? ""])));
    setSelectedOption(null);
  }, [id]));

  if (!volume || !task) return <ScreenContainer className="items-center justify-center p-6"><Text className="text-foreground">Итоговое задание не найдено.</Text></ScreenContainer>;

  const lessonsFinished = isVolumeComplete(volume, completed);
  const passed = alreadyPassed || selectedOption === task.correctIndex;
  const finishTask = async (optionIndex: number) => {
    setSelectedOption(optionIndex);
    if (optionIndex === task.correctIndex) {
      await recordVolumeFinalSuccess(volume.id);
      setAlreadyPassed(true);
    }
  };

  return (
    <ScreenContainer className="px-5">
      <ScrollView contentContainerStyle={{ paddingBottom: 42 }} showsVerticalScrollIndicator={false}>
        <BackButton label="К содержанию" onPress={() => router.replace(`/volume/${volume.id}` as never)} />
        <View className="mt-3 overflow-hidden rounded-[30px] border border-[#354062] bg-[#151A36] p-5">
          <View className="absolute -right-9 -top-10 h-36 w-36 rounded-full bg-[#7056E8] opacity-45" />
          <Text className="text-xs font-bold tracking-widest text-[#C9C6FF]">{task.label.toUpperCase()}</Text>
          <Text className="mt-3 text-3xl font-bold leading-10 text-white">{task.title}</Text>
          <Text className="mt-3 text-base leading-6 text-[#D8DDEA]">Закончи маленькую проверку — и откроется следующий большой шаг.</Text>
        </View>

        {!lessonsFinished ? <View className="mt-5 rounded-3xl border border-border bg-surface p-5"><Text className="text-lg font-bold text-foreground">Сначала закончи уроки тома</Text><Text className="mt-2 text-sm leading-5 text-muted">Отметь все {volume.lessons.length} уроков как пройденные. Тогда эта итоговая мини-задача станет доступна.</Text><Pressable accessibilityRole="button" onPress={() => router.replace(`/volume/${volume.id}` as never)} style={({ pressed }) => ({ marginTop: 16, alignItems: "center", borderRadius: 16, backgroundColor: colors.primary, paddingVertical: 14, opacity: pressed ? 0.8 : 1 })}><Text className="font-bold text-white">Вернуться к урокам</Text></Pressable></View> : <View className="mt-5"><Text className="text-lg font-bold text-foreground">Задание</Text><Text className="mt-2 text-base leading-6 text-foreground">{task.prompt}</Text><View className="mt-4"><CodeCard code={task.code} /></View><View className="mt-5 gap-2">{task.options.map((option, index) => { const answered = selectedOption !== null; const correct = index === task.correctIndex; const selected = index === selectedOption; const backgroundColor = answered && correct ? colors.success : answered && selected ? colors.error : colors.surface; const borderColor = answered && correct ? colors.success : answered && selected ? colors.error : colors.border; return <Pressable key={option} accessibilityRole="button" disabled={passed || answered} onPress={() => finishTask(index)} style={({ pressed }) => ({ borderWidth: 1, borderColor, backgroundColor, borderRadius: 16, padding: 16, opacity: pressed ? 0.78 : 1 })}><Text className="font-semibold text-foreground">{option}</Text></Pressable>; })}</View>{selectedOption !== null && !passed ? <Text className="mt-4 text-sm leading-5 text-error">Пока не совпало. {task.explanation} Выберите другой вариант.</Text> : null}{passed ? <View className="mt-5 rounded-3xl border border-success bg-surface p-5"><Text className="text-lg font-bold text-success">✓ Том завершён</Text><Text className="mt-2 text-sm leading-5 text-foreground">{task.explanation}</Text><Pressable accessibilityRole="button" onPress={() => router.replace((nextVolume ? `/volume/${nextVolume.id}` : "/") as never)} style={({ pressed }) => ({ marginTop: 16, alignItems: "center", borderRadius: 16, backgroundColor: colors.primary, paddingVertical: 14, opacity: pressed ? 0.8 : 1 })}><Text className="font-bold text-white">{nextVolume ? `Открыть ${nextVolume.title}` : "Вернуться на главную"}</Text></Pressable></View> : null}</View>}
      </ScrollView>
    </ScreenContainer>
  );
}
