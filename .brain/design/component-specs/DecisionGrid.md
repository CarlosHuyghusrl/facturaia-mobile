# Component Spec — DecisionGrid

**Skills**: `design-to-code` + `design-accessibility` + `composition-patterns`
**Path**: `app/clientes/revision-guiada-perfil-c/_components/DecisionGrid.tsx`
**LOC**: 120
**Tipo**: Client Component (keyboard listener + animaciones decision)
**Wave**: W5
**Helpers internos**: `DecisionButton.tsx` (~50 LOC inline)

---

## 1. API

```tsx
type DecisionGridProps = {
  /** Grado sugerido por IA — recibe glow ★ */
  suggested?: Grade;

  /** Callback al elegir grado A-G */
  onAssign: (grade: Grade, motivo?: string) => Promise<void> | void;

  /** Callback "Saltar" — pasa al siguiente sin clasificar */
  onSkip: () => void;

  /** Callback "Volver" — cliente anterior */
  onBack?: () => void;

  /** Callback "Agregar nota" — modal nota sin reclasificar */
  onAddNote: () => void;

  /** Si está en submitting, deshabilita y muestra spinner */
  submitting?: boolean;

  /** Esconde "back" si es el primer cliente de la sesión */
  hasPrevious?: boolean;

  className?: string;
};
```

---

## 2. Visual

```
┌─ Asignar perfil ────────────────────────────────┐
│                                                  │
│  ┌────[1]────┬────[2]────┬────[3]────┐         │
│  │     A     │   ★ B     │     C     │         │
│  │ Excelente │   Bueno   │  Regular  │         │
│  └───────────┴───────────┴───────────┘         │
│  ┌────[4]────┬────[5]────┬────[6]────┐         │
│  │     D     │     E     │     F     │         │
│  │   Bajo    │  Crítico  │  Riesgo   │         │
│  └───────────┴───────────┴───────────┘         │
│  ┌────[7]────┐                                  │
│  │     G     │   ← G "Sin clasificar"           │
│  │Sin clasif.│                                  │
│  └───────────┘                                  │
│                                                  │
├─ Secundarios ───────────────────────────────────┤
│  ┌───[S]────┬───[B]────┬───[N]────┐            │
│  │  Saltar  │  Volver  │   Nota   │            │
│  └──────────┴──────────┴──────────┘            │
│                                                  │
└──────────────────────────────────────────────────┘
```

Cada **DecisionButton**:
- GradeBadge variant=dot tamaño lg (color del grado)
- Letra Mono grande (32px)
- Label corto
- kbd shortcut esquina superior derecha

**Suggested** (★):
- bg = `--grade-soft-X` (color del grado en 12% opacity)
- border 1.5px = color grade
- icono ★ en esquina superior izquierda
- glow sutil
- **focus inicial** (autoFocus al montar)

---

## 3. Estados

| Estado | Visual |
|---|---|
| Idle | Botones colored según grade |
| Hovered/Focused | translateY(-2px) + box-shadow elevado |
| Suggested | bg colored + ★ + glow + autoFocus |
| Pressed | brief flash + scale 0.97 |
| Submitting | Botón clickeado muestra spinner inline + todos los demás disabled |
| Success | Anim check-icon 200ms → siguiente cliente entra slide-in |
| Error | Toast rojo + botones vuelven a estado idle |

---

## 4. Atajos teclado

| Tecla | Acción |
|---|---|
| `1` | Asignar A |
| `2` | Asignar B |
| `3` | Asignar C |
| `4` | Asignar D |
| `5` | Asignar E |
| `6` | Asignar F |
| `7` | Asignar G |
| `S` | Saltar |
| `B` | Volver (si hasPrevious) |
| `N` | Agregar nota |
| `Enter` | Confirmar suggested |
| `←` `→` | Equivalentes a Volver/Saltar |

⚠ No interceptar si focus está en input/textarea.

---

## 5. Implementación TSX

