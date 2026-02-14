# Plan Test Sync
**ID:** plan-test-sync
**Fecha:** 2026-02-14
**Proyecto:** FacturaIA
**Tipo:** PRUEBA DE SYNC

## Objetivo
Verificar que el ciclo completo funciona:
Desktop push → GitHub → VPS pull → VPS push → GitHub → Desktop pull

## Tareas
1. [CLAUDE:agente] CLI debe leer este archivo y crear plans/results/test-sync-result.md
2. El resultado debe contener: "SYNC OK" + fecha + hora

## Output esperado
- plans/results/test-sync-result.md con confirmacion
