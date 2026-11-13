import { useCallback, useEffect, useState } from "react";
import {
  AppState,
  View,
  Text,
  StyleSheet,
} from "react-native";

import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as Network from "expo-network";

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

import { sincronizarPendientes } from "./services/sincronizacion";

import {
  cantidadMutacionesPendientes,
  ultimaActualizacionCache,
} from "./services/offline";

import {
  notificarDatosActualizados,
  suscribirDatosActualizados,
} from "./services/syncEvents";

// Cada cuánto se revisa si el token venció mientras la app está abierta.
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

  const [
    entidadSeleccionada,
    setEntidadSeleccionada,
  ] = useState<string | number | undefined>(undefined);

  const [conectado, setConectado] = useState<boolean | null>(null);
  const [pendientesOffline, setPendientesOffline] = useState(0);
  const [ultimaCache, setUltimaCache] = useState<string | null>(null);

  // Pestañas ya visitadas: se mantienen montadas para conservar
  // filtros y selección al cambiar de pestaña.
  const [visitadas, setVisitadas] = useState<TabKey[]>(["tablero"]);

  const cambiarTab = useCallback((nueva: TabKey) => {
    setTab(nueva);

    setVisitadas((actuales) =>
      actuales.includes(nueva)
        ? actuales
        : [...actuales, nueva]
    );
  }, []);

  const navegarAGraficas = useCallback(
    (entidadId: string | number) => {
      setEntidadSeleccionada(entidadId);
      cambiarTab("graficas");
    },
    [cambiarTab]
  );

  // Recuperar la sesión guardada si el token sigue vigente.
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
    setVisitadas(["tablero"]);
    setEntidadSeleccionada(undefined);

    await eliminarToken();
  }, []);

  // Detectar si el dispositivo tiene conexión a Internet.
  useEffect(() => {
    let activo = true;

    Network.getNetworkStateAsync()
      .then((estado) => {
        if (activo) {
          setConectado(
            estado.isConnected === true &&
            estado.isInternetReachable !== false
          );
        }
      })
      .catch(() => {
        if (activo) {
          setConectado(false);
        }
      });

    const suscripcion = Network.addNetworkStateListener((estado) => {
      setConectado(
        estado.isConnected === true &&
        estado.isInternetReachable !== false
      );
    });

    return () => {
      activo = false;
      suscripcion.remove();
    };
  }, []);

  // Actualizar el estado local y sincronizar cambios pendientes
  // cuando vuelva la conexión a Internet.
  useEffect(() => {
    if (!token) return;

    let activo = true;

    const actualizarEstadoLocal = async () => {
      const [pendientes, fecha] = await Promise.all([
        cantidadMutacionesPendientes(),
        ultimaActualizacionCache(),
      ]);

      if (activo) {
        setPendientesOffline(pendientes);
        setUltimaCache(fecha);
      }
    };

    actualizarEstadoLocal();

    const cancelar = suscribirDatosActualizados(
      actualizarEstadoLocal
    );

    if (conectado) {
      sincronizarPendientes().finally(() => {
        notificarDatosActualizados();
        actualizarEstadoLocal();
      });
    }

    return () => {
      activo = false;
      cancelar();
    };
  }, [token, conectado]);

  // Token vencido o respuesta 401 del backend:
  // volver a la pantalla de inicio de sesión.
  useEffect(() => {
    configurarSesionExpirada(() => cerrarSesion(true));

    return () => configurarSesionExpirada(null);
  }, [cerrarSesion]);

  // Revisar el vencimiento mientras la app está abierta
  // y cuando vuelve a primer plano.
  useEffect(() => {
    if (!token) return;

    const revisar = () => {
      if (!tokenVigente(token)) {
        cerrarSesion(true);
      }
    };

    const intervalo = setInterval(revisar, REVISION_MS);

    const suscripcion = AppState.addEventListener(
      "change",
      (estado) => {
        if (estado === "active") {
          revisar();
        }
      }
    );

    return () => {
      clearInterval(intervalo);
      suscripcion.remove();
    };
  }, [token, cerrarSesion]);

  if (!fontsLoaded) {
    return null;
  }

  // Mientras se recupera la sesión.
  if (restaurando) {
    return (
      <SafeAreaProvider>
        <View style={styles.centrado}>
          <LoadingIndicator message="Recuperando sesión..." />
        </View>
      </SafeAreaProvider>
    );
  }

  // Sin sesión: pantalla de login.
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

  // Con sesión: cabecera, pantallas y barra inferior.
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />

      <SafeAreaView style={styles.screen} edges={["top"]}>
        <AppHeader onAvatarPress={() => cerrarSesion(false)} />

        {conectado === false && (
          <View style={styles.offlineBanner}>
            <View style={styles.offlineDot} />

            <View style={{ flex: 1 }}>
              <Text style={styles.offlineTitle}>
                Sin conexión · Modo offline
              </Text>

              <Text style={styles.offlineText}>
                Consultando datos guardados
                {ultimaCache
                  ? ` · Actualizados ${new Date(
                      ultimaCache
                    ).toLocaleString("es-CO")}`
                  : " · Aún no hay caché sincronizada"}
              </Text>

              {pendientesOffline > 0 && (
                <Text style={styles.offlineText}>
                  {pendientesOffline} cambio(s) de seguimiento
                  pendiente(s) de sincronizar
                </Text>
              )}
            </View>
          </View>
        )}

        <View style={styles.body}>
          {visitadas.includes("tablero") && (
            <View
              style={
                tab === "tablero"
                  ? styles.visible
                  : styles.oculta
              }
            >
              <HomeScreen />
            </View>
          )}

          {visitadas.includes("graficas") && (
            <View
              style={
                tab === "graficas"
                  ? styles.visible
                  : styles.oculta
              }
            >
              <ChartsScreen entidadId={entidadSeleccionada} />
            </View>
          )}

          {visitadas.includes("ranking") && (
            <View
              style={
                tab === "ranking"
                  ? styles.visible
                  : styles.oculta
              }
            >
              <RankingScreen
                onSeleccionarEntidad={navegarAGraficas}
              />
            </View>
          )}
        </View>

        <BottomTabBar
          active={tab}
          onChange={cambiarTab}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  body: {
    flex: 1,
  },

  visible: {
    flex: 1,
  },

  oculta: {
    display: "none",
  },

  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: "#FFF7E6",
    borderBottomWidth: 1,
    borderBottomColor: "#F2D9A6",
  },

  offlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#C58A19",
  },

  offlineTitle: {
    color: "#76520D",
    fontSize: 12,
    fontWeight: "700",
  },

  offlineText: {
    color: "#76520D",
    fontSize: 10,
    marginTop: 2,
  },

  centrado: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});