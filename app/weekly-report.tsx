import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { buildWeekComparison, buildWeeklyReport, loadActivityProgress, type ActivityProgress } from "@/lib/course-progress";
import { calculateGoalProgress, loadWeeklyGoal, type WeeklyGoal } from "@/lib/weekly-goal";

const emptyActivity: ActivityProgress = { practiceSuccessIds: [], activeDays: [], completedLessonDates: {}, practiceSuccessDates: {}, quizResults: {} };

export default function WeeklyReportScreen() {
  const router = useRouter();
  const [activity, setActivity] = useState<ActivityProgress>(emptyActivity);
  const [goal, setGoal] = useState<WeeklyGoal>({ lessonTarget: 3 });
  useFocusEffect(useCallback(() => { loadActivityProgress().then(setActivity); loadWeeklyGoal().then(setGoal); }, []));
  const report = useMemo(() => buildWeeklyReport(activity), [activity]);
  const comparison = useMemo(() => buildWeekComparison(activity), [activity]);
  const maximum = Math.max(1, ...report.days.flatMap((day) => [day.lessons, day.practice]));
  const goalProgress = calculateGoalProgress(report.lessons, goal.lessonTarget);

  return (
    <ScreenContainer className="px-5">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}><Text className="mb-5 pt-2 text-base font-semibold text-primary">‹ Назад</Text></Pressable>
        <Text className="text-3xl font-bold text-foreground">Неделя в цифрах</Text>
        <Text className="mt-2 text-base leading-6 text-muted">Отчёт показывает только ваши реальные действия за последние семь дней.</Text>

        <View className="mt-6 flex-row gap-3"><View className="flex-1 rounded-3xl bg-primary p-4"><Text className="text-3xl font-bold text-white">{report.lessons}</Text><Text className="mt-1 text-sm text-[#E7E7FF]">уроков пройдено</Text></View><View className="flex-1 rounded-3xl bg-[#172033] p-4"><Text className="text-3xl font-bold text-white">{report.practice}</Text><Text className="mt-1 text-sm text-[#D8DDEA]">задач решено</Text></View></View>
        <View className="mt-3 rounded-2xl border border-border bg-surface p-4"><Text className="text-xl font-bold text-foreground">{report.activeDays} из 7 дней</Text><Text className="mt-1 text-sm leading-5 text-muted">были отмечены учебным действием. Не нужно заниматься идеально — важнее возвращаться к материалу.</Text></View>
        <Pressable onPress={() => router.push("/weekly-goal" as never)} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })} className="mt-3 rounded-2xl bg-[#E9EAFE] p-4"><View className="flex-row items-center justify-between"><Text className="font-bold text-foreground">Цель: {goal.lessonTarget} уроков</Text><Text className="font-bold text-primary">Изменить ›</Text></View><View className="mt-3 h-2 overflow-hidden rounded-full bg-white"><View style={{ width: `${goalProgress.percent}%` }} className="h-full rounded-full bg-success" /></View><Text className="mt-2 text-sm text-[#42446F]">{goalProgress.reached ? "Неделя уже удалась: цель достигнута!" : `До цели осталось ${goalProgress.remaining} уроков.`}</Text></Pressable>

        <View className="mt-6 rounded-3xl border border-border bg-surface p-5"><Text className="text-lg font-bold text-foreground">Ритм недели</Text><View className="mt-3 flex-row gap-4"><View className="flex-row items-center"><View className="mr-2 h-3 w-3 rounded-full bg-primary" /><Text className="text-xs text-muted">Уроки</Text></View><View className="flex-row items-center"><View className="mr-2 h-3 w-3 rounded-full bg-success" /><Text className="text-xs text-muted">Задачи</Text></View></View><View className="mt-7 h-36 flex-row items-end justify-between">
          {report.days.map((day) => {
            const lessonHeight = day.lessons ? 14 + (day.lessons / maximum) * 86 : 5;
            const practiceHeight = day.practice ? 14 + (day.practice / maximum) * 86 : 5;
            return <View key={day.date} className="w-9 items-center"><View className="h-28 flex-row items-end gap-1"><View style={{ height: lessonHeight }} className="w-3 rounded-t-md bg-primary" /><View style={{ height: practiceHeight }} className="w-3 rounded-t-md bg-success" /></View><Text className="mt-2 text-xs font-semibold text-muted">{day.label}</Text><Text className="text-[10px] text-muted">{day.lessons + day.practice || "·"}</Text></View>;
          })}
        </View></View>

        <View className="mt-5 rounded-3xl border border-border bg-surface p-5"><Text className="text-lg font-bold text-foreground">Сравнение с прошлой неделей</Text><Text className="mt-2 text-sm leading-5 text-muted">График показывает реальные действия: текущая неделя слева в каждой паре, прошлая — справа.</Text><View className="mt-5 flex-row gap-3"><View className="flex-1"><Text className="text-xs font-bold text-primary">УРОКИ</Text><View className="mt-3 h-28 flex-row items-end gap-3"><View style={{ height: Math.max(8, (comparison.current.lessons / Math.max(1, comparison.current.lessons, comparison.previous.lessons)) * 92) }} className="flex-1 rounded-t-xl bg-primary" /><View style={{ height: Math.max(8, (comparison.previous.lessons / Math.max(1, comparison.current.lessons, comparison.previous.lessons)) * 92) }} className="flex-1 rounded-t-xl bg-[#C8CAD4]" /></View><Text className="mt-2 text-sm text-muted">{comparison.current.lessons} / {comparison.previous.lessons}</Text></View><View className="flex-1"><Text className="text-xs font-bold text-success">ЗАДАЧИ</Text><View className="mt-3 h-28 flex-row items-end gap-3"><View style={{ height: Math.max(8, (comparison.current.practice / Math.max(1, comparison.current.practice, comparison.previous.practice)) * 92) }} className="flex-1 rounded-t-xl bg-success" /><View style={{ height: Math.max(8, (comparison.previous.practice / Math.max(1, comparison.current.practice, comparison.previous.practice)) * 92) }} className="flex-1 rounded-t-xl bg-[#C8CAD4]" /></View><Text className="mt-2 text-sm text-muted">{comparison.current.practice} / {comparison.previous.practice}</Text></View></View><View className="mt-4 rounded-2xl bg-[#E9EAFE] p-4"><Text className="font-bold text-foreground">{comparison.totalDelta > 0 ? `Рост на ${comparison.totalDelta} учебных действий` : comparison.totalDelta < 0 ? `На ${Math.abs(comparison.totalDelta)} действий меньше, чем на прошлой неделе` : "Темп совпадает с прошлой неделей"}</Text><Text className="mt-1 text-sm text-[#42446F]">Сравнение — не оценка. Оно помогает заметить ритм и выбрать реалистичный следующий шаг.</Text></View></View>

        <View className="mt-5 rounded-3xl bg-[#E9EAFE] p-5"><Text className="text-lg font-bold text-foreground">Следующий маленький шаг</Text><Text className="mt-2 text-base leading-6 text-[#42446F]">Откройте один урок или решите одну задачу в тренажёре — завтрашний столбик уже начнёт расти.</Text><Pressable onPress={() => router.push("/practice" as never)} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })} className="mt-4 items-center rounded-2xl bg-primary py-3"><Text className="font-bold text-white">Открыть тренажёр</Text></Pressable></View>
      </ScrollView>
    </ScreenContainer>
  );
}
