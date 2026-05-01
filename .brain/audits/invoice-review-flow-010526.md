# Audit InvoiceReview Flow — 2026-05-01

Sub-agent: WF3
Hito: facturaia-fortify-empresa-id-w1
Type: Code review (no code modified, no app executed)

## Contexto

Bug edge case detectado en producción:
- Factura `CENTRAL LINK TV SRL` (id `ced8b3da-fda5-4932-9817-a29d8bb8235c`) tiene `ncf=''` (string vacío) en BD porque OCR no detectó NCF y dejó `extraction_status='error'`.
- Esa factura no aparece en form 606 GestoriaRD: el filtro de loader exige `aplica_606=true` y `ncf` válido (`length>=11`), y el trigger BD `auto_tag_factura_606` setea `aplica_606=false` cuando NCF está vacío.
- Backfill SQL fue bloqueado por el unique index `idx_facturas_clientes_ncf_empresa UNIQUE (ncf, empresa_id)` cuando hay múltiples filas con `ncf=''` para la misma empresa (el "vacío" se solapa).
- Necesidad: que el usuario pueda corregir el NCF desde la app (InvoiceReviewScreen), guardar, y que la fila se re-tagee correctamente al 606 vía trigger BD.

## Flujo actual mapeado del código

### 1. Post-OCR en CameraScreen (renombrado a `ScannerScreen` internamente)
- Archivo: `src/screens/CameraScreen.tsx:66-100`
- Tras `subirFacturaConValidacion` el componente recibe `processResult`.
- Auto-redirect: si `extraction_status === 'review' || === 'error'` se hace `navigation.navigate('InvoiceReview', {...})` con delay 1.5s.
- Mapping de fields al payload de `extractedData` (`CameraScreen.tsx:75-93`):
  - `ncf: processResult.data.ncf || ''` ← acepta string vacío.
  - `monto_servicios: 0` ← HARDCODED (ver BUG-04).
  - `monto_bienes: processResult.data.subtotal || 0` ← se usa subtotal como bienes.
- A esta altura la factura YA está persistida en BD por `ProcessInvoice` (handler Go). No se inserta de nuevo.

### 2. InvoiceReviewScreen render
- Archivo: `src/screens/InvoiceReviewScreen.tsx:117-528`
- Recibe params: `invoiceId`, `imageUrl`, `extractedData`, `validation`, `extractionStatus`.
- Estado local `formData = useState<InvoiceData>(params.extractedData)` (line 123).
- Render banner top con errores legibles (`ERROR_CODE_MESSAGES`, lines 43-57), incluye message para `invalid_ncf` y `missing_emisor_rnc` (lines 44-45).

### 3. Sección "Comprobante Fiscal" (NCF + fecha + emisor)
- Archivo: `src/screens/InvoiceReviewScreen.tsx:332-351`
- NCF, fecha_emision, emisor_nombre y emisor_rnc se renderizan como **`<Text>` read-only** (NO `<TextInput>`).
- Comentario en código (line 332): `"Datos del comprobante (no editables)"`.
- **CONSECUENCIA: el usuario NO puede editar el NCF ni el RNC del emisor desde esta pantalla** (bug bloqueante para el caso CENTRAL LINK TV).

### 4. Sección "Campos Fiscales" editables
- Archivo: `src/screens/InvoiceReviewScreen.tsx:353-390`
- Solo monto_servicios, monto_bienes, descuento, itbis_*, isc, propina, otros_impuestos, retencion_isr_*, total_factura son editables (constante `FISCAL_FIELDS` lines 103-115).
- Ningún campo identificativo (NCF, RNC emisor, fecha, nombre emisor) está en `FISCAL_FIELDS`.

### 5. Click "Corregir y Guardar" (`handleCorrectAndSave`)
- Archivo: `src/screens/InvoiceReviewScreen.tsx:204-246`
- Paso 1: `POST /api/v1/invoices/validate` con `formData` → recibe `newValidation`.
- Paso 2: decide newStatus: `'validated'` por default, `'error'` si `!valid`, `'review'` si `needs_review`.
- Paso 3: `PUT /api/facturas/${invoiceId}/update` con `{...formData, extraction_status: newStatus, review_notes: JSON.stringify(...)}`.
- En éxito: `navigation.goBack()` (no muestra banner de éxito ni delta antes/después).

