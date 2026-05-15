# Component Spec — ScoreCell

**Skills**: `design-to-code` + `design-accessibility`
**Path**: `app/clientes/perfilado-af/_components/ScoreCell.tsx`
**LOC**: 60
**Tipo**: Server Component (puro presentacional)
**Wave**: W2
**Reutilizable**: ScoreCell vale tanto para "Score" como para "Facturación mensual" (mismo patrón JetBrains Mono tabular-nums)

---

## 1. API

```tsx
type ScoreCellProps =
  | { variant: 'number'; value: number | null; trend?: number | null; max?: number }
  | { variant: 'currency'; value: number | null; currency?: 'DOP' | 'USD' }
  | { variant: 'percentage'; value: number | null; trend?: number | null };
```

---

## 2. Visual

### Variant `number` (Score 0-100)

```
87  ▲     ← número grande Mono + trend arrow color verde si +
72        ← sin trend
—         ← null (G provisional)
```

### Variant `currency` (Facturación mensual)

```
RD$ 312,500
RD$ 188,200
—                ← null
```

### Variant `percentage` (uso futuro — ej. % cumplimiento)

```
87%  ▲
```

---

## 3. Implementación TSX

```tsx
import { type FC } from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

const formatNumber = (n: number): string => n.toLocaleString('es-DO');

const formatCurrency = (n: number, currency: 'DOP' | 'USD' = 'DOP'): string => {
  const symbol = currency === 'DOP' ? 'RD$' : 'US$';
  return `${symbol} ${formatNumber(n)}`;
};

const TrendBadge: FC<{ trend: number }> = ({ trend }) => {
  if (trend === 0) return null;
  const isUp = trend > 0;
  return (
    <span
      className={cn('score-trend', isUp ? 'score-trend--up' : 'score-trend--down')}
      aria-label={`${isUp ? 'Aumentó' : 'Disminuyó'} ${Math.abs(trend)}`}
    >
      {isUp ? <ArrowUpIcon size={12} /> : <ArrowDownIcon size={12} />}
      <span className="score-trend__value">{Math.abs(trend)}</span>
    </span>
  );
};

export const ScoreCell: FC<ScoreCellProps> = (props) => {
  if (props.value === null || props.value === undefined) {
    return <span className="score-cell score-cell--empty" aria-label="Sin datos">—</span>;
  }

  let display: string;
  let ariaValue: string;

  switch (props.variant) {
    case 'number':
      display = formatNumber(props.value);
      ariaValue = `Score ${props.value}${props.max ? ` de ${props.max}` : ''}`;
      break;
    case 'currency':
      display = formatCurrency(props.value, props.currency);
      ariaValue = `Facturación ${display}`;
      break;
    case 'percentage':
      display = `${props.value}%`;
      ariaValue = `${props.value} por ciento`;
      break;
  }

  const showTrend = (props.variant === 'number' || props.variant === 'percentage') && typeof props.trend === 'number';

  return (
    <span className="score-cell" aria-label={ariaValue}>
      <span className={cn('score-cell__value', `score-cell__value--${props.variant}`)}>
        {display}
      </span>
      {showTrend && <TrendBadge trend={props.trend!} />}
    </span>
  );
};
```

---

## 4. CSS scoped

```css
.score-cell {
  display: inline-flex;
  align-items: baseline;
  gap: var(--space-2);
  justify-content: flex-end;
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

.score-cell--empty {
  color: var(--text-tertiary);
}

.score-cell__value {
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.score-cell__value--number {
  font-size: 18px;
}
.score-cell__value--currency {
  font-size: 14px;
  font-weight: 500;
}
.score-cell__value--percentage {
  font-size: 18px;
}

.score-trend {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}
.score-trend--up   { color: var(--grade-a); background: var(--grade-soft-a); }
.score-trend--down { color: var(--grade-f); background: var(--grade-soft-f); }
.score-trend__value { font-family: var(--font-mono); }
```

---

## 5. Estados

| Estado | Resultado |
|---|---|
| `value=null` o `undefined` | "—" gris terciario |
| `trend=0` o `undefined` | Sin badge trend |
| `trend>0` | Badge verde ▲ |
| `trend<0` | Badge rojo ▼ |
| `variant=currency` con `currency='USD'` | Prefijo "US$" |

---

## 6. A11y

- `aria-label` semántico ("Score 87 de 100", "Facturación RD$ 312,500")
- Trend badge con `aria-label` ("Aumentó 3")
- `tabular-nums` para alineación numérica
- Sin botón ni hover — puramente lectura

---

## 7. Performance

- Server Component (sin state)
- `Intl.NumberFormat` con `toLocaleString('es-DO')` para separadores
- No re-render — props simples

---

## 8. Tests

```ts
describe('ScoreCell', () => {
  it('renderiza "—" cuando value=null', () => { /* */ });
  it('formato es-DO con separador de miles', () => { /* */ });
  it('currency prefija RD$ por default', () => { /* */ });
  it('trend positivo → badge verde ▲', () => { /* */ });
  it('trend negativo → badge rojo ▼', () => { /* */ });
  it('trend=0 → sin badge', () => { /* */ });
  it('aria-label semántico por variant', () => { /* */ });
});
```

═══ FIRMA ═══ FacturaIA / 2026-05-14 / spec ScoreCell.tsx W2
