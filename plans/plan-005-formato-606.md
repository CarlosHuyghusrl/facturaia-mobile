# Plan 005 — Formato 606 (Generación Automática DGII)

**Fecha**: 2026-03-03
**Autor**: Arquitecto (Claude)
**Estado**: CORREGIDO — Alineado con Plan-006 (ver cruce-005-vs-006.md)
**Correcciones**: Naming unificado (tipo_bien_servicio, tipo_ncf, isr), migrations delegadas a migration-606-unificada.sql
**Siguiente paso**: Carlos revisa → aprueba → se crea tag `pre-plan-005-formato-606` → se ejecuta por waves

---

## CONTEXTO DEL PROYECTO

FacturaIA es una app móvil (React Native) + backend Go que escanea facturas de gastos mediante OCR + Claude AI y extrae campos fiscales DGII. Backend en Go v2.16.0 corre en Docker puerto 8081.

**Stack**: React Native 0.76.9 + Expo SDK 52 (app) | Go 1.24 + gorilla/mux (backend) | PostgreSQL via PgBouncer:5433 | MinIO (storage)

---

## HALLAZGOS DE LA INVESTIGACION

### 1. FLUJO REAL DEL CONTADOR HOY (manual)

```
PASO 1: El cliente envía facturas físicas/fotos al contador
PASO 2: El contador digita manualmente en un Excel "GASTOS.xlsx" (14 columnas)
PASO 3: El contador copia datos al "Herramienta de Envío Formato 606" (Excel oficial DGII, 23 columnas)
PASO 4: La herramienta genera un TXT pipe-delimited (23 campos por línea)
PASO 5: El contador sube el TXT al portal OFV (dgii.gov.do/OFV/Cruces/Envios606.aspx)
PASO 6: DGII valida → estado CARGADO/COMPLETADO
```

FacturaIA reemplaza los PASOS 1-4 completos.

### 2. NOTA CRITICA: NO EXISTE API DGII

**NO existe una API pública de la DGII para enviar el 606 programáticamente.**

El flujo obligatorio es:
- FacturaIA genera el TXT correctamente formateado
- El usuario/contador descarga el TXT
- El usuario sube el TXT manualmente al portal OFV: `https://dgii.gov.do/OFV/Cruces/Envios606.aspx`
- El usuario ingresa la referencia OFV que devuelve el portal en la app

**FUTURO (no en v1)**: Automatizar la subida con el scraper Playwright existente en `~/dgii-scraper-v2/`.

### 3. ESTRUCTURA DEL EXCEL "GASTOS" (lo que FacturaIA reemplaza)

Este Excel lo llena el contador a mano. Cada cliente tiene uno por mes. 14 columnas:

| Col | Campo | Ejemplo | Corresponde en FacturaIA |
|-----|-------|---------|--------------------------|
| A | FECHA | 2026-01-02 | fecha_factura ✓ |
| B | COMPAÑIA | INVERSIONES R.B. SRL | nombre emisor (del OCR) ✓ |
| C | RNC | 105084716 | emisor_rnc ✓ |
| D | NFC (NCF) | B0100001417 | ncf ✓ |
| E | CONCEPTO | ALQUILER LOCAL POP | concepto (del OCR) ✓ |
| F | SUBTOTAL | 33838.98 | subtotal ✓ |
| G | ITBIS | 6091.02 | itbis ✓ |
| H | PROP. LEGAL | 2974.50 | propina — EXISTE en modelo pero NO en BD |
| I | IST/DCT | CDT376.25/ISC1881.25 | isc + cdt_monto — EXISTE en modelo pero NO en BD |
| J | TOTAL | 39930.00 | total ✓ |
| K | F. PAGO | TRANSFERENCIA | forma_pago ✓ |
| L | OBSERVACIONES | | (no necesario para 606) |
| M | GASTO | GTO ALQUILER LOCAL | NUEVO: tipo_bien_servicio (clasificación 01-11) |
| N | UBICACIÓN | PUERTO PLATA | (no necesario para 606) |

### 4. FORMATO TXT OFICIAL DGII (23 campos pipe-delimited)

```
Cabecera: 606|RNC_EMPRESA|PERIODO|CANTIDAD_REGISTROS
Cada línea: campo1|campo2|...|campo23
```

Los 23 campos del TXT y su mapeo:

| # | Campo TXT | Campo en FacturaIA (BD) | Estado |
|---|-----------|------------------------|--------|
| 1 | RNC/Cédula Proveedor | emisor_rnc | EXISTE |
| 2 | Tipo Identificación | tipo_id_emisor | EXISTE (v2.16.0) |
| 3 | Tipo Bienes/Servicios | tipo_bien_servicio | EXISTE en BD (VARCHAR 10) |
| 4 | NCF | ncf | EXISTE |
| 5 | NCF Modificado | ncf_modifica | EXISTE (v2.16.0) |
| 6 | Fecha Comprobante | fecha_factura | EXISTE |
| 7 | Fecha Pago | fecha_pago | EXISTE (v2.16.0) |
| 8 | Monto Servicios | monto_servicios | EXISTE (v2.16.0) |
| 9 | Monto Bienes | monto_bienes | EXISTE (v2.16.0) |
| 10 | Total Monto Facturado | subtotal | EXISTE |
| 11 | ITBIS Facturado | itbis | EXISTE |
| 12 | ITBIS Retenido | itbis_retenido | EXISTE |
| 13 | ITBIS Proporcionalidad | itbis_proporcionalidad | EXISTE en BD |
| 14 | ITBIS Costo | itbis_costo | EXISTE en BD |
| 15 | ITBIS por Adelantar | (calculado: 11 - 12 - 13 - 14) | CALCULADO |
| 16 | ITBIS percibido compras | itbis_percibido | FALTA en BD |
| 17 | Tipo Retención ISR | retencion_isr_tipo | EXISTE (SMALLINT) |
| 18 | Monto Retención Renta | isr | EXISTE (usar columna isr existente) |
| 19 | ISR percibido compras | isr_percibido | FALTA en BD |
| 20 | ISC | isc | EXISTE en BD |
| 21 | Otros Impuestos/Tasas | cdt_monto + cargo_911 | EXISTE en BD |
| 22 | Propina Legal | propina | EXISTE en BD |
| 23 | Forma de Pago | forma_pago | EXISTE |

### 5. TABLA NCF: CUALES VAN AL 606 (verificado)

Esta tabla es la base de la lógica `aplica_606`. Verificada contra los 44 registros reales de HUYGHU enero 2026 (100% B01 y E31) y fuentes oficiales DGII.

| NCF | e-CF | Descripción | 606? | 607? | Verificado |
|-----|------|------------|:----:|:----:|:----------:|
| B01 | E31 | Crédito Fiscal | SI | SI | TXT real + fuentes |
| B02 | E32 | Consumidor Final | NO | SI | TXT real (0 ocurrencias en 606) |
| B03 | E33 | Nota Débito | SI | SI | Fuentes oficiales |
| B04 | E34 | Nota Crédito | SI | SI | Fuentes oficiales |
| B11 | E46 | Comprobante Compras | SI | SI | Fuentes oficiales |
| B13 | E47 | Gastos Menores | SI | NO | Fuentes oficiales |
| B14 | E41 | Regímenes Especiales | NO | SI | Fuentes oficiales |
| B15 | E44 | Gubernamental | SI | SI | Fuentes oficiales |
| B16 | E45 | Exportaciones | NO | SI | Fuentes oficiales |
| B17 | — | Pagos al Exterior | SI | NO | Fuentes oficiales |
| B12 | — | Registro Único Ingresos | NO | NO | Fuentes oficiales |

