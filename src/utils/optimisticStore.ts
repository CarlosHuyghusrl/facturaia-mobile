/**
 * optimisticStore.ts
 * Simple module-level event store for optimistic invoice state.
 * Avoids Redux/Context overhead for a single cross-screen concern.
 */

/** W17.4 — Timing diagnostics for OCR end-to-end performance */
export interface W17Timings {
  t0: number; // ms since epoch — "Procesar OCR" button pressed
  t1: number; // ms since epoch — image resize complete
  t2: number; // ms since epoch — HTTP response headers received (fetch resolved)
  t3: number; // ms since epoch — response.json() parsed (OCR + Gemini done)
  t4: number; // ms since epoch — InvoiceReviewScreen mounted with data
}

export interface OptimisticFactura {
  id: string; // temporary local id (e.g. "optimistic-1715000000000")
  estado: 'procesando' | 'procesado' | 'error';
  thumbnail_uri?: string;
  fecha_captura: string;
  proveedor?: string;
  ncf?: string;
  monto?: number;
  invoice_id?: string; // filled when backend responds
  timings?: Partial<W17Timings>; // W17.4 — filled progressively during scan
}

type Listener = (facturas: OptimisticFactura[]) => void;

const listeners = new Set<Listener>();
let store: OptimisticFactura[] = [];

function notify() {
  for (const l of listeners) l([...store]);
}

export const optimisticStore = {
  /** Add a new optimistic row (instant, before OCR) */
  add(factura: OptimisticFactura) {
    store = [factura, ...store];
    notify();
  },

  /** Update an existing optimistic row by tempId */
  update(tempId: string, patch: Partial<OptimisticFactura>) {
    store = store.map(f => (f.id === tempId ? { ...f, ...patch } : f));
    notify();
  },

  /** Remove a row by tempId (call after backend confirms & list refreshes) */
  remove(tempId: string) {
    store = store.filter(f => f.id !== tempId);
    notify();
  },

  /** Remove all rows that are no longer 'procesando' */
  pruneCompleted() {
    store = store.filter(f => f.estado === 'procesando');
    notify();
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    listener([...store]); // immediate snapshot
    return () => listeners.delete(listener);
  },

  getAll(): OptimisticFactura[] {
    return [...store];
  },
};
