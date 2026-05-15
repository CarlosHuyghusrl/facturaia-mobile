# Component Spec — StageTracker

**Skills aplicados**: `design-to-code` + `design-responsive` + `design-accessibility`
**Path destino**: `app/clientes/[id]/_components/StageTracker.tsx`
**LOC estimado**: 80
**Tipo**: Server Component (puro presentacional, datos vienen como prop)
**Inspiración**: HubSpot Lifecycle Stage

---

## 1. API

```tsx
type Stage = 'docs_recibidos' | 'calculo_listo' | 'pre_revisado' | 'envio_completado' | 'dgii_confirmado';

type StageTrackerProps = {
  /** Estado actual de cada etapa */
  stages: Record<Stage, boolean>;

  /** Fecha del ciclo (year-month "2026-05") */
  ciclo: string;

  /** Próxima fecha límite (ISO date) */
  proxima_fecha: string;

  /** Días respecto al calendario fiscal: positive = adelantado, negative = atrasado */
  dias_calendario: number;
};
```

---

## 2. Visual desktop 1440

```
●──────●──────◉──────○──────○
Docs    Calc    Pre-rev  Envío   DGII
recib   listo            conf

"3 días dentro del calendario · Próxima fecha: 15 may"
```

| Estado dot | Visual |
|---|---|
| `done` | `●` solid color A (verde) `#00C48C` |
| `current` | `◉` outline + glow color C (azul) `#4C9EFF` + animación pulse |
| `pending` | `○` outline color `rgba(255,255,255,0.3)` |

**Línea conexión**: línea horizontal 2px entre dots. Tramo done = verde (A). Tramo pending = `rgba(255,255,255,0.16)`.

---

## 3. Visual tablet 768

Mismo layout, labels más cortos con tooltip on hover:

```
●──●──◉──○──○
Doc Cal P-r Env DGI
```

---

## 4. Visual mobile 375

Compacto sin labels, indicador textual:

```
●──●──◉──○──○

Etapa 3/5: Pre-revisión
3 días dentro del calendario
```

---

## 5. Implementación TSX

```tsx
import { type FC } from 'react';
import { CheckIcon, ClockIcon, AlertIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

const STAGE_DEFINITIONS: Array<{
  key: Stage;
  label: string;
  labelShort: string;
  description: string;
}> = [
  { key: 'docs_recibidos',   label: 'Docs recibidos',  labelShort: 'Doc', description: 'Cliente envió documentos del mes' },
  { key: 'calculo_listo',    label: 'Cálculo listo',   labelShort: 'Cal', description: 'Contador completó cálculos' },
  { key: 'pre_revisado',     label: 'Pre-revisión',    labelShort: 'P-r', description: 'Supervisor aprobó' },
  { key: 'envio_completado', label: 'Envío',           labelShort: 'Env', description: 'Enviado a DGII' },
  { key: 'dgii_confirmado',  label: 'DGII confirmó',   labelShort: 'DGI', description: 'DGII emitió constancia' },
];

export const StageTracker: FC<StageTrackerProps> = ({
  stages, ciclo, proxima_fecha, dias_calendario
}) => {
  // Determinar etapa actual (primera pending)
  const currentIndex = STAGE_DEFINITIONS.findIndex(s => !stages[s.key]);
  const completed = currentIndex === -1; // todas done

  const statusText = dias_calendario > 0
    ? `${dias_calendario} días adelantado`
    : dias_calendario === 0
    ? 'En tiempo del calendario'
    : `${Math.abs(dias_calendario)} días atrasado`;

  const statusColor = dias_calendario >= 0 ? 'success' : 'warning';

  return (
    <section
      className="stage-tracker"
      role="region"
      aria-label={`Ciclo fiscal ${ciclo}`}
    >
      <ol
        className="stage-tracker__list"
        role="list"
        aria-label="Etapas del ciclo mensual"
      >
        {STAGE_DEFINITIONS.map((stage, idx) => {
          const state =
            stages[stage.key]   ? 'done'    :
            idx === currentIndex ? 'current' :
                                   'pending';

          return (
            <li
              key={stage.key}
              className={cn(
                'stage-tracker__item',
                `stage-tracker__item--${state}`
              )}
              role="listitem"
              aria-current={state === 'current' ? 'step' : undefined}
              aria-label={`${stage.label}, etapa ${idx + 1} de 5, ${state === 'done' ? 'completada' : state === 'current' ? 'actual' : 'pendiente'}`}
            >
              <div className="stage-tracker__dot" aria-hidden="true">
                {state === 'done' && <CheckIcon size={10} />}
              </div>
              <span className="stage-tracker__label stage-tracker__label--desktop">
                {stage.label}
              </span>
              <span className="stage-tracker__label stage-tracker__label--mobile" aria-hidden="true">
                {stage.labelShort}
              </span>
              {idx < STAGE_DEFINITIONS.length - 1 && (
                <div className="stage-tracker__line" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>

      <div className="stage-tracker__meta">
        <span
          className={cn('stage-tracker__status', `stage-tracker__status--${statusColor}`)}
        >
          <ClockIcon size={14} />
          {statusText}
        </span>
        <span className="stage-tracker__separator" aria-hidden="true">·</span>
        <span className="stage-tracker__date">
          Próxima fecha: {formatDate(proxima_fecha)}
        </span>
      </div>

      {/* Mobile only — textual indicator */}
      <p className="stage-tracker__mobile-summary" aria-live="polite">
        Etapa {currentIndex + 1}/5: {STAGE_DEFINITIONS[currentIndex]?.label}
      </p>
    </section>
  );
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-DO', { day: '2-digit', month: 'short' }).format(new Date(iso));
}
```

