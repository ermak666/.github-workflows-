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
        ListHeaderComponent={<View><View className="flex-row items-center justify-between"><Text className="text-sm font-semibold text-primary">PYTHON БЕЗ СТРАХА</Text><Pressable accessibilityRole="button" onPress={() => router.push("/settings" as never)} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}><Text className="text-sm font-bold text-primary">Aa · тема</Text></Pressable></View><Text className="mt-1 text-4xl font-bold leading-[46px] text-foreground">Учимся\nмаленькими шагами</Text><Text className="mt-3 text-base leading-6 text-muted">Не нужно знать всё сразу. Откройте один урок, попробуйте пример и отметьте свой шаг.</Text><Pressable accessibilityRole="button" onPress={() => router.push({ pathname: "/lesson/[id]", params: { id: nextLesson.id } } as never)} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] })} className="mt-6 rounded-3xl bg-primary p-5"><Text className="text-sm font-semibold text-[#D8D8FF]">ПРОДОЛЖИТЬ</Text><Text numberOfLines={2} className="mt-1 text-xl font-bold text-white">Урок {nextLesson.number}: {nextLesson.title}</Text><Text className="mt-3 text-base font-semibold text-white">Открыть урок →</Text></Pressable><View className="mt-5 flex-row items-center justify-between"><Text className="text-base font-bold text-foreground">Ваш прогресс</Text><Text className="text-base font-bold text-success">{progress}%</Text></View><View className="mt-2 h-3 overflow-hidden rounded-full bg-[#E9EAF2]"><View style={{ width: `${progress}%` }} className="h-full rounded-full bg-success" /></View><Text className="mb-5 mt-2 text-sm text-muted">{completed.length} из {total} уроков завершено</Text><Text className="mb-3 text-xl font-bold text-foreground">Четыре тома</Text></View>}
        renderItem={({ item }) => <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: "/volume/[id]", params: { id: item.id } } as never)} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })} className="mb-3 rounded-2xl border border-border bg-surface p-4"><Text className="text-sm font-semibold text-primary">{item.lessons.length} уроков</Text><Text className="mt-1 text-lg font-bold text-foreground">{item.title}</Text></Pressable>}
      />
    </ScreenContainer>
  );
}
