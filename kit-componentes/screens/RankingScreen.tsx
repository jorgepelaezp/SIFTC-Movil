/*HU-MO-02 CREACIÓN DEL RANKING DE ENTIDADES*/

import React, { useCallback, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  ENTIDADES_MERCADO,
  EntidadMercado,
  PALETA_MERCADO,
  formatearIndice,
  formatearNumeroCO,
  formatearPeriodo,
  formatearVariacion,
} from "../services/datosMercado";
import { spacing } from "../theme";

export type DimensionTipo =
  | "IC general"
  | "Rentabilidad"
  | "Liquidez"
  | "Solvencia"
  | "Crecimiento";

export const DIMENSIONES_DISPONIBLES: DimensionTipo[] = [
  "IC general",
  "Rentabilidad",
  "Liquidez",
  "Solvencia",
  "Crecimiento",
];

interface RankingScreenProps {
  onSeleccionarEntidad?: (entidadId: number) => void;
}

type TipoModal = "sector" | "dimension" | "periodo" | null;

export default function RankingScreen({ onSeleccionarEntidad }: RankingScreenProps) {
  const [refrescando, setRefrescando] = useState(false);

  // Lista de sectores disponibles derivados de los datos
  const sectoresDisponibles = useMemo(() => {
    const sectoresUnicos = Array.from(
      new Set(ENTIDADES_MERCADO.map((e) => e.sector)),
    ).filter(Boolean);
    return ["Todos los sectores", ...sectoresUnicos];
  }, []);

  // Lista de periodos disponibles derivados de los datos (más recientes primero)
  const periodosDisponibles = useMemo(() => {
    return Array.from(
      new Set(ENTIDADES_MERCADO.map((e) => e.periodo)),
    ).filter(Boolean).sort().reverse();
  }, []);

  const periodoPorDefecto = periodosDisponibles[0] ?? "2026-09";

  // Estados de los filtros
  const [sectorSeleccionado, setSectorSeleccionado] = useState<string>("Todos los sectores");
  const [dimensionSeleccionada, setDimensionSeleccionada] = useState<DimensionTipo>("IC general");
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<string>(periodoPorDefecto);

  // Control de modal selector
  const [modalAbierto, setModalAbierto] = useState<TipoModal>(null);

  // Limpiar filtros y restablecer valores predeterminados
  const handleLimpiarFiltros = useCallback(() => {
    setSectorSeleccionado("Todos los sectores");
    setDimensionSeleccionada("IC general");
    setPeriodoSeleccionado(periodoPorDefecto);
  }, [periodoPorDefecto]);

  // Obtener valor numérico según la dimensión elegida
  const obtenerValorDimension = useCallback(
    (entidad: EntidadMercado, dimension: DimensionTipo): number | undefined => {
      switch (dimension) {
        case "IC general":
          return entidad.indice_competitividad;
        case "Rentabilidad":
          return entidad.rentabilidad;
        case "Liquidez":
          return entidad.liquidez;
        case "Solvencia":
          return entidad.solvencia;
        case "Crecimiento":
          return entidad.crecimiento;
        default:
          return entidad.indice_competitividad;
      }
    },
    [],
  );

  // Filtrado y ordenamiento simultáneo de entidades
  const entidadesFiltradas = useMemo(() => {
    return ENTIDADES_MERCADO.filter((entidad) => {
      const coincideSector =
        sectorSeleccionado === "Todos los sectores" ||
        entidad.sector.toLowerCase() === sectorSeleccionado.toLowerCase();
      const coincidePeriodo =
        !periodoSeleccionado || entidad.periodo === periodoSeleccionado;
      return coincideSector && coincidePeriodo;
    }).sort((a, b) => {
      const valA = obtenerValorDimension(a, dimensionSeleccionada);
      const valB = obtenerValorDimension(b, dimensionSeleccionada);
      if (valA === undefined && valB === undefined) return 0;
      if (valA === undefined) return 1;
      if (valB === undefined) return -1;
      return valB - valA;
    });
  }, [
    sectorSeleccionado,
    dimensionSeleccionada,
    periodoSeleccionado,
    obtenerValorDimension,
  ]);

  const handleRefresh = useCallback(() => {
    if (refrescando) return;
    setRefrescando(true);
    // Simulación asíncrona local de refresco sin depender de llamadas HTTP
    setTimeout(() => {
      setRefrescando(false);
    }, 600);
  }, [refrescando]);

  const handleSeleccionar = (entidad: EntidadMercado) => {
    const id =
      entidad.id ?? Number(String(entidad.codigo_entidad).replace(/\D/g, ""));
    onSeleccionarEntidad?.(id);
  };

  // Etiqueta para el indicador principal en la tarjeta
  const etiquetaIndicadorPrincipal =
    dimensionSeleccionada === "IC general" ? "IC" : dimensionSeleccionada;

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refrescando}
          onRefresh={handleRefresh}
          tintColor={PALETA_MERCADO.azulNoche}
          colors={[PALETA_MERCADO.azulNoche]}
        />
      }
    >
      {/* 1. TÍTULO Y SUBTÍTULO DE RANKING */}
      <View style={styles.headerTitleContainer}>
        <Text style={styles.title}>Ranking de competitividad</Text>
        <Text style={styles.subtitle}>
          Entidades ordenadas por {dimensionSeleccionada}. Toca una entidad para ver su gráfica.
        </Text>
      </View>

      {/* 2. PANEL DE FILTROS FUNCIONALES (ADAPTADO A MÓVIL) */}
      <View style={styles.filtersCard}>
        {/* Fila 1: Filtro Sector y Filtro Dimensión */}
        <View style={styles.filtersRow}>
          {/* Selector Sector */}
          <View style={styles.filterField}>
            <Text style={styles.filterLabel}>Sector</Text>
            <Pressable
              style={styles.filterSelector}
              onPress={() => setModalAbierto("sector")}
              accessibilityRole="combobox"
              accessibilityLabel={`Filtro de sector. Seleccionado: ${sectorSeleccionado}`}
            >
              <Text style={styles.filterSelectorText} numberOfLines={1}>
                {sectorSeleccionado}
              </Text>
              <Text style={styles.chevronIcon}>▾</Text>
            </Pressable>
          </View>

          {/* Selector Dimensión */}
          <View style={styles.filterField}>
            <Text style={styles.filterLabel}>Dimensión</Text>
            <Pressable
              style={styles.filterSelector}
              onPress={() => setModalAbierto("dimension")}
              accessibilityRole="combobox"
              accessibilityLabel={`Filtro de dimensión. Seleccionado: ${dimensionSeleccionada}`}
            >
              <Text style={styles.filterSelectorText} numberOfLines={1}>
                {dimensionSeleccionada}
              </Text>
              <Text style={styles.chevronIcon}>▾</Text>
            </Pressable>
          </View>
        </View>

        {/* Fila 2: Filtro Periodo y Botón Limpiar filtros */}
        <View style={styles.filtersRow}>
          {/* Selector Periodo */}
          <View style={styles.filterField}>
            <Text style={styles.filterLabel}>Periodo</Text>
            <Pressable
              style={styles.filterSelector}
              onPress={() => setModalAbierto("periodo")}
              accessibilityRole="combobox"
              accessibilityLabel={`Filtro de periodo. Seleccionado: ${formatearPeriodo(periodoSeleccionado)}`}
            >
              <Text style={styles.filterSelectorText} numberOfLines={1}>
                {formatearPeriodo(periodoSeleccionado)}
              </Text>
              <Text style={styles.chevronIcon}>▾</Text>
            </Pressable>
          </View>

          {/* Botón Limpiar filtros */}
          <View style={styles.filterField}>
            <Text style={styles.filterLabelSpacer}> </Text>
            <Pressable
              style={({ pressed }) => [
                styles.clearButton,
                pressed && styles.clearButtonPressed,
              ]}
              onPress={handleLimpiarFiltros}
              accessibilityRole="button"
              accessibilityLabel="Limpiar filtros y volver a valores predeterminados"
            >
              <Text style={styles.clearButtonText}>Limpiar filtros</Text>
            </Pressable>
          </View>
        </View>

        {/* Pie informativo sutil del panel de filtros */}
        <Text style={styles.filtersCaption}>
          Filtros aplicados en tiempo real. Orden descendente por {dimensionSeleccionada}.
        </Text>
      </View>

      {/* 3. LISTA TOP DE ENTIDADES O ESTADO VACÍO */}
      {entidadesFiltradas.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No se encontraron entidades</Text>
          <Text style={styles.emptyDescription}>
            Ninguna entidad coincide con los criterios de filtro seleccionados.
          </Text>
          <Pressable
            style={styles.emptyButton}
            onPress={handleLimpiarFiltros}
            accessibilityRole="button"
          >
            <Text style={styles.emptyButtonText}>Restablecer filtros</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {entidadesFiltradas.map((entidad, index) => {
            const posicion = index + 1;
            const variacion = formatearVariacion(entidad.variacion_porcentual);
            const esPositivo = variacion.esPositivo;

            // Valor según dimensión activa
            const valorPrincipal = obtenerValorDimension(
              entidad,
              dimensionSeleccionada,
            );
            const valorTexto =
              valorPrincipal !== undefined
                ? formatearNumeroCO(valorPrincipal, 1)
                : "–";
            const porcentajeBarra =
              valorPrincipal !== undefined
                ? Math.min(Math.max(valorPrincipal, 0), 100)
                : 0;

            return (
              <Pressable
                key={`entidad-${entidad.codigo_entidad}`}
                style={({ pressed }) => [
                  styles.entityCard,
                  pressed && styles.entityCardPressed,
                ]}
                onPress={() => handleSeleccionar(entidad)}
                accessibilityRole="button"
                accessibilityLabel={`Entidad ${entidad.nombre_entidad}, puesto ${posicion}, ${etiquetaIndicadorPrincipal} ${valorTexto}`}
              >
                {/* Fila superior: Posición, Nombre, Código, Sector y Variación */}
                <View style={styles.cardHeaderRow}>
                  <View style={styles.cardLeftHeader}>
                    <View
                      style={[
                        styles.positionBadge,
                        posicion === 1
                          ? styles.positionFirst
                          : posicion === 2
                          ? styles.positionSecond
                          : posicion === 3
                          ? styles.positionThird
                          : styles.positionDefault,
                      ]}
                    >
                      <Text
                        style={[
                          styles.positionText,
                          posicion <= 3
                            ? styles.positionTextTop
                            : styles.positionTextDefault,
                        ]}
                      >
                        {posicion}
                      </Text>
                    </View>

                    <View style={styles.entityTitleBlock}>
                      <Text style={styles.entityName} numberOfLines={1}>
                        {entidad.nombre_entidad}
                      </Text>
                      <View style={styles.metaRow}>
                        <Text style={styles.entityCode}>
                          {entidad.codigo_entidad}
                        </Text>
                        <View style={styles.sectorBadge}>
                          <Text style={styles.sectorText}>
                            {entidad.sector}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Badge de Variación Porcentual */}
                  <View
                    style={[
                      styles.variationBadge,
                      esPositivo ? styles.badgePositive : styles.badgeNegative,
                    ]}
                  >
                    <Text
                      style={[
                        styles.variationText,
                        esPositivo ? styles.textPositive : styles.textNegative,
                      ]}
                    >
                      {variacion.icono} {variacion.texto}
                    </Text>
                  </View>
                </View>

                {/* Fila central: Indicador según dimensión seleccionada y Barra de Progreso */}
                <View style={styles.icRow}>
                  <Text style={styles.icLabel}>{etiquetaIndicadorPrincipal}</Text>
                  <Text style={styles.icValue}>{valorTexto}</Text>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${porcentajeBarra}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </View>

                {/* Fila secundaria: 4 Dimensiones (Rentabilidad, Liquidez, Solvencia, Crecimiento) */}
                <View style={styles.dimensionsContainer}>
                  <View style={styles.dimensionColumn}>
                    <Text style={styles.dimensionLabel}>Rentabilidad</Text>
                    <Text style={styles.dimensionValue}>
                      {entidad.rentabilidad !== undefined
                        ? formatearNumeroCO(entidad.rentabilidad, 1)
                        : "–"}
                    </Text>
                  </View>

                  <View style={styles.dimensionDivider} />

                  <View style={styles.dimensionColumn}>
                    <Text style={styles.dimensionLabel}>Liquidez</Text>
                    <Text style={styles.dimensionValue}>
                      {entidad.liquidez !== undefined
                        ? formatearNumeroCO(entidad.liquidez, 1)
                        : "–"}
                    </Text>
                  </View>

                  <View style={styles.dimensionDivider} />

                  <View style={styles.dimensionColumn}>
                    <Text style={styles.dimensionLabel}>Solvencia</Text>
                    <Text style={styles.dimensionValue}>
                      {entidad.solvencia !== undefined
                        ? formatearNumeroCO(entidad.solvencia, 1)
                        : "–"}
                    </Text>
                  </View>

                  <View style={styles.dimensionDivider} />

                  <View style={styles.dimensionColumn}>
                    <Text style={styles.dimensionLabel}>Crecimiento</Text>
                    <Text style={styles.dimensionValue}>
                      {entidad.crecimiento !== undefined
                        ? formatearNumeroCO(entidad.crecimiento, 1)
                        : "–"}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* 4. PIE DE PÁGINA INFORMATIVO DINÁMICO */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          {entidadesFiltradas.length === 0
            ? "Sin resultados para los filtros actuales · Datos de ejemplo"
            : `Mostrando ${entidadesFiltradas.length} ${
                entidadesFiltradas.length === 1 ? "entidad" : "entidades"
              } · Datos de ejemplo · Clic en una entidad para ver su gráfica`}
        </Text>
      </View>

      {/* MODAL SELECTOR NATIVO PARA FILTROS */}
      <Modal
        visible={modalAbierto !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalAbierto(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalAbierto(null)}
        >
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalAbierto === "sector"
                  ? "Seleccionar Sector"
                  : modalAbierto === "dimension"
                  ? "Seleccionar Dimensión"
                  : "Seleccionar Periodo"}
              </Text>
              <Pressable
                onPress={() => setModalAbierto(null)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              {/* Opciones para Sector */}
              {modalAbierto === "sector" &&
                sectoresDisponibles.map((sec) => {
                  const activo = sec === sectorSeleccionado;
                  return (
                    <Pressable
                      key={sec}
                      style={[styles.modalOption, activo && styles.modalOptionActive]}
                      onPress={() => {
                        setSectorSeleccionado(sec);
                        setModalAbierto(null);
                      }}
                    >
                      <Text
                        style={[
                          styles.modalOptionText,
                          activo && styles.modalOptionTextActive,
                        ]}
                      >
                        {sec}
                      </Text>
                      {activo && <Text style={styles.modalCheckmark}>✓</Text>}
                    </Pressable>
                  );
                })}

              {/* Opciones para Dimensión */}
              {modalAbierto === "dimension" &&
                DIMENSIONES_DISPONIBLES.map((dim) => {
                  const activo = dim === dimensionSeleccionada;
                  return (
                    <Pressable
                      key={dim}
                      style={[styles.modalOption, activo && styles.modalOptionActive]}
                      onPress={() => {
                        setDimensionSeleccionada(dim);
                        setModalAbierto(null);
                      }}
                    >
                      <Text
                        style={[
                          styles.modalOptionText,
                          activo && styles.modalOptionTextActive,
                        ]}
                      >
                        {dim}
                      </Text>
                      {activo && <Text style={styles.modalCheckmark}>✓</Text>}
                    </Pressable>
                  );
                })}

              {/* Opciones para Periodo */}
              {modalAbierto === "periodo" &&
                periodosDisponibles.map((per) => {
                  const activo = per === periodoSeleccionado;
                  return (
                    <Pressable
                      key={per}
                      style={[styles.modalOption, activo && styles.modalOptionActive]}
                      onPress={() => {
                        setPeriodoSeleccionado(per);
                        setModalAbierto(null);
                      }}
                    >
                      <Text
                        style={[
                          styles.modalOptionText,
                          activo && styles.modalOptionTextActive,
                        ]}
                      >
                        {formatearPeriodo(per)}
                      </Text>
                      {activo && <Text style={styles.modalCheckmark}>✓</Text>}
                    </Pressable>
                  );
                })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
    gap: spacing.md,
    backgroundColor: PALETA_MERCADO.fondoClaro,
  },
  headerTitleContainer: {
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

  /* Panel de filtros */
  filtersCard: {
    backgroundColor: PALETA_MERCADO.blanco,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: PALETA_MERCADO.bordeClaro,
    gap: 10,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  filtersRow: {
    flexDirection: "row",
    gap: 10,
  },
  filterField: {
    flex: 1,
  },
  filterLabel: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 11,
    color: PALETA_MERCADO.textoMuted,
    marginBottom: 4,
  },
  filterLabelSpacer: {
    fontSize: 11,
    marginBottom: 4,
  },
  filterSelector: {
    height: 40,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterSelectorText: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 12,
    color: PALETA_MERCADO.azulNoche,
    flex: 1,
    marginRight: 4,
  },
  chevronIcon: {
    fontSize: 12,
    color: PALETA_MERCADO.textoMuted,
  },
  clearButton: {
    height: 40,
    backgroundColor: PALETA_MERCADO.blanco,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  clearButtonPressed: {
    backgroundColor: "#F1F5F9",
  },
  clearButtonText: {
    fontFamily: "Manrope_700Bold",
    fontSize: 12,
    color: PALETA_MERCADO.azulAcero,
  },
  filtersCaption: {
    fontFamily: "Manrope_400Regular",
    fontSize: 10.5,
    color: PALETA_MERCADO.textoMuted,
    marginTop: -2,
    lineHeight: 14,
  },

  /* Lista de entidades */
  listContainer: {
    gap: 12,
  },
  entityCard: {
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
  entityCardPressed: {
    opacity: 0.85,
    backgroundColor: "#F8FAFC",
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLeftHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  positionBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  positionFirst: {
    backgroundColor: PALETA_MERCADO.azulNoche,
  },
  positionSecond: {
    backgroundColor: PALETA_MERCADO.azulAcero,
  },
  positionThird: {
    backgroundColor: "#3B6998",
  },
  positionDefault: {
    backgroundColor: "#F1F5F9",
  },
  positionText: {
    fontFamily: "Manrope_700Bold",
    fontSize: 12,
  },
  positionTextTop: {
    color: PALETA_MERCADO.blanco,
  },
  positionTextDefault: {
    color: PALETA_MERCADO.textoMuted,
  },
  entityTitleBlock: {
    flex: 1,
  },
  entityName: {
    fontFamily: "Manrope_700Bold",
    fontSize: 15,
    color: PALETA_MERCADO.azulNoche,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  entityCode: {
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
  variationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  badgePositive: {
    backgroundColor: PALETA_MERCADO.positivoFondoClaro,
  },
  badgeNegative: {
    backgroundColor: PALETA_MERCADO.negativoFondoClaro,
  },
  variationText: {
    fontFamily: "Manrope_700Bold",
    fontSize: 11,
  },
  textPositive: {
    color: PALETA_MERCADO.positivoTextoClaro,
  },
  textNegative: {
    color: PALETA_MERCADO.negativoTextoClaro,
  },
  icRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  icLabel: {
    fontFamily: "Manrope_700Bold",
    fontSize: 12,
    color: PALETA_MERCADO.textoMuted,
    marginRight: 6,
  },
  icValue: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 15,
    color: PALETA_MERCADO.azulNoche,
    marginRight: 8,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
    marginRight: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: PALETA_MERCADO.azulNoche,
    borderRadius: 3,
  },
  chevron: {
    fontFamily: "Manrope_700Bold",
    fontSize: 16,
    color: "#94A3B8",
    marginTop: -2,
  },
  dimensionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 8,
    marginTop: 10,
  },
  dimensionColumn: {
    flex: 1,
    alignItems: "center",
  },
  dimensionLabel: {
    fontFamily: "Manrope_500Medium",
    fontSize: 10,
    color: PALETA_MERCADO.textoMuted,
    marginBottom: 2,
  },
  dimensionValue: {
    fontFamily: "Manrope_700Bold",
    fontSize: 12,
    color: PALETA_MERCADO.azulNoche,
  },
  dimensionDivider: {
    width: 1,
    height: 18,
    backgroundColor: "#E2E8F0",
  },

  /* Estado vacío */
  emptyContainer: {
    backgroundColor: PALETA_MERCADO.blanco,
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: PALETA_MERCADO.bordeClaro,
    marginTop: 8,
  },
  emptyTitle: {
    fontFamily: "Manrope_700Bold",
    fontSize: 16,
    color: PALETA_MERCADO.azulNoche,
    marginBottom: 6,
  },
  emptyDescription: {
    fontFamily: "Manrope_400Regular",
    fontSize: 13,
    color: PALETA_MERCADO.textoMuted,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 18,
  },
  emptyButton: {
    backgroundColor: PALETA_MERCADO.azulAcero,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontFamily: "Manrope_700Bold",
    fontSize: 13,
    color: PALETA_MERCADO.blanco,
  },

  /* Pie de página */
  footerContainer: {
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

  /* Modal de selección */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalContent: {
    width: "100%",
    maxHeight: "65%",
    backgroundColor: PALETA_MERCADO.blanco,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    marginBottom: 8,
  },
  modalTitle: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 16,
    color: PALETA_MERCADO.azulNoche,
  },
  modalCloseButton: {
    padding: 6,
  },
  modalCloseText: {
    fontSize: 16,
    color: PALETA_MERCADO.textoMuted,
    fontFamily: "Manrope_700Bold",
  },
  modalList: {
    maxHeight: 320,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 2,
  },
  modalOptionActive: {
    backgroundColor: "#EBF3FA",
  },
  modalOptionText: {
    fontFamily: "Manrope_500Medium",
    fontSize: 14,
    color: "#334155",
  },
  modalOptionTextActive: {
    fontFamily: "Manrope_700Bold",
    color: PALETA_MERCADO.azulNoche,
  },
  modalCheckmark: {
    fontFamily: "Manrope_700Bold",
    fontSize: 14,
    color: PALETA_MERCADO.azulAcero,
  },
});
