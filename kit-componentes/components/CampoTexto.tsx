import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius, fontSize } from "../theme";

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: boolean;
};

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error = false,
}: Props) {
  const [hidden, setHidden] = useState(secureTextEntry);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputBox, error && styles.inputError]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
          secureTextEntry={hidden}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
        {secureTextEntry && (
          <Pressable onPress={() => setHidden(!hidden)} hitSlop={10}>
            <Ionicons
              name={hidden ? "eye-outline" : "eye-off-outline"}
              size={22}
              color={colors.navy}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.sm,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: fontSize.md,
    color: colors.text,
  },
  inputError: { borderColor: colors.error },
});