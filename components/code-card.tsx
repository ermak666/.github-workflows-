import * as Clipboard from "expo-clipboard";
import { useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { runLearningPython } from "@/lib/learning-python";

export function CodeCard({ code }: { code: string }) {
  const [preparedInput, setPreparedInput] = useState("4");
  const [runOutput, setRunOutput] = useState<string[] | null>(null);
  const [runVariables, setRunVariables] = useState<Record<string, string | number | boolean> | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const needsInput = useMemo(() => /\binput\s*\(/.test(code), [code]);
  if (!code.trim()) return null;
  return (
    <View className="rounded-3xl border border-[#303758] bg-[#111426] p-5 shadow-sm">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="rounded-full bg-[#242B4D] px-3 py-1"><Text className="text-xs font-bold uppercase tracking-widest text-[#BFC6FF]">Python</Text></View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Скопировать код"
          onPress={() => Clipboard.setStringAsync(code)}
          style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
        >
          <Text className="rounded-full text-sm font-bold text-[#D3D7FF]">Копировать</Text>
        </Pressable>
      </View>
      <Text selectable className="font-mono text-[13px] leading-6 text-[#F7F5FF]">{code}</Text>
      <View className="mt-5 border-t border-[#303758] pt-4">
        <Text className="text-xs font-bold tracking-wide text-[#BFC6FF]">УЧЕБНЫЙ ЗАПУСК</Text>
        {needsInput ? <TextInput value={preparedInput} onChangeText={setPreparedInput} placeholder="Ответы для input(), каждый с новой строки" placeholderTextColor="#9BA1C9" multiline className="mt-3 rounded-xl border border-[#41496F] bg-[#171D37] px-3 py-3 font-mono text-sm text-white" /> : null}
        <Pressable accessibilityRole="button" onPress={() => { const result = runLearningPython(code, preparedInput); setRunOutput(result.output); setRunVariables(result.variables); setRunError(result.error ?? null); }} style={({ pressed }) => [{ marginTop: 12, alignSelf: "flex-start", borderRadius: 12, backgroundColor: "#8F7BFF", paddingHorizontal: 14, paddingVertical: 10 }, { opacity: pressed ? 0.78 : 1 }]}><Text className="font-bold text-white">▶ Запустить пример</Text></Pressable>
        {runOutput ? <View className="mt-3 rounded-xl bg-[#0B0F22] p-3"><Text className="text-xs font-bold text-[#91E0C4]">РЕЗУЛЬТАТ ВЫПОЛНЕНИЯ</Text>{runOutput.length ? <Text className="mt-2 font-mono text-sm leading-5 text-[#F4F2FF]">{runOutput.join("\n")}</Text> : null}{runVariables && Object.keys(runVariables).length ? <View className={runOutput.length ? "mt-3 border-t border-[#303758] pt-3" : "mt-2"}><Text className="text-xs font-bold text-[#BFC6FF]">ПЕРЕМЕННЫЕ ПОСЛЕ ЗАПУСКА</Text><Text className="mt-2 font-mono text-sm leading-5 text-[#F4F2FF]">{Object.entries(runVariables).map(([name, value]) => `${name} = ${String(value)}`).join("\n")}</Text></View> : null}{!runOutput.length && (!runVariables || !Object.keys(runVariables).length) ? <Text className="mt-2 font-mono text-sm leading-5 text-[#F4F2FF]">Код выполнился: он не печатает текст и не сохраняет переменные.</Text> : null}</View> : null}
        {runError ? <View className="mt-3 rounded-xl bg-[#3B1724] p-3"><Text className="text-xs font-bold text-[#FFB9C5]">ПОДСКАЗКА</Text><Text className="mt-2 text-sm leading-5 text-[#FFE2E8]">{runError}</Text></View> : null}
        <Text className="mt-3 text-xs leading-4 text-[#AAB2D9]">Запуск учебный: без файлов, сети и сторонних библиотек.</Text>
      </View>
    </View>
  );
}