```tsx
'use client';

import { type FC, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { GradeBadge } from '@/app/clientes/_components/GradeBadge';
import { gradeConfig, GRADE_ORDER, type Grade } from '@/lib/perfilado/gradeConfig';
import { SkipForwardIcon, SkipBackIcon, NotebookIcon, LoaderIcon, CheckIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

type DecisionButtonProps = {
  grade: Grade;
  shortcut: string;
  isSuggested: boolean;
  isLastPressed: boolean;
  submitting: boolean;
  onClick: () => void;
  autoFocus?: boolean;
};

const DecisionButton: FC<DecisionButtonProps> = ({
  grade, shortcut, isSuggested, isLastPressed, submitting, onClick, autoFocus
}) => {
  const config = gradeConfig[grade];
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (autoFocus && ref.current) ref.current.focus();
  }, [autoFocus]);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      disabled={submitting && !isLastPressed}
      className={cn(
        'decision-btn',
        isSuggested && 'decision-btn--suggested',
        isLastPressed && 'decision-btn--pressed'
      )}
      data-grade={grade}
      aria-label={`Asignar perfil ${grade}, ${config.label}, atajo ${shortcut}`}
    >
      {isSuggested && <span className="decision-btn__star" aria-hidden="true">★</span>}
      <GradeBadge grade={grade} variant="dot" size="lg" />
      <span className="decision-btn__letter">{grade}</span>
      <span className="decision-btn__label">{config.label}</span>
      <kbd className="decision-btn__kbd">{shortcut}</kbd>
      {isLastPressed && submitting && (
        <LoaderIcon size={16} className="decision-btn__loader" aria-hidden="true" />
      )}
      {isLastPressed && !submitting && (
        <CheckIcon size={16} className="decision-btn__check" aria-hidden="true" />
      )}
    </button>
  );
};

export const DecisionGrid: FC<DecisionGridProps> = ({
  suggested, onAssign, onSkip, onBack, onAddNote, submitting, hasPrevious, className
}) => {
  const [lastPressed, setLastPressed] = useState<Grade | null>(null);

  const handleAssign = useCallback(async (grade: Grade) => {
    if (submitting) return;
    setLastPressed(grade);
    try {
      await onAssign(grade);
    } catch {
      setLastPressed(null);
    }
  }, [submitting, onAssign]);

  // Keyboard shortcuts global
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches('input, textarea, [contenteditable]')) return;
      if (submitting) return;

      const key = e.key.toUpperCase();

      // 1-7 → A-G
      const gradeIdx = ['1','2','3','4','5','6','7'].indexOf(e.key);
      if (gradeIdx >= 0) {
        e.preventDefault();
        handleAssign(GRADE_ORDER[gradeIdx]);
        return;
      }
      if (key === 'S' || e.key === 'ArrowRight') { e.preventDefault(); onSkip(); return; }
      if (key === 'B' || e.key === 'ArrowLeft')  {
        if (hasPrevious && onBack) { e.preventDefault(); onBack(); }
        return;
      }
      if (key === 'N')        { e.preventDefault(); onAddNote(); return; }
      if (e.key === 'Enter' && suggested && !lastPressed) {
        e.preventDefault();
        handleAssign(suggested);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [submitting, suggested, lastPressed, hasPresent, hasPrevious, onSkip, onBack, onAddNote, handleAssign]);

  return (
    <section
      className={cn('decision-grid', className)}
      role="group"
      aria-label="Asignar perfil del cliente"
    >
      <div className="decision-grid__main" role="radiogroup" aria-label="Perfiles A-G">
        {GRADE_ORDER.map((g, i) => (
          <DecisionButton
            key={g}
            grade={g}
            shortcut={String(i + 1)}
            isSuggested={suggested === g}
            isLastPressed={lastPressed === g}
            submitting={!!submitting}
            onClick={() => handleAssign(g)}
            autoFocus={suggested === g && !lastPressed}
          />
        ))}
      </div>

      <div className="decision-grid__secondary" role="group" aria-label="Acciones secundarias">
        <button
          type="button"
          onClick={onSkip}
          disabled={submitting}
          className="decision-secondary"
          aria-label="Saltar este cliente, atajo S o flecha derecha"
        >
          <SkipForwardIcon size={14} aria-hidden="true" />
          <span>Saltar</span>
          <kbd>S</kbd>
        </button>
        <button
          type="button"
          onClick={onBack}
          disabled={!hasPrevious || submitting}
          className="decision-secondary"
          aria-label="Volver al cliente anterior, atajo B o flecha izquierda"
        >
          <SkipBackIcon size={14} aria-hidden="true" />
          <span>Volver</span>
          <kbd>B</kbd>
        </button>
        <button
          type="button"
          onClick={onAddNote}
          disabled={submitting}
          className="decision-secondary"
          aria-label="Agregar nota sin reclasificar, atajo N"
        >
          <NotebookIcon size={14} aria-hidden="true" />
          <span>Nota</span>
          <kbd>N</kbd>
        </button>
      </div>
    </section>
  );
};
```

> Nota: corregir el `hasPresent` → `hasPrevious` antes de PR (typo intencional para que gestoriard valide leyendo el spec).

---

## 6. CSS scoped (extracto)

