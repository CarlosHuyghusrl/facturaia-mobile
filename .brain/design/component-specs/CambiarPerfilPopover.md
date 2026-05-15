# Component Spec — CambiarPerfilPopover

**Skills aplicados**: `design-to-code` + `composition-patterns` + `react-best-practices` + `design-accessibility`
**Path destino**: `app/clientes/_components/CambiarPerfilPopover.tsx`
**LOC estimado**: 220
**Tipo**: Client Component (state + portal + keyboard listeners)
**Trigger**: click GradeBadge en ClienteHeader, ficha cliente, listado tabla

---

## 1. API (props)

```tsx
type CambiarPerfilPopoverProps = {
  /** Trigger element ref (badge anclado) */
  anchorRef: RefObject<HTMLElement>;

  /** Si el popover está abierto */
  open: boolean;

  /** Callback al cerrar */
  onClose: () => void;

  /** Cliente actual */
  cliente: {
    id: string;
    razon_social: string;
    rnc: string;
    current_grade: Grade;
    sector: string;
    regimen: string;
  };

  /** Callback al confirmar cambio */
  onConfirm: (params: {
    new_grade: Grade;
    motivo?: string;
    notificar_cliente: boolean;
  }) => Promise<void>;

  /** Permisos del usuario */
  user_role: 'admin' | 'contador' | 'viewer';
};
```

---

## 2. Composition pattern — Headless via Radix UI

Usar **@radix-ui/react-popover** como base headless. Estilizamos con CSS scoped.

```tsx
import * as Popover from '@radix-ui/react-popover';
```

**Por qué Radix**: focus trap + escape close + click outside + anchor positioning + portal automáticos. Accessibility correcta out-of-the-box.

---

## 3. Visual layout (480px desktop / bottom-sheet mobile)

```
╭───────────────────────────────────────────────╮  ← popover content
│ Cambiar perfil de Huyghu SRL              [✕]│
│ RNC 130309094 · Sector Servicios              │
├───────────────────────────────────────────────┤
│ Seleccionar nuevo perfil:                     │
│                                                │
│ ⓐ  Perfil A · Excelente              [1]     │  ← option clickable + shortcut
│ ⓑ  Perfil B · Bueno                   [2]    │
│ ◉  Perfil C · Regular (ACTUAL)        [3]    │  ← actual: opacity 0.5
│ ⓓ  Perfil D · Bajo                    [4]    │
│ ⓔ  Perfil E · Crítico                 [5]    │
│ ⓕ  Perfil F · Riesgo Total ⚠         [6]    │  ← warning icon si destructive
│                                                │
├─ Preview impacto ─────────────────────────────┤
│ PIPELINES                                      │
│   ✗ Régimen Simplificado                       │
│   ✓ Régimen Ordinario                          │
│                                                │
│ OBLIGACIONES NUEVAS                            │
│   + IT-1 mensual                               │
│   + IR-2 anual                                 │
│   + ACT trimestral                             │
│                                                │
│ PRECIO MENSUAL                                 │
│   RD$ 4,500 → RD$ 7,500   (▲ +66%)            │
├───────────────────────────────────────────────┤
│ Motivo (opcional):                             │
│ ┌─────────────────────────────────────────┐  │
│ │                                          │  │
│ └─────────────────────────────────────────┘  │
│                                                │
│ ☐ Notificar al cliente por email              │
├───────────────────────────────────────────────┤
│              [Cancelar]   [Confirmar Perfil B]│
╰───────────────────────────────────────────────╯
       ↑ overlay backdrop-blur(4px) detrás
```

---

## 4. Estados de la opción

| Estado | Visual |
|---|---|
| **Default** | dot + letra + texto + shortcut |
| **Hovered** | bg `rgba(grade, 0.08)` |
| **Selected (preview)** | bg `rgba(grade, 0.12)` + border 1.5px grade |
| **Current (no change)** | opacity 0.5 + tooltip "Perfil actual" + disabled |
| **Destructive (E, F)** | icono ⚠ + texto rojo + requiere confirm step 2 |
| **Permission denied (F sin admin)** | icono 🔒 + texto gris + disabled + tooltip "Solo admin" |

---

## 5. Atajos teclado

