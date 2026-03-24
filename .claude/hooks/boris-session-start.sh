#!/bin/bash
# Boris v6.2.1 - SessionStart [command]
# Evento: SessionStart (startup, resume, clear, compact)
# Tipo: command (rapido, deterministico)
# Funcion: Re-inyecta estado + BOOTSTRAP que fuerza lectura del skill

PROJECT_DIR=$(pwd)
PROJECT_NAME=$(basename "$PROJECT_DIR")

# ============================================================
# BOOTSTRAP BORIS — igual que Superpowers (CAPA B)
# Esto es lo que FUERZA al agente a leer el skill boris-workflow
# ============================================================
echo ""
echo "<EXTREMELY_IMPORTANT>"
echo "You are running Boris v6.2.1 workflow."
echo "BEFORE doing ANY work, invoke the boris-workflow skill."
echo "Use the Skill tool to load: boris-workflow"
echo "IF YOU SKIP THIS, your commits WILL be blocked by hooks."
echo "This is not optional. This is not negotiable."
echo "</EXTREMELY_IMPORTANT>"
echo ""

echo "================================================================"
echo "  ╔══════════════════════════════╗"
echo "  ║   BORIS v6.2.1 ACTIVO       ║"
echo "  ║   $(date '+%Y-%m-%d %H:%M')              ║"
echo "  ╚══════════════════════════════╝"
echo "  Proyecto: $PROJECT_NAME"
echo "================================================================"

# 1. SINCRONIZAR
git pull --rebase 2>/dev/null || echo "git pull fallo (sin remote o sin red)"

# 2. CREAR .brain/ si no existe con formato correcto
mkdir -p .brain
if [ ! -f ".brain/done-registry.md" ]; then
  cat > .brain/done-registry.md << 'REGISTRY'
# Done Registry

## Completado y verificado

| Fecha | Tarea | Verificacion | Commit |
|-------|-------|-------------|--------|

## Intentado pero fallido

| Fecha | Tarea | Por que fallo | Que se necesita |
|-------|-------|--------------|-----------------|
REGISTRY
fi
[ ! -f ".brain/task.md" ] && printf "# Task\n\nNo hay tarea activa.\n" > .brain/task.md
[ ! -f ".brain/session-state.md" ] && printf "# Session State\n\nNueva sesion.\n" > .brain/session-state.md
[ ! -f ".brain/history.md" ] && printf "# History\n\n" > .brain/history.md

# 3. TAREA PENDIENTE
if [ -f ".brain/task.md" ] && ! grep -q "No hay tarea activa" .brain/task.md 2>/dev/null; then
  echo ""
  echo "--- TAREA PENDIENTE ---"
  head -30 .brain/task.md
  echo "--- FIN TAREA ---"
fi

# 4. ESTADO DE SESION
if [ -f ".brain/session-state.md" ] && ! grep -q "Nueva sesion" .brain/session-state.md 2>/dev/null; then
  echo ""
  echo "--- ESTADO DE SESION ---"
  head -15 .brain/session-state.md
  echo "--- FIN ESTADO ---"
fi

# 5. DONE REGISTRY (ultimas completadas)
DONE_LINES=$(grep "^|" .brain/done-registry.md 2>/dev/null | grep -v "^| Fecha\|^| ---\|^|---" | tail -5)
if [ -n "$DONE_LINES" ]; then
  echo ""
  echo "--- ULTIMAS COMPLETADAS ---"
  echo "$DONE_LINES"
  echo "--- FIN COMPLETADAS ---"
fi

# 6. GIT STATUS
CHANGES=$(git status --porcelain 2>/dev/null | wc -l)
if [ "$CHANGES" -gt 0 ]; then
  echo ""
  echo "ATENCION: $CHANGES ARCHIVOS SIN COMMIT:"
  git status --short | head -10
fi

echo ""
echo "================================================================"
echo "  BORIS v6.2.1 — 3 CAPAS ACTIVAS"
echo "  [B] Bootstrap: skill forzado arriba"
echo "  [C] CLAUDE.md: protocolo siempre en contexto"
echo "  [A] Superpowers: skill obligatorio si aplica"
echo "================================================================"
