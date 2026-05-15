# Propuesta Unificada — Perfilado A-F Cliente (Mockup Final)

**ID**: `propuesta-unificada-perfilado-AF-mockup-final-140526`
**Fecha**: 2026-05-14
**Autor**: FacturaIA (rol diseñadora SaaS)
**Cliente piloto**: Yolanda Huyghu — LUNES 14-may
**Base oficial**: mockup React aprobado por Carlos (GRADE_CONFIG + CRITERIA + UI principal + Modal 4 tabs)
**Cross-ref**: research referentes KB 16920 · mockup `/clientes/[id]` v3 KB 16921 · calendario fiscal cliente KB 16919
**Destino**: vista `/clientes/perfilado` GestoriaRD (NUEVA — no toca `/clientes/[id]`)

---

## 0. TL;DR

- **Vista 1 sola** (no 5 tabs como `/v2` actual). Header → 7 pills A-F → KPI bar → tabla 7 cols → modal.
- Página `/clientes/perfilado` **separada** de `/clientes/[id]` v3 (cliente detail completo). Coexisten:
  - **`/clientes/perfilado`** = lista filtrable A-F + modal revisión rápida (HOY, para Yolanda LUNES)
  - **`/clientes/[id]`** = ficha 360° completa con 6 tabs (sprint posterior)
- Mobile 375: tabla → **cards stack**, modal → **bottom-sheet fullscreen**.
- 503 clientes: paginación server-side 50/pág + filtros eficientes + virtualización opcional.
- Dark theme oficial Carlos: `#0a0f18` bg / `#111820` cards / DM Sans + DM Mono.
- 484 clientes default `C` → endpoint `revision-guiada-perfil-c` ya existente, integrado con banner especial.

---

## 1. Decisión 1: Vista única vs 5 tabs `/v2` actual

**Decisión**: vista única según Carlos.

**Justificación**:
- 5 tabs en `/v2` actual fragmenta el flujo Yolanda. Ella necesita **escanear los 503 clientes y clasificarlos** — no contemplar por tab.
- Pattern Linear Triage: inbox plano + filtros + click → drawer/modal para acción rápida. Sin tabs preliminares. [fuente: linear.app/docs/triage]
- Pattern TaxDome: el cliente individual TIENE tabs (Overview/Info), pero el LISTADO es plano. [fuente: help.taxdome.com/article/130]
- Decisión final: **listado plano + modal con 4 tabs internos** = híbrido Linear (lista) + TaxDome (modal con tabs).

**Trade-off aceptado**: si Yolanda quiere ver perfilado + casos + comunicación de un cliente, debe ir a `/clientes/[id]` (otra página). Vale: la página perfilado es para **clasificar masivo**, no para ficha 360°.

---

## 2. Decisión 2: Integración referentes (qué copio, qué NO)

| Referente | Copio | NO copio | Por qué |
|---|---|---|---|
| **Karbon** | AI Summary banner en Modal Tab Perfil (resumen 2-3 líneas: "Cliente al día, score 87, próximo IT-1 en 6d") | Activity timeline completo | Yolanda lo verá en `/clientes/[id]` v3, no aquí |
| **TaxDome** | Grid mini-cards 2×2 en Tab Perfil (ya alineado con Carlos: 4 InfoCard) + badge "New" en alertas | 13 mini-cards Overview | Demasiado para revisión rápida — 4 es suficiente |
| **Stripe** | **KPI bar de 4 metric cards stacked arriba de tabla** (Total · Grado promedio · En riesgo · Sin clasificar) con trend badges ▲/▼ | Property panel derecho | Modal mismo concepto, no necesito 2× |
| **Linear** | Filtros pills + sort + busqueda en header de tabla (estilo views Linear) + modal como side-drawer alternativo (toggleable user pref) | Sub-issues nested | No aplica para perfilado simple |
| **Financial Cents** | Tab Historial = audit trail filtrable con tipo (Grado/Form/Comunicación/Sistema) | Client Vault | Vault va en `/clientes/[id]` v3 — aquí scope = perfilado |

**KPI bar nueva (Stripe-style) propuesta encima de tabla**:

