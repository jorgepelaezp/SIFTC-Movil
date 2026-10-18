// Formato para pantalla según el diccionario de datos del proyecto:
// coma decimal, miles con punto y fechas dd/mm/aaaa.
// Los datos (API y mocks) siguen con punto decimal.
// Se implementa a mano (sin toLocaleString) para que el resultado sea idéntico
// en Android, iOS y las pruebas, sin depender de Intl.

export function num(valor: number, decimales = 1): string {
  const n = Number(valor);
  if (!Number.isFinite(n)) return "–";
  const fijo = n.toFixed(decimales);
  const negativo = n < 0 && Number(fijo) !== 0; // evita "-0,00"
  const [entera, decimal] = fijo.replace("-", "").split(".");
  const miles = entera.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const texto = decimal ? `${miles},${decimal}` : miles;
  return negativo ? `-${texto}` : texto;
}

/** Porcentaje con signo: +2,11 %  /  -1,29 %  /  0,00 % */
export function pct(valor: number, decimales = 2): string {
  const signo = valor > 0 ? "+" : "";
  return `${signo}${num(valor, decimales)} %`;
}

/** "2026-10-07" -> "07/10/2026" */
export function fechaIso(texto?: string | null): string {
  return texto ? texto.split("-").reverse().join("/") : "";
}

export type Direccion = "sube" | "baja" | "igual";

/** La API no manda dirección: se deduce del signo de la variación. */
export function direccion(valor: number): Direccion {
  return valor > 0 ? "sube" : valor < 0 ? "baja" : "igual";
}
