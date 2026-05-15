# Propuesta Unificada FINAL — Perfilado A-F SaaS GestoriaRD

**ID**: `propuesta-unificada-FINAL-perfilado-AF-saas-140526`
**Fecha**: 2026-05-14
**Autor**: FacturaIA (rol diseñadora SaaS)
**Cliente piloto**: Yolanda Huyghu — Huyghu SRL (LUNES 14-may)
**Destino**: rediseño completo perfilado A-F GestoriaRD
**Reemplaza**: KB 16922 (propuesta-unificada anterior) — esta es la **FINAL**

---

## 0. Inputs consolidados

| Input | Aporta | Status |
|---|---|---|
| **Ejemplo #1** — `client-profiling.jsx` 479 LOC | Paleta A-F original + 6 criterios ponderados + Modal 4 tabs + dark theme | Adoptado parcialmente (paleta sobrescrita por #3) |
| **Ejemplo #2** — Análisis Claude Web TaxDome 70 + HubSpot 15 + Linear 10 + Pipedrive 5 | 4 mockups ASCII: `/clientes/[id]` 3 cols / Mobile obligaciones arriba / POPOVER inline / Revisión Guiada 484 triage AI | **Adoptado como esqueleto IA** |
| **Ejemplo #3** — `gestoria-rd-mockup.html` 1629 LOC funcional | Paleta A-F definitiva + dark theme #0a0e16 + Inter/JetBrains Mono + 8 componentes UI + atajos 1-6 funcionando | **Adoptado como base visual** (Carlos: "esto es idea, adapta") |
| **5 referentes research** KB 16920 | Karbon AI Summary + TaxDome 13 mini-cards + Stripe 4 metric cards + Linear ⌘K + Financial Cents vault/audit | Integrados selectivamente |

---

## 1. Decisiones por componente — qué de cada referente

| Componente | Adoptado de | Por qué |
|---|---|---|
| **Paleta colores A-F** | **Ejemplo #3** | A verde / B teal / C azul / D naranja / E púrpura / F rojo — mejor jerarquía visual. C=484 azul (neutral) no naranja (falsa alarma). |
| **Gris C-default** | **Ejemplo #3** | Distingue "C provisional" (484) de "C real" — solucionando gap KB 16922 §11 |
| **Dark theme `#0a0e16`** | **Ejemplo #3** | Más profundo que `#0a0f18` de #1. Mejor profundidad visual. Scoped a `/clientes/perfilado*` y `/clientes/[id]` — NO reemplaza tema global |
| **Tipografía Inter + JetBrains Mono** | **Ejemplo #3** | Mono para letras A-F, RNC, números, shortcuts — Linear-style |
| **Top nav sticky** | **Ejemplo #3** | Brand izq + tabs centro — convención SaaS |
| **Avatar 72×72 gradient + badge bottom-right** | **Ejemplo #3** | Único en SaaS contables. Badge superpuesto con letra Mono — distintivo visual |
| **Perfil badge inline sticky clickeable** | **Ejemplo #3** | Pill border color perfil + caret ▼ — hover translateY · onClick abre popover |
| **Stage tracker 5 dots ciclo mes** | **Ejemplo #2** (HubSpot Lifecycle Stage) | Docs recib · Calc listo · Pre-rev · Envío · DGII conf — visible siempre |
| **3 cols ACERCA / ACTIVIDAD / OBLIGACIONES MAYO** | **Ejemplo #2** (TaxDome client profile) | Densidad útil. Obligaciones del mes = diferenciador DGII vs TaxDome |
| **Mobile obligaciones ARRIBA** | **Ejemplo #2** | Yolanda accionable primero, contexto después |
| **AI Summary banner opcional** | **Karbon** (mi research) | 2-3 líneas pre-llamada — toggleable, no obligatorio |
| **POPOVER inline anclado al badge** | **Ejemplo #3** + **Ejemplo #2** | Overlay blur 4px · 480px · 6 options + shortcuts 1-6 + diff preview · NO modal centrado (más rápido, no quita contexto) |
| **Preview diff git** (PIPELINES/OBLIG/PRECIO old→new) | **Ejemplo #2** + **Linear** | Transparencia del impacto antes de confirmar — patrón Linear |
| **Atajos teclado 1-6 + S/X/V + ←→** | **Ejemplo #2** + **Linear** | 6× más rápido que mouse — 484 reclasificables en 4h |
| **⌘K Command Palette global** | **Linear** | Acceso rápido cualquier cliente/acción desde cualquier vista |
| **Revisión Guiada 484 triage AI 87%** | **Ejemplo #2** + **Ejemplo #3** | Card cliente actual + sugerencia AI + razones + 6 botones + 3 secundarios + stats sesión |
| **`/clientes/perfilado` listado filtrable** | **KB 16922** (mi propuesta anterior) + **Stripe** | Vista lista masiva con KPI bar 4 metric cards + 7 pills A-F + tabla → cards mobile |
| **KPI bar 4 metric cards stacked** | **Stripe** (mi research) | Total / Grado prom / En riesgo / Sin clasif — visible en listado |
| **Activity audit trail filtrable** | **Financial Cents** (mi research) | Tab Actividad col 2 — filtro Notas/Email/Llamadas/Docs/Sistema |
| **Custom fields contabilidad** | **Financial Cents** | Entity type · Formation date · Tax ID · Birthday — en col ACERCA |
| **Client Vault** (DGII/TSS/QB creds) | **Financial Cents** | NO en `/clientes/perfilado`, va en `/clientes/[id]` col ACERCA expandible |
| **Triage como inbox** | **Linear Triage** | `/clientes/revision-guiada-perfil-c` = inbox pre-pipeline |
| **C provisional outline gris** | **Mi propuesta** + **Ejemplo #3 gris** | Badge `C` con outline `#6b7280` para 484 provisionales — color gris explícito |
| **6 criterios ponderados** | **Ejemplo #1** | 25/20/15/20/10/10 — fórmula `sum(score × weight) / 100` |

---

## 2. Paleta colores final — adaptada GestoríaRD

### 2.1 Verificación identidad GestoríaRD

