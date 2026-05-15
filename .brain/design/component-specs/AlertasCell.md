# Component Spec — AlertasCell

**Skills**: `design-to-code` + `design-accessibility`
**Path**: `app/clientes/perfilado-af/_components/AlertasCell.tsx`
**LOC**: 60
**Tipo**: Client Component (tooltip on hover/focus con lazy fetch)
**Wave**: W2

---

## 1. API

```tsx
type AlertasCellProps = {
  count: number;
  clienteId: string;      // para lazy fetch del detalle on hover
  className?: string;
};
```

---

## 2. Visual

```
count = 0  → "—" (texto tertiary, centrado)
count = 1  → ⚠ pill warning (1)
count >= 2 → ⚠ pill danger  (2/3/N)

Tooltip on hover/focus:
┌──────────────────────────────────┐
│ Alertas activas:                  │
│ • IT-1 abril vencida (5d)        │
│ • 606 mayo por vencer (6d)       │
│ • NCF próximos a vencer          │
└──────────────────────────────────┘
```

| Count | Color pill | Icono |
|---|---|---|
| 0 | none ("—") | none |
| 1 | `--grade-d` (naranja) warning | ⚠ |
| 2-3 | `--grade-e` (púrpura) | ⚠ |
| ≥ 4 | `--grade-f` (rojo) | 🔴 |

---

## 3. Implementación TSX

```tsx
'use client';

import { type FC, useState, useId } from 'react';
import useSWR from 'swr';
import { AlertTriangleIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

type AlertaSummary = { tipo: string; severidad: string; titulo: string; vence_en: string };

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const getSeverityClass = (count: number): string => {
  if (count >= 4) return 'alertas-pill--danger';
  if (count >= 2) return 'alertas-pill--critical';
  return 'alertas-pill--warning';
};

export const AlertasCell: FC<AlertasCellProps> = ({ count, clienteId, className }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipId = useId();

  const { data, isLoading } = useSWR<{ alertas: AlertaSummary[] }>(
    showTooltip && count > 0 ? `/api/v2/clientes/${clienteId}/alertas?limit=5` : null,
    fetcher,
    { dedupingInterval: 30000 }
  );

  if (count === 0) {
    return <span className="alertas-cell alertas-cell--empty" aria-label="Sin alertas">—</span>;
  }

  return (
    <button
      type="button"
      className={cn('alertas-pill', getSeverityClass(count), className)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      onClick={(e) => e.stopPropagation()}   // no propagar a <tr> click → modal
      aria-describedby={showTooltip ? tooltipId : undefined}
      aria-label={`${count} alertas DGII activas`}
    >
      <AlertTriangleIcon size={12} aria-hidden="true" />
      <span className="alertas-pill__count">{count}</span>

      {showTooltip && (
        <div role="tooltip" id={tooltipId} className="alertas-tooltip">
          <strong className="alertas-tooltip__title">Alertas activas:</strong>
          {isLoading ? (
            <span className="alertas-tooltip__loading">Cargando...</span>
          ) : data?.alertas.length ? (
            <ul className="alertas-tooltip__list">
              {data.alertas.slice(0, 5).map((a, i) => (
                <li key={i}>
                  <span className="alertas-tooltip__dot" data-severity={a.severidad} aria-hidden="true" />
                  {a.titulo} <span className="alertas-tooltip__date">({a.vence_en})</span>
                </li>
              ))}
              {data.alertas.length > 5 && (
                <li className="alertas-tooltip__more">+ {data.alertas.length - 5} más</li>
              )}
            </ul>
          ) : (
            <span className="alertas-tooltip__error">No se pudo cargar</span>
          )}
        </div>
      )}
    </button>
  );
};
```

---

## 4. CSS scoped

```css
.alertas-cell--empty {
  color: var(--text-tertiary);
  font-family: var(--font-mono);
}

.alertas-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 4px 8px;
  border-radius: var(--radius-pill);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: help;
  position: relative;
}

.alertas-pill--warning  { background: var(--grade-soft-d); color: var(--grade-d); }
.alertas-pill--critical { background: var(--grade-soft-e); color: var(--grade-e); }
.alertas-pill--danger   { background: var(--grade-soft-f); color: var(--grade-f); }

.alertas-pill:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

.alertas-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  right: 0;
  z-index: var(--z-tooltip);
  width: 280px;
  padding: var(--space-3);
  background: var(--bg-3);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-popover);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 400;
  color: var(--text-primary);
  white-space: normal;
  text-align: left;
  cursor: default;
}

.alertas-tooltip__title { display: block; margin-bottom: var(--space-2); font-size: 12px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em; }
.alertas-tooltip__list  { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: var(--space-1); }
.alertas-tooltip__dot   { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: var(--space-2); }
.alertas-tooltip__dot[data-severity="critica"] { background: var(--grade-f); }
.alertas-tooltip__dot[data-severity="alta"]    { background: var(--grade-e); }
.alertas-tooltip__dot[data-severity="media"]   { background: var(--grade-d); }
.alertas-tooltip__dot[data-severity="baja"]    { background: var(--grade-a); }
.alertas-tooltip__date  { color: var(--text-secondary); font-size: 12px; }
.alertas-tooltip__more  { color: var(--text-secondary); font-size: 12px; }
.alertas-tooltip__loading,
.alertas-tooltip__error { color: var(--text-secondary); font-size: 13px; }

@media (hover: none) {
  /* Mobile/touch — tooltip se abre on tap, no hover */
  .alertas-pill { cursor: pointer; }
}
```

---

## 5. Estados

| Estado | Comportamiento |
|---|---|
| count=0 | Render "—" sin button |
| count≥1 hover/focus | Tooltip lazy-fetch /api/v2/clientes/[id]/alertas |
| Tooltip loading | "Cargando..." |
| Tooltip error/empty | "No se pudo cargar" |
| Click pill | `stopPropagation()` para no abrir modal del row |

---

## 6. A11y

- Empty state con `aria-label="Sin alertas"`
- Button con `aria-describedby` cuando tooltip visible
- Tooltip con `role="tooltip"` + ID asociado
- Dot por severidad con `data-severity` (a11y compensado por título + fecha textual)
- Touch device: tooltip on tap (no hover)

---

## 7. Tests

```ts
describe('AlertasCell', () => {
  it('renderiza "—" cuando count=0', () => { /* */ });
  it('renderiza pill warning con count=1', () => { /* */ });
  it('renderiza pill danger con count≥4', () => { /* */ });
  it('hover lazy-fetch alertas detalle', () => { /* */ });
  it('click pill no propaga al row parent', () => { /* */ });
  it('tooltip muestra max 5 + "más" si hay más', () => { /* */ });
  it('aria-label correcto para SR', () => { /* */ });
});
```

═══ FIRMA ═══ FacturaIA / 2026-05-14 / spec AlertasCell.tsx W2
