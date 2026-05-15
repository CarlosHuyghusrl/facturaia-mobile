# Mockup — Cliente Detail v3 GestoriaRD (`/clientes/[id]`)

**ID**: `mockup-cliente-detail-v3-140526`
**Fecha**: 2026-05-14
**Autor**: FacturaIA (rol diseñadora SaaS)
**Cliente piloto**: Yolanda Huyghu — Huyghu SRL (LUNES 14-may)
**Base research**: `.brain/research/referentes-cliente-detail-saas-140526.md` (KB Sypnose 16920)

---

## 1. Decisión de diseño: copiar lo mejor de cada referente

| Pieza | Inspirado en | Por qué |
|---|---|---|
| **Header con avatar + estado + tags + 4 metric cards** | Stripe + TaxDome | Densidad de info crítica en primer scroll |
| **AI Client Summary en banner** | Karbon | Yolanda contadora con 503 clientes — necesita resumen pre-llamada |
| **Property panel derecho (sticky)** | Linear + Stripe | RNC, régimen, tier ABC, contador asignado siempre visibles |
| **Tabs centrales: Resumen · Actividad · Fiscal · Comunicación · Documentos · Configuración** | TaxDome + Financial Cents | Cubre los 13 dominios sin abrumar — 6 tabs ≈ Miller's law |
| **Tab "Resumen" = grid de mini-cards** (8 cards estilo TaxDome) | TaxDome Overview | Estado fiscal de un vistazo |
| **Activity audit trail con filtros** | Financial Cents + Linear | Auditoría compliance contadora |
| **Client Vault** (DGII pw + TSS pw + QB) | Financial Cents | DGII RD: necesitan compartir credenciales con el despacho |
| **Sub-items nested** (casos, formularios, facturas relacionadas) | Linear | Drill-down sin perder contexto |
| **Bottom sticky action bar** mobile | (extensión propia) | Yolanda mobile-first |

---

