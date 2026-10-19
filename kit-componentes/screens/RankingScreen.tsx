import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  ENTIDADES_MERCADO,
  INDICE_GENERAL,
  EntidadMercado,
  PALETA_MERCADO,
  formatearFechaCO,
  formatearIndice,
  formatearNumeroCO,
  formatearVariacion,
  obtenerTopGanadores,
  obtenerTopPerdedores,
} from "../services/datosMercado";
import { GraficaIndice } from "../components/GraficaIndice";
import { colors, spacing } from "../theme";

export default function RankingScreen() {
  const topGanadores = obtenerTopGanadores(ENTIDADES_MERCADO, 5);
  const topPerdedores = obtenerTopPerdedores(ENTIDADES_MERCADO, 5);

  const variacionIndice = formatearVariacion(INDICE_GENERAL.variacion_porcentual);
  const difPuntosStr = `${formatearNumeroCO(INDICE_GENERAL.diferencia_puntos, 1)} pts`;

  // Top 3 para el podio visual del mockup (Alfa, Beta, Gamma)
  const top1 = topGanadores[0]; // Alfa
  const top2 = topGanadores[1]; // Beta
  const top3 = topGanadores[2]; // Gamma

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. TÍTULO Y SUBTÍTULO DE RANKING */}
      <View style={styles.headerTitleContainer}>
        <Text style={styles.title}>Ranking</Text>
        <Text style={styles.subtitle}>
          Compara el desempeño por sector, dimensión y periodo.
        </Text>
      </View>

      {/* 2. FILTROS RÁPIDOS (SECTOR, DIMENSIÓN, PERIODO) */}
      <View style={styles.filtersRow}>
        <View style={styles.filterChip}>
          <Text style={styles.filterChipLabel}>Sector</Text>
          <View style={styles.filterChipValueRow}>
            <Text style={styles.filterChipValue}>Todos</Text>
            <Text style={styles.chevron}>▾</Text>
          </View>
        </View>
        <View style={styles.filterChip}>
          <Text style={styles.filterChipLabel}>Dimensión</Text>
          <View style={styles.filterChipValueRow}>
            <Text style={styles.filterChipValue}>Competitividad</Text>
            <Text style={styles.chevron}>▾</Text>
          </View>
        </View>
        <View style={styles.filterChip}>
          <Text style={styles.filterChipLabel}>Periodo</Text>
          <View style={styles.filterChipValueRow}>
            <Text style={styles.filterChipValue}>1M</Text>
            <Text style={styles.chevron}>▾</Text>
          </View>
        </View>
      </View>

      {/* 3. PODIO DE TOP 3 ENTIDADES (REFERENCIA DEL MOCKUP) */}
      <View style={styles.podiumSectionHeader}>
        <Text style={styles.sectionTitle}>Top 3 entidades</Text>
        <Text style={styles.linkText}>Ver detalle &gt;</Text>
      </View>
      <View style={styles.podiumRow}>
        {/* Puesto 2: Entidad Beta */}
        {top2 && (
          <View style={[styles.podiumCard, styles.podiumCardSide]}>
            <View style={[styles.podiumBadge, styles.badgeSecond]}>
              <Text style={styles.podiumBadgeText}>2</Text>
            </View>
            <View style={styles.podiumAvatar}>
              <Text style={styles.podiumAvatarText}>B</Text>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>
              {top2.nombre_entidad}
            </Text>
            <Text style={styles.podiumScore}>
              {formatearIndice(top2.indice_competitividad)}
            </Text>
            <View style={[styles.pillBadge, styles.badgePositive]}>
              <Text style={[styles.pillBadgeText, styles.textPositive]}>
                ▲ +{formatearNumeroCO(top2.variacion_porcentual, 2)} %
              </Text>
            </View>
          </View>
        )}

        {/* Puesto 1: Entidad Alfa (Ligeramente más alta) */}
        {top1 && (
          <View style={[styles.podiumCard, styles.podiumCardCenter]}>
            <View style={[styles.podiumBadge, styles.badgeFirst]}>
              <Text style={styles.podiumBadgeText}>1</Text>
            </View>
            <View style={styles.podiumAvatar}>
              <Text style={styles.podiumAvatarText}>A</Text>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>
              {top1.nombre_entidad}
            </Text>
            <Text style={styles.podiumScore}>
              {formatearIndice(top1.indice_competitividad)}
            </Text>
            <View style={[styles.pillBadge, styles.badgePositive]}>
              <Text style={[styles.pillBadgeText, styles.textPositive]}>
                ▲ +{formatearNumeroCO(top1.variacion_porcentual, 2)} %
              </Text>
            </View>
          </View>
        )}

        {/* Puesto 3: Entidad Gamma */}
        {top3 && (
          <View style={[styles.podiumCard, styles.podiumCardSide]}>
            <View style={[styles.podiumBadge, styles.badgeThird]}>
              <Text style={styles.podiumBadgeText}>3</Text>
            </View>
            <View style={styles.podiumAvatar}>
              <Text style={styles.podiumAvatarText}>G</Text>
            </View>
            <Text style={styles.podiumName} numberOfLines={1}>
              {top3.nombre_entidad}
            </Text>
            <Text style={styles.podiumScore}>
              {formatearIndice(top3.indice_competitividad)}
            </Text>
            <View style={[styles.pillBadge, styles.badgePositive]}>
              <Text style={[styles.pillBadgeText, styles.textPositive]}>
                ▲ +{formatearNumeroCO(top3.variacion_porcentual, 2)} %
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* 4. TARJETA DEL ÍNDICE GENERAL CON GRÁFICA DE 30 PUNTOS */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.indexTitleRow}>
            <Text style={styles.cardCategory}>ÍNDICE GENERAL</Text>
            <View style={styles.badgeEjemplo}>
              <Text style={styles.badgeEjemploText}>{INDICE_GENERAL.etiqueta}</Text>
            </View>
          </View>
          <Text style={styles.dateText}>
            {formatearFechaCO(INDICE_GENERAL.fecha)}
          </Text>
        </View>

        {/* Valor principal y variación */}
        <View style={styles.mainValueRow}>
          <Text style={styles.mainValue}>
            {formatearIndice(INDICE_GENERAL.valor_actual)}
          </Text>
          <View style={styles.variationGroup}>
            <View
              style={[
                styles.variationBadge,
                variacionIndice.esPositivo
                  ? styles.badgePositive
                  : styles.badgeNegative,
              ]}
            >
              <Text
                style={[
                  styles.variationBadgeText,
                  variacionIndice.esPositivo
                    ? styles.textPositive
                    : styles.textNegative,
                ]}
              >
                {variacionIndice.icono} {variacionIndice.texto}
              </Text>
            </View>
            <Text style={styles.diffPointsText}>({difPuntosStr})</Text>
          </View>
        </View>

        {/* Periodo de la serie gráfica */}
        <View style={styles.chartHeaderRow}>
          <Text style={styles.chartPeriodLabel}>
            Comportamiento — {INDICE_GENERAL.periodo_grafico}
          </Text>
        </View>

        {/* Gráfica nativa de los 30 puntos */}
        <GraficaIndice puntos={INDICE_GENERAL.historico_30_dias} altura={120} />

        {/* 4 estadísticas clave: Apertura, Máximo, Mínimo, Cierre */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Apertura</Text>
            <Text style={styles.statValue}>
              {formatearIndice(INDICE_GENERAL.apertura)}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Máximo</Text>
            <Text style={styles.statValue}>
              {formatearIndice(INDICE_GENERAL.maximo)}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Mínimo</Text>
            <Text style={styles.statValue}>
              {formatearIndice(INDICE_GENERAL.minimo)}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Cierre</Text>
            <Text style={styles.statValue}>
              {formatearIndice(INDICE_GENERAL.cierre)}
            </Text>
          </View>
        </View>
      </View>

      {/* 5. TOP 5 GANADORES DEL DÍA */}
      <View style={styles.sectionHeaderContainer}>
        <Text style={styles.sectionTitle}>Top 5 ganadores del día</Text>
        <Text style={styles.sectionSubtitle}>
          Entidades con mayor incremento porcentual
        </Text>
      </View>
      <View style={styles.listContainer}>
        {topGanadores.map((entidad, index) => (
          <FilaEntidad
            key={`ganador-${entidad.codigo_entidad}`}
            posicion={index + 1}
            entidad={entidad}
          />
        ))}
      </View>

      {/* 7. TOP 5 PERDEDORES DEL DÍA */}
      <View style={styles.sectionHeaderContainer}>
        <Text style={styles.sectionTitle}>Top 5 perdedores del día</Text>
        <Text style={styles.sectionSubtitle}>
          Entidades con mayor retroceso porcentual
        </Text>
      </View>
      <View style={styles.listContainer}>
        {topPerdedores.map((entidad, index) => (
          <FilaEntidad
            key={`perdedor-${entidad.codigo_entidad}`}
            posicion={index + 1}
            entidad={entidad}
          />
        ))}
      </View>
    </ScrollView>
  );
}

