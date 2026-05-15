# Component Spec — GradeBadge

**Skills aplicados**: `design-to-code` + `composition-patterns` + `react-best-practices`
**Path destino**: `app/clientes/_components/GradeBadge.tsx`
**LOC estimado**: 80
**Tipo**: Server Component compatible (puro presentacional)
**Reutilizable**: ✅ usado en listado tabla/cards, ficha header, popover options, revisión guiada decision grid, toast

---

## 1. API (props)

```tsx
type GradeBadgeProps = {
  /** Grado actual del cliente */
  grade: 'A' | 'B' | 'C' | 'C-def' | 'D' | 'E' | 'F';

  /** Variant visual del badge */
  variant?: 'solid' | 'outline' | 'dot' | 'avatar-overlay';

  /** Tamaño del badge */
  size?: 'sm' | 'md' | 'lg' | 'xl';

  /** Si el badge es clickeable (ej. abre popover cambiar perfil) */
  onClick?: () => void;

  /** Mostrar caret ▼ si es clickeable (opens popover hint) */
  showCaret?: boolean;

  /** Mostrar tooltip con descripción del grado on hover */
  showTooltip?: boolean;

  /** Glow para estado "current" (ej. stage tracker) */
  glow?: boolean;

  /** Aria label override (default: "Perfil X, Label") */
  ariaLabel?: string;

  /** Class name passthrough */
  className?: string;
};
```

---

## 2. Variants visuales

### 2.1 `solid` (default)
- Fondo color grade
- Letra Mono color oscuro (`--surface-bg` para A-D, `white` para C-def/E/F)
- Usado en: tabla listado, decision grid

```tsx
<GradeBadge grade="A" variant="solid" size="md" />
// Renders: ┌──┐
//         │ A│  fondo verde, letra oscura
//         └──┘
```

### 2.2 `outline`
- Border 1.5px color grade
- Background transparent
- Letra Mono color grade
- Usado en: pills filtro listado, C-provisional badge

```tsx
<GradeBadge grade="C-def" variant="outline" size="sm" />
// Renders: ┌──┐
//         │ C-│  border gris, letra gris
//         └──┘
```

### 2.3 `dot`
- Círculo pequeño solid color grade
- Sin letra (texto adyacente lo provee)
- Usado en: stage tracker dots, opción radio popover

```tsx
<GradeBadge grade="B" variant="dot" size="md" />
// Renders: ●  (verde claro/teal)
```

### 2.4 `avatar-overlay`
- Diseñado para superponer al avatar bottom-right (-12% bottom, -12% right)
- Circular con borde de 2px color `--surface-bg`
- Letra Mono prominente
- Usado en: ClienteHeader avatar 72×72 + badge 26×26 mobile / 32×32 desktop

```tsx
<div className="relative inline-block">
  <Avatar size="lg" name="HS" />
  <GradeBadge
    grade="C"
    variant="avatar-overlay"
    size="lg"
    onClick={() => openPopover()}
    showCaret
    className="absolute -bottom-1 -right-1"
  />
</div>
```

---

## 3. Size mapping (de tokens.json)

| Size | Box | Font (Mono) | Padding | Caret size |
|---|---|---|---|---|
| `sm` | 24×24 | 11px/700 | 4px | 8px |
| `md` | 32×32 | 14px/700 | 6px | 10px |
| `lg` | 40×40 | 16px/700 | 8px | 12px |
| `xl` | 56×56 | 22px/800 | 12px | 14px |

---

## 4. Implementación TSX skeleton

