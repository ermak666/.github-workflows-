import { useRouter } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { volumes } from "@/shared/course-data";

const colors = ["#5B5CE2", "#24A38B", "#D97732", "#42599B"];

export default function LearnScreen() {
  const router = useRouter();
  return (
    <ScreenContainer className="px-5">
      <FlatList
        data={volumes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 36 }}
        ListHeaderComponent={<View className="mb-6"><Text className="text-3xl font-bold text-foreground">Учебник</Text><Text className="mt-2 text-base leading-6 text-muted">Четыре тома, от простых команд до надёжных проектов и этичной автоматизации.</Text><Pressable accessibilityRole="button" onPress={() => router.push("/practice" as never)} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })} className="mt-5 rounded-3xl bg-[#172033] p-5"><Text className="text-sm font-semibold text-[#C9C9FF]">МИНИ-ТРЕНАЖЁР</Text><Text className="mt-1 text-xl font-bold text-white">Напишите код сами</Text><Text className="mt-2 text-sm leading-5 text-[#D8DDEA]">Пять коротких задач с подсказками, проверкой шагов и разбором решения.</Text><Text className="mt-3 font-bold text-[#B7B8FF]">Открыть тренажёр →</Text></Pressable></View>}
        renderItem={({ item, index }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: "/volume/[id]", params: { id: item.id } } as never)}
            style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1 })}
            className="mb-4 overflow-hidden rounded-3xl bg-surface"
          >
            <View style={{ backgroundColor: colors[index] }} className="h-2" />
            <View className="p-5">
              <Text className="text-sm font-bold uppercase tracking-wide text-muted">{item.lessons.length} уроков</Text>
              <Text className="mt-2 text-2xl font-bold leading-8 text-foreground">{item.title}</Text>
              <Text className="mt-3 text-base text-primary">Открыть содержание →</Text>
            </View>
          </Pressable>
        )}
      />
    </ScreenContainer>
  );
}
