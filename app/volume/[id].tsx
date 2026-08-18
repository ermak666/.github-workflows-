import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { BackButton } from "@/components/back-button";
import { getVolume } from "@/shared/course-data";
import { loadCompletedLessons } from "@/lib/course-progress";

export default function VolumeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const volume = getVolume(id);
  const [completed, setCompleted] = useState<string[]>([]);

  useFocusEffect(useCallback(() => {
    loadCompletedLessons().then(setCompleted);
  }, []));

  if (!volume) {
    return <ScreenContainer className="items-center justify-center p-6"><Text className="text-foreground">Том не найден.</Text></ScreenContainer>;
  }

  return (
    <ScreenContainer className="px-5">
      <FlatList
        data={volume.lessons}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 36 }}
        ListHeaderComponent={
          <View className="pb-5 pt-2">
            <BackButton onPress={() => router.replace("/learn" as never)} />
            <Text className="text-3xl font-bold leading-10 text-foreground">{volume.title}</Text>
            <Text className="mt-2 text-base leading-6 text-muted">{volume.lessons.length} уроков. Открывайте по одному — маленький шаг тоже движение вперёд.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const done = completed.includes(item.id);
          return (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push({ pathname: "/lesson/[id]", params: { id: item.id } } as never)}
              style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
              className="mb-3 rounded-2xl border border-border bg-surface p-4"
            >
              <View className="flex-row items-start gap-3">
                <View className={`h-9 w-9 items-center justify-center rounded-full ${done ? "bg-success" : "bg-[#E9EAFE]"}`}>
                  <Text className={`font-bold ${done ? "text-white" : "text-primary"}`}>{done ? "✓" : item.number}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[17px] font-semibold leading-6 text-foreground">{item.title}</Text>
                  <Text numberOfLines={2} className="mt-1 text-sm leading-5 text-muted">{item.goal}</Text>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </ScreenContainer>
  );
}
