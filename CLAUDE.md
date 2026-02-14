# FacturaIA - Plataforma SaaS Multi-Tenant de Contabilidad

**Rol:** Desarrollador de FacturIA
**Servidor:** 217.216.48.91:2024
**Path Servidor:** ~/eas-builds/FacturaScannerApp
**Path Windows:** C:\FacturaIA

## REPOSITORIOS GITHUB

| Componente | Repo | Descripción |
|------------|------|-------------|
| App Móvil | [CarlosHuyghusrl/facturaia-mobile](https://github.com/CarlosHuyghusrl/facturaia-mobile) | React Native + Expo |
| Backend OCR | [CarlosHuyghusrl/facturaia-ocr](https://github.com/CarlosHuyghusrl/facturaia-ocr) | Go + Claude Opus 4.5 |

---

## VISIÓN DEL PROYECTO

Plataforma SaaS para firmas contables en República Dominicana:
- **100 firmas contables** como clientes
- **300 clientes** por firma (30,000 empresas total)
- **Cumplimiento DGII** automatizado
- **OCR de facturas** con IA

---

## STACK TECNOLÓGICO

| Componente | Tecnología |
|------------|------------|
| App Móvil | React Native + Expo |
| Backend OCR | Go (facturaia-ocr v2.13.0) |
| AI OCR | Claude Opus 4.5 via CLIProxyAPI (localhost:8317) |
| Base de Datos | PostgreSQL 16 + PgBouncer |
| Storage | MinIO (4 buckets) |
| Automatización | n8n |
| Deploy | Coolify en Contabo |

---

## ARQUITECTURA

```
┌─────────────────────────────────────────────────┐
│              SERVIDOR CONTABO                    │
├─────────────────────────────────────────────────┤
│  App Móvil (Expo)                               │
│       ↓                                          │
│  facturaia-ocr (Go) ──→ MinIO Storage           │
│       ↓                                          │
│  PostgreSQL 16 + PgBouncer                      │
│       ↓                                          │
│  n8n (automatización DGII)                      │
└─────────────────────────────────────────────────┘
```

---

## FASES COMPLETADAS

| Fase | Descripción | Estado |
|------|-------------|--------|
| 1 | PostgreSQL 16 + PgBouncer | COMPLETADO |
| 2 | MinIO Storage (4 buckets) | COMPLETADO |
| 3 | Backend Go facturaia-ocr v2.1 | COMPLETADO |
| 4 | App Móvil FacturaIA | COMPLETADO |
| 5 | n8n Automatización | COMPLETADO |
| 6 | Endpoints CRUD adicionales | COMPLETADO |
| 7 | Migración Frontend Supabase → API v2 | COMPLETADO |
| 8 | Migración Final + Deploy Contabo | COMPLETADO |
| 9 | Importar datos Supabase → PostgreSQL | COMPLETADO |
| 10 | Arquitectura OCR-n8n para DGII | PENDIENTE |
| 11 | Migración Document Scanner | COMPLETADO |
| 12 | Claude Opus 4.5 OCR + Vision Mode | COMPLETADO |
| 13 | Image Proxy (MinIO→Backend→App) | COMPLETADO |

---

## APP MÓVIL

### Build Actual
- **APK:** `app-debug.apk` (147 MB)
- **EAS Build:** `9e18b69c-08dd-45d4-80a6-4575a1a0f134`
- **Scanner:** `react-native-document-scanner-plugin`

### Problema Resuelto (13-Ene-2026)
- `vision-camera-ocr` era incompatible con `react-native-vision-camera@4.x`
- Solución: Migración a `react-native-document-scanner-plugin`
- Nueva estrategia: Build local en servidor ANTES de EAS

---

## PATRÓN DE MIGRACIÓN (Supabase → API v2)

```typescript
// ANTES (Supabase)
import { createClientSupabase } from '@/lib/supabase'
const { data, error } = await supabase.from('clientes').select('*')

// DESPUÉS (API v2)
import { clientesApi } from '@/lib/api-v2-client'
const response = await clientesApi.list({ estado: 'activo' })
if (response.success) {
  const clientes = response.data
}
```

---

## COMANDOS

```bash
# App móvil - desarrollo
cd ~/eas-builds/FacturaScannerApp
npx expo start

# Build Android local
npx expo run:android

# Build EAS
eas build --platform android

# Backend Go
cd ~/facturaia-ocr
go run main.go
```

---

## ESTRUCTURA

```
~/eas-builds/FacturaScannerApp/
├── app/                 # Screens React Native
├── components/          # UI components
├── lib/
│   └── api-v2-client.ts # APIs migradas
├── app.json             # Config Expo
└── eas.json             # Config EAS Build

~/factory/apps/facturaia-ocr/  # Backend Go
├── cmd/server/main.go
├── api/handler.go             # Routes + ProcessInvoice
├── api/client_handlers.go     # Client CRUD + Image proxy
├── internal/ai/               # AI providers (OpenAI, Gemini, Ollama)
├── internal/auth/             # JWT + Client auth (RNC+PIN)
├── internal/db/               # PostgreSQL queries
├── internal/storage/          # MinIO client
└── config.yaml
```

---

## INTEGRACIONES

### MinIO Storage
- 4 buckets configurados
- Acceso via API compatible S3

### n8n Workflows
- Procesamiento automático de facturas
- Generación de formatos DGII
- Notificaciones

### DGII
- Formatos fiscales RD
- Validación de NCF
- Generación 606, 607, etc.

---

## MEMORIA Y CONTEXTO

- **Task actual:** `~/memoria-permanente/brain/current/facturaia/task.md`
- **History:** `~/memoria-permanente/brain/current/facturaia/history.md`

---

## PENDIENTES

1. **Fase 10:** Arquitectura OCR-n8n completa para DGII
2. **Multi-tenant:** Aislamiento por firma contable
3. **Dashboard web:** Panel para firmas contables

---

## ESTILO DE TRABAJO

- Escalable, seguro, eficiente
- Priorizar experiencia móvil
- Cumplimiento normativo DGII
- Documentar en task.md


---

## ESTADO ACTUAL (12-Feb-2026)

### Backend v2.13.0 - DESPLEGADO
- **Docker:** `facturaia-ocr:v2.13.0` en puerto 8081 con `--init` (anti-zombie)
- **DGII Completo:** 20+ campos fiscales con extracción IA completa
- **Campos de Impuestos DGII (v2.13.0):**
  - ITBIS: itbis, itbisTasa, itbisRetenido, itbisExento, itbisProporcionalidad, itbisCosto
  - ISR: isr, retencionIsrTipo (códigos 1-8)
  - ISC: isc, iscCategoria (seguros 16%, telecom 10%, alcohol, tabaco, vehículos, combustibles)
  - Otros: cdtMonto (2%), cargo911, propina (10%), otrosImpuestos, montoNoFacturable
  - Base: subtotal, descuento
- **Validación Integrada:** POST /api/v1/invoices/validate con 9+ reglas DGII
  - NCF format + tipos (B01, B02, B04, B14, B15, B16, E31-E45)
  - ITBIS 18% normal o 16% zona franca
  - ISR rates por tipo: 1-8 (10%, 25%, 27%)
  - Propina legal 10%, telecom (ISC 10%, CDT 2%)
  - Tolerancia 5% para diferencias de redondeo
- **Flujo OCR+Validación:** ProcessInvoice ahora valida y asigna extraction_status
  - validated: factura OK
  - review: needs_review=true o confidence<0.85
  - error: validación falló
- **AI Provider:** Claude Opus 4.5 via CLIProxyAPI (openai-compatible)
- **Vision Mode:** Habilitado para openai y gemini (imagen directa, sin Tesseract)
- **Image Proxy:** `/api/facturas/{id}/imagen` sirve imagenes de MinIO al movil
- **DB:** PostgreSQL via PgBouncer (localhost:5433) + extraction_status, review_notes
- **Storage:** MinIO (gestoria_minio / localhost:9000)

### App Móvil - InvoiceReviewScreen (NUEVO)
- **Pantalla de revisión:** Campos editables con indicadores de validación
- **Flujo automático:** extraction_status='review'/'error' → navega a InvoiceReview
- **Indicadores visuales:** borde rojo=error, amarillo=warning, verde=válido
- **Valores calculados:** base_gravada, itbis_esperado, total_esperado, propina_esperada
- **Acciones:** Aprobar (→validated) o Corregir y Guardar (re-valida)

### Deploy Command (REFERENCIA)
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
  --init \
  facturaia-ocr:v2.13.0
```

### Test User (App Movil)
- **RNC:** 130-309094
- **PIN:** 1234
- **Razon Social:** Acela Associates

---

## PROBLEMAS CONOCIDOS (12-Feb-2026)

### ✅ RESUELTO: Zombies en healthcheck
- **Causa:** wget en healthcheck no se limpiaba
- **Solución:** `--init` flag en docker run (tini como PID 1)

### Camara no funciona en APK actual
- `react-native-image-picker` launchCamera no abre en APK debug
- Workaround: usar "Escaner Documentos" o "Galeria"
- Posible causa: falta rebuild con dependencias nativas

### Build lento en servidor
- Gradle daemon consume 1.5GB RAM cuando corre
- Matar con `pkill -f gradle` si no se esta usando
- Se re-lanza automaticamente al hacer build

---

## CREDENCIALES

### Backend OCR
- Puerto: 8081
- Endpoint: http://217.216.48.91:8081
- Image proxy: http://217.216.48.91:8081/api/facturas/{id}/imagen (no auth, UUID-protected)

### MinIO
- User: gestoria_minio
- Pass: mMG3F4M42vgcGggEpAhAQuZ349jBkl
- Bucket: facturas

### CLIProxyAPI - Proxy IA Multi-Proveedor (10-Feb-2026)
- **URL:** http://localhost:8317/v1
- **Key:** sk-7mFaCRaXj5sp1S5G82S17sF4ClsTzn0ObP1D8yzPEQYmZ

**Proveedores OAuth disponibles:**
| Proveedor | Cuenta | Modelos |
|-----------|--------|---------|
| Claude | radelqui@gmail.com | claude-opus-4-5-*, claude-sonnet-4-*, claude-haiku-* |
| Gemini Pro | carlos@huyghusrl.com | gemini-2.5-pro, gemini-2.5-flash |

**Modelo OCR recomendado:** claude-opus-4-5-20251101

**Uso Gemini (tareas rápidas):**
```bash
curl http://localhost:8317/v1/chat/completions \
  -H "Authorization: Bearer sk-7mFaCRaXj5sp..." \
  -d '{"model":"gemini-2.5-flash", "messages":[...]}'
```

---

## REGLAS PARA AGENTES

- Idioma: Espanol
- Documentar CADA cambio en CLAUDE.md automaticamente
- NO pedir permiso para documentar
- Build local SIEMPRE antes de EAS
- NUNCA npm install sin --ignore-scripts
- Probar en dispositivo real antes de EAS production


## 🔄 DELEGACIÓN A GEMINI (Ahorro de Tokens)

### Endpoint
- URL: http://localhost:8317/v1/chat/completions
- Auth: Bearer sk-7mFaCRaXj5sp1S5G82S17sF4ClsTzn0ObP1D8yzPEQYmZ
- Script helper: ~/scripts/ask-gemini.sh

### Cuándo delegar automáticamente a Gemini
| Tipo de tarea | Acción | Modelo |
|---------------|--------|--------|
| Búsquedas, investigación, "qué dice la ley", "últimas noticias" | Delegar | gemini-2.5-flash |
| Resumir documentos, traducir, extraer datos de texto largo | Delegar | gemini-2.5-flash |
| Analizar PDFs o documentos complejos | Delegar | gemini-2.5-pro |
| Comparar información, tablas de datos | Delegar | gemini-2.5-flash |
| Escribir código, diseñar arquitectura, debug, decisiones técnicas | NO delegar (usar mis tokens) | - |
| Tareas con contexto del proyecto que Gemini no tiene | NO delegar | - |

### Cómo delegar
```bash
# Opción 1: Script helper
~/scripts/ask-gemini.sh "tu pregunta" > resultado.md

# Opción 2: Con modelo específico
~/scripts/ask-gemini.sh "análisis complejo" --model gemini-2.5-pro

# Opción 3: Via pipe (para archivos)
cat documento.txt | ~/scripts/ask-gemini.sh "resume en 300 palabras"

# Opción 4: Curl directo (si necesitas más control)
curl -s http://localhost:8317/v1/chat/completions \
  -H "Authorization: Bearer sk-7mFaCRaXj5sp1S5G82S17sF4ClsTzn0ObP1D8yzPEQYmZ" \
  -H "Content-Type: application/json" \
  --max-time 120 \
  -d @<(jq -n --arg prompt "TU PREGUNTA" '{model:"gemini-2.5-flash",messages:[{role:"user",content:$prompt}]}') \
  | jq -r '.choices[0].message.content'
```

### Tags en planes de Cowork
Cuando Carlos envíe planes via git con estas tags, ejecutar así:
- [GEMINI] → delegar a gemini-2.5-flash
- [GEMINI:pro] → delegar a gemini-2.5-pro
- [CLAUDE:agente] → ejecutar con sub-agente indicado
- Sin tag → yo decido según el contenido

### Reglas importantes
1. SIEMPRE guardar resultados de Gemini en plans/results/ para trazabilidad
2. NUNCA enviar código fuente del proyecto a Gemini (solo preguntas/documentos)
3. Si Gemini falla o da timeout, reportar a Carlos y continuar con mis tokens
4. Loguear cada delegación: "🔄 Delegado a Gemini: [descripción corta]"
