import { useRouter } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { volumes } from "@/shared/course-data";

const colors = ["#7056E8", "#18A77B", "#E3802A", "#4D65C7"];

export default function LearnScreen() {
  const router = useRouter();
  return (
    <ScreenContainer className="px-5">
      <FlatList
        data={volumes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 36 }}
        ListHeaderComponent={<View className="mb-6"><View className="self-start rounded-full bg-[#E7E0FF] px-3 py-2"><Text className="text-xs font-bold tracking-widest text-primary">БИБЛИОТЕКА ЗНАНИЙ</Text></View><Text className="mt-4 text-3xl font-bold text-foreground">Учебник</Text><Text className="mt-2 text-base leading-6 text-muted">Четыре тома, от простых команд до надёжных проектов и этичной автоматизации.</Text><Pressable accessibilityRole="button" onPress={() => router.push("/practice" as never)} style={({ pressed }) => ({ opacity: pressed ? 0.86 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] })} className="mt-5 overflow-hidden rounded-[28px] border border-[#354062] bg-[#111426] p-5 shadow-sm"><View className="absolute -right-5 -top-6 h-24 w-24 rounded-full bg-[#18A77B] opacity-40" /><Text className="text-sm font-bold tracking-widest text-[#C9C6FF]">МИНИ-ТРЕНАЖЁР</Text><Text className="mt-2 text-xl font-bold text-white">Напишите код сами</Text><Text className="mt-2 text-sm leading-5 text-[#D8DDEA]">Короткие задачи с подсказками, проверкой шагов и разбором решения.</Text><View className="mt-4 self-start rounded-full bg-[#18A77B] px-4 py-2"><Text className="font-bold text-white">Открыть тренажёр →</Text></View></Pressable></View>}
        renderItem={({ item, index }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: "/volume/[id]", params: { id: item.id } } as never)}
            style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1 })}
            className="mb-4 overflow-hidden rounded-3xl border border-border bg-surface shadow-sm"
          >
            <View style={{ backgroundColor: colors[index] }} className="h-2" />
            <View className="p-5">
              <View className="self-start rounded-full bg-background px-3 py-1"><Text className="text-xs font-bold uppercase tracking-wide text-muted">{item.lessons.length} уроков</Text></View>
              <Text className="mt-2 text-2xl font-bold leading-8 text-foreground">{item.title}</Text>
              <Text className="mt-3 text-base text-primary">Открыть содержание →</Text>
            </View>
          </Pressable>
        )}
      />
    </ScreenContainer>
  );
}
