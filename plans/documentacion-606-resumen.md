# Documentacion 606 — Resumen para Equipo FacturaIA

**Fecha**: 2026-03-03
**Generado por**: Arquitecto (sesion de planificacion)

---

## Que se hizo

En esta sesion de planificacion se investigaron, cruzaron y alinearon dos planes independientes para implementar el Formato 606 DGII: Plan-005 (lado FacturaIA/Go) y Plan-006 (lado GestoriaRD/Next.js). Ambos planes operan sobre la misma base de datos PostgreSQL en Supabase (217.216.48.91:8100), por lo que cualquier inconsistencia en naming o datos se propaga a ambos lados. Se verifico el estado real de la BD con `docker exec`, se identificaron 9 conflictos entre los planes, y se genero una migration SQL unificada que debe ejecutarse una sola vez antes de comenzar cualquier wave de codigo. Los planes fueron corregidos para quedar alineados antes de la ejecucion.

---

## Archivos creados/modificados

| Archivo | Ubicacion (path completo) | Descripcion |
|---------|--------------------------|-------------|
| Plan-005 (corregido) | `/home/gestoria/eas-builds/FacturaScannerApp/plans/plan-005-formato-606.md` | Plan de FacturaIA: 6 waves, Go + React Native. Estado: CORREGIDO, naming unificado, migrations delegadas |
| Plan-006 | `/home/gestoria/factory/apps/gestoriard/plans/plan-006-gestoriard-606.md` | Plan de GestoriaRD: 5 waves, Next.js + Supabase. Adopta codigos fiscales de Plan-005 |
| Cruce 005 vs 006 | `/home/gestoria/factory/apps/gestoriard/plans/cruce-005-vs-006.md` | Analisis comparativo: 9 conflictos identificados, decisiones, flujo definitivo, orden de ejecucion |
| Migration unificada | `/home/gestoria/factory/apps/gestoriard/plans/migration-606-unificada.sql` | SQL unico para ambos proyectos: 7 partes, debe ejecutarse UNA SOLA VEZ antes de las waves |

---

## Hallazgos clave sobre facturas_clientes

La tabla `facturas_clientes` ya tiene **20 de 23 campos** necesarios para generar el TXT 606.

**Solo faltan estas 5 columnas** (las crea la migration):
- `aplica_606` BOOLEAN DEFAULT false — auto-calculado por trigger
- `periodo_606` VARCHAR(6) — YYYYMM, auto-calculado por trigger
- `itbis_percibido` NUMERIC(12,2) — campo 16 del TXT
- `isr_percibido` NUMERIC(12,2) — campo 19 del TXT
- `itbis_adelantar` NUMERIC(12,2) — campo 15 del TXT

**Naming unificado — usar estos nombres exactos en el codigo Go:**

| Campo DGII | Columna correcta en BD | Lo que Plan-005 tenia mal |
|-----------|----------------------|--------------------------|
| Campo 3: Tipo Bienes/Servicios | `tipo_bien_servicio` | `expense_type` (NO existe, NO crear) |
| Campo 4: NCF prefijo | `tipo_ncf` | `ncf_tipo` (NO existe, NO crear) |
| Campo 18: Retencion ISR | `isr` | `retencion_isr_monto` (NO existe, NO crear) |

---

## 9 Conflictos resueltos (resumen del cruce)

