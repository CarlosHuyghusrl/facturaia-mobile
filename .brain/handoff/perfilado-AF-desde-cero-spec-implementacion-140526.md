# Perfilado A-G — Spec Implementación desde Cero

**ID**: `perfilado-AF-desde-cero-spec-implementacion-140526`
**Fecha**: 2026-05-14
**Autor**: FacturaIA → handoff gestoriard
**Directiva Carlos**: "lo viejo está feo y no funciona. Desde cero."
**Wing/Room destino**: facturaia / integraciones-saas
**Stack confirmado**: Next.js 15.5.16 + React 19.1 + Tailwind v4 + Supabase self-hosted + Coolify deploy

---

## 0. Brief gestoriard (lee ESTO primero)

Vas a hacer **7 waves** construyendo desde cero el módulo Perfilado A-G en GestoríaRD. **No mires el código viejo de `app/clientes/[id]/page.tsx` ni `revision-guiada-perfil-c/page.tsx` actuales** — Carlos los marcó como "feos, sin sentido, no funcionan".

Lo que **SÍ** debes respetar del repo:
1. **Schema BD real** (sección §2) — columnas que ya existen son la fuente de verdad.
2. **Middleware multi-tenant** `withEmpresaContext` + `getEmpresaId(request)` + `current_empresa_id()` SQL function — patrón establecido, lo reutilizas.
3. **4 endpoints API ya funcionales** (sección §4) — los consume tu UI nueva, no los toques.
4. **Tokens dark scoped** (`data-theme="perfilado-dark"`) — no contaminas el resto del SaaS light.

Lo que **construyes desde cero**:
- 3 páginas nuevas: listado A-G, ficha cliente 360, revisión guiada triage AI.
- ~20 componentes nuevos.
- 4 endpoints API nuevos (preview-diff, perfilado list, obligaciones-mes, sugerencia-ai).

**Si encuentras conflicto** durante deploy (ej. ruta vieja `/clientes/perfilado` retorna 500 actualmente porque colisiona con `[id]`): **marca y A2A FacturaIA**. No parches.

**Versión de perfiles**: el schema BD acepta **A-G (7 letras)** según `PATCH /api/v2/clientes/[id]/perfil`. **Adapto mi propuesta original A-F a A-G**, donde **G = "Sin clasificar"** (reemplaza el concepto "C provisional" del mockup anterior).

---

## 1. Plan de reemplazo — archivos a CREAR / a DEPRECAR

### 1.1 CREAR DESDE CERO (28 archivos · ~5,400 LOC)

#### Páginas (3)

| Archivo | LOC | Reemplaza |
|---|---|---|
| `app/clientes/perfilado-af/page.tsx` | 220 | ruta nueva (la `/clientes/perfilado` actual retorna 500 — usar `/perfilado-af` para evitar colisión namespace con `[id]`) |
| `app/clientes/[id]/page.tsx` | 280 | reemplaza completo el 1889 LOC viejo |
| `app/clientes/revision-guiada-perfil-c/page.tsx` | 200 | reemplaza el 736 LOC viejo (mantiene la ruta porque ya está en sidebar) |

#### Componentes Cliente Detalle (6)

| Archivo | LOC |
|---|---|
| `app/clientes/[id]/_components/ClienteHeader.tsx` | 120 |
| `app/clientes/[id]/_components/StageTracker.tsx` | 80 |
| `app/clientes/[id]/_components/AiSummaryBanner.tsx` | 50 |
| `app/clientes/[id]/_components/ColAcerca.tsx` | 100 |
| `app/clientes/[id]/_components/ColActividad.tsx` | 140 |
| `app/clientes/[id]/_components/ColObligacionesMes.tsx` | 120 |

#### Componentes Listado Perfilado (5)

| Archivo | LOC |
|---|---|
| `app/clientes/perfilado-af/_components/PerfiladoTable.tsx` | 140 |
| `app/clientes/perfilado-af/_components/PerfiladoCard.tsx` (mobile) | 80 |
| `app/clientes/perfilado-af/_components/KpiBar.tsx` | 60 |
| `app/clientes/perfilado-af/_components/GradePills.tsx` | 70 |
| `app/clientes/perfilado-af/_components/Pagination.tsx` | 60 |

#### Componentes Revisión Guiada (5)

| Archivo | LOC |
|---|---|
| `app/clientes/revision-guiada-perfil-c/_components/TriageCard.tsx` | 160 |
| `app/clientes/revision-guiada-perfil-c/_components/AiSugerencia.tsx` | 90 |
| `app/clientes/revision-guiada-perfil-c/_components/DecisionGrid.tsx` | 100 |
| `app/clientes/revision-guiada-perfil-c/_components/SesionStats.tsx` | 60 |
| `app/clientes/revision-guiada-perfil-c/_components/ProgressBar.tsx` | 40 |

