# Component Spec — PerfiladoTable

**Skills**: `design-to-code` + `react-best-practices` + `design-accessibility` + `design-responsive`
**Path**: `app/clientes/perfilado-af/_components/PerfiladoTable.tsx`
**LOC**: 200
**Tipo**: Client Component (sort + selección de fila → modal)
**Wave**: W2
**Helpers internos**: `TableHeader.tsx` (~40 LOC), `TableRow.tsx` (~80 LOC memoizado)

---

## 1. API (props)

```tsx
type PerfiladoTableProps = {
  data: ClientePerfilRow[];                  // 50 items por página
  sortBy: SortKey;                            // 'score_desc'|'name_asc'|...
  onSortChange: (key: SortKey) => void;
  onRowClick: (cliente: ClientePerfilRow) => void;  // abre modal/popover
  loading?: boolean;
  className?: string;
};

type ClientePerfilRow = {
  id: string;
  razon_social: string;
  rnc_cedula: string;
  sector: string | null;
  perfil: Grade;
  monto_mensual: number | null;
  score: number | null;            // null si grade=G provisional
  score_trend: number | null;      // +/- vs mes anterior
  alertas_count: number;
  historial_count: number;         // si 0 + perfil=C → C provisional → render gris
};

type SortKey =
  | 'score_desc' | 'score_asc'
  | 'name_asc'   | 'name_desc'
  | 'grade_asc'  | 'grade_desc'
  | 'facturacion_desc' | 'facturacion_asc';
```

---

## 2. Visual desktop 1440

```
┌─ Grado ┬─ Cliente / RNC ───────┬─ Sector ──┬─ Fact. mensual ┬─ Score ┬─ Alertas DGII ┬─ Detalle ┐
│  [A] ★ │ Huyghu SRL            │ Servicios │  RD$ 312,500   │ 87 ▲   │  —            │ →        │
│        │ 130309094             │           │                │        │               │          │
├────────┼───────────────────────┼───────────┼────────────────┼────────┼───────────────┼──────────┤
│  [B]   │ Bridaspak             │ Comercio  │  RD$ 188,200   │ 72     │ 1             │ →        │
│        │ 401501234             │           │                │        │               │          │
├────────┼───────────────────────┼───────────┼────────────────┼────────┼───────────────┼──────────┤
│  [G]   │ Unitep Partner Group  │ Servicios │  —             │ —      │ —             │ →        │
│  outln │ 130842715             │           │                │        │               │          │
└────────┴───────────────────────┴───────────┴────────────────┴────────┴───────────────┴──────────┘

Columnas:
- Grado: GradeBadge size=md, variant solid o outline (si G sin historial=outline)
- Cliente: razon_social DM Sans + RNC JetBrains Mono debajo
- Sector: texto secundario
- Fact. mensual: ScoreCell variant=currency, tabular-nums
- Score: ScoreCell variant=number + ScoreTrend ▲▼
- Alertas DGII: AlertasCell (pill count o "—")
- Detalle: ChevronRight icon (atajo visual, no botón propio)

Header clickeable: cada th con sort indicator ▲▼ (sortBy state)
```

---

## 3. Visual mobile 375

NO renderiza tabla — se usa `<PerfiladoCard>` separado (W2 component aparte). Esta tabla **se oculta** con `@media (max-width: 767px) { display: none; }` y el componente padre renderiza `<PerfiladoCard>` en su lugar.

---

## 4. Estados

| Estado | Visual |
|---|---|
| `loading` | Skeleton: 10 filas con shimmer 1.5s (`design-usability` §1) |
| Empty data | NO se renderiza la tabla — padre muestra `<EmptyState>` |
| Sort ascending | Header con `▲` opacity 1 |
| Sort descending | Header con `▼` opacity 1 |
| Sort inactive | Header con `▴` opacity 0.3 |
| Row hover | bg `--bg-hover` + cursor pointer |
| Row focused (keyboard) | outline 2px focus + bg `--bg-hover` |
| Row clicked | brief flash `rgba(76,158,255,0.1)` 100ms |
| G provisional | GradeBadge variant=outline gris + Score "—" + Fact. "—" |

