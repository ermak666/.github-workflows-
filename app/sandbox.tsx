import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";

type Lab = "basic" | "numpy" | "pandas";

const labs: Record<Lab, { label: string; title: string; description: string; code: string; output: string; note: string }> = {
  basic: { label: "Основы", title: "Безопасные print и расчёты", description: "Потренируйтесь выводить текст и выполнять простую арифметику.", code: 'print("Привет, Python!")\nprint(2 + 3)', output: "Привет, Python!\n5", note: "Можно менять текст и простые числовые выражения внутри print(...)." },
  numpy: { label: "NumPy", title: "Массив и среднее значение", description: "Мини-проект: посчитайте среднее число шагов за четыре дня.", code: 'import numpy as np\nsteps = np.array([4200, 6100, 5300, 7900])\nprint(steps.mean())', output: "5875.0", note: "np.array создаёт массив чисел, а mean() находит их среднее. В учебной лаборатории вывод рассчитан безопасно и предсказуемо." },
  pandas: { label: "Pandas", title: "Таблица продаж и среднее", description: "Мини-проект: найдите среднюю сумму заказа в маленькой таблице.", code: 'import pandas as pd\nsales = pd.DataFrame({"order": [120, 80, 150], "item": ["книга", "ручка", "книга"]})\nprint(sales["order"].mean())', output: "116.66666666666667", note: "pd.DataFrame создаёт таблицу, а выбор столбца sales[\"order\"] даёт серию значений. Метод mean() вычисляет среднее." },
};

function runBasicCode(source: string) {
  const lines = source.split("\n").map((line) => line.trim()).filter(Boolean);
  const output: string[] = [];
  for (const line of lines) {
    const text = line.match(/^print\((['"])(.*?)\1\)$/);
    if (text) { output.push(text[2]); continue; }
    const math = line.match(/^print\(([\d\s+\-*/().]+)\)$/);
    if (math && /^[\d\s+\-*/().]+$/.test(math[1])) {
      try { output.push(String(Function(`"use strict"; return (${math[1]})`)())); continue; } catch { return "Не получилось посчитать выражение. Проверьте скобки и знаки."; }
    }
    return "В базовом режиме доступны print(\"текст\") и print(числовое выражение). Для NumPy и Pandas выберите одну из учебных лабораторий выше.";
  }
  return output.length ? output.join("\n") : "Добавьте хотя бы одну безопасную команду print(...).";
}

export default function SandboxScreen() {
  const router = useRouter();
  const [lab, setLab] = useState<Lab>("basic");
  const [code, setCode] = useState(labs.basic.code);
  const [output, setOutput] = useState("");
  const selectLab = (next: Lab) => { setLab(next); setCode(labs[next].code); setOutput(""); };
  const active = labs[lab];
  const run = () => setOutput(lab === "basic" ? runBasicCode(code) : active.output);
  return <ScreenContainer className="px-5"><ScrollView contentContainerStyle={{ paddingBottom: 40 }}><Pressable onPress={() => router.back()}><Text className="mb-5 pt-2 font-semibold text-primary">‹ Назад</Text></Pressable><Text className="text-3xl font-bold text-foreground">Учебная песочница</Text><Text className="mt-2 text-base leading-6 text-muted">Мини-лаборатории объясняют популярные библиотеки на небольших наборах данных. Выполнение ограничено учебными командами, поэтому произвольный код и системные операции не запускаются.</Text><View className="mt-5 flex-row gap-2">{(Object.keys(labs) as Lab[]).map((id) => <Pressable key={id} onPress={() => selectLab(id)} className={`flex-1 rounded-xl py-3 ${lab === id ? "bg-primary" : "border border-border bg-surface"}`}><Text className={`text-center font-bold ${lab === id ? "text-white" : "text-foreground"}`}>{labs[id].label}</Text></Pressable>)}</View><View className="mt-5 rounded-3xl bg-[#E9EAFE] p-5"><Text className="text-xl font-bold text-foreground">{active.title}</Text><Text className="mt-2 text-sm leading-5 text-[#42446F]">{active.description}</Text></View><TextInput value={code} onChangeText={setCode} multiline autoCapitalize="none" autoCorrect={false} textAlignVertical="top" className="mt-5 min-h-48 rounded-3xl bg-[#172033] px-4 py-4 font-mono text-white" /><Pressable onPress={run} className="mt-4 items-center rounded-2xl bg-primary py-4"><Text className="font-bold text-white">Запустить учебный пример</Text></Pressable><View className="mt-4 min-h-24 rounded-3xl border border-border bg-surface p-4"><Text className="text-xs font-bold text-primary">ВЫВОД</Text><Text className="mt-3 font-mono text-sm text-foreground">{output || "Результат появится здесь."}</Text></View><View className="mt-4 rounded-3xl border border-border bg-surface p-5"><Text className="text-sm font-bold text-primary">РАЗБОР</Text><Text className="mt-2 text-sm leading-5 text-muted">{active.note}</Text></View><View className="mt-4 rounded-3xl bg-[#172033] p-5"><Text className="font-bold text-white">Куда дальше?</Text><Text className="mt-2 text-sm leading-5 text-[#D8DDEA]">После лаборатории перенесите идею в мини-проект: таблицу личных расходов, статистику задач или небольшой анализ продаж.</Text></View></ScrollView></ScreenContainer>;
}
