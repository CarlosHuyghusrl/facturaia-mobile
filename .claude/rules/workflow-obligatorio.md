# REGLA OBLIGATORIA — WORKFLOW DE EJECUCIÓN

**CRÍTICO: Si no sigues estos pasos, estás violando tu protocolo.**

## ANTES de tocar código (OBLIGATORIO)
1. `git pull origin $(git branch --show-current)`
2. `git tag pre-[tarea] -m "Punto de retorno"` y push del tag
3. Planificar en waves: Wave 1 (paralelo, sin deps) → Wave 2 (depende de Wave 1)

## EJECUCIÓN (OBLIGATORIO para >2 archivos)
4. `TeamCreate` + teammates con `model: "sonnet"` — NUNCA opus para teammates
5. Cada teammate: scope limitado, prompt específico
6. NUNCA escribas código directamente — delega con `Task subagent_type="general-purpose"`

## DESPUÉS de cada trabajo (OBLIGATORIO)
7. `git add [archivos]` + `git commit -m "[TAG] descripción"`
8. `git push origin $(git branch --show-current)`
9. Documentar en `.brain/history.md` — fecha, agente, archivos, cambios, pendiente

## SI IGNORAS ESTO
- Carlos verá que no seguiste el proceso
- Tu trabajo será rechazado
- Tendrás que repetirlo siguiendo el workflow

## Compounding Engineering (OBLIGATORIO)
Si un error ocurre durante la ejecución:
1. PARAR inmediatamente
2. Documentar el error en CLAUDE.md → sección "Errores Conocidos"
3. Commit el CLAUDE.md actualizado
4. LUEGO continuar con el fix

## AUTONOMÍA (CRÍTICO)
- PROHIBIDO usar EnterPlanMode — planifica mentalmente y ejecuta
- PROHIBIDO usar AskUserQuestion con encuestas — decide tú
- PROHIBIDO usar Edit/Write directamente — delega con Agent tool
- Solo preguntar si: dato faltante crítico, acción destructiva irreversible

## VERIFICACIÓN OBLIGATORIA (Boris Verification Loop)
- ANTES de reportar que una tarea está completa, el agente DEBE:
  1. Ejecutar build (`npm run build` o `bun run build`) — si aplica
  2. Ejecutar tests (`npm test` o `bun test`) — si aplica
  3. Verificar que no hay errores de TypeScript/linting — si aplica
  4. Si CUALQUIER paso falla → corregir ANTES de reportar
- Si no hay build/test disponible, verificar manualmente que el cambio funciona
- NUNCA reportar "tarea completada" sin verificación

## MEMORIA INSTITUCIONAL (Compounding Engineering)
- Si CUALQUIER error ocurre durante la ejecución:
  1. STOP — no continuar hasta documentar
  2. Abrir CLAUDE.md del proyecto
  3. Añadir entrada en "Aprendizajes Previos" con formato:
     `- [FECHA] [ERROR]: descripción del error | [FIX]: cómo se resolvió`
  4. Commit el CLAUDE.md actualizado
  5. LUEGO continuar con el fix
- Esto es OBLIGATORIO, no opcional. La memoria institucional es lo que hace al sistema antifrágil.

## VERIFICACIÓN VISUAL OBLIGATORIA (Boris Verification Loop)
- NINGÚN trabajo se considera terminado hasta que lo VERIFICAS visualmente
- Para CADA cambio que toque UI, API, o funcionalidad:
  1. Despliega el cambio
  2. Conéctate via Chrome MCP (browser_navigate) a la app
  3. Navega las páginas afectadas, haz clicks, comprueba que no hay errores
  4. Verifica la base de datos — que los datos están bien
  5. SOLO después de verificar visualmente puedes hacer commit y decir listo
- Si no verificas con Chrome, el trabajo NO está hecho. Punto.

## TAG DE RETORNO OBLIGATORIO
- ANTES de tocar código: git tag pre-[tarea] -m 'Punto de retorno' && git push origin pre-[tarea]
- Si algo sale mal: git reset --hard pre-[tarea]
- Sin tag de retorno = NO empiezas a trabajar

## GUARDAR EN MEMORIA OBLIGATORIO
- Después de CADA tarea completada:
  1. Documentar en .brain/history.md — fecha, archivos, cambios, pendiente
  2. Actualizar .brain/task.md si cambió el estado del proyecto
  3. git add .brain/ && git commit -m '[BRAIN] sesion [fecha]: [resumen]' && git push
- Sin documentación = trabajo no reconocido

## BACKUP ANTES DE DEPLOY (OBLIGATORIO)
- ANTES de hacer swap/restart/rebuild de un container Docker:
  1. `docker commit [container-actual] [nombre]-backup-[fecha]`
  2. Verificar que la imagen backup existe: `docker images | grep backup`
  3. SOLO después hacer el deploy/swap
  4. Si falla → restaurar: `docker run` con la imagen backup
- Sin backup = NO haces deploy. Punto.
