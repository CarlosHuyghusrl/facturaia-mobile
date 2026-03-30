## Tarea actual: criticos-facturaia-300326
Inicio: 2026-03-30 18:40 UTC

## Descripcion
8 hallazgos criticos + 5 quick wins: eliminar codigo muerto, ProGuard ON, ABI splits, permisos, types, iOS bundleId, image quality, dev deps.

## Progreso
- [ ] En progreso

## Proximo paso
Planificar antes de codear.

## Progreso actual
Wave 1 completada (5e0d9159). Wave 2: ProGuard+ABI+shrink ya en archivos sin commit. Bug encontrado: HomeScreen.tsx importa RootStackParamList de types/invoice (no existe). Fix: cambiar a ../../App.

## Proximo paso
Delegar fix import HomeScreen + build con ProGuard a sub-agente Sonnet, verificar build exitoso, boris_verify + commit Wave 2