---

## 5. Implementación TSX

```tsx
'use client';

import { type FC, useMemo, useCallback, memo } from 'react';
import { GradeBadge } from '@/app/clientes/_components/GradeBadge';
import { ScoreCell } from './ScoreCell';
import { AlertasCell } from './AlertasCell';
import { TableSkeleton } from './TableSkeleton';
import { ChevronRightIcon, ArrowUpIcon, ArrowDownIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

const COLS = [
  { key: 'grade_desc',       label: 'Grado',         sortable: true,  width: 80,  align: 'center' },
  { key: 'name_asc',         label: 'Cliente / RNC', sortable: true,  width: 'auto', align: 'left' },
  { key: 'sector',           label: 'Sector',        sortable: false, width: 140, align: 'left' },
  { key: 'facturacion_desc', label: 'Fact. mensual', sortable: true,  width: 140, align: 'right' },
  { key: 'score_desc',       label: 'Score',         sortable: true,  width: 100, align: 'right' },
  { key: 'alertas',          label: 'Alertas DGII',  sortable: false, width: 100, align: 'center' },
  { key: 'detalle',          label: '',              sortable: false, width: 48,  align: 'right' },
] as const;

const TableRow = memo<{
  cliente: ClientePerfilRow;
  onClick: (c: ClientePerfilRow) => void;
}>(({ cliente, onClick }) => {
  const isProvisional = cliente.perfil === 'G' || (cliente.perfil === 'C' && cliente.historial_count === 0);

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(cliente);
    }
  }, [cliente, onClick]);

  return (
    <tr
      className="perfilado-row"
      role="button"
      tabIndex={0}
      onClick={() => onClick(cliente)}
      onKeyDown={handleKey}
      aria-label={`Cliente ${cliente.razon_social}, Perfil ${cliente.perfil}, abrir detalle`}
      data-grade={cliente.perfil}
    >
      <td className="perfilado-cell perfilado-cell--center">
        <GradeBadge grade={cliente.perfil} variant={isProvisional ? 'outline' : 'solid'} size="md" />
      </td>
      <td className="perfilado-cell">
        <div className="perfilado-cell__name">{cliente.razon_social}</div>
        <div className="perfilado-cell__rnc">{cliente.rnc_cedula}</div>
      </td>
      <td className="perfilado-cell perfilado-cell--secondary">
        {cliente.sector ?? '—'}
      </td>
      <td className="perfilado-cell perfilado-cell--right">
        <ScoreCell variant="currency" value={cliente.monto_mensual} />
      </td>
      <td className="perfilado-cell perfilado-cell--right">
        <ScoreCell variant="number" value={cliente.score} trend={cliente.score_trend} />
      </td>
      <td className="perfilado-cell perfilado-cell--center">
        <AlertasCell count={cliente.alertas_count} clienteId={cliente.id} />
      </td>
      <td className="perfilado-cell perfilado-cell--right">
        <ChevronRightIcon size={16} className="perfilado-cell__chevron" aria-hidden="true" />
      </td>
    </tr>
  );
});
TableRow.displayName = 'TableRow';

export const PerfiladoTable: FC<PerfiladoTableProps> = ({
  data, sortBy, onSortChange, onRowClick, loading, className
}) => {
  const handleSort = useCallback((key: string) => {
    if (!key.includes('_')) return;
    const isCurrent = sortBy.startsWith(key.split('_')[0]);
    const newDir = isCurrent && sortBy.endsWith('_desc') ? 'asc' : 'desc';
    onSortChange(`${key.split('_')[0]}_${newDir}` as SortKey);
  }, [sortBy, onSortChange]);

  if (loading) return <TableSkeleton rows={10} cols={COLS.length} />;

  return (
    <div className={cn('perfilado-table-wrapper', className)} role="region" aria-label="Tabla de clientes con perfilado">
      <table className="perfilado-table" aria-rowcount={data.length}>
        <thead>
          <tr>
            {COLS.map((col) => {
              const isActive = sortBy.startsWith(col.key.split('_')[0]);
              const dir = sortBy.endsWith('_desc') ? 'desc' : 'asc';
              return (
                <th
                  key={col.key}
                  scope="col"
                  style={{ width: col.width === 'auto' ? undefined : col.width, textAlign: col.align }}
                  aria-sort={isActive ? (dir === 'desc' ? 'descending' : 'ascending') : 'none'}
                >
                  {col.sortable ? (
                    <button
                      className={cn('perfilado-th__btn', isActive && 'perfilado-th__btn--active')}
                      onClick={() => handleSort(col.key)}
                      aria-label={`Ordenar por ${col.label}`}
                    >
                      <span>{col.label}</span>
                      {isActive && (dir === 'desc' ? <ArrowDownIcon size={10} /> : <ArrowUpIcon size={10} />)}
                    </button>
                  ) : (
                    <span>{col.label}</span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.map((cliente) => (
            <TableRow key={cliente.id} cliente={cliente} onClick={onRowClick} />
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

---

## 6. CSS scoped

```css
.perfilado-table-wrapper {
  background: var(--bg-2);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow-x: auto;
}

