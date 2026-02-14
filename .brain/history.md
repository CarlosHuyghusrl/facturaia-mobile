# Historial - FacturaIA

**Proyecto**: FacturaIA
**Path**: C:\FacturaIA
**Ultima actualizacion**: 14-Feb-2026

---

## Instrucciones para Agentes

**AL TERMINAR cualquier tarea en este proyecto:**
1. Agregar entrada al final de este archivo
2. Usar el formato de abajo
3. Incluir archivos modificados y cambios realizados

---

## Registro de Cambios

### 14-Feb-2026 - Arquitecto (Opus 4.6) - DISCOVERY + SINCRONIZACION
**Estado**: COMPLETADO

**Resumen**:
Discovery completo del estado real del proyecto. Se establecio flujo de trabajo Arquitecto ↔ CLI.

**Hallazgos del Discovery**:
- Backend es v2.13.2 (no v2.9.0 como estaba documentado)
- Go actualizado a 1.24
- APK release 67MB (no 147MB debug)
- 8 endpoints API todos operativos
- 26 facturas en BD (tabla facturas_clientes)
- Bug: 23 facturas con ISC=0 (pre-v2.13.2)
- Docker containers: facturaia-ocr (healthy), minio (up), n8n (up)

**Decisiones tomadas**:
- Ruta: D→A→B (estabilizar → fix ISC → DGII 606)
- task.md es fuente de verdad compartida entre Arquitecto y CLI
- Flujo: Arquitecto crea plan → sube VPS → CLI ejecuta → resultados

**Archivos actualizados**:
- `C:\memoria-permanente\brain\current\facturaia\task.md` - Reescrito limpio
- `C:\memoria-permanente\brain\current\facturaia\history.md` - Esta entrada
- `C:\FacturaIA\plans\results\discovery-facturia.md` - Reporte completo

**Proximo paso**: CLI ejecuta plan-002-stabilize.md en el VPS

### 14-Feb-2026 - CLI (Sonnet) + Arquitecto (Opus 4.6) - PLAN-002-STABILIZE COMPLETADO
**Estado**: COMPLETADO ✅

**Resumen**:
CLI ejecuto plan-002-stabilize en VPS. Todas las 5 tareas completadas exitosamente.

**Trabajo realizado por CLI**:
1. CLAUDE.md del backend creado/actualizado (152 lineas)
2. Endpoint POST /api/facturas/{id}/reprocesar implementado:
   - Archivos: api/client_handlers.go, internal/db/client_invoices.go
   - Logica: JWT auth → buscar factura → MinIO imagen → AI OCR → update BD (34 campos DGII)
3. Prueba con factura real: MULTISEGUROS ISC 0→1200 ✅
4. Docker rebuild v2.14.0 deployed (container 840edf5a8e51)
5. Commit 8716c94 + tag v2.14.0 pusheado a GitHub

**Resultado descargado**: `plans/results/stabilize-result.md`

**Verificacion**:
- [x] Health check OK
- [x] /reprocesar funciona (ISC corregido)
- [x] Docker v2.14.0 healthy
- [x] Commit + tag en GitHub

**Proximo paso**: plan-003-isc-fix (reprocesar 23 facturas en lote)

### 14-Feb-2026 - Arquitecto (Opus 4.6) - PROTOCOLO COWORK UNIVERSAL
**Estado**: COMPLETADO

**Resumen**:
Creado protocolo universal para que cualquier agente Opus en cualquier proyecto sepa como trabajar.

**Archivos creados/modificados**:
- `C:\memoria-permanente\COWORK.md` - NUEVO. Protocolo completo: roles, ciclo, tags, herramientas VPS, reglas
- `C:\Users\carlo\.claude\CLAUDE.md` - Actualizado: COWORK.md es paso 1 obligatorio al iniciar
- `C:\memoria-permanente\PROTOCOLO.md` - Regla #7 simplificada, apunta a COWORK.md
- `C:\memoria-permanente\brain\templates\task.template.md` - Template con protocolo cowork incluido

**Tags documentados en COWORK.md**:
- `[CLAUDE:agente]`, `[CLAUDE:multi]`, `[GEMINI]`, `[GSD:*]`, `[TASKMASTER]`, `[RALPH]`, `[DISCOVERY]`

**Herramientas VPS verificadas**:
- Claude CLI 2.0.75, GSD (27 comandos), claude-flow, Ralph, ask-gemini.sh, Taskmaster

---

### 21-Ene-2026 - Claude Code (Opus 4.5) - MULTI-TENANT AUTH FRONTEND
**Estado**: ⏸️ ESPERANDO BACKEND

**Resumen**:
Implementación completa del frontend multi-tenant para FacturaIA (tareas M.1-M.9). Esperando a que el equipo de backend de GestoriaRD termine su trabajo.

**Trabajo realizado (M.1-M.9)**:

1. **M.1 authService.ts** - Servicio de autenticación
   - URL: http://217.216.48.91:3080
   - Login con RNC + PIN (sin selector de empresa)
   - Token JWT con SecureStore

2. **M.2 useAuth.tsx** - AuthProvider + Context
   - Estado global de autenticación
   - Auto-logout en 401
   - Verificación de sesión al iniciar

