import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { BackButton } from "@/components/back-button";
import { CodeCard } from "@/components/code-card";
import { ScreenContainer } from "@/components/screen-container";
import { loadActivityProgress, loadCompletedLessons, recordVolumeFinalSuccess, VOLUME_FINAL_TEST_VERSION } from "@/lib/course-progress";
import { useColors } from "@/hooks/use-colors";
import { getNextVolume, getVolume, isVolumeComplete } from "@/shared/course-data";
import { getVolumeFinalTask } from "@/shared/volume-final-tasks";
import { formatElapsedTime } from "@/lib/quiz-timer";

export default function VolumeFinalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const volume = getVolume(id);
  const task = getVolumeFinalTask(id);
  const nextVolume = getNextVolume(id);
  const [completed, setCompleted] = useState<string[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [checked, setChecked] = useState(false);
  const [alreadyPassed, setAlreadyPassed] = useState(false);
  const [timerStartedAt, setTimerStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useFocusEffect(useCallback(() => {
    loadCompletedLessons().then(setCompleted);
    loadActivityProgress().then((activity) => setAlreadyPassed(activity.volumeFinalTestVersions?.[id ?? ""] === VOLUME_FINAL_TEST_VERSION));
    setAnswers([]);
    setChecked(false);
    setTimerStartedAt(null);
    setElapsedSeconds(0);
  }, [id]));

  const lessonsFinished = volume ? isVolumeComplete(volume, completed) : false;
  const timerRunning = Boolean(volume && task && lessonsFinished && !alreadyPassed && !checked);

  useEffect(() => {
    if (!timerRunning) return;
    const startedAt = timerStartedAt ?? Date.now();
    if (timerStartedAt === null) setTimerStartedAt(startedAt);
    const updateTime = () => setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, timerStartedAt]);

  if (!volume || !task) return <ScreenContainer className="items-center justify-center p-6"><Text className="text-foreground">Итоговое задание не найдено.</Text></ScreenContainer>;

  const answeredCount = answers.filter((answer) => answer !== null).length;
  const correctCount = task.questions.reduce((count, question, index) => count + (answers[index] === question.correctIndex ? 1 : 0), 0);
  const passed = alreadyPassed || (checked && correctCount === task.questions.length);
  const selectAnswer = (questionIndex: number, optionIndex: number) => {
    if (checked || alreadyPassed) return;
    setAnswers((current) => {
      const next = [...current];
      next[questionIndex] = optionIndex;
      return next;
    });
  };
  const finishTest = async () => {
    if (timerStartedAt !== null) setElapsedSeconds(Math.floor((Date.now() - timerStartedAt) / 1000));
    setChecked(true);
    if (correctCount === task.questions.length) {
      await recordVolumeFinalSuccess(volume.id);
      setAlreadyPassed(true);
    }
  };

  return (
    <ScreenContainer className="px-5">
      <ScrollView contentContainerStyle={{ paddingBottom: 42 }} showsVerticalScrollIndicator={false}>
        <BackButton label="К содержанию" onPress={() => router.replace(`/volume/${volume.id}` as never)} />
        <View className="mt-3 overflow-hidden rounded-[30px] border border-[#354062] bg-[#151A36] p-5">
          <View className="absolute -right-9 -top-10 h-36 w-36 rounded-full bg-[#7056E8] opacity-45" />
          <Text className="text-xs font-bold tracking-widest text-[#C9C6FF]">{task.label.toUpperCase()}</Text>
          <Text className="mt-3 text-3xl font-bold leading-10 text-white">{task.title}</Text>
          <Text className="mt-3 text-base leading-6 text-[#D8DDEA]">Ответь верно на все {task.questions.length} вопроса — и откроется следующий большой шаг.</Text>
        </View>

        {!lessonsFinished ? <View className="mt-5 rounded-3xl border border-border bg-surface p-5"><Text className="text-lg font-bold text-foreground">Сначала закончи уроки тома</Text><Text className="mt-2 text-sm leading-5 text-muted">Отметь все {volume.lessons.length} уроков как пройденные. Тогда итоговый тест станет доступен.</Text><Pressable accessibilityRole="button" onPress={() => router.replace(`/volume/${volume.id}` as never)} style={({ pressed }) => ({ marginTop: 16, alignItems: "center", borderRadius: 16, backgroundColor: colors.primary, paddingVertical: 14, opacity: pressed ? 0.8 : 1 })}><Text className="font-bold text-white">Вернуться к урокам</Text></Pressable></View> : <View className="mt-5"><View className="flex-row items-center justify-between"><Text className="text-lg font-bold text-foreground">Итоговый тест</Text><Text className="text-sm font-bold text-primary">{alreadyPassed ? "Пройден" : `${answeredCount} из ${task.questions.length}`}</Text></View><View className="mt-3 flex-row items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3"><View><Text className="text-xs font-bold tracking-widest text-muted">ВРЕМЯ НА ТЕСТ</Text><Text className="mt-1 text-xs text-muted">{checked ? "Попытка завершена" : alreadyPassed ? "Тест уже пройден" : "Отсчёт идёт"}</Text></View><Text className="text-2xl font-bold text-primary">{alreadyPassed ? "—" : formatElapsedTime(elapsedSeconds)}</Text></View><Text className="mt-2 text-sm leading-5 text-muted">Для завершения тома нужно ответить правильно на все вопросы.</Text>{!passed ? task.questions.map((question, questionIndex) => <View key={question.prompt} className="mt-5 rounded-3xl border border-border bg-surface p-5"><Text className="text-xs font-bold tracking-widest text-primary">ВОПРОС {questionIndex + 1} ИЗ {task.questions.length}</Text><Text className="mt-3 text-base font-bold leading-6 text-foreground">{question.prompt}</Text>{question.code ? <View className="mt-4"><CodeCard code={question.code} /></View> : null}<View className="mt-4 gap-2">{question.options.map((option, optionIndex) => { const selected = answers[questionIndex] === optionIndex; const correct = optionIndex === question.correctIndex; const backgroundColor = checked && correct ? colors.success : checked && selected ? colors.error : selected ? colors.background : colors.surface; const borderColor = checked && correct ? colors.success : checked && selected ? colors.error : selected ? colors.primary : colors.border; return <Pressable key={option} accessibilityRole="button" disabled={checked} onPress={() => selectAnswer(questionIndex, optionIndex)} style={({ pressed }) => ({ borderWidth: 1, borderColor, backgroundColor, borderRadius: 16, padding: 15, opacity: pressed ? 0.78 : 1 })}><Text className="font-semibold text-foreground">{option}</Text></Pressable>; })}</View>{checked ? <Text className={`mt-3 text-sm leading-5 ${answers[questionIndex] === question.correctIndex ? "text-success" : "text-error"}`}>{answers[questionIndex] === question.correctIndex ? `✓ ${question.explanation}` : `Правильный ответ: ${question.options[question.correctIndex]}. ${question.explanation}`}</Text> : null}</View>) : null}{!passed && !checked ? <Pressable accessibilityRole="button" disabled={answeredCount !== task.questions.length} onPress={finishTest} style={({ pressed }) => ({ marginTop: 20, alignItems: "center", borderRadius: 16, backgroundColor: colors.primary, paddingVertical: 15, opacity: answeredCount === task.questions.length ? (pressed ? 0.78 : 1) : 0.52 })}><Text className="font-bold text-white">Проверить тест</Text></Pressable> : null}{checked && !passed ? <View className="mt-5 rounded-3xl border border-error bg-surface p-5"><Text className="text-lg font-bold text-error">Пока не сдано: {correctCount} из {task.questions.length}</Text><Text className="mt-2 text-sm leading-5 text-foreground">Ничего страшного. Прочитай разборы и пройди тест ещё раз.</Text><Pressable accessibilityRole="button" onPress={() => { setAnswers([]); setChecked(false); setElapsedSeconds(0); setTimerStartedAt(Date.now()); }} style={({ pressed }) => ({ marginTop: 16, alignItems: "center", borderRadius: 16, backgroundColor: colors.primary, paddingVertical: 14, opacity: pressed ? 0.8 : 1 })}><Text className="font-bold text-white">Попробовать ещё раз</Text></Pressable></View> : null}{passed ? <View className="mt-5 rounded-3xl border border-success bg-surface p-5"><Text className="text-lg font-bold text-success">✓ Том завершён</Text><Text className="mt-2 text-sm leading-5 text-foreground">Итоговый тест успешно пройден: {task.questions.length} из {task.questions.length}. Время: {formatElapsedTime(elapsedSeconds)}.</Text><Pressable accessibilityRole="button" onPress={() => router.replace((nextVolume ? `/volume/${nextVolume.id}` : "/") as never)} style={({ pressed }) => ({ marginTop: 16, alignItems: "center", borderRadius: 16, backgroundColor: colors.primary, paddingVertical: 14, opacity: pressed ? 0.8 : 1 })}><Text className="font-bold text-white">{nextVolume ? `Открыть ${nextVolume.title}` : "Вернуться на главную"}</Text></Pressable></View> : null}</View>}
      </ScrollView>
    </ScreenContainer>
  );
}
