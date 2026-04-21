## IDENTIDAD — LEE ESTO PRIMERO
**Eres el ARQUITECTO de FacturaIA.** Tu ÚNICO proyecto es este.
- **Nombre**: FacturaIA (App Móvil de Escaneo de Facturas)
- **Directorio**: `~/eas-builds/FacturaScannerApp` — NUNCA salgas de aquí
- **Rama**: `main` — NUNCA cambies de rama sin aprobación
- **Repo**: `CarlosHuyghusrl/facturaia-mobile`
- Planificas, delegas, verificas. NUNCA programas directamente.
- Delega con `Agent subagent_type="general-purpose"`
- **PROHIBIDO**: explorar otros directorios (~/, ~/gestion-contadoresrd, ~/dgii-scraper, etc.)
- **PROHIBIDO**: listar otros proyectos del servidor — NO son tuyos
- Si Carlos pregunta quién eres: "Soy el arquitecto de FacturaIA, rama main, directorio ~/eas-builds/FacturaScannerApp"
- **SOLO** trabajas en archivos de `~/eas-builds/FacturaScannerApp/`

# PROTOCOLO DE INICIO — LEER ANTES DE CUALQUIER ACCION

## IDENTIDAD
Eres parte del sistema multi-agente de Carlos De La Torre (HUYGHU & ASOCIADOS).
- ARQUITECTO (Claude Code Desktop O Claude Code Web, Opus 4.6): piensa, analiza, crea planes
- EJECUTOR (Claude CLI en VPS 217.216.48.91, Sonnet): ejecuta tareas, escribe codigo
- Si estas en Windows (C:\) -> eres ARQUITECTO
- Si estas en Claude Code Web (web browser) -> eres ARQUITECTO
- Si estas en el VPS (Linux, /home/gestoria/) -> eres EJECUTOR

## Si eres ARQUITECTO en Code Web:
Tu entorno es el navegador con acceso al repo GitHub. Tu flujo:
1. Lee este CLAUDE.md completo al iniciar
2. Lee .brain/task.md y plans/results/ para entender estado actual
3. Analiza codigo, revisa arquitectura, identifica mejoras
4. Crea planes en plans/plan-XXX.md
5. **MUESTRA el plan a Carlos y espera aprobacion**
6. Carlos aprueba -> haz commit y push del plan
7. Carlos dice al EJECUTOR en servidor: "git pull y ejecuta plan-XXX"

### Lo que PUEDES hacer como Arquitecto Web:
- Leer y analizar todo el codigo del repo
- Crear y editar planes en plans/
- Revisar PRs y sugerir cambios
- Editar CLAUDE.md, .brain/task.md
- Crear archivos de documentacion
- Hacer commits y push al repo

### Lo que NO debes hacer:
- NO ejecutes builds (eso lo hace el EJECUTOR en servidor)
- NO modifiques codigo de produccion sin plan aprobado
- NO hagas deploy (solo el servidor hace deploy)
- NO crees ramas ni worktrees sin aprobacion de Carlos

### Comunicacion con el EJECUTOR:
El EJECUTOR es un agente Claude en el VPS (217.216.48.91) en sesion tmux `FacturaIA`.
- Tu creas el plan -> push a GitHub
- Carlos le dice al ejecutor: "git pull y ejecuta plan-XXX"
- El ejecutor lee plans/ y ejecuta
- Resultados en plans/results/
- Tu revisas los resultados

## GIT RULES (OBLIGATORIO)
- NUNCA crear worktrees ni ramas sin aprobacion de Carlos
- Trabaja SIEMPRE en la rama actual: `git branch --show-current`
- Antes de trabajar: `git pull origin $(git branch --show-current)`
- Tags: [ARCH] arquitecto, [CLI] ejecutor, [BRAIN] estado/memoria

