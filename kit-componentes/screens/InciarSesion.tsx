import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  StyleSheet,
  Keyboard,
  type ScrollViewInstance,
  type TextInputInstance,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Button,
  TextField,
  LoadingIndicator,
  ErrorMessage,
  ErrorType,
} from "../components";
import { spacing, radius, fontSize } from "../theme";
import { useTema } from "../theme/TemaContext";
import { Paleta } from "../theme/paletas";
import { login } from "../services/api";

// Logos sin fondo: uno para modo claro y otro para modo oscuro.
const LOGO_CLARO = require("../assets/alza-logo-claro.png");
const LOGO_OSCURO = require("../assets/alza-logo-oscuro.png");

// Cambiar a true SOLO cuando backend confirme que el login acepta correo.
// Con true, los textos quedan iguales a los del portal web.
const ACEPTA_CORREO = false;

const TEXTOS = ACEPTA_CORREO
  ? {
      subtitulo: "Ingresa con tu correo o usuario del sistema.",
      etiquetaUsuario: "Usuario o correo",
      ejemploUsuario: "ej: analista@siftc.edu.co o analista",
    }
  : {
      subtitulo: "Ingresa con tu usuario y contraseña del sistema.",
      etiquetaUsuario: "Usuario",
      ejemploUsuario: "Escribe tu usuario",
    };

const FEATURES = [
  "Índice de Competitividad de 0 a 100 para cada entidad.",
  "Gráficas de velas y ranking por sector, dimensión y periodo.",
  "Cada valor publicado con su origen y su regla de cálculo.",
];

type Props = {
  onLoggedIn: (token: string) => void;
  sesionExpirada?: boolean;
};

export default function LoginScreen({ onLoggedIn, sesionExpirada }: Props) {
  const { colores, esOscuro } = useTema();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => crearEstilos(colores), [colores]);

  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<ErrorType | null>(
    sesionExpirada ? "sesionExpirada" : null,
  );
  const [loading, setLoading] = useState(false);

  // Teclado: al abrirse, desplaza el formulario para que campos y botón queden visibles.
  const scrollRef = useRef<ScrollViewInstance>(null);
  const passRef = useRef<TextInputInstance>(null);
  useEffect(() => {
    const mostrar = Keyboard.addListener("keyboardDidShow", () => {
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    });
    return () => mostrar.remove();
  }, []);

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
      // Android (edge-to-edge en Expo 58) también necesita "padding": sin él el teclado tapa el formulario.
      behavior="padding">
      <StatusBar style="light" />

      {/* Franja fija detrás de la hora y la batería: evita que el texto se monte al hacer scroll */}
      <View style={[styles.barraEstado, { height: insets.top }]} />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        keyboardDismissMode="on-drag"
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
            key={esOscuro ? "logo-oscuro" : "logo-claro"}
            source={esOscuro ? LOGO_OSCURO : LOGO_CLARO}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Iniciar sesión</Text>
          <Text style={styles.subtitle}>{TEXTOS.subtitulo}</Text>

          {error && <ErrorMessage type={error} />}

          <TextField
            label={TEXTOS.etiquetaUsuario}
            placeholder={TEXTOS.ejemploUsuario}
            value={user}
            onChangeText={setUser}
            error={error === "credenciales"}
            returnKeyType="next"
            onSubmitEditing={() => passRef.current?.focus()}
          />
          <TextField
            label="Contraseña"
            placeholder="Escribe tu contraseña"
            value={pass}
            onChangeText={setPass}
            secureTextEntry
            error={error === "credenciales"}
            inputRef={passRef}
            returnKeyType="go"
            onSubmitEditing={() => {
              if (user && pass && !loading) handleLogin();
            }}
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
            Acceso solo para personal autorizado. Si no tienes cuenta, pídela al
            administrador.
          </Text>
          <Text style={styles.footerSistema}>
            Sistema de Información Financiera de Trazabilidad y Competitividad
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Los estilos se calculan según el tema (claro u oscuro).
// En modo claro los valores son los mismos que antes.
const crearEstilos = (c: Paleta) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.navy },
    barraEstado: { backgroundColor: c.navy },
    scroll: { flexGrow: 1 },
    hero: {
      backgroundColor: c.navy,
      paddingHorizontal: spacing.xl,
      paddingTop: 32,
      paddingBottom: 56,
    },
    kicker: {
      color: c.accent,
      fontFamily: "Manrope_600SemiBold",
      fontSize: fontSize.sm,
      letterSpacing: 2,
      marginBottom: spacing.lg,
    },
    headline: {
      color: c.white,
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
      color: c.accent,
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
      backgroundColor: c.surface,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      marginTop: -32,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.xl,
      paddingBottom: 32,
    },
    logo: { width: 180, height: 143, alignSelf: "center", marginTop: spacing.sm },
    title: {
      fontFamily: "Manrope_800ExtraBold",
      fontSize: 26,
      color: c.text,
      textAlign: "center",
      marginTop: spacing.md,
    },
    subtitle: {
      fontFamily: "Manrope_400Regular",
      fontSize: fontSize.lg,
      color: c.textLight,
      textAlign: "center",
      marginTop: spacing.xs,
      marginBottom: spacing.xl,
    },
    footerLine: {
      height: 1,
      backgroundColor: c.border,
      marginTop: spacing.xl,
    },
    footer: {
      fontFamily: "Manrope_400Regular",
      color: c.textLight,
      fontSize: fontSize.sm,
      lineHeight: 18,
      textAlign: "center",
      marginTop: spacing.lg,
    },
    footerSistema: {
      fontFamily: "Manrope_400Regular",
      color: c.textLight,
      fontSize: fontSize.xs,
      textAlign: "center",
      marginTop: spacing.sm,
    },
  });