### 6. Backend: PUT /api/facturas/{id}/update
- **NO EXISTE** este endpoint en backend.
- Búsqueda en `api/handler.go` (router lines 50-95) confirma: la única ruta de update es `PUT /api/invoice/{id}` (line 58, sin `/facturas/`, sin `/update`).
- Aliases registrados para frontend móvil (lines 67-74): `upload`, `mis-facturas`, `resumen`, `reprocesar`, `imagen`, `{id}` (GET/DELETE). **No hay `/update` ni `/approve`**.
- También se llama desde `ScannerScreen.tsx:111-114` (`actualizarFactura(invoice_id, {aplica_606, aplica_607})`) con la misma URL inexistente — falla silenciosamente.

### 7. Backend: PUT /api/invoice/{id} (`UpdateInvoice`)
- Archivo: `api/handler.go:793-854`.
- Allowlist de campos (lines 819-832): `estado, ncf, tipo_gasto, rnc_proveedor, nombre_proveedor, subtotal, itbis, total, aplica_606, aplica_607, periodo_606, periodo_607`.
- **NOTA:** la app móvil envía `extraction_status, review_notes, fecha_emision, emisor_rnc, emisor_nombre, monto_servicios, monto_bienes, descuento, itbis_facturado, itbis_retenido, isc_monto, propina_legal, otros_impuestos, total_factura, retencion_isr_tipo, retencion_isr_monto`. **TODOS son rechazados por el filtro porque ninguno está en el allowlist** (mapeo de nombres distintos: `emisor_rnc` no aparece, sólo `rnc_proveedor`; `total_factura` no aparece, sólo `total`).
- DB: `db.UpdateInvoice` apunta a `<schema>.facturas` (esquema por empresaAlias, NO `facturas_clientes`). Línea `internal/db/invoices.go:135`. Esa tabla NO tiene los triggers `auto_tag_factura_606` ni `auto_set_receptor_rnc`.

### 8. Trigger BD `auto_tag_factura_606`
- Archivo: `db/migrations/20260430_strict_606_required_fields.sql:5-96`.
- Trigger creado en `BEFORE INSERT OR UPDATE` sobre `public.facturas_clientes` (confirmado en `docs/606_field_mapping.md:114`).
- Función: lee prefijo NCF, consulta `dgii_ncf_tipos.aplica_606`, valida required (emisor_rnc, ncf>=11, fecha_documento, monto>0), setea `NEW.aplica_606`, `NEW.extraction_status='review'`, `NEW.review_notes`, `NEW.periodo_606`, `NEW.itbis_adelantar`.
- **BIEN**: dispara también en UPDATE → si se actualiza el NCF en `facturas_clientes`, el flag `aplica_606` se recalcula correctamente.
- **MAL**: el endpoint `UpdateInvoice` no toca `facturas_clientes`, por lo que el trigger nunca dispara desde la app.

### 9. Trigger BD `auto_set_receptor_rnc`
- Archivo: `migrations/20260430_auto_set_receptor_rnc.sql:7-42`.
- Trigger BEFORE INSERT OR UPDATE OF `cliente_id, empresa_id, receptor_rnc` (línea 41).
- Solo se dispara si una de esas 3 columnas cambia. Editar NCF/montos NO lo dispara.
- Dado que la app no actualiza `facturas_clientes` y tampoco cambia `cliente_id/empresa_id/receptor_rnc`, este trigger es irrelevante para el flujo InvoiceReview actual.

## Bugs / Gaps detectados

### CRÍTICOS (bloquean el caso de uso)

- **[BUG-01] Endpoint inexistente — el flujo "Corregir y Guardar" NUNCA persiste cambios**
  Severity: CRITICAL.
  - File: `src/screens/InvoiceReviewScreen.tsx:228` llama `api.put('/api/facturas/${invoiceId}/update', ...)`.
  - File: `src/services/facturasService.ts:249` (`actualizarFactura`) usa misma URL.
  - Backend: `api/handler.go:50-95` no registra ninguna ruta `/api/facturas/{id}/update`. La única update real es `PUT /api/invoice/{id}` (line 58).
  - Resultado esperado: 404 Not Found en cada save. Ya sea silente o con alert "Error", el cambio NO llega a BD.
  - El usuario crea la falsa expectativa de que editó la factura, pero el row queda intacto.

