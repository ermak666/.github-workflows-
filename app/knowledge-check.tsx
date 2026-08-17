import { useEffect, useMemo, useState } from "react";
import { BackHandler, Pressable, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { loadCompletedLessons } from "@/lib/course-progress";
import { buildReviewQuestions, markRecoveryPassed, markWeeklyCompleted, markWeeklyPromptSeen, requiredCorrectAnswers } from "@/lib/knowledge-review";

const questionCount = 20;

export default function KnowledgeCheckScreen() {
  const router = useRouter();
  const { mode: rawMode } = useLocalSearchParams<{ mode?: string }>();
  const mode = rawMode === "weekly" || rawMode === "weekly-intro" ? rawMode : "recovery";
  const [completedIds, setCompletedIds] = useState<string[] | null>(null);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const questions = useMemo(() => buildReviewQuestions(completedIds ?? [], questionCount), [completedIds]);
  const recovery = mode === "recovery";
  const weeklyIntro = mode === "weekly-intro";
  const threshold = requiredCorrectAnswers(questionCount);

  useEffect(() => { loadCompletedLessons().then(setCompletedIds); }, []);
  useEffect(() => {
    if (!recovery) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => subscription.remove();
  }, [recovery]);

  const startWeekly = async () => {
    await markWeeklyPromptSeen();
    router.replace("/knowledge-check?mode=weekly" as never);
  };
  const skipWeekly = async () => { await markWeeklyPromptSeen(); router.replace("/(tabs)" as never); };
  const answer = async (optionIndex: number) => {
    const isCorrect = questions[index].correctIndex === optionIndex;
    const nextCorrect = correct + (isCorrect ? 1 : 0);
    const nextAnswers = { ...answers, [questions[index].id]: optionIndex };
    setAnswers(nextAnswers);
    if (index + 1 >= questions.length) {
      setCorrect(nextCorrect);
      setFinished(true);
      if (!recovery) await markWeeklyCompleted();
      return;
    }
    setCorrect(nextCorrect);
    setIndex((value) => value + 1);
  };
  const retry = () => { setIndex(0); setCorrect(0); setFinished(false); setAnswers({}); };
  const continueAfterSuccess = async () => { await markRecoveryPassed(); router.replace("/(tabs)" as never); };

  if (weeklyIntro) {
    return <ScreenContainer className="px-5"><View className="flex-1 justify-center"><View className="rounded-[30px] bg-[#111426] p-6"><Text className="text-sm font-bold tracking-widest text-[#C9C6FF]">ЕЖЕНЕДЕЛЬНАЯ ПРОВЕРКА</Text><Text className="mt-3 text-3xl font-bold text-white">Хотите проверить свои знания?</Text><Text className="mt-4 text-base leading-6 text-[#D8DDEA]">Вас ждёт блиц из 20 вопросов по уже пройденным темам. Это добровольная проверка без блокировки обучения.</Text><Pressable onPress={startWeekly} style={({ pressed }) => [{ marginTop: 24, borderRadius: 16, backgroundColor: "#7056E8", paddingVertical: 15, alignItems: "center" }, { opacity: pressed ? 0.82 : 1 }]}><Text className="font-bold text-white">Начать блиц →</Text></Pressable><Pressable onPress={skipWeekly} style={({ pressed }) => [{ marginTop: 12, paddingVertical: 12, alignItems: "center" }, { opacity: pressed ? 0.65 : 1 }]}><Text className="font-bold text-[#D8DDEA]">Не сейчас</Text></Pressable></View></View></ScreenContainer>;
  }

  if (completedIds === null) return <ScreenContainer className="items-center justify-center"><Text className="text-foreground">Готовим вопросы…</Text></ScreenContainer>;
  if (!questions.length) return <ScreenContainer className="px-5"><View className="flex-1 justify-center"><Text className="text-3xl font-bold text-foreground">Сначала пройдите хотя бы один урок</Text><Text className="mt-3 text-base leading-6 text-muted">После этого приложение сможет составить вопросы по вашим темам.</Text><Pressable onPress={() => router.replace("/(tabs)" as never)} style={({ pressed }) => [{ marginTop: 24, borderRadius: 16, backgroundColor: "#7056E8", paddingVertical: 15, alignItems: "center" }, { opacity: pressed ? 0.82 : 1 }]}><Text className="font-bold text-white">К урокам</Text></Pressable></View></ScreenContainer>;

  if (finished) {
    const passed = !recovery || correct >= threshold;
    if (!recovery) {
      return <ScreenContainer className="px-5"><ScrollView contentContainerStyle={{ paddingVertical: 18, paddingBottom: 44 }}><View className="rounded-[30px] bg-[#111426] p-6"><Text className="text-sm font-bold tracking-widest text-[#C9C6FF]">БЛИЦ-ОПРОС ЗАВЕРШЁН</Text><Text className="mt-3 text-3xl font-bold text-white">Ваш результат: {correct}/{questionCount}</Text><Text className="mt-3 text-base leading-6 text-[#D8DDEA]">Ниже — разбор всех ответов. Ошибки — это не провал, а точная карта тем для повторения.</Text></View><Text className="mt-7 text-xl font-bold text-foreground">Подробный разбор</Text><View className="mt-4 gap-4">{questions.map((item, itemIndex) => { const answerIndex = answers[item.id]; const isCorrect = answerIndex === item.correctIndex; return <View key={item.id} style={{ borderRadius: 20, borderWidth: 1, borderColor: isCorrect ? "#A8E3D2" : "#F4C7A4", backgroundColor: isCorrect ? "#EFFAF6" : "#FFF5ED", padding: 16 }}><Text className="text-sm font-bold text-foreground">{itemIndex + 1}. {isCorrect ? "Верно" : "Нужно повторить"}</Text><Text className="mt-2 text-base font-semibold leading-6 text-foreground">{item.question}</Text><Text className="mt-3 text-sm leading-5 text-muted">Ваш ответ: {answerIndex === undefined ? "нет ответа" : item.options[answerIndex]}</Text><Text className="mt-1 text-sm font-semibold leading-5 text-foreground">Правильный ответ: {item.options[item.correctIndex]}</Text><Text className="mt-3 text-sm leading-5 text-foreground">{item.explanation}</Text><Pressable onPress={() => router.push({ pathname: "/lesson/[id]", params: { id: item.sourceLessonId } } as never)} style={({ pressed }) => [{ marginTop: 14, alignSelf: "flex-start", borderRadius: 12, backgroundColor: "#7056E8", paddingHorizontal: 13, paddingVertical: 10 }, { opacity: pressed ? 0.78 : 1 }]}><Text className="font-bold text-white">Открыть урок: {item.sourceLessonTitle} →</Text></Pressable></View>; })}</View><Pressable onPress={() => router.replace("/(tabs)" as never)} style={({ pressed }) => [{ marginTop: 24, borderRadius: 16, backgroundColor: "#18A77B", paddingVertical: 15, alignItems: "center" }, { opacity: pressed ? 0.82 : 1 }]}><Text className="font-bold text-white">Вернуться к обучению</Text></Pressable></ScrollView></ScreenContainer>;
    }
    return <ScreenContainer className="px-5"><View className="flex-1 justify-center"><View className="rounded-[30px] bg-surface p-6"><Text className="text-sm font-bold tracking-widest text-primary">{recovery ? "ПОВТОРЕНИЕ" : "БЛИЦ-ОПРОС"}</Text><Text className="mt-3 text-3xl font-bold text-foreground">{passed ? "Отличная работа" : "Нужно повторить ещё раз"}</Text><Text className="mt-4 text-base leading-6 text-muted">Верных ответов: {correct} из {questionCount}.{recovery ? ` Для продолжения нужно минимум ${threshold}.` : " Результат сохранён в вашей учебной истории."}</Text>{passed ? <Pressable onPress={recovery ? continueAfterSuccess : () => router.replace("/(tabs)" as never)} style={({ pressed }) => [{ marginTop: 24, borderRadius: 16, backgroundColor: "#18A77B", paddingVertical: 15, alignItems: "center" }, { opacity: pressed ? 0.82 : 1 }]}><Text className="font-bold text-white">Продолжить обучение →</Text></Pressable> : <Pressable onPress={retry} style={({ pressed }) => [{ marginTop: 24, borderRadius: 16, backgroundColor: "#7056E8", paddingVertical: 15, alignItems: "center" }, { opacity: pressed ? 0.82 : 1 }]}><Text className="font-bold text-white">Начать тест сначала</Text></Pressable>}</View></View></ScreenContainer>;
  }

  const question = questions[index];
  return <ScreenContainer className="px-5"><ScrollView contentContainerStyle={{ paddingVertical: 16, paddingBottom: 40 }}><View style={{ height: 8, borderRadius: 8, backgroundColor: "#E7E0FF", overflow: "hidden" }}><View style={{ width: `${((index + 1) / questionCount) * 100}%`, height: "100%", backgroundColor: "#7056E8" }} /></View><Text className="mt-5 text-sm font-bold tracking-widest text-primary">{recovery ? "ОБЯЗАТЕЛЬНОЕ ПОВТОРЕНИЕ" : "ЕЖЕНЕДЕЛЬНЫЙ БЛИЦ"} · {index + 1}/{questionCount}</Text><Text className="mt-3 text-2xl font-bold leading-8 text-foreground">{question.question}</Text><Text className="mt-3 text-sm leading-5 text-muted">Тема: {question.sourceLessonTitle}</Text><View className="mt-6 gap-3">{question.options.map((option, optionIndex) => <Pressable key={option} onPress={() => answer(optionIndex)} style={({ pressed }) => [{ width: "100%", borderRadius: 18, borderWidth: 1, borderColor: "#D2D5E4", backgroundColor: "#FFFFFF", padding: 16 }, { opacity: pressed ? 0.72 : 1 }]}><Text className="text-base font-semibold leading-6 text-[#171B32]">{option}</Text></Pressable>)}</View>{recovery ? <Text className="mt-6 text-sm leading-5 text-muted">Чтобы продолжить, нужно ответить правильно минимум на {threshold} из {questionCount} вопросов. При неуспехе тест начнётся заново.</Text> : null}</ScrollView></ScreenContainer>;
}
