import { Pressable, Text, View } from "react-native";
import { useSoundFeedback } from "@/lib/sound-feedback";

export function BackButton({ label = "Назад", onPress }: { label?: string; onPress: () => void }) {
  const { playTap } = useSoundFeedback();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={() => { playTap(); onPress(); }} style={({ pressed }) => ({ opacity: pressed ? 0.78 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] })} className="mb-5 mt-1 self-start overflow-hidden rounded-full border border-border bg-surface px-4 py-3 shadow-sm"><View className="flex-row items-center gap-2"><View className="h-6 w-6 items-center justify-center rounded-full bg-[#E7E0FF]"><Text className="text-base font-bold text-primary">‹</Text></View><Text className="font-bold text-foreground">{label}</Text></View></Pressable>;
}
