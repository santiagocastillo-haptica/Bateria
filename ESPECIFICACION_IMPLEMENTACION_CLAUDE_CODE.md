# ESPECIFICACIÓN DE IMPLEMENTACIÓN — CLAUDE CODE
## Experiencia Interactiva HÁPTICA — Batería de Riesgo Psicosocial
**Estructura narrativa: CONGELADA.** 204 preguntas, 15 bloques, 4 países narrativos. No se modifica contenido de instrumentos.

Este documento **reemplaza** dos puntos del diseño UX anterior (`MVP_UX_Experiencia_Haptica.md`):
1. La autenticación queda **cerrada**: Google Sign-In restringido a `@haptica.co` (ya no es un supuesto a confirmar).
2. **Se elimina** el botón "Necesito salir" / retiro voluntario. Se reemplaza por **"Necesito ayuda / Reportar problema técnico"**, que solo sirve para reportar fallas técnicas, nunca para abandonar el recorrido por decisión propia.

**Las 5 decisiones que quedaban abiertas ya fueron confirmadas por HÁPTICA** (ver el recuadro al final del documento, en "LISTO PARA CLAUDE CODE"). No queda ninguna decisión pendiente para iniciar la construcción.

Todo lo demás del diseño UX previo (mapa de pantallas, flujo, llaves/puertas, componentes) sigue vigente y no se repite aquí salvo donde cambia.

---

## A. STACK TECNOLÓGICO DEFINITIVO

| Capa | Elección | Por qué |
|---|---|---|
| Frontend | **React + Vite**, CSS plano (sin librería de UI) | Rápido de scaffolding, Claude Code lo maneja bien, no necesita build complejo |
| Autenticación | **Firebase Authentication** — Google Sign-In | Decisión cerrada: Háptica usa Google Workspace |
| Base de datos | **Firestore** | Lecturas/escrituras simples, reglas de seguridad declarativas |
| Hosting | **Firebase Hosting** | Deploy de un comando |
| Backend adicional | **Ninguno** (sin Cloud Functions en el MVP) | Prioridad es tenerlo funcional mañana |
| Contenido (204 preguntas) | **Archivo estático `experiencia.json`**, generado por script desde la Matriz Maestra | Única fuente de verdad; cero texto escrito a mano en el código |
| Ilustraciones | **Placeholders visuales de color + formas simples** para las 15 escenas (decisión cerrada — ver Sección O). Arte final llega en una fase 2, sin tocar lógica ni preguntas | Prioridad: que el recorrido funcione y las escenas/países se identifiquen, no el arte final |

---

## B. ESTRUCTURA DE CARPETAS

```
haptica-viaje/
├── public/
│   └── assets/
│       └── scenes/           # 1 imagen de fondo por escena (15) + 2-3 iconos (llave, sello, avión)
├── src/
│   ├── data/
│   │   ├── experiencia.json          # generado, NO editar a mano
│   │   └── placeholders.js           # mapa bloque → {color, icono, label} — único punto a editar en Fase 2
│   ├── components/
│   │   ├── LoginScreen.jsx
│   │   ├── ConsentScreen.jsx
│   │   ├── BlockIntroScreen.jsx
│   │   ├── QuestionScreen.jsx
│   │   ├── KeyEarnedScreen.jsx
│   │   ├── TransitionScreen.jsx
│   │   ├── JuliPauseScreen.jsx
│   │   ├── ClosingScreen.jsx
│   │   ├── PassportPanel.jsx
│   │   ├── HelpReportModal.jsx
│   │   ├── ProgressIndicator.jsx
│   │   └── ErrorScreen.jsx
│   ├── state/
│   │   ├── buildJourneySteps.js      # genera los ~242 pasos a partir de experiencia.json
│   │   ├── useJourneyState.js        # hook: paso actual, avanzar, resumir
│   │   └── firestore.js              # lectura/escritura de usuarios/{uid}/...
│   ├── admin/
│   │   ├── JuliLogin.jsx
│   │   └── JuliDashboard.jsx
│   ├── App.jsx
│   └── main.jsx
├── scripts/
│   ├── export_experiencia_json.py    # regenera experiencia.json desde el Excel si el contenido cambia
│   └── asignar_rol_juli.js           # correr UNA sola vez para dar el rol "juli" a juliana.lopez@haptica.co
├── firebase.json
├── firestore.rules
├── .firebaserc
└── package.json
```