3. **M.3 LoginScreen.tsx** - Pantalla de login
   - Diseño dark theme con cyan (#22D3EE)
   - Logo SVG de FacturaIA
   - Validación de RNC (9-11 dígitos) y PIN (4-6 dígitos)

4. **M.4 facturasService.ts** - Servicio de facturas
   - Upload, list, detail de facturas
   - Integración con backend OCR

5. **M.5 HomeScreen.tsx** - Pantalla principal
   - Lista de facturas del cliente
   - Resumen de stats

6. **M.6 CameraScreen.tsx** - Scanner mejorado
   - Multi-estado: idle, preview, processing, success, error
   - Preview de datos extraídos

7. **M.7 InvoiceDetailScreen.tsx** - Detalle de factura
   - Imagen zoomable
   - Todos los campos OCR

8. **M.8 App.tsx** - Navegación
   - AuthProvider wrapping
   - Stack de auth vs stack autenticado

9. **M.9 apiClient.ts** - Cliente HTTP
   - Retry logic
   - Auto-logout en 401
   - Manejo de errores

**Logo/Icono App**:
- F invertida con gradiente cyan + estrella
- Config: Largo=98, Barra=53, Ancho=40, Punto=5, 3D=11
- Generado con rsvg-convert
- Nombre app cambiado a "FacturaIA"

**Archivos temporales** (código listo para restaurar):
- `C:\FacturaIA\temp_authService_v2.ts`
- `C:\FacturaIA\temp_useAuth_v3.tsx`
- `C:\FacturaIA\temp_LoginScreen_v3.tsx`
- `C:\FacturaIA\temp_ScannerScreen.tsx`
- `C:\FacturaIA\temp_App_v2.tsx`

**API Endpoints configurados**:
- POST `/api/clientes/login/` (con trailing slash)
- GET `/api/clientes/me/`
- POST `/api/facturas/upload/`
- GET `/api/facturas/mis-facturas/`

**Credenciales test**:
- RNC: 130309094
- PIN: 1234

**APK**: FacturaIA-v21-Fixed.apk

**Estado actual**:
Error JSON Parse (backend retorna HTML). Usuario indicó esperar a que el equipo de backend termine.

**Próximo paso**:
- Esperar confirmación del usuario de que backend está listo
- Probar flujo completo de autenticación

---

### 13-Ene-2026 - Claude Code (Opus 4.5) - RALPH + TASKMASTER MULTI-PROYECTO
**Estado**: ✅ COMPLETADO

**Resumen**:
Configuración completa de Ralph y Taskmaster para todos los proyectos, tanto en servidor Contabo como localmente.

**Trabajo realizado**:

1. **Ralph en Contabo** (217.216.48.91):
   - Instalado en `/opt/ralph-claude-code/`
   - Agregado al PATH en `~/.bashrc`
   - Funcionando correctamente

2. **Ralph Local** (Windows):
   - Clonado en `C:\Users\carlo\.claude\tools\ralph-claude-code`
   - Script helper `ralph.bat` creado en `C:\Users\carlo\.claude\tools\`

3. **Taskmaster MCP** - 6 proyectos configurados:
   | Archivo | Proyecto |
   |---------|----------|
   | `facturaia-tasks.json` | FacturaIA OCR |
   | `gestoriard-tasks.json` | GestoriaRD Migration |
   | `iatrader-tasks.json` | Trading Automatizado |
   | `appcasino-tasks.json` | App Casino Desktop |
   | `servidor-casino-tasks.json` | Backend Casino |
   | `trading-prod-tasks.json` | Trading Producción |

4. **EAS Build Status**:
   - Build ID: `616a07c1-d611-4f08-97a9-dedeb3f94306`
   - Status: IN_QUEUE (posición 73 de 794)
   - SDK: 52.0.0, App Version: 1.0.3

**Archivos creados**:
- `C:\Users\carlo\.claude\mcp-servers\taskmaster-local\*-tasks.json` (6 archivos)
- `C:\Users\carlo\.claude\tools\ralph.bat`

**Próximos pasos**:
- [ ] Esperar EAS Build completado (~6 min)
- [ ] Probar APK en dispositivo
- [ ] Iniciar migración GestoriaRD con taskmaster

---

### 13-Ene-2026 - Claude Code (Opus 4.5) - GEMINI VISION + APK BUILD
**Estado**: ✅ COMPLETADO

**Resumen**:
Implementación de Gemini Vision Mode para lectura directa de imágenes de facturas (sin OCR Tesseract) + build de nuevo APK.

**Cambios realizados**:

1. **extractor.go** actualizado con Vision Mode:
   - Nueva función `buildPromptVision()` para análisis directo de imagen
   - Detección automática de modo (vision vs OCR text)
   - Prompt especializado para facturas DGII de República Dominicana

2. **Docker container** reconstruido:
   - Versión: `facturaia-ocr:v2.2.0-vision`
   - Puerto: 8081
   - Gemini API configurada con Vision Model

3. **Java 17 instalado** en servidor:
   - `openjdk-17-jdk` para futuras compilaciones locales

4. **APK compilado** via EAS Build:
   - Build ID: `52c1ea70-c52a-4b52-a191-14edb038be79`
   - URL: https://expo.dev/accounts/facturia/projects/facturascannerapp/builds/52c1ea70-c52a-4b52-a191-14edb038be79

**Archivos modificados en servidor**:
- `/home/gestoria/factory/apps/facturaia-ocr/internal/ai/extractor.go` - Vision mode support
- Docker image `facturaia-ocr:v2.2.0-vision`

**Configuración verificada**:
- CameraScreen.tsx: `useVisionModel: true`
- Backend: puerto 8081
- Metro: puerto 8082
- EXPO_TOKEN: configurado en `.bashrc`

**Credenciales EAS**:
- Cuenta: `facturia`
- Email: carlos@huyghusrl.com
- Token: YULqHhfWUCLBsyrvF7UHj03AGwF1G4tHxzlzD43A

**Próximo paso**:
- Instalar APK y probar escaneo de facturas con Gemini Vision

---

### 12-Ene-2026 - Claude Code (Opus 4.5) - FASE 9: Importación Datos Supabase
**Estado**: COMPLETADO

**Resumen**:
Importación exitosa de 36,552 registros desde Supabase a PostgreSQL en Contabo.

**Datos importados**:
- Clientes: 312 (2 fallaron por RNC >20 chars)
- Contadores: 14
- Tareas fiscales: 34,261
- Casos DGI: 36
- Inbox IA: 1,929

**Problemas resueltos**:
1. EXPORTS_DIR apuntaba a ruta host, corregido a `/imports/...`
2. Tabla `clientes` usa `nombre_comercial` no `razon_social`
3. PK compuesta en `tareas_fiscales`: `(id, fecha_vencimiento)`
4. Tabla es `inbox_ia` no `inbox_mensajes`

**Solución implementada**:
```bash
docker run --rm --network coolify \
  -v /home/gestoria/imports:/imports \
  node:20 node /imports/import-server.js
```

**Archivos modificados**:
- `c:\gestion-contadoresrd\scripts\import-server.js` - Script corregido para esquemas reales
- `C:\memoria-permanente\brain\current\facturaia\task.md` - FASE 9 marcada COMPLETADA

**Password PostgreSQL real descubierto**:
- Host: 172.20.1.9 (gestoria-db Docker IP)
- User: gestoria_admin
- Pass: VfnyP0NrERdziorDXTIZfMNPXCpqlVn2

---

### 08-Ene-2026 - Claude Code (Opus 4.5) - Seguridad Servicios + Túnel SSH
**Estado**: Completado

**Acciones realizadas**:
1. Asegurado n8n - Puerto 5678 ahora solo escucha en 127.0.0.1 (no público)
2. Asegurado MinIO Console - Puerto 9001 ahora solo escucha en 127.0.0.1
3. Puerto 9000 de MinIO (API) sigue público - necesario para app móvil
4. Creado archivo `C:\FacturaIA\TUNEL_SERVICIOS.bat` para acceso fácil via túnel SSH
5. Usuario n8n creado: carlos@huyghusrl.com

**Acceso a servicios** (requiere túnel SSH):
- n8n: http://localhost:5678
- MinIO Console: http://localhost:9001
- Ejecutar: `TUNEL_SERVICIOS.bat` (doble clic)

**Puertos públicos** (accesibles desde internet):
- 8081: Backend API (necesario para app)
- 9000: MinIO API S3 (necesario para app)

**Puertos cerrados** (solo via túnel):
- 5678: n8n
- 9001: MinIO Console

---

### 08-Ene-2026 - Claude Code (Opus 4.5) - Task 24-25: Documentacion Final
**Estado**: Completado
**Agente**: docs-agent

**Acciones realizadas**:
1. Conectado al servidor Contabo via SSH (217.216.48.91:2024)
2. Creado archivo `~/FACTURAIA_SISTEMA.md` (7.3 KB) con documentacion completa:
   - Diagrama de arquitectura ASCII art
   - Tabla de servicios: PostgreSQL, PgBouncer, MinIO, facturaia-ocr, n8n
   - Endpoints API con metodos y autenticacion JWT
   - Estructura de base de datos multi-tenant
   - MinIO buckets y estructura de paths
   - Datos de empresa piloto huyghu
   - Comandos utiles para administracion
   - Stack tecnologico (Go, React Native, PostgreSQL, etc.)
   - Flujo completo de procesamiento de facturas
   - Comparativa de costos: $9,000/mes -> $50/mes
3. Creado archivo `~/STATUS.md` (3.4 KB) con estado en tiempo real:
   - Lista de contenedores Docker activos
   - Espacio en disco (15% usado de 387GB)
   - Memoria RAM (13GB usados de 23GB)
   - Empresas registradas (huyghu)
   - Estado de cada servicio
   - Ultimas 5 facturas procesadas
4. Actualizado task.md local con Task 24-25 completada
5. Agregado entrada en history.md

**Archivos creados en servidor**:
- `/home/gestoria/FACTURAIA_SISTEMA.md` - Documentacion del sistema
- `/home/gestoria/STATUS.md` - Estado en tiempo real

**Archivos modificados localmente**:
- `C:\memoria-permanente\brain\current\facturaia\task.md` - Marcada fase 5 como completada
- `C:\memoria-permanente\brain\current\facturaia\history.md` - Esta entrada

**Estado del sistema verificado**:
- PostgreSQL 16.11: healthy
- PgBouncer: running
- MinIO: 4 buckets (facturas, documentos, reportes, backups)
- facturaia-ocr v2.0.0: healthy (uptime 1h+)
- n8n v2.2.4: HTTP 200
- Empresa huyghu: activa con 5+ facturas de prueba

**Proximos pasos sugeridos**:
- Task 22-23: Crear workflows adicionales n8n (pendiente)
- Configurar SSL/HTTPS para endpoints publicos
- Crear mas empresas piloto para testing
- Documentar proceso de onboarding de nuevas empresas

---

### 08-Ene-2026 - Claude Code (Opus 4.5) - Task 21: Workflow DGII 606
**Estado**: Completado
**Agente**: automation-agent

**Acciones realizadas**:
1. Iniciado contenedor n8n existente (estaba parado)
2. Importado credenciales PostgreSQL via CLI n8n
3. Creado workflow "DGII Monthly Report 606" con 6 nodos
4. Insertado 5 facturas de prueba en emp_huyghu.facturas
5. Verificado query SQL y formato 606
6. Generado reporte de prueba: `~/reportes-dgii/606_huyghu_2025-12.txt`
7. Abierto puerto 5678 en UFW para acceso web

**Archivos creados en servidor**:
- `~/n8n/data/dgii-workflow.json` - Workflow JSON
- `~/n8n/data/credentials.json` - Credenciales PostgreSQL
- `~/reportes-dgii/606_huyghu_2025-12.txt` - Reporte de prueba

**Workflow n8n**:
- ID: `gzL4nu0xm9QlFXvP`
- Nombre: "DGII Monthly Report 606"
- Schedule: Dia 1 del mes, 8:00 AM
- Estado: Inactivo (pendiente activacion)

**Formato 606 generado**:
```
606|202512|5
101123456|Supermercado Nacional|02|B0100000001|20251205|5000.00|900.00|5900.00
130789012|Ferreteria Central|02|B0100000002|20251210|3500.00|630.00|4130.00
...
```

**Acceso n8n**:
- URL: http://217.216.48.91:5678
- Usuario: admin
- Password: facturaia2024

**Proximos pasos**:
- Activar workflow desde interfaz web
- Agregar nodo para subir a MinIO
- Agregar notificacion por email

---

### 21-Dic-2024 (Noche) - Claude Code - ACLARACION DEL PLAN
**Estado**: Aclaración agregada al task.md

**⚠️ IMPORTANTE - LEER ANTES DE EJECUTAR:**

| Lo que FALLÓ | Lo que hay que HACER |
|--------------|----------------------|
| `newArchEnabled=false` | `newArchEnabled=true` |
| `hermesEnabled=false` | `hermesEnabled=true` |

**Resumen:**
- DESACTIVAR New Arch → FALLÓ (error expo-modules-core)
- ACTIVAR New Arch + SoLoader.init → NO PROBADO AÚN

**El plan correcto es ACTIVAR, no desactivar.**

---

### 21-Dic-2024 (Noche) - Claude Code - Plan B: New Arch + SoLoader
**Estado**: Plan creado, pendiente ejecutar

**Decisión tomada**:
- Opción 1: ACTIVAR New Architecture + mantener SoLoader.init

**Hipótesis**:
- El problema original era SOLO SoLoader, no la New Architecture
- SoLoader.init ya está aplicado ✅
- Solo falta ACTIVAR New Arch en gradle.properties (cambiar false→true)

**Plan de acción** (8 pasos en task.md):
1. ACTIVAR `newArchEnabled=true` (actualmente está en false)
2. ACTIVAR `hermesEnabled=true` (actualmente está en false)
3. Limpiar build
4. Compilar
5. Verificar app abre
6. Probar cámara
7. Probar backend
8. Commit si funciona

**Próximo paso**:
- Ejecutar el plan

---

### 21-Dic-2024 (Noche) - Claude Code - Creación PROTOCOLO.md
**Estado**: Completado

**Archivos creados**:
- `C:\memoria-permanente\PROTOCOLO.md` - Reglas obligatorias para TODOS los agentes

**Archivos modificados**:
- `C:\memoria-permanente\MEMORIA.md` - Simplificado, ahora apunta a PROTOCOLO.md
- `C:\Users\carlo\.claude\CLAUDE.md` - Simplificado, ahora apunta a PROTOCOLO.md

**Cambios realizados**:
- Creado PROTOCOLO.md con reglas claras y checklist
- Formato de checkboxes estandarizado: [ ] [/] [x] [❌] [⏸️]
- Ejemplo completo de sesión de trabajo
- Lista de proyectos y sus carpetas brain

**Propósito**:
- Que TODOS los agentes (Claude, Gemini, Cursor) sigan las mismas reglas
- Evitar que se pierda documentación
- Que cualquier agente pueda continuar el trabajo de otro

---

### 21-Dic-2024 (Noche) - Claude Code - Intento Reparación Android
**Estado**: BLOQUEADO - Incompatibilidad descubierta

**Archivos modificados**:
- `FacturaScannerApp_Clean/android/gradle.properties`:
  - `newArchEnabled=true` → `newArchEnabled=false`
  - `hermesEnabled=true` → `hermesEnabled=false`
- `FacturaScannerApp_Clean/android/app/.../MainApplication.kt`:
  - Añadido `import com.facebook.soloader.SoLoader`
  - Añadido `SoLoader.init(this, false)` en onCreate()

**Acciones ejecutadas**:
1. Modificados gradle.properties y MainApplication.kt
2. Eliminado node_modules (rd /s /q)
3. Reinstalado dependencias (npm install) - OK con warnings
4. Iniciado emulador Pixel_5
5. Ejecutado `npm run android` - FALLÓ

**Error encontrado**:
```
expo-modules-core:compileDebugKotlin FAILED
- Unresolved reference: enableBridgelessArchitecture
- Too many arguments for BoxShadow.parse()
```

**Causa raíz (NUEVO HALLAZGO)**:
- Expo SDK 54 + React Native 0.76 **REQUIEREN** New Architecture
- expo-modules-core tiene código que solo existe en New Arch
- El plan original de Antigravity era incorrecto para estas versiones

**Opciones pendientes**:
1. Revertir a New Arch + mantener SoLoader.init
2. Degradar a Expo 52 (compatible con Old Arch)

**Próximos pasos**:
- Decidir estrategia con usuario
- Actualizar plan.md con nuevo hallazgo

---

### 21-Dic-2024 (Noche) - Claude Code - Reorganización Sistema Brain
**Estado**: Completado
**Archivos creados**:
- `C:\memoria-permanente\brain\templates\history.template.md`
- `C:\memoria-permanente\brain\current\*/history.md` (9 proyectos)

**Archivos modificados**:
- `C:\memoria-permanente\MEMORIA.md` - Limpiado, solo contexto global
- `C:\Users\carlo\.claude\CLAUDE.md` - Actualizado flujo para agentes

**Cambios realizados**:
- Creado template para history.md
- Creado history.md separado por cada proyecto
- Movido historial de MEMORIA.md a cada history.md correspondiente
- Actualizado instrucciones para todos los agentes
- Sistema Brain ahora tiene historial independiente por proyecto

**Próximos pasos**:
- Continuar con reparación de app Android (ver task.md)

---

### 21-Dic-2024 (Tarde) - Claude Code - Auditoría trabajo Antigravity
**Estado**: Completado
**Archivos revisados**:
- `FacturaScannerApp_Clean/android/gradle.properties`
- `FacturaScannerApp_Clean/android/app/src/main/java/.../MainApplication.kt`

**Hallazgos**:
- Los cambios documentados por Antigravity NO fueron aplicados realmente
- `newArchEnabled=true` (debería ser false)
- `hermesEnabled=true` (debería ser false)
- `SoLoader.init` NO está en MainApplication.kt

**Acciones**:
- Creado task.md con pasos de reparación
- Creado plan.md con detalles técnicos

**Próximos pasos**:
- Aplicar los cambios pendientes (ver task.md)

---

### 21-Dic-2024 (Mañana) - Antigravity - Reparación Android (INCOMPLETA)
**Estado**: Parcial (documentado pero no aplicado)
**Archivos que debían modificarse**:
- `gradle.properties` - Cambiar newArchEnabled y hermesEnabled a false
- `MainApplication.kt` - Añadir SoLoader.init

**Lo que SÍ se hizo**:
- Creado `FacturaScannerApp_Clean/` (carpeta limpia)
- Compilado `server.exe` (backend Go, 24MB)
- Creado `START_PROJECT.bat` (lanzador)
- Downgrade gesture-handler a 2.20.2

**Lo que NO se hizo**:
- Los cambios en gradle.properties
- El parche en MainApplication.kt

---
# # #   2 1 - D i c - 2 0 2 4   ( T a r d e )   -   G e m i n i   -   L i m p i e z a   N u c l e a r   y   P l a n   D o w n g r a d e  
 * * E s t a d o * * :   E n   P r o g r e s o  
 * * A c c i o n e s * * :  
 -   S e   i n t e n t � �   " L i m p i e z a   N u c l e a r "   ( b o r r a r   n o d e _ m o d u l e s ,   a n d r o i d / b u i l d ,   . g r a d l e ) .  
     -   * F a l l o * :   E l   c o m a n d o   c o m p u e s t o   f a l l � �   p o r   s i n t a x i s   d e   P o w e r S h e l l .  
     -   * C o r r e c c i � � n * :   S e   e j e c u t a r o n   l o s   c o m a n d o s   s e c u e n c i a l m e n t e .  
 -   S e   a c t u a l i z � �   ` t a s k . m d `   p a r a   i n c l u i r   e l   p a s o   c r � � t i c o   d e   " D o w n g r a d e   E x p o   S D K   5 4   - >   5 2 " .  
 -   S e   c o r r i g i � �   ` i m p l e m e n t a t i o n _ p l a n . m d `   ( a h o r a   ` g e m i n i _ p l a n . m d ` )   p a r a   r e f l e j a r   l a   e s t r a t e g i a   c o r r e c t a :  
     -   ` n e w A r c h E n a b l e d = t r u e `   ( R e q u e r i d o )  
     -   ` h e r m e s E n a b l e d = t r u e `   ( R e q u e r i d o )  
     -   ` S o L o a d e r . i n i t `   ( P a r c h e   a p l i c a d o )  
     -   * * P L U S * * :   L i m p i e z a   a g r e s i v a   a n t e s   d e l   d o w n g r a d e .  
  
 * * P r � � x i m o s   P a s o s   ( P a r a   C l a u d e / G e m i n i ) : * *  
 1 .   E d i t a r   ` p a c k a g e . j s o n `   ( D o w n g r a d e   a   E x p o   5 2 ) .  
 2 .   ` n p m   i n s t a l l `  
 3 .   ` n p m   r u n   a n d r o i d `  
 
---

### 22-Dic-2024 - Claude Code - SOLUCIÓN FINAL: JSC + Old Arch
**Estado**: ✅ COMPLETADO - App funcionando

**Problema raíz descubierto**:
- Hermes (hermesEnabled=true) causaba errores de transpilación JavaScript
- React Native 0.76.9 con Hermes genera código inválido
- Error: "Compiling JS failed: 223398:104:')' expected"

**Solución implementada**:
1. Desactivado Hermes en `android/gradle.properties`
   - `hermesEnabled=true` → `hermesEnabled=false`
2. Recompilado APK con JavaScriptCore (JSC)
3. Recreado `.expo/.virtual-metro-entry.js` (se había borrado por error)

**Archivos críticos modificados**:
- `android/gradle.properties` - hermesEnabled=false
- `.expo/.virtual-metro-entry.js` - Recreado

**Estado final**:
- ✅ App carga sin errores JavaScript
- ✅ Login funciona
- ✅ Cámara funciona
- ✅ OCR funciona
- ✅ Navegación funciona
- ✅ Supabase funciona

**Commit**: 1f7402b - "fix: App funcionando correctamente con login y cámara"

---

### 23-Dic-2024 - Claude Code - DOCUMENTACIÓN COMPLETA
**Estado**: ✅ COMPLETADO

**Archivos creados**:

1. **Guías de Usuario**:
   - `ESTADO_ACTUAL.md` (4.9KB) - Estado actual, configuración crítica, problemas conocidos
   - `GUIA_CAMBIOS_SEGUROS.md` (12.1KB) - Manual completo para modificar código sin romper
   - `REFERENCIA_RAPIDA.md` (7.8KB) - Cheatsheet de consulta rápida
   - `README_DOCUMENTACION.md` (4.9KB) - Índice de documentación
   - `ejemplo-cambio-seguro.sh` - Ejemplo práctico de workflow

2. **Guía de Publicación**:
   - `GUIA_PUBLICACION.md` (9.4KB) - Proceso completo Google Play + App Store

3. **Arquitectura Multi-Empresa**:
   - `ANALISIS_ARQUITECTURA_MULTIEMPRESA.md` (15.9KB) - Análisis de 3 opciones
   - `SOLUCION_NOMBRE_SIMPLIFICADO.md` (15.6KB) - Sistema registro maestro
   - `PLAN_CAMBIOS_GALERIA_MULTIEMPRESA.md` (10.9KB) - Plan implementación

**Decisiones arquitectónicas documentadas**:

1. **Motor JavaScript**: JavaScriptCore (JSC)
   - Hermes SIEMPRE deshabilitado (hermesEnabled=false)
   - Archivo `.expo/.virtual-metro-entry.js` NUNCA debe borrarse

2. **Multi-Empresa**: Arquitectura de Múltiples Proyectos Supabase
   - Cada empresa/cliente tiene su propio proyecto Supabase
   - Proyecto maestro "facturaia-master" con tabla `company_registry`
   - Usuario ingresa nombre simple ("Naranja") en vez de URL larga
   - App busca en registry → descarga URL/Key → guarda en AsyncStorage
   - SupabaseManager class maneja switching dinámico entre conexiones

3. **Galería de Imágenes**:
   - Usar `react-native-image-picker` (NO expo-image-picker)
   - Requiere recompilación de APK (código nativo)

**Configuración crítica documentada**:
- hermesEnabled=false (NUNCA cambiar a true)
- newArchEnabled=false (Old Architecture)
- .expo/.virtual-metro-entry.js (NUNCA borrar)

**Próximos pasos pendientes** (documentados en task.md):
1. Implementar galería de imágenes (2-3 horas)
2. Implementar sistema multi-empresa (6 horas)
3. Publicar en tiendas (proceso documentado)

**Commits**:
- a76bc94 - docs: Documentación completa del proyecto
- de73617 - docs: Solución para usar nombre simple en vez de URL Supabase

**Estado**: Proyecto listo para desarrollo y publicación

---

### 26-Dic-2024 - Claude Code (Otro Agente) - SISTEMA MULTI-TENANT COMPLETADO
**Estado**: ✅ FUNCIONANDO

**Cambios implementados:**

1. **authService.ts** (321 líneas) - Nuevo servicio de autenticación
   - Autenticación centralizada multi-empresa
   - Búsqueda de usuario en BD de empresa (no en Supabase Auth)
   - Conexión dinámica a diferentes proyectos Supabase
   - Hash de contraseñas con bcryptjs

2. **CameraScreen.tsx** - Reescrito completamente
   - Cambio de `react-native-vision-camera` a `react-native-document-scanner-plugin`
   - Edge detection automático (como Receipt Wrangler)
   - Corrección de perspectiva
   - Integración con authService para multi-tenant

3. **LoginScreen.tsx** - Modificado
   - Login ahora busca usuario en tabla `usuarios` de la BD de empresa
   - Ya no usa Supabase Auth directamente

4. **Nuevas dependencias:**
   - `react-native-document-scanner-plugin: ^2.0.3`
   - `bcryptjs: ^3.0.3`

**Commits:**
- `5b803f7` - feat: Sistema multi-tenant con autenticación centralizada
- `26c761d` - fix: Login busca usuario en BD empresa, no en Auth

**Estado final:**
- ✅ App funcionando según usuario
- ✅ Sistema multi-tenant operativo
- ✅ Document scanner con edge detection
- ✅ Trabajo en paralelo con otro agente

---

### 29-Dic-2024 - Claude Code (Opus 4.5) - CONFIGURACIÓN EAS BUILD
**Estado**: 🔄 Build en progreso (compilando en nube)

**Problemas encontrados:**
1. Metro no iniciaba → Error `Cannot read 'handle'` en connect/Node
2. Expo Go incompatible → SDK 52 vs SDK 54 instalado en teléfono
3. Error `"main" not registered` → Librerías nativas (document-scanner) no funcionan con Expo Go
4. WiFi/USB problemáticos para desarrollo

**Solución implementada: EAS Development Build**
- Compila APK en servidores de Expo (gratis)
- APK incluye todas las librerías nativas
- Hot reload funciona via WiFi después de instalar

**Configuración EAS:**
- Cuenta Expo: **facturia**
- Proyecto: `@facturia/facturascannerapp`
- Project ID: `2a70ab52-1695-4031-acff-025d26c256ba`
- Keystore: Build Credentials xbQ7JB1MMU

**Archivos creados/modificados:**
- `eas.json` - Perfiles de build (development, preview, production)
- `.easignore` - Archivos a ignorar en upload
- `app.json` - Agregado campo `expo` con configuración completa
- `package.json` - Agregado `expo-dev-client`

**Backend OCR verificado:**
- URL: `http://217.216.48.91:8081`
- Status: HEALTHY
- Uptime: 67+ horas
- Tesseract 5.5.1 + ImageMagick + Gemini AI

**Comandos útiles:**
```bash
# Desarrollo
npx expo start --dev-client

# Build desarrollo
eas build --profile development --platform android

# Build producción
eas build --profile production --platform android

# Publicar en tienda
eas submit --platform android
```

**Próximos pasos:**
1. Esperar que termine build (~10-15 min)
2. Descargar APK del link de EAS
3. Instalar en teléfono
4. Probar hot reload con `npx expo start --dev-client`

---

### 29-Dic-2024 (Tarde) - Claude Code (Opus 4.5) - CONTINUACIÓN BUILD EAS
**Estado**: 🔄 Build en progreso en servidor Linux

**Contexto recuperado del agente anterior:**
- Build EAS configurado y lanzado desde servidor Contabo (Linux)
- Motivo: Windows daba errores EPERM al subir archivos
- APK anterior disponible: `https://expo.dev/artifacts/eas/gBu9qZ99VSEe2wWUodj2r5.apk`

**Cambios implementados por agente anterior:**
1. Eliminado `expo-camera` y `expo-image-picker` (conflictos SDK)
2. CameraScreen.tsx reescrito con `react-native-document-scanner-plugin`
3. Builds movidos a servidor Linux Contabo (217.216.48.91:2024)
4. index.js registra app como 'main' (requerido para EAS dev builds)

**Servidor de builds:**
- IP: 217.216.48.91:2024
- Usuario: gestoria
- Ruta: ~/eas-builds/FacturaScannerApp
- EXPO_TOKEN configurado

**Estado builds EAS:**
| Build ID | Estado | Resultado |
|----------|--------|-----------|
| a2090146 | 🔄 En progreso | Compilando |
| 7e6d7500 | ✅ Completado | APK listo |
| 64fc2c22 | ❌ Error | Falló |

**Próximos pasos:**
1. Verificar si build terminó
2. Descargar APK e instalar
3. Probar login y cámara

---

### 06-Ene-2025 - Claude Code (Opus 4.5) - CLAUDE-FLOW CONFIGURADO
**Estado**: ✅ COMPLETADO

**Objetivo**: Configurar Claude-Flow para orquestación de agentes IA

**Instalación realizada:**
- Claude-Flow v2.7.47 instalado globalmente en Contabo
- Proyecto FacturaIA configurado como piloto
- ReasoningBank con embeddings locales funcionando
- 64 agentes especializados disponibles
- MCP servers: claude-flow, ruv-swarm, flow-nexus

**Scripts creados en ~/scripts/:**
| Script | Propósito |
|--------|-----------|
| `install-claude-flow.sh` | Instalación global |
| `setup-project-flow.sh` | Setup por proyecto |
| `migrate-mcp-to-flow.sh` | Migración desde Memory Keeper |
| `CHECKLIST-CLAUDE-FLOW.md` | Checklist validación |

**Plantilla creada:**
- `~/templates/CLAUDE-FLOW-TEMPLATE.md`

**Estructura en FacturaIA:**
```
~/eas-builds/FacturaScannerApp/
├── .swarm/
│   ├── memory.db (ReasoningBank)
│   └── project-config.json
├── .claude/
│   ├── agents/ (64 agentes)
│   ├── commands/ (33 comandos)
│   └── skills/ (26 skills)
└── CLAUDE.md
```

**Comandos útiles:**
```bash
claude-flow memory store "key" "value"
claude-flow memory query "*"
claude-flow swarm "tarea" --claude
```

**Próximos pasos:**
1. Configurar otros proyectos con setup-project-flow.sh
2. Migrar datos de Memory Keeper si necesario
3. Verificar build EAS de FacturaIA

---

### 06-Ene-2025 (Tarde) - Claude Code (Opus 4.5) - IATRADER CONFIGURADO + VERIFICACIÓN PROYECTOS
**Estado**: ✅ COMPLETADO

**Proyecto IATRADER configurado:**
- Claude-Flow inicializado en ~/IATRADER
- 64 agentes, 33 comandos, 26 skills
- Memoria test verificada funcionando
- CLAUDE.md actualizado con instrucciones Claude-Flow

**Verificación proyectos pendientes:**
- **gestoriard**: Directorio vacío en ~/factory/apps/gestoriard - NO tiene código
- **casino**: No existe en el servidor - NO creado aún

**Proyectos con Claude-Flow:**
| Proyecto | Ruta | Estado |
|----------|------|--------|
| facturaia | ~/eas-builds/FacturaScannerApp | ✅ Configurado |
| iatrader | ~/IATRADER | ✅ Configurado |
| gestoriard | ~/factory/apps/gestoriard | ⏸️ Directorio vacío |
| casino | - | ⏸️ No existe |

**Archivos actualizados:**
- `C:\Users\carlo\.claude\CLAUDE.md` - Lista actualizada
- `C:\memoria-permanente\brain\current\facturaia\task.md` - Lista actualizada

**Próximos pasos:**
1. Verificar build EAS de FacturaIA
2. Cuando se creen gestoriard/casino, ejecutar setup-project-flow.sh

---

### 06-Ene-2025 (Noche) - Claude Code (Opus 4.5) - DIAGNÓSTICO ERROR OCR
**Estado**: 🔄 Build en progreso con fix

**Problema reportado:**
- Login ✅ funciona (Supabase reactivado)
- Scanner ✅ funciona (document-scanner)
- OCR ❌ Error: "unexpected error during OCR processing"

**Diagnóstico realizado:**

| Componente | Estado | Detalle |
|------------|--------|---------|
| Servidor OCR | ✅ OK | 266h uptime, tesseract 5.5.1, imagemagick |
| Puerto 8081 | ✅ Abierto | Accesible desde internet |
| Health check | ✅ OK | Responde "healthy" |
| Test curl | ✅ OK | Procesa imágenes correctamente |
| Container Docker | ⚠️ "unhealthy" | Health check mal configurado (interno 8080 vs externo 8081) |

**Causa raíz encontrada:**
- Android 9+ (API 28+) bloquea tráfico HTTP por defecto ("cleartext traffic")
- La app intentaba conectar a `http://217.216.48.91:8081` pero Android lo bloqueaba
- El servidor OCR funcionaba perfectamente, la app no podía enviarle la imagen

**Solución aplicada:**
- Agregado `usesCleartextTraffic: true` en `app.json` sección android
- Nuevo build EAS lanzado con el fix

**Archivos modificados:**
- `FacturaScannerApp_Clean/app.json` - Agregado `usesCleartextTraffic: true`

**Build ID:**
- `b9c437d1-1887-4cbd-932d-a5db6285a597`
- URL: https://expo.dev/accounts/facturia/projects/facturascannerapp/builds/b9c437d1-1887-4cbd-932d-a5db6285a597

**Próximos pasos:**
1. Esperar que termine build (~15-45 min Free tier)
2. Descargar APK e instalar
3. Probar flujo completo: login → scan → OCR → guardar

---

### 06-Ene-2025 (Noche) - Claude Code (Opus 4.5) - FIX SUPABASE STORAGE
**Estado**: 🔄 Build en progreso

**Problema:**
- Error `StorageUnknownError: Network request failed` al subir imagen
- El método `fetch(uri)` + `blob` NO funciona en React Native para archivos locales

**Diagnóstico:**
1. Bucket `receipt-images` existe ✅
2. Políticas RLS faltaban → Creada política para `public` INSERT
3. El código usaba `fetch(uri).blob()` que no funciona en RN

**Solución aplicada:**
- Modificado `supabase.ts` → `uploadReceiptImage()`
- Cambio de `fetch(uri).blob()` a `FormData` con URI directo
- Este es el método estándar para uploads en React Native

**Archivos modificados:**
- `FacturaScannerApp_Clean/src/config/supabase.ts` - Upload con FormData

**Build ID:**
- `d1a2e21e-12dd-423e-9726-561319fd4406`
- URL: https://expo.dev/accounts/facturia/projects/facturascannerapp/builds/d1a2e21e-12dd-423e-9726-561319fd4406

---

### 07-Ene-2025 - Claude Code (Opus 4.5) - INICIO MIGRACIÓN MULTI-TENANT
**Estado**: ✅ CONFIGURACIÓN TASKMASTER COMPLETADA

**Objetivo:**
- Migrar de múltiples Supabase a PostgreSQL local multi-tenant en Contabo
- Escalar a 300+ empresas
- Reducir costos de $7,500+/mes a ~$50/mes

**Herramientas instaladas:**
- `task-master-ai` v0.40.1 (Claude Taskmaster)
- Claude-Mem (ya existente)

**Archivos creados:**
- `C:\FacturaIA\.taskmaster\tasks.json` - 28 tareas estructuradas en 5 fases
- `C:\FacturaIA\.taskmaster\config.json` - Configuración de 8 tipos de agentes
- `C:\FacturaIA\.taskmaster\PLAN_ORIGINAL.md` - Plan arquitectónico v2.0

**Arquitectura objetivo:**
```
INTERNET → TRAEFIK (SSL) → Apps
                              ↓
                         PGBOUNCER (:6432)
                              ↓
                      POSTGRESQL 16 (:5433 interno)
                              ↓
                    emp_huyghu | emp_chrytsa | emp_N...
                              +
                         MINIO (storage)
```

**Fases del plan:**
| Fase | Tareas | Días |
|------|--------|------|
| 1. PostgreSQL + PgBouncer | 1-6.5 | 1 |
| 2. MinIO Storage | 7-9 | 0.5 |
| 3. FacturaIA Backend | 10-16 | 2 |
| 4. App Móvil | 17-19 | 1 |
| 5. n8n Automatización | 20-25 | 3 |

**Ajustes al plan original:**
1. Task 6.5: Backups a Google Drive/OneDrive del cliente (no S3 genérico)
2. Nota en Task 15: Considerar OCR asíncrono en v3.0 para evitar timeouts

**Agentes configurados:**
- infra-agent, db-agent, backend-agent, mobile-agent
- debug-agent, qa-agent, automation-agent, docs-agent

**Próximo paso:**
- Ejecutar FASE 1: Tasks 1-6.5 (PostgreSQL completo)

---

### 07-Ene-2025 - infra-agent (Opus 4.5) - TASK 1: POSTGRESQL 16 CREADO Y VERIFICADO
**Estado**: ✅ COMPLETADO

**Comandos ejecutados:**
```bash
# Verificar PostgreSQL existente
docker ps | grep -i postgres
docker ps -a | grep -i gestoria-db
docker network inspect coolify
netstat/ss para puertos 5432/5433
```

**Hallazgos:**

| Componente | Estado | Detalle |
|------------|--------|---------|
| coolify-db | ✅ Existe | postgres:15-alpine, 2 weeks uptime, INTERNO de Coolify - NO TOCAR |
| gestoria-db | ❌ No existe | Contenedor para nuestra BD NO creado aún |
| Puerto 5432 | Solo interno | coolify-db escucha solo en red Docker |
| Puerto 5433 | ❌ No expuesto | No hay PostgreSQL escuchando (correcto) |
| Coolify panel | ✅ Accesible | http://217.216.48.91:8000 (HTTP 302 → login) |
| Red coolify | ✅ OK | 7 contenedores conectados |

**Contenedores en servidor:**
```
coolify-sentinel    - Monitoreo
facturaia-ocr       - OCR service (unhealthy pero funciona)
coolify-proxy       - Traefik v3.6
coolify             - Panel v4.0.0-beta.454
coolify-realtime    - WebSockets
coolify-db          - PostgreSQL interno (NO TOCAR)
coolify-redis       - Cache interno
```

**Password generado para gestoria-db:**
```
VfnyP0NrERdziorDXTIZfMNPXCpqlVn2
```

---

### 07-Ene-2025 - infra-agent (Opus 4.5) - TASK 1: VERIFICACIÓN CONTENEDOR EXISTENTE
**Estado**: ✅ COMPLETADO - PostgreSQL 16 ya creado y funcionando

**Verificación realizada:**
```bash
ssh -p 2024 gestoria@217.216.48.91
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
docker inspect gestoria-db --format '{{json .Config.Env}}'
docker inspect gestoria-db --format '{{json .HostConfig.PortBindings}}'
docker exec gestoria-db psql -U gestoria_admin -d gestoria_central -c 'SELECT version();'
ss -tlnp | grep -E '5432|5433'
```

**Resultados:**

| Verificación | Resultado |
|--------------|-----------|
| Contenedor existente | ✅ `gestoria-db` encontrado |
| Imagen | ✅ `postgres:16-alpine` |
| Estado | ✅ **healthy** (Up 21 minutes) |
| Red Docker | ✅ `coolify` (IP: 172.20.1.9) |
| Puerto interno | 5432/tcp (solo red Docker) |
| Puerto binding externo | ❌ NINGUNO (correcto - seguridad) |
| POSTGRES_USER | ✅ `gestoria_admin` |
| POSTGRES_DB | ✅ `gestoria_central` |
| Versión PostgreSQL | ✅ 16.11 |

**Conexión test:**
```
PostgreSQL 16.11 on x86_64-pc-linux-musl, compiled by gcc (Alpine 15.2.0) 15.2.0, 64-bit
```

**Seguridad verificada:**
- Puerto 5432 NO escucha en 0.0.0.0 (solo red Docker interna)
- Puerto 5433 NO existe/expuesto
- Solo accesible desde contenedores en red `coolify`

**Contenedores en red coolify:**
```
gestoria-db (NUEVO)     - PostgreSQL 16 multi-tenant
coolify-db              - PostgreSQL 15 interno Coolify (NO TOCAR)
coolify                 - Panel Coolify
coolify-proxy           - Traefik
coolify-realtime        - WebSockets
coolify-redis           - Cache
coolify-sentinel        - Monitoreo
facturaia-ocr           - OCR service
```

**Archivos actualizados:**
- `C:\memoria-permanente\brain\current\facturaia\task.md` - Task 1 marcada [x]

**PRÓXIMO PASO:**
- Task 1.5: Instalar PgBouncer (connection pooler)

---

### 07-Ene-2025 - infra-agent (Opus 4.5) - TASK 1.5: PGBOUNCER INSTALADO
**Estado**: ✅ COMPLETADO

**Comandos ejecutados:**
```bash
# Crear directorio configuración
mkdir -p ~/pgbouncer

# Crear userlist.txt
cat > ~/pgbouncer/userlist.txt << 'EOF'
"gestoria_admin" "VfnyP0NrERdziorDXTIZfMNPXCpqlVn2"
EOF

# Crear pgbouncer.ini (pool_mode=transaction, max_client_conn=1000)
cat > ~/pgbouncer/pgbouncer.ini << 'EOF'
[databases]
gestoria_central = host=gestoria-db port=5432 dbname=gestoria_central
...
EOF

# Desplegar contenedor
docker run -d \
  --name pgbouncer \
  --network coolify \
  --restart unless-stopped \
  -v ~/pgbouncer/pgbouncer.ini:/etc/pgbouncer/pgbouncer.ini:ro \
  -v ~/pgbouncer/userlist.txt:/etc/pgbouncer/userlist.txt:ro \
  edoburu/pgbouncer:latest
```

**Resultados:**

| Verificación | Resultado |
|--------------|-----------|
| Contenedor | ✅ `pgbouncer` running |
| Imagen | ✅ `edoburu/pgbouncer:latest` |
| Versión | ✅ PgBouncer 1.25.1 |
| Red Docker | ✅ `coolify` (IP: 172.20.1.10) |
| Puerto interno | 6432 (solo red Docker) |
| Puerto binding externo | ❌ NINGUNO (correcto - seguridad) |
| pool_mode | ✅ transaction |
| max_client_conn | ✅ 1000 |
| default_pool_size | ✅ 25 |

**Logs PgBouncer:**
```
2026-01-07 17:07:57.842 UTC [1] LOG listening on 0.0.0.0:6432
2026-01-07 17:07:57.845 UTC [1] LOG process up: PgBouncer 1.25.1, libevent 2.1.12-stable
```

**Test de conexión exitoso:**
```bash
PGPASSWORD=VfnyP0NrERdziorDXTIZfMNPXCpqlVn2 psql -h 127.0.0.1 -p 6432 -U gestoria_admin -d gestoria_central -c "SELECT 1"
# Resultado: 1 row returned
```

**Test cross-container exitoso:**
```bash
docker exec gestoria-db psql -h 172.20.1.10 -p 6432 -U gestoria_admin -d gestoria_central -c "SELECT 1"
# Resultado: 1 row returned
```

**Archivos de configuración:**
- `~/pgbouncer/pgbouncer.ini`
- `~/pgbouncer/userlist.txt`

**Contenedores en red coolify ahora:**
```
gestoria-db (PostgreSQL 16)  - IP: 172.20.1.9:5432
pgbouncer (PgBouncer 1.25.1) - IP: 172.20.1.10:6432  ← NUEVO
coolify-db, coolify, coolify-proxy, etc...
```

**PRÓXIMO PASO:**
- Task 2: Crear extensiones y tablas maestras (db-agent)

---

### 07-Ene-2025 - infra-agent (Opus 4.5) - TASK 7: MINIO INSTALADO
**Estado**: ✅ COMPLETADO

**Comandos ejecutados:**
```bash
# Crear directorio de datos
mkdir -p ~/minio/data

# Generar password seguro
openssl rand -base64 24 | tr -d '/+=' | head -c 32
# Resultado: mMG3F4M42vgcGggEpAhAQuZ349jBkl

# Crear contenedor MinIO
docker run -d \
  --name minio \
  --network coolify \
  --restart unless-stopped \
  -p 9000:9000 \
  -p 9001:9001 \
  -v ~/minio/data:/data \
  -e 'MINIO_ROOT_USER=gestoria_minio' \
  -e 'MINIO_ROOT_PASSWORD=mMG3F4M42vgcGggEpAhAQuZ349jBkl' \
  minio/minio:latest server /data --console-address ':9001'
```

**Verificaciones realizadas:**

| Test | Resultado |
|------|-----------|
| docker ps \| grep minio | Up About a minute |
| docker logs minio | API: http://172.20.1.11:9000, WebUI: http://172.20.1.11:9001 |
| curl -I http://localhost:9001 | HTTP 200 OK |
| curl http://localhost:9000 | Access Denied (correcto - requiere auth) |
| curl -I http://217.216.48.91:9001 | HTTP 200 OK (acceso externo) |

**Configuracion final:**
- Contenedor: `minio`
- Imagen: `minio/minio:latest` (RELEASE.2025-09-07T16-13-09Z, go1.24.6)
- Red: `coolify` (IP interna: 172.20.1.11)
- Puertos:
  - 9000: API S3 (0.0.0.0:9000 -> 9000/tcp)
  - 9001: Console Web (0.0.0.0:9001 -> 9001/tcp)
- Data volume: `~/minio/data`
- Restart policy: `unless-stopped`
- Credenciales:
  - MINIO_ROOT_USER: gestoria_minio
  - MINIO_ROOT_PASSWORD: mMG3F4M42vgcGggEpAhAQuZ349jBkl

**Acceso:**
- Console Web: http://217.216.48.91:9001
- API S3: http://217.216.48.91:9000

**Contenedores en red coolify ahora:**
```
gestoria-db (PostgreSQL 16)  - IP: 172.20.1.9:5432
pgbouncer (PgBouncer 1.25.1) - IP: 172.20.1.10:6432
minio (MinIO S3)             - IP: 172.20.1.11:9000/9001  ← NUEVO
coolify-db, coolify, coolify-proxy, facturaia-ocr, etc...
```

**PRÓXIMO PASO:**
- Task 8: Crear bucket `facturas` (infra-agent)
- Task 9: Generar Access Keys para aplicaciones (infra-agent)

---

### 07-Ene-2025 - infra-agent (Opus 4.5) - TASK 8: BUCKETS MINIO CREADOS
**Estado**: ✅ COMPLETADO

**Comandos ejecutados:**
```bash
# Instalar cliente mc
curl -o ~/mc https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x ~/mc

# Configurar alias
~/mc alias set local http://localhost:9000 gestoria_minio 'password'

# Crear buckets
~/mc mb local/facturas
~/mc mb local/documentos
~/mc mb local/reportes
~/mc mb local/backups

# Configurar politicas privadas
~/mc anonymous set none local/facturas
~/mc anonymous set none local/documentos
~/mc anonymous set none local/reportes
~/mc anonymous set none local/backups
```

**Resultados:**

| Bucket | Proposito | Politica |
|--------|-----------|----------|
| facturas | Imagenes de facturas escaneadas | private |
| documentos | Documentos adicionales por empresa | private |
| reportes | Reportes generados (PDF, Excel) | private |
| backups | Copias de seguridad BD | private |

**Cliente MinIO:**
- Ubicacion: `~/mc`
- Version: RELEASE.2025-08-13T08-35-41Z (go1.24.6)
- Alias: `local` -> http://localhost:9000

**Test upload/download:**
```bash
# Upload
~/mc cp /tmp/test.txt local/facturas/test/test.txt
# Output: 75 B uploaded in 00m00s

# List
~/mc ls local/facturas/test/
# Output: [2026-01-07] 75B STANDARD test.txt

# Download/verify
~/mc cat local/facturas/test/test.txt
# Output: contenido correcto

# Cleanup
~/mc rm local/facturas/test/test.txt
# Output: Removed successfully
```

**Estructura de carpetas esperada:**
```
facturas/
├── {empresa_alias}/
│   ├── 2025/
│   │   ├── 01/
│   │   │   ├── factura_001.jpg
│   │   │   └── factura_002.jpg
│   │   └── 02/
│   │       └── ...
```

**Comandos utiles mc:**
```bash
# Listar buckets
~/mc ls local/

# Subir archivo
~/mc cp archivo.jpg local/facturas/empresa/2025/01/

# Descargar archivo
~/mc cp local/facturas/empresa/2025/01/archivo.jpg ./

# Ver contenido bucket
~/mc ls local/facturas/ --recursive

# Eliminar archivo
~/mc rm local/facturas/path/archivo.jpg
```

**PRÓXIMO PASO:**
- Task 9: Generar Access Keys para aplicaciones (infra-agent)

---

### 07-Ene-2025 - db-agent (Opus 4.5) - TASK 2: EXTENSIONES Y TABLAS MAESTRAS
**Estado**: ✅ COMPLETADO

**Comandos ejecutados:**
```bash
# Conectar a PostgreSQL directo (para DDL)
docker exec gestoria-db psql -U gestoria_admin -d gestoria_central

# Crear extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

# Crear tabla empresas
CREATE TABLE IF NOT EXISTS public.empresas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alias VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    rnc VARCHAR(20),
    email_contacto VARCHAR(255),
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_empresas_alias ON public.empresas(alias);
CREATE INDEX idx_empresas_rnc ON public.empresas(rnc);

# Crear tabla schema_migrations
CREATE TABLE IF NOT EXISTS public.schema_migrations (
    id SERIAL PRIMARY KEY,
    version VARCHAR(50) NOT NULL,
    description TEXT,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    applied_to_schemas TEXT[]
);

# Crear tabla audit_log
CREATE TABLE IF NOT EXISTS public.audit_log (
    id BIGSERIAL PRIMARY KEY,
    empresa_alias VARCHAR(50),
    tabla VARCHAR(100),
    operacion VARCHAR(10),
    usuario_id UUID,
    datos_anteriores JSONB,
    datos_nuevos JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_audit_empresa ON public.audit_log(empresa_alias);
CREATE INDEX idx_audit_fecha ON public.audit_log(created_at);
```

**Verificaciones realizadas:**

| Test | Resultado |
|------|-----------|
| Extensiones instaladas | uuid-ossp, pgcrypto (2 rows) |
| Tablas creadas | 3 tablas (empresas, schema_migrations, audit_log) |
| uuid_generate_v4() | 478f7c16-2bc8-490d-96c3-23034cebe58f |
| crypt('test123', gen_salt('bf')) | $2a$06$D8O0ZNSq8Q8jU4odjPF2R... |

**Resumen de objetos creados:**

| Objeto | Tipo | Descripcion |
|--------|------|-------------|
| uuid-ossp | Extension | Generacion de UUIDs v4 |
| pgcrypto | Extension | Funciones criptograficas (crypt, gen_salt) |
| empresas | Tabla | Registro maestro de empresas (alias, nombre, rnc) |
| schema_migrations | Tabla | Control de versiones de migraciones |
| audit_log | Tabla | Log de auditoria de cambios |
| idx_empresas_alias | Index | Busqueda por alias de empresa |
| idx_empresas_rnc | Index | Busqueda por RNC |
| idx_audit_empresa | Index | Filtro por empresa en audit |
| idx_audit_fecha | Index | Filtro por fecha en audit |

**PRÓXIMO PASO:**
- Task 3: Funcion crear_empresa() (db-agent)

---

### 07-Ene-2025 - db-agent (Opus 4.5) - TASK 3: FUNCIÓN crear_empresa()
**Estado**: ✅ COMPLETADO

**Función creada:**
```sql
CREATE OR REPLACE FUNCTION public.crear_empresa(
    p_alias VARCHAR(50),
    p_nombre VARCHAR(255),
    p_rnc VARCHAR(20) DEFAULT NULL,
    p_email VARCHAR(255) DEFAULT NULL
)
RETURNS UUID
```

**Lógica implementada:**
1. Valida alias con regex `^[a-z0-9_]+$`
2. Verifica que no exista empresa con mismo alias
3. Inserta registro en `public.empresas`
4. Crea schema `emp_{alias}`
5. Crea 4 tablas en el schema:
   - `usuarios` (email, password_hash, nombre, rol, activo, ultimo_login)
   - `facturas` (ncf, rnc_proveedor, fecha, totales, ocr_json, estado)
   - `proveedores` (rnc, nombre, direccion, telefono, email, tipo)
   - `config_dgii` (rnc_empresa, nombre_comercial, razon_social, credenciales)
6. Crea 3 índices:
   - `idx_{alias}_facturas_fecha`
   - `idx_{alias}_facturas_proveedor`
   - `idx_{alias}_usuarios_email`
7. Registra operación en `public.audit_log`
8. Retorna UUID de la empresa creada

**Test realizado:**
```sql
SELECT crear_empresa('test_empresa', 'Test Corp SRL', '123456789', 'test@test.com');
-- Resultado: dc17ce69-b7c8-4a4e-a7c8-82e1f7dd34ec
```

**Verificaciones exitosas:**
| Test | Resultado |
|------|-----------|
| Schema creado | `emp_test_empresa` existe |
| Tablas creadas | 4 (usuarios, facturas, proveedores, config_dgii) |
| Registro empresas | 1 row con datos correctos |
| Registro audit_log | 1 row con operación CREATE |

**Limpieza ejecutada:**
```sql
DROP SCHEMA emp_test_empresa CASCADE;  -- Eliminó 4 tablas
DELETE FROM public.empresas WHERE alias = 'test_empresa';
DELETE FROM public.audit_log WHERE empresa_alias = 'test_empresa';
```

**PRÓXIMO PASO:**
- Task 4: Funciones crear_usuario_empresa() y verificar_login() (db-agent)

---

### 07-Ene-2025 - infra-agent (Opus 4.5) - TASK 9: ACCESS KEYS MINIO GENERADOS
**Estado**: ✅ COMPLETADO

**Comandos ejecutados:**
```bash
# Generar password y crear usuario
openssl rand -base64 24 | tr -d '/+=' | head -c 32
~/mc admin user add local facturaia-backend "<password>"

# Crear politica restrictiva
cat > /tmp/facturaia-policy.json << 'EOF'
{
    "Version": "2012-10-17",
    "Statement": [{
        "Effect": "Allow",
        "Action": ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket", "s3:GetBucketLocation"],
        "Resource": [
            "arn:aws:s3:::facturas", "arn:aws:s3:::facturas/*",
            "arn:aws:s3:::documentos", "arn:aws:s3:::documentos/*"
        ]
    }]
}
EOF

# Crear y asignar politica
~/mc admin policy create local facturaia-policy /tmp/facturaia-policy.json
~/mc admin policy attach local facturaia-policy --user facturaia-backend
```

**Credenciales generadas:**

| Campo | Valor |
|-------|-------|
| Access Key | `facturaia-backend` |
| Secret Key | `z0AKTjQXUDBe9QSuNpJz98WM4gdir8uP` |
| Politica | `facturaia-policy` |
| Buckets permitidos | facturas, documentos |
| Buckets denegados | reportes, backups |
| Endpoint interno | `http://minio:9000` |
| Endpoint externo | `http://217.216.48.91:9000` |

**Tests realizados:**

| Test | Resultado |
|------|-----------|
| Upload a facturas | OK |
| List facturas | OK |
| Delete en facturas | OK |
| List documentos | OK |
| List backups | ACCESS DENIED (correcto) |

**Uso en backend Go:**
```go
// Variables de entorno para el servicio Go
MINIO_ENDPOINT=minio:9000           // Interno Docker (sin http://)
MINIO_ACCESS_KEY=facturaia-backend
MINIO_SECRET_KEY=z0AKTjQXUDBe9QSuNpJz98WM4gdir8uP
MINIO_USE_SSL=false
MINIO_BUCKET=facturas
```

**FASE 2 - MinIO Storage: COMPLETADA**
- Task 7: MinIO instalado
- Task 8: Buckets creados
- Task 9: Access Keys generados

**PRÓXIMO PASO:**
- Continuar FASE 1 pendiente: Tasks 4, 4.5, 5, 6 (db-agent)
- O iniciar FASE 3: FacturaIA Backend - Tasks 10-16 (backend-agent)

---

### 07-Ene-2025 - db-agent (Opus 4.5) - TASK 4: FUNCIONES AUTENTICACION MULTI-TENANT
**Estado**: COMPLETADO

**Funciones creadas:**

1. **crear_usuario_empresa(p_empresa_alias, p_email, p_password, p_nombre, p_rol)**
   - Verifica empresa existe y esta activa
   - Verifica email no duplicado en schema de empresa
   - Hash password con bcrypt (gen_salt('bf', 10))
   - Inserta en `emp_{alias}.usuarios`
   - Registra en audit_log
   - Retorna UUID del usuario creado

2. **verificar_login(p_empresa_alias, p_email, p_password)**
   - Verifica empresa existe y esta activa
   - Busca usuario en schema dinamico
   - Compara password con hash usando crypt()
   - Retorna TABLE: user_id, email, nombre, rol, empresa_alias, empresa_nombre
   - Login exitoso: 1 fila
   - Login fallido: 0 filas (sin excepcion)

3. **registrar_login(p_empresa_alias, p_user_id)**
   - Actualiza campo `ultimo_login` a NOW()
   - Usado despues de login exitoso

**Tests ejecutados:**

| Test | Comando | Resultado |
|------|---------|-----------|
| Crear empresa test | `SELECT crear_empresa('test_auth', ...)` | UUID: 582bd232-... |
| Crear usuario | `SELECT crear_usuario_empresa('test_auth', 'admin@test.com', 'password123', 'Admin Test', 'admin')` | UUID: 25d9c4b1-... |
| Login exitoso | `SELECT * FROM verificar_login('test_auth', 'admin@test.com', 'password123')` | 1 fila con datos completos |
| Login fallido (password) | `SELECT * FROM verificar_login('test_auth', 'admin@test.com', 'wrongpassword')` | 0 filas |
| Login fallido (email) | `SELECT * FROM verificar_login('test_auth', 'noexiste@test.com', 'password123')` | 0 filas |
| Registrar login | `SELECT registrar_login('test_auth', UUID)` | OK, ultimo_login actualizado |
| Audit log | `SELECT * FROM audit_log WHERE empresa_alias='test_auth'` | 2 entradas (empresa + usuario) |

**Limpieza completada:**
```sql
DROP SCHEMA emp_test_auth CASCADE;  -- 4 tablas eliminadas
DELETE FROM public.empresas WHERE alias = 'test_auth';  -- 1 fila
DELETE FROM public.audit_log WHERE empresa_alias = 'test_auth';  -- 2 filas
```

**Uso desde aplicacion:**
```sql
-- Crear usuario nuevo
SELECT crear_usuario_empresa('miempresa', 'user@email.com', 'clave123', 'Juan Perez', 'usuario');

-- Verificar login
SELECT * FROM verificar_login('miempresa', 'user@email.com', 'clave123');
-- Si retorna 1 fila: login exitoso, usar datos para JWT
-- Si retorna 0 filas: credenciales invalidas

-- Despues de login exitoso, registrar timestamp
SELECT registrar_login('miempresa', 'uuid-del-usuario');
```

**PROXIMO PASO:**
- Task 4.5: Funcion ejecutar_migracion() (db-agent)
- Task 5: Crear empresa piloto Huyghu (db-agent)

---

### 07-Ene-2025 - db-agent (Opus 4.5) - TASK 5: EMPRESA PILOTO HUYGHU CREADA
**Estado**: COMPLETADO

**Empresa creada:**
```sql
SELECT crear_empresa('huyghu', 'Huyghu & Asoc. SRL', '131047939', 'agenda@huyghusrl.com');
-- UUID: b2fe6748-b360-4dc8-a4ed-6430d812775b
```

**Usuario admin creado:**
```sql
SELECT crear_usuario_empresa('huyghu', 'asier@gestoria.com', 'test123', 'Asier Huyghu', 'admin');
-- UUID: 5431e3ab-fc8b-4e60-965b-5b1aeb28f98f
```

**Config DGII insertada:**
```sql
INSERT INTO emp_huyghu.config_dgii (
    rnc_empresa, nombre_comercial, razon_social, direccion, telefono, email_dgii
) VALUES (
    '131047939', 'Huyghu & Asoc. SRL', 'Huyghu & Asoc. SRL',
    'Santo Domingo, República Dominicana', '809-555-1234', 'agenda@huyghusrl.com'
);
```

**Verificaciones realizadas:**

| Verificacion | Resultado |
|--------------|-----------|
| Empresa en public.empresas | 1 row, activa=true |
| Schema emp_huyghu creado | OK |
| Tablas en schema | 4 (config_dgii, facturas, proveedores, usuarios) |
| Usuario admin | asier@gestoria.com, rol=admin, activo=true |
| Config DGII | RNC 131047939, Huyghu & Asoc. SRL |
| Test login | 1 row con user_id, email, nombre, rol, empresa_alias, empresa_nombre |
| Audit log | 2 operaciones (CREATE empresa, INSERT usuario) |

**Credenciales empresa piloto:**

| Campo | Valor |
|-------|-------|
| Alias | `huyghu` |
| UUID Empresa | `b2fe6748-b360-4dc8-a4ed-6430d812775b` |
| RNC | `131047939` |
| Email contacto | `agenda@huyghusrl.com` |
| Login usuario | `asier@gestoria.com` |
| Password | `test123` |
| UUID Usuario | `5431e3ab-fc8b-4e60-965b-5b1aeb28f98f` |
| Rol | `admin` |

**NOTA IMPORTANTE:** Esta es la empresa piloto real. NO ejecutar DROP ni DELETE.

**PROXIMO PASO:**
- Task 6: Documentar credenciales

---

### 07-Ene-2025 - debug-agent (Opus 4.5) - TASK 10: FACTURAIA-OCR REPARADO
**Estado**: ✅ COMPLETADO

**Problema reportado:**
- Contenedor `facturaia-ocr` mostraba estado `unhealthy` (34,735+ fallos consecutivos)
- El servicio interno funcionaba perfectamente (health endpoint respondia 200 OK)

**Diagnostico realizado:**

| Test | Resultado |
|------|-----------|
| `docker ps` | Up 12 days (unhealthy) |
| `curl http://localhost:8081/health` | HTTP 200 OK, JSON valido |
| `docker exec wget --spider` | EXIT 8 (Method Not Allowed) |
| `docker exec wget -O-` | HTTP 200 OK, JSON valido |

**Causa raiz identificada:**
1. El healthcheck usaba `wget --spider` que envia peticion HTTP HEAD
2. El servidor Go solo aceptaba GET para `/health`, retornaba **405 Method Not Allowed** para HEAD
3. El Dockerfile original tenia variable `${PORT}` que no se expandia correctamente

**Solucion aplicada:**

1. **Actualizado Dockerfile** (`~/factory/apps/facturaia-ocr/Dockerfile`):
   ```dockerfile
   # ANTES (fallaba):
   HEALTHCHECK ... CMD wget --quiet --tries=1 --spider http://localhost:${PORT}/health || exit 1

   # DESPUES (funciona):
   HEALTHCHECK ... CMD wget -q -O /dev/null http://127.0.0.1:8080/health || exit 1
   ```
   - Cambiado `--spider` (HEAD) por `-O /dev/null` (GET)
   - Cambiado `${PORT}` por `8080` hardcodeado
   - Cambiado `localhost` por `127.0.0.1`

2. **Reconstruida imagen Docker:**
   ```bash
   cd ~/factory/apps/facturaia-ocr
   docker build -t facturaia-ocr:latest .
   ```

3. **Recreado contenedor con healthcheck correcto:**
   ```bash
   docker stop facturaia-ocr && docker rm facturaia-ocr
   docker run -d \
     --name facturaia-ocr \
     --restart unless-stopped \
     -p 8081:8080 \
     -e PORT=8080 \
     -e GEMINI_API_KEY=AIzaSyBQU-tSPRsWjc-qWgEtPeXkViSqyzdNQDc \
     --health-cmd="wget -q -O /dev/null http://127.0.0.1:8080/health || exit 1" \
     --health-interval=30s \
     --health-timeout=10s \
     --health-retries=3 \
     --health-start-period=40s \
     facturaia-ocr:latest
   ```

**Verificacion final:**

| Test | Resultado |
|------|-----------|
| `docker ps` | Up About a minute **(healthy)** |
| `docker inspect --format={{.State.Health.Status}}` | **healthy** |
| `docker inspect --format={{.State.Health.FailingStreak}}` | **0** |
| `curl http://localhost:8081/health` | HTTP 200 OK, JSON valido |

**Estado final del contenedor:**
- Container ID: `0ba08368c1b3`
- Image: `facturaia-ocr:latest`
- Status: **Up About a minute (healthy)**
- Ports: `0.0.0.0:8081->8080/tcp`
- Tesseract: 5.5.1
- AI Provider: Gemini

**Archivos modificados:**
- `~/factory/apps/facturaia-ocr/Dockerfile` - Healthcheck corregido

---

### 07-Ene-2025 - db-agent (Opus 4.5) - TASK 4.5: FUNCION ejecutar_migracion()
**Estado**: COMPLETADO

**Funciones creadas:**

1. **ejecutar_migracion(p_version, p_descripcion, p_sql_template)**
   - Propaga cambios SQL a todos los schemas de empresas activas
   - Usa placeholder `{schema}` que se reemplaza dinamicamente
   - Verifica que la migracion no exista (proteccion duplicados)
   - Itera sobre todas las empresas activas
   - Captura errores por empresa pero continua con las demas
   - Registra schemas exitosos en `schema_migrations`
   - Retorna TABLE (empresa_alias, exito, mensaje)

2. **ver_migraciones()**
   - Funcion auxiliar para ver migraciones aplicadas
   - Muestra: id, version, description, applied_at, schemas_count
   - Ordenado por fecha descendente

**Tests ejecutados:**

| Test | Comando | Resultado |
|------|---------|-----------|
| Crear empresas test | `crear_empresa('mig_test1/2')` | 2 UUIDs generados |
| Schemas creados | `schemata WHERE LIKE 'emp_mig_test%'` | 2 schemas |
| Ejecutar migracion | `ejecutar_migracion('001_add_notas_factura', ...)` | 2 rows exito=true |
| Columna creada | `columns WHERE column_name = 'notas'` | 2 rows (ambos schemas) |
| Migracion registrada | `ver_migraciones()` | 1 row, schemas_count=2 |
| Proteccion duplicados | Intentar re-aplicar misma version | ERROR correcto |

**Limpieza completada:**
```sql
DROP SCHEMA emp_mig_test1 CASCADE;  -- 4 tablas eliminadas
DROP SCHEMA emp_mig_test2 CASCADE;  -- 4 tablas eliminadas
DELETE FROM public.empresas WHERE alias IN ('mig_test1', 'mig_test2');
DELETE FROM public.audit_log WHERE empresa_alias IN ('mig_test1', 'mig_test2');
DELETE FROM public.schema_migrations WHERE version = '001_add_notas_factura';
-- Verificacion: 0 registros residuales
```

**Uso futuro:**
```sql
-- Agregar columna a todas las empresas
SELECT * FROM ejecutar_migracion(
    '002_add_campo_x',
    'Descripcion del cambio',
    'ALTER TABLE {schema}.facturas ADD COLUMN IF NOT EXISTS campo_x TYPE'
);

-- Ver historial de migraciones
SELECT * FROM ver_migraciones();
```

**PROXIMO PASO:**
- Task 5: Crear empresa piloto Huyghu (db-agent)
- Task 6: Documentar credenciales

---

### 07-Ene-2025 - infra-agent (Opus 4.5) - TASK 6: CREDENCIALES DOCUMENTADAS
**Estado**: COMPLETADO

**Directorio creado:**
- `~/credentials/` con permisos 700 (drwx------)

**Archivos creados (todos con permisos 600):**

| Archivo | Contenido |
|---------|-----------|
| `gestoria-db.env` | PostgreSQL + PgBouncer + SSH tunnel |
| `minio.env` | MinIO root + app credentials |
| `empresas.env` | Empresa piloto Huyghu |
| `facturaia-backend.env` | Variables combinadas para Go backend |

**Verificaciones realizadas:**
```bash
ls -la ~/credentials/
# drwx------  gestoria-db.env (529 bytes)
# -rw-------  minio.env (415 bytes)
# -rw-------  empresas.env (195 bytes)
# -rw-------  facturaia-backend.env (540 bytes)
```

**Test de conexion con credenciales:**
```bash
# Via Docker (psql no instalado en host)
docker exec gestoria-db psql -U gestoria_admin -d gestoria_central -c 'SELECT 1'
# Resultado: 1 row

# Via PgBouncer (usando contenedor temporal)
docker run --rm --network coolify postgres:15-alpine \
  psql 'postgresql://gestoria_admin:***@pgbouncer:6432/gestoria_central' \
  -c 'SELECT current_database(), current_user'
# Resultado: gestoria_central | gestoria_admin
```

**Contenido de facturaia-backend.env:**
```env
# Base de datos (via PgBouncer)
DATABASE_URL=postgresql://gestoria_admin:***@pgbouncer:6432/gestoria_central

# MinIO Storage
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=facturaia-backend
MINIO_SECRET_KEY=***
MINIO_USE_SSL=false
MINIO_BUCKET=facturas

# JWT
JWT_SECRET=cambiar_en_produccion_usar_openssl_rand_base64_32

# Server
PORT=8081
GIN_MODE=release
```

**Uso desde Docker/aplicaciones:**
```bash
# Cargar variables
source ~/credentials/facturaia-backend.env

# O copiar al docker-compose
docker run --env-file ~/credentials/facturaia-backend.env ...
```

**FASE 1 - PostgreSQL + PgBouncer: COMPLETADA**
- [x] Task 1: PostgreSQL 16 creado
- [x] Task 1.5: PgBouncer instalado
- [x] Task 2: Extensiones y tablas maestras
- [x] Task 3: Funcion crear_empresa()
- [x] Task 4: Funciones autenticacion
- [x] Task 4.5: Funcion ejecutar_migracion()
- [x] Task 5: Empresa piloto Huyghu
- [x] Task 6: Credenciales documentadas

**PROXIMO PASO:**
- FASE 3: FacturaIA Backend (Tasks 10-16)

---

### 07-Ene-2025 - backend-agent (Opus 4.5) - TASK 13: CLIENTE MINIO AGREGADO
**Estado**: COMPLETADO

**Objetivo**: Agregar cliente MinIO al backend Go para subir imagenes de facturas con estructura multi-tenant.

**Archivos creados:**
- `~/factory/apps/facturaia-ocr/internal/storage/minio.go` (120 lineas)

**Contenido del modulo storage:**
```go
package storage

// Variables globales
var Client *minio.Client
var BucketName string

// Funciones disponibles:
func Init() error                                                    // Inicializa cliente MinIO
func UploadInvoiceImage(ctx, empresaAlias, filename, reader, size, contentType) (string, error)
func GetPresignedURL(ctx, objectPath) (string, error)               // URL temporal 24h
func DeleteImage(ctx, objectPath) error                             // Elimina imagen
func GetFileExtension(contentType) string                           // Helper para extensiones
```

**Estructura de paths en MinIO:**
```
facturas/{empresa_alias}/YYYY/MM/{filename}
Ejemplo: facturas/huyghu/2025/01/invoice_abc123.jpg
```

**Archivos modificados:**
- `~/factory/apps/facturaia-ocr/cmd/server/main.go`
  - Agregado import del paquete storage
  - Agregado inicializacion condicional de MinIO (solo si MINIO_ENDPOINT esta configurado)
  - Logs de estado de conexion

- `~/factory/apps/facturaia-ocr/go.mod`
  - Agregada dependencia directa: `github.com/minio/minio-go/v7 v7.0.97`
  - Go version actualizada a 1.24.0 (requerido por minio-go)

**Dependencias agregadas:**
| Paquete | Version |
|---------|---------|
| minio-go/v7 | v7.0.97 |
| dustin/go-humanize | v1.0.1 |
| klauspost/compress | v1.18.0 |
| klauspost/cpuid/v2 | v2.2.11 |
| rs/xid | v1.6.0 |
| (+ otras indirectas) | ... |

**Compilacion:**
```bash
cd ~/factory/apps/facturaia-ocr
go build -o bin/server ./cmd/server
# Resultado: bin/server (31MB)
```

**Variables de entorno para activar MinIO:**
```bash
MINIO_ENDPOINT=minio:9000           # Endpoint interno Docker
MINIO_ACCESS_KEY=facturaia-backend  # Access key
MINIO_SECRET_KEY=z0AKTjQXUDBe9QSuNpJz98WM4gdir8uP
MINIO_USE_SSL=false                 # Sin SSL para red interna
MINIO_BUCKET=facturas               # Bucket por defecto
```

**Comportamiento:**
- Si MINIO_ENDPOINT no esta configurado: storage desactivado (log warning)
- Si bucket no existe: error en Init (fail-fast)
- Retorna path completo: `facturas/empresa/2025/01/file.jpg` para guardar en BD

**PROXIMO PASO:**
- Task 14: Integrar storage en el handler de process-invoice
- Task 15: Agregar cliente PostgreSQL al backend

---

### 07-Ene-2025 (Noche) - backend-agent (Opus 4.5) - TASK 12: CLIENTE POSTGRESQL AGREGADO
**Estado**: COMPLETADO

**Objetivo**: Agregar modulo de conexion a PostgreSQL multi-tenant usando pgx/v5 y pgxpool.

**Archivos creados:**

1. `~/factory/apps/facturaia-ocr/internal/db/postgres.go` (52 lineas)
   ```go
   package db

   var Pool *pgxpool.Pool

   func Init() error              // Inicializa pool de conexiones
   func Close()                   // Cierra el pool
   func GetSchemaForEmpresa(alias string) string  // Retorna "emp_{alias}"
   ```
   - Configuracion del pool:
     - MaxConns: 10
     - MinConns: 2
     - MaxConnLifetime: 1 hora
     - MaxConnIdleTime: 30 minutos
   - Timeout de conexion: 10 segundos
   - Test de ping incluido en Init()

2. `~/factory/apps/facturaia-ocr/internal/db/invoices.go` (75 lineas)
   ```go
   type Invoice struct {
       ID, NCF, RNCProveedor, NombreProveedor, FechaFactura,
       Subtotal, ITBIS, Total, TipoGasto, ImagenURL,
       OCRRaw, OCRJSON, Estado, UsuarioID, CreatedAt
   }

   func SaveInvoice(ctx, empresaAlias, inv) error
   func GetInvoices(ctx, empresaAlias, limit) ([]Invoice, error)
   ```
   - Queries dinamicos con schema por empresa: `emp_{alias}.facturas`
   - Compatible con funciones PL/pgSQL existentes

**Archivos modificados:**

1. `~/factory/apps/facturaia-ocr/cmd/server/main.go`
   - Agregado import: `"github.com/facturaIA/invoice-ocr-service/internal/db"`
   - Agregado `db.Init()` al inicio del main
   - Agregado `defer db.Close()`
   - Comportamiento graceful: si DB falla, servidor arranca sin soporte BD

2. `~/factory/apps/facturaia-ocr/go.mod`
   - Go version actualizada: 1.21 -> 1.24.0
   - Agregado toolchain: go1.24.11
   - Agregada dependencia: `github.com/jackc/pgx/v5 v5.8.0`
   - Dependencias indirectas: pgpassfile, pgservicefile, puddle/v2

**Dependencias agregadas:**
| Paquete | Version |
|---------|---------|
| jackc/pgx/v5 | v5.8.0 |
| jackc/pgpassfile | v1.0.0 |
| jackc/pgservicefile | v0.0.0-20240606 |
| jackc/puddle/v2 | v2.2.2 |

**Compilacion exitosa:**
```bash
cd ~/factory/apps/facturaia-ocr
go mod tidy
go build -o bin/server ./cmd/server
# Resultado: bin/server (31MB)
```

**Docker image reconstruida:**
```bash
docker build --no-cache -t facturaia-ocr:latest .
```

**Contenedor recreado con acceso a PgBouncer:**
```bash
docker run -d \
  --name facturaia-ocr \
  --network coolify \
  -p 8081:8080 \
  -e DATABASE_URL='postgresql://gestoria_admin:***@pgbouncer:6432/gestoria_central' \
  -e GEMINI_API_KEY=*** \
  facturaia-ocr:latest
```

**Verificaciones:**

| Test | Resultado |
|------|-----------|
| go build | OK (sin errores) |
| Docker build | OK (40s compile) |
| Container startup | OK |
| DB connection | "Database connection pool initialized" |
| Health check | healthy (0 failures) |
| /health endpoint | HTTP 200 OK |

**Logs del contenedor:**
```
2026/01/07 23:05:16 Database connection pool initialized successfully
2026/01/07 23:05:16 Database connection pool initialized
2026/01/07 23:05:16 Starting Invoice OCR Service on 0.0.0.0:8080
2026/01/07 23:05:16 OCR Engine: tesseract
2026/01/07 23:05:16 Default AI Provider: gemini
```

**Variables de entorno para PostgreSQL:**
```bash
DATABASE_URL=postgresql://gestoria_admin:***@pgbouncer:6432/gestoria_central
# Formato: postgresql://user:password@host:port/database
# Host interno Docker: pgbouncer (no IP)
# Puerto PgBouncer: 6432
```

**Uso desde handlers:**
```go
import "github.com/facturaIA/invoice-ocr-service/internal/db"

// Guardar factura
invoice := &db.Invoice{NCF: "B0100000001", ...}
err := db.SaveInvoice(ctx, "huyghu", invoice)

// Obtener facturas
invoices, err := db.GetInvoices(ctx, "huyghu", 50)
```

**PROXIMO PASO:**
- Task 14: Integrar storage + DB en handler de process-invoice
- Task 15: Agregar autenticacion JWT al backend

---

### 07-Ene-2025 - backend-agent (Opus 4.5) - TASK 14: MIDDLEWARE JWT AGREGADO
**Estado**: COMPLETADO

**Objetivo**: Crear middleware JWT que valida tokens y extrae informacion del tenant para autenticacion multi-empresa.

**Archivos creados:**

1. `~/factory/apps/facturaia-ocr/internal/auth/jwt.go` (120 lineas)
   ```go
   package auth

   type Claims struct {
       UserID        string `json:"user_id"`
       Email         string `json:"email"`
       EmpresaAlias  string `json:"empresa_alias"`
       EmpresaNombre string `json:"empresa_nombre"`
       Rol           string `json:"rol"`
       jwt.RegisteredClaims
   }

   func Init() error                    // Inicializa JWT secret desde env
   func GenerateToken(...) (string, error)  // Crea JWT con claims
   func ValidateToken(tokenString) (*Claims, error)  // Valida y parsea JWT
   func JWTMiddleware(next) http.Handler    // Middleware que valida JWT
   func GetClaimsFromContext(ctx) (*Claims, error)  // Extrae claims del contexto
   func RequireRole(roles...) func(http.Handler) http.Handler  // Middleware de roles
   ```

2. `~/factory/apps/facturaia-ocr/internal/auth/login.go` (80 lineas)
   ```go
   type LoginRequest struct {
       EmpresaAlias string `json:"empresa_alias"`
       Email        string `json:"email"`
       Password     string `json:"password"`
   }

   type LoginResponse struct {
       Token, UserID, Email, Nombre, Rol, EmpresaAlias, EmpresaNombre
   }

   func LoginHandler(w, r)  // POST /api/login - llama verificar_login()
   ```

3. `~/factory/apps/facturaia-ocr/internal/db/pool.go` (actualizado)
   - Agregada funcion `GetSchemaForEmpresa(alias)`

**Archivos modificados:**

1. `go.mod`
   - Actualizado a `go 1.24.0`
   - Agregado `github.com/golang-jwt/jwt/v5 v5.2.1`
   - Agregado `github.com/jackc/pgx/v5 v5.5.5`

2. `Dockerfile`
   - Actualizado de `golang:1.21-alpine` a `golang:1.24-alpine`

3. `cmd/server/main.go`
   - Import `internal/auth`
   - Llamada `auth.Init()` al inicio
   - Ruta `router.HandleFunc("/api/login", auth.LoginHandler)`
   - Envolver router con `auth.JWTMiddleware(router)`
   - Logs mejorados mostrando todos los endpoints

**Endpoints disponibles:**

| Endpoint | Metodo | Autenticacion | Descripcion |
|----------|--------|---------------|-------------|
| `/health` | GET | NO | Health check |
| `/api/login` | POST | NO | Autenticacion, retorna JWT |
| `/api/process-invoice` | POST | SI (Bearer JWT) | Procesa factura OCR |

**Tests realizados:**

```bash
# Login exitoso
curl -X POST http://localhost:8081/api/login \
  -H 'Content-Type: application/json' \
  -d '{"empresa_alias":"huyghu","email":"asier@gestoria.com","password":"test123"}'
# Respuesta: {"token":"eyJhbG...","user_id":"5431e3ab-...","rol":"admin",...}

# Login fallido (password incorrecto)
curl -X POST http://localhost:8081/api/login \
  -d '{"empresa_alias":"huyghu","email":"asier@gestoria.com","password":"wrong"}'
# Respuesta: {"error":"invalid credentials"}

# Endpoint protegido sin JWT
curl http://localhost:8081/api/process-invoice
# Respuesta: {"error":"missing authorization header"}

# Endpoint protegido con JWT
curl -X POST http://localhost:8081/api/process-invoice \
  -H "Authorization: Bearer eyJhbG..."
# Respuesta: {"error":"File too large or invalid form data"}  (esperado, no enviamos archivo)
```

**Contenedor actualizado:**
```bash
docker run -d \
  --name facturaia-ocr \
  --network coolify \
  -p 8081:8080 \
  -e PORT=8080 \
  -e GEMINI_API_KEY=*** \
  -e DATABASE_URL='postgresql://gestoria_admin:***@pgbouncer:6432/gestoria_central' \
  -e JWT_SECRET='fxN8sKzY3vJmQp2wT7hR9dL4cA6bE0gU' \
  facturaia-ocr:jwt-test
```

**Estado del contenedor:**
- Nombre: `facturaia-ocr`
- Imagen: `facturaia-ocr:jwt-test`
- Status: **Up (healthy)**
- Red: `coolify`
- Puerto: `8081->8080`

**Logs del contenedor:**
```
2026/01/07 23:08:12 JWT authentication initialized
2026/01/07 23:08:12 Database connection pool initialized successfully
2026/01/07 23:08:12 Starting Invoice OCR Service on 0.0.0.0:8080
2026/01/07 23:08:12 OCR Engine: tesseract
2026/01/07 23:08:12 Default AI Provider: gemini
2026/01/07 23:08:12 Endpoints:
2026/01/07 23:08:12   POST http://0.0.0.0:8080/api/login           - Authenticate
2026/01/07 23:08:12   POST http://0.0.0.0:8080/api/process-invoice - Process invoice (requires JWT)
2026/01/07 23:08:12   GET  http://0.0.0.0:8080/health              - Health check
```

**Variables de entorno requeridas:**
```bash
JWT_SECRET=<32+ caracteres secretos>      # Para firmar JWTs
DATABASE_URL=postgresql://...@pgbouncer:6432/gestoria_central
GEMINI_API_KEY=<api key>                  # Para AI extraction
PORT=8080                                 # Puerto interno
```

**PROXIMO PASO:**
- Task 15: Integrar storage + DB en handler de process-invoice
- Guardar imagen en MinIO y factura en PostgreSQL automaticamente

---

### 07-Ene-2025 (Noche) - infra-agent (Opus 4.5) - TASK 16: DEPLOYMENT FINAL BACKEND
**Estado**: COMPLETADO

**Objetivo**: Rebuild Docker y deployment final del backend con todas las integraciones.

**Acciones ejecutadas:**

1. **Go mod tidy + build:**
   ```bash
   cd ~/factory/apps/facturaia-ocr
   go mod tidy
   go build -o bin/server ./cmd/server
   # Resultado: bin/server (31.5MB)
   ```

2. **Docker image construida:**
   ```bash
   docker build --no-cache -t facturaia-ocr:v2.0 .
   docker tag facturaia-ocr:v2.0 facturaia-ocr:latest
   ```
   - Tiempo de compilacion: ~50s
   - Tesseract 5.5.1 + ImageMagick 7.1.2.8 incluidos

3. **Contenedor recreado con todas las variables:**
   ```bash
   docker run -d \
     --name facturaia-ocr \
     --network coolify \
     --restart unless-stopped \
     -p 8081:8080 \
     -e DATABASE_URL='postgresql://gestoria_admin:***@pgbouncer:6432/gestoria_central' \
     -e MINIO_ENDPOINT='minio:9000' \
     -e MINIO_ACCESS_KEY='facturaia-backend' \
     -e MINIO_SECRET_KEY='***' \
     -e MINIO_BUCKET='facturas' \
     -e MINIO_USE_SSL='false' \
     -e JWT_SECRET='fxN8sKzY3vJmQp2wT7hR9dL4cA6bE0gU' \
     -e GEMINI_API_KEY='***' \
     -e PORT='8080' \
     facturaia-ocr:latest
   ```

**Verificaciones realizadas:**

| Test | Resultado |
|------|-----------|
| Container status | Up (healthy) |
| Health check | OK - tesseract 5.5.1, imagemagick, gemini |
| JWT init | OK - "JWT authentication initialized" |
| DB connection | OK - "Database connection pool initialized" |
| Login exitoso | OK - JWT retornado con user_id, email, rol |
| Login fallido | OK - 401 "invalid credentials" |

**Health endpoint response:**
```json
{
  "status": "healthy",
  "tesseract": {"available": true, "version": "5.5.1"},
  "imageMagick": {"available": true},
  "ai": {"defaultProvider": "gemini", "ocrEngine": "tesseract"}
}
```

**Login test exitoso:**
```bash
curl -X POST http://localhost:8081/api/login \
  -H 'Content-Type: application/json' \
  -d '{"empresa_alias":"huyghu","email":"asier@gestoria.com","password":"test123"}'
# Respuesta: token JWT + datos usuario
```

**Credenciales actualizadas:**
- `~/credentials/facturaia-backend.env` - Agregado JWT_SECRET y docker run reference

**NOTA**: El endpoint `/api/invoices` retorna 404 porque Task 15 (integrar handler con DB/Storage) esta pendiente. El sistema de autenticacion funciona correctamente.

---

### 07-Ene-2025 (Noche) - backend-agent (Opus 4.5) - TASK 15: INTEGRACION POSTGRESQL + MINIO EN HANDLER
**Estado**: COMPLETADO

**Objetivo**: Modificar el handler ProcessInvoice para integrar almacenamiento de imagenes en MinIO y guardado de facturas en PostgreSQL multi-tenant.

**Archivos modificados:**

1. **`api/handler.go`** - Handler completamente reescrito (v2.0.0)
   - ProcessInvoice ahora:
     - Extrae empresa_alias y user_id del JWT
     - Sube imagen a MinIO con estructura multi-tenant
     - Procesa OCR con Tesseract + IA (Gemini)
     - Guarda factura en PostgreSQL (schema de la empresa)
     - Retorna factura completa con ID y created_at
   - Nuevo endpoint GetInvoices:
     - Lista facturas de la empresa del usuario
     - Genera URLs presignadas para imagenes (24h)
   - Health check mejorado:
     - Muestra estado de Database (PostgreSQL via PgBouncer)
     - Muestra estado de Storage (MinIO S3)

2. **`cmd/server/main.go`** - Inicializacion mejorada
   - Agregado `storage.Init()` para cliente MinIO
   - Logs mejorados mostrando estado de DB y Storage
   - Nuevo endpoint registrado: GET /api/invoices

**Compilacion y deployment:**
```bash
cd ~/factory/apps/facturaia-ocr
go mod tidy
go build -o bin/server ./cmd/server
docker build -t facturaia-ocr:latest .
docker run -d --name facturaia-ocr --network coolify \
  -p 8081:8080 \
  -e DATABASE_URL='postgresql://...@pgbouncer:6432/gestoria_central' \
  -e MINIO_ENDPOINT='minio:9000' \
  -e MINIO_ACCESS_KEY='facturaia-backend' \
  -e MINIO_SECRET_KEY='***' \
  -e MINIO_BUCKET='facturas' \
  -e JWT_SECRET='***' \
  -e GEMINI_API_KEY='***' \
  facturaia-ocr:latest
```

**Verificaciones realizadas:**

| Test | Resultado |
|------|-----------|
| Health check | OK - Database: true, Storage: true |
| Login | OK - JWT generado correctamente |
| Process invoice | OK - Imagen subida a MinIO + Factura guardada en DB |
| Get invoices | OK - Lista facturas con URLs presignadas |

**Health endpoint response (v2.0.0):**
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "database": {"available": true, "version": "PostgreSQL via PgBouncer"},
  "storage": {"available": true, "version": "MinIO S3"},
  "tesseract": {"available": true, "version": "tesseract 5.5.1"}
}
```

**Test completo del flujo:**

1. Login:
```bash
curl -X POST http://localhost:8081/api/login \
  -H 'Content-Type: application/json' \
  -d '{"empresa_alias":"huyghu","email":"asier@gestoria.com","password":"test123"}'
