# Plan 007 — n8n DGII: Generación Automática 606 y 607

**Fecha**: 2026-03-03
**Autor**: Arquitecto (Claude)
**Estado**: PENDIENTE APROBACIÓN DE CARLOS
**Prerequisito**: plan-005-formato-606 (columnas BD + endpoints 606)
**Siguiente paso**: Carlos revisa → aprueba → se crea tag `pre-plan-007-n8n-dgii` → se ejecuta por waves

---

## DIAGNÓSTICO PREVIO

### n8n
- **Estado**: ✅ CORRIENDO — container `n8n`, puerto `5678` (localhost only)
- **Health**: `{"status":"ok"}`
- **Acceso**: http://localhost:5678

### Base de Datos — Columnas disponibles para 606/607
La tabla `facturas_clientes` tiene TODOS los campos necesarios:

| Campo BD | Uso 606 | Uso 607 |
|----------|---------|---------|
| emisor_rnc | RNC Proveedor (col 1) | RNC Vendedor |
| tipo_id_emisor | Tipo ID Emisor (col 2) | Tipo ID |
| ncf | NCF (col 4) | NCF (col 1) |
| tipo_ncf | — | Tipo NCF (col 2) |
| ncf_modifica | NCF Modificado (col 5) | NCF Modificado |
| fecha_documento | Fecha Comprobante (col 6) | Fecha Comprobante |
| fecha_pago | Fecha Pago (col 7) | Fecha Pago |
| monto_servicios | Monto Servicios (col 8) | — |
| monto_bienes | Monto Bienes (col 9) | — |
| subtotal | Total Monto (col 10) | Monto Facturado |
| itbis | ITBIS Facturado (col 11) | ITBIS |
| itbis_retenido | ITBIS Retenido (col 12) | ITBIS Retenido |
| itbis_proporcionalidad | ITBIS Proporcionalidad (col 13) | — |
| itbis_costo | ITBIS Costo (col 14) | — |
| retencion_isr_tipo | Tipo Retención ISR (col 17) | — |
| isr | Monto Retención Renta (col 18) | ISR Retenido |
| isc | ISC (col 20) | ISC |
| cdt_monto | Otros Impuestos (col 21) | Otros Impuestos |
| propina | Propina Legal (col 22) | — |
| forma_pago | Forma de Pago (col 23) | Forma de Pago |
| receptor_nombre | — | Nombre Comprador |
| receptor_rnc | — | RNC Comprador |
| tipo_id_receptor | — | Tipo ID Receptor |

**FALTA en BD** (pendiente de plan-005 Wave 1):
- `expense_type` (tipo bienes/servicios 606) — pendiente migración
- `itbis_percibido` — pendiente migración
- `isr_percibido` — pendiente migración

---

## OBJETIVO

Que FacturaIA genere automáticamente los archivos TXT del Formato 606 (compras) y 607 (ventas) listos para enviar a DGII, con dos mecanismos:
1. **Bajo demanda**: endpoints en backend Go (ya planificado en plan-005)
2. **Automático mensual**: workflow n8n que ejecuta el día 20 de cada mes

---

## FORMATO 606 (Compras) — 23 campos pipe-delimited

```
Cabecera: 606|RNC_EMPRESA|PERIODO|CANTIDAD_REGISTROS
Cada fila: campo1|campo2|...|campo23
```

| # | Campo TXT DGII | Campo BD | Notas |
|---|----------------|----------|-------|
| 1 | RNC/Cédula Proveedor | emisor_rnc | 9 o 11 dígitos |
| 2 | Tipo Identificación | tipo_id_emisor | 1=RNC, 2=Cédula |
| 3 | Tipo Bienes/Servicios | expense_type | 01-11 (falta en BD) |
| 4 | NCF | ncf | |
| 5 | NCF Modificado | ncf_modifica | vacío si no aplica |
| 6 | Fecha Comprobante | fecha_documento | YYYYMMDD |
| 7 | Fecha Pago | fecha_pago | YYYYMMDD |
| 8 | Monto Servicios | monto_servicios | |
| 9 | Monto Bienes | monto_bienes | |
| 10 | Total Monto Facturado | subtotal | |
| 11 | ITBIS Facturado | itbis | |
| 12 | ITBIS Retenido | itbis_retenido | |
| 13 | ITBIS Proporcionalidad | itbis_proporcionalidad | |
| 14 | ITBIS Costo | itbis_costo | |
| 15 | ITBIS por Adelantar | CALCULADO: 11-12-13-14 | |
| 16 | ITBIS Percibido | itbis_percibido | (falta en BD) |
| 17 | Tipo Retención ISR | retencion_isr_tipo | 01-09 |
| 18 | Monto Retención Renta | isr | |
| 19 | ISR Percibido | isr_percibido | (falta en BD) |
| 20 | ISC | isc | |
| 21 | Otros Impuestos/Tasas | cdt_monto + cargo_911 | |
| 22 | Propina Legal | propina | |
| 23 | Forma de Pago | forma_pago | 01-07 |

