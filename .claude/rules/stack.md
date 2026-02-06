# Stack - FacturaIA

## App Movil
- React Native 0.76.9 + Expo 52
- TypeScript
- Scanner: react-native-document-scanner-plugin
- Navigation: @react-navigation/stack
- Storage: expo-secure-store
- Auth: custom authService.ts

## Backend OCR
- Go (facturaia-ocr v2.7.0)
- Gemini Vision API (OCR + extraccion)
- Puerto 8081

## Base de Datos
- PostgreSQL 16 + PgBouncer
- MinIO Storage (4 buckets)
- Supabase config en src/config/supabase.ts (legacy, migrado a API v2)

## Automatizacion
- n8n para flujos DGII

## Estructura del proyecto
```
src/
├── screens/        # Pantallas (Camera, Home, InvoiceList, InvoiceDetail, Login)
├── services/       # API, auth, facturas
├── config/         # Supabase config
├── components/     # Componentes UI
├── hooks/          # Custom hooks
├── types/          # TypeScript types
└── utils/          # Utilidades
```

## Version actual
- App: 1.0.4
- SDK: Expo 52
- Package: com.anonymous.facturascannerapp
