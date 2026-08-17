import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { CodeCard } from "@/components/code-card";
import { ScreenContainer } from "@/components/screen-container";
import { loadActivityProgress, recordPracticeSuccess } from "@/lib/course-progress";
import { addErrorCard } from "@/lib/project-learning";
import { useThemeContext } from "@/lib/theme-provider";
import { trpc } from "@/lib/trpc";
import { evaluatePractice, practiceChallenges, practiceVolumeLabels, type PracticeVolume } from "@/shared/practice-challenges";

const volumes: PracticeVolume[] = ["junior", "middle", "senior", "web"];

export default function PracticeScreen() {
  const router = useRouter();
  const { fontScale } = useThemeContext();
  const [selectedVolume, setSelectedVolume] = useState<PracticeVolume>("junior");
  const [index, setIndex] = useState(0);
  const [solvedIds, setSolvedIds] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [coachMessage, setCoachMessage] = useState<string | null>(null);
  const coach = trpc.codeCoach.analyze.useMutation();
  const challenges = useMemo(() => practiceChallenges.filter((item) => item.volume === selectedVolume), [selectedVolume]);
  const challenge = challenges[index] ?? challenges[0];
  const solvedInVolume = challenges.filter((item) => solvedIds.includes(item.id)).length;
  const totalLabel = `${index + 1} из ${challenges.length}`;

  useFocusEffect(useCallback(() => { loadActivityProgress().then((value) => setSolvedIds(value.practiceSuccessIds)); }, []));

  const resetAttempt = () => {
    setCode("");
    setFeedback(null);
    setIsCorrect(false);
    setShowHint(false);
    setShowSolution(false);
    setCoachMessage(null);
  };

  const changeVolume = (volume: PracticeVolume) => {
    setSelectedVolume(volume);
    setIndex(0);
    resetAttempt();
  };

  const next = () => {
    setIndex((current) => (current + 1) % challenges.length);
    resetAttempt();
  };

  const verify = async () => {
    const result = evaluatePractice(challenge, code);
    setFeedback(result.message);
    setIsCorrect(result.correct);
    if (result.correct) {
      const progress = await recordPracticeSuccess(challenge.id);
      setSolvedIds(progress.practiceSuccessIds);
    } else {
      await addErrorCard({ tag: selectedVolume, title: challenge.title, reason: result.message, correction: challenge.hint });
    }
  };

  const askCoach = async () => {
    setCoachMessage(null);
    try {
      const result = await coach.mutateAsync({ code, task: challenge.task, level: practiceVolumeLabels[selectedVolume] });
      setCoachMessage([result.headline, ...result.issues, result.hint, `Следующий шаг: ${result.nextStep}`].filter(Boolean).join("\n\n"));
    } catch {
      setCoachMessage("Не удалось получить подсказку сейчас. Попробуйте встроенную подсказку и повторите запрос немного позже.");
    }
  };

  return (
    <ScreenContainer className="px-5">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}><Text className="mb-5 pt-2 text-base font-semibold text-primary">‹ Назад</Text></Pressable>
        <Text className="text-3xl font-bold text-foreground">Мини‑тренажёр</Text>
        <Text className="mt-2 text-base leading-6 text-muted">Переходите от простых шагов к серьёзным проектам. Каждая задача — маленькая самостоятельная победа.</Text>
        <View className="mt-5 flex-row flex-wrap gap-2">
          {volumes.map((volume) => {
            const active = selectedVolume === volume;
            const solved = practiceChallenges.filter((item) => item.volume === volume && solvedIds.includes(item.id)).length;
            const total = practiceChallenges.filter((item) => item.volume === volume).length;
            return <Pressable key={volume} onPress={() => changeVolume(volume)} style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })} className={`w-[48%] rounded-2xl border p-3 ${active ? "border-primary bg-[#E9EAFE]" : "border-border bg-surface"}`}><Text className={`text-sm font-bold ${active ? "text-primary" : "text-foreground"}`}>{practiceVolumeLabels[volume]}</Text><Text className="mt-1 text-xs text-muted">{solved}/{total} решено</Text></Pressable>;
          })}
        </View>

        <View className="mt-5 rounded-3xl bg-[#E9EAFE] p-5"><View className="flex-row items-center justify-between"><Text className="text-sm font-bold uppercase tracking-wide text-primary">{practiceVolumeLabels[selectedVolume]}</Text><Text className="text-sm font-bold text-success">{solvedInVolume}/{challenges.length}</Text></View><Text className="mt-3 text-sm font-bold uppercase tracking-wide text-primary">Задача · {totalLabel}</Text><Text className="mt-2 text-3xl font-bold text-foreground">{challenge.title}</Text><Text className="mt-3 text-sm font-semibold text-[#42446F]">{challenge.level}</Text><Text style={{ fontSize: 16 * fontScale, lineHeight: 25 * fontScale }} className="mt-4 text-[#42446F]">{challenge.task}</Text></View>

        <Text className="mt-7 text-lg font-bold text-foreground">Напишите код</Text>
        <TextInput value={code} onChangeText={setCode} multiline autoCapitalize="none" autoCorrect={false} placeholder="Напишите Python-код здесь" placeholderTextColor="#7C8498" textAlignVertical="top" style={{ minHeight: 170 }} className="mt-3 rounded-2xl border border-[#303A54] bg-[#172033] p-4 font-mono text-[14px] leading-6 text-white" />
        <Text className="mt-2 text-xs leading-4 text-muted">Проверка учебная: она ищет обязательные шаги задания и не запускает произвольный код на устройстве.</Text>
        <Pressable onPress={verify} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] })} className="mt-5 items-center rounded-2xl bg-primary py-4"><Text className="text-base font-bold text-white">Проверить ответ</Text></Pressable>
        {feedback ? <View className={`mt-4 rounded-2xl p-4 ${isCorrect ? "bg-[#DFF5ED]" : "bg-[#FFF1E8]"}`}><Text className={`font-semibold ${isCorrect ? "text-success" : "text-warning"}`}>{feedback}</Text></View> : null}
        <View className="mt-4 rounded-3xl border border-primary bg-[#E9EAFE] p-4"><Text className="text-base font-bold text-foreground">ИИ-помощник по коду</Text><Text className="mt-1 text-sm leading-5 text-[#42446F]">Он не запускает ваш код. Помощник читает учебный фрагмент, ищет понятные ошибки и подсказывает следующий шаг.</Text><Pressable disabled={coach.isPending} onPress={askCoach} style={({ pressed }) => ({ opacity: pressed || coach.isPending ? 0.7 : 1 })} className="mt-3 items-center rounded-xl bg-primary py-3"><Text className="font-bold text-white">{coach.isPending ? "Разбираю код…" : "Попросить подсказку"}</Text></Pressable>{coachMessage ? <Text style={{ fontSize: 14 * fontScale, lineHeight: 21 * fontScale }} className="mt-3 text-foreground">{coachMessage}</Text> : null}</View>
        <View className="mt-5 flex-row gap-3"><Pressable onPress={() => setShowHint((value) => !value)} style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })} className="flex-1 rounded-2xl border border-border bg-surface py-3"><Text className="text-center font-bold text-primary">{showHint ? "Скрыть подсказку" : "Подсказка"}</Text></Pressable><Pressable onPress={() => setShowSolution((value) => !value)} style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })} className="flex-1 rounded-2xl border border-border bg-surface py-3"><Text className="text-center font-bold text-primary">{showSolution ? "Скрыть решение" : "Решение"}</Text></Pressable></View>
        {showHint ? <View className="mt-3 rounded-2xl bg-surface p-4"><Text className="font-bold text-foreground">Маленькая подсказка</Text><Text style={{ fontSize: 15 * fontScale, lineHeight: 22 * fontScale }} className="mt-2 text-foreground">{challenge.hint}</Text></View> : null}
        {showSolution ? <View className="mt-4"><Text className="mb-2 text-base font-bold text-foreground">Один из вариантов</Text><CodeCard code={challenge.solution} /></View> : null}
        <Pressable onPress={next} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })} className="mt-7 items-center rounded-2xl border border-border bg-surface py-4"><Text className="font-bold text-foreground">Следующая задача →</Text></Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
