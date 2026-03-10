# PLAN: SharePoint Integration + Mensajes Amigables de Error

**Fecha**: 10-Mar-2026
**Autor**: Arquitecto FacturaIA
**Estado**: Plan listo para aprobación
**Rama**: main
**Directorio**: ~/eas-builds/FacturaScannerApp

---

## PREREQUISITOS

- [ ] sharepoint_service.py en /home/gestoria/o365-sync/ — EXISTENTE y funcional
- [ ] 315 clientes mapeados en tabla `sharepoint_clientes_mapeo` — EXISTENTE
- [ ] facturaia-ocr:v2.18.0 corriendo en puerto 8081 — EXISTENTE
- [ ] MinIO corriendo en localhost:9000 — EXISTENTE
- [ ] PostgreSQL accesible en localhost:5433 — EXISTENTE
- [ ] Verificar que Client Secret de Azure no haya expirado (riesgo)

---

## TAREA 1: SharePoint Sync

### Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                      FLUJO COMPLETO                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  App Móvil                                                      │
│      │  POST /api/process-invoice                              │
│      ▼                                                          │
│  facturaia-ocr (Go, puerto 8081)                               │
│      │                                                          │
│      ├──► MinIO (guarda imagen) ──► OK                         │
│      │                                                          │
│      ├──► PostgreSQL (guarda factura) ──► OK                   │
│      │                                                          │
│      └──► sharepoint_sync_queue (INSERT) ──► pendiente          │
│                                                                 │
│                    [cada 2 min]                                 │
│                         │                                       │
│  sharepoint_sync_worker.py                                     │
│      │                                                          │
│      ├──► Lee cola (status=pending, attempts<5)                │
│      │                                                          │
│      ├──► Descarga imagen de MinIO                             │
│      │                                                          │
│      ├──► sharepoint_service.py                                │
│      │        └──► Microsoft Graph API                         │
│      │               └──► huyghusrl.sharepoint.com             │
│      │                    /sites/HuyghuAsoc                    │
│      │                    /{ubicacion}/{carpeta_cliente}/       │
│      │                    FacturaIA/{YYYY-MM}/{archivo}         │
│      │                                                          │
│      └──► Marca synced en BD / registra error                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Estructura de carpetas SharePoint

```
{ubicacion}/{carpeta_cliente}/FacturaIA/{YYYY-MM}/{filename}

Ejemplo:
  Contabilidad/Acela Associates/FacturaIA/2026-01/factura-uuid-001.jpg
  Contabilidad/EmpresaXYZ/FacturaIA/2026-03/factura-uuid-002.jpg
```

Donde:
- `{ubicacion}` viene de `sharepoint_clientes_mapeo.ubicacion`
- `{carpeta_cliente}` viene de `sharepoint_clientes_mapeo.nombre_carpeta`
- `{YYYY-MM}` viene de la fecha de emisión de la factura
- `{filename}` es el nombre del archivo en MinIO

---

### Wave 1: Backend (Go) — Cola de Sync

**Archivos a modificar/crear en facturaia-ocr**:
- `internal/db/sharepoint_queue.go` (nuevo)
- `api/handler.go` (modificar ProcessInvoice para insertar en cola)
- `api/admin_handlers.go` (nuevo endpoint de monitoreo)

**Sub-agente**: 1 × Sonnet

#### Tabla nueva: `sharepoint_sync_queue`

```sql
CREATE TABLE IF NOT EXISTS sharepoint_sync_queue (
    id              BIGSERIAL PRIMARY KEY,
    factura_id      BIGINT NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
    rnc_cliente     VARCHAR(15) NOT NULL,
    fecha_factura   DATE,
    archivo_url     TEXT NOT NULL,        -- ruta en MinIO (bucket/filename)
    filename        TEXT NOT NULL,        -- nombre del archivo
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
                                          -- pending, synced, failed, skipped
    attempts        INTEGER NOT NULL DEFAULT 0,
    last_error      TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced_at       TIMESTAMP WITH TIME ZONE,
    next_retry_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sharepoint_queue_status ON sharepoint_sync_queue(status, next_retry_at);
CREATE INDEX idx_sharepoint_queue_factura ON sharepoint_sync_queue(factura_id);
```