| # | Aspecto | Plan-005 | Plan-006 | Quién tiene razon | Accion tomada |
|---|---------|----------|----------|-------------------|---------------|
| 1 | Columnas BD existentes | NO verifico la BD real | SI verifico con docker exec | Plan-006 | Plan-005 limpio migrations — no re-crea columnas existentes |
| 2 | expense_type vs tipo_bien_servicio | Creaba columna nueva `expense_type` | Usaba columna existente `tipo_bien_servicio` | Plan-006 | Plan-005 cambia a `tipo_bien_servicio` |
| 3 | ncf_tipo vs tipo_ncf | Creaba columna nueva `ncf_tipo VARCHAR(3)` | Usaba columna existente `tipo_ncf VARCHAR(10)` | Plan-006 | Plan-005 cambia a `tipo_ncf` |
| 4 | retencion_isr_monto vs isr | Creaba columna nueva | Usaba columna existente `isr` | Plan-006 | Plan-005 cambia a `isr` |
| 5 | Codigos NCF aplica_606 | 19 prefijos correctos (B01-E47) | 8 entradas con errores (E35, E37 no existen; B14 invertido) | Plan-005 | Plan-006 adopta tabla `dgii_ncf_tipos` de Plan-005 |
| 6 | Tipo Bienes/Servicios 01-11 | 11 codigos correctos segun Norma General 07-2018 | 10 codigos, codigos 07-10 incorrectos | Plan-005 | Plan-006 adopta 11 codigos de Plan-005 |
| 7 | Schema envios_606 | Sin empresa_id, con totales desglosados | Con empresa_id, sin totales desglosados | Ambos aportan | Schema unificado en migration (combina empresa_id + totales + re-envios) |
| 8 | Trigger vs Go auto-tag | AutoTagNCF() en Go (solo cubre path Go) | Trigger PostgreSQL (cubre todos los INSERT/UPDATE) | Plan-006 | Plan-005 elimina AutoTagNCF(), confia en trigger |
| 9 | Forma de pago 07=Mixto | 7 codigos completos (incluye Mixto) | 6 codigos (omite 07=Mixto) | Plan-005 | Plan-006 agrega 07=Mixto |

**Score final**: Plan-005 tiene razon en 5 conflictos (datos fiscales/catalogos DGII). Plan-006 tiene razon en 4 conflictos (estructura BD). 1 schema unificado.

---

## Migracion unificada (migration-606-unificada.sql)

Archivo: `/home/gestoria/factory/apps/gestoriard/plans/migration-606-unificada.sql`

**IMPORTANTE: Esta migration NO se ha ejecutado aun. Requiere aprobacion de Carlos.**

Las 7 partes en orden de dependencia:

| Parte | Contenido | Detalle |
|-------|-----------|---------|
| PARTE 1 | Nuevas columnas en `facturas_clientes` | 5 columnas: aplica_606, periodo_606, itbis_adelantar, itbis_percibido, isr_percibido. Mas 2 indices. |
| PARTE 2 | Tabla `dgii_ncf_tipos` | 19 prefijos NCF con aplica_606 correcto (fuente: Plan-005, verificado contra DGII oficial) |
| PARTE 3 | Tabla `dgii_606_codigos` | Catalogos: 11 tipos de bienes/servicios con keywords, 7 formas de pago (fuente: Norma General 07-2018) |
| PARTE 4 | Tabla `envios_606` | Schema unificado: empresa_id (FK a clientes) + totales desglosados + permite re-envios (UNIQUE rnc+periodo+fecha) |
| PARTE 5 | Trigger `auto_tag_factura_606` | AFTER INSERT OR UPDATE OF tipo_ncf — consulta dgii_ncf_tipos, setea aplica_606 y periodo_606 automaticamente |
| PARTE 6 | Backfill | Aplica el trigger a todos los registros existentes en facturas_clientes |
| PARTE 7 | Verificacion | Queries de comprobacion: cuenta columnas nuevas, registros en tablas, trigger activo |

---

## Que debe hacer FacturaIA

**1. Usar los nombres de campo correctos en Go**

En los structs y en los INSERT, usar exactamente estos nombres:

```go
// CORRECTO
TipoBienServicio string `db:"tipo_bien_servicio"`  // Campo 3 — codigos 01-11
TipoNCF          string `db:"tipo_ncf"`             // Campo 4 — B01, E31, etc.
ISR              float64 `db:"isr"`                 // Campo 18 — Retencion ISR

// MAL — estas columnas NO existen en la BD:
// expense_type, ncf_tipo, retencion_isr_monto
```

**2. La migration SQL la ejecuta GestoriaRD**

La BD es compartida. GestoriaRD ejecuta `migration-606-unificada.sql` una sola vez. FacturaIA no necesita correr ninguna migration.

**3. El trigger auto_tag_factura_606 hace el trabajo pesado**

Cuando Go hace un INSERT en `facturas_clientes` con `tipo_ncf = 'B01'`, el trigger automaticamente:
- Consulta `dgii_ncf_tipos` donde prefijo = LEFT(tipo_ncf, 3)
- Setea `aplica_606 = true` (o false segun el NCF)
- Setea `periodo_606 = TO_CHAR(fecha_documento, 'YYYYMM')`

