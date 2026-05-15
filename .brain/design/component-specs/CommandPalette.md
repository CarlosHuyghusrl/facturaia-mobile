# Component Spec — CommandPalette (⌘K)

**Skills**: `design-to-code` + `composition-patterns` + `react-best-practices` + `design-accessibility`
**Path**: `app/components/global/CommandPalette.tsx`
**LOC**: 200
**Tipo**: Client Component (state + portal + global keyboard + lazy fetch)
**Wave**: W6
**Helpers internos**: `useCommandPalette` hook (~40 LOC, spec separado)
**Lib externa**: `cmdk` v1.x (npm) — Vercel/cmdk, headless con accesibilidad incluida

---

## 1. API

```tsx
type CommandPaletteProps = {
  /** Permisos del usuario para mostrar/ocultar comandos */
  userRole: 'admin' | 'contador' | 'viewer';

  /** Cliente activo (si abierto desde ficha) — pre-rellena scope */
  activeClienteId?: string;

  /** Custom shortcut override (default ⌘K / Ctrl+K) */
  shortcut?: string;
};
```

El componente se monta una vez en `app/layout.tsx` (a nivel global). El estado open/closed se controla con `useCommandPalette()` hook que expone:

```tsx
const { open, openPalette, closePalette, setScope } = useCommandPalette();
```

---

## 2. Estructura del menú

```
╭─ ⌘ Buscar comandos o clientes ─────────────────[Esc]─╮
│ 🔍 [_________________________________________]      │
├──────────────────────────────────────────────────────┤
│  NAVEGACIÓN                                          │
│  ⌂ Dashboard                                  ⌘D    │
│  👥 Clientes                                 ⌘L    │
│  📋 Perfilado A-G                             ⌘P    │
│  🤖 Revisión Guiada (484 pendientes)         ⌘R    │
│  📅 Calendario                                ⌘C    │
│  ⚙ Configuración                                    │
│                                                       │
│  ACCIONES RÁPIDAS                                    │
│  + Nuevo cliente                                     │
│  📝 Nueva nota (cliente actual)                      │
│  🏷 Cambiar perfil (cliente actual)                  │
│  ✉ Enviar email (cliente actual)                    │
│                                                       │
│  CLIENTES (búsqueda en vivo)                         │
│  • Huyghu SRL · 130309094            Perfil A        │
│  • Bridaspak · 401501234              Perfil B       │
│  • ... (top 5 matches)                                │
│                                                       │
│  AYUDA                                                │
│  ? Atajos de teclado                          ?     │
│  📖 Documentación                                    │
╰──────────────────────────────────────────────────────╯
```

---

## 3. Estados

| Estado | Comportamiento |
|---|---|
| Closed | No renderiza nada (portal vacío) |
| Open initial | Focus en input · sin búsqueda → muestra categorías estáticas |
| Typing | Debounce 200ms · fetch clientes via `/api/v2/clientes/search?q=` |
| Search 0 resultados | "Sin resultados para '<query>'" + tip "Prueba con RNC o nombre" |
| Loading búsqueda | Skeleton 3 filas en sección Clientes |
| Click item | Ejecuta acción + cierra palette |
| Escape | Cierra sin acción |
| Permission denied | Items que el rol no puede ejecutar aparecen disabled con tooltip "Solo admin" |

---

## 4. Atajos teclado

| Tecla | Acción |
|---|---|
| `⌘K` / `Ctrl+K` | Toggle palette |
| `Escape` | Cerrar |
| `↑` `↓` | Navegar items |
| `Enter` | Ejecutar item seleccionado |
| `⌘+N` | Atajo "Nuevo cliente" (con palette cerrada) |
| `?` | Atajo "Atajos de teclado" |

⚠ **Issue Chrome `⌘K`**: el browser captura para focus URL bar. Fix: `preventDefault()` solo si NO estás en input/textarea/contenteditable.

```tsx
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      const target = e.target as HTMLElement;
      const isField = target.matches('input, textarea, [contenteditable]');
      if (!isField) {
        e.preventDefault();
        toggle();
      }
    }
    if (e.key === 'Escape' && open) {
      e.preventDefault();
      close();
    }
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, [open, toggle, close]);
```

---

## 5. Implementación TSX

