# HÁPTICA — Experiencia Batería Psicosocial (MVP)

Experiencia interactiva del viaje **Colombia → México → Chile → Colombia**, con 204
preguntas oficiales (contenido **congelado** en `src/data/experiencia.json`), llaves,
puertas, pasaporte, pausa de Juli y panel administrativo.

## Cómo correr en local

```bash
npm install
npm run dev        # abre http://localhost:5173
```

- **Sin configurar Firebase**, la app corre en **MODO DEMO** (persistencia en
  `localStorage` de tu navegador): permite recorrer y demostrar TODA la experiencia
  de principio a fin, incluido el panel `/juli`. Ideal para pruebas y demo.
- Al configurar las variables de entorno (abajo), pasa automáticamente a **Firebase real**.

Rutas:
- `/` — experiencia del colaborador.
- `/juli` — panel administrativo (requiere rol `juli` en producción).

## Conectar Firebase real (una sola vez, lo hace Juliana)

1. Crear proyecto en https://console.firebase.google.com
2. **Authentication** → habilitar proveedor **Google**.
3. **Firestore Database** → crear en modo producción.
4. Registrar una **app Web (</>)** y copiar su config.
5. Copiar `.env.example` a **`.env.local`** y pegar los valores:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
   (`.env.local` está en `.gitignore`; los valores del cliente no son secretos, la
   seguridad real vive en `firestore.rules`.)
6. Poner el `projectId` real en `.firebaserc`.
7. Instalar Firebase CLI y desplegar reglas + hosting:
   ```bash
   npm install -g firebase-tools
   firebase login
   npm run build
   firebase deploy --only firestore:rules,hosting
   ```
8. **Asignar el rol de Juli** (una sola vez): ver `scripts/asignar_rol_juli.js`
   (requiere `serviceAccountKey.json`). Después, Juliana cierra sesión y vuelve a entrar.

## Seguridad y privacidad

- Solo cuentas `@haptica.co` (sugerencia en el cliente + **obligatorio en `firestore.rules`**).
- Cada colaborador solo lee/escribe **sus** datos; el rol `juli` puede leer para el panel.
- **Puertas**: `firestore.rules` rechaza escribir respuestas de un bloque si falta la
  llave del bloque anterior — aunque se manipule el cliente. El mapa de puertas se
  **genera** desde el contenido: `npm run generate:rules`.

## Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` / `build` / `preview` | Vite |
| `npm run verify:steps` | Verifica que la máquina de estados da 242 pasos / 204 preguntas / 15 bloques |
| `npm run generate:rules` | Regenera `firestore.rules` (mapa de puertas) desde `experiencia.json` |
| `node scripts/asignar_rol_juli.js` | Asigna el custom claim `role:"juli"` (una sola vez) |

## Contenido congelado

`src/data/experiencia.json` es la **única fuente** de las 204 preguntas (texto, opciones,
orden). No se edita a mano ni se escribe una pregunta en un componente. Si el Excel
oficial cambia, se regenera con el script de exportación y se reemplaza el JSON.

## Pendientes de negocio (no bloquean el MVP)

1. **Texto oficial de Consentimiento**: no venía en `experiencia.json` (solo hay 4
   instrumentos; el Consentimiento es el 5º documento oficial). Está como placeholder
   marcado en `src/data/textos.js` → reemplazar por el texto oficial de Háptica antes
   de publicar. La lógica aceptar / no participar ya es la definitiva.
2. **Arte final** de las 15 escenas y personajes: hoy son placeholders (color de país +
   ícono + avatar naranja + personajes). Se reemplazan editando solo `src/data/placeholders.js`
   (campo `imagen`) y `public/assets/scenes/`, sin tocar lógica ni preguntas.
3. `export_experiencia_json.py` (regenerador del JSON desde el Excel) **no está** en la
   carpeta entregada; solo se necesita si cambia el contenido oficial, que está congelado.
