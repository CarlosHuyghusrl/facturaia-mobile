#!/bin/bash
# auto-update-brain.sh - Actualiza task.md y history.md automáticamente
# Llamado por hooks de Claude-Flow al finalizar sesión

BRAIN_DIR="$HOME/eas-builds/FacturaScannerApp/.brain"
TASK_FILE="$BRAIN_DIR/task.md"
HISTORY_FILE="$BRAIN_DIR/history.md"
DATE=$(date +"%d-%b-%Y %H:%M")

# Crear directorio si no existe
mkdir -p "$BRAIN_DIR"

# Si task.md no existe, crearlo
if [ ! -f "$TASK_FILE" ]; then
    cat > "$TASK_FILE" << EOF
# Tasks - FacturaIA (Servidor)

**Última actualización**: $DATE
**Agente**: Claude-Flow

---

## Tareas Pendientes
- [ ] (ninguna registrada)

---

## Completadas Hoy
- (ninguna)
EOF
fi

# Guardar en memoria de Claude-Flow
cd ~/eas-builds/FacturaScannerApp
claude-flow memory store "facturaia:last-update" "Sesión finalizada: $DATE" 2>/dev/null

echo "Brain actualizado: $DATE"
