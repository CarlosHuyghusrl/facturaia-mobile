# Task

## Tarea actual: APK v2.6.6 + backend v2.45.0 (ready) — 120526

## Estado
- APK v2.6.6 entregado (commit 3721d0c0): botón Revisar/Editar siempre visible en success state + preview imagen
- Backend v2.44.0 deployed healthy. v2.45.0 imagen ready (NO deployed mid-test)
- Backend fix v2.45.0 (commit 39b4310 factory): DualImageStore log primary + combined error

## Progreso 120526
- [x] Fix #1-3 InvoiceReview (commit e948f3e3)
- [x] APK v2.6.5 build (commit 9b53ea8d)
- [x] Backend v2.44.0 ReprocesarClientInvoice role cliente (commit b808c6f)
- [x] APK v2.6.6 botón Revisar visible + preview imagen (commit 3721d0c0)
- [x] Audit imágenes Acela: 2 facturas archivo_url=NULL (root: Supabase transient + MinIO down)
- [x] Backend v2.45.0 fix DualImageStore silent fallback (commit 39b4310, imagen sha256:4ce2fa85)
- [ ] Deploy v2.45.0 (script /tmp/restart-facturaia-ocr-v2.45.0.sh — await ventana sin test activo)

## Próximo paso
1. Carlos test APK v2.6.6 device real
2. Si Carlos confirma APK OK → deploy backend v2.45.0 con script
3. Wave futura: retry primary 3x antes fallback en DualImageStore.Upload

## Archivos modificados
- src/screens/CameraScreen.tsx (preview imagen + botón Revisar)
- android/app/build.gradle (vc=15 vn=2.6.6)
- /home/gestoria/factory/apps/facturaia-ocr/internal/storage/imagestore.go (slog + combined error)
