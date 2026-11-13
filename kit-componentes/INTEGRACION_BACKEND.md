# Integración móvil SIFTC con el backend actual

La aplicación utiliza el contrato OpenAPI `v1.json` compartido por Backend. No consume rutas que aparecen únicamente en el documento de propuesta para Frontend.

Configuración en `.env`:

```env
EXPO_PUBLIC_API_URL=https://siftc.onrender.com
EXPO_PUBLIC_API_PREFIX=/api/v1
EXPO_PUBLIC_USAR_MOCKS=false
```

## Endpoints del JSON utilizados por la aplicación

- `POST /api/v1/auth/login`: autentica con `{ "usuario", "password" }` y devuelve el JWT.
- `GET /api/v1/entidades`: alimenta el tablero, el ticker y el selector. Se respeta `page`, `size`, `sort`, `dir` y la cabecera `X-Total-Count`.
- `GET /api/v1/entidades/{id}/ohlc`: alimenta la gráfica. Se envían los periodos permitidos `Diaria`, `Mensual` o `Trimestral` y se lee `respuesta.serie`.
- `GET /api/v1/metricas`: alimenta los puntajes por dimensión del ranking móvil. Se utilizan las dimensiones `Rentabilidad`, `Liquidez`, `Solvencia` y `Crecimiento`, y los periodos `diario`, `mensual` o `trimestral`.
- `GET /api/v1/watchlist`: consulta las entidades seguidas por el usuario autenticado.
- `POST /api/v1/watchlist/{idEntidad}` y `DELETE /api/v1/watchlist/{idEntidad}`: agregan o quitan entidades de la lista personal.

Todas las rutas protegidas envían `Authorization: Bearer <token>`.

## Rutas de la guía DOCX que no se llaman

El documento `GUIA PARA BACKEND` describe endpoints propuestos para el portal, pero los siguientes no aparecen en el `v1.json` actual y por tanto no se invocan: `/mercado/top`, `/indice-general`, `/sectores`, `/dimensiones` y `/periodos`.

## Decisiones de interfaz según el contrato actual

- El tablero obtiene todas las cotizaciones desde `/entidades`. Los cinco mayores ganadores y perdedores se ordenan localmente por `variacionPct`, sin solicitar `/mercado/top`.
- No se presenta un valor inventado como índice general: el resumen del tablero muestra el total de entidades disponibles.
- Aunque `/api/v1/ranking` sí existe en el JSON, el contrato indica expresamente que el rol `Usuario móvil` no tiene permiso para utilizarlo. Por eso, la pantalla móvil utiliza `/entidades` y `/metricas`, ambos autorizados para ese rol. Los valores dimensionales se calculan como el promedio de `valorNormalizado` del corte más reciente disponible para cada dimensión y entidad, expresado en escala porcentual.
- Los sectores del filtro se obtienen de las entidades descargadas; dimensiones y periodos usan los valores permitidos por el contrato de `/metricas`, sin depender de catálogos que aún no existen.
- La posición de la ficha se estima ordenando los IC recibidos desde `/entidades`; no se afirma que provenga de un endpoint de ranking.

## Ejecución

Desde `kit-componentes`:

```bash
npm install
npx expo start
```

Se requieren credenciales válidas de un usuario creado en Backend y conexión a internet. El rol `Usuario móvil` puede consultar entidades, métricas, OHLC y su propia watchlist; las operaciones de agregar y quitar watchlist están documentadas para ese rol.
