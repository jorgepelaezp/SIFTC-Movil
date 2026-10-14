import { View, Text, ScrollView, StyleSheet } from "react-native";
import { PlaceholderBox } from "../components/CuadroVacio";
import { colors, spacing } from "../theme";

export default function ChartsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.crumb}>Gráficas / Entidad</Text>
      <Text style={styles.title}>Ficha de entidad</Text>

      <PlaceholderBox height={52} label="Selector de entidad" />

      <View style={styles.row}>
        <PlaceholderBox height={44} label="Velas / Línea" style={{ flex: 2 }} />
        <PlaceholderBox height={44} label="Periodo" style={{ flex: 3 }} />
      </View>

      <PlaceholderBox height={340} label="Gráfica de velas" />

      <View style={styles.row}>
        {["Apertura", "Máximo", "Cierre"].map((l) => (
          <PlaceholderBox key={l} height={70} label={l} style={{ flex: 1 }} />
        ))}
      </View>
    </ScrollView>
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
  row: { flexDirection: "row", gap: spacing.sm },
});
