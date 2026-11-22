import { useEffect, useMemo, useState } from "react";
import { View, Text, Switch, StyleSheet, Alert } from "react-native";
import type { Entidad } from "../models";
import { useTema } from "../theme/TemaContext";
import type { Paleta } from "../theme/paletas";
import {
  cambiarAvisosEntidad,
  obtenerAvisosEntidad,
} from "../services/notificaciones";

type Props = {
  entidadId: Entidad["id"];
};

// HU-MO-05 (CA 3): activar o desactivar las alertas de una entidad de la watchlist.
export function InterruptorAvisos({ entidadId }: Props) {
  const { colores: colors } = useTema();
  const styles = useMemo(() => crearEstilos(colors), [colors]);
  const [activo, setActivo] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let vigente = true;
    obtenerAvisosEntidad(String(entidadId))
      .then((valor) => {
        if (vigente) setActivo(valor);
      })
      .catch(() => undefined);
    return () => {
      vigente = false;
    };
  }, [entidadId]);

  const cambiar = async (valor: boolean) => {
    setActivo(valor);
    setGuardando(true);
    try {
      await cambiarAvisosEntidad(String(entidadId), valor);
    } catch (error) {
      setActivo(!valor);
      Alert.alert(
        "Alertas",
        error instanceof Error ? error.message : "No se pudo guardar la preferencia."
      );
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View style={styles.fila}>
      <View style={styles.textos}>
        <Text style={styles.titulo}>Alertas de umbral</Text>
        <Text style={styles.detalle}>
          {activo
            ? "Recibirás una notificación si esta entidad varía fuera de umbral."
            : "No recibirás notificaciones de esta entidad."}
        </Text>
      </View>
      <Switch
        value={activo}
        onValueChange={cambiar}
        disabled={guardando}
        trackColor={{ false: colors.border, true: colors.chipActiveBg }}
        accessibilityLabel="Recibir alertas de esta entidad"
      />
    </View>
  );
}

const crearEstilos = (colors: Paleta) =>
  StyleSheet.create({
    fila: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginTop: 12,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: colors.divider,
    },
    textos: { flex: 1 },
    titulo: {
      fontFamily: "Manrope_700Bold",
      fontSize: 13,
      color: colors.textStrong,
    },
    detalle: {
      fontFamily: "Manrope_400Regular",
      fontSize: 11,
      color: colors.textLight,
      marginTop: 2,
      lineHeight: 15,
    },
  });