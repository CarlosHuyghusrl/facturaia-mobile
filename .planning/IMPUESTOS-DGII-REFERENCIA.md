# Impuestos DGII - Documento de Referencia Tecnica
## FacturaIA — Mapeo Completo para Facturas Dominicanas

**Version:** 1.0.0
**Fecha:** 11-Feb-2026
**Proyecto:** FacturaIA (~/eas-builds/FacturaScannerApp)

---

## 1. Esquema PostgreSQL — Tabla `invoices`

### 1.1 Campos Existentes

```sql
CREATE TABLE invoices (
    -- ============================================
    -- IDENTIFICACION
    -- ============================================
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enterprise_id       UUID NOT NULL,          -- Firma contable
    client_id           UUID NOT NULL,          -- Cliente de la firma

    -- ============================================
    -- COMPROBANTE FISCAL (NCF / e-CF)
    -- ============================================
    ncf                 VARCHAR(13) NOT NULL,   -- B0100000001 (11) o E310000000001 (13)
    ncf_type            VARCHAR(3),             -- B01, B02, B04, B14, B15, B16, B17, E31...
    ncf_modified        VARCHAR(13),            -- NCF afectado por nota credito/debito

    -- ============================================
    -- DATOS DEL PROVEEDOR
    -- ============================================
    supplier_rnc        VARCHAR(11),            -- RNC o Cedula del proveedor
    supplier_name       VARCHAR(200),           -- Razon social
    supplier_id_type    SMALLINT,               -- 1=RNC, 2=Cedula, 3=Pasaporte

    -- ============================================
    -- FECHAS
    -- ============================================
    invoice_date        DATE NOT NULL,          -- Fecha del comprobante
    payment_date        DATE,                   -- Fecha de pago (requerida si hay retenciones)

    -- ============================================
    -- CLASIFICACION GASTO (606)
    -- ============================================
    expense_type        SMALLINT,               -- Codigos 1-11:
    /*
        01 = Gastos de personal
        02 = Gastos por trabajo, suministros y servicios
        03 = Arrendamientos
        04 = Gastos de activos fijos
        05 = Gastos de representacion
        06 = Otras deducciones admitidas
        07 = Gastos financieros
        08 = Gastos extraordinarios
        09 = Compras y gastos que forman parte del costo de venta
        10 = Adquisicion de activos
        11 = Gastos de seguros
    */

    -- ============================================
    -- MONTOS BASE (sin impuestos)
    -- ============================================
    monto_servicios         DECIMAL(15,2) DEFAULT 0,
    monto_bienes            DECIMAL(15,2) DEFAULT 0,
    monto_facturado         DECIMAL(15,2) GENERATED ALWAYS AS
                            (monto_servicios + monto_bienes - descuento) STORED,

    -- ============================================
    -- ITBIS (18%)
    -- ============================================
    itbis_facturado             DECIMAL(15,2) DEFAULT 0,    -- ITBIS total en factura
    itbis_retenido              DECIMAL(15,2) DEFAULT 0,    -- ITBIS que retenemos (606)
    itbis_retenido_terceros     DECIMAL(15,2) DEFAULT 0,    -- ITBIS que nos retienen (607)
    itbis_proporcionalidad      DECIMAL(15,2) DEFAULT 0,    -- Art. 349
    itbis_costo                 DECIMAL(15,2) DEFAULT 0,    -- ITBIS no deducible
    itbis_por_adelantar         DECIMAL(15,2) GENERATED ALWAYS AS
                                (itbis_facturado - itbis_costo) STORED,
    itbis_percibido             DECIMAL(15,2) DEFAULT 0,    -- Campo futuro DGII

    -- ============================================
    -- ISR (Retenciones)
    -- ============================================
    retencion_isr_tipo      SMALLINT,           -- Codigos 1-8:
    /*
        1 = Alquileres (10%)
        2 = Honorarios por servicios (10%)
        3 = Otras rentas (10%)
        4 = Otras rentas/presuntas (2%)
        5 = Intereses pagados a PJ residentes (10%)
        6 = Intereses pagados a PF residentes (10%)
        7 = Retencion proveedores del Estado (5%)
        8 = Juegos telefonicos (10%)
    */
    retencion_isr_monto     DECIMAL(15,2) DEFAULT 0,
    isr_percibido           DECIMAL(15,2) DEFAULT 0,    -- Campo futuro DGII

    -- ============================================
    -- ISC (Impuesto Selectivo al Consumo)
    -- ============================================
    isc_monto               DECIMAL(15,2) DEFAULT 0,
    isc_categoria           VARCHAR(30),        -- telecom, seguros, alcohol, tabaco, vehiculos, hidrocarburos, otros

    -- ============================================
    -- OTROS IMPUESTOS Y CARGOS
    -- ============================================
    cdt_monto               DECIMAL(15,2) DEFAULT 0,    -- Contribucion Desarrollo Telecom (2%)
    cargo_911               DECIMAL(15,2) DEFAULT 0,    -- Contribucion al 911
    propina_legal           DECIMAL(15,2) DEFAULT 0,    -- Propina legal 10%
    otros_impuestos         DECIMAL(15,2) DEFAULT 0,    -- Catch-all
    otros_impuestos_detalle VARCHAR(200),

    -- ============================================
    -- TOTALES (calculados)
    -- ============================================
    total_impuestos     DECIMAL(15,2) GENERATED ALWAYS AS (
                        itbis_facturado + isc_monto + cdt_monto +
                        cargo_911 + otros_impuestos) STORED,
    total_factura       DECIMAL(15,2) DEFAULT 0,
    total_a_pagar       DECIMAL(15,2) GENERATED ALWAYS AS (
                        total_factura - itbis_retenido - retencion_isr_monto) STORED,

    -- ============================================
    -- FORMA DE PAGO (7 campos)
    -- ============================================
    pago_efectivo               DECIMAL(15,2) DEFAULT 0,
    pago_cheque_transferencia   DECIMAL(15,2) DEFAULT 0,
    pago_tarjeta_debito_credito DECIMAL(15,2) DEFAULT 0,
    pago_venta_credito          DECIMAL(15,2) DEFAULT 0,
    pago_bonos_certificados     DECIMAL(15,2) DEFAULT 0,
    pago_permuta                DECIMAL(15,2) DEFAULT 0,
    pago_otras_formas           DECIMAL(15,2) DEFAULT 0,

    -- ============================================
    -- OCR/IA
    -- ============================================
    ocr_confidence      DECIMAL(5,4),           -- 0.0000-1.0000
    ocr_raw_text        TEXT,
    ai_model_used       VARCHAR(50),            -- claude-opus-4-5, gemini-2.5-flash
    extraction_status   VARCHAR(20) DEFAULT 'pending',
    needs_review        BOOLEAN DEFAULT FALSE,
    review_notes        TEXT,

    -- ============================================
    -- IMAGEN
    -- ============================================
    image_url           TEXT,
    image_thumbnail_url TEXT,

    -- ============================================
    -- AUDITORIA
    -- ============================================
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    created_by          UUID,

    -- ============================================
    -- CAMPOS NUEVOS (4)
    -- ============================================
    descuento               DECIMAL(15,2) DEFAULT 0,    -- Afecta base imponible ITBIS
    itbis_exento            DECIMAL(15,2) DEFAULT 0,    -- Bienes/servicios exentos (IT-1 casilla 4)
    monto_no_facturable     DECIMAL(15,2) DEFAULT 0,    -- Propinas voluntarias, reembolsos
    ncf_vencimiento         DATE,                        -- Fecha limite NCF

    -- ============================================
    -- CONSTRAINTS
    -- ============================================
    CONSTRAINT valid_ncf CHECK (ncf ~ '^[BE][0-9]{10,12}$'),
    CONSTRAINT valid_amounts CHECK (
        monto_servicios >= 0 AND
        monto_bienes >= 0 AND
        itbis_facturado >= 0 AND
        isc_monto >= 0 AND
        propina_legal >= 0 AND
        descuento >= 0
    ),
    CONSTRAINT valid_payment_for_retention CHECK (
        (itbis_retenido = 0 AND retencion_isr_monto = 0) OR
        payment_date IS NOT NULL
    )
);
```