**Regla de auto-tag**: cuando la IA extrae un NCF, el backend detecta el prefijo (primeros 3 caracteres) y asigna `aplica_606` automáticamente. El usuario puede hacer override manual.

### 6. CODIGOS DGII REQUERIDOS

**Tipo Bienes y Servicios (campo 3 del TXT):**
```
01 - GASTOS DE PERSONAL
02 - GASTOS POR TRABAJOS, SUMINISTROS Y SERVICIOS
03 - ARRENDAMIENTOS
04 - GASTOS DE ACTIVOS FIJO
05 - GASTOS DE REPRESENTACIÓN
06 - OTRAS DEDUCCIONES ADMITIDAS
07 - GASTOS FINANCIEROS
08 - GASTOS EXTRAORDINARIOS
09 - COMPRAS Y GASTOS QUE FORMARAN PARTE DEL COSTO DE VENTA
10 - ADQUISICIONES DE ACTIVOS
11 - GASTOS DE SEGUROS
```

**Forma de Pago (campo 23 del TXT):**
```
01 - EFECTIVO
02 - CHEQUES/TRANSFERENCIAS/DEPÓSITO
03 - TARJETA CRÉDITO/DÉBITO
04 - COMPRA A CREDITO
05 - PERMUTA
06 - NOTA DE CREDITO
07 - MIXTO
```

**Tipo Retención ISR (campo 17 del TXT):**
```
01 - ALQUILERES
02 - HONORARIOS POR SERVICIOS
03 - OTRAS RENTAS
04 - OTRAS RENTAS (Rentas Presuntas)
05 - INTERESES PAGADOS A PERSONAS JURÍDICAS RESIDENTES
06 - INTERESES PAGADOS A PERSONAS FÍSICAS RESIDENTES
07 - RETENCIÓN POR PROVEEDORES DEL ESTADO
08 - JUEGOS TELEFÓNICOS
09 - RETENCIONES SUBSECTOR DE GANADERÍA DE CARNE BOVINA
```

### 7. MAPEO GASTOS.xlsx → TXT (transformaciones que FacturaIA automatiza)

1. **Clasificación de Gasto (tipo_bien_servicio)**: reglas basadas en los datos REALES del GASTOS.xlsx de HUYGHU (ver sección de mapeo robusto en Wave 5)
2. **Tipo ID**: 9 dígitos = 1 (RNC), 11 dígitos = 2 (Cédula)
3. **Forma Pago**: "TRANSFERENCIA" → 02, "TARJETA BANCO" → 03, "EFECTIVO" → 01
4. **Fecha**: YYYY-MM-DD → YYYYMMDD
5. **Servicios vs Bienes**: separar subtotal según tipo (ya lo hace v2.16.0)
6. **ITBIS por Adelantar**: ITBIS Facturado - ITBIS Retenido - ITBIS Proporcionalidad - ITBIS Costo
7. **ISC/CDT**: descomponer "CDT376.25/ISC1881.25" → campos separados (FacturaIA ya extrae separados)

### 8. VALIDACION REAL — Datos ENERO 2026 de HUYGHU

El envío real de enero 2026 (RNC 131047939) — referencia de oro para testing:
- 44 registros
- 100% NCFs son B01 (21 registros) o E31 (23 registros) — CERO B02/E32
- Total Monto Facturado: $211,362.72
- ITBIS Facturado: $33,330.67
- ITBIS por Adelantar: $33,330.67
- Estado DGII: CARGADO / COMPLETADO

---

## OBJETIVO

Que FacturaIA pueda generar automáticamente el archivo TXT del Formato 606 listo para enviar a la DGII, a partir de las facturas escaneadas durante el mes.

### Pre-requisitos
- Backend Go v2.16.0 operativo
- Campos base (RNC, NCF, ITBIS, monto_servicios, monto_bienes, forma_pago, fecha_pago)
- Tabla facturas_clientes con datos reales

---

## FLUJO END-TO-END (6 Etapas)

El plan cubre el ciclo de vida completo desde captura hasta confirmación:

```
ETAPA 1: CAPTURA (App Móvil — ya existe parcialmente)
├── Usuario escanea factura con cámara
├── Backend OCR + Claude IA extrae TODOS los campos (23 del 606 + extras)
├── IA detecta NCF prefix → auto-tag aplica_606 y tipo_ncf
├── IA clasifica concepto → tipo_bien_servicio (01-11)
├── IA extrae: ITBIS, ISC, CDT, propina, retenciones
├── Guarda en BD: facturas_clientes con todos los campos
└── Usuario revisa y corrige en InvoiceReviewScreen

ETAPA 2: ACUMULACIÓN (Durante el mes — automático)
├── Facturas se acumulan en BD por receptor_rnc + periodo
├── Dashboard HomeScreen muestra badge: "X facturas → 606"
├── Las facturas con aplica_606=false se marcan como "solo contabilidad"
└── El usuario puede cambiar aplica_606 manualmente (override)

ETAPA 3: REVISIÓN PRE-ENVÍO (Pantalla "Generar 606")
├── Lista todas las facturas del periodo con aplica_606=true
├── Semáforo por fila: verde=completo, amarillo=falta tipo_bien_servicio, rojo=error NCF/RNC
├── Totales: Monto Facturado, ITBIS Facturado, ITBIS por Adelantar
├── Permite editar tipo_bien_servicio, forma_pago inline
├── Botón "Validar" → POST /api/formato-606/:rnc/validate
└── Muestra errores/advertencias antes de generar

ETAPA 4: GENERACIÓN TXT
├── Botón "Generar TXT" → GET /api/formato-606/:rnc?periodo=YYYYMM
├── Backend filtra: WHERE aplica_606 = true AND periodo = X
├── Genera TXT con 23 campos pipe-delimited (cabecera + registros)
├── Guarda en tabla envios_606 (estatus='generado')
├── Retorna TXT descargable
└── Botón "Compartir" (WhatsApp, email, guardar en Drive)

ETAPA 5: ENVÍO A DGII (manual — no hay API DGII pública)
├── OPCIÓN A (v1, recomendada): Usuario descarga TXT → sube manual a OFV
├── OPCIÓN B (futuro v2): Automatizar con Playwright scraper ~/dgii-scraper-v2/
├── Usuario ingresa referencia OFV en la app (ej: 60666763671)
├── App actualiza envios_606: estatus='enviado', referencia_dgii=XXX
└── App guarda en historial (History606Screen)

ETAPA 6: CONFIRMACIÓN Y ARCHIVO
├── Verificar en OFV que estatus = CARGADO/COMPLETADO
├── Usuario confirma en app → actualiza envios_606: estatus='completado'
├── (Futuro v2: subir copia TXT a SharePoint via API existente en scraper)
└── Marcar periodo como cerrado en la vista de historial
```

---

## WAVE 1: Base de Datos — Columnas + aplica_606 + envios_606 + codigos

**Sin dependencias. Ejecutar primero.**

### Tarea 1.1: Agregar columnas faltantes a facturas_clientes (incluyendo aplica_606)

> **NOTA**: Esta migration está SUPERSEDIDA por la migration unificada en
> `~/factory/apps/gestoriard/plans/migration-606-unificada.sql`
> Ejecutar esa migration en lugar de esta.

