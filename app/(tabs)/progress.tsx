import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { clearCompletedLessons, loadCompletedLessons } from "@/lib/course-progress";
import { volumes } from "@/shared/course-data";

export default function ProgressScreen() {
  const [completed, setCompleted] = useState<string[]>([]);
  useFocusEffect(useCallback(() => { loadCompletedLessons().then(setCompleted); }, []));
  const total = volumes.reduce((sum, volume) => sum + volume.lessons.length, 0);
  const progress = total ? Math.round((completed.length / total) * 100) : 0;
  const volumeProgress = useMemo(() => volumes.map((volume) => ({ volume, done: volume.lessons.filter((lesson) => completed.includes(lesson.id)).length })), [completed]);

  return (
    <ScreenContainer className="px-5">
      <FlatList
        data={volumeProgress}
        keyExtractor={(item) => item.volume.id}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 36 }}
        ListHeaderComponent={<View className="mb-6"><Text className="text-3xl font-bold text-foreground">Мой путь</Text><View className="mt-5 rounded-3xl bg-primary p-5"><Text className="text-sm font-semibold text-[#D8D8FF]">ОБЩИЙ ПРОГРЕСС</Text><Text className="mt-1 text-5xl font-bold text-white">{progress}%</Text><Text className="mt-2 text-base text-[#E7E7FF]">Завершено уроков: {completed.length} из {total}</Text></View></View>}
        ListFooterComponent={<Pressable onPress={() => Alert.alert("Сбросить прогресс?", "Все локальные отметки будут удалены только с этого устройства.", [{ text: "Отмена", style: "cancel" }, { text: "Сбросить", style: "destructive", onPress: async () => { await clearCompletedLessons(); setCompleted([]); } }])} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}><Text className="mt-3 text-center font-semibold text-error">Сбросить локальный прогресс</Text></Pressable>}
        renderItem={({ item }) => {
          const percent = Math.round((item.done / item.volume.lessons.length) * 100);
          return <View className="mb-4 rounded-3xl border border-border bg-surface p-5"><Text className="text-lg font-bold text-foreground">{item.volume.title}</Text><Text className="mt-1 text-sm text-muted">{item.done} из {item.volume.lessons.length} уроков</Text><View className="mt-4 h-3 overflow-hidden rounded-full bg-[#E9EAF2]"><View style={{ width: `${percent}%` }} className="h-full rounded-full bg-success" /></View><Text className="mt-2 text-sm font-semibold text-success">{percent}%</Text></View>;
        }}
      />
    </ScreenContainer>
  );
}