FacturaIA no necesita calcular aplica_606 ni periodo_606.

**4. FacturaIA solo necesita escribir estos campos del TXT 606**

El trigger calcula aplica_606 y periodo_606 automaticamente. FacturaIA solo escribe:

| Campo Go | Columna BD | Campo TXT 606 |
|----------|-----------|---------------|
| TipoBienServicio | tipo_bien_servicio | Campo 3 |
| TipoNCF | tipo_ncf | Campo 4 |
| FormaPago | forma_pago | Campo 22 |
| Subtotal | subtotal | Campo 6 |
| ITBIS | itbis | Campo 7 |
| ITBISRetenido | itbis_retenido | Campo 8 |
| ISR | isr | Campo 18 |
| ITBISPercibido | itbis_percibido | Campo 16 (nuevo) |
| ISRPercibido | isr_percibido | Campo 19 (nuevo) |

**5. Eliminar AutoTagNCF() del Go code**

La funcion `AutoTagNCF()` que calcula aplica_606 en Go debe eliminarse o convertirse en solo validacion. El trigger PostgreSQL es la fuente de verdad — es mas robusto porque cubre inserts desde Go, desde Supabase JS, desde scripts y desde migrations.

---

## Orden de ejecucion recomendado

### Pre-condicion (antes de cualquier wave)

Ambos planes estan corregidos y alineados. Solo falta aprobacion de Carlos para ejecutar.

### Wave Unificada 1 — BD (bloquea a ambos proyectos)

Ejecutar `migration-606-unificada.sql` una sola vez en la BD compartida. Esto instala las 5 columnas nuevas, las 3 tablas de referencia, los indices y el trigger.

### Wave 2 — Paralelo (depende de Wave 1)

| Proyecto | Contenido |
|----------|-----------|
| FacturaIA Wave 2 | Go: structs/types actualizados con nuevas columnas (tipo_bien_servicio, tipo_ncf, isr, periodo_606, aplica_606) |
| FacturaIA Wave 3 | Go: endpoints GET /606/{rnc}/{periodo} y POST /606/generar |
| GestoriaRD Wave 2 | TS: tipos Supabase actualizados, service layer 606 |
| GestoriaRD Wave 3 | Frontend: tabla de revision, editor inline, generador TXT |

### Wave 3 — Paralelo (depende de Wave 2)

| Proyecto | Contenido |
|----------|-----------|
| FacturaIA Wave 4 | App movil: UI generacion TXT, descarga, ingreso referencia OFV |
| FacturaIA Wave 5 | Clasificacion IA: mejorar extraccion de tipo_bien_servicio via keywords |
| GestoriaRD Wave 4 | Scraper: verificacion estado en OFV via cruces.py |

### Wave 4 — Testing cruzado (depende de Wave 3)

- Ambos proyectos generan TXT para el periodo `202601`
- Comparar campos 1-23 contra el archivo de referencia real: `/home/gestoria/investigacion-606/DGII_F_606_131047939_202601.TXT`
- Verificar que aplica_606 incluye/excluye correctamente por tipo NCF
- Verificar que el trigger se activa tanto desde inserts Go como desde Supabase JS

---

## Proximos pasos

1. **Carlos aprueba** — revisar este documento y el cruce-005-vs-006.md
2. **Tag de retorno** — `git tag pre-plan-005-formato-606` antes de tocar codigo
3. **Ejecutar migration** — GestoriaRD ejecuta `migration-606-unificada.sql` en la BD compartida
4. **Wave 1 FacturaIA** — structs Go + eliminar AutoTagNCF()
5. **Wave 1 GestoriaRD** — API endpoints 606 en Next.js
6. Las waves de ambos proyectos corren en paralelo a partir de Wave 2

**Nota sobre la subida al OFV**: No existe API publica DGII. El TXT generado por FacturaIA se descarga y el contador/usuario lo sube manualmente al portal OFV (`dgii.gov.do/OFV/Cruces/Envios606.aspx`). La automatizacion via scraper Playwright es trabajo futuro (no en v1).
