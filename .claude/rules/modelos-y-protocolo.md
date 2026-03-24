# REGLA PERMANENTE: Modelos de IA y Protocolo de Ejecucion
# Este archivo va en .claude/rules/modelos-y-protocolo.md de CADA proyecto

## 42 MODELOS DE IA DISPONIBLES — USALOS

NO solo tienes Claude. Tienes **42 modelos** via CLIProxyAPI y OpenClaw.

### Comandos rapidos
| Necesidad | Comando | Cuando |
|---|---|---|
| Investigar web | `~/scripts/ask-perplexity.sh "pregunta"` | ANTES de implementar cualquier cosa |
| Analizar docs/logs largos | `~/scripts/ask-gemini.sh "texto"` | Archivos >500 lineas, logs extensos |
| Ver todos los modelos | `curl -s http://localhost:8317/v1/models \| python3 -m json.tool` | Para saber que tienes |
| Ver estado modelos | `curl -s http://localhost:9091/models/health` | Verificar que estan up |
| Chat con cualquier modelo | `curl -s -X POST http://localhost:8317/v1/chat/completions -H 'Content-Type: application/json' -d '{"model":"[nombre]","messages":[{"role":"user","content":"pregunta"}]}'` | Cuando necesites un modelo especifico |

### Modelos clave
- **Perplexity** (:8318): Busquedas web, investigacion, docs actualizadas
- **Gemini 2.5 Flash** (:8317): Contexto largo, analisis batch, documentacion
- **DeepSeek v3.2** (:8317): Razonamiento, validacion, analisis
- **Qwen3-max** (:8317): Validacion alternativa (reservado IATRADER Elder)
- **Claude Haiku** (:8317): Tareas ligeras de auditoria

### REGLA OBLIGATORIA
- **Claude Opus/Sonnet SOLO para programar** (arquitecto + sub-agentes)
- **Todo lo demas** (investigar, analizar logs, monitoring, health checks) → modelos gratuitos
- **ANTES de implementar** → Perplexity para investigar
- **Logs largos** → Gemini para analizar

## PROTOCOLO DE EJECUCION BORIS/GSD

### Antes de tocar codigo
```bash
git pull origin $(git branch --show-current)
git tag pre-[tarea] -m "Punto de retorno"
git push origin pre-[tarea]
```

### Planificar
- `/gsd:plan-phase` ANTES de ejecutar
- Dividir en Waves (Wave 1 paralelo, Wave 2 depende de 1)

### Ejecutar
- Agent Teams con `model: "sonnet"` para TODOS los sub-agentes
- NUNCA usar Opus para sub-agentes
- DELEGAR — tu solo supervisas

### Documentar
- `.brain/history.md` despues de CADA accion
- Commit con tag [ARCH] despues de cada unidad logica
- Push al terminar

### Verificar ANTES de declarar completado
- Build compila
- Tests pasan
- Servicio responde (health check)
- Commit + push hecho
- `.brain/history.md` actualizado

### Reportar a OpenClaw
- Cambios de modelos → actualizar OpenClaw
- Nuevos servicios → registrar
- Cambios de puertos → documentar
