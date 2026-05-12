# Smoke test pre-build — FacturaIA

Suite mínima que valida backend `facturaia-ocr` antes de un release APK.

## Correr local

```bash
# Requiere backend OCR corriendo en http://localhost:8081
docker ps --filter name=facturaia-ocr  # debe mostrar Up healthy

npm run smoke-test
```

Salida: tabla por fixture + exit 0/1.

## Añadir fixture

1. Crear directorio bajo `tests/smoke/fixtures/facturas/NN-tipo-rubro/`
2. Añadir 3 archivos:
   - `extracted_data.json` — datos OCR ground-truth a enviar al validate endpoint
   - `assert.json` — asserts custom (valid/needs_review/warnings codes esperados)
   - `README.md` — origen del caso + qué prueba
3. Verificar: `npm run smoke-test` debe correr el nuevo fixture

## Schema extracted_data.json

Ver fixtures existentes. Campos obligatorios: ncf, rnc_emisor, total_factura.
Campos opcionales: monto_servicios, monto_bienes, descuento, itbis_facturado, categoria_itbis, sector_proveedor.

## Schema assert.json

- `expected_valid: boolean`
- `expected_needs_review: boolean`
- `warnings_codes_should_contain: string[]` — codes que DEBEN estar en response.warnings
- `errors_codes_should_NOT_contain: string[]`
- `warnings_codes_should_NOT_contain: string[]`

## Coherencia universal

Independientemente del assert.json, todos los fixtures fallan si backend devuelve:
- valid=true + errors.length > 0
- needs_review=false + warnings.length > 0
- valid=false + errors.length === 0
- needs_review=true + warnings.length === 0 + errors.length === 0

Estas son las reglas que previenen el bug Wave 2 "VALIDADO + Problemas detectados".

## Override emergencia

(Pre-build hook NO implementado todavía — wave SK-3.)

## Wave futura SK-5

Reemplazar `extracted_data.json` por `image.jpg` real + invocación `/api/process-invoice` para test end-to-end OCR pipeline.
