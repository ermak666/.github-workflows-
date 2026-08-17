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
        ListHeaderComponent={<View className="mb-6"><Text className="text-3xl font-bold text-foreground">Учебник</Text><Text className="mt-2 text-base leading-6 text-muted">Четыре тома, от простых команд до надёжных проектов и этичной автоматизации.</Text></View>}
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
