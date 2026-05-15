# Plan de Ejecución FINAL — Perfilado A-F (aplicando skills)

**ID**: `plan-ejecucion-FINAL-perfilado-AF-140526`
**Fecha**: 2026-05-14
**Autor**: FacturaIA (rol diseñadora SaaS)
**Destino**: gestoriard implementa siguiendo este plan
**Mockup oficial**: KB 16924 (propuesta unificada FINAL)

---

## Filosofía del plan

> "Antes de la primera línea de código, todo el diseño debe estar claro."

Este plan aplica **9 skills de diseño** en 4 fases. Las **FASE 0 y FASE 1 las hago YO** (FacturaIA) — generan los outputs (tokens, critique, a11y audit, UX states, component specs). **gestoriard solo entra en FASE 2** con todo decidido. **FASE 3 vuelve a mí** para verificación final.

```
FASE 0 — Design Foundation    [YO]  outputs: tokens / critique / a11y / UX states
FASE 1 — Component Specs       [YO]  outputs: TSX specs por componente
FASE 2 — Implementación        [GES] gestoriard codifica en 7 waves
FASE 3 — Verificación final    [YO]  Chrome MCP 3 viewports + multi-tenant + a11y
```

---

## FASE 0 — Design Foundation (skills aplicados HOY)

| Skill | Aplicación | Output |
|---|---|---|
| `design-system` | Tokens completos (colores, type, spacing, radius, shadow, motion) | `.brain/design/tokens.json` |
| `design-critique` | Critique nivel Apple Design Director sobre Ejemplo #3 HTML | `.brain/design/critique-ejemplo-3.md` |
| `design-accessibility` | Auditoría WCAG 2.2 AA contraste matemático + estados focus + a11y patterns | `.brain/design/a11y-audit-contraste.md` |
| `design-usability` | Catálogo de **todos los estados** (empty / loading / error / success / partial) por vista | `.brain/design/ux-states-catalog.md` |

**Gate FASE 0**: tokens JSON validados + critique con score ≥ 75/100 + a11y AA todos los pares + UX states cubren los 15 escenarios.

---

## FASE 1 — Component Specs (skills aplicados HOY)

| Skill | Aplicación | Output |
|---|---|---|
| `composition-patterns` | Arquitectura compound/context/render-props por componente | dentro de cada spec |
| `design-to-code` | TSX skeleton con props API + variants + shadcn/ui mapping | `.brain/design/component-specs/<name>.md` |
| `react-best-practices` | Guidelines perf (Server Components vs Client, memo, suspense) | dentro de cada spec |

**Specs generados** (FASE 1 entrega 5 componentes críticos hoy):

1. `GradeBadge.md` — base reutilizable en toda la app
2. `CambiarPerfilPopover.md` — el componente MÁS complejo (220 LOC)
3. `StageTracker.md` — 5 dots ciclo mes
4. `TriageCard.md` — Revisión Guiada 484
5. `KpiBar.md` — Stripe-style 4 metric cards

**Specs restantes** se generan en wave posterior cuando gestoriard llegue a esos componentes (just-in-time).

**Gate FASE 1**: 5 specs aprobados + props API consistente + sin colisiones de naming.

---

## FASE 2 — Implementación gestoriard (7 waves)

| Wave | Scope | LOC | Dependencias | Skill gate |
|---|---|---|---|---|
| **W1** | Foundation: BD migration + tokens CSS + `<PerfiladoThemeWrapper>` + `GradeBadge.tsx` | 280 | — | `design-system` validación tokens |
| **W2** | Listado `/clientes/perfilado` page + table + cards + KPI bar + pills + pagination | 750 | W1 | `design-responsive` 3 viewports |
| **W3** | Ficha `/clientes/[id]` 3 cols + StageTracker + AiSummary + ColAcerca/Actividad/Obligaciones | 990 | W1 | `design-usability` empty/error states |
| **W4** | `CambiarPerfilPopover.tsx` + `DiffPreview.tsx` + endpoint preview-diff | 600 | W3 | `composition-patterns` polymorphic anchor |
| **W5** | Revisión Guiada 484 expand: TriageCard + AiSugerencia + DecisionGrid + ProgressBar + endpoint sugerencia-ai (Gemini Flash) | 770 | W4 | `design-accessibility` keyboard nav |
| **W6** | Global: `CommandPalette.tsx` ⌘K + `KeyboardShortcuts.tsx` provider + integración 3 vistas | 360 | W5 | `react-best-practices` event listeners cleanup |
| **W7** | Responsive 768 tablet + a11y final + tests + Chrome MCP audit pre-prod | 250 | W6 | `chrome-mcp` 3 viewports + multi-tenant |

**Total FASE 2**: ~4,000 LOC en 7 waves.

**Gate entre waves**: build pasa (tsc + eslint) + componentes renderizan en Chrome MCP sin errores console + commit + push.

### Reglas de ejecución gestoriard

1. **NO empezar una wave sin que el spec del componente esté firmado** (FASE 1).
2. **NO mezclar waves**. Una wave = un PR. Verificación antes de la siguiente.
3. **Cualquier desviación del spec** → A2A FacturaIA antes de implementar.
4. **Server Components por defecto** — `'use client'` solo si necesita state/effects/event listeners.
5. **Multi-tenant en cada API route** — `tenant_id` desde session middleware, NUNCA query param (sin excepciones).

