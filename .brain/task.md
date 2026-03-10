# Task - FacturaIA

**Fecha**: 10-Mar-2026
**Estado**: Backend v2.20.0 deployed con SharePoint sync + mensajes amigables — App movil con auth headers corregidos
**Proyecto**: FacturaIA (App movil + Backend OCR)

---

## PROTOCOLO COWORK

**Tu rol**: Arquitecto (Opus 4.6) = CEREBRO. Decides TODO.
**Sub-agentes**: Sonnet ejecuta codigo. Nunca Opus.

### Ciclo
```
1. Lees este task.md → sabes donde estamos
2. Planificas → divides en waves
3. Delegas a Sonnet → sub-agentes ejecutan
4. Verificas → confirmas que funciona
5. Documentas → .brain/history.md + memoria
```

---

## ESTADO REAL (10-Mar-2026)

### Backend OCR - OPERATIVO v2.20.0
- **Docker**: facturaia-ocr:v2.20.0 (healthy, deployed 10-Mar-2026)
- **Go**: 1.24, Alpine multi-stage
- **AI**: Claude Opus 4.5 via CLIProxyAPI (localhost:8317)
- **Puerto**: 8081
- **Fixes v2.18.0-v2.20.0** (11 mejoras):
  1. Retry BD con backoff exponencial (5 intentos: 2s/4s/8s/16s/32s) — PROBADO y funciona
  2. JWT expiracion 24h (antes: nunca expiraban)
  3. JWT_SECRET obligatorio (eliminado fallback hardcodeado)
  4. Image proxy valida cliente_id cuando JWT presente
  5. InvoiceReviewScreen con Authorization headers (app movil)
  6. System message JSON-only para AI provider OpenAI (fix parseo)
  7. Fallback extracción JSON de texto mixto en respuestas AI
  8. Docker autoheal para restart automático de containers unhealthy
  9. Tabla sharepoint_sync_queue + INSERT non-blocking en ProcessInvoice
  10. api/errors.go con 9 error codes estructurados + user_message
  11. GET /api/admin/sharepoint-queue endpoint de monitoreo
- **Endpoints activos (10)**:
  - POST /api/clientes/login/ (RNC+PIN → JWT con exp 24h)
  - POST /api/process-invoice (upload + OCR)
  - GET /api/facturas/mis-facturas/
  - GET /api/facturas/{id}
  - GET /api/facturas/{id}/imagen (proxy MinIO, valida cliente_id)
  - DELETE /api/facturas/{id}
  - GET /api/facturas/resumen
  - POST /api/facturas/{id}/reprocesar
  - GET /api/admin/sharepoint-queue (estado cola sync SharePoint)
  - GET /health

### App Movil - OPERATIVA (necesita rebuild APK)
- **Ultimo APK**: 67MB (03-Mar-2026) — NO incluye fix auth headers
- **Stack**: React Native 0.76.9, Expo SDK 52, TypeScript
- **Scanner**: react-native-document-scanner-plugin 2.0.4
- **Fix reciente**: InvoiceReviewScreen ahora envia Authorization header en 4 fetch calls
- **Test user**: RNC 130-309094, PIN 1234 (Acela Associates)
- **Pendiente**: Rebuild APK para incluir fix de auth headers

### Infraestructura - UP
- PostgreSQL 16 (supabase-db, puerto 5433 directo — NO usa pooler)
- MinIO (puerto 9000) - bucket: facturas
- n8n (puerto 5678, localhost only)
- CLIProxyAPI v6.7.32 (puerto 8317, 40+ modelos)
- Coolify (orquestacion Docker)

### Docker - Limpio
- facturaia-ocr:v2.20.0 (activo)
- autoheal (willfarrell/autoheal, monitoring containers unhealthy cada 30s)
- v2.17.2 eliminada (10-Mar-2026)
- 1 imagen Coolify 2.66GB en uso activo (no eliminable)
- Total imagenes: 12.57GB, 12.24GB reclaimable

