# Task - FacturaIA

**Fecha**: 14-Feb-2026
**Estado**: plan-002 COMPLETADO — Listo para plan-003-isc-fix
**Proyecto**: FacturaIA (App movil + Backend OCR)

---

## PROTOCOLO COWORK

**LEER PRIMERO**: `C:\memoria-permanente\COWORK.md`

**Tu rol**: Code Desktop (Opus) = CEREBRO. Decides TODO.
**CLI en VPS**: MANOS. Ejecuta segun tags del plan.

### Ciclo
```
1. Lees este task.md → sabes donde estamos
2. Creas plan con tags → subes al VPS
3. CLI ejecuta → guarda resultados
4. Bajas resultados → actualizas este archivo
```

---

## ESTADO REAL (14-Feb-2026)

### Backend OCR - OPERATIVO v2.14.0
- **Version**: v2.14.0 (Docker: facturaia-ocr, container 840edf5a8e51, healthy)
- **Go**: 1.24
- **AI**: Claude Opus 4.5 via CLIProxyAPI (localhost:8317)
- **Puerto**: 8081
- **Commit**: 8716c94 (tag v2.14.0 en GitHub)
- **Endpoints activos (9)**:
  - POST /api/login (RNC+PIN → JWT)
  - POST /api/process-invoice (upload + OCR)
  - GET /api/facturas/mis-facturas
  - GET /api/facturas/{id}
  - GET /api/facturas/{id}/imagen (proxy MinIO)
  - DELETE /api/facturas/{id}
  - GET /api/facturas/resumen
  - **POST /api/facturas/{id}/reprocesar** ← NUEVO v2.14.0
  - GET /health

### App Movil - OPERATIVA
- **APK Release**: 67MB (compilado 12-Feb-2026)
- **Stack**: React Native 0.76.9, Expo SDK 52, TypeScript
- **Scanner**: react-native-document-scanner-plugin 2.0.4
- **Test user**: RNC 130-309094, PIN 1234 (Acela Associates)

### Infraestructura - UP
- PostgreSQL 16 via PgBouncer (puerto 5433)
- MinIO (puerto 9000) - bucket: facturas
- n8n (puerto 5678, localhost only)
- CLIProxyAPI (puerto 8317)

### Base de Datos
- **facturas_clientes**: 26 registros
  - 23 con ISC=0 (bug pre-v2.13.2) → PENDIENTE reprocesar
  - 3 con ISC correcto
  - 1 ya reprocesada como prueba (ISC=1200, MULTISEGUROS)

---

## BUG CONOCIDO

**ISC=0 en facturas antiguas**: 23 de 26 facturas tienen ISC=0.
Endpoint /reprocesar YA EXISTE y funciona. Falta ejecutar en lote (plan-003).

**Prueba exitosa**: Factura 5523641b (MULTISEGUROS) — ISC paso de 0 → 1200 ✅

---

## PLANES COMPLETADOS

### plan-001-discovery ✅ (14-Feb-2026)
- Descubrio estado real: v2.13.2, Go 1.24, 26 facturas, ISC bug
- Resultado: `plans/results/discovery-facturia.md`

### plan-002-stabilize ✅ (14-Feb-2026)
- CLAUDE.md backend actualizado
- Endpoint /reprocesar implementado y probado
- Docker rebuild v2.14.0 deployed
- Commit 8716c94 + tag v2.14.0 en GitHub
- Resultado: `plans/results/stabilize-result.md`

---

## RUTA DE TRABAJO

### Siguiente: plan-003-isc-fix
- Script que reprocesa las 23 facturas con ISC=0 usando POST /reprocesar
- NO reprocesar toda la BD, solo las que tienen ISC=0
- Verificar que ningun otro campo se rompa

### Despues: plan-004-dgii-606
- Generar formato DGII 606 (compras) a partir de facturas corregidas
- El feature diferenciador de la app

---

## PENDIENTE A FUTURO
- Multi-tenant (firmas contables gestionando clientes)
- Formatos DGII 607, IT-1
- Dashboard web para contadores
- Notificaciones push

---

## ARCHIVOS CLAVE

### Dentro del repo (sincronizado por git)
- `.brain/task.md` - ESTE ARCHIVO (fuente de verdad)
- `.brain/history.md` - Historial
- `plans/` - Planes para CLI
- `plans/results/` - Resultados de CLI
- `CLAUDE.md` - Instrucciones proyecto

### En VPS (mismo repo via git)
- `~/eas-builds/FacturaScannerApp/` - App movil
- `~/factory/apps/facturaia-ocr/` - Backend Go

### Repos GitHub
- App: CarlosHuyghusrl/facturaia-mobile
- Backend: CarlosHuyghusrl/facturaia-ocr (tag v2.14.0)

---

## FASES COMPLETADAS

| Fase | Descripcion | Estado |
|------|-------------|--------|
| 1-9 | Infra + Backend + App + Migracion | COMPLETADO |
| 11 | Migracion Document Scanner | COMPLETADO |
| 12 | Claude Opus 4.5 OCR + Vision Mode | COMPLETADO |
| 13 | Image Proxy (MinIO→Backend→App) | COMPLETADO |
| plan-001 | Discovery estado real | COMPLETADO |
| plan-002 | Stabilize + /reprocesar + v2.14.0 | COMPLETADO |
| 10 | Arquitectura OCR-n8n para DGII | PENDIENTE |

---

## CREDENCIALES

- SSH: gestoria@217.216.48.91:2024
- Backend: http://217.216.48.91:8081
- Health: http://217.216.48.91:8081/health
- PostgreSQL: localhost:5433 (via PgBouncer)
- MinIO: localhost:9000 (gestoria_minio)
- CLIProxyAPI: localhost:8317
