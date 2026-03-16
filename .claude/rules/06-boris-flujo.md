# REGLA: Flujo Boris obligatorio

## Antes de tocar codigo
git pull origin $(git branch --show-current)
git tag pre-[tarea] -m "Punto de retorno"
git push origin pre-[tarea]

## Sub-agentes: model sonnet. NUNCA opus.

## Verificar ANTES de declarar completado
- Build pasa (cd android && ./gradlew assembleRelease si aplica)
- Commit + push hecho
- .brain/history.md actualizado

## AL TERMINAR CADA TAREA: Notificar al SM (OBLIGATORIO)
curl -s -X POST http://localhost:9099/api/sm/dashboard/summaries -H 'X-Api-Key: huygh-secret-2026' -H 'Content-Type: application/json' -d '{"task":"[nombre]","pseudocode":"resumen","decisions":["decisiones"],"result":"resultado"}'
curl -s -X POST http://localhost:9099/api/sm/notifications -H 'X-Api-Key: huygh-secret-2026' -H 'Content-Type: application/json' -d '{"type":"task_complete","result":"[resumen]","detail":"[commits]"}'
Sin estos curls, el SM no sabe que terminaste.
