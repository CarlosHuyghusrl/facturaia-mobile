# ARQUITECTURA FACTURAIA — Referencia Maestra
**Fecha**: 2026-03-10 | **Version**: 1.0 | **Estado**: Activo en produccion

> Este documento es la fuente de verdad para la arquitectura de FacturaIA. Actualizar despues de cada cambio estructural.

---

## 1. VISION GENERAL DEL SISTEMA

FacturaIA es una plataforma SaaS multi-tenant de contabilidad para Republica Dominicana que permite a firmas contables y sus clientes escanear facturas, extraer datos fiscales via IA, y generar reportes para la DGII.

### Diagrama de Sistema Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                    DISPOSITIVO MOVIL                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  FacturaIA App (React Native + Expo SDK 52)              │   │
│  │  ├── LoginScreen (RNC+PIN)                               │   │
│  │  ├── HomeScreen (lista + resumen)                        │   │
│  │  ├── CameraScreen (scanner + galeria)                    │   │
│  │  ├── InvoiceDetailScreen (detalle read-only)             │   │
│  │  └── InvoiceReviewScreen (revision post-OCR editable)   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │ HTTPS                               │
└────────────────────────────┼────────────────────────────────────┘
                             │ 217.216.48.91:8081
┌────────────────────────────┼────────────────────────────────────┐
│              SERVIDOR CONTABO (VPS)                              │
│                            ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  facturaia-ocr (Go 1.24, Docker host network)            │   │
│  │  ├── cmd/server/main.go (entry point)                    │   │
│  │  ├── api/handler.go (rutas + handlers)                   │   │
│  │  ├── api/client_handlers.go (mobile handlers)           │   │
│  │  ├── internal/ai/ (extractor + providers)               │   │
│  │  ├── internal/auth/ (JWT + login)                        │   │
│  │  ├── internal/db/ (pgxpool)                              │   │
│  │  ├── internal/ocr/ (ImageMagick + Tesseract)            │   │
│  │  ├── internal/services/ (tax_validator)                  │   │
│  │  └── internal/storage/ (MinIO client)                   │   │
│  └──────────┬───────────┬────────────┬────────────────────┘   │
│             │           │            │                           │
│             ▼           ▼            ▼                           │
│  ┌──────────────┐ ┌──────────┐ ┌──────────────────────────┐   │
│  │ PostgreSQL16  │ │  MinIO   │ │  CLIProxyAPI :8317        │   │
│  │ (port 5433)  │ │ :9000    │ │  (Claude + Gemini + etc)  │   │
│  │ 97 tablas    │ │ 4 buckets│ │  40+ model aliases        │   │
│  └──────────────┘ └──────────┘ └──────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Servicios Auxiliares                                    │   │
│  │  ├── n8n :5678 (automatizacion DGII)                    │   │
│  │  ├── Supabase Pooler (supavisor - NO usado por OCR)     │   │
│  │  └── Coolify (orquestacion Docker)                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. BACKEND GO SERVICE

**Repositorio**: `CarlosHuyghusrl/facturaia-ocr`
**Path en servidor**: `/home/gestoria/factory/apps/facturaia-ocr/`
**Docker image**: `facturaia-ocr:v2.17.2`
**Puerto**: `8081`
**Runtime**: Go 1.24, Alpine (multi-stage Dockerfile)
**Flag especial**: `--init` (tini como PID 1, evita procesos zombie)

### Estructura del Proyecto Go

```
/home/gestoria/factory/apps/facturaia-ocr/
├── cmd/server/main.go              # Entry point — carga config, inicia DB, AI, HTTP server
├── api/
│   ├── handler.go                  # Handler struct, rutas principales + handlers empresa
│   └── client_handlers.go          # Handlers para clientes moviles
├── internal/
│   ├── ai/
│   │   ├── extractor.go            # Prompt DGII (30+ campos), scoring de confianza
│   │   └── providers.go            # OpenAI-compat, Gemini, Ollama
│   ├── auth/
│   │   ├── jwt.go                  # Init, generate, validate, middleware RequireRole
│   │   ├── login.go                # Login empresa (email + password)
│   │   └── client_auth.go          # Login cliente movil (RNC + PIN bcrypt)
│   ├── db/
│   │   ├── pool.go                 # pgxpool: MaxConns=10, MinConns=2, timeout 10s
│   │   ├── invoices.go             # CRUD facturas empresa (emp_<alias>.facturas)
│   │   └── client_invoices.go      # CRUD facturas cliente (public.facturas_clientes)
│   ├── models/invoice.go           # Structs principales
│   ├── ocr/
│   │   ├── preprocessor.go         # Pre-procesado con ImageMagick
│   │   └── tesseract.go            # OCR con Tesseract (modo no-vision)
│   ├── services/
│   │   └── tax_validator.go        # 12 reglas de validacion DGII
│   └── storage/
│       └── minio.go                # Operaciones MinIO (upload, get, delete)
├── config.yaml                     # Configuracion de entorno
├── Dockerfile                      # Multi-stage Alpine build
└── go.mod                          # Go 1.24
```

### Tabla de Endpoints

