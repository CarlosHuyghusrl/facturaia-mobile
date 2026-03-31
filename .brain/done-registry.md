# Done Registry

## Completado y verificado

| Fecha | Tarea | Verificacion | Commit |
|-------|-------|-------------|--------|
| 2026-03-16 10:51 UTC | rules-boris-install | head -5 confirma 05-modelos-ia.md, grep sm/notifications confirma 06-boris-flujo.md. Commit fcebcd88 pusheado a main. | 2ac85fef |
| 2026-03-19 15:12 UTC | context-mode-facturaia | claude mcp list | grep context-mode -> 'context-mode: npx -y context-mode - Connected'. Ya estaba instalado en local config. | 6ea9ccb9 |
| 2026-03-24 03:09 UTC | commit-pending-files | 25 archivos staged y commiteados en 8a4a367f. git push OK. Repo limpio y sincronizado. | 8a4a367f |
| 2026-03-30 17:24 UTC | diag-facturaia-300326 | Causa raiz: UFW bloqueaba 8081 externo + authService sin timeout. Fix: ufw allow 8081/tcp + AbortController 15s. BUILD SUCCESSFUL 6m30s, APK 79MB. Commit 70f0832e. | 70f0832e |
| 2026-03-30 18:04 UTC | mejoras-facturaia-300326 | 12 de 16 mejoras ejecutadas en 3 waves (Wave 1: InvoiceReview apiClient + versionCode 2 + package com.huyghusrl.facturaia. Wave 3: Supabase eliminado + authService unificado. Wave 4: strip console + npm audit). 3 builds exitosos. 4 mejoras pospuestas (JWT backend, HTTPS, UFW cleanup, health version = fuera de scope app movil). | 592e735f |
| 2026-03-30 18:31 UTC | mejoras-cycle-300326 | 45 hallazgos documentados en .brain/mejoras-cycle-300326.md (8 criticos, 12 altos, 14 medios, 11 bajos). grep -c ### = 45. Commit 25688c04 pushed. | 25688c04 |
| 2026-03-30 22:56 UTC | criticos-facturaia-300326 | 8 criticos resueltos en 2 waves (Wave 1: 5e0d9159, Wave 2: b23eccb7). C1: 0 refs InvoiceListScreen. C2: 0 SYSTEM_ALERT_WINDOW. C3: bundleId com.huyghusrl.facturaia. C4: ProGuard ON. C5: ABI splits enabled. C6: APKs 20-25MB (antes 79MB). C7: HomeScreen import fix. Quick wins ya estaban hechos (quality 0.7, expo-dev-client en devDeps). BUILD SUCCESSFUL. | 59ba3ade |
| 2026-03-30 23:59 UTC | keystore-errors-310326 | Release keystore CN=FacturaIA O=HUYGHU generado, APK firmado v2 scheme verificado con apksigner, 7 Alert.alert agregados (0 catch silenciosos), BUILD SUCCESSFUL 4 APKs 19-25MB. Commit 4316c9a2 pushed. | 4316c9a2 |
| 2026-03-31 00:22 UTC | jwt-expiry-310326 | JWT expiracion ya estaba implementada y desplegada. ExpiresAt 24h en jwt.go:56. Fallback secret eliminado en Init(). Token decode confirma exp campo con 24h. Expired token retorna 401. Sin cambios de codigo necesarios. | 0ba5cf7d |
| 2026-03-31 00:33 UTC | offline-secure-310326 | offlineQueue migrado de AsyncStorage a SecureStore (0 AsyncStorage, 10 SecureStore). Chunking iOS. CLAUDE.md: 4 bugs marcados resueltos, 2 legit abiertos. BUILD SUCCESSFUL 4 APKs 19-25MB. Commit 48afd53a pushed. | 48afd53a |
| 2026-03-31 01:09 UTC | app-security-310326 | apiClient allowlist (4 hosts, 2 checkpoints), isAuthenticated JWT format+exp validation con auto-logout, HTTPS-ready config con API_PRODUCTION_URL. BUILD SUCCESSFUL 4 APKs 19-25MB. Commit e40d6877 pushed. | e40d6877 |
| 2026-03-31 01:23 UTC | tests-pinning-310326 | 27 jest tests: 3 suites PASS (authService 8, apiClient 10, offlineQueue 9). Certificate pinning no factible en Expo managed (documentado). BUILD SUCCESSFUL. Commit e8a12814 pushed. | e8a12814 |

## Intentado pero fallido

| Fecha | Tarea | Por que fallo | Que se necesita |
|-------|-------|--------------|-----------------|
