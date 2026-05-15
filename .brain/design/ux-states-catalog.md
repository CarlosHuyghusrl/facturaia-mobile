# UX States Catalog — Estados completos por vista

**Skill aplicado**: `design-usability`
**Fecha**: 2026-05-14
**Cobertura**: 15 estados × 3 vistas (listado / ficha / revisión guiada)
**Patrón**: Cada estado = visual + copy + acción

---

## Matriz cobertura

| Estado | Listado | Ficha | Revisión Guiada |
|---|---|---|---|
| 1. Initial load (skeleton) | ✅ | ✅ | ✅ |
| 2. Empty (sin datos) | ✅ | n/a | ✅ |
| 3. Empty filtered (filtro 0 resultados) | ✅ | n/a | n/a |
| 4. Partial (algunos datos) | ✅ | ✅ | n/a |
| 5. Loading (fetch en curso) | ✅ | ✅ | ✅ |
| 6. Optimistic update | ✅ | ✅ | ✅ |
| 7. Success confirmation | ✅ | ✅ | ✅ |
| 8. Error (red/server) | ✅ | ✅ | ✅ |
| 9. Error (LLM down) | n/a | ✅ AI summary | ✅ AI sugerencia |
| 10. Multi-tenant mismatch (403) | ✅ | ✅ | ✅ |
| 11. Permission denied | ✅ | ✅ | ✅ |
| 12. Offline | ✅ | ✅ | ✅ |
| 13. Confirmation (destructive) | ✅ | ✅ | ✅ |
| 14. Undo window (5s toast) | ✅ | ✅ | ✅ |
| 15. Completion (all done) | ✅ | n/a | ✅ |

---

## 1. Initial Load — Skeleton screens

### Listado `/clientes/perfilado`
```
┌─────────────────────────────────────────────┐
│ Perfilado de Clientes                       │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░               │  ← subtitle skeleton
│                                              │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐            │  ← KPI cards
│ │ ▓▓▓ │ │ ▓▓▓ │ │ ▓▓▓ │ │ ▓▓▓ │            │     shimmer 1.5s loop
│ │ ░░░ │ │ ░░░ │ │ ░░░ │ │ ░░░ │            │
│ └─────┘ └─────┘ └─────┘ └─────┘            │
│                                              │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░       │  ← pills skeleton
│                                              │
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒       │  ← table rows
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒       │     (10 rows)
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒       │
└─────────────────────────────────────────────┘
```

**Animation**: shimmer `background-position` left→right 1.5s ease-in-out infinite. **Reduced motion**: solo fade in/out 0.5s.

**Copy**: ninguno mientras skeleton. Hidden text para SR: `<span class="sr-only">Cargando lista de clientes...</span>` + `aria-live="polite"` que avisa cuando complete.

### Ficha `/clientes/[id]`
Header + 3 cols skeleton + stage tracker placeholder.

### Revisión Guiada
Card cliente skeleton + decision grid 6 cells skeleton.

---

## 2. Empty (sin datos)

### Listado — 0 clientes en BD
```
┌─────────────────────────────────────────────┐
│                                              │
│                  📁                          │
│                                              │
│           No hay clientes aún                │
│   Importa tu cartera desde QuickBooks       │
│      o crea el primero manualmente           │
│                                              │
│      [ Importar de QB ]  [ + Nuevo ]        │
│                                              │
└─────────────────────────────────────────────┘
```

**Cuándo**: empresa recién registrada, BD vacía.
**Acción primaria**: Importar de QB (50% casos en GestoríaRD).

### Revisión Guiada — todos los 484 ya revisados
```
┌─────────────────────────────────────────────┐
│                                              │
│                  ✓                           │
│              Verde glow                      │
│                                              │
│           Todo revisado 🎉                   │
│                                              │
│   484 clientes clasificados                  │
│   23 reasignados · 7 dados de baja           │
│   Tiempo total: 3h 47min                     │
│                                              │
│   [ Volver al dashboard ]                    │
│   [ Ver resumen de cambios ]                 │
│                                              │
└─────────────────────────────────────────────┘
```

**Cuándo**: progress = 484/484.
**Celebración**: confetti 1 segundo (respetando reduced-motion → fade simple).

---

## 3. Empty filtered (filtro sin resultados)

### Listado — filtro pill `F` con 0 resultados
```
┌─────────────────────────────────────────────┐
│ [Todos] [A] [B] [C] [D] [E] [F●]            │  ← pill F selected
│                                              │
│ 🔍                                           │
│                                              │
│   No hay clientes en perfil F                │
│   ¡Buenas noticias! Ningún cliente está      │
│   en riesgo total.                           │
│                                              │
│   [ Ver todos ]   [ Filtrar por E ]         │
│                                              │
└─────────────────────────────────────────────┘
```

**Cuándo**: filtro retorna 0.
**Tono**: positivo si filtro = grado bajo (D/E/F sin resultados es BUENA noticia).
**Tono**: neutral si filtro = grado alto (A/B sin resultados no es noticia tonal).

