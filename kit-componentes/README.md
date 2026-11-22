# SIFTC Móvil

App Android del proyecto SIFTC para consultar el mercado con el mismo usuario y la misma API del portal web.

**Stack:** React Native · Expo SDK 58 · TypeScript · API en Render (`/api/v1`, JWT) · Firebase (notificaciones)

## Ejecutar

```bash
cd kit-componentes
npm ci
npx expo start -c              # Expo Go
npx expo start --dev-client    # Notificaciones (requiere development build)
```

En PowerShell, si `npm`/`npx` están bloqueados, usa `npm.cmd`/`npx.cmd`.

## Configuración

| Variable | Valor |
| --- | --- |
| `EXPO_PUBLIC_API_URL` | `https://siftc.onrender.com` |
| `EXPO_PUBLIC_API_PREFIX` | `/api/v1` |
| `EXPO_PUBLIC_USAR_MOCKS` | `true` datos de ejemplo · `false` API real (en `.env.local`) |

- `google-services.json` y `.env.local` **no se suben** al repositorio.
- Development build: `eas build --profile development --platform android` (Firebase se entrega como secreto `GOOGLE_SERVICES_JSON`).

## Estructura

`screens/` pantallas · `components/` interfaz · `hooks/` lógica de datos · `services/` API, caché SQLite y notificaciones · `theme/` colores

## Flujo de trabajo

Trabaja en tu rama, ejecuta `npx tsc --noEmit` antes de cada commit y entrega por Pull Request a `main`.

## Equipo Móvil

Isabella Manjarrés · Valentina Molina Castro · Daniel Bonilla · Cristian Parra · Jorge Peláez · Diego Pacheco
