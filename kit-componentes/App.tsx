import { useState } from "react";
import { View, StyleSheet } from "react-native";
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

export default function App() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  const [token, setToken] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("tablero");

  if (!fontsLoaded) return null;

  // Sin sesión: pantalla de login
  if (!token) {
    return (
      <SafeAreaProvider>
        <LoginScreen onLoggedIn={setToken} />
      </SafeAreaProvider>
    );
  }

  // Con sesión: cabecera + pantalla + barra inferior
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <AppHeader onAvatarPress={() => setToken(null)} />
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
});