Las siguientes columnas **ya existen** en `facturas_clientes` y NO deben recrearse:
- `itbis_proporcionalidad` (ya existe)
- `itbis_costo` (ya existe)
- `isc` (ya existe)
- `cdt_monto` (ya existe)
- `cargo_911` (ya existe)
- `propina` (ya existe)
- `retencion_isr_tipo` (ya existe como SMALLINT)
- `tipo_bien_servicio` (ya existe como VARCHAR 10 — usar en lugar de `expense_type`)
- `tipo_ncf` (ya existe como VARCHAR 10 — usar en lugar de `ncf_tipo`)
- `isr` (ya existe como NUMERIC — usar en lugar de `retencion_isr_monto`)

Columnas que realmente faltan (solo estas deben crearse):

```sql
-- Solo las columnas que realmente NO existen aún
ALTER TABLE facturas_clientes ADD COLUMN IF NOT EXISTS aplica_606 BOOLEAN DEFAULT FALSE;
ALTER TABLE facturas_clientes ADD COLUMN IF NOT EXISTS itbis_percibido NUMERIC DEFAULT 0;
ALTER TABLE facturas_clientes ADD COLUMN IF NOT EXISTS isr_percibido NUMERIC DEFAULT 0;
ALTER TABLE facturas_clientes ADD COLUMN IF NOT EXISTS periodo_606 VARCHAR(6); -- YYYYMM

-- Comentarios
COMMENT ON COLUMN facturas_clientes.aplica_606 IS 'TRUE si el NCF va al Formato 606 de compras';
COMMENT ON COLUMN facturas_clientes.itbis_percibido IS 'ITBIS percibido en compras (campo 16 TXT)';
COMMENT ON COLUMN facturas_clientes.isr_percibido IS 'ISR percibido en compras (campo 19 TXT)';
COMMENT ON COLUMN facturas_clientes.periodo_606 IS 'Período YYYYMM al que corresponde en el 606';

-- Backfill: marcar facturas existentes según tipo_ncf (columna ya existente)
UPDATE facturas_clientes
SET
    aplica_606 = CASE
        WHEN SUBSTRING(ncf, 1, 3) IN ('B01','B03','B04','B11','B13','B15','B17','E31','E33','E34','E46','E47','E44') THEN TRUE
        ELSE FALSE
    END,
    periodo_606 = to_char(fecha_factura, 'YYYYMM')
WHERE ncf IS NOT NULL;
```

### Tarea 1.2: Crear tabla envios_606 — historial de envíos

> **NOTA**: Esta tabla está definida en la migration unificada.
> Ver `~/factory/apps/gestoriard/plans/migration-606-unificada.sql`

El schema unificado (combina lo mejor de ambos planes):

```sql
CREATE TABLE IF NOT EXISTS envios_606 (
    id                        UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id                UUID        REFERENCES clientes(id),
    rnc                       VARCHAR(11) NOT NULL,
    periodo                   VARCHAR(6)  NOT NULL,                          -- YYYYMM
    fecha_generacion          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cantidad_registros        INT,
    total_monto_facturado     NUMERIC(15,2),
    total_itbis_facturado     NUMERIC(15,2),
    total_itbis_por_adelantar NUMERIC(15,2),
    archivo_txt               TEXT,
    archivo_nombre            VARCHAR(255),
    estado                    VARCHAR(20) CHECK (estado IN (
        'generado', 'enviado', 'completado', 'error'
    )) DEFAULT 'generado',
    estatus_validacion_dgii   VARCHAR(20),
    referencia_dgii           VARCHAR(100),
    fecha_envio               TIMESTAMPTZ,
    subido_dgii_at            TIMESTAMPTZ,
    generado_por              UUID REFERENCES auth.users(id),
    notas                     TEXT,
    created_at                TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(rnc, periodo, fecha_generacion)
);

CREATE INDEX idx_envios_606_rnc_periodo ON envios_606(rnc, periodo);
CREATE INDEX idx_envios_606_estado ON envios_606(estado);

COMMENT ON TABLE envios_606 IS 'Historial de archivos TXT 606 generados y su estado de envío a DGII';
COMMENT ON COLUMN envios_606.referencia_dgii IS 'Número de referencia del portal OFV DGII (ingresado manualmente por el usuario)';
COMMENT ON COLUMN envios_606.estado IS 'generado=TXT creado, enviado=subido a OFV, completado=confirmado, error=rechazo DGII';
```

### Tarea 1.3: Crear tabla de codigos DGII 606

> **NOTA**: Estas tablas (`dgii_606_codigos` y `dgii_ncf_tipos`) están definidas en la migration unificada.
> Ver `~/factory/apps/gestoriard/plans/migration-606-unificada.sql`

```sql
CREATE TABLE IF NOT EXISTS dgii_606_codigos (
    tipo VARCHAR(30) NOT NULL,
    codigo SMALLINT NOT NULL,
    descripcion TEXT NOT NULL,
    keywords TEXT[],
    PRIMARY KEY (tipo, codigo)
);

-- 11 tipos de gasto con keywords para clasificación automática
-- basados en datos reales del GASTOS.xlsx de HUYGHU
INSERT INTO dgii_606_codigos VALUES
('tipo_bien_servicio', 1, 'GASTOS DE PERSONAL', ARRAY['nomina','salario','bono','empleado','personal','sueldo']),
('tipo_bien_servicio', 2, 'GASTOS POR TRABAJOS, SUMINISTROS Y SERVICIOS', ARRAY['servicio','trabajo','suministro','mensajeria','envio','courier','telecomunicacion','telefono','internet','combustible','gasolina','gas','gto envio','gto telecomunicaciones','gto viaje combustible']),
('tipo_bien_servicio', 3, 'ARRENDAMIENTOS', ARRAY['alquiler','arrendamiento','renta','local','oficina','gto alquiler']),
('tipo_bien_servicio', 4, 'GASTOS DE ACTIVOS FIJO', ARRAY['activo fijo','mantenimiento','reparacion','equipo','plomeria','electricidad','gto mantenimiento']),
('tipo_bien_servicio', 5, 'GASTOS DE REPRESENTACIÓN', ARRAY['representacion','viaje','comida','hospedaje','hotel','restaurante','bebida','cena','almuerzo','gto viaje','gto representacion','gto viaje comida','gto viaje coida','gto viaje hospedaje']),
('tipo_bien_servicio', 6, 'OTRAS DEDUCCIONES ADMITIDAS', ARRAY['oficina','papeleria','gto oficina','otro','varios']),
('tipo_bien_servicio', 7, 'GASTOS FINANCIEROS', ARRAY['financiero','interes','banco','comision bancaria','comision']),
('tipo_bien_servicio', 8, 'GASTOS EXTRAORDINARIOS', ARRAY['extraordinario','imprevisto','emergencia']),
('tipo_bien_servicio', 9, 'COMPRAS COSTO DE VENTA', ARRAY['costo venta','mercancia','inventario','materia prima','supermercado','compras']),
('tipo_bien_servicio', 10, 'ADQUISICIONES DE ACTIVOS', ARRAY['adquisicion','compra equipo','vehiculo','mueble','inmueble']),
('tipo_bien_servicio', 11, 'GASTOS DE SEGUROS', ARRAY['seguro','poliza','prima','aseguradora']);

-- Formas de pago
INSERT INTO dgii_606_codigos VALUES
('forma_pago', 1, 'EFECTIVO', ARRAY['efectivo','cash']),
('forma_pago', 2, 'CHEQUES/TRANSFERENCIAS/DEPÓSITO', ARRAY['cheque','transferencia','deposito','wire','ach']),
('forma_pago', 3, 'TARJETA CRÉDITO/DÉBITO', ARRAY['tarjeta','visa','mastercard','debito','credito','tarjeta banco']),
('forma_pago', 4, 'COMPRA A CRÉDITO', ARRAY['credito','30 dias','60 dias','fiado','a credito']),
('forma_pago', 5, 'PERMUTA', ARRAY['permuta','intercambio']),
('forma_pago', 6, 'NOTA DE CRÉDITO', ARRAY['nota credito','nc','devolucion']),
('forma_pago', 7, 'MIXTO', ARRAY['mixto','combinado']);

-- Tabla de referencia NCF → aplica_606
CREATE TABLE IF NOT EXISTS dgii_ncf_tipos (
    prefijo VARCHAR(3) PRIMARY KEY,
    descripcion VARCHAR(100) NOT NULL,
    aplica_606 BOOLEAN NOT NULL,
    aplica_607 BOOLEAN NOT NULL,
    notas TEXT
);

INSERT INTO dgii_ncf_tipos VALUES
('B01', 'Crédito Fiscal',         TRUE,  TRUE,  'Más común en compras de empresa a empresa'),
('B02', 'Consumidor Final',        FALSE, TRUE,  'NO va al 606 — solo contabilidad interna'),
('B03', 'Nota Débito',             TRUE,  TRUE,  NULL),
('B04', 'Nota Crédito',            TRUE,  TRUE,  NULL),
('B11', 'Comprobante Compras',     TRUE,  TRUE,  NULL),
('B12', 'Registro Único Ingresos', FALSE, FALSE, 'No aplica ni 606 ni 607'),
('B13', 'Gastos Menores',          TRUE,  FALSE, 'Solo 606'),
('B14', 'Regímenes Especiales',    FALSE, TRUE,  'Solo 607'),
('B15', 'Gubernamental',           TRUE,  TRUE,  NULL),
('B16', 'Exportaciones',           FALSE, TRUE,  'Solo 607'),
('B17', 'Pagos al Exterior',       TRUE,  FALSE, 'Solo 606'),
('E31', 'e-CF Crédito Fiscal',     TRUE,  TRUE,  'Versión electrónica de B01'),
('E32', 'e-CF Consumidor Final',   FALSE, TRUE,  'Versión electrónica de B02 — NO va al 606'),
('E33', 'e-CF Nota Débito',        TRUE,  TRUE,  'Versión electrónica de B03'),
('E34', 'e-CF Nota Crédito',       TRUE,  TRUE,  'Versión electrónica de B04'),
('E41', 'e-CF Regímenes Especiales',FALSE,TRUE,  'Versión electrónica de B14'),
('E44', 'e-CF Gubernamental',      TRUE,  TRUE,  'Versión electrónica de B15'),
('E45', 'e-CF Exportaciones',      FALSE, TRUE,  'Versión electrónica de B16'),
('E46', 'e-CF Comprobante Compras',TRUE,  TRUE,  'Versión electrónica de B11'),
('E47', 'e-CF Gastos Menores',     TRUE,  FALSE, 'Versión electrónica de B13');
```