```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Total        │ │ Grado prom.  │ │ En riesgo    │ │ Sin clasifico│
│ 503          │ │ C+   ▲ 0.3  │ │ 12 (D+E+F)   │ │ 484 (default)│
│ Clientes     │ │ vs mes ant.  │ │ ▼ 3 esta sem │ │ Pendientes C │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

---

## 3. Decisión 3: Mobile 375 — tabla → cards

**Problema**: 7 cols × 375px = imposible. Cada col necesita ~70px mínimo, sumaría 490px sólo cols.

**Solución**: cada fila tabla → **Card vertical** en mobile.

```
┌──────────────────────────────┐
│  ┌──┐ Huyghu SRL              │  ← card mobile
│  │ A│ 130309094               │
│  └──┘                          │
│       Servicios profesionales │
│                                │
│  Score 87  ▲    Fact. RD$ 312K│  ← row 2 compact
│  ─────────────────────────────│
│  ⚠ 2 alertas              [→]│  ← row 3 alertas + chevron
└──────────────────────────────┘
```

Tap card → **bottom sheet fullscreen** con los 4 tabs (Perfil/Criterios/Alertas/Historial).

**Pills filtro mobile**:
- Scroll horizontal con snap (igual que tabs en cliente detail v3)
- Contador integrado: `[Todos 503] [A 23] [B 87] [C 484] [D 7] [E 4] [F 1]`

**KPI bar mobile**: 2×2 grid (no 4 cols).

---

## 4. Decisión 4: Nombres columnas en español RD

**Reemplazos vs mockup React Carlos**:

| Mockup Carlos (genérico) | Español RD GestoriaRD |
|---|---|
| Grade badge | **Grado** |
| Cliente + RNC | **Cliente / RNC** |
| Sector | **Sector** (sin cambio) |
| Facturación RD$ | **Facturación mensual** |
| Score | **Score** (universal SaaS, mantengo) o **Puntaje** |
| Alertas pill count | **Alertas DGII** |
| "Ver →" | **Detalle →** |

**Decisión Score vs Puntaje**: mantener **"Score"** porque es término aceptado en SaaS español RD y permite distinguir del "Puntaje DGII" (otro KPI distinto en GestoriaRD). Pero el header de la columna dice "Score (0-100)" para claridad.

**Tabla final columnas**:

```
| Grado | Cliente / RNC      | Sector       | Fact. mensual | Score | Alertas DGII | Detalle |
|-------|--------------------|--------------|---------------|-------|--------------|---------|
| [A]   | Huyghu SRL          | Servicios    | RD$ 312,500   | 87    | (vacío)      | →       |
|       | 130309094           |              |               |       |              |         |
```

Tooltip en hover de header "Score (0-100)": *"Promedio ponderado de 6 criterios. Click columna para ordenar."*

---

## 5. Decisión 5: BD real 503 clientes — paginación + filtros eficientes

**Problema**: el mockup React Carlos usa 8 mock. Producción tiene 503 → renderizar 503 filas en 1 fetch + DOM = ~3-5s LCP.

**Solución 3 capas**:

### 5.1 Paginación server-side

Endpoint: `GET /api/v2/clientes/perfilado`

Query params:
```
?grade=A|B|C|D|E|F|all
&sector=<string>
&search=<string>  # match razon_social OR rnc
&sort=score_desc|score_asc|name_asc|name_desc|facturacion_desc
&page=1
&limit=50
&has_alertas=true|false
```

Response:
```typescript
{
  data: ClientePerfilado[];          // 50 items
  pagination: {
    page: 1,
    limit: 50,
    total: 503,
    total_pages: 11,
    has_next: true,
    has_prev: false
  };
  facets: {                          // counters para pills (eficiente — UNA query agregada)
    by_grade: { A: 23, B: 87, C: 484, D: 7, E: 4, F: 1 },
    by_sector: { "Servicios": 145, "Comercio": 200, ... }
  };
  meta: {
    grade_promedio: "C+",
    grade_promedio_score: 64.3,
    grade_trend: 0.3,                // vs mes anterior
    en_riesgo_count: 12,
    sin_clasificar_count: 484
  };
}
```

### 5.2 Virtualización (opcional, sprint 2)

Si Carlos quiere mostrar todos los 503 en una sola tabla scrolleable (sin paginación), usar **react-window** con `<FixedSizeList>` row height 72px. Renderiza solo ~12 filas visibles + 5 buffer. LCP < 2s incluso con 503.

**Decisión inicial**: paginación 50/pág. Si Yolanda pide "ver todos", añadimos toggle "Ver todos (virtualizado)".

### 5.3 Filtros eficientes BD

SQL composable:
```sql
SELECT
  c.id, c.razon_social, c.rnc, c.sector,
  cp.grade, cp.score, cp.facturacion_mensual,
  COUNT(a.id) AS alertas_count
FROM clientes c
JOIN clientes_perfilado cp ON cp.cliente_id = c.id
LEFT JOIN alertas_dgii a ON a.cliente_id = c.id AND a.activa = true
WHERE c.tenant_id = $tenant_id
  AND ($grade IS NULL OR cp.grade = $grade)
  AND ($sector IS NULL OR c.sector = $sector)
  AND ($search IS NULL OR
       c.razon_social ILIKE '%' || $search || '%' OR
       c.rnc LIKE $search || '%')
