import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { buildWeeklyReport, calculateStreak, clearCompletedLessons, loadActivityProgress, loadCompletedLessons, type ActivityProgress } from "@/lib/course-progress";
import { calculateGoalProgress, loadWeeklyGoal, type WeeklyGoal } from "@/lib/weekly-goal";
import { volumes } from "@/shared/course-data";

export default function ProgressScreen() {
  const router = useRouter();
  const [completed, setCompleted] = useState<string[]>([]);
  const [activity, setActivity] = useState<ActivityProgress>({ practiceSuccessIds: [], activeDays: [], completedLessonDates: {}, practiceSuccessDates: {}, quizResults: {} });
  const [goal, setGoal] = useState<WeeklyGoal>({ lessonTarget: 3 });
  useFocusEffect(useCallback(() => { loadCompletedLessons().then(setCompleted); loadActivityProgress().then(setActivity); loadWeeklyGoal().then(setGoal); }, []));
  const total = volumes.reduce((sum, volume) => sum + volume.lessons.length, 0);
  const progress = total ? Math.round((completed.length / total) * 100) : 0;
  const volumeProgress = useMemo(() => volumes.map((volume) => ({ volume, done: volume.lessons.filter((lesson) => completed.includes(lesson.id)).length })), [completed]);
  const streak = calculateStreak(activity.activeDays);
  const weeklyGoal = calculateGoalProgress(buildWeeklyReport(activity).lessons, goal.lessonTarget);

  return (
    <ScreenContainer className="px-5">
      <FlatList
        data={volumeProgress}
        keyExtractor={(item) => item.volume.id}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 36 }}
        ListHeaderComponent={<View className="mb-6"><View className="self-start rounded-full bg-[#E7E0FF] px-3 py-2"><Text className="text-xs font-bold tracking-widest text-primary">ЛИЧНЫЙ КАБИНЕТ</Text></View><Text className="mt-4 text-3xl font-bold text-foreground">Мой путь</Text><View className="mt-5 overflow-hidden rounded-[30px] border border-[#8D7BFF] bg-[#151A36] p-5 shadow-sm"><View className="absolute -right-7 -top-7 h-32 w-32 rounded-full bg-[#7056E8] opacity-50" /><Text className="text-sm font-bold tracking-widest text-[#C9C6FF]">ОБЩИЙ ПРОГРЕСС</Text><Text className="mt-2 text-5xl font-bold text-white">{progress}%</Text><Text className="mt-2 text-base text-[#E7E7FF]">Завершено уроков: {completed.length} из {total}</Text></View><View className="mt-4 flex-row gap-3"><View className="flex-1 rounded-3xl border border-border bg-surface p-4 shadow-sm"><Text className="text-2xl font-bold text-success">{activity.practiceSuccessIds.length}</Text><Text className="mt-1 text-sm text-muted">задач решено</Text></View><View className="flex-1 rounded-3xl border border-border bg-surface p-4 shadow-sm"><Text className="text-2xl font-bold text-primary">{streak}</Text><Text className="mt-1 text-sm text-muted">дней подряд</Text></View></View><Pressable onPress={() => router.push("/weekly-goal" as never)} style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] })} className="mt-4 overflow-hidden rounded-3xl border border-[#CFC5FF] bg-[#EDE9FF] p-5"><View className="flex-row items-center justify-between"><Text className="font-bold text-foreground">Недельная цель: {goal.lessonTarget} уроков</Text><Text className="rounded-full bg-primary px-3 py-1 font-bold text-white">Настроить</Text></View><View className="mt-4 h-2 overflow-hidden rounded-full bg-white"><View style={{ width: `${weeklyGoal.percent}%` }} className="h-full rounded-full bg-success" /></View><Text className="mt-2 text-sm text-[#42446F]">{weeklyGoal.reached ? "Цель достигнута — отличный темп!" : `Осталось уроков: ${weeklyGoal.remaining}`}</Text></Pressable><Pressable onPress={() => router.push("/weekly-report" as never)} style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] })} className="mt-4 flex-row items-center justify-between rounded-3xl border border-border bg-surface p-5 shadow-sm"><View><Text className="font-bold text-foreground">Еженедельный отчёт</Text><Text className="mt-1 text-sm text-muted">Наглядно: уроки и задачи за 7 дней</Text></View><View className="h-9 w-9 items-center justify-center rounded-full bg-[#E7E0FF]"><Text className="text-xl font-bold text-primary">›</Text></View></Pressable><Text className="mt-3 text-sm leading-5 text-muted">Дневная цель — один маленький шаг: урок или решённая задача.</Text></View>}
        ListFooterComponent={<Pressable onPress={() => Alert.alert("Сбросить прогресс?", "Все локальные отметки и результаты практики будут удалены только с этого устройства.", [{ text: "Отмена", style: "cancel" }, { text: "Сбросить", style: "destructive", onPress: async () => { await clearCompletedLessons(); setCompleted([]); setActivity({ practiceSuccessIds: [], activeDays: [], completedLessonDates: {}, practiceSuccessDates: {}, quizResults: {} }); } }])} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}><Text className="mt-3 text-center font-semibold text-error">Сбросить локальный прогресс</Text></Pressable>}
        renderItem={({ item }) => {
          const percent = Math.round((item.done / item.volume.lessons.length) * 100);
          return <View className="mb-4 rounded-3xl border border-border bg-surface p-5 shadow-sm"><View className="flex-row items-center justify-between"><Text className="text-lg font-bold text-foreground">{item.volume.title}</Text><View className="rounded-full bg-[#DFF6EC] px-3 py-1"><Text className="text-sm font-bold text-success">{percent}%</Text></View></View><Text className="mt-1 text-sm text-muted">{item.done} из {item.volume.lessons.length} уроков</Text><View className="mt-4 h-3 overflow-hidden rounded-full bg-[#E4DFF2]"><View style={{ width: `${percent}%` }} className="h-full rounded-full bg-success" /></View></View>;
        }}
      />
    </ScreenContainer>
  );
}