#### Componentes compartidos `app/clientes/_components/` (4)

| Archivo | LOC |
|---|---|
| `app/clientes/_components/GradeBadge.tsx` | 80 |
| `app/clientes/_components/CambiarPerfilPopover.tsx` | 220 |
| `app/clientes/_components/DiffPreview.tsx` | 120 |
| `app/clientes/_components/HistorialPerfilModal.tsx` | 80 |

#### Componentes globales (3)

| Archivo | LOC |
|---|---|
| `app/components/global/CommandPalette.tsx` | 200 |
| `app/components/global/KeyboardShortcuts.tsx` | 80 |
| `app/components/global/PerfiladoThemeWrapper.tsx` | 30 |

#### Lib (5)

| Archivo | LOC |
|---|---|
| `lib/perfilado/gradeConfig.ts` | 50 |
| `lib/perfilado/criteriaConfig.ts` | 30 |
| `lib/perfilado/computeScore.ts` | 50 |
| `lib/perfilado/derivePipelines.ts` | 60 |
| `lib/perfilado/permissions.ts` | 40 |

#### Hooks (4)

| Archivo | LOC |
|---|---|
| `app/hooks/useGradeShortcuts.ts` | 60 |
| `app/hooks/useCommandPalette.ts` | 40 |
| `app/hooks/useCambiarPerfil.ts` | 70 |
| `app/hooks/usePerfiladoList.ts` | 80 |

#### Styles (1)

| Archivo | LOC |
|---|---|
| `app/styles/perfilado-dark.css` | 80 |

#### APIs nuevas (4)

| Archivo | LOC |
|---|---|
| `app/api/v2/clientes/perfilado-af/route.ts` | 200 |
| `app/api/v2/clientes/[id]/preview-diff/route.ts` | 100 |
| `app/api/v2/clientes/[id]/obligaciones-mes/route.ts` | 120 |
| `app/api/v2/clientes/revision-guiada-perfil-c/sugerencia-ai/route.ts` | 140 |

**TOTAL CREAR**: ~5,400 LOC en 28 archivos nuevos.

### 1.2 DEPRECAR / REEMPLAZAR (4 archivos viejos)

| Archivo viejo | LOC actual | Acción gestoriard |
|---|---|---|
| `app/clientes/[id]/page.tsx` | 1,889 | **REEMPLAZAR** por el page.tsx nuevo (mismo path, swap completo) |
| `app/clientes/[id]/v2/page.tsx` | 1,767 | **ELIMINAR** después del swap (era versión paralela) |
| `app/clientes/[id]/components/Tab{DGII,Financiero,Reportes,Historial,Grupos}.tsx` | ~5,000 estimado | **ELIMINAR** — UI nueva usa 3 cols en lugar de 5 tabs |
| `app/clientes/revision-guiada-perfil-c/page.tsx` | 736 | **REEMPLAZAR** por nuevo (mismo path) |

**NO tocar**: `app/clientes/page.tsx` (listado general clientes — fuera de scope), `app/components/clientes/ModalPerfilCliente.tsx` (gestoriard decide al ver si lo necesita o no — mi mockup no lo usa).

---

## 2. Schema BD verificado (lectura real del repo, no asumir)

### 2.1 Tabla `clientes` — columnas que existen HOY

Confirmadas por `app/api/v2/clientes/[id]/route.ts` + `revision-guiada-perfil-c/route.ts` + `perfil/route.ts`:

```
id                    UUID PK
razon_social          TEXT
rnc_cedula            TEXT       -- 9-10 dig = PJ, 11 dig = PF cédula
email                 TEXT
telefono              TEXT
direccion             TEXT
nombre                TEXT       -- legacy?
nombre_comercial      TEXT
tipo_persona          TEXT       -- 'PF'|'PJ'|otro
actividad_economica   TEXT       -- frecuentemente NULL en los 484 C
municipio             TEXT       -- frecuentemente NULL
provincia             TEXT       -- frecuentemente NULL
credencial_dgii_id    UUID NULL  -- FK a credenciales DGII
monto_mensual         NUMERIC
tipo_servicio         TEXT
contrato_tipo         TEXT
contador_asignado     TEXT       -- legacy
contador_asignado_id  UUID       -- nuevo
estado                TEXT       -- 'activo'|'inactivo'|...
perfil                CHAR(1)    -- 'A'-'G' (NOTA: 7 letras, NO 6 como mi mockup original)
empresa_id            UUID       -- multi-tenant (NO tenant_id)
created_at            TIMESTAMPTZ
updated_at            TIMESTAMPTZ
```

