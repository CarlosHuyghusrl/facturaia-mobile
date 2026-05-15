# Mockup — Calendario Fiscal Cliente (futuro feature)

**ID**: mockup-calendario-fiscal-cliente-140526
**Fecha**: 2026-05-14
**Autor**: FacturaIA (rol diseñadora SaaS)
**Cliente piloto**: Yolanda Huyghu — Huyghu SRL (LUNES 14-may)
**Audiencia**: cliente final del despacho (NO contadora). Vista pública/portal cliente.
**Plataforma**: SaaS web GestoriaRD (`/portal/calendario`) + APK Android FacturaIA (`CalendarioScreen`).

---

## 1. Objetivo

Dar al **cliente del despacho** visibilidad clara y autoexplicativa de TODAS sus obligaciones fiscales del año en curso, sin tener que preguntar al contador:
- ¿Qué formularios debo presentar?
- ¿Cuándo vencen?
- ¿Cuáles ya están presentados?
- ¿Hay algo urgente / vencido?

**Métrica éxito**: cliente entra al portal, en <5 seg sabe qué le falta y qué venció. Reduce llamadas al despacho ≥30%.

---

## 2. Formularios DGII RD cubiertos

| Form | Periodicidad | Vencimiento | Aplica a |
|---|---|---|---|
| **IT-1** (ITBIS) | Mensual | Día **20** del mes siguiente | Régimen ordinario + contribuyente especial ITBIS |
| **606** (Compras) | Mensual | Día **15** del mes siguiente | Todos los contribuyentes con NCF |
| **607** (Ventas) | Mensual | Día **15** del mes siguiente | Todos los contribuyentes con NCF |
| **608** (NCF anulados) | Mensual | Día **15** del mes siguiente | Solo si hubo anulaciones |
| **IR-2** (ISR Jurídicas) | Anual | **90 días después** del cierre fiscal (típico 31-mar) | Personas jurídicas |
| **Anticipos ISR** | Trimestral | 15-jun · 15-sep · 15-dic | Régimen ordinario que paga ISR |
| **TSS** (planilla) | Mensual | Día **3** del mes siguiente | Empresas con empleados |

---

## 3. Layout — Vista 1: Calendario Anual (overview)

### 3.1 Desktop 1440px