**Verificacion Wave 1**:
```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'facturas_clientes' ORDER BY ordinal_position;

SELECT COUNT(*) FROM envios_606;
SELECT COUNT(*) FROM dgii_606_codigos;
SELECT COUNT(*) FROM dgii_ncf_tipos;

-- Verificar backfill aplica_606
SELECT aplica_606, tipo_ncf, COUNT(*)
FROM facturas_clientes
WHERE ncf IS NOT NULL
GROUP BY aplica_606, tipo_ncf;
```

---

## WAVE 2: Backend Go — Extraccion IA mejorada + auto-tag NCF (PARALELO con Wave 1)

**Sin dependencia de Wave 1. Se puede ejecutar en paralelo.**

### Tarea 2.1: Actualizar modelo Go (internal/models/invoice.go)

Agregar campos al struct Invoice:

```go
// Campos para Formato 606 — Wave 1
// NOTA: TipoBienServicio, ISC, CDTMonto, Cargo911, Propina, RetencionISRTipo ya existen en el modelo.
// Verificar que el struct ya los tiene antes de agregar. Solo agregar los realmente nuevos:
TipoBienServicio      *int    `json:"tipo_bien_servicio" db:"tipo_bien_servicio"`  // antes: expense_type — usar columna existente
ItbisProporcionalidad float64 `json:"itbis_proporcionalidad" db:"itbis_proporcionalidad"`
ItbisCosto            float64 `json:"itbis_costo" db:"itbis_costo"`
ItbisPercibido        float64 `json:"itbis_percibido" db:"itbis_percibido"`
ISC                   float64 `json:"isc" db:"isc"`
CDTMonto              float64 `json:"cdt_monto" db:"cdt_monto"`
Cargo911              float64 `json:"cargo_911" db:"cargo_911"`
Propina               float64 `json:"propina" db:"propina"`
RetencionISRTipo      *int    `json:"retencion_isr_tipo" db:"retencion_isr_tipo"`
ISR                   float64 `json:"isr" db:"isr"`                               // antes: retencion_isr_monto — usar columna isr existente
ISRPercibido          float64 `json:"isr_percibido" db:"isr_percibido"`

// Campos de filtro 606
Aplica606             bool    `json:"aplica_606" db:"aplica_606"`
TipoNCF               string  `json:"tipo_ncf" db:"tipo_ncf"`                     // antes: ncf_tipo — usar columna existente
Periodo606            string  `json:"periodo_606" db:"periodo_606"`
```

### Tarea 2.2: Lógica auto-tag NCF en handler.go (ProcessInvoice)

> **NOTA**: El trigger PostgreSQL `auto_tag_factura_606` (definido en la migration unificada)
> se ejecuta automáticamente en cada INSERT/UPDATE. Esta función Go es REDUNDANTE
> pero se mantiene como validación del lado del cliente para respuesta inmediata al usuario.
> El Go code NO debe escribir `aplica_606` directamente — el trigger lo asigna.
> Si se mantiene esta función, usarla solo para mostrar al usuario qué valor asignará el trigger.

Después de que la IA extrae el NCF, antes del INSERT:

```go
// AutoTagNCF detecta el prefijo del NCF y retorna tipo_ncf y aplica_606 esperado.
// SOLO para validación/preview del lado del cliente. El trigger PG es quien lo persiste.
func AutoTagNCF(ncf string) (tipoNCF string, aplica606 bool) {
    if len(ncf) < 3 {
        return "", false
    }
    prefijo := strings.ToUpper(ncf[:3])

    // Mapa de prefijos que aplican al 606 (verificado contra datos reales HUYGHU y fuentes DGII)
    aplica606Map := map[string]bool{
        "B01": true,  // Crédito Fiscal
        "B03": true,  // Nota Débito
        "B04": true,  // Nota Crédito
        "B11": true,  // Comprobante Compras
        "B13": true,  // Gastos Menores
        "B15": true,  // Gubernamental
        "B17": true,  // Pagos al Exterior
        "E31": true,  // e-CF Crédito Fiscal
        "E33": true,  // e-CF Nota Débito
        "E34": true,  // e-CF Nota Crédito
        "E44": true,  // e-CF Gubernamental
        "E46": true,  // e-CF Comprobante Compras
        "E47": true,  // e-CF Gastos Menores
        // NO aplican: B02, B12, B14, B16, E32, E41, E45
    }

    aplica, _ := aplica606Map[prefijo]
    return prefijo, aplica
    // Uso: tipoNCF, aplica606 := AutoTagNCF(invoice.NCF)
    // Escribir en: invoice.TipoNCF (tipo_ncf) — NO crear campo tipo_ncf adicional
}
```