**⚠ Crítico**: la columna es `perfil` (CHAR(1)) en tabla `clientes`. **NO existe tabla `clientes_perfilado`** como asumió mi mockup original. Adoptar este schema.

### 2.2 Tabla `clientes_perfil_historial` — audit, EXISTE

Confirmada por `app/api/v2/clientes/[id]/historial-perfil/route.ts` + `perfil/route.ts` PATCH:

```
id                BIGSERIAL PK
cliente_id        UUID FK clientes
empresa_id        UUID
perfil_antes      CHAR(1)  NULL   -- primera asignación = null
perfil_despues    CHAR(1)  NOT NULL
razon             TEXT     NULL
source            TEXT             -- 'manual'|'auto_clasificador'|'migracion'|'correccion'|'otro'
confidence        FLOAT    NULL   -- 0.0-1.0 si source=auto
changed_by        VARCHAR(100)    -- email del JWT (NO uuid)
changed_at        TIMESTAMPTZ
metadata          JSONB           -- {via, version, is_provisional, definition_version}
```

**Decisión clave**: NO crear tabla `clientes_cambios_perfil_audit` como proponía mi mockup. **Reutilizar `clientes_perfil_historial`** que ya existe y es perfecta.

### 2.3 Tabla `clientes_perfil_reglas` — perfil → obligaciones, EXISTE

Confirmada por `perfil/route.ts` GET:

```
perfil                    CHAR(1) PK
nombre_perfil             TEXT
formularios_obligatorios  TEXT[] | JSONB   -- ['IT-1','606','607','IR-2',...]
periodicidad              TEXT             -- 'mensual'|'trimestral'|'anual'
activo                    BOOLEAN
```

**Decisión clave**: NO crear `perfilado_pipelines_default` ni `perfilado_obligaciones_default`. **Reutilizar `clientes_perfil_reglas`**. gestoriard debe verificar que el seed data está completo para A-G; si falta, **A2A FacturaIA + contadores Yolanda** para llenar valores (no inventar pipelines).

### 2.4 Tabla `clientes_socios` — existe (referenciada en revision-guiada)

```
cliente_id  UUID FK
... otras columnas socios
```

### 2.5 Tabla `facturas_clientes` — existe

```
cliente_id  UUID FK
... columnas factura
```

### 2.6 NO existen (gestoriard NO debe crearlas)

- ❌ `clientes_perfilado` — la columna `perfil` vive directo en `clientes`.
- ❌ `clientes_cambios_perfil_audit` — usar `clientes_perfil_historial`.
- ❌ `perfilado_pipelines_default` / `perfilado_obligaciones_default` — usar `clientes_perfil_reglas`.

### 2.7 ALTER TABLE / migraciones nuevas necesarias

Tras el análisis: **solo 1 tabla nueva opcional**, el resto reutilizable.

#### Migration nueva: stage tracker 5 etapas (opcional Wave 3)

```sql
-- migrations/2026-05-14-stage-tracker-ciclo-mensual.sql

CREATE TABLE IF NOT EXISTS clientes_ciclo_mensual (
  cliente_id          UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  empresa_id          UUID NOT NULL,
  year_month          CHAR(7) NOT NULL,            -- '2026-05'
  docs_recibidos      BOOLEAN DEFAULT false,
  calculo_listo       BOOLEAN DEFAULT false,
  pre_revisado        BOOLEAN DEFAULT false,
  envio_completado    BOOLEAN DEFAULT false,
  dgii_confirmado     BOOLEAN DEFAULT false,
  updated_by          VARCHAR(100),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (cliente_id, year_month)
);

CREATE INDEX IF NOT EXISTS idx_ciclo_empresa_yearmonth
  ON clientes_ciclo_mensual(empresa_id, year_month);

-- RLS policies (multi-tenant)
ALTER TABLE clientes_ciclo_mensual ENABLE ROW LEVEL SECURITY;
CREATE POLICY ciclo_select ON clientes_ciclo_mensual
  FOR SELECT USING (empresa_id = current_empresa_id());
CREATE POLICY ciclo_modify ON clientes_ciclo_mensual
  FOR ALL USING (empresa_id = current_empresa_id());
```

**Alternativa sin migration**: derivar las 5 etapas en runtime de queries existentes (`formularios_envios`, `clientes_perfil_historial`, etc.). gestoriard decide si crea la tabla o si la stage tracker queda **read-only** desde queries derivadas.

#### Indexes performance (verificar existencia, crear si faltan)

