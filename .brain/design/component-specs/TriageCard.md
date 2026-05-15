# Component Spec — TriageCard (Revisión Guiada)

**Skills**: `design-to-code` + `composition-patterns` + `design-accessibility` + `design-usability`
**Path**: `app/clientes/revision-guiada-perfil-c/_components/TriageCard.tsx`
**LOC**: 160
**Tipo**: Client Component (state local + optimistic UI + animación entrada)
**Wave**: W5
**Composición**: `<TriageCard>` orquesta `<AiSugerencia>` + `<DecisionGrid>` + datos del cliente actual.

---

## 1. API

```tsx
type TriageCardProps = {
  /** Cliente actual a clasificar */
  cliente: {
    id: string;
    numero: number;                    // posición en la sesión (ej. 128 de 484)
    razon_social: string;
    rnc_cedula: string;
    sector: string | null;
    actividad_economica: string | null;
    monto_mensual: number | null;
    tipo_persona: 'PF' | 'PJ' | string | null;
    contador_nombre?: string | null;
    notas_internas_count?: number;
  };

  /** Sugerencia AI ya resuelta (props del AiSugerencia) */
  sugerencia: {
    sugerido: Grade;
    confidence: number;
    razones: string[];
    modelo?: string;
    fallback_heuristica?: boolean;
  } | null;

  sugerenciaLoading: boolean;
  sugerenciaError: string | null;

  /** Total clientes (para indicador "N de T") */
  total: number;
  hasPrevious: boolean;

  /** Callbacks */
  onAssign: (grade: Grade, motivo?: string) => Promise<void>;
  onSkip: () => void;
  onBack: () => void;
  onAddNote: () => void;
  onVerCompleto: () => void;         // abre ficha cliente en nueva pestaña
  onRegenerarSugerencia: () => void; // re-llama LLM

  className?: string;
};
```

---

## 2. Visual

```
╔══════════════════════════════════════════════════════════════════════════╗
║  Cliente #128 de 484                              [V] Ver completo  [↗] ║
║                                                                            ║
║  Dra. Ana Pérez                                                           ║
║  00112345678 · Persona Física · Salud · Honorarios · RD$ 45,200/mes      ║
║                                                                            ║
║  ★ SUGERENCIA AI                                                          ║
║    B  Perfil Bueno              [ 87% ✓ ]                                ║
║    ▸ RNC cédula 9 dígitos = PJ                                            ║
║    ▸ Sin nómina (no TSS)                                                  ║
║    ▸ Facturación rango B                                                  ║
║    Ver más (2) · Regenerar · Ver detalle                                  ║
║                                                                            ║
║  ASIGNAR PERFIL                                                           ║
║  ┌──[1]──┬──[2]★──┬──[3]──┐                                              ║
║  │   A   │   B    │   C   │                                              ║
║  ├──[4]──┼──[5]──┼──[6]──┤                                              ║
║  │   D   │   E    │   F   │                                              ║
║  ├──[7]──┴────────┴───────┤                                              ║
║  │   G   │                                                                ║
║  └───────┘                                                                ║
║                                                                            ║
║  ┌──[S]──┬──[B]──┬──[N]──┐                                              ║
║  │Saltar │Volver │ Nota  │                                              ║
║  └───────┴───────┴───────┘                                              ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## 3. Estados

| Estado | Visual |
|---|---|
| Initial (entrada) | Slide-in desde derecha 200ms |
| sugerenciaLoading | AiSugerencia skeleton + DecisionGrid sin autoFocus en suggested |
| sugerenciaError | AiSugerencia banner error + DecisionGrid funciona normal |
| Submitting (después de Decision click) | DecisionGrid disabled + spinner en botón presionado + card fade-out 200ms |
| Success | Check ✓ animado 200ms → slide-out izquierda → padre carga siguiente cliente |
| Error assign | Toast rojo + card vuelve a estado idle |
| Notas count > 0 | Badge naranja "📝 N" junto al nombre — indica que ya tiene notas |

---

## 4. Implementación TSX

```tsx
'use client';

import { type FC, useState, useCallback } from 'react';
import { AiSugerencia } from './AiSugerencia';
import { DecisionGrid } from './DecisionGrid';
import { ExternalLinkIcon, NotebookIcon } from '@/components/icons';
import { type Grade } from '@/lib/perfilado/gradeConfig';
import { cn } from '@/lib/utils';

const formatCurrency = (n: number | null): string =>
  n === null ? '—' : `RD$ ${n.toLocaleString('es-DO')}/mes`;