---

## C. MODELO DE DATOS FIRESTORE

```
usuarios/{uid}
  correo: string
  tipo_vinculacion: "directo" | "contratista"   (capturado en el primer ingreso)
  fecha_creacion: timestamp
  consentimiento: {
      estado: "no_iniciado" | "aceptado" | "rechazado",
      fecha: timestamp
  }
  progreso: {
      paso_actual: number,           // índice dentro de la lista generada por buildJourneySteps
      bloque_actual: string,         // ej. "Bloque 3 - Mercado (MX-01)"
      llaves_obtenidas: string[],    // ej. ["LLAVE-CO-01", "LLAVE-CO-02", ...]
      estado: "activo" | "completado",
      bloqueado_tecnico: boolean,
      fecha_fin: timestamp | null
  }

usuarios/{uid}/respuestas/{id_interno}      // id_interno = "P001" ... "P204"
  numero_oficial: number
  instrumento: string
  opcion_seleccionada: string          // texto EXACTO de la opción oficial elegida
  fecha_hora: timestamp

usuarios/{uid}/pausa_juli/{autoId}
  comentario: string | null            // opcional, nunca vacío obligatorio
  fecha: timestamp
  // separado por completo de /respuestas — nunca se lee junto con la batería

usuarios/{uid}/soporte/{autoId}
  mensaje: string | null               // opcional
  paso_actual: number                  // dónde se quedó al reportar
  fecha: timestamp
  estado: "abierto" | "resuelto"
```

**Regla de identidad de documentos:** el ID del documento de cada respuesta es el `id_interno` oficial (`P001`…`P204`), nunca un ID autogenerado. Esto hace que reintentar guardar la misma pregunta **sobrescriba**, nunca duplique.

---

## D. ESTRUCTURA DEL ARCHIVO DE CONTENIDO (`experiencia.json`)

Ya generado y adjunto a esta conversación. Esquema:

```json
{
  "version": "1.0",
  "generado_desde": "Matriz_Maestra_204_Preguntas_Haptica.xlsx",
  "estructura_narrativa": "CONGELADA",
  "total_preguntas": 204,
  "total_bloques": 15,
  "bloques": [
    {
      "bloque": "Bloque 1 - Maleta de viaje (CO-1)",
      "pais": "Colombia",
      "etapa": "Colombia - Inicio",
      "escena": "Preparando el equipaje en la oficina de Bogotá",
      "misterio": "Encontrar y colocar en la maleta ilustrada los objetos correctos...",
      "llave": "LLAVE-CO-01",
      "puerta": "Puerta de Embarque Personal",
      "rango_oficial": "Ficha de Datos Generales 1–10",
      "cantidad_items": 10,
      "preguntas": ["P001", "P002", ..., "P010"]
    }
    // ... 15 bloques en total
  ],
  "preguntas": [
    {
      "id": "P001",
      "numero_oficial": 1,
      "instrumento": "Ficha de Datos Generales",
      "texto_exacto": "Nombre completo:",
      "tipo_de_respuesta": "Texto abierto",
      "opciones_exactas": null,
      "opciones_exactas_raw": "(Texto libre)",
      "bloque_experiencia": "Bloque 1 - Maleta de viaje (CO-1)",
      "llave_asociada": "LLAVE-CO-01",
      "estado_validacion": "EXTRAÍDA",
      "escena": "Preparando el equipaje en la oficina de Bogotá",
      "momento": "Antes de salir de viaje, el colaborador organiza sus datos personales...",
      "orden_narrativo": 1
    }
    // ... 204 preguntas en total, ya en el orden exacto de la app (orden_narrativo 1..204)
  ],
  "transiciones": [
    { "transicion": "Colombia → México", "momento": "..." },
    { "transicion": "México → Chile", "momento": "..." },
    { "transicion": "Chile → Colombia (regreso)", "momento": "..." }
  ]
}
```