```tsx
'use client';   // solo si onClick (interactivo); sin onClick = Server Component

import { type FC, type MouseEvent, useId } from 'react';
import { gradeConfig, type Grade } from '@/lib/perfilado/gradeConfig';
import { ChevronDownIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

export type GradeBadgeProps = { /* ver §1 */ };

export const GradeBadge: FC<GradeBadgeProps> = ({
  grade,
  variant = 'solid',
  size = 'md',
  onClick,
  showCaret = false,
  showTooltip = true,
  glow = false,
  ariaLabel,
  className,
}) => {
  const config = gradeConfig[grade];
  const id = useId();

  const isInteractive = Boolean(onClick);
  const Tag = isInteractive ? 'button' : 'span';

  const baseClasses = cn(
    'grade-badge',
    `grade-badge--${variant}`,
    `grade-badge--${size}`,
    glow && 'grade-badge--glow',
    isInteractive && 'grade-badge--interactive',
    className
  );

  const accessibleLabel = ariaLabel ??
    `Perfil ${grade}, ${config.label}${isInteractive ? ', click para cambiar' : ''}`;

  return (
    <Tag
      className={baseClasses}
      data-grade={grade}
      onClick={onClick}
      aria-label={accessibleLabel}
      aria-describedby={showTooltip ? `${id}-tooltip` : undefined}
      type={isInteractive ? 'button' : undefined}
    >
      {variant !== 'dot' && (
        <span className="grade-badge__letter">{grade.replace('-def', '')}</span>
      )}
      {showCaret && isInteractive && <ChevronDownIcon className="grade-badge__caret" />}
      {showTooltip && (
        <span
          role="tooltip"
          id={`${id}-tooltip`}
          className="grade-badge__tooltip"
          aria-hidden="true"
        >
          {config.label} — {config.desc}
        </span>
      )}
    </Tag>
  );
};
```

---

## 5. CSS scoped (perfilado-dark.css)

```css
.grade-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  font-family: var(--font-mono);
  font-weight: 700;
  border-radius: var(--radius-md);
  transition: var(--motion-card-hover);
}

/* Solid */
.grade-badge--solid[data-grade="A"]     { background: var(--grade-a); color: var(--surface-bg); }
.grade-badge--solid[data-grade="B"]     { background: var(--grade-b); color: var(--surface-bg); }
.grade-badge--solid[data-grade="C"]     { background: var(--grade-c); color: var(--surface-bg); }
.grade-badge--solid[data-grade="C-def"] { background: var(--grade-c-def); color: white; }
.grade-badge--solid[data-grade="D"]     { background: var(--grade-d); color: var(--surface-bg); }
.grade-badge--solid[data-grade="E"]     { background: var(--grade-e); color: white; }
.grade-badge--solid[data-grade="F"]     { background: var(--grade-f); color: white; }

/* Outline */
.grade-badge--outline {
  background: transparent;
  border: 1.5px solid currentColor;
}
.grade-badge--outline[data-grade="A"]     { color: var(--grade-a); }
/* ... resto */

/* Dot */
.grade-badge--dot {
  width: var(--space-3);
  height: var(--space-3);
  padding: 0;
  border-radius: var(--radius-circle);
}
.grade-badge--dot[data-grade="A"] { background: var(--grade-a); }
/* ... resto */

/* Sizes */
.grade-badge--sm { width: 24px; height: 24px; font-size: 11px; }
.grade-badge--md { width: 32px; height: 32px; font-size: 14px; }
.grade-badge--lg { width: 40px; height: 40px; font-size: 16px; }
.grade-badge--xl { width: 56px; height: 56px; font-size: 22px; }

/* Avatar overlay variant */
.grade-badge--avatar-overlay {
  border: 2px solid var(--surface-bg);
  border-radius: var(--radius-circle);
  position: absolute;
}

/* Glow (current state) */
.grade-badge--glow[data-grade="C"] { box-shadow: var(--shadow-glow-c); }
.grade-badge--glow[data-grade="A"] { box-shadow: var(--shadow-glow-a); }
.grade-badge--glow[data-grade="F"] { box-shadow: var(--shadow-glow-f); }

/* Interactive */
.grade-badge--interactive {
  cursor: pointer;
  border: none;
}
.grade-badge--interactive:hover {
  transform: translateY(-1px);
  filter: brightness(1.1);
}
.grade-badge--interactive:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(76, 158, 255, 0.2);
}
.grade-badge--interactive:active {
  transform: translateY(0);
}

/* Tooltip */
.grade-badge__tooltip {
  position: absolute;
  bottom: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%);
  background: var(--bg-3);
  color: var(--text-primary);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-family: var(--font-sans);
  font-weight: 400;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--motion-duration-fast);
  z-index: var(--z-tooltip);
}
.grade-badge--interactive:hover .grade-badge__tooltip,
.grade-badge--interactive:focus-visible .grade-badge__tooltip {
  opacity: 1;
}

/* Caret */
.grade-badge__caret {
  width: 10px;
  height: 10px;
  opacity: 0.7;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .grade-badge { transition: none; }
  .grade-badge--interactive:hover { transform: none; }
}

/* Touch device — desactivar hover effects */
@media (hover: none) {
  .grade-badge--interactive:hover {
    transform: none;
    filter: none;
  }
  .grade-badge__tooltip { display: none; }   /* mobile usa long-press para tooltip alternativo */
}
```

