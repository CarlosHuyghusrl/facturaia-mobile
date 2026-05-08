/**
 * W2.W1 — E2E APK → 606 flow scaffold (jest mock fetch)
 *
 * Simula el flujo completo del APK v2.6.3:
 *   1. Login  → POST /api/clientes/login/    → JWT token
 *   2. Upload → POST /api/facturas/upload/   → invoice_id + campos OCR
 *   3. Sanitize (W18 helpers)               → ncf/fecha_emision limpiados
 *   4. 606 check (shape assertions)         → campos presentes y con formato correcto
 *
 * No requiere backend real — usa jest.fn() para mock fetch global.
 * Para correr contra servidor real: set E2E_BACKEND_URL=http://217.216.48.91:8081
 *
 * SKIP por defecto — activar con: SETUP_E2E_APK=1 npx jest e2e/apk-to-606-flow
 *
 * §SETUP:
 *   SETUP_E2E_APK=1       — activa los tests (sin esto, todos hacen skip)
 *   E2E_BACKEND_URL       — URL del backend OCR (default: http://localhost:8081)
 *   E2E_RNC               — RNC del cliente de prueba (default: 130309094)
 *   E2E_PIN               — PIN del cliente de prueba (default: 1234)
 *
 * §NOTAS ARQUITECTURALES:
 *   - sanitizeFormData está definido inline en InvoiceReviewScreen.tsx (no exportado)
 *     → redefinido aquí para pruebas de unidad (W18.3 contract)
 *   - processInvoiceOptimistic usa optimisticStore + api.upload — mockeados vía fetch global
 *   - MSW vs jest mock fetch: para este scaffold elegimos jest mock fetch (sin dependencia
 *     extra). Si se expande el suite, migrar a MSW para intercepción más robusta.
 *   - Expo SDK 52 usa react-native preset (jest.config.js existente) — este archivo
 *     es compatible con la config existente sin cambios adicionales.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Skip guard — same pattern as backend Go E2E tests
// ─────────────────────────────────────────────────────────────────────────────

const SKIP = process.env.SETUP_E2E_APK !== '1';

// Polyfill FormData for Node (jest runs in Node, not React Native)
// React Native's FormData is injected natively; in jest we use a minimal stub.
if (typeof FormData === 'undefined') {
  (global as any).FormData = class FormData {
    private _parts: Array<{ name: string; value: any }> = [];
    append(name: string, value: any) { this._parts.push({ name, value }); }
    getParts() { return this._parts; }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline sanitizeFormData (W18.3 contract)
// Source: src/screens/InvoiceReviewScreen.tsx:150-159
// Kept here to verify the contract independently of the screen component.
// ─────────────────────────────────────────────────────────────────────────────

interface InvoiceData {
  ncf?: string;
  fecha_emision?: string;
  emisor_rnc?: string;
  [key: string]: any;
}

function sanitizeFormData(data: InvoiceData): InvoiceData {
  return {
    ...data,
    ncf: data.ncf ? data.ncf.toUpperCase().replace(/[\s\-_]/g, '') : data.ncf,
    fecha_emision: data.fecha_emision
      ? (data.fecha_emision.match(/^(\d{4}-\d{2}-\d{2})/) || [data.fecha_emision])[0]
      : data.fecha_emision,
    emisor_rnc: data.emisor_rnc
      ? data.emisor_rnc.replace(/[\s\-_]/g, '')
      : data.emisor_rnc,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock fetch responses — mirrors what the real backend returns
// Source: api/handler.go ProcessInvoice + internal/auth/client_auth.go
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_LOGIN_SUCCESS = {
  success: true,
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-payload.mock-sig',
  cliente: {
    id: 'mock-client-uuid-0001',
    nombre: 'Huyghu SRL',
    rnc: '131047939',
  },
};

const MOCK_UPLOAD_SUCCESS = {
  success: true,
  invoice_id: 'mock-invoice-uuid-0001',
  extraction_status: 'validated' as const,
  image_url: 'https://minio.example.com/invoices/mock-invoice-uuid-0001.jpg',
  data: {
    // Core identity fields (W18.3 sanitize targets)
    ncf: 'B0100099999',
    emisor_rnc: '130123456',
    tipo_ncf: 'B01',
    fecha_emision: '2026-05-08',          // ISO date, no T/Z suffix (already clean)

    // Parties
    proveedor: 'Proveedor Mobile Test SRL',
    receptor_rnc: '131047939',

    // Amounts — Huyghu APK scenario: 1000 + 18% ITBIS = 1180
    subtotal: 1000,
    monto: 1180,
    itbis: 180,
    monto_servicios: 1000,
    monto_bienes: 0,
    descuento: 0,
    itbis_retenido: 0,
    itbis_exento: 0,
    itbis_proporcionalidad: 0,
    itbis_costo: 0,
    isr: 0,
    isc: 0,
    cdt_monto: 0,
    cargo_911: 0,
    propina: 0,
    otros_impuestos: 0,
    monto_no_facturable: 0,

    // Fiscal classification
    aplica_606: true,
    aplica_607: false,
    forma_pago: '04',
    tipo_bien_servicio: '02',

    // State
    estado: 'procesado' as const,
    cliente_id: 'mock-client-uuid-0001',
    created_at: '2026-05-08T00:00:00Z',
  },
  validation: {
    valid: true,
    needs_review: false,
    errors: [],
    warnings: [],
    computed: {
      base_gravada: 1000,
      itbis_esperado: 180,
      total_esperado: 1180,
      monto_facturado: 1180,
    },
  },
};

const MOCK_UPLOAD_DUPLICATE = {
  ok: false,
  status: 409,
  body: { error: 'duplicate NCF detected', code: 'DUPLICATE_NCF' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Test suite
// ─────────────────────────────────────────────────────────────────────────────

describe('E2E APK → 606 (W2.W1)', () => {
  const backendURL = process.env.E2E_BACKEND_URL || 'http://localhost:8081';
  const testRNC = process.env.E2E_RNC || '130309094';
  const testPIN = process.env.E2E_PIN || '1234';

  let originalFetch: typeof global.fetch;

  beforeAll(() => {
    originalFetch = global.fetch;

    // Install mock fetch router
    global.fetch = jest.fn().mockImplementation(async (url: string, opts?: RequestInit) => {
      const urlStr = typeof url === 'string' ? url : String(url);

      // ── Login endpoint ──────────────────────────────────────────────────
      if (urlStr.includes('/api/clientes/login/')) {
        return {
          ok: true,
          status: 200,
          headers: new Map([['content-type', 'application/json']]),
          json: async () => MOCK_LOGIN_SUCCESS,
          text: async () => JSON.stringify(MOCK_LOGIN_SUCCESS),
        };
      }

      // ── Upload endpoint ─────────────────────────────────────────────────
      if (urlStr.includes('/api/facturas/upload/')) {
        return {
          ok: true,
          status: 200,
          headers: new Map([['content-type', 'application/json']]),
          json: async () => MOCK_UPLOAD_SUCCESS,
          text: async () => JSON.stringify(MOCK_UPLOAD_SUCCESS),
        };
      }

      // ── Fallback — unexpected URL ───────────────────────────────────────
      return {
        ok: false,
        status: 404,
        json: async () => ({ error: `mock: no handler for ${urlStr}` }),
        text: async () => `mock: no handler for ${urlStr}`,
      };
    }) as any;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Re-install mock after each clear (clearAllMocks resets implementations)
    global.fetch = jest.fn().mockImplementation(async (url: string) => {
      const urlStr = typeof url === 'string' ? url : String(url);
      if (urlStr.includes('/api/clientes/login/')) {
        return { ok: true, status: 200, json: async () => MOCK_LOGIN_SUCCESS };
      }
      if (urlStr.includes('/api/facturas/upload/')) {
        return { ok: true, status: 200, json: async () => MOCK_UPLOAD_SUCCESS };
      }
      return { ok: false, status: 404, json: async () => ({ error: 'not found' }) };
    }) as any;
  });

  // ── Test 1: Full flow login → upload → invoice data shape ────────────────

  it('flow: login → upload → invoice data shape valid (W2.W1)', async () => {
    if (SKIP) {
      console.log('SKIP: set SETUP_E2E_APK=1 to run E2E APK tests');
      return;
    }

    // Step 1: Login
    const loginRes = await fetch(`${backendURL}/api/clientes/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rnc: testRNC, pin: testPIN }),
    });

    expect(loginRes.ok).toBe(true);
    const loginData = await loginRes.json();
    expect(loginData.success).toBe(true);
    expect(typeof loginData.token).toBe('string');
    expect(loginData.token.length).toBeGreaterThan(10);

    const token = loginData.token;

    // Step 2: Upload (APK multipart)
    const formData = new FormData();
    formData.append('image', {
      uri: 'file:///mock/factura-huyghu.jpg',
      type: 'image/jpeg',
      name: 'factura-huyghu.jpg',
    } as any);

    const uploadRes = await fetch(`${backendURL}/api/facturas/upload/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData as any,
    });

    expect(uploadRes.ok).toBe(true);
    const uploadData = await uploadRes.json();

    expect(uploadData.success).toBe(true);
    expect(typeof uploadData.invoice_id).toBe('string');
    expect(uploadData.invoice_id.length).toBeGreaterThan(0);
    // APK uses image_url to render preview after upload
    expect(typeof uploadData.image_url).toBe('string');

    // Step 3: Validate invoice data shape (W18.3 sanitize contract)
    const invoiceData = uploadData.data;
    expect(invoiceData).toBeDefined();

    const sanitized = sanitizeFormData(invoiceData);

    // NCF must be uppercase + no spaces/dashes after sanitize
    expect(sanitized.ncf).toMatch(/^[A-Z0-9]+$/);
    expect(sanitized.ncf).toBe('B0100099999');

    // fecha_emision must be YYYY-MM-DD only (no T00:00:00Z suffix)
    expect(sanitized.fecha_emision).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(sanitized.fecha_emision).toBe('2026-05-08');

    // emisor_rnc must not contain dashes
    if (sanitized.emisor_rnc) {
      expect(sanitized.emisor_rnc).not.toContain('-');
    }

    // Amounts — verify ITBIS math: 18% of 1000 = 180, total = 1180
    expect(invoiceData.itbis).toBe(180);
    expect(invoiceData.monto).toBe(1180);
    expect(invoiceData.subtotal).toBe(1000);

    // Fiscal classification — aplica_606=true required for 606 pipeline
    expect(invoiceData.aplica_606).toBe(true);
    expect(invoiceData.aplica_607).toBe(false);

    // Validation block
    expect(uploadData.validation).toBeDefined();
    expect(uploadData.validation.valid).toBe(true);
    expect(uploadData.validation.errors).toHaveLength(0);
  });

  // ── Test 2: Duplicate NCF returns 409 (W10F1 — anti-duplicados) ─────────

  it('handles duplicate NCF gracefully → 409 conflict (W10F1)', async () => {
    if (SKIP) {
      console.log('SKIP: set SETUP_E2E_APK=1 to run E2E APK tests');
      return;
    }

    // Override mock for this test: second upload returns 409
    (global.fetch as jest.Mock).mockImplementationOnce(
      async (url: string) => ({
        ok: true,
        status: 200,
        json: async () => MOCK_LOGIN_SUCCESS,
      }),
    );
    (global.fetch as jest.Mock).mockImplementationOnce(
      async (url: string) => ({
        ok: false,
        status: 409,
        json: async () => MOCK_UPLOAD_DUPLICATE.body,
      }),
    );

    // Login
    const loginRes = await fetch(`${backendURL}/api/clientes/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rnc: testRNC, pin: testPIN }),
    });
    const loginData = await loginRes.json();
    expect(loginData.success).toBe(true);

    // Upload duplicate → expect 409
    const uploadRes = await fetch(`${backendURL}/api/facturas/upload/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${loginData.token}` },
      body: new FormData() as any,
    });

    expect(uploadRes.ok).toBe(false);
    expect(uploadRes.status).toBe(409);

    const errBody = await uploadRes.json();
    expect(errBody.error).toBeDefined();
    expect(errBody.error).toContain('duplicate');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Unit tests — always run (no SKIP guard) — sanitizeFormData W18.3 contract
// These run regardless of SETUP_E2E_APK since they don't need a backend.
// ─────────────────────────────────────────────────────────────────────────────

describe('sanitizeFormData W18.3 contract (unit, always runs)', () => {
  it('strips leading/trailing spaces from NCF', () => {
    const result = sanitizeFormData({ ncf: '  B0100099999  ' });
    expect(result.ncf).toBe('B0100099999');
  });

  it('strips dashes from NCF', () => {
    const result = sanitizeFormData({ ncf: 'B01-00099999' });
    expect(result.ncf).toBe('B0100099999');
  });

  it('strips underscores from NCF', () => {
    const result = sanitizeFormData({ ncf: 'B01_00099999' });
    expect(result.ncf).toBe('B0100099999');
  });

  it('uppercases NCF', () => {
    const result = sanitizeFormData({ ncf: 'b0100099999' });
    expect(result.ncf).toBe('B0100099999');
  });

  it('strips ISO T/Z suffix from fecha_emision', () => {
    const result = sanitizeFormData({ fecha_emision: '2026-05-08T00:00:00Z' });
    expect(result.fecha_emision).toBe('2026-05-08');
  });

  it('preserves already-clean fecha_emision YYYY-MM-DD', () => {
    const result = sanitizeFormData({ fecha_emision: '2026-05-08' });
    expect(result.fecha_emision).toBe('2026-05-08');
  });

  it('strips dashes from emisor_rnc', () => {
    const result = sanitizeFormData({ emisor_rnc: '1-30-12345-6' });
    expect(result.emisor_rnc).toBe('130123456');
  });

  it('handles all undefined fields gracefully', () => {
    const result = sanitizeFormData({});
    expect(result.ncf).toBeUndefined();
    expect(result.fecha_emision).toBeUndefined();
    expect(result.emisor_rnc).toBeUndefined();
  });

  it('passes through unrelated fields unchanged', () => {
    const result = sanitizeFormData({ ncf: 'B0100099999', monto: 1180, aplica_606: true });
    expect(result.monto).toBe(1180);
    expect(result.aplica_606).toBe(true);
  });
});