# Respuesta: JWT + datos usuario
```

2. Process invoice:
```bash
curl -X POST http://localhost:8081/api/process-invoice \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test_invoice.jpg"
# Respuesta: {saved_to_db: true, invoice: {id: "...", image_url: "facturas/huyghu/..."}}
```

3. Get invoices:
```bash
curl http://localhost:8081/api/invoices \
  -H "Authorization: Bearer $TOKEN"
# Respuesta: {count: 1, invoices: [...], empresa_alias: "huyghu"}
```

**Datos guardados:**
- MinIO: `facturas/huyghu/2026/01/20260107_233832_41dfa1c5.jpg` (16KB)
- PostgreSQL: `emp_huyghu.facturas` - ID `b7c0c7ac-146a-4273-9d27-437783dbc62d`

**Endpoints disponibles (v2.0.0):**
| Endpoint | Metodo | Auth | Descripcion |
|----------|--------|------|-------------|
| /health | GET | NO | Health check con DB y Storage status |
| /api/login | POST | NO | Autenticacion, retorna JWT |
| /api/process-invoice | POST | JWT | Procesa factura, guarda en DB y MinIO |
| /api/invoices | GET | JWT | Lista facturas de la empresa |

**FASE 3 - Backend Go: COMPLETADA**
- [x] Task 10: Diagnosticar y reparar facturaia-ocr
- [x] Task 11: Ubicar codigo fuente backend Go
- [x] Task 12: Agregar cliente PostgreSQL
- [x] Task 13: Agregar cliente MinIO
- [x] Task 14: Agregar middleware JWT
- [x] Task 15: Integrar PostgreSQL + MinIO en handler
- [x] Task 16: Rebuild Docker y deployment final

**PROXIMO PASO:**
- FASE 4: App Movil - Actualizar React Native para usar nuevo backend multi-tenant

---

### 07-Ene-2025 (Noche) - mobile-agent (Opus 4.5) - TASK 19: InvoiceListScreen ACTUALIZADO
**Estado**: COMPLETADO

**Objetivo**: Modificar InvoiceListScreen para cargar facturas desde el backend multi-tenant en lugar de Supabase.

**Archivos modificados:**

1. **`src/types/invoice.ts`** - Tipos agregados
   - `Invoice` - Tipo para facturas del backend multi-tenant
   - `UserData` - Datos del usuario desde JWT claims
   - `LoginRequest` - Request para login al backend
   - `LoginResponse` - Response del login con JWT
   - `STORAGE_KEYS` - Constantes para AsyncStorage

2. **`src/services/api.ts`** - Funciones agregadas
   - `login(empresaAlias, email, password)` - Autenticacion contra backend
   - `logout()` - Limpia credenciales de AsyncStorage
   - `getUserData()` - Obtiene datos del usuario logueado
   - `isAuthenticated()` - Verifica si hay token valido
   - `getToken()` - Obtiene JWT token
   - `getInvoices(limit)` - Lista facturas de la empresa
   - `getInvoice(id)` - Obtiene factura individual
   - Interceptor de request que agrega JWT automaticamente
   - Manejo de SESSION_EXPIRED para redireccionar a login

3. **`src/screens/InvoiceListScreen.tsx`** - Reescrito completamente
   - Carga facturas desde `getInvoices()` API en lugar de Supabase
   - Header muestra nombre de empresa del usuario logueado
   - Pull-to-refresh implementado con RefreshControl
   - Estados manejados: loading, empty, error
   - Filtros por estado: Todas, Pendientes, Procesadas, Pagadas
   - Cards muestran campos del backend: NCF, RNC, fecha, subtotal, ITBIS, total
   - Colores por estado: pendiente (naranja), procesada (azul), pagada (verde), anulada (rojo)
   - Sesion expirada redirige automaticamente a Login
   - FAB para escanear nueva factura

**Cambios visuales:**
- Header con nombre de empresa y email del usuario
- Chips de filtro con contadores
- Cards con informacion fiscal (RNC, NCF)
- Seccion de totales con Subtotal, ITBIS, Total
- Estados de carga, error y vacio con iconos

**Dependencias utilizadas:**
- `@react-native-async-storage/async-storage` - Ya existente
- `axios` - Ya existente
- `react-native-paper` - Ya existente

**Flujo de datos:**
1. InvoiceListScreen llama `getUserData()` y `getInvoices()`
2. api.ts agrega JWT automaticamente al header
3. Backend valida JWT y retorna facturas de la empresa
4. Si SESSION_EXPIRED, redirige a Login

**Verificacion:**
- TypeScript compila sin errores de sintaxis
- Integracion con api.ts confirmada
- Manejo de errores implementado

**NOTA**: El LoginScreen necesita actualizarse para usar la nueva funcion `login()` del api.ts en lugar de Supabase Auth.

---

### 07-Ene-2025 (Noche) - mobile-agent (Opus 4.5) - TASK 18: API SERVICE CON JWT HEADERS
**Estado**: COMPLETADO

**Objetivo**: Actualizar servicio API para incluir JWT token en todas las requests autenticadas.

**Archivo modificado:**
- `C:\FacturaIA\FacturaScannerApp_Clean\src\services\api.ts`

**Cambios realizados:**

1. **Configuracion base:**
   - URL backend: `http://217.216.48.91:8081`
   - Timeout: 60 segundos para OCR processing
   - Content-Type: application/json por defecto

