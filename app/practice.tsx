import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { CodeCard } from "@/components/code-card";
import { ScreenContainer } from "@/components/screen-container";
import { recordPracticeSuccess } from "@/lib/course-progress";
import { useThemeContext } from "@/lib/theme-provider";
import { evaluatePractice, practiceChallenges } from "@/shared/practice-challenges";

export default function PracticeScreen() {
  const router = useRouter();
  const { fontScale } = useThemeContext();
  const [index, setIndex] = useState(0);
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const challenge = practiceChallenges[index];
  const totalLabel = useMemo(() => `${index + 1} из ${practiceChallenges.length}`, [index]);

  const next = () => {
    setIndex((current) => (current + 1) % practiceChallenges.length);
    setCode("");
    setFeedback(null);
    setIsCorrect(false);
    setShowHint(false);
    setShowSolution(false);
  };

  const verify = async () => {
    const result = evaluatePractice(challenge, code);
    setFeedback(result.message);
    setIsCorrect(result.correct);
    if (result.correct) await recordPracticeSuccess(challenge.id);
  };

  return (
    <ScreenContainer className="px-5">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}><Text className="mb-5 pt-2 text-base font-semibold text-primary">‹ Назад</Text></Pressable>
        <View className="rounded-3xl bg-[#E9EAFE] p-5"><Text className="text-sm font-bold uppercase tracking-wide text-primary">Тренажёр · {totalLabel}</Text><Text className="mt-2 text-3xl font-bold text-foreground">{challenge.title}</Text><Text className="mt-3 text-sm font-semibold text-[#42446F]">{challenge.level}</Text><Text style={{ fontSize: 16 * fontScale, lineHeight: 25 * fontScale }} className="mt-4 text-[#42446F]">{challenge.task}</Text></View>

        <Text className="mt-7 text-lg font-bold text-foreground">Напишите код</Text>
        <TextInput value={code} onChangeText={setCode} multiline autoCapitalize="none" autoCorrect={false} placeholder="Напишите Python-код здесь" placeholderTextColor="#7C8498" textAlignVertical="top" style={{ minHeight: 170 }} className="mt-3 rounded-2xl border border-[#303A54] bg-[#172033] p-4 font-mono text-[14px] leading-6 text-white" />
        <Text className="mt-2 text-xs leading-4 text-muted">Проверка учебная: она ищет обязательные шаги задания и не запускает произвольный код на устройстве.</Text>

        <Pressable onPress={verify} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] })} className="mt-5 items-center rounded-2xl bg-primary py-4"><Text className="text-base font-bold text-white">Проверить ответ</Text></Pressable>
        {feedback ? <View className={`mt-4 rounded-2xl p-4 ${isCorrect ? "bg-[#DFF5ED]" : "bg-[#FFF1E8]"}`}><Text className={`font-semibold ${isCorrect ? "text-success" : "text-warning"}`}>{feedback}</Text></View> : null}

        <View className="mt-5 flex-row gap-3"><Pressable onPress={() => setShowHint((value) => !value)} style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })} className="flex-1 rounded-2xl border border-border bg-surface py-3"><Text className="text-center font-bold text-primary">{showHint ? "Скрыть подсказку" : "Подсказка"}</Text></Pressable><Pressable onPress={() => setShowSolution((value) => !value)} style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })} className="flex-1 rounded-2xl border border-border bg-surface py-3"><Text className="text-center font-bold text-primary">{showSolution ? "Скрыть решение" : "Решение"}</Text></Pressable></View>
        {showHint ? <View className="mt-3 rounded-2xl bg-surface p-4"><Text className="font-bold text-foreground">Маленькая подсказка</Text><Text style={{ fontSize: 15 * fontScale, lineHeight: 22 * fontScale }} className="mt-2 text-foreground">{challenge.hint}</Text></View> : null}
        {showSolution ? <View className="mt-4"><Text className="mb-2 text-base font-bold text-foreground">Один из вариантов</Text><CodeCard code={challenge.solution} /></View> : null}
        <Pressable onPress={next} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })} className="mt-7 items-center rounded-2xl border border-border bg-surface py-4"><Text className="font-bold text-foreground">Следующая задача →</Text></Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