- `opciones_exactas`: array de las opciones oficiales, ya separadas, lista para renderizar botones — `null` cuando la pregunta es de texto/numérico abierto (usar `tipo_de_respuesta` para decidir el tipo de input).
- `opciones_exactas_raw`: el string íntegro tal como está en la Matriz Maestra, de respaldo/auditoría.
- El array `preguntas` **ya viene ordenado** por `orden_narrativo` (1 a 204) — iterar el array en orden es recorrer la app en el orden correcto, sin necesidad de reordenar nada en el frontend.

---

## E. CÓMO SE GENERA `experiencia.json` (ya hecho — cómo regenerarlo si algo cambia)

Script incluido: `scripts/export_experiencia_json.py`.

```bash
python3 export_experiencia_json.py
```

Lee `Matriz_Maestra_204_Preguntas_Haptica.xlsx` (hojas "Matriz Maestra", "Mapeo Narrativo Detallado", "Escenas, Misterios y Llaves", "Transiciones") y escribe `experiencia.json`. Antes de escribir, el script valida automáticamente:
- Exactamente 204 preguntas.
- 204 IDs únicos.
- `orden_narrativo` es la secuencia continua 1..204.
- La suma de ítems por bloque da 204.

**Regla para Claude Code: si el Excel cambia, se vuelve a correr este script y se reemplaza `experiencia.json`. Nunca se edita `experiencia.json` a mano, y nunca se escribe una pregunta directamente en un componente.**

---

## F. MÁQUINA DE ESTADOS / NAVEGACIÓN

**No se codifica una lista de 242 pasos a mano.** Se genera en tiempo de ejecución desde `experiencia.json`, en `buildJourneySteps.js`:

```
pasos = []
pasos.push({tipo: "login"})
pasos.push({tipo: "bienvenida"})
pasos.push({tipo: "consentimiento"})

para cada bloque en experiencia.bloques (en orden):
    pasos.push({tipo: "intro_bloque", bloque})
    para cada id_pregunta en bloque.preguntas:
        pasos.push({tipo: "pregunta", id: id_pregunta})
    pasos.push({tipo: "llave", bloque})
    si bloque es el último de su país (Bloque 2, 6, 10, o 15):
        si bloque == Bloque 10 (fin de Chile):
            pasos.push({tipo: "transicion", nombre: "Chile → Colombia (regreso)"})
            pasos.push({tipo: "pausa_juli"})
        si no, si bloque == Bloque 15 (fin de todo):
            pasos.push({tipo: "cierre"})
        si no (Bloque 2 o 6):
            pasos.push({tipo: "transicion", nombre: correspondiente})

retornar pasos
```

Esto genera automáticamente la secuencia completa (login + bienvenida + consentimiento + 15×(intro+preguntas+llave) + 3 transiciones + pausa + cierre = 242 pasos), **derivada del contenido, nunca hardcodeada**.

**Resume:** al iniciar sesión, `useJourneyState` lee `usuarios/{uid}.progreso.paso_actual` de Firestore y salta directo a ese índice del array de pasos generado. Nunca se reinicia desde el paso 0 si ya hay progreso.

---

## G. COMPONENTES REUTILIZABLES

Igual que el diseño UX previo, con un cambio:

| Componente | Cambio respecto al diseño anterior |
|---|---|
| `LoginScreen` | Un solo botón "Ingresar con tu correo de Háptica" → `signInWithPopup` + `GoogleAuthProvider` con `hd: "haptica.co"` |
| `ConsentScreen` | Sin cambios |
| `BlockIntroScreen` | Sin cambios |
| `QuestionScreen` | Sin cambios (sin botón "Atrás" en el MVP) |
| `KeyEarnedScreen` | Sin cambios |
| `TransitionScreen` | Sin cambios |
| `JuliPauseScreen` | Sin cambios — comentario opcional, guardado en `pausa_juli`, nunca junto a `respuestas` |
| `ClosingScreen` | Sin cambios |
| `PassportPanel` | Sin cambios |
| ~~`ExitFlowModal`~~ | **Eliminado.** Ya no existe retiro voluntario |
| **`HelpReportModal`** (nuevo) | Reemplaza al anterior. Botón fijo "Necesito ayuda". Al abrir, muestra el **texto definitivo aprobado**:<br>*"¿Tienes un problema técnico para continuar?*<br>*Si tu conexión, dispositivo, navegador o la experiencia presenta algún inconveniente que te impida continuar, solicita ayuda a Juli.*<br>*Juli podrá ayudarte a recuperar el acceso y continuar desde el punto en el que quedaste, sin perder las respuestas que ya registraste."*<br>Debajo, un campo de texto opcional ("Cuéntanos qué pasó — opcional") + botón "Enviar reporte". Escribe en `usuarios/{uid}/soporte`. **No cierra sesión ni interrumpe el progreso guardado** — el colaborador puede seguir intentando continuar mientras espera ayuda. Este mecanismo **no es una opción para abandonar la experiencia**, y el texto no debe alterarse ni parafrasearse al implementarlo |
| `ProgressIndicator` | Sin cambios |
| `ErrorScreen` | Sin cambios, pero ahora enlaza directamente a `HelpReportModal` en vez de a un flujo de salida |

---

## H. AUTENTICACIÓN

```js
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ hd: "haptica.co" }); // sugiere solo cuentas del dominio en el picker

async function login() {
  const result = await signInWithPopup(auth, provider);
  const email = result.user.email || "";
  if (!email.endsWith("@haptica.co")) {
    await signOut(auth);
    throw new Error("Solo se permiten cuentas @haptica.co");
  }
  // continuar: crear/leer usuarios/{uid}
}
```

**Importante:** `hd` es solo una sugerencia de UI — **no es seguridad real**, porque una cuenta de otro dominio podría en teoría autenticarse igual. La restricción real y obligatoria va en las **reglas de Firestore** (sección I): ninguna lectura/escritura se permite si `request.auth.token.email` no termina en `@haptica.co`, sin importar qué haya pasado en el cliente.

- No hay contraseña propia.
- No hay enlace mágico.
- Ninguna cuenta externa puede leer o escribir nada, aunque logre iniciar sesión.

---

## I. REGLAS DE SEGURIDAD FIRESTORE

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function esDeHaptica() {
      return request.auth != null
        && request.auth.token.email.matches('.*@haptica[.]co$');
    }

    function esElMismoUsuario(uid) {
      return request.auth.uid == uid;
    }

    function esJuli() {
      return request.auth != null && request.auth.token.role == "juli";
      // el custom claim "role: juli" se asigna una sola vez, manualmente, con el Admin SDK,
      // a la cuenta juliana.lopez@haptica.co (confirmada como responsable de administrar
      // Firebase y el panel administrativo del proyecto)
    }

    match /usuarios/{uid} {
      allow read, write: if esDeHaptica() && esElMismoUsuario(uid);
      allow read: if esJuli();   // Juli puede leer (no escribir) el documento de cualquier usuario
      allow update: if esJuli(); // Juli puede actualizar (ej. bloqueado_tecnico, soporte.estado)

      match /respuestas/{idInterno} {
        allow read, write: if esDeHaptica() && esElMismoUsuario(uid)
          && puertaAbierta(uid, idInterno);
        allow read: if esJuli();
      }

      match /pausa_juli/{docId} {
        allow read, write: if esDeHaptica() && esElMismoUsuario(uid);
        allow read: if esJuli();
      }

      match /soporte/{docId} {
        allow create: if esDeHaptica() && esElMismoUsuario(uid);
        allow read: if esDeHaptica() && esElMismoUsuario(uid);
        allow read, update: if esJuli();
      }
    }
  }
}
```

`puertaAbierta(uid, idInterno)` (función de apoyo, sección K): verifica en el documento `usuarios/{uid}.progreso.llaves_obtenidas` que la llave del bloque **anterior** al que pertenece `idInterno` ya exista, antes de aceptar la escritura. Esto se resuelve con una función de Firestore Rules que consulta `get(/databases/$(database)/documents/usuarios/$(uid)).data.progreso.llaves_obtenidas` y la compara contra un mapa fijo (bloque anterior de cada pregunta), que se puede generar automáticamente desde `experiencia.json` al momento de escribir las reglas (no a mano).

**Script único de asignación del rol (correr una sola vez, con el Admin SDK de Node.js):**

```js
// scripts/asignar_rol_juli.js — ejecutar una sola vez, manualmente
const admin = require("firebase-admin");
admin.initializeApp();

