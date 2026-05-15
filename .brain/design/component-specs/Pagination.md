# Component Spec — Pagination

**Skills**: `design-to-code` + `design-accessibility` + `design-responsive`
**Path**: `app/clientes/perfilado-af/_components/Pagination.tsx`
**LOC**: 80
**Tipo**: Client Component (state controlado por padre, callbacks)
**Wave**: W2
**Reutilizable**: cualquier vista paginada server-side del SaaS

---

## 1. API

```tsx
type PaginationProps = {
  currentPage: number;        // 1-indexed
  totalPages: number;
  totalItems: number;
  pageSize: number;           // ej. 50
  onPageChange: (page: number) => void;
  pageSizeOptions?: number[]; // ej. [25, 50, 100] — si presente muestra dropdown
  onPageSizeChange?: (size: number) => void;
  className?: string;
};
```

---

## 2. Visual desktop

```
◀ Anterior   1 2 3 … 11   Siguiente ▶          Mostrando 1-50 de 503    [50 por pág ▼]
```

Tamaño jump (≥ 5 pages): muestra `1 2 3 … N` (current y vecinos + first/last + ellipsis).

---

## 3. Visual mobile 375

```
◀  Pág 1 / 11  ▶       1-50 de 503
```

Compacto: solo prev/next + texto. Sin números, sin pageSize selector.

---

## 4. Implementación TSX

```tsx
'use client';

import { type FC, useMemo, useCallback } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

function buildPageList(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const result: (number | 'ellipsis')[] = [1];
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  if (left > 2) result.push('ellipsis');
  for (let i = left; i <= right; i++) result.push(i);
  if (right < total - 1) result.push('ellipsis');
  result.push(total);
  return result;
}

export const Pagination: FC<PaginationProps> = ({
  currentPage, totalPages, totalItems, pageSize,
  onPageChange, pageSizeOptions, onPageSizeChange, className
}) => {
  const pageList = useMemo(() => buildPageList(currentPage, totalPages), [currentPage, totalPages]);
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  const goPrev  = useCallback(() => currentPage > 1            && onPageChange(currentPage - 1), [currentPage, onPageChange]);
  const goNext  = useCallback(() => currentPage < totalPages   && onPageChange(currentPage + 1), [currentPage, totalPages, onPageChange]);
  const goFirst = useCallback(() => currentPage > 1            && onPageChange(1),               [currentPage, onPageChange]);
  const goLast  = useCallback(() => currentPage < totalPages   && onPageChange(totalPages),      [currentPage, totalPages, onPageChange]);

  if (totalPages === 0) return null;

  return (
    <nav className={cn('pagination', className)} aria-label="Paginación de resultados">
      {/* Desktop number list */}
      <div className="pagination__pages pagination__pages--desktop">
        <button
          type="button"
          onClick={goFirst}
          disabled={currentPage === 1}
          aria-label="Primera página"
          className="pagination__btn pagination__btn--icon"
        >
          <ChevronsLeftIcon size={14} />
        </button>
        <button
          type="button"
          onClick={goPrev}
          disabled={currentPage === 1}
          aria-label="Página anterior"
          className="pagination__btn"
        >
          <ChevronLeftIcon size={14} /> <span>Anterior</span>
        </button>

        {pageList.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`e${i}`} className="pagination__ellipsis" aria-hidden="true">…</span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === currentPage ? 'page' : undefined}
              aria-label={`Ir a página ${p}${p === currentPage ? ', página actual' : ''}`}
              className={cn('pagination__btn pagination__btn--num', p === currentPage && 'pagination__btn--active')}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          onClick={goNext}
          disabled={currentPage === totalPages}
          aria-label="Página siguiente"
          className="pagination__btn"
        >
          <span>Siguiente</span> <ChevronRightIcon size={14} />
        </button>
        <button
          type="button"
          onClick={goLast}
          disabled={currentPage === totalPages}
          aria-label="Última página"
          className="pagination__btn pagination__btn--icon"
        >
          <ChevronsRightIcon size={14} />
        </button>
      </div>

      {/* Mobile compact */}
      <div className="pagination__pages pagination__pages--mobile">
        <button
          type="button"
          onClick={goPrev}
          disabled={currentPage === 1}
          aria-label="Página anterior"
          className="pagination__btn pagination__btn--mobile"
        >
          <ChevronLeftIcon size={16} />
        </button>
        <span className="pagination__mobile-info">
          Pág <strong>{currentPage}</strong> / {totalPages}
        </span>
        <button
          type="button"
          onClick={goNext}
          disabled={currentPage === totalPages}
          aria-label="Página siguiente"
          className="pagination__btn pagination__btn--mobile"
        >
          <ChevronRightIcon size={16} />
        </button>
      </div>

      <div className="pagination__info" aria-live="polite">
        Mostrando <strong>{start}-{end}</strong> de <strong>{totalItems}</strong>
      </div>

      {pageSizeOptions && onPageSizeChange && (
        <label className="pagination__size">
          <span className="sr-only">Resultados por página</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label="Resultados por página"
            className="pagination__size-select"
          >
            {pageSizeOptions.map((s) => (
              <option key={s} value={s}>{s} por pág</option>
            ))}
          </select>
        </label>
      )}
    </nav>
  );
};
```

