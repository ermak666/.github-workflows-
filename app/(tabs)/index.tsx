import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { loadCompletedLessons } from "@/lib/course-progress";
import { volumes } from "@/shared/course-data";

export default function HomeScreen() {
  const router = useRouter();
  const [completed, setCompleted] = useState<string[]>([]);
  useFocusEffect(useCallback(() => { loadCompletedLessons().then(setCompleted); }, []));
  const allLessons = useMemo(() => volumes.flatMap((volume) => volume.lessons), []);
  const nextLesson = allLessons.find((lesson) => !completed.includes(lesson.id)) ?? allLessons[0];
  const total = allLessons.length;
  const progress = total ? Math.round((completed.length / total) * 100) : 0;

  return (
    <ScreenContainer className="px-5">
      <FlatList
        data={volumes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 14, paddingBottom: 36 }}
        ListHeaderComponent={<View><View className="flex-row items-center justify-between"><View className="rounded-full bg-[#E7E0FF] px-3 py-2"><Text className="text-xs font-bold tracking-widest text-primary">PYTHON · LAB</Text></View><Pressable accessibilityRole="button" onPress={() => router.push("/settings" as never)} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] })} className="rounded-full border border-border bg-surface px-3 py-2"><Text className="text-sm font-bold text-primary">Aa · тема</Text></Pressable></View><Text className="mt-5 text-4xl font-bold leading-[46px] text-foreground">Учимся\nмаленькими шагами</Text><Text className="mt-3 text-base leading-6 text-muted">Не нужно знать всё сразу. Откройте один урок, попробуйте пример и отметьте свой шаг.</Text><Pressable accessibilityRole="button" onPress={() => router.push({ pathname: "/lesson/[id]", params: { id: nextLesson.id } } as never)} style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] })} className="mt-6 overflow-hidden rounded-[28px] border border-[#8D7BFF] bg-[#151A36] p-5 shadow-sm"><View className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#7056E8] opacity-50" /><Text className="text-sm font-bold tracking-widest text-[#C9C6FF]">ПРОДОЛЖИТЬ</Text><Text numberOfLines={2} className="mt-2 text-xl font-bold text-white">Урок {nextLesson.number}: {nextLesson.title}</Text><View className="mt-4 self-start rounded-full bg-[#8F7BFF] px-4 py-2"><Text className="text-sm font-bold text-white">Открыть урок →</Text></View></Pressable><View className="mt-6 flex-row items-center justify-between"><Text className="text-base font-bold text-foreground">Ваш прогресс</Text><View className="rounded-full bg-[#DFF6EC] px-3 py-1"><Text className="text-sm font-bold text-success">{progress}%</Text></View></View><View className="mt-3 h-3 overflow-hidden rounded-full bg-[#E4DFF2]"><View style={{ width: `${progress}%` }} className="h-full rounded-full bg-success" /></View><Text className="mb-6 mt-2 text-sm text-muted">{completed.length} из {total} уроков завершено</Text><Text className="mb-3 text-xl font-bold text-foreground">Четыре тома</Text></View>}
        renderItem={({ item, index }) => <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: "/volume/[id]", params: { id: item.id } } as never)} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] })} className="mb-3 overflow-hidden rounded-3xl border border-border bg-surface p-5 shadow-sm"><View className={`absolute left-0 top-0 h-full w-1.5 ${index % 2 ? "bg-success" : "bg-primary"}`} /><Text className="ml-2 text-sm font-bold uppercase tracking-wide text-primary">{item.lessons.length} уроков</Text><Text className="ml-2 mt-2 text-lg font-bold text-foreground">{item.title}</Text><Text className="ml-2 mt-2 text-sm font-bold text-muted">Открыть содержание →</Text></Pressable>}
      />
    </ScreenContainer>
  );
}
