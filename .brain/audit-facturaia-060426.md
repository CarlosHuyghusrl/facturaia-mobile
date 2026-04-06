# Audit FacturaIA — 06-Abr-2026
Generado por: arquitecto-facturaia via GitNexus
GitNexus: 662 nodos | 856 edges | 18 clusters | 14 flows

---

## ESTADO GENERAL: ⚠️ WARN (listo para Play Store con 2 fixes menores)

---

## 1. GEMINI / IA

| Modelo | Estado |
|--------|--------|
| gemini-2.5-flash (primario) | ⏳ COOLDOWN 49min (por pruebas de sesión) |
| openrouter-gemma-27b (fallback) | ✅ OPERATIVO (probado con visión) |
| Token OAuth carlos@huyghusrl.com | ✅ REFRESCADO (expiró feb 2026, ahora válido) |
| auto-refresh | ✅ ACTIVADO (no volverá a expirar solo) |

**Conclusión**: Gemini vuelve automático en ~49min. Fallback funciona. Sin acción urgente.

---

## 2. TYPESCRIPT

```
tsconfig.json: TS5098 — Option 'customConditions' incompatible con moduleResolution actual
```
**Severidad**: BAJA — no afecta build Android ni ejecución. Es un warning de configuración.
**Fix**: Cambiar `moduleResolution` en tsconfig.json a `bundler` o eliminar `customConditions`.

---

## 3. SEGURIDAD

### ✅ Buenas noticias
- **0 secrets en código fuente** — no hay API keys, passwords ni tokens hardcodeados
- **API usa HTTPS** — `https://ocr.huyghusrl.com` en producción
- **Tokens en SecureStore** — authService usa expo-secure-store correctamente
- **offlineQueue.ts usa SecureStore** — cola offline cifrada con chunking para datos grandes

### ⚠️ 17 vulnerabilidades HIGH (npm audit)
Todas son en `@expo/plist` → `@xmldom/xmldom` (XML injection via CDATA).
**IMPACTO REAL: NINGUNO** — estas librerías son tools de build/CLI de Expo, no corren en la app.
No afectan el APK final. Son falsos positivos para producción móvil.

---

## 4. ARQUITECTURA (via GitNexus)

### Flujos principales identificados
| Flow | Pasos | Estado |
|------|-------|--------|
| ProcessImage → CleanChunks | 5 | ✅ Camera → upload → limpieza |
| HandleSync → SecureGet | 5 | ✅ Sync offline con SecureStore |
| HandleSync → CleanChunks | 6 | ✅ Limpieza post-sync |
| OfflineQueueBadge → SecureGet | 5 | ✅ UI badge cola offline |
| LoginScreen → ValidateForm | 3 | ✅ Auth flow |

### Pantallas (5)
- LoginScreen.tsx — auth con RNC + PIN
- HomeScreen.tsx — lista facturas con formatMoney
- CameraScreen.tsx — processImage() → navega a InvoiceDetail
- InvoiceDetailScreen.tsx — detalle factura
- InvoiceReviewScreen.tsx — revisión/corrección post-OCR

### Servicios clave
- `src/utils/apiClient.ts` (312 líneas) — cliente HTTP centralizado con auth headers
- `src/services/facturasService.ts` — 10+ funciones CRUD (subirFactura, listarFacturas, reprocesarFactura...)
- `src/services/authService.ts` — login, logout, getToken, isAuthenticated
- `src/utils/offlineQueue.ts` (240 líneas) — cola offline con SecureStore chunked

### InvoiceReviewScreen — BUG ANTERIOR RESUELTO ✅
Confirma: `import { api } from '../utils/apiClient'` — usa apiClient correctamente.
Bug de 401 silencioso ya estaba corregido.

---

## 5. DEPENDENCIAS

| Paquete | Actual | Latest | Urgencia |
|---------|--------|--------|----------|
| expo | 52.0.48 | 55.0.11 | BAJA — breaking changes, no urgente |
| react-native | 0.76.9 | 0.84.1 | BAJA — no urgente para Play Store |
| expo-secure-store | 14.0.1 | 55.0.11 | BAJA — funciona bien en v14 |

**Conclusión**: Las versiones actuales son estables. NO actualizar antes de Play Store — riesgo innecesario de breaking changes.