const formatTipoPersona = (t: string | null): string => {
  if (t === 'PF') return 'Persona Física';
  if (t === 'PJ') return 'Persona Jurídica';
  return t ?? '—';
};

export const TriageCard: FC<TriageCardProps> = ({
  cliente, sugerencia, sugerenciaLoading, sugerenciaError,
  total, hasPrevious,
  onAssign, onSkip, onBack, onAddNote, onVerCompleto, onRegenerarSugerencia,
  className
}) => {
  const [submitting, setSubmitting] = useState(false);

  const handleAssign = useCallback(async (grade: Grade, motivo?: string) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onAssign(grade, motivo);
      // padre gestionará el avance al siguiente cliente
    } catch {
      setSubmitting(false);  // permite reintentar
    }
    // intencional: no setSubmitting(false) en success — padre desmonta
  }, [submitting, onAssign]);

  // Build descripción inline del cliente
  const metaParts = [
    formatTipoPersona(cliente.tipo_persona),
    cliente.sector,
    cliente.actividad_economica,
    formatCurrency(cliente.monto_mensual)
  ].filter(Boolean);

  return (
    <article
      className={cn('triage-card', submitting && 'triage-card--submitting', className)}
      aria-labelledby={`cliente-${cliente.id}-title`}
      data-cliente-id={cliente.id}
    >
      <header className="triage-card__header">
        <div className="triage-card__counter">
          <span className="triage-card__counter-label">Cliente</span>
          <span className="triage-card__counter-num">#{cliente.numero}</span>
          <span className="triage-card__counter-total">de {total}</span>
        </div>
        <button
          type="button"
          onClick={onVerCompleto}
          className="triage-card__ver-completo"
          aria-label="Ver ficha completa del cliente (atajo V)"
        >
          <ExternalLinkIcon size={14} aria-hidden="true" />
          <span>Ver completo</span>
          <kbd>V</kbd>
        </button>
      </header>

      <section className="triage-card__cliente">
        <h2 id={`cliente-${cliente.id}-title`} className="triage-card__name">
          {cliente.razon_social}
          {cliente.notas_internas_count && cliente.notas_internas_count > 0 && (
            <span
              className="triage-card__notas-badge"
              aria-label={`${cliente.notas_internas_count} notas internas`}
              title={`${cliente.notas_internas_count} notas internas`}
            >
              <NotebookIcon size={12} aria-hidden="true" /> {cliente.notas_internas_count}
            </span>
          )}
        </h2>
        <p className="triage-card__rnc-row">
          <span className="triage-card__rnc">{cliente.rnc_cedula}</span>
          {metaParts.length > 0 && (
            <>
              <span className="triage-card__sep" aria-hidden="true">·</span>
              <span className="triage-card__meta">{metaParts.join(' · ')}</span>
            </>
          )}
        </p>
        {cliente.contador_nombre && (
          <p className="triage-card__contador">
            Contador asignado: <strong>{cliente.contador_nombre}</strong>
          </p>
        )}
      </section>

      <section aria-label="Sugerencia de IA">
        {sugerencia ? (
          <AiSugerencia
            sugerido={sugerencia.sugerido}
            confidence={sugerencia.confidence}
            razones={sugerencia.razones}
            modelo={sugerencia.modelo}
            fallback_heuristica={sugerencia.fallback_heuristica}
            loading={sugerenciaLoading}
            error={sugerenciaError}
            onRegenerar={onRegenerarSugerencia}
          />
        ) : (
          <AiSugerencia
            sugerido="C"
            confidence={0}
            razones={[]}
            loading={sugerenciaLoading}
            error={sugerenciaError}
            onRegenerar={onRegenerarSugerencia}
          />
        )}
      </section>

      <section aria-label="Asignar perfil">
        <div className="triage-card__section-label">ASIGNAR PERFIL</div>
        <DecisionGrid
          suggested={sugerencia?.sugerido}
          onAssign={handleAssign}
          onSkip={onSkip}
          onBack={onBack}
          onAddNote={onAddNote}
          submitting={submitting}
          hasPrevious={hasPrevious}
        />
      </section>
    </article>
  );
};
```

---

## 5. CSS scoped (extracto)

```css
.triage-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5);
  background: var(--bg-2);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  animation: triage-in var(--motion-duration-medium) var(--motion-ease-out);
}

@keyframes triage-in {
  from { opacity: 0; transform: translateX(24px); }
  to   { opacity: 1; transform: translateX(0); }
}

.triage-card--submitting {
  animation: triage-out var(--motion-duration-medium) ease-out forwards;
  pointer-events: none;
}

