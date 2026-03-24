## Backlog de Mejoras — FacturaIA
*Generado automáticamente por discovery-pipeline. Última actualización: 2026-03-19*

---
### [HIGH] DECISION — 2026-03-19
**Resumen:** Verificación estricta de la evidencia
**Detalle:** `boris_verify` debe validar la calidad de la evidencia, rechazando cualquier vaguedad y exigiendo resultados concretos. Esto asegura la calidad del trabajo final.
**Sesión origen:** 
**ID:** disc-20260319-701
**Estado:** pendiente

---
### [HIGH] DECISION — 2026-03-19
**Resumen:** Planificación adaptativa por complejidad de tarea
**Detalle:** El proceso de planificación varía según el número de archivos involucrados (1-2, 3-10, 10+) y el tipo de tarea (ej: arquitectura nueva, integración externa).
**Sesión origen:** 
**ID:** disc-20260319-703
**Estado:** pendiente

---
### [HIGH] SUGGESTION — 2026-03-19
**Resumen:** Mejorar planes generados por IA con conocimiento local
**Detalle:** Aunque Claude o Perplexity generen un plan, el arquitecto debe revisarlo y mejorarlo activamente, aportando su conocimiento específico del código y contexto.
**Sesión origen:** 
**ID:** disc-20260319-704
**Estado:** pendiente

---
### [HIGH] DECISION — 2026-03-19
**Resumen:** Uso de Claude Web para análisis profundos y arquitectura
**Detalle:** Claude Web (via Chrome MCP) se reserva para investigación profunda, diseño de arquitectura, o cuando un problema ha fallado 3+ veces, como herramienta de escalada.
**Sesión origen:** 
**ID:** disc-20260319-705
**Estado:** pendiente

---
### [HIGH] DECISION — 2026-03-19
**Resumen:** El arquitecto NO codea, solo delega
**Detalle:** Principio fundamental: el rol del arquitecto es planificar, diseñar y delegar. La implementación se delega a subagentes (Sonnet, Teams, Ralph).
**Sesión origen:** 
**ID:** disc-20260319-706
**Estado:** pendiente

---
### [HIGH] DECISION — 2026-03-19
**Resumen:** Adopción obligatoria de TDD (Red-Green-Refactor)
**Detalle:** La Ley de Hierro de TDD es obligatoria. Cualquier código sin pruebas que fallen y luego pasen debe ser borrado y rehecho.
**Sesión origen:** 
**ID:** disc-20260319-707
**Estado:** pendiente

---
### [HIGH] DECISION — 2026-03-19
**Resumen:** Rigor en la verificación de cada cambio
**Detalle:** Está prohibido decir 'debería funcionar'. Es obligatorio confirmar cada cambio con output real, navegando la UI, haciendo curl o confirmando en BD/tests.
**Sesión origen:** 
**ID:** disc-20260319-708
**Estado:** pendiente

---
### [HIGH] DECISION — 2026-03-19
**Resumen:** Escalada definida para fallos en pipeline Boris
**Detalle:** Si el paso 3a del pipeline falla, escalar a Claude Web para un nuevo enfoque. Si falla el paso 4+, reportar directamente a Carlos.
**Sesión origen:** 
**ID:** disc-20260319-709
**Estado:** pendiente

---
### [HIGH] DECISION — 2026-03-19
**Resumen:** Integración de hook de `boris_verify` en git commit
**Detalle:** El proceso de git commit incluye un hook que verifica que `boris_verify` ha aprobado el trabajo, asegurando que solo se comita código validado.
**Sesión origen:** 
**ID:** disc-20260319-710
**Estado:** pendiente

---
### [HIGH] DECISION — 2026-03-19
**Resumen:** Cinco Leyes de Hierro del workflow (Superpowers)
**Detalle:** Principios fundamentales: No implementar sin diseño, no arreglar sin causa raíz, TDD, no 'listo' sin evidencia, mejorar todo plan.
**Sesión origen:** 
**ID:** disc-20260319-712
**Estado:** pendiente

