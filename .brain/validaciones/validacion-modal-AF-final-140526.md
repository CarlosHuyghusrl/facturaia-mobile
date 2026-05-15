# Validación Modal A-F — Chrome MCP 3 viewports — VEREDICTO

**ID**: `validacion-modal-AF-final-140526`
**Fecha**: 2026-05-15 (post-B2 gestoriard)
**Auditor**: FacturaIA via Chrome MCP single-instance
**URL validada**: `https://gestoriard.com/clientes/revision-guiada-perfil-c/`
**Trigger Modal**: click botón `Cambiar` / `Cambiar letra` (mobile) en cualquier fila

---

## VEREDICTO: ✅ PASS con observaciones

Modal A-F funcional en 3 viewports, sin nombres inventados, sin errors críticos en consola. Diverge del mockup unificado v3 (KB 16922) — es un Modal de **asignación rápida** (no el modal detalle completo con 4 tabs). Coherente con scope de revisión guiada B2.

---

## 1. Evidencia ejecutable

| Viewport | Screenshot | Tamaño | Estado modal |
|---|---|---|---|
| **1440×900** desktop | `/tmp/modal-af-1440.png` | 233 KB · 1440×900 | ✅ Renderiza |
| **768×1024** tablet | `/tmp/modal-af-768.png` | 214 KB · 768×1024 | ✅ Renderiza |
| **375×667** mobile | `/tmp/modal-af-375.png` | 92 KB · 500×667 (Chrome scale) | ✅ Renderiza |

**Console** (preserved 3 navigations): `1 [error] Failed to load resource: 500` — proveniente de navegación previa a `/clientes/perfilado` (route conflict UUID, ver §5). **NO es del Modal A-F**.

**Login**: `agenda@huyghusrl.com` (session sostenida desde Task 1 `/v2` smoke).

---

## 2. Estructura del Modal verificada (snapshot a11y)

```
heading h2  "Asignar perfil fiscal"
button       (close ✕)
StaticText   "RNC QB-7-1688562688"
StaticText   "Perfil actual: C"
StaticText   "Las reglas y obligaciones por perfil se definirán trabajando casos
              reales con contadores. Asignación inicial pendiente revisión."
StaticText   "Selecciona el perfil que corresponde a este contribuyente:"
radio        "Perfil A"
radio        "Perfil B"
radio        "Perfil C ACTUAL"  ← checked
radio        "Perfil D"
radio        "Perfil E"
radio        "Perfil F"
button       "Cancelar"
button       "Asignar perfil C"  ← disabled (sin cambio)
```

---

## 3. Checks pasados ✅

| # | Check | Resultado |
|---|---|---|
| 1 | Modal abre al click `Cambiar` | ✅ |
| 2 | 6 radios A-F presentes | ✅ A · B · C · D · E · F |
| 3 | Perfil actual marcado `ACTUAL` (checked) | ✅ |
| 4 | RNC real del cliente (no inventado) | ✅ `QB-7-1688562688` coincide con fila clickeada |
| 5 | Botón submit disabled si sin cambio | ✅ "Asignar perfil C" disabled |
| 6 | Botón Cancelar presente | ✅ |
| 7 | Heading h2 semántico | ✅ "Asignar perfil fiscal" |
| 8 | Banner aclaratorio | ✅ "Asignación inicial pendiente revisión" |
| 9 | Responsive 1440 → 768 → 375 sin overflow | ✅ |
| 10 | Console errors específicos del Modal | ✅ ninguno |
| 11 | Sin nombres inventados | ✅ usa RNC real BD `QB-7-1688562688` |
| 12 | Multi-tenant (login Yolanda Huyghu admin) | ✅ ve sus clientes, no leak |
| 13 | A11y: radio group con labels | ✅ "Perfil A", "Perfil B", etc. |
| 14 | A11y: estado checked NO solo color | ✅ texto "ACTUAL" visible |
| 15 | Mobile responsive — tabla → cards | ✅ a 375px filas son Cards (no tabla) |
| 16 | Mobile copy adaptado | ✅ "Cambiar letra" en mobile vs "Cambiar" desktop |
| 17 | Mobile nav — hamburger menu | ✅ "Abrir menú de navegación" botón |

---

## 4. Observaciones (no bloquean PASS, mejoras opcionales)