---

## FORMATO 607 (Ventas) — 16 campos pipe-delimited

```
Cabecera: 607|RNC_EMPRESA|PERIODO|CANTIDAD_REGISTROS
Cada fila: campo1|campo2|...|campo16
```

| # | Campo TXT DGII | Campo BD | Notas |
|---|----------------|----------|-------|
| 1 | NCF | ncf | |
| 2 | NCF Modificado | ncf_modifica | |
| 3 | Tipo de Ingreso | tipo_bien_servicio | 1=Ingresos por Operaciones, 2=Ingresos Financieros, 3=Ingresos Extraordinarios, 4=Ingresos por Arrendamientos, 5=Ingresos por Venta de Activos Depreciables, 6=Otros Ingresos |
| 4 | Fecha Comprobante | fecha_documento | YYYYMMDD |
| 5 | Fecha de Retención en la Fuente | fecha_pago | YYYYMMDD |
| 6 | Monto Facturado | subtotal | |
| 7 | ITBIS Facturado | itbis | |
| 8 | Monto Propina Legal | propina | |
| 9 | E-CF Tipo de Envío | — | Solo para e-CF (B34/E31-E45): 1=Emisión, 2=Corrección, 3=Anulación. Vacío para NCF físico |
| 10 | Total Monto Comprobante | monto | |
| 11 | ITBIS Total por Factura | itbis | Para e-CF |
| 12 | Monto Total Propina Legal | propina | Para e-CF |
| 13 | Número de Líneas por Comprobante | CALCULADO: items_json count | Para e-CF |
| 14 | Subtotal sin Impuesto | subtotal | Para e-CF |
| 15 | ITBIS por Factor | — | Para e-CF |
| 16 | Valor Exento | itbis_exento | |

**NOTA sobre 607**: En FacturaIA el escenario principal es 606 (compras del contribuyente). El 607 (ventas) aplica cuando el cliente de FacturaIA también emite facturas. En la versión inicial, soportar 607 básico (campos 1-10 + 16).

---

## QUERIES SQL

### Query 606 — Compras del período

```sql
-- Query 606: facturas de compras (tipo_ncf de proveedores)
SELECT
  COALESCE(emisor_rnc, '')              AS rnc_proveedor,
  COALESCE(tipo_id_emisor, '1')         AS tipo_id,
  LPAD(COALESCE(expense_type::text, '06'), 2, '0') AS tipo_bien_serv,
  COALESCE(ncf, '')                     AS ncf,
  COALESCE(ncf_modifica, '')            AS ncf_modifica,
  TO_CHAR(fecha_documento, 'YYYYMMDD') AS fecha_comprobante,
  CASE
    WHEN fecha_pago IS NOT NULL THEN TO_CHAR(fecha_pago, 'YYYYMMDD')
    ELSE ''
  END                                   AS fecha_pago,
  COALESCE(monto_servicios, 0)::NUMERIC(12,2) AS monto_servicios,
  COALESCE(monto_bienes, 0)::NUMERIC(12,2)    AS monto_bienes,
  COALESCE(subtotal, monto - itbis, 0)::NUMERIC(12,2) AS total_monto,
  COALESCE(itbis, 0)::NUMERIC(12,2)           AS itbis_facturado,
  COALESCE(itbis_retenido, 0)::NUMERIC(12,2)  AS itbis_retenido,
  COALESCE(itbis_proporcionalidad, 0)::NUMERIC(12,2) AS itbis_prop,
  COALESCE(itbis_costo, 0)::NUMERIC(12,2)     AS itbis_costo,
  -- ITBIS por adelantar = 11 - 12 - 13 - 14
  GREATEST(
    COALESCE(itbis, 0) - COALESCE(itbis_retenido, 0)
    - COALESCE(itbis_proporcionalidad, 0) - COALESCE(itbis_costo, 0),
    0
  )::NUMERIC(12,2)                            AS itbis_por_adelantar,
  COALESCE(itbis_percibido, 0)::NUMERIC(12,2) AS itbis_percibido,
  COALESCE(retencion_isr_tipo::text, '')      AS ret_isr_tipo,
  COALESCE(isr, 0)::NUMERIC(12,2)             AS ret_isr_monto,
  COALESCE(isr_percibido, 0)::NUMERIC(12,2)   AS isr_percibido,
  COALESCE(isc, 0)::NUMERIC(12,2)             AS isc,
  (COALESCE(cdt_monto, 0) + COALESCE(cargo_911, 0))::NUMERIC(12,2) AS otros_impuestos,
  COALESCE(propina, 0)::NUMERIC(12,2)         AS propina,
  COALESCE(forma_pago, '02')                  AS forma_pago
FROM facturas_clientes
WHERE cliente_id = $1
  AND TO_CHAR(fecha_documento, 'YYYYMM') = $2
  AND estado != 'eliminada'
  AND tipo_ncf IN ('B01','B11','B13','B14','B16','E31','E34','E41','E44','E45')
ORDER BY fecha_documento, id;
```

