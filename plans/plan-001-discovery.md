## Metadata
- ID: plan-001-discovery
- Proyecto: FacturaIA
- Fecha: 2026-02-14
- Tipo: DISCOVERY (solo reportar, no ejecutar nada)

## Instruccion para CLI

Necesito un reporte real del estado de este proyecto. NO hagas cambios, solo REPORTA.

### Tarea 1 [CLAUDE:agente]
**Objetivo:** Explorar el codigo fuente completo y reportar:
1. Estructura de carpetas (tree nivel 2)
2. Stack real (dependencias, package.json, go.mod, docker-compose)
3. Que funciona HOY (endpoints activos, app compilada, DB con datos)
4. Que esta roto o incompleto
5. Ultimo commit y fecha en cada repo
6. Estado de Docker containers (running, stopped, errores)

**Output esperado:** Guardar reporte en plans/results/discovery-facturia.md

### Tarea 2 [CLAUDE:agente]
**Objetivo:** Listar TODO lo que hay en la base de datos:
- Tablas, cantidad de registros por tabla
- Si hay datos reales o solo test

**Output esperado:** Agregar al mismo discovery-facturia.md

IMPORTANTE: Solo observar y reportar. Cero cambios.