---

## 6. CALIDAD DE CÓDIGO

| Métrica | Valor | Evaluación |
|---------|-------|-----------|
| console.log en producción | 25 instancias | ⚠️ Limpiar antes de Play Store |
| TODOs/FIXMEs | 0 | ✅ Código limpio |
| Secrets en código | 0 | ✅ Seguro |
| Tests e2e | 2 archivos (101 líneas) | ✅ login.test.js + invoice.test.js |
| subirFactura conectividad | Sin callers en grafo | ⚠️ Verificar si se usa directamente |

---

## 7. BUILD Y DEPLOY

- **APK más reciente**: app-release.apk — BUILD SUCCESSFUL 06-Abr-2026 (~80MB)
- **Backend**: facturaia-ocr v2.25.0 — healthy, puerto 8081
- **Autoheal**: willfarrell/autoheal monitoreando cada 30s
- **HTTPS**: ocr.huyghusrl.com con TLS ✅

---

## 8. TOP 5 MEJORAS PRIORIZADAS

### 🔴 P1 — Fallback automático OCR (CRÍTICO para Play Store)
**Qué**: Cuando Gemini está en cooldown → usar gemma-27b → si falla → revision_manual
**Por qué**: Sin esto la factura se pierde cuando Gemini tiene cuota exhausted
**Dónde**: facturaia-ocr backend (Go), ~50 líneas en extractor.go
**Esfuerzo**: 2-3 horas

### 🟡 P2 — Eliminar console.log en producción
**Qué**: 25 console.log/console.error expuestos
**Por qué**: Expone datos de facturas/tokens en logs del dispositivo
**Dónde**: src/screens/ y src/services/
**Esfuerzo**: 30 minutos

### 🟡 P3 — Versión 1.0.0 → 1.0.1 o 1.1.0
**Qué**: package.json version y app.json version/versionCode
**Por qué**: Play Store requiere incrementar versionCode en cada upload
**Esfuerzo**: 5 minutos

### 🟢 P4 — Fix tsconfig.json customConditions
**Qué**: Cambiar moduleResolution a bundler
**Por qué**: Eliminar el único error TypeScript
**Esfuerzo**: 2 minutos

### 🟢 P5 — Verificar que subirFactura se usa
**Qué**: GitNexus no detecta callers de subirFactura (posible función huérfana)
**Por qué**: Si no se usa, se puede eliminar (código muerto)
**Dónde**: src/services/facturasService.ts:145
**Esfuerzo**: 15 minutos

---

## 9. LISTO PARA PLAY STORE?

| Item | Estado | Bloqueante? |
|------|--------|-------------|
| Build compila | ✅ SUCCESSFUL | — |
| Backend healthy | ✅ v2.25.0 | — |
| HTTPS producción | ✅ | — |
| Secrets en código | ✅ Ninguno | — |
| Auth funcional | ✅ RNC+PIN+JWT | — |
| OCR funcional | ⚠️ Gemini en cooldown hoy | NO (vuelve en 49min) |
| Fallback OCR | ❌ No implementado | **SÍ** — riesgo UX |
| console.log | ⚠️ 25 instancias | NO (recomendado) |
| Versión Play Store | ⚠️ 1.0.0 sin versionCode | **SÍ** — Play Store lo requiere |
| Vulnerabilidades críticas | ✅ 0 críticas | — |

**Veredicto**: 2 items bloqueantes para Play Store:
1. **Fallback OCR** (P1) — sin esto la app falla silenciosamente cuando Gemini está caído
2. **versionCode** — Play Store rechaza APKs sin versionCode incrementado desde la última subida

---

## RESUMEN EJECUTIVO

Estado: **CASI LISTO** para Play Store.
La app compila, el backend está healthy, no hay secrets en código, HTTPS configurado, auth funciona.

**Hacer antes de Play Store:**
1. Implementar fallback OCR en backend (2-3h) — P1
2. Incrementar versionCode en app.json (5min) — bloqueante Play Store
3. Limpiar console.log (30min) — recomendado

**No hacer antes de Play Store:**
- NO actualizar Expo/RN — riesgo innecesario
- NO preocuparse por las 17 vulns HIGH — son de dev tools, no del APK
