# Task - FacturaIA

**Fecha**: 12-Mar-2026
**Estado**: Backend v2.23.3 deployed — App movil APK rebuild 80MB con todos los fixes
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

## ESTADO REAL (12-Mar-2026)

### Backend OCR - OPERATIVO v2.23.3
- **Docker**: facturaia-ocr:v2.23.3 (healthy, deployed 12-Mar-2026)
- **Go**: 1.24, Alpine multi-stage
- **AI**: Claude Opus 4.5 via CLIProxyAPI (localhost:8317)
- **Puerto**: 8081
- **Releases sesion 12-Mar**:
  - v2.23.0: horaFactura en OCR + dedup por datos de factura (no ventana upload)
  - v2.23.1: estado siempre "procesado" (nunca "pendiente")
  - v2.23.2: RNC receptor no coincide → warning (antes: rechazo)
  - v2.23.3: Warning DGII mejorado (sin RNC receptor + RNC diferente)
- **Endpoints activos (10)**: login, process-invoice, mis-facturas, detalle, imagen, delete, resumen, reprocesar, sharepoint-queue, health

### App Movil - APK REBUILD 12-Mar-2026 (80MB)
- **Stack**: React Native 0.76.9, Expo SDK 52, TypeScript
- **Scanner**: react-native-document-scanner-plugin 2.0.4
- **Fixes incluidos en APK**:
  - HomeScreen: campos corregidos (proveedor, fecha_documento, monto)
  - HomeScreen: auto-refresh con useFocusEffect al volver de CameraScreen
  - CameraScreen: warning RNC receptor del backend (banner naranja)
  - InvoiceReviewScreen: auth headers corregidos
  - CameraScreen: navega a 'Home' (antes: 'InvoiceList' crash)
  - Base URL centralizada en src/config/api.ts
  - Cola offline + mensajes error amigables
- **Test user**: RNC 130-309094, PIN 1234 (Acela Associates)

### Infraestructura - UP
- PostgreSQL 16 (supabase-db, puerto 5433 directo)
- MinIO (puerto 9000) - bucket: facturas
- n8n (puerto 5678, localhost only)
- CLIProxyAPI v6.7.32 (puerto 8317, 40+ modelos)
- Coolify (orquestacion Docker)
- Autoheal (monitorea containers unhealthy cada 30s)

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

### Resueltos en v2.23.x (12-Mar-2026)
- ~~HomeScreen campos undefined~~ → proveedor, fecha_documento, monto
- ~~HomeScreen no refrescaba al volver~~ → useFocusEffect
- ~~Estado "pendiente" sin sentido~~ → siempre "procesado"
- ~~RNC receptor rechazaba factura~~ → guarda + warning DGII
- ~~CameraScreen 'InvoiceList' crash~~ → navega a 'Home'
- ~~Base URL hardcodeada~~ → src/config/api.ts centralizado

### Pendientes
- Icono viejo en pantalla de Login
- BD compartida sin aislamiento entre proyectos

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
| sesion-12mar | Duplicados hora + estado + warning DGII | v2.23.3 |

---

## RUTA DE TRABAJO

### Inmediato: Probar APK
1. Descargar APK 80MB al teléfono
2. Probar: escanear factura, verificar auto-refresh, warning RNC
3. Verificar que facturas se muestran correctamente en lista

### Siguiente: UI pendiente
1. Icono viejo en Login → actualizar logo FacturIA

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