```
┌───────────────────────────────────────────────────────────────────────────────┐
│  ◀ Volver al Dashboard                                          🔔 ⚙ Cuenta   │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│   Calendario Fiscal 2026                                                       │
│   Huyghu SRL · RNC 130309094 · Régimen Ordinario                              │
│                                                                                │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐             │
│   │     28     │  │      4     │  │      1     │  │      2     │             │
│   │ Presentadas│  │ Pendientes │  │  Vencidas  │  │ Próximas 7d│             │
│   │     ✅     │  │     ⏳     │  │     🔴     │  │     ⚠      │             │
│   └────────────┘  └────────────┘  └────────────┘  └────────────┘             │
│                                                                                │
│   Filtrar: [ Todos ] [ IT-1 ] [ 606 ] [ 607 ] [ IR-2 ] [ Anticipos ] [ TSS ] │
│                                                                                │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐                │
│  │  ENERO  │ FEBRERO │  MARZO  │  ABRIL  │  MAYO   │  JUNIO  │                │
│  ├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤                │
│  │ ✅ 606  │ ✅ 606  │ ✅ 606  │ ✅ 606  │ ⏳ 606  │ ⏳ 606  │                │
│  │ ✅ 607  │ ✅ 607  │ ✅ 607  │ ✅ 607  │ ⏳ 607  │ ⏳ 607  │                │
│  │ ✅ IT-1 │ ✅ IT-1 │ ✅ IT-1 │ ✅ IT-1 │ ⚠ IT-1  │ ⏳ IT-1 │  ◀ vence 20-may│
│  │         │         │ ✅ IR-2 │         │         │ ⏳ ant. │                │
│  └─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘                │
│                                                                                │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐                │
│  │  JULIO  │ AGOSTO  │  SEPT   │  OCT    │  NOV    │  DIC    │                │
│  ├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤                │
│  │ ⬜ 606  │ ⬜ 606  │ ⬜ 606  │ ⬜ 606  │ ⬜ 606  │ ⬜ 606  │                │
│  │ ⬜ 607  │ ⬜ 607  │ ⬜ 607  │ ⬜ 607  │ ⬜ 607  │ ⬜ 607  │                │
│  │ ⬜ IT-1 │ ⬜ IT-1 │ ⬜ IT-1 │ ⬜ IT-1 │ ⬜ IT-1 │ ⬜ IT-1 │                │
│  │         │         │ ⬜ ant. │         │         │ ⬜ ant. │                │
│  └─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘                │
│                                                                                │
│  PRÓXIMOS VENCIMIENTOS                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐          │
│  │ 🔴 VENCIDA — IT-1 (período abril)         vencía 20-may-2026   │          │
│  │              monto estimado: RD$ 45,200    [Subsanar ahora →]   │          │
│  ├─────────────────────────────────────────────────────────────────┤          │
│  │ ⚠ POR VENCER — 606 (período mayo)         vence en 6 días      │          │
│  │                                            [Ver detalle →]      │          │
│  ├─────────────────────────────────────────────────────────────────┤          │
│  │ ⚠ POR VENCER — 607 (período mayo)         vence en 6 días      │          │
│  │                                            [Ver detalle →]      │          │
│  ├─────────────────────────────────────────────────────────────────┤          │
│  │ ⏳ PENDIENTE — IT-1 (período mayo)         vence 20-jun-2026   │          │
│  │                                            [Ver detalle →]      │          │
│  └─────────────────────────────────────────────────────────────────┘          │
│                                                                                │
└───────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Tablet 768px

- Grid 12 meses → 3 columnas × 4 filas (en vez de 6×2).
- KPI cards: 2×2 grid.
- Próximos vencimientos: lista vertical sin cambios.

### 3.3 Mobile 375px

- Grid meses → **scroll horizontal** (snap-x) con 1 mes visible a la vez, indicador de página.
- KPI cards: 2×2 grid compacto (60px alto).
- Sticky bottom: "Próximo vencimiento" siempre visible.
- FAB flotante: `[+]` "Subir factura" → abre cámara (deep-link a APK FacturaIA si instalada).

---

## 4. Layout — Vista 2: Detalle Mensual (drill-down)

Al hacer tap/click en `MARZO`, abre modal/screen:

```
┌─────────────────────────────────────────────────────────┐
│  ◀  Marzo 2026                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  L    M    M    J    V    S    D                         │
│  ─    ─    ─    ─    ─    ─    1                         │
│  2    3    4    5    6    7    8                         │
│       •TSS                                               │
│  9    10   11   12   13   14   15                        │
│                                ●606 ●607                 │
│  16   17   18   19   20   21   22                        │
│                      ●IT-1                               │
│  23   24   25   26   27   28   29                        │
│  30   31                                                 │
│            ●IR-2                                         │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  PERÍODO FEBRERO 2026                                    │
│                                                          │
│  ✅ 606 — Compras                       Presentada 12-mar│
│      48 NCF · ITBIS adelantado RD$ 18,400                │
│      [ Descargar TXT ] [ Ver detalle ]                   │
│  ────────────────────────────────────────────────────    │
│  ✅ 607 — Ventas                        Presentada 12-mar│
│      62 NCF · ITBIS cobrado RD$ 31,200                   │
│      [ Descargar TXT ] [ Ver detalle ]                   │
│  ────────────────────────────────────────────────────    │
│  ✅ IT-1 — ITBIS                        Presentada 18-mar│
│      ITBIS a pagar: RD$ 12,800                           │
│      [ Ver constancia ]                                  │
│  ────────────────────────────────────────────────────    │
│                                                          │
│  CIERRE FISCAL                                           │
│  ✅ IR-2 (período fiscal 2025)          Presentada 28-mar│
│      ISR a pagar: RD$ 285,000                            │
│      [ Ver constancia ] [ Pagar cuotas ]                 │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Estados (status) — Lenguaje visual

