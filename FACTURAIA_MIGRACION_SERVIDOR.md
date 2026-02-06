# FACTURAIA - Documento de Migración a Servidor

**Fecha:** 22-Ene-2026
**Propósito:** Info completa para trabajar desde Claude Code en servidor Contabo

---

## 1. UBICACIONES

### Windows (Local)
```
C:\FacturaIA\FacturaScannerApp_Clean\  ← App React Native
C:\FacturaIA\invoice-ocr-service\      ← Backend Go (OCR)
```

### Servidor Contabo (217.216.48.91:2024)
```
~/eas-builds/FacturaScannerApp/        ← Copia sincronizada para builds
~/factory/apps/facturaia-ocr/          ← Backend Go desplegado (Docker)
```

---

## 2. ARQUITECTURA ACTUAL

```
┌─────────────────────────────────────────────────────────────────┐
│                       FACTURAIA STACK                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────┐         ┌─────────────────────────┐      │
│   │   App Móvil     │ ──────► │  Backend OCR (Go)       │      │
│   │  React Native   │         │  Puerto 8081            │      │
│   │  (Expo)         │         │  /api/process-invoice   │      │
│   └─────────────────┘         └───────────┬─────────────┘      │
│                                           │                     │
│                                           ▼                     │
│                               ┌─────────────────────────┐      │
│                               │   Gemini Vision API     │      │
│                               │   (OCR + Extracción)    │      │
│                               └─────────────────────────┘      │
│                                                                 │
│   ┌─────────────────┐         ┌─────────────────────────┐      │
│   │   App Móvil     │ ──────► │  Supabase               │      │
│   │  (Storage)      │         │  - Auth                 │      │
│   │                 │         │  - Storage (imágenes)   │      │
│   └─────────────────┘         │  - BD (facturas)        │      │
│                               └─────────────────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. CREDENCIALES Y ENDPOINTS

### Backend OCR (Contabo Docker)
```
URL Base: http://217.216.48.91:8081
Health:   GET /health
OCR:      POST /api/process-invoice (multipart/form-data)
Login:    POST /api/login
Invoices: GET /api/invoices (requiere JWT)
```

### JWT Hardcodeado (Temporal)
```
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNTQzMWUzYWItZmM4Yi00ZTYwLTk2NWItNWIxYWViMjhmOThmIiwiZW1haWwiOiJhc2llckBnZXN0b3JpYS5jb20iLCJlbXByZXNhX2FsaWFzIjoiaHV5Z2h1IiwiZW1wcmVzYV9ub21icmUiOiJIdXlnaHUgJiBBc29jLiBTUkwiLCJyb2wiOiJhZG1pbiIsImlzcyI6ImZhY3R1cmFpYSIsImV4cCI6MTc5OTc2Mjg0N30.RSPhekibZVsHwGuo2ms5aLin8vhiXVNhVqrCjy6Jf-Q
Expira: 2027
Usuario: asier@gestoria.com
Empresa: huyghu (Huyghu & Asoc. SRL)
```

### Supabase
```
URL:  https://yljyktrjfgwsznvziqmt.supabase.co
Key:  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsanlrdHJqZmd3c3pudnppcW10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MzkxODcsImV4cCI6MjA3NzQxNTE4N30.Os2-_FUTDv74iWOOqxVW7NdYLo4PfhogzNRRLv8S3dM

Bucket: receipt-images
Path:   receipts/{filename}
```

### Gemini API (OCR de Pago)
```
Key: AIzaSyAftC3PnsRLqFcdUJhEnnHMdIZNv7FpeoU
Modelo: gemini-2.5-flash (vision)
```

---

## 4. ESTRUCTURA APP MÓVIL

```
FacturaScannerApp_Clean/
├── src/
│   ├── config/
│   │   └── supabase.ts         ← Cliente Supabase (auth + storage)
│   ├── services/
│   │   └── api.ts              ← Cliente API OCR (axios)
│   ├── screens/
│   │   ├── CameraScreen.tsx    ← Cámara + OCR
│   │   ├── LoginScreen.tsx     ← Login (pendiente multi-tenant)
│   │   ├── InvoiceListScreen.tsx
│   │   └── InvoiceDetailScreen.tsx
│   ├── types/
│   │   └── invoice.ts          ← Tipos TypeScript
│   └── components/
│       └── Logo.tsx            ← Logo SVG FacturaIA
├── assets/
│   ├── icon.png                ← Icono app (1024x1024)
│   └── adaptive-icon.png
├── android/
│   └── app/src/main/res/mipmap-*/  ← Iconos Android
├── app.json                    ← Config Expo
└── package.json                ← Dependencias
```

---

## 5. DEPENDENCIAS CLAVE

```json
{
  "react-native": "0.76.9",
  "expo": "~52.0.0",
  "react-native-vision-camera": "^4.0.0",
  "react-native-document-scanner-plugin": "^2.0.3",
  "@supabase/supabase-js": "^2.39.0",
  "axios": "^1.6.5",
  "react-native-paper": "^5.11.6",
  "@react-navigation/native": "^6.1.9"
}
```

---

## 6. BUILD APK (FLUJO OBLIGATORIO)

### NUNCA usar EAS Build directamente (2h de espera)

```bash
# 1. Conectar al servidor
ssh -p 2024 gestoria@217.216.48.91

# 2. Ir al proyecto
cd ~/eas-builds/FacturaScannerApp

# 3. Build release (3-5 min)
cd android && ./gradlew assembleRelease

# 4. APK generado en:
# android/app/build/outputs/apk/release/app-release.apk

# 5. Descargar a Windows
scp -P 2024 gestoria@217.216.48.91:~/eas-builds/FacturaScannerApp/android/app/build/outputs/apk/release/app-release.apk C:\FacturaIA\FacturaIA-vXX.apk
```

---

## 7. SINCRONIZAR CÓDIGO WINDOWS → SERVIDOR

### Opción A: SCP (archivos específicos)
```bash
# Subir un archivo
scp -P 2024 "C:/FacturaIA/FacturaScannerApp_Clean/src/services/api.ts" \
  gestoria@217.216.48.91:~/eas-builds/FacturaScannerApp/src/services/

# Subir carpeta completa
scp -P 2024 -r "C:/FacturaIA/FacturaScannerApp_Clean/src/" \
  gestoria@217.216.48.91:~/eas-builds/FacturaScannerApp/
```

### Opción B: Git (recomendado)
```bash
# En Windows
cd C:\FacturaIA\FacturaScannerApp_Clean
git add .
git commit -m "feat: cambios"
git push origin main

# En servidor
cd ~/eas-builds/FacturaScannerApp
git pull origin main
```

---

## 8. DOCKER CONTAINERS (Contabo)

```bash
# Ver estado
docker ps | grep factura

# Container OCR
facturaia-ocr      Up (healthy)      Puerto 8081

# Reiniciar
docker restart facturaia-ocr

# Ver logs
docker logs -f facturaia-ocr --tail 100
```

---

## 9. ESTADO ACTUAL (22-Ene-2026)

### Funciona:
- [x] Backend OCR puerto 8081
- [x] Gemini Vision para extracción
- [x] Build APK en servidor
- [x] Icono F invertida con gradiente

### Pendiente:
- [ ] Login multi-tenant (backend puerto 3080 apunta a GestoriaRD)
- [ ] Tabla clientes vacía (no hay usuarios de prueba)
- [ ] Probar flujo completo con backend correcto

### APKs Generados:
- v21: FacturaIA-v21-Fixed.apk (21-Ene-2026)
- v22: FacturaIA-v22-NewIcon.apk (22-Ene-2026)

---

## 10. ARCHIVOS TEMPORALES (Windows)

Código multi-tenant listo para integrar:
```
C:\FacturaIA\temp_authService_v2.ts
C:\FacturaIA\temp_useAuth_v3.tsx
C:\FacturaIA\temp_LoginScreen_v3.tsx
C:\FacturaIA\temp_ScannerScreen.tsx
C:\FacturaIA\temp_App_v2.tsx
```

---

## 11. COMANDOS ÚTILES EN SERVIDOR

```bash
# Verificar backend OCR
curl -s http://127.0.0.1:8081/health | jq

# Ver último commit
cd ~/eas-builds/FacturaScannerApp && git log --oneline -1

# Generar iconos desde SVG
rsvg-convert -w 1024 -h 1024 assets/icon-source.svg -o assets/icon.png

# Limpiar build
cd android && ./gradlew clean

# Ver espacio disco
df -h /
```

---

## 12. MEMORIA PERMANENTE

### Claude-Flow (Servidor)
```bash
claude-flow memory store "facturaia:key" "valor"
claude-flow memory query "facturaia:*"
```

### Brain (Windows)
```
C:\memoria-permanente\brain\current\facturaia\task.md
C:\memoria-permanente\brain\current\facturaia\history.md
```

### MCP Memory Keeper
```
Channel: facturaia
Keys guardados:
- facturaia-estado-actual-22ene
- facturaia-pending-backend
```

---

## 13. PREGUNTAS PENDIENTES

1. ¿APK v21 hace login o falla?
2. ¿Escanear factura funciona?
3. ¿Hay cliente de prueba creado? (RNC + PIN)
4. ¿Qué error se ve actualmente?

---

## 14. CONTACTO USUARIO

El usuario (Carlos) prefiere:
- Respuestas en español
- Respuestas breves y directas
- Documentar cambios automáticamente
- NO pedir permiso para guardar
