import { View, Text, StyleSheet } from "react-native";
import { Button } from "./Boton";
import { colors, spacing, radius, fontSize } from "../theme";

type Props = { message: string; onRetry?: () => void };

/** Error al cargar datos, con botón para reintentar. No bloquea el resto de la app. */
export function DataError({ message, onRetry }: Props) {
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

const styles = StyleSheet.create({
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
