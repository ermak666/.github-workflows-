import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { loadCompletedLessons } from "@/lib/course-progress";
import { useSoundFeedback } from "@/lib/sound-feedback";
import { volumes } from "@/shared/course-data";

const volumeArt = [require("../../assets/images/volumes/junior.webp"), require("../../assets/images/volumes/middle.webp"), require("../../assets/images/volumes/senior.webp"), require("../../assets/images/volumes/web.webp")];

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const [completed, setCompleted] = useState<string[]>([]);
  const { playTap } = useSoundFeedback();
  useFocusEffect(useCallback(() => { loadCompletedLessons().then(setCompleted); }, []));
  const allLessons = useMemo(() => volumes.flatMap((volume) => volume.lessons), []);
  const nextLesson = allLessons.find((lesson) => !completed.includes(lesson.id)) ?? allLessons[0];
  const progress = Math.round((completed.length / allLessons.length) * 100);

  return <ScreenContainer className="px-5">
    <FlatList
      style={{ flex: 1, width: "100%", alignSelf: "stretch" }}
      data={volumes}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingTop: 14, paddingBottom: 36 }}
      ListHeaderComponent={<View>
        <View className="flex-row items-center justify-between">
          <View className="rounded-full bg-[#E7E0FF] px-3 py-2"><Text className="text-xs font-bold tracking-widest text-primary">PYTHON · LAB</Text></View>
          <Pressable accessibilityRole="button" onPress={() => { playTap(); router.push("/settings" as never); }} style={({ pressed }) => [{ borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 }, { opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] }]}><Text className="text-sm font-bold text-primary">Aa · тема</Text></Pressable>
        </View>
        <Text className="mt-5 text-4xl font-bold leading-[46px] text-foreground">Учимся{"\n"}маленькими шагами</Text>
        <Text className="mt-3 text-base leading-6 text-muted">Не нужно знать всё сразу. Откройте один урок, попробуйте пример и отметьте свой шаг.</Text>
        <Pressable accessibilityRole="button" onPress={() => { playTap(); router.push({ pathname: "/lesson/[id]", params: { id: nextLesson.id } } as never); }} style={({ pressed }) => [{ marginTop: 24, overflow: "hidden", borderRadius: 28, borderWidth: 1, borderColor: "#8D7BFF", backgroundColor: "#151A36", padding: 20, shadowColor: "#30276F", shadowOpacity: 0.2, shadowRadius: 14, elevation: 4 }, { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}>
          <View className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#7056E8] opacity-50" />
          <Text className="text-sm font-bold tracking-widest text-[#C9C6FF]">ПРОДОЛЖИТЬ</Text>
          <Text numberOfLines={2} className="mt-2 text-xl font-bold text-white">Урок {nextLesson.number}: {nextLesson.title}</Text>
          <View className="mt-4 self-start rounded-full bg-[#8F7BFF] px-4 py-2"><Text className="text-sm font-bold text-white">Открыть урок →</Text></View>
        </Pressable>
        <View className="mt-6 flex-row items-center justify-between"><Text className="text-base font-bold text-foreground">Ваш прогресс</Text><View className="rounded-full bg-[#DFF6EC] px-3 py-1"><Text className="text-sm font-bold text-success">{progress}%</Text></View></View>
        <View className="mt-3 h-3 overflow-hidden rounded-full bg-[#E4DFF2]"><View style={{ width: `${progress}%` }} className="h-full rounded-full bg-success" /></View>
        <Text className="mb-6 mt-2 text-sm text-muted">{completed.length} из {allLessons.length} уроков завершено</Text>
        <Text className="mb-3 text-xl font-bold text-foreground">Четыре тома</Text>
      </View>}
      renderItem={({ item, index }) => <Pressable accessibilityRole="button" onPress={() => { playTap(); router.push({ pathname: "/volume/[id]", params: { id: item.id } } as never); }} style={({ pressed }) => [{ width: "100%", alignSelf: "stretch", marginBottom: 16, overflow: "hidden", borderRadius: 24, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 20, shadowColor: "#342D72", shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 }, { opacity: pressed ? 0.75 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] }]}> 
        <View style={{ backgroundColor: index % 2 ? colors.success : colors.primary }} className="absolute left-0 top-0 h-full w-1.5" />
        <View style={{ width: "100%", paddingLeft: 8 }}><Text style={{ color: colors.primary }} className="text-sm font-bold uppercase tracking-wide">{item.lessons.length} уроков</Text><Text style={{ color: colors.foreground }} className="mt-2 text-lg font-bold">{item.title}</Text><Text style={{ color: colors.muted }} className="mt-2 text-sm font-bold">Открыть содержание →</Text><Image source={volumeArt[index]} accessibilityLabel={`Иллюстрация к ${item.title}`} resizeMode="cover" style={{ width: "100%", height: 180, marginTop: 16, borderRadius: 18, backgroundColor: "#E7E0FF" }} /></View>
      </Pressable>}
    />
  </ScreenContainer>;
}
