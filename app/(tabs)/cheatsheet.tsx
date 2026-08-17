import { useMemo, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";

import { CodeCard } from "@/components/code-card";
import { ScreenContainer } from "@/components/screen-container";
import { useThemeContext } from "@/lib/theme-provider";
import { cheatItems } from "@/shared/cheat-sheets";

export default function CheatSheetScreen() {
  const [query, setQuery] = useState("");
  const { fontScale } = useThemeContext();
  const items = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return normalized ? cheatItems.filter((item) => `${item.group} ${item.title} ${item.note}`.toLowerCase().includes(normalized)) : cheatItems;
  }, [query]);

  return (
    <ScreenContainer className="px-5">
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 36 }}
        ListHeaderComponent={<View className="mb-5"><Text className="text-3xl font-bold text-foreground">Шпаргалка</Text><Text style={{ fontSize: 16 * fontScale, lineHeight: 24 * fontScale }} className="mt-2 text-muted">Короткие рабочие примеры: найдите нужный, скопируйте и измените под свою задачу.</Text><TextInput value={query} onChangeText={setQuery} placeholder="Найти: цикл, JSON, API..." placeholderTextColor="#667085" className="mt-5 rounded-2xl border border-border bg-surface px-4 py-3 text-base text-foreground" returnKeyType="done" /></View>}
        ListEmptyComponent={<Text className="text-center text-muted">Ничего не найдено. Попробуйте другое слово.</Text>}
        renderItem={({ item }) => <View className="mb-4 rounded-3xl border border-border bg-surface p-4"><Text className="text-xs font-bold uppercase tracking-wide text-primary">{item.group}</Text><Text style={{ fontSize: 18 * fontScale, lineHeight: 26 * fontScale }} className="mt-1 font-bold text-foreground">{item.title}</Text><Text style={{ fontSize: 14 * fontScale, lineHeight: 20 * fontScale }} className="mt-2 text-muted">{item.note}</Text><View className="mt-3"><CodeCard code={item.code} /></View></View>}
      />
    </ScreenContainer>
  );
}
