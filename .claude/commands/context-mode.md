# Context Mode — Guía de uso para FacturaIA

Reduce el contexto quemado por tool calls (Boris, KB, Bash, Read, WebFetch).
Instalado como MCP server local en este proyecto.

**Versión instalada**: context-mode v1.0.24 (MCP-only)
**Instalación**: `claude mcp add context-mode -- npx -y context-mode`
**GitHub**: https://github.com/mksglu/context-mode

---

## Qué hace

Intercepta outputs de Bash, Read, WebFetch, Grep y los comprime en un subprocess
sandboxeado **antes** de que entren al contexto. El raw data nunca llega al
context window.

| Sin Context Mode | Con Context Mode |
|-----------------|-----------------|
| git log 20 commits → ~8 KB crudo | → ~200 bytes de resumen |
| Archivo de 315 KB leído directamente | → 5.4 KB de resumen |
| Sesión de 30 min → 40% contexto quemado | → ~3 horas de vida útil |
| boris_get_state vuelca JSON entero | → solo campos relevantes |

**Reducción declarada**: 98% en tool outputs. SQLite local para continuidad de sesión.
Todo local: sin telemetría, sin cloud sync, sin cuenta requerida.

---

## Modo instalado: MCP-only (sin hooks automáticos)

> **Importante**: el comando `claude mcp add` instala solo el servidor MCP con
> 6 tools sandbox. **No instala hooks**. Sin hooks, el agente puede ignorar las
> instrucciones de routing y usar Bash/Read directos → ~60% de savings en vez del 98%.

Las 6 tools disponibles en este modo:

| Tool | Cuándo usarla |
|------|--------------|
| `ctx_execute` | Un solo comando Bash con output largo (logs, git log, ps aux) |
| `ctx_batch_execute` | Varios comandos en paralelo que tendrían mucho output |
| `ctx_execute_file` | Leer/analizar un archivo grande (>5 KB) |
| `ctx_index` | Indexar un archivo en FTS5 para búsquedas posteriores |
| `ctx_search` | Buscar en archivos indexados (BM25, rápido y preciso) |
| `ctx_fetch_and_index` | Hacer WebFetch + indexar en un paso |

**Para llegar al 98% real**: ver sección "Activar hooks manualmente" abajo.

---

## Instalación completa (para 98% real)

La instalación con hooks automáticos requiere el plugin de Claude Code:

```
/plugin marketplace add mksglu/context-mode
/plugin install context-mode@context-mode
```

Esto instala además:
- Hooks PreToolUse/PostToolUse/PreCompact/SessionStart que interceptan automáticamente
- Un archivo `CLAUDE.md` con instrucciones de routing en la raíz del proyecto
- Slash commands `/context-mode:ctx-stats`, `/context-mode:ctx-doctor`, `/context-mode:ctx-upgrade`

> **Conflicto potencial con Boris hooks**: el proyecto ya tiene hooks en
> `.claude/settings.json` (boris-verification-gate.sh, boris-session-start.sh).
> El plugin añadiría sus propios hooks. Verificar que no colisionen antes de instalar
> el plugin completo — en particular el hook PreToolUse de Boris debe tener precedencia
> sobre context-mode para que boris_verify siga bloqueando commits sin evidencia.

---

## Activar hooks manualmente (sin plugin — recomendado para este proyecto)

Para no romper los hooks de Boris, agregar context-mode a `settings.local.json`
en lugar de `settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash|Read|WebFetch|Grep",
        "hooks": [{ "type": "command", "command": "context-mode hook claude-code pretooluse" }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Bash|Read|WebFetch|Grep",
        "hooks": [{ "type": "command", "command": "context-mode hook claude-code posttooluse" }]
      }
    ]
  }
}
```

> **Nota**: `settings.json` tiene `deny: Edit(.claude/hooks/*)` y
> `deny: Edit(.claude/settings.json)` — los hooks de Boris protegen esos archivos.
> Editar `settings.local.json` sí está permitido.

---

## Verificación post-instalación

```bash
# 1. Confirmar que el MCP está registrado
claude mcp list | grep context-mode
# → context-mode: npx -y context-mode

# 2. Verificar que el servidor arranca
npx context-mode --version
# → Context Mode MCP server v1.0.24 running on stdio

# 3. Reiniciar Claude Code y ejecutar un comando largo
# (los tools ctx_* deben aparecer disponibles)

# 4. Confirmar que Boris sigue funcionando
# → boris_get_state debe responder con estado normal
# → Un commit de prueba debe pasar por boris_verify sin errores
```

---

## Riesgo y rollback

**Cuándo puede perder datos**:
- Outputs con valores exactos críticos (IDs específicos de logs, diffs complejos,
  hashes de commits en medio de un output largo)
- Contexto de error detallado que el resumen simplifica demasiado
- Cualquier output donde necesites el texto literal completo

**Señales de que está perdiendo info**:
- Boris reporta estado incorrecto tras `boris_get_state`
- El agente "olvida" pasos que acabas de hacer
- Errores de compilación sin el mensaje exacto del compilador

**Rollback**:
```bash
claude mcp remove context-mode
# Reiniciar Claude Code
```

---

## Compatibilidad con el stack de FacturaIA

| Componente | Compatibilidad | Nota |
|-----------|---------------|------|
| Boris MCP (`boris_*`) | ✅ Compatible | Boris no es Bash/Read, no lo intercepta |
| Knowledge Hub (`kb_*`) | ✅ Compatible | Igual, MCP directo |
| `git log / git status` | ✅ Recomendado via ctx_execute | Output largo → comprime bien |
| `./gradlew assembleRelease` | ⚠️ Cuidado | Output de build → resumen puede ocultar errores |
| `pytest / npm test` | ⚠️ Cuidado | Necesitas ver el output exacto de fallos |
| Lectura de `.brain/*.md` | ✅ OK | Archivos pequeños, no activa compresión |
| Lectura de archivos `.tsx` grandes | ✅ Recomendado via ctx_execute_file | Ahorra contexto |

**Regla práctica**: Para builds y tests donde necesitas el error exacto, usar
`Bash` directo (sin ctx_execute). Para exploración, logs, git history,
y archivos grandes → ctx_execute / ctx_execute_file.
