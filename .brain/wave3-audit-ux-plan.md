# Wave 3 — Auditoría UX Completa APK FacturaIA v2.6.7

## Objetivo

Mapear TODAS las pantallas de la APK + identificar F5 (opciones ocultas), F6 (pantallas sin resultados), F7 (errores sobre elementos inexistentes) y bugs adicionales. Reportar lista priorizada para Wave 4.

## Metodología

Por cada pantalla, catalogar:

1. **Path src/screens/X.tsx** + ruta navigation
2. **Inputs**: campos editables, botones, gestures
3. **Outputs**: datos mostrados, transitions, side effects
4. **Estados**: loading, success, empty, error, partial
5. **Errores posibles**: catch handlers, validations, network fails
6. **Botones/opciones**: cada uno funciona vs roto/desactivado/sin destino
7. **Estados vacíos**: cuando data=[], ¿guía clara o pantalla muda?
8. **Dead-ends**: usuario llega y no sabe qué hacer
9. **Referencias a inexistente**: features removidas que dejaron labels

## Pantallas a auditar (inventario verificado)

| # | Path | Tamaño | Auditor |
|---|---|---|---|
| 1 | src/screens/LoginScreen.tsx | 7K | sub-agent A |
| 2 | src/screens/HomeScreen.tsx | 17K | sub-agent A |
| 3 | src/screens/CameraScreen.tsx | 27K (incluye success state + preview) | sub-agent A |
| 4 | src/screens/InvoiceReviewScreen.tsx | 47K (incluye Modal imagen + Reportar bug embedded) | sub-agent B |
| 5 | src/screens/InvoiceDetailScreen.tsx | 17K (solo lectura) | sub-agent B |

Total ~115K (~3500 LOC). NO existen SettingsScreen ni InvoiceListScreen separados — todo en HomeScreen.

## Sub-agents dispatch plan

**Wave 3.A (paralelo, 2 workers Sonnet):**
- Worker A: Login + Home + Camera (~51K)
- Worker B: Review + Detail (~64K, mayor por incluir flows Modal imagen + Reportar bug + Re-procesar OCR)

Cada worker entrega:
```
## Pantalla X
- Path: src/screens/X.tsx
- Líneas totales: N
- Hallazgos (numerados):
  1. [TIPO=F5|F6|F7|otro] línea Y descripción
  2. ...
- Severidad: BAJA | MEDIA | ALTA | CRÍTICA
- Repro: cómo el usuario llega al bug
```

**Wave 3.B (síntesis):**
- Consolidar 3 reportes en tabla priorizada
- Asignar SEV CRITICAL/HIGH/MEDIUM/LOW
- Mapear a fixes concretos (file:line + diff conceptual)
- Output: `wave3-audit-findings.md` para Carlos OK antes Wave 4

## Reglas anti-scope-creep

- NO implementar fixes en Wave 3 — solo auditar
- NO tocar pantallas QuickBooks (NI TOCAR QB regla global)
- NO modificar BD ni endpoint (solo RN frontend)
- Auditoría debe terminar en ≤2 dispatches workers (no perpetuum mobile)
- Wave 4 fixes priorizados solo con Carlos OK explícito

## Verificación

Si la auditoría no encuentra ≥3 bugs reales en F5-F7, reportar honesto: "Carlos's percepción de 'opciones ocultas' / 'pantallas sin resultados' no se reproduce en el código actual — posible que ya estén fixed en v2.6.7 o sean side-effects de los 4 bugs Wave 2 ya resueltos. Pedir más detalle."

§4.1: no inventar bugs por completar tabla.
