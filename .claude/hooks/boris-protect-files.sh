#!/bin/bash
# Boris v6.2.1 - PreToolUse [command] matcher: Edit|Write
# Proteger .env, secrets, credenciales
# Fix: 2>/dev/null || exit 0 en cada linea para evitar "hook error"

INPUT=$(cat 2>/dev/null) || exit 0

FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // empty' 2>/dev/null) || exit 0

# Si no hay archivo, salir limpio
[ -z "$FILE" ] && exit 0

BASENAME=$(basename "$FILE" 2>/dev/null) || exit 0

case "$BASENAME" in
  .env|.env.*|.env.local|.env.production)
    echo "BLOQUEADO: $BASENAME contiene secretos" >&2
    exit 2 ;;
  credentials*|*secret*|*private_key*|*.pem|*.key)
    echo "BLOQUEADO: archivo sensible $BASENAME" >&2
    exit 2 ;;
esac

exit 0
