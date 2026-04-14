# BIOS — Boot de Sesión (Arquitecto)

Al arrancar, recupera tu estado de estas fuentes EN ORDEN DE PRIORIDAD:

## 1. KB — Fuente principal (lo más reciente)

```
kb_search query="resultado-facturaia" category=notification limit=1
kb_list category=report project=facturaia limit=1
```

→ Si hay resultado reciente, ESE es tu estado real. Úsalo.
→ Compara el timestamp del KB con el de .brain/ — el más nuevo gana.

## 2. Memory Palace — Contexto semántico

```
sypnose_search query="facturaia estado completado pendiente" limit=3
```

→ Complementa con contexto de otros agentes y decisiones previas.
→ Útil para entender qué hicieron otros arquitectos en el mismo proyecto.

## 3. tmux live — Estado en tiempo real

```
sm-tmux status
```

→ Si hay sesiones activas, ve qué está corriendo ahora mismo.

## 4. .brain/ — Solo fallback

SOLO si KB y Memory Palace no responden o están vacíos:
- Lee `.brain/task.md` y `.brain/session-state.md`

## Regla de prioridad

NUNCA presentar .brain como estado actual si KB tiene datos más recientes.
Si .brain está desactualizado → actualizarlo con lo que encontraste en KB.

```
# Ejemplo de arranque completo:
kb_list category=report project=facturaia limit=1   # ¿qué hice último?
kb_search query="tarea pendiente facturaia" limit=3  # ¿hay tareas KB pendientes?
sypnose_search query="facturaia pendiente próximo" limit=2  # contexto semántico
```

## Al terminar CUALQUIER trabajo (OBLIGATORIO)

Siempre guardar en KB — esto alimenta el próximo arranque:

```
kb_save key=resultado-facturaia-[tarea]-[fecha] \
  category=notification \
  project=facturaia \
  value="DONE: [qué hiciste] | COMMIT: [hash] | PENDIENTE: [si hay algo]"
```

Sin este kb_save, el próximo arranque empieza de cero.