---

## 5. CSS scoped

```css
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3);
  padding: var(--space-4) 0;
  font-family: var(--font-sans);
  font-size: 14px;
}

.pagination__pages {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}
.pagination__pages--mobile  { display: none; }

.pagination__btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  min-height: var(--touch-target-min);
  min-width: 40px;
  background: var(--bg-2);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font: inherit;
  cursor: pointer;
  transition: all var(--motion-duration-fast);
}
.pagination__btn:hover:not(:disabled) {
  background: var(--bg-hover);
  color: var(--text-primary);
  border-color: var(--border-default);
}
.pagination__btn:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}
.pagination__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination__btn--num      { font-family: var(--font-mono); min-width: 44px; justify-content: center; }
.pagination__btn--icon     { padding: var(--space-2); min-width: 40px; }

.pagination__btn--active {
  background: var(--grade-c);
  color: var(--surface-bg);
  border-color: var(--grade-c);
  font-weight: 700;
}

.pagination__ellipsis {
  color: var(--text-tertiary);
  padding: 0 var(--space-2);
}

.pagination__info {
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}
.pagination__info strong { color: var(--text-primary); font-weight: 600; }

.pagination__mobile-info { color: var(--text-secondary); }
.pagination__mobile-info strong { color: var(--text-primary); font-family: var(--font-mono); }

.pagination__size-select {
  padding: var(--space-2) var(--space-3);
  background: var(--bg-2);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font: inherit;
  cursor: pointer;
}
.pagination__size-select:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

@media (max-width: 767px) {
  .pagination__pages--desktop { display: none; }
  .pagination__pages--mobile  { display: flex; }
  .pagination__size           { display: none; }   /* mobile sin selector page size */
  .pagination                 { justify-content: center; }
}

@media (prefers-reduced-motion: reduce) {
  .pagination__btn { transition: none; }
}
```

---

## 6. Estados

| Estado | Comportamiento |
|---|---|
| `totalPages=0` | No renderiza nada |
| `currentPage=1` | First + Prev disabled |
| `currentPage=totalPages` | Next + Last disabled |
| `totalPages ≤ 7` | Mostrar todas las páginas sin ellipsis |
| `totalPages > 7` | `1 … current-1 current current+1 … N` |
| Mobile | Solo Prev/Next icon + texto compacto |

---

## 7. A11y

- `<nav aria-label="Paginación de resultados">`
- `aria-current="page"` en el active
- `aria-label` descriptivo por botón ("Ir a página 5", "Primera página")
- `aria-live="polite"` en el contador "Mostrando 1-50 de 503" → screen reader anuncia cambio
- Touch targets ≥ 44×44 en mobile
- `sr-only` label para el select pageSize

---

## 8. Performance

- `useMemo` para `pageList`
- `useCallback` para handlers
- Sin animaciones costosas

---

## 9. Tests

```ts
describe('Pagination', () => {
  it('totalPages=0 no renderiza', () => { /* */ });
  it('5 pages muestra todos sin ellipsis', () => { /* */ });
  it('11 pages current=5 → 1 … 4 5 6 … 11', () => { /* */ });
  it('Prev disabled en page 1', () => { /* */ });
  it('Next disabled en last page', () => { /* */ });
  it('click page number llama onPageChange con valor', () => { /* */ });
  it('aria-current="page" en active', () => { /* */ });
  it('mobile <768 muestra compact UI', () => { /* */ });
  it('aria-live anuncia cambio Mostrando X-Y', () => { /* */ });
});
```

═══ FIRMA ═══ FacturaIA / 2026-05-14 / spec Pagination.tsx W2