2. **Interceptor de request con JWT:**
   - Agrega automaticamente `Authorization: Bearer {token}` a rutas protegidas
   - Excluye `/api/login` y `/health` de autenticacion
   - Lee token de AsyncStorage con key `jwt_token`

3. **Funcion login actualizada:**
   ```typescript
   export const login = async (
     empresaAlias: string,
     email: string,
     password: string,
   ): Promise<LoginResponse>
   ```
   - Acepta 3 parametros separados (empresa_alias, email, password)
   - Guarda JWT token en AsyncStorage
   - Guarda datos de usuario en AsyncStorage
   - Retorna LoginResponse con token y datos completos

4. **Funciones de autenticacion:**
   - `logout()` - Limpia jwt_token y user_data de AsyncStorage
   - `isAuthenticated()` - Verifica si existe token
   - `getUserData()` - Retorna UserData parseado o null
   - `getToken()` - Retorna JWT token o null

5. **Funciones de facturas:**
   - `getInvoices(limit)` - Lista facturas de la empresa
   - `getInvoice(invoiceId)` - Obtiene factura individual
   - Ambas manejan SESSION_EXPIRED (401) limpiando storage

6. **Manejo de errores 401:**
   - Interceptor detecta respuestas 401
   - Limpia AsyncStorage automaticamente
   - Lanza Error con message 'SESSION_EXPIRED'
   - App puede capturar y redirigir a Login

