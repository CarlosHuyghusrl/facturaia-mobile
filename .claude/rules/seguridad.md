# Seguridad - FacturaIA

## NPM
- SIEMPRE: npm ci --ignore-scripts
- NUNCA: npm install sin --ignore-scripts

## Secretos
- API keys de Gemini en variables de entorno (NO en codigo)
- Supabase keys en config (NO commitear .env)
- .env, .env.local en .gitignore

## Auth
- Custom authService.ts
- Expo SecureStore para tokens locales
- NO guardar passwords en AsyncStorage (usar SecureStore)

## Permisos Android
- CAMERA (escaneo facturas)
- READ/WRITE_EXTERNAL_STORAGE (guardar/leer facturas)
- VIBRATE
- usesCleartextTraffic: true (conexion a servidor Contabo sin SSL)

## Backend OCR
- Container facturaia-ocr corre en Docker
- Gemini API keys rotan (7 keys)
- Rate limiting implementado en backend Go