---
### [HIGH] DECISION — 2026-03-19
**Resumen:** Routing de modelos de IA basado en función
**Detalle:** Se han asignado modelos de IA específicos para cada tarea: Opus (arquitectos), Sonnet (sub-agentes), DeepSeek/Gemini (monitoring), Perplexity (búsquedas), Claude Web (arquitectura/estrategia).
**Sesión origen:** 
**ID:** disc-20260319-713
**Estado:** pendiente

---
### [HIGH] DECISION — 2026-03-19
**Resumen:** Anti-patrón: Arquitecto escribiendo código directamente
**Detalle:** Es una prohibición explícita que el arquitecto escriba código directamente; su rol es de diseño y delegación.
**Sesión origen:** 
**ID:** disc-20260319-714
**Estado:** pendiente

---
### [HIGH] DECISION — 2026-03-19
**Resumen:** Anti-patrón: Saltar planificación para tareas complejas
**Detalle:** Está prohibido saltarse la fase de planificación para cualquier tarea que involucre 3 o más archivos, o que sea compleja.
**Sesión origen:** 
**ID:** disc-20260319-715
**Estado:** pendiente

---
### [HIGH] DECISION — 2026-03-21
**Resumen:** El arquitecto delega la implementación y no escribe código directamente, enfocándose en diseño y planificación.
**Detalle:** El rol del arquitecto es 'DELEGAR -- el arquitecto NO codea'. 'Arquitecto escribiendo codigo directamente' es un anti-patrón prohibido. La ejecución es responsabilidad de sub-agentes.
**Sesión origen:** 
**ID:** disc-20260321-783
**Estado:** pendiente

---
### [HIGH] DECISION — 2026-03-21
**Resumen:** Estricta política de planificación y verificación con evidencia concreta para cada cambio.
**Detalle:** Se prohíbe implementar sin diseño ('NO IMPLEMENTAR SIN DISENO') y afirmar 'listo' sin evidencia ('NO "LISTO" SIN EVIDENCIA'). Los planes deben incluir cómo verificar CADA cambio y los commits requieren aprobación de `boris_verify`.
**Sesión origen:** 
**ID:** disc-20260321-784
**Estado:** pendiente

---
### [HIGH] DECISION — 2026-03-21
**Resumen:** Estrategia definida para la asignación y uso de modelos de IA según la tarea específica.
**Detalle:** Opus 4.6 para planificación/diseño, Sonnet 4.6 para implementación (sub-agentes), DeepSeek/Gemini/Qwen para monitoring (nunca Claude), Gemini para análisis de documentos grandes, Perplexity para búsquedas, y Claude Web para arquitectura/problemas complejos.
**Sesión origen:** 
**ID:** disc-20260321-785
**Estado:** pendiente

---
### [HIGH] DECISION — 2026-03-21
**Resumen:** Ruta de escalada a Claude Web para problemas complejos, diseños nuevos o fallos recurrentes.
**Detalle:** Se consulta Claude Web (via Chrome MCP) para proyectos nuevos, +10 archivos, arquitectura nueva, integración externa, problemas que fallaron 3+ veces, o cuando falla la verificación en el Paso 6 del pipeline Boris.
**Sesión origen:** 
**ID:** disc-20260321-786
**Estado:** pendiente

---
### [HIGH] ERROR — 2026-03-21
**Resumen:** Fallo `git pull` por cambios no commiteados (node_modules y CLAUDE.md).
**Detalle:** Un `git pull` falló debido a cambios unstaged en `node_modules` (archivos lock) y `CLAUDE.md`. Indica un estado inconsistente del repositorio, aunque no fue crítico para la tarea actual.
**Sesión origen:** 
**ID:** disc-20260321-790
**Estado:** pendiente