| Metodo | Ruta | Handler | Auth | Descripcion |
|--------|------|---------|------|-------------|
| GET | `/health` | `Handler.Health` | NO | Healthcheck (ATENCION: no verifica DB) |
| POST | `/api/login` | `auth.LoginHandler` | NO | Login empresa (email+password) |
| POST | `/api/clientes/login/` | `auth.ClientLoginHandler` | NO | Login cliente movil (RNC+PIN) |
| GET | `/api/facturas/{id}/imagen` | `Handler.GetClientInvoiceImage` | NO* | Imagen factura via MinIO (UUID-protected) |
| GET | `/api/clientes/me/` | `auth.ClientMeHandler` | JWT | Datos del cliente autenticado |
| POST | `/api/process-invoice` | `Handler.ProcessInvoice` | JWT | Procesar nueva factura (OCR + AI) |
| POST | `/api/facturas/upload/` | `Handler.ProcessInvoice` | JWT | Alias de process-invoice |
| GET | `/api/invoices` | `Handler.GetInvoices` | JWT | Lista facturas empresa (legacy) |
| GET | `/api/invoice/{id}` | `Handler.GetInvoice` | JWT | Detalle factura empresa |
| PUT | `/api/invoice/{id}` | `Handler.UpdateInvoice` | JWT | Actualizar factura empresa |
| DELETE | `/api/invoice/{id}` | `Handler.DeleteInvoice` | JWT | Eliminar factura empresa |
| GET | `/api/stats` | `Handler.GetStats` | JWT | Estadisticas empresa |
| GET | `/api/facturas/mis-facturas/` | `Handler.GetClientInvoices` | JWT | Lista facturas cliente (paginada) |
| GET | `/api/facturas/resumen` | `Handler.GetClientStats` | JWT | Resumen estadistico cliente |
| GET | `/api/facturas/{id}` | `Handler.GetClientInvoice` | JWT | Detalle factura cliente |
| DELETE | `/api/facturas/{id}` | `Handler.DeleteClientInvoice` | JWT | Eliminar factura cliente |
| POST | `/api/facturas/{id}/reprocesar` | `Handler.ReprocesarClientInvoice` | JWT | Reprocesar factura con IA |
| POST | `/api/v1/invoices/validate` | `Handler.ValidateInvoiceTaxes` | JWT | Validar impuestos DGII (9+ reglas) |

> *La ruta `/imagen` omite JWT via `strings.HasSuffix` check — acceso por UUID predecible en URL

### Flujo de Autenticacion

```
EMPRESA (web):
  POST /api/login
  body: {email, password}
       │
       ▼
  DB: verificar_login() function
       │ OK
       ▼
  JWT generado (HS256, SIN expiry)
  Claims: UserID, Email, EmpresaAlias, EmpresaNombre, Rol
       │
       ▼
  Respuesta: {token, empresa_info}

CLIENTE MOVIL:
  POST /api/clientes/login/
  body: {rnc, pin}
       │
       ▼
  DB: SELECT pin_hash FROM clientes WHERE rnc=$1
       │
       ▼
  bcrypt.CompareHashAndPassword(pin_hash, pin)
       │ OK
       ▼
  JWT generado (HS256, SIN expiry)
  Claims: UserID, Email, EmpresaAlias, Rol="cliente"
       │
       ▼
  Respuesta: {token, cliente_info}
```

> NOTA CRITICA: JWT sin fecha de expiracion. Secret hardcodeado como fallback.
> RequireRole middleware existe en codigo pero NO esta aplicado en ninguna ruta.

### Pipeline OCR + AI

```
POST /api/process-invoice (o /api/facturas/upload/)
     │
     ▼
1. Recibir imagen (multipart form)
     │
     ▼
2. Upload a MinIO bucket "facturas"
     │
     ▼
3. ¿Vision mode habilitado? (AI_PROVIDER=openai o gemini)
   ┌─ SI ──────────────────────────────────────────┐
   │  Enviar imagen directamente al AI provider     │
   └───────────────────────────────────────────────┘
   ┌─ NO ──────────────────────────────────────────┐
   │  ImageMagick preprocess → Tesseract OCR        │
   │  → texto → enviar texto al AI provider        │
   └───────────────────────────────────────────────┘
     │
     ▼
4. AI Extraction (prompt DGII — 30+ campos):
   - Datos basicos: proveedor, RNC, NCF, fecha, tipo_comprobante
   - Montos: subtotal, descuento, itbis, total
   - ITBIS: itbisTasa, itbisRetenido, itbisExento, itbisProporcionalidad, itbisCosto
   - ISR: isr, retencionIsrTipo (codigos 1-8)
   - ISC: isc, iscCategoria (telecom 10%, seguros 16%, alcohol, tabaco, vehiculos, combustibles)
   - Otros: cdtMonto (2%), cargo911, propina (10%), otrosImpuestos, montoNoFacturable
     │
     ▼
5. Confidence scoring (basado en completitud de campos)
     │
     ▼
6. Validacion DGII (12 reglas):
   - NCF format + tipos (B01, B02, B04, B14, B15, B16, E31-E47)
   - ITBIS 18% normal o 16% zona franca
   - ISR rates por tipo: 1-8 (10%, 25%, 27%)
   - Propina legal 10%, telecom (ISC 10%, CDT 2%)
   - Tolerancia 5% para diferencias de redondeo
     │
     ▼
7. Asignar extraction_status:
   - "validated": factura OK
   - "review": needs_review=true o confidence < 0.85
   - "error": validacion DGII fallo
     │
     ▼
8. Guardar en PostgreSQL (public.facturas_clientes)
   → trigger trg_auto_tag_606 se activa automaticamente
     │
     ▼
9. Respuesta: {factura_id, extraction_status, campos_extraidos...}
```

