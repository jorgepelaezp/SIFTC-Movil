import { View, Text, ScrollView, RefreshControl, StyleSheet } from "react-native";
import {
  DataError,
  DaySummary,
  EmptyState,
  IndexCard,
  LoadingIndicator,
  TopList,
} from "../components";
import { useMercado } from "../hooks/useMercado";
import { colors, spacing } from "../theme";
import { fechaIso } from "../utils/formato";

export default function HomeScreen() {
  const { datos, cargando, refrescando, error, refrescar } = useMercado();
  const vacio = !!datos && datos.entidades.length === 0;

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      // HU-MO-02 CA3: deslizar hacia abajo actualiza con indicador de carga
      refreshControl={
        <RefreshControl
          refreshing={refrescando}
          onRefresh={refrescar}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }>
      <Text style={styles.title}>Tablero de mercado</Text>
      {datos && (
        <Text style={styles.subtitle}>Cierre del {fechaIso(datos.indice.fecha)}</Text>
      )}

      {cargando && !datos && <LoadingIndicator message="Cargando mercado..." />}

      {/* Error: si ya había datos se conservan debajo del aviso */}
      {error && <DataError message={error} onRetry={refrescar} />}

      {vacio && <EmptyState />}

      {datos && !vacio && (
        <>
          <IndexCard indice={datos.indice} ejemplo={datos.ejemplo} />
          <DaySummary
            entidades={datos.entidades}
            mayorSubida={datos.top.ganadores[0]}
            mayorBajada={datos.top.perdedores[0]}
          />
          <TopList title="Top 5 ganadores del día" entidades={datos.top.ganadores} />
          <TopList title="Top 5 perdedores del día" entidades={datos.top.perdedores} />
        </>
      )}
      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md },
  title: {
    fontFamily: "Manrope_800ExtraBold",
    fontSize: 28,
    color: colors.text,
  },
  subtitle: {
    fontFamily: "Manrope_400Regular",
    fontSize: 14,
    color: colors.textLight,
    marginTop: -8,
  },
  footer: { height: spacing.lg },
});