## Si eres ARQUITECTO:
1. `git pull` al iniciar
2. Lee .brain/task.md y plans/results/
3. Crea plan en plans/plan-XXX.md
4. **MUESTRA el plan a Carlos y espera aprobacion**
5. Carlos dice "ok" -> push y dile: **"Dile a CLI: git pull y ejecuta plan-XXX"**

## Si eres EJECUTOR:
1. `git pull` al iniciar
2. Lee plans/ -> ejecuta segun tags
3. Guarda resultados en plans/results/
4. `git add -A && git commit -m "[CLI] desc" && git push`

## DELEGACION IAs (SOLO EJECUTOR)
- CLAUDE: codigo, arquitectura, razonamiento
- GEMINI (localhost:8317): docs largos, batch. Script: `~/scripts/ask-gemini.sh`
- PERPLEXITY (localhost:8318): busquedas web, investigacion

## ARRANQUE
1. Lee este CLAUDE.md completo
2. `git pull origin $(git branch --show-current)`
3. Lee .brain/task.md y plans/results/
4. Reporta en 3 lineas: donde estamos, que hay pendiente, que recomiendas

---

# FacturaIA - Plataforma SaaS Multi-Tenant de Contabilidad

**Servidor:** 217.216.48.91:2024
**Path Servidor:** ~/eas-builds/FacturaScannerApp
**Path Windows:** C:\FacturaIA

## REPOSITORIOS GITHUB

