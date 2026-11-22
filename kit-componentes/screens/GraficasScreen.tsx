import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator } from "react-native";
import {
  DataError,
  EmptyState,
  LoadingIndicator,
  Variation,
} from "../components";
import { GraficaEntidad, TipoGrafica } from "../components/GraficaEntidad";
import type { Entidad } from "../models";
import { useFicha } from "../hooks/useFicha";
import { PERIODOS, resumenPeriodo } from "../services/ficha";
import { spacing } from "../theme";
import { useTema } from "../theme/TemaContext";
import type { Paleta } from "../theme/paletas";
import { fechaIso, num } from "../utils/formato";
import { exportarSerieCsv } from "../services/exportacion";
import { comprobarServidor, type DiagnosticoServidor } from "../services/diagnostico";
import { getWatchlist } from "../services/ranking";
import { suscribirDatosActualizados } from "../services/syncEvents";
import { InterruptorAvisos } from "../components/InterruptorAvisos";




type Props = {
  /** Entidad a mostrar al llegar desde otra pantalla (tocar una entidad). */
  entidadId?: Entidad["id"];
};

// HU-MO-04: ficha de entidad con índice, variación, ranking y gráfica del periodo.
export default function ChartsScreen({ entidadId }: Props) {
  const { colores: colors } = useTema();
  const styles = useMemo(() => crearEstilos(colors), [colors]);
  const {
    entidades,
    seleccion,
    seleccionar,
    periodo,
    setPeriodo,
    ficha,
    cargando,
    error,
    reintentar,
  } = useFicha(entidadId);

    // El id puede llegar como texto (p. ej. "4" desde una notificación).
  // Se busca la entidad real y se selecciona su id original (número o texto).
  const ultimoAplicado = useRef<string | null>(null);
  useEffect(() => {
    if (entidadId === undefined) return;
    const real = entidades.find((e) => String(e.id) === String(entidadId));
    const clave = `${String(entidadId)}|${real ? "ok" : "pendiente"}`;
    if (ultimoAplicado.current === clave) return;
    ultimoAplicado.current = clave;
    seleccionar(real ? real.id : entidadId);
  }, [entidadId, entidades, seleccionar]);


  
  // HU-MO-05: ids de la watchlist, para mostrar el interruptor de alertas
  const [idsWatchlist, setIdsWatchlist] = useState<string[]>([]);
  useEffect(() => {
    let activo = true;
    const cargar = () =>
      getWatchlist()
        .then((lista) => {
          if (activo) setIdsWatchlist(lista.map((e) => String(e.id)));
        })
        .catch(() => {
          if (activo) setIdsWatchlist([]);
        });
    cargar();
    const cancelar = suscribirDatosActualizados(cargar);
    return () => {
      activo = false;
      cancelar();
    };
  }, [seleccion]);



  const [tipo, setTipo] = useState<TipoGrafica>("velas");
  const [exportando, setExportando] = useState(false);
  const [comprobando, setComprobando] = useState(false);
  const [diagnostico, setDiagnostico] = useState<DiagnosticoServidor | null>(null);
  const exportar = async () => {
    if (!ficha || exportando) return;
    setExportando(true);
    try {
      await exportarSerieCsv(ficha.entidad.id, periodo);
    } catch (error) {
      Alert.alert("Exportación CSV", error instanceof Error ? error.message : "No se pudo exportar la serie.");
    } finally {
      setExportando(false);
    }
  };
  const revisarServidor = async () => {
    if (comprobando) return;
    setComprobando(true);
    try { setDiagnostico(await comprobarServidor()); }
    finally { setComprobando(false); }
  };
  const [inspeccionando, setInspeccionando] = useState(false);
  const resumen = ficha ? resumenPeriodo(ficha.serie) : null;
  const sinEntidades = !cargando && !error && entidades.length === 0;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      scrollEnabled={!inspeccionando}
    >
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.crumb}>Gráficas / Entidad</Text>
        <Text style={styles.title}>Ficha de entidad</Text>
        <Text style={styles.subtitle}>
          Índice, variación y evolución de la entidad en el periodo elegido.
        </Text>
      </View>

      {/* Diagnóstico público del servidor; no requiere sesión. */}
      <View style={styles.diagnosticoFila}>
        <Pressable onPress={() => void revisarServidor()} disabled={comprobando}
          accessibilityRole="button" style={styles.accionSecundaria}>
          <Text style={styles.accionTexto}>{comprobando ? "Comprobando..." : "Comprobar servidor"}</Text>
        </Pressable>
        <Text style={styles.estadoConexion}>
          {diagnostico === "disponible" ? "Servidor disponible" :
           diagnostico === "no-disponible" ? "Servidor respondió con error" :
           diagnostico === "sin-conexion" ? "No se pudo conectar al servidor" : ""}
        </Text>
      </View>

      {/* Selector de entidad */}
      {entidades.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {entidades.map((e) => {
            const activo = String(e.id) === String(seleccion);
            return (
              <Pressable
                key={String(e.id)}
                onPress={() => seleccionar(e.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: activo }}
                style={[styles.chip, activo && styles.chipActivo]}
              >
                <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>
                  {e.nombre}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {cargando && !ficha && <LoadingIndicator message="Cargando ficha..." />}
      {error && <DataError message={error} onRetry={reintentar} />}
      {sinEntidades && (
        <EmptyState message="No hay entidades para mostrar" detail="Intenta más tarde." />
      )}

      {ficha && (
        <>
          {/* Cabecera: índice, variación y ranking */}
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.cardTitleBlock}>
                <Text style={styles.nombre} numberOfLines={1}>
                  {ficha.entidad.nombre}
                </Text>
                <View style={styles.metaRow}>
                  {!!ficha.entidad.codigo && (
                    <Text style={styles.codigo}>{ficha.entidad.codigo}</Text>
                  )}
                  {!!ficha.entidad.sector && (
                    <View style={styles.sectorBadge}>
                      <Text style={styles.sectorText}>{ficha.entidad.sector}</Text>
                    </View>
                  )}
                </View>
              </View>
              <Variation value={ficha.entidad.variacionPct} style={styles.variacion} />
            </View>

            <View style={styles.indiceRow}>
              <Text style={styles.indiceLabel}>IC</Text>
              <Text style={styles.valor}>{num(ficha.entidad.indice, 1)}</Text>
              <Text style={styles.soft}>Índice de competitividad</Text>
            </View>

            {ficha.ranking && (
              <View style={styles.ranking}>
                <Text style={styles.rankingTexto}>
                  Puesto {ficha.ranking.posicion} de {ficha.ranking.total} por índice
                </Text>
              </View>
            )}

            {idsWatchlist.includes(String(ficha.entidad.id)) && (
              <InterruptorAvisos entidadId={ficha.entidad.id} />
            )}

          </View>

          {/* CSV oficial del periodo visible, a través del endpoint de exportación. */}
          {!ficha.ejemplo && (
            <Pressable onPress={() => void exportar()} disabled={exportando}
              accessibilityRole="button" accessibilityLabel="Exportar serie en CSV"
              style={[styles.accionPrincipal, exportando && { opacity: 0.6 }]}>
              {exportando && <ActivityIndicator color={colors.chipActiveText} size="small" />}
              <Text style={styles.accionPrincipalTexto}>
                {exportando ? "Exportando CSV..." : "Exportar serie CSV"}
              </Text>
            </Pressable>
          )}

          {/* Velas / Línea y periodo */}
          <View style={styles.controles}>
            <Segmento
              opciones={[
                { clave: "velas", etiqueta: "Velas" },
                { clave: "linea", etiqueta: "Línea" },
              ]}
              valor={tipo}
              onCambio={(v) => setTipo(v as TipoGrafica)}
            />
            <Segmento
              opciones={PERIODOS.map((p) => ({ clave: p.clave, etiqueta: p.etiqueta }))}
              valor={periodo}
              onCambio={(v) => setPeriodo(v as typeof periodo)}
            />
          </View>

          {/* Gráfica del periodo */}
          <View style={[styles.card, styles.cardGrafica]}>
            {ficha.serie.length === 0 ? (
              <EmptyState
                message="Sin datos para este periodo"
                detail="Prueba con otro periodo."
              />
            ) : (
              <GraficaEntidad
                key={`${String(ficha.entidad.id)}-${ficha.periodo}-${tipo}`}
                serie={ficha.serie}
                tipo={tipo}
                onInspeccion={setInspeccionando}
              />
            )}
            <Text style={styles.ayuda}>
              Mantén presionado un punto para ver su detalle
            </Text>
          </View>

          {/* Resumen del periodo */}
          {resumen && (
            <View style={styles.celdas}>
              {(
                [
                  ["Apertura", resumen.apertura],
                  ["Máximo", resumen.maximo],
                  ["Mínimo", resumen.minimo],
                  ["Cierre", resumen.cierre],
                ] as const
              ).map(([nombre, valor]) => (
                <View key={nombre} style={styles.celda}>
                  <Text style={styles.celdaNombre}>{nombre}</Text>
                  <Text style={styles.celdaValor}>{num(valor, 1)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Pie informativo */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {ficha.serie.length > 0 &&
                `Del ${fechaIso(ficha.serie[0].fecha)} al ${fechaIso(
                  ficha.serie[ficha.serie.length - 1].fecha,
                )}`}
              {ficha.ejemplo ? " · Datos de ejemplo" : ""}
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

type SegmentoProps = {
  opciones: { clave: string; etiqueta: string }[];
  valor: string;
  onCambio: (clave: string) => void;
};

function Segmento({ opciones, valor, onCambio }: SegmentoProps) {
  const { colores: colors } = useTema();
  const styles = useMemo(() => crearEstilos(colors), [colors]);
  return (
    <View style={styles.segmento}>
      {opciones.map((o) => {
        const activo = o.clave === valor;
        return (
          <Pressable
            key={o.clave}
            onPress={() => onCambio(o.clave)}
            accessibilityRole="button"
            accessibilityState={{ selected: activo }}
            style={[styles.segmentoOpcion, activo && styles.segmentoActivo]}
          >
            <Text style={[styles.segmentoTexto, activo && styles.segmentoTextoActivo]}>
              {o.etiqueta}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const crearEstilos = (colors: Paleta) =>
  StyleSheet.create({
    diagnosticoFila: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
    accionSecundaria: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 9, backgroundColor: colors.chip },
    accionTexto: { fontSize: 12, fontWeight: "700", color: colors.text },
    estadoConexion: { fontSize: 11, color: colors.textLight, flexShrink: 1 },
    accionPrincipal: { backgroundColor: colors.chipActiveBg, borderRadius: 10, padding: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
    accionPrincipalTexto: { fontSize: 13, fontWeight: "700", color: colors.chipActiveText },
    screen: { flex: 1, backgroundColor: colors.background },
    content: {
      padding: spacing.lg,
      paddingBottom: spacing.xl * 2,
      gap: spacing.md,
    },
    header: { marginBottom: 2 },
    crumb: {
      fontFamily: "Manrope_500Medium",
      fontSize: 12,
      color: colors.textLight,
      marginBottom: 2,
    },
    title: {
      fontFamily: "Manrope_800ExtraBold",
      fontSize: 26,
      color: colors.textStrong,
      letterSpacing: -0.3,
    },
    subtitle: {
      fontFamily: "Manrope_400Regular",
      fontSize: 13,
      color: colors.textLight,
      marginTop: 4,
      lineHeight: 18,
    },

    /* Selector de entidad */
    chips: { gap: 8, paddingVertical: 2 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipActivo: {
      backgroundColor: colors.chipActiveBg,
      borderColor: colors.chipActiveBg,
    },
    chipTexto: {
      fontFamily: "Manrope_600SemiBold",
      fontSize: 12,
      color: colors.textStrong,
    },
    chipTextoActivo: { color: colors.chipActiveText },

    /* Tarjetas */
    card: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 2,
    },
    cardGrafica: { paddingHorizontal: 8, paddingVertical: 12 },
    cardTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    cardTitleBlock: { flex: 1 },
    nombre: {
      fontFamily: "Manrope_700Bold",
      fontSize: 17,
      color: colors.textStrong,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 2,
    },
    codigo: {
      fontFamily: "Manrope_500Medium",
      fontSize: 11,
      color: colors.textLight,
    },
    sectorBadge: {
      backgroundColor: colors.blueSoft,
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 1.5,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectorText: {
      fontFamily: "Manrope_600SemiBold",
      fontSize: 10,
      color: colors.blue,
    },
    variacion: { fontSize: 13 },
    indiceRow: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: 8,
      marginTop: 12,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    indiceLabel: {
      fontFamily: "Manrope_700Bold",
      fontSize: 12,
      color: colors.textLight,
    },
    valor: {
      fontFamily: "Manrope_800ExtraBold",
      fontSize: 36,
      color: colors.textStrong,
      fontVariant: ["tabular-nums"],
    },
    soft: {
      fontFamily: "Manrope_400Regular",
      fontSize: 12,
      color: colors.textLight,
      flexShrink: 1,
    },
    ranking: {
      alignSelf: "flex-start",
      backgroundColor: colors.blueSoft,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginTop: 12,
    },
    rankingTexto: {
      fontFamily: "Manrope_700Bold",
      fontSize: 11,
      color: colors.blue,
    },

    /* Controles */
    controles: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    segmento: {
      flexDirection: "row",
      backgroundColor: colors.chip,
      borderRadius: 10,
      padding: 3,
    },
    segmentoOpcion: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 8,
    },
    segmentoActivo: {
      backgroundColor: colors.surface,
      shadowColor: "#0F172A",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 1,
    },
    segmentoTexto: {
      fontFamily: "Manrope_600SemiBold",
      fontSize: 12,
      color: colors.textLight,
    },
    segmentoTextoActivo: { color: colors.textStrong },

    /* Gráfica */
    ayuda: {
      fontFamily: "Manrope_400Regular",
      fontSize: 11,
      color: colors.textLight,
      textAlign: "center",
      marginTop: 8,
    },

    /* Resumen del periodo */
    celdas: { flexDirection: "row", gap: 8 },
    celda: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 8,
      paddingHorizontal: 6,
      alignItems: "center",
    },
    celdaNombre: {
      fontFamily: "Manrope_500Medium",
      fontSize: 10,
      color: colors.textLight,
      marginBottom: 2,
    },
    celdaValor: {
      fontFamily: "Manrope_700Bold",
      fontSize: 14,
      color: colors.textStrong,
      fontVariant: ["tabular-nums"],
    },

    /* Pie */
    footer: {
      alignItems: "center",
      paddingVertical: spacing.md,
      marginTop: 4,
    },
    footerText: {
      fontFamily: "Manrope_400Regular",
      fontSize: 11,
      color: colors.textLight,
      textAlign: "center",
      lineHeight: 16,
    },
  });