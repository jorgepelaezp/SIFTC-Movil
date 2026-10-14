import { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  Button,
  TextField,
  LoadingIndicator,
  ErrorMessage,
  ErrorType,
} from "../components";
import { colors, spacing, radius, fontSize } from "../theme";
import { login } from "../services/api";

const FEATURES = [
  "Índice de Competitividad de 0 a 100 para cada entidad.",
  "Gráficas de velas y ranking por sector, dimensión y periodo.",
  "Cada valor publicado con su origen y su regla de cálculo.",
];

type Props = { onLoggedIn: (token: string) => void };

export default function LoginScreen({ onLoggedIn }: Props) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<ErrorType | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    const result = await login(user.trim(), pass);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    onLoggedIn(result.token);
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        bounces={false}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>SIFTC · APP MÓVIL</Text>
          <Text style={styles.headline}>
            Datos trazables.{"\n"}Entidades que cotizan.
          </Text>
          {FEATURES.map((text, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureNum}>0{i + 1}</Text>
              <View style={styles.featureDivider} />
              <Text style={styles.featureText}>{text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.sheet}>
          <Image
            source={require("../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Iniciar sesión</Text>
          <Text style={styles.subtitle}>
            Ingresa con tu usuario y contraseña del sistema.
          </Text>

          {error && <ErrorMessage type={error} />}

          <TextField
            label="Usuario"
            placeholder="Escribe tu usuario"
            value={user}
            onChangeText={setUser}
            error={error === "credenciales"}
          />
          <TextField
            label="Contraseña"
            placeholder="Escribe tu contraseña"
            value={pass}
            onChangeText={setPass}
            secureTextEntry
            error={error === "credenciales"}
          />

          <Button
            title="Ingresar"
            onPress={handleLogin}
            loading={loading}
            disabled={!user || !pass}
          />

          {loading && <LoadingIndicator />}

          <View style={styles.footerLine} />
          <Text style={styles.footer}>
            Sistema de Información Financiera de Trazabilidad y Competitividad
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.navy },
  scroll: { flexGrow: 1 },
  hero: {
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.xl,
    paddingTop: 64,
    paddingBottom: 56,
  },
  kicker: {
    color: colors.accent,
    fontFamily: "Manrope_600SemiBold",
    fontSize: fontSize.sm,
    letterSpacing: 2,
    marginBottom: spacing.lg,
  },
  headline: {
    color: colors.white,
    fontFamily: "Manrope_800ExtraBold",
    fontSize: fontSize.xxl,
    lineHeight: 36,
    letterSpacing: -0.6,
    marginBottom: spacing.xl,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  featureNum: {
    color: colors.accent,
    fontFamily: "Manrope_700Bold",
    fontSize: fontSize.xl,
    width: 36,
  },
  featureDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: "rgba(255,255,255,0.25)",
    marginHorizontal: spacing.lg,
  },
  featureText: {
    flex: 1,
    color: "#E5E9F2",
    fontFamily: "Manrope_500Medium",
    fontSize: 15,
    lineHeight: 22,
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    marginTop: -32,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: 32,
  },
  logo: { width: 200, height: 170, alignSelf: "center" },
  title: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 26,
    color: colors.text,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  subtitle: {
    fontFamily: "Manrope_400Regular",
    fontSize: fontSize.lg,
    color: colors.textLight,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  footerLine: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: spacing.xl,
  },
  footer: {
    fontFamily: "Manrope_400Regular",
    color: colors.textLight,
    fontSize: fontSize.sm,
    textAlign: "center",
    marginTop: spacing.lg,
  },
});