### Providers de AI

| Provider | Config | Modelo actual | Uso |
|----------|--------|---------------|-----|
| OpenAI-compatible | `AI_PROVIDER=openai` | `claude-opus-4-5-20251101` | Principal (via CLIProxyAPI :8317) |
| Gemini | `AI_PROVIDER=gemini` | `gemini-2.5-flash` | Fallback |
| Ollama | `AI_PROVIDER=ollama` | configurable | Desarrollo local |

---

## 3. APP MOVIL REACT NATIVE

**Repositorio**: `CarlosHuyghusrl/facturaia-mobile`
**Path en servidor**: `~/eas-builds/FacturaScannerApp/`
**Stack**: React Native 0.76.9 + Expo SDK 52 + TypeScript
**New Architecture**: HABILITADA (`newArchEnabled=true`)
**Package ID**: `com.anonymous.facturascannerapp`
**Version**: `1.0.4`

### Estructura del Proyecto

```
~/eas-builds/FacturaScannerApp/
├── src/
│   ├── components/
│   │   └── Logo.tsx
│   ├── config/
│   │   └── supabase.ts          # LEGACY — no se usa, mantener por compatibilidad
│   ├── hooks/
│   │   └── useAuth.tsx          # AuthContext + AuthProvider (useState, useEffect)
│   ├── screens/
│   │   ├── LoginScreen.tsx      # RNC + PIN → authService.login()
│   │   ├── HomeScreen.tsx       # Lista facturas + resumen + FAB camara
│   │   ├── CameraScreen.tsx     # Document Scanner + Gallery + Camera manual
│   │   ├── InvoiceDetailScreen.tsx  # Detalle read-only + zoom imagen
│   │   └── InvoiceReviewScreen.tsx  # Post-OCR editable + validacion visual
│   ├── services/
│   │   ├── api.ts               # DEPRECATED — axios client antiguo
│   │   ├── authService.ts       # login(), logout(), getToken(), getCliente()
│   │   └── facturasService.ts   # getMisFacturas(), getFactura(), deleteFactura()...
│   ├── types/
│   │   ├── invoice.ts           # Tipos de factura (OLD)
│   │   └── env.d.ts             # Variables de entorno (legacy)
│   └── utils/
│       └── apiClient.ts         # Cliente fetch moderno: timeout 30s, retry x3, 401 interceptor
├── android/                     # Proyecto Android nativo
│   └── app/build/outputs/apk/  # APK generado aqui
├── app.json                     # Config Expo
├── eas.json                     # Config EAS Build
└── package.json
```

### Pantallas y Navegacion

```
Stack Navigator v6 (auth-condicional):

NOT authenticated:
  └── LoginScreen
        ├── Campo RNC (numerico)
        ├── Campo PIN (seguro)
        └── → authService.login(rnc, pin)

authenticated:
  ├── HomeScreen (pantalla principal)
  │   ├── Lista de facturas (mis-facturas paginada)
  │   ├── Resumen estadistico (resumen endpoint)
  │   ├── FAB → navegar a CameraScreen
  │   └── → navegar a InvoiceDetailScreen
  │
  ├── CameraScreen
  │   ├── Modo 1: Document Scanner (react-native-document-scanner-plugin)
  │   ├── Modo 2: Gallery (image picker)
  │   ├── Modo 3: Manual Camera (image picker launchCamera)
  │   ├── Flujo: idle → preview → processing → success/error
  │   └── BUG: navega a 'InvoiceList' que NO EXISTE en el navigator
  │
  ├── InvoiceDetailScreen
  │   ├── Campos de factura read-only
  │   ├── Imagen via /api/facturas/{id}/imagen (no auth)
  │   ├── Zoom de imagen
  │   └── URL hardcodeada del backend
  │
  └── InvoiceReviewScreen (post-OCR)
      ├── Campos editables con indicadores de validacion
      ├── Borde rojo=error, amarillo=warning, verde=valido
      ├── Valores calculados: base_gravada, itbis_esperado, total_esperado
      ├── Boton "Aprobar" → extraction_status='validated'
      └── Boton "Corregir y Guardar" → re-valida
```

> BUG CONOCIDO: CameraScreen navega a 'InvoiceList' que no existe — causa crash post-OCR

### Flujo de Autenticacion (Cliente)

```
App mount
    │
    ▼
useAuth hook:
  getToken() + getCliente() de expo-secure-store
    │
    ├─ NO hay token → mostrar LoginScreen
    │
    └─ HAY token → GET /api/clientes/me/
                        │
                        ├─ 200 OK → autenticado, mostrar HomeScreen
                        │
                        └─ 401/error → limpiar token, mostrar LoginScreen

Login:
  POST /api/clientes/login/ {rnc, pin}
    │
    ├─ 200 OK → guardar JWT + cliente en expo-secure-store
    │           → setAuthenticated(true)
    │
    └─ error → mostrar mensaje de error

Auto-logout:
  apiClient detecta 401 → callback → logout() → limpiar secure-store
```

### API Client (apiClient.ts)

