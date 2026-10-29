/*HU-MO-02 CREACION DEL TICKER DESPLAZABLE*/

import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  EntidadMercado,
  PALETA_MERCADO,
  formatearIndice,
  formatearVariacion,
} from "../services/datosMercado";
import { aEntidadMercado } from "../services/adaptadores";
import { useEntidades } from "../hooks/useEntidades";

interface Props {
  /** Sin esta prop, el ticker usa las entidades de la API (o los mocks). */
  entidades?: EntidadMercado[];
}

export function TickerMercado({ entidades: propias }: Props) {
  const cargadas = useEntidades();
  const entidades = propias ?? cargadas.map(aEntidadMercado);
  const [contentWidth, setContentWidth] = useState(0);
  const animX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (contentWidth <= 0) return;

    let isMounted = true;
    let animRef: Animated.CompositeAnimation | null = null;

    const runTicker = () => {
      animX.setValue(0);
      animRef = Animated.timing(animX, {
        toValue: -contentWidth,
        duration: 50000, // ~50 segundos por ciclo completo
        easing: Easing.linear,
        useNativeDriver: true,
      });

      animRef.start(({ finished }) => {
        if (finished && isMounted) {
          runTicker();
        }
      });
    };

    runTicker();

    return () => {
      isMounted = false;
      animRef?.stop();
    };
  }, [contentWidth, animX]);

  const renderFilaEntidades = (keyPrefix: string) => (
    <View
      key={keyPrefix}
      style={styles.entityRow}
      onLayout={
        keyPrefix === "set-1"
          ? (e) => {
              const width = Math.round(e.nativeEvent.layout.width);
              if (width > 0 && width !== contentWidth) {
                setContentWidth(width);
              }
            }
          : undefined
      }
    >
      {entidades.map((entidad, index) => {
        const variacion = formatearVariacion(entidad.variacion_porcentual);
        const colorVar = variacion.esPositivo
          ? PALETA_MERCADO.positivoTextoOscuro
          : variacion.esNegativo
          ? PALETA_MERCADO.negativoTextoOscuro
          : "#E2E8F0";

        return (
          <View key={`${keyPrefix}-${entidad.codigo_entidad}`} style={styles.itemWrapper}>
            <View style={styles.itemContainer}>
              <Text style={styles.codeText}>{entidad.codigo_entidad}</Text>
              <Text style={styles.indexText}>
                {formatearIndice(entidad.indice_competitividad)}
              </Text>
              <View style={styles.variationRow}>
                <Text style={[styles.variationText, { color: colorVar }]}>
                  {variacion.icono} {variacion.texto}
                </Text>
              </View>
            </View>
            <Text style={styles.separator}>|</Text>
          </View>
        );
      })}
    </View>
  );

  if (entidades.length === 0) {
    return (
      <View style={styles.tickerContainer}>
        <Text style={styles.emptyText}>Sin cotizaciones disponibles</Text>
      </View>
    );
  }

  return (
    <View style={styles.tickerContainer}>
      <Animated.View
        style={[
          styles.animatedTrack,
          {
            transform: [{ translateX: animX }],
          },
        ]}
      >
        {renderFilaEntidades("set-1")}
        {renderFilaEntidades("set-2")}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  tickerContainer: {
    height: 44,
    backgroundColor: PALETA_MERCADO.azulNoche,
    overflow: "hidden",
    justifyContent: "center",
  },
  animatedTrack: {
    flexDirection: "row",
    alignItems: "center",
  },
  entityRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
  },
  codeText: {
    color: "#94A3B8",
    fontFamily: "Manrope_600SemiBold",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  indexText: {
    color: PALETA_MERCADO.blanco,
    fontFamily: "Manrope_700Bold",
    fontSize: 12,
  },
  variationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  variationText: {
    fontFamily: "Manrope_600SemiBold",
    fontSize: 12,
  },
  emptyText: {
    color: "#94A3B8",
    fontFamily: "Manrope_600SemiBold",
    fontSize: 12,
    textAlign: "center",
  },
  separator: {
    color: "#334155",
    fontSize: 13,
    paddingHorizontal: 2,
  },
});