#### Cambio en ProcessInvoice (handler.go)

Después de guardar exitosamente en MinIO Y en BD:
```go
// Insertar en cola de sync SharePoint (no bloquea si falla)
err = db.InsertSharePointQueueItem(ctx, factura.ID, clienteRNC, factura.FechaEmision, minioURL, filename)
if err != nil {
    log.Printf("WARNING: No se pudo encolar sync SharePoint para factura %d: %v", factura.ID, err)
    // No retornamos error — el procesamiento principal fue exitoso
}
```

#### Endpoint de monitoreo: GET /api/admin/sharepoint-status

Response:
```json
{
  "queue": {
    "pending": 3,
    "synced": 142,
    "failed": 1,
    "total": 146
  },
  "oldest_pending_minutes": 4,
  "last_sync": "2026-03-10T14:22:00Z",
  "alert": false
}
```

**Criterio de alerta**: `pending > 10` AND `oldest_pending_minutes > 60`

---

### Wave 2: Worker Python — Sync Service

**Archivo nuevo**: `/home/gestoria/eas-builds/FacturaScannerApp/scripts/sharepoint_sync_worker.py`

**Dependencias** (ya instaladas en o365-sync):
- `msal`, `requests`, `psycopg2`, `minio`

**Lógica del worker**:

```python
# Pseudocódigo del flujo principal
def run_worker():
    items = db.query("""
        SELECT * FROM sharepoint_sync_queue
        WHERE status = 'pending'
          AND attempts < 5
          AND next_retry_at <= NOW()
        ORDER BY created_at ASC
        LIMIT 20
    """)

    for item in items:
        try:
            # 1. Obtener mapeo RNC → carpeta SharePoint
            mapeo = db.query("SELECT * FROM sharepoint_clientes_mapeo WHERE rnc = %s", item.rnc)
            if not mapeo:
                mark_skipped(item.id, "RNC sin mapeo SharePoint")
                continue

            # 2. Descargar de MinIO
            image_data = minio_client.get_object(BUCKET, item.filename)

            # 3. Construir ruta SharePoint
            fecha_str = item.fecha_factura.strftime("%Y-%m") if item.fecha_factura else "sin-fecha"
            sp_path = f"{mapeo.ubicacion}/{mapeo.nombre_carpeta}/FacturaIA/{fecha_str}"

            # 4. Subir a SharePoint
            sharepoint.subir_archivo(sp_path, item.filename, image_data, "image/jpeg")

            # 5. Marcar como synced
            mark_synced(item.id)
            log.info(f"Factura {item.factura_id} sincronizada a SharePoint: {sp_path}/{item.filename}")

        except Exception as e:
            attempts = item.attempts + 1
            next_retry = calculate_next_retry(attempts)
            mark_failed(item.id, str(e), attempts, next_retry)
            log.error(f"Error sync factura {item.factura_id} (intento {attempts}/5): {e}")
```

**Backoff exponencial para reintentos**:

| Intento | Espera antes del siguiente |
|---------|---------------------------|
| 1       | 1 minuto                  |
| 2       | 5 minutos                 |
| 3       | 15 minutos                |
| 4       | 30 minutos                |
| 5       | 60 minutos (último)       |

Después de 5 intentos fallidos → status='failed' (NO se reintenta sin intervención manual).

**Métricas y logging**:
- Log en `/var/log/sharepoint_sync.log` con rotación diaria
- Formato: `[YYYY-MM-DD HH:MM:SS] [INFO/ERROR] mensaje`
- Métricas: items procesados, tiempo promedio, errores por tipo

---

### Wave 3: Cron + Monitoreo

**Cron entry** (en crontab del usuario gestoria):
```cron
*/2 * * * * /usr/bin/python3 /home/gestoria/eas-builds/FacturaScannerApp/scripts/sharepoint_sync_worker.py >> /var/log/sharepoint_sync.log 2>&1
```

