# Reporte Mejoras Cycle — FacturaIA 30-Mar-2026
# Post 12/16 mejoras (commits 6218273d, 692645bd, 592e735f)
# Auditoría: código, seguridad, rendimiento, build, UX, dependencias

---

## RESUMEN EJECUTIVO
- **Total hallazgos únicos**: 45 (deduplicado de 73 brutos)
- **Críticos**: 8
- **Altos**: 12
- **Medios**: 14
- **Bajos**: 11

---

## CRÍTICOS (8)

### 1. InvoiceListScreen es código muerto — no registrado en navigator
- **Archivo**: src/screens/InvoiceListScreen.tsx (entero)
- **Problema**: App.tsx no tiene ruta 'InvoiceList'. El screen importa RootStackParamList de types/invoice.ts que define rutas inexistentes. route.params.groupId crashea. Pantalla inalcanzable.
- **Impacto**: CRÍTICO (código muerto 280+ líneas, tipos conflictivos)
- **Esfuerzo**: 30 min — eliminar archivo y limpiar tipos

### 2. Release APK firmado con debug keystore
- **Archivo**: android/app/build.gradle:112
- **Problema**: `signingConfig signingConfigs.debug` en release. Debug key es pública (password "android"). Play Store rechaza. Sin protección de integridad.
- **Impacto**: CRÍTICO (distribución + seguridad)
- **Esfuerzo**: 1h — generar release keystore, configurar signing

### 3. ProGuard/R8 deshabilitado en release
- **Archivo**: android/app/build.gradle:68, gradle.properties
- **Problema**: `enableProguardInReleaseBuilds` es false. Código Java/Kotlin no minificado ni ofuscado. Reverse engineering trivial.
- **Impacto**: CRÍTICO (seguridad + tamaño APK, -10-20MB)
- **Esfuerzo**: 30 min — habilitar + probar build

### 4. No ABI splits — APK universal 79MB
- **Archivo**: android/app/build.gradle, gradle.properties
- **Problema**: 4 ABIs (armeabi-v7a, arm64-v8a, x86, x86_64) en un APK. Usuario arm64 descarga 4x código nativo innecesario.
- **Impacto**: CRÍTICO (UX, 79MB → ~22MB por dispositivo)
- **Esfuerzo**: 30 min — agregar splits { abi { enable true } }

### 5. HTTP sin cifrar (API_BASE_URL)
- **Archivo**: src/config/api.ts:6
- **Problema**: `http://217.216.48.91:8081` — RNC, PIN, JWT, facturas viajan en texto plano. Ya documentado en mejoras anteriores.
- **Impacto**: CRÍTICO (seguridad)
- **Esfuerzo**: 2-3h — nginx reverse proxy con TLS

### 6. types/invoice.ts tiene RootStackParamList duplicado y conflictivo
- **Archivo**: src/types/invoice.ts:162-168
- **Problema**: Define rutas 'InvoiceList', 'Settings', 'Camera: {groupId}' que no existen en App.tsx. InvoiceListScreen importa estos tipos → bugs de navegación.
- **Impacto**: CRÍTICO (tipos rotos, crashes potenciales)
- **Esfuerzo**: 15 min — eliminar RootStackParamList de types, usar solo App.tsx

### 7. SYSTEM_ALERT_WINDOW permission innecesario
- **Archivo**: android/app/src/main/AndroidManifest.xml:5
- **Problema**: Permite dibujar overlays sobre otras apps. No se necesita para escanear facturas. Riesgo de tapjacking.
- **Impacto**: CRÍTICO (seguridad, Play Store puede rechazar)
- **Esfuerzo**: 5 min — remover línea

### 8. iOS bundleIdentifier es com.gestoriard.app (proyecto equivocado)
- **Archivo**: app.json:34
- **Problema**: Si se hace build iOS, usará el bundle ID de GestoriaRD. App Store lo rechazará o lo vinculará al proyecto incorrecto.
- **Impacto**: CRÍTICO (distribución iOS)
- **Esfuerzo**: 5 min — cambiar a com.huyghusrl.facturaia

---

## ALTOS (12)

### 9. 6+ handlers silencian errores sin feedback al usuario
- **Archivos**: InvoiceReviewScreen.tsx:164,183 | InvoiceDetailScreen.tsx:63,75 | HomeScreen.tsx:72,93 | InvoiceReviewScreen.tsx:150
- **Problema**: catch blocks solo hacen console.error. Usuario no ve nada cuando falla un API call. Piensa que la app se colgó.
- **Impacto**: ALTO (UX, 6 puntos de fallo invisible)
- **Esfuerzo**: 2h — agregar Alert.alert o toast en cada catch

### 10. expo-dev-client en dependencies de producción
- **Archivo**: package.json:30
- **Problema**: Bundle de desarrollo (debugging, dev menu) incluido en release. Superficie de ataque innecesaria.
- **Impacto**: ALTO (seguridad + tamaño)
- **Esfuerzo**: 10 min — mover a devDependencies