### Query 607 — Ventas del período

```sql
-- Query 607: facturas de ventas emitidas (tipo_ncf de ventas)
SELECT
  COALESCE(ncf, '')                     AS ncf,
  COALESCE(ncf_modifica, '')            AS ncf_modifica,
  COALESCE(tipo_bien_servicio, '01')    AS tipo_ingreso,
  TO_CHAR(fecha_documento, 'YYYYMMDD') AS fecha_comprobante,
  CASE
    WHEN fecha_pago IS NOT NULL THEN TO_CHAR(fecha_pago, 'YYYYMMDD')
    ELSE ''
  END                                   AS fecha_retencion,
  COALESCE(subtotal, monto - itbis, 0)::NUMERIC(12,2) AS monto_facturado,
  COALESCE(itbis, 0)::NUMERIC(12,2)    AS itbis_facturado,
  COALESCE(propina, 0)::NUMERIC(12,2)  AS propina_legal,
  ''                                   AS ecf_tipo_envio,
  COALESCE(monto, 0)::NUMERIC(12,2)    AS total_comprobante,
  COALESCE(itbis_exento, 0)::NUMERIC(12,2) AS valor_exento
FROM facturas_clientes
WHERE cliente_id = $1
  AND TO_CHAR(fecha_documento, 'YYYYMM') = $2
  AND estado != 'eliminada'
  AND tipo_ncf IN ('B02','B04','B14','B15','B16','E31','E32','E33','E34','E35',
                   'E36','E37','E38','E39','E40','E41','E42','E43','E44','E45')
ORDER BY fecha_documento, id;
```

### Query Resumen para preview

```sql
-- Resumen 606
SELECT
  COUNT(*) AS registros,
  COALESCE(SUM(subtotal), 0) AS total_facturado,
  COALESCE(SUM(itbis), 0) AS itbis_total,
  COALESCE(SUM(itbis_retenido), 0) AS itbis_retenido_total,
  COALESCE(SUM(
    GREATEST(itbis - itbis_retenido - itbis_proporcionalidad - itbis_costo, 0)
  ), 0) AS itbis_por_adelantar,
  COUNT(*) FILTER (WHERE expense_type IS NULL) AS sin_clasificar
FROM facturas_clientes
WHERE cliente_id = $1
  AND TO_CHAR(fecha_documento, 'YYYYMM') = $2
  AND estado != 'eliminada';
```

---

## FLUJO n8n PROPUESTO

