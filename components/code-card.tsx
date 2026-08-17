import * as Clipboard from "expo-clipboard";
import { Pressable, Text, View } from "react-native";

export function CodeCard({ code }: { code: string }) {
  if (!code.trim()) return null;
  return (
    <View className="rounded-3xl border border-[#303758] bg-[#111426] p-5 shadow-sm">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="rounded-full bg-[#242B4D] px-3 py-1"><Text className="text-xs font-bold uppercase tracking-widest text-[#BFC6FF]">Python</Text></View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Скопировать код"
          onPress={() => Clipboard.setStringAsync(code)}
          style={({ pressed }) => ({ opacity: pressed ? 0.65 : 1 })}
        >
          <Text className="rounded-full text-sm font-bold text-[#D3D7FF]">Копировать</Text>
        </Pressable>
      </View>
      <Text selectable className="font-mono text-[13px] leading-6 text-[#F7F5FF]">{code}</Text>
    </View>
  );
}