### 11. offlineQueue almacena URIs de facturas en AsyncStorage (sin cifrar)
- **Archivo**: src/utils/offlineQueue.ts:7,51-56
- **Problema**: Paths a imágenes de facturas en texto plano. Accesible en dispositivos rooteados.
- **Impacto**: ALTO (seguridad datos financieros)
- **Esfuerzo**: 1h — migrar a expo-secure-store

### 12. apiClient permite absolute URLs (bypass de base URL)
- **Archivo**: src/utils/apiClient.ts:93
- **Problema**: `endpoint.startsWith('http')` acepta cualquier URL. Un caller malicioso o bug podría redirigir requests a servidor externo.
- **Impacto**: ALTO (seguridad)
- **Esfuerzo**: 15 min — validar contra allowlist de hosts

### 13. isAuthenticated() solo verifica existencia de token
- **Archivo**: src/services/authService.ts:143-145
- **Problema**: No valida formato, firma ni expiración del JWT. Token corrupto o expirado pasa como válido.
- **Impacto**: ALTO (seguridad)
- **Esfuerzo**: 30 min — agregar validación básica de formato JWT

### 14. Resource shrinking deshabilitado
- **Archivo**: android/app/build.gradle:113
- **Problema**: Recursos Android no usados (drawables, strings de libs nativas) incluidos en APK.
- **Impacto**: ALTO (tamaño, -2-8MB)
- **Esfuerzo**: 15 min — habilitar shrinkResources

### 15. Imagen se sube a quality=1 (sin compresión)
- **Archivo**: src/screens/CameraScreen.tsx:117,139,70
- **Problema**: JPEG a 100% calidad = 2-5MB por factura. OCR no necesita esa calidad. Upload lento en LTE.
- **Impacto**: ALTO (rendimiento, UX)
- **Esfuerzo**: 5 min — cambiar quality a 0.7-0.8

### 16. No hay network_security_config.xml / no certificate pinning
- **Archivo**: AndroidManifest.xml
- **Problema**: Sin pinning de certificados. MITM posible en redes públicas.
- **Impacto**: ALTO (seguridad)
- **Esfuerzo**: 1h — crear config + pinear certificado del servidor

### 17. InvoiceListScreen usa getToken() directo en vez de useAuth hook
- **Archivo**: src/screens/InvoiceListScreen.tsx:69
- **Problema**: Bypassa el hook de auth. No reacciona a cambios de estado de autenticación.
- **Impacto**: ALTO (bug, si la pantalla se resucita)
- **Esfuerzo**: N/A (pantalla es código muerto, eliminar)

### 18. App.tsx params InvoiceReview usan `any`
- **Archivo**: App.tsx:37-38
- **Problema**: `extractedData: any` y `validation: any`. Tipos concretos existen en InvoiceReviewScreen. LogBox supprime el warning que esto causa.
- **Impacto**: ALTO (type safety, oculta bugs)
- **Esfuerzo**: 15 min — importar tipos correctos

### 19. api.upload sin timeout
- **Archivo**: src/utils/apiClient.ts:238
- **Problema**: Upload de FormData sin AbortController. Upload colgado = UI bloqueada indefinidamente.
- **Impacto**: ALTO (UX, mismo bug que causó el splash infinito)
- **Esfuerzo**: 10 min — agregar AbortController como en apiClient principal

### 20. date-fns importado en InvoiceListScreen — puede no estar instalado
- **Archivo**: src/screens/InvoiceListScreen.tsx:34
- **Problema**: Usa format() de date-fns. Otros screens usan toLocaleDateString(). Si date-fns no está en deps → crash.
- **Impacto**: ALTO (si la pantalla se resucita)
- **Esfuerzo**: N/A (pantalla es código muerto)

---

## MEDIOS (14)

### 21. formatMoney duplicado en 3 archivos
- **Archivos**: HomeScreen.tsx, InvoiceDetailScreen.tsx, CameraScreen.tsx
- **Problema**: Lógica idéntica `RD$ ${amount.toLocaleString('es-DO', ...)}`. Debería ser util compartido.
- **Esfuerzo**: 15 min

### 22. getEstadoColor duplicado en 2 archivos
- **Archivos**: HomeScreen.tsx, InvoiceDetailScreen.tsx
- **Esfuerzo**: 10 min

### 23. formatDate duplicado en 2 archivos
- **Archivos**: HomeScreen.tsx, InvoiceDetailScreen.tsx
- **Esfuerzo**: 10 min

### 24. bcryptjs en dependencies de producción (no se usa)
- **Archivo**: package.json:23
- **Problema**: Librería de hashing server-side. 0 usos en src/. Añade peso al bundle.
- **Esfuerzo**: 5 min — remover

### 25. @react-native/debugger-frontend en dependencies de producción
- **Archivo**: package.json:20
- **Problema**: Chrome DevTools frontend (~5-10MB) en prod.
- **Esfuerzo**: 5 min — mover a devDeps

### 26. MIME type sin validar en facturasService upload
- **Archivo**: src/services/facturasService.ts:150-151
- **Problema**: Extensión del URI se usa directamente como MIME type sin allowlist. Podría ser image/svg+xml (XSS).
- **Esfuerzo**: 10 min

### 27. validarFactura envía Record<string, any> sin sanitizar
- **Archivo**: src/services/facturasService.ts:211-219
- **Esfuerzo**: 15 min

### 28. offlineQueue JSON.parse sin schema validation
- **Archivo**: src/utils/offlineQueue.ts:52
- **Esfuerzo**: 15 min

### 29. OTA updates config inconsistente
- **Archivo**: AndroidManifest.xml:21-22
- **Problema**: CHECK_ON_LAUNCH=ALWAYS pero ENABLED=false. Configuración contradictoria.
- **Esfuerzo**: 5 min

### 30. Storage permissions sin maxSdkVersion
- **Archivo**: AndroidManifest.xml:6-7
- **Problema**: READ/WRITE_EXTERNAL_STORAGE sin scope. Broad access en Android <10.
- **Esfuerzo**: 5 min

### 31. InvoiceReviewScreen errorMap rebuilt every render
- **Archivo**: src/screens/InvoiceReviewScreen.tsx:111-117
- **Esfuerzo**: 5 min — wrappear en useMemo

### 32. Metro config sin optimizaciones
- **Archivo**: metro.config.js
- **Problema**: Solo getDefaultConfig. Sin drop_console, sin aliases, sin bundle splitting.
- **Esfuerzo**: 30 min

### 33. FlatList sin performance props (HomeScreen + InvoiceListScreen)
- **Archivos**: HomeScreen.tsx:252, InvoiceListScreen.tsx:306
- **Problema**: Sin getItemLayout, initialNumToRender, removeClippedSubviews.
- **Esfuerzo**: 15 min

### 34. CameraScreen editData no se resetea en reset()
- **Archivo**: src/screens/CameraScreen.tsx:198-203
- **Problema**: Stale edit data puede mostrarse en segundo escaneo.
- **Esfuerzo**: 5 min

---

## BAJOS (11)

### 35. SCREEN_WIDTH declarada pero nunca usada
- **Archivo**: CameraScreen.tsx:44
- **Esfuerzo**: 1 min

### 36. Image source con || '' genera warning RN
- **Archivos**: InvoiceDetailScreen.tsx:142, InvoiceReviewScreen.tsx:447
- **Esfuerzo**: 5 min

### 37. InvoiceDetailScreen: factura.total no existe en tipo Factura
- **Archivo**: InvoiceDetailScreen.tsx:283
- **Esfuerzo**: 5 min

### 38. useNavigation() sin type param (InvoiceDetail + InvoiceReview)
- **Archivos**: InvoiceDetailScreen.tsx:46, InvoiceReviewScreen.tsx:100
- **Esfuerzo**: 5 min

### 39. useFocusEffect dependency array vacía referencia loadData
- **Archivo**: HomeScreen.tsx:101-105
- **Esfuerzo**: 5 min

### 40. InvoiceReviewScreen async handlers sin cleanup on unmount
- **Archivo**: InvoiceReviewScreen.tsx
- **Problema**: setState después de unmount → React warning.
- **Esfuerzo**: 15 min

### 41. LoginScreen formatRNC solo formatea cédula (11 dígitos), no RNC (9)
- **Archivo**: LoginScreen.tsx:75-81
- **Esfuerzo**: 10 min

### 42. InvoiceListScreen currency symbol USD ($) en vez de RD$
- **Archivo**: InvoiceListScreen.tsx:196
- **Esfuerzo**: N/A (código muerto)

### 43. uploadFacturaOffline inline sin useCallback
- **Archivo**: HomeScreen.tsx:130-138
- **Esfuerzo**: 5 min

### 44. No accessibility labels en elementos interactivos
- **Archivo**: InvoiceDetailScreen.tsx (image, buttons)
- **Esfuerzo**: 15 min

### 45. EAS production profile sin resourceClass ni cache
- **Archivo**: eas.json
- **Esfuerzo**: 10 min

---

## TOP 5 QUICK WINS (máximo impacto, mínimo esfuerzo)

1. **Eliminar InvoiceListScreen + limpiar tipos** (30 min) — elimina 280 líneas de código muerto y 6 bugs
2. **Habilitar ProGuard + shrinkResources + ABI splits** (30 min) — APK de 79MB → ~20MB
3. **Cambiar image quality a 0.7** (5 min) — uploads 3x más rápidos
4. **Remover SYSTEM_ALERT_WINDOW** (5 min) — elimina permiso peligroso
5. **Corregir iOS bundleIdentifier** (5 min) — previene desastre en App Store

## ORDEN SUGERIDO DE SPRINTS

Sprint A (1h): Quick wins #1-5 + #8 iOS bundle ID + #10 expo-dev-client + #24 bcryptjs
Sprint B (2h): Error handling visible (#9) + upload timeout (#19) + types cleanup (#18, #6)
Sprint C (3h): Release keystore (#2) + HTTPS (#5) + network security config (#16)
Sprint D (2h): Utils compartidos (#21-23) + performance (#31, #33) + cleanup bajo
