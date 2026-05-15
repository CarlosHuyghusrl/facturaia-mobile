# Component Spec — KpiBar

**Skills aplicados**: `design-to-code` + `react-best-practices` + `design-responsive`
**Path destino**: `app/clientes/perfilado/_components/KpiBar.tsx`
**LOC estimado**: 60
**Tipo**: Server Component (puro, sin state)
**Inspiración**: Stripe Dashboard metric cards stacked con trend badges

---

## 1. API

```tsx
type KpiBarProps = {
  metrics: {
    total: number;
    grade_promedio: { label: string; trend: number };   // ej: "C+", trend +0.3
    en_riesgo: { count: number; trend: number };        // D+E+F sumados, trend vs mes ant.
    sin_clasificar: number;                              // 484 provisionales
  };
};
```

---

## 2. Visual

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Total       │  │ Grado prom. │  │ En riesgo   │  │ Sin clasif. │
│ 503         │  │ C+   ▲ 0.3 │  │ 12   ▼ 3   │  │ 484         │
│ Clientes    │  │ vs mes ant. │  │ D+E+F       │  │ Provisional │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘

Desktop ≥ 1024: 4 cols
Tablet 768-1023: 2×2 grid
Mobile < 768: 2×2 grid compacto (60px alto)
```

---

## 3. Variantes por métrica

| Métrica | Color trend | Significado trend ▲ |
|---|---|---|
| Total | neutro | Crecimiento cartera |
| Grado promedio | success (verde) | Cartera mejorando |
| En riesgo | danger (rojo) | Más clientes en riesgo |
| Sin clasificar | neutro | Pendientes |

**Regla**:
- Trend **positivo para empresa** = ▲ verde
- Trend **negativo para empresa** = ▼ rojo
- **En riesgo** invierte la lógica: más en riesgo = MAL = ▲ rojo. Menos en riesgo = BIEN = ▼ verde.

---

## 4. Implementación TSX

```tsx
import { type FC } from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

type KpiCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  trend?: { value: number; isPositive: boolean };
  ariaDescription?: string;
};

const KpiCard: FC<KpiCardProps> = ({ label, value, hint, trend, ariaDescription }) => (
  <article
    className="kpi-card"
    role="region"
    aria-label={ariaDescription || label}
  >
    <span className="kpi-card__label">{label}</span>
    <div className="kpi-card__value-row">
      <span className="kpi-card__value">
        {typeof value === 'number' ? value.toLocaleString('es-DO') : value}
      </span>
      {trend && (
        <span
          className={cn(
            'kpi-card__trend',
            trend.isPositive ? 'kpi-card__trend--up' : 'kpi-card__trend--down'
          )}
          aria-label={`${trend.isPositive ? 'Aumentó' : 'Disminuyó'} ${Math.abs(trend.value)}`}
        >
          {trend.isPositive ? <ArrowUpIcon size={12} /> : <ArrowDownIcon size={12} />}
          {Math.abs(trend.value)}
        </span>
      )}
    </div>
    {hint && <span className="kpi-card__hint">{hint}</span>}
  </article>
);

export const KpiBar: FC<KpiBarProps> = ({ metrics }) => {
  // Lógica de trend invertido para "en riesgo": menos = mejor
  const riesgoTrendPositive = metrics.en_riesgo.trend < 0;

  return (
    <section
      className="kpi-bar"
      role="group"
      aria-label="Indicadores de perfilado"
    >
      <KpiCard
        label="Total clientes"
        value={metrics.total}
        hint="En la cartera"
      />
      <KpiCard
        label="Grado promedio"
        value={metrics.grade_promedio.label}
        hint="vs mes anterior"
        trend={{
          value: metrics.grade_promedio.trend,
          isPositive: metrics.grade_promedio.trend >= 0
        }}
      />
      <KpiCard
        label="En riesgo"
        value={metrics.en_riesgo.count}
        hint="D + E + F"
        trend={{
          value: metrics.en_riesgo.trend,
          isPositive: riesgoTrendPositive   // invertido: menos riesgo = bueno
        }}
        ariaDescription={`En riesgo: ${metrics.en_riesgo.count} clientes`}
      />
      <KpiCard
        label="Sin clasificar"
        value={metrics.sin_clasificar}
        hint="Grado C provisional"
      />
    </section>
  );
};
```

---

## 5. CSS scoped

```css
.kpi-bar {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-3);
  margin-bottom: var(--space-6);
}

.kpi-card {
  background: var(--bg-2);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-height: 96px;
}

.kpi-card__label {
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.kpi-card__value-row {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
}

.kpi-card__value {
  font-family: var(--font-mono);
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}

.kpi-card__trend {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.kpi-card__trend--up   { color: var(--grade-a); background: var(--grade-soft-a); }
.kpi-card__trend--down { color: var(--grade-f); background: var(--grade-soft-f); }

.kpi-card__hint {
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--text-tertiary);
  margin-top: var(--space-1);
}

/* Tablet 768-1023 */
@media (max-width: 1023px) and (min-width: 768px) {
  .kpi-bar { grid-template-columns: repeat(2, 1fr); }
}

/* Mobile < 768 */
@media (max-width: 767px) {
  .kpi-bar { grid-template-columns: repeat(2, 1fr); gap: var(--space-2); }
  .kpi-card {
    padding: var(--space-3);
    min-height: 76px;
  }
  .kpi-card__value { font-size: 22px; }
  .kpi-card__label { font-size: 10px; }
  .kpi-card__hint { font-size: 10px; }
}
```

═══ FIRMA ═══ FacturaIA / 2026-05-14 / spec KpiBar.tsx
