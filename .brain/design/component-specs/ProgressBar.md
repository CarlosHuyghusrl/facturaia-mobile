# Component Spec — ProgressBar (Revisión Guiada)

**Skills**: `design-to-code` + `design-accessibility` + `design-usability`
**Path**: `app/clientes/revision-guiada-perfil-c/_components/ProgressBar.tsx`
**LOC**: 80
**Tipo**: Server Component (puro; SesionStats sí client por contador en vivo)
**Wave**: W5
**Helpers internos**: `SesionStats.tsx` componente separado spec siguiente (~60 LOC) — pero se usa juntos. Si quieres lo agrupo aquí.

---

## 1. API

```tsx
type ProgressBarProps = {
  current: number;          // 127
  total: number;            // 484
  /** Stats sesión opcionales (si null no se renderiza) */
  stats?: {
    clasificados: number;
    saltados: number;
    bajas: number;
    minutos: number;        // tiempo de sesión
    pace: number;           // clientes/min — calculado por el padre
  } | null;
  className?: string;
};
```

---

## 2. Visual desktop

```
Revisión guiada — Perfil C default                                [Pausar]  ✕

127 de 484 (26%)  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"484 uno por uno · ~30s cada uno · 4h estimado · 6× más rápido con teclado"
[1-7] perfil · [S] saltar · [B] volver · [N] nota · [←→] navegar

23 clasificados · 1 saltado · 0 bajas · 12 min · 5/min
```

### Visual mobile 375

```
127/484 (26%)
━━━━━━━━━━━━━━

23 clasif · 12 min · 5/min
[Pausar]
```

---

## 3. Diseño barra

- **Track**: bg `--bg-3` rounded 6px, alto 8px
- **Fill**: gradient horizontal **C→A** (`linear-gradient(90deg, var(--grade-c), var(--grade-a))`) que simboliza progresión hacia "clasificado"
- **Texto encima**: `127/484 (26%)` con `font-variant-numeric: tabular-nums` para que no salte

Animación: width transition `transform: scaleX()` 400ms ease-out cuando current cambia. Reduced motion: instantáneo.

---

## 4. Estados

| Estado | Visual |
|---|---|
| current=0 | Barra vacía + "0 de N · ¡Empecemos!" |
| 0 < current < total | Estado normal con porcentaje |
| current = total | Fill al 100% color verde A + animación pulse 1× + texto "¡Completado!" + emoji 🎉 (omitido si reduced motion) |
| Pausado (stats=null) | Sin stats sesión, solo progreso |

---

## 5. Implementación TSX

```tsx
import { type FC } from 'react';
import { cn } from '@/lib/utils';

const formatPct = (current: number, total: number): number =>
  total === 0 ? 0 : Math.round((current / total) * 100);

const SesionStats: FC<{ stats: NonNullable<ProgressBarProps['stats']> }> = ({ stats }) => (
  <dl
    className="progress-stats"
    aria-label="Estadísticas de la sesión actual"
    aria-live="polite"
  >
    <div className="progress-stats__item">
      <dt>Clasificados</dt>
      <dd className="progress-stats__value">{stats.clasificados}</dd>
    </div>
    <span className="progress-stats__sep" aria-hidden="true">·</span>

    <div className="progress-stats__item">
      <dt>Saltados</dt>
      <dd className="progress-stats__value">{stats.saltados}</dd>
    </div>
    <span className="progress-stats__sep" aria-hidden="true">·</span>

    <div className="progress-stats__item">
      <dt>Bajas</dt>
      <dd className="progress-stats__value">{stats.bajas}</dd>
    </div>
    <span className="progress-stats__sep" aria-hidden="true">·</span>

    <div className="progress-stats__item">
      <dt>Tiempo</dt>
      <dd className="progress-stats__value">{stats.minutos} min</dd>
    </div>
    <span className="progress-stats__sep" aria-hidden="true">·</span>

    <div className="progress-stats__item">
      <dt>Pace</dt>
      <dd className="progress-stats__value">{stats.pace}/min</dd>
    </div>
  </dl>
);

export const ProgressBar: FC<ProgressBarProps> = ({ current, total, stats, className }) => {
  const pct = formatPct(current, total);
  const complete = current >= total && total > 0;

  return (
    <div
      className={cn('progress-bar', complete && 'progress-bar--complete', className)}
      role="region"
      aria-label="Progreso de la revisión guiada"
    >
      <div className="progress-bar__heading">
        <span className="progress-bar__count">
          <strong>{current}</strong> de <strong>{total}</strong>
          <span className="progress-bar__pct">({pct}%)</span>
        </span>
      </div>

      <div
        className="progress-bar__track"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuetext={`${current} de ${total} clientes revisados, ${pct}%`}
      >
        <div
          className="progress-bar__fill"
          style={{ width: `${pct}%` }}
        />
      </div>

      {!complete && (
        <p className="progress-bar__hint">
          484 uno por uno · ~30s cada uno · ~4h estimado · 6× más rápido con teclado
        </p>
      )}

      {complete && (
        <p className="progress-bar__complete-msg" aria-live="polite">
          ¡Completado! Has revisado todos los clientes.
        </p>
      )}

      {stats && <SesionStats stats={stats} />}
    </div>
  );
};
```

