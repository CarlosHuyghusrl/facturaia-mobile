# INVENTARIO COMPLETO — FacturaIA

**Fecha**: 10-Mar-2026
**Versión backend**: v2.19.0
**Propósito**: Referencia técnica completa del ecosistema FacturaIA — servicios, endpoints, datos, flujos.

---

## ÍNDICE RÁPIDO

1. [Servicios Docker](#1-servicios-docker)
2. [Endpoints Backend](#2-endpoints-backend-facturaia-ocr-v2190)
3. [Modelos de IA](#3-modelos-de-ia)
4. [Base de Datos](#4-base-de-datos)
5. [Storage MinIO](#5-storage-minio)
6. [Automatización n8n](#6-automatización-n8n)
7. [App Móvil](#7-app-móvil)
8. [Redes Docker](#8-redes-docker)
9. [OpenClaw](#9-openclaw)
10. [Análisis de Sistema](#10-análisis-del-sistema)
11. [Flujo de una Factura](#11-flujo-completo-de-una-factura)

---

## 1. Servicios Docker

### Servicios FacturaIA (directos)

| Container | Imagen | Puerto | Estado | Función |
|-----------|--------|--------|--------|---------|
| facturaia-ocr | facturaia-ocr:v2.19.0 | 8081 (host network) | healthy | Backend Go — OCR, API REST, auth, CRUD facturas |
| autoheal | willfarrell/autoheal:latest | — | healthy | Auto-restart containers unhealthy cada 30s |
| minio | minio/minio:latest | 9000 (API), 9001 (console) | Up | Storage S3-compatible, bucket: facturas |

### Supabase (BD compartida con GestoriaRD)

| Container | Imagen | Puerto | Estado | Función |
|-----------|--------|--------|--------|---------|
| supabase-db | supabase/postgres:15.8.1.085 | 5433→5432 | healthy | PostgreSQL 15.8 — 100 tablas, BD principal |
| supabase-pooler | supabase/supavisor:2.7.4 | 5432, 6543 | healthy | Connection pooler para PostgreSQL |
| supabase-kong | kong:2.8.1 | 8100→8000, 8443 | healthy | API Gateway Supabase |
| supabase-storage | supabase/storage-api:v1.33.0 | 5000 | healthy | Storage API Supabase |
| supabase-meta | supabase/postgres-meta:v0.95.1 | 8080 | healthy | Postgres Meta API |

### Infraestructura (Coolify)

| Container | Imagen | Puerto | Estado | Función |
|-----------|--------|--------|--------|---------|
| coolify | ghcr.io/coollabsio/coolify:4.0.0-beta.462 | 8000→8080 | healthy | Orquestación Docker |
| coolify-proxy | traefik:v3.6 | 80, 443, 8080 | healthy | Reverse proxy / Load balancer |
| coolify-sentinel | ghcr.io/coollabsio/sentinel:0.0.18 | — | healthy | Monitoring agent Coolify |
| coolify-db | postgres:15-alpine | 5432 (internal) | healthy | BD interna de Coolify |
| coolify-redis | redis:7-alpine | 6379 (internal) | healthy | Cache interna de Coolify |

### Automatización

| Container | Puerto | Estado | Función |
|-----------|--------|--------|---------|
| n8n | 5678 (localhost) | Up | Automatización — 0 workflows activos actualmente |

---

## 2. Endpoints Backend (facturaia-ocr v2.19.0)

**Base URL**: http://217.216.48.91:8081

### Autenticación

| Método | Ruta | Auth | Función |
|--------|------|------|---------|
| POST | /api/login | No | Login administrador |
| POST | /api/clientes/login/ | No | Login cliente con RNC + PIN → JWT (exp 24h) |
| GET | /api/clientes/me/ | JWT | Info del cliente autenticado |

### Facturas — API Cliente (JWT de cliente requerido)

| Método | Ruta | Auth | Función |
|--------|------|------|---------|
| POST | /api/process-invoice | JWT | Upload imagen + OCR con IA → extracción datos |
| POST | /api/facturas/upload/ | JWT | Alias de process-invoice |
| GET | /api/facturas/mis-facturas/ | JWT | Listar facturas del cliente autenticado |
| GET | /api/facturas/{id} | JWT | Detalle de una factura |
| DELETE | /api/facturas/{id} | JWT | Eliminar factura |
| GET | /api/facturas/{id}/imagen | Opcional | Proxy imagen desde MinIO (valida cliente_id si JWT presente) |
| POST | /api/facturas/{id}/reprocesar | JWT | Re-ejecutar OCR sobre factura existente |
| GET | /api/facturas/resumen | JWT | Estadísticas del cliente (total facturas, montos, etc.) |

### Facturas — API Admin (JWT de admin requerido)

| Método | Ruta | Auth | Función |
|--------|------|------|---------|
| GET | /api/invoices | JWT admin | Listar TODAS las facturas |
| GET | /api/invoice/{id} | JWT admin | Detalle factura (admin) |
| PUT | /api/invoice/{id} | JWT admin | Actualizar factura |
| DELETE | /api/invoice/{id} | JWT admin | Eliminar factura |
| GET | /api/stats | JWT admin | Stats mensuales agregadas |

### Validación DGII

| Método | Ruta | Auth | Función |
|--------|------|------|---------|
| POST | /api/v1/invoices/validate | JWT | Validar impuestos DGII (9+ reglas: NCF, ITBIS, ISR, ISC, propina) |

**Reglas de validación DGII implementadas:**
- NCF format + tipos (B01, B02, B04, B14, B15, B16, E31-E45)
- ITBIS 18% normal o 16% zona franca
- ISR rates por tipo 1-8 (10%, 25%, 27%)
- Propina legal 10%
- Telecom: ISC 10%, CDT 2%
- Tolerancia 5% para diferencias de redondeo

### Sistema

| Método | Ruta | Auth | Función |
|--------|------|------|---------|
| GET | /health | No | Health check (DB, MinIO, Tesseract, ImageMagick, AI provider) |

**Total endpoints: 18**

---

## 3. Modelos de IA

### Modelo OCR Principal

- **Modelo**: Claude Opus 4.5 (claude-opus-4-5-20251101)
- **Via**: CLIProxyAPI localhost:8317 (OpenAI-compatible)
- **API Key**: sk-7mFaCRaXj5sp1S5G82S17sF4ClsTzn0ObP1D8yzPEQYmZ
- **Vision mode**: imagen directa sin Tesseract intermedio
- **Fix v2.19.0**: System message fuerza respuesta JSON-only
- **Fallback**: Extracción JSON de texto mixto si falla JSON-only

### Herramientas OCR Auxiliares

| Herramienta | Versión | Función |
|-------------|---------|---------|
| Tesseract | 5.5.1 | OCR texto (idiomas: eng, spa) |
| ImageMagick | 7 | Preprocessing de imágenes (usar `magick`, NO `convert` deprecated) |

### Modelos Disponibles via CLIProxyAPI — 41 Total

**Claude (Anthropic):**
- claude-opus-4-6, claude-opus-4-5-20251101, claude-opus-4-1-20250805, claude-opus-4-20250514
- claude-sonnet-4-6, claude-sonnet-4-5-20250929, claude-sonnet-4-20250514
- claude-haiku-4-5-20251001, claude-3-7-sonnet-20250219, claude-3-5-haiku-20241022

**Google Gemini:**
- gemini-3.1-pro-preview, gemini-3-pro-preview, gemini-3-flash-preview
- gemini-2.5-pro, gemini-2.5-flash, gemini-2.5-flash-lite

**DeepSeek:**
- deepseek-r1, deepseek-v3, deepseek-v3.1, deepseek-v3.2

**Qwen (Alibaba):**
- qwen3-max-preview, qwen3-max, qwen3-235b, qwen3-235b-a22b-instruct, qwen3-235b-a22b-thinking-2507
- qwen3-32b, qwen3-coder-flash, qwen3-coder-plus, qwen3-vl-plus

**Perplexity:**
- sonar, sonar-pro, sonar-reasoning, sonar-deep-research, pplx, pplx-pro, pplx-reasoning

**Otros:**
- kimi-k2, glm-4.6, iflow-rome-30ba3b, coder-model, vision-model

### Uso de Modelos para Tareas del Arquitecto

| Tarea | Modelo | Costo |
|-------|--------|-------|
| OCR de facturas | claude-opus-4-5-20251101 | Plan Max |
| Escribir/editar código | claude-sonnet-4-6 (sub-agente) | Plan Max |
| Investigar en web | sonar (via :8318) | Gratis |
| Analizar código grande | deepseek-v3.2 (via :8317) | Gratis |
| Razonamiento profundo | deepseek-r1 (via :8317) | Gratis |
| Documentar | gemini-2.5-pro (via :8317) | Gratis |
| Revisar/auditar código | qwen3-coder-flash (via :8317) | Gratis |

---

## 4. Base de Datos

### PostgreSQL 15.8

| Dato | Valor |
|------|-------|
| Container | supabase-db |
| Puerto | 5433 (externo) → 5432 (interno) |
| Host | localhost |
| User | postgres |
| Password | fBuTN2JZxjhJqxXCkacsMSPug9xgeb |
| Database | postgres |
| Total tablas | 100 tablas públicas |
| Nota | Compartida con GestoriaRD |
| Conexión recomendada | localhost:5433 DIRECTO (NO pooler) |

### Tablas Relevantes para FacturaIA

| Tabla | Registros | Función |
|-------|-----------|---------|
| clientes | 315 | Clientes registrados (login RNC+PIN) |
| facturas_clientes | 7 | Facturas escaneadas por clientes |
| facturas | 1 | Tabla legacy (migración antigua) |

### Esquema: facturas_clientes (58 columnas)

**Identificación:**
- id (UUID, PK), cliente_id, empresa_id

**Archivo:**
- archivo_url, archivo_nombre, archivo_size

**Documento DGII:**
- tipo_documento, fecha_documento, ncf, tipo_ncf, ncf_modifica, ncf_vencimiento

**Partes:**
- proveedor, emisor_rnc, tipo_id_emisor
- receptor_nombre, receptor_rnc, tipo_id_receptor

**Montos Base:**
- monto, subtotal, descuento, monto_servicios, monto_bienes

**ITBIS (9 campos):**
- itbis, itbis_tasa, itbis_retenido, itbis_retenido_porcentaje
- itbis_exento, itbis_proporcionalidad, itbis_costo, itbis_adelantar, itbis_percibido

**ISR (3 campos):**
- isr, retencion_isr_tipo, isr_percibido

**ISC (2 campos):**
- isc, isc_categoria

**Otros Impuestos:**
- cdt_monto, cargo_911, propina, otros_impuestos, monto_no_facturable

**Clasificación:**
- forma_pago, tipo_bien_servicio

**Procesamiento OCR:**
- confidence_score, extraction_status (validated/review/error), review_notes
- raw_ocr_json, items_json

**DGII 606:**
- aplica_606, periodo_606, fecha_pago

**Meta:**
- estado, notas_cliente, notas_contador, procesado_por, procesado_at, created_at

---

## 5. Storage MinIO

| Dato | Valor |
|------|-------|
| Endpoint API | localhost:9000 |
| Console Web | localhost:9001 |
| Access Key | gestoria_minio |
| Secret Key | mMG3F4M42vgcGggEpAhAQuZ349jBkl |
| Bucket principal | facturas |
| Protocolo | S3-compatible |
| SSL | false (internal) |

**Uso**: Almacena imágenes originales de facturas escaneadas.
**Acceso desde app**: Backend sirve como proxy via `/api/facturas/{id}/imagen` — la app nunca accede a MinIO directamente.

---

## 6. Automatización n8n

| Dato | Valor |
|------|-------|
| Puerto | 5678 (localhost only) |
| Estado | Up |
| Workflows activos | 0 |
| Acceso externo | No (solo localhost) |

**Pendiente**: Plan-007 para workflows DGII 606/607.
**Uso futuro**: Generación automática de reportes fiscales mensuales, notificaciones, integración DGII.

---

## 7. App Móvil

### Stack Tecnológico

| Componente | Versión | Función |
|------------|---------|---------|
| React Native | 0.76.9 | Framework base |
| Expo SDK | 52 | Managed workflow |
| TypeScript | — | Tipado estático |
| react-native-document-scanner-plugin | 2.0.4 | Scanner con ML Kit |
| @react-navigation/stack | — | Navegación entre pantallas |
| expo-secure-store | — | JWT storage seguro |
| react-native-svg | 15.15.3 + patch | Gráficos SVG |
| New Architecture | habilitada | newArchEnabled=true |

### Pantallas (5 principales)

| Pantalla | Función |
|----------|---------|
| LoginScreen | Auth con RNC + PIN |
| HomeScreen | Lista de facturas del cliente |
| CameraScreen | Escanear factura con cámara/galería |
| InvoiceDetailScreen | Detalle de factura con datos OCR |
| InvoiceReviewScreen | Revisión y corrección manual de datos |

### Estado APK

| Dato | Valor |
|------|-------|
| Último APK | 67MB (03-Mar-2026) |
| Estado | Pendiente rebuild con fix auth headers |
| Test user RNC | 130-309094 |
| Test user PIN | 1234 |
| Razón social test | Acela Associates |

### Bugs Conocidos Pendientes

| Bug | Síntoma | Fix pendiente |
|-----|---------|---------------|
| CameraScreen navega a 'InvoiceList' | Crash en botón "Ver Lista" | Cambiar a navigation.navigate('Home') |
| Base URL hardcodeada | 3 archivos con IP hardcoded | Centralizar en config.ts |
| RequireRole middleware | No aplicado en ninguna ruta | Aplicar en rutas admin |

---

## 8. Redes Docker

| Red | Función |
|-----|---------|
| host | facturaia-ocr (acceso directo a puertos localhost) |
| bridge | Default Docker |
| supabase_default | Comunicación interna servicios Supabase |
| coolify | Servicios Coolify y proyectos gestionados |
| gestoriard-net | GestoriaRD (proyecto separado, mismo servidor) |
| docker_feeder_default | Feeder (proyecto separado) |

**Nota**: facturaia-ocr usa `host` network para acceder directamente a PostgreSQL (5433), MinIO (9000) y CLIProxyAPI (8317) sin necesidad de configuración adicional de redes Docker.

---

## 9. OpenClaw

**API**: http://localhost:9091
**Propósito**: Cerebro central del servidor — registra todos los agentes, planes y tareas.

### Endpoints Disponibles

| Método | Ruta | Función |
|--------|------|---------|
| GET | /api/health | Ping — verificar que OpenClaw está vivo |
| GET | /api/models/health | Estado de todos los modelos IA |
| GET | /api/services/health | Estado de todos los servicios |
| GET | /api/dashboard | Vista consolidada de todo el sistema |
| POST | /api/agents/register | Registrar o actualizar agente (al iniciar) |
| POST | /api/plans/register | Registrar un nuevo plan antes de ejecutar |
| PUT | /api/plans/update | Actualizar progreso de una tarea |
| PUT | /api/plans/close | Cerrar plan al terminar |
| GET | /api/github/repos | Inventario de repos GitHub conectados |

### Protocolo Obligatorio para Agentes

**Al iniciar sesión:**
```bash
curl -X POST http://localhost:9091/api/agents/register \
  -H "Content-Type: application/json" \
  -d '{"agent_id": "arquitecto-facturaia", "project": "facturaia", "role": "arquitecto", "status": "active"}'
```

**Al registrar un plan (ANTES de ejecutar):**
```bash
curl -X POST http://localhost:9091/api/plans/register \
  -H "Content-Type: application/json" \
  -d '{"plan_id": "plan-XXX", "agent_id": "arquitecto-facturaia", "description": "descripcion del plan"}'
```

**Al completar una tarea:**
```bash
curl -X PUT http://localhost:9091/api/plans/update \
  -H "Content-Type: application/json" \
  -d '{"plan_id": "plan-XXX", "task": "nombre-tarea", "status": "completed", "evidence": "output del comando"}'
```

**Al terminar:**
```bash
curl -X PUT http://localhost:9091/api/plans/close \
  -H "Content-Type: application/json" \
  -d '{"plan_id": "plan-XXX", "agent_id": "arquitecto-facturaia"}'
```

**Regla de oro**: Todo lo que hagas, OpenClaw lo debe saber. Si OpenClaw no lo sabe, no pasó.

---

## 10. Análisis del Sistema

### Fortalezas

| Área | Fortaleza |
|------|-----------|
| Arquitectura | Modular y dockerizada, fácil de iterar |
| OCR | Claude Opus 4.5 + Tesseract como fallback |
| Stack | Go + PostgreSQL + React Native — tecnologías maduras |
| DGII | Validación específica para RD (NCF, RNC, ITBIS, ISR, ISC) |
| Deploy | Coolify + Traefik — automatización y reverse proxy |
| DB | Connection pooling con Supavisor |
| Resiliencia | autoheal + retry BD con backoff exponencial (v2.18.0) |

### Debilidades / Riesgos

| Severidad | Área | Riesgo |
|-----------|------|--------|
| CRÍTICO | Seguridad | Sin WAF dedicado para la app de facturas |
| ALTO | Disponibilidad | MinIO single-node (SPOF) |
| ALTO | Disponibilidad | PostgreSQL sin replicación (SPOF) |
| ALTO | Negocio | n8n subutilizado (0 workflows) — DGII manual |
| MEDIO | Costo | Dependencia Claude Opus 4.5 (latencia, costo, disponibilidad) |
| MEDIO | Seguridad | JWT sin revocación de tokens |
| MEDIO | Observabilidad | Sin monitoreo/alerting centralizado |
| MEDIO | Performance | OCR sincrónico — sin cola de procesamiento |

### Recomendaciones Prioritarias

1. **WAF** para la app — CRÍTICO seguridad (bloquear IPs maliciosas, rate limiting)
2. **HA para MinIO** — replicación o backup periódico
3. **HA para PostgreSQL** — streaming replication o pgBouncer con failover
4. **Cola OCR asíncrona** — Redis Queue o n8n para procesamiento no-bloqueante
5. **Activar n8n** — workflows DGII 606/607 (Plan-007 pendiente)
6. **Monitoreo centralizado** — Prometheus + Grafana o similar
7. **Refresh tokens + revocación** — mejorar seguridad JWT
8. **Redis caching** — reducir consultas repetidas a PostgreSQL

---

## 11. Flujo Completo de una Factura

### Descripción Textual

```
1. CLIENTE en App Móvil
   ├── Login con RNC + PIN → POST /api/clientes/login/
   └── Recibe JWT (exp 24h) → guardado en SecureStore

2. ESCANEO
   ├── App abre cámara (react-native-document-scanner-plugin)
   ├── Cliente fotografía la factura
   └── App envía imagen → POST /api/process-invoice (Authorization: Bearer JWT)

3. PROCESAMIENTO en Backend (facturaia-ocr Go)
   ├── Recibe imagen multipart
   ├── Guarda imagen en MinIO (bucket: facturas)
   ├── Inserta registro en facturas_clientes (estado: procesando)
   ├── Preprocesa imagen con ImageMagick 7
   ├── Envía imagen a Claude Opus 4.5 via CLIProxyAPI :8317
   │   └── System prompt: "Responde SOLO JSON con campos DGII"
   ├── Claude extrae: NCF, RNC, fechas, montos, ITBIS, ISR, ISC, etc.
   ├── Valida datos con POST /api/v1/invoices/validate (9+ reglas DGII)
   ├── Asigna extraction_status:
   │   ├── validated → todo OK
   │   ├── review    → confidence<0.85 o needs_review=true
   │   └── error     → validación DGII falló
   └── Actualiza facturas_clientes con todos los datos

4. RESULTADO en App Móvil
   ├── Si validated → HomeScreen (lista de facturas)
   ├── Si review/error → InvoiceReviewScreen (edición manual)
   │   ├── Cliente corrige campos incorrectos
   │   └── Guarda → re-valida → si OK → validated
   └── Cliente puede ver imagen via /api/facturas/{id}/imagen (proxy MinIO)
```

### Diagrama ASCII

```
┌─────────────────────────────────────────────────────────────────┐
│                     APP MÓVIL (React Native)                    │
│  LoginScreen → HomeScreen → CameraScreen → InvoiceReviewScreen  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS / HTTP
                           │ JWT en Authorization header
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│               facturaia-ocr v2.19.0 (Go, puerto 8081)           │
│                        host network                             │
│                                                                 │
│  /api/clientes/login/ ──────────────────── JWT (24h exp)        │
│  /api/process-invoice ─────── upload imagen ─────────────────► │
│  /api/facturas/* ───────────── CRUD facturas ─────────────────► │
│  /api/v1/invoices/validate ─── validación DGII ──────────────► │
│  /api/facturas/{id}/imagen ─── proxy MinIO ───────────────────► │
└────────────┬─────────────────────────┬────────────────────────┘
             │                         │
             ▼                         ▼
┌────────────────────┐      ┌──────────────────────────────────┐
│  PostgreSQL 15.8   │      │  CLIProxyAPI :8317               │
│  localhost:5433    │      │  Claude Opus 4.5 (OCR principal) │
│  100 tablas        │      │  41 modelos disponibles          │
│  315 clientes      │      │  OpenAI-compatible API           │
│  7 facturas        │      └──────────────────────────────────┘
└────────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  MinIO localhost:9000       │
│  bucket: facturas           │
│  imágenes originales        │
└─────────────────────────────┘

Infraestructura de soporte:
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   autoheal   │   │   Coolify    │   │  OpenClaw    │
│  watchdog    │   │  :8000       │   │  :9091       │
│  unhealthy   │   │  orquesta    │   │  cerebro     │
│  containers  │   │  Docker      │   │  multi-agent │
└──────────────┘   └──────────────┘   └──────────────┘
                         │
                         ▼
                   ┌──────────────┐
                   │ Traefik      │
                   │ :80/:443     │
                   │ reverse proxy│
                   └──────────────┘
```

### Estados de una Factura

```
[upload] ──► [procesando] ──► [validated]  ─── Datos correctos, flujo normal
                         └──► [review]     ─── Requiere revisión manual humana
                         └──► [error]      ─── Falló validación DGII
                                    │
                              InvoiceReviewScreen
                                    │
                              [corregido] ──► [validated]
```

---

*Archivo generado: 10-Mar-2026 | Actualizar con cada cambio significativo de arquitectura*
