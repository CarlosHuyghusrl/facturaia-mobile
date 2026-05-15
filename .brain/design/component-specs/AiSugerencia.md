# Component Spec — AiSugerencia

**Skills**: `design-to-code` + `react-best-practices` + `design-accessibility` + `design-usability`
**Path**: `app/clientes/revision-guiada-perfil-c/_components/AiSugerencia.tsx`
**LOC**: 100
**Tipo**: Client Component (estado expand/collapse + SWR lazy refetch)
**Wave**: W5
**Helpers internos**: `ConfidencePill.tsx` (~30 LOC inline)

---

## 1. API

```tsx
type AiSugerenciaProps = {
  sugerido: Grade;                  // 'A'-'G'
  confidence: number;               // 0.0 - 1.0 → mostrar como %
  razones: string[];                // 3-5 razones del modelo
  modelo?: 'gemini-2.5-flash' | 'gemini-2.5-pro' | 'claude-sonnet' | 'heuristica';
  fallback_heuristica?: boolean;    // true si Gemini down y usó la heurística inline existente
  loading?: boolean;
  error?: string | null;
  onRegenerar?: () => void;         // callback "Regenerar sugerencia"
  onVerDetalle?: () => void;        // abre modal con prompt + features crudos
  className?: string;
};
```

---

## 2. Visual

```
┌─ SUGERENCIA AI ────────────────────────────────────┐
│                                                     │
│  ★  B  Perfil Bueno              [ 87% ✓ ]         │
│                                                     │
│  Razones:                                           │
│   ▸ RNC cédula 9 dígitos = Persona Jurídica         │
│   ▸ Sin nómina (no TSS aplicable)                   │
│   ▸ Facturación RD$ 45,200/mes (rango B)            │
│                                                     │
│  Ver más (2)                  Regenerar · Ver detalle│
│                                                     │
│  modelo: Gemini 2.5 Flash                           │
└─────────────────────────────────────────────────────┘
```

| Confianza pill | Color |
|---|---|
| ≥ 80% | `--grade-a` verde — "Alta" |
| 60-79% | `--grade-c` azul — "Media" |
| 40-59% | `--grade-d` naranja — "Baja" |
| < 40% | `--grade-f` rojo — "Muy baja" |

Border del card = color del grado sugerido (left border 3px).

---

## 3. Estados

| Estado | Visual |
|---|---|
| `loading` | Skeleton banner con shimmer + label "Analizando cliente..." |
| `error` (LLM down) | Alt: "⚠ Sugerencia no disponible · Decide manualmente o [Reintentar]". NO bloquea decisión |
| `fallback_heuristica=true` | Pill adicional "heurística" gris al lado del modelo + tooltip "Modelo LLM no disponible, usando reglas internas" |
| `razones.length ≤ 3` | Mostrar todas inline, sin "Ver más" |
| `razones.length > 3` | Mostrar 3 + botón "Ver más (N)" expand inline |
| `confidence ≥ 0.85` | Pill verde con ✓ |
| `confidence < 0.4` | Banner amarillo: "Confianza baja — confirma manualmente" |

---

## 4. Implementación TSX