---

## 4. Partial — algunos datos disponibles

### Ficha cliente — sin facturación QB
```
─── ACERCA ────
Tipo: Empresa
Régimen: Ordinario
Sector: Servicios
RNC: 130309094

─── Facturación ───
⚠ Cliente no conectado a QB
   [Conectar QuickBooks →]

─── Vault (0) ───
🔐 Sin credenciales guardadas
   [ + Añadir DGII ]
```

**Patrón**: nunca ocultar la sección, mostrar la razón y la acción.

---

## 5. Loading — fetch en curso (post-skeleton)

### Cuando user cambia filtro y datos están en cache parcial
- Mostrar datos viejos con `opacity: 0.5` + spinner top right
- Una vez fetch completo → fade in nuevos datos

### Cuando recalcula score
- Score number → spinner pequeño (~16px) al lado de "Score 87"
- Después → animación number tweening de 87 → 91

---

## 6. Optimistic update

### Cambiar perfil C → A
1. User confirma en popover
2. Badge inmediatamente cambia a `[A]` verde
3. Toast: "Cambiando perfil…"
4. Backend response OK → toast: "✓ Perfil cambiado a A · [Deshacer]"
5. Si error → badge revierte a `[C]` + toast rojo "Error al cambiar perfil · [Reintentar]"

### Revisión Guiada
1. User presiona `2` (B)
2. Card actual: fade out + check verde aparece
3. Card siguiente entra desde la derecha (slide-in 200ms)
4. Stats: "23 → 24 clasificados"
5. Backend persist en background (no bloquea siguiente clasificación)

---

## 7. Success confirmation

### Toast top-right (default 5s autohide)
```
┌────────────────────────────────────────┐
│ ✓ Perfil cambiado a B                  │
│   Huyghu SRL · Score actualizado       │
│   [Deshacer] (5s)                      │
└────────────────────────────────────────┘
```

### Inline confirmation (formularios)
```
✓ Notas guardadas · hace 2 segundos
```

---

## 8. Error — red/server

### Network failure
```
┌─────────────────────────────────────────────┐
│ ⚠ Sin conexión                              │
│                                              │
│ No pudimos cargar los datos. Verifica tu    │
│ conexión a internet.                         │
│                                              │
│ [ Reintentar ]   [ Ver caché local ]        │
│                                              │
└─────────────────────────────────────────────┘
```

### Server 500
```
┌─────────────────────────────────────────────┐
│ ⚠ Algo salió mal de nuestro lado            │
│                                              │
│ Estamos investigando. Si persiste, contacta  │
│ a soporte.                                   │
│                                              │
│ Ref: ERR-7K2-2026-05-14-1442                │
│                                              │
│ [ Reintentar ]   [ Reportar problema ]      │
│                                              │
└─────────────────────────────────────────────┘
```

**Patrón**: error con error ID copiable + acción primaria reintentar.

---

## 9. Error — LLM down (AI Sugerencia / Summary)

### AI Sugerencia en Revisión Guiada
```
┌──────────────────────────────────────┐
│ ★ SUGERENCIA AI                      │
│                                       │
│ ⚠ Sugerencia no disponible           │
│   Decide manualmente en este cliente │
│   o reintenta en unos segundos       │
│                                       │
│   [ Reintentar sugerencia ]          │
└──────────────────────────────────────┘
```

**No bloquea** el flujo: user puede asignar manualmente sin sugerencia.

### AI Summary en ficha
- Banner se OCULTA silenciosamente si LLM down. No mostrar error.
- Toast solo si user explícitamente pidió regenerar: "No pudimos generar el resumen. Intenta más tarde."

---

## 10. Multi-tenant mismatch (403)

### Caso: Yolanda intenta acceder a cliente que NO pertenece a su tenant
```
┌─────────────────────────────────────────────┐
│                  🔒                          │
│                                              │
│         No tienes acceso a este cliente      │
│                                              │
│   Este cliente pertenece a otro despacho.    │
│   Si crees que es un error, contacta a       │
│   tu administrador.                          │
│                                              │
│   [ Volver a mis clientes ]                  │
│                                              │
└─────────────────────────────────────────────┘
```

**CRÍTICO**: NO revelar **ninguna info del cliente** (ni nombre, ni RNC). Solo 403 + redirect.

---

## 11. Permission denied

### Caso: contador sin rol "admin" intenta cambiar perfil A → F (decisión grave)
```
┌─────────────────────────────────────────────┐
│ 🔒 Solo administradores pueden asignar      │
│    perfil F (Riesgo Total)                   │
│                                              │
│ Razón: este cambio puede suspender el        │
│ cliente. Pide a tu administrador que lo       │
│ haga o solicita aprobación.                  │
│                                              │
│ [ Solicitar aprobación ]   [ Cancelar ]      │
│                                              │
└─────────────────────────────────────────────┘
```