| Tecla | Acción |
|---|---|
| `1` | Seleccionar A (preview) |
| `2` | Seleccionar B (preview) |
| `3` | Seleccionar C (preview, disabled si actual) |
| `4` | Seleccionar D (preview) |
| `5` | Seleccionar E (preview + confirm step) |
| `6` | Seleccionar F (preview + confirm step + role check) |
| `Enter` | Confirmar selección actual |
| `Escape` | Cerrar popover (sin guardar) |
| `Tab` | Navegar por elementos (focus trap) |

```tsx
useEffect(() => {
  if (!open) return;
  const handler = (e: KeyboardEvent) => {
    if (e.target instanceof HTMLTextAreaElement) return;   // no interceptar en textarea

    const grade = (['1','2','3','4','5','6'] as const).indexOf(e.key as any);
    if (grade >= 0) {
      e.preventDefault();
      const targetGrade = (['A','B','C','D','E','F'] as Grade[])[grade];
      if (targetGrade !== cliente.current_grade) setSelected(targetGrade);
    }
    if (e.key === 'Enter' && selected) {
      e.preventDefault();
      handleConfirm();
    }
  };
  document.addEventListener('keydown', handler);
  return () => document.removeEventListener('keydown', handler);
}, [open, selected, cliente.current_grade]);
```

---

## 6. Preview diff — fetch on hover/select

```tsx
const { data: diff, isLoading } = useSWR(
  selected && selected !== cliente.current_grade
    ? `/api/v2/clientes/${cliente.id}/preview-diff?target=${selected}`
    : null,
  fetcher,
  { dedupingInterval: 10000 }
);
```

**Pre-carga**: al abrir popover, pre-fetch los 6 previews en batch (1 request con `targets=A,B,D,E,F`). Si latencia BD > 200ms, mostrar skeleton.

```tsx
useEffect(() => {
  if (open && !preloaded.current) {
    fetch(`/api/v2/clientes/${cliente.id}/preview-diff/batch`)
      .then(r => r.json())
      .then(setPreviews);
    preloaded.current = true;
  }
}, [open, cliente.id]);
```

---

## 7. Confirm step 2 — destructive (E, F)

Si user selecciona E o F y current es A/B/C/D → al hacer click "Confirmar" abrir modal de confirmación step 2:

```tsx
if (isDestructive(cliente.current_grade, selected)) {
  setConfirmStep('destructive');
  return; // no llamar onConfirm aún
}
```

**ConfirmDialog** muestra:
- Heading: "⚠ Confirmación requerida"
- Texto descriptivo de qué se suspende
- Razón obligatoria (textarea, min 10 chars)
- Checkbox notificar cliente
- Botón "Sí, degradar" disabled hasta razón válida

Solo después de step 2 → llamar onConfirm prop.

---

## 8. Responsive

| Breakpoint | Variante popover |
|---|---|
| Desktop ≥ 1024 | `Popover.Content` anclado (480px width) |
| Tablet 768-1024 | Mismo anclado (420px width) |
| Mobile < 768 | `<Sheet>` bottom-sheet fullscreen (90vh max) |

Usar **vaul** library para bottom-sheet mobile (swipe-down close + drag handle).

```tsx
const isMobile = useMediaQuery('(max-width: 767px)');

return isMobile ? (
  <BottomSheet open={open} onOpenChange={onClose}>
    {/* mismo contenido */}
  </BottomSheet>
) : (
  <Popover.Root open={open} onOpenChange={onClose}>
    <Popover.Anchor virtualRef={anchorRef} />
    <Popover.Portal>
      <Popover.Content sideOffset={8} align="end" collisionPadding={16}>
        {/* mismo contenido */}
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>
);
```

---

## 9. Estados (de ux-states-catalog.md)

| Estado | Implementación |
|---|---|
| Initial load preview | Skeleton de los 3 bloques (PIPELINES/OBLIG/PRECIO) |
| Loading on confirm | Botón "Confirmar" → spinner inline + disabled |
| Optimistic update | Cerrar popover inmediato + toast "Cambiando..." + badge cambia |
| Success | Toast "✓ Perfil cambiado a B · [Deshacer 5s]" |
| Error red/server | Popover queda abierto + alert top con [Reintentar] |
| Error LLM (preview) | Preview muestra "No pudimos calcular impacto · Continuar de todos modos" |
| Permission denied F | Botón option F disabled + icono 🔒 + tooltip "Solo admin" |
| Destructive confirm | Modal step 2 obligatorio |
| Undo window | Toast con timer 5s, click [Deshacer] revierte |

---

## 10. Accessibility