async function asignarRolJuli() {
  const user = await admin.auth().getUserByEmail("juliana.lopez@haptica.co");
  await admin.auth().setCustomUserClaims(user.uid, { role: "juli" });
  console.log("Rol 'juli' asignado a juliana.lopez@haptica.co");
}

asignarRolJuli();
```

Juliana debe cerrar sesión y volver a iniciar sesión después de correr este script para que el nuevo claim se refleje en su token.

---

## J. PERSISTENCIA Y RECUPERACIÓN

- Cada respuesta se escribe a Firestore **inmediatamente** al presionar "Continuar" (no se espera a terminar el bloque).
- Mientras se confirma la escritura, la respuesta se guarda también en un buffer local (memoria/localStorage) para reintentar si falla la conexión.
- Al recargar la página o volver a entrar: la app lee `usuarios/{uid}.progreso.paso_actual` de Firestore (fuente de verdad) y renderiza ese paso exacto — nunca el paso 0.
- Firestore mantiene caché offline por defecto (SDK de Firebase); si la conexión se cae momentáneamente, las escrituras quedan en cola local y se sincronizan solas al reconectar.

---

## K. LLAVES Y PUERTAS

- **Llave:** se agrega a `progreso.llaves_obtenidas` únicamente cuando **todas** las preguntas del bloque tienen documento en `respuestas` (verificación por existencia del documento, nunca por su contenido).
- **Puerta (doble verificación):**
  - **Cliente:** `buildJourneySteps` + `useJourneyState` no renderizan el siguiente bloque si su llave previa no está en `progreso.llaves_obtenidas`.
  - **Servidor:** las reglas de Firestore (sección I) rechazan cualquier escritura a `respuestas/{idInterno}` de un bloque N+1 si la llave del bloque N no existe — así, aunque alguien manipule el cliente desde la consola del navegador, el servidor sigue exigiendo el orden.
- La llave **nunca** depende de qué opción fue elegida.

---

## L. PANEL MÍNIMO DE JULI

Ruta separada (`/juli`), requiere login con cuenta marcada con el custom claim `role: "juli"`.

**Vista principal — tabla:**

| Colaborador | Tipo vinculación | Bloque actual | Estado | Última actividad | Acciones |
|---|---|---|---|---|---|
| nombre/correo | directo/contratista | "Bloque 5 - Parque" | activo / bloqueado técnico / completado | fecha | [Ver detalle] [Marcar resuelto] |

- **[Marcar resuelto]:** limpia `progreso.bloqueado_tecnico` y marca el ticket de `soporte` correspondiente como `resuelto`.
- **[Exportar]:** botón que lee Firestore (con permiso de Juli) y genera un archivo descargable con la estructura de los 5 documentos oficiales auditados (Consentimiento, Ficha, Estrés, Extralaboral, Intralaboral), para entrega al psicólogo especialista en SST.
- Juli **no ve** las respuestas individuales en esta tabla principal — solo estado y progreso. El detalle de respuestas solo aparece al exportar, en el formato oficial, no como una vista de "espionaje" en pantalla (mantiene el espíritu de la Sección 28 del panel de administración: información organizada, no una base de datos desordenada expuesta).

---

## M. MANEJO DE ERRORES TÉCNICOS

| Situación | Qué pasa |
|---|---|
| Falla de red al guardar una respuesta | Reintento automático en segundo plano; el botón "Continuar" no avanza visualmente hasta confirmar el guardado, pero la respuesta ya quedó en el buffer local — no se pierde |
| Recarga o cierre accidental | Se retoma en `progreso.paso_actual`, leído de Firestore |
| El colaborador reporta un problema ("Necesito ayuda") | Se crea un documento en `usuarios/{uid}/soporte` con el paso actual y un mensaje opcional; aparece en el panel de Juli; el colaborador puede seguir intentando por su cuenta mientras tanto |
| Bloque técnico persistente (ej. la app no puede cargar la siguiente pregunta tras varios reintentos) | El cliente marca `progreso.bloqueado_tecnico = true` y muestra `ErrorScreen`: "Hubo un problema técnico. Juli ya fue notificada." |
| Juli resuelve el problema | Desde su panel, marca "Resuelto" → limpia `bloqueado_tecnico` → el colaborador, al volver a intentar, continúa exactamente donde iba, sin perder respuestas |
| Doble envío accidental de la misma respuesta | El ID del documento es el `id_interno` oficial — sobrescribe, nunca duplica |

**No existe ningún flujo de cancelación/retiro voluntario dentro del recorrido.** La única salida antes de empezar es la pantalla de Consentimiento ("No deseo participar").

**Notificación a Juli (decisión cerrada para el MVP):** únicamente a través de su panel — ella debe revisarlo activamente para ver tickets abiertos. No se implementa correo automático, Slack, ni Cloud Functions de notificación en esta fase; queda para una segunda fase si se confirma que hay tiempo.

---

## N. SISTEMA DE PLACEHOLDERS VISUALES (FASE 1) Y RUTA A ARTE FINAL (FASE 2)

**Decisión cerrada:** el MVP de mañana usa placeholders de color y formas simples para las 15 escenas — no ilustraciones finales. La prioridad es que el recorrido funcione, que las 15 escenas estén correctamente identificadas, que Colombia/México/Chile tengan identidad visual básica, y que llaves, puertas, pasaporte y transiciones sean funcionales.

### Cómo se implementa (sin arte, solo CSS + un ícono simple por escena)

Cada bloque en `experiencia.json` ya trae `pais` y `escena`. El componente `BlockIntroScreen`/`QuestionScreen` pinta el fondo así:

1. Un `<div>` de fondo con el **color sólido del país** (ver paleta abajo).
2. Un ícono SVG simple centrado (línea, sin relleno complejo) que representa la escena — puede ser una forma geométrica básica con una etiqueta de texto debajo (ej. un ícono de bolsa + "Maleta de viaje").
3. El nombre de la escena como texto visible (para que quede "correctamente identificada" aunque no haya arte).
4. Estos tres elementos se definen en un único archivo `src/data/placeholders.js` — un mapa `bloque → {color, icono, label}` — para que reemplazar un placeholder por arte final más adelante sea **cambiar una línea en ese archivo**, nunca tocar lógica ni preguntas.

### Paleta de color por país (placeholder)

| País | Color de fondo | Uso |
|---|---|---|
| Colombia | `#F2C94C` (amarillo cálido) | Bloques 1, 2, 11, 12, 13, 14, 15 |
| México | `#E8425B` (rosa/terracota vibrante) | Bloques 3, 4, 5, 6 |
| Chile | `#2F80ED` (azul andino) | Bloques 7, 8, 9, 10 |
| Avatar / elementos transversales | `#FF7A00` (naranja — color del avatar "Naranja") | Avatar, llaves, pasaporte, botones principales, en cualquier país |