## 2. ASCII Mockup desktop 1440px

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ ☰  GestoriaRD    ⌘K Buscar…                          + Nuevo ▼   🔔   Avatar admin       │
├────────┬───────────────────────────────────────────────────────────────────────┬───────────┤
│        │ Clientes › Huyghu SRL                                                  │           │
│ Side   │                                                                        │           │
│ bar    │ ┌──────────────────────────────────────────────────────────────────┐ │ PROPIEDADES│
│ ATEN   │ │  HS   Huyghu SRL                              [Edit]   [⋯ Más ▼]│ │           │
│ UADO   │ │       RNC 130309094 · SRL · Régimen Ordinario                   │ │ Estado    │
│        │ │       🟢 Activo  [Premium] [Bookkeeping+Tax] [Piloto LUN]       │ │ 🟢 Activo │
│ Dash   │ └──────────────────────────────────────────────────────────────────┘ │           │
│ Chat   │                                                                        │ Tier ABC  │
│ Cli★   │ ─── ✨ Resumen IA  (auto-gen — actualizado hace 12 min) ───            │ ● A — Top │
│ Casos  │ "Cliente al día con DGII. Próx vencimiento: IT-1 mayo en 6 días.       │           │
│ Agend  │  Última factura escaneada hace 2h. Yolanda llamó ayer pidiendo TXT 606."│ Contador  │
│ Form   │                                                                        │ Sarah ★   │
│ QB     │ ┌─────────────┐┌─────────────┐┌─────────────┐┌─────────────┐         │           │
│ DGII   │ │ Vencimien.  ││ Pendientes  ││ Por escanear││ Score DGII  │         │ Régimen   │
│ TSS    │ │ ⚠ 2 (7d)    ││ 4           ││ 12 facturas ││ 92/100  ▲3  │         │ Ordinario │
│ Score  │ │ 🔴 1 vencido││ Casos: 2    ││ Auto: 8     ││ Verde       │         │           │
│ Bibli  │ └─────────────┘└─────────────┘└─────────────┘└─────────────┘         │ Empleados │
│        │                                                                        │ 12        │
│        │ [Resumen] [Actividad] [Fiscal] [Comunicación] [Documentos] [Config]  │           │
│        │  ─────────                                                             │ QB sync   │
│        │                                                                        │ 🟢 OK     │
│        │ === RESUMEN (grid 8 mini-cards estilo TaxDome) ===                     │           │
│        │                                                                        │ TSS       │
│        │ ┌─────────────────────────┐  ┌─────────────────────────┐             │ 🟢 Activa │
│        │ │ 📋 Formularios pendientes│  │ ⚠ Vencimientos próximos │             │           │
│        │ │ IT-1 abril  ● vencido    │  │ IT-1 mayo  · 20-may     │             │ Vault 🔐  │
│        │ │ 606 mayo    ● vence 6d   │  │ 606 mayo   · 15-may  ⚠ │             │ 3 cred.   │
│        │ │ 607 mayo    ● vence 6d   │  │ TSS mayo   · 03-jun     │             │ DGII · TSS│
│        │ │ [Ver todos]              │  │ [Calendario fiscal]     │             │ QB        │
│        │ └─────────────────────────┘  └─────────────────────────┘             │           │
│        │ ┌─────────────────────────┐  ┌─────────────────────────┐             │ Custom    │
│        │ │ 📞 Casos abiertos     2 │  │ 💵 Facturación (mes)    │             │ Constit.  │
│        │ │ #2026-000018 Aclar.      │  │ 606 compras  RD$ 84,200 │             │ 2014-03-15│
│        │ │ #2026-000015 Auditoría   │  │ 607 ventas   RD$ 312,5k │             │ Cumple    │
│        │ │ [Ver todos]              │  │ ITBIS neto   RD$ 19,300 │             │ 31-mar    │
│        │ └─────────────────────────┘  └─────────────────────────┘             │           │
│        │ ┌─────────────────────────┐  ┌─────────────────────────┐             │ Contactos │
│        │ │ 🤖 Facturas FacturaIA   │  │ 📂 Documentos recientes │             │ ─────────│
│        │ │ 42 mes · 8 sin clasifico│  │ • Cert.RNC.pdf  [New]   │             │ Yolanda H.│
│        │ │ 3 con warning RNC       │  │ • IT-1 abr.txt  [New]   │             │ ★ Signat. │
│        │ │ [Abrir cola revisión]   │  │ • 606 abr.txt           │             │ 📞 ✉ 💬   │
│        │ └─────────────────────────┘  └─────────────────────────┘             │           │
│        │ ┌─────────────────────────┐  ┌─────────────────────────┐             │ + 1 más   │
│        │ │ ⏱ Tiempo invertido (mes)│  │ ✉ Última comunicación   │             │           │
│        │ │ Sarah: 4.2h  Mark: 1.1h │  │ Yolanda · WhatsApp · 2h │             │ [Agendar  │
│        │ │ Total: 5.3h              │  │ "Subí 12 facturas hoy"  │             │  reunión] │
│        │ └─────────────────────────┘  └─────────────────────────┘             │           │
└────────┴───────────────────────────────────────────────────────────────────────┴───────────┘
```

---

## 3. Tabs detalle (esbozo)

| Tab | Contenido principal | Inspirado en |
|---|---|---|
| **Resumen** | Grid 8 mini-cards (anterior) | TaxDome Overview |
| **Actividad** | Timeline filtrable (call/email/file/task/system QB/scrape DGII) | Karbon Timeline + Financial Cents Audit |
| **Fiscal** | Sub-tabs: Calendario · Formularios histórico · Pagos DGII · IR-2 anual · Anticipos | Propio (mockup calendario fiscal cliente KB 16919) |
| **Comunicación** | Threads email + WhatsApp + Notas internas + Llamadas log | Financial Cents Chat/Notes |
| **Documentos** | Carpetas (Constitución · DGII · TSS · Bancos · Contratos) + Búsqueda | Financial Cents Files |
| **Configuración** | Custom fields editables + Vault credenciales + Roles team + Tags + Archivar | TaxDome Info tab + Financial Cents Vault |

---

## 4. Mobile-first 375px (Yolanda Huyghu — APK + responsive web)

Yolanda contadora usa móvil en campo (visitas, sótano, parqueo cliente). Performance + thumb-zone crítico.

```
┌──────────────────────────┐
│ ← Huyghu SRL        ⋯    │  ← header colapsable
├──────────────────────────┤
│ HS  RNC 130309094         │
│     🟢 ● A Premium        │
│                           │
│ ✨ Resumen IA            │  ← collapsible (default open)
│ "IT-1 mayo en 6 días.    │
│  12 facturas sin clasif."│
│                           │
│ ┌──────────┬──────────┐  │  ← KPI 2×2 (no 4 cols)
│ │ ⚠ 2 (7d) │ 🔴 1 venc│  │
│ ├──────────┼──────────┤  │
│ │ 12 escan │ Score 92 │  │
│ └──────────┴──────────┘  │
│                           │
│  ◀ ▸  scroll horiz tabs ▸ │  ← tabs swipe
│ [Resumen][Activ][Fiscal]…│
│                           │
│ ─── Resumen ───────────  │  ← mini-cards stack vertical
│ ┌──────────────────────┐ │
│ │ 📋 Formularios pend. │ │
│ │ IT-1 abril ● vencido │ │
│ │ 606 mayo   ● 6d      │ │
│ │ [Ver todos →]        │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ 🤖 FacturaIA 42 mes  │ │
│ │ 8 sin clasificar     │ │
│ │ [Abrir cola →]       │ │
│ └──────────────────────┘ │
│ … (resto cards stack)    │
│                           │
├──────────────────────────┤
│ 📞 ✉ 💬 + Nuevo caso ⋯  │  ← bottom action bar sticky
└──────────────────────────┘
  ↑ thumb zone 44pt+ touch
