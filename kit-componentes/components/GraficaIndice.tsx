import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { PALETA_MERCADO, formatearNumeroCO } from "../services/datosMercado";

interface Props {
  puntos: number[];
  altura?: number;
}

export function GraficaIndice({ puntos, altura = 130 }: Props) {
  const [anchoContenedor, setAnchoContenedor] = useState(0);

  const paddingTop = 14;
  const paddingBottom = 22;
  const paddingHorizontal = 12;

  const altoUtil = Math.max(altura - paddingTop - paddingBottom, 40);
  const anchoUtil = Math.max(anchoContenedor - paddingHorizontal * 2, 40);

  const minVal = Math.min(...puntos);
  const maxVal = Math.max(...puntos);
  const rango = maxVal - minVal || 1;

  // Coordenadas de los 30 puntos
  const coordenadas = puntos.map((val, idx) => {
    const x = paddingHorizontal + (idx / Math.max(puntos.length - 1, 1)) * anchoUtil;
    const y = paddingTop + (1 - (val - minVal) / rango) * altoUtil;
    return { x, y, val, idx };
  });

  return (
    <View
      style={[styles.container, { height: altura }]}
      onLayout={(e) => {
        const w = Math.round(e.nativeEvent.layout.width);
        if (w > 0 && w !== anchoContenedor) {
          setAnchoContenedor(w);
        }
      }}
    >
      {/* Guías horizontales de fondo (máximo, medio, mínimo) */}
      <View style={[styles.gridLine, { top: paddingTop }]} />
      <View style={[styles.gridLine, { top: paddingTop + altoUtil / 2 }]} />
      <View style={[styles.gridLine, { top: paddingTop + altoUtil }]} />

      {/* Etiquetas de valores de referencia */}
      <View style={[styles.labelRow, { top: paddingTop - 9 }]}>
        <Text style={styles.gridLabel}>Máx: {formatearNumeroCO(maxVal, 1)}</Text>
      </View>
      <View style={[styles.labelRow, { top: paddingTop + altoUtil - 4 }]}>
        <Text style={styles.gridLabel}>Mín: {formatearNumeroCO(minVal, 1)}</Text>
      </View>

      {anchoContenedor > 0 && (
        <>
          {/* Columnas translúcidas de relleno estilo área */}
          {coordenadas.map((coord) => {
            const barHeight = paddingTop + altoUtil - coord.y;
            return (
              <View
                key={`bar-${coord.idx}`}
                style={[
                  styles.areaColumn,
                  {
                    left: coord.x - 2,
                    top: coord.y,
                    height: Math.max(barHeight, 0),
                  },
                ]}
              />
            );
          })}

          {/* Segmentos que unen los 30 puntos en orden */}
          {coordenadas.map((coord, idx) => {
            if (idx === coordenadas.length - 1) return null;
            const next = coordenadas[idx + 1];
            const dx = next.x - coord.x;
            const dy = next.y - coord.y;
            const longitud = Math.sqrt(dx * dx + dy * dy);
            const angulo = (Math.atan2(dy, dx) * 180) / Math.PI;
            const centroX = (coord.x + next.x) / 2;
            const centroY = (coord.y + next.y) / 2;

            return (
              <View
                key={`line-${idx}`}
                style={[
                  styles.segmentoLinea,
                  {
                    width: longitud,
                    left: centroX - longitud / 2,
                    top: centroY - 1.25,
                    transform: [{ rotate: `${angulo}deg` }],
                  },
                ]}
              />
            );
          })}

          {/* Punto de inicio */}
          <View
            style={[
              styles.puntoExtremo,
              { left: coordenadas[0].x - 4, top: coordenadas[0].y - 4 },
            ]}
          />

          {/* Punto actual de cierre (último punto) */}
          <View
            style={[
              styles.puntoCierreOuter,
              {
                left: coordenadas[coordenadas.length - 1].x - 6,
                top: coordenadas[coordenadas.length - 1].y - 6,
              },
            ]}
          >
            <View style={styles.puntoCierreInner} />
          </View>
        </>
      )}

      {/* Etiquetas temporales inferiores */}
      <View style={styles.timeAxis}>
        <Text style={styles.timeLabel}>Hace 30 días</Text>
        <Text style={styles.timeLabel}>Hace 15 días</Text>
        <Text style={styles.timeLabel}>Cierre (Hoy)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    position: "relative",
    overflow: "hidden",
    marginVertical: 4,
  },
  gridLine: {
    position: "absolute",
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: "#EDF2F7",
  },
  labelRow: {
    position: "absolute",
    right: 10,
    zIndex: 2,
  },
  gridLabel: {
    fontSize: 10,
    fontFamily: "Manrope_500Medium",
    color: "#94A3B8",
  },
  areaColumn: {
    position: "absolute",
    width: 4,
    backgroundColor: "rgba(38, 78, 122, 0.08)",
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  segmentoLinea: {
    position: "absolute",
    height: 2.5,
    backgroundColor: PALETA_MERCADO.azulAcero,
    borderRadius: 1,
    zIndex: 4,
  },
  puntoExtremo: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PALETA_MERCADO.azulAcero,
    zIndex: 5,
  },
  puntoCierreOuter: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(38, 78, 122, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 6,
  },
  puntoCierreInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PALETA_MERCADO.azulAcero,
  },
  timeAxis: {
    position: "absolute",
    bottom: 4,
    left: 12,
    right: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeLabel: {
    fontSize: 9,
    fontFamily: "Manrope_500Medium",
    color: "#94A3B8",
  },
});
