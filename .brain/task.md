# Task

## Tarea actual: APK v2.6.7 estabilizar 4 bugs JUMBO (Wave 2 done, Wave 3 plan)

## Estado 120526 19:50 UTC
- Wave 1 triage ✅ — F1-F4+F8 con código file:line + §11 refutación SM (E12 ≠ Gubernamental)
- Wave 2 ejecutada ✅ — RN d4345936 + backend 7aa17ae pushed
- APK v2.6.7 building ⏳ (ETA ~20:04)
- Backend v2.46.0 imagen ✅ built 130MB (NO deployed)
- Preview PNG ✅ /tmp/facturaia-v267-preview.png (BEFORE/AFTER 4 fixes)
- Carlos OK preview ✅ (12-may 19:50)
- Deploy script ✅ /tmp/restart-facturaia-ocr-v2.46.0.sh

## Wave 2 cambios atómicos
1. RN baseGravadaDinamica fix ternary muerto
2. RN handleRevalidate 2 retries exponencial + Alert HTTP+snippet+acción
3. RN status chip live derivado de validation (no params cache)
4. RN labels matemática: "Cálculos de Referencia" + ITBIS facturado real + teórico separado
5. Backend validTypes E32/E33/E34 corregidos + 7 tipos añadidos + skill dgii-fiscal cita
6. Backend validateNotaCredito mapping correcto {B04, E34}
7. Backend validateITBIS warnings explicativos mixto/exento/sector

## Próximo paso (wakeup 20:04)
1. cp APK arm64 → /home/gestoria/FacturaIA-v2.6.7-arm64-build-120526-HHMM.apk + md5
2. kb_save resultado-facturaia-apk-estabilizar-wave2-120526
3. Esperar Carlos OK install device + deploy backend v2.46.0
4. Wave 3 audit UX (plan en .brain/wave3-audit-ux-plan.md)

## Archivos modificados
- src/screens/InvoiceReviewScreen.tsx (4 cambios UX)
- android/app/build.gradle (vc=16 vn=2.6.7)
- /home/gestoria/factory/apps/facturaia-ocr/internal/services/tax_validator.go (3 cambios backend)
- .brain/wave3-audit-ux-plan.md (nuevo, plan Wave 3)