```tsx
'use client';

import { type FC, useState } from 'react';
import { GradeBadge } from '@/app/clientes/_components/GradeBadge';
import { AlertTriangleIcon, RefreshIcon, ExternalLinkIcon, CheckIcon } from '@/components/icons';
import { gradeConfig } from '@/lib/perfilado/gradeConfig';
import { cn } from '@/lib/utils';

const getConfidenceClass = (c: number): string => {
  if (c >= 0.80) return 'confidence-pill--high';
  if (c >= 0.60) return 'confidence-pill--medium';
  if (c >= 0.40) return 'confidence-pill--low';
  return 'confidence-pill--very-low';
};

const getConfidenceLabel = (c: number): string => {
  if (c >= 0.80) return 'Alta';
  if (c >= 0.60) return 'Media';
  if (c >= 0.40) return 'Baja';
  return 'Muy baja';
};

const ConfidencePill: FC<{ confidence: number }> = ({ confidence }) => {
  const pct = Math.round(confidence * 100);
  return (
    <span
      className={cn('confidence-pill', getConfidenceClass(confidence))}
      aria-label={`Confianza ${pct}%, ${getConfidenceLabel(confidence)}`}
    >
      {pct >= 80 && <CheckIcon size={12} aria-hidden="true" />}
      <span className="confidence-pill__value">{pct}%</span>
    </span>
  );
};

const SugerenciaSkeleton: FC = () => (
  <div className="ai-sugerencia ai-sugerencia--loading" role="status" aria-busy="true">
    <div className="ai-sugerencia__skeleton-title" />
    <div className="ai-sugerencia__skeleton-row" />
    <div className="ai-sugerencia__skeleton-row" />
    <span className="sr-only">Analizando cliente con IA…</span>
  </div>
);

export const AiSugerencia: FC<AiSugerenciaProps> = ({
  sugerido, confidence, razones, modelo, fallback_heuristica,
  loading, error, onRegenerar, onVerDetalle, className
}) => {
  const [showAll, setShowAll] = useState(false);

  if (loading) return <SugerenciaSkeleton />;

  if (error) {
    return (
      <div className={cn('ai-sugerencia ai-sugerencia--error', className)} role="alert">
        <AlertTriangleIcon size={16} aria-hidden="true" />
        <div className="ai-sugerencia__error-text">
          <strong>Sugerencia no disponible</strong>
          <p>Decide manualmente o reintenta en unos segundos.</p>
        </div>
        {onRegenerar && (
          <button type="button" onClick={onRegenerar} className="ai-sugerencia__retry">
            <RefreshIcon size={14} /> Reintentar
          </button>
        )}
      </div>
    );
  }

  const config = gradeConfig[sugerido];
  const razonesVisibles = showAll ? razones : razones.slice(0, 3);
  const hayMas = razones.length > 3;
  const confianzaBaja = confidence < 0.4;

  return (
    <section
      className={cn('ai-sugerencia', className)}
      data-grade={sugerido}
      aria-labelledby="ai-sugerencia-title"
    >
      <header className="ai-sugerencia__header">
        <span className="ai-sugerencia__star" aria-hidden="true">★</span>
        <span id="ai-sugerencia-title" className="ai-sugerencia__title">SUGERENCIA AI</span>
      </header>

      <div className="ai-sugerencia__body">
        <GradeBadge grade={sugerido} variant="solid" size="lg" />
        <div className="ai-sugerencia__suggestion">
          <span className="ai-sugerencia__label">Perfil {sugerido}</span>
          <span className="ai-sugerencia__desc">{config.label}</span>
        </div>
        <ConfidencePill confidence={confidence} />
      </div>

      {confianzaBaja && (
        <div className="ai-sugerencia__low-warning" role="note">
          Confianza baja — confirma manualmente
        </div>
      )}

      <div className="ai-sugerencia__razones">
        <span className="ai-sugerencia__razones-label">Razones:</span>
        <ul className="ai-sugerencia__razones-list">
          {razonesVisibles.map((r, i) => (
            <li key={i}>
              <span className="ai-sugerencia__razon-mark" aria-hidden="true">▸</span>
              {r}
            </li>
          ))}
        </ul>
        {hayMas && (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="ai-sugerencia__toggle"
            aria-expanded={showAll}
          >
            {showAll ? 'Ver menos' : `Ver más (${razones.length - 3})`}
          </button>
        )}
      </div>

      <footer className="ai-sugerencia__footer">
        <div className="ai-sugerencia__modelo">
          <span>modelo:</span>
          <strong>{modelo ?? 'desconocido'}</strong>
          {fallback_heuristica && (
            <span
              className="ai-sugerencia__fallback-pill"
              title="Modelo LLM no disponible, usando reglas internas"
            >
              heurística
            </span>
          )}
        </div>
        <div className="ai-sugerencia__actions">
          {onRegenerar && (
            <button type="button" onClick={onRegenerar} className="ai-sugerencia__action">
              <RefreshIcon size={12} aria-hidden="true" /> Regenerar
            </button>
          )}
          {onVerDetalle && (
            <button type="button" onClick={onVerDetalle} className="ai-sugerencia__action">
              <ExternalLinkIcon size={12} aria-hidden="true" /> Ver detalle
            </button>
          )}
        </div>
      </footer>
    </section>
  );
};
```

---

## 5. CSS scoped (extracto)

