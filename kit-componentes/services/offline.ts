
import * as SQLite from "expo-sqlite";
import { obtenerTokenActual } from "./sesion";

const DB_NAME = "siftc-offline.db";
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function scopeUsuario(): string {
  const token = obtenerTokenActual();
  if (!token) return "sin-sesion";

  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload.padEnd(
      payload.length + ((4 - (payload.length % 4)) % 4),
      "="
    );
    const claims = JSON.parse(atob(padded));
    const id =
      claims.sub ??
      claims.userId ??
      claims.user_id ??
      claims.uid ??
      claims.nameid;

    if (id) return String(id);
  } catch {
    // Si el JWT no expone un identificador legible, se usa una huella local.
  }

  let hash = 2166136261;
  for (let i = 0; i < token.length; i++) {
    hash = Math.imul(hash ^ token.charCodeAt(i), 16777619);
  }

  return `token-${(hash >>> 0).toString(16)}`;
}

async function database(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME)
      .then(async (db) => {
        await db.execAsync(`
          PRAGMA journal_mode = WAL;

          CREATE TABLE IF NOT EXISTS api_cache (
            user_key TEXT NOT NULL,
            cache_key TEXT NOT NULL,
            data TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            PRIMARY KEY (user_key, cache_key)
          );

          CREATE TABLE IF NOT EXISTS pending_mutations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_key TEXT NOT NULL,
            method TEXT NOT NULL,
            path TEXT NOT NULL,
            created_at TEXT NOT NULL
          );

          CREATE INDEX IF NOT EXISTS idx_pending_user
          ON pending_mutations(user_key, id);
        `);

        return db;
      })
      .catch((error) => {
        dbPromise = null;
        throw error;
      });
  }

  return dbPromise;
}

export type CacheLeido<T> = {
  data: T;
  updatedAt: string;
};

export async function leerCache<T>(
  key: string
): Promise<CacheLeido<T> | null> {
  const db = await database();

  const row = await db.getFirstAsync<{
    data: string;
    updated_at: string;
  }>(
    `SELECT data, updated_at
     FROM api_cache
     WHERE user_key = ? AND cache_key = ?`,
    scopeUsuario(),
    key
  );

  if (!row) return null;

  try {
    return {
      data: JSON.parse(row.data) as T,
      updatedAt: row.updated_at,
    };
  } catch {
    return null;
  }
}

export async function guardarCache<T>(
  key: string,
  data: T
): Promise<void> {
  const db = await database();

  await db.runAsync(
    `INSERT INTO api_cache
      (user_key, cache_key, data, updated_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(user_key, cache_key)
     DO UPDATE SET
       data = excluded.data,
       updated_at = excluded.updated_at`,
    scopeUsuario(),
    key,
    JSON.stringify(data),
    new Date().toISOString()
  );
}

export async function encolarMutacion(
  method: "POST" | "DELETE",
  path: string
): Promise<void> {
  const db = await database();

  await db.runAsync(
    `INSERT INTO pending_mutations
      (user_key, method, path, created_at)
     VALUES (?, ?, ?, ?)`,
    scopeUsuario(),
    method,
    path,
    new Date().toISOString()
  );
}

export type MutacionPendiente = {
  id: number;
  method: "POST" | "DELETE";
  path: string;
};

export async function obtenerMutacionesPendientes():
Promise<MutacionPendiente[]> {
  const db = await database();

  return db.getAllAsync<MutacionPendiente>(
    `SELECT id, method, path
     FROM pending_mutations
     WHERE user_key = ?
     ORDER BY id ASC`,
    scopeUsuario()
  );
}

export async function eliminarMutacionPendiente(
  id: number
): Promise<void> {
  const db = await database();

  await db.runAsync(
    `DELETE FROM pending_mutations
     WHERE id = ? AND user_key = ?`,
    id,
    scopeUsuario()
  );
}

export async function cantidadMutacionesPendientes():
Promise<number> {
  const db = await database();

  const row = await db.getFirstAsync<{ total: number }>(
    `SELECT COUNT(*) AS total
     FROM pending_mutations
     WHERE user_key = ?`,
    scopeUsuario()
  );

  return row?.total ?? 0;
}

export async function ultimaActualizacionCache():
Promise<string | null> {
  const db = await database();

  const row = await db.getFirstAsync<{
    updated_at: string | null;
  }>(
    `SELECT MAX(updated_at) AS updated_at
     FROM api_cache
     WHERE user_key = ?`,
    scopeUsuario()
  );

  return row?.updated_at ?? null;
}

export async function actualizarCacheWatchlist(
  cacheKey: string,
  accion: "agregar" | "quitar",
  id: string,
  entidad?: unknown
): Promise<void> {
  const anterior = await leerCache<any[]>(cacheKey);
  const lista = anterior?.data ?? [];

  const filtrada = lista.filter(
    (item) => String(item?.id) !== id
  );

  const entidadApi =
    entidad &&
    typeof entidad === "object" &&
    "indice" in entidad
      ? {
          id: (entidad as any).id,
          codigo: (entidad as any).codigo,
          nombre: (entidad as any).nombre,
          sector: (entidad as any).sector,
          ic: (entidad as any).indice,
          variacionPct: (entidad as any).variacionPct,
        }
      : entidad;

  const nueva =
    accion === "agregar" && entidadApi
      ? [...filtrada, entidadApi]
      : filtrada;

  await guardarCache(cacheKey, nueva);
}
