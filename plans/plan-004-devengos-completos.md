# Plan-004: Devengos Completos — Que la IA reconozca TODOS los impuestos

**Fecha**: 26-Feb-2026
**Estado**: PENDIENTE REVISION
**Objetivo**: Garantizar que la IA extrae, persiste y valida TODOS los tipos de devengo fiscal dominicano

---

## PROBLEMA

La IA (Claude Opus 4.5) tiene los campos definidos pero:
1. El prompt no le explica bien CUANDO y COMO extraer ciertos impuestos
2. La BD no guarda algunos campos que SI se extraen (itbis_tasa, fecha_pago, ncf_modifica)
3. El prompt de modo texto (OCR) esta incompleto vs el de vision
4. No separa monto_bienes vs monto_servicios (requerido para 606)
5. El validador no cubre todos los casos de ISC ni notas de credito

---

## ESTADO ACTUAL — Que SI reconoce

| Devengo | Extrae | Guarda en BD | Valida |
|---------|--------|-------------|--------|
| ITBIS 18% | SI | SI | SI (tolerancia 5%) |
| ITBIS 16% zona franca | SI | SI (pero pierde tasa) | SI |
| ITBIS Retenido | SI | SI | NO valida % |
| ITBIS Exento | SI | SI | SI (no excede base) |
| ITBIS Proporcionalidad | SI | SI | NO valida |
| ITBIS Costo | SI | SI | NO valida |
| ISR + 8 tipos retencion | SI | SI | SI (tasas por tipo) |
| ISC Telecom 10% | SI | SI | SI |
| ISC Seguros 16% | SI | SI | NO valida tasa |
| ISC Alcohol/Tabaco | SI | SI | NO valida |
| CDT 2% | SI | SI | SI |
| Cargo 911 | SI | SI | NO valida |
| Propina 10% | SI | SI | SI |
| Descuento | SI | SI | SI (no excede subtotal) |
| Otros impuestos | SI | SI | NO valida |

---

## QUE FALTA — Brechas criticas

### A. Prompt de la IA (extractor.go)

| # | Brecha | Impacto |
|---|--------|---------|
| A1 | Prompt texto (buildPromptDGII) incompleto vs vision | Facturas procesadas con texto OCR extraen menos campos |
| A2 | No pide monto_servicios y monto_bienes separados | 606 necesita esa separacion |
| A3 | No explica cuando ncfModifica es obligatorio (B04/E33) | Notas de credito sin referencia a factura original |
| A4 | ISC: no explica tasas por categoria | IA no sabe calcular ISC esperado |
| A5 | No pide itbisRetenidoPorcentaje (30% vs 100%) | No se sabe si es gran contribuyente |

### B. Base de datos

| # | Brecha | Impacto |
|---|--------|---------|
| B1 | itbis_tasa no se persiste | Se pierde la tasa 16% vs 18% al guardar |
| B2 | fecha_pago no se persiste | Validador la requiere para retenciones |
| B3 | ncf_modifica no tiene columna | Notas de credito sin referencia |
| B4 | tipo_id_emisor/receptor no se persisten | No se sabe si es RNC o Cedula |
| B5 | No hay monto_servicios/monto_bienes separados | Solo subtotal total |

### C. Validador (tax_validator.go)

| # | Brecha | Impacto |
|---|--------|---------|
| C1 | ISC seguros 16% no se valida | Solo valida telecom |
| C2 | ITBIS retenido % no se valida | No detecta retencion incorrecta |
| C3 | Nota credito sin ncfModifica no se detecta | Acepta B04/E33 sin referencia |
| C4 | Exportaciones B16 ITBIS debe ser 0 | No se valida |
| C5 | Gubernamentales B15/E45 ITBIS exento | No se valida |

---

## PLAN DE EJECUCION

### Wave 1: Prompt de la IA (backend Go — extractor.go)
**Sin dependencias, se puede hacer primero**

**Tarea 1.1** — Unificar prompts vision y texto
- buildPromptDGII debe tener las mismas instrucciones que buildPromptVision
- Incluir guia emisor vs receptor, sellos, timbres
- Tag: `[CLI]`