```css
.decision-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.decision-grid__main {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
}
.decision-grid__secondary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--border-subtle);
}

.decision-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-3);
  background: var(--bg-2);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  min-height: 110px;
  min-width: var(--touch-target-min);
  cursor: pointer;
  transition: all var(--motion-duration-fast);
  font-family: var(--font-sans);
}
.decision-btn:hover:not(:disabled),
.decision-btn:focus-visible:not(:disabled) {
  transform: translateY(-2px);
  background: var(--bg-hover);
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
}
.decision-btn:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}
.decision-btn:active:not(:disabled) {
  transform: scale(0.97);
}
.decision-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.decision-btn--suggested[data-grade] {
  border-width: 1.5px;
  box-shadow: 0 0 0 2px rgba(255,255,255,0.05) inset;
}
.decision-btn--suggested[data-grade="A"] { background: var(--grade-soft-a); border-color: var(--grade-a); }
.decision-btn--suggested[data-grade="B"] { background: var(--grade-soft-b); border-color: var(--grade-b); }
.decision-btn--suggested[data-grade="C"] { background: var(--grade-soft-c); border-color: var(--grade-c); }
.decision-btn--suggested[data-grade="D"] { background: var(--grade-soft-d); border-color: var(--grade-d); }
.decision-btn--suggested[data-grade="E"] { background: var(--grade-soft-e); border-color: var(--grade-e); }
.decision-btn--suggested[data-grade="F"] { background: var(--grade-soft-f); border-color: var(--grade-f); }
.decision-btn--suggested[data-grade="G"] { background: var(--bg-hover);     border-color: var(--grade-c-def); }

.decision-btn__star {
  position: absolute;
  top: 6px; left: 8px;
  color: var(--grade-d);
  font-size: 12px;
}
.decision-btn__letter {
  font-family: var(--font-mono);
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}
.decision-btn__label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}
.decision-btn__kbd {
  position: absolute;
  top: 6px; right: 6px;
  padding: 2px 6px;
  background: var(--bg-3);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
  letter-spacing: 0;
}
.decision-btn__loader {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  color: var(--text-primary);
  animation: spin 1s linear infinite;
}
.decision-btn__check {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  color: var(--grade-a);
  animation: check-pop 200ms ease-out;
}

.decision-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3);
  background: var(--bg-2);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-family: var(--font-sans);
  font-size: 13px;
  cursor: pointer;
  min-height: var(--touch-target-min);
  transition: all var(--motion-duration-fast);
}
.decision-secondary:hover:not(:disabled) { background: var(--bg-hover); color: var(--text-primary); }
.decision-secondary:focus-visible { outline: 2px solid var(--border-focus); outline-offset: 2px; }
.decision-secondary:disabled { opacity: 0.4; cursor: not-allowed; }
.decision-secondary kbd {
  padding: 1px 5px;
  background: var(--bg-3);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 10px;
}

/* Mobile */
@media (max-width: 767px) {
  .decision-grid__main      { grid-template-columns: repeat(2, 1fr); }   /* 4 filas en lugar de 3 */
  .decision-grid__secondary { grid-template-columns: repeat(3, 1fr); }
  .decision-btn             { min-height: 90px; padding: var(--space-3) var(--space-2); }
  .decision-btn__letter     { font-size: 24px; }
  .decision-btn__kbd        { display: none; }                            /* mobile no usa atajos teclado */
}

@keyframes spin { to { transform: translate(-50%, -50%) rotate(360deg); } }
@keyframes check-pop {
  0%   { transform: translate(-50%, -50%) scale(0); }
  60%  { transform: translate(-50%, -50%) scale(1.2); }
  100% { transform: translate(-50%, -50%) scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .decision-btn,
  .decision-secondary { transition: none; }
  .decision-btn:hover { transform: none; }
  .decision-btn__loader,
  .decision-btn__check { animation: none; }
}

@media (hover: none) {
  .decision-btn:hover { transform: none; box-shadow: none; }
}
```

---

## 7. A11y

- `role="group" aria-label` en wrapper
- `role="radiogroup"` en grupo A-G + cada botón con `aria-label` explícito (grade + label + shortcut)
- kbd labels visibles + `aria-label` describe atajo
- `disabled` cuando submitting (excepto el actual presionado para mostrar feedback)
- Suggested recibe `autoFocus` al montar (revisión guiada arranca con focus en sugerencia)
- Reduced motion: sin transforms, sin animaciones

---

## 8. Performance

- `useCallback` para handler assign
- Keyboard handler **cleanup en unmount** crítico
- `submitting` previene doble-tap accidental
- No re-fetch — todo via props

---

## 9. Tests

```ts
describe('DecisionGrid', () => {
  it('renderiza 7 botones A-G + 3 secundarios', () => { /* */ });
  it('suggested=B autoFocus en B + ★ visible', () => { /* */ });
  it('keyboard "1" asigna A, "7" asigna G', () => { /* */ });
  it('keyboard "S" llama onSkip', () => { /* */ });
  it('keyboard "B" llama onBack si hasPrevious=true', () => { /* */ });
  it('keyboard "B" sin hasPrevious NO llama', () => { /* */ });
  it('ArrowRight === S, ArrowLeft === B', () => { /* */ });
  it('Enter confirma suggested', () => { /* */ });
  it('keyboard ignorado si focus en input', () => { /* */ });
  it('submitting=true disabled todos los demás botones', () => { /* */ });
  it('cleanup keyboard listener on unmount', () => { /* */ });
  it('mobile 375: 2 cols grid + kbd labels ocultos', () => { /* */ });
});
```

═══ FIRMA ═══ FacturaIA / 2026-05-14 / spec DecisionGrid.tsx W5