**Nota**: El usuario puede hacer override manual de `aplica_606` desde la app (la IA es solo el primer paso).

### Tarea 2.3: Actualizar prompt de Claude para extraer campos 606

En `internal/ai/extractor.go`, agregar al schema JSON del prompt:

```json
{
  "tipo_bien_servicio": "number 1-11 — clasificación DGII del gasto: 1=gastos de personal, 2=trabajos/suministros/servicios, 3=arrendamientos, 4=activos fijo, 5=representación (viajes/comidas/hospedaje), 6=otras deducciones, 7=financieros, 8=extraordinarios, 9=costo de venta, 10=adquisición activos, 11=seguros. NULL si no puedes determinar.",
  "itbis_proporcionalidad": "number — ITBIS sujeto a proporcionalidad Art. 349 si aplica, 0 si no",
  "itbis_costo": "number — ITBIS llevado al costo si aplica, 0 si no",
  "isc": "number — Impuesto Selectivo al Consumo (telecom 10%, alcohol, tabaco)",
  "cdt_monto": "number — Contribución al Desarrollo de las Telecomunicaciones 2%",
  "cargo_911": "number — Cargo 911 2% sobre servicios telecom",
  "propina": "number — Propina legal 10% (restaurantes y similares)",
  "retencion_isr_tipo": "number 0-9 — tipo retención ISR: 0=ninguna, 1=alquileres, 2=honorarios, 3=otras rentas",
  "isr": "number — monto ISR retenido (campo isr existente en BD)"
}
```

**Reglas de clasificación tipo_bien_servicio para el prompt** (basadas en datos reales HUYGHU):
```
- "GTO ALQUILER LOCAL" / alquiler / renta de local u oficina → 03 (Arrendamientos)
- "GTO VIAJE COMIDA" / "GTO VIAJE COIDA" / restaurante / comida / bebida → 05 (Representación)
- "GTO VIAJE HOSPEDAJE" / hotel / hospedaje → 05 (Representación)
- "GTO VIAJE COMBUSTIBLE" / combustible / gasolina → 02 (Trabajos y Servicios)
- "GTO MANTENIMIENTO LOCAL" / mantenimiento / reparación → 04 (Activos Fijo)
- "GTO TELECOMUNICACIONES" / teléfono / internet / telecom → 02 (Trabajos y Servicios)
- "GTO ENVIO" / mensajería / courier / envío → 02 (Trabajos y Servicios)
- "GTO REPRESENTACION" / viaje (genérico) → 05 (Representación)
- "GTO OFICINA" / papelería / material oficina → 06 (Otras Deducciones)
- Seguros / pólizas → 11 (Seguros)
- Nómina / salarios → 01 (Personal)
- Mercancía / inventario / supermercado (si es para venta) → 09 (Costo de Venta)
- Compra de equipo / activo fijo → 10 (Adquisición Activos)
- Cualquier otro → 06 (Otras Deducciones Admitidas) como fallback — NO dejar NULL
```

### Tarea 2.4: Actualizar queries INSERT/SELECT en internal/db/client_invoices.go

Actualizar el INSERT de ProcessInvoice y el SELECT de GetFacturas para incluir todos los campos nuevos de Wave 1 y 2.

**Verificacion Wave 2**: `curl -X POST localhost:8081/api/process-invoice` con factura de prueba → verificar respuesta incluye `tipo_bien_servicio`, `isc`, `propina`, `aplica_606`, `tipo_ncf`.

---

## WAVE 3: Backend Go — Endpoints 606 con filtro aplica_606

**Depende de Wave 1 y Wave 2.**

### Tarea 3.1: Crear endpoint GET /api/formato-606/:rnc_receptor

Query params: `?periodo=YYYYMM`

Lógica del handler:
1. Buscar facturas del cliente (receptor_rnc) para el periodo **donde `aplica_606 = true`**
2. Validar campos obligatorios (rnc, ncf, fecha, monto)
3. Generar cada línea TXT con los 23 campos pipe-delimited
4. Cabecera: `606|{rnc_receptor}|{periodo}|{cantidad}`
5. Campo 15 (ITBIS por Adelantar) = campo 11 - campo 12 - campo 13 - campo 14
6. tipo_bien_servicio NULL → usar 06 como fallback con advertencia en log
7. Guardar en tabla `envios_606` con estatus='generado' y el contenido TXT
8. Retornar `Content-Type: text/plain; charset=utf-8` con header `Content-Disposition: attachment; filename="DGII_F_606_{rnc}_{periodo}.TXT"`

Query base:
```sql
SELECT emisor_rnc, tipo_id_emisor, tipo_bien_servicio, ncf, ncf_modifica,
       fecha_factura, fecha_pago, monto_servicios, monto_bienes,
       subtotal, itbis, itbis_retenido, itbis_proporcionalidad, itbis_costo,
       itbis_percibido, retencion_isr_tipo, isr,
       isr_percibido, isc, cdt_monto, cargo_911, propina, forma_pago
FROM facturas_clientes
WHERE receptor_rnc = $1
  AND to_char(fecha_factura, 'YYYYMM') = $2
  AND estado != 'eliminada'
  AND aplica_606 = true
ORDER BY fecha_factura, id
```

Formato de cada línea (23 campos):
```
RNC_PROVEEDOR|TIPO_ID|TIPO_BIEN_SERV|NCF|NCF_MOD|FECHA_COMPROBANTE|FECHA_PAGO|MONTO_SERV|MONTO_BIENES|TOTAL|ITBIS_FACTURADO|ITBIS_RETENIDO|ITBIS_PROP|ITBIS_COSTO|ITBIS_POR_ADELANTAR|ITBIS_PERCIBIDO|RET_ISR_TIPO|RET_ISR_MONTO|ISR_PERCIBIDO|ISC|OTROS_IMPUESTOS|PROPINA|FORMA_PAGO
```

Reglas de formato:
- Fechas: YYYYMMDD (sin guiones)
- Montos: formato "%.2f" (dos decimales)
- Campos vacíos/nulos: string vacío entre pipes (no "0")
- tipo_bien_servicio: formato "%02d" (cero a la izquierda si un dígito)
- otros_impuestos = cdt_monto + cargo_911
- Nombre archivo: `DGII_F_606_{rnc_receptor}_{periodo}.TXT`

### Tarea 3.2: Crear endpoint GET /api/formato-606/:rnc_receptor/preview

Query params: `?periodo=YYYYMM`

Retorna JSON con totales, semáforo de estado y detalle por factura:
```json
{
  "rnc": "131047939",
  "periodo": "202601",
  "registros": 44,
  "registros_excluidos": 0,
  "total_facturado": 211362.72,
  "itbis_facturado": 33330.67,
  "itbis_retenido": 0.00,
  "itbis_por_adelantar": 33330.67,
  "errores": [],
  "advertencias": ["Fila 5: tipo_bien_servicio no clasificado, usando 06 por defecto"],
  "detalle": [
    {
      "linea": 1,
      "id": "uuid-de-la-factura",
      "rnc_proveedor": "105084716",
      "nombre_proveedor": "INVERSIONES R.B. SRL",
      "ncf": "B0100001417",
      "tipo_ncf": "B01",
      "aplica_606": true,
      "fecha": "20260102",
      "monto": 33838.98,
      "itbis": 6091.02,
      "tipo_gasto": "03",
      "tipo_gasto_descripcion": "ARRENDAMIENTOS",
      "forma_pago": "02",
      "forma_pago_descripcion": "CHEQUES/TRANSFERENCIAS/DEPÓSITO",
      "semaforo": "verde",
      "tiene_advertencia": false
    }
  ]
}
```

