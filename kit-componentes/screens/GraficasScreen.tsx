import { useState } from "react";
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
import { colors, spacing, radius, fontSize } from "../theme";
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
  const [tipo, setTipo] = useState<TipoGrafica>("velas");
  const [inspeccionando, setInspeccionando] = useState(false);
  const resumen = ficha ? resumenPeriodo(ficha.serie) : null;
  const sinEntidades = !cargando && !error && entidades.length === 0;

  return (
    <ScrollView contentContainerStyle={styles.content} scrollEnabled={!inspeccionando}>
      <Text style={styles.crumb}>Gráficas / Entidad</Text>
      <Text style={styles.title}>Ficha de entidad</Text>

      {/* Selector de entidad */}
      {entidades.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}>
          {entidades.map((e) => {
            const activo = e.id === seleccion;
            return (
              <Pressable
                key={String(e.id)}
                onPress={() => seleccionar(e.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: activo }}
                style={[styles.chip, activo && styles.chipActivo]}>
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
      {sinEntidades && <EmptyState message="No hay entidades para mostrar" detail="Intenta más tarde." />}

      {ficha && (
        <>
          {/* Cabecera: índice, variación y ranking */}
          <View style={styles.card}>
            <Text style={styles.nombre}>{ficha.entidad.nombre}</Text>
            <Text style={styles.soft}>
              {[ficha.entidad.codigo, ficha.entidad.sector].filter(Boolean).join(" · ")}
            </Text>
            <View style={styles.fila}>
              <Text style={styles.valor}>{num(ficha.entidad.indice, 1)}</Text>
              <Variation value={ficha.entidad.variacionPct} style={styles.variacion} />
            </View>
            <Text style={styles.soft}>Índice de competitividad</Text>
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
              <EmptyState message="Sin datos para este periodo" detail="Prueba con otro periodo." />
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

          <Text style={styles.nota}>
            {ficha.serie.length > 0 &&
              `Del ${fechaIso(ficha.serie[0].fecha)} al ${fechaIso(
                ficha.serie[ficha.serie.length - 1].fecha,
              )}`}
            {ficha.ejemplo ? " · Datos de ejemplo" : ""}
          </Text>
        </>
      )}
      <View style={styles.footer} />
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
            style={[styles.segmentoOpcion, activo && styles.segmentoActivo]}>
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
  content: { padding: spacing.lg, gap: spacing.md },
  crumb: {
    fontFamily: "Manrope_500Medium",
    fontSize: 13,
    color: colors.textLight,
  },
  title: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 28,
    color: colors.text,
  },
  chips: { gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.chip,
  },
  chipActivo: { backgroundColor: colors.blue },
  chipTexto: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: fontSize.md,
    color: colors.text,
  },
  chipTextoActivo: { color: colors.white },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  cardGrafica: { paddingHorizontal: spacing.sm, paddingVertical: spacing.md },
  nombre: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: fontSize.xl,
    color: colors.text,
  },
  soft: {
    fontFamily: "Manrope_400Regular",
    fontSize: fontSize.md,
    color: colors.textLight,
  },
  fila: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  valor: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 40,
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },
  variacion: { fontSize: fontSize.lg },
  ranking: {
    alignSelf: "flex-start",
    backgroundColor: colors.blueSoft,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.md,
  },
  rankingTexto: {
    fontFamily: "Manrope_700Bold",
    fontSize: fontSize.sm,
    color: colors.blue,
  },
  controles: { flexDirection: "row", gap: spacing.sm },
  segmento: {
    flexDirection: "row",
    backgroundColor: colors.chip,
    borderRadius: radius.md,
    padding: 3,
  },
  segmentoOpcion: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.sm,
    borderRadius: radius.md - 2,
  },
  segmentoActivo: { backgroundColor: colors.surface },
  segmentoTexto: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 13,
    color: colors.textLight,
  },
  segmentoTextoActivo: { color: colors.text },
  ayuda: {
    fontFamily: "Manrope_400Regular",
    fontSize: fontSize.sm,
    color: colors.textLight,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  celdas: { flexDirection: "row", gap: spacing.sm },
  celda: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
  },
  celdaNombre: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  celdaValor: {
    fontFamily: "Manrope_700Bold",
    fontSize: fontSize.lg,
    color: colors.text,
    fontVariant: ["tabular-nums"],
  },
  nota: {
    fontFamily: "Manrope_400Regular",
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  footer: { height: spacing.lg },
});