@keyframes triage-out {
  to { opacity: 0; transform: translateX(-24px); }
}

.triage-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--border-subtle);
}

.triage-card__counter {
  display: inline-flex;
  align-items: baseline;
  gap: var(--space-2);
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-secondary);
}
.triage-card__counter-label { text-transform: uppercase; font-size: 11px; letter-spacing: 0.06em; }
.triage-card__counter-num {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 18px;
  color: var(--text-primary);
}
.triage-card__counter-total { color: var(--text-tertiary); }

.triage-card__ver-completo {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--bg-3);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-family: var(--font-sans);
  font-size: 13px;
  cursor: pointer;
  transition: all var(--motion-duration-fast);
}
.triage-card__ver-completo:hover  { color: var(--text-primary); border-color: var(--border-default); }
.triage-card__ver-completo:focus-visible { outline: 2px solid var(--border-focus); outline-offset: 2px; }
.triage-card__ver-completo kbd {
  padding: 1px 5px;
  background: var(--bg-2);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 10px;
}

.triage-card__cliente { display: flex; flex-direction: column; gap: var(--space-1); }
.triage-card__name {
  margin: 0;
  font-family: var(--font-sans);
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.25;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}
.triage-card__notas-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: var(--grade-soft-d);
  color: var(--grade-d);
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: 600;
}

.triage-card__rnc-row {
  margin: 0;
  display: inline-flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--space-2);
  font-size: 13px;
  color: var(--text-secondary);
}
.triage-card__rnc {
  font-family: var(--font-mono);
  font-weight: 500;
  color: var(--text-primary);
}
.triage-card__sep { color: var(--text-tertiary); }
.triage-card__meta { color: var(--text-secondary); }

.triage-card__contador { margin: 0; font-size: 12px; color: var(--text-tertiary); }
.triage-card__contador strong { color: var(--text-secondary); }

.triage-card__section-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
}

/* Mobile */
@media (max-width: 767px) {
  .triage-card {
    padding: var(--space-4) var(--space-3);
    border-radius: var(--radius-lg);
    gap: var(--space-3);
  }
  .triage-card__name { font-size: 18px; }
  .triage-card__ver-completo span:not(.sr-only) { display: none; }   /* mobile solo icono + kbd hidden */
  .triage-card__ver-completo kbd { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  .triage-card,
  .triage-card--submitting { animation: none; }
}
```

---

## 6. A11y

- `<article>` con `aria-labelledby` apuntando al título h2
- Counter "Cliente #128 de 484" semántico via labels/structured spans
- `<section>` wrappers con `aria-label`
- Notas badge con `aria-label` + tooltip + título legible
- Cleanup: AiSugerencia y DecisionGrid manejan sus propios listeners; TriageCard solo orquesta
- focus inicial automático en DecisionGrid → suggested grade (autoFocus)

---

## 7. Performance

- `useCallback` para handleAssign
- Re-render mínimo: padre solo cambia `cliente` prop al avanzar → toda la card re-monta (animación entrada)
- No fetch internamente — todo viene como props
- CSS animations en lugar de JS

---

## 8. Composition pattern

`TriageCard` actúa como **container compositor** que:
1. Resuelve datos display del cliente
2. Pasa AI props a `<AiSugerencia>`
3. Pasa callbacks a `<DecisionGrid>`
4. Gestiona el estado local `submitting` (compartido entre AI y Decision)

Esto es **render orchestration** — el padre (`page.tsx`) solo necesita lidiar con datos remotos, no con UI compleja.

---

## 9. Tests

```ts
describe('TriageCard', () => {
  it('renderiza nombre + RNC + meta inline', () => { /* */ });
  it('notas_internas_count > 0 muestra badge naranja', () => { /* */ });
  it('contador_nombre opcional renderiza línea extra', () => { /* */ });
  it('sugerencia=null muestra AiSugerencia loading o error', () => { /* */ });
  it('handleAssign con error vuelve a submitting=false', () => { /* */ });
  it('handleAssign success deja submitting=true (padre desmonta)', () => { /* */ });
  it('click Ver completo llama onVerCompleto', () => { /* */ });
  it('animación entrada slide-in 24px desde derecha', () => { /* */ });
  it('mobile 375 → texto Ver completo oculto, solo icono', () => { /* */ });
  it('reduced motion → sin animaciones', () => { /* */ });
});
```

═══ FIRMA ═══ FacturaIA / 2026-05-14 / spec TriageCard.tsx W5 — orchestrator
