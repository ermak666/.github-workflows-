import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";

export default function FocusScreen() {
  const router = useRouter();
  return <ScreenContainer className="justify-center px-7"><View><Text className="text-sm font-bold text-primary">РЕЖИМ КОНЦЕНТРАЦИИ</Text><Text className="mt-4 text-4xl font-bold leading-[48px] text-foreground">Один маленький шаг.</Text><Text className="mt-4 text-lg leading-8 text-muted">Сегодня не нужно стать идеальным разработчиком. Достаточно открыть один урок или решить одну задачу.</Text><Pressable onPress={() => router.push("/practice" as never)} className="mt-9 items-center rounded-2xl bg-primary py-4"><Text className="text-base font-bold text-white">Открыть одну задачу</Text></Pressable><Pressable onPress={() => router.back()} className="mt-4 items-center py-3"><Text className="font-bold text-primary">Вернуться</Text></Pressable></View></ScreenContainer>;
}