```

**Decisiones mobile críticas (Yolanda)**:

1. **Property panel** → bottom sheet swipeable (no se pierde, pero no ocupa pantalla)
2. **Tabs** → scroll horizontal con snap (no dropdown)
3. **KPI cards** → 2×2 grid, no 4 columnas (legibilidad)
4. **Bottom action bar sticky**: Call · Email · WhatsApp · Nuevo caso · Más — thumb-friendly
5. **Pull-to-refresh** re-sync QB + DGII
6. **FAB cámara** flotante → deep-link APK FacturaIA `facturaia://scan?clienteId=…`
7. **Offline cache** AsyncStorage del último render — Yolanda visita cliente sin señal
8. **Push notifs**: D-7/D-1/D+1 vencimientos del cliente abierto

---

## 5. Tablet 768px (intermedio)

- Property panel → sigue lateral derecho pero más estrecho (240px en vez de 280px)
- Sidebar nav → colapsado por defecto (icons only)
- Metric cards → 4×1 fila completa (sin cambios respecto desktop)
- Mini-cards Resumen → grid 2×4 (en vez de 2×4 desktop con más aire)

---

## 6. Design tokens

```jsonc
{
  "color": {
    "navy":         "#0F2040",
    "navy-2":       "#16213E",
    "accent":       "#FF6B00",
    "success":      "#16A34A",
    "warning":      "#F59E0B",
    "danger":       "#DC2626",
    "info":         "#2563EB",
    "muted":        "#6B7280",
    "bg":           "#FFFFFF",
    "bg-soft":      "#F9FAFB",
    "bg-sidebar":   "#F3F4F6",
    "bg-panel":     "#FAFAFA",
    "border":       "#E5E7EB",
    "tier-a":       "#16A34A",
    "tier-b":       "#84CC16",
    "tier-c":       "#F59E0B",
    "tier-d":       "#F97316",
    "tier-e":       "#DC2626",
    "tier-f":       "#6B7280"
  },
  "radius":  { "sm": 6, "md": 9, "lg": 12, "xl": 16 },
  "spacing": { "1": 4, "2": 8, "3": 12, "4": 16, "5": 20, "6": 24, "8": 32 },
  "shadow":  {
    "card":   "0 1px 2px rgba(15,32,64,0.06), 0 1px 3px rgba(15,32,64,0.04)",
    "panel":  "0 4px 12px rgba(15,32,64,0.08)",
    "fab":    "0 8px 24px rgba(255,107,0,0.32)"
  },
  "type": {
    "h1":         "24/700 -0.02em",
    "h2":         "18/600 -0.01em",
    "body":       "14/400",
    "label":      "13/500",
    "tag":        "11/600 0.04em uppercase",
    "kpi-value":  "28/700 -0.01em",
    "kpi-label":  "12/500 uppercase",
    "ai-summary": "14/400 italic"
  },
  "layout": {
    "sidebar-w":      "224px",
    "sidebar-w-min":  "56px",
    "property-w":     "280px",
    "property-w-tab": "240px",
    "header-h":       "56px",
    "tabs-h":         "44px",
    "fab-size":       "56px",
    "touch-min":      "44px"
  }
}
```