Lógica del semáforo por fila:
- `verde`: todos los campos completos y válidos
- `amarillo`: tipo_bien_servicio NULL (se usará fallback 06)
- `rojo`: RNC inválido, NCF inválido, o monto nulo/negativo

### Tarea 3.3: Crear endpoint POST /api/formato-606/:rnc_receptor/validate

Valida SIN generar el TXT. Retorna JSON con lista de errores y advertencias.

Validaciones:
- RNC proveedor: 9 o 11 dígitos numéricos
- NCF: formato correcto según tipo comprobante (B01 = 11 chars, E31 = 11 chars)
- Fechas dentro del periodo declarado (no fechas de otros meses)
- Montos positivos y no nulos
- tipo_bien_servicio entre 01-11 (advertencia si NULL, no error bloqueante)
- forma_pago entre 01-07
- ITBIS por Adelantar >= 0
- monto_servicios + monto_bienes = subtotal (tolerancia ±0.01)
- aplica_606 = true (las facturas excluidas NO se incluyen en el conteo)

### Tarea 3.4: Crear endpoint PUT /api/formato-606/factura/:id/toggle-aplica606

Permite al usuario hacer override manual de aplica_606:

```json
{ "aplica_606": true }
```

Actualiza `facturas_clientes` SET `aplica_606 = $1` WHERE `id = $2`.
Retorna la factura actualizada.

### Tarea 3.5: Crear endpoint PUT /api/envios-606/:id/referencia

Para que el usuario ingrese la referencia OFV después de subir manualmente:

```json
{
  "referencia_dgii": "60666763671",
  "estatus_envio": "enviado"
}
```

**Verificacion Wave 3**: Generar TXT con datos HUYGHU enero 2026 → comparar estructura y totales contra `/home/gestoria/investigacion-606/DGII_F_606_131047939_202601.TXT`

```bash
# Comparar totales (debe dar: registros=44, monto=$211,362.72, itbis=$33,330.67)
curl "localhost:8081/api/formato-606/131047939/preview?periodo=202601" | jq '.registros, .total_facturado, .itbis_facturado'
```

---

## WAVE 4: App Movil — UI completa para el flujo 606

**Depende de Wave 3.**

### Tarea 4.1: InvoiceReviewScreen — agregar campo "Tipo de Gasto" y badge aplica_606

Archivo: `src/screens/InvoiceReviewScreen.tsx`

Cambios:
- Agregar selector/picker con los 11 tipos de gasto DGII (código + descripción abreviada)
- Pre-seleccionar basado en `tipo_bien_servicio` devuelto por la IA
- Badge visual: "IA" (gris claro) si la IA clasificó automáticamente — indica que puede revisar
- Agregar toggle `aplica_606` con label "Va al Formato 606"
  - Pre-setear según `aplica_606` del backend
  - Mostrar `tipo_ncf` como info: "(B01 — Crédito Fiscal)"
  - Permitir override manual con tooltip: "¿Estás seguro? Este NCF normalmente NO va al 606"
- Mostrar campos ISC, CDT, Propina, Retención ISR si son > 0
  - Si no están visibles actualmente: agregar en sección "Impuestos Adicionales" colapsable

### Tarea 4.2: HomeScreen — badge contador de facturas pendientes para 606

Archivo: `src/screens/HomeScreen.tsx`

Agregar badge en la tarjeta del cliente o en el menú:
```
"X facturas listas para el 606"
```

Lógica: GET `/api/formato-606/:rnc/preview?periodo={mesActual}` → campo `registros` en la respuesta.

### Tarea 4.3: Crear pantalla Generate606Screen (pantalla principal)

Archivo nuevo: `src/screens/Generate606Screen.tsx`

Secciones de la pantalla:

**1. Header con selector de periodo**
- Picker mes/año (default: mes actual)
- Nombre del cliente (receptor_rnc)

**2. Cards de resumen**
- Total Monto Facturado
- ITBIS Facturado
- ITBIS por Adelantar
- Cantidad de Registros

**3. Barra de estado de clasificación**
- Verde: todos clasificados
- Amarillo: X sin tipo_bien_servicio (se usará fallback)
- Rojo: X errores que impiden generar

**4. Lista de facturas del periodo**
- Semáforo de color por fila (verde / amarillo / rojo)
- Nombre proveedor + NCF + monto
- Tipo de gasto (código + descripción abreviada)
- Toque en fila → editar inline tipo_bien_servicio y forma_pago
- Facturas con `aplica_606=false` aparecen en sección separada "Excluidas del 606"

**5. Botones de acción**
- "Validar" → POST /validate → modal con errores/advertencias
- "Generar TXT" → GET endpoint → descarga archivo
  - Deshabilitado si hay errores rojos
  - Muestra spinner durante generación
- "Compartir" → `expo-sharing` con el archivo TXT descargado
- "Ver Historial" → navega a History606Screen

**Comportamiento**:
- Al cambiar periodo → auto-llama /preview
- Si hay advertencias → banner amarillo: "X facturas sin tipo_bien_servicio (se usará código 06 por defecto)"
- Si hay errores → banner rojo + botón "Generar TXT" deshabilitado
- Descarga TXT: `expo-file-system` → `DocumentDirectory/DGII_F_606_{rnc}_{periodo}.TXT`
- Después de generar → prompt: "¿Deseas compartir el TXT ahora?"

### Tarea 4.4: Crear pantalla History606Screen (historial de envíos)

Archivo nuevo: `src/screens/History606Screen.tsx`

Muestra todos los registros de `envios_606` para el cliente:

| Campo visible | Descripción |
|---|---|
| Periodo | YYYY-MM |
| Fecha Generación | DD/MM/YYYY HH:MM |
| Registros | Cantidad de facturas |
| Monto Total | Total facturado |
| Estatus | Badge: generado/enviado/completado/rechazado |
| Referencia OFV | Si existe |

Acciones por fila:
- "Re-descargar TXT" → re-genera o descarga el archivo guardado
- "Registrar envío" → modal para ingresar referencia OFV → PUT /referencia
- "Marcar completado" → actualiza estatus a 'completado'

### Tarea 4.5: Agregar navegación a nuevas pantallas

En el navigator principal:
- Ruta `Generate606` → `Generate606Screen` (parámetro: `rnc`, `clienteNombre`)
- Ruta `History606` → `History606Screen` (parámetro: `rnc`)
- En la pantalla de detalle del cliente: botón "Formato 606" que navega a `Generate606Screen`

### Tarea 4.6: Actualizar tipos TypeScript (src/types/invoice.ts)

