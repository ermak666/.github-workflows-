import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { CodeCard } from "@/components/code-card";
import { LessonMarkdown } from "@/components/lesson-markdown";
import { BackButton } from "@/components/back-button";
import { ScreenContainer } from "@/components/screen-container";
import { loadCompletedLessons, recordQuizResult, toggleCompletedLesson } from "@/lib/course-progress";
import { createBookmarkCategory, loadBookmarks, toggleLessonBookmark, type BookmarkState } from "@/lib/lesson-bookmarks";
import { useThemeContext } from "@/lib/theme-provider";
import { useSoundFeedback } from "@/lib/sound-feedback";
import { getLesson, getLessonNavigation, isVolumeComplete } from "@/shared/course-data";
import { useColors } from "@/hooks/use-colors";
import { getLessonQuiz } from "@/shared/lesson-quiz";
import { lessonVoiceovers, type LessonVoiceoverId } from "@/lib/lesson-voiceovers";
import { useLessonAudio } from "@/lib/lesson-audio";
import { loadMasteryProgress, saveMasteryProgress } from "@/lib/mastery-progress";

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const lesson = getLesson(id);
  const [completed, setCompleted] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [bookmarks, setBookmarks] = useState<BookmarkState | null>(null);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const { fontScale } = useThemeContext();
  const { playSuccess, playTap } = useSoundFeedback();
  const colors = useColors();
  const lessonAudioSource = lesson ? lessonVoiceovers[lesson.id as LessonVoiceoverId] : undefined;
  const { activeLessonId, playbackState, position, duration, playbackRate, playLesson, pause, resume, stop, setPlaybackRate, seekBy } = useLessonAudio();
  const isCurrentVoiceover = activeLessonId === lesson?.id;
  const audioPercent = duration > 0 ? Math.min(100, Math.round((position / duration) * 100)) : 0;
  const formatAudioTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

  useFocusEffect(useCallback(() => {
    loadCompletedLessons().then(setCompleted);
    loadBookmarks().then(setBookmarks);
  }, []));

  useEffect(() => {
    setSelectedOption(null);
    setShowBookmarks(false);
    if (!lesson) return;
    void loadMasteryProgress().then(async (current) => {
      const next = [{ id: lesson.id, title: lesson.title, openedAt: new Date().toISOString() }, ...current.lastOpened.filter((item) => item.id !== lesson.id)].slice(0, 6);
      await saveMasteryProgress({ ...current, lastOpened: next });
    });
  }, [lesson]);

  const startVoiceover = () => {
    if (!lessonAudioSource || !lesson) return;
    void playLesson(lesson.id as LessonVoiceoverId);
  };

  if (!lesson) {
    return <ScreenContainer className="items-center justify-center p-6"><View className="w-full max-w-sm rounded-3xl border border-border bg-surface p-6"><Text className="text-xl font-bold text-foreground">Урок не найден</Text><Text className="mt-3 text-sm leading-5 text-muted">Возможно, ссылка устарела. Вернитесь к содержанию и выберите нужный урок из списка.</Text><Pressable accessibilityRole="button" onPress={() => router.replace("/learn" as never)} style={({ pressed }) => ({ marginTop: 20, alignItems: "center", borderRadius: 16, backgroundColor: colors.primary, paddingVertical: 14, opacity: pressed ? 0.78 : 1 })}><Text className="font-bold text-white">Открыть учебник</Text></Pressable></View></ScreenContainer>;
  }

  const quiz = getLessonQuiz(lesson);
  const done = completed.includes(lesson.id);
  const navigation = getLessonNavigation(lesson.id);
  const isLastLesson = !navigation?.nextLesson;
  const volumeFinished = navigation ? isVolumeComplete(navigation.volume, completed) : false;

  return (
    <ScreenContainer className="px-5">
      <ScrollView contentContainerStyle={{ paddingBottom: 42 }} showsVerticalScrollIndicator={false}>
        <BackButton label="К содержанию" onPress={() => router.replace(`/volume/${navigation?.volume.id ?? "junior"}` as never)} />
        <View className="overflow-hidden rounded-[30px] border border-[#354062] bg-[#151A36] p-5 shadow-sm">
          <View className="absolute -right-9 -top-10 h-36 w-36 rounded-full bg-[#7056E8] opacity-45" />
          <View className="self-start rounded-full bg-[#242B4D] px-3 py-2"><Text className="text-xs font-bold tracking-widest text-[#C9C6FF]">УРОК {navigation?.lessonIndex ?? lesson.number} ИЗ {navigation?.lessonCount ?? 1}</Text></View>
          <Text className="mt-3 text-3xl font-bold leading-10 text-white">{lesson.title}</Text>
          <Text style={{ fontSize: 16 * fontScale, lineHeight: 24 * fontScale }} className="mt-3 text-[#D8DDEA]">{lesson.goal}</Text>
          <View className="mt-5 flex-row flex-wrap gap-2">{lessonAudioSource && !isCurrentVoiceover ? <Pressable accessibilityRole="button" onPress={startVoiceover} style={({ pressed }) => [{ borderRadius: 999, backgroundColor: "#E7E0FF", paddingHorizontal: 16, paddingVertical: 12 }, { opacity: pressed ? 0.8 : 1 }]}><Text className="font-bold text-primary">▶ Слушать Algieba</Text></Pressable> : null}{lessonAudioSource && isCurrentVoiceover && playbackState === "playing" ? <Pressable accessibilityRole="button" accessibilityLabel="Поставить озвучивание на паузу" onPress={pause} style={({ pressed }) => [{ borderRadius: 999, backgroundColor: "#E7E0FF", paddingHorizontal: 16, paddingVertical: 12 }, { opacity: pressed ? 0.8 : 1 }]}><Text className="font-bold text-primary">Ⅱ Пауза</Text></Pressable> : null}{lessonAudioSource && isCurrentVoiceover && playbackState === "paused" ? <Pressable accessibilityRole="button" accessibilityLabel="Продолжить озвучивание" onPress={resume} style={({ pressed }) => [{ borderRadius: 999, backgroundColor: "#E7E0FF", paddingHorizontal: 16, paddingVertical: 12 }, { opacity: pressed ? 0.8 : 1 }]}><Text className="font-bold text-primary">▶ Продолжить</Text></Pressable> : null}{lessonAudioSource && isCurrentVoiceover ? <Pressable accessibilityRole="button" accessibilityLabel="Полностью остановить озвучивание" onPress={stop} style={({ pressed }) => [{ borderRadius: 999, borderWidth: 1, borderColor: "#FFB9C5", backgroundColor: "#3B1724", paddingHorizontal: 16, paddingVertical: 12 }, { opacity: pressed ? 0.8 : 1 }]}><Text className="font-bold text-[#FFE2E8]">■ Стоп</Text></Pressable> : null}<Pressable accessibilityRole="button" onPress={() => setShowBookmarks((value) => !value)} style={({ pressed }) => [{ borderRadius: 999, borderWidth: 1, borderColor: "#6872AA", backgroundColor: "#242B4D", paddingHorizontal: 16, paddingVertical: 12 }, { opacity: pressed ? 0.8 : 1 }]}><Text className="font-bold text-white">В закладки</Text></Pressable></View>
          {lessonAudioSource ? <Text className="mt-3 text-xs leading-4 text-[#D8DDEA]">Algieba — один общий плеер: запуск нового урока остановит предыдущую запись.</Text> : null}
          {lessonAudioSource && isCurrentVoiceover ? <View className="mt-4 rounded-2xl bg-[#242B4D] p-4"><View className="flex-row items-center justify-between"><Text className="text-xs font-bold text-[#C9C6FF]">{formatAudioTime(position)} / {formatAudioTime(duration)}</Text><Text className="text-xs font-bold text-[#C9C6FF]">{playbackRate.toFixed(1)}×</Text></View><View className="mt-2 h-2 overflow-hidden rounded-full bg-[#111426]"><View style={{ width: `${audioPercent}%` }} className="h-full rounded-full bg-[#A993FF]" /></View><View className="mt-3 flex-row flex-wrap gap-2"><Pressable accessibilityRole="button" onPress={() => seekBy(-10)} className="rounded-lg bg-[#151A36] px-3 py-2"><Text className="text-xs font-bold text-white">↶ 10 сек</Text></Pressable><Pressable accessibilityRole="button" onPress={() => seekBy(10)} className="rounded-lg bg-[#151A36] px-3 py-2"><Text className="text-xs font-bold text-white">10 сек ↷</Text></Pressable>{[0.8, 1, 1.2].map((rate) => <Pressable key={rate} accessibilityRole="button" onPress={() => setPlaybackRate(rate)} className={`rounded-lg px-3 py-2 ${playbackRate === rate ? "bg-[#A993FF]" : "bg-[#151A36]"}`}><Text className="text-xs font-bold text-white">{rate.toFixed(1)}×</Text></Pressable>)}</View></View> : null}
        </View>
        {showBookmarks && bookmarks ? <View className="mt-4 rounded-3xl border border-border bg-surface p-5"><Text className="text-lg font-bold text-foreground">Категория закладки</Text><Text className="mt-2 text-sm leading-5 text-muted">Выберите одну или несколько личных папок. Повторное нажатие уберёт урок из категории.</Text><View className="mt-4 flex-row flex-wrap gap-2">{bookmarks.categories.map((category) => { const active = bookmarks.bookmarks.some((item) => item.lessonId === lesson.id && item.categoryId === category.id); return <Pressable key={category.id} onPress={async () => setBookmarks(await toggleLessonBookmark(lesson.id, category.id))} className={`rounded-full px-4 py-2 ${active ? "bg-primary" : "border border-border bg-background"}`}><Text className={`font-bold ${active ? "text-white" : "text-foreground"}`}>{active ? "✓ " : ""}{category.name}</Text></Pressable>; })}</View><View className="mt-4 flex-row gap-2"><TextInput value={newCategory} onChangeText={setNewCategory} placeholder="Новая категория" placeholderTextColor="#667085" className="flex-1 rounded-xl border border-border bg-background px-3 py-3 text-foreground" /><Pressable onPress={async () => { const next = await createBookmarkCategory(newCategory); setBookmarks(next); setNewCategory(""); }} className="items-center justify-center rounded-xl bg-primary px-4"><Text className="font-bold text-white">Создать</Text></Pressable></View></View> : null}

        <Text className="mt-7 text-lg font-bold text-foreground">Представь так</Text>
        <Text style={{ fontSize: 16 * fontScale, lineHeight: 28 * fontScale }} className="mt-2 text-foreground">{lesson.analogy}</Text>

        <Text className="mt-7 text-lg font-bold text-foreground">Минимальный пример</Text>
        <View className="mt-3"><CodeCard code={lesson.code} /></View>

        <Text className="mt-7 text-lg font-bold text-foreground">Объяснение и практика</Text>
        <LessonMarkdown content={lesson.body} fontScale={fontScale} />

        <View className="mt-8 rounded-3xl border border-border bg-surface p-5 shadow-sm"><View className="self-start rounded-full bg-[#E7E0FF] px-3 py-2"><Text className="text-xs font-bold uppercase tracking-wide text-primary">Быстрая проверка</Text></View><Text style={{ fontSize: 18 * fontScale, lineHeight: 27 * fontScale }} className="mt-4 font-bold text-foreground">{quiz.question}</Text><View className="mt-4 gap-2">{quiz.options.map((option, optionIndex) => { const chosen = selectedOption === optionIndex; const isCorrect = optionIndex === quiz.correctIndex; const afterAnswer = selectedOption !== null; const color = afterAnswer && isCorrect ? "border-success bg-[#DFF6EC]" : afterAnswer && chosen ? "border-error bg-[#FDE9ED]" : "border-border bg-background"; return <Pressable key={option} disabled={afterAnswer} onPress={async () => { setSelectedOption(optionIndex); await recordQuizResult(lesson.id, optionIndex === quiz.correctIndex); }} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] })} className={`rounded-2xl border p-4 ${color}`}><Text className={`font-semibold ${afterAnswer && isCorrect ? "text-success" : afterAnswer && chosen ? "text-error" : "text-foreground"}`}>{option}</Text></Pressable>; })}</View>{selectedOption !== null ? <Text style={{ fontSize: 14 * fontScale, lineHeight: 21 * fontScale }} className={`mt-4 ${selectedOption === quiz.correctIndex ? "text-success" : "text-warning"}`}>{selectedOption === quiz.correctIndex ? "✓ " : "Попробуйте запомнить: "}{quiz.explanation}</Text> : null}</View>

        <Pressable
          accessibilityRole="button"
          onPress={async () => { const next = await toggleCompletedLesson(lesson.id); setCompleted(next); if (next.includes(lesson.id)) { playSuccess(); } else { playTap(); } }}
          style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] })}
          className={`mt-8 items-center rounded-2xl border px-5 py-4 shadow-sm ${done ? "border-success bg-[#DFF6EC]" : "border-[#8D7BFF] bg-primary"}`}
        >
          <Text className={`text-base font-bold ${done ? "text-success" : "text-white"}`}>{done ? "✓ Урок пройден" : "Отметить как пройденный"}</Text>
        </Pressable>
        <View className="mt-4 flex-row gap-3">
          {navigation?.previousLesson ? <Pressable accessibilityRole="button" accessibilityLabel="Предыдущий урок" onPress={() => router.replace(`/lesson/${navigation.previousLesson?.id}` as never)} style={({ pressed }) => ({ flex: 1, alignItems: "center", borderWidth: 1, borderColor: colors.border, borderRadius: 16, backgroundColor: colors.surface, paddingVertical: 14, opacity: pressed ? 0.76 : 1 })}><Text className="font-bold text-foreground">← Предыдущий урок</Text></Pressable> : null}
          {navigation?.nextLesson ? <Pressable accessibilityRole="button" accessibilityLabel="Следующий урок" onPress={() => router.replace(`/lesson/${navigation.nextLesson?.id}` as never)} style={({ pressed }) => ({ flex: 1, alignItems: "center", borderRadius: 16, backgroundColor: colors.primary, paddingVertical: 14, opacity: pressed ? 0.76 : 1 })}><Text className="font-bold text-white">Следующий урок →</Text></Pressable> : <Pressable accessibilityRole="button" accessibilityLabel="Итоговое задание тома" disabled={!volumeFinished} onPress={() => router.replace(`/volume-final/${navigation?.volume.id}` as never)} style={({ pressed }) => ({ flex: 1, alignItems: "center", borderRadius: 16, backgroundColor: volumeFinished ? colors.primary : colors.surface, borderWidth: volumeFinished ? 0 : 1, borderColor: colors.border, paddingVertical: 14, opacity: pressed ? 0.76 : volumeFinished ? 1 : 0.62 })}><Text className={`text-center font-bold ${volumeFinished ? "text-white" : "text-muted"}`}>Итог тома →</Text></Pressable>}
        </View>
        {isLastLesson && !volumeFinished ? <Text className="mt-3 text-center text-sm leading-5 text-muted">Отметьте все уроки тома как пройденные, чтобы открыть итоговую мини-задачу.</Text> : null}
      </ScrollView>
    </ScreenContainer>
  );
}
