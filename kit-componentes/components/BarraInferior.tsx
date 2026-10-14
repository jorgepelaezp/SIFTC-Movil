import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme";

export type TabKey = "tablero" | "graficas" | "ranking";

const TABS: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "tablero", label: "Tablero", icon: "bar-chart" },
  { key: "graficas", label: "Gráficas", icon: "stats-chart" },
  { key: "ranking", label: "Ranking", icon: "trophy-outline" },
];

type Props = { active: TabKey; onChange: (tab: TabKey) => void };

export function BottomTabBar({ active, onChange }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        const color = isActive ? colors.blue : "#94A3B8";
        return (
          <Pressable key={tab.key} style={styles.item} onPress={() => onChange(tab.key)}>
            <Ionicons name={tab.icon} size={24} color={color} />
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
            <View style={[styles.indicator, isActive && styles.indicatorOn]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  item: { flex: 1, alignItems: "center" },
  label: { fontFamily: "Manrope_600SemiBold", fontSize: 12, marginTop: 2 },
  indicator: {
    height: 3,
    width: 36,
    borderRadius: 2,
    marginTop: 6,
    backgroundColor: "transparent",
  },
  indicatorOn: { backgroundColor: colors.blue },
});