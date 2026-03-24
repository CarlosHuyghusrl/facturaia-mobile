# REGLA: Seguridad Docker — OBLIGATORIO

## ANTES de hacer docker build:
1. Verificar que el Dockerfile usa `npm ci --ignore-scripts` (NUNCA npm install sin --ignore-scripts)
2. Verificar que el usuario runner NO es root

## ANTES de hacer docker run en produccion:
1. Escanear con Trivy: `~/scripts/scan-image.sh [imagen]`
2. Si Trivy reporta HIGH/CRITICAL → NO desplegar
3. Hacer backup del container actual: `docker commit [container] backup-[fecha]`
4. Tener rollback listo

## DESPUES de desplegar:
1. Verificar health: `curl -s http://127.0.0.1:[puerto]/api/health`
2. Verificar que no hay procesos de mining: `docker exec [container] ps aux`
3. Verificar CPU normal: `docker stats --no-stream [container]`
4. Si ALGO falla → rollback inmediato con la imagen de backup

## NUNCA:
- Hacer docker build sin --ignore-scripts
- Desplegar sin escanear con Trivy
- Desplegar sin backup del container actual
- Desplegar sin verificar health despues