- **[BUG-02] NCF no es editable en la pantalla de revisión**
  Severity: CRITICAL para el caso CENTRAL LINK TV.
  - File: `src/screens/InvoiceReviewScreen.tsx:332-351` renderiza NCF/fecha/emisor como `<Text>` read-only.
  - File: `src/screens/InvoiceReviewScreen.tsx:103-115` (constante `FISCAL_FIELDS`) no incluye NCF/emisor_rnc/emisor_nombre/fecha_emision.
  - El error code `invalid_ncf` tiene mensaje en `ERROR_CODE_MESSAGES` (line 45) pero el usuario no tiene UI para corregirlo.
  - Solo puede usar "Reprocesar OCR" desde la lista (POST `/api/facturas/{id}/reprocesar`, ver client_handlers.go), no edición manual.

- **[BUG-03] Endpoint correcto (UpdateInvoice) escribiría en tabla equivocada**
  Severity: CRITICAL.
  - Si se intentara redirigir el call al endpoint existente `/api/invoice/{id}`:
    - `api/handler.go:845` llama `db.UpdateInvoice(ctx, claims.EmpresaAlias, invoiceID, filtered)`.
    - `internal/db/invoices.go:135` arma `UPDATE %s.facturas SET ...` — escribe en schema-específico `facturas`, no en `public.facturas_clientes`.
    - Los triggers `trg_auto_tag_606` / `trg_auto_set_receptor_rnc` están definidos sobre `public.facturas_clientes`, NO sobre `<schema>.facturas`.
    - Resultado: aunque el endpoint guarde el NCF, `aplica_606` NO se recalcula y la factura sigue invisible para el form 606.
  - Las facturas escaneadas desde móvil viven en `facturas_clientes` (ver `internal/db/client_invoices.go:756 UpdateClientInvoice` y `ProcessInvoice` que persiste ahí). Hay un mismatch arquitectónico entre los 2 sets de tablas.

- **[BUG-04] Mapeo de campos OCR → InvoiceReview pierde datos**
  Severity: HIGH.
  - File: `src/screens/CameraScreen.tsx:80` setea `monto_servicios: 0` HARDCODED.
  - `monto_bienes` recibe el subtotal completo. Si la factura tenía servicios, se mostrará 0 en servicios y todo en bienes — el usuario debería editar manualmente, pero no se le advierte.

### IMPORTANTES

- **[BUG-05] No hay validación de formato NCF inline en cliente**
  Severity: MEDIUM.
  - Aunque NCF fuera editable, no existe regex/validation que exija `B0\d|E3\d` + 9 dígitos antes del POST. Sólo el server lo valida en `/api/v1/invoices/validate` con código `invalid_ncf` (`length<11`).

- **[BUG-06] Campo allowlist backend incompleto incluso para shape correcto**
  Severity: HIGH.
  - `api/handler.go:819-832` permite solo `ncf, rnc_proveedor, nombre_proveedor, subtotal, itbis, total, aplica_606, aplica_607, ...`.
  - La app envía nombres distintos: `emisor_rnc, emisor_nombre, fecha_emision, total_factura, monto_servicios, monto_bienes, itbis_facturado, itbis_retenido, descuento, isc_monto, propina_legal, otros_impuestos, retencion_isr_tipo, retencion_isr_monto, extraction_status, review_notes`. Casi NINGUNO es aceptado por el filter.

- **[BUG-07] Pérdida potencial de empresa_id en UPDATE**
  Severity: LOW (no observado en código actual, pero riesgo arquitectónico).
  - El handler UpdateInvoice no toca `empresa_id` ni `cliente_id` (no están en allowlist), así que no hay riesgo directo de borrarlos en el UPDATE actual.
  - Riesgo: si alguien futuro agrega `empresa_id` al payload de la app sin allow-listearlo, el filtro lo eliminaría silenciosamente — comportamiento correcto pero invisible.
  - El trigger `trg_auto_set_receptor_rnc` requiere que `empresa_id` (o `cliente_id`) esté seteado para inferir `receptor_rnc`. Si por algún motivo el INSERT inicial guardó `empresa_id=NULL`, este UPDATE no lo arreglaría porque empresa_id no es editable.

