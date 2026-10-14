import { View, Text, ScrollView, StyleSheet } from "react-native";
import { PlaceholderBox } from "../components/CuadroVacio";
import { colors, spacing } from "../theme";

export default function RankingScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Ranking</Text>
      <Text style={styles.subtitle}>
        Compara el desempeño por sector, dimensión y periodo.
      </Text>

      <View style={styles.row}>
        {["Sector", "Dimensión", "Periodo"].map((l) => (
          <PlaceholderBox key={l} height={56} label={l} style={{ flex: 1 }} />
        ))}
      </View>

      <PlaceholderBox height={220} label="Top 3 entidades" />

      {[1, 2, 3, 4, 5].map((n) => (
        <PlaceholderBox key={n} height={64} label={`Entidad #${n}`} />
      ))}
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
  row: { flexDirection: "row", gap: spacing.sm },
});