**Script de instalación**:
```bash
# Añadir al crontab
crontab -l | { cat; echo "*/2 * * * * /usr/bin/python3 /home/gestoria/eas-builds/FacturaScannerApp/scripts/sharepoint_sync_worker.py >> /var/log/sharepoint_sync.log 2>&1"; } | crontab -
```

**Alerta automática** (script de monitoreo separado, cron cada hora):
- Si hay >10 items pendientes por >1 hora → enviar alerta via Telegram MCP
- Verificar que el último sync fue hace menos de 10 minutos

**Dashboard OpenClaw**:
- POST http://localhost:9091/metrics/sharepoint con estadísticas de la cola
- Visible desde panel de control central

**Estimación Wave 3**: 30 min sub-agente

---

### Estimación total Tarea 1

| Wave | Trabajo | Tiempo estimado |
|------|---------|-----------------|
| Wave 1 | Go: tabla + INSERT en handler + endpoint admin | 1 hora |
| Wave 2 | Python: worker + integración MinIO + SharePoint | 1.5 horas |
| Wave 3 | Cron + monitoreo + OpenClaw | 30 min |
| **Total** | | **~3 horas** |

---

## TAREA 2: Mensajes Amigables de Error

### Principio fundamental

```
LA IMAGEN NUNCA SE PIERDE:
  Si falla IA       → imagen queda en MinIO + factura con status='error'
  Si falla MinIO    → imagen queda en dispositivo
  Si falla todo     → imagen queda en dispositivo (cola local)
  Si falla la red   → imagen queda en cola local del dispositivo
```

---

### Wave 1: Backend — Error Codes Estructurados

**Archivos a modificar en facturaia-ocr**:
- `api/errors.go` (nuevo — definición de error codes)
- `api/handler.go` (modificar respuestas de error)
- `internal/ai/` (agregar error types)

**Sub-agente**: 1 × Sonnet

#### Estructura de respuesta de error estandarizada

```json
{
  "success": false,
  "error": "mensaje técnico para logs",
  "error_code": "ai_parse_error",
  "user_message": "No pudimos extraer la información. Intenta con mejor iluminación o una foto más nítida.",
  "retryable": true,
  "factura_id": 123
}
```

#### Catálogo de error codes

| error_code | HTTP Status | Retryable | Causa |
|------------|-------------|-----------|-------|
| `ai_unavailable` | 503 | true | IA no responde o timeout |
| `ai_parse_error` | 200 | true | IA respondió pero no pudo leer la factura |
| `storage_unavailable` | 503 | true | MinIO no disponible |
| `db_unavailable` | 503 | true | PostgreSQL/PgBouncer no disponible |
| `format_unsupported` | 400 | false | Formato de imagen no soportado |
| `timeout` | 504 | true | Procesamiento tomó más de 30 segundos |
| `auth_failed` | 401 | false | Token inválido o expirado |
| `client_not_found` | 404 | false | RNC no registrado |
| `quota_exceeded` | 429 | true | Límite de facturas alcanzado |

#### Cambio en ProcessInvoice

```go
// Cuando IA falla (no puede parsear)
if err != nil {
    return ErrorResponse{
        ErrorCode:   "ai_parse_error",
        UserMessage: "No pudimos extraer la información. Intenta con mejor iluminación o una foto más nítida.",
        Retryable:   true,
        FacturaID:   factura.ID, // La factura sí se guardó con status=error
    }, http.StatusOK // 200 porque la imagen SÍ se guardó
}

// Cuando MinIO falla
if err != nil {
    return ErrorResponse{
        ErrorCode:   "storage_unavailable",
        UserMessage: "El almacenamiento no está disponible. Por favor intenta de nuevo en unos minutos.",
        Retryable:   true,
    }, http.StatusServiceUnavailable
}
```

---

### Wave 2: Frontend — Detección de Red y Mapeo de Errores