```typescript
export interface Invoice {
  // ... campos existentes ...

  // Campos 606 — usar nombres de columnas existentes en BD
  tipo_bien_servicio?: number;     // 1-11 (antes: expense_type — columna ya existe)
  tipo_ncf?: string;               // B01, E31, etc. (antes: ncf_tipo — columna ya existe)
  aplica_606: boolean;
  periodo_606?: string;            // YYYYMM
  itbis_proporcionalidad: number;  // ya existe en BD
  itbis_costo: number;             // ya existe en BD
  itbis_percibido: number;
  isc: number;                     // ya existe en BD
  cdt_monto: number;               // ya existe en BD
  cargo_911: number;               // ya existe en BD
  propina: number;                 // ya existe en BD
  retencion_isr_tipo?: number;     // ya existe en BD (SMALLINT)
  isr: number;                     // ya existe en BD (antes: retencion_isr_monto)
  isr_percibido: number;
}

export interface Formato606Preview {
  rnc: string;
  periodo: string;
  registros: number;
  registros_excluidos: number;
  total_facturado: number;
  itbis_facturado: number;
  itbis_retenido: number;
  itbis_por_adelantar: number;
  errores: string[];
  advertencias: string[];
  detalle: Formato606Detalle[];
}

export interface Formato606Detalle {
  linea: number;
  id: string;
  rnc_proveedor: string;
  nombre_proveedor: string;
  ncf: string;
  tipo_ncf: string;               // antes: ncf_tipo
  aplica_606: boolean;
  fecha: string;
  monto: number;
  itbis: number;
  tipo_gasto: string;
  tipo_gasto_descripcion: string;
  forma_pago: string;
  forma_pago_descripcion: string;
  semaforo: 'verde' | 'amarillo' | 'rojo';
  tiene_advertencia: boolean;
}

export interface Envio606 {
  id: string;
  empresa_id?: string;            // FK a clientes (schema unificado)
  rnc: string;                    // antes: receptor_rnc
  periodo: string;
  fecha_generacion: string;
  cantidad_registros: number;
  total_monto_facturado: number;
  total_itbis_facturado: number;
  total_itbis_por_adelantar: number;
  archivo_nombre: string;
  referencia_dgii?: string;
  estado: 'generado' | 'enviado' | 'completado' | 'error'; // antes: estatus_envio — schema unificado
  estatus_validacion_dgii?: string;
  fecha_envio?: string;
  subido_dgii_at?: string;
  notas?: string;
}
```

### Tarea 4.7: Actualizar facturasService.ts (src/services/facturasService.ts)

Agregar funciones:
```typescript
// Preview del 606
get606Preview(rnc: string, periodo: string): Promise<Formato606Preview>

// Validar sin generar
validate606(rnc: string, periodo: string): Promise<{errores: string[], advertencias: string[]}>

// Generar y descargar TXT
generate606TXT(rnc: string, periodo: string): Promise<string> // retorna path local del archivo

// Actualizar aplica_606 de una factura
toggleAplica606(facturaId: string, aplica606: boolean): Promise<Invoice>

// Historial de envíos
getHistorial606(rnc: string): Promise<Envio606[]>

// Registrar referencia OFV
registrarReferenciaOFV(envioId: string, referencia: string): Promise<Envio606>
```

---

## WAVE 5: Clasificacion Inteligente — mapeo robusto + forma_pago

**Depende de Wave 2. Se puede ejecutar en paralelo con Wave 4.**

### Tarea 5.1: Mapeo automatico forma_pago → codigo DGII

Actualmente forma_pago se guarda como texto libre. Agregar función de normalización en `api/handler.go`:

```go
// NormalizeFormaPago convierte texto libre a código DGII 01-07
func NormalizeFormaPago(raw string) int {
    lower := strings.ToLower(strings.TrimSpace(raw))
    switch {
    case strings.Contains(lower, "efectivo") || lower == "cash":
        return 1
    case strings.Contains(lower, "transferencia") ||
         strings.Contains(lower, "cheque") ||
         strings.Contains(lower, "deposito") ||
         strings.Contains(lower, "depósito") ||
         strings.Contains(lower, "ach"):
        return 2
    case strings.Contains(lower, "tarjeta") ||
         strings.Contains(lower, "visa") ||
         strings.Contains(lower, "mastercard") ||
         strings.Contains(lower, "débito") ||
         strings.Contains(lower, "debito") ||
         lower == "tarjeta banco":
        return 3
    case (strings.Contains(lower, "crédito") || strings.Contains(lower, "credito")) &&
         !strings.Contains(lower, "nota") &&
         !strings.Contains(lower, "tarjeta"):
        return 4
    case strings.Contains(lower, "permuta") || strings.Contains(lower, "intercambio"):
        return 5
    case strings.Contains(lower, "nota") &&
         (strings.Contains(lower, "crédito") || strings.Contains(lower, "credito")):
        return 6
    case strings.Contains(lower, "mixto") || strings.Contains(lower, "combinado"):
        return 7
    default:
        return 2 // Transferencia como fallback conservador (más común en RD empresarial)
    }
}
```

Aplicar normalización: en el INSERT de ProcessInvoice y al generar el TXT (doble seguridad).

### Tarea 5.2: Clasificación tipo_bien_servicio por keywords — función Go

```go
// ClassifyTipoBienServicio usa keywords del concepto/descripción para determinar el tipo DGII
// Basado en datos reales GASTOS.xlsx de HUYGHU (incluye variaciones de typos reales)
// Escribe el resultado en la columna tipo_bien_servicio (columna existente en BD)
func ClassifyTipoBienServicio(concepto string) int {
    lower := strings.ToLower(strings.TrimSpace(concepto))

    // Seguros (alta especificidad, ir primero)
    if matchAny(lower, []string{"seguro", "poliza", "póliza", "prima seguro", "aseguradora"}) {
        return 11
    }
    // Arrendamientos
    if matchAny(lower, []string{"alquiler", "arrendamiento", "renta local", "renta oficina", "gto alquiler"}) {
        return 3
    }
    // Representación (antes de servicios para evitar falsos positivos con "viaje")
    if matchAny(lower, []string{
        "restaurante", "comida", "bebida", "cena", "almuerzo", "desayuno",
        "hotel", "hospedaje", "hostal", "airbnb",
        "viaje", "gto viaje", "representacion", "gto representacion",
        "gto viaje comida", "gto viaje coida", "gto viaje hospedaje",
    }) {
        return 5
    }
    // Activos Fijo / Mantenimiento
    if matchAny(lower, []string{
        "mantenimiento", "reparacion", "reparación", "plomeria", "plomería",
        "electricidad", "electrico", "gto mantenimiento", "activo fijo",
    }) {
        return 4
    }
    // Trabajos y Servicios (amplio)
    if matchAny(lower, []string{
        "telecomunicacion", "telecomunicaciones", "telefono", "teléfono",
        "internet", "cable", "tv por cable", "claro", "altice",
        "mensajeria", "mensajería", "courier", "envio", "envío",
        "gto envio", "gto telecomunicaciones",
        "combustible", "gasolina", "diesel", "gasolinera",
        "gto viaje combustible", "servicio", "trabajo",
    }) {
        return 2
    }
    // Personal
    if matchAny(lower, []string{"nomina", "nómina", "salario", "sueldo", "bono empleado", "personal"}) {
        return 1
    }
    // Gastos Financieros
    if matchAny(lower, []string{"interes", "interés", "comision bancaria", "comisión bancaria", "cargo bancario"}) {
        return 7
    }
    // Costo de Venta
    if matchAny(lower, []string{"mercancia", "mercancía", "inventario", "costo venta", "materia prima"}) {
        return 9
    }
    // Adquisición de Activos
    if matchAny(lower, []string{"compra equipo", "vehiculo", "vehículo", "mobiliario", "mueble", "inmueble"}) {
        return 10
    }
    // Gastos de Oficina / Otras Deducciones (fallback específico)
    if matchAny(lower, []string{"papeleria", "papelería", "oficina", "gto oficina", "material oficina"}) {
        return 6
    }

    // Fallback general: Otras Deducciones Admitidas
    return 6
}

func matchAny(text string, keywords []string) bool {
    for _, kw := range keywords {
        if strings.Contains(text, kw) {
            return true
        }
    }
    return false
}
```

### Tarea 5.3: Endpoint para reclasificar facturas en batch

POST `/api/formato-606/:rnc_receptor/reclasificar`

Body: `{"periodo": "202601"}`

