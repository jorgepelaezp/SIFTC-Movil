import { useMemo, useState } from "react";
import type { RefObject } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  type ReturnKeyTypeOptions,
  type TextInputInstance,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing, radius, fontSize } from "../theme";
import { useTema } from "../theme/TemaContext";
import type { Paleta } from "../theme/paletas";

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: boolean;
  /** Para pasar el foco al siguiente campo desde el teclado. */
  inputRef?: RefObject<TextInputInstance | null>;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
};

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error = false,
  inputRef,
  returnKeyType,
  onSubmitEditing,
}: Props) {
  const { colores: colors } = useTema();
  const styles = useMemo(() => crearEstilos(colors), [colors]);
  const [hidden, setHidden] = useState(secureTextEntry);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputBox, error && styles.inputError]}>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
          secureTextEntry={hidden}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          submitBehavior={returnKeyType === "next" ? "submit" : "blurAndSubmit"}
          style={styles.input}
        />
        {secureTextEntry && (
          <Pressable onPress={() => setHidden(!hidden)} hitSlop={10}>
            <Ionicons
              name={hidden ? "eye-outline" : "eye-off-outline"}
              size={22}
              color={colors.text}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const crearEstilos = (colors: Paleta) =>
  StyleSheet.create({
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
      backgroundColor: colors.inputBg,
    },
    input: {
      flex: 1,
      paddingVertical: 14,
      fontSize: fontSize.md,
      color: colors.text,
    },
    inputError: { borderColor: colors.error },
  });