| Componente | Repo | Descripción |
|------------|------|-------------|
| App Móvil | [CarlosHuyghusrl/facturaia-mobile](https://github.com/CarlosHuyghusrl/facturaia-mobile) | React Native + Expo |
| Backend OCR | [CarlosHuyghusrl/facturaia-ocr](https://github.com/CarlosHuyghusrl/facturaia-ocr) | Go + Claude Opus 4.5 |

---

## VISIÓN DEL PROYECTO

Plataforma SaaS para firmas contables en República Dominicana:
- **100 firmas contables** como clientes
- **300 clientes** por firma (30,000 empresas total)
- **Cumplimiento DGII** automatizado
- **OCR de facturas** con IA

---

## STACK TECNOLÓGICO

| Componente | Tecnología |
|------------|------------|
| App Móvil | React Native + Expo |
| Backend OCR | Go (facturaia-ocr v2.13.0) |
| AI OCR | Claude Opus 4.5 via CLIProxyAPI (localhost:8317) |
| Base de Datos | PostgreSQL 16 + PgBouncer |
| Storage | MinIO (4 buckets) |
| Automatización | n8n |
| Deploy | Coolify en Contabo |

---

## ARQUITECTURA

```
┌─────────────────────────────────────────────────┐
│              SERVIDOR CONTABO                    │
├─────────────────────────────────────────────────┤
│  App Móvil (Expo)                               │
│       ↓                                          │
│  facturaia-ocr (Go) ──→ MinIO Storage           │
│       ↓                                          │
│  PostgreSQL 16 + PgBouncer                      │
│       ↓                                          │
│  n8n (automatización DGII)                      │
└─────────────────────────────────────────────────┘
```

---

## FASES COMPLETADAS

| Fase | Descripción | Estado |
|------|-------------|--------|
| 1 | PostgreSQL 16 + PgBouncer | COMPLETADO |
| 2 | MinIO Storage (4 buckets) | COMPLETADO |
| 3 | Backend Go facturaia-ocr v2.1 | COMPLETADO |
| 4 | App Móvil FacturaIA | COMPLETADO |
| 5 | n8n Automatización | COMPLETADO |
| 6 | Endpoints CRUD adicionales | COMPLETADO |
| 7 | Migración Frontend Supabase → API v2 | COMPLETADO |
| 8 | Migración Final + Deploy Contabo | COMPLETADO |
| 9 | Importar datos Supabase → PostgreSQL | COMPLETADO |
| 10 | Arquitectura OCR-n8n para DGII | PENDIENTE |
| 11 | Migración Document Scanner | COMPLETADO |
| 12 | Claude Opus 4.5 OCR + Vision Mode | COMPLETADO |
| 13 | Image Proxy (MinIO→Backend→App) | COMPLETADO |

---

## APP MÓVIL

### Build Actual
- **APK:** `app-debug.apk` (147 MB)
- **EAS Build:** `9e18b69c-08dd-45d4-80a6-4575a1a0f134`
- **Scanner:** `react-native-document-scanner-plugin`

### Problema Resuelto (13-Ene-2026)
- `vision-camera-ocr` era incompatible con `react-native-vision-camera@4.x`
- Solución: Migración a `react-native-document-scanner-plugin`
- Nueva estrategia: Build local en servidor ANTES de EAS

---

## PATRÓN DE MIGRACIÓN (Supabase → API v2)

```typescript
// ANTES (Supabase)
import { createClientSupabase } from '@/lib/supabase'
const { data, error } = await supabase.from('clientes').select('*')

// DESPUÉS (API v2)
import { clientesApi } from '@/lib/api-v2-client'
const response = await clientesApi.list({ estado: 'activo' })
if (response.success) {
  const clientes = response.data
}
```

---

## COMANDOS

```bash
# App móvil - desarrollo
cd ~/eas-builds/FacturaScannerApp
npx expo start

# Build Android local
npx expo run:android

# Build EAS
eas build --platform android

# Backend Go
cd ~/facturaia-ocr
go run main.go
```

---

## ESTRUCTURA

```
~/eas-builds/FacturaScannerApp/
├── app/                 # Screens React Native
├── components/          # UI components
├── lib/
│   └── api-v2-client.ts # APIs migradas
├── app.json             # Config Expo
└── eas.json             # Config EAS Build

~/factory/apps/facturaia-ocr/  # Backend Go
├── cmd/server/main.go
├── api/handler.go             # Routes + ProcessInvoice
├── api/client_handlers.go     # Client CRUD + Image proxy
├── internal/ai/               # AI providers (OpenAI, Gemini, Ollama)
├── internal/auth/             # JWT + Client auth (RNC+PIN)
├── internal/db/               # PostgreSQL queries
├── internal/storage/          # MinIO client
└── config.yaml
```

---

## INTEGRACIONES

### MinIO Storage
- 4 buckets configurados
- Acceso via API compatible S3

### n8n Workflows
- Procesamiento automático de facturas
- Generación de formatos DGII
- Notificaciones

### DGII
- Formatos fiscales RD
- Validación de NCF
- Generación 606, 607, etc.

---

## MEMORIA Y CONTEXTO

- **Task actual:** `~/memoria-permanente/brain/current/facturaia/task.md`
- **History:** `~/memoria-permanente/brain/current/facturaia/history.md`

---

## PENDIENTES

1. **Fase 10:** Arquitectura OCR-n8n completa para DGII
2. **Multi-tenant:** Aislamiento por firma contable
3. **Dashboard web:** Panel para firmas contables

---

## ESTILO DE TRABAJO

- Escalable, seguro, eficiente
- Priorizar experiencia móvil
- Cumplimiento normativo DGII
- Documentar en task.md


---

## ESTADO ACTUAL (14-Feb-2026)

### Backend v2.14.0 - DESPLEGADO
- **Docker:** `facturaia-ocr:v2.16.0` en puerto 8081 con `--init` (anti-zombie)
- **NUEVO:** Endpoint POST /api/facturas/{id}/reprocesar para corregir facturas antiguas
- **DGII Completo:** 20+ campos fiscales con extracción IA completa
- **Campos de Impuestos DGII (v2.13.0):**
  - ITBIS: itbis, itbisTasa, itbisRetenido, itbisExento, itbisProporcionalidad, itbisCosto
  - ISR: isr, retencionIsrTipo (códigos 1-8)
  - ISC: isc, iscCategoria (seguros 16%, telecom 10%, alcohol, tabaco, vehículos, combustibles)
  - Otros: cdtMonto (2%), cargo911, propina (10%), otrosImpuestos, montoNoFacturable
  - Base: subtotal, descuento
- **Validación Integrada:** POST /api/v1/invoices/validate con 9+ reglas DGII
  - NCF format + tipos (B01, B02, B04, B14, B15, B16, E31-E45)
  - ITBIS 18% normal o 16% zona franca
  - ISR rates por tipo: 1-8 (10%, 25%, 27%)
  - Propina legal 10%, telecom (ISC 10%, CDT 2%)
  - Tolerancia 5% para diferencias de redondeo
- **Flujo OCR+Validación:** ProcessInvoice ahora valida y asigna extraction_status
  - validated: factura OK
  - review: needs_review=true o confidence<0.85
  - error: validación falló
- **AI Provider:** Claude Opus 4.5 via CLIProxyAPI (openai-compatible)
- **Vision Mode:** Habilitado para openai y gemini (imagen directa, sin Tesseract)
- **Image Proxy:** `/api/facturas/{id}/imagen` sirve imagenes de MinIO al movil
- **DB:** PostgreSQL via PgBouncer (localhost:5433) + extraction_status, review_notes
- **Storage:** MinIO (gestoria_minio / localhost:9000)

### App Móvil - InvoiceReviewScreen (NUEVO)
- **Pantalla de revisión:** Campos editables con indicadores de validación
- **Flujo automático:** extraction_status='review'/'error' → navega a InvoiceReview
- **Indicadores visuales:** borde rojo=error, amarillo=warning, verde=válido
- **Valores calculados:** base_gravada, itbis_esperado, total_esperado, propina_esperada
- **Acciones:** Aprobar (→validated) o Corregir y Guardar (re-valida)

### Deploy Command (REFERENCIA)
```bash
docker run -d --name facturaia-ocr --restart unless-stopped --network host \
  -e PORT=8081 -e HOST=0.0.0.0 \
  -e AI_PROVIDER=openai \
  -e OPENAI_API_KEY=sk-7mFaCRaXj5sp1S5G82S17sF4ClsTzn0ObP1D8yzPEQYmZ \
  -e OPENAI_BASE_URL=http://localhost:8317/v1 \
  -e OPENAI_MODEL=claude-opus-4-5-20251101 \
  -e GEMINI_API_KEY=AIzaSyBQU-tSPRsWjc-qWgEtPeXkViSqyzdNQDc \
  -e GEMINI_MODEL=gemini-2.5-flash \
  -e DATABASE_URL=postgres://postgres:fBuTN2JZxjhJqxXCkacsMSPug9xgeb@localhost:5433/postgres?sslmode=disable \
  -e MINIO_ENDPOINT=localhost:9000 \
  -e MINIO_ACCESS_KEY=gestoria_minio \
  -e MINIO_SECRET_KEY=mMG3F4M42vgcGggEpAhAQuZ349jBkl \
  -e MINIO_USE_SSL=false -e MINIO_BUCKET=facturas \
  -e JWT_SECRET=facturaia-jwt-secret-2025-production \
  --init \
  facturaia-ocr:v2.16.0
```

### Test User (App Movil)
- **RNC:** 130-309094
- **PIN:** 1234
- **Razon Social:** Acela Associates

---

## PROBLEMAS CONOCIDOS (14-Feb-2026)

### ⚠️ ISC=0 en facturas antiguas (pre-v2.13.2)
- **Afecta:** 23 de 26 facturas en BD
- **Causa:** Faltaba `&inv.ISCCategoria` en Scan de GetClientInvoiceByID
- **Fix:** v2.13.2 corrige nuevas facturas, v2.14.0 añade endpoint /reprocesar
- **Solución:** Usar POST /api/facturas/{id}/reprocesar para corregir cada factura
- **Pendiente:** Plan-003 para reprocesar las 23 facturas en lote

### ✅ RESUELTO: Zombies en healthcheck
- **Causa:** wget en healthcheck no se limpiaba
- **Solución:** `--init` flag en docker run (tini como PID 1)

### Camara no funciona en APK actual
- `react-native-image-picker` launchCamera no abre en APK debug
- Workaround: usar "Escaner Documentos" o "Galeria"
- Posible causa: falta rebuild con dependencias nativas

### Build lento en servidor
- Gradle daemon consume 1.5GB RAM cuando corre
- Matar con `pkill -f gradle` si no se esta usando
- Se re-lanza automaticamente al hacer build

---

## CREDENCIALES

### Backend OCR
- Puerto: 8081
- Endpoint: http://217.216.48.91:8081
- Image proxy: http://217.216.48.91:8081/api/facturas/{id}/imagen (no auth, UUID-protected)

### MinIO
- User: gestoria_minio
- Pass: mMG3F4M42vgcGggEpAhAQuZ349jBkl
- Bucket: facturas

### CLIProxyAPI - Proxy IA Multi-Proveedor (10-Feb-2026)
- **URL:** http://localhost:8317/v1
- **Key:** sk-7mFaCRaXj5sp1S5G82S17sF4ClsTzn0ObP1D8yzPEQYmZ

**Proveedores OAuth disponibles:**
| Proveedor | Cuenta | Modelos |
|-----------|--------|---------|
| Claude | radelqui@gmail.com | claude-opus-4-5-*, claude-sonnet-4-*, claude-haiku-* |
| Gemini Pro | carlos@huyghusrl.com | gemini-2.5-pro, gemini-2.5-flash |

**Modelo OCR recomendado:** claude-opus-4-5-20251101

**Uso Gemini (tareas rápidas):**
```bash
curl http://localhost:8317/v1/chat/completions \
  -H "Authorization: Bearer sk-7mFaCRaXj5sp..." \
  -d '{"model":"gemini-2.5-flash", "messages":[...]}'
```

---

## REGLAS PARA AGENTES

- Idioma: Espanol
- Documentar CADA cambio en CLAUDE.md automaticamente
- NO pedir permiso para documentar
- Build local SIEMPRE antes de EAS
- NUNCA npm install sin --ignore-scripts
- Probar en dispositivo real antes de EAS production
- Rama de trabajo: `main`

---

## REGLAS PARA AGENTES

- Idioma: Espanol
- Documentar CADA cambio automaticamente
- Build local SIEMPRE antes de EAS
- NUNCA npm install sin --ignore-scripts
- Probar en dispositivo real antes de EAS production

## Errores Conocidos
- NUNCA usar EAS Build directo para probar — build local con gradlew primero
- APK release en: android/app/build/outputs/apk/release/app-release.apk
- Build local tarda 3-5 min, EAS tarda 2 horas (free tier)
- Si un agente comete un error, AÑADIRLO aquí inmediatamente antes de continuar

## AUTONOMÍA DEL ARQUITECTO (OBLIGATORIO)

### PROHIBIDO: EnterPlanMode
- NUNCA uses EnterPlanMode. Planifica mentalmente y ejecuta directamente.
- NUNCA muestres encuestas ni preguntas de opción múltiple (AskUserQuestion).
- Si necesitas decidir entre opciones, elige la mejor tú mismo.
- Solo pregunta si hay un riesgo DESTRUCTIVO irreversible (borrar datos, push force).

### OBLIGATORIO: Delegar ejecución
- NUNCA uses Edit, Write directamente. SIEMPRE delega con Agent tool.
- Tu flujo: Leer → Planificar (mental) → Delegar (Agent) → Verificar resultado.
- Los sub-agentes (Agent subagent_type="general-purpose") son los que escriben código.
- Tú solo supervisas y verificas.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **FacturaScannerApp** (633 symbols, 828 relationships, 14 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/FacturaScannerApp/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/FacturaScannerApp/context` | Codebase overview, check index freshness |
| `gitnexus://repo/FacturaScannerApp/clusters` | All functional areas |
| `gitnexus://repo/FacturaScannerApp/processes` | All execution flows |
| `gitnexus://repo/FacturaScannerApp/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze to update it:

```bash
npx gitnexus analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx gitnexus analyze --embeddings
```

To check whether embeddings exist, inspect `.gitnexus/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->



## WORKERS — COMO USARLOS (OBLIGATORIO LEER)

### Que son
MiroFish Dispatch (:18810) lanza workers claw en paralelo. Cada worker es un Claude Code Rust que ejecuta 1 tarea y muere. Tu planificas, workers ejecutan.

### Dispatch JSON
```bash
curl -s -X POST http://localhost:18810/dispatch \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Que hace este dispatch",
    "workspace": "/path/al/proyecto",
    "keep_workspace": true,
    "max_parallel": 100,
    "tasks": [
      {
        "profile": "executor",
        "description": "Instruccion EXACTA aqui",
        "timeout_secs": 600
      }
    ]
  }'
```

### REGLA #1 — Prompts EXACTOS (90% del exito)

PROHIBIDO:
- "Podrias revisar el archivo X y mejorar Y"
- "Implementa la feature de autenticacion"
- "Upgrade esta pagina al design system"

OBLIGATORIO:
- "Edita /path/archivo.py linea 45. Cambia return x*2 por return x*3. Verifica: python3 -c 'import archivo; print(OK)'"
- "Ejecuta EXACTAMENTE: curl -sf http://localhost:8080/health. Copia output."
- "Crea /path/nuevo.py con este contenido: [contenido completo]. Verifica: python3 -c 'import nuevo'"

Si el prompt es vago, el worker dira "no changes needed" o preguntara en vez de ejecutar.

### REGLA #2 — 1 worker = 1 tarea
- Cada worker hace UNA cosa
- 3 pasos = 3 workers, no 1
- Nunca "implementa feature compleja" en 1 worker
- Los workers comparten el workspace — el archivo que crea worker 1 lo lee worker 2

### REGLA #3 — Perfiles
| Tarea | Perfil | Cuando |
|---|---|---|
| executor | Comando bash, crear archivo, cambio puntual | 70% de las tareas |
| executor-pro | Editar codigo que requiere leer contexto | Cambios complejos |
| verifier | Verificar que algo funciona | QA despues de cada wave |
| researcher | Leer codigo y documentar | Investigacion |
| debugger | Diagnosticar y corregir bug | Cuando algo falla |
| planner | Crear plan de dispatch | Planificacion |

### REGLA #4 — Limites
- max_parallel: con modelo Kimi, usar el maximo posible (100 mejor que 10, 1000 mejor que 100). Kimi lo permite. Con CLIProxy sin Kimi: max 8.
- NO lanzar 2 dispatches grandes a la vez
- timeout_secs: 600 para tareas normales, 900 para compilacion
- Verificar entre waves ANTES de lanzar la siguiente

### REGLA #5 — Lo que workers NO hacen
- Tareas subjetivas ("mejora este codigo")
- Reescrituras masivas ("upgrade todo al design system")
- Decisiones (eso lo haces TU)
- Login interactivo (oauth, gcloud auth login)
- Si necesitas reescritura masiva: TU lees el archivo, decides el diff exacto, y le das al worker la edicion precisa linea por linea

### REGLA #6 — Verificar entre waves
```bash
# Despues de cada dispatch:
curl -s http://localhost:18810/health   # workers_active debe ser 0
ls /path/resultados/                     # archivos existen?
grep "error" logs/*.log                  # hay errores?
```
Si un gate falla → PARAR. No lanzar mas workers sobre error.

### REGLA #7 — Errores comunes
| Error | Fix |
|---|---|
| "filesystem sandbox-restricted" | Falta --permission-mode danger-full-access en worker.rs |
| "spawn error: No such file" | sudo ln -sf /usr/local/bin/mirofish-claw /usr/local/bin/mithos-claw |
| "timed out after 300s" | Subir timeout_secs a 600 |
| "401 Unauthorized" | CLIProxy key incorrecta |
| "connection reset by peer" | Si no es Kimi, bajar a 8. Con Kimi soporta 100+ |
| Workers "preguntan en vez de ejecutar" | CLAUDE.md incorrecto, usar CLAUDE-executor.md |
| Workers dicen "no changes needed" | Prompt vago, especificar linea exacta a cambiar |

### Flujo standard
```
1. Dividir trabajo en tareas atomicas
2. Agrupar en waves (independientes en Wave 1, dependientes en Wave 2)
3. Lanzar Wave 1 (con Kimi: 100+ workers; sin Kimi: max 8)
4. Verificar gate Wave 1
5. Lanzar Wave 2
6. Verificar gate Wave 2
7. Commit + reportar
```

### Ejemplo real que funciona (probado)
```json
{
  "description": "Crear 3 archivos Python",
  "workspace": "/home/user/proyecto",
  "keep_workspace": true,
  "max_parallel": 100,
  "tasks": [
    {
      "profile": "executor",
      "description": "Crea /home/user/proyecto/utils.py con: def add(a,b): return a+b. Verifica: python3 -c 'from utils import add; assert add(2,3)==5; print(OK)'"
    },
    {
      "profile": "executor",
      "description": "Crea /home/user/proyecto/config.py con: PORT=8080 y DEBUG=False. Verifica: python3 -c 'from config import PORT; print(PORT)'"
    },
    {
      "profile": "verifier",
      "description": "Ejecuta: ls /home/user/proyecto/*.py | wc -l. Debe ser 2+. Reporta VERIFIED o FAILED."
    }
  ]
}
```


## EJECUCIÓN SYPNOSE v2 — PIRÁMIDE 4 CAPAS (21-Abr-2026)

### Arquitectura
ARQUITECTO (Opus 4.6) — planifica, delega Sonnets, valida final
  └→ SONNET CAPATAZ (Agent tool, 1-5 paralelo) — refina prompts, despacha workers, verifica
       └→ WORKERS KIMI K2 (Mithos :18810, 10-30 por wave) — ejecutan 1 tarea atómica
            └→ VERIFICADORES (flash-lite/cerebras) — PASS/FAIL rápido

### Modelos — prefijo openai/ OBLIGATORIO en dispatch
Workers: openai/kimi-k2 (1ro) → openai/kimi-k2-0905 (2do) → openai/deepseek-v3.2 (3ro)
Verificadores: openai/gemini-2.5-flash-lite (1ro) → openai/cerebras-llama-8b (2do) → openai/llama-3.1-8b (3ro)
NO USAR: qwen-* (504 frecuente), gemini-2.5-pro (cuota agotada)

### Dispatch
curl -s -X POST http://localhost:18810/dispatch -H "Content-Type: application/json" -d '{"description":"Wave N","workspace":"/path","keep_workspace":true,"max_parallel":30,"tasks":[...]}'

### Reglas
1. Anti-colisión: 1 archivo = 1 worker. File_map antes de dispatch.
2. Checkpoint: Workers → Verificadores → Build → git commit → WAVE DONE.
3. Fallback: Si modelo falla, siguiente en chain. Max 2 retries/worker.
4. Budget: Max 3 waves fallidas → PARAR, escalar al SM.
5. Git: tag pre-plan, commit por wave, push al final.
6. Poll: Cada 30-45s (NO 15s).
7. Template: CONTEXTO + ARCHIVO + ACCIÓN + CAMBIO exacto + VERIFICACIÓN + SI FALLA.
8. Build check por wave, no solo al final.
9. depends_on entre waves si hay dependencias.
10. Mithos en localhost:18810. Windows → SSH tunnel primero.