| Caracteristica | Valor |
|----------------|-------|
| Timeout | 30 segundos |
| Reintentos | 3 (backoff exponencial, inicio 1s) |
| Reintentar en | Errores de red, respuestas 5xx |
| Manejo 401 | Auto-logout via callback |
| Content-Type | application/json / multipart |

> PROBLEMA: URL base hardcodeada en 3 lugares distintos:
> - `authService.ts`: `http://217.216.48.91:8081`
> - `apiClient.ts`: `http://217.216.48.91:8081`
> - `InvoiceDetailScreen.tsx`: `http://217.216.48.91:8081`

### Scanner (react-native-document-scanner-plugin)

```
Version: 2.0.4 (ML Kit — estable)

Flujo del scanner:
  idle
   │ usuario toca FAB
   ▼
  Scanner activo (ML Kit detecta bordes del documento)
   │ usuario captura
   ▼
  preview (mostrar imagen capturada)
   │ usuario confirma
   ▼
  processing (POST /api/facturas/upload/ con imagen)
   │
   ├─ success → navegar a InvoiceReviewScreen (si status=review/error)
   │             o HomeScreen (si status=validated)
   │
   └─ error → mostrar error, volver a idle
```

---

## 4. INFRAESTRUCTURA DOCKER

### Contenedores Activos (Relacionados con FacturaIA)

| Contenedor | Imagen | Red | Puerto | Restart | Estado |
|------------|--------|-----|--------|---------|--------|
| facturaia-ocr | facturaia-ocr:v2.17.2 | host | 8081 | unless-stopped | healthy |
| supabase-db | supabase/postgres:15.8.1.085 | supabase_default | 0.0.0.0:5433→5432 | unless-stopped | up |
| supabase-pooler | supabase/supavisor:2.7.4 | supabase_default | 5432, 6543 | unless-stopped | up |
| minio | minio/minio:latest | coolify (172.20.1.3) | 127.0.0.1:9000, 0.0.0.0:9001 | unless-stopped | up |
| n8n | n8nio/n8n:2.2.4 | gestoriard-net | 127.0.0.1:5678 | unless-stopped | up |

> Total en servidor: 28 contenedores (incluyendo GestoriaRD y otros servicios)

### Diagrama de Redes Docker

```
HOST NETWORK (facturaia-ocr)
┌─────────────────────────────────────────────────────────────┐
│  facturaia-ocr                                               │
│  Accede a localhost:5433 (DB directa)                       │
│  Accede a localhost:9000 (MinIO via bridge gateway)         │
│  Accede a localhost:8317 (CLIProxyAPI — systemd nativo)     │
│  Expone :8081 al exterior                                   │
└─────────────────────────────────────────────────────────────┘

SUPABASE_DEFAULT NETWORK (172.x.x.x)
┌─────────────────────────────────────┐
│  supabase-db (:5432 interno)        │◄── expuesto como :5433 en host
│  supabase-pooler (:5432, :6543)     │    (facturaia-ocr conecta DIRECTAMENTE)
└─────────────────────────────────────┘
         ↑
    NO USADO por facturaia-ocr
    (pooler/supavisor disponible pero ignorado)

COOLIFY NETWORK (172.20.1.3)
┌─────────────────────────────────────┐
│  minio (:9000 API, :9001 console)   │◄── solo :9000 en localhost del host
└─────────────────────────────────────┘

GESTORIARD-NET
┌─────────────────────────────────────┐
│  n8n (:5678 solo localhost)         │
└─────────────────────────────────────┘

HOST (NO Docker)
├── CLIProxyAPI :8317 (systemd, binario Go nativo)
└── Perplexity Proxy :8318 (si activo)
```

### HALLAZGO CRITICO: PgBouncer vs Supavisor

El CLAUDE.md menciona "PgBouncer en puerto 5433" pero la realidad es:

| Nombre en docs | Realidad |
|----------------|----------|
| "PgBouncer" | Es **supabase-pooler** (Supavisor 2.7.4) |
| "puerto 5433" | Es **supabase-db directamente** (PostgreSQL puro) |
| Pooler usado | **NO** — facturaia-ocr bypasea el pooler |

facturaia-ocr conecta a `localhost:5433` que es `supabase-db:5432` — saltandose completamente el connection pooler. El Supavisor esta en puertos 5432 y 6543 pero nadie de FacturaIA lo usa.

### Dependencias de Arranque

```
[boot order]

supabase-db (postgres)
      │
      ▼
supabase-pooler (supavisor) ← facturaia-ocr NO depende de este

facturaia-ocr ────────────────────► supabase-db (direct :5433)
      │                              MinIO (:9000)
      │                              CLIProxyAPI (:8317)
      │
      └── Si DB no disponible al inicio:
          → "OCR-only mode" PERMANENTE (sin retry, sin reconexion)

MinIO ──────────────────────────── independiente
CLIProxyAPI (systemd) ──────────── independiente
n8n ────────────────────────────── independiente
```

### Deploy del Backend

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
  facturaia-ocr:v2.17.2