/**
 * Fila visual de cada entidad en los rankings
 */
function FilaEntidad({
  posicion,
  entidad,
}: {
  posicion: number;
  entidad: EntidadMercado;
}) {
  const variacion = formatearVariacion(entidad.variacion_porcentual);
  const esPositivo = variacion.esPositivo;

  return (
    <View style={styles.rowCard}>
      {/* Círculo de Posición */}
      <View
        style={[
          styles.positionCircle,
          posicion === 1 ? styles.positionFirst : styles.positionDefault,
        ]}
      >
        <Text
          style={[
            styles.positionText,
            posicion === 1 ? styles.positionTextFirst : styles.positionTextDefault,
          ]}
        >
          {posicion}
        </Text>
      </View>

      {/* Datos centrales: Nombre y Sector/Código */}
      <View style={styles.entityInfo}>
        <Text style={styles.entityName} numberOfLines={1}>
          {entidad.nombre_entidad}
        </Text>
        <Text style={styles.entityMeta} numberOfLines={1}>
          {entidad.codigo_entidad} · {entidad.sector}
        </Text>
      </View>

      {/* Datos derechos: Índice y Badge de Variación */}
      <View style={styles.entityValues}>
        <Text style={styles.entityIndex}>
          {formatearIndice(entidad.indice_competitividad)}
        </Text>
        <View
          style={[
            styles.tableBadge,
            esPositivo ? styles.badgePositive : styles.badgeNegative,
          ]}
        >
          <Text
            style={[
              styles.tableBadgeText,
              esPositivo ? styles.textPositive : styles.textNegative,
            ]}
          >
            {variacion.icono} {variacion.texto}
          </Text>
        </View>
      </View>
    </View>
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
    marginBottom: 4,
  },
  title: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 28,
    color: PALETA_MERCADO.azulNoche,
  },
  subtitle: {
    fontFamily: "Manrope_400Regular",
    fontSize: 14,
    color: PALETA_MERCADO.textoMuted,
    marginTop: -4,
  },
  filtersRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    flex: 1,
    backgroundColor: PALETA_MERCADO.blanco,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: PALETA_MERCADO.bordeClaro,
  },
  filterChipLabel: {
    fontFamily: "Manrope_500Medium",
    fontSize: 11,
    color: PALETA_MERCADO.textoMuted,
  },
  filterChipValueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  filterChipValue: {
    fontFamily: "Manrope_700Bold",
    fontSize: 13,
    color: PALETA_MERCADO.azulNoche,
  },
  chevron: {
    fontSize: 12,
    color: PALETA_MERCADO.textoMuted,
  },
  podiumSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  linkText: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 13,
    color: colors.blue,
  },
  podiumRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end",
  },
  podiumCard: {
    flex: 1,
    backgroundColor: PALETA_MERCADO.blanco,
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: PALETA_MERCADO.bordeClaro,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 6,
  },
  podiumCardCenter: {
    paddingVertical: 18,
    borderColor: "#E0EDFF",
  },
  podiumCardSide: {
    paddingVertical: 14,
  },
  podiumBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeFirst: {
    backgroundColor: "#FDE68A",
  },
  badgeSecond: {
    backgroundColor: "#E2E8F0",
  },
  badgeThird: {
    backgroundColor: "#FED7AA",
  },
  podiumBadgeText: {
    fontFamily: "Manrope_700Bold",
    fontSize: 12,
    color: PALETA_MERCADO.azulNoche,
  },
  podiumAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PALETA_MERCADO.azulAcero,
    alignItems: "center",
    justifyContent: "center",
  },
  podiumAvatarText: {
    fontFamily: "Manrope_700Bold",
    fontSize: 14,
    color: PALETA_MERCADO.blanco,
  },
  podiumName: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 12,
    color: PALETA_MERCADO.azulNoche,
    textAlign: "center",
  },
  podiumScore: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 18,
    color: PALETA_MERCADO.azulNoche,
  },
  pillBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  pillBadgeText: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 10,
  },
  card: {
    backgroundColor: PALETA_MERCADO.blanco,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: PALETA_MERCADO.bordeClaro,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  indexTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardCategory: {
    fontFamily: "Manrope_700Bold",
    fontSize: 12,
    letterSpacing: 0.8,
    color: PALETA_MERCADO.azulAcero,
  },
  badgeEjemplo: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  badgeEjemploText: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 10,
    color: "#92400E",
  },
  dateText: {
    fontFamily: "Manrope_500Medium",
    fontSize: 12,
    color: PALETA_MERCADO.textoMuted,
  },
  mainValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 12,
    flexWrap: "wrap",
  },
  mainValue: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 34,
    color: PALETA_MERCADO.azulNoche,
  },
  variationGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  variationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  variationBadgeText: {
    fontFamily: "Manrope_700Bold",
    fontSize: 13,
  },
  diffPointsText: {
    fontFamily: "Manrope_500Medium",
    fontSize: 12,
    color: PALETA_MERCADO.textoMuted,
  },
  chartHeaderRow: {
    marginTop: 4,
  },
  chartPeriodLabel: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 12,
    color: PALETA_MERCADO.textoMuted,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EDF2F7",
  },
  statLabel: {
    fontFamily: "Manrope_500Medium",
    fontSize: 11,
    color: PALETA_MERCADO.textoMuted,
    marginBottom: 2,
  },
  statValue: {
    fontFamily: "Manrope_700Bold",
    fontSize: 14,
    color: PALETA_MERCADO.azulNoche,
  },
  sectionHeaderContainer: {
    marginTop: 8,
    marginBottom: 2,
  },
  sectionTitle: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 18,
    color: PALETA_MERCADO.azulNoche,
  },
  sectionSubtitle: {
    fontFamily: "Manrope_400Regular",
    fontSize: 12,
    color: PALETA_MERCADO.textoMuted,
    marginTop: 2,
  },
  listContainer: {
    gap: 8,
  },
  rowCard: {
    minHeight: 58,
    backgroundColor: PALETA_MERCADO.blanco,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: PALETA_MERCADO.bordeClaro,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  positionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  positionFirst: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  positionDefault: {
    backgroundColor: "#F1F5F9",
  },
  positionText: {
    fontFamily: "Manrope_700Bold",
    fontSize: 13,
  },
  positionTextFirst: {
    color: colors.blue,
  },
  positionTextDefault: {
    color: "#64748B",
  },
  entityInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  entityName: {
    fontFamily: "Manrope_700Bold",
    fontSize: 14,
    color: PALETA_MERCADO.azulNoche,
  },
  entityMeta: {
    fontFamily: "Manrope_500Medium",
    fontSize: 12,
    color: PALETA_MERCADO.textoMuted,
    marginTop: 1,
  },
  entityValues: {
    alignItems: "flex-end",
    gap: 3,
  },
  entityIndex: {
    fontFamily: "Manrope_700Bold",
    fontSize: 14,
    color: PALETA_MERCADO.azulNoche,
  },
  tableBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  tableBadgeText: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 11,
  },
  badgePositive: {
    backgroundColor: PALETA_MERCADO.positivoFondoClaro,
  },
  badgeNegative: {
    backgroundColor: PALETA_MERCADO.negativoFondoClaro,
  },
  textPositive: {
    color: PALETA_MERCADO.positivoTextoClaro,
  },
  textNegative: {
    color: PALETA_MERCADO.negativoTextoClaro,
  },
});