---

## 6. CSS scoped

```css
.stage-tracker {
  padding: var(--space-4) var(--space-6);
  background: var(--bg-2);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-subtle);
}

.stage-tracker__list {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  list-style: none;
  padding: 0;
  margin: 0;
  position: relative;
}

.stage-tracker__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
  text-align: center;
}

.stage-tracker__dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: var(--motion-card-hover);
}

.stage-tracker__item--done .stage-tracker__dot {
  background: var(--grade-a);
  color: var(--surface-bg);
}

.stage-tracker__item--current .stage-tracker__dot {
  width: 20px;
  height: 20px;
  background: var(--bg-2);
  border: 2px solid var(--grade-c);
  box-shadow: var(--shadow-glow-c);
  animation: stage-pulse 2s ease-in-out infinite;
}

@keyframes stage-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(76, 158, 255, 0.5); }
  50%      { box-shadow: 0 0 0 6px rgba(76, 158, 255, 0); }
}

.stage-tracker__item--pending .stage-tracker__dot {
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.stage-tracker__label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-top: var(--space-2);
  white-space: nowrap;
}

.stage-tracker__item--done .stage-tracker__label,
.stage-tracker__item--current .stage-tracker__label {
  color: var(--text-primary);
}

.stage-tracker__label--mobile { display: none; }

.stage-tracker__line {
  position: absolute;
  top: 8px;
  left: 50%;
  right: calc(-50% + 16px);
  height: 2px;
  background: rgba(255, 255, 255, 0.16);
  z-index: 1;
}

.stage-tracker__item--done + .stage-tracker__item .stage-tracker__line,
.stage-tracker__item--done .stage-tracker__line {
  background: var(--grade-a);
}

.stage-tracker__meta {
  margin-top: var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 13px;
  color: var(--text-secondary);
  justify-content: center;
}

.stage-tracker__status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-weight: 500;
}

.stage-tracker__status--success { color: var(--grade-a); }
.stage-tracker__status--warning { color: var(--grade-d); }

.stage-tracker__mobile-summary {
  display: none;
  margin-top: var(--space-3);
  font-size: 13px;
  color: var(--text-primary);
  text-align: center;
}

/* Tablet 768 */
@media (max-width: 1023px) {
  .stage-tracker__label--desktop { display: none; }
  .stage-tracker__label--mobile { display: block; }
}

/* Mobile 375 */
@media (max-width: 767px) {
  .stage-tracker__label { display: none; }
  .stage-tracker__mobile-summary { display: block; }
  .stage-tracker { padding: var(--space-3); }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .stage-tracker__item--current .stage-tracker__dot {
    animation: none;
    box-shadow: 0 0 0 2px var(--grade-c);
  }
  .stage-tracker__dot { transition: none; }
}
```

---

## 7. Datos requeridos (API)

```typescript
GET /api/v2/clientes/[id]/ciclo-mensual?month=2026-05

Response:
{
  ciclo: '2026-05',
  stages: {
    docs_recibidos: true,
    calculo_listo: true,
    pre_revisado: false,
    envio_completado: false,
    dgii_confirmado: false
  },
  proxima_fecha: '2026-05-15',
  dias_calendario: 3   // +3 = adelantado, -2 = atrasado, 0 = en tiempo
}
```

Esta info viene de la tabla `clientes_estado_ciclo_mensual` definida en migration KB 16924 §10.3.

═══ FIRMA ═══ FacturaIA / 2026-05-14 / spec StageTracker.tsx
