// Font-free fallback for Android and web. System glyphs avoid asynchronous icon-font loading.

import type { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { Text, type OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], string>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  "house.fill": "⌂",
  "paperplane.fill": "↗",
  "chevron.left.forwardslash.chevron.right": "{ }",
  "chevron.right": "›",
  "book.fill": "▤",
  "doc.text.fill": "▧",
  "chart.bar.fill": "▥",
} as IconMapping;

/**
 * An icon component that uses system glyphs on Android and web.
 * The iOS-specific sibling keeps native SF Symbols on iOS.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <Text style={[{ color, fontSize: size, lineHeight: size, fontWeight: "700" }, style]}>{MAPPING[name]}</Text>;
}
