import { useEffect, useMemo, useRef } from "react";
import {
  Alert,
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { spacing, radius } from "../theme";
import { useTema } from "../theme/TemaContext";
import { Paleta } from "../theme/paletas";

type Props = {
  visible: boolean;
  onClose: () => void;
  onCerrarSesion: () => void;
};

const OPCIONES_TEMA = [
  { valor: "claro", etiqueta: "Claro", icono: "sunny-outline" },
  { valor: "oscuro", etiqueta: "Oscuro", icono: "moon-outline" },
  { valor: "sistema", etiqueta: "Sistema", icono: "phone-portrait-outline" },
] as const;

export function MenuUsuario({ visible, onClose, onCerrarSesion }: Props) {
  const { colores: colors, preferencia, setPreferencia } = useTema();
  const styles = useMemo(() => crearEstilos(colors), [colors]);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const anchoPanel = Math.min(320, width * 0.82);

  // Animación: el panel entra deslizándose desde la derecha.
  const desplazamiento = useRef(new Animated.Value(anchoPanel)).current;
  useEffect(() => {
    if (visible) {
      desplazamiento.setValue(anchoPanel);
      Animated.timing(desplazamiento, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, anchoPanel, desplazamiento]);

  const confirmarCierre = () => {
    Alert.alert("Cerrar sesión", "¿Quieres salir de tu cuenta?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: () => {
          onClose();
          onCerrarSesion();
        },
      },
    ]);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.fondo}>
        {/* Tocar fuera del panel cierra el menú */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Cerrar menú"
        />

        <Animated.View
          style={[
            styles.panel,
            {
              width: anchoPanel,
              paddingTop: insets.top + spacing.lg,
              paddingBottom: insets.bottom + spacing.lg,
              transform: [{ translateX: desplazamiento }],
            },
          ]}>
          {/* Cabecera del usuario */}
          <View style={styles.cabecera}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={26} color={colors.white} />
            </View>
            <View style={styles.cabeceraTextos}>
              <Text style={styles.nombre}>Mi cuenta</Text>
              <Text style={styles.estado}>Sesión activa</Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Cerrar menú"
              style={styles.botonCerrar}>
              <Ionicons name="close" size={22} color={colors.textLight} />
            </Pressable>
          </View>

          <View style={styles.separador} />

          {/* Apariencia: claro, oscuro o igual al celular */}
          <Text style={styles.seccion}>Apariencia</Text>
          <View style={styles.selectorTema}>
            {OPCIONES_TEMA.map((opcion) => {
              const activa = preferencia === opcion.valor;
              return (
                <Pressable
                  key={opcion.valor}
                  onPress={() => setPreferencia(opcion.valor)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: activa }}
                  style={[styles.opcionTema, activa && styles.opcionTemaActiva]}>
                  <Ionicons
                    name={opcion.icono}
                    size={20}
                    color={activa ? colors.blue : colors.textLight}
                  />
                  <Text style={[styles.textoOpcion, activa && styles.textoOpcionActiva]}>
                    {opcion.etiqueta}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.ayuda}>
            "Sistema" usa el mismo modo que tu celular.
          </Text>

          <View style={styles.relleno} />

          <View style={styles.separador} />

          {/* Cerrar sesión, con confirmación */}
          <Pressable
            onPress={confirmarCierre}
            accessibilityRole="button"
            style={({ pressed }) => [styles.filaSalir, pressed && styles.filaPresionada]}>
            <Ionicons name="log-out-outline" size={22} color={colors.loss} />
            <Text style={styles.textoSalir}>Cerrar sesión</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const crearEstilos = (colors: Paleta) =>
  StyleSheet.create({
    fondo: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.45)",
      alignItems: "flex-end",
    },
    panel: {
      flex: 1,
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.lg,
      borderTopLeftRadius: radius.xl,
      borderBottomLeftRadius: radius.xl,
    },
    cabecera: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.blue,
      alignItems: "center",
      justifyContent: "center",
    },
    cabeceraTextos: { flex: 1 },
    nombre: {
      fontFamily: "Manrope_700Bold",
      fontSize: 17,
      color: colors.text,
    },
    estado: {
      fontFamily: "Manrope_500Medium",
      fontSize: 13,
      color: colors.gain,
      marginTop: 2,
    },
    botonCerrar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    separador: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.lg,
    },
    seccion: {
      fontFamily: "Manrope_600SemiBold",
      fontSize: 13,
      color: colors.textLight,
      marginBottom: spacing.sm,
    },
    selectorTema: {
      flexDirection: "row",
      backgroundColor: colors.chip,
      borderRadius: radius.md,
      padding: spacing.xs,
      gap: spacing.xs,
    },
    opcionTema: {
      flex: 1,
      alignItems: "center",
      paddingVertical: spacing.sm,
      borderRadius: radius.md - 2,
      gap: 2,
    },
    opcionTemaActiva: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textoOpcion: {
      fontFamily: "Manrope_600SemiBold",
      fontSize: 12,
      color: colors.textLight,
    },
    textoOpcionActiva: { color: colors.blue },
    ayuda: {
      fontFamily: "Manrope_400Regular",
      fontSize: 12,
      color: colors.textLight,
      marginTop: spacing.sm,
    },
    relleno: { flex: 1 },
    filaSalir: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.md,
    },
    filaPresionada: { backgroundColor: colors.lossBg },
    textoSalir: {
      fontFamily: "Manrope_700Bold",
      fontSize: 15,
      color: colors.loss,
    },
  });