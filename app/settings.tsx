import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useThemeContext } from "@/lib/theme-provider";

const fontOptions = [
  { label: "Маленький", value: 0.9 },
  { label: "Обычный", value: 1 },
  { label: "Крупный", value: 1.15 },
] as const;

export default function SettingsScreen() {
  const router = useRouter();
  const { colorScheme, setColorScheme, fontScale, setFontScale } = useThemeContext();
  return (
    <ScreenContainer className="px-5">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
          <Text className="mb-5 pt-2 text-base font-semibold text-primary">‹ Назад</Text>
        </Pressable>
        <Text className="text-3xl font-bold text-foreground">Комфорт чтения</Text>
        <Text className="mt-2 text-base leading-6 text-muted">Настройки хранятся только на этом устройстве и применяются сразу.</Text>

        <View className="mt-7 rounded-3xl border border-border bg-surface p-5">
          <Text className="text-lg font-bold text-foreground">Тема оформления</Text>
          <Text className="mt-1 text-sm leading-5 text-muted">Выберите спокойную тему, удобную для ваших глаз.</Text>
          <View className="mt-4 flex-row gap-3">
            {(["light", "dark"] as const).map((scheme) => {
              const active = colorScheme === scheme;
              return <Pressable key={scheme} onPress={() => setColorScheme(scheme)} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })} className={`flex-1 items-center rounded-2xl border px-3 py-4 ${active ? "border-primary bg-[#E9EAFE]" : "border-border bg-background"}`}><Text className="text-xl">{scheme === "light" ? "☀︎" : "◐"}</Text><Text className={`mt-1 font-bold ${active ? "text-primary" : "text-foreground"}`}>{scheme === "light" ? "Светлая" : "Тёмная"}</Text></Pressable>;
            })}
          </View>
        </View>

        <View className="mt-4 rounded-3xl border border-border bg-surface p-5">
          <Text className="text-lg font-bold text-foreground">Размер текста</Text>
          <Text style={{ fontSize: 16 * fontScale, lineHeight: 24 * fontScale }} className="mt-3 text-foreground">Так будет выглядеть объяснение в уроке. Выберите размер, при котором читать легко.</Text>
          <View className="mt-5 flex-row gap-2">
            {fontOptions.map((option) => {
              const active = fontScale === option.value;
              return <Pressable key={option.label} onPress={() => setFontScale(option.value)} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })} className={`flex-1 items-center rounded-xl border py-3 ${active ? "border-primary bg-primary" : "border-border bg-background"}`}><Text className={`font-bold ${active ? "text-white" : "text-foreground"}`}>{option.label}</Text></Pressable>;
            })}
          </View>
        </View>
        <Pressable onPress={() => router.push("/reminders" as never)} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })} className="mt-4 flex-row items-center justify-between rounded-3xl border border-border bg-surface p-5"><View className="flex-1"><Text className="text-lg font-bold text-foreground">Ежедневное напоминание</Text><Text className="mt-1 text-sm leading-5 text-muted">Выберите время для спокойного приглашения к практике.</Text></View><Text className="ml-3 text-xl font-bold text-primary">›</Text></Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
