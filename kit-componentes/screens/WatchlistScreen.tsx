import { useMemo, useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Entidad } from "../models";
import { getEntidades } from "../services/mercado";
import {
  getWatchlist,
  agregarWatchlist,
  quitarWatchlist,
} from "../services/ranking";
import { leerCache } from "../services/offline";
import { suscribirDatosActualizados } from "../services/syncEvents";
import { useTema } from "../theme/TemaContext";
import type { Paleta } from "../theme/paletas";

type Props = {
  onSeleccionarEntidad?: (id: string | number) => void;
};

type Eliminacion = { id: string; nombre: string };
const claveId = (id: string | number) => String(id);
const CLAVE_API_WATCHLIST = `${process.env.EXPO_PUBLIC_API_PREFIX ?? "/api/v1"}/watchlist`;

export default function WatchlistScreen({ onSeleccionarEntidad }: Props) {
  const { colores: colors } = useTema();
  const styles = useMemo(() => crearEstilos(colors), [colors]);
  const [entidades, setEntidades] = useState<Entidad[]>([]);
  const [seguidas, setSeguidas] = useState<string[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [soloSeguidas, setSoloSeguidas] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eliminacion, setEliminacion] = useState<Eliminacion | null>(null);
  const idsRef = useRef<string[]>([]);
  const operacionesRef = useRef<Promise<void>>(Promise.resolve());
  const listoRef = useRef(false);
  const versionRef = useRef(0);

  const actualizarIds = useCallback((ids: string[]) => {
    idsRef.current = ids;
    setSeguidas(ids);
    versionRef.current++;
  }, []);

  const cargar = useCallback(async (mostrarCarga = true) => {
    const versionInicio = versionRef.current;
    if (mostrarCarga) setCargando(true);
    setError(null);
    try {
      // El listado local aparece de inmediato si ya había sido guardado.
      const cache = await leerCache<any[]>(CLAVE_API_WATCHLIST);
      if (
        cache &&
        Array.isArray(cache.data) &&
        versionInicio === versionRef.current
      ) {
        const ids = cache.data.map((e) => String(e.id));
        idsRef.current = ids;
        setSeguidas(ids);
      }
      const [disponibles, favoritas] = await Promise.all([
        getEntidades(),
        getWatchlist(),
      ]);
      if (versionInicio === versionRef.current) {
        idsRef.current = favoritas.map((e) => String(e.id));
        setSeguidas(idsRef.current);
      }
      setEntidades(disponibles);
      listoRef.current = true;
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No fue posible cargar las entidades.",
      );
    } finally {
      if (mostrarCarga) setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
    // Después de sincronizar cambios pendientes, consultar el estado real.
    const cancelar = suscribirDatosActualizados(() => {
      if (listoRef.current) void cargar(false);
    });
    return cancelar;
  }, [cargar]);

  const aplicarCambio = (entidad: Entidad, seguir: boolean) => {
    const id = claveId(entidad.id);
    const previos = idsRef.current;
    actualizarIds(
      seguir
        ? [...previos.filter((x) => x !== id), id]
        : previos.filter((x) => x !== id),
    );
    operacionesRef.current = operacionesRef.current
      .catch(() => undefined)
      .then(async () => {
        try {
          if (seguir) await agregarWatchlist(entidad.id, entidad);
          else await quitarWatchlist(entidad.id);
        } catch (e) {
          // Solo revertir si el usuario no realizó otra acción posterior.
          const actuales = idsRef.current;
          if (seguir && actuales.includes(id))
            actualizarIds(actuales.filter((x) => x !== id));
          if (!seguir && !actuales.includes(id))
            actualizarIds([...actuales, id]);
          Alert.alert(
            "No se pudo guardar el cambio",
            e instanceof Error ? e.message : "Intenta nuevamente.",
          );
        }
      });
  };

  const cambiarSeguimiento = (entidad: Entidad) => {
    if (!listoRef.current) return;
    const id = claveId(entidad.id);
    const seguida = idsRef.current.includes(id);
    aplicarCambio(entidad, !seguida);
    setEliminacion(seguida ? { id, nombre: entidad.nombre } : null);
  };

  const deshacer = () => {
    if (!eliminacion) return;
    const entidad = entidades.find((e) => claveId(e.id) === eliminacion.id);
    if (entidad && !idsRef.current.includes(eliminacion.id))
      aplicarCambio(entidad, true);
    setEliminacion(null);
  };

  const visibles = entidades.filter((entidad) => {
    const coincide = `${entidad.nombre} ${entidad.codigo} ${entidad.sector}`
      .toLocaleLowerCase("es")
      .includes(busqueda.trim().toLocaleLowerCase("es"));
    return (
      coincide && (!soloSeguidas || seguidas.includes(claveId(entidad.id)))
    );
  });

  return (
    <View style={styles.pantalla}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>Mi Watchlist</Text>
        <Text style={styles.descripcion}>
          Sigue tus entidades favoritas sin recargar. Tus cambios se guardan
          incluso sin conexión.
        </Text>

        <View style={styles.resumen}>
          <Ionicons name="star" color="#D99118" size={23} />
          <Text style={styles.total}>{seguidas.length} entidades seguidas</Text>
        </View>

        <TextInput
          style={styles.buscar}
          value={busqueda}
          onChangeText={setBusqueda}
          placeholder="Buscar entidad, código o sector..."
          placeholderTextColor={colors.textLight}
          autoCapitalize="none"
        />

        <View style={styles.filtros}>
          <Pressable
            style={[styles.filtro, !soloSeguidas && styles.filtroActivo]}
            onPress={() => setSoloSeguidas(false)}>
            <Text
              style={[
                styles.filtroTexto,
                !soloSeguidas && styles.filtroTextoActivo,
              ]}>
              Todas
            </Text>
          </Pressable>
          <Pressable
            style={[styles.filtro, soloSeguidas && styles.filtroActivo]}
            onPress={() => setSoloSeguidas(true)}>
            <Text
              style={[
                styles.filtroTexto,
                soloSeguidas && styles.filtroTextoActivo,
              ]}>
              Siguiendo ({seguidas.length})
            </Text>
          </Pressable>
        </View>

        {eliminacion && (
          <View style={styles.aviso}>
            <Text style={styles.avisoTexto} numberOfLines={2}>
              Quitaste a {eliminacion.nombre}.
            </Text>
            <Pressable
              onPress={deshacer}
              accessibilityRole="button"
              accessibilityLabel="Deshacer eliminación">
              <Text style={styles.deshacer}>DESHACER</Text>
            </Pressable>
          </View>
        )}

        {cargando && <ActivityIndicator size="large" color={colors.blue} />}
        {error && (
          <View style={styles.avisoError}>
            <Text style={styles.error}>{error}</Text>
            <Pressable
              onPress={() => void cargar()}
              accessibilityRole="button"
              accessibilityLabel="Reintentar">
              <Text style={styles.deshacer}>Reintentar</Text>
            </Pressable>
          </View>
        )}

        {!cargando && !error && visibles.length === 0 && (
          <Text style={styles.vacio}>
            {soloSeguidas
              ? "Todavía no sigues entidades. Selecciona Todas para agregar una."
              : "No se encontraron entidades."}
          </Text>
        )}

        {visibles.map((entidad) => {
          const seguida = seguidas.includes(claveId(entidad.id));
          return (
            <View key={claveId(entidad.id)} style={styles.tarjeta}>
              <Pressable
                style={styles.datos}
                onPress={() => onSeleccionarEntidad?.(entidad.id)}>
                <Text style={styles.nombre}>{entidad.nombre}</Text>
                <Text style={styles.detalle}>
                  {entidad.codigo} · {entidad.sector}
                </Text>
                <Text style={styles.indice}>
                  IC: {entidad.indice.toFixed(2)}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => cambiarSeguimiento(entidad)}
                style={[styles.boton, seguida && styles.botonActivo]}
                accessibilityRole="button"
                accessibilityLabel={
                  seguida
                    ? `Dejar de seguir ${entidad.nombre}`
                    : `Seguir ${entidad.nombre}`
                }>
                <Ionicons
                  name={seguida ? "star" : "star-outline"}
                  size={21}
                  color={seguida ? colors.white : colors.blue}
                />
                <Text
                  style={[
                    styles.botonTexto,
                    seguida && styles.botonTextoActivo,
                  ]}>
                  {seguida ? "Siguiendo" : "Seguir"}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const crearEstilos = (colors: Paleta) =>
  StyleSheet.create({
    pantalla: { flex: 1, backgroundColor: colors.background },
    contenido: { padding: 16, paddingBottom: 40, gap: 12 },
    titulo: {
      fontFamily: "Manrope_800ExtraBold",
      fontSize: 27,
      color: colors.text,
    },
    descripcion: { color: colors.textLight, fontSize: 13, lineHeight: 20 },
    resumen: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: colors.surface,
      padding: 15,
      borderRadius: 12,
    },
    total: { color: colors.text, fontSize: 16, fontWeight: "700" },
    buscar: {
      borderColor: colors.border,
      borderWidth: 1,
      backgroundColor: colors.inputBg,
      padding: 12,
      borderRadius: 10,
      color: colors.text,
    },
    filtros: { flexDirection: "row", gap: 8 },
    filtro: {
      paddingVertical: 9,
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filtroActivo: { backgroundColor: colors.blue, borderColor: colors.blue },
    filtroTexto: { color: colors.text, fontWeight: "700" },
    filtroTextoActivo: { color: colors.white },
    aviso: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.blueSoft,
      padding: 12,
      borderRadius: 10,
      gap: 10,
    },
    avisoTexto: { flex: 1, color: colors.text, fontSize: 12 },
    deshacer: { color: colors.blue, fontWeight: "800" },
    avisoError: { padding: 12, gap: 8 },
    error: { color: colors.error },
    vacio: { textAlign: "center", marginTop: 25, color: colors.textLight },
    tarjeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 14,
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 12,
    },
    datos: { flex: 1, gap: 4 },
    nombre: { color: colors.text, fontSize: 15, fontWeight: "800" },
    detalle: { color: colors.textLight, fontSize: 11 },
    indice: { color: colors.blue, fontSize: 12, fontWeight: "700" },
    boton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      padding: 9,
      borderRadius: 9,
      borderColor: colors.blue,
      borderWidth: 1,
    },
    botonActivo: { backgroundColor: colors.blue },
    botonTexto: { fontSize: 11, color: colors.blue, fontWeight: "800" },
    botonTextoActivo: { color: colors.white },
  });
