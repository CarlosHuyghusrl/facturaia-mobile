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

---
