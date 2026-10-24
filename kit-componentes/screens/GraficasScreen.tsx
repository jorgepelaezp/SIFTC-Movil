import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
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
import { PALETA_MERCADO } from "../services/datosMercado";
import { spacing } from "../theme";
import { fechaIso, num } from "../utils/formato";

type Props = {
  /** Entidad a mostrar al llegar desde otra pantalla (tocar una entidad). */
  entidadId?: Entidad["id"];
};

// HU-MO-04: ficha de entidad con índice, variación, ranking y gráfica del periodo.
export default function ChartsScreen({ entidadId }: Props) {
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

  useEffect(() => {
    if (entidadId !== undefined) {
      seleccionar(entidadId);
    }
  }, [entidadId, seleccionar]);

  const [tipo, setTipo] = useState<TipoGrafica>("velas");
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

      {/* Selector de entidad */}
      {entidades.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {entidades.map((e) => {
            const activo = e.id === seleccion;
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
          </View>

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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: PALETA_MERCADO.fondoClaro },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
    gap: spacing.md,
  },
  header: { marginBottom: 2 },
  crumb: {
    fontFamily: "Manrope_500Medium",
    fontSize: 12,
    color: PALETA_MERCADO.textoMuted,
    marginBottom: 2,
  },
  title: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 26,
    color: PALETA_MERCADO.azulNoche,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: "Manrope_400Regular",
    fontSize: 13,
    color: PALETA_MERCADO.textoMuted,
    marginTop: 4,
    lineHeight: 18,
  },

  /* Selector de entidad */
  chips: { gap: 8, paddingVertical: 2 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: PALETA_MERCADO.blanco,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  chipActivo: {
    backgroundColor: PALETA_MERCADO.azulNoche,
    borderColor: PALETA_MERCADO.azulNoche,
  },
  chipTexto: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 12,
    color: PALETA_MERCADO.azulNoche,
  },
  chipTextoActivo: { color: PALETA_MERCADO.blanco },

  /* Tarjetas */
  card: {
    backgroundColor: PALETA_MERCADO.blanco,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: PALETA_MERCADO.bordeClaro,
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
    color: PALETA_MERCADO.azulNoche,
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
    color: PALETA_MERCADO.textoMuted,
  },
  sectorBadge: {
    backgroundColor: "#EBF3FA",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderWidth: 1,
    borderColor: "#D0E2F2",
  },
  sectorText: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 10,
    color: PALETA_MERCADO.azulAcero,
  },
  variacion: { fontSize: 13 },
  indiceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  indiceLabel: {
    fontFamily: "Manrope_700Bold",
    fontSize: 12,
    color: PALETA_MERCADO.textoMuted,
  },
  valor: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 36,
    color: PALETA_MERCADO.azulNoche,
    fontVariant: ["tabular-nums"],
  },
  soft: {
    fontFamily: "Manrope_400Regular",
    fontSize: 12,
    color: PALETA_MERCADO.textoMuted,
    flexShrink: 1,
  },
  ranking: {
    alignSelf: "flex-start",
    backgroundColor: "#EBF3FA",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D0E2F2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 12,
  },
  rankingTexto: {
    fontFamily: "Manrope_700Bold",
    fontSize: 11,
    color: PALETA_MERCADO.azulAcero,
  },

  /* Controles */
  controles: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  segmento: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    padding: 3,
  },
  segmentoOpcion: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  segmentoActivo: {
    backgroundColor: PALETA_MERCADO.blanco,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentoTexto: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 12,
    color: PALETA_MERCADO.textoMuted,
  },
  segmentoTextoActivo: { color: PALETA_MERCADO.azulNoche },

  /* Gráfica */
  ayuda: {
    fontFamily: "Manrope_400Regular",
    fontSize: 11,
    color: PALETA_MERCADO.textoMuted,
    textAlign: "center",
    marginTop: 8,
  },

  /* Resumen del periodo */
  celdas: { flexDirection: "row", gap: 8 },
  celda: {
    flex: 1,
    backgroundColor: PALETA_MERCADO.blanco,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: PALETA_MERCADO.bordeClaro,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  celdaNombre: {
    fontFamily: "Manrope_500Medium",
    fontSize: 10,
    color: PALETA_MERCADO.textoMuted,
    marginBottom: 2,
  },
  celdaValor: {
    fontFamily: "Manrope_700Bold",
    fontSize: 14,
    color: PALETA_MERCADO.azulNoche,
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
    color: PALETA_MERCADO.textoMuted,
    textAlign: "center",
    lineHeight: 16,
  },
});