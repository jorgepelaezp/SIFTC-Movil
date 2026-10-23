import { useRef, useState } from "react";
import { GestureResponderEvent, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Path, Rect } from "react-native-svg";
import type { PuntoSerie } from "../models";
import { colors, radius, spacing } from "../theme";
import { fechaIso, num, pct } from "../utils/formato";

// Mismos colores de texto que Variacion: cumplen contraste sobre fondo claro.
const SUBE = "#187A45";
const BAJA = "#B83232";

// HU-MO-04 CA3: tiempo que hay que mantener el dedo para ver el detalle.
const PRESION_MS = 300;
// Si el dedo se mueve más que esto antes de tiempo, el usuario está desplazando.
const TOLERANCIA_PX = 10;

// Márgenes internos: a la derecha van los valores y abajo las fechas.
const M = { izq: 6, der: 44, arr: 12, aba: 24 };

export type TipoGrafica = "velas" | "linea";

type Props = {
  serie: PuntoSerie[];
  tipo: TipoGrafica;
  altura?: number;
  /** Avisa cuando empieza y termina la inspección, para bloquear el scroll. */
  onInspeccion?: (activa: boolean) => void;
};

/** "2026-10-07" -> "07/10" (las etiquetas cortas se leen mejor en 5 pulgadas) */
const diaMes = (fecha: string) => fechaIso(fecha).slice(0, 5);