**Archivos a crear/modificar**:
- `lib/errorMessages.ts` (nuevo — mapeo completo)
- `lib/apiClient.ts` (modificar para usar error_code)
- `lib/networkStatus.ts` (nuevo — detección de conectividad)

**Sub-agente**: 1 × Sonnet

#### lib/errorMessages.ts

```typescript
export const ERROR_MESSAGES: Record<string, ErrorMessage> = {
  ai_unavailable: {
    title: "IA no disponible",
    message: "El servicio de IA no está disponible. Tu factura se guardó y se procesará automáticamente.",
    action: "Ver facturas pendientes",
    icon: "cloud-off",
  },
  ai_parse_error: {
    title: "No pudimos leer la factura",
    message: "No pudimos extraer la información. Intenta con mejor iluminación o una foto más nítida.",
    action: "Tomar otra foto",
    icon: "camera",
  },
  storage_unavailable: {
    title: "Almacenamiento no disponible",
    message: "El almacenamiento no está disponible. Por favor intenta de nuevo en unos minutos.",
    action: "Reintentar",
    icon: "server-off",
  },
  db_unavailable: {
    title: "Problema guardando datos",
    message: "Hubo un problema guardando los datos. Tu imagen está segura y reintentaremos en unos minutos.",
    action: "Reintentar",
    icon: "database-off",
  },
  format_unsupported: {
    title: "Formato no compatible",
    message: "Este formato de imagen no es compatible. Usa JPG, PNG o PDF.",
    action: "Seleccionar otra imagen",
    icon: "file-x",
  },
  timeout: {
    title: "Procesamiento tardando",
    message: "El procesamiento está tardando más de lo normal. Tu factura está en cola y la recibirás pronto.",
    action: "Ir al inicio",
    icon: "clock",
  },
  no_internet: {
    title: "Sin conexión",
    message: "No hay conexión a internet. La imagen se guardó localmente y se procesará cuando vuelva la conexión.",
    action: "Ver cola local",
    icon: "wifi-off",
  },
  auth_failed: {
    title: "Sesión expirada",
    message: "Tu sesión ha expirado. Por favor inicia sesión nuevamente.",
    action: "Iniciar sesión",
    icon: "lock",
  },
};

export function getErrorMessage(errorCode?: string): ErrorMessage {
  return ERROR_MESSAGES[errorCode ?? ''] ?? {
    title: "Error inesperado",
    message: "Ocurrió un error inesperado. Por favor intenta de nuevo.",
    action: "Reintentar",
    icon: "alert-circle",
  };
}
```

#### Modificación en apiClient.ts

- Antes de cada llamada: verificar conectividad con `NetInfo`
- Si no hay internet: throw con `error_code: 'no_internet'` SIN hacer fetch
- Si la respuesta incluye `error_code`: propagar ese code al caller
- AbortController timeout: al expirar → throw con `error_code: 'timeout'`

---

### Wave 3: Frontend — Cola Offline

**Archivos a crear/modificar**:
- `lib/offlineQueue.ts` (nuevo — cola persistente con AsyncStorage)
- `hooks/useOfflineQueue.ts` (nuevo — hook para procesar cola)
- `screens/CameraScreen.tsx` (modificar para usar cola offline)
- `screens/HomeScreen.tsx` (modificar para mostrar badge de pendientes)

**Sub-agente**: 1 × Sonnet

#### lib/offlineQueue.ts — Estructura

```typescript
interface OfflineQueueItem {
  id: string;            // UUID local
  imageUri: string;      // URI local en dispositivo
  filename: string;
  timestamp: number;
  attempts: number;
  status: 'pending' | 'uploading' | 'failed';
  lastError?: string;
}

// Operaciones
- addToQueue(imageUri, filename): Promise<string>
- getQueue(): Promise<OfflineQueueItem[]>
- getPendingCount(): Promise<number>
- markUploading(id): Promise<void>
- markFailed(id, error): Promise<void>
- removeFromQueue(id): Promise<void>
- processQueue(): Promise<void>  // Procesa todos los pendientes
```

#### Flujo en CameraScreen cuando no hay internet