---
### [HIGH] DISCOVERY — 2026-03-21
**Resumen:** Estado de tarea completada en Knowledge Base no se actualizó automáticamente.
**Detalle:** La tarea `task-facturaia-context-mode` fue marcada como `done` en Boris y registrada, pero su `STATUS` en el Knowledge Base original permaneció `pending`, llevando a una re-ejecución.
**Sesión origen:** 
**ID:** disc-20260321-791
**Estado:** pendiente

---
### [HIGH] SUGGESTION — 2026-03-21
**Resumen:** Implementar actualización automática de STATUS de tareas en Knowledge Base.
**Detalle:** Para evitar tareas duplicadas y mantener la fiabilidad del Knowledge Base, se recomienda implementar un mecanismo que actualice el `STATUS` de las tareas a `done` automáticamente al completarse.
**Sesión origen:** 
**ID:** disc-20260321-792
**Estado:** pendiente

---
### [HIGH] DISCOVERY — 2026-03-21
**Resumen:** Herramientas MCP vitales son 'deferred' y no operan sin carga explícita.
**Detalle:** Sin la carga inicial de herramientas, `boris_start_task`, `boris_verify`, `boris_register_done` y otras tools MCP permanecen deferred. Esto bloquearía commits vía el hook PreToolUse.
**Sesión origen:** 
**ID:** disc-20260321-813
**Estado:** pendiente

---
### [HIGH] DECISION — 2026-03-21
**Resumen:** Definido fallback manual para recuperación de estado de sesión.
**Detalle:** Si `mcp__boris__boris_get_state` falla, el estado de sesión (tarea activa, última sesión, tareas completadas) se recupera manualmente leyendo `.brain/task.md`, `.brain/session-state.md`, y `.brain/done-registry.md`.
**Sesión origen:** 
**ID:** disc-20260321-814
**Estado:** pendiente

---
### [HIGH] DECISION — 2026-03-21
**Resumen:** Establecida lógica de priorización y ejecución de tareas pendientes.
**Detalle:** Las tareas pendientes (query: 'STATUS: pending', category: 'task', project: 'facturaia', filtradas por 'TO: facturaia' o 'TO: all') se clasifican en alta (ejecución inmediata con `boris_start_task`), media (preguntar a Carlos), o baja (solo informar).
**Sesión origen:** 
**ID:** disc-20260321-815
**Estado:** pendiente

---
### [HIGH] DISCOVERY — 2026-03-21
**Resumen:** Identificadas causas comunes de falla de Boris MCP y pasos de diagnóstico.
**Detalle:** Si Boris no responde, se debe verificar: `mcp__boris__boris_get_state` en la lista `allow` de `.claude/settings.local.json`, `"enableAllProjectMcpServers": true`, y la configuración de Boris en `~/.claude/mcp.json`.
**Sesión origen:** 
**ID:** disc-20260321-817
**Estado:** pendiente

---
### [HIGH] DECISION — 2026-03-21
**Resumen:** Documentado el stack tecnológico principal del proyecto FacturaIA.
**Detalle:** **App**: React Native 0.76.9 + Expo 52 + TypeScript. **OCR**: Go `facturaia-ocr` v2.7.0 → Gemini Vision API. **BD**: PostgreSQL 16 + PgBouncer + MinIO. **Build**: `gradlew assembleRelease`. **Test**: Expo Go / EAS build. **Automatización**: n8n.
**Sesión origen:** 
**ID:** disc-20260321-818
**Estado:** pendiente

---
### [HIGH] DECISION — 2026-03-21
**Resumen:** Establecida la regla de no repetición de tareas en el `done-registry` de Boris.
**Detalle:** Si una tarea ya está registrada en el `done-registry` de Boris, se considerará completada y no se repetirá para evitar duplicidad de trabajo.
**Sesión origen:** 
**ID:** disc-20260321-819
**Estado:** pendiente