export function GraficaEntidad({ serie, tipo, altura = 240, onInspeccion }: Props) {
  const [ancho, setAncho] = useState(0);
  const [elegido, setElegido] = useState<number | null>(null);
  const activa = useRef(false);
  const inicio = useRef({ x: 0, y: 0 });
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ----- escalas -----
  const anchoUtil = Math.max(ancho - M.izq - M.der, 1);
  const altoUtil = altura - M.arr - M.aba;
  const minimo = Math.min(...serie.map((p) => p.minimo));
  const maximo = Math.max(...serie.map((p) => p.maximo));
  const holgura = (maximo - minimo) * 0.08 || 1;
  const yMin = minimo - holgura;
  const yMax = maximo + holgura;
  const paso = anchoUtil / Math.max(serie.length, 1);
  const x = (i: number) => M.izq + paso * (i + 0.5);
  const y = (v: number) => M.arr + (1 - (v - yMin) / (yMax - yMin)) * altoUtil;
  const anchoVela = Math.max(2, Math.min(12, paso * 0.6));
  const indiceEn = (px: number) =>
    Math.min(serie.length - 1, Math.max(0, Math.floor((px - M.izq) / paso)));

  // Tres guías horizontales con su valor y tres fechas abajo
  const guias = [yMax - holgura, (yMin + yMax) / 2, yMin + holgura];
  const fechas = [0, Math.floor((serie.length - 1) / 2), serie.length - 1];

  // ----- gesto: presión prolongada (y arrastre para recorrer los puntos) -----
  const cancelarTemporizador = () => {
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = null;
  };

  const alTocar = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    inicio.current = { x: locationX, y: locationY };
    cancelarTemporizador();
    temporizador.current = setTimeout(() => {
      activa.current = true;
      setElegido(indiceEn(inicio.current.x));
      onInspeccion?.(true);
    }, PRESION_MS);
  };

  const alMover = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    if (activa.current) {
      setElegido(indiceEn(locationX));
    } else if (
      Math.abs(locationX - inicio.current.x) > TOLERANCIA_PX ||
      Math.abs(locationY - inicio.current.y) > TOLERANCIA_PX
    ) {
      cancelarTemporizador();
    }
  };

  const alSoltar = () => {
    // Un toque corto cierra el detalle; tras la presión prolongada se queda visible
    if (!activa.current && temporizador.current) setElegido(null);
    cancelarTemporizador();
    if (activa.current) {
      activa.current = false;
      onInspeccion?.(false);
    }
  };

  // ----- trazos -----
  const linea = serie
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.cierre).toFixed(1)}`)
    .join(" ");
  const area = `${linea} L${x(serie.length - 1).toFixed(1)},${M.arr + altoUtil} L${x(0).toFixed(1)},${M.arr + altoUtil} Z`;

  const punto = elegido !== null ? serie[elegido] : null;
  const anchoRecuadro = 158;
  const izqRecuadro =
    elegido === null
      ? 0
      : Math.min(Math.max(x(elegido) - anchoRecuadro / 2, 0), ancho - anchoRecuadro);

  return (
    <View
      style={{ height: altura }}
      onLayout={(e) => setAncho(Math.round(e.nativeEvent.layout.width))}>
      {ancho > 0 && serie.length > 0 && (
        <Svg width={ancho} height={altura}>
          {guias.map((v) => (
            <Line
              key={v}
              x1={M.izq}
              x2={ancho - M.der}
              y1={y(v)}
              y2={y(v)}
              stroke={colors.border}
              strokeWidth={1}
            />
          ))}

          {tipo === "linea" ? (
            <>
              <Path d={area} fill={colors.blueSoft} opacity={0.7} />
              <Path d={linea} stroke={colors.blue} strokeWidth={2} fill="none" />
            </>
          ) : (
            serie.map((p, i) => {
              const color = p.cierre >= p.apertura ? SUBE : BAJA;
              const arriba = y(Math.max(p.apertura, p.cierre));
              const cuerpo = Math.max(1, y(Math.min(p.apertura, p.cierre)) - arriba);
              return [
                <Line
                  key={`m${i}`}
                  x1={x(i)}
                  x2={x(i)}
                  y1={y(p.maximo)}
                  y2={y(p.minimo)}
                  stroke={color}
                  strokeWidth={1}
                />,
                <Rect
                  key={`c${i}`}
                  x={x(i) - anchoVela / 2}
                  y={arriba}
                  width={anchoVela}
                  height={cuerpo}
                  fill={color}
                />,
              ];
            })
          )}

          {punto && elegido !== null && (
            <>
              <Line
                x1={x(elegido)}
                x2={x(elegido)}
                y1={M.arr}
                y2={M.arr + altoUtil}
                stroke={colors.navy}
                strokeWidth={1}
                strokeDasharray="4 3"
              />
              <Circle
                cx={x(elegido)}
                cy={y(punto.cierre)}
                r={5}
                fill={colors.white}
                stroke={colors.navy}
                strokeWidth={2}
              />
            </>
          )}
        </Svg>
      )}

      {/* Etiquetas como Text para usar la misma fuente y tamaño que el resto */}
      {ancho > 0 &&
        guias.map((v) => (
          <Text key={`g${v}`} style={[styles.eje, styles.ejeY, { top: y(v) - 9 }]}>
            {num(v, 1)}
          </Text>
        ))}
      {ancho > 0 &&
        fechas.map((i, n) => (
          <Text
            key={`f${i}`}
            style={[
              styles.eje,
              styles.ejeX,
              n === 0 && { left: M.izq },
              n === 1 && { left: x(i) - 20, width: 40, textAlign: "center" },
              n === 2 && { right: M.der },
            ]}>
            {serie[i] ? diaMes(serie[i].fecha) : ""}
          </Text>
        ))}

      {/* Capa transparente que recibe los toques (sin hijos: locationX es fiable) */}
      <View
        style={StyleSheet.absoluteFill}
        accessible
        accessibilityLabel="Gráfica del periodo"
        accessibilityHint="Mantén presionado un punto para ver el detalle del día"
        onStartShouldSetResponder={() => true}
        onResponderGrant={alTocar}
        onResponderMove={alMover}
        onResponderRelease={alSoltar}
        onResponderTerminate={alSoltar}
        onResponderTerminationRequest={() => !activa.current}
      />

      {/* HU-MO-04 CA3: recuadro con el detalle del periodo */}
      {punto && (
        <View
          pointerEvents="none"
          style={[
            styles.recuadro,
            { left: izqRecuadro, width: anchoRecuadro },
            // Arriba o abajo según dónde esté el punto, para no taparlo
            y(punto.cierre) < M.arr + altoUtil / 2 ? { bottom: M.aba } : { top: 0 },
          ]}>
          <Text style={styles.recuadroFecha}>{fechaIso(punto.fecha)}</Text>
          {(
            [
              ["Apertura", punto.apertura],
              ["Máximo", punto.maximo],
              ["Mínimo", punto.minimo],
              ["Cierre", punto.cierre],
            ] as const
          ).map(([nombre, valor]) => (
            <View key={nombre} style={styles.recuadroFila}>
              <Text style={styles.recuadroNombre}>{nombre}</Text>
              <Text style={styles.recuadroValor}>{num(valor, 1)}</Text>
            </View>
          ))}
          {punto.variacionPct !== undefined && (
            <View style={styles.recuadroFila}>
              <Text style={styles.recuadroNombre}>Variación</Text>
              <Text
                style={[
                  styles.recuadroValor,
                  { color: punto.variacionPct >= 0 ? "#5FD08F" : "#FF8F8F" },
                ]}>
                {pct(punto.variacionPct)}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // HU-MO-04 CA2: etiquetas de 12 px como mínimo para leerse en 5 pulgadas
  eje: {
    position: "absolute",
    fontFamily: "Manrope_600SemiBold",
    fontSize: 12,
    color: colors.textLight,
    fontVariant: ["tabular-nums"],
  },
  ejeY: { right: 0, width: M.der - 4, textAlign: "right" },
  ejeX: { bottom: 2 },
  recuadro: {
    position: "absolute",
    backgroundColor: colors.navy,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  recuadroFecha: {
    fontFamily: "Manrope_700Bold",
    fontSize: 13,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  recuadroFila: { flexDirection: "row", justifyContent: "space-between" },
  recuadroNombre: {
    fontFamily: "Manrope_500Medium",
    fontSize: 13,
    color: "#CBD5E1",
  },
  recuadroValor: {
    fontFamily: "Manrope_700Bold",
    fontSize: 13,
    color: colors.white,
    fontVariant: ["tabular-nums"],
  },
});