---

## 7. Interacciones clave

| Acción | Resultado |
|---|---|
| Click metric card | Filtra Tab Resumen al subset relacionado (ej: card "Vencimientos" → highlight 2 cards en grid) |
| Click mini-card título | Drill-down a tab correspondiente (ej: "Formularios pendientes" → Tab Fiscal/Formularios) |
| Click tag header | Filtra `/clientes/` por ese tag |
| Click property panel item editable | Inline edit modal |
| Click "Vault 🔐" | Re-auth requerido → revela credenciales con copy buttons + audit log |
| Click contacto en property panel | Modal con detalle + acciones (call/email/whatsapp/edit) |
| Long-press AI Summary | Toast "Generado hace 12 min — [Regenerar]" |
| Tap FAB cámara (mobile) | Deep-link APK `facturaia://scan?clienteId=<id>&tenantId=<t>` |
| Pull-to-refresh (mobile) | Re-sync QB + DGII + facturas pendientes |
| Swipe tabs (mobile) | Cambia entre tabs sin tap |

---

## 8. Datos requeridos (API)

Endpoint propuesto: `GET /api/v2/clientes/[id]/dashboard?refresh=auto`

```typescript
type ClienteDashboardResponse = {
  cliente: {
    id: string;
    razon_social: string;
    rnc: string;
    tipo: "SRL" | "SA" | "EIRL" | "PF";
    regimen: "ordinario" | "simplificado" | "PST" | "RST";
    estado: "activo" | "inactivo" | "archivado";
    tier_abc: "A" | "B" | "C" | "D" | "E" | "F";
    tags: string[];
    contador_asignado: { id: string; nombre: string; avatar?: string };
    empleados: number;
    cierre_fiscal: string;
  };
  resumen_ia: {
    texto: string;
    actualizado_en: string;
    modelo: "claude-sonnet" | "claude-haiku";
    fallback_visible: boolean;
  };
  metric_cards: {
    vencimientos_7d: { por_vencer: number; vencidas: number };
    pendientes:     { total: number; casos: number };
    por_escanear:   { facturas: number; auto_clasificadas: number };
    score_dgii:     { value: number; max: 100; trend: number; color: "verde"|"amarillo"|"rojo" };
  };
  mini_cards: {
    formularios_pendientes: Array<{ form: string; periodo: string; estado: string }>;
    vencimientos_proximos:  Array<{ form: string; periodo: string; vence: string }>;
    casos_abiertos:         Array<{ codigo: string; titulo: string }>;
    facturacion_mes:        { compras_606: number; ventas_607: number; itbis_neto: number };
    facturaia:              { total_mes: number; sin_clasificar: number; con_warning: number };
    documentos_recientes:   Array<{ nombre: string; new: boolean }>;
    tiempo_invertido:       { por_team_member: Array<{ nombre: string; horas: number }>; total: number };
    ultima_comunicacion:    { canal: string; persona: string; resumen: string; hace: string };
  };
  property_panel: {
    sync_status: { qb: "ok"|"error"|"none"; tss: "ok"|"error"|"none"; dgii: "ok"|"error"|"none" };
    vault: { credenciales: number; tipos: string[] };
    custom_fields: Array<{ label: string; value: string }>;
    contactos: Array<{
      id: string;
      nombre: string;
      es_signatario: boolean;
      canales: ("phone"|"email"|"whatsapp")[];
    }>;
  };
};
```

**Origen de datos**:
- `cliente` → tabla `clientes` + `clientes_perfilado` (14 campos LUNES Yolanda)
- `resumen_ia` → endpoint LLM con cache 30min, datos de tablas relevantes
- `metric_cards` → SQL agregado tabla `formularios_envios` + `casos` + `facturas_clientes` + `score_dgii_historico`
- `mini_cards.facturaia` → tabla `facturas_clientes` filtro `tenant_id=cliente.tenant_id`
- `vault` → tabla `client_credentials` cifrada (NUNCA expone valores hasta re-auth)
- `contactos` → tabla `clientes_contactos` con relaciones canal

---

## 9. Plan implementación — 3 sprints