### Íconos placeholder sugeridos por bloque (formas simples, sin ilustración)

| Bloque | Ícono placeholder | Label visible |
|---|---|---|
| 1 - Maleta de viaje | maleta (línea simple) | "Maleta de viaje" |
| 2 - Boleto laboral | boleto/ticket | "Boleto de embarque" |
| 3 - Mercado | canasta | "Mercado" |
| 4 - Plaza con Mariaca | banca | "Plaza" |
| 5 - Parque | noria/rueda | "Parque de diversiones" |
| 6 - Café de cierre | taza | "Café" |
| 7 - Trayecto | mapa/pin | "Camino a casa de Angélica" |
| 8 - Llegada a casa | puerta de casa | "Casa de Angélica" |
| 9 - Paseo | huella de pata | "Paseo por el barrio" |
| 10 - Sobremesa | mesa | "Sobremesa" |
| 11 - Escritorio | escritorio | "El escritorio" |
| 12 - Sala de juntas | mesa de juntas | "Sala de juntas" |
| 13 - Pasillo | puertas en fila | "El pasillo" |
| 14 - Sala del equipo | grupo de figuras | "Sala del equipo" |
| 15 - Última puerta | puerta grande | "La última puerta" |

### Lorenzo, Lila y la memoria de Botas (Chile — Bloques 8, 9 y 10)

