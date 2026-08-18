import { Component, type ErrorInfo, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

type Props = { children: ReactNode };
type State = { hasError: boolean };

/**
 * Last-resort boundary for the whole application.
 * It ensures that an unexpected rendering exception never becomes a blank screen.
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[AppErrorBoundary] Rendering error", error, info.componentStack);
  }

  retry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#0f172a", padding: 24 }}>
        <View style={{ width: "100%", maxWidth: 420, borderRadius: 24, borderWidth: 1, borderColor: "#334155", backgroundColor: "#172033", padding: 24 }}>
          <Text style={{ color: "#f8fafc", fontSize: 22, fontWeight: "800" }}>Экран нужно восстановить</Text>
          <Text style={{ color: "#cbd5e1", fontSize: 15, lineHeight: 22, marginTop: 12 }}>
            Приложение столкнулось с неожиданной ошибкой. Нажмите кнопку ниже, чтобы попробовать открыть экран ещё раз.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={this.retry}
            style={({ pressed }) => ({ marginTop: 20, alignItems: "center", borderRadius: 14, backgroundColor: "#8b5cf6", paddingHorizontal: 18, paddingVertical: 14, opacity: pressed ? 0.8 : 1 })}
          >
            <Text style={{ color: "#ffffff", fontSize: 16, fontWeight: "800" }}>Повторить загрузку</Text>
          </Pressable>
        </View>
      </View>
    );
  }
}
