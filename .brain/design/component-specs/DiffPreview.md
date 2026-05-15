# Component Spec — DiffPreview

**Skills**: `design-to-code` + `composition-patterns` + `design-accessibility`
**Path**: `app/clientes/_components/DiffPreview.tsx`
**LOC**: 150
**Tipo**: Server Component (datos vienen como prop)
**Wave**: W4 (popover)
**Inspiración**: GitHub diff view + Linear

---

## 1. API

```tsx
type DiffPreviewProps = {
  diff: PreviewDiff;
  loading?: boolean;
  error?: string | null;
  compact?: boolean;       // compact mode dentro del popover (default true)
  className?: string;
};

type PreviewDiff = {
  from_perfil: Grade;
  to_perfil: Grade;
  pipelines: {
    removed: string[];   // ['RST', ...]
    added:   string[];   // ['IT-1', '606', ...]
    kept:    string[];   // (opcional, compact=false)
  };
  obligaciones_nuevas: Array<{
    form: string;       // 'IT-1'
    frecuencia: string; // 'mensual'
    descripcion?: string;
  }>;
  precio_mensual: {
    from: number;
    to: number;
    diff_pct: number;   // 66.7
  } | null;
  advertencias?: string[];
};
```

---

## 2. Visual compact (default — dentro del popover)

```
── Preview impacto ──────────────────────

PIPELINES
  ✗ RST
  ✓ Régimen Ordinario

OBLIGACIONES NUEVAS
  + IT-1 mensual
  + IR-2 anual
  + ACT trimestral

PRECIO MENSUAL
  RD$ 4,500 → RD$ 7,500
  ▲ +66%

⚠ Cliente recibirá email si notificar=true
```

| Marca | Color | Significado |
|---|---|---|
| `✗` | `--grade-f` rojo | Pipeline eliminado |
| `✓` | `--grade-a` verde | Pipeline mantenido/añadido |
| `+` | `--grade-a` verde | Obligación nueva |
| `−` | `--grade-f` rojo | Obligación removida |
| `▲` | `--grade-d` naranja | Precio sube |
| `▼` | `--grade-a` verde | Precio baja |

---

## 3. Visual full (compact=false, futuro modal expanded)

Idéntico pero con sección "MANTENIDOS" desplegable + más detalle por obligación.

---

## 4. Estados

| Estado | Visual |
|---|---|
| `loading` | Skeleton 3 bloques (PIPELINES, OBLIGACIONES, PRECIO) con shimmer |
| `error` | Banner "No pudimos calcular impacto · Continuar de todos modos" + icono ⚠ |
| `pipelines={removed:[], added:[]}` | "Sin cambios en pipelines" italic gris |
| `obligaciones_nuevas=[]` | "Sin obligaciones nuevas" italic gris |
| `precio_mensual=null` | Sección PRECIO oculta |
| `advertencias` con items | Banner amarillo abajo con lista |

---

## 5. Implementación TSX

```tsx
import { type FC } from 'react';
import { AlertTriangleIcon, ArrowUpIcon, ArrowDownIcon, MinusIcon, PlusIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

const formatCurrency = (n: number) => `RD$ ${n.toLocaleString('es-DO')}`;

const DiffSkeleton: FC = () => (
  <div className="diff-preview diff-preview--loading" aria-busy="true" aria-label="Calculando impacto">
    {[1, 2, 3].map((i) => (
      <div key={i} className="diff-skeleton-block">
        <div className="diff-skeleton-bar diff-skeleton-bar--title" />
        <div className="diff-skeleton-bar diff-skeleton-bar--line" />
        <div className="diff-skeleton-bar diff-skeleton-bar--line" />
      </div>
    ))}
  </div>
);

export const DiffPreview: FC<DiffPreviewProps> = ({
  diff, loading, error, compact = true, className
}) => {
  if (loading) return <DiffSkeleton />;

  if (error) {
    return (
      <div className={cn('diff-preview diff-preview--error', className)} role="alert">
        <AlertTriangleIcon size={16} aria-hidden="true" />
        <span>No pudimos calcular el impacto. Puedes continuar de todos modos.</span>
      </div>
    );
  }

  const { pipelines, obligaciones_nuevas, precio_mensual, advertencias } = diff;
  const sinCambiosPipelines = pipelines.removed.length === 0 && pipelines.added.length === 0;
  const sinObligaciones = obligaciones_nuevas.length === 0;

  return (
    <section
      className={cn('diff-preview', compact && 'diff-preview--compact', className)}
      aria-labelledby="diff-preview-title"
    >
      <header className="diff-preview__header">
        <h3 id="diff-preview-title" className="diff-preview__title">
          Preview impacto: {diff.from_perfil} → {diff.to_perfil}
        </h3>
      </header>

      {/* PIPELINES */}
      <div className="diff-block">
        <span className="diff-block__label">PIPELINES</span>
        {sinCambiosPipelines ? (
          <em className="diff-block__empty">Sin cambios</em>
        ) : (
          <ul className="diff-block__list">
            {pipelines.removed.map((p) => (
              <li key={`r-${p}`} className="diff-line diff-line--removed">
                <span className="diff-line__mark" aria-hidden="true">✗</span>
                <span className="diff-line__text">{p}</span>
                <span className="sr-only">eliminado</span>
              </li>
            ))}
            {pipelines.added.map((p) => (
              <li key={`a-${p}`} className="diff-line diff-line--added">
                <span className="diff-line__mark" aria-hidden="true">✓</span>
                <span className="diff-line__text">{p}</span>
                <span className="sr-only">añadido</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* OBLIGACIONES */}
      <div className="diff-block">
        <span className="diff-block__label">OBLIGACIONES NUEVAS</span>
        {sinObligaciones ? (
          <em className="diff-block__empty">Sin obligaciones nuevas</em>
        ) : (
          <ul className="diff-block__list">
            {obligaciones_nuevas.map((o) => (
              <li key={o.form} className="diff-line diff-line--added">
                <PlusIcon size={12} className="diff-line__mark" aria-hidden="true" />
                <span className="diff-line__text">
                  <strong>{o.form}</strong> <span className="diff-line__freq">{o.frecuencia}</span>
                </span>
                <span className="sr-only">añadida</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* PRECIO */}
      {precio_mensual && (
        <div className="diff-block">
          <span className="diff-block__label">PRECIO MENSUAL</span>
          <div className="diff-precio">
            <span className="diff-precio__from">{formatCurrency(precio_mensual.from)}</span>
            <span className="diff-precio__arrow" aria-hidden="true">→</span>
            <span className="diff-precio__to">{formatCurrency(precio_mensual.to)}</span>
            <span
              className={cn(
                'diff-precio__delta',
                precio_mensual.diff_pct > 0 ? 'diff-precio__delta--up' : 'diff-precio__delta--down'
              )}
              aria-label={`${precio_mensual.diff_pct > 0 ? 'Aumento' : 'Disminución'} del ${Math.abs(precio_mensual.diff_pct)} por ciento`}
            >
              {precio_mensual.diff_pct > 0 ? <ArrowUpIcon size={12} /> : <ArrowDownIcon size={12} />}
              {precio_mensual.diff_pct > 0 ? '+' : ''}{precio_mensual.diff_pct.toFixed(0)}%
            </span>
          </div>
        </div>
      )}

      {/* ADVERTENCIAS */}
      {advertencias && advertencias.length > 0 && (
        <div className="diff-warnings" role="note">
          <AlertTriangleIcon size={14} aria-hidden="true" />
          <ul>
            {advertencias.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}
    </section>
  );
};
```