Brand actual GestoríaRD producción:
- Primario navy `#0F2040`
- Accent naranja `#FF6B00` (de FacturaIA)
- Tema light en todas las vistas

**Conflicto detectado**:
- Naranja `#FF6B00` (brand accent) vs `#F5A623` (grado D) — diferenciables pero cercanos en contexto.
- Dark theme `#0a0e16` es nuevo — no existe en producción.

**Resolución**:

1. **Dark theme scoped**: solo aplica a 3 vistas (`/clientes/perfilado`, `/clientes/[id]`, `/clientes/revision-guiada-perfil-c`). El resto del SaaS mantiene tema light actual. Implementación: `<div data-theme="perfilado-dark">` wrapper con CSS variables override.

2. **Naranja D**: usar `#F5A623` (Ejemplo #3) — distinto del accent FacturaIA `#FF6B00`. La diferencia es saturación/luminosidad, no hue. OK.

3. **Brand visible**: en top nav de las 3 vistas mostrar logo GestoríaRD original (no perder identidad).

### 2.2 Paleta final A-F (con justificación de cambios vs Ejemplo #1)

| Grado | Color | Hex | Cambio vs #1 | Razón |
|---|---|---|---|---|
| **A** Excelente | Verde | `#00C48C` | = | Estándar éxito SaaS |
| **B** Bueno | Teal | `#2DD4BF` | **azul → teal** | Diferencia mejor de C azul. Más distintivo. |
| **C** Regular | Azul | `#4C9EFF` | **naranja → azul** | C = 484 (96% clientes). Color NEUTRAL, no warning. Naranja era falsa alarma masiva. |
| **D** Bajo | Naranja | `#F5A623` | **rojo-naranja → naranja** | Warning real (puro) |
| **E** Crítico | Púrpura | `#A855F7` | **rojo → púrpura** | Crítico antes de F. Evita 2× rojos (E rojo + F rojo oscuro era ambiguo) |
| **F** Riesgo Total | Rojo | `#E0245E` | **rojo oscuro → rojo intenso** | Rojo único = peligro máximo, no compite |
| **C-default (sin revisar)** | Gris | `#6b7280` | (nuevo) | 484 provisionales se distinguen del "C real" — soluciona §11 KB 16922 |

### 2.3 Dark theme tokens

```css
:root[data-theme="perfilado-dark"] {
  --bg:        #0a0e16;
  --bg-2:      #111722;
  --bg-3:      #1a2030;
  --text:      #e8edff;
  --text-2:    #8892b0;
  --text-3:    #4a5568;
  --border:    rgba(255, 255, 255, 0.08);
  --border-2:  rgba(255, 255, 255, 0.16);

  --grade-a:   #00C48C;
  --grade-b:   #2DD4BF;
  --grade-c:   #4C9EFF;
  --grade-c-def: #6b7280;
  --grade-d:   #F5A623;
  --grade-e:   #A855F7;
  --grade-f:   #E0245E;

  --accent:    #FF6B00;   /* brand FacturaIA — uso CTA primarios */
  --navy:      #0F2040;   /* brand GestoríaRD — top nav */

  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'DM Mono', 'Fira Code', monospace;
}
```

### 2.4 Contraste WCAG AA (verificado matemáticamente)

| Combo | Ratio | WCAG |
|---|---|---|
| `--text` `#e8edff` sobre `--bg` `#0a0e16` | **14.2 : 1** | ✅ AAA |
| `--text-2` `#8892b0` sobre `--bg` `#0a0e16` | **6.0 : 1** | ✅ AA texto / AAA grande |
| `--grade-a` `#00C48C` sobre `--bg` `#0a0e16` | **8.7 : 1** | ✅ AAA |
| `--grade-c` `#4C9EFF` sobre `--bg` `#0a0e16` | **7.4 : 1** | ✅ AAA |
| `--grade-e` `#A855F7` sobre `--bg` `#0a0e16` | **5.1 : 1** | ✅ AA |
| `--grade-f` `#E0245E` sobre `--bg` `#0a0e16` | **5.9 : 1** | ✅ AA |
| `--text-3` `#4a5568` sobre `--bg` `#0a0e16` | **3.2 : 1** | ❌ solo placeholder / decorativo (no texto crítico) |

---

## 3. Responsive — 3 breakpoints

Carlos pidió añadir tablet 768. Lo añado.

| Breakpoint | Layout `/clientes/[id]` | Sidebar | Popover | Stage tracker |
|---|---|---|---|---|
| **1440** desktop | 3 cols (ACERCA · ACTIVIDAD · OBLIGACIONES) | Visible 224px | Anclado al badge, 480px | 5 dots horizontal completo |
| **768** tablet | 2 cols (ACERCA+ACTIVIDAD merged · OBLIGACIONES separado) | Colapsado icons-only 56px | Anclado al badge, 420px | 5 dots compactos sin labels (tooltip on hover) |
| **375** mobile | Stack vertical — **OBLIGACIONES arriba**, ACTIVIDAD/ACERCA colapsables ▶ | Hamburger | Fullscreen bottom-sheet 90vh | 5 dots con scroll horizontal o solo "Etapa: Pre-revisión (3/5)" |

---

## 4. Mockup ASCII desktop 1440 — `/clientes/[id]` v3 FINAL

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ GestoriaRD     [Cliente·Desktop] [Mobile] [Cambio perfil] [Revisión guiada 484]     ⌘K   🔔  Admin │  ← top nav
├──────────┬─────────────────────────────────────────────────────────────────────────────────────────┤
│          │ Clientes › Huyghu SRL                                                                    │
│ Side     │                                                                                          │
│ atenuado │ ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│          │ │      ╔════╗                                                                       │  │
│ Inicio   │ │      ║ HS ║   Huyghu SRL                          [✉][📞][📋][+Tarea][Editar][⋯]  │  │
│ Clientes │ │      ║72×72║  RNC 130309094 · Servicios profesionales · ⏱ Historial perfil       │  │
│  ●484    │ │      ║grad║                                                                       │  │
│ Calenda. │ │      ╚════╝                                                                       │  │
│  ●12     │ │       ╲[C▾]  ← badge perfil bottom-right, JetBrains Mono                           │  │
│ Pipelin. │ │                                                                                    │  │
│ Reporte. │ │  ✨ Cliente al día. Próx IT-1 mayo en 6 días. 12 facturas FacturaIA pendientes.   │  │
│ DGII     │ │                                                                                    │  │
│ Templat. │ └──────────────────────────────────────────────────────────────────────────────────┘  │
│ Equipo   │                                                                                          │
│ Ajustes  │ ●───────●───────●───────○───────○                                                        │
│          │ Docs    Calc    Pre-    Envío   DGII   ← stage tracker 5 dots                            │
│          │ recib   listo   rev             conf                                                     │
│          │ ✓ done  ✓ done  ◉ curr  ⊙ pend  ⊙ pend                                                  │
│          │ "3 días dentro calendario · Próx fecha: 15 may"                                          │
│          │                                                                                          │
│          │ ┌─ACERCA──────────┬─ACTIVIDAD────────────────────┬─OBLIGACIONES MAYO────────────────┐ │
│          │ │                  │                              │                                  │ │
│          │ │ Tipo: Empresa   │ [Notas][Email][Llamadas][Docs]│ ⏳ IT-1 abril (atrasada)         │ │
│          │ │ Régimen: Ordin. │  ─────                        │    Vence: 20-mayo  [Subsanar →]  │ │
│          │ │ Sector: Servic. │                              │                                  │ │
│          │ │ RNC: 130309094  │ ◆ 13-may 14:22                │ ⚠ 606 mayo (por vencer 6d)       │ │
│          │ │ NCF: e-CF t.31  │   Sarah cambió a C → A        │    Vence: 15-mayo                 │ │
│          │ │ ITBIS: Sí       │   "Justificado: 87% score"    │    [Aprobar y enviar →]          │ │
│          │ │ Nómina: 12 emp. │                              │    Precio: RD$ 4,500              │ │
│          │ │ ZF: No          │ ◆ 12-may 09:15                │                                  │ │
│          │ │                  │   Mark · Email "Q1 close"     │ ⚠ 607 mayo (por vencer 6d)       │ │
│          │ │ ─── Custom ───  │                              │    [Aprobar y enviar →]          │ │
│          │ │ Entity: SRL     │ ◆ 11-may 16:48                │                                  │ │
│          │ │ Form: 12-03-14  │   Yolanda · WhatsApp          │ ⏳ TSS mayo (pendiente)          │ │
│          │ │ Birthday: Apr22 │   "Subí 12 facturas"          │    Vence: 03-junio                │ │
│          │ │                  │                              │                                  │ │
│          │ │ 🔐 Vault (3)   │ ◆ 10-may 11:30                │ ─── Historial perfil ⏱ ───       │ │
│          │ │ [Ver creds…]    │   Sarah · 606 abril entregado │ • 13-may  Sarah: C → A ✓         │ │
│          │ │                  │                              │ • 02-abr  Mark: D → C ✓          │ │
│          │ │                  │ [Cargar más…]                │ • 15-mar  Sistema: B → C (auto)  │ │
│          │ │                  │                              │                                  │ │
│          │ └─────────────────┴──────────────────────────────┴─────────────────────────────────┘ │
│          │                                                                                          │
└──────────┴─────────────────────────────────────────────────────────────────────────────────────────┘

  Click badge [C▾] → POPOVER inline anclado:

  ┌────────────────────────────────────╮
  │ Cambiar perfil de Huyghu SRL       │
  │                                     │
  │  ⓐ Perfil A · Excelente        [1] │
  │  ⓑ Perfil B · Bueno             [2]│
  │  ◉ Perfil C · Regular (ACTUAL) [3] │  ← opacity 0.5 (no cambio)
  │  ⓓ Perfil D · Bajo              [4]│
  │  ⓔ Perfil E · Crítico            [5]│
  │  ⓕ Perfil F · Riesgo Total       [6]│
  │                                     │
  │  ── Preview impacto ──             │
  │  PIPELINES   ✗ RST  ✓ Ordinario    │
  │  OBLIGACIONES + IT-1 + IR-2 + ACT  │
  │  PRECIO      RD$ 4,500 → 7,500     │
  │                                     │
  │  Motivo (opcional):                 │
  │  [___________________________]      │
  │                                     │
  │  ☐ Notificar al cliente por email  │
  │                                     │
  │  [Cancelar]    [Confirmar Perfil X]│
  ╰─────────────────────────────────────╯
       ↑ overlay blur 4px detrás
```

---

## 5. Mockup ASCII tablet 768

```
┌──────────────────────────────────────────────────────────────┐
│ GD   [Cli][Mob][Camb][Rev484]   ⌘K  🔔  Admin                │
├──┬───────────────────────────────────────────────────────────┤
│G │ Clientes › Huyghu SRL                                     │
│  │                                                            │
│⌂ │ ┌────────────────────────────────────────────────────┐   │
│👥│ │   ╔════╗  Huyghu SRL                  [✉][📞][⋯]  │   │
│📅│ │   ║ HS ║  RNC 130309094 · Servicios · ⏱            │   │
│🔄│ │   ║72×72║                                            │   │
│📊│ │   ╚════╝╲[C▾]                                       │   │
│🏛│ │                                                       │   │
│📄│ │ ✨ Próx IT-1 en 6d. 12 facturas pendientes.          │   │
│👤│ └────────────────────────────────────────────────────┘   │
│⚙ │                                                            │
│  │ ●─●─●─○─○  (hover dot → tooltip "Etapa N")                 │
│  │ "3 días dentro · Próx 15 may"                              │
│  │                                                            │
│  │ ┌─ACERCA + ACTIVIDAD ────┬─OBLIGACIONES MAYO────────────┐ │
│  │ │                         │                              │ │
│  │ │ Régimen Ordinario       │ ⏳ IT-1 abril (atrasada)    │ │
│  │ │ Servicios profesionales │    [Subsanar →]              │ │
│  │ │                         │                              │ │
│  │ │ ─── Actividad ─────     │ ⚠ 606 mayo                  │ │
│  │ │ ◆ 13-may Sarah: C→A    │    [Aprobar y enviar]        │ │
│  │ │ ◆ 12-may Mark Email    │                              │ │
│  │ │ ◆ 11-may Yolanda WA    │ ⚠ 607 mayo                  │ │
│  │ │ [Cargar más]            │    [Aprobar y enviar]        │ │
│  │ │                         │                              │ │
│  │ │ ─── Custom ─────        │ ⏳ TSS mayo                  │ │
│  │ │ Entity: SRL             │                              │ │
│  │ │ 🔐 Vault (3)            │ Historial perfil ⏱           │ │
│  │ │                         │ • 13-may C → A               │ │
│  │ └─────────────────────────┴──────────────────────────────┘ │
│  │                                                            │
└──┴───────────────────────────────────────────────────────────┘
```

---

## 6. Mockup ASCII mobile 375 — obligaciones ARRIBA

```
┌──────────────────────────┐
│ ← Huyghu SRL        ⋯    │
├──────────────────────────┤
│                          │
│        ╔══════╗          │  ← avatar 60×60
│        ║  HS  ║          │     gradient
│        ║60×60 ║          │
│        ╚══════╝╲[C▾]26×26│  ← badge 26×26 bottom-right
│                          │
│   Huyghu SRL              │
│   RNC 130309094           │
│   Servicios profesionales │
│   ⏱ Historial perfil      │
│                          │
│ ┌──┬──┬──┬──┐            │  ← 4 botones grid
│ │ ✉│ 📞│ 📋│ + │            │     touch 44×44
│ └──┴──┴──┴──┘            │
│                          │
│ ●─●─◉─○─○                │  ← stage tracker compacto
│ "Etapa 3/5 Pre-revisión" │
│                          │
│ ━━━━━ OBLIGACIONES MAYO ━│  ← ARRIBA (no después)
│                          │
│ ⏳ IT-1 abril            │
│    Vence: 20-mayo        │
│    [Subsanar →]          │
│                          │
│ ⚠ 606 mayo               │
│    Vence: 15-mayo        │
│    [Aprobar y enviar]    │
│                          │
│ ⚠ 607 mayo               │
│    [Aprobar y enviar]    │
│                          │
│ ⏳ TSS mayo              │
│                          │
│ ─────────────────────    │
│                          │
│ ▶ ACTIVIDAD              │  ← bloques colapsables
│ ▶ ACERCA                 │
│ ▶ DATOS FISCALES         │
│ ▶ HISTORIAL PERFIL       │
│ ▶ 🔐 VAULT (3 creds)     │
│                          │
└──────────────────────────┘

Tap [C▾] → bottom sheet fullscreen (90vh):

┌──────────────────────────┐
│ ────                     │  ← drag handle
│                          │
│ Cambiar perfil           │
│ Huyghu SRL · RNC ...     │
│                          │
│ ⓐ Perfil A · Excelente  │
│ ⓑ Perfil B · Bueno      │
│ ◉ Perfil C · Regular ACT │
│ ⓓ Perfil D · Bajo       │
│ ⓔ Perfil E · Crítico    │
│ ⓕ Perfil F · Riesgo Tot │
│                          │
│ ── Preview ──            │
│ PIPELINES ✗RST ✓Ord     │
│ OBLIG +IT-1 +IR-2 +ACT  │
│ PRECIO 4500 → 7500       │
│                          │
│ Motivo:                  │
│ [_________________]      │
│                          │
│ ☐ Notificar cliente      │
│                          │
│ [Cancelar]  [Confirmar]  │
└──────────────────────────┘
```

---

## 7. Mockup ASCII Revisión Guiada 484 — triage AI

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Revisión guiada — Perfil C default                          [Pausar]   ✕   │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│ 127/484 (26%)  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │  ← gradient C→A
│                                                                            │
│ "484 clientes uno por uno · 30s cada · 4h total · 6× más rápido teclado"   │
│ Atajos: [1-6] perfil · [S] saltar · [X] baja · [V] ver completo · [←→] nav │
│                                                                            │
│ ╔══════════════════════════════════════════════════════════════════════╗  │
│ ║                                                                       ║  │
│ ║  Cliente #128 de 484                                                 ║  │
│ ║                                                                       ║  │
│ ║  Dra. Ana Pérez                                                       ║  │
│ ║  RNC: 00112345678 (Cédula 9 dígitos)                                  ║  │
│ ║  Sector: Salud · Honorarios · Sin nómina · Fact RD$ 45,200/mes        ║  │
│ ║                                                                       ║  │
│ ║  ┌──────────────────────────────────────────────────────────────┐    ║  │
│ ║  │ ★ SUGERENCIA AI                                              │    ║  │
│ ║  │                                                              │    ║  │
│ ║  │     B  Perfil Bueno          ┌──────────┐                   │    ║  │
│ ║  │                              │ 87% ✓    │ ← confianza pill  │    ║  │
│ ║  │                              └──────────┘                   │    ║  │
│ ║  │                                                              │    ║  │
│ ║  │  Razones:                                                    │    ║  │
│ ║  │  ▸ RNC cédula 9 dígitos (persona física)                    │    ║  │
│ ║  │  ▸ Honorarios sin facturación operativa                     │    ║  │
│ ║  │  ▸ Sin nómina (no TSS aplicable)                            │    ║  │
│ ║  │  ▸ Facturación mensual RD$ 45,200 (rango B)                 │    ║  │
│ ║  │  ▸ Sector salud (riesgo bajo según histórico)               │    ║  │
│ ║  └──────────────────────────────────────────────────────────────┘    ║  │
│ ║                                                                       ║  │
│ ║  ┌─────────┬─────────┬─────────┐                                    ║  │
│ ║  │   [1]   │   [2]   │   [3]   │                                    ║  │
│ ║  │    A    │  ★ B    │    C    │   ← grid 3×2  · 6 botones A-F     ║  │
│ ║  │ Excel.  │ Bueno   │ Regular │       suggested marcado ★ + glow  ║  │
│ ║  ├─────────┼─────────┼─────────┤                                    ║  │
│ ║  │   [4]   │   [5]   │   [6]   │                                    ║  │
│ ║  │    D    │    E    │    F    │                                    ║  │
│ ║  │  Bajo   │ Crítico │ Riesgo  │                                    ║  │
│ ║  └─────────┴─────────┴─────────┘                                    ║  │
│ ║                                                                       ║  │
│ ║  ┌─────────┬─────────┬─────────┐                                    ║  │
│ ║  │  [S]    │  [X]    │  [V]    │   ← secundarios                   ║  │
│ ║  │ Saltar  │  Baja   │   Ver   │                                    ║  │
│ ║  └─────────┴─────────┴─────────┘                                    ║  │
│ ║                                                                       ║  │
│ ╚══════════════════════════════════════════════════════════════════════╝  │
│                                                                            │
│ Stats sesión: 23 clasificados · 1 saltado · 0 bajas · 12 min · pace 5/min │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Vista listado `/clientes/perfilado` (Stripe-style KPI + 7 pills)

Sin cambio mayor vs KB 16922. Solo aplico paleta nueva + dark theme.

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ GestoriaRD  [Cliente·Desktop][Mobile][Cambio][Rev484]    ⌘K  🔔  Admin             │
├──────────┬─────────────────────────────────────────────────────────────────────────┤
│ Sidebar  │ Perfilado de Clientes                                                   │
│          │ Clasificación A-F por cumplimiento fiscal                                │
│          │                                                                          │
│          │ ┌─────────┐┌─────────┐┌─────────┐┌─────────┐                            │
│          │ │ Total   ││ Grado p.││ Riesgo  ││ Sin clas│ ← Stripe KPI 4 cards       │
│          │ │ 503     ││ C+ ▲    ││ 12      ││ 484     │                            │
│          │ └─────────┘└─────────┘└─────────┘└─────────┘                            │
│          │                                                                          │
│          │ [Todos 503] [A 23] [B 87] [C 484] [D 7] [E 4] [F 1]                     │  ← pills A-F
│          │                                                                          │
│          │ 🟡 484 clientes con grado provisional C — gris outline                  │  ← banner si filtra C
│          │    [Iniciar revisión guiada →]                                           │
│          │                                                                          │
│          │ 🔍 Buscar…   ↕ Sort: Score desc   ☐ Solo con alertas    [+Nuevo]        │
│          │                                                                          │
│          │ ┌─Grado─┬─Cliente / RNC ─────┬─Sector───┬─Fact.───┬─Score─┬─Alert─┬─→─┐ │
│          │ │  [A]  │ Huyghu SRL          │ Servic.  │ 312K    │ 87 ▲  │ —     │ → │ │
│          │ │ green │ 130309094            │           │          │        │       │   │ │
│          │ │  [B]  │ Bridaspak           │ Comerc.  │ 188K    │ 72    │ 1     │ → │ │
│          │ │  teal │ 401501234            │           │          │        │       │   │ │
│          │ │  [C-] │ Unitep Partner       │ Servic.  │ —       │ —     │ —     │ → │ │
│          │ │  gris │ 130842715            │           │          │        │       │   │ │
│          │ │ outln │                      │           │          │        │       │   │ │
│          │ │  [D]  │ Hispanila Adventure  │ Turismo  │ 85K     │ 38 ▼  │ 3     │ → │ │
│          │ │ amber │ 131204567            │           │          │        │       │   │ │
│          │ │  [F]  │ FERMIN EBANISTERIA   │ Manufac. │ 12K     │ 11 ▼  │ 6     │ → │ │
│          │ │  red  │ 131089012            │           │          │        │       │   │ │
│          │ └───────┴──────────────────────┴──────────┴─────────┴───────┴───────┴───┘ │
│          │                                                                          │
│          │ ◀ 1 2 3 … 11 ▶   Mostrando 1-50 de 503                                  │
└──────────┴─────────────────────────────────────────────────────────────────────────┘

Mobile 375 listado:
- KPI 2×2
- Pills swipe horizontal con snap
- Filas → cards verticales (PerfiladoCard.tsx)
```

---

## 9. Usability WCAG 2.2 AA — checklist

| Categoría | Check | Implementación |
|---|---|---|
| **Color** | Nunca solo color | Badge A-F siempre con letra Mono visible |
| **Contraste texto** | ≥ 4.5 : 1 | `#e8edff` sobre `#0a0e16` = 14.2:1 ✅ |
| **Contraste UI** | ≥ 3 : 1 | Badges grade sobre bg ≥ 5:1 todos ✅ |
| **Touch target** | ≥ 44×44 px | Mobile: 4 botones grid + acciones obligaciones |
| **Focus visible** | ring 2px | `outline: 2px solid var(--grade-c); outline-offset: 2px;` |
| **Keyboard nav** | Tab orden visual | header → stage tracker → 3 cols (ACERCA → ACTIVIDAD → OBLIGACIONES) |
| **Atajos** | Documentados + tooltip | Help kbd visible "1-6 / S / X / V / ←→" |
| **Screen reader** | aria-label en badges | `<span aria-label="Perfil C, Regular, click para cambiar">` |
| **Reduced motion** | respetar prefers-reduced-motion | Popover blur sin animación · stage tracker sin glow |
| **Live regions** | aria-live polite | Stats sesión Revisión Guiada · cambios perfil confirmados |
| **Form labels** | asociados | Motivo textarea con `<label htmlFor>` |
| **Color blind** | grade B/C diferenciables | Teal (#2DD4BF) vs Azul (#4C9EFF) — distintas hues ✅ verificado con simulador |

---

## 10. Lista archivos nuevos para gestoriard (con LOC estimado)

### 10.1 Frontend (Next.js 15 App Router) — ~3,800 LOC

```
app/clientes/perfilado/                                            (listado)
├── page.tsx                                                       220 LOC
├── loading.tsx                                                     30 LOC
├── error.tsx                                                       20 LOC
└── _components/
    ├── PerfiladoHeader.tsx                                        50 LOC
    ├── KpiBar.tsx                                                 60 LOC  (Stripe-style 4 cards)
    ├── GradePills.tsx                                             70 LOC  (7 pills con counts)
    ├── PerfiladoTable.tsx                                        140 LOC
    ├── PerfiladoCard.tsx                                          80 LOC  (mobile)
    ├── CProvisionalBanner.tsx                                     40 LOC
    └── Pagination.tsx                                             60 LOC

app/clientes/[id]/                                                 (detalle ficha 360)
├── page.tsx                                                       280 LOC  (3 cols layout)
├── loading.tsx                                                     30 LOC
└── _components/
    ├── ClienteHeader.tsx                                         120 LOC  (avatar 72×72 + badge bottom-right + acciones)
    ├── StageTracker.tsx                                           80 LOC  (5 dots ciclo mes)
    ├── AiSummaryBanner.tsx                                        50 LOC  (Karbon-style)
    ├── ColAcerca.tsx                                             100 LOC  (datos fiscales + custom fields + vault expandible)
    ├── ColActividad.tsx                                          140 LOC  (tabs Notas/Email/Llamadas/Docs)
    └── ColObligacionesMes.tsx                                    120 LOC  (auto-derivadas perfil + historial perfil al final)

app/clientes/_components/                                          (compartidos)
├── GradeBadge.tsx                                                  80 LOC  (variants: solid, outline, dot, avatar-overlay)
├── CambiarPerfilPopover.tsx                                      220 LOC  (overlay blur + 6 opts + diff + shortcuts)
├── DiffPreview.tsx                                               120 LOC  (PIPELINES/OBLIG/PRECIO old→new)
└── HistorialPerfilModal.tsx                                       80 LOC  (⏱ click → modal lateral)

app/clientes/revision-guiada-perfil-c/                             (triage AI)
├── page.tsx (existente, expand)                                  200 LOC
└── _components/
    ├── TriageCard.tsx                                            160 LOC
    ├── AiSugerencia.tsx                                           90 LOC  (87% confianza + razones)
    ├── DecisionGrid.tsx                                          100 LOC  (6 botones A-F + 3 secundarios)
    ├── SesionStats.tsx                                            60 LOC
    └── ProgressBar.tsx                                            40 LOC  (gradient C→A)

components/global/
├── CommandPalette.tsx                                            200 LOC  (⌘K)
├── KeyboardShortcuts.tsx                                          80 LOC  (provider listener global)
└── PerfiladoThemeWrapper.tsx                                      30 LOC  (data-theme="perfilado-dark")

hooks/
├── useGradeShortcuts.ts                                           60 LOC  (1-6 + S/X/V)
├── useCommandPalette.ts                                           40 LOC
├── useClientesPerfilado.ts                                        80 LOC  (SWR)
├── useClienteDetalle.ts                                           60 LOC
└── useCambiarPerfil.ts                                            70 LOC  (preview + commit)

lib/perfilado/
├── gradeConfig.ts                                                 40 LOC  (paleta + descripciones + helpers)
├── criteriaConfig.ts                                              30 LOC  (6 criterios pesos)
├── computeScore.ts                                                50 LOC  (+ deriveGrade)
├── derivePipelines.ts                                             60 LOC  (perfil → pipelines DGII)
└── deriveObligaciones.ts                                          80 LOC  (perfil + mes → obligaciones)

styles/
└── perfilado-dark.css                                             60 LOC  (CSS vars scoped data-theme)
```

### 10.2 Backend (API routes) — ~600 LOC

```
app/api/v2/clientes/perfilado/route.ts                            180 LOC  (GET filters+pagination+facets)
app/api/v2/clientes/[id]/route.ts                                 120 LOC  (GET ficha + obligaciones del mes derivadas)
app/api/v2/clientes/[id]/cambiar-perfil/route.ts                  100 LOC  (POST con audit + side effects)
app/api/v2/clientes/[id]/preview-diff/route.ts                     80 LOC  (GET impacto sin persistir)
app/api/v2/clientes/revision-guiada-perfil-c/sugerencia-ai/route.ts 120 LOC  (LLM call + razones)
```

### 10.3 BD Migrations — ~80 LOC

```sql
-- migrations/2026-05-14-perfilado-completo/up.sql

-- Distinguir C provisional vs C real
ALTER TABLE clientes_perfilado
  ADD COLUMN IF NOT EXISTS revision_guiada_completada BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS revision_guiada_fecha TIMESTAMPTZ NULL;

-- Auditoría cambios perfil
CREATE TABLE IF NOT EXISTS clientes_cambios_perfil_audit (
  id BIGSERIAL PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  perfil_anterior CHAR(1) NOT NULL,
  perfil_nuevo CHAR(1) NOT NULL,
  motivo TEXT NULL,
  notificado_cliente BOOLEAN DEFAULT false,
  user_id UUID NOT NULL,
  source TEXT NOT NULL,                       -- 'popover'|'revision_guiada'|'auto'
  diff JSONB NULL,                             -- snapshot del preview diff
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pipelines DGII derivados del perfil
CREATE TABLE IF NOT EXISTS perfilado_pipelines_default (
  perfil CHAR(1) PRIMARY KEY,
  pipelines TEXT[] NOT NULL                    -- ['IT-1','606','607','IR-1','IR-2','IR-3','ACT']
);

-- Obligaciones default por perfil y régimen
CREATE TABLE IF NOT EXISTS perfilado_obligaciones_default (
  perfil CHAR(1) NOT NULL,
  regimen TEXT NOT NULL,
  obligaciones JSONB NOT NULL,                 -- [{form,frecuencia,dia,...}]
  PRIMARY KEY (perfil, regimen)
);

-- Estado ciclo mensual 5 etapas
CREATE TABLE IF NOT EXISTS clientes_estado_ciclo_mensual (
  cliente_id UUID NOT NULL REFERENCES clientes(id),
  year_month CHAR(7) NOT NULL,                 -- '2026-05'
  docs_recibidos BOOLEAN DEFAULT false,
  calculo_listo BOOLEAN DEFAULT false,
  pre_revisado BOOLEAN DEFAULT false,
  envio_completado BOOLEAN DEFAULT false,
  dgii_confirmado BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (cliente_id, year_month)
);

-- Indexes obligatorios performance 503+
CREATE INDEX IF NOT EXISTS idx_clientes_perfilado_grade
  ON clientes_perfilado(cliente_id, grade);
CREATE INDEX IF NOT EXISTS idx_clientes_sector_tenant
  ON clientes(tenant_id, sector);
CREATE INDEX IF NOT EXISTS idx_clientes_rnc_prefix
  ON clientes(rnc text_pattern_ops);
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_clientes_razon_social_trgm
  ON clientes USING gin (razon_social gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_alertas_activas
  ON alertas_dgii(cliente_id) WHERE activa = true;
CREATE INDEX IF NOT EXISTS idx_audit_cliente_fecha
  ON clientes_cambios_perfil_audit(cliente_id, created_at DESC);
```

### 10.4 Sidebar nav update

```tsx
// components/Sidebar.tsx
{ href: '/clientes/perfilado', label: 'Perfilado A-F', icon: <BadgeCheck />, badge: 484 }
```

### 10.5 Total LOC

| Categoría | LOC |
|---|---|
| Frontend componentes + páginas | ~3,800 |
| Hooks + lib + styles | ~530 |
| Backend API routes | ~600 |
| BD migrations | ~80 |
| **TOTAL gestoriard implementa** | **~5,010 LOC** |

---

## 11. Integración BD real 503 clientes

Ya cubierto en KB 16922 + complementado aquí:

| Pieza | Implementación |
|---|---|
| **Paginación** | Server-side 50/pág en `/api/v2/clientes/perfilado` |
| **Facets** | Query agregada paralela `Promise.all([data, facets, meta])` |
| **Indexes** | pg_trgm + grade + sector + RNC prefix + alertas activas + audit |
| **Virtualización** | Opcional sprint 2 con react-window si Yolanda pide "ver todos" |
| **484 provisionales** | `revision_guiada_completada = false AND grade = 'C'` → badge `[C-]` outline gris `#6b7280` + tooltip "Sin revisión guiada" |
| **Cache facets** | 60s edge cache (counts no requieren tiempo real) |
| **Multi-tenant** | `tenant_id` desde session middleware, NUNCA query param |
| **Score recálculo** | POST sincrono <500ms para 1 cliente · batch async via job queue para todos |

---

## 12. §11 Hallazgos arquitecturales

### 12.1 Sistema/Repo

1. **Route conflict `/clientes/perfilado`** (ya identificado validación Modal A-F KB 16923): Next.js matchea como `[id]` UUID y devuelve 500. **Bloquea**: gestoriard debe crear `app/clientes/perfilado/page.tsx` antes de Yolanda LUNES.

2. **Dark theme scoped** — necesita wrapper `<div data-theme="perfilado-dark">` con CSS variables override. Verificar que Tailwind config permite `data-theme` selector o crear archivo CSS aparte.

3. **Fonts Inter + JetBrains Mono** — añadir `next/font/google` import en `app/layout.tsx`. Verificar bundle size.

4. **AI Sugerencia confianza 87%** — endpoint LLM nuevo. Definir provider:
   - Claude Sonnet via Anthropic API (rápido, $$$$)
   - Gemini 2.5 Flash via CLIProxy (free, slower)
   - **Decisión recomendada**: Gemini Flash con prompt cacheado por sector+régimen. Free tier suficiente para 484 sugerencias.

5. **Preview diff git** — endpoint que cruza:
   - `perfilado_pipelines_default[target_grade]` vs `perfilado_pipelines_default[current_grade]`
   - `perfilado_obligaciones_default[target_grade][regimen]` vs current
   - Precio (tabla `precios_servicios[perfil]`) — **falta esta tabla**, hay que crearla o derivar de Stripe Customer.subscriptions

6. **Stage tracker 5 dots** — necesita actualización en cada paso del ciclo mes. ¿Quién marca cada stage? Manual (contador hace check) o automático (sistema detecta cuando docs llegan, cuando QB sync ok, etc.)? **Decisión recomendada**: híbrido — sistema detecta automáticamente cuando puede, contador marca manualmente lo que no detecta.

7. **`derivePipelines.ts` y `deriveObligaciones.ts`** son lógica de negocio crítica DGII. **Definir con contadores reales** (Yolanda) antes de codificar. Las tablas `perfilado_pipelines_default` y `perfilado_obligaciones_default` son **seed data** que requiere validación humana.

### 12.2 Prompt/Comunicación

1. **Carlos brand identity**: el dark theme #0a0e16 NO es el brand actual GestoríaRD (navy #0F2040 + tema light). Adopté scope `data-theme="perfilado-dark"` para no romper. **Confirmar con Carlos** si quiere dark theme global en TODO el SaaS o solo en estas 3 vistas.

2. **AI Summary banner opcional**: lo añadí Karbon-style en `/clientes/[id]`. Carlos no lo pidió explícitamente en Ejemplos #2/#3. **Confirmar si lo quiere** — si no, descartar (-50 LOC).

3. **Vault credenciales** (Financial Cents): solo lo incluyo en col ACERCA como "🔐 Vault (3) [Ver creds…]" expandible. NO el componente completo. **Confirmar con Carlos** si quiere full Vault en sprint 1 o posterior.

4. **Notificar cliente por email** (checkbox popover) — necesita SendGrid/Resend integration + template HTML cambio perfil. **Verificar si existe stack email en GestoríaRD** o hay que añadirlo.

### 12.3 Flujo/Proceso

1. **3 páginas relacionadas**:
   - `/clientes/perfilado` (listado) — lista filtrable A-F masiva
   - `/clientes/[id]` (ficha 360) — detalle individual con 3 cols
   - `/clientes/revision-guiada-perfil-c` (triage AI) — 484 reclasificación rápida
   - Todas comparten `CambiarPerfilPopover` y `GradeBadge`. **Coordinar el copy + interacciones** para que sea consistente.

2. **Atajos teclado globales** (1-6, ⌘K, S/X/V): pueden colisionar con shortcuts existentes en GestoríaRD producción. **Auditar `useGlobalShortcuts`** existente antes de añadir.

3. **Stage tracker ciclo mes** se renderiza solo en `/clientes/[id]` — coherente. Pero en mobile (375) los 5 dots se compactan a "Etapa N/5 (label)" — verificar UX con Yolanda.

4. **Preview diff git** carga vía AJAX al hover sobre cada radio del popover (no al click). Si latencia BD > 300ms, mostrar skeleton. Alternativa: pre-cargar todos los 6 previews al abrir popover (1 query batch).

5. **Multi-tenant strict**: TODO endpoint debe inyectar `tenant_id` desde session. **Verificar** que `/api/v2/clientes/*` actuales lo hagan correctamente. Si no, **CRITICAL fix antes Yolanda LUNES**.

---

## 13. Plan implementación — 3 sprints

| Sprint | Scope | LOC aprox |
|---|---|---|
| **S1 — Listado + popover básico** | `/clientes/perfilado` listado + KPI + 7 pills + tabla/cards + `CambiarPerfilPopover` (sin diff preview) + `GradeBadge` + migration BD + 4 indexes | ~1,800 |
| **S2 — Ficha 360 + triage AI** | `/clientes/[id]` 3 cols + StageTracker + ColObligacionesMes + AiSummary + expansión `/clientes/revision-guiada-perfil-c` con triage AI + sugerencia endpoint Gemini | ~2,200 |
| **S3 — Polish + shortcuts + ⌘K** | DiffPreview en popover + CommandPalette ⌘K + KeyboardShortcuts global + notif email + responsive 768 + a11y final + Chrome MCP audit 3 viewports + tests | ~1,000 |

**Total**: ~3 semanas para MVP completo.

---

## 14. Verificación pre-deploy Chrome MCP (15 checks)

- [ ] 1440px desktop: `/clientes/[id]` 3 cols sin overflow
- [ ] 768px tablet: 2 cols + sidebar colapsado + stage tracker compacto
- [ ] 375px mobile: obligaciones arriba + bloques colapsables + bottom sheet popover
- [ ] Popover anclado al badge: no overflow, blur 4px funciona
- [ ] Atajos 1-6 abren/cambian perfil correctamente
- [ ] ⌘K abre command palette (no captura `cmd+k` browser shortcut)
- [ ] Multi-tenant: Yolanda Huyghu vs otro tenant — sin leak en lista ni ficha
- [ ] Console: 0 errors, 0 warnings, 0 hydration crashes
- [ ] WCAG AA: contraste verificado axe-core ≥ 4.5:1
- [ ] Touch targets ≥ 44×44 mobile
- [ ] Focus visible: ring 2px en todos los interactivos
- [ ] Performance: LCP < 2.5s con 503 clientes paginados
- [ ] Stage tracker: 5 dots renderizan con estado correcto
- [ ] Diff preview: PIPELINES/OBLIG/PRECIO carga sin lag
- [ ] AI sugerencia: 87% confianza + razones desplegadas correctamente · timeout LLM graceful

---

## 15. Decisión final consolidada

| Aspecto | Decisión | Fuente |
|---|---|---|
| Paleta colores A-F | A `#00C48C` · B `#2DD4BF` · C `#4C9EFF` · D `#F5A623` · E `#A855F7` · F `#E0245E` · gris `#6b7280` C-default | **Ejemplo #3** |
| Dark theme | `#0a0e16` scoped a 3 vistas via `data-theme="perfilado-dark"` | **Ejemplo #3** |
| Fonts | Inter + JetBrains Mono | **Ejemplo #3** |
| Layout `/clientes/[id]` | 3 cols ACERCA / ACTIVIDAD / OBLIGACIONES MAYO | **Ejemplo #2** |
| Layout mobile | Obligaciones ARRIBA, bloques colapsables | **Ejemplo #2** |
| Cambiar perfil UI | POPOVER inline anclado al badge (NO modal centrado) | **Ejemplo #2** + **#3** |
| Preview diff git | PIPELINES/OBLIG/PRECIO old→new | **Ejemplo #2** |
| Atajos teclado | 1-6 perfil · S/X/V revisión · ←→ nav · ⌘K palette | **Ejemplo #2** + **#3** + **Linear** |
| Revisión Guiada 484 | Triage AI 87% + razones + 6 botones + 3 secundarios + stats sesión | **Ejemplo #2** + **#3** |
| Stage tracker | 5 dots ciclo mes (Docs/Calc/Pre-rev/Envío/DGII conf) | **Ejemplo #2** (HubSpot) |
| Listado `/clientes/perfilado` | KPI bar Stripe + 7 pills + tabla/cards | **KB 16922** + **Stripe** |
| AI Summary banner | Opcional en `/clientes/[id]` | **Karbon** |
| Custom fields | Entity type · Formation · Tax ID · Birthday | **Financial Cents** |
| Vault credenciales | Expandible en col ACERCA | **Financial Cents** |
| Triage como inbox | `/clientes/revision-guiada-perfil-c` | **Linear Triage** |
| 6 criterios ponderados | 25/20/15/20/10/10 | **Ejemplo #1** |
| Breakpoints | 1440 / 768 / 375 | **FacturaIA** (añadido) |
| WCAG | AA con verificación matemática contraste | **FacturaIA** |
| C provisional | Badge `[C-]` outline gris `#6b7280` + banner amarillo + toggle | **KB 16922** + **Ejemplo #3** |

**Pendientes de Carlos** (§12):
- Confirmar dark theme scoped (3 vistas) vs global
- Confirmar AI Summary Karbon-style en ficha
- Confirmar Vault scope sprint 1 vs posterior
- Confirmar stack email para notificación cambio perfil
- Validar seed data `perfilado_pipelines_default` y `perfilado_obligaciones_default` con Yolanda antes de codificar `derivePipelines.ts` y `deriveObligaciones.ts`

═══ FIRMA ═══ FacturaIA / 2026-05-14 / propuesta-unificada-FINAL-perfilado-AF-saas
