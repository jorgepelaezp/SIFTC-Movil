/** Exportación oficial CSV (endpoint público para el rol Usuario móvil con JWT). */
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { peticionAutenticada } from "./api";
import type { Periodo } from "../models";

const PREFIJO = process.env.EXPO_PUBLIC_API_PREFIX ?? "/api/v1";
const periodoApi = (periodo: Periodo) => periodo === "1S" ? "Diaria" : periodo === "1M" ? "Mensual" : "Trimestral";

/** Descarga el CSV real y abre la opción de compartir/guardar del teléfono. */
export async function exportarSerieCsv(idEntidad: string | number, periodo: Periodo): Promise<void> {
  const disponible = await Sharing.isAvailableAsync();
  if (!disponible) throw new Error("Este dispositivo no permite compartir archivos CSV.");
  const params = `tipo=serie&formato=csv&idEntidad=${encodeURIComponent(String(idEntidad))}&periodo=${encodeURIComponent(periodoApi(periodo))}`;
  const respuesta = await peticionAutenticada(`${PREFIJO}/exportar?${params}`, {
    headers: { Accept: "text/csv" },
  });
  if (!respuesta.ok) {
    if (respuesta.status === 403) throw new Error("Tu cuenta no tiene permiso para exportar esta serie.");
    if (respuesta.status === 404) throw new Error("No se encontró la serie solicitada.");
    throw new Error(`No se pudo exportar el CSV (HTTP ${respuesta.status}).`);
  }
  const csv = await respuesta.text();
  if (!csv.trim()) throw new Error("El servidor entregó un CSV vacío.");
  const nombre = `serie_${String(idEntidad).replace(/[^a-zA-Z0-9_-]/g, "_")}_${periodoApi(periodo)}.csv`;
  const archivo = new File(Paths.cache, nombre);
  if (archivo.exists) archivo.delete();
  archivo.create();
  await archivo.write(csv);
  await Sharing.shareAsync(archivo.uri, { mimeType: "text/csv", dialogTitle: "Guardar o compartir CSV", UTI: "public.comma-separated-values-text" });
}