---

## 6. CSS scoped

```css
.diff-preview {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--bg-3);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
}
.diff-preview--compact { font-size: 13px; }

.diff-preview__header { padding-bottom: var(--space-2); border-bottom: 1px solid var(--border-subtle); }
.diff-preview__title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-secondary);
  margin: 0;
}

.diff-block { display: flex; flex-direction: column; gap: var(--space-1); }
.diff-block__label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-secondary);
}
.diff-block__empty {
  font-style: italic;
  color: var(--text-tertiary);
  font-size: 12px;
}
.diff-block__list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 2px; }

.diff-line {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 13px;
}
.diff-line--removed { background: var(--grade-soft-f); color: var(--grade-f); }
.diff-line--added   { background: var(--grade-soft-a); color: var(--grade-a); }
.diff-line__mark    { display: inline-flex; width: 14px; justify-content: center; font-weight: 700; }
.diff-line__text    { color: var(--text-primary); }
.diff-line__freq    { font-size: 11px; color: var(--text-secondary); margin-left: var(--space-1); font-family: var(--font-sans); }

.diff-precio {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}
.diff-precio__from { color: var(--text-secondary); text-decoration: line-through; }
.diff-precio__arrow { color: var(--text-tertiary); }
.diff-precio__to { color: var(--text-primary); font-weight: 700; font-size: 16px; }
.diff-precio__delta {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  margin-left: var(--space-2);
}
.diff-precio__delta--up   { color: var(--grade-d); background: var(--grade-soft-d); }
.diff-precio__delta--down { color: var(--grade-a); background: var(--grade-soft-a); }

.diff-warnings {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--grade-soft-d);
  border-radius: var(--radius-sm);
  color: var(--grade-d);
  font-size: 12px;
}
.diff-warnings ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 2px; }

.diff-preview--error {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--grade-soft-d);
  color: var(--grade-d);
  border-radius: var(--radius-md);
  font-size: 13px;
}

.diff-skeleton-block { display: flex; flex-direction: column; gap: var(--space-1); }
.diff-skeleton-bar {
  height: 14px;
  background: linear-gradient(90deg, var(--bg-3) 0%, var(--bg-hover) 50%, var(--bg-3) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm);
}
.diff-skeleton-bar--title { width: 40%; height: 10px; }
.diff-skeleton-bar--line  { width: 70%; }

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .diff-skeleton-bar { animation: none; opacity: 0.5; }
}
```

---

## 7. A11y

- Section con `aria-labelledby` y título h3
- Marks `aria-hidden="true"` + `<span class="sr-only">eliminado/añadido</span>` para SR
- Trend percentage `aria-label` ("Aumento del 66 por ciento")
- Loading state con `aria-busy="true"` + `aria-label`
- Error state con `role="alert"`
- Warnings con `role="note"`

---

## 8. Performance

- Server Component (datos vienen como prop)
- Sin state local
- CSS animations en lugar de JS

---

## 9. Tests

```ts
describe('DiffPreview', () => {
  it('renderiza skeleton en loading=true', () => { /* */ });
  it('error → alert + mensaje continuar', () => { /* */ });
  it('pipelines vacíos → "Sin cambios"', () => { /* */ });
  it('precio_mensual=null oculta sección precio', () => { /* */ });
  it('diff_pct >0 → flecha up naranja', () => { /* */ });
  it('diff_pct <0 → flecha down verde', () => { /* */ });
  it('advertencias renderiza banner amarillo con lista', () => { /* */ });
  it('aria-labels semánticos por marca diff', () => { /* */ });
});
```

═══ FIRMA ═══ FacturaIA / 2026-05-14 / spec DiffPreview.tsx W4
