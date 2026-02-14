## Metadata
- ID: plan-002-stabilize
- Proyecto: FacturaIA
- Fecha: 2026-02-14
- Tipo: ESTABILIZACION (actualizar docs + crear endpoint reprocesar)
- Depende de: plan-001-discovery (COMPLETADO)

## Contexto

Discovery (plan-001) revelo:
- Backend es v2.13.2 (docs dicen v2.9.0)
- 26 facturas en BD, 23 con ISC=0 (bug pre-v2.13.2)
- Endpoint /reprocesar es TODO
- CLAUDE.md desactualizado

Este plan arregla la deuda tecnica antes de implementar features nuevos.

---

## Tarea 1 [CLAUDE:agente] - Actualizar CLAUDE.md del backend

**Archivo**: `~/factory/apps/facturaia-ocr/CLAUDE.md` (si existe, sino crearlo)

**Cambios**:
- Version: v2.13.2 (no v2.9.0)
- Go: 1.24
- Listar los 8 endpoints activos:
  - POST /api/login
  - POST /api/process-invoice
  - GET /api/facturas/mis-facturas
  - GET /api/facturas/{id}
  - GET /api/facturas/{id}/imagen
  - DELETE /api/facturas/{id}
  - GET /api/facturas/resumen
  - GET /health
- AI Provider: Claude Opus 4.5 via CLIProxyAPI (localhost:8317)
- BD: 26 facturas en facturas_clientes
- Bug conocido: ISC=0 en facturas pre-v2.13.2

**Output**: CLAUDE.md actualizado

---

## Tarea 2 [CLAUDE:agente] - Implementar POST /api/facturas/{id}/reprocesar

**Donde**: `~/factory/apps/facturaia-ocr/api/client_handlers.go` (o handler.go, donde esten los handlers de facturas)

**Logica**:
1. Recibir request con JWT del cliente
2. Buscar factura por ID en BD (tabla facturas_clientes)
3. Verificar que la factura pertenece al cliente autenticado
4. Obtener la imagen original de MinIO usando el path guardado en BD
5. Re-enviar la imagen al AI provider (Claude Opus 4.5) para OCR
6. Actualizar TODOS los campos extraidos en BD (especialmente ISC, ITBIS, ISR, CDT, etc.)
7. Responder con la factura actualizada

**Ruta**: `POST /api/facturas/{id}/reprocesar`
**Auth**: JWT requerido (mismo que otros endpoints de facturas)
**Response**: JSON con la factura actualizada

**IMPORTANTE**: Reutilizar la logica existente de process-invoice. No duplicar codigo de OCR.

**Output**: Endpoint funcionando

---

## Tarea 3 [CLAUDE:agente] - Probar endpoint

**Pasos**:
1. Obtener token: `curl -X POST http://localhost:8081/api/login -d '{"rnc":"130309094","pin":"1234"}'`
2. Listar facturas: `curl -H "Authorization: Bearer TOKEN" http://localhost:8081/api/facturas/mis-facturas`
3. Tomar ID de una factura con ISC=0
4. Reprocesar: `curl -X POST -H "Authorization: Bearer TOKEN" http://localhost:8081/api/facturas/ID/reprocesar`
5. Verificar que ISC ahora tiene valor correcto
6. Verificar que los demas campos no se rompieron

**Output**: Log de los curls con resultados

---

## Tarea 4 [CLAUDE:agente] - Rebuild Docker + Deploy

**Pasos**:
1. `cd ~/factory/apps/facturaia-ocr`
2. `docker build -t facturaia-ocr:v2.14.0 .`
3. `docker stop facturaia-ocr`
4. `docker rm facturaia-ocr`
5. Relanzar con el mismo comando de deploy pero imagen v2.14.0:
```bash
docker run -d --name facturaia-ocr --restart unless-stopped --network host \
  -e PORT=8081 -e HOST=0.0.0.0 \
  -e AI_PROVIDER=openai \
  -e OPENAI_API_KEY=sk-7mFaCRaXj5sp1S5G82S17sF4ClsTzn0ObP1D8yzPEQYmZ \
  -e OPENAI_BASE_URL=http://localhost:8317/v1 \
  -e OPENAI_MODEL=claude-opus-4-5-20251101 \
  -e GEMINI_API_KEY=AIzaSyBQU-tSPRsWjc-qWgEtPeXkViSqyzdNQDc \
  -e GEMINI_MODEL=gemini-2.5-flash \
  -e DATABASE_URL=postgres://postgres:fBuTN2JZxjhJqxXCkacsMSPug9xgeb@localhost:5433/postgres?sslmode=disable \
  -e MINIO_ENDPOINT=localhost:9000 \
  -e MINIO_ACCESS_KEY=gestoria_minio \
  -e MINIO_SECRET_KEY=mMG3F4M42vgcGggEpAhAQuZ349jBkl \
  -e MINIO_USE_SSL=false -e MINIO_BUCKET=facturas \
  -e JWT_SECRET=facturaia-jwt-secret-2025-production \
  facturaia-ocr:v2.14.0
```
6. Verificar: `curl http://localhost:8081/health`
7. Probar /reprocesar con curl (mismos pasos que Tarea 3)

**Output**: Container v2.14.0 corriendo y verificado

---

## Tarea 5 [CLAUDE:agente] - Git commit + tag

1. `cd ~/factory/apps/facturaia-ocr`
2. `git add .`
3. `git commit -m "feat: endpoint reprocesar facturas + docs actualizados v2.14.0"`
4. `git tag v2.14.0`
5. `git push origin main --tags`

**Output**: Commit y tag en GitHub

---

## Verificacion Final

Guardar en `plans/results/stabilize-result.md`:
- [ ] Health check OK
- [ ] /reprocesar funciona con factura real
- [ ] ISC corregido en factura reprocesada
- [ ] Docker v2.14.0 healthy
- [ ] Commit en GitHub

IMPORTANTE: Solo observar el resultado del reprocesamiento. NO reprocesar todas las facturas todavia - eso es plan-003.