```

---

## 5. BASE DE DATOS POSTGRESQL

**Engine**: PostgreSQL 15.8 (via imagen supabase/postgres:15.8.1.085)
**Conexion desde backend**: `localhost:5433` (directo, sin pooler)
**Credenciales**: `postgres / fBuTN2JZxjhJqxXCkacsMSPug9xgeb`
**Total tablas**: 97 (compartida con GestoriaRD)

### Tablas Clave de FacturaIA

| Tabla | Schema | Registros | Descripcion |
|-------|--------|-----------|-------------|
| `facturas_clientes` | public | activo | Facturas escaneadas por clientes moviles |
| `clientes` | public | 315 | Clientes con auth movil (RNC, PIN hash, app_activa) |
| `facturas` | emp_* | 1+ | Facturas legacy por empresa (41 columnas) |
| `dgii_ncf_tipos` | public | 20 | Tipos de NCF de referencia (B01-E47) |
| `dgii_606_codigos` | public | varios | Codigos DGII: forma_pago, tipo_bien_servicio, tipo_retencion_isr |
| `usuarios_sistema` | public | varios | Usuarios web empresa (email, password_hash, rol) |

### Tabla `facturas_clientes` — Estructura Principal

```sql
-- Campos principales
id UUID PRIMARY KEY
cliente_id INTEGER REFERENCES clientes(id)
fecha_carga TIMESTAMP
fecha_factura DATE
numero_ncf VARCHAR
tipo_comprobante VARCHAR
proveedor_nombre VARCHAR
proveedor_rnc VARCHAR

-- Montos
subtotal DECIMAL
descuento DECIMAL
itbis DECIMAL
total DECIMAL

-- Campos fiscales DGII (v2.13.0+)
itbis_tasa DECIMAL          -- 18% normal, 16% zona franca
itbis_retenido DECIMAL
itbis_exento DECIMAL
itbis_proporcionalidad DECIMAL
itbis_costo DECIMAL
isr DECIMAL
retencion_isr_tipo INTEGER  -- 1-8
isc DECIMAL
isc_categoria VARCHAR       -- telecom, seguros, alcohol, tabaco, vehiculos, combustibles
cdt_monto DECIMAL           -- 2%
cargo911 DECIMAL
propina DECIMAL             -- 10%
otros_impuestos DECIMAL
monto_no_facturable DECIMAL

-- OCR/AI metadata
extraction_status VARCHAR    -- validated, review, error
confidence DECIMAL
needs_review BOOLEAN
review_notes TEXT
imagen_url VARCHAR           -- path en MinIO

-- Trigger: trg_auto_tag_606 (auto-clasificacion DGII 606)
tipo_606 VARCHAR             -- generado por trigger
```

### Trigger DGII 606

```sql
-- Activo desde 03-Mar-2026
TRIGGER trg_auto_tag_606
AFTER INSERT OR UPDATE ON facturas_clientes
FOR EACH ROW
EXECUTE FUNCTION auto_tag_factura_606()
-- Clasifica automaticamente cada factura para formato DGII 606
```

### Esquemas de Autenticacion

```
EMPRESA (web dashboard):
  tabla: usuarios_sistema
  campos: email, password_hash, rol, empresa_alias
  login: DB function verificar_login(email, password)

CLIENTE MOVIL:
  tabla: clientes
  campos: rnc, razon_social, pin_hash, app_pin, app_activa
  login: SELECT pin_hash + bcrypt.Compare en Go
  condicion: app_activa = true
```

### Base de Datos Compartida (FacturaIA + GestoriaRD)

```
97 tablas en total:

FacturaIA-exclusivas:
  facturas_clientes, facturas (emp_*), dgii_ncf_tipos, dgii_606_codigos

GestoriaRD-exclusivas:
  clientes*, contadores, empresas, casos_dgi, historial_casos, etc.
  (* clientes es usada por ambos con diferente logica)

DGII Scraping (compartida):
  dgii_scrape_index, dgii_consultas_index, dgii_documents, pipeline_jobs

Auth (cada uno la suya):
  usuarios_sistema (empresa web FacturaIA)
  clientes.pin_hash (movil FacturaIA)
  GestoriaRD tiene su propio auth

Compartidas:
  inbox_ia (bandeja IA multi-proyecto)
  alertas_vencimiento_tareas
```

---

## 6. SERVICIOS AUXILIARES

### CLIProxyAPI

| Atributo | Valor |
|----------|-------|
| Tipo | Binario Go nativo (NO Docker) |
| Path | `/home/gestoria/cliproxyapi/cli-proxy-api` |
| Servicio | `systemd: cliproxyapi.service` |
| Puerto | `8317` |
| Version | `6.7.32` |
| Auth | `Bearer sk-7mFaCRaXj5sp1S5G82S17sF4ClsTzn0ObP1D8yzPEQYmZ` |
| API | OpenAI-compatible (`/v1/chat/completions`) |

**Providers configurados**:
- Claude OAuth (cuenta radelqui@gmail.com) → modelos claude-opus-4-5-*, claude-sonnet-4-*, claude-haiku-*
- Gemini Pro (cuenta carlos@huyghusrl.com) → gemini-2.5-pro, gemini-2.5-flash
- 40+ aliases de modelos disponibles

**Uso en FacturaIA**:
```bash
# OCR principal (Claude Opus 4.5)
curl http://localhost:8317/v1/chat/completions \
  -H "Authorization: Bearer sk-7mFaCRaXj5sp1S5G82S17sF4ClsTzn0ObP1D8yzPEQYmZ" \
  -d '{"model": "claude-opus-4-5-20251101", "messages": [...]}'

# Fallback (Gemini Flash)
curl http://localhost:8317/v1/chat/completions \
  -d '{"model": "cliproxy/gemini-2.5-flash", ...}'
