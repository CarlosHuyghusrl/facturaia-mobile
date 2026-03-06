# Proteccion de Rama — REGLA ABSOLUTA

## PROHIBIDO
- NUNCA ejecutar `git checkout` a otra rama
- NUNCA ejecutar `git switch`
- NUNCA ejecutar `git branch` para crear ramas nuevas
- NUNCA ejecutar `git push origin [otra-rama]`

## PERMITIDO
- Solo trabajar en rama `main`
- Solo push a `main`
- `git branch --show-current` para verificar (OBLIGATORIO antes de push)

## ENFORCEMENT
Hay hooks pre-commit y pre-push que BLOQUEAN operaciones en rama incorrecta.
Si ves "BLOQUEADO", NO intentes saltarte el hook. Vuelve a `main`.