---

## BUGS CONOCIDOS (10-Mar-2026)

### Resueltos en v2.18.0
- ~~Backend sin retry BD~~ → Retry 5x con backoff exponencial
- ~~JWT sin expiracion~~ → Expiran en 24h
- ~~JWT fallback secret hardcodeado~~ → JWT_SECRET obligatorio (min 32 chars)
- ~~InvoiceReviewScreen sin Authorization~~ → 4 fetch calls con Bearer token
- ~~Image proxy sin validar cliente_id~~ → Valida ownership con JWT

### Resueltos en v2.19.0
- ~~AI responde texto en vez de JSON~~ → System message + fallback extracción JSON
- ~~Docker no reinicia containers unhealthy~~ → Autoheal container monitoring

### Resueltos en v2.20.0
- ~~Sin sync a SharePoint~~ → Tabla cola + worker Python + cron cada 2 min
- ~~Errores técnicos sin mensaje amigable~~ → api/errors.go con 9 códigos + user_message
- ~~Sin cola offline en app~~ → offlineQueue.ts + NetInfo check + UI UploadStatusCard

### Pendientes (no criticos)
- CameraScreen navega a 'InvoiceList' inexistente (crash) — debe ser 'Home'
- Base URL hardcodeada en 3 archivos (authService, apiClient, InvoiceDetail)
- RequireRole middleware no aplicado en ninguna ruta
- BD compartida sin aislamiento entre proyectos
- MinIO sin healthcheck en docker-compose

---

## PLANES COMPLETADOS

| Plan | Descripcion | Version |
|------|-------------|---------|
| plan-001 | Discovery estado real | - |
| plan-002 | Stabilize + /reprocesar | v2.14.0 |
| plan-003 | Cleanup + confidence real | v2.15.0 |
| plan-004 | Devengos completos | v2.16.0 |
| plan-005 | Fix tipoIdEmisor | v2.16.1 |
| plan-006 | Fix camara FileProvider | APK 03-Mar |
| plan-007 | Arquitectura n8n DGII (plan creado) | PENDIENTE |
| fix-criticos | 5 bugs criticos + deploy | v2.18.0 |

---

## RUTA DE TRABAJO

### Inmediato: Rebuild APK
1. Build local: `cd android && ./gradlew assembleRelease`
2. Descargar y probar: mensajes amigables, cola offline, NetInfo check
3. Verificar SharePoint sync con factura real

### Siguiente: Fix bugs no-criticos
1. CameraScreen: cambiar 'InvoiceList' → 'Home'
2. Base URL: centralizar en config
3. RequireRole: aplicar middleware en rutas

### Despues: Implementar plan-007 (n8n DGII)
- Wave 1: Endpoints backend /api/reportes/606 y /api/reportes/607
- Wave 2: Workflows n8n (mensual automatico + webhook bajo demanda)
- Wave 3: Boton "Generar Reporte" en app movil

---

## PENDIENTE A FUTURO
- Multi-tenant (firmas contables gestionando clientes)
- Formatos DGII 607, IT-1
- Dashboard web para contadores
- Notificaciones push

---

## ARCHIVOS CLAVE

### Repos GitHub
- App: CarlosHuyghusrl/facturaia-mobile (rama main)
- Backend: CarlosHuyghusrl/facturaia-ocr (rama master)

### En servidor
- App movil: ~/eas-builds/FacturaScannerApp/
- Backend Go: ~/factory/apps/facturaia-ocr/
- Arquitectura: .brain/ARQUITECTURA-FACTURAIA.md (928 lineas)

---

## CREDENCIALES

- Backend: http://217.216.48.91:8081
- Health: http://217.216.48.91:8081/health
- PostgreSQL: localhost:5433
- MinIO: localhost:9000 (gestoria_minio)
- CLIProxyAPI: localhost:8317
