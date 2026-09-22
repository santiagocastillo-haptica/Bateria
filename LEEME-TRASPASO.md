# Traspaso — Travesía Háptica (videojuego de la Batería Psicosocial)

Proyecto listo para continuar en otra cuenta de Claude Code.

## 1. Cómo levantarlo (primero que todo)

```bash
cd haptica-viaje
npm install
npm run dev
```
Abre http://localhost:5173

> `node_modules/` y `dist/` NO vienen en el paquete: se regeneran con `npm install` y `npm run build`.

## 2. Qué hay adentro

```
haptica-viaje/              ← la aplicación (React + Vite)
  src/
    data/experiencia.json   ← ⚠️ CONTENIDO CONGELADO: las 204 preguntas oficiales
    game/                   ← mundos, minijuegos, álbum, pasaporte, acertijos
    components/             ← motor de preguntas (QuestionScreen), pantallas comunes
    state/                  ← persistencia (demo localStorage / Firebase)
    config/appMode.js       ← modo review / production
  firestore.rules           ← reglas de seguridad (generadas desde el contenido)
  scripts/                  ← verificación de pasos y generación de reglas
ESPECIFICACION_IMPLEMENTACION_CLAUDE_CODE.md  ← especificación original
experiencia.json                              ← copia original del contenido congelado
Matriz_Maestra_204_Preguntas_Haptica (2).xlsx ← fuente de verdad del instrumento
```

## 3. REGLA DE ORO (no negociable)

**Las 204 preguntas oficiales NO se tocan.** No se reescriben, resumen, reordenan,
combinan ni se cambian sus opciones. Toda la creatividad va en la capa de juego
(mundos, personajes, minijuegos, misterios, álbum, transiciones).

Distribución oficial verificada:
- **19** Ficha de Datos Generales → Colombia
- **31** Cuestionario de Estrés → México (P020–P050)
- **31** Factores Psicosociales Extralaborales → Chile (P051–P081)
- **123** Factores de Riesgo Psicosocial Intralaboral – Forma A → Regreso (P082–P204)

Verificar en cualquier momento con:
```bash
npm run verify:steps        # 242 pasos / 204 preguntas / 15 bloques
npm run generate:rules      # regenera firestore.rules desde el contenido
```

## 4. Modo de la aplicación

`.env.local` (no viene en el zip; créalo si lo necesitas):
```
VITE_APP_MODE=review        # equipo Háptica: navegación libre para preparar
# VITE_APP_MODE=production  # participantes reales: sin saltar ni retroceder
```
Por defecto arranca en **review**. **Antes del lanzamiento real hay que dejar
`production`**: ahí desaparecen los controles de Anterior/Saltar y la barra de
revisión, y el participante no puede omitir ninguna pregunta.

## 5. Estado actual

Jugable de principio a fin: Login → Consentimiento → 🇨🇴 Colombia (oficina,
misterio, Datos Generales) → 🌮 México (Mariaca, carrito, 3 excursiones) →
⛰️ Chile (Angélica, Lorenzo, Lila, memoria de Botas) → 🏠 Regreso (Santi y Cami,
circuito de 8 estaciones con minijuegos) → gran cierre → álbum → despedida.

Sistemas: avatar por correo corporativo, inventario, cámara + Álbum Haptiqueño
(captura manual y automática), pasaporte Háptica Airlines con 4 sellos,
acertijos `CodePuzzle` (Colombia = **214**, final = **726**), panel `/juli`.

## 6. Pendientes conocidos

1. **Firebase no está configurado**: la app corre en *modo demo* (localStorage).
   Para producción hay que crear el proyecto y llenar `.env.local` con las
   variables `VITE_FIREBASE_*` (ver `.env.example`), desplegar `firestore.rules`
   y correr `scripts/asignar_rol_juli.js` una sola vez.
2. **Texto oficial del consentimiento**: la pantalla solo informa que llega por
   Google. El documento oficial es externo a la app.
3. **Álbum**: hoy persiste en `localStorage`. Si se quiere multi-dispositivo,
   habría que sincronizarlo con Firestore.
4. **Review vs. datos reales**: cuando Firebase esté conectado, decidir si el
   modo *review* escribe en un proyecto de pruebas aparte.
