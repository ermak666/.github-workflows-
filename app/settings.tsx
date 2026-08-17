import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { BackButton } from "@/components/back-button";
import { useThemeContext } from "@/lib/theme-provider";
import { useSoundFeedback } from "@/lib/sound-feedback";

const fontOptions = [
  { label: "Маленький", value: 0.9 },
  { label: "Обычный", value: 1 },
  { label: "Крупный", value: 1.15 },
] as const;

export default function SettingsScreen() {
  const router = useRouter();
  const { colorScheme, setColorScheme, fontScale, setFontScale } = useThemeContext();
  const { playTap } = useSoundFeedback();
  return (
    <ScreenContainer className="px-5">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <BackButton onPress={() => router.back()} />
        <Text className="text-3xl font-bold text-foreground">Комфорт чтения</Text>
        <Text className="mt-2 text-base leading-6 text-muted">Настройки хранятся только на этом устройстве и применяются сразу.</Text>

        <View className="mt-7 rounded-3xl border border-border bg-surface p-5">
          <Text className="text-lg font-bold text-foreground">Тема оформления</Text>
          <Text className="mt-1 text-sm leading-5 text-muted">Выберите спокойную тему, удобную для ваших глаз.</Text>
          <View className="mt-4 flex-row gap-3">
            {(["light", "dark"] as const).map((scheme) => {
              const active = colorScheme === scheme;
              return <Pressable key={scheme} onPress={() => { playTap(); setColorScheme(scheme); }} style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] })} className={`flex-1 items-center rounded-2xl border px-3 py-4 ${active ? colorScheme === "dark" ? "border-[#B7A9FF] bg-[#28274B]" : "border-primary bg-[#E9EAFE]" : "border-border bg-background"}`}><View className={`h-9 w-9 items-center justify-center rounded-full ${active ? "bg-surface" : "bg-surface"}`}><Text className="text-xl">{scheme === "light" ? "☀︎" : "◐"}</Text></View><Text className={`mt-2 font-bold ${active ? "text-primary" : "text-foreground"}`}>{scheme === "light" ? "Светлая" : "Тёмная"}</Text><Text className={`mt-1 text-xs ${active ? "text-primary" : "text-muted"}`}>{active ? "Выбрана" : "Выбрать"}</Text></Pressable>;
            })}
          </View>
        </View>

        <View className="mt-4 rounded-3xl border border-border bg-surface p-5">
          <Text className="text-lg font-bold text-foreground">Размер текста</Text>
          <Text style={{ fontSize: 16 * fontScale, lineHeight: 24 * fontScale }} className="mt-3 text-foreground">Так будет выглядеть объяснение в уроке. Выберите размер, при котором читать легко.</Text>
          <View className="mt-5 flex-row gap-2">
            {fontOptions.map((option) => {
              const active = fontScale === option.value;
              return <Pressable key={option.label} onPress={() => { playTap(); setFontScale(option.value); }} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })} className={`flex-1 items-center rounded-xl border py-3 ${active ? "border-primary bg-primary" : "border-border bg-background"}`}><Text className={`font-bold ${active ? "text-white" : "text-foreground"}`}>{option.label}</Text></Pressable>;
            })}
          </View>
        </View>
        <Pressable onPress={() => router.push("/reminders" as never)} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })} className="mt-4 flex-row items-center justify-between rounded-3xl border border-border bg-surface p-5"><View className="flex-1"><Text className="text-lg font-bold text-foreground">Ежедневное напоминание</Text><Text className="mt-1 text-sm leading-5 text-muted">Выберите время для спокойного приглашения к практике.</Text></View><Text className="ml-3 text-xl font-bold text-primary">›</Text></Pressable>
        <Pressable onPress={() => router.push("/improvements" as never)} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })} className="mt-4 flex-row items-center justify-between rounded-3xl border border-border bg-surface p-5"><View className="flex-1"><Text className="text-lg font-bold text-foreground">Идеи развития</Text><Text className="mt-1 text-sm leading-5 text-muted">32 предложения для следующего шага приложения.</Text></View><Text className="ml-3 text-xl font-bold text-primary">›</Text></Pressable>
        <Pressable onPress={() => router.push("/study-lab" as never)} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })} className="mt-4 flex-row items-center justify-between rounded-3xl border border-border bg-surface p-5"><View className="flex-1"><Text className="text-lg font-bold text-foreground">Учебная студия</Text><Text className="mt-1 text-sm leading-5 text-muted">Маршруты, повторение, проекты, справка и клуб задач.</Text></View><Text className="ml-3 text-xl font-bold text-primary">›</Text></Pressable>
        <Pressable onPress={() => router.push("/learning-tools" as never)} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })} className="mt-4 flex-row items-center justify-between rounded-3xl border border-border bg-surface p-5"><View className="flex-1"><Text className="text-lg font-bold text-foreground">Мои инструменты</Text><Text className="mt-1 text-sm leading-5 text-muted">Заметки, фрагменты кода, экспорт и офлайн-пакеты.</Text></View><Text className="ml-3 text-xl font-bold text-primary">›</Text></Pressable>
        <Pressable onPress={() => router.push("/accessibility" as never)} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })} className="mt-4 flex-row items-center justify-between rounded-3xl border border-border bg-surface p-5"><View className="flex-1"><Text className="text-lg font-bold text-foreground">Доступность</Text><Text className="mt-1 text-sm leading-5 text-muted">Контраст, размер текста и режим концентрации.</Text></View><Text className="ml-3 text-xl font-bold text-primary">›</Text></Pressable>
        <Pressable onPress={() => router.push("/growth" as never)} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })} className="mt-4 flex-row items-center justify-between rounded-3xl border border-border bg-surface p-5"><View className="flex-1"><Text className="text-lg font-bold text-foreground">Мой ритм</Text><Text className="mt-1 text-sm leading-5 text-muted">Гибкие цели, календарь, достижения и мягкое возвращение.</Text></View><Text className="ml-3 text-xl font-bold text-primary">›</Text></Pressable>
        <Pressable onPress={() => router.push("/sandbox" as never)} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })} className="mt-4 flex-row items-center justify-between rounded-3xl border border-border bg-surface p-5"><View className="flex-1"><Text className="text-lg font-bold text-foreground">Учебная песочница</Text><Text className="mt-1 text-sm leading-5 text-muted">Безопасно запускайте простые print и числовые расчёты.</Text></View><Text className="ml-3 text-xl font-bold text-primary">›</Text></Pressable>
        <Pressable onPress={() => router.push("/mentor-request" as never)} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })} className="mt-4 flex-row items-center justify-between rounded-3xl border border-border bg-surface p-5"><View className="flex-1"><Text className="text-lg font-bold text-foreground">Разбор мини-проекта</Text><Text className="mt-1 text-sm leading-5 text-muted">Подготовьте безопасную локальную заявку наставнику.</Text></View><Text className="ml-3 text-xl font-bold text-primary">›</Text></Pressable>
        <Pressable onPress={() => router.push("/project-hub" as never)} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })} className="mt-4 flex-row items-center justify-between rounded-3xl border border-border bg-surface p-5"><View className="flex-1"><Text className="text-lg font-bold text-foreground">Проектный путь</Text><Text className="mt-1 text-sm leading-5 text-muted">Бот, анализ данных, API или автоматизация — от уроков к портфолио.</Text></View><Text className="ml-3 text-xl font-bold text-primary">›</Text></Pressable>
        <Pressable onPress={() => router.push("/skill-map" as never)} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })} className="mt-4 flex-row items-center justify-between rounded-3xl border border-border bg-surface p-5"><View className="flex-1"><Text className="text-lg font-bold text-foreground">Карта роста</Text><Text className="mt-1 text-sm leading-5 text-muted">Пробелы, карточки ошибок и навыки, которые стоит развивать.</Text></View><Text className="ml-3 text-xl font-bold text-primary">›</Text></Pressable>
        <Pressable onPress={() => router.push("/csv-lab" as never)} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })} className="mt-4 flex-row items-center justify-between rounded-3xl border border-border bg-surface p-5"><View className="flex-1"><Text className="text-lg font-bold text-foreground">CSV-лаборатория</Text><Text className="mt-1 text-sm leading-5 text-muted">Локально разбирайте небольшие таблицы и показатели.</Text></View><Text className="ml-3 text-xl font-bold text-primary">›</Text></Pressable>
        <Pressable onPress={() => router.push("/api-workshop" as never)} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })} className="mt-4 flex-row items-center justify-between rounded-3xl border border-border bg-surface p-5"><View className="flex-1"><Text className="text-lg font-bold text-foreground">API-мастерская</Text><Text className="mt-1 text-sm leading-5 text-muted">Шаблоны requests, Flask и FastAPI для учебных проектов.</Text></View><Text className="ml-3 text-xl font-bold text-primary">›</Text></Pressable>
        <Pressable onPress={() => router.push("/bookmarks" as never)} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })} className="mt-4 flex-row items-center justify-between rounded-3xl border border-border bg-surface p-5"><View className="flex-1"><Text className="text-lg font-bold text-foreground">Мои закладки</Text><Text className="mt-1 text-sm leading-5 text-muted">Сложные темы и личные категории для быстрого повторения.</Text></View><Text className="ml-3 text-xl font-bold text-primary">›</Text></Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}