| Estado | Icono | Color hex | Texto |
|---|---|---|---|
| Presentada | ✅ | `#16A34A` | "Presentada [fecha]" |
| Pendiente >7d | ⏳ | `#6B7280` | "Vence [fecha]" |
| Por vencer ≤7d | ⚠ | `#F59E0B` | "Vence en N días" |
| Vencida | 🔴 | `#DC2626` | "Vencida hace N días" |
| Futuro >30d | ⬜ | `#E5E7EB` | "—" (sin acción) |
| No aplica | (oculto) | — | (no renderizar) |

**Regla**: si el cliente NO está obligado al formulario (ej. 608 sin anulaciones), **no se muestra** — no contamines la vista con "no aplica".

---

## 6. Design tokens (FacturaIA + GestoriaRD híbrido)

```jsonc
{
  "color": {
    "navy":    "#0F2040",   // primario GestoriaRD
    "navy-2":  "#16213E",
    "accent":  "#FF6B00",   // acento FacturaIA (CTAs)
    "success": "#16A34A",
    "warning": "#F59E0B",
    "danger":  "#DC2626",
    "info":    "#2563EB",
    "muted":   "#6B7280",
    "bg":      "#FFFFFF",
    "bg-soft": "#F9FAFB",
    "border":  "#E5E7EB"
  },
  "radius": { "sm": 6, "md": 9, "lg": 12, "xl": 16 },
  "spacing": { "1": 4, "2": 8, "3": 12, "4": 16, "5": 20, "6": 24, "8": 32 },
  "type": {
    "h1": "24/700 -0.02em",
    "h2": "18/600 -0.01em",
    "body": "14/400",
    "label": "13/500",
    "kpi-value": "32/700"
  }
}
```

---

## 7. Interacciones clave

| Acción | Resultado |
|---|---|
| Tap mes (vista anual) | Drill-down a Vista 2 (detalle mensual) |
| Tap formulario en mes card | Abre detalle formulario + descarga TXT 606/607 si aplicable |
| Tap `[Subsanar ahora]` (vencida) | Lleva a `/formularios/[form]/[periodo]` con pre-llenado de OCR/QB |
| Tap chip filtro | Filtra strip mensual + lista próximos (sin recargar) |
| Pull-to-refresh (mobile) | Re-sync con BD pipeline DGII |
| Tap FAB `+` mobile | Deep-link a APK FacturaIA `facturaia://scan` |
| Long-press mes (mobile) | Tooltip: "Marzo: 3 formularios presentados, 0 pendientes" |

---

## 8. Datos requeridos (API)

Endpoint propuesto: `GET /api/v2/calendario/fiscal/[empresa_id]?year=2026`

```typescript
type CalendarioFiscalResponse = {
  empresa: {
    rnc: string;
    razon_social: string;
    regimen: "ordinario" | "simplificado" | "PST" | "RST";
    cierre_fiscal: string;  // "YYYY-MM-DD"
  };
  year: number;
  resumen: {
    presentadas: number;
    pendientes: number;
    vencidas: number;
    proximas_7d: number;
  };
  meses: Array<{
    mes: number;            // 1-12
    nombre: string;         // "enero"
    obligaciones: Array<{
      formulario: "IT-1" | "606" | "607" | "608" | "IR-2" | "ANTICIPO_IR" | "TSS";
      periodo: string;      // "2026-04" o "2025" para anuales
      vence: string;        // ISO date
      estado: "presentada" | "pendiente" | "por_vencer" | "vencida" | "futuro";
      monto_estimado?: number;
      monto_pagado?: number;
      fecha_presentacion?: string;
      constancia_url?: string;
      acciones: Array<{
        label: string;
        href: string;
        variant: "primary" | "secondary" | "danger";
      }>;
    }>;
  }>;
  proximos_vencimientos: Array<{...}>;  // top 5 ordenados por urgencia
}
```

**Origen de datos**:
- `presentada` → tabla `envios_606` + `envios_607` + `envios_it1` + `envios_ir2` con `status='submitted'`
- `pendiente` → calendario fiscal teórico DGII × régimen empresa
- `monto_estimado` → suma `facturas_clientes` del período × % ITBIS
- `constancia_url` → MinIO bucket `constancias-dgii/` (PDFs descargados post-presentación)