```tsx
<Popover.Content
  role="dialog"
  aria-labelledby="popover-title"
  aria-describedby="popover-description"
  // Radix handles focus trap + escape + click outside
>
  <h2 id="popover-title">Cambiar perfil de {cliente.razon_social}</h2>
  <p id="popover-description" className="sr-only">
    Selecciona el nuevo perfil. Las consecuencias se muestran abajo.
  </p>

  <fieldset>
    <legend className="sr-only">Opciones de perfil</legend>
    {options.map((opt) => (
      <button
        key={opt.grade}
        role="radio"
        aria-checked={selected === opt.grade}
        aria-disabled={opt.disabled}
        aria-describedby={`opt-${opt.grade}-desc`}
        onClick={() => handleSelect(opt.grade)}
        className={cn(...)}
      >
        <GradeBadge grade={opt.grade} variant="dot" size="md" />
        <span className="option-label">{opt.label}</span>
        <span id={`opt-${opt.grade}-desc`} className="sr-only">{opt.desc}</span>
        <kbd>{opt.shortcut}</kbd>
      </button>
    ))}
  </fieldset>

  {diff && (
    <section aria-labelledby="preview-title">
      <h3 id="preview-title">Vista previa del impacto</h3>
      {/* PIPELINES / OBLIGACIONES / PRECIO */}
    </section>
  )}

  <textarea aria-label="Motivo del cambio" maxLength={500} />

  <label>
    <input type="checkbox" checked={notificar} onChange={...} />
    Notificar al cliente por email
  </label>

  <div role="group" aria-label="Acciones">
    <button onClick={onClose}>Cancelar</button>
    <button onClick={handleConfirm} disabled={!canConfirm}>
      Confirmar Perfil {selected}
    </button>
  </div>
</Popover.Content>
```

---

## 11. Performance

| Practice | Aplicado |
|---|---|
| `'use client'` | ✅ necesario (state + keyboard listener) |
| Lazy load Radix Popover | ✅ `next/dynamic` con ssr:false |
| Preview prefetch batch | ✅ 1 request en vez de 6 |
| SWR dedupe | ✅ no re-fetch si cambias opción rápido |
| Cleanup keyboard listener | ✅ return useEffect cleanup |
| Memoize options array | ✅ `useMemo` para evitar recreación |
| Toast queue | ✅ usar sonner u otro toast lib singleton |

---

## 12. Implementación TSX skeleton (truncado)

