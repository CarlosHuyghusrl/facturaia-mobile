## Estado de sesion
Ultima actualizacion: 2026-05-12 04:25 UTC
Fase: deployed + ready (parcial)
Branch: main
Ultimo commit RN: 3721d0c0 [FEAT] APK v2.6.6 botón Revisar + preview
Ultimo commit backend: 39b4310 [FIX] DualImageStore log primary

## Progreso
APK v2.6.6 deployed (build 04:05, 25.4M, MD5 5172debb). Backend v2.44.0 healthy running. Backend v2.45.0 imagen built ready (NO deploy mid-test). Audit Acela: 2 facturas test perdieron imagen (Supabase transient + MinIO down), root cause silent fallback en DualImageStore.Upload. Fix v2.45.0: slog.Warn primario antes fallback + combined error si dual fail.

## Proxima accion
Esperar Carlos test APK v2.6.6 device. Si OK → ejecutar /tmp/restart-facturaia-ocr-v2.45.0.sh para deploy backend fix.
