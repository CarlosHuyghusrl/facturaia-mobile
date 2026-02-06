# Deploy - FacturaIA

## Build Android - FLUJO OBLIGATORIO
1. Codigo en servidor: ~/eas-builds/FacturaScannerApp
2. Build local PRIMERO: cd android && ./gradlew assembleRelease
3. Descargar APK: scp → telefono para probar
4. Si OK → EAS Build para produccion
5. Si falla → iterar en servidor (NO EAS)

## NUNCA hacer
- NO usar EAS Build directamente para probar (2h por build en free tier)
- NO hacer npm install sin --ignore-scripts
- NO commitear .env ni secretos

## Comandos build
```bash
# Build release (standalone)
cd ~/eas-builds/FacturaScannerApp/android
./gradlew assembleRelease

# APK generado en:
# android/app/build/outputs/apk/release/app-release.apk

# Descargar a Windows
scp -P 2024 gestoria@217.216.48.91:~/eas-builds/FacturaScannerApp/android/app/build/outputs/apk/release/app-release.apk C:\FacturaIA\
```

## Backend OCR (Go)
- Container: facturaia-ocr (Docker)
- Imagen: facturaia-ocr:v2.7.0
- Puerto: 8081
- Endpoint: /api/process-invoice