### 1.2 Indices

```sql
CREATE INDEX idx_invoices_enterprise_period ON invoices(enterprise_id, invoice_date);
CREATE INDEX idx_invoices_ncf ON invoices(ncf);
CREATE INDEX idx_invoices_supplier ON invoices(supplier_rnc);
CREATE INDEX idx_invoices_extraction_status ON invoices(extraction_status);
CREATE INDEX idx_invoices_created_at ON invoices(created_at DESC);
```

---

## 2. Tipos NCF Completos

### 2.1 NCF Tradicionales (Serie B)

| Tipo | Descripcion | Uso |
|:----:|-------------|-----|
| B01 | Factura de Credito Fiscal | Compras entre contribuyentes |
| B02 | Factura de Consumo | Ventas a consumidor final |
| B04 | Nota de Credito | Devolucion, descuento, correccion |
| B14 | Regimen Especial de Tributacion | Zonas francas, exentos |
| B15 | Gubernamental | Ventas al Estado |
| B16 | Exportaciones | Ventas al exterior |
| B17 | Compras Informales | Proveedores sin RNC |

### 2.2 e-CF Electronicos (Serie E)

| Tipo | Equivalente | Descripcion |
|:----:|:-----------:|-------------|
| E31 | B01 | e-Factura Credito Fiscal |
| E32 | B02 | e-Factura Consumo |
| E34 | B04 | e-Nota de Credito |
| E41 | B14 | e-Regimen Especial |
| E43 | — | e-Nota de Debito |
| E44 | B15 | e-Gubernamental |
| E45 | B16 | e-Exportacion |
| E46 | — | e-Compras |
| E47 | B17 | e-Gastos Menores |