**Decisión cerrada:** deben quedar contemplados desde la estructura visual, aunque sea con placeholder, no se pueden omitir de la Fase 1.

- **Lorenzo y Lila:** en los Bloques 8, 9 y 10, junto al ícono principal de la escena, agregar **dos íconos simples de huella de pata** (uno junto al otro, sin ilustración de perro realista) con un label pequeño "Lorenzo y Lila te acompañan". Es el mismo placeholder en los tres bloques.
- **Memoria de Botas:** únicamente en el **Bloque 10 (Sobremesa)**, agregar un tercer elemento discreto — una pequeña estrella o huella en tono más suave/apagado (ej. gris cálido, no el mismo color vivo que Lorenzo/Lila) con un label opcional muy breve, sin texto explicativo largo ni protagonismo visual. Debe sentirse como un detalle de fondo, nunca como un elemento interactivo o un "misterio" (recordar la Sección 3 del contexto maestro: la representación de Botas debe ser respetuosa, nunca un mecanismo de juego).
- Estos tres elementos (Lorenzo, Lila, Botas) se definen también en `placeholders.js`, listos para reemplazarse por ilustraciones finales en la Fase 2 sin tocar `buildJourneySteps.js` ni ningún componente de lógica.

### Qué NO se necesita para mañana
- Ilustraciones finales de ninguna de las 15 escenas.
- Animaciones de Lorenzo/Lila/Botas.
- Fotografías o arte de Mariaca, Angélica, ni de ningún personaje.

Todo esto es reemplazable después, cambiando únicamente `placeholders.js` y los assets en `public/assets/scenes/`, sin tocar `experiencia.json`, sin tocar preguntas, y sin tocar la máquina de estados.

---

## O. CHECKLIST DE PRUEBAS ANTES DE PUBLICAR

- [ ] Un correo que NO termina en `@haptica.co` no puede iniciar sesión, y si lo lograra, ninguna regla de Firestore le permite leer/escribir nada.
- [ ] Ninguna pregunta es visible antes de aceptar el consentimiento.
- [ ] Las 204 preguntas aparecen, en orden, con el texto y las opciones idénticas a `experiencia.json` (que a su vez viene de la Matriz Maestra).
- [ ] Ninguna pantalla muestra más de una pregunta a la vez.
- [ ] Recargar la página en cualquier punto del recorrido retoma exactamente el mismo paso, sin perder respuestas ya dadas.
- [ ] Intentar (vía consola del navegador) escribir una respuesta de un bloque posterior sin tener la llave anterior es **rechazado por las reglas de Firestore**.
- [ ] Un usuario no puede leer ni ver, por ningún medio de la interfaz, las respuestas o el progreso de otro usuario.
- [ ] La Pausa Humana de Juli aparece en el punto correcto (tras la transición Chile→Colombia, antes del Bloque 11) y su comentario se guarda separado de `respuestas`.
- [ ] El botón "Necesito ayuda" crea un ticket en `soporte` visible en el panel de Juli, sin cerrar sesión ni perder progreso.
- [ ] La pantalla de Cierre no muestra puntuaciones, niveles de riesgo, ni comparaciones.
- [ ] El panel de Juli solo es accesible con el rol `juli`; ningún colaborador común puede entrar a `/juli`.
- [ ] El botón "Exportar" del panel de Juli genera un archivo con la estructura de los 5 documentos oficiales.
- [ ] Los 4 ajustes narrativos aprobados (P027, P112, P187, P188) se ven reflejados en las pantallas correspondientes; P030 se mantiene con su texto original sin cambios.
- [ ] Las 15 escenas se identifican correctamente con su color de país y su label, aunque sean placeholders (Sección N).
- [ ] Los Bloques 8, 9 y 10 (Chile) muestran el placeholder de Lorenzo y Lila; el Bloque 10 además muestra el placeholder discreto de la memoria de Botas.
- [ ] `juliana.lopez@haptica.co` puede entrar a `/juli` y ver el panel; ninguna otra cuenta puede.