---

## FASE 3 — Verificación final (mi audit Chrome MCP)

| Skill | Check |
|---|---|
| `chrome-mcp` | Screenshots 1440/768/375 · console errors=0 · network requests sanos · multi-tenant verify (Yolanda vs otro tenant) |
| `web-design-guidelines` | Review UI final — semantic HTML, accessible names, ARIA correcto |
| `design-accessibility` | axe-core scan ≥ 95 score · keyboard nav completo · screen reader test (NVDA/VoiceOver) |
| `design-critique` | Score final /100 · si < 75 → fix list → wave correctiva |
| `web-quality` | Checklist Calidad Web FacturaIA completo · performance LCP/CLS/INP · bundle size |

**Gate FASE 3 = PROD-READY**:
- 15 checks Chrome MCP PASS (ver KB 16924 §14)
- axe-core ≥ 95
- LCP < 2.5s con 503 clientes paginados
- 0 console errors
- Multi-tenant verificado con 2+ tenants
- Brand GestoríaRD intacto fuera de las 3 vistas dark-scoped

---

## Cronograma realista

| Día | Actividad | Responsable |
|---|---|---|
| **D0** (hoy) | FASE 0 + FASE 1 — outputs design foundation + 5 component specs | FacturaIA |
| **D1** | gestoriard lee specs · pregunta dudas · firma APROBADO | Carlos + gestoriard |
| **D2-D3** | Wave 1: Foundation (BD + tokens + GradeBadge) | gestoriard |
| **D4-D6** | Wave 2: Listado `/clientes/perfilado` | gestoriard |
| **D7-D9** | Wave 3: Ficha `/clientes/[id]` 3 cols | gestoriard |
| **D10-D11** | Wave 4: Popover + Diff Preview | gestoriard |
| **D12-D14** | Wave 5: Revisión Guiada triage AI | gestoriard |
| **D15-D16** | Wave 6: ⌘K + shortcuts | gestoriard |
| **D17** | Wave 7: 768 tablet + a11y polish | gestoriard |
| **D18** | FASE 3 — audit Chrome MCP + score final | FacturaIA |
| **D19** | Yolanda Huyghu prueba en piloto real | Yolanda |

**Si Yolanda LUNES es D7**: priorizar **W1 + W2 + parche W3 mínimo** (header + obligaciones del mes) → MVP perfilado en 6 días. Resto del scope continúa después.

---

## Skills aplicados (mapa)

| Skill | Fase | Output |
|---|---|---|
| `design-system` | 0 | `tokens.json` |
| `design-critique` | 0 + 3 | `critique-ejemplo-3.md` + score final |
| `design-accessibility` | 0 + 3 | `a11y-audit-contraste.md` + axe-core scan |
| `design-usability` | 0 + 2 | `ux-states-catalog.md` + states implementados por wave |
| `composition-patterns` | 1 | dentro de specs (compound/context) |
| `design-to-code` | 1 | 5 component specs TSX skeleton |
| `react-best-practices` | 1 + 2 | guidelines perf dentro de specs + Server Components default |
| `design-responsive` | 2 | breakpoints 1440/768/375 en waves W2-W7 |
| `chrome-mcp` | 3 | screenshots + console + multi-tenant verify |
| `web-design-guidelines` | 3 | review final UI compliance |
| `web-quality` | 3 | checklist FacturaIA performance + bundle |

---

## Anti-patterns prohibidos (gestoriard)

1. ❌ **Empezar wave sin spec firmado**
2. ❌ **`'use client'` en TODOS los componentes** (default Server, opt-in Client)
3. ❌ **Tokens hardcoded** (`#00C48C` directo en JSX) → usar siempre `var(--grade-a)`
4. ❌ **Multi-tenant via query param** → siempre session middleware
5. ❌ **Color solo para distinguir grado** → siempre letra Mono visible
6. ❌ **Touch target < 44×44 mobile** → bloquea a11y
7. ❌ **Popover full-screen en desktop** (debe ser anclado 480px)
8. ❌ **Modal centrado para cambiar perfil** (decidido: POPOVER inline)
9. ❌ **Hardcoded mock 8 clientes** → siempre `/api/v2/clientes/perfilado` con 503 BD real
10. ❌ **Atajos sin liberación en unmount** → cleanup `removeEventListener`

---

## Outputs entregados con este plan

```
.brain/design/
├── tokens.json                              FASE 0 — design-system
├── critique-ejemplo-3.md                    FASE 0 — design-critique
├── a11y-audit-contraste.md                  FASE 0 — design-accessibility
├── ux-states-catalog.md                     FASE 0 — design-usability
└── component-specs/                         FASE 1 — design-to-code + composition-patterns
    ├── GradeBadge.md
    ├── CambiarPerfilPopover.md
    ├── StageTracker.md
    ├── TriageCard.md
    └── KpiBar.md

.brain/planes/
└── plan-ejecucion-FINAL-perfilado-AF-140526.md   ← este archivo
```

═══ FIRMA ═══ FacturaIA / 2026-05-14 / plan ejecución aplicando 9 skills