```sql
-- Si NO existen ya
CREATE INDEX IF NOT EXISTS idx_clientes_empresa_perfil
  ON clientes(empresa_id, perfil);

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_clientes_razon_social_trgm
  ON clientes USING gin(razon_social gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_clientes_rnc_prefix
  ON clientes(rnc_cedula text_pattern_ops);

CREATE INDEX IF NOT EXISTS idx_perfil_historial_cliente_at
  ON clientes_perfil_historial(cliente_id, changed_at DESC);
```

gestoriard wave 1: `EXPLAIN ANALYZE` la query de listado A-G con 503 clientes. Si > 200ms, añadir indexes faltantes.

---

## 3. Paleta A-G adaptada (era A-F en mi mockup)

```ts
// lib/perfilado/gradeConfig.ts
export const GRADE_CONFIG = {
  A: { color: '#00C48C', label: 'Excelente',     desc: 'Cliente ideal, puntual, documentación completa' },
  B: { color: '#2DD4BF', label: 'Bueno',         desc: 'Cumple bien, mínimas correcciones' },
  C: { color: '#4C9EFF', label: 'Regular',       desc: 'Retrasos ocasionales, documentación incompleta' },
  D: { color: '#F5A623', label: 'Bajo',          desc: 'Problemas frecuentes, facturas tardías' },
  E: { color: '#A855F7', label: 'Crítico',       desc: 'Incumplimiento grave, DGII alertas activas' },
  F: { color: '#E0245E', label: 'Riesgo Total',  desc: 'No recomendado, mora, posible baja' },
  G: { color: '#6B7280', label: 'Sin clasificar', desc: 'Pendiente de revisión guiada — perfil provisional' },
} as const;

export const GRADE_ORDER = ['A','B','C','D','E','F','G'] as const;
export type Grade = typeof GRADE_ORDER[number];
```

**Decisión**: la letra **G reemplaza al concepto "C provisional"** que mi mockup proponía. Es más limpio: 7 grados oficiales, sin estados híbridos. Los 484 actuales con `perfil='C'` se migran a `perfil='G'` (esto es decisión de Yolanda/Carlos — proponer en wave 1 migration script):

```sql
-- OPCIONAL: migrar los "C provisionales" reales (los que nunca pasaron por audit) a 'G'
UPDATE clientes c
   SET perfil = 'G'
 WHERE c.perfil = 'C'
   AND NOT EXISTS (
     SELECT 1 FROM clientes_perfil_historial h
      WHERE h.cliente_id = c.id
   );
```

Si Carlos **NO quiere** migración, mantener `perfil='C'` para los 484 + UI distingue gris en el badge cuando NO hay historial. Decisión final del SM.

---

## 4. Endpoints API — reutilizar vs nuevos

### 4.1 REUTILIZAR (funcionan, no tocar)

| Endpoint | Método | Función | Multi-tenant |
|---|---|---|---|
| `/api/v2/clientes/[id]` | GET | Detalle cliente individual con `contador_nombre` JOIN | ✅ withEmpresaContext |
| `/api/v2/clientes/[id]/perfil` | GET | Perfil actual + reglas (formularios_obligatorios, periodicidad) | ✅ |
| `/api/v2/clientes/[id]/perfil` | PATCH | Cambia perfil + INSERT audit en `clientes_perfil_historial` | ✅ |
| `/api/v2/clientes/[id]/historial-perfil` | GET | Timeline cronológico filtrable (source/since/until/limit) | ✅ |
| `/api/v2/clientes/revision-guiada-perfil-c` | GET | List paginated 484 + heurística sugerencia inline | ✅ |
| `/api/v2/clientes/[id]/credenciales-dgii` | GET | Credenciales DGII (vault) | ✅ |
| `/api/v2/clientes/[id]/historial-perfil/reveal` | POST | Reveal credenciales con re-auth | ✅ |

### 4.2 CREAR NUEVOS (mi propuesta, no existen)

#### `GET /api/v2/clientes/perfilado-af` (listado con filtros)

```typescript
// Query params
?grade=A|B|C|D|E|F|G|all
&search=<string>          // fuzzy razon_social OR prefix rnc_cedula
&sort=score_desc|name_asc|...
&page=1
&limit=50
&has_alertas=true|false

// Response
{
  success: true,
  data: ClientePerfilRow[],
  pagination: { page, limit, total, total_pages, has_next, has_prev },
  facets: { by_grade: {A,B,C,D,E,F,G: number}, by_sector: {} },
  meta: { grade_promedio, en_riesgo_count, sin_clasificar_count }
}
```

