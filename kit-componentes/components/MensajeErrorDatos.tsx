import { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "./Boton";
import { spacing, radius, fontSize } from "../theme";
import { useTema } from "../theme/TemaContext";
import type { Paleta } from "../theme/paletas";

type Props = { message: string; onRetry?: () => void };

/** Error al cargar datos, con botón para reintentar. No bloquea el resto de la app. */
export function DataError({ message, onRetry }: Props) {
  const { colores: colors } = useTema();
  const styles = useMemo(() => crearEstilos(colors), [colors]);
  return (
    <View style={styles.box} accessibilityRole="alert">
      <Text style={styles.text}>{message}</Text>
      {onRetry && (
        <View style={styles.button}>
          <Button title="Reintentar" onPress={onRetry} />
        </View>
      )}
    </View>
  );
}

const crearEstilos = (colors: Paleta) =>
  StyleSheet.create({
    box: {
      backgroundColor: colors.warningBg,
      borderRadius: radius.md,
      padding: spacing.lg,
    },
    text: {
      fontFamily: "Manrope_500Medium",
      fontSize: fontSize.md,
      color: colors.warning,
    },
    button: { marginTop: spacing.md },
  });
