import { useEffect, useState } from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { colors, spacing } from "../theme";
import { TickerMercado } from "./TickerMercado";
import type { Entidad } from "../models";
import { getEntidades } from "../services/mercado";

type Props = { onAvatarPress: () => void };

export function AppHeader({ onAvatarPress }: Props) {
  const [entidades, setEntidades] = useState<Entidad[]>([]);
  useEffect(() => {
    let activo = true;
    getEntidades().then((datos) => { if (activo) setEntidades(datos); }).catch(() => { if (activo) setEntidades([]); });
    return () => { activo = false; };
  }, []);

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
        <TickerMercado entidades={entidades} />
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