### Workflow 1: Reporte 606 Mensual (automático)
```
TRIGGER: Schedule — día 20 de cada mes, 9:00 AM
  ↓
SET Variables: periodo = mes anterior (YYYYMM), rnc_empresa
  ↓
HTTP Request: GET http://localhost:8081/api/formato-606/{rnc}/preview?periodo={YYYYMM}
  ↓
IF: errores.length > 0
  → Branch Error: HTTP Request a webhook de notificación (Slack/email)
  → STOP
  ↓
HTTP Request: GET http://localhost:8081/api/formato-606/{rnc}?periodo={YYYYMM}
  (descarga TXT crudo)
  ↓
Write Binary File: guardar DGII_F_606_{rnc}_{periodo}.TXT en /data/reportes/
  ↓
HTTP Request: POST a webhook de notificación con resumen
  ↓
END
```

### Workflow 2: Reporte 606 Bajo Demanda (manual)
```
TRIGGER: Webhook POST /webhook/generar-606
  Body: { "rnc_empresa": "131047939", "periodo": "202601" }
  ↓
HTTP Request: GET http://localhost:8081/api/formato-606/{rnc}?periodo={periodo}
  ↓
Respond to Webhook: devolver el TXT como respuesta binaria
```

### Workflow 3: Notificación cuando factura requiere revisión manual
```
TRIGGER: Schedule — diario 8:00 AM
  ↓
PostgreSQL Query: SELECT COUNT(*) WHERE extraction_status='review' AND created_at > NOW()-INTERVAL '24h'
  ↓
IF: count > 0
  → HTTP Request: POST webhook notificación "Hay {N} facturas pendientes de revisión"
  ↓
END
```

---

## PRIORIDAD DE IMPLEMENTACIÓN

### Wave 1 (sin dependencias — PARALELO)
1. **Backend Go**: Endpoint `GET /api/formato-606/:cliente_id?periodo=YYYYMM` → TXT descargable
2. **Backend Go**: Endpoint `GET /api/formato-606/:cliente_id/preview?periodo=YYYYMM` → JSON resumen
3. **BD**: Migración columnas faltantes (`expense_type`, `itbis_percibido`, `isr_percibido`) — ya en plan-005 Wave 1

### Wave 2 (depende de Wave 1)
4. **Backend Go**: Endpoint `GET /api/formato-607/:cliente_id?periodo=YYYYMM` → TXT descargable
5. **n8n**: Workflow mensual automático (Workflow 1)
6. **n8n**: Workflow bajo demanda (Workflow 2)

### Wave 3 (depende de Wave 2)
7. **App móvil**: Pantalla `Generate606Screen.tsx` con:
   - Selector de período
   - Cards de resumen (totales, ITBIS, registros)
   - Lista con semáforo por fila
   - Botón "Generar TXT" + "Compartir"
8. **App móvil**: Navegación a la nueva pantalla

---

## ARCHIVOS A MODIFICAR

### Backend Go (`~/factory/apps/facturaia-ocr/`)
- `api/handler.go` — agregar rutas + handlers 606/607
- `internal/db/client_invoices.go` — queries 606 y 607
- `internal/models/invoice.go` — struct Report606, Report607

### App Móvil (`~/eas-builds/FacturaScannerApp/`)
- `src/screens/Generate606Screen.tsx` — NUEVO
- `src/services/facturasService.ts` — agregar métodos 606/607
- `src/types/invoice.ts` — tipos para reportes

### n8n (via API o UI web en http://localhost:5678)
- Workflow: `FacturaIA — 606 Mensual Automático`
- Workflow: `FacturaIA — 606 Bajo Demanda`
- Workflow: `FacturaIA — Notificación Revisiones Pendientes`

---

## VALIDACIÓN CRUZADA

Datos de referencia en `/home/gestoria/investigacion-606/`:
- `DGII_F_606_131047939_202601.TXT` — TXT real enviado (44 registros)
- Total Monto Facturado: $211,362.72
- ITBIS Facturado: $33,330.67
- ITBIS por Adelantar: $33,330.67

El TXT generado por FacturaIA debe coincidir con estos totales (tolerancia ±0.01).

---

## DIFERENCIA CON PLAN-005

| | Plan-005 | Plan-007 |
|--|---------|---------|
| **Foco** | Backend 606 completo (6 waves) | n8n integración + 607 |
| **n8n** | No incluido | Workflows automáticos y bajo demanda |
| **Formato 607** | No incluido | Query + endpoint básico |
| **App móvil** | Generate606Screen detallada | Integración con n8n webhook |

**Recomendación**: Ejecutar plan-005 primero (Wave 1-3), luego plan-007 (Wave 1-3).
