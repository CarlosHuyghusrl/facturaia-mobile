# Task - FacturaIA

**Fecha**: 26-Feb-2026
**Estado**: plan-004-devengos COMPLETADO — Backend v2.16.0 desplegado
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

### Backend OCR - OPERATIVO v2.16.0
- **Version**: v2.16.0 (Docker: facturaia-ocr, healthy)
- **Go**: 1.24
- **AI**: Claude Opus 4.5 via CLIProxyAPI (localhost:8317)
- **Puerto**: 8081
- **Commit**: ff68e78 (tag v2.16.0 en GitHub)
- **v2.15.0**: confidence score real, validador campos completos
- **v2.16.0**: prompts unificados, 8 columnas BD nuevas, 5 reglas validador, montoServicios/montoBienes separados
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
- **facturas_clientes**: 1 registro (BD fue limpiada post 14-Feb)
- Bug ISC=0 ya no aplica (datos historicos eliminados)
- Nuevas facturas usaran confidence score real + validador completo

---

## PLANES COMPLETADOS

### plan-001-discovery ✅ (14-Feb-2026)
- Descubrio estado real: v2.13.2, Go 1.24, 26 facturas, ISC bug
- Resultado: `plans/results/discovery-facturia.md`

### plan-002-stabilize ✅ (14-Feb-2026)
- CLAUDE.md backend actualizado
- Endpoint /reprocesar implementado y probado
- Docker rebuild v2.14.0 deployed
- Resultado: `plans/results/stabilize-result.md`

### plan-003-cleanup ✅ (26-Feb-2026)
- Confidence score: de hardcodeado 0.85 → calculo real basado en campos extraidos
- Validador DGII: ahora recibe ISC/CDT/Cargo911/Descuento y 7 campos mas
- CameraScreen.tsx legacy eliminado
- Docker rebuild v2.15.0 deployed y healthy

### plan-004-devengos ✅ (26-Feb-2026)
- Prompts IA: buildPromptDGII unificado con buildPromptVision (emisor/receptor, ISC por categoria)
- Campos nuevos: montoServicios, montoBienes, ncfModifica, itbisRetenidoPorcentaje, fechaPago
- BD: 8 columnas nuevas (itbis_tasa, fecha_pago, ncf_modifica, tipo_id_emisor/receptor, monto_servicios/bienes, itbis_retenido_porcentaje)
- Validador: 5 reglas nuevas (ISC seguros 16%, nota credito, exportaciones, gubernamentales, ITBIS retenido %)
- Handler: conecta todos los campos nuevos a validador y BD con fallback subtotal
- Docker rebuild v2.16.0 deployed y healthy

---

## RUTA DE TRABAJO

### Siguiente: Test con facturas reales
Probar el flujo completo con distintos tipos de factura:
- Supermercado (B01) → ITBIS 18%
- Telecom (Claro/Altice) → ISC 10%, CDT 2%, Cargo 911
- Seguros → ISC 16%
- Nota credito (B04) → ncfModifica
- Restaurante → Propina 10%

### Despues: Decidir con Carlos
- Mejorar app movil (UI, UX, bugs camara)
- Multi-tenant para firmas contables
- Dashboard web para contadores

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
- Backend: CarlosHuyghusrl/facturaia-ocr (tag v2.16.0)

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
| plan-003 | Cleanup + confidence real + v2.15.0 | COMPLETADO |
| plan-004 | Devengos completos + v2.16.0 | COMPLETADO |
| 10 | Arquitectura OCR-n8n para DGII | PENDIENTE |

---

## CREDENCIALES

- SSH: gestoria@217.216.48.91:2024
- Backend: http://217.216.48.91:8081
- Health: http://217.216.48.91:8081/health
- PostgreSQL: localhost:5433 (via PgBouncer)
- MinIO: localhost:9000 (gestoria_minio)
- CLIProxyAPI: localhost:8317