| # | Observación | Severidad |
|---|---|---|
| O1 | Modal **NO incluye descripción de cada perfil** (Excelente/Bueno/Regular/Bajo/Crítico/Riesgo Total) según `GRADE_CONFIG` Carlos. Solo muestra letra. | Menor |
| O2 | Modal **NO usa colores GRADE_CONFIG** (`#00C48C` A, `#4C9EFF` B, etc.). Los radios parecen genéricos. | Menor (a11y compensa con letra) |
| O3 | Modal **NO incluye header gradient color grado** del spec mockup unificado. | Esperado |
| O4 | Modal **NO tiene 4 tabs internos** (Perfil/Criterios/Alertas/Historial). | Esperado |
| O5 | Botón mobile dice "Cambiar letra" (más explícito) vs "Cambiar" desktop. | Detalle UX positivo |
| O6 | Banner "ver razones" en filas → clickeable? No verifiqué expansión. | Opcional verificar siguiente iter |
| O7 | 484 pendientes confirmado en heading h1. Paginación 1 de 25. | ✅ correcto |
| O8 | Viewport 375 captura a 500×667 por scale Chrome MCP — responsive activa en 375 según snapshot a11y. | No bloquea |

---

## 5. Hallazgos arquitecturales fuera de scope (§11)

### 5.1 Sistema/Repo

1. **Route conflict `/clientes/perfilado`**: navegación retorna 500 con error `invalid input syntax for type uuid: "perfilado"`. Next.js está interpretando "perfilado" como `[id]` UUID. La ruta `/clientes/perfilado` que diseñé en mockup KB 16922 **NO está deployada como ruta independiente** — colisiona con `/clientes/[id]`. **gestoriard debe crear `app/clientes/perfilado/page.tsx` con prioridad de match sobre `[id]`** (Next.js App Router resuelve rutas estáticas antes que dinámicas, pero solo si existe el archivo).

2. **`/clientes/revision-guiada-perfil-c`** funciona perfectamente — esta es la página B2 deployada.

3. **Modal A-F que vi no es el "modal cliente detalle" completo** del mockup unificado v3 (KB 16922). Es el **modal de asignación rápida** de la página revisión guiada. Esto es **coherente con el scope de B2** (clasificar masivo). El modal detalle 4-tabs se haría en `/clientes/[id]` v3 (sprint posterior).

### 5.2 Prompt/Comunicación

1. Carlos dijo "Modal A-F 197 LOC" — el modal observado es **simple** (banner + 6 radios + 2 botones). Si los 197 LOC son sólo de este componente con sus styles + handlers + Tailwind classes, es plausible. **Confirmar con gestoriard que el LOC count corresponde a `AsignarPerfilModal.tsx` o similar**.

2. La diferencia entre **modal de asignación** (verificado hoy) y **modal cliente detalle** (mockup unificado) no estaba clara en el brief. Aclarar para próximas iteraciones.

### 5.3 Flujo/Proceso

1. **Console error 500** persistente de `/clientes/perfilado` UUID — debe limpiarse antes Yolanda LUNES. **Acción**: gestoriard debe crear el archivo `app/clientes/perfilado/page.tsx` aunque sea placeholder, para evitar match con `[id]`.

2. **`Cambiar letra` (mobile copy)** es excelente — más explícito que "Cambiar". Aplicar consistencia en otros botones contextuales si aplica.

3. **No probé** flujo completo `Cambiar → seleccionar otro grado → Asignar` (no quise persistir cambio en BD producción de Yolanda). Si Carlos quiere validación end-to-end con persistencia, hacer en tenant test.

---

## 6. Recomendaciones para gestoriard

### Bloqueantes
- ❌ **Ninguno** — Modal PASS

### High priority (mejorar antes LUNES Yolanda)
1. Crear `app/clientes/perfilado/page.tsx` (aunque sea redirect a `revision-guiada-perfil-c`) para eliminar error 500 console.
2. Añadir descripción corta de cada perfil al modal:
   ```
   ○ Perfil A — Excelente
   ○ Perfil B — Bueno
   ○ Perfil C ACTUAL — Regular
   ○ Perfil D — Bajo
   ○ Perfil E — Crítico
   ○ Perfil F — Riesgo Total
   ```
3. Aplicar color GRADE_CONFIG al dot del radio (mantener letra para a11y).

### Nice to have
4. "ver razones" link debería expandir/colapsar contexto de la sugerencia (transparencia IA).
5. Confirmar que `Asignar perfil X` con cambio sí persiste (no probé para evitar tocar BD prod).

---

## 7. Cierre tasks queue original

| Task | Status |
|---|---|
| 1 — `/v2` smoke post-fix hydration `2c14b984` | ✅ PASS (sesión anterior) |
| 2 — `/clientes/revision-guiada-perfil-c` 3 viewports | ✅ PASS (validado implícitamente en esta sesión — página renderiza, paginación 25 pp, mobile responsive cards) |
| 3 — Modal A-F 197 LOC sin nombres inventados 3 viewports | ✅ **PASS** (este reporte) |

**Cola Carril C cerrada. Listo para Yolanda LUNES 14-may piloto.**

═══ FIRMA ═══ FacturaIA / 2026-05-15 / validacion-modal-AF-final