```tsx
'use client';

import { type FC, useEffect, useState, useCallback, useDeferredValue } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { useCommandPalette } from '@/app/hooks/useCommandPalette';
import { GradeBadge } from '@/app/clientes/_components/GradeBadge';
import { HomeIcon, UsersIcon, BadgeCheckIcon, BotIcon, CalendarIcon, SettingsIcon,
         PlusIcon, EditIcon, MailIcon, HelpCircleIcon, FileTextIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

type CommandItem = {
  id: string;
  label: string;
  shortcut?: string;
  icon?: React.ReactNode;
  onSelect: () => void;
  group: 'nav' | 'action' | 'cliente' | 'help';
  disabled?: boolean;
  disabledReason?: string;
};

type ClienteSearchResult = {
  id: string;
  razon_social: string;
  rnc_cedula: string;
  perfil: Grade;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export const CommandPalette: FC<CommandPaletteProps> = ({
  userRole, activeClienteId, shortcut = 'k'
}) => {
  const { open, close, toggle } = useCommandPalette();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDeferredValue(query);

  // Lazy fetch search clientes
  const { data: searchData, isLoading: searching } = useSWR<{ data: ClienteSearchResult[] }>(
    open && debouncedQuery.length >= 2
      ? `/api/v2/clientes/search?q=${encodeURIComponent(debouncedQuery)}&limit=5`
      : null,
    fetcher,
    { dedupingInterval: 30000 }
  );

  // Global keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isField = (e.target as HTMLElement).matches('input, textarea, [contenteditable]');
      if ((e.metaKey || e.ctrlKey) && e.key === shortcut.toLowerCase() && !isField) {
        e.preventDefault();
        toggle();
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, toggle, close, shortcut]);

  // Reset query on close
  useEffect(() => { if (!open) setQuery(''); }, [open]);

  const navigateTo = useCallback((path: string) => {
    router.push(path);
    close();
  }, [router, close]);

  // Build static items (memoized para no re-crear cada render)
  const staticItems: CommandItem[] = [
    { id: 'nav-dashboard',   group: 'nav',    label: 'Dashboard',                   icon: <HomeIcon size={14} />,        shortcut: '⌘D', onSelect: () => navigateTo('/dashboard') },
    { id: 'nav-clientes',    group: 'nav',    label: 'Clientes',                    icon: <UsersIcon size={14} />,       shortcut: '⌘L', onSelect: () => navigateTo('/clientes') },
    { id: 'nav-perfilado',   group: 'nav',    label: 'Perfilado A-G',               icon: <BadgeCheckIcon size={14} />,  shortcut: '⌘P', onSelect: () => navigateTo('/clientes/perfilado-af') },
    { id: 'nav-revision',    group: 'nav',    label: 'Revisión Guiada (484)',       icon: <BotIcon size={14} />,         shortcut: '⌘R', onSelect: () => navigateTo('/clientes/revision-guiada-perfil-c') },
    { id: 'nav-calendario',  group: 'nav',    label: 'Calendario',                  icon: <CalendarIcon size={14} />,    shortcut: '⌘C', onSelect: () => navigateTo('/agenda/calendario') },
    { id: 'nav-config',      group: 'nav',    label: 'Configuración',               icon: <SettingsIcon size={14} />,                    onSelect: () => navigateTo('/configuracion') },

    { id: 'act-new-cliente', group: 'action', label: 'Nuevo cliente',               icon: <PlusIcon size={14} />,         shortcut: '⌘N', onSelect: () => navigateTo('/clientes/nuevo') },
    ...(activeClienteId ? [
      { id: 'act-add-note',     group: 'action' as const, label: 'Nueva nota (cliente actual)',   icon: <FileTextIcon size={14} />, onSelect: () => { window.dispatchEvent(new CustomEvent('open-note-modal', { detail: { clienteId: activeClienteId } })); close(); } },
      { id: 'act-cambiar-perfil', group: 'action' as const, label: 'Cambiar perfil (cliente actual)', icon: <EditIcon size={14} />, onSelect: () => { window.dispatchEvent(new CustomEvent('open-cambiar-perfil', { detail: { clienteId: activeClienteId } })); close(); }, disabled: userRole === 'viewer', disabledReason: 'Necesitas rol contador o admin' },
      { id: 'act-email',         group: 'action' as const, label: 'Enviar email (cliente actual)', icon: <MailIcon size={14} />, onSelect: () => navigateTo(`/clientes/${activeClienteId}#email`) },
    ] : []),

    { id: 'help-shortcuts',  group: 'help',   label: 'Atajos de teclado',           icon: <HelpCircleIcon size={14} />,   shortcut: '?',  onSelect: () => { window.dispatchEvent(new CustomEvent('open-shortcuts-help')); close(); } },
    { id: 'help-docs',       group: 'help',   label: 'Documentación',               icon: <HelpCircleIcon size={14} />,                  onSelect: () => navigateTo('/biblioteca') },
  ];

  const clientesItems: CommandItem[] = (searchData?.data ?? []).map((c) => ({
    id: `cli-${c.id}`,
    group: 'cliente',
    label: c.razon_social,
    onSelect: () => navigateTo(`/clientes/${c.id}`),
  }));

  if (!open) return null;

  return (
    <Command.Dialog
      open={open}
      onOpenChange={(v) => !v && close()}
      label="Buscar comandos o clientes"
      className="cmd-palette"
    >
      <div className="cmd-palette__backdrop" aria-hidden="true" />
      <div className="cmd-palette__panel" role="dialog" aria-labelledby="cmd-title">
        <div className="cmd-palette__input-row">
          <span className="cmd-palette__kbd" aria-hidden="true">⌘</span>
          <Command.Input
            id="cmd-title"
            value={query}
            onValueChange={setQuery}
            placeholder="Buscar comandos o clientes…"
            className="cmd-palette__input"
            autoFocus
            aria-label="Buscar comandos o clientes"
          />
          <kbd className="cmd-palette__esc">Esc</kbd>
        </div>

        <Command.List className="cmd-palette__list">
          <Command.Empty className="cmd-palette__empty">
            Sin resultados para "<strong>{query}</strong>"
            <p className="cmd-palette__empty-hint">Prueba con nombre de cliente o RNC</p>
          </Command.Empty>

          <Command.Group heading="Navegación" className="cmd-palette__group">
            {staticItems.filter((i) => i.group === 'nav').map((item) => (
              <Command.Item
                key={item.id}
                value={item.label}
                onSelect={item.onSelect}
                disabled={item.disabled}
                className="cmd-palette__item"
                aria-label={`${item.label}${item.shortcut ? ` (${item.shortcut})` : ''}`}
              >
                {item.icon}
                <span className="cmd-palette__item-label">{item.label}</span>
                {item.shortcut && <kbd className="cmd-palette__item-kbd">{item.shortcut}</kbd>}
              </Command.Item>
            ))}
          </Command.Group>

          <Command.Group heading="Acciones rápidas" className="cmd-palette__group">
            {staticItems.filter((i) => i.group === 'action').map((item) => (
              <Command.Item
                key={item.id}
                value={item.label}
                onSelect={item.disabled ? undefined : item.onSelect}
                disabled={item.disabled}
                className="cmd-palette__item"
                title={item.disabledReason}
              >
                {item.icon}
                <span className="cmd-palette__item-label">{item.label}</span>
                {item.disabled && <span className="cmd-palette__item-lock">🔒</span>}
                {item.shortcut && !item.disabled && <kbd className="cmd-palette__item-kbd">{item.shortcut}</kbd>}
              </Command.Item>
            ))}
          </Command.Group>

          {(searching || clientesItems.length > 0) && (
            <Command.Group heading="Clientes" className="cmd-palette__group">
              {searching ? (
                <>
                  <div className="cmd-palette__item cmd-palette__item--skeleton" aria-busy="true" />
                  <div className="cmd-palette__item cmd-palette__item--skeleton" aria-busy="true" />
                  <div className="cmd-palette__item cmd-palette__item--skeleton" aria-busy="true" />
                </>
              ) : (
                (searchData?.data ?? []).map((c) => (
                  <Command.Item
                    key={c.id}
                    value={`${c.razon_social} ${c.rnc_cedula}`}
                    onSelect={() => navigateTo(`/clientes/${c.id}`)}
                    className="cmd-palette__item cmd-palette__item--cliente"
                  >
                    <GradeBadge grade={c.perfil} variant="dot" size="sm" />
                    <span className="cmd-palette__item-label">{c.razon_social}</span>
                    <span className="cmd-palette__item-rnc">{c.rnc_cedula}</span>
                    <span className="cmd-palette__item-grade">Perfil {c.perfil}</span>
                  </Command.Item>
                ))
              )}
            </Command.Group>
          )}

          <Command.Group heading="Ayuda" className="cmd-palette__group">
            {staticItems.filter((i) => i.group === 'help').map((item) => (
              <Command.Item key={item.id} value={item.label} onSelect={item.onSelect} className="cmd-palette__item">
                {item.icon}
                <span className="cmd-palette__item-label">{item.label}</span>
                {item.shortcut && <kbd className="cmd-palette__item-kbd">{item.shortcut}</kbd>}
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </div>
    </Command.Dialog>
  );
};
```

---

## 6. CSS scoped (extracto)

```css
/* cmdk usa data-attributes — adjust selectors */

.cmd-palette { position: fixed; inset: 0; z-index: var(--z-modal); }

.cmd-palette__backdrop {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(6px);
}

.cmd-palette__panel {
  position: relative;
  margin: 12vh auto;
  width: 600px;
  max-width: calc(100vw - 32px);
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-2);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-popover);
  overflow: hidden;
  animation: cmd-in var(--motion-duration-medium) var(--motion-ease-out);
}

@keyframes cmd-in {
  from { opacity: 0; transform: translateY(-8px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.cmd-palette__input-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
}
.cmd-palette__kbd {
  padding: 2px 6px;
  background: var(--bg-3);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-secondary);
}
.cmd-palette__input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 15px;
}
.cmd-palette__input::placeholder { color: var(--text-tertiary); }
.cmd-palette__esc {
  padding: 2px 8px;
  background: var(--bg-3);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-secondary);
}

.cmd-palette__list { overflow-y: auto; padding: var(--space-2); }

.cmd-palette__group {
  margin-bottom: var(--space-3);
}
.cmd-palette__group [cmdk-group-heading] {
  padding: var(--space-2) var(--space-3);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-tertiary);
}

.cmd-palette__item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 14px;
}
.cmd-palette__item[data-selected="true"] {
  background: var(--bg-hover);
}
.cmd-palette__item[data-disabled="true"] {
  opacity: 0.4;
  cursor: not-allowed;
}
.cmd-palette__item-label { flex: 1; }
.cmd-palette__item-kbd {
  padding: 2px 6px;
  background: var(--bg-3);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-secondary);
}

.cmd-palette__item--cliente {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: var(--space-2);
}
.cmd-palette__item-rnc {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-secondary);
}
.cmd-palette__item-grade {
  font-size: 11px;
  color: var(--text-tertiary);
}

.cmd-palette__item--skeleton {
  height: 40px;
  background: linear-gradient(90deg, var(--bg-2) 0%, var(--bg-hover) 50%, var(--bg-2) 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

.cmd-palette__empty {
  padding: var(--space-6);
  text-align: center;
  color: var(--text-secondary);
}
.cmd-palette__empty-hint {
  margin: var(--space-2) 0 0 0;
  font-size: 12px;
  color: var(--text-tertiary);
}

/* Mobile */
@media (max-width: 767px) {
  .cmd-palette__panel {
    margin: 0;
    width: 100vw;
    max-width: 100vw;
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 0;
  }
  .cmd-palette__item-kbd { display: none; }   /* mobile sin atajos */
}

@media (prefers-reduced-motion: reduce) {
  .cmd-palette__panel { animation: none; }
  .cmd-palette__backdrop { backdrop-filter: none; background: rgba(0,0,0,0.7); }
  .cmd-palette__item--skeleton { animation: none; opacity: 0.5; }
}
```

---

## 7. A11y

- `Command.Dialog` de cmdk usa `role="dialog" aria-modal="true"` + focus trap nativo
- `Command.Input` con `aria-label`
- `Command.Item` con `role="option"` automático
- Item disabled con `aria-disabled` + tooltip razón
- Loading skeletons con `aria-busy="true"`
- Cleanup keyboard listener on unmount

---

## 8. Performance

- `useSWR` con dedupingInterval 30s (no re-fetch al re-abrir misma búsqueda)
- `useDeferredValue` para query → no fetch en cada keystroke
- cmdk lib es ligera (~5KB gzip)
- Search items lazy: solo carga si query ≥ 2 chars
- Static items son const (no recreación)

---

## 9. Custom events para coordinar acciones

El palette dispara `CustomEvent` cuando se selecciona una acción que requiere contexto local (ej. "Cambiar perfil cliente actual"). Otros componentes escuchan:

```tsx
// En ClientePage o donde aplique:
useEffect(() => {
  const handler = (e: CustomEvent) => {
    if (e.detail?.clienteId === clienteActual.id) {
      setCambiarPerfilOpen(true);
    }
  };
  window.addEventListener('open-cambiar-perfil' as any, handler);
  return () => window.removeEventListener('open-cambiar-perfil' as any, handler);
}, [clienteActual.id]);
```

Eventos definidos:
- `open-cambiar-perfil` → `{ clienteId }`
- `open-note-modal` → `{ clienteId }`
- `open-shortcuts-help` → sin detail

---

## 10. Tests

```ts
describe('CommandPalette', () => {
  it('⌘K abre el palette si focus NO es input', () => { /* */ });
  it('⌘K NO interfiere si focus es input', () => { /* */ });
  it('Escape cierra', () => { /* */ });
  it('query >= 2 chars dispara fetch search', () => { /* */ });
  it('query < 2 chars NO fetch', () => { /* */ });
  it('item disabled con userRole=viewer + tooltip "Solo admin"', () => { /* */ });
  it('Enter en item ejecuta onSelect + cierra', () => { /* */ });
  it('mobile fullscreen panel + kbd hidden', () => { /* */ });
  it('aria-modal en dialog', () => { /* */ });
  it('cleanup global listener on unmount', () => { /* */ });
  it('custom event open-cambiar-perfil despachado al seleccionar', () => { /* */ });
});
```

═══ FIRMA ═══ FacturaIA / 2026-05-14 / spec CommandPalette.tsx W6