- **[BUG-08] handleApprove — mismo bug de endpoint inexistente**
  Severity: HIGH.
  - File: `src/screens/InvoiceReviewScreen.tsx:188` → `api.put('/api/facturas/${invoiceId}/approve', ...)`. No existe ese endpoint tampoco.
  - File: `src/services/facturasService.ts:235` (`aprobarFactura`).

- **[BUG-09] Race condition entre validate y update**
  Severity: LOW.
  - `handleCorrectAndSave` hace 2 calls secuenciales (validate → update). Si el usuario hace doble-tap o hay latencia, podrían cruzarse.
  - Mitigación parcial: `setIsSubmitting(true)` deshabilita el botón mientras dura. Pero el request validate se procesa en un endpoint distinto y no es atómico con el update.

- **[BUG-10] No se refresca el estado después de update exitoso**
  Severity: LOW.
  - `navigation.goBack()` en line 238 sin re-fetch. El componente padre debe usar `useFocusEffect` para refrescar (ya hay precedente en HomeScreen).

### MENORES

- **[BUG-11] selectTipo en CameraScreen también usa endpoint inexistente**
  - File: `src/screens/CameraScreen.tsx:111` → `actualizarFactura(invoice_id, {aplica_607, aplica_606})` falla silenciosamente. El tipo nunca se guarda en BD.
  - El catch loguea sin alertar (line 116). UX dice "Guardando" pero nunca persiste.

## UX gaps

- **[UX-01] Mensaje claro para "OCR no detectó NCF"**
  - El banner top muestra "NCF inválido — El NCF debe tener al menos 11 caracteres". Pero el usuario no tiene cómo editarlo (BUG-02).
  - Propuesta: cuando `extraction_status='error'` y `ncf===''`, mostrar pantalla con foco directo en input NCF y placeholder de ejemplo `B0100000001`.

- **[UX-02] Validación inline del formato NCF**
  - Al escribir NCF, mostrar prefijo detectado (B01/B02/E31/...) y check de longitud `11+`.
  - Bloquear el botón "Corregir y Guardar" hasta que el formato sea válido.

- **[UX-03] El usuario puede dejar NCF vacío sin advertencia bloqueante**
  - Actualmente el banner se muestra pero no impide guardar. Si la pantalla fuera editable, debería bloquear save hasta corregir errores `severity: 'error'` o pedir confirmación explícita ("Guardar sin NCF — No aplicará al 606").

- **[UX-04] Tras guardar, no hay feedback de "factura ahora aplica al 606"**
  - El usuario edita NCF, guarda, y la pantalla cierra. No sabe si la factura fue re-tageada al 606.
  - Propuesta: después del UPDATE, re-fetch la factura y mostrar badge "Aplica 606" en verde.

- **[UX-05] Reintentar OCR no es la solución obvia**
  - Existe `/api/facturas/{id}/reprocesar` (POST, requiere rol admin/contador), pero no se expone en InvoiceReviewScreen. El usuario sólo ve "Revalidar" (que solo recalcula validación, no re-corre OCR).

- **[UX-06] Mensaje "Algunos campos necesitan revisión" en CameraScreen pero auto-redirect a Review**
  - File: `CameraScreen.tsx:463-468`. Hay un timer 1.5s antes de auto-navegar. Confuso porque el usuario también ve el botón "Cambiar tipo" — se le pasa el tiempo y la pantalla cambia.

## Propuestas de mejora (prioridad)

1. **(P0 — bloqueante)** Implementar realmente el endpoint backend `PUT /api/facturas/{id}/update` y `PUT /api/facturas/{id}/approve` que escriban en `public.facturas_clientes` vía `db.UpdateClientInvoice`. Reusar el helper existente. Esto disparará automáticamente `trg_auto_tag_606` y `trg_auto_set_receptor_rnc`.

2. **(P0)** Hacer NCF editable en InvoiceReviewScreen:
   - Mover `ncf, fecha_emision, emisor_rnc, emisor_nombre` desde la sección read-only a `FISCAL_FIELDS` (o crear sección `IDENTIFICATION_FIELDS`).
   - Añadir validación inline: regex `^[BE]\d{2}\d{8,11}$` y check longitud.

3. **(P0)** Resolver conflicto unique constraint para NCF vacío:
   - En BD: hacer el UNIQUE índice `WHERE ncf <> ''` (índice parcial), o forzar a la app a NUNCA enviar `ncf=''` (mandar NULL).
   - En backend: si NCF queda vacío, persistir como NULL para no chocar con el unique.

