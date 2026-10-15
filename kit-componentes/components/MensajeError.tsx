import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, radius, fontSize } from "../theme";

export type ErrorType = "credenciales" | "sinConexion" | "sesionExpirada";

type Props = { type: ErrorType };

const MESSAGES: Record<ErrorType, string> = {
  credenciales: "Usuario o contraseña incorrectos",
  sinConexion: "Sin conexión. Revisa tu internet e inténtalo de nuevo",
  sesionExpirada: "Tu sesión expiró. Ingresa de nuevo",
};

export function ErrorMessage({ type }: Props) {
  // Avisos que no son culpa del usuario se muestran en ámbar
  const isConnection = type !== "credenciales";
  return (
    <View
      style={[styles.box, isConnection ? styles.warningBox : styles.errorBox]}>
      <Text
        style={[
          styles.text,
          isConnection ? styles.warningText : styles.errorText,
        ]}>
        {MESSAGES[type]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  errorBox: { backgroundColor: colors.errorBg },
  warningBox: { backgroundColor: colors.warningBg },
  text: { fontSize: fontSize.sm, fontWeight: "500" },
  errorText: { color: colors.error },
  warningText: { color: colors.warning },
});