GROUP BY c.id, cp.grade, cp.score, cp.facturacion_mensual
ORDER BY <dynamic sort>
LIMIT $limit OFFSET ($page-1) * $limit;
```

**Indexes obligatorios**:
- `clientes_perfilado(cliente_id, grade)` para filtro grado
- `clientes(tenant_id, sector)` para filtro sector + tenant isolation
- `clientes(rnc) WHERE LEFT(rnc, 1) IN ('1','2','3','4','5','6','7','8','9')` btree para search prefix
- `clientes(razon_social) USING gin(razon_social gin_trgm_ops)` para search fuzzy (necesita extensión pg_trgm)
- `alertas_dgii(cliente_id) WHERE activa = true` para count rápido

**Facets**: query separada con `GROUP BY grade` + `GROUP BY sector` cacheada 60s (Yolanda no necesita ver counts en tiempo real exacto).

---

## 6. Decisión 6: Endpoint `/api/v2/clientes/revision-guiada-perfil-c` (484 default 'C')

**Contexto**: 484 clientes tienen grado `C` provisional porque NO han pasado por revisión guiada. NO es porque obtuvieron score 50-65 (que sería C real).

**Decisión**: distinguir visualmente "C real" vs "C provisional".

### 6.1 Schema BD

Añadir columna a `clientes_perfilado`:

```sql
ALTER TABLE clientes_perfilado
ADD COLUMN revision_guiada_completada BOOLEAN DEFAULT false,
ADD COLUMN revision_guiada_fecha TIMESTAMPTZ NULL;
```

Lógica:
- `revision_guiada_completada = false` AND `grade = 'C'` → **"C-provisional"** (badge gris en lugar de naranja)
- `revision_guiada_completada = true` → grade real (color según GRADE_CONFIG)

### 6.2 UI — al filtrar pill `C`

```
┌────────────────────────────────────────────────────────────────────────┐
│ 🟡  484 clientes con grado provisional C — pendientes de revisión.    │
│     Cada cliente sin revisar mantiene grado por defecto.               │
│     [Iniciar revisión guiada →]   [Cerrar banner]                      │
└────────────────────────────────────────────────────────────────────────┘
```

Click "Iniciar revisión guiada" → navega a `/clientes/revision-guiada-perfil-c` (página existente, en implementación por gestoriard).

En la tabla, las filas C-provisional muestran:
- Badge `C` con outline gris (no relleno naranja)
- Tooltip: *"Grado provisional. Sin revisión guiada."*
- Score muestra "—" en lugar de número
- Modal abierto desde estas filas → tab Criterios muestra "Sin datos — completa revisión guiada".

### 6.3 Endpoint integración

`/api/v2/clientes/revision-guiada-perfil-c` (ya existe):
- GET → lista de los 484 clientes con grado provisional C
- POST `/:cliente_id/complete` → marca `revision_guiada_completada=true` + recalcula grado real

Integración en `/clientes/perfilado`:
- Filtro pill `C` muestra TODOS (revisados + provisionales)
- Toggle adicional dentro de pill C: `[Todos C] [C real] [C provisional]`
- O alternativo: nueva pill independiente `C-prov` (decidir con Carlos — propongo toggle dentro porque suma a 7 pills + 1 toggle, mejor que 8 pills)

---

## 7. ASCII Mockup desktop final 1440px

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ ☰  GestoriaRD    ⌘K Buscar…                          + Nuevo ▼   🔔   Avatar admin       │
├────────┬───────────────────────────────────────────────────────────────────────────────────┤
│ Side   │                                                                                    │
│ atenuat│  Perfilado de Clientes                                                             │
│        │  Clasificación A-F por cumplimiento fiscal, rentabilidad y gestión documental     │
│ Dash   │                                                                                    │
│ Chat   │  ┌─────────────┐┌─────────────┐┌─────────────┐┌─────────────┐                    │
│ Cli★   │  │ Total        ││ Grado prom.  ││ En riesgo    ││ Sin clasific.│  ← Stripe KPI    │
│ Perfil★│  │ 503          ││ C+   ▲ 0.3  ││ 12           ││ 484          │                 │
│ Casos  │  │              ││ vs mes ant.  ││ D+E+F        ││ Provisional C│                 │
│ Agend  │  └─────────────┘└─────────────┘└─────────────┘└─────────────┘                    │
│ Form   │                                                                                    │
│ QB     │  ┌─[Todos 503]──[A 23]──[B 87]──[C 484]──[D 7]──[E 4]──[F 1]─┐  ← pills filtro   │
│ DGII   │                                                                                    │
│ TSS    │  🔍 Buscar nombre/RNC…    Sort: [Score desc ▼]   ☐ Solo con alertas               │
│ Score  │                                                              [+ Nuevo cliente]     │
│ Bibli  │                                                                                    │
│        │  ┌──────────────────────────────────────────────────────────────────────────────┐ │
│        │  │ Grado │ Cliente / RNC          │ Sector      │ Fact. mensual │Score│Alertas│› │ │
│        │  ├───────┼────────────────────────┼─────────────┼───────────────┼─────┼───────┼──┤ │
│        │  │  [A]  │ Huyghu SRL              │ Servicios   │ RD$ 312,500   │ 87 ▲│   —   │→│ │
│        │  │       │ 130309094               │             │               │     │       │  │ │
│        │  ├───────┼────────────────────────┼─────────────┼───────────────┼─────┼───────┼──┤ │
│        │  │  [B]  │ Bridaspak                │ Comercio    │ RD$ 188,200   │ 72  │  1   │→│ │
│        │  │       │ 401501234               │             │               │     │      │  │ │
│        │  ├───────┼────────────────────────┼─────────────┼───────────────┼─────┼───────┼──┤ │
│        │  │  [C-] │ Unitep Partner Group     │ Servicios   │ —             │ —   │  —   │→│ │
│        │  │       │ 130842715               │             │               │     │       │  │ │
│        │  │   ↑ outline gris = provisional, sin revisión guiada                            │ │
│        │  ├───────┼────────────────────────┼─────────────┼───────────────┼─────┼───────┼──┤ │
│        │  │  [D]  │ Hispanila Adventure…    │ Turismo     │ RD$  85,000   │ 38 ▼│  3   │→│ │
│        │  │       │ 131204567               │             │               │     │       │  │ │
│        │  ├───────┼────────────────────────┼─────────────┼───────────────┼─────┼───────┼──┤ │
│        │  │  [F]  │ FERMIN EBANISTERIA…    │ Manufactura │ RD$  12,400   │ 11 ▼│  6   │→│ │
│        │  │       │ 131089012               │             │               │     │       │  │ │
│        │  └──────────────────────────────────────────────────────────────────────────────┘ │
│        │                                                                                    │
│        │   ◀ 1 2 3 … 11 ▶          Mostrando 1-50 de 503                                   │
│        │                                                                                    │
└────────┴───────────────────────────────────────────────────────────────────────────────────┘

  Al filtrar [C 484]:
  ┌────────────────────────────────────────────────────────────────────────┐
  │ 🟡 484 clientes con grado provisional C — pendientes revisión guiada. │
  │    [Iniciar revisión guiada →]   [Cerrar banner]                       │
  └────────────────────────────────────────────────────────────────────────┘
  + toggle inline: [Todos C] [C real] [C provisional ●]
```

