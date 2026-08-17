import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import * as Speech from "expo-speech";

import { CodeCard } from "@/components/code-card";
import { ScreenContainer } from "@/components/screen-container";
import { loadCompletedLessons, recordQuizResult, toggleCompletedLesson } from "@/lib/course-progress";
import { createBookmarkCategory, loadBookmarks, toggleLessonBookmark, type BookmarkState } from "@/lib/lesson-bookmarks";
import { useThemeContext } from "@/lib/theme-provider";
import { getLesson } from "@/shared/course-data";
import { getLessonQuiz } from "@/shared/lesson-quiz";

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const lesson = getLesson(id);
  const [completed, setCompleted] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [bookmarks, setBookmarks] = useState<BookmarkState | null>(null);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const { fontScale } = useThemeContext();

  useFocusEffect(useCallback(() => {
    loadCompletedLessons().then(setCompleted);
    loadBookmarks().then(setBookmarks);
  }, []));

  useEffect(() => { setSelectedOption(null); setShowBookmarks(false); }, [lesson?.id]);

  if (!lesson) {
    return <ScreenContainer className="items-center justify-center p-6"><Text className="text-foreground">Урок не найден.</Text></ScreenContainer>;
  }

  const quiz = getLessonQuiz(lesson);
  const done = completed.includes(lesson.id);
  const paragraphs = lesson.body.split("\n\n").filter((part) => part.trim()).slice(0, 30);

  return (
    <ScreenContainer className="px-5">
      <ScrollView contentContainerStyle={{ paddingBottom: 42 }} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
          <Text className="mb-5 pt-2 text-base font-semibold text-primary">‹ К содержанию</Text>
        </Pressable>
        <View className="overflow-hidden rounded-[30px] border border-[#354062] bg-[#151A36] p-5 shadow-sm">
          <View className="absolute -right-9 -top-10 h-36 w-36 rounded-full bg-[#7056E8] opacity-45" />
          <View className="self-start rounded-full bg-[#242B4D] px-3 py-2"><Text className="text-xs font-bold tracking-widest text-[#C9C6FF]">УРОК {lesson.number}</Text></View>
          <Text className="mt-3 text-3xl font-bold leading-10 text-white">{lesson.title}</Text>
          <Text style={{ fontSize: 16 * fontScale, lineHeight: 24 * fontScale }} className="mt-3 text-[#D8DDEA]">{lesson.goal}</Text>
          <View className="mt-5 flex-row flex-wrap gap-2"><Pressable onPress={async () => { if (await Speech.isSpeakingAsync()) { await Speech.stop(); setSpeaking(false); return; } setSpeaking(true); Speech.speak(`${lesson.title}. ${lesson.goal}. ${lesson.analogy}`, { language: "ru-RU", rate: 0.9, onDone: () => setSpeaking(false), onStopped: () => setSpeaking(false), onError: () => setSpeaking(false) }); }} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })} className="rounded-full bg-[#E7E0FF] px-4 py-3"><Text className="font-bold text-primary">{speaking ? "■ Остановить" : "▶ Слушать"}</Text></Pressable><Pressable onPress={() => setShowBookmarks((value) => !value)} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })} className="rounded-full border border-[#6872AA] bg-[#242B4D] px-4 py-3"><Text className="font-bold text-white">В закладки</Text></Pressable></View>
        </View>
        {showBookmarks && bookmarks ? <View className="mt-4 rounded-3xl border border-border bg-surface p-5"><Text className="text-lg font-bold text-foreground">Категория закладки</Text><Text className="mt-2 text-sm leading-5 text-muted">Выберите одну или несколько личных папок. Повторное нажатие уберёт урок из категории.</Text><View className="mt-4 flex-row flex-wrap gap-2">{bookmarks.categories.map((category) => { const active = bookmarks.bookmarks.some((item) => item.lessonId === lesson.id && item.categoryId === category.id); return <Pressable key={category.id} onPress={async () => setBookmarks(await toggleLessonBookmark(lesson.id, category.id))} className={`rounded-full px-4 py-2 ${active ? "bg-primary" : "border border-border bg-background"}`}><Text className={`font-bold ${active ? "text-white" : "text-foreground"}`}>{active ? "✓ " : ""}{category.name}</Text></Pressable>; })}</View><View className="mt-4 flex-row gap-2"><TextInput value={newCategory} onChangeText={setNewCategory} placeholder="Новая категория" placeholderTextColor="#667085" className="flex-1 rounded-xl border border-border bg-background px-3 py-3 text-foreground" /><Pressable onPress={async () => { const next = await createBookmarkCategory(newCategory); setBookmarks(next); setNewCategory(""); }} className="items-center justify-center rounded-xl bg-primary px-4"><Text className="font-bold text-white">Создать</Text></Pressable></View></View> : null}

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

        <View className="mt-8 rounded-3xl border border-border bg-surface p-5 shadow-sm"><View className="self-start rounded-full bg-[#E7E0FF] px-3 py-2"><Text className="text-xs font-bold uppercase tracking-wide text-primary">Быстрая проверка</Text></View><Text style={{ fontSize: 18 * fontScale, lineHeight: 27 * fontScale }} className="mt-4 font-bold text-foreground">{quiz.question}</Text><View className="mt-4 gap-2">{quiz.options.map((option, optionIndex) => { const chosen = selectedOption === optionIndex; const isCorrect = optionIndex === quiz.correctIndex; const afterAnswer = selectedOption !== null; const color = afterAnswer && isCorrect ? "border-success bg-[#DFF6EC]" : afterAnswer && chosen ? "border-error bg-[#FDE9ED]" : "border-border bg-background"; return <Pressable key={option} disabled={afterAnswer} onPress={async () => { setSelectedOption(optionIndex); await recordQuizResult(lesson.id, optionIndex === quiz.correctIndex); }} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] })} className={`rounded-2xl border p-4 ${color}`}><Text className={`font-semibold ${afterAnswer && isCorrect ? "text-success" : afterAnswer && chosen ? "text-error" : "text-foreground"}`}>{option}</Text></Pressable>; })}</View>{selectedOption !== null ? <Text style={{ fontSize: 14 * fontScale, lineHeight: 21 * fontScale }} className={`mt-4 ${selectedOption === quiz.correctIndex ? "text-success" : "text-warning"}`}>{selectedOption === quiz.correctIndex ? "✓ " : "Попробуйте запомнить: "}{quiz.explanation}</Text> : null}</View>

        <Pressable
          accessibilityRole="button"
          onPress={async () => setCompleted(await toggleCompletedLesson(lesson.id))}
          style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] })}
          className={`mt-8 items-center rounded-2xl border px-5 py-4 shadow-sm ${done ? "border-success bg-[#DFF6EC]" : "border-[#8D7BFF] bg-primary"}`}
        >
          <Text className={`text-base font-bold ${done ? "text-success" : "text-white"}`}>{done ? "✓ Урок пройден" : "Отметить как пройденный"}</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