7. **processInvoice con JWT:**
   - Usa interceptor de axios para inyectar Authorization header
   - FormData con archivo de imagen
   - Opciones: aiProvider, useVisionModel, language, model

**Tipos utilizados (de invoice.ts):**
- `Invoice` - Factura del backend multi-tenant
- `UserData` - Datos del usuario logueado
- `LoginResponse` - Respuesta de login
- `STORAGE_KEYS` - Constantes 'jwt_token' y 'user_data'

**Verificacion:**
- TypeScript compila sin errores: `npx tsc --noEmit`
- Todas las funciones exportadas correctamente
- Interceptor funciona con axios

**Funciones disponibles:**
| Funcion | Descripcion |
|---------|-------------|
| `login(alias, email, pass)` | Autenticacion, guarda JWT |
| `logout()` | Limpia storage |
| `isAuthenticated()` | Verifica token existe |
| `getUserData()` | Retorna UserData o null |
| `getToken()` | Retorna JWT o null |
| `processInvoice(uri, opts)` | Procesa factura con OCR |
| `getInvoices(limit)` | Lista facturas empresa |
| `getInvoice(id)` | Obtiene factura por ID |

**PROXIMO PASO:**
- Task 17: Actualizar LoginScreen para usar `login()` de api.ts

---


### 07-Ene-2025 - Claude Code (Opus 4.5) - TASK 17: LoginScreen Multi-Tenant
**Estado**: COMPLETADO
**Agente**: mobile-agent