---

## 8. ASCII Mockup Modal Cliente Detalle desktop

Click fila → modal centrado 720px ancho (puede toggle a side-drawer derecho 480px en futuro):

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                                                       [✕ Cerrar] │
│ ┌──────────────────────────────────────────────────────────────────────────────┐│
│ │                  ╔══════════════ gradient #00C48C → bg ══════════════╗      ││  ← header
│ │   ┌────┐         ║                                                    ║      ││     gradient
│ │   │ A  │  44x44  ║  Huyghu SRL                            Score       ║      ││     color grado
│ │   │    │ badge   ║  RNC 130309094 · Servicios profesionales            ║      ││
│ │   └────┘         ║  Cliente desde: 12-mar-2014                  87    ║      ││
│ │                  ║                                              ▲ 3   ║      ││
│ │                  ║  ┌─────────────────────────────────────────┐       ║      ││
│ │                  ║  │ Grado A · Excelente · Cliente ideal     │       ║      ││
│ │                  ║  └─────────────────────────────────────────┘       ║      ││
│ │                  ╚════════════════════════════════════════════════════╝      ││
│ │                                                                              ││
│ │   ─── ✨ Resumen IA (Karbon-style) ────────────────────────────────────────  ││
│ │   "Cliente al día con DGII. Próx IT-1 mayo en 6d. 12 facturas FacturaIA      ││
│ │    sin clasificar. Yolanda llamó ayer pidiendo TXT 606."                     ││
│ │                                                                              ││
│ │   [Perfil] [Criterios] [Alertas (0)] [Historial]                            ││  ← 4 tabs
│ │    ───────                                                                   ││
│ │                                                                              ││
│ │   ┌─────────────────────────────┐  ┌─────────────────────────────┐         ││
│ │   │ 💰 Facturación mensual       │  │ 🏢 Sector                    │         ││  ← Tab Perfil
│ │   │ RD$ 312,500                 │  │ Servicios profesionales      │         ││     4 InfoCards
│ │   │ ▲ 12% vs mes anterior       │  │ Régimen ordinario            │         ││     grid 2x2
│ │   └─────────────────────────────┘  └─────────────────────────────┘         ││
│ │   ┌─────────────────────────────┐  ┌─────────────────────────────┐         ││
│ │   │ 👤 Encargado                 │  │ 📋 DGII e-CF                 │         ││
│ │   │ Sarah Pérez ★                │  │ 🟢 Emisor electrónico activo │         ││
│ │   │ Asignado 03-ene-2024         │  │ NCF: e-CF tipo 31            │         ││
│ │   └─────────────────────────────┘  └─────────────────────────────┘         ││
│ │                                                                              ││
│ │   ─── 📝 Notas internas ───────────────────────────────────────────────────  ││
│ │   • "Cliente prefiere WhatsApp para urgencias. Llamar después 4pm."         ││
│ │   • "Tiene IR-3 cuotas trimestrales — recordar 15-jun."                     ││
│ │   [+ Añadir nota]                                                            ││
│ │                                                                              ││
│ ├──────────────────────────────────────────────────────────────────────────────┤│
│ │   [Editar perfil]                            [Recalcular grado] ←#00C48C    ││  ← footer
│ └──────────────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 8.1 Tab Criterios (6 filas con ScoreBar)

```
   ─── Cálculo del Score ─────────────────────────────────────────────────
   
   1. Puntualidad de pagos                                       25%
      ████████████████░░░░  85 × 0.25 = 21.25
   
   2. Completitud de documentos                                  20%
      ███████████████████░  95 × 0.20 = 19.00
   
   3. Capacidad de respuesta                                     15%
      ██████████████░░░░░░  72 × 0.15 = 10.80
   
   4. Cumplimiento ITBIS                                         20%
      █████████████████░░░  88 × 0.20 = 17.60
   
   5. Calidad NCF/e-CF                                           10%
      ████████████████░░░░  82 × 0.10 =  8.20
   
   6. Volumen/rentabilidad                                       10%
      ██████████████████░░  92 × 0.10 =  9.20
   
   ──────────────────────────────────────────────────────────────────────
   TOTAL PONDERADO                                                   86.05
                                                              → Grado A
```