SQL base:
```sql
SELECT c.id, c.razon_social, c.rnc_cedula, c.actividad_economica,
       c.perfil, c.monto_mensual,
       ct.nombre AS contador_nombre,
       (SELECT COUNT(*) FROM clientes_perfil_historial h WHERE h.cliente_id = c.id) AS historial_count
  FROM clientes c
  LEFT JOIN contadores ct ON c.contador_asignado_id = ct.id
 WHERE c.empresa_id = current_empresa_id()
   AND ($1::text IS NULL OR c.perfil = $1)
   AND ($2::text IS NULL OR c.razon_social ILIKE '%' || $2 || '%' OR c.rnc_cedula LIKE $2 || '%')
 ORDER BY <dynamic>
 LIMIT $3 OFFSET $4;
```

#### `GET /api/v2/clientes/[id]/preview-diff?target=X` (impacto cambio)

```typescript
// Response
{
  success: true,
  data: {
    from_perfil: 'C',
    to_perfil: 'A',
    pipelines: { removed: ['RST'], added: ['IT-1','606','607','IR-2'] },
    obligaciones_nuevas: ['IT-1 mensual', 'IR-2 anual'],
    precio_mensual: { from: 4500, to: 7500, diff_pct: 66.7 },
    advertencias: ['Cliente recibirá email si notificar=true']
  }
}
```

Implementación: query `clientes_perfil_reglas` para `from` y `to`, diff arrays.

#### `GET /api/v2/clientes/[id]/obligaciones-mes?month=YYYY-MM` (stage tracker)

```typescript
// Response
{
  success: true,
  data: {
    cliente_id: '...',
    year_month: '2026-05',
    stages: {
      docs_recibidos: true,
      calculo_listo: true,
      pre_revisado: false,
      envio_completado: false,
      dgii_confirmado: false
    },
    obligaciones: [
      { form: 'IT-1', periodo: '2026-04', estado: 'vencida', vence: '2026-05-20', monto: 12800 },
      { form: '606',  periodo: '2026-05', estado: 'por_vencer', vence: '2026-05-15' },
      ...
    ],
    proxima_fecha: '2026-05-15',
    dias_calendario: 3   // +=adelantado, -=atrasado
  }
}
```

Implementación: derivar de `formularios_envios` + `clientes_ciclo_mensual` (si tabla nueva) o solo del primero (si NO creamos tabla).

#### `GET /api/v2/clientes/revision-guiada-perfil-c/sugerencia-ai?cliente_id=...` (upgrade LLM)

El endpoint actual `revision-guiada-perfil-c` ya tiene heurística inline. Este endpoint **opcional Wave 5** invoca Gemini Flash via CLIProxy (`http://localhost:8317/v1/chat/completions`) para mejorar confidence + razones.

```typescript
// Response
{
  success: true,
  data: {
    cliente_id: '...',
    sugerido: 'B',
    confidence: 0.87,
    razones: [
      'RNC cédula 9 dígitos = Persona Jurídica',
      'Sin nómina (no TSS aplicable)',
      'Facturación RD$ 45,200/mes (rango B)',
      'Sector salud (riesgo bajo según histórico)',
      'Sin alertas DGII activas'
    ],
    modelo: 'gemini-2.5-flash',
    fallback_heuristica: false   // true si LLM down
  }
}
```

**Fallback**: si Gemini down, usar la heurística inline existente. UI sigue funcionando.

---

## 5. Mockup ASCII (referencias canónicas — desde KB 16924)

### 5.1 Desktop 1440 — `/clientes/[id]` (Cliente Detalle con modal A-G integrado)

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ GestoriaRD                                                       ⌘K   🔔   Admin          │
├────────┬───────────────────────────────────────────────────────────────────────────────────┤
│ Side   │ Clientes › Huyghu SRL                                                              │
│        │ ┌──────────────────────────────────────────────────────────────────────────────┐ │
│        │ │      ╔════╗   Huyghu SRL                       [✉][📞][📋][+Tarea][Editar][⋯]│ │
│        │ │      ║ HS ║   RNC 130309094 · Servicios profesionales                       │ │
│        │ │      ║72×72║                                                                 │ │
│        │ │      ╚════╝╲[C▾]  ← GradeBadge clickeable → CambiarPerfilPopover anclado    │ │
│        │ └──────────────────────────────────────────────────────────────────────────────┘ │
│        │ ✨ AI Summary: "Cliente al día. Próx IT-1 mayo en 6 días. 12 facturas FacturaIA"  │
│        │ ●───●───◉───○───○   Docs · Calc · Pre-rev · Envío · DGII                          │
│        │                                                                                    │
│        │ ┌─ACERCA──────────┬─ACTIVIDAD──────────────────────┬─OBLIGACIONES MAYO───────────┐│
│        │ │ Tipo Empresa     │ [Notas][Email][Llamadas][Docs] │ ⏳ IT-1 abril vencida       ││
│        │ │ Régimen Ord.     │                                 │ ⚠ 606 mayo en 6 días        ││
│        │ │ RNC 130309094    │ ◆ 13-may Sarah: C → A          │ ⚠ 607 mayo en 6 días        ││
│        │ │ Sector Servicios │ ◆ 12-may Mark email            │ ⏳ TSS mayo pendiente       ││
│        │ │ Empleados 12     │ ◆ 11-may Yolanda WhatsApp      │ ─── Historial perfil ⏱ ───  ││
│        │ │ 🔐 Vault (3)     │ [Cargar más]                    │ • 13-may C→A ✓              ││
│        │ └─────────────────┴────────────────────────────────┴─────────────────────────────┘│
└────────┴───────────────────────────────────────────────────────────────────────────────────┘