**Archivos Modificados:**
1. `src/types/invoice.ts` - Agregados tipos para autenticacion multi-tenant:
   - `UserData` - Datos del usuario almacenados en AsyncStorage
   - `LoginRequest` - Request para endpoint /api/login
   - `LoginResponse` - Response con token JWT y datos de usuario
   - `STORAGE_KEYS` - Constantes para keys de AsyncStorage

2. `src/services/api.ts` - Ya tenia las funciones de auth implementadas:
   - `login(empresaAlias, email, password)` - Autentica y guarda JWT
   - `logout()` - Limpia credenciales de AsyncStorage
   - `getUserData()` - Obtiene datos del usuario actual
   - `isAuthenticated()` - Verifica si hay token valido
   - `getToken()` - Obtiene token JWT
   - `getInvoices(limit)` - Lista facturas de la empresa

3. `src/screens/LoginScreen.tsx` - Reescrito completamente:
   - Campo "Empresa" (alias) agregado con validacion
   - Campo "Email" con icono y validacion
   - Campo "Contrasena" con toggle de visibilidad
   - Valor por defecto empresa: "huyghu" (pruebas)
   - Llama a login() con 3 argumentos separados
   - Navega a InvoiceList con empresa_alias como groupId
   - UI en espanol con textos apropiados
   - Iconos de Material Design (domain, email, lock)