```css
.ai-sugerencia {
  background: var(--bg-2);
  border: 1px solid var(--border-subtle);
  border-left: 3px solid var(--grade-c);  /* color del grado sugerido */
  border-radius: var(--radius-md);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
.ai-sugerencia[data-grade="A"] { border-left-color: var(--grade-a); }
.ai-sugerencia[data-grade="B"] { border-left-color: var(--grade-b); }
.ai-sugerencia[data-grade="C"] { border-left-color: var(--grade-c); }
.ai-sugerencia[data-grade="D"] { border-left-color: var(--grade-d); }
.ai-sugerencia[data-grade="E"] { border-left-color: var(--grade-e); }
.ai-sugerencia[data-grade="F"] { border-left-color: var(--grade-f); }
.ai-sugerencia[data-grade="G"] { border-left-color: var(--grade-c-def); }

.ai-sugerencia__header { display: inline-flex; align-items: center; gap: var(--space-2); }
.ai-sugerencia__star { color: var(--grade-d); font-size: 16px; }
.ai-sugerencia__title { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-secondary); }

.ai-sugerencia__body { display: flex; align-items: center; gap: var(--space-3); }
.ai-sugerencia__suggestion { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.ai-sugerencia__label { font-family: var(--font-mono); font-size: 18px; font-weight: 700; color: var(--text-primary); }
.ai-sugerencia__desc { font-size: 13px; color: var(--text-secondary); }

.confidence-pill {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  font-family: var(--font-mono);
  font-size: 12px; font-weight: 700;
}
.confidence-pill--high     { background: var(--grade-soft-a); color: var(--grade-a); }
.confidence-pill--medium   { background: var(--grade-soft-c); color: var(--grade-c); }
.confidence-pill--low      { background: var(--grade-soft-d); color: var(--grade-d); }
.confidence-pill--very-low { background: var(--grade-soft-f); color: var(--grade-f); }

.ai-sugerencia__low-warning {
  padding: var(--space-2) var(--space-3);
  background: var(--grade-soft-d);
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--grade-d);
}

.ai-sugerencia__razones-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-secondary); }
.ai-sugerencia__razones-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
.ai-sugerencia__razones-list li { display: flex; gap: var(--space-2); font-size: 13px; color: var(--text-primary); line-height: 1.5; }
.ai-sugerencia__razon-mark { color: var(--grade-c); font-family: var(--font-mono); }

.ai-sugerencia__toggle { background: none; border: none; padding: 0; margin-top: var(--space-1); color: var(--grade-c); font-size: 12px; cursor: pointer; }
.ai-sugerencia__toggle:hover { color: var(--text-primary); }
.ai-sugerencia__toggle:focus-visible { outline: 2px solid var(--border-focus); outline-offset: 2px; }

.ai-sugerencia__footer { display: flex; align-items: center; justify-content: space-between; padding-top: var(--space-2); border-top: 1px solid var(--border-subtle); font-size: 11px; color: var(--text-tertiary); }
.ai-sugerencia__modelo { display: inline-flex; align-items: center; gap: var(--space-1); }
.ai-sugerencia__fallback-pill { padding: 2px 6px; background: var(--bg-3); border-radius: var(--radius-sm); font-size: 10px; color: var(--text-secondary); }
.ai-sugerencia__actions { display: flex; gap: var(--space-2); }
.ai-sugerencia__action {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 8px;
  background: var(--bg-3);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  color: var(--text-secondary); font: inherit; cursor: pointer;
}
.ai-sugerencia__action:hover { color: var(--text-primary); border-color: var(--border-default); }
.ai-sugerencia__action:focus-visible { outline: 2px solid var(--border-focus); outline-offset: 2px; }

.ai-sugerencia--error { display: flex; gap: var(--space-3); align-items: center; padding: var(--space-3); background: var(--grade-soft-d); border-radius: var(--radius-md); }
.ai-sugerencia__error-text { flex: 1; }
.ai-sugerencia__error-text strong { display: block; color: var(--grade-d); }
.ai-sugerencia__error-text p { margin: 0; font-size: 13px; color: var(--text-secondary); }
.ai-sugerencia__retry { padding: var(--space-2) var(--space-3); background: var(--bg-3); border: 1px solid var(--border-default); border-radius: var(--radius-sm); color: var(--text-primary); cursor: pointer; }

.ai-sugerencia__skeleton-title,
.ai-sugerencia__skeleton-row {
  height: 14px;
  background: linear-gradient(90deg, var(--bg-3) 0%, var(--bg-hover) 50%, var(--bg-3) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm);
}
.ai-sugerencia__skeleton-title { width: 40%; }
.ai-sugerencia__skeleton-row   { width: 80%; }

@media (prefers-reduced-motion: reduce) {
  .ai-sugerencia__skeleton-title,
  .ai-sugerencia__skeleton-row { animation: none; opacity: 0.5; }
}
```

---

## 6. A11y

- `<section aria-labelledby>` con título visible
- `role="alert"` en error
- `role="status" aria-busy="true"` en loading
- `aria-expanded` en botón "Ver más"
- ConfidencePill con `aria-label` completo ("Confianza 87%, Alta")
- Mark visual `▸` decorativo (`aria-hidden="true"`) — el texto razón es lo que SR lee

---

## 7. Performance

- `'use client'` necesario (state expand/collapse)
- Sin re-fetch automático (lo controla padre via `onRegenerar`)
- CSS animations en shimmer

---

## 8. Tests

```ts
describe('AiSugerencia', () => {
  it('loading=true renderiza skeleton + sr-only', () => { /* */ });
  it('error renderiza alert con botón Reintentar', () => { /* */ });
  it('confidence=0.87 muestra pill verde Alta con ✓', () => { /* */ });
  it('confidence<0.4 muestra banner warning', () => { /* */ });
  it('razones.length=5 muestra 3 + botón "Ver más (2)"', () => { /* */ });
  it('click Ver más expande lista completa', () => { /* */ });
  it('fallback_heuristica=true muestra pill "heurística" gris', () => { /* */ });
  it('border-left color del grado sugerido', () => { /* */ });
  it('aria-label completo en ConfidencePill', () => { /* */ });
});
```

═══ FIRMA ═══ FacturaIA / 2026-05-14 / spec AiSugerencia.tsx W5