Click badge [C▾] → POPOVER anclado:
╭─ Cambiar perfil de Huyghu SRL ────────╮
│ ⓐ A · Excelente              [1]      │
│ ⓑ B · Bueno                  [2]      │
│ ◉ C · Regular (ACTUAL)       [3]      │
│ ⓓ D · Bajo                   [4]      │
│ ⓔ E · Crítico                [5]      │
│ ⓕ F · Riesgo Total ⚠         [6]      │
│ ⓖ G · Sin clasificar         [7]      │
│ ── Preview impacto ──                  │
│ PIPELINES ✗RST ✓Ord                    │
│ OBLIG NUEVAS +IT-1 +IR-2 +ACT          │
│ PRECIO 4500 → 7500                     │
│ Motivo: [______________]               │
│ ☐ Notificar cliente                    │
│ [Cancelar]  [Confirmar Perfil X]       │
╰────────────────────────────────────────╯
```

### 5.2 Tablet 768 — 2 cols + sidebar icons + popover 420px

### 5.3 Mobile 375 — obligaciones ARRIBA + bottom-sheet popover 90vh

(Ver KB 16924 mockups detallados — son canónicos.)

### 5.4 Listado `/clientes/perfilado-af` Desktop 1440

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│ Perfilado de Clientes                                                              │
│ Clasificación A-G por cumplimiento fiscal                                          │
│                                                                                    │
│ ┌──────┐┌──────┐┌──────┐┌──────┐                                                  │
│ │ 503  ││ C+▲  ││ 12   ││ 484  │  ← KPI Stripe                                    │
│ │Total ││Grade ││Riesgo││ Sin  │                                                  │
│ └──────┘└──────┘└──────┘└──────┘                                                  │
│                                                                                    │
│ [Todos][A 23][B 87][C 0][D 7][E 4][F 1][G 484]                                    │
│                                                                                    │
│ 🔍 Buscar…  ↕ Sort: Score desc  [+ Nuevo]                                         │
│                                                                                    │
│ ┌─Grado─┬─Cliente / RNC ────────┬─Sector──┬─Fact.───┬─Score─┬─Alert─┬─→─┐         │
│ │ [A]   │ Huyghu SRL · 130309094 │ Servic. │ 312K    │ 87 ▲  │  —    │ → │         │
│ │ [B]   │ Bridaspak · 401501234   │ Comer.  │ 188K    │ 72    │  1    │ → │         │
│ │ [G]   │ Unitep Partner · 130842715 │ Servic. │ —    │ —     │  —    │ → │         │
│ │ [D]   │ Hispanila · 131204567   │ Turismo │  85K    │ 38 ▼  │  3    │ → │         │
│ │ [F]   │ FERMIN · 131089012      │ Manuf.  │  12K    │ 11 ▼  │  6    │ → │         │
│ └───────┴────────────────────────┴─────────┴─────────┴───────┴───────┴───┘         │
│                                                                                    │
│ ◀ 1 2 3 … 11 ▶  Mostrando 1-50 de 503                                             │
└────────────────────────────────────────────────────────────────────────────────────┘
```

### 5.5 Revisión Guiada Triage

