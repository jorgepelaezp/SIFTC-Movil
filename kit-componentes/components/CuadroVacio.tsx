import { useMemo } from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { radius } from "../theme";
import { useTema } from "../theme/TemaContext";
import type { Paleta } from "../theme/paletas";

type Props = {
  height: number;
  label?: string;
  dark?: boolean;
  style?: ViewStyle;
};

export function PlaceholderBox({ height, label, dark = false, style }: Props) {
  const { colores: colors } = useTema();
  const styles = useMemo(() => crearEstilos(colors), [colors]);
  return (
    <View
      style={[
        styles.box,
        { height },
        dark && { backgroundColor: colors.navy, borderColor: colors.navy },
        style,
      ]}>
      {label ? (
        <Text style={[styles.label, dark && { color: "#94A3B8" }]}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

const crearEstilos = (colors: Paleta) =>
  StyleSheet.create({
    box: {
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    label: {
      fontFamily: "Manrope_500Medium",
      fontSize: 12,
      color: colors.textLight,
    },
  });
