import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { loadWeeklyGoal, saveWeeklyGoal } from "@/lib/weekly-goal";

const presets = [1, 3, 5, 7];

export default function WeeklyGoalScreen() {
  const router = useRouter();
  const [target, setTarget] = useState(3);
  const [saved, setSaved] = useState(false);
  useFocusEffect(useCallback(() => { loadWeeklyGoal().then((goal) => setTarget(goal.lessonTarget)); }, []));

  const change = (next: number) => { setTarget(Math.max(1, Math.min(14, next))); setSaved(false); };
  const persist = async () => { const goal = await saveWeeklyGoal(target); setTarget(goal.lessonTarget); setSaved(true); };

  return (
    <ScreenContainer className="px-5">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}><Text className="mb-5 pt-2 text-base font-semibold text-primary">‹ Назад</Text></Pressable>
        <Text className="text-3xl font-bold text-foreground">Недельная цель</Text>
        <Text className="mt-2 text-base leading-6 text-muted">Выберите честное количество уроков на эту неделю. Лучше небольшая цель, которую вы выполните, чем слишком большая и тяжёлая.</Text>
        <View className="mt-7 rounded-3xl bg-[#E9EAFE] p-6"><Text className="text-sm font-bold uppercase tracking-wide text-primary">МОЙ ПЛАН</Text><Text className="mt-2 text-6xl font-bold text-foreground">{target}</Text><Text className="mt-1 text-lg font-semibold text-[#42446F]">уроков за неделю</Text><View className="mt-5 flex-row justify-center gap-4"><Pressable onPress={() => change(target - 1)} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })} className="h-12 w-14 items-center justify-center rounded-2xl bg-white"><Text className="text-2xl font-bold text-primary">−</Text></Pressable><Pressable onPress={() => change(target + 1)} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })} className="h-12 w-14 items-center justify-center rounded-2xl bg-white"><Text className="text-2xl font-bold text-primary">+</Text></Pressable></View></View>
        <Text className="mt-7 text-lg font-bold text-foreground">Быстрый выбор</Text><View className="mt-3 flex-row gap-2">{presets.map((value) => { const active = value === target; return <Pressable key={value} onPress={() => change(value)} style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })} className={`flex-1 items-center rounded-2xl border py-4 ${active ? "border-primary bg-primary" : "border-border bg-surface"}`}><Text className={`text-lg font-bold ${active ? "text-white" : "text-foreground"}`}>{value}</Text><Text className={`text-xs ${active ? "text-[#E7E7FF]" : "text-muted"}`}>уроков</Text></Pressable>; })}</View>
        <Pressable onPress={persist} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })} className="mt-7 items-center rounded-2xl bg-primary py-4"><Text className="text-base font-bold text-white">Сохранить мою цель</Text></Pressable>{saved ? <Text className="mt-3 text-center font-semibold text-success">✓ План сохранён. Один урок за раз — и цель станет реальностью.</Text> : null}
      </ScrollView>
    </ScreenContainer>
  );
}