```
Progress 127/484 (26%) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

╔══════════════════════════════════════════════════════════════╗
║ Cliente #128 — Dra. Ana Pérez                                ║
║ RNC 00112345678 · Salud · Honorarios · RD$ 45,200/mes        ║
║                                                              ║
║ ★ SUGERENCIA AI                                              ║
║   B Perfil Bueno         [ 87% ✓ ]                          ║
║   ▸ RNC cédula 9 dígitos                                     ║
║   ▸ Sin nómina (no TSS)                                      ║
║   ▸ Facturación rango B                                      ║
║                                                              ║
║ ┌──[1]──┬──[2]★──┬──[3]──┐                                  ║
║ │   A   │   B    │   C   │                                  ║
║ ├──[4]──┼──[5]──┼──[6]──┤                                  ║
║ │   D   │   E    │   F   │   ← grid 3×2 atajos              ║
║ └───────┴────────┴───────┘                                  ║
║ ┌──[S]──┬──[X]──┬──[V]──┐                                  ║
║ │Saltar │ Baja  │ Ver   │                                  ║
║ └───────┴───────┴───────┘                                  ║
╚══════════════════════════════════════════════════════════════╝

Stats: 23 clasificados · 12 min · pace 5/min
```

---

## 6. Wave plan FASE 2 (gestoriard)

### Cronograma 7 waves

| Wave | Scope | LOC | Gate |
|---|---|---|---|
| **W1** | Foundation: tokens CSS + `<PerfiladoThemeWrapper>` + `GradeBadge` + `lib/perfilado/*` + indexes BD + migration `clientes_ciclo_mensual` (si se decide crear) | ~700 | Build pasa + Chrome MCP token vars |
| **W2** | Listado `/clientes/perfilado-af/page.tsx` + table/card/pills/kpi/pagination + endpoint `GET /api/v2/clientes/perfilado-af` | ~960 | 503 clientes paginados < 200ms · 3 viewports |
| **W3** | Ficha `/clientes/[id]/page.tsx` NUEVO desde cero + ClienteHeader + StageTracker + AiSummary + 3 cols ACERCA/ACTIVIDAD/OBLIGACIONES + endpoint `obligaciones-mes` | ~1,100 | Página renderiza con multi-tenant verify |
| **W4** | `CambiarPerfilPopover` + `DiffPreview` + endpoint `preview-diff` + integración con PATCH `/api/v2/clientes/[id]/perfil` existente | ~600 | Popover anclado funciona en 3 viewports + atajos 1-7 |
| **W5** | Revisión Guiada `/revision-guiada-perfil-c/page.tsx` NUEVO + TriageCard + AiSugerencia + DecisionGrid + Stats + endpoint `sugerencia-ai` Gemini Flash | ~700 | Pace ≥ 5 clientes/min con teclado |
| **W6** | Global: `CommandPalette` ⌘K + `KeyboardShortcuts` provider + integración 3 vistas | ~400 | ⌘K abre sin colisión URL bar Chrome |
| **W7** | Responsive 768 polish + a11y final + Chrome MCP audit pre-prod + DEPRECAR archivos viejos (delete v2/page.tsx + components/Tab*.tsx) | ~250 | axe-core ≥ 95 · LCP < 2.5s · multi-tenant verify |

**Total**: ~4,710 LOC en 7 waves.

### Reglas entre waves

1. Cada wave = 1 PR independiente.
2. Build + tsc + eslint deben pasar antes de la siguiente.
3. **Multi-tenant verify obligatorio** en W2, W3, W5 (login 2 tenants, verificar no leak).
4. **Atajos teclado** se registran solo dentro de `<KeyboardShortcuts>` scope (Wave 6) — no antes.
5. **DEPRECAR archivos viejos solo en W7** después de smoke test exitoso, con rollback tag previo.

---

## 7. Specs canónicos generados (no regenerar)

Estos archivos están listos en `.brain/design/`:

| Archivo | Contiene |
|---|---|
| `tokens.json` | Design tokens completos dark theme scoped |
| `critique-ejemplo-3.md` | Critique aplicado · score 78→88 v4 |
| `a11y-audit-contraste.md` | WCAG 2.2 AA matemático verificado |
| `ux-states-catalog.md` | 15 UX states × 3 vistas |
| `component-specs/GradeBadge.md` | Spec TSX 80 LOC con 4 variants |
| `component-specs/CambiarPerfilPopover.md` | Spec TSX 220 LOC Radix headless |
| `component-specs/StageTracker.md` | Spec TSX 80 LOC 5 dots |
| `component-specs/KpiBar.md` | Spec TSX 60 LOC 4 metric cards |
| `component-specs/TriageCard.md` | (pendiente generar al iniciar W5) |

gestoriard **usa estos specs como contrato**. Si encuentra que algo no aplica al schema real (ej. props que dependen de columnas inexistentes), **A2A FacturaIA** para reconciliar — no inventes.

---

## 8. §11 Hallazgos / riesgos

### 8.1 Sistema/Repo