4. **(P1)** Allowlist correcto en backend UpdateInvoice:
   - Mapear nombres app → BD: `emisor_rnc → emisor_rnc`, `total_factura → monto`, `monto_servicios/bienes/descuento/itbis_*/isc_monto/propina_legal/otros_impuestos/retencion_isr_*` → columnas reales en `facturas_clientes`.
   - Permitir `extraction_status` y `review_notes`.

5. **(P1)** Auto-refresh de la factura tras UPDATE: re-fetch + mostrar badge "Ahora aplica al 606" si `aplica_606` cambió a true.

6. **(P2)** Atomicidad validate+update: hacer un único endpoint `PUT /api/facturas/{id}/update-and-validate` que valide y guarde en una transacción.

7. **(P2)** Mostrar prefijo NCF detectado en tiempo real (B01 = Crédito Fiscal, B02 = Consumidor Final, E31 = e-CF Crédito, ...).

8. **(P3)** Botón "Volver a procesar OCR" en InvoiceReviewScreen para usuarios con rol contador (llama `/api/facturas/{id}/reprocesar`).

## Conclusión

**Status: NOT-READY — 11 bugs detectados, 4 CRÍTICOS, 6 UX gaps.**

El flujo InvoiceReviewScreen para corregir NCF tras OCR fallido **NO funciona end-to-end**:

- Bloqueador #1: el NCF no es editable (BUG-02).
- Bloqueador #2: aunque fuera editable, el endpoint `/api/facturas/{id}/update` NO existe (BUG-01).
- Bloqueador #3: el endpoint backend que sí existe (`PUT /api/invoice/{id}`) escribe en la tabla equivocada (`<schema>.facturas` en vez de `public.facturas_clientes`), por lo que los triggers BD `auto_tag_factura_606` y `auto_set_receptor_rnc` no se disparan (BUG-03).
- Bloqueador #4 (BD): aunque el flujo se arreglara, el unique constraint `(ncf, empresa_id)` impide tener múltiples facturas con `ncf=''` para misma empresa — habría que migrar a índice parcial `WHERE ncf <> ''`.

El caso CENTRAL LINK TV no se puede resolver desde la app actual:
- El usuario no puede editar el NCF.
- Si pudiera, el save no llegaría al backend (404).
- Si llegara, escribiría en tabla equivocada y el trigger 606 no se ejecutaría.

**Prioridades para fix (en orden):**
1. P0: implementar endpoint `PUT /api/facturas/{id}/update` que escriba en `facturas_clientes` (BUG-01 + BUG-03 + BUG-06).
2. P0: hacer NCF editable en InvoiceReviewScreen (BUG-02 + UX-01 + UX-02).
3. P0: índice parcial UNIQUE para no bloquear NCF vacíos múltiples (no es código de app, pero es prerequisito BD).
4. P1: allowlist backend correcto + mapping nombres campos.
5. P1: feedback post-save.

Hasta que P0 esté hecho, el bug CENTRAL LINK TV solo se puede resolver via SQL manual + reprocess OCR endpoint (que requiere rol admin/contador, no es self-service del usuario final).

---

### Archivos auditados

- `/home/gestoria/eas-builds/FacturaScannerApp/src/screens/InvoiceReviewScreen.tsx` (715 líneas)
- `/home/gestoria/eas-builds/FacturaScannerApp/src/services/facturasService.ts` (320 líneas)
- `/home/gestoria/eas-builds/FacturaScannerApp/src/screens/CameraScreen.tsx` (688 líneas)
- `/home/gestoria/factory/apps/facturaia-ocr/api/handler.go` (líneas 50-95, 793-854, 1047-1065)
- `/home/gestoria/factory/apps/facturaia-ocr/internal/db/invoices.go` (líneas 113-140)
- `/home/gestoria/factory/apps/facturaia-ocr/internal/db/client_invoices.go` (líneas 756-833)
- `/home/gestoria/factory/apps/facturaia-ocr/db/migrations/20260430_strict_606_required_fields.sql`
- `/home/gestoria/factory/apps/facturaia-ocr/migrations/20260430_auto_set_receptor_rnc.sql`
- `/home/gestoria/factory/apps/facturaia-ocr/docs/606_field_mapping.md` (referenciado para confirmar `trg_auto_tag_606` y unique index)