---

## 3. Tasas de Impuestos Vigentes

| Impuesto | Tasa | Aplica a |
|----------|:----:|----------|
| **ITBIS** | 18% | Bienes y servicios gravados |
| **ISC Telecom** | 10% | Telefonia, internet, telecable |
| **ISC Seguros** | 16% | Polizas de seguro |
| **CDT** | 2% | Telecomunicaciones |
| **Propina Legal** | 10% | Restaurantes, hoteles, bares |
| **Ret. ITBIS Servicios** | 30% | Sociedad a sociedad |
| **Ret. ITBIS Total** | 100% | Seguridad, proveedores informales |
| **Ret. ITBIS Tarjetas** | 2% | Adquirencias |
| **Ret. ISR Honorarios** | 10% | Servicios profesionales |
| **Ret. ISR Tecnicos** | 2% | Servicios tecnicos |
| **Ret. ISR Estado** | 5% | Proveedores del Estado |

---

## 4. Mapeo Formato 606 (Compras) — 23 Columnas

| # | Campo 606 | Campo PostgreSQL | Tipo |
|:-:|-----------|------------------|------|
| 1 | RNC/Cedula Proveedor | `supplier_rnc` | VARCHAR(11) |
| 2 | Tipo Identificacion | `supplier_id_type` | SMALLINT |
| 3 | Tipo Bienes/Servicios | `expense_type` | SMALLINT |
| 4 | NCF/e-CF | `ncf` | VARCHAR(13) |
| 5 | NCF Modificado | `ncf_modified` | VARCHAR(13) |
| 6 | Fecha Comprobante | `invoice_date` | DATE |
| 7 | Fecha Pago | `payment_date` | DATE |
| 8 | Monto Servicios | `monto_servicios` | DECIMAL |
| 9 | Monto Bienes | `monto_bienes` | DECIMAL |
| 10 | Monto Facturado | `monto_facturado` | DECIMAL |
| 11 | ITBIS Facturado | `itbis_facturado` | DECIMAL |
| 12 | ITBIS Retenido | `itbis_retenido` | DECIMAL |
| 13 | ITBIS Proporcionalidad | `itbis_proporcionalidad` | DECIMAL |
| 14 | ITBIS al Costo | `itbis_costo` | DECIMAL |
| 15 | ITBIS por Adelantar | `itbis_por_adelantar` | DECIMAL |
| 16 | ITBIS Percibido | `itbis_percibido` | DECIMAL |
| 17 | Tipo Retencion ISR | `retencion_isr_tipo` | SMALLINT |
| 18 | Monto Retencion Renta | `retencion_isr_monto` | DECIMAL |
| 19 | ISR Percibido | `isr_percibido` | DECIMAL |
| 20 | ISC | `isc_monto` | DECIMAL |
| 21 | Otros Impuestos/Tasas | `otros_impuestos + cdt_monto + cargo_911` | DECIMAL |
| 22 | Monto Propina Legal | `propina_legal` | DECIMAL |
| 23 | Forma de Pago | `pago_*` (7 campos) | Codigos 01-07 |

---

## 5. Mapeo Formato 607 (Ventas)

| Campo 607 | Campo PostgreSQL |
|-----------|------------------|
| ITBIS Facturado | `itbis_facturado` |
| ITBIS Retenido por Terceros | `itbis_retenido_terceros` |
| ITBIS Percibido | `itbis_percibido` |
| Retencion Renta por Terceros | `retencion_isr_monto` |
| ISR Percibido | `isr_percibido` |
| ISC | `isc_monto` |
| Otros Impuestos/Tasas | `otros_impuestos` |
| Monto Propina Legal | `propina_legal` |
| Monto Exento | `itbis_exento` |

---

## 6. Patrones OCR por Tipo de Factura

### 6.1 Factura Estandar (Comercio/Servicios)
```
Patrones:
- "ITBIS" / "18%" / "IVA" → itbis_facturado
- "Subtotal" / "Sub-total" → monto_facturado
- "Descuento" / "Desc." / "(-)" → descuento
- "Total" / "TOTAL A PAGAR" → total_factura
- "NCF:" / "No. Comprobante" → ncf
- "RNC:" / "R.N.C." → supplier_rnc
```

