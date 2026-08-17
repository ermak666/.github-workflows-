import { useRouter } from "expo-router";
import { Image, FlatList, Pressable, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { volumes } from "@/shared/course-data";

const colors = ["#7056E8", "#18A77B", "#E3802A", "#4D65C7"];
const volumeArt = [require("../../assets/images/volumes/junior.webp"), require("../../assets/images/volumes/middle.webp"), require("../../assets/images/volumes/senior.webp"), require("../../assets/images/volumes/web.webp")];

export default function LearnScreen() {
  const router = useRouter();
  const themeColors = useColors();
  return (
    <ScreenContainer className="px-5">
      <FlatList
        data={volumes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 36 }}
        ListHeaderComponent={<View className="mb-6"><View className="self-start rounded-full bg-[#E7E0FF] px-3 py-2"><Text style={{ color: themeColors.primary }} className="text-xs font-bold tracking-widest">БИБЛИОТЕКА ЗНАНИЙ</Text></View><Text style={{ color: themeColors.foreground }} className="mt-4 text-3xl font-bold">Учебник</Text><Text style={{ color: themeColors.muted }} className="mt-2 text-base leading-6">Четыре тома, от простых команд до надёжных проектов и этичной автоматизации.</Text><Pressable accessibilityRole="button" onPress={() => router.push("/practice" as never)} style={({ pressed }) => [{ marginTop: 20, width: "100%", overflow: "hidden", borderRadius: 28, borderWidth: 1, borderColor: "#354062", backgroundColor: "#111426", padding: 20, shadowColor: "#111426", shadowOpacity: 0.16, shadowRadius: 10, elevation: 3 }, { opacity: pressed ? 0.86 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}><View className="absolute -right-5 -top-6 h-24 w-24 rounded-full bg-[#18A77B] opacity-40" /><Text className="text-sm font-bold tracking-widest text-[#C9C6FF]">МИНИ-ТРЕНАЖЁР</Text><Text className="mt-2 text-xl font-bold text-white">Напишите код сами</Text><Text className="mt-2 text-sm leading-5 text-[#D8DDEA]">Короткие задачи с подсказками, проверкой шагов и разбором решения.</Text><View className="mt-4 self-start rounded-full bg-[#18A77B] px-4 py-2"><Text className="font-bold text-white">Открыть тренажёр →</Text></View></Pressable></View>}
        renderItem={({ item, index }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: "/volume/[id]", params: { id: item.id } } as never)}
            style={({ pressed }) => [{ marginBottom: 16, width: "100%", alignSelf: "stretch", overflow: "hidden", borderRadius: 24, borderWidth: 1, borderColor: themeColors.border, backgroundColor: themeColors.surface, shadowColor: "#0F1634", shadowOpacity: 0.09, shadowRadius: 8, elevation: 2 }, { opacity: pressed ? 0.78 : 1 }]}
          >
            <View style={{ backgroundColor: colors[index] }} className="h-2" />
            <Image source={volumeArt[index]} accessibilityLabel={`Иллюстрация к ${item.title}`} resizeMode="cover" style={{ width: "100%", height: 164, backgroundColor: "#E7E0FF" }} />
            <View style={{ padding: 20, backgroundColor: themeColors.surface }}>
              <View style={{ alignSelf: "flex-start", borderRadius: 999, backgroundColor: themeColors.background, paddingHorizontal: 12, paddingVertical: 4 }}><Text style={{ color: themeColors.muted }} className="text-xs font-bold uppercase tracking-wide">{item.lessons.length} уроков</Text></View>
              <Text style={{ color: themeColors.foreground }} className="mt-2 text-2xl font-bold leading-8">{item.title}</Text>
              <Text style={{ color: themeColors.primary }} className="mt-3 text-base">Открыть содержание →</Text>
            </View>
          </Pressable>
        )}
      />
    </ScreenContainer>
  );
}