**Endpoint Backend:**
- `POST /api/login`
- Request: `{empresa_alias, email, password}`
- Response: `{token, user_id, email, nombre, rol, empresa_alias, empresa_nombre}`

**Verificacion:**
- TypeScript compila sin errores
- Imports correctos desde api.ts
- Tipos coinciden con backend Go

**Credenciales de Prueba:**
- Empresa: huyghu
- Email: asier@gestoria.com
- Password: test123

---

---

### 08-Ene-2026 - EXPORT-AGENT - Exportacion Supabase HUYGHUSRL
**Estado**: Completado

**Objetivo**: Exportar datos de produccion desde Supabase HUYGHUSRL para migracion

**Credenciales utilizadas**:
- URL: https://ovabkfsuvqkgdqwzmxiv.supabase.co
- Credenciales obtenidas de: `/home/gestoria/factory/credentials/gestoriard-coolify.env`

**Tablas exportadas**:

| Tabla | Registros | Tamano |
|-------|-----------|--------|
| clientes | 314 | 103 KB |
| contadores | 14 | 3.3 KB |
| tareas_fiscales | 34,261 | 25 MB |
| casos_dgi | 36 | 34 KB |
| inbox_ia | 1,929 | 4.4 MB |
| dgii_consultas_index | 3,093 | 12 MB |
| catalogo_obligaciones | 32 | 15 KB |
| dgii_documents | 7 | 3.3 KB |
| **TOTAL** | **39,686** | **40.16 MB** |

