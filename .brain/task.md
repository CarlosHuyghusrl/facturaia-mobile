## Tarea actual: diag-facturaia-300326
Inicio: 2026-03-30 17:10 UTC

## Descripcion
Diagnostico critico: app Android FacturaIA se queda pensando al abrir. Investigar causa raiz, fix, y entregar APK funcional.

## Progreso
- [ ] En progreso

## Proximo paso
Planificar antes de codear.

## Progreso actual
Wave 1 completa: causa raiz = puerto 8081 bloqueado por UFW + authService sin timeout. Backend OK, auth OK, problema es firewall.

## Proximo paso
Wave 2: Abrir puerto 8081 en UFW + agregar timeout a authService.ts
