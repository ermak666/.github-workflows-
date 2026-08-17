import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { loadActivityProgress, type ActivityProgress } from "@/lib/course-progress";
import { loadToolkit, saveToolkit, type ToolkitState } from "@/lib/study-toolkit";

const initialActivity: ActivityProgress = { practiceSuccessIds: [], activeDays: [], completedLessonDates: {}, practiceSuccessDates: {}, quizResults: {} };
const labels = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export default function GrowthScreen() {
  const router = useRouter();
  const [toolkit, setToolkit] = useState<ToolkitState | null>(null);
  const [activity, setActivity] = useState<ActivityProgress>(initialActivity);
  const [why, setWhy] = useState("");
  useFocusEffect(useCallback(() => { loadToolkit().then((value) => { setToolkit(value); setWhy(value.personalWhy); }); loadActivityProgress().then(setActivity); }, []));
  if (!toolkit) return <ScreenContainer className="items-center justify-center"><Text className="text-muted">Загружаем ваш путь…</Text></ScreenContainer>;
  const updateGoal = async (key: keyof ToolkitState["flexibleGoal"], delta: number) => { const flexibleGoal = { ...toolkit.flexibleGoal, [key]: Math.max(key === "minutes" ? 15 : 1, toolkit.flexibleGoal[key] + delta) }; setToolkit(await saveToolkit({ ...toolkit, flexibleGoal })); };
  const saveWhy = async () => setToolkit(await saveToolkit({ ...toolkit, personalWhy: why.trim() }));
  const last7 = Array.from({ length: 7 }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - (6 - index)); return date.toISOString().slice(0, 10); });
  const badges = ["Первый шаг", "Три дня подряд", "Первая задача", "Первый мини-проект"].map((name, index) => ({ name, active: activity.activeDays.length >= index + 1 || toolkit.achievements.length >= index + 1 }));
  return <ScreenContainer className="px-5"><ScrollView contentContainerStyle={{ paddingBottom: 40 }}><Pressable onPress={() => router.back()}><Text className="mb-5 pt-2 font-semibold text-primary">‹ Назад</Text></Pressable><Text className="text-3xl font-bold text-foreground">Мой ритм</Text><Text className="mt-2 text-base leading-6 text-muted">Планируйте честно, отмечайте движение и возвращайтесь к делу спокойно.</Text>
    <View className="mt-6 rounded-3xl bg-[#E9EAFE] p-5"><Text className="text-lg font-bold text-foreground">Гибкие цели недели</Text>{([ ["lessons", "Уроки", 1], ["tasks", "Задачи", 1], ["minutes", "Минуты", 15], ["projects", "Проекты", 1] ] as const).map(([key, label, step]) => <View key={key} className="mt-4 flex-row items-center justify-between"><Text className="text-base text-foreground">{label}</Text><View className="flex-row items-center gap-3"><Pressable onPress={() => updateGoal(key, -step)} className="h-9 w-9 items-center justify-center rounded-lg bg-white"><Text className="text-lg font-bold text-primary">−</Text></Pressable><Text className="w-8 text-center text-lg font-bold text-foreground">{toolkit.flexibleGoal[key]}</Text><Pressable onPress={() => updateGoal(key, step)} className="h-9 w-9 items-center justify-center rounded-lg bg-white"><Text className="text-lg font-bold text-primary">+</Text></Pressable></View></View>)}</View>
    <View className="mt-4 rounded-3xl border border-border bg-surface p-5"><Text className="text-lg font-bold text-foreground">Календарь активности</Text><View className="mt-4 flex-row justify-between">{last7.map((date, index) => <View key={date} className="items-center"><View className={`h-9 w-9 rounded-full ${activity.activeDays.includes(date) ? "bg-success" : "bg-background border border-border"}`} /><Text className="mt-2 text-xs text-muted">{labels[index]}</Text></View>)}</View></View>
    <View className="mt-4 rounded-3xl border border-border bg-surface p-5"><Text className="text-lg font-bold text-foreground">Достижения</Text><View className="mt-3 flex-row flex-wrap gap-2">{badges.map((badge) => <View key={badge.name} className={`rounded-full px-3 py-2 ${badge.active ? "bg-[#DFF5ED]" : "bg-background border border-border"}`}><Text className={`text-xs font-bold ${badge.active ? "text-success" : "text-muted"}`}>{badge.active ? "✓ " : "○ "}{badge.name}</Text></View>)}</View></View>
    <View className="mt-4 rounded-3xl border border-border bg-surface p-5"><Text className="text-lg font-bold text-foreground">Зачем я учусь</Text><TextInput value={why} onChangeText={setWhy} multiline placeholder="Например: хочу уверенно автоматизировать свою работу" placeholderTextColor="#667085" textAlignVertical="top" className="mt-3 min-h-24 rounded-xl border border-border bg-background px-3 py-3 text-foreground" /><Pressable onPress={saveWhy} className="mt-3 items-center rounded-xl bg-primary py-3"><Text className="font-bold text-white">Сохранить причину</Text></Pressable></View>
    <View className="mt-4 rounded-3xl bg-[#172033] p-5"><Text className="text-lg font-bold text-white">Если была пауза</Text><Text className="mt-2 text-sm leading-5 text-[#D8DDEA]">Ничего не потеряно. Откройте последнюю понятную тему, решите одну короткую задачу и выберите маленькую цель на завтра.</Text><Pressable onPress={() => router.push("/focus" as never)} className="mt-4 self-start rounded-xl bg-primary px-4 py-3"><Text className="font-bold text-white">Вернуться мягко</Text></Pressable></View>
  </ScrollView></ScreenContainer>;
}
