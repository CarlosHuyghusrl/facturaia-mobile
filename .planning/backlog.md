# FacturaIA — Backlog

**Última actualización:** 11-Feb-2026 15:50

---

## CRITICO (RESUELTO)

- [x] Levantar backend OCR (container facturaia-ocr:v2.9.0 corriendo en :8081)
- [x] Generar APK para pruebas (app-release.apk 67MB) - 11-Feb-2026

## MEDIO

- [ ] Limpiar código legacy (supabase.ts, CameraScreen.tsx duplicado en raíz)
- [ ] Limpiar directorios sin uso (.hive-mind/, .swarm/, coordination/, memory/)
- [ ] Activar AGENT_TEAMS permanentemente en sesión

## MEJORAS

- [ ] Mejorar UI de CameraScreen (preview de imagen antes de enviar)
- [ ] Agregar historial de facturas con filtros por fecha
- [ ] Modo offline (guardar facturas localmente hasta tener conexión)
- [ ] Validación de NCF antes de enviar al servidor
- [ ] Indicador de progreso durante OCR

## FASE 10 (PENDIENTE)

- [ ] Arquitectura OCR-n8n para DGII
- [ ] Workflow n8n completo (8 nodos)
- [ ] Prompt optimizado para OCR DGII
- [ ] Tabla facturas con campos DGII adicionales
- [ ] Script generador de 606/607/IT-1

---

## COMPLETADO

- [x] Campo ISC (Impuesto Selectivo al Consumo) añadido a BD y backend - v2.9.1
- [x] Migración a react-native-document-scanner-plugin (Fase 11)
- [x] Backend Go v2.9.0 con Claude Opus 4.5
- [x] Auth con RNC+PIN
- [x] Image proxy desde MinIO
- [x] 4 agentes configurados (mobile-ui, mobile-api, ocr-scanner, android-build)
