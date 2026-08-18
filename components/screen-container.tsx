import { Pressable, Text, View, type ViewProps } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { usePathname, useRouter } from "expo-router";

import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

const PRIMARY_ROUTES = new Set(["/", "/learn", "/cheatsheet", "/progress"]);

export interface ScreenContainerProps extends ViewProps {
  /**
   * SafeArea edges to apply. Defaults to ["top", "left", "right"].
   * Bottom is typically handled by Tab Bar.
   */
  edges?: Edge[];
  /**
   * Tailwind className for the content area.
   */
  className?: string;
  /**
   * Additional className for the outer container (background layer).
   */
  containerClassName?: string;
  /**
   * Additional className for the SafeAreaView (content layer).
   */
  safeAreaClassName?: string;
}

/**
 * A container component that properly handles SafeArea and background colors.
 *
 * The outer View extends to full screen (including status bar area) with the background color,
 * while the inner SafeAreaView ensures content is within safe bounds.
 *
 * Usage:
 * ```tsx
 * <ScreenContainer className="p-4">
 *   <Text className="text-2xl font-bold text-foreground">
 *     Welcome
 *   </Text>
 * </ScreenContainer>
 * ```
 */
export function ScreenContainer({
  children,
  edges = ["top", "left", "right"],
  className,
  containerClassName,
  safeAreaClassName,
  style,
  ...props
}: ScreenContainerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const colors = useColors();
  const showHomeButton = !PRIMARY_ROUTES.has(pathname);

  return (
    <View
      className={cn(
        "flex-1",
        "bg-background",
        containerClassName
      )}
      {...props}
    >
      <SafeAreaView
        edges={edges}
        className={cn("flex-1", safeAreaClassName)}
        style={style}
      >
        <View className={cn("flex-1", className)}>
          {showHomeButton ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="На главную"
              onPress={() => router.replace("/" as never)}
              style={({ pressed }) => ({
                position: "absolute",
                zIndex: 20,
                top: 8,
                right: 16,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                paddingHorizontal: 12,
                paddingVertical: 8,
                opacity: pressed ? 0.76 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
                shadowColor: "#1C1B3A",
                shadowOpacity: 0.12,
                shadowRadius: 8,
                elevation: 2,
              })}
            >
              <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: "700" }}>⌂ На главную</Text>
            </Pressable>
          ) : null}
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
}
