import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { CodeCard } from "@/components/code-card";
import { ScreenContainer } from "@/components/screen-container";
import { loadCompletedLessons, toggleCompletedLesson } from "@/lib/course-progress";
import { useThemeContext } from "@/lib/theme-provider";
import { getLesson } from "@/shared/course-data";

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const lesson = getLesson(id);
  const [completed, setCompleted] = useState<string[]>([]);
  const { fontScale } = useThemeContext();

  useFocusEffect(useCallback(() => {
    loadCompletedLessons().then(setCompleted);
  }, []));

  if (!lesson) {
    return <ScreenContainer className="items-center justify-center p-6"><Text className="text-foreground">Урок не найден.</Text></ScreenContainer>;
  }

  const done = completed.includes(lesson.id);
  const paragraphs = lesson.body.split("\n\n").filter((part) => part.trim()).slice(0, 30);

  return (
    <ScreenContainer className="px-5">
      <ScrollView contentContainerStyle={{ paddingBottom: 42 }} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
          <Text className="mb-5 pt-2 text-base font-semibold text-primary">‹ К содержанию</Text>
        </Pressable>
        <View className="rounded-3xl bg-[#E9EAFE] p-5">
          <Text className="text-sm font-semibold text-primary">УРОК {lesson.number}</Text>
          <Text className="mt-2 text-3xl font-bold leading-10 text-foreground">{lesson.title}</Text>
          <Text style={{ fontSize: 16 * fontScale, lineHeight: 24 * fontScale }} className="mt-3 text-[#42446F]">{lesson.goal}</Text>
        </View>

        <Text className="mt-7 text-lg font-bold text-foreground">Представь так</Text>
        <Text style={{ fontSize: 16 * fontScale, lineHeight: 28 * fontScale }} className="mt-2 text-foreground">{lesson.analogy}</Text>

        <Text className="mt-7 text-lg font-bold text-foreground">Минимальный пример</Text>
        <View className="mt-3"><CodeCard code={lesson.code} /></View>

        <Text className="mt-7 text-lg font-bold text-foreground">Объяснение и практика</Text>
        {paragraphs.map((paragraph, index) => (
          <Text key={`${index}-${paragraph.slice(0, 16)}`} style={{ fontSize: 16 * fontScale, lineHeight: 28 * fontScale }} className="mt-3 text-foreground">
            {paragraph.replace(/^#+\s*/, "").replace(/\|/g, " · ")}
          </Text>
        ))}

        <Pressable
          accessibilityRole="button"
          onPress={async () => setCompleted(await toggleCompletedLesson(lesson.id))}
          style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] })}
          className={`mt-8 items-center rounded-2xl px-5 py-4 ${done ? "bg-[#DFF5ED]" : "bg-primary"}`}
        >
          <Text className={`text-base font-bold ${done ? "text-success" : "text-white"}`}>{done ? "✓ Урок пройден" : "Отметить как пройденный"}</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