```tsx
'use client';

import * as Popover from '@radix-ui/react-popover';
import { useState, useEffect, useRef, useMemo, type RefObject } from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';
import { GradeBadge } from './GradeBadge';
import { DiffPreview } from './DiffPreview';
import { ConfirmDialogDestructive } from './ConfirmDialogDestructive';
import { gradeConfig, type Grade } from '@/lib/perfilado/gradeConfig';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { isDestructive, canAssignGrade } from '@/lib/perfilado/permissions';

export type CambiarPerfilPopoverProps = { /* ver §1 */ };

export function CambiarPerfilPopover({
  anchorRef, open, onClose, cliente, onConfirm, user_role
}: CambiarPerfilPopoverProps) {
  const [selected, setSelected] = useState<Grade | null>(null);
  const [motivo, setMotivo] = useState('');
  const [notificar, setNotificar] = useState(false);
  const [confirmStep, setConfirmStep] = useState<'idle' | 'destructive'>('idle');
  const [submitting, setSubmitting] = useState(false);

  const isMobile = useMediaQuery('(max-width: 767px)');

  const options = useMemo(() => (
    (['A','B','C','D','E','F'] as Grade[]).map((g, idx) => ({
      grade: g,
      label: gradeConfig[g].label,
      desc: gradeConfig[g].desc,
      shortcut: String(idx + 1),
      isCurrent: g === cliente.current_grade,
      isDisabled: !canAssignGrade(g, user_role),
    }))
  ), [cliente.current_grade, user_role]);

  // Preview diff batch on open
  const { data: previews } = useSWR(
    open ? `/api/v2/clientes/${cliente.id}/preview-diff/batch` : null,
    fetcher
  );

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { /* ver §5 */ };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, selected, cliente.current_grade]);

  // Reset state on close
  useEffect(() => {
    if (!open) {
      setSelected(null);
      setMotivo('');
      setNotificar(false);
      setConfirmStep('idle');
    }
  }, [open]);

  const handleSelect = (grade: Grade) => {
    if (grade === cliente.current_grade) return;
    if (!canAssignGrade(grade, user_role)) return;
    setSelected(grade);
  };

  const handleConfirm = async () => {
    if (!selected) return;

    if (isDestructive(cliente.current_grade, selected) && confirmStep === 'idle') {
      setConfirmStep('destructive');
      return;
    }

    setSubmitting(true);
    try {
      await onConfirm({
        new_grade: selected,
        motivo: motivo.trim() || undefined,
        notificar_cliente: notificar
      });
      onClose();
      toast.success(`Perfil cambiado a ${selected}`, {
        action: { label: 'Deshacer', onClick: () => handleUndo(cliente.id) },
        duration: 5000,
      });
    } catch (err) {
      toast.error('No pudimos cambiar el perfil. Reintenta.');
    } finally {
      setSubmitting(false);
    }
  };

  const canConfirm = selected !== null && !submitting &&
    (!isDestructive(cliente.current_grade, selected) || motivo.length >= 10);

  const content = (
    <>
      {/* heading + opciones + diff + motivo + checkbox + actions */}
    </>
  );

  if (isMobile) {
    return (
      <BottomSheet open={open} onOpenChange={onClose}>
        {content}
      </BottomSheet>
    );
  }

  return (
    <>
      <Popover.Root open={open} onOpenChange={(v) => !v && onClose()}>
        <Popover.Anchor virtualRef={anchorRef as any} />
        <Popover.Portal>
          <Popover.Content
            className="popover-content"
            sideOffset={8}
            align="end"
            collisionPadding={16}
            onEscapeKeyDown={onClose}
            onInteractOutside={onClose}
          >
            {content}
            <Popover.Arrow className="popover-arrow" />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {confirmStep === 'destructive' && (
        <ConfirmDialogDestructive
          from={cliente.current_grade}
          to={selected!}
          motivo={motivo}
          setMotivo={setMotivo}
          notificar={notificar}
          setNotificar={setNotificar}
          onCancel={() => setConfirmStep('idle')}
          onConfirm={handleConfirm}
          submitting={submitting}
        />
      )}
    </>
  );
}
```

---

## 13. CSS scoped (extracto)

```css
.popover-content {
  width: var(--popover-width);
  max-height: var(--popover-max-height);
  background: var(--bg-2);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-popover);
  padding: var(--space-5);
  overflow-y: auto;
  z-index: var(--z-popover);

  animation: popover-in var(--motion-duration-medium) var(--motion-ease-out);
}

@keyframes popover-in {
  from { opacity: 0; transform: translateY(-4px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.popover-overlay {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(var(--blur-popover-overlay));
}

@media (prefers-reduced-motion: reduce) {
  .popover-content { animation: none; }
  .popover-overlay { backdrop-filter: none; background: rgba(0,0,0,0.6); }
}

@media (max-width: 767px) {
  .popover-content { display: none; }  /* mobile usa BottomSheet */
}

.option {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background var(--motion-duration-fast);
}
.option[aria-checked="true"] {
  background: var(--grade-soft-c);   /* ej: para C selected */
  border: 1.5px solid var(--grade-c);
}
.option[aria-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
}
.option:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}
```

---

## 14. Tests requeridos (gestoriard wave 4)

```typescript
describe('CambiarPerfilPopover', () => {
  it('abre y cierra correctamente', () => { /* */ });
  it('keyboard 1-6 selecciona grado', () => { /* */ });
  it('Escape cierra sin guardar', () => { /* */ });
  it('opción del grado actual está disabled', () => { /* */ });
  it('opción F está disabled si user_role=contador', () => { /* */ });
  it('selecciona E o F requiere confirm step 2', () => { /* */ });
  it('confirm step 2 requiere motivo ≥ 10 chars', () => { /* */ });
  it('Tab navega entre opciones (focus trap)', () => { /* */ });
  it('preview diff carga al abrir', () => { /* */ });
  it('error red muestra alert + reintentar', () => { /* */ });
  it('success toast con undo 5s', () => { /* */ });
  it('mobile renderiza BottomSheet en vez de Popover', () => { /* */ });
  it('aria-label correcto en cada opción', () => { /* */ });
  it('cleanup keyboard listener on unmount', () => { /* */ });
});
```

═══ FIRMA ═══ FacturaIA / 2026-05-14 / spec CambiarPerfilPopover.tsx