.perfilado-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-family: var(--font-sans);
}

.perfilado-table thead {
  background: var(--bg-3);
  position: sticky; top: 0; z-index: 1;
}

.perfilado-table th {
  padding: var(--space-3) var(--space-4);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-subtle);
}

.perfilado-th__btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  font: inherit;
  padding: 0;
}
.perfilado-th__btn--active { color: var(--text-primary); }
.perfilado-th__btn:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

.perfilado-row {
  cursor: pointer;
  transition: background var(--motion-duration-fast);
  height: 72px;
}
.perfilado-row:hover     { background: var(--bg-hover); }
.perfilado-row:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: -2px;
  background: var(--bg-hover);
}

.perfilado-cell {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
  font-size: 14px;
  color: var(--text-primary);
  vertical-align: middle;
}
.perfilado-cell--right    { text-align: right; }
.perfilado-cell--center   { text-align: center; }
.perfilado-cell--secondary{ color: var(--text-secondary); }

.perfilado-cell__name { font-weight: 500; line-height: 1.3; }
.perfilado-cell__rnc {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px;
}
.perfilado-cell__chevron { color: var(--text-tertiary); }
.perfilado-row:hover .perfilado-cell__chevron { color: var(--text-primary); }

/* Mobile — hide table, parent shows cards */
@media (max-width: 767px) {
  .perfilado-table-wrapper { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .perfilado-row { transition: none; }
}
```

---

## 7. A11y

- Wrapper `role="region" aria-label`
- Cada `<th>` con `aria-sort` correcto
- Filas `role="button" tabIndex={0}` con keyboard handler
- ChevronRight `aria-hidden="true"` (decorativo)
- Sort buttons con `aria-label` explícito

---

## 8. Performance

- `TableRow` memoized (re-render solo si cliente cambia)
- `useCallback` para handlers
- Sin virtualization en MVP (50 rows/page suficiente). Sprint 2: react-window si Yolanda activa "ver todos 503"
- No JS animations — CSS transitions

---

## 9. Tests

```ts
describe('PerfiladoTable', () => {
  it('renderiza 50 filas con perfil A-G', () => { /* */ });
  it('click fila llama onRowClick con cliente', () => { /* */ });
  it('keyboard Enter en fila llama onRowClick', () => { /* */ });
  it('click header sortable cambia sortBy con dirección toggle', () => { /* */ });
  it('aria-sort refleja sort actual', () => { /* */ });
  it('mostrar skeleton cuando loading=true', () => { /* */ });
  it('G provisional renderiza badge outline + score "—"', () => { /* */ });
  it('mobile <768 oculta tabla (CSS test)', () => { /* */ });
});
```

═══ FIRMA ═══ FacturaIA / 2026-05-14 / spec PerfiladoTable.tsx W2