### 8.2 Tab Alertas

```
   ─── Alertas DGII activas ──────────────────────────────────────────────
   
   ✓ Sin alertas activas
   
   "Cliente al día con todas sus obligaciones fiscales."
```

Si hay alertas:

```
   🔴 IT-1 abril vencida           Hace 5 días     [Subsanar →]
   ⚠ 606 mayo por vencer            En 6 días       [Generar TXT →]
   ⚠ NCF e-CF próximos a vencer    27 NCF en 30d   [Ver detalle →]
```

### 8.3 Tab Historial

```
   ─── Audit trail (filtro: [Todos] [Grado] [Form] [Comm] [Sistema]) ─────
   
   ◆ 13-may 14:22  Grado recalculado: B → A                      Sistema
   ◆ 12-may 09:15  IT-1 abril generado y enviado                 Mark
   ◆ 11-may 16:48  Yolanda · WhatsApp · "Subí 12 facturas hoy"   Yolanda
   ◆ 10-may 11:30  606 abril entregado a DGII                    Sarah ★
   ◆ 10-may 11:30  607 abril entregado a DGII                    Sarah ★
   ◆ 05-may 10:00  IR-17 trimestral enviado                      Sarah ★
   ◆ 03-may 08:45  Nota añadida: "Cliente prefiere WhatsApp…"    Sarah ★
   ◆ 01-may 00:00  QBO sync — 24 invoices importadas             Sistema
   
   [Cargar más]
```

---

## 9. ASCII Mockup mobile 375px

```
┌──────────────────────────┐
│ ☰  Perfilado A-F    🔍 ⋯ │
├──────────────────────────┤
│                          │
│ Perfilado de Clientes    │
│ Clasificación A-F        │
│                          │
│ ┌─────────┬─────────┐   │  ← KPI 2x2
│ │ Total   │ Grado p.│   │
│ │ 503     │ C+ ▲    │   │
│ ├─────────┼─────────┤   │
│ │ Riesgo  │ Sin clas│   │
│ │ 12      │ 484     │   │
│ └─────────┴─────────┘   │
│                          │
│ ◀ pills scroll ▸         │  ← pills horiz scroll
│ [Todos][A 23][B 87]…    │
│                          │
│ 🔍 Buscar…   ↕ Sort      │
│                          │
│ ┌──────────────────────┐ │  ← card
│ │ ┌──┐ Huyghu SRL       │ │
│ │ │A │ 130309094         │ │
│ │ └──┘ Servicios prof.   │ │
│ │                        │ │
│ │ Score 87 ▲             │ │
│ │ Fact. RD$ 312,500      │ │
│ │ ─────────────────────  │ │
│ │ ✓ Sin alertas       →  │ │
│ └──────────────────────┘ │
│                          │
│ ┌──────────────────────┐ │
│ │ ┌──┐ Bridaspak         │ │
│ │ │B │ 401501234         │ │
│ │ └──┘ Comercio          │ │
│ │                        │ │
│ │ Score 72               │ │
│ │ Fact. RD$ 188,200      │ │
│ │ ─────────────────────  │ │
│ │ ⚠ 1 alerta           → │ │
│ └──────────────────────┘ │
│                          │
│ ┌──────────────────────┐ │
│ │ ┌──┐ Unitep Partner   │ │  ← C provisional
│ │ │C-│ 130842715         │ │     badge outline
│ │ └──┘ Servicios         │ │
│ │                        │ │
│ │ Score —                │ │
│ │ Fact. —                │ │
│ │ ─────────────────────  │ │
│ │ Sin revisión guiada → │ │
│ └──────────────────────┘ │
│                          │
│ ◀ Pág 1 de 11 ▶          │
└──────────────────────────┘
```

**Tap card → bottom-sheet fullscreen modal**:

```
┌──────────────────────────┐
│ ← Huyghu SRL        ⋯    │
├──────────────────────────┤
│ ╔═══ gradient #00C48C ═══╗│  ← header gradient
│ ║  [A] Huyghu SRL       ║│
│ ║  130309094 · Servicios║│
│ ║                        ║│
│ ║  Score 87 ▲ 3          ║│
│ ║  Grado A · Excelente   ║│
│ ╚═══════════════════════╝│
│                          │
│ ✨ "Cliente al día. IT-1 │
│  mayo en 6d. 12 facts…" │
│                          │
│ ◀ Perfil Criterios Alert.│  ← tabs swipe horiz
│   ──────                  │
│                          │
│ ┌──────────────────────┐ │
│ │ 💰 Fact. mensual      │ │  ← InfoCards
│ │ RD$ 312,500           │ │     stack vertical
│ │ ▲ 12% vs mes ant.     │ │     (no 2x2 grid)
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ 🏢 Sector             │ │
│ │ Servicios profesion.  │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ 👤 Encargado          │ │
│ │ Sarah Pérez ★         │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ 📋 DGII e-CF          │ │
│ │ 🟢 Emisor activo      │ │
│ └──────────────────────┘ │
│                          │
│ ─── 📝 Notas internas ─  │
│ • "Prefiere WhatsApp…"   │
│ • "IR-3 trimestral…"     │
│ [+ Añadir nota]          │
│                          │
├──────────────────────────┤
│ [Editar]   [Recalcular] ←│  ← footer sticky
└──────────────────────────┘
```