### 6.2 Factura Restaurante/Hotel
```
Patrones adicionales:
- "Propina" / "PROPINA" / "Propina Legal" / "10%" / "Tip" → propina_legal
- Propina se calcula sobre subtotal SIN impuestos
- Orden: Subtotal → ITBIS → Propina → Total
```

### 6.3 Factura Telecomunicaciones
```
Patrones:
- "ISC" / "Selectivo" / "Imp. Selectivo" → isc_monto (10%)
- "CDT" / "Contribucion" → cdt_monto (2%)
- "911" / "Cargo 911" → cargo_911
- Total impuestos telecom = ITBIS(18%) + ISC(10%) + CDT(2%) = 30%
```

### 6.4 Factura Seguros
```
Patrones:
- "ISC" / "Selectivo" → isc_monto (16%)
- "Prima" / "Prima Neta" → base imponible
- Seguros Seguridad Social exentos de ISC
```

### 6.5 Factura con Retenciones
```
Patrones:
- "Ret. ITBIS" / "Retencion ITBIS" → itbis_retenido
- "Ret. ISR" / "Retencion Renta" → retencion_isr_monto
- "Neto a Pagar" → total_a_pagar
```

### 6.6 Factura Combustibles
```
Patrones especiales:
- Combustibles EXENTOS de ITBIS (tienen ISC propio)
- "ISC" como impuesto especifico por galon
- NO buscar ITBIS en facturas de combustible
- NCF tipo B04 comun en gasolineras
```

---

## 7. Prompt Extraccion IA (Claude/Gemini)

```json
{
  "instruction": "Analiza esta factura dominicana y extrae los campos en JSON:",
  "schema": {
    "ncf": "string — NCF completo (11 o 13 caracteres)",
    "ncf_type": "string — B01, B02, E31, etc.",
    "ncf_vencimiento": "string|null — Fecha vencimiento YYYY-MM-DD",
    "supplier_rnc": "string — RNC o Cedula emisor",
    "supplier_name": "string — Nombre emisor",
    "invoice_date": "string — YYYY-MM-DD",

    "monto_servicios": "number — Subtotal servicios SIN impuestos",
    "monto_bienes": "number — Subtotal bienes SIN impuestos",
    "descuento": "number — Descuento aplicado (default 0)",

    "itbis_facturado": "number — ITBIS total (18%)",
    "itbis_exento": "number — Monto exento de ITBIS (default 0)",
    "isc_monto": "number — ISC si existe",
    "isc_categoria": "string — telecom|seguros|alcohol|tabaco|vehiculos|hidrocarburos|otros",
    "cdt_monto": "number — CDT 2% telecom",
    "cargo_911": "number — Contribucion 911",
    "propina_legal": "number — Propina 10%",
    "otros_impuestos": "number — Otros no clasificados",
    "otros_impuestos_detalle": "string — Descripcion",
    "monto_no_facturable": "number — Propinas voluntarias, reembolsos",

    "itbis_retenido": "number — ITBIS retenido al proveedor",
    "retencion_isr_tipo": "number — Codigo 1-8",
    "retencion_isr_monto": "number — ISR retenido",

    "total_factura": "number — Total general",

    "forma_pago": "string — efectivo|cheque|tarjeta|credito|bonos|permuta|otra",
    "confidence": "number — 0.0-1.0"
  },
  "rules": [
    "1. monto_servicios y monto_bienes son SIN impuestos",
    "2. ITBIS dominicano = 18%",
    "3. En telecom separar ITBIS, ISC, CDT",
    "4. Propina legal (10%) independiente del ITBIS",
    "5. Combustibles exentos de ITBIS",
    "6. Si campo no existe, usar 0 para numeros, null para strings",
    "7. Validar: (monto_servicios + monto_bienes - descuento) ≈ base ITBIS",
    "8. descuento reduce la base imponible del ITBIS"
  ]
}
```

---

## 8. Resumen de Campos Nuevos

| Campo | Tipo | Default | Prioridad | Uso |
|-------|------|---------|:---------:|-----|
| `descuento` | DECIMAL(15,2) | 0 | ALTA | Afecta base imponible ITBIS |
| `itbis_exento` | DECIMAL(15,2) | 0 | ALTA | IT-1 casilla 4, bienes exentos |
| `monto_no_facturable` | DECIMAL(15,2) | 0 | MEDIA | No entra en 606/607 |
| `ncf_vencimiento` | DATE | NULL | BAJA | Validacion NCF |

---

*Documento generado para FacturaIA — 11-Feb-2026*
*Fuentes: DGII, Codigo Tributario (Ley 11-92), Norma General 07-2018*