1. **Ruta `/clientes/perfilado` actual retorna 500** (Next.js la matchea como `[id]` con UUID="perfilado"). Por eso uso ruta nueva **`/clientes/perfilado-af`**. gestoriard debe verificar antes del deploy que no hay otra collision.

2. **Schema acepta A-G (7 letras)**, mi propuesta original era A-F. Ajustado: G = "Sin clasificar". Si Carlos quiere mantener solo A-F y eliminar G, hay que coordinar con BD (DROP CONSTRAINT del CHECK si existe).

3. **No hay shadcn/ui en el repo** (`components/ui/` no existe). El popover lo construye gestoriard usando **Radix UI primitives** (@radix-ui/react-popover) o **vaul** (bottom-sheet). Añadir a `package.json`:
   ```json
   "@radix-ui/react-popover": "^1.x",
   "@radix-ui/react-dialog": "^1.x",
   "vaul": "^0.9.x",
   "sonner": "^1.x",
   "cmdk": "^1.x"
   ```

4. **Multi-tenant pattern**: `withEmpresaContext` + `getEmpresaId(request)` + `current_empresa_id()` SQL — confirmado por inspección de endpoints actuales. Todo endpoint nuevo DEBE usar este patrón. **Nunca aceptar `empresa_id` como query param** del cliente.

5. **CSS pattern del repo actual**: usa inline styles + Tailwind v4. Si añadimos CSS scoped con `data-theme="perfilado-dark"`, hay que probar que **no colisiona con Tailwind v4 layer cascade**.

6. **`clientes_perfil_reglas` puede tener seed incompleto** para A-G (especialmente G recién agregado). gestoriard wave 1 verifica:
   ```sql
   SELECT perfil, nombre_perfil, formularios_obligatorios FROM clientes_perfil_reglas ORDER BY perfil;
   ```
   Si falta G o algún perfil → A2A Carlos/Yolanda para definir, no inventar pipelines.

### 8.2 Prompt/Comunicación

1. **Carlos directiva "desde cero"** vs **mockup KB 16924 que reutilizaba tabla `clientes_perfilado`**: reconcilié — la tabla NO existe, la columna `perfil` vive en `clientes`. Mockup adaptado en este KB.

2. **Listado tenía pill `C 484`** en mi mockup. Ahora con migración opcional C→G, los 484 quedan en `G 484` (mucho más claro). Confirmar con SM si se hace la migración.

3. **AI Summary banner** sigue siendo opcional (Karbon-style). Confirmar si Carlos lo quiere.

### 8.3 Flujo/Proceso

1. **DEPRECAR `app/clientes/[id]/page.tsx` viejo en W7**: gestoriard debe hacer `git tag pre-deprecate-cliente-detalle-old-150526` antes del swap, push del tag para rollback fácil.

2. **Tests de regresión**: si hay tests E2E que apuntan a la ficha vieja, se romperán. gestoriard wave 7 audita `__tests__/e2e/` y adapta.

3. **El listado general `/clientes/page.tsx` (1637 LOC)** sigue intocado. Pero si tiene link directo a `/clientes/[id]`, la transición es transparente (es la misma ruta, contenido nuevo).

4. **Sidebar nav**: añadir entrada nueva:
   ```tsx
   { href: '/clientes/perfilado-af', label: 'Perfilado A-G', icon: <BadgeCheck />, badge: 484 }
   ```
   gestoriard wave 1.

---

## 9. Lista corta accionable (TL;DR gestoriard)

1. Lee este KB completo + `tokens.json` + 4 component specs en `.brain/design/`.
2. **Wave 1** ya: instala Radix + vaul + sonner + cmdk · crea `lib/perfilado/*` · crea `GradeBadge.tsx` · `PerfiladoThemeWrapper.tsx` · CSS tokens · verifica seed `clientes_perfil_reglas` A-G.
3. **No mires** los archivos viejos: `app/clientes/[id]/page.tsx`, `v2/page.tsx`, `components/Tab*.tsx`, `revision-guiada-perfil-c/page.tsx`.
4. **Sí reutiliza**: 4 endpoints API ya funcionales (§4.1), middleware `withEmpresaContext`, tablas `clientes` + `clientes_perfil_historial` + `clientes_perfil_reglas`.
5. **Si encuentras conflicto** durante implementación: **A2A FacturaIA**, no parchees.
6. Cada wave = PR + Chrome MCP gate + multi-tenant verify.
7. **W7 deprecación viejos** solo después de smoke completo + git tag rollback.

---

═══ FIRMA ═══ FacturaIA / 2026-05-14 / spec implementación desde cero · 28 archivos nuevos / 4 viejos deprecados / 4 endpoints reutilizados / 4 endpoints nuevos / schema verificado A-G real
