import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { colors, spacing, fontSize } from "../theme";

type Props = { message?: string };

export function LoadingIndicator({ message = "Cargando..." }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", padding: spacing.lg },
  text: {
    marginTop: spacing.sm,
    color: colors.textLight,
    fontSize: fontSize.md,
  },
});
