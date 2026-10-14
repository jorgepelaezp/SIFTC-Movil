import { Pressable, Text, ActivityIndicator, StyleSheet } from "react-native";
import { colors, spacing, radius, fontSize } from "../theme";

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
}: Props) {
  const inactive = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      style={[styles.button, inactive && styles.inactive]}>
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: "center",
  },
  inactive: { opacity: 0.6 },
  text: { color: colors.white, fontSize: fontSize.md, fontWeight: "600" },
});