```
Usuario escanea factura
    │
    ▼
NetInfo.isConnected === false?
    │
    ├── SÍ → offlineQueue.addToQueue(imageUri)
    │         → Toast: "Sin conexión. Guardado localmente, se procesará al volver la conexión"
    │         → HomeScreen badge actualizado
    │
    └── NO → apiClient.processInvoice(imageUri)
              → Si falla → ver error_code → mensaje amigable
```

#### Badge en HomeScreen

```typescript
// Header o tab bar muestra:
// "3 facturas pendientes de subir" (badge naranja)
// Al tocar → pantalla con lista de facturas en cola local
```

**Procesamiento automático de cola**:
- Al abrir la app: verificar si hay pendientes + hay internet → procesar cola
- AppState listener: cuando la app vuelve a primer plano → mismo check
- NetInfo listener: cuando cambia isConnected true → procesar cola

---

### Wave 4: Frontend — UX de Estados de Subida

**Archivos a modificar**:
- `components/UploadStatusCard.tsx` (nuevo)
- `screens/CameraScreen.tsx` (modificar para usar UploadStatusCard)

**Sub-agente**: 1 × Sonnet

#### Estados visuales con mensajes

| Estado | Color | Icono | Mensaje | Acción disponible |
|--------|-------|-------|---------|-------------------|
| `uploading` | Azul | spinner | "Subiendo factura..." | Cancelar |
| `processing` | Azul | brain | "IA extrayendo datos..." | — |
| `success` | Verde | check | "Factura procesada correctamente" | Ver detalle |
| `queued_local` | Naranja | clock | "Guardado sin conexión. Se subirá automáticamente." | Ver cola |
| `queued_server` | Amarillo | server | "En cola del servidor. Recibirás los datos pronto." | Ver historial |
| `error_retryable` | Rojo | refresh | [mensaje del error_code] | Reintentar |
| `error_permanent` | Rojo | x | [mensaje del error_code] | Tomar nueva foto |

**Componente UploadStatusCard**:
- Card animada que aparece después de escanear
- Muestra el estado actual con transición suave
- Botón de acción contextual
- Se puede descartar después de 'success'

---

### Estimación total Tarea 2

| Wave | Trabajo | Tiempo estimado |
|------|---------|-----------------|
| Wave 1 | Go: error codes + respuestas estandarizadas | 1 hora |
| Wave 2 | RN: errorMessages.ts + apiClient + NetInfo | 45 min |
| Wave 3 | RN: offlineQueue + hook + badge Home | 1.5 horas |
| Wave 4 | RN: UploadStatusCard + UX mejorada | 45 min |
| **Total** | | **~4 horas** |

---

## DEPENDENCIAS ENTRE TAREAS

```
Tarea 1 Wave 1 (Go: cola)       ──────────────────► Tarea 1 Wave 2 (worker)
                                                              │
                                                              ▼
                                                     Tarea 1 Wave 3 (cron)

Tarea 2 Wave 1 (Go: errores)    ──► Tarea 2 Wave 2 (RN: mapeo)
                                              │
                                              ▼
                                     Tarea 2 Wave 3 (cola offline)
                                              │
                                              ▼
                                     Tarea 2 Wave 4 (UX estados)

PARALELO POSIBLE:
  Tarea 1 Wave 1  ‖  Tarea 2 Wave 1   (ambos tocan Go, pero archivos distintos)
  Tarea 1 Wave 2  ‖  Tarea 2 Wave 2   (Python ‖ TypeScript — independientes)
```

---

## PLAN DE EJECUCIÓN RECOMENDADO

### Día 1 (3-4 horas)
1. **Pre**: `git pull` + `git tag pre-sharepoint-errores`
2. **Wave A** (paralelo): T1-Wave1 (tabla SQL + Go) + T2-Wave1 (error codes Go)
3. Verificar: build Go sin errores, tabla creada en BD
4. Commit: `[FEAT] Backend: SharePoint queue + structured error codes`

