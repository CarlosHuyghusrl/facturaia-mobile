# Task - FacturaIA

**Fecha**: 12-Mar-2026
**Estado**: v2.24.0 deployed — Wave 3 plan-005 completada (endpoints 606)
**Proyecto**: FacturaIA (App movil + Backend OCR)

---

## ESTADO REAL (12-Mar-2026)

### Backend OCR - OPERATIVO v2.24.0
- **Docker**: facturaia-ocr:v2.24.0 (healthy, deployed 12-Mar-2026)
- **Go**: 1.24, Alpine multi-stage
- **AI**: Claude Opus 4.5 via CLIProxyAPI (localhost:8317)
- **Puerto**: 8081
- **Endpoints activos (15)**:
  - Auth: /api/clientes/login/
  - OCR: /api/facturas/upload/, /api/facturas/mis-facturas/, /api/facturas/resumen
  - Detalle: /api/facturas/{id}, /api/facturas/{id}/imagen, /api/facturas/{id}/reprocesar, DELETE
  - Formato 606: /api/formato-606/{rnc} (TXT), /api/formato-606/{rnc}/preview, /api/formato-606/{rnc}/validate
  - Toggle: /api/formato-606/factura/{id}/toggle-aplica606
  - Envios: /api/envios-606/{id}/referencia
  - Admin: /api/admin/sharepoint-queue
  - Health: /health

### App Movil - APK rebuild 12-Mar-2026 (80MB)
- **Fixes incluidos**: HomeScreen campos, auto-refresh, warning RNC, auth headers, offline queue

### Plan-005 Formato 606 - ESTADO WAVES
- Wave 1 (BD): COMPLETADO — columnas + envios_606 (migration-606-unificada.sql)
- Wave 2 (extractor IA): COMPLETADO — tipo_ncf, tipo_bien_servicio, aplica_606
- Wave 3 (endpoints Go): COMPLETADO v2.24.0 — 5 endpoints generacion TXT + preview + validate
- Wave 4 (UI movil): PENDIENTE — Generate606Screen, History606Screen, badge
- Wave 5 (clasificacion): PENDIENTE — mapeo robusto tipo_bien_servicio
- Wave 6 (testing): PENDIENTE — datos reales HUYGHU

### plan-007 n8n DGII
- PENDIENTE — depende de Wave 4

---

## RUTA DE TRABAJO

### Inmediato: Wave 4 — UI movil 606
- Generate606Screen: botón "Generar Reporte 606" desde HomeScreen
- Preview antes de descargar
- History606Screen: historial de envios
- Badge en HomeScreen (pendiente 606)

### Despues: Wave 5 + 6
- Clasificacion tipo_bien_servicio robusta
- Testing con datos reales HUYGHU enero 2026 (44 facturas en referencia)

### Pendiente UI
- Icono viejo en pantalla de Login

---

## CREDENCIALES

- Backend: http://217.216.48.91:8081
- Health: http://217.216.48.91:8081/health
- Test user: RNC 130309094 / PIN 1234 (Acela Associates)
- PostgreSQL: localhost:5433
- MinIO: localhost:9000 (gestoria_minio)
- CLIProxyAPI: localhost:8317
