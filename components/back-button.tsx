import { Pressable, Text, View } from "react-native";
import { useSoundFeedback } from "@/lib/sound-feedback";
import { useColors } from "@/hooks/use-colors";

export function BackButton({ label = "Назад", onPress }: { label?: string; onPress: () => void }) {
  const { playTap } = useSoundFeedback();
  const colors = useColors();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={() => { playTap(); onPress(); }} style={({ pressed }) => [{ alignSelf: "flex-start", marginTop: 4, marginBottom: 20, overflow: "hidden", borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 12, shadowColor: "#30276F", shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 }, { opacity: pressed ? 0.78 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}><View className="flex-row items-center gap-2"><View className="h-6 w-6 items-center justify-center rounded-full bg-[#E7E0FF]"><Text className="text-base font-bold text-primary">‹</Text></View><Text className="font-bold text-foreground">{label}</Text></View></Pressable>;
}
