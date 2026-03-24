# BIOS — Boot Init OS para FacturaIA

Ejecutar al inicio de sesión para cargar todas las deferred tools y recuperar estado.
Objetivo: que Boris MCP responda, Knowledge Hub esté activo, y no haya tareas pendientes olvidadas.

---

## BLOQUE 1 — Cargar deferred tools (TODO EN PARALELO)

```
ToolSearch query="select:TaskCreate,TaskList,TaskUpdate,TaskGet"
ToolSearch query="select:WebSearch,WebFetch,SendMessage,AskUserQuestion"
ToolSearch query="select:EnterPlanMode,ExitPlanMode,CronCreate,CronList,CronDelete"
ToolSearch query="select:mcp__boris__boris_start_task,mcp__boris__boris_save_state,mcp__boris__boris_verify,mcp__boris__boris_register_done,mcp__boris__boris_register_failed,mcp__boris__boris_sync,mcp__boris__boris_health,mcp__boris__boris_get_state"
ToolSearch query="select:mcp__knowledge-hub__kb_search,mcp__knowledge-hub__kb_save,mcp__knowledge-hub__kb_read,mcp__knowledge-hub__kb_list,mcp__knowledge-hub__kb_prune,mcp__knowledge-hub__kb_context"
ToolSearch query="select:mcp__boris__openclaw_begin,mcp__boris__openclaw_evidence,mcp__boris__openclaw_carlos_approved,mcp__boris__openclaw_status,mcp__boris__openclaw_quality_check,mcp__boris__openclaw_watch,mcp__boris__openclaw_recap"
```

**⚠️ SIN ESTE BLOQUE**: `boris_start_task`, `boris_verify`, `boris_register_done` y todas las tools MCP son deferred y NO funcionan. El hook PreToolUse bloqueará commits.

---

## BLOQUE 2 — Cargar contexto (PARALELO con Bloque 1)

```
mcp__knowledge-hub__kb_context          → contexto activo del KB
mcp__boris__boris_get_state             → estado de sesión anterior, tarea pendiente, done-registry
```

Si `boris_get_state` falla → leer manualmente:
- `.brain/task.md` — tarea activa
- `.brain/session-state.md` — dónde quedó la última sesión
- `.brain/done-registry.md` — qué ya está completado (no repetir)

---

## BLOQUE 3 — Cola de tareas pendientes (DESPUÉS de Bloques 1+2)

```
mcp__knowledge-hub__kb_search
  query: "STATUS: pending"
  category: "task"
  project: "facturaia"
```

Filtrar por `TO: facturaia` o `TO: all`. Clasificar y actuar:

| Prioridad | Acción |
|-----------|--------|
| `alta`    | Ejecutar inmediatamente (→ `boris_start_task` sin preguntar) |
| `media`   | Preguntar a Carlos antes de empezar |
| `baja`    | Solo informar, no bloquear |

---

## BLOQUE 4 — Git & estado local

```bash
git branch --show-current          # debe ser main (o branch activa)
git status --porcelain | wc -l     # archivos sin commit
git log --oneline -3               # últimos commits
```

Si hay archivos sin commit → reportar. Si llevan >30 min sin commit → advertir.

---

## REPORTE FINAL

Mostrar exactamente esto al terminar:

```
BIOS OK — 34 tools cargadas
─────────────────────────────
Proyecto : FacturaIA v1.0.4
Branch   : [branch actual]
Git dirty: [N archivos / limpio]
Boris    : [ACTIVO | ERROR → revisar settings.local.json]
KB       : [ACTIVO | ERROR → revisar enableAllProjectMcpServers]
─────────────────────────────
Tareas inmediatas : N
Tareas pendientes : N
Tareas futuras    : N
─────────────────────────────
[Lista de tareas inmediatas si N > 0]
```

Si Boris no responde → verificar:
1. `cat .claude/settings.local.json` → debe tener `mcp__boris__boris_get_state` en `allow`
2. `"enableAllProjectMcpServers": true` debe estar presente
3. El MCP boris debe estar configurado en `~/.claude/mcp.json` o equivalente

---

## CONTEXTO DEL PROYECTO (para subagentes que arranquen post-BIOS)

Stack activo:
- **App**: React Native 0.76.9 + Expo 52 + TypeScript
- **OCR**: Go `facturaia-ocr` v2.7.0 → Gemini Vision API → puerto 8081
- **BD**: PostgreSQL 16 + PgBouncer + MinIO (4 buckets)
- **Build**: `cd android && ./gradlew assembleRelease`
- **Test**: Expo Go / EAS build (`eas build --platform android`)
- **Automatización**: n8n (flujos DGII)

Reglas críticas que siguen activas post-BIOS:
- Boris `done-registry` es ley: si una tarea está ahí, **no se repite**
- Ningún commit sin `boris_verify` → el hook lo bloquea (PreToolUse)
- Ningún cambio de lógica OCR/multi-tenant sin evidencia concreta
- Arquitecto no escribe código directamente → delegar a subagentes Sonnet
