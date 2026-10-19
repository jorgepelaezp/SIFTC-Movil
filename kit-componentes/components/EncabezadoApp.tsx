import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { colors, spacing } from "../theme";
import { TickerMercado } from "./TickerMercado";

type Props = { onAvatarPress: () => void };

export function AppHeader({ onAvatarPress }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Pressable onPress={onAvatarPress} style={styles.avatar}>
          <Text style={styles.avatarText}>R</Text>
        </Pressable>
      </View>
      {/* Ticker horizontal animado continuo (HU-MO-02) */}
      <View style={styles.tickerContainer}>
        <TickerMercado />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  logo: { width: 110, height: 48 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.blue,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.white,
    fontFamily: "Manrope_700Bold",
    fontSize: 16,
  },
  tickerContainer: {
    width: "100%",
  },
});