**Tablas vacias (no exportadas)**:
- obligaciones_criticas (0)
- processing_jobs (0)
- trabajos_fiscales (0)
- contactos_clientes (0)
- facturas (0)

**Archivos creados**:
- `C:\FacturaIA\exports_supabase_huyghusrl\clientes.json`
- `C:\FacturaIA\exports_supabase_huyghusrl\contadores.json`
- `C:\FacturaIA\exports_supabase_huyghusrl\tareas_fiscales.json`
- `C:\FacturaIA\exports_supabase_huyghusrl\casos_dgi.json`
- `C:\FacturaIA\exports_supabase_huyghusrl\inbox_ia.json`
- `C:\FacturaIA\exports_supabase_huyghusrl\dgii_consultas_index.json`
- `C:\FacturaIA\exports_supabase_huyghusrl\catalogo_obligaciones.json`
- `C:\FacturaIA\exports_supabase_huyghusrl\dgii_documents.json`

**Metodo de exportacion**:
- API REST de Supabase con service_role key
- Paginacion de 1000 registros (limite de Supabase)
- Archivos JSON combinados para tablas grandes

**Proximos pasos**:
- Crear scripts de importacion para PostgreSQL Contabo
- Validar integridad de datos exportados
- Ejecutar migracion a esquema multi-tenant

---

### 09-Ene-2026 - Claude Code (Opus 4.5) - FASE 7 COMPLETADA: Migracion Frontend
**Estado**: Completado

**Objetivo**: Migrar componentes frontend de Supabase a API v2 PostgreSQL

**Endpoints API v2 creados**:
1. `/api/v2/crm/pagos` - CRUD pagos clientes
2. `/api/v2/crm/incidencias` - CRUD incidencias (GET/POST/PUT)
3. `/api/v2/crm/grupos` - CRUD grupos empresariales
4. `/api/v2/obligaciones` - CRUD obligaciones fiscales
5. `/api/v2/obligaciones/tipos` - GET tipos de obligacion config

**Archivos creados**:
- `app/api/v2/crm/pagos/route.ts`
- `app/api/v2/crm/incidencias/route.ts`
- `app/api/v2/crm/grupos/route.ts`
- `app/api/v2/obligaciones/route.ts`
- `app/api/v2/obligaciones/tipos/route.ts`

**Archivos actualizados**:
- `lib/api-v2-client.ts` - Agregados pagosApi, incidenciasApi, gruposApi, obligacionesApi
- `app/components/CRM/hooks/useCRMData.ts` - MIGRADO de Supabase a API v2
- Type mappings entre tipos API y tipos CRM locales

**Componentes con compatibilidad dual** (Supabase + API v2):
- `ObligacionesCliente.tsx`
- `FormularioNuevoCaso.tsx`

**Componentes ya migrados** (pre-existente):
- `TaskManagerDashboard.tsx` - Ya usaba API v2

**Build TypeScript**: `npx tsc --noEmit` -> 0 errores

**Trabajo paralelo**: Se lanzaron 3 agentes via Task tool para migracion simultanea

---

### 09-Ene-2026 - Claude Code (Opus 4.5) - FASE 8 COMPLETADA: Deploy Contabo
**Estado**: Completado

**Objetivo**: Completar migracion frontend y deploy a produccion

**Agentes paralelos lanzados**:
1. Migrar FormularioNuevoCaso.tsx a API v2
2. Migrar ObligacionesCliente.tsx a API v2

**Archivos migrados**:
- `FormularioNuevoCaso.tsx` - Usa casosDgiApi, clientesApi, contadoresApi
- `ObligacionesCliente.tsx` - Usa obligacionesApi (list, create, getTipos)

**Fix de tipos aplicado**:
- `estadoMapeado` tipado como union literal para compatibilidad con CasoDGI

**Git commit**:
```
362ed0a feat(api-v2): Complete frontend migration from Supabase to PostgreSQL API v2
40 files changed, 7782 insertions(+), 658 deletions(-)
```

**Deployment**:
- Push a GitHub -> Webhook Coolify -> Auto-deploy en Contabo
- Servidor desarrollo local: http://localhost:3000

**Estado final**:
- Build TypeScript: 0 errores
- 8 FASES de migracion COMPLETADAS

---

### 09-Ene-2026 - Claude Code (Opus 4.5) - FASE 9: Importación Datos (EN PROGRESO)
**Estado**: Bloqueado - Permisos Docker

**Objetivo**: Importar datos de Supabase (huyghu) a PostgreSQL Contabo

**Trabajo realizado**:
1. Verificados exports existentes en `C:\FacturaIA\exports_supabase_huyghusrl\`
   - 314 clientes, 14 contadores, 34,261 tareas, 36 casos DGI, 1,929 inbox
2. Creado script de importación: `scripts/import-server.js`
3. Subidos exports al servidor: `~/imports/exports_supabase_huyghusrl/`
4. Instalado módulo pg en servidor: `npm install pg`

**Bloqueador encontrado**:
- PgBouncer está en red Docker interna (172.20.1.10:5432)
- No hay puerto expuesto al host
- Contenedor gestoriard-v2 no permite crear directorios

**Soluciones propuestas**:
1. Opción A: Exponer temporalmente PgBouncer (port 6432:5432)
2. Opción B: Usar psql directo en contenedor gestoria-db con COPY
3. Opción C: docker run con --network coolify y volumen montado

**Archivos creados**:
- `c:\gestion-contadoresrd\scripts\import-server.js`
- `c:\gestion-contadoresrd\scripts\import-supabase-to-postgres.js`
- Servidor: `~/imports/import-server.js`

**Próximos pasos**:
1. Elegir solución para acceder a PostgreSQL
2. Ejecutar importación
3. Verificar datos en la app

---

### 09-Ene-2026 - Claude Code (Opus 4.5) - Documentación Arquitectura OCR-n8n
**Estado**: Completado

**Objetivo**: Documentar arquitectura completa de OCR con Gemini + n8n para DGII

**Origen**: Conversación con Gemini sobre costos y arquitectura óptima

**Documentación agregada a task.md**:
- FASE 10: Arquitectura OCR-n8n para DGII
- Diagrama de flujo completo (7 pasos)
- Estructura JSON para OCR Gemini
- Costos estimados por modelo ($0.30-$20 por 1,000 facturas)
- Workflow n8n (8 nodos)
- SQL para campos adicionales DGII
- Lista de tareas de implementación (10.1-10.7)

**Puntos clave de la arquitectura**:
1. App toma foto → Envía a webhook n8n
2. n8n envía a Gemini API → Recibe JSON estructurado
3. Validación: NCF (11-13 chars), Total > 0, Fecha
4. Detección duplicados: NCF + RNC_emisor único
5. Clasificación automática: RNC_emisor == RNC_cliente ? VENTA : COMPRA
6. Guardar en PostgreSQL con campos DGII
7. Generación automática de 606/607/IT-1

**Modelo recomendado**: Gemini 2.5 Flash (~$0.50 por 1,000 facturas)

**Informe ejecutivo creado**: `docs/INFORME-EJECUTIVO-ENERO-2026.md`
- Datos reales: 314 clientes, 34,261 tareas, 27 endpoints API
- Ahorro mensual: $7,750 USD vs Supabase

---

### 12-Ene-2026 - mobile-agent (Opus 4.5) - FASE 1 y 2: Vision Camera + CameraScreen
**Estado**: ✅ COMPLETADO

**Objetivo**: Migrar de react-native-document-scanner-plugin a react-native-vision-camera

**Fase 1 - Dependencias (COMPLETADA)**:
```bash
# Desinstalado
npm uninstall react-native-document-scanner-plugin

# Instalados
npm install react-native-vision-camera@4.7.3
npm install react-native-worklets-core@1.6.2
npm install vision-camera-ocr@1.0.0
npm install react-native-image-crop-picker@0.51.1

# Configuración
babel.config.js: plugins react-native-reanimated/plugin + worklets-core/plugin
minSdkVersion: 24 (ya configurado)
npx expo prebuild --clean
```

**Fase 2 - Nuevo CameraScreen.tsx (COMPLETADA)**:
- Ubicación: `FacturaScannerApp_Clean/src/screens/CameraScreen.tsx`
- **Características implementadas**:
  1. react-native-vision-camera para captura de alta calidad
  2. Tres modos: Normal | Factura Larga | Galería
  3. Controles: Flash on/off, Zoom (1x, 1.5x, 2x)
  4. Preview con scroll/zoom antes de procesar
  5. Integración Gemini Vision API (gemini-2.5-flash)
  6. Modo factura larga: captura TOP + BOTTOM
  7. Selector de galería con react-native-image-crop-picker
  8. UI colores World Class v3.0 (#22D3EE cyan, #0F172A slate)
  9. Feedback háptico (vibración)
  10. Guardado en Supabase con campos NCF, RNC, ITBIS

**Patrones NCF/RNC definidos**:
```javascript
const NCF_PATTERN = /[BE]\d{2}\d{8,11}/;  // B01, E31, etc.
const RNC_PATTERN = /\d{9}|\d{11}/;        // 9 o 11 dígitos
```

**Próximos pasos**:
- Fase 6: Testing + EAS Build producción

---

### 12-Ene-2026 - ml-agent (Opus 4.5) - FASE 3: ML Kit OCR Tiempo Real
**Estado**: ✅ COMPLETADO

**Cambios en CameraScreen.tsx**:
1. Import de `scanOCR` de `vision-camera-ocr`
2. Import de `useFrameProcessor` de vision-camera
3. Import de `useRunOnJS` de react-native-worklets-core
4. Frame processor que escanea cada frame buscando NCF/RNC
5. Handler `handleOCRResult` con throttling 500ms
6. Overlay verde cuando detecta documento válido
7. Vibración háptica al detectar NCF
8. Toggle AUTO/MANUAL para auto-captura
9. Estilos: detectionBadgeCamera, autoCaptureBtn, topControlsRight

**Patrones regex**:
```javascript
const NCF_PATTERN = /[BE]\d{2}\d{8,11}/;  // B01xxxxxxxxxx, E31xxxxxxxxxx
const RNC_PATTERN = /\d{9}|\d{11}/;        // 9 o 11 dígitos
```

---

### 12-Ene-2026 - mobile-agent (Opus 4.5) - FASE 4 y 5: Long Mode + Optimización
**Estado**: ✅ COMPLETADO

**Fase 4 - Modo Factura Larga**:
- Selector de modo: Normal | Larga | Galería
- Captura TOP con guía visual (línea cyan)
- Captura BOTTOM con guía visual (línea verde)
- Thumbnail preview de imagen superior
- Estructura para combinar imágenes (backend)

**Fase 5 - Optimización Pre-Gemini**:
- Galería: compressImageQuality=0.85, maxWidth/Height=2048
- Backend Go: ImageMagick 7 pasos de preprocesamiento
- Gemini Vision maneja imágenes de alta resolución

---

### RESUMEN FASES 1-5 COMPLETADAS

| Fase | Descripción | Estado |
|------|-------------|--------|
| 1 | Dependencias vision-camera | ✅ |
| 2 | Nuevo CameraScreen.tsx | ✅ |
| 3 | ML Kit OCR tiempo real | ✅ |
| 4 | Modo factura larga | ✅ |
| 5 | Optimización pre-Gemini | ✅ |
| 6 | Testing + Deploy | ⏳ Pendiente |

**Archivo modificado**: `FacturaScannerApp_Clean/src/screens/CameraScreen.tsx` (850+ líneas)

**Funcionalidades implementadas**:
1. react-native-vision-camera para captura HD
2. Detección NCF/RNC en tiempo real con ML Kit
3. Tres modos de captura: Normal, Larga, Galería
4. Controles: Flash, Zoom (1x, 1.5x, 2x)
5. Auto-captura opcional cuando detecta documento
6. Preview con scroll/zoom antes de procesar
7. Integración Gemini 2.5 Flash Vision API
8. Guardado en Supabase con campos DGII
9. UI colores World Class v3.0
10. Feedback háptico

**Próximo paso**: Fase 6 - Testing en dispositivo real + EAS Build

---

### 13-Ene-2026 - qa-agent (Opus 4.5) - FASE 6: EAS Build Iniciado
**Estado**: EN PROGRESO

**Build ID**: `616a07c1-d611-4f08-97a9-dedeb3f94306`
**URL**: https://expo.dev/accounts/facturia/projects/facturascannerapp/builds/616a07c1-d611-4f08-97a9-dedeb3f94306

**Token EXPO**: Encontrado en `~/.bashrc`
**Cuenta**: facturia

**Estado Build**: IN_QUEUE (Free tier)


## 2026-01-13 - Migración a Document Scanner EXITOSA

### Problema
- vision-camera-ocr incompatible con vision-camera v4
- 4 builds de EAS fallaron consecutivamente
- Cada build tarda ~2 horas en Free tier

### Solución
1. Migrar a `react-native-document-scanner-plugin`
2. Validar con build local ANTES de EAS
3. Android SDK instalado en servidor Contabo

### Resultado
- Build local exitoso: app-debug.apk (147 MB)
- EAS build: 9e18b69c-08dd-45d4-80a6-4575a1a0f134

### Archivos modificados
- app.json (nuevo plugin)
- src/screens/CameraScreen.tsx (DocumentScanner)
- package.json (dependencias)

## 2026-01-13 - METODOLOGÍA DE TRABAJO ESTABLECIDA

### Problema Anterior
- EAS Build Free tier tarda ~2 horas por build
- 4 builds fallaron = 8 horas perdidas
- Sin forma de validar antes de subir

### Nueva Metodología (USAR SIEMPRE)
```
1. Código → Servidor Contabo
2. Build local: ./gradlew assembleRelease (~3-5 min)
3. Descargar APK: scp → WhatsApp/Drive → Teléfono
4. Probar en dispositivo real
5. Si OK → EAS Build para producción
6. Si falla → Iterar en servidor (no EAS)
```

### Infraestructura Servidor
```bash
SSH: ssh -p 2024 gestoria@217.216.48.91
Proyecto: ~/eas-builds/FacturaScannerApp
Android SDK: /home/gestoria/Android/Sdk
Build: cd android && ./gradlew assembleRelease
APK: android/app/build/outputs/apk/release/app-release.apk
```

### Ventajas
- Build local: 3-5 min vs EAS: 2 horas
- Iteración rápida sin costo
- Validación real antes de producción

## 27-Ene-2026 14:41 - Backend v2.4.7 desplegado

### Problema resuelto
- Gemini devolvía números como strings con comas: `"3,965.34"`
- El parser `json.Number` no podía manejar estos formatos
- Los montos llegaban como 0 a la app

### Solución
- Cambié campos numéricos en struct de `json.Number` a `interface{}`
- Actualicé `parseDecimal()` para manejar:
  - float64, int, int64
  - strings (limpia comas antes de parsear)
  - json.Number
- Deploy v2.4.7 exitoso

### Estado actual
- Gemini 2.5 Flash con modo visión por defecto
- Respuesta incluye TODOS los campos DGII
- Prompt estricto para NO inventar datos emisor/receptor