| Sprint | Scope | Dependencia |
|---|---|---|
| **S1** | Header + 4 metric cards + property panel derecho sticky + tab Resumen (8 mini-cards) | API `GET /api/v2/clientes/[id]/dashboard` que agrega datos de 6+ tablas |
| **S2** | Tabs Actividad (timeline audit) + Fiscal (sub-tabs calendario + formularios) + Documentos | Endpoint `clientes/[id]/activity?type=*&limit=50` + bucket MinIO docs |
| **S3** | Tab Comunicación (email+WA+notas) + Tab Config (custom fields + Vault) + Mobile responsive + APK CalendarioScreen | WhatsApp Business API + crypto vault + Expo deep-links |

**Total**: ~3.5 semanas para MVP `/clientes/[id]` v3.

**Cross-agent**:

- **gestoriard**: implementa `/clientes/[id]/page.tsx` + endpoint API + property panel componente + tabs Resumen/Actividad/Fiscal/Comunicación/Documentos/Config
- **dgii**: provee envios + score + scraper status para metric cards
- **FacturaIA (yo)**: APK responsive view + cámara deep-link + Chrome MCP audit 3 viewports
- **arquitecto-servidor-infra**: configura crypto vault MinIO + cron WhatsApp + LLM endpoint Claude para resumen IA

---

## 10. Empty states + edge cases

| Caso | UX |
|---|---|
| Cliente recién registrado, 0 historial | Resumen IA: "Cliente nuevo — completa el perfilado para activar análisis." CTA grande "Iniciar perfilado A-F" |
| Sin QB sync | Property panel "QB sync: ⚪ No conectado" + CTA "Conectar" |
| LLM down | Banner Resumen IA oculto (fallback graceful) |
| Vault sin credenciales | "Aún no hay credenciales guardadas. [+ Añadir DGII] [+ Añadir TSS]" |
| Sin contactos | "Cliente sin contactos registrados. [+ Añadir contacto]" |
| Cliente archivado | Banner rojo arriba "Cliente archivado el 12-mar-2026 — [Restaurar]" + acciones deshabilitadas |
| Tier F (riesgo) | Property panel borde rojo + warning legal con link a Casos abiertos |
| Régimen RST/PST | Ocultar mini-card 606/607, mostrar mini-card RST anual |
| 0 facturas FacturaIA mes | Mini-card "Aún no hay escaneos este mes. [Abrir cámara]" |
| Cierre fiscal próximo (<30d) | Mini-card extra "IR-2 cierre — N días" en grid Resumen |

---

## 11. Accesibilidad (WCAG 2.2 AA)

- Contraste mínimo 4.5:1 (texto) / 3:1 (badges, iconos no decorativos)
- Estados NUNCA solo color: cada tier ABC tiene letra + color, vencimiento tiene icono + texto
- `aria-live="polite"` en metric cards al refrescar
- `aria-label` en FAB cámara: "Escanear factura para Huyghu SRL"
- Keyboard nav: orden Tab = header → metric cards → tabs → mini-cards → property panel
- Screen reader: lee Resumen IA completo + indica "generado por IA"
- Focus visible: ring 2px navy en todos los interactivos
- Touch targets ≥ 44×44pt mobile
- Reduced motion: respetar `prefers-reduced-motion` para AI summary fade-in

---

## 12. Verificación pre-deploy (Chrome MCP)

- [ ] 1440px desktop: header + property panel + 8 mini-cards sin overflow
- [ ] 768px tablet: property panel narrower 240px, sidebar colapsado
- [ ] 375px mobile: property panel → bottom drawer, KPI 2×2, tabs swipe, bottom action bar visible
- [ ] Multi-tenant: Yolanda Huyghu vs otro tenant — sin leak (verificar property panel + mini-cards)
- [ ] Console: 0 errors, 0 hydration warnings
- [ ] A11y: contraste ≥ 4.5:1, navegación keyboard, screen reader labels, focus visible
- [ ] Performance: LCP < 2.5s, CLS < 0.1, INP < 200ms
- [ ] AI Summary fallback: si LLM down, ocultar banner (no romper page)
- [ ] Vault: re-auth requerido al expandir credenciales (zero-knowledge)
- [ ] Empty states: cliente nuevo sin historial, sin QB sync, sin DGII login
- [ ] Tier ABC: letra + color visibles, no solo color (a11y)
- [ ] FAB deep-link: APK FacturaIA abre cámara con `clienteId` correcto

---

═══ FIRMA ═══ FacturaIA / 2026-05-14 / mockup cliente-detail-v3
