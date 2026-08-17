import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";

function runSafeCode(source: string) {
  const lines = source.split("\n").map((line) => line.trim()).filter(Boolean);
  const output: string[] = [];
  for (const line of lines) {
    const text = line.match(/^print\((['"])(.*?)\1\)$/);
    if (text) { output.push(text[2]); continue; }
    const math = line.match(/^print\(([\d\s+\-*/().]+)\)$/);
    if (math && /^[\d\s+\-*/().]+$/.test(math[1])) {
      try { output.push(String(Function(`"use strict"; return (${math[1]})`)())); continue; } catch { return "Не получилось посчитать выражение. Проверьте скобки и знаки."; }
    }
    return "Песочница принимает только безопасные print(\"текст\") и print(числовое выражение). Для циклов и функций используйте тренажёр и мини-проекты.";
  }
  return output.length ? output.join("\n") : "Добавьте хотя бы одну безопасную команду print(...).";
}

export default function SandboxScreen() {
  const router = useRouter();
  const [code, setCode] = useState('print("Привет, Python!")\nprint(2 + 3)');
  const [output, setOutput] = useState("");
  return <ScreenContainer className="px-5"><ScrollView contentContainerStyle={{ paddingBottom: 40 }}><Pressable onPress={() => router.back()}><Text className="mb-5 pt-2 font-semibold text-primary">‹ Назад</Text></Pressable><Text className="text-3xl font-bold text-foreground">Учебная песочница</Text><Text className="mt-2 text-base leading-6 text-muted">Здесь можно безопасно попробовать вывод текста и простые числовые расчёты. Команды выполняются только в ограниченном учебном режиме.</Text><TextInput value={code} onChangeText={setCode} multiline autoCapitalize="none" autoCorrect={false} textAlignVertical="top" className="mt-6 min-h-44 rounded-3xl bg-[#172033] px-4 py-4 font-mono text-white" /><Pressable onPress={() => setOutput(runSafeCode(code))} className="mt-4 items-center rounded-2xl bg-primary py-4"><Text className="font-bold text-white">Запустить безопасно</Text></Pressable><View className="mt-4 min-h-24 rounded-3xl border border-border bg-surface p-4"><Text className="text-xs font-bold text-primary">ВЫВОД</Text><Text className="mt-3 font-mono text-sm text-foreground">{output || "Результат появится здесь."}</Text></View></ScrollView></ScreenContainer>;
}
