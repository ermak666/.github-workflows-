import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";

import { CodeCard } from "@/components/code-card";
import { ScreenContainer } from "@/components/screen-container";
import { apiProjectTemplates } from "@/shared/project-learning-data";

export default function ApiWorkshopScreen() {
  const router = useRouter();
  return <ScreenContainer className="px-5"><ScrollView contentContainerStyle={{ paddingBottom: 40 }}><Pressable onPress={() => router.back()}><Text className="mb-5 pt-2 font-semibold text-primary">‹ Назад</Text></Pressable><Text className="text-3xl font-bold text-foreground">API-мастерская</Text><Text className="mt-2 text-base leading-6 text-muted">Начните с маленького и понятного шаблона. Учебные примеры не содержат секретов и используют только адрес-заглушку.</Text>{apiProjectTemplates.map((template) => <View key={template.title} className="mt-5"><Text className="mb-2 text-lg font-bold text-foreground">{template.title}</Text><CodeCard code={template.code} /><Pressable onPress={() => Clipboard.setStringAsync(template.code)} className="mt-3 self-start rounded-xl bg-[#E9EAFE] px-4 py-3"><Text className="font-bold text-primary">Копировать шаблон</Text></Pressable></View>)}<View className="mt-6 rounded-3xl bg-[#FFF1E8] p-5"><Text className="text-lg font-bold text-foreground">Правило безопасности</Text><Text className="mt-2 text-sm leading-5 text-[#774218]">Ключи API не помещают в код и скриншоты. Используйте переменные окружения, читайте правила выбранного сервиса и начинайте с его официальной документации.</Text></View></ScrollView></ScreenContainer>;
}
