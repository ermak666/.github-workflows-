import * as Clipboard from "expo-clipboard";
import { Pressable, Text, View } from "react-native";

export function CodeCard({ code }: { code: string }) {
  if (!code.trim()) return null;
  return (
    <View className="rounded-2xl bg-[#172033] p-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-xs font-semibold uppercase tracking-widest text-[#A8B3CF]">Python</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Скопировать код"
          onPress={() => Clipboard.setStringAsync(code)}
          style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
        >
          <Text className="text-sm font-semibold text-[#C9C9FF]">Копировать</Text>
        </Pressable>
      </View>
      <Text selectable className="font-mono text-[13px] leading-6 text-[#F4F6FF]">{code}</Text>
    </View>
  );
}