---

## 9. Empty states + edge cases

| Caso | UX |
|---|---|
| Cliente recién registrado, 0 historial | "Aún no tenemos tu historial fiscal. Tu primer 606 vence el 15-[mes+1]. [Subir compras]" |
| Cliente RST (régimen simplificado) | Ocultar IT-1, 606, 607 individuales. Mostrar solo "RST anual + cuotas trimestrales" |
| Cliente PST | Mostrar PST anual (vence febrero) + IR-3 si aplica |
| Régimen ordinario sin empleados | Ocultar TSS |
| Año futuro (2027 sin datos aún) | "Calendario aún no generado para 2027" + CTA "Notificarme cuando se publique" |
| Vencida hace >30 días | Badge `🔴 ACCIÓN URGENTE` con borde rojo + warning legal "puede generar mora 10%+" |

---

## 10. Mobile-first considerations (APK FacturaIA)

- Touch targets ≥ 44×44pt (regla iOS HIG / Material 3).
- Bottom safe-area respeto (gesture iPhone).
- Offline: cachear última vista con `AsyncStorage` + badge "Última sync hace 2h".
- Push notifications:
  - D-7: "Tu 606 de mayo vence en 7 días. Sube las compras pendientes."
  - D-1: "Vence MAÑANA — IT-1 abril"
  - D+1: "🔴 IT-1 abril vencida. Subsana ahora para evitar mora."

---

## 11. Accesibilidad (WCAG 2.2 AA)

- Contraste mínimo 4.5:1 (texto cuerpo) y 3:1 (texto grande / iconos).
- Estados NO confiar solo en color: cada badge tiene icono + texto.
- `aria-live="polite"` en KPI cards al refrescar.
- Navegación keyboard: Tab sigue orden visual (KPIs → filtros → meses → próximos).
- `aria-label` en chips: "Filtrar por IT-1, formulario de ITBIS".
- Screen reader: leer fecha vencimiento en formato natural "vence el viernes veinte de mayo".

---

## 12. Roadmap implementación (3 sprints sugeridos)

| Sprint | Scope | Estimación |
|---|---|---|
| S1 | Endpoint API + tabla `calendario_fiscal_teorico` (seed con reglas DGII por régimen) | 1 sem |
| S2 | Vista 1 desktop + tablet + mobile responsive + KPIs + filtros | 1.5 sem |
| S3 | Vista 2 drill-down + integración constancias MinIO + push notifs APK + tests Chrome 3 viewports | 1 sem |

**Total**: ~3.5 semanas para MVP cliente-facing.

---

## 13. Dependencias cross-agent

- **gestoriard** (Next.js): implementa Vista 1 + Vista 2 web + endpoint API.
- **dgii** (scraper): provee `envios_*` actualizados + reglas régimen empresa.
- **FacturaIA (yo)**: implementa `CalendarioScreen.tsx` APK + push notifs Expo + deep-links + Chrome MCP audit 3 viewports.
- **arquitecto-servidor-infra**: configura cron job notificaciones D-7/D-1/D+1.

---

## 14. Verificación pre-deploy (Chrome MCP)

Lista obligatoria antes de declarar "feature ready":

- [ ] 1440px desktop: grid 6×2 renderiza sin overflow
- [ ] 768px tablet: grid 3×4 stack OK
- [ ] 375px mobile: scroll horizontal snap-x funciona
- [ ] Multi-tenant: login Yolanda Huyghu → ver SUS datos · login otro tenant → datos distintos (sin leak)
- [ ] Estados visuales: capturar screenshot con presentada + pendiente + por_vencer + vencida + futuro
- [ ] Empty state: cliente nuevo sin historial
- [ ] Régimen RST: ocultos IT-1/606/607
- [ ] A11y: pasar `axe-core` o Lighthouse a11y ≥ 95
- [ ] Console: 0 errors, 0 hydration warnings
- [ ] Performance: LCP < 2.5s, CLS < 0.1

---

═══ FIRMA ═══ FacturaIA / 2026-05-14 / mockup calendario-fiscal-cliente
