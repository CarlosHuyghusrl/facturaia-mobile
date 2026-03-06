# EL FLUJO DE BORIS (Macro de Invocación)

Cuando el usuario pida ejecutar una tarea, sigue este flujo exacto:

1. **Planificar**: Usa el sub-agente `code-architect` para crear un plan arquitectónico paso a paso.
2. **Ejecutar**: Delega la implementación al Agent tool con sub-agentes general-purpose. NUNCA escribas código directamente.
3. **Verificar**: Usa `verify-app` para correr tests. Usa `build-validator` para validar compilación.
4. **Simplificar**: Si el código es complejo, usa `code-simplifier` para limpiarlo.
5. **Documentar**: Si hubo CUALQUIER error o fallo durante el proceso, actualiza la sección "Aprendizajes Previos" en CLAUDE.md con el error y su solución.

**REGLA DE ORO**: El código NO se da por terminado hasta que `verify-app` lo aprueba.
