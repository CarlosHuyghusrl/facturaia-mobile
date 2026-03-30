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

## Intentado pero fallido

| Fecha | Tarea | Por que fallo | Que se necesita |
|-------|-------|--------------|-----------------|