---
### [HIGH] DECISION — 2026-03-21
**Resumen:** Implementada política de 'no commit sin `boris_verify`' a través de un hook.
**Detalle:** El hook PreToolUse está configurado para bloquear cualquier intento de commit si la herramienta `boris_verify` no ha sido utilizada previamente, asegurando la validación del trabajo.
**Sesión origen:** 
**ID:** disc-20260321-820
**Estado:** pendiente

---
### [HIGH] DECISION — 2026-03-21
**Resumen:** Requisito de evidencia concreta para cambios en lógica OCR o multi-tenant.
**Detalle:** Cualquier modificación en la lógica del OCR o en la arquitectura multi-tenant requiere de evidencia concreta para ser implementada, garantizando la estabilidad y fiabilidad de estas áreas críticas.
**Sesión origen:** 
**ID:** disc-20260321-821
**Estado:** pendiente

---
### [HIGH] DECISION — 2026-03-21
**Resumen:** Definido el rol del arquitecto como no-codificador directo, delegando a subagentes.
**Detalle:** El arquitecto (Claude) no debe escribir código directamente, sino delegar estas tareas a subagentes como Sonnet, enfocándose en la supervisión y diseño arquitectónico.
**Sesión origen:** 
**ID:** disc-20260321-822
**Estado:** pendiente

---
### [MEDIUM] DECISION — 2026-03-19
**Resumen:** Registro de fallos para aprendizaje futuro
**Detalle:** Utilizar `boris_register_failed` para documentar los enfoques que no funcionaron, evitando la repetición de errores y promoviendo el aprendizaje.
**Sesión origen:** 
**ID:** disc-20260319-702
**Estado:** pendiente

---
### [MEDIUM] DECISION — 2026-03-19
**Resumen:** Mantenimiento del documento `CLAUDE.md` para errores nuevos
**Detalle:** Si se descubren nuevos errores durante el proceso, `CLAUDE.md` debe ser actualizado para reflejar este conocimiento y evitar repeticiones futuras.
**Sesión origen:** 
**ID:** disc-20260319-711
**Estado:** pendiente

---
### [MEDIUM] DECISION — 2026-03-21
**Resumen:** Mecanismo anti-repetición para evitar la ejecución de tareas ya completadas.
**Detalle:** `boris_start_task` verifica el `done-registry`. Si una tarea ya está marcada como completada, se detiene la ejecución. 'Repetir tarea del done-registry' es un anti-patrón.
**Sesión origen:** 
**ID:** disc-20260321-787
**Estado:** pendiente

---
### [MEDIUM] DECISION — 2026-03-21
**Resumen:** Metodología obligatoria de 4 fases para la resolución de bugs, iniciando por el análisis de causa raíz.
**Detalle:** La 'Ley de Hierro' de 'NO ARREGLAR SIN CAUSA RAIZ' requiere un proceso de 4 fases: root cause -> pattern -> hypothesis -> fix.
**Sesión origen:** 
**ID:** disc-20260321-788
**Estado:** pendiente

---
### [MEDIUM] DISCOVERY — 2026-03-21
**Resumen:** Inconsistencia en informe de tareas pendientes FacturaIA.
**Detalle:** Claude indicó inicialmente no haber tareas pendientes en KB para FacturaIA, pero una búsqueda específica (`kb_search query="pending" project="facturaia"`) reveló la tarea `task-facturaia-context-mode`.
**Sesión origen:** 
**ID:** disc-20260321-789
**Estado:** pendiente

---
### [MEDIUM] DECISION — 2026-03-21
**Resumen:** Implementado monitoreo de estado Git local y alertas por cambios sin commit.
**Detalle:** Se reportará si hay archivos sin commit. Se emitirá una advertencia si los archivos permanecen sin commit por más de 30 minutos.
**Sesión origen:** 
**ID:** disc-20260321-816
**Estado:** pendiente

---
---

---