### Día 1 continuación
5. **Wave B** (paralelo): T1-Wave2 (Python worker) + T2-Wave2 (RN error mapping)
6. Verificar: worker procesa item de prueba, apiClient usa error codes
7. Commit: `[FEAT] SharePoint worker + RN error messages`

### Día 2 (2-3 horas)
8. **Wave C**: T2-Wave3 (cola offline) — requiere Wave B completo
9. Verificar: modo avión → escanear → encolar → volver online → procesar
10. **Wave D** (paralelo con C si es posible): T1-Wave3 (cron) + T2-Wave4 (UX)
11. Commit final + build APK para prueba

---

## VERIFICACIÓN

### Test SharePoint Sync
```bash
# 1. Subir una factura real en la app
# 2. Verificar que aparece en la cola
curl http://localhost:8081/api/admin/sharepoint-status

# 3. Ejecutar worker manualmente
python3 scripts/sharepoint_sync_worker.py

# 4. Verificar en SharePoint que el archivo aparece en la ruta correcta
# 5. Verificar que status=synced en BD
psql -h localhost -p 5433 -U postgres -c "SELECT * FROM sharepoint_sync_queue WHERE status='synced' ORDER BY synced_at DESC LIMIT 5;"
```

### Test Mensajes de Error
```bash
# Simular IA no disponible: parar CLIProxyAPI → subir factura → verificar mensaje
# Simular sin internet: modo avión en dispositivo → escanear → verificar cola local
# Simular timeout: reducir timeout a 1ms temporalmente → subir factura → verificar mensaje
# Simular MinIO caído: docker stop minio → subir → verificar error storage_unavailable
```

### Build APK post-cambios
```bash
cd ~/eas-builds/FacturaScannerApp/android
./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk
```

---

## RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Client Secret Azure expirado | Media | Alto | Verificar antes de Wave 2 de T1: `curl` al endpoint Graph con el secret actual |
| Worker Python sin acceso a MinIO | Baja | Alto | Confirmar que python3 puede importar minio y conectarse a localhost:9000 |
| Cola offline crece demasiado | Baja | Medio | Límite de 50 items en cola local. Si supera → alertar al usuario |
| Dos workers corriendo al mismo tiempo | Media | Medio | Lock file: el worker no corre si hay otra instancia activa (`/tmp/sharepoint_worker.lock`) |
| RNC sin mapeo en SharePoint | Media | Bajo | Worker marca como 'skipped' (no bloquea), log para revisión manual |
| Error codes rompen clientes viejos | Baja | Medio | Respuesta backward-compatible: siempre incluye `error` (campo existente) + agrega `error_code` nuevo |

---

## ARCHIVOS QUE SE CREARÁN/MODIFICARÁN

### Backend (facturaia-ocr — repo separado)
- `internal/db/sharepoint_queue.go` — NUEVO
- `api/errors.go` — NUEVO
- `api/handler.go` — MODIFICAR (ProcessInvoice + error codes)
- `api/admin_handlers.go` — NUEVO o MODIFICAR
- Migración SQL: `sharepoint_sync_queue` table

### Scripts (este repo)
- `scripts/sharepoint_sync_worker.py` — NUEVO
- `scripts/install_sharepoint_cron.sh` — NUEVO

### App Móvil (este repo)
- `lib/errorMessages.ts` — NUEVO
- `lib/networkStatus.ts` — NUEVO
- `lib/offlineQueue.ts` — NUEVO
- `lib/apiClient.ts` — MODIFICAR
- `hooks/useOfflineQueue.ts` — NUEVO
- `components/UploadStatusCard.tsx` — NUEVO
- `screens/CameraScreen.tsx` — MODIFICAR
- `screens/HomeScreen.tsx` — MODIFICAR (badge pendientes)

---

## ESTADO: PENDIENTE DE APROBACIÓN

**Esperando**: Que Carlos apruebe este plan antes de ejecutar.
**Cuando Carlos apruebe**: `git pull` + ejecutar waves según plan de ejecución.
**Punto de retorno**: `git tag pre-sharepoint-errores` antes de iniciar.