**Tarea 1.2** — Agregar campos faltantes al prompt
- Pedir `montoServicios` y `montoBienes` separados (ademas de subtotal)
- Pedir `ncfModifica` con instruccion: "OBLIGATORIO si tipoNcf es B04, E33 o E32"
- Documentar tasas ISC por categoria en el prompt
- Pedir `itbisRetenidoPorcentaje` (30 o 100)
- Tag: `[CLI]`

**Tarea 1.3** — Actualizar struct Invoice (models/invoice.go)
- Agregar campos: MontoServicios, MontoBienes, ITBISRetenidoPorcentaje
- Tag: `[CLI]`

### Wave 2: Base de datos (depende de Wave 1)

**Tarea 2.1** — Migracion SQL: agregar columnas faltantes
```sql
ALTER TABLE facturas_clientes ADD COLUMN IF NOT EXISTS itbis_tasa NUMERIC DEFAULT 18;
ALTER TABLE facturas_clientes ADD COLUMN IF NOT EXISTS fecha_pago TIMESTAMP;
ALTER TABLE facturas_clientes ADD COLUMN IF NOT EXISTS ncf_modifica TEXT DEFAULT '';
ALTER TABLE facturas_clientes ADD COLUMN IF NOT EXISTS tipo_id_emisor INT DEFAULT 1;
ALTER TABLE facturas_clientes ADD COLUMN IF NOT EXISTS tipo_id_receptor INT DEFAULT 1;
ALTER TABLE facturas_clientes ADD COLUMN IF NOT EXISTS monto_servicios NUMERIC DEFAULT 0;
ALTER TABLE facturas_clientes ADD COLUMN IF NOT EXISTS monto_bienes NUMERIC DEFAULT 0;
ALTER TABLE facturas_clientes ADD COLUMN IF NOT EXISTS itbis_retenido_porcentaje INT DEFAULT 0;
```
- Tag: `[CLI]`

**Tarea 2.2** — Actualizar INSERT/SELECT en client_invoices.go
- Agregar las 8 columnas nuevas al SaveClientInvoice y GetClientInvoiceByID
- Tag: `[CLI]`

### Wave 3: Validador (depende de Wave 1 y 2)

**Tarea 3.1** — Agregar reglas faltantes al validador
- ISC seguros 16% de prima
- ITBIS retenido: 30% (gran contribuyente) o 100% (designado)
- Nota credito (B04/E33/E32): ncfModifica obligatorio
- Exportaciones B16: ITBIS = 0
- Gubernamentales B15/E45: ITBIS exento
- Tag: `[CLI]`

**Tarea 3.2** — Pasar campos nuevos al validador en handler.go
- MontoServicios, MontoBienes, ITBISRetenidoPorcentaje, NCFModifica
- Tag: `[CLI]`

### Wave 4: Verificacion (depende de todo lo anterior)

**Tarea 4.1** — Rebuild Docker v2.16.0 y deploy
**Tarea 4.2** — Test con factura real: escanear, verificar que TODOS los campos se extraen
**Tarea 4.3** — Verificar que facturas problematicas (exentas, notas credito, telecom) pasan validacion correctamente

---

## RIESGO

| Riesgo | Mitigacion |
|--------|-----------|
| Cambiar prompt rompe extraccion existente | Tag pre-plan-004 como punto de retorno |
| ALTER TABLE en produccion | Las columnas son ADD con DEFAULT, no rompe nada |
| Nuevas reglas validador rechazan facturas buenas | Nuevas reglas como WARNING, no ERROR |

---

## CRITERIO DE EXITO

1. Escanear factura de supermercado (B01) → todos los campos ITBIS extraidos y guardados
2. Escanear factura telecom (Claro/Altice) → ISC 10%, CDT 2%, Cargo911 extraidos
3. Escanear factura de seguros → ISC 16% extraido
4. Nota de credito (B04) → ncfModifica presente
5. Todas las columnas nuevas en BD con datos reales
6. Validador: 0 falsos positivos en facturas correctas
