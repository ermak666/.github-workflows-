import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { calculateStreak, clearCompletedLessons, loadActivityProgress, loadCompletedLessons, type ActivityProgress } from "@/lib/course-progress";
import { volumes } from "@/shared/course-data";

export default function ProgressScreen() {
  const router = useRouter();
  const [completed, setCompleted] = useState<string[]>([]);
  const [activity, setActivity] = useState<ActivityProgress>({ practiceSuccessIds: [], activeDays: [], completedLessonDates: {}, practiceSuccessDates: {} });
  useFocusEffect(useCallback(() => { loadCompletedLessons().then(setCompleted); loadActivityProgress().then(setActivity); }, []));
  const total = volumes.reduce((sum, volume) => sum + volume.lessons.length, 0);
  const progress = total ? Math.round((completed.length / total) * 100) : 0;
  const volumeProgress = useMemo(() => volumes.map((volume) => ({ volume, done: volume.lessons.filter((lesson) => completed.includes(lesson.id)).length })), [completed]);
  const streak = calculateStreak(activity.activeDays);

  return (
    <ScreenContainer className="px-5">
      <FlatList
        data={volumeProgress}
        keyExtractor={(item) => item.volume.id}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 36 }}
        ListHeaderComponent={<View className="mb-6"><Text className="text-3xl font-bold text-foreground">Мой путь</Text><View className="mt-5 rounded-3xl bg-primary p-5"><Text className="text-sm font-semibold text-[#D8D8FF]">ОБЩИЙ ПРОГРЕСС</Text><Text className="mt-1 text-5xl font-bold text-white">{progress}%</Text><Text className="mt-2 text-base text-[#E7E7FF]">Завершено уроков: {completed.length} из {total}</Text></View><View className="mt-4 flex-row gap-3"><View className="flex-1 rounded-2xl bg-surface p-4"><Text className="text-2xl font-bold text-success">{activity.practiceSuccessIds.length}</Text><Text className="mt-1 text-sm text-muted">задач решено</Text></View><View className="flex-1 rounded-2xl bg-surface p-4"><Text className="text-2xl font-bold text-primary">{streak}</Text><Text className="mt-1 text-sm text-muted">дней подряд</Text></View></View><Pressable onPress={() => router.push("/weekly-report" as never)} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })} className="mt-4 flex-row items-center justify-between rounded-2xl border border-border bg-surface p-4"><View><Text className="font-bold text-foreground">Еженедельный отчёт</Text><Text className="mt-1 text-sm text-muted">Наглядно: уроки и задачи за 7 дней</Text></View><Text className="text-xl font-bold text-primary">›</Text></Pressable><Text className="mt-3 text-sm leading-5 text-muted">Дневная цель — один маленький шаг: урок или решённая задача.</Text></View>}
        ListFooterComponent={<Pressable onPress={() => Alert.alert("Сбросить прогресс?", "Все локальные отметки и результаты практики будут удалены только с этого устройства.", [{ text: "Отмена", style: "cancel" }, { text: "Сбросить", style: "destructive", onPress: async () => { await clearCompletedLessons(); setCompleted([]); setActivity({ practiceSuccessIds: [], activeDays: [], completedLessonDates: {}, practiceSuccessDates: {} }); } }])} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}><Text className="mt-3 text-center font-semibold text-error">Сбросить локальный прогресс</Text></Pressable>}
        renderItem={({ item }) => {
          const percent = Math.round((item.done / item.volume.lessons.length) * 100);
          return <View className="mb-4 rounded-3xl border border-border bg-surface p-5"><Text className="text-lg font-bold text-foreground">{item.volume.title}</Text><Text className="mt-1 text-sm text-muted">{item.done} из {item.volume.lessons.length} уроков</Text><View className="mt-4 h-3 overflow-hidden rounded-full bg-[#E9EAF2]"><View style={{ width: `${percent}%` }} className="h-full rounded-full bg-success" /></View><Text className="mt-2 text-sm font-semibold text-success">{percent}%</Text></View>;
        }}
      />
    </ScreenContainer>
  );
}
