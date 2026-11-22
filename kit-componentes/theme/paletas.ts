// Colores de la app en modo claro y oscuro.
// "claro" es igual al theme actual, así que nada cambia en modo claro.
// "oscuro": alineado al modo oscuro del portal web. Ningún componente debe usar hex fijos;
// todo color sale de aquí vía useTema().colores.

const claro = {
  primary: "#10B981",
  accent: "#34D399",
  navy: "#0D253A",
  blue: "#1D68CD",
  blueSoft: "#E0EDFF",
  background: "#F4F6F9",
  surface: "#FFFFFF",
  chip: "#EAEFF5",
  text: "#0D253A",
  textLight: "#64748B",
  border: "#E2E8F0",
  white: "#FFFFFF",
  gain: "#10B981",
  gainBg: "#E6F8F0",
  loss: "#EF4444",
  lossBg: "#FEE2E2",
  error: "#BA1A1A",
  errorBg: "#FFDAD6",
  warning: "#92400E",
  warningBg: "#FEF3C7",
  // --- Tokens semánticos (modo oscuro) ---
  gainText: "#187A45",       // verde de texto con contraste AA sobre surface
  lossText: "#B83232",       // rojo de texto con contraste AA sobre surface
  textStrong: "#0D253A",     // títulos de pantalla
  inputBg: "#FFFFFF",        // fondo de campos de texto
  chipActiveBg: "#0D253A",   // chip/segmento seleccionado
  chipActiveText: "#FFFFFF",
  avatarBg: "#0D253A",       // avatar como en el portal web (azul marino)
  avatarIcon: "#FFFFFF",
  divider: "#F1F5F9",        // líneas internas de tarjeta
};

export type Paleta = typeof claro;

const oscuro: Paleta = {
  primary: "#10B981",
  accent: "#34D399",
  navy: "#0D253A",
  blue: "#5B9BF0",
  blueSoft: "#16304F",
  background: "#0A1A2A",
  surface: "#12263A",
  chip: "#1B3149",
  text: "#E6EDF5",
  textLight: "#94A3B8",
  border: "#24384F",
  white: "#FFFFFF",
  gain: "#34D399",
  gainBg: "#0F3B2E",
  loss: "#F87171",
  lossBg: "#3B1D20",
  error: "#FFB4AB",
  errorBg: "#5C1A16",
  warning: "#FCD34D",
  warningBg: "#3D2E0A",
  gainText: "#4ADE80",
  lossText: "#F87171",
  textStrong: "#F1F5F9",
  inputBg: "#0F2236",
  chipActiveBg: "#E6EDF5",
  chipActiveText: "#0A1A2A",
  avatarBg: "#5B9BF0",       // azul claro, se distingue del fondo oscuro
  avatarIcon: "#0A1A2A",
  divider: "#1B3149",
};

export type ModoTema = "claro" | "oscuro";

export const paletas: Record<ModoTema, Paleta> = { claro, oscuro };