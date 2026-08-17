import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import * as Clipboard from "expo-clipboard";

import { ScreenContainer } from "@/components/screen-container";
import { loadToolkit, saveToolkit, type ToolkitState } from "@/lib/study-toolkit";

const volumes = ["junior", "middle", "senior", "web"];

export default function LearningToolsScreen() {
  const router = useRouter();
  const [toolkit, setToolkit] = useState<ToolkitState | null>(null);
  const [noteKey, setNoteKey] = useState("Мой первый урок");
  const [note, setNote] = useState("");
  const [snippetTitle, setSnippetTitle] = useState("");
  const [snippetCode, setSnippetCode] = useState("");
  const [message, setMessage] = useState("");
  useFocusEffect(useCallback(() => { loadToolkit().then((value) => { setToolkit(value); setNote(value.notes["Мой первый урок"] ?? ""); }); }, []));
  if (!toolkit) return <ScreenContainer className="items-center justify-center"><Text className="text-muted">Загружаем инструменты…</Text></ScreenContainer>;

  const saveNote = async () => { const next = await saveToolkit({ ...toolkit, notes: { ...toolkit.notes, [noteKey]: note } }); setToolkit(next); setMessage("Заметка сохранена только на этом устройстве."); };
  const addSnippet = async () => { if (!snippetTitle.trim() || !snippetCode.trim()) { setMessage("Введите название и хотя бы одну строку кода."); return; } const snippet = { id: String(Date.now()), title: snippetTitle.trim(), code: snippetCode.trim(), tags: ["моя-подборка"], createdAt: new Date().toISOString() }; const next = await saveToolkit({ ...toolkit, snippets: [snippet, ...toolkit.snippets] }); setToolkit(next); setSnippetTitle(""); setSnippetCode(""); setMessage("Фрагмент сохранён в вашей подборке."); };
  const copyExport = async () => { const text = [`# Мои заметки Python`, ...Object.entries(toolkit.notes).map(([title, body]) => `\n## ${title}\n${body}`), ...toolkit.snippets.map((item) => `\n## ${item.title}\n\`\`\`python\n${item.code}\n\`\`\``)].join("\n"); await Clipboard.setStringAsync(text); setMessage("Markdown с заметками и фрагментами скопирован в буфер обмена."); };
  const toggleVolume = async (volume: string) => { const offlineVolumes = toolkit.offlineVolumes.includes(volume) ? toolkit.offlineVolumes.filter((item) => item !== volume) : [...toolkit.offlineVolumes, volume]; setToolkit(await saveToolkit({ ...toolkit, offlineVolumes })); };

  return <ScreenContainer className="px-5"><ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}><Pressable onPress={() => router.back()}><Text className="mb-5 pt-2 font-semibold text-primary">‹ Назад</Text></Pressable><Text className="text-3xl font-bold text-foreground">Мои инструменты</Text><Text className="mt-2 text-base leading-6 text-muted">Собирайте свои мысли и рабочие кусочки кода. Всё сохраняется локально на устройстве.</Text>{message ? <Text className="mt-3 rounded-xl bg-[#E9EAFE] p-3 text-sm text-primary">{message}</Text> : null}
    <View className="mt-6 rounded-3xl border border-border bg-surface p-5"><Text className="text-lg font-bold text-foreground">Заметка к уроку</Text><TextInput value={noteKey} onChangeText={setNoteKey} placeholder="Название урока" placeholderTextColor="#667085" className="mt-3 rounded-xl border border-border bg-background px-3 py-3 text-foreground" /><TextInput value={note} onChangeText={setNote} multiline placeholder="Что вы хотите запомнить?" placeholderTextColor="#667085" textAlignVertical="top" className="mt-3 min-h-28 rounded-xl border border-border bg-background px-3 py-3 text-foreground" /><Pressable onPress={saveNote} className="mt-3 items-center rounded-xl bg-primary py-3"><Text className="font-bold text-white">Сохранить заметку</Text></Pressable></View>
    <View className="mt-4 rounded-3xl border border-border bg-surface p-5"><Text className="text-lg font-bold text-foreground">Мой фрагмент кода</Text><TextInput value={snippetTitle} onChangeText={setSnippetTitle} placeholder="Название, например: чтение JSON" placeholderTextColor="#667085" className="mt-3 rounded-xl border border-border bg-background px-3 py-3 text-foreground" /><TextInput value={snippetCode} onChangeText={setSnippetCode} multiline autoCapitalize="none" placeholder="Python-код" placeholderTextColor="#7C8498" textAlignVertical="top" className="mt-3 min-h-28 rounded-xl bg-[#172033] px-3 py-3 font-mono text-white" /><Pressable onPress={addSnippet} className="mt-3 items-center rounded-xl bg-primary py-3"><Text className="font-bold text-white">Сохранить фрагмент</Text></Pressable>{toolkit.snippets.slice(0, 3).map((item) => <View key={item.id} className="mt-3 rounded-xl bg-background p-3"><Text className="font-bold text-foreground">{item.title}</Text><Text numberOfLines={3} className="mt-1 font-mono text-xs text-muted">{item.code}</Text></View>)}</View>
    <View className="mt-4 rounded-3xl border border-border bg-surface p-5"><Text className="text-lg font-bold text-foreground">Офлайн-пакеты</Text><Text className="mt-2 text-sm leading-5 text-muted">Отметьте тома, которые хотите всегда держать доступными для чтения. Материалы уже находятся в приложении; выбор помогает организовать личную библиотеку.</Text><View className="mt-3 flex-row flex-wrap gap-2">{volumes.map((volume) => { const active = toolkit.offlineVolumes.includes(volume); return <Pressable key={volume} onPress={() => toggleVolume(volume)} className={`rounded-full px-4 py-2 ${active ? "bg-success" : "bg-background border border-border"}`}><Text className={`font-bold ${active ? "text-white" : "text-foreground"}`}>{active ? "✓ " : ""}{volume}</Text></Pressable>; })}</View></View>
    <Pressable onPress={copyExport} className="mt-4 items-center rounded-2xl border border-primary bg-[#E9EAFE] py-4"><Text className="font-bold text-primary">Экспортировать в Markdown</Text></Pressable>
  </ScrollView></ScreenContainer>;
}