---

# LISTO PARA CLAUDE CODE

### Archivos que ya existen y debe usar tal cual (no regenerar desde cero)
- `Matriz_Maestra_204_Preguntas_Haptica.xlsx` (fuente de verdad congelada)
- `experiencia.json` (ya generado y validado — 204 preguntas, 15 bloques, 3 transiciones)
- `export_experiencia_json.py` (correr de nuevo SOLO si el Excel cambia)

### Archivos que debe crear
Toda la estructura de la sección B: scaffolding de Vite+React, los 12 componentes de la sección G, `buildJourneySteps.js`, `useJourneyState.js`, `firestore.js`, `App.jsx`, `main.jsx`, `firebase.json`, `firestore.rules`, y el mini-panel de Juli (`JuliLogin.jsx`, `JuliDashboard.jsx`).

### Orden recomendado de implementación
1. Scaffolding del proyecto (Vite + React) + configuración de Firebase (Auth, Firestore, Hosting) con el proyecto real de Háptica.
2. Copiar `experiencia.json` a `src/data/` e implementar `buildJourneySteps.js` — **verificar con un `console.log` que genera exactamente 242 pasos y que el array de preguntas mantiene 204 elementos en orden 1..204**, antes de tocar cualquier UI.
3. Implementar `QuestionScreen` + `ProgressIndicator` + `useJourneyState` (sin persistencia todavía) y navegar en memoria las 204 preguntas de principio a fin, para confirmar que el contenido se ve correctamente.
4. Conectar Autenticación (Google, restringido a `@haptica.co`) y las Reglas de Seguridad de Firestore.
5. Conectar persistencia real: guardar cada respuesta, leer y retomar `progreso.paso_actual`.
6. Completar el resto de bloques, transiciones, `KeyEarnedScreen`, `TransitionScreen`.
7. Implementar `JuliPauseScreen` y `HelpReportModal`.
8. Implementar el panel mínimo de Juli (tabla + reactivar + exportar).
9. Correr el checklist de la sección N de punta a punta con una cuenta de prueba.

### Primera tarea que debe ejecutar
Crear el proyecto Vite+React, copiar `experiencia.json`, e implementar y probar `buildJourneySteps.js` de forma aislada (sin UI, solo consola) confirmando los 3 números clave: **242 pasos totales, 204 preguntas, 15 bloques** — antes de escribir un solo componente visual.

### Decisiones — TODAS CONFIRMADAS por HÁPTICA, ninguna queda pendiente

1. **Cuenta y proyecto de Firebase de Háptica:** ✅ **Juliana López** (`juliana.lopez@haptica.co`) será la responsable de administrar/configurar Firebase y tendrá el acceso administrativo del proyecto.
2. **Asignación del rol de Juli:** ✅ correo confirmado. Correr `scripts/asignar_rol_juli.js` (sección I) una sola vez contra `juliana.lopez@haptica.co` antes de que ella use el panel.
3. **Ilustraciones definitivas vs. placeholders:** ✅ el MVP de mañana usa **placeholders de color y formas simples** (Sección N) para las 15 escenas — no arte final. Colombia/México/Chile ya tienen su paleta e identidad visual básica definida. Lorenzo, Lila y la memoria de Botas quedan contemplados desde ya en los Bloques 8, 9 y 10, también como placeholder.
4. **Redacción exacta del mensaje de "Necesito ayuda":** ✅ texto definitivo ya incorporado en el componente `HelpReportModal` (Sección G) — no debe alterarse ni parafrasearse al implementarlo.
5. **Notificación a Juli:** ✅ únicamente mediante su panel (Sección L y M) — sin correo automático, sin Slack, sin Cloud Functions, en esta fase.

Con estas 5 confirmaciones, **no queda ninguna decisión de negocio pendiente** para iniciar la construcción — solo quedan las decisiones puramente técnicas que Claude Code resuelve sobre la marcha siguiendo este documento.
