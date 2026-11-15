// Colores de la app en modo claro y oscuro.
// "claro" es igual al theme actual, así que nada cambia en modo claro.
// "oscuro" es provisional: lo ajustamos cuando tengamos los colores de la web.

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
};

export type ModoTema = "claro" | "oscuro";

export const paletas: Record<ModoTema, Paleta> = { claro, oscuro };