---

## 10. Design tokens (dark theme oficial Carlos)

```jsonc
{
  "color": {
    "bg":           "#0a0f18",
    "bg-card":      "#111820",
    "bg-card-hov":  "#161e28",
    "border":       "#ffffff0d",         // rgba(255,255,255,0.05)
    "border-hov":   "#ffffff1a",         // rgba(255,255,255,0.10)
    "text":         "#c8d3f0",
    "text-muted":   "#7a86a3",
    "text-strong":  "#ffffff",
    "grade-a":      "#00C48C",
    "grade-b":      "#4C9EFF",
    "grade-c":      "#F5A623",
    "grade-c-prov": "#7a86a3",           // outline gris para provisionales
    "grade-d":      "#FF6B35",
    "grade-e":      "#E0245E",
    "grade-f":      "#B00020",
    "success":      "#00C48C",
    "warning":      "#F5A623",
    "danger":       "#E0245E",
    "info":         "#4C9EFF"
  },
  "type": {
    "sans":      "'DM Sans', system-ui, sans-serif",
    "mono":      "'DM Mono', 'JetBrains Mono', monospace",
    "h1":        "28/700 -0.02em (DM Sans)",
    "h2":        "20/600 -0.01em (DM Sans)",
    "body":      "14/400 (DM Sans)",
    "caption":   "12/500 0.02em (DM Sans)",
    "score":     "32/700 (DM Mono)",
    "rnc":       "13/400 (DM Mono)",
    "facturacion": "15/500 tabular-nums (DM Mono)"
  },
  "radius":  { "sm": 6, "md": 9, "lg": 12, "xl": 16, "pill": 999 },
  "spacing": { "1": 4, "2": 8, "3": 12, "4": 16, "5": 20, "6": 24, "8": 32, "10": 40 },
  "shadow":  {
    "card":   "0 1px 2px rgba(0,0,0,0.4)",
    "modal":  "0 24px 64px rgba(0,0,0,0.6)",
    "bottom-sheet": "0 -8px 24px rgba(0,0,0,0.5)"
  },
  "layout": {
    "sidebar-w":  "224px",
    "modal-w":    "720px",
    "row-h":      "72px",
    "touch-min":  "44px",
    "pill-h":     "36px",
    "score-bar-h":"6px"
  },
  "animation": {
    "modal-in":  "180ms cubic-bezier(0.16, 1, 0.3, 1)",
    "modal-out": "120ms ease-out",
    "pill-tap":  "80ms ease-out"
  }
}
```

---

## 11. computeScore — implementación

```typescript
// app/clientes/perfilado/_lib/computeScore.ts
import { CRITERIA_CONFIG } from './criteriaConfig';

export type CriterioScore = {
  id: 'puntualidad' | 'completitud' | 'respuesta' | 'itbis' | 'ncf' | 'volumen';
  score: number;       // 0-100
};

export function computeScore(criterios: CriterioScore[]): number {
  return criterios.reduce((acc, c) => {
    const cfg = CRITERIA_CONFIG[c.id];
    return acc + (c.score * cfg.weight) / 100;
  }, 0);
}

export function deriveGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'E' | 'F' {
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  if (score >= 25) return 'E';
  return 'F';
}
```

```typescript
// app/clientes/perfilado/_lib/criteriaConfig.ts
export const CRITERIA_CONFIG = {
  puntualidad:  { label: 'Puntualidad de pagos',        weight: 25 },
  completitud:  { label: 'Completitud de documentos',   weight: 20 },
  respuesta:    { label: 'Capacidad de respuesta',      weight: 15 },
  itbis:        { label: 'Cumplimiento ITBIS',          weight: 20 },
  ncf:          { label: 'Calidad NCF/e-CF',            weight: 10 },
  volumen:      { label: 'Volumen/rentabilidad',        weight: 10 }
} as const;

// Verificación: pesos suman 100
const TOTAL_WEIGHT = Object.values(CRITERIA_CONFIG).reduce((a, c) => a + c.weight, 0);
if (TOTAL_WEIGHT !== 100) throw new Error(`CRITERIA weights must sum 100, got ${TOTAL_WEIGHT}`);
```

```typescript
// app/clientes/perfilado/_lib/gradeConfig.ts
export const GRADE_CONFIG = {
  A: { color: '#00C48C', label: 'Excelente',     desc: 'Cliente ideal, puntual, documentación completa' },
  B: { color: '#4C9EFF', label: 'Bueno',         desc: 'Cumple bien, mínimas correcciones' },
  C: { color: '#F5A623', label: 'Regular',       desc: 'Retrasos ocasionales, documentación incompleta' },
  D: { color: '#FF6B35', label: 'Bajo',          desc: 'Problemas frecuentes, facturas tardías' },
  E: { color: '#E0245E', label: 'Crítico',       desc: 'Incumplimiento grave, DGII alertas activas' },
  F: { color: '#B00020', label: 'Riesgo Total',  desc: 'No recomendado, mora, posible baja' }
} as const;
```

---

## 12. Lista archivos nuevos para gestoriard (handoff)

### Frontend (Next.js 15 / App Router)

```
app/clientes/perfilado/
├── page.tsx                                # Vista principal /clientes/perfilado
├── loading.tsx                              # Skeleton mientras fetch
├── error.tsx                                # Error boundary
├── _components/
│   ├── PerfiladoHeader.tsx                 # Title + subtitle
│   ├── KpiBar.tsx                          # 4 metric cards (Stripe-style)
│   ├── GradePills.tsx                      # 7 pills filtro con counts
│   ├── ToolBar.tsx                         # Search + Sort + Solo con alertas + Nuevo cliente
│   ├── PerfiladoTable.tsx                  # Tabla desktop 7 cols
│   ├── PerfiladoCard.tsx                   # Card mobile
│   ├── PerfiladoTableRow.tsx               # Fila individual (memo)
│   ├── GradeBadge.tsx                      # Badge A-F con variant 'solid'|'outline'
│   ├── ScoreCell.tsx                       # Score con trend ▲▼
│   ├── AlertasCell.tsx                     # Pill count o "—"
│   ├── CProvisionalBanner.tsx              # Banner amarillo 484 clientes
│   ├── PerfiladoModal.tsx                  # Modal contenedor
│   ├── ModalHeader.tsx                     # Header gradient color grado + badge 44x44
│   ├── ResumenIaBanner.tsx                 # AI summary Karbon-style
│   ├── ModalTabs.tsx                       # Tabs Perfil/Criterios/Alertas/Historial
│   ├── tab-perfil/
│   │   ├── InfoCardsGrid.tsx              # 4 InfoCard 2x2
│   │   ├── InfoCard.tsx                   # Card individual
│   │   └── NotasInternas.tsx              # Lista notas + add
│   ├── tab-criterios/
│   │   ├── CriteriosList.tsx              # 6 filas ScoreBar
│   │   ├── ScoreBar.tsx                   # Barra horizontal + score + weight
│   │   └── ScoreTotal.tsx                 # Total ponderado + grado derivado
│   ├── tab-alertas/
│   │   ├── AlertasList.tsx                # Lista pills rojas o check empty state
│   │   └── AlertaItem.tsx                 # Pill individual
│   ├── tab-historial/
│   │   ├── HistorialTimeline.tsx          # Audit trail filtrable
│   │   ├── HistorialItem.tsx              # Fila individual
│   │   └── HistorialFilters.tsx           # Filtros por tipo
│   ├── BottomSheet.tsx                     # Mobile modal alternativo
│   └── Pagination.tsx                      # Paginación 1 2 3 ... 11
└── _lib/
    ├── gradeConfig.ts                      # GRADE_CONFIG con colores y labels
    ├── criteriaConfig.ts                   # CRITERIA_CONFIG pesos
    ├── computeScore.ts                     # computeScore + deriveGrade
    ├── useClientesPerfilado.ts             # SWR/React Query hook
    └── types.ts                            # TypeScript types
```

### Backend (API routes)

```
app/api/v2/clientes/perfilado/
├── route.ts                                # GET con filters + pagination + facets

app/api/v2/clientes/[id]/recalcular-grado/
└── route.ts                                # POST recalcula grado on-demand

app/api/v2/clientes/revision-guiada-perfil-c/
└── (existente — solo verificar integración)
```

### Migrations BD

```
migrations/2026-05-14-perfilado-revision-guiada/
├── up.sql                                  # ALTER TABLE clientes_perfilado + indexes
└── down.sql                                # Rollback
```

```sql
-- migrations/2026-05-14-perfilado-revision-guiada/up.sql
ALTER TABLE clientes_perfilado
  ADD COLUMN IF NOT EXISTS revision_guiada_completada BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS revision_guiada_fecha TIMESTAMPTZ NULL;

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
```

### Sidebar nav update

`components/Sidebar.tsx` añadir entrada:

```tsx
{ href: '/clientes/perfilado', label: 'Perfilado A-F', icon: <BadgeCheck />, badge: 484 }
```

---

## 13. Verificación pre-deploy Chrome MCP

- [ ] 1440px desktop: KPI bar + pills + tabla + modal sin overflow
- [ ] 768px tablet: tabla con scroll horizontal OR cards si <900px
- [ ] 375px mobile: cards stack + bottom sheet fullscreen + pills swipe
- [ ] Multi-tenant: Yolanda Huyghu vs otro tenant — sin leak
- [ ] Filtros: pill `[C 484]` muestra 484 con banner provisional
- [ ] Sort: cada col tabla ordenable (asc/desc toggle)
- [ ] Search: typing en buscador con debounce 300ms
- [ ] Pagination: navegar pág 1 → 11 → última
- [ ] Modal: tabs Perfil/Criterios/Alertas/Historial cambian sin recargar fetch
- [ ] Modal mobile: swipe down cierra
- [ ] Score recalculo: click "Recalcular grado" → POST → re-fetch tabla
- [ ] Empty state: filtro [F 1] muestra solo 1 cliente
- [ ] Empty state Alertas: check-circle "Sin alertas activas"
- [ ] Console: 0 errors, 0 warnings, 0 hydration crashes
- [ ] A11y: contraste dark theme `#c8d3f0` sobre `#0a0f18` (verificar ≥ 4.5:1)
- [ ] A11y: badges A-F nunca solo color (letra siempre visible)
- [ ] Performance: 503 clientes paginados — LCP < 2s, CLS < 0.1
- [ ] Loading state: skeleton mientras fetch
- [ ] Error state: 500 muestra retry, no pantalla blanca
- [ ] DM Sans + DM Mono cargan via next/font (no FOUT)

---

## 14. §11 Hallazgos arquitecturales

### 14.1 Sistema/Repo

1. **Schema BD necesita migration**: añadir `revision_guiada_completada` + `revision_guiada_fecha`. Sin esto no podemos distinguir "C real" vs "C provisional" (los 484).
2. **Indexes BD obligatorios** para perf con 503+ clientes: pg_trgm para fuzzy search, btree para grade/sector/RNC prefix. Sin esto, `ILIKE '%huyghu%'` hace seq scan.
3. **Facets en respuesta API**: la query agregada `GROUP BY grade` debe correr en paralelo (no secuencial) con la query de data — propongo `Promise.all` en el route handler.
4. **DM Sans + DM Mono no están en el bundle** — `next/font/google` debe importarlas. Verificar `app/layout.tsx`.
5. **Dark theme tokens** no están en el design system actual (`/builds/gestion-contadores-rd/app/styles/`). Crear `tokens/dark-perfilado.css` o extender Tailwind config con `--bg-perfilado: #0a0f18`. Mejor: namespace para evitar conflicto con tema light global.
6. **Endpoint `/api/v2/clientes/revision-guiada-perfil-c` ya existe** según prompt SM, pero NO he leído su código. Asumo GET retorna lista + POST `/:id/complete` marca completed. Si la implementación difiere, hay que reconciliar.

### 14.2 Prompt/Comunicación

1. Carlos no especificó si **C provisional** debe ser **pill independiente** (8 pills total) o **toggle dentro de pill C** (7 pills + sub-toggle). Decidí toggle dentro porque 8 pills se sale del header en mobile 375.
2. No especificó **qué tabla BD** alimenta `Facturación mensual` — asumo agg de `facturas_clientes` o columna denormalizada en `clientes_perfilado.facturacion_mensual`. Si es agg en vivo, ojo perf con 503 clientes × N facturas/cliente.
3. AI Summary en modal — no estaba en mockup React Carlos, lo añadí inspirado Karbon. **Confirmar si Carlos lo quiere o si lo deja para `/clientes/[id]` v3 únicamente**.
4. KPI bar de 4 metric cards arriba de tabla — no estaba en mockup React Carlos. La añadí inspirada Stripe. **Confirmar si la quiere o no** (ahorra fetch + DOM si no la quiere).

### 14.3 Flujo/Proceso

1. **`/clientes/perfilado` vs `/clientes/[id]` v3**: hoy son 2 páginas distintas. Yolanda LUNES necesita `/clientes/perfilado` urgente. `/clientes/[id]` v3 (mockup KB 16921) es sprint posterior. Confirmar prioridades con Carlos.
2. **Coexistencia con `/v2` actual**: `/v2` redirige a `/dashboard/`. La nueva `/clientes/perfilado` debe estar en sidebar — no reemplaza `/v2` ni `/dashboard`. Verificar que no se rompe nav.
3. **Recalcular grado**: ¿es síncrono (POST → 200 → re-render) o async (POST → 202 → polling)? Para 1 cliente debería ser síncrono <500ms. Para batch recalc (todos los 484 a la vez) probablemente async + WebSocket o SWR revalidate.
4. **Multi-tenant**: el endpoint debe inyectar `tenant_id` desde session, no aceptarlo como query param. Verificar middleware `withAuth` en route.

---

## 15. Decisión final consolidada

| # | Decisión | Status |
|---|---|---|
| 1 | Vista única (no 5 tabs `/v2`) | ✅ confirmado Carlos |
| 2 | Integrar referentes: Stripe KPI + Karbon AI + Linear filtros + TaxDome modal grid + FC audit | ✅ propuesta |
| 3 | Mobile 375 → cards + bottom sheet | ✅ propuesta |
| 4 | Columnas español RD ("Grado", "Cliente / RNC", "Fact. mensual", "Score (0-100)", "Alertas DGII", "Detalle") | ✅ propuesta |
| 5 | 503 clientes → paginación 50/pág server-side + facets + indexes pg_trgm | ✅ propuesta |
| 6 | 484 C provisional → migration BD + badge outline + banner amarillo + toggle inline | ✅ propuesta |

**Pendiente confirmación Carlos** (§11 hallazgos):
- ¿KPI bar 4 metric cards arriba de tabla? (mi propuesta Stripe-style)
- ¿AI Summary en modal Tab Perfil? (mi propuesta Karbon-style)
- ¿C provisional pill 8 separada o toggle dentro de C?
- ¿Side-drawer alternativo al modal centrado (preferencia user)?

═══ FIRMA ═══ FacturaIA / 2026-05-14 / propuesta-unificada-perfilado-AF
