import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { colors, spacing } from "../theme";

type Props = { onAvatarPress: () => void };

export function AppHeader({ onAvatarPress }: Props) {
  return (
    <View>
      <View style={styles.row}>
        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Pressable onPress={onAvatarPress} style={styles.avatar}>
          <Text style={styles.avatarText}>J</Text>
        </Pressable>
      </View>
      {/* Aquí irá el ticker desplazable (HU-MO-02 CA1) */}
      <View style={styles.ticker} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
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
  ticker: {
    height: 36,
    backgroundColor: colors.navy,
    marginTop: spacing.sm,
  },
});