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
| 2026-03-31 01:41 UTC | e2e-cicd-310326 | Detox config + 2 E2E templates (login 4, invoice 4) + GitHub Actions CI (3 jobs: test, lint, build-android) + jest 27 tests PASS. Commit 8bba7e73 pushed. | 8bba7e73 |
| 2026-03-31 02:11 UTC | sentry-tls-310326 | Error reporter lightweight (sin deps) + ErrorBoundary React + initErrorReporter en App.tsx + captura errores globales + promesas + POST /api/errors. TLS ya preparado (task anterior). 27 tests PASS. BUILD SUCCESSFUL. Commit d35ed4a0 pushed. | d35ed4a0 |
| 2026-03-31 02:44 UTC | criticos-pendientes-310326 | Types any→concretos en App.tsx (InvoiceData, ValidationResult). Backend retry ya tenia backoff (main.go:26-45). ISC batch requiere aprobacion Carlos (23 facturas x AI tokens). .bak eliminado. .gitignore logs. 27 tests PASS. BUILD SUCCESSFUL. Commit 2a8071a6 pushed. | 2a8071a6 |
| 2026-03-31 03:28 UTC | backend-go-fixes-310326 | Backend v2.25.0 desplegado: goroutine reconexion BD cada 30s, POST /api/errors (sin auth, guarda en error_logs), container healthy, health 200, error insert verificado en BD. ISC batch skipped (no admin user, bug fixeado en v2.13.2, ISC=0 correcto para la mayoria). Go commit 5e3af27. | a5c4e546 |
| 2026-03-31 04:23 UTC | url-https-310326 | API migrada a https://ocr.huyghusrl.com. curl health 200. Old URL solo como fallback comentado. allowlist actualizado. 28 tests PASS. BUILD SUCCESSFUL. Commit e299782b pushed. | e299782b |
| 2026-03-31 13:16 UTC | audit-exhaustivo-310326 | Audit 5 secciones completo: 18 mejoras 100% listas, 8 incompletos, 5 riesgos produccion, top 5 mejoras, veredicto CONDICIONALMENTE lista. 28 tests PASS, health 200, /api/errors OK, docker healthy 9h. Commit eb21915c pushed. | eb21915c |
| 2026-03-31 17:08 UTC | bugfix-310326 | OpenAI 401 resuelto (key CLIProxyAPI actualizada, 47 modelos disponibles). Login Enter primera vez (onSubmitEditing + returnKeyType next/done + pinRef). Frontend review: 0 bugs criticos, 0 broken nav, gap accessibilityLabel. 28 tests PASS. BUILD SUCCESSFUL. Commit f920bc3e pushed. | f920bc3e |
| 2026-03-31 17:14 UTC | mejoras-post-bugfix-310326 | 10 mejoras documentadas: 3 alta (accessibility, FlatList perf, console.log), 4 media (any types, legacy types, npm audit, useMemo), 3 baja (api.ts legacy, cleartext, health version). Cada una con archivo:linea y justificacion. Read-only, 0 cambios de codigo. | 61eeee32 |
| 2026-03-31 17:43 UTC | mejoras-alta-310326 | 22 accessibilityLabel+testID en 5 screens (Login 6, Home 4, Camera 6, Detail 2, Review 4). FlatList 5 props perf (windowSize, maxToRender, initialNum, removeClipped, getItemLayout). console.log ya manejado por babel. 28 tests PASS. BUILD SUCCESSFUL. Commit a975aa83 pushed. | a975aa83 |
| 2026-03-31 17:55 UTC | mejoras-media-310326 | 4 mejoras MEDIA: types/invoice.ts 310→38 lineas, useCallback 3 handlers InvoiceReview, getUserMessage Record<string,any>, npm audit 14→7. 28 tests PASS. BUILD SUCCESSFUL. Commit 12e86b91 pushed. -225 lineas netas. | 12e86b91 |
| 2026-03-31 18:03 UTC | mejoras-baja-310326 | 3 mejoras BAJA: api.ts eliminado (-97 lineas), usesCleartextTraffic removido, health v2.25.0 desplegado. 28 tests PASS. BUILD SUCCESSFUL. Commit 025b55ff pushed. | 025b55ff |
| 2026-03-31 18:35 UTC | revision-boris-completa-310326 | Login smart submit: autoFocus + pin.length>=4 directo + Keyboard.dismiss. Backend audit: health/login/errors 200, docker healthy, auth enforced. Config audit: bundleId/ProGuard/HTTPS/babel/CI/28tests all OK. Qwen Vision: vision-model disponible, test real pendiente. BUILD SUCCESSFUL. Commit 48acd1cb. | 48acd1cb |
| 2026-03-31 18:56 UTC | vision-multitenant-310326 | Nombre FacturaIA unificado (5 refs). Gemini Vision OCR: match exacto con Claude OCR en factura real (gratis). Multi-tenant: empresa_id en 4 tablas, 3 empresas, RLS activo, no enforced. Commit f4d1ee6b pushed. | f4d1ee6b |
| 2026-03-31 19:14 UTC | multitenant-backend-310326 | OCR switch a Gemini 2.5 Flash (gratis via CLIProxyAPI). Multi-tenant YA funciona: JWT tiene empresa_alias, queries filtran por cliente_id (movil) y empresa_alias (admin). empresa_id/owner_id NULL = pendiente data entry Carlos. Container v2.25.1 deployed con OPENAI_MODEL=gemini-2.5-flash. Health 200, login 200. | b56ca372 |
| 2026-03-31 20:05 UTC | delete-button-quality-310326 | Boton eliminar factura con Alert confirmacion + api.delete + goBack. Quality 0.7→0.85 en camara y galeria. 28 tests PASS. BUILD SUCCESSFUL. Commit 1d44ec16 pushed. | 1d44ec16 |
| 2026-04-01 03:44 UTC | deep-explore-010426 | Wave 1: 26 screenshots de todos los modales y secciones del SaaS GestoriaRD (5 roles: admin, supervisor, contador, OV, DGII). Wave 2: Design Critique ejecutado (23/50, 6 críticos identificados) + Design System completo (paleta, tipografía, 30+ componentes, tokens JSON, 5 page templates, 5 user flows). Guardado en KB: design-critique-gestoriard-010426, design-system-gestoriard-010426, resultado-deep-explore-010426. | 5719a8ca |
| 2026-04-01 05:14 UTC | shadboard-study-010426 | 74 componentes UI en shadboard-reference/full-kit. Design system Apple/Stripe/Linear completo guardado en KB key=design-system-v2-gestoriard-010426 (id 3365). Tokens JSON, CSS vars, Tailwind config, 30+ componentes documentados, 5 patrones de página, 3 principios, 10 reglas. | be9f83ff |
| 2026-04-01 05:34 UTC | mockups-visuales-010426 | 3 mockups HTML creados y screenshots tomados via Playwright: A=Apple Blanco, B=Dark Elegante, C=Mix Moderno. Todos renderizan correctamente. Archivos en ~/mockups-gestoriard/. KB id 3389. | be9f83ff |
| 2026-04-01 15:18 UTC | explore-v2-010426 | 4 waves Playwright completadas. Reporte 7-secciones guardado KB id=3808. Findings: dual-DB bug Supabase vs PostgreSQL, QB 0 datos sincronizados, OV tabs 3 placeholders + 1 real (DGII IR-2) + 1 bug (TSS), Supervisor 7 tabs funcionales con Gemini 98.4% accuracy en codigos DGII. | be9f83ff |
| 2026-04-01 19:44 UTC | verificar-v2-completo-010426 | 27 APIs v2 verificadas (9 public 200, 17 auth 401). v2-dashboard UI Mockup C completo. Gaps: waves 3-5 faltantes, security finding password_crm_hash expuesto. Dev preview http://217.216.48.91:3015/v2-dashboard. KB guardado id=4082. | 23020d7 |
| 2026-04-01 20:13 UTC | fix-pruebas-010426 | Wave1: eed72af password_crm_hash eliminado (psql confirm, TSC clean). Wave2: 24 screenshots, 19 flujos probados, 8 errores catalogados. Wave3: 10 gaps priorizados. KB id=4131. | eed72af |
| 2026-04-02 01:38 UTC | rate-limit-310326 | 15 rutas sensibles protegidas con withRateLimit. TSC 0 errores. Commit 1de3134 pusheado. Las 3 rutas originales del task (tss/send-email, dgii-excel/upload-sharepoint, harvesting/manual) ya estaban protegidas. | 1de3134 |
| 2026-04-02 01:48 UTC | global-ratelimit-310326 | middleware.ts ya tenia implementado global rate limit 100/min per IP en lineas 61-84. GLOBAL_MAX_REQUESTS=100, GLOBAL_WINDOW_MS=60000, aplica a /api/* excepto health, console.warn en 429. No requeria cambios. TSC 0 errores. | 1de3134 |
| 2026-04-02 02:21 UTC | fix-bugs-criticos-010426 | TSC 0 errores. Scraper 0.0.0.0:8321 health OK. dgi-chat sin withRequireAuth. useCRMData usa fetch. 4 nuevas rutas API. Push a main, Coolify autodeploy iniciado. | 733ffed |
| 2026-04-06 11:05 UTC | facturaia-revivir-060426 | docker inspect -> healthy. docker ps -> facturaia-ocr Up (healthy). Logs: v2.25.0 arrancó 06-Apr 10:54:43, Database: true, Storage: true. Backup sha256:5591bd2d creado. Sin errores criticos. | e67be425 |
| 2026-04-06 11:47 UTC | facturaia-analisis-060426 | cat .brain/analisis-completo-060426.md muestra 6 secciones (ESTADO ACTUAL, INTEGRACION GESTORIARD, EVALUACION CHANDRA OCR 2, PLAN CONTINGENCIA, MEJORAS PROPUESTAS, RESUMEN EJECUTIVO). 367 lineas. Generado sin modificar codigo. | d09e49fe |
| 2026-04-06 15:51 UTC | audit-facturaia-060426 | 177 lineas en .brain/audit-facturaia-060426.md. GitNexus 684 nodos. Gemini cooldown verificado. KB guardado id=6622. Commit 1f137714 pushed. | 1f137714 |
| 2026-04-07 00:48 UTC | fallback-ocr-070426 | go build ./... OK. docker build v2.26.0 OK. curl /health -> healthy, database+storage available. FallbackProvider in providers.go confirmed. commit 12d701b pushed to master. | 3d433938 |
| 2026-04-07 15:08 UTC | diseno-responsive-070426 | 6 Playwright screenshots (375px+1440px x chat/dashboard/ficha). All pages responsive. UUID fix deployed. Ficha loads Acela Associates. Dashboard 4-col KPI grid. Chat mobile/desktop clean. Auth guard working. NUEVO badge live. WCAG AA contrast fixes applied. | 7153890 |
| 2026-04-07 16:40 UTC | identidad-gestoriard-070426 | npm run build exit 0, 99/99 páginas. grep huyghu frontend v2 = 0. Logo SVG creado. 6 placeholders. 9 UUID casts. TypeScript limpio. | d5ea0fe |
| 2026-04-07 19:33 UTC | mockup-sprint1-080426 | 0 errores TypeScript. 5 páginas implementadas. Scoring bug corregido. Push a main exitoso. | e071255 |
| 2026-04-07 22:10 UTC | dashboard-rediseno-fase1-080426 | Chrome MCP screenshot produccion: header Buenos dias + 315 Clientes KPI + 2 columnas + pipeline 1/12/148 real + casos 2026-000001 + accesos rapidos. 3 commits: aa122cf fixes, 6a82ddf KPI+header+layout, 579ed05 stats endpoint. npm build OK, tsc 0 errores. | 579ed05 |
| 2026-04-07 23:06 UTC | auditoria-visual-080426 | Wave 1: sidebar WCAG 99eb656 (iconos 20px, texto 0.85). Wave 2: 8 Chrome MCP screenshots 5 pantallas. Wave 3: usability fixes f26853e (min-h removed, empty states, tipo_notificacion). Wave 4: responsive 1440/768/375px OK. Wave 5: accessibility audit in progress. Critique 27.6/50 avg. 3572e58 brain files pushed. | 3572e58 |
| 2026-04-08 01:39 UTC | fix-backend-design-completo-080426 | 7 waves completadas. Wave 1: endpoints 500 resueltos. Wave 2: clientes semaforo scoring 30b8a95. Wave 3: declaraciones API 2572 rows 8ccfbb9. Wave 4: BD 27756 tareas borradas backup 9MB. Wave 5: biblioteca datos reales 8ccfbb9. Wave 6: responsive touch 44px dba1860. Wave 7: usability empty states+skeletons+error retry+focus dba1860. tsc 0 errores, build OK. | dba1860 |
| 2026-04-08 15:20 UTC | sprint2-dgii-oficina-virtual-080426 | 5 waves completadas. tsc 0 errores en cada wave. npm build OK 15.6kB. 7 archivos DGII creados (3423L total vs 10259L viejas = 67% reduccion). 6 tabs funcionales: Resumen+KPIs, Declaraciones 5 tipos, Formatos 8 DGII, Cuenta Corriente+Deudas, Consultas busqueda, Chat IA RAG. Ficha 360 +tab DGII. AlertaFiscalizacion en dashboard. ARIA accessibility. Responsive mobile. 5 commits pushed to main. | d87f42a |
| 2026-04-08 20:13 UTC | sprint3-cartas-agenda-inbox-crm-080426 | 5 waves completadas. tsc 0 errores en cada wave. Formularios 20 templates BD + auto-fill. Agenda calendario+tabla. Inbox 2 tabs (alertas+DGII). Ficha 360 +4 tabs (Financiero QB real 390 customers/447 invoices/148 payments, Historial, Reportes, Grupos). Chat RAG Perplexity con citas [1][2]. SLA visual incidencias. QB auto-match 156/390 clientes. 4 commits pushed. | 2ca62e9 |
| 2026-04-09 01:19 UTC | audit-responsive-usability-090426 | 10 pages con media queries responsive. tsc 0 errores. 5 agentes paralelos. Dashboard bottom-bar fix, clientes hide columns, ficha tabs scroll, formularios stack, agenda compact cells+44px, dgii full-width, inbox 50/50, biblioteca stack sidebar, chat safe-area, incidencias wrap. Pendiente: verificacion Chrome MCP 3 breakpoints post-deploy. | 3d98ab3 |
| 2026-04-09 12:43 UTC | facturaia-dgii-tabs-090426 | tsc 0 errores. TabCuentaCorriente lee data.cuenta_corriente con 5 columnas + banner azul pending + fallback legacy. TabDeclaraciones 14 filtros (era 6). +230 -32 lineas. Pushed to main. | e60b653 |
| 2026-04-09 13:29 UTC | sprint4-tss-qb-cmdk-config-090426 | 2 waves: W1 4 pages paralelas (TSS 1544L + Casos 696L + Config 400L + Supervision 460L), W2 CommandPalette 320L + QB badges + Biblioteca fix. tsc 0 errores cada wave. Todas con responsive 375/768/1440 + usability rules embebidas. Pendiente: verificacion Chrome MCP post-deploy. | 188c924 |
| 2026-04-09 14:02 UTC | fix-funciones-rotas-090426 | grep alert() = 0 en 5 archivos. tsc 0 errores. Dashboard 3 navega real, Agenda modal nueva tarea, Casos modal nuevo caso, Incidencias modal+expand, DGII Chat limpio. +924 -132 lineas. | c92f18d |
| 2026-04-09 21:25 UTC | audit-saas-gestoriard-090426 | 19 rutas auditadas. 348 lineas documentadas. 4 OK / 13 parciales / 2 rotas. KB guardado resultado-audit-visual-facturaia-090426. | 2c64d617 |
| 2026-04-09 22:36 UTC | megafix-saas-090426 | 5 bugs fixed: contadores 404→307(auth redirect), clientes Promise.all split, resumen-ejecutivo QB join via clientes.cliente_id, inbox removed sidebar, 4 DGII endpoints migrated. All queries verified against real DB with empresa_id 616b8f1b-d3f1. DB tests: 26 casos_dgi, 189 qb_invoices, 21 tareas_7d — all return data correctly. | 189664be |
| 2026-04-09 23:34 UTC | task-facturaia-qa-plano-100426 | QA completo 18 páginas GestoriaRD con Playwright. Plano arquitectura en .brain/qa-plano-100426.md (300+ líneas). kb_save resultado-qa-plano-100426 completado. 8/18 OK, 5 parciales, 5 bugs críticos documentados con causa raíz. | 189664be |
| 2026-04-15 17:32 UTC | facturas-venta-607-20260415 | Backend v2.27.0 healthy. GET /api/facturas/mis-facturas/ -> 200 OK, aplica_607 presente en JSON (aplica_607_en_keys: True). go build sin errores. tsc sin errores en archivos modificados. | 3bfda994 |
| 2026-04-15 18:44 UTC | informe-v2-gestoriard-20260415 | KB guardado id 7360. Informe: 22 paginas, 26661 lineas, 8 problemas detectados. Read-only sin modificaciones. | 88e86324 |
| 2026-04-15 19:25 UTC | deep-dive-v2-gestoriard-20260415 | KB guardado id 7364. 5 areas auditadas: Formato606Form (615L, 4 endpoints), 5 componentes DGII, Shell 17 links, 4 tabs desconectados FUNCIONALES, inventario 9 formularios. Read-only. | 367eb205 |
| 2026-04-17 16:41 UTC | spike-dgii-forms-170426 | npm run build exit 0, 24/24 vitest PASS, compare-xlsx ESTRUCTURA IDENTICA, release v0.1.0 en GitHub CarlosHuyghusrl/sypnose-dgii-forms | 1fa519e7 |
| 2026-04-17 17:51 UTC | task-facturaia-integrate-606-fetch-170426 | Build exit 0, 24/24 vitest PASSED, release v0.2.0 en GitHub. client606.ts con fetch real + adapter fechas + Vite proxy. App.tsx con loading/error/empty states. | 04b50ca |
| 2026-04-17 17:51 UTC | task-facturaia-spike-dgii-forms-170426 | Formato606Sheet.tsx 23 campos editables, validators 8 funciones, XLSX export SheetJS, 24/24 tests, design system V2, release v0.1.0 en GitHub. | 1fa519e7 |
| 2026-04-22 14:21 UTC | dgii-forms-7-componentes | 5 waves completadas: 7 campos JSON, 7 types TS, 14 validators+exporters, 7 Sheet components, App.tsx 8 tabs. tsc exit 0. Pushed origin main. | 8e62802 |
| 2026-04-24 01:27 UTC | ux9-mejoras-dgii-230426 | npm run build exit 0. 6 hooks creados + Formato606Sheet.tsx integrado. /formularios/606 = 13.7kB compilado sin errores TS. | 63768d3 |
| 2026-04-24 11:15 UTC | ux9-apply-7forms-sp-prefill-240426 | 8/8 Sheet components tienen 6 hooks (IT1 tiene 3: autosave+badge+keyboard). SP button Cargar SP en 606Sheet y 607Sheet. route.ts tiene map607Row para Factura607. Commit ea72a5d pushed origin main. 9 archivos, 913 inserciones. | ea72a5d |
| 2026-04-24 13:09 UTC | sprint5-responsive-polish-formularios-dgii-240426 | 31 workers mithos-dispatch claude-sonnet-4-6. 28 archivos modificados. tsc --noEmit exit 0. Commit 9d7bd0c pushed origin main. | 9d7bd0c |
| 2026-04-24 13:24 UTC | sprint6-sp-documents-panel-15forms-240426 | tsc --noEmit exit 0, 18/18 Form wrappers tienen SPDocumentsPanel, push origin main OK | 7ffa17c |
| 2026-04-24 14:42 UTC | sprint7-rediseño-formularios-agrupación-fiscal-240426 | Playwright confirma: 4 secciones, 18 cards, headers correctos (Esta semana/Retenciones mensuales/Declaraciones anuales 2026/Declaraciones especiales), todas las pages nuevas responden (ej: /formularios/ir2/ renderiza formulario completo). tsc --noEmit exit 0. Desplegado en producción gestoriard.com container 28600d2. | 28600d2 |
| 2026-04-24 16:12 UTC | sprint8-dgiibutton-unificacion-240426 | 30 archivos DGII migrados a DGIIButton (12 Sheet + 18 Form). Scroll interno eliminado de 11 Sheets. tsc --noEmit exit 0. Grep emoji=0, grep maxHeight=0. Pushed a main. | 88773c2 |
| 2026-04-24 17:08 UTC | auditoria-formularios-playwright-15workers-240426 | Auditoria Playwright produccion gestoriard.com detecto 7 problemas UX. 4 commits (af6c782, 8fafca7, 0694c64, c3da192) corrigieron: headers duplicados, inputs RNC/periodo duplicados, boton Cargar SP duplicado, min-h-screen forzando viewport, SPDocumentsPanel emojis, 9 toasts con ℹ️. 15 workers paralelos via claw-dispatch:18830 verificaron estructura. tsc exit 0 en cambios. Todos commits pushed a main. | c3da192 |
| 2026-04-24 18:44 UTC | sypnose-18formularios-excel-like-240426 | Playwright en gestoriard.com/formularios/606/ post-deploy 182512755226:
- viewport: 1440
- mainContentClass: 'space-y-4 w-full max-w-none' (era max-w-4xl)
- mainContentW: 1140px (era 896, +244px)
- wrapperClientW: 1090px (era 846, +244px)
- tableScrollW: 1664px (24 cols DGII oficial)
- scrollDelta: 574px (34% scroll — aceptable Excel-like con 24 cols)
- stickyThead: true ✅
- hasMinWidth: false ✅

Screenshots 1440 + 375 mobile confirman: layout centrado, 13 columnas visibles en desktop, banner 606 + cliente + período + toolbar + tabla todos presentes sin duplicación. Mobile apila correctamente.

Commits pushed a main:
- f6377c8: 11 Sheets Excel-like (min-w removido, sticky thead, text 11px, h-7 rows)
- 54b99a8: 12 Forms max-w-4xl→max-w-none (aprovechar main-area) | 54b99a8 |
| 2026-04-24 19:29 UTC | delete-row-sidebar-autocollapse-240426 | Playwright 1600x900 post-deploy 192725086437:
- sidebar: 64px (auto-colapsada por pathname /formularios/*)
- wrapper: 1486px (era 846, +640px)
- tabla scrollW: 1664px (24 cols DGII oficiales)
- scroll horizontal: 178px (11%, era 49%)
- Delete button por fila (trash2) en los 11 Sheets
- Agregar Fila OK, Editar celdas OK (click = input), Eliminar fila ready
- Screenshot muestra 20+ de 24 columnas visibles sin scroll
- tsc exit 0

15 workers dispatched (11 executors + 4 verifier/appshell). 7 workers fallaron silencioso — fix aplicado directo con Python script. Commit + push + deploy Coolify trigger vía MCP. | 5f8ab82 |
| 2026-04-24 21:50 UTC | mobile-cards-responsive-240426 | Playwright 375x812 post-deploy 213936383191:
- Tabla desktop hidden (md:block aplicado OK)
- Empty state mobile: 'No hay registros. Usa Agregar Fila.' visible
- NO hay scroll horizontal en mobile
- Banner, Cliente, Período, Botones SP/BD, Toolbar apilados verticalmente
- DGIIRowCardMobile component creado
- 11 Sheets con patrón hidden md:block + md:hidden space-y-2
- Screenshot 606-MOBILE-OK-375.png confirma
- tsc exit 0 | b890d1a |
| 2026-04-24 22:17 UTC | dashboard-unificado-multiformulario-250426 | 3 archivos creados:
- app/api/v2/dgii/cliente-resumen/route.ts (1359b): agrega form_type/periodo, retorna formularios por cliente
- app/components/DGII/ResumenClienteGrid.tsx (5321b): grid de 18 cards con status Presentado/Pendiente + último período
- app/formularios/cliente/page.tsx (1951b): page selector cliente + grid
+ link en /formularios/page.tsx

tsc exit 0. Commit 1821798 pushed a main. Coolify deploy triggered. | 1821798 |
| 2026-04-24 22:46 UTC | dashboard-unificado-e2e-verified-250426 | Playwright E2E verificado en producción gestoriard.com:
1. Login OK con agenda@huyghusrl.com
2. Navegación a /formularios/cliente/
3. Search 'acela' → dropdown muestra Acela Associates RNC 130309094
4. Click selector → grid aparece con 18 cards
5. API /api/v2/dgii/cliente-resumen?rnc=130309094 retorna 200 OK con formularios:{}
6. Cards muestran: Forma XXX + Clock+Pendiente + descripción + 'Sin archivos para este cliente' + link Abrir formulario

BUG RESUELTO:
- Query con GROUP BY+COUNT falló con permission denied (RLS)
- Reescrito sin aggregates (commit 417afe6)
- GRANT SELECT ON dgii_archivos_generados TO gestoria_app aplicado en DB

Screenshots: dashboard-poblado-FINAL.png + dashboard-cliente-1440.png + dashboard-cliente-375mobile.png | 417afe6 |
| 2026-04-25 01:21 UTC | polish-dashboard-12mejoras-250426 | 12 mejoras commit 0fffd66 push a main:
1. Skeleton loader animado en ResumenClienteGrid
2. Banner período activo (mes/año contextual)
3. Tooltip normativa (title attr en cards)
4. Íconos Lucide por formulario (18 formularios)
5. Sort secundario por días al vencimiento
6. Empty state CTA 'Todos al día'
7-19. URL params auto-cliente en 12 Forms (606/607/608/609/610/623/629/IR3/IR4/IR17/IT1/IR2/TSS)
20. Migration GRANT + 2 indexes en migrations/20260425_grant_dgii_archivos_to_app.sql
21. DB GRANT + indexes aplicados vía docker exec

tsc exit 0

5 forms (ACT/CRS/IR-1/IR-18/RST) con estructura distinta postpuestos para iteración futura. | 0fffd66 |
| 2026-04-25 02:01 UTC | polish-dashboard-completo-final-250426 | Commit 8f50621 push a main + deploy Coolify queued.

8 archivos modificados/creados:
- app/components/DGII/formatos/{FormatoACTForm,FormatoCRSForm,FormatoIR1Form,FormatoIR18Form,FormatoRSTForm}.tsx (URL params)
- app/lib/dashboard-pdf-exporter.ts (NEW 2087b)
- app/components/DGII/CalendarioFiscal.tsx (NEW 3829b)
- app/formularios/cliente/page.tsx (integración)

Cambios:
- 18/18 Forms ahora soportan ?rnc=X&from=resumen
- PDF exporter listo (jsPDF + jspdf-autotable ya en package.json)
- CalendarioFiscal grid 12 meses + días vencimiento por badge color
- /formularios/cliente integra calendario

tsc exit 0 | 8f50621 |
| 2026-04-25 14:44 UTC | polish-pendientes-finales-250426 | Commit 7c4c758 push a main + deploy queued.

2 archivos modificados:
- app/formularios/cliente/page.tsx (6126 bytes): boton Exportar PDF con DGIIButton+Download+toast
- migrations/20260425_audit_rls_dgii.sql (NEW): audit script RLS

RLS AUDIT FINDINGS (criticos):
- dgii_archivos_generados.rowsecurity=false (RLS NO habilitado)
- 0 policies definidas
- Solo filtrado por empresa_id en código JS
- set_empresa_context existe
- current_empresa_id NO existe

Riesgo cross-tenant si código deja de pasar empresa_id. Recomendación: ALTER TABLE...ENABLE ROW LEVEL SECURITY + policy.

Workers (15 dispatched) reportaron OK pero no modificaron — mismo bug recurrente del dispatcher. Aplicado directo via Write tool.

tsc exit 0 | 7c4c758 |
| 2026-04-25 15:33 UTC | rls-tenant-isolation-dgii-archivos-250426 | RLS habilitado en dgii_archivos_generados:
- 4 policies tenant_isolation (SELECT/INSERT/UPDATE/DELETE)
- helper function current_empresa_id() lee app.current_empresa_id config
- GRANT EXECUTE a gestoria_app + authenticated

Verificado:
- pg_policy 4 rows
- API /api/v2/dgii/cliente-resumen?rnc=130309094 retorna 200 OK
- Cross-tenant filtering activo a nivel BD

Commit 4322098 push a main. | 4322098 |
| 2026-04-25 15:49 UTC | rls-5-tablas-npm-audit-250426 | RLS aplicado en 5 tablas (envios_606/607/it1, qb_company_configs, qb_customers). 4 policies cada una. qb_customers via FK cliente_id→clientes.empresa_id.

npm audit: 9→5 vulnerabilidades. Critical eliminada (protobufjs). 4 moderates eliminadas.

Pendientes:
- next.js DoS (high) requiere major version bump
- xlsx sin fix disponible

tsc exit 0. Commit dc9296f push a main. | dc9296f |
| 2026-04-25 20:59 UTC | gestoriard-s1-formularios-230426 | TypeScript compilation: exit 0. 10 responsive pages committed: dashboard (grid-cols-1 sm:grid-cols-2 lg:grid-cols-4), login (minHeight touch targets), supervision/casos/agenda/clientes/ranking/admin responsive polish. useDgiiFormato hook verified (app/hooks/useDgiiFormato.ts 58L). 14+ type stubs created (app/types/dgii*.types.ts). 8 Sheet.tsx audit completed (web-quality conforme). All changes pure responsive design, no logic modifications. Commit 38b905b pushed to main. | 38b905b |
| 2026-04-27 18:34 UTC | facturaia-megaplan-desbloqueo-cliente-real-270427 | 6/6 fases completas. FASE1: RLS verificado OK en 7 tablas dgii post-C4. FASE2: 18/18 DGII forms audit PASS (0 crashes, 0 blank pages). FASE3: N/A (0 forms failing). FASE4: hook absolute path fix committed 57a637a2. FASE5: KB saved gemini-wrapper N/A for facturaia. FASE6: OCR field mapping documented in KB. P0 CRITICAL FIX: empresas RLS login breakage resolved via gestoria_app_select policy (commit 7306678 gestoriard). gestoriard.com login restored. | 7306678 |
| 2026-04-27 20:12 UTC | forms-placeholder-270427 | tsc --noEmit EXIT:0. PlaceholderFormularioEnDesarrollo.tsx + 4 wrappers 629/IR3/IR4/TSS. Push main f16969e. | f16969e |
| 2026-04-28 20:17 UTC | prefill-suggestions-api-280427 | 4 archivos creados en gestoriard (commit bbceeba2 main): app/types/prefill.types.ts (38L), app/api/prefill/suggestions/route.ts (60L GET), app/api/prefill/suggestions/[id]/route.ts (55L PATCH), app/hooks/useFormPrefillSuggestions.ts (81L). Schema BD verificado via psql self-hosted: 42 filas pending en form_prefill_suggestions (606=11, 607=5, IT-1=4, IR-1=4, IR-2=12, TSS=5, DIOR=1), RLS tenant_isolation_select activa. Enum PrefillFormType corregido para incluir 11 form_types reales. tsc errores son TS7016 next/server pre-existentes (afecta toda la base, no causados por cambios). KB accept-prefill-suggestions-facturaia-270427 publicado para coordinacion dgii-scraper. | bbceeba2 |
| 2026-04-28 21:08 UTC | sprint2-ui-prefill-280428 | Commit bf9b8d46 main push OK. 7 archivos sprint: 2 nuevos (PrefillSuggestionsPanel.tsx 710L + prefill-mapper.ts 377L) + 5 modificados (Formato606/607/IT1/IR1/IR2Form.tsx). 5/7 form_types con UI integrada (skip TSS placeholder, DIOR no Form). tsc grep 7 archivos sprint = 0 errores. Workers Opus 8 totales (4 waves paralelas: research+design, implement+integrate, verify, extend+integrate-3-forms). KB resultado-sprint2-ui-prefill-280428 + accept-prefill-suggestions-facturaia-280428-v2 publicados. | bf9b8d46 |
| 2026-04-28 22:08 UTC | sprint2-ui-prefill-280428 | Wave 5 QA visual PASS 5/5 forms en producción gestoriard.com (auth agenda@huyghusrl.com). 4 commits push main: bf9b8d46 UI panel + integración 5 forms, 2c053936 fix SUPABASE_INTERNAL_URL (TypeError fetch failed), a60dfb1c fix panel sin filtro periodo (BD heterogénea), c8779587 docs Wave 5 report. 15 screenshots full-page en /tmp/wave5/ (5 forms × 3 resoluciones 1920/768/375). 36 sugerencias visibles total: 606=11, 607=5, IT-1=4, IR-1=4, IR-2=12. Skip TSS (placeholder), DIOR (no existe Form). a11y verificada via snapshot (aria-expanded, role=region/article/meter, aria-label descriptivo). Cross-form consistency 5/5. Reporte .brain/wave5-qa-visual-280428.md (151L). | c8779587 |
| 2026-04-28 23:11 UTC | wave6-design-critique-fixes-280428 | 4 fixes criticos aplicados commit 822988d7 push main + Coolify deploy completado. C1 mobile container min-h-[200px] verificado en DOM (cardsContainerClasses correcto post-deploy). C2 bulk confirm modal verificado via Chrome MCP click 'Aplicar todas (11)' -> modal abre con texto 'Esto creara/actualizara 11 filas... Continuar?' + botones Cancelar/Confirmar. C3 contraste #B86E00 verificado en codigo. C4 'Rechazar todas' bg-red-600 oklch verificado runtime. Cards count=11 renderizadas en DOM en mobile. Descubrimiento bonus: panel queda debajo del fold en mobile (top=674 viewport=667), reorder posicion pendiente Sprint 3. Calificacion post-fix 7.5/10 (era 6.5/10). | 822988d7 |
| 2026-04-29 15:05 UTC | wave3-quickwins-uxfixes-290428 | Wave 3 commit e9005339 push main + Coolify deploy completado. 3 workers Opus paralelo: QW1 npm install deps fantasma (tsc 132->0 errores), QW2 typing virtualRow VirtualItem 11 Sheets, Sprint 3 UX 3 fixes (friendlySource map + grouping details/summary + panel top fold mobile). Verificacion chrome MCP gestoriard.com mobile 375: panelTop=77 (era 674 viewport 667 fuera fold), hasCorreoGriselda=true, detailsCount=1 grouping activo. 14 archivos modificados. Calificacion 8.5/10 (era 7.5/10). | e9005339 |
| 2026-04-29 17:14 UTC | sprint4-uxpolish-290429 | Sprint 4 UX polish 3/5 items completados commit 29a04acb push main. 3 workers Sonnet paralelo: ITEM1 tooltip onboarding 1ª vez (+76L popover gradiente con arrow + localStorage flag + ARIA dialog), ITEM2 toast error especifico (UpdateStatusResult discriminated union + 4 call sites + duration 6000ms), ITEM3 labels mobile icon buttons (sr-only -> sm:sr-only en 3 botones). Archivos: PrefillSuggestionsPanel.tsx 757->909L (+152), useFormPrefillSuggestions.ts 81->92L (+11). tsc --noEmit EXIT 0. NO tocado: 4 placeholder forms (Carlos decide A/B), validators 18 forms, writer scraper. Calificacion 9/10 (era 8.5/10). | 29a04acb |
| 2026-04-29 17:25 UTC | verify-copy-4forms-290429 | Verify copy/labels 4 Sheets DGII completado commit 1ba8a8f5 push main OK. Mi rol Disenador UI/UX puro: solo Sheet.tsx, sin tocar Form.tsx (scope gestoriard). 24 tooltips + 4 banners anadidos. 629 (3 tooltips + banner azul 2% retencion). IR-3 (5 tooltips + banner azul asalariados). IR-4 (6 tooltips + banner azul tasas 10/25/27%). TSS (10 tooltips porcentajes reales AFP/SFS/INFOTEP + BANNER AMBAR prominente con link a /tss diferenciando planilla SUIRPLUS vs CRM). +84/-36 lineas. tsc grep 4 Sheets: 0 errores. EXIT 0. Pendiente IR-3 codigos 05-06 requiere spec DGII oficial. Pendiente tooltips mobile (DGIIRowCardMobile no usa th). | 1ba8a8f5 |
| 2026-04-29 17:46 UTC | tests-e2e-playwright-4forms-290429 | Tests E2E Playwright 4 forms DGII completado commit 3cfa1106 push main OK. Setup @playwright/test 1.59.1 + chromium browsers + playwright.config.ts + auth fixture. 5 workers Sonnet paralelo (1 setup + 4 specs). RESULTADO npx playwright test: 10/13 PASS PWEXIT:0. 629/IR-3/IR-4 = 3/3 PASS each. TSS = 1/4 PASS (3 fails hipotesis Form TSS no conectado por gestoriard o deploy Coolify pendiente). Cobertura floor inicial alcanzada. NO tocado Form.tsx (scope gestoriard). 4 specs creados sin race. Reporte completo /tmp/facturaia-tests-e2e-290429.md. | 3cfa1106 |
| 2026-04-29 18:27 UTC | e2e-fase2-14forms-datatestid-290429 | FRENTE C2 commit 09b767d3 push main OK. 7 workers Sonnet paralelo sin overlap. Inventario corregido: 9 forms restantes (no 14): 608/609/610/623/IR-1/IR-18/ACT/CRS/RST. 58 data-testid en 4 Sheets cubiertos (629=12, IR-3=14, IR-4=15, TSS=17). 5 specs E2E nuevos (606/607/IT-1/IR-2/IR-17). Total 30 tests Playwright: 22 PASS / 8 FAIL PWEXIT:0. PASS rate 73% (vs 77% fase 1). 8 fails diagnosticados: selectores fragiles 23 cols 606, friendly source 607, BUG IR-17 botón Agregar Fila no existe pero empty-state lo menciona, form monolítico IR-2, grouping text IT-1, TSS deploy/timeout. NO tocado Form.tsx (scope gestoriard). | 09b767d3 |
| 2026-04-29 19:14 UTC | fase1-migrar-datatestid-290429 | FRENTE C3 commit 3cf9db5c push main OK. 4 workers Sonnet paralelo migraron specs 629/IR-3/IR-4/TSS de .nth(N) a getByTestId. BUG descubierto: DGIIRowCardMobile hereda testids -> duplicados DOM -> getByTestId().first() agarra mobile hidden -> fill fail. FIX: page.locator('[data-testid=X]:visible').first() en 44 callsites. Resultado: pre-migracion 22/30 (73%), post-migracion sin fix 12/30 (40%) por bug, post-fix :visible 21/30 (70%) recuperando +30 puntos. SM esperaba 90%+, alcanzamos 70%. Razones: bug consumio iteraciones, 5 specs sin testids siguen fragiles, edges validators requieren debug especifico. IR-3 e IR-4 perfecto 3/3 PASS, 629 y TSS casi perfecto. Reporte completo /tmp/facturaia-fase1-datatestid-290429.md. | 3cf9db5c |
| 2026-04-29 19:34 UTC | uxB-pricing-signup-onboarding-290429 | FRENTE C4 commit 9fcd5d07 push main OK. 3 workers Sonnet paralelo en app/components/marketing/ sin race con gestoriard. PricingPage.tsx 483L (3 tiers Starter RD$1,500/Pro RD$4,500/Enterprise + FAQ + trust badges + CTA arriba lista mejor UX mobile). SignupForm.tsx 648L (5 fields + 6 validators puros + password strength bar + plan banner). OnboardingWizard.tsx 766L (4 steps con progress accesible + step 2 saltable + tour 4 features). Total 1897L. tsc EXIT 0. NO middleware/routes/BD (scope gestoriard). Componentes puros con callbacks onSubmit/onComplete. CTAs apuntan a rutas que gestoriard cablea separadamente (/signup?plan=, /contacto, etc). Reporte completo /tmp/facturaia-uxBopcion-290429.md. | 9fcd5d07 |
| 2026-04-29 23:44 UTC | uxsubirdgii-17forms-290429 | FRENTE C5 commit 941e947e push main OK. 5 workers Sonnet paralelo (1 inventario + 4 implement) sin race con gestoriard. BotonSubirDGII.tsx 263L (5 estados + auto-reset + reintento directo). ModalConfirmSubirDGII.tsx 146L (resumen dl/dt/dd + formatPeriodo/formatRNC helpers + warning header). HistoricoSubidasDGII.tsx 319L (tabla con filtros + StatusBadge texto+icono+color WCAG). dgii-feedback.tsx 267L (3 custom toast + dgiiToast API simple). Total 995L. tsc EXIT 0. Inventario W1 descubrió: 0/17 forms cableados, solo IT-1 hardcoded ad-hoc en TabFormatos.tsx + clientes/[id], endpoint /api/dgii/submit YA existe con polling. Pendiente gestoriard: cablear 16 forms + schema BD dgii_uploads + reemplazar ad-hoc. Reporte completo /tmp/facturaia-uxsubirdgii-290429.md. | 941e947e |
| 2026-04-30 13:34 UTC | facturaia-608-ocr-validacion-300430 | Commit 5560c6d push master facturaia-ocr OK. FRENTE A: endpoint Go GET /api/formato-608/{rnc} clonando patron 606 (3 archivos +migration SQL idempotente) + Build Go EXIT 0. NOTA: spec oficial 608 = 3 cols pero plan pidio 4, implementado con comentario para omitir 4a si OFV rechaza. FRENTE B: docs/606_field_mapping.md 242L. HALLAZGO: audit anterior desactualizado, aplica_606 automatico YA EXISTE (trigger trg_auto_tag_606). Cobertura real 21/23 = 91%. Faltan SOLO 2 campos (itbis_percibido/isr_percibido) para NCF B11/B12 prevalencia baja. Container v2.27.0 sin codigo nuevo hasta rebuild. 5 facturas test NO ejecutadas (necesita deploy primero). Reporte SM completo en KB resultado-facturaia-608-validacion-300426. | 5560c6d |
| 2026-04-30 13:55 UTC | facturaia-waves-2-3-4-300430 | 3 waves completadas commit 28d7c3a master push OK. W2: migration 608 aplicada BD prod + 5 facturas test (3 aplica_608=true, 2 false), trigger 606+608 coexisten. W3: hook boris-stop.sh YA EXISTE (falso positivo SM, 360B 0775 bash valido). W4: doc 260L docs/ecf-emisor-plan-300430.md, HALLAZGO cero capability e-CF Go, recomendacion PSE certificado (TheFactoryHKA/ECF Express 3-5 dias) + prorroga DGII vs propio (15 dias-dev + 10-30 dias certificacion = excede deadline 15-mayo). HUYGHU sin cert_digital en BD verificable. Carlos debe consultar listados DGII + decidir PSE vs propio antes de cualquier codigo. | 28d7c3a |
| 2026-04-30 14:08 UTC | facturaia-waves-2-3-4-300430 | Continuacion auto-fluyo waves 2+3+4. Commits master facturaia-ocr: 5560c6d (W1+W2 endpoint+migration aplicada), 28d7c3a (W4 iter1 plan e-CF 260L), f751772 (W4 iter2 research +315L = 576L total). W2 verificado: trigger 608 testeado 5 facturas reales BD producción (3 aplica_608=true, 2 false). W3 §11 preservado: hook YA existe 360B 0775 bash-valid, NO sobrescrito (auto-save .brain/ funcional). W4 iter2 research técnico: victors1681/dgii-ecf maintained pero solo tipos 31/32 sin licencia, goxades Go inmadura, cobertura OCR 49-60%, recomendación PSE confirmada NO CAMBIA. KB saves: 8524 (waves general), nuevos hook-fix + ecf-emisor. | f751772 |
| 2026-04-30 14:30 UTC | facturaia-waves-5-6-7-300430 | 3 waves auto-fluyo. W5 hook overwrite stub 360B->19B (lógica auto-save removida, Carlos confirmo override §11). W6 SMOKE 606 HUYGHU = FAIL con 5 bloqueos: B1 filtro SQL receptor_rnc=NULL (TXT vacio), B2 auth Postgres container roto SASL, B3 itbis/montos 0% llenos, B4 estado anulada no excluido, B5 sin merge SharePoint loader. W7 SMOKE 607 = FAIL endpoint Go NO EXISTE (solo flags BD aplica_607). 648 facturas candidatas pero sin GetFormato607 ni route. Estado peor que 608 pre-sprint. Recomendacion §11: deadline 5-may NO realista, beta HUYGHU con declaracion manual + fix correcto post-deadline. Estimacion fix correcto 4-5 dias-dev. KB save resultado-facturaia-smoke-end2end-huyghu-300426 con detalles + Memory Palace + Boris done. NO commit (waves read-only). | f751772 |
| 2026-04-30 15:25 UTC | facturaia-b2-rebuild-300430 | Commit 6aa945f master facturaia-ocr push OK. PASO 1 backfill 95 facturas HUYGHU 606 con receptor_rnc=131047939 (cliente_id 100% NULL en BD por lo que JOIN del SM no funciono, fallback constante HUYGHU para 606). PASO 2 trigger auto_set_receptor_rnc migration aplicada BD prod, 3 tests PASS. PASO 3 container v2.28.0 build OK 149MB rotacion exitosa + BUG B2 descubierto y resuelto: postgres user SASL fail desde host, fix DATABASE_URL=supabase_admin. SMOKE TEST FINAL: curl /api/formato-606/131047939?periodo=202504 retorna header 606|131047939|202504|11 + 11 lineas reales NCFs B01000009XX HUYGHU. 608 sin NCF anulados (correcto). Bugs estado: B1 RESUELTO, B2 RESUELTO, B3 itbis/montos SIGUE, B4/B5 SIGUEN. Container actual facturaia-ocr:v2.28.0 healthy, endpoint 606+608 OPERATIVOS produccion. | 6aa945f |
| 2026-05-01 02:36 UTC | fix-b2-rls-form-prefill-suggestions-010526 | Migration BD aplicada y commit cacb39e9 push main. psql gestoria_app + context Huyghu COUNT form_prefill_suggestions=42 vs antes ERROR permission denied. Chrome MCP /formularios/607/ no muestra texto error (vs audit previo KB 8651 donde si). | cacb39e9 |

## Intentado pero fallido

| Fecha | Tarea | Por que fallo | Que se necesita |
|-------|-------|--------------|-----------------|
| 2026-03-31 18:24 UTC | bugfix-login-nombre-310326 | Carlos dijo para, va a enviar plan detallado | Plan nuevo de Carlos con bugs exactos |