Lógica:
1. Tomar todas las facturas del periodo donde `tipo_bien_servicio IS NULL`
2. Por cada una: aplicar `ClassifyTipoBienServicio(concepto)`
3. Actualizar `tipo_bien_servicio` en BD
4. Retornar: `{"actualizadas": N, "sin_clasificar": 0}` (con la función de fallback siempre hay un valor)

Permite un "clasificar todo" antes de generar el TXT.

---

## WAVE 6: Testing con datos reales + validacion cruzada

**Depende de Waves 3, 4 y 5.**

### Tarea 6.1: Cargar datos de prueba (seed HUYGHU enero 2026)

Usar los 44 registros del Excel GASTOS como datos seed:
- Script SQL o Go que lea el Excel y popule `facturas_clientes`
- Datos fuente: `/home/gestoria/investigacion-606/GASTOS-ENERO-26-Facturia.xlsx`
- Incluir todos los campos de Waves 1 y 2
- Asegurarse de que todos los 44 registros tienen `aplica_606 = true` (son todos B01/E31)

### Tarea 6.2: Test de validacion cruzada TXT — datos HUYGHU

Comparar TXT generado por FacturaIA vs TXT real enviado a DGII:

```bash
# Generar TXT con seed HUYGHU
curl "localhost:8081/api/formato-606/131047939?periodo=202601" > /tmp/facturaia_606.txt

# Comparar con TXT real
diff /home/gestoria/investigacion-606/DGII_F_606_131047939_202601.TXT /tmp/facturaia_606.txt
```

Criterios de aceptación:
- Mismo número de registros: **44** (los 44 con aplica_606=true)
- Los 44 NCFs son B01 (21) o E31 (23) — CERO B02/E32 en el TXT generado
- Mismos RNC en cada línea (orden puede variar)
- Mismos NCF
- Montos dentro de ±0.01 de tolerancia
- ITBIS Facturado total: **$33,330.67**
- ITBIS por Adelantar total: **$33,330.67**
- Total Monto Facturado: **$211,362.72**
- Cabecera correcta: `606|131047939|202601|44`
- Los campos nulos generan pipes vacíos (no "0" ni "null")

Script de validación campo a campo: comparar línea por línea, reportar diferencias específicas.

### Tarea 6.3: Test flujo completo app (QA manual)

1. Abrir app → escanear factura de prueba (imagen de factura B01 real)
2. Verificar que extrae `tipo_bien_servicio` automáticamente y `aplica_606 = true`
3. Probar con factura B02: verificar `aplica_606 = false` automático
4. Ir a "Formato 606" → seleccionar periodo 202601
5. Ver preview → revisar totales match con referencia
6. Botón "Validar" → verificar sin errores rojos
7. Botón "Generar TXT" → verificar que se descarga con nombre correcto
8. Botón "Compartir" → verificar que el archivo se puede abrir y tiene formato pipe-delimited
9. Ingresar referencia OFV de prueba → verificar que se guarda en `envios_606`
10. Ver historial en History606Screen → verificar aparece el envío con estatus correcto

### Tarea 6.4: Test de clasificacion automatica

Verificar que `ClassifyTipoBienServicio` clasifica correctamente los 9 conceptos del GASTOS.xlsx de HUYGHU:
- "GTO ALQUILER LOCAL" → 03 ✓
- "GTO VIAJE COMIDA" → 05 ✓
- "GTO VIAJE COIDA" (typo real) → 05 ✓
- "GTO VIAJE HOSPEDAJE" → 05 ✓
- "GTO VIAJE COMBUSTIBLE" → 02 ✓
- "GTO MANTENIMIENTO LOCAL" → 04 ✓
- "GTO TELECOMUNICACIONES" → 02 ✓
- "GTO ENVIO" → 02 ✓
- "GTO REPRESENTACION" → 05 ✓
- "GTO OFICINA" → 06 ✓
- "GTO VIAJE" (genérico) → 05 ✓

---

## RESUMEN DE ENTREGABLES

| Wave | Entregable | Dependencia | Paralelo con |
|------|-----------|-------------|--------------|
| 1 | Columnas BD + aplica_606 + periodo_606 + envios_606 + codigos + backfill (delegado a migration-606-unificada.sql) | Ninguna | Wave 2 |
| 2 | Auto-tag NCF (cliente) + Prompt IA + modelo Go + queries actualizadas (tipo_ncf, tipo_bien_servicio, isr) | Ninguna | Wave 1 |
| 3 | Endpoints: generate / preview / validate / toggle-aplica606 / referencia-OFV | Wave 1 + 2 | — |
| 4 | UI: InvoiceReview mejorado + Generate606Screen + History606Screen + HomeScreen badge | Wave 3 | Wave 5 |
| 5 | Clasificación tipo_bien_servicio robusta + forma_pago + endpoint reclasificar batch | Wave 2 | Wave 4 |
| 6 | Testing con datos reales HUYGHU + validación cruzada TXT + QA manual app | Wave 3 + 4 + 5 | — |

---

## ARCHIVOS A MODIFICAR

### Backend Go (~/factory/apps/facturaia-ocr/)
- `api/handler.go` — endpoints 606 (generate/preview/validate/toggle/referencia) + auto-tag NCF + ClassifyTipoBienServicio + NormalizeFormaPago + queries con `aplica_606`
- `internal/ai/extractor.go` — prompt mejorado con tipo_bien_servicio + campos 606 + reglas de clasificación
- `internal/models/invoice.go` — struct con nuevos campos (aplica_606, tipo_ncf, tipo_bien_servicio, isr, ISC, CDT, propina, etc.)
- `internal/db/client_invoices.go` — INSERT/SELECT con todos los campos de Wave 1

### App Móvil (~/eas-builds/FacturaScannerApp/)
- `src/screens/InvoiceReviewScreen.tsx` — selector tipo_bien_servicio + badge aplica_606 + toggle manual + campos ISC/CDT/Propina
- `src/screens/Generate606Screen.tsx` — NUEVA: pantalla principal del flujo 606
- `src/screens/History606Screen.tsx` — NUEVA: historial de envíos con referencia OFV
- `src/screens/HomeScreen.tsx` — badge "X facturas → 606" para el mes actual
- `src/services/facturasService.ts` — nuevos endpoints 606 (preview, validate, generate, toggle, historial, referencia)
- `src/types/invoice.ts` — tipos actualizados (Invoice con tipo_bien_servicio/tipo_ncf/isr, Formato606Preview, Formato606Detalle, Envio606)

### Base de Datos
- Migration SQL: USAR `~/factory/apps/gestoriard/plans/migration-606-unificada.sql` — contiene todas las definiciones de BD para ambos proyectos. Wave 1 de este plan solo ejecuta la migration unificada.

### Scraper (futuro v2 — NO en este plan)
- `~/dgii-scraper-v2/` — Upload TXT a OFV via Playwright (experimental, fuera del alcance de v1)

---

## DATOS DE REFERENCIA

Los archivos de referencia están en `/home/gestoria/investigacion-606/`:
- `DGII_F_606_131047939_202601.TXT` — TXT real enviado a DGII (44 registros — REFERENCIA DE ORO)
- `GASTOS-ENERO-26-Facturia.xlsx` — Excel GASTOS fuente (44 filas — datos de prueba)
- `ENERO-2026-Formato-Envio-606.xls` — Herramienta 606 llena
- `Formato-Envio-606-TEMPLATE.xls` — Herramienta 606 vacía (referencia de columnas)
- `OFV-Consultar-Envios-ENERO.pdf` — Captura OFV con resumen de envío confirmado (referencia_dgii real)
