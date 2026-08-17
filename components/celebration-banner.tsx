import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";

export function CelebrationBanner({ title, description }: { title: string; description: string }) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.88);
  const lift = useSharedValue(14);
  useEffect(() => {
    opacity.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) });
    scale.value = withSequence(withTiming(1.04, { duration: 230 }), withTiming(1, { duration: 160 }));
    lift.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.cubic) });
  }, [lift, opacity, scale]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: lift.value }, { scale: scale.value }] }));
  return <Animated.View style={style}><View className="mt-4 rounded-3xl bg-[#DFF5ED] p-5"><Text className="text-sm font-bold text-success">НОВОЕ ДОСТИЖЕНИЕ</Text><Text className="mt-1 text-xl font-bold text-foreground">{title}</Text><Text className="mt-2 text-sm leading-5 text-[#275C4C]">{description}</Text></View></Animated.View>;
}
