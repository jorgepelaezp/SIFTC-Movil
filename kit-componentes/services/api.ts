export const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
// const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export type LoginResult =
  | { ok: true; token: string }
  | { ok: false; error: "credenciales" | "sinConexion" };

export async function login(
  email: string,
  password: string,
): Promise<LoginResult> {
  try {
    const res = await fetch(`${BASE_URL}/api/Auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.status === 400 || res.status === 401) {
      return { ok: false, error: "credenciales" };
    }
    if (!res.ok) {
      return { ok: false, error: "sinConexion" }; // 5xx: el servidor no responde bien
    }

    const data = await res.json();
    return { ok: true, token: data.token }; // ajusta el nombre si es distinto
  } catch (e) {
    console.log("Error de red:", e, "URL:", BASE_URL);
    return { ok: false, error: "sinConexion" };
  }
}