---

## 12. Offline

### Listado en modo offline
```
┌─────────────────────────────────────────────┐
│ 📴 Sin conexión — mostrando última versión   │
│    sincronizada hace 12 min                  │
│                                              │
│ [resto del listado renderizado desde caché]  │
│                                              │
│ Los cambios se guardarán cuando vuelva la    │
│ conexión.                                    │
└─────────────────────────────────────────────┘
```

**Funcionalidad offline**:
- Listado: lectura desde service worker cache
- Cambio perfil: encolar acción + sync cuando online
- Revisión guiada: encolar decisiones + sync

---

## 13. Confirmation — destructive

### Cambiar perfil A → F (degradación grave)
**Patrón doble step**:

Step 1 — popover normal con preview diff
```
[Confirmar perfil F]  ← user clickea
```

Step 2 — modal de confirmación adicional
```
┌─────────────────────────────────────────────┐
│ ⚠ Confirmación requerida                    │
│                                              │
│ Vas a degradar Huyghu SRL                    │
│ de Perfil A (Excelente) → Perfil F (Riesgo) │
│                                              │
│ Esto suspenderá:                             │
│ • Pipelines automáticos                      │
│ • Notificaciones DGII                        │
│ • Facturación mensual                        │
│                                              │
│ Razón obligatoria:                           │
│ [____________________________________]       │
│                                              │
│ ☐ Notificar al cliente por email            │
│                                              │
│ [ Cancelar ]   [ Sí, degradar a F ]          │
└─────────────────────────────────────────────┘
```

**Botón "Sí, degradar"** disabled hasta que razón ≥ 10 caracteres.

### Marcar Baja en Revisión Guiada
Similar: modal step-2 con razón obligatoria + checkbox "Notificar".

---

## 14. Undo window (5 segundos)

### Toast después de cambiar perfil
```
┌──────────────────────────────────────┐
│ ✓ Perfil cambiado a B                │
│   Huyghu SRL · Hace 1 seg            │
│   ████░░░ Deshacer                   │  ← progress bar 5s
└──────────────────────────────────────┘
```

**Comportamiento**:
- Progress bar consume 5 segundos visualmente
- Click [Deshacer] → revierte cambio + nuevo toast "Cambio deshecho"
- 5s pasados sin click → toast desaparece, cambio permanente

**Implementación**: toast queue con cancelación. NO escribir BD permanente hasta los 5s pasen (o sí escribir + soft delete si user hace undo).

---

## 15. Completion (all done)

### Revisión Guiada 484 → 484
Ver §2 Empty Revisión Guiada arriba (celebración).

### Ciclo mensual ficha cliente
Stage tracker — 5/5 dots green
```
●━━━━●━━━━●━━━━●━━━━●  Todos en verde
Docs   Calc   Pre-r  Envío  DGII

"Mes completo · Próximo ciclo inicia 1-jun"
[ Cerrar mes ]
```

---

## 16. Mapping a componentes (gestoriard)

| Componente | Estados a implementar | LOC adicional vs spec base |
|---|---|---|
| PerfiladoTable / PerfiladoCard | 1, 2, 3, 5, 8, 10, 11, 12 | +40 LOC |
| ClienteHeader | 1, 4, 7, 10 | +30 LOC |
| AiSummaryBanner | 5, 9 | +20 LOC |
| ColObligacionesMes | 1, 4, 6 | +35 LOC |
| CambiarPerfilPopover | 5, 6, 7, 8, 13, 14 | +60 LOC |
| TriageCard | 1, 5, 6, 9 | +40 LOC |
| AiSugerencia | 5, 9 | +25 LOC |
| Toast component (global) | 7, 8, 14 | +80 LOC |
| ConfirmDialog component (global) | 13 | +60 LOC |
| ErrorBoundary (global) | 8, 11 | +50 LOC |

**Total LOC adicional para estados**: ~440 LOC distribuidos en componentes.

---

## 17. Copy guidelines

| Tono | Cuándo | Ejemplo |
|---|---|---|
| Neutral | Loading/initial | "Cargando datos..." |
| Friendly | Empty + acción positiva | "Importa tu cartera desde QuickBooks" |
| Celebratory | Completion | "¡Todo revisado! 🎉" |
| Concerned | Warning + action needed | "⚠ Cliente no conectado a QB" |
| Critical | Error blocker | "⚠ Algo salió mal de nuestro lado" |
| Reassuring | Recoverable error | "Estamos investigando. Si persiste, contacta a soporte." |
| Authoritative | Permission denied | "Solo administradores pueden asignar perfil F" |
| Helpful | Permission denied + alternative | "Pide a tu administrador o solicita aprobación" |

**Regla**: nunca culpar al usuario. **"No pudimos cargar..."** mejor que **"Tu petición falló..."**.

═══ FIRMA ═══ FacturaIA / 2026-05-14 / 15 UX states cubiertos × 3 vistas