```

### MinIO Object Storage

| Atributo | Valor |
|----------|-------|
| Imagen | `minio/minio:latest` |
| Red | coolify bridge (172.20.1.3) |
| API Port | `127.0.0.1:9000` |
| Console | `0.0.0.0:9001` |
| Access Key | `gestoria_minio` |
| Secret Key | `mMG3F4M42vgcGggEpAhAQuZ349jBkl` |
| Data path | `/home/gestoria/minio/data` |
| Healthcheck | NO configurado |

**Buckets**:

| Bucket | Uso | Datos |
|--------|-----|-------|
| `facturas` | Imagenes de facturas escaneadas | ~32 MB activos |
| `documentos` | Documentos generales | vacio |
| `backups` | Backups del sistema | vacio |
| `reportes` | Reportes generados | vacio |

**Acceso desde la app**:
- La app NO accede a MinIO directamente
- El backend actua como proxy: `GET /api/facturas/{id}/imagen`
- El backend busca la imagen en MinIO y la retorna al cliente

### n8n Automatizacion

| Atributo | Valor |
|----------|-------|
| Version | `n8nio/n8n:2.2.4` |
| Red | `gestoriard-net` |
| Puerto | `127.0.0.1:5678` |
| Acceso | Solo localhost (no expuesto al exterior) |

**Uso en FacturaIA**:
- Procesamiento automatico de flujos DGII
- Generacion de formatos 606, 607
- Notificaciones

**Estado**: Fase 10 (OCR-n8n para DGII) — PENDIENTE

---

## 7. FLUJOS COMPLETOS DEL SISTEMA

### Flujo 1: Login Completo

```
MOVIL                          BACKEND                        DB
  │                               │                            │
  │── POST /api/clientes/login/ ──►│                            │
  │   {rnc: "130309094", pin: "1234"}                          │
  │                               │── SELECT pin_hash ────────►│
  │                               │   WHERE rnc=$1             │
  │                               │   AND app_activa=true      │
  │                               │◄── {pin_hash: "$2b$..."} ──│
  │                               │                            │
  │                               │ bcrypt.Compare(pin, hash)  │
  │                               │ ✓ Match                    │
  │                               │                            │
  │                               │ GenerateJWT(cliente_id,    │
  │                               │   rol="cliente")           │
  │◄── {token, cliente_info} ─────│                            │
  │                               │                            │
  │ Guardar en expo-secure-store   │                            │
  │ → navegar a HomeScreen         │                            │
```

### Flujo 2: Escaneo y Procesamiento de Factura

```
MOVIL                     BACKEND                  AI/MinIO              DB
  │                          │                        │                   │
  │ Abrir CameraScreen        │                        │                   │
  │ Escanear documento        │                        │                   │
  │ (ML Kit detecta bordes)   │                        │                   │
  │                          │                        │                   │
  │─POST /api/facturas/───── ►│                        │                   │
  │  upload/ {imagen}         │                        │                   │
  │  JWT: Bearer token        │── PUT facturas/ ──────►│                   │
  │                          │   bucket (MinIO)        │                   │
  │                          │◄── {image_url} ─────────│                   │
  │                          │                        │                   │
  │                          │ (vision mode ON)        │                   │
  │                          │── chat/completions ────►│                   │
  │                          │   {imagen, prompt DGII} │  CLIProxyAPI      │
  │                          │                        │  → Claude Opus 4.5│
  │                          │◄── {campos extraidos} ──│                   │
  │                          │                        │                   │
  │                          │ Confidence scoring      │                   │
  │                          │ Validacion DGII (12 reglas)                │
  │                          │ Asignar extraction_status                  │
  │                          │                        │                   │
  │                          │── INSERT facturas_clientes ───────────────►│
  │                          │                        │  trg_auto_tag_606 │
  │                          │                        │  (auto-clasifica) │
  │◄── {factura_id, status,──│                        │                   │
  │     campos_extraidos}     │                        │                   │
  │                          │                        │                   │
  │ Si status="review"/"error"│                        │                   │
  │ → InvoiceReviewScreen     │                        │                   │
  │ Si status="validated"     │                        │                   │
  │ → HomeScreen              │                        │                   │
```

### Flujo 3: DGII 606 (Automatico via Trigger)

```
INSERT facturas_clientes
       │
       ▼
trg_auto_tag_606 se activa
       │
       ▼
auto_tag_factura_606() function
       │
       ▼
Clasifica tipo_606 segun:
  - tipo_comprobante (NCF type)
  - monto, itbis, isr
  - fecha_factura
       │
       ▼
UPDATE facturas_clientes SET tipo_606=...
       │
       ▼
[Fase 10 - PENDIENTE]
n8n workflow procesa facturas tagged
       │
       ▼