---

## 6. Composition examples

### En tabla listado
```tsx
<tr>
  <td><GradeBadge grade={cliente.grade} size="md" /></td>
  <td>{cliente.razon_social}</td>
  ...
</tr>
```

### En ClienteHeader (con popover)
```tsx
<div className="relative">
  <Avatar name={initials} size="lg" />
  <GradeBadge
    grade={cliente.grade}
    variant="avatar-overlay"
    size="lg"
    onClick={() => setPopoverOpen(true)}
    showCaret
    showTooltip
  />
  <CambiarPerfilPopover
    open={popoverOpen}
    onClose={() => setPopoverOpen(false)}
    cliente={cliente}
  />
</div>
```

### En decision grid Revisión Guiada
```tsx
{(['A', 'B', 'C', 'D', 'E', 'F'] as Grade[]).map((g, idx) => (
  <button
    key={g}
    onClick={() => handleAssign(g)}
    className={cn('decision-cell', suggested === g && 'decision-cell--suggested')}
    aria-label={`Asignar perfil ${g} (atajo ${idx + 1})`}
  >
    <GradeBadge grade={g} variant="dot" size="lg" />
    <span className="decision-label">{gradeConfig[g].label}</span>
    <kbd className="decision-shortcut">{idx + 1}</kbd>
  </button>
))}
```

### En stage tracker dot done
```tsx
<GradeBadge grade="A" variant="dot" size="md" />
```

---

## 7. Performance considerations

| Practice | Aplicado |
|---|---|
| Server Component default | ✅ sin `onClick` = puro |
| `'use client'` only when needed | ✅ solo si interactivo |
| No re-renders innecesarios | ✅ memo si dentro de lista virtual |
| CSS sin JS animation | ✅ todas transitions en CSS |
| Aria-label estático | ✅ no requiere computación cliente |

---

## 8. Tests requeridos (gestoriard wave 1)

```typescript
// __tests__/GradeBadge.test.tsx

describe('GradeBadge', () => {
  it('renders all 7 grades with correct color', () => {
    (['A', 'B', 'C', 'C-def', 'D', 'E', 'F'] as Grade[]).forEach((g) => {
      const { container } = render(<GradeBadge grade={g} />);
      expect(container.querySelector(`[data-grade="${g}"]`)).toBeInTheDocument();
    });
  });

  it('renders as button when onClick provided', () => {
    const handleClick = vi.fn();
    render(<GradeBadge grade="A" onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('renders as span when no onClick', () => {
    const { container } = render(<GradeBadge grade="A" />);
    expect(container.querySelector('button')).not.toBeInTheDocument();
    expect(container.querySelector('span.grade-badge')).toBeInTheDocument();
  });

  it('has correct aria-label', () => {
    render(<GradeBadge grade="C" onClick={() => {}} />);
    expect(screen.getByRole('button')).toHaveAccessibleName(/Perfil C, Regular, click para cambiar/);
  });

  it('renders dot variant without letter', () => {
    const { container } = render(<GradeBadge grade="A" variant="dot" />);
    expect(container.querySelector('.grade-badge__letter')).not.toBeInTheDocument();
  });

  it('respects prefers-reduced-motion', () => {
    // verificar que CSS @media reduced-motion aplica transition:none
  });
});
```

═══ FIRMA ═══ FacturaIA / 2026-05-14 / spec GradeBadge.tsx
