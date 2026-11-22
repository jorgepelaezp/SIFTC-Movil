import { useEffect, useMemo, useState } from "react";
import { View, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing } from "../theme";
import { useTema } from "../theme/TemaContext";
import { Paleta } from "../theme/paletas";
import { TickerMercado } from "./TickerMercado";
import { MenuUsuario } from "./MenuUsuario";
import type { Entidad } from "../models";
import { getEntidades } from "../services/mercado";

// Logos sin fondo: uno para modo claro y otro para modo oscuro.
const LOGO_CLARO = require("../assets/alza-logo-claro.png");
const LOGO_OSCURO = require("../assets/alza-logo-oscuro.png");

// onAvatarPress se mantiene con el mismo nombre para no tocar App.tsx:
// ahora se usa desde la opción "Cerrar sesión" del menú.
type Props = { onAvatarPress: () => void };

export function AppHeader({ onAvatarPress }: Props) {
  const { colores: colors, esOscuro } = useTema();
  const styles = useMemo(() => crearEstilos(colors), [colors]);
  const [menuAbierto, setMenuAbierto] = useState(false);

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
          // key fuerza a remontar la imagen al cambiar de tema (evita que quede el logo anterior)
          key={esOscuro ? "logo-oscuro" : "logo-claro"}
          source={esOscuro ? LOGO_OSCURO : LOGO_CLARO}
          accessibilityLabel="ALZA"
          style={styles.logo}
          resizeMode="contain"
        />
        <Pressable
          onPress={() => setMenuAbierto(true)}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Abrir menú de usuario"
          style={({ pressed }) => [styles.avatar, pressed && styles.avatarPresionado]}>
          <Ionicons name="person" size={20} color={colors.avatarIcon} />
        </Pressable>
      </View>
      {/* Ticker horizontal animado continuo (HU-MO-02) */}
      <View style={styles.tickerContainer}>
        <TickerMercado entidades={entidades} />
      </View>

      <MenuUsuario
        visible={menuAbierto}
        onClose={() => setMenuAbierto(false)}
        onCerrarSesion={onAvatarPress}
      />
    </View>
  );
}

const crearEstilos = (colors: Paleta) =>
  StyleSheet.create({
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
    logo: { width: 60, height: 48 },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.avatarBg,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarPresionado: { opacity: 0.8 },
    tickerContainer: {
      width: "100%",
    },
  });