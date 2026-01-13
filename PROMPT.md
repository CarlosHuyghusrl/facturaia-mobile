# FacturaIA - Ralph Autonomous Loop

## Proyecto
Sistema de escaneo de facturas con OCR + IA para generar formatos DGII (606, 607).

## Stack
- **App Movil**: React Native + Expo + vision-camera
- **Backend**: Go + Gemini API + Tesseract
- **BD**: PostgreSQL (Contabo)
- **Automatizacion**: n8n

## Tarea Actual
Completar la implementacion del workflow n8n OCR-DGII:

### Subtareas
1. [ ] Verificar EAS Build completado
2. [ ] Probar APK en dispositivo fisico
3. [ ] Crear workflow n8n (8 nodos) para procesar facturas
4. [ ] Configurar Gemini API en n8n
5. [ ] Implementar validacion NCF/RNC
6. [ ] Crear script generador 606.txt y 607.txt

## Archivos Clave
- `FacturaScannerApp_Clean/src/screens/CameraScreen.tsx` - Captura de facturas
- `invoice-ocr-service/internal/ai/extractor.go` - Extraccion con Gemini
- `C:\memoria-permanente\brain\current\facturaia\task.md` - Tareas detalladas

## Conexiones
```bash
# SSH Contabo
ssh -p 2024 gestoria@217.216.48.91

# n8n (via tunnel)
ssh -p 2024 -L 5678:localhost:5678 gestoria@217.216.48.91

# PostgreSQL (via tunnel)
ssh -p 2024 -L 6432:localhost:6432 gestoria@217.216.48.91
```

## Criterios de Exito
- [ ] APK funcionando en dispositivo
- [ ] Workflow n8n procesando facturas
- [ ] Datos guardados en PostgreSQL