---

## 6. CSS scoped

```css
.progress-bar {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3) 0;
  font-family: var(--font-sans);
}

.progress-bar__heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.progress-bar__count {
  font-size: 13px;
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}
.progress-bar__count strong {
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--text-primary);
}
.progress-bar__pct {
  margin-left: var(--space-2);
  color: var(--text-tertiary);
}

.progress-bar__track {
  width: 100%;
  height: 8px;
  background: var(--bg-3);
  border-radius: var(--radius-pill);
  overflow: hidden;
}

.progress-bar__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--grade-c), var(--grade-a));
  border-radius: inherit;
  transition: width var(--motion-duration-slow) var(--motion-ease-out);
  will-change: width;
}

.progress-bar--complete .progress-bar__fill {
  background: var(--grade-a);
  animation: complete-pulse 800ms ease-out 1;
}

.progress-bar__hint {
  margin: 0;
  font-size: 12px;
  color: var(--text-tertiary);
}

.progress-bar__complete-msg {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--grade-a);
}

.progress-stats {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
  margin: var(--space-2) 0 0 0;
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--text-secondary);
}
.progress-stats__item { display: inline-flex; align-items: baseline; gap: 4px; }
.progress-stats__item dt {
  margin: 0;
  text-transform: lowercase;
}
.progress-stats__item dd {
  margin: 0;
}
.progress-stats__value {
  font-family: var(--font-mono);
  font-weight: 600;
  color: var(--text-primary);
}
.progress-stats__sep { color: var(--text-tertiary); }

@keyframes complete-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(0,196,140,0.5); }
  60%  { box-shadow: 0 0 0 16px rgba(0,196,140,0); }
  100% { box-shadow: 0 0 0 0 rgba(0,196,140,0); }
}

/* Mobile */
@media (max-width: 767px) {
  .progress-bar__hint { display: none; }                /* mobile: ocultar texto auxiliar */
  .progress-stats     { font-size: 11px; gap: var(--space-1); }
}

@media (prefers-reduced-motion: reduce) {
  .progress-bar__fill                       { transition: none; }
  .progress-bar--complete .progress-bar__fill { animation: none; }
}
```

---

## 7. A11y

- `role="progressbar"` con `aria-valuenow/min/max/valuetext`
- `aria-valuetext` da contexto verbal: "127 de 484 clientes revisados, 26%"
- Stats con `aria-live="polite"` → SR anuncia cambios sin interrumpir
- Mensaje completion con `aria-live="polite"` para celebración audible
- `<dl>` semántico para stats (dt = label, dd = value)

---

## 8. Performance

- Server Component (mejor TTFB)
- `width` transition con `will-change` → GPU layer
- Re-render solo cuando current/total/stats cambian (padre controla)
- SesionStats podría hacerse Client si necesitamos counter en vivo cada segundo (sprint 2)

---

## 9. Tests

```ts
describe('ProgressBar', () => {
  it('current=0 → fill 0% + hint visible', () => { /* */ });
  it('current=127 total=484 → 26% en aria-valuenow', () => { /* */ });
  it('current=total → "¡Completado!" msg + animación pulse', () => { /* */ });
  it('aria-valuetext semántico para SR', () => { /* */ });
  it('stats=null → no renderiza SesionStats', () => { /* */ });
  it('stats con valores → renderiza con dl/dt/dd semántico', () => { /* */ });
  it('reduced motion → sin animation pulse', () => { /* */ });
  it('mobile 375 → hint oculto', () => { /* */ });
});
```

═══ FIRMA ═══ FacturaIA / 2026-05-14 / spec ProgressBar.tsx W5
