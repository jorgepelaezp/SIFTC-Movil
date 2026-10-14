import { View, Text, ScrollView, StyleSheet } from "react-native";
import { PlaceholderBox } from "../CuadroVacio";
import { colors, spacing } from "../../theme";

export default function HomeScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Tablero de mercado</Text>
      <Text style={styles.subtitle}>Cierre del día</Text>

      <PlaceholderBox height={220} label="Índice general + gráfica" />

      <View style={styles.row}>
        {["Apertura", "Máximo", "Mínimo", "Cierre"].map((l) => (
          <PlaceholderBox key={l} height={64} label={l} style={styles.flex} />
        ))}
      </View>

      <PlaceholderBox height={150} label="Resumen del día" dark />

      <View style={styles.row}>
        <PlaceholderBox
          height={200}
          label="Top 3 ganadores"
          style={styles.flex}
        />
        <PlaceholderBox
          height={200}
          label="Top 3 perdedores"
          style={styles.flex}
        />
      </View>

      <PlaceholderBox height={80} label="Ver ranking" style={styles.banner} />
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
  flex: { flex: 1 },
  banner: { backgroundColor: colors.blueSoft, borderColor: colors.blueSoft },
});
