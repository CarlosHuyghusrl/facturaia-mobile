# Prompt: Investigación Completa de Impuestos DGII para FacturaIA

## Contexto

Soy el arquitecto de FacturaIA, una plataforma SaaS de contabilidad para República Dominicana. Necesito mapear TODOS los tipos de impuestos que pueden aparecer en una factura dominicana para:

1. Extraerlos correctamente con OCR (Claude Opus 4.5)
2. Guardarlos en campos dedicados en PostgreSQL
3. Usarlos en las declaraciones DGII (606, 607, IT-1, IR-17, etc.)

## Tabla actual: facturas_clientes

```sql
-- Campos de impuestos actuales
subtotal        numeric(12,2)  -- Monto antes de impuestos
itbis           numeric(12,2)  -- ITBIS (18%)
itbis_retenido  numeric(12,2)  -- ITBIS retenido (30% o 100%)
isr             numeric(12,2)  -- ISR retenido
isc             numeric(12,2)  -- Impuesto Selectivo al Consumo
propina         numeric(12,2)  -- Propina legal (10%)
otros_impuestos numeric(12,2)  -- Catch-all (malo para reportes)
monto           numeric(12,2)  -- Total final
```

## Lo que necesito investigar

### 1. Impuestos que faltan
- ¿Qué otros impuestos pueden aparecer en facturas RD?
- ¿Hay variantes del ITBIS (16%, 18%, exento)?
- ¿Qué impuestos específicos por industria existen?

### 2. Retenciones
- Tipos de retención de ITBIS (30%, 75%, 100%)
- Tipos de retención de ISR (10%, 25%, 27%, etc.)
- ¿Cuándo aplica cada porcentaje?

### 3. Campos para declaraciones DGII
- 606 (Compras): ¿Qué campos necesito?
- 607 (Ventas): ¿Qué campos necesito?
- IT-1 (ITBIS mensual): ¿Qué desglose necesito?
- IR-17 (Retenciones): ¿Qué campos necesito?

### 4. Categorización fiscal
- Tipos de NCF y su tratamiento fiscal
- Bienes vs Servicios (afecta retención)
- Gastos deducibles vs no deducibles

## Preguntas específicas

1. **ITBIS**: ¿Necesito campos separados para ITBIS 18%, 16%, y exento?
2. **Retenciones ISR**: ¿Cuáles son todos los porcentajes posibles y cuándo aplican?
3. **ISC**: ¿Qué productos/servicios lo llevan y a qué tasa?
4. **Propina**: ¿Siempre es 10%? ¿Es obligatoria?
5. **Impuesto verde**: ¿Aplica en facturas? ¿Cómo se reporta?
6. **Selectivo telecomunicaciones**: ¿Es diferente al ISC general?
7. **Tasa por servicio**: ¿Es diferente a la propina?

## Entregables esperados

1. **Lista completa de impuestos** con:
   - Nombre oficial
   - Código DGII (si existe)
   - Tasas posibles
   - Cuándo aplica
   - En qué declaración se reporta

2. **Esquema de BD propuesto**:
   ```sql
   ALTER TABLE facturas_clientes ADD COLUMN ...
   ```

3. **Mapping para OCR**:
   ```json
   {
     "campo_factura": "campo_bd",
     "ITBIS": "itbis",
     "Propina Legal": "propina",
     ...
   }
   ```

4. **Validaciones**:
   - Reglas de negocio (ej: si NCF es B15, no puede tener ITBIS)
   - Porcentajes válidos por tipo de impuesto

## Fuentes a consultar

- Código Tributario RD (Ley 11-92)
- Normas DGII vigentes
- Formatos oficiales 606, 607, IT-1, IR-17
- Portal DGII (dgii.gov.do)

## Output esperado

Un documento técnico con:
1. Todos los impuestos mapeados
2. SQL para añadir campos faltantes
3. Reglas de extracción para el OCR
4. Validaciones de negocio
5. Mapping a formatos DGII
