import { useCallback, useEffect, useState } from "react";
import { AppState, View, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
import { colors } from "./theme";
import { AppHeader } from "./components/EncabezadoApp";
import { BottomTabBar, TabKey } from "./components/BarraInferior";
import LoginScreen from "./screens/InciarSesion";
import HomeScreen from "./screens/TableroScreen";
import ChartsScreen from "./screens/GraficasScreen";
import RankingScreen from "./screens/RankingScreen";
import { LoadingIndicator } from "./components";
import { configurarSesionExpirada } from "./services/api";
import {
  eliminarToken,
  guardarToken,
  restaurarSesion,
  tokenVigente,
} from "./services/sesion";

// Cada cuánto se revisa si el token venció mientras la app está abierta
const REVISION_MS = 30_000;

export default function App() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  const [token, setToken] = useState<string | null>(null);
  const [restaurando, setRestaurando] = useState(true);
  const [sesionExpirada, setSesionExpirada] = useState(false);
  const [tab, setTab] = useState<TabKey>("tablero");

  // Al abrir la app: recuperar la sesión guardada si el token sigue vigente
  useEffect(() => {
    restaurarSesion().then(({ token: guardado, vencida }) => {
      setToken(guardado);
      setSesionExpirada(vencida);
      setRestaurando(false);
    });
  }, []);

  const iniciarSesion = useCallback(async (nuevo: string) => {
    await guardarToken(nuevo);
    setSesionExpirada(false);
    setToken(nuevo);
  }, []);

  const cerrarSesion = useCallback(async (porExpiracion: boolean) => {
    setSesionExpirada(porExpiracion);
    setToken(null);
    setTab("tablero");
    await eliminarToken();
  }, []);

  // Token vencido o respuesta 401 del backend: volver al login
  useEffect(() => {
    configurarSesionExpirada(() => cerrarSesion(true));
    return () => configurarSesionExpirada(null);
  }, [cerrarSesion]);

  // Revisar el vencimiento mientras la app está abierta y al volver a primer plano
  useEffect(() => {
    if (!token) return;
    const revisar = () => {
      if (!tokenVigente(token)) cerrarSesion(true);
    };
    const intervalo = setInterval(revisar, REVISION_MS);
    const suscripcion = AppState.addEventListener("change", (estado) => {
      if (estado === "active") revisar();
    });
    return () => {
      clearInterval(intervalo);
      suscripcion.remove();
    };
  }, [token, cerrarSesion]);

  if (!fontsLoaded) return null;

  if (restaurando) {
    return (
      <SafeAreaProvider>
        <View style={styles.centrado}>
          <LoadingIndicator message="Recuperando sesión..." />
        </View>
      </SafeAreaProvider>
    );
  }

  // Sin sesión: pantalla de login
  if (!token) {
    return (
      <SafeAreaProvider>
        <LoginScreen
          onLoggedIn={iniciarSesion}
          sesionExpirada={sesionExpirada}
        />
      </SafeAreaProvider>
    );
  }

  // Con sesión: cabecera + pantalla + barra inferior
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <AppHeader onAvatarPress={() => cerrarSesion(false)} />
        <View style={styles.body}>
          {tab === "tablero" && <HomeScreen />}
          {tab === "graficas" && <ChartsScreen />}
          {tab === "ranking" && <RankingScreen />}
        </View>
        <BottomTabBar active={tab} onChange={setTab} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1 },
  centrado: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