Genera archivo formato 606 para DGII
```

---

## 8. PUNTOS DE FALLO Y MITIGACION

| # | Riesgo | Impacto | Estado Actual | Fix Recomendado |
|---|--------|---------|---------------|-----------------|
| 1 | Sin retry al conectar DB en startup | Backend queda en modo OCR-only permanente si DB no esta lista | CRITICO — sin retry | Exponential backoff con jitter (pgxretry), reintentar 5 veces antes de modo degradado |
| 2 | Healthcheck no verifica DB | Docker cree que el servicio esta healthy aunque no haya DB | ALTO — misleading | Healthcheck con tres capas: HTTP, DB query, MinIO ping |
| 3 | Sin graceful shutdown | Peticiones en vuelo se cortan abruptamente al reiniciar | MEDIO | signal.NotifyContext, WaitGroup para peticiones activas |
| 4 | JWT sin expiracion | Token robado es valido para siempre | ALTO | Agregar exp claim (72h) + refresh token en endpoint separado |
| 5 | JWT secret hardcodeado como fallback | En dev sin JWT_SECRET env el secret es predecible | ALTO | Fail fast si JWT_SECRET no esta en env (no usar fallback) |
| 6 | URL backend hardcodeada en 3 archivos RN | Un cambio de IP/dominio requiere actualizar 3 archivos | BAJO | Centralizar en `config/constants.ts` con env var |
| 7 | MinIO sin healthcheck | Si MinIO falla, uploads fallan silenciosamente | MEDIO | Configurar healthcheck Docker + retry en storage/minio.go |
| 8 | facturaia-ocr bypasea connection pooler | Con 300+ clientes, conexiones directas pueden saturar PostgreSQL | ALTO | Conectar a Supavisor :6543 en lugar de postgres directo :5433 |
| 9 | Navigator navega a 'InvoiceList' inexistente | Crash post-OCR en la app movil | CRITICO — crash produccion | Renombrar pantalla o corregir la ruta en CameraScreen.tsx |
| 10 | AI sin circuit breaker | Si CLIProxyAPI cuelga, todas las peticiones OCR se bloquean indefinidamente | ALTO | Circuit breaker (gobreaker) + timeout estricto en HTTP client de AI |
| 11 | Base de datos compartida FacturaIA+GestoriaRD | Un problema en GestoriaRD puede afectar FacturaIA y viceversa | MEDIO | Separar en instancias distintas a largo plazo o usar schemas aislados |
| 12 | RequireRole middleware sin usar | Cualquier JWT valido puede acceder a endpoints de empresa | ALTO | Aplicar RequireRole en rutas de empresa vs cliente |
| 13 | Endpoint /imagen sin autenticacion real | UUID en URL es la unica proteccion — predecible si se filtra | BAJO | Agregar token firmado de corta vida para URLs de imagen |
| 14 | clientes tabla compartida con GestoriaRD | Logicas de auth mezcladas entre proyectos | MEDIO | Separar clientes_facturaia o documentar el contrato claramente |

### Hallazgos Adicionales Críticos (descubiertos por investigación profunda)

| # | Riesgo | Impacto | Estado Actual | Fix Recomendado |
|---|--------|---------|---------------|-----------------|
| A1 | **InvoiceReviewScreen sin auth** — 3 fetch() calls sin Authorization header | Endpoints /approve, /update, /validate retornan 401 siempre | BUG ACTIVO — pantalla no funciona | Usar apiClient.ts en vez de fetch() directo |
| A2 | **Field name mismatch** — HomeScreen usa emisor_nombre, fecha_emision, total pero Factura type tiene proveedor, fecha_documento, monto | Campos renderizan como undefined | BUG ACTIVO — UI incompleta | Alinear nombres entre type y screens |
| A3 | **contadores.password_crm sin hash** — columna no tiene sufijo _hash | Passwords potencialmente en texto plano | RIESGO SEGURIDAD | Auditar y migrar a bcrypt |
| A4 | **RLS demasiado permisivo** — credenciales_dgii legible por anon | Credenciales DGII expuestas via Supabase API | RIESGO SEGURIDAD | Restringir policy a authenticated only |
| A5 | **empresas_login almacena supabase_anon_key en plaintext** | Key de Supabase expuesta | RIESGO SEGURIDAD | Mover a supabase_vault o env var |
| A6 | **77% de pipeline_jobs fallidos** (195/253) | Scraping DGII no funciona para mayoría | DEGRADADO | Investigar errores y retry |
| A7 | **Package name: com.anonymous.facturascannerapp** | No apto para Play Store | PENDIENTE | Cambiar antes de publicar |
| A8 | **ISR rate mismatch** — validator y prompt IA tienen mapeos diferentes para tipos 4-8 | Validaciones ISR incorrectas en algunos casos | BUG SILENCIOSO | Alinear tablas ISR |
| A9 | **ReprocesarClientInvoice no re-valida** — siempre pone extraction_status=validated | Facturas reprocesadas no pasan por validador DGII | BUG LÓGICA | Agregar TaxValidator.Validate() al flujo de reprocesar |
| A10 | **Image proxy sin auth de cliente** — /api/facturas/{id}/imagen no verifica cliente_id | Cualquier UUID válido accede a imagen de cualquier cliente | RIESGO SEGURIDAD | Agregar verificación de cliente_id o JWT |

---

## 9. RECOMENDACIONES DE MEJORA (Priorizadas)

### Critico (resolver en proxima semana)

1. **FIX: CameraScreen navega a 'InvoiceList'**
   - Archivo: `src/screens/CameraScreen.tsx`
   - Cambiar `navigation.navigate('InvoiceList')` a la pantalla correcta
   - Impacto: crash en produccion post-OCR

2. **FIX: Retry en conexion DB al startup**
   - Archivo: `internal/db/pool.go`
   - Implementar loop con exponential backoff (5 intentos, 2s inicial)
   - Impacto: modo OCR-only permanente si DB no arranca exactamente a tiempo

3. **FIX: URL backend centralizada en la app**
   - Crear `src/config/constants.ts` con `API_BASE_URL`
   - Reemplazar las 3 referencias hardcodeadas
   - Impacto: imposible cambiar URL sin modificar 3 archivos

### Alto (proxima iteracion)

4. **JWT con expiracion**
   - Agregar `exp` claim (72h recomendado)
   - Implementar endpoint `/api/clientes/refresh`
   - App: renovar token proactivamente 30min antes de expirar

5. **Conectar via Supavisor en lugar de postgres directo**
   - Cambiar `DATABASE_URL` de puerto 5433 a 6543 (transaction pooling)
   - Beneficio: soportar mas clientes concurrentes sin saturar PostgreSQL

6. **Healthcheck con dependencias reales**
   - Modificar `/health` para verificar: DB query, MinIO ping, AI probe
   - Retornar JSON con estado de cada componente

7. **Aplicar RequireRole middleware**
   - Rutas de empresa: RequireRole("empresa", "admin")
   - Rutas de cliente: RequireRole("cliente")
   - Actualmente cualquier JWT valido tiene acceso total

### Medio (backlog)

8. **Circuit breaker para AI provider**
   - Usar `gobreaker` library
   - Abrir circuito tras 5 fallos consecutivos
   - Estado intermedio: retornar error rapido en lugar de bloquear

9. **Graceful shutdown**
   - Capturar SIGTERM/SIGINT
   - Esperar peticiones activas antes de cerrar

10. **Phase 10: Integracion OCR-n8n para DGII**
    - Workflow n8n para procesar facturas con tipo_606 asignado
    - Generar archivos 606/607 automaticamente

### Bajo (mejora continua)

11. **Centralizar configuracion de MinIO healthcheck**
    - Agregar HEALTHCHECK al Dockerfile de facturaia-ocr
    - Configurar healthcheck en Docker Compose/Coolify para MinIO

12. **Separar base de datos**
    - A largo plazo: instancia PostgreSQL dedicada para FacturaIA
    - Evitar interdependencias con GestoriaRD

13. **Documentar contrato de tabla clientes**
    - La tabla `clientes` es compartida — definir que campos son de quien

---

## 10. ESTADO ACTUAL DE CADA COMPONENTE

| Componente | Version | Estado | Saludable | Notas |
|------------|---------|--------|-----------|-------|
| **App Movil (RN)** | 1.0.4 / Expo 52 | Activa | PARCIAL | BUG: navegacion a 'InvoiceList' crashea; BUG: InvoiceReviewScreen 3 endpoints sin auth (no funciona); BUG: HomeScreen field names mismatch (UI muestra undefined); Package name aun es com.anonymous |
| **Backend Go** | v2.17.2 | Desplegado | SI | --init flag, no zombies |
| **PostgreSQL** | 15.8.1.085 | Activo | SI | Sin pooler; 315 clientes; trigger 606 activo |
| **Supavisor (pooler)** | 2.7.4 | Activo | SI | NO usado por facturaia-ocr (bypaseado) |
| **MinIO** | latest | Activo | PARCIAL | Sin healthcheck; bucket facturas 32MB |
| **CLIProxyAPI** | 6.7.32 | Activo | SI | systemd; Claude + Gemini; 40+ modelos |
| **n8n** | 2.2.4 | Activo | SI | Sin workflows FacturaIA (Fase 10 pendiente) |
| **Trigger 606** | — | Activo | SI | trg_auto_tag_606 ejecutado 03-Mar-2026 |
| **New Architecture RN** | — | Habilitada | SI | newArchEnabled=true en android |
| **Document Scanner** | 2.0.4 | Activo | SI | ML Kit estable |

### Test User para Verificacion

| Campo | Valor |
|-------|-------|
| RNC | `130309094` (sin guiones en API) |
| PIN | `1234` |
| Razon Social | Acela Associates |
| Endpoint login | `POST http://217.216.48.91:8081/api/clientes/login/` |

### Comandos de Verificacion Rapida

```bash
# Verificar backend
curl http://217.216.48.91:8081/health

# Verificar login
curl -X POST http://217.216.48.91:8081/api/clientes/login/ \
  -H "Content-Type: application/json" \
  -d '{"rnc": "130309094", "pin": "1234"}'

# Verificar contenedor
docker ps | grep facturaia-ocr

# Verificar logs
docker logs facturaia-ocr --tail 50

# Build APK local
cd ~/eas-builds/FacturaScannerApp/android
./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk
```

---

## 11. HISTORIAL DE VERSIONES PRINCIPALES

| Version | Fecha | Cambios Clave |
|---------|-------|---------------|
| v2.13.0 | Feb-2026 | 20+ campos fiscales DGII, validacion 12 reglas |
| v2.13.2 | Feb-2026 | Fix ISC=0 en nuevas facturas (Scan faltaba &inv.ISCCategoria) |
| v2.14.0 | Feb-2026 | Endpoint /reprocesar para facturas antiguas |
| v2.16.0 | Feb-2026 | --init flag (tini anti-zombie), InvoiceReviewScreen |
| v2.17.2 | Mar-2026 | Version actual en produccion |

---

*Documento generado el 2026-03-10. Mantener actualizado despues de cada cambio estructural.*
*Actualizar version en header y agregar entrada en historial de versiones.*
