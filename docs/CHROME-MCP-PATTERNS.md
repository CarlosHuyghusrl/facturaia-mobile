# Chrome MCP Patterns — Audit SaaS / Web

Patterns probados en sesiones reales FacturaIA waves W1-W6 (060526).
Verificados contra `gestoriard.com` con tenant Yolanda Huyghu (RNC 131047939).

## Cuándo usar Chrome MCP (vs Playwright vs WebFetch)

| Caso | Tool | Razón |
|---|---|---|
| Audit visual SaaS gestoriard.com | Chrome MCP | Sesión persistente, login mantenido entre tabs |
| Multi-tenant test data leak | Chrome MCP | Tabs paralelas, isolatedContext por tenant |
| Scraping adversarial DGII OFV | Playwright stealth | Stealth needed (skill `dgii-scraping-guide`) |
| Lectura página estática | WebFetch | Lighter, no overhead de browser |
| Búsqueda web general | Perplexity MCP | Acceso web en tiempo real |

## Protocolo estándar 3 pasos

1. **List pages**: `mcp__chrome-devtools__list_pages` antes de navegar — reusa sesiones autenticadas ya abiertas.
2. **Snapshot a11y**: `take_snapshot` (NO screenshot) → obtiene uids para click/fill/hover.
3. **Console + Network**: `list_console_messages types=["error","warn"]` + `list_network_requests` al final de cada sección auditada.

## Patterns concretos

### Pattern 1: Tabs persistentes — reusar sesión

**Por qué**: Chrome MCP mantiene browser persistente entre sesiones. Los tabs retienen cookies/login.
Re-loguear siempre = desperdicio 30-60s por iteración + tabs huérfanos acumulados.

```
1. mcp__chrome-devtools__list_pages
   → Devuelve array { pageIdx, url, title }
2. Si tab con URL del SaaS objetivo existe:
   → mcp__chrome-devtools__select_page pageIdx=N
   → take_snapshot → verificar sesión viva (no redirige a /login)
3. Si NO hay tab o sesión expirada:
   → mcp__chrome-devtools__new_page url="..."
```

**Antipatrón**: `new_page url=login` siempre → duplicas tabs, relogin innecesario cada vez.

---

### Pattern 2: take_snapshot (a11y) > take_screenshot (pixel)

**Por qué**: para interactuar necesitas `uid` del elemento. `take_snapshot` devuelve a11y tree con uids.
Screenshots son evidencia visual, NO input para acciones.

```
take_snapshot                         # → identifica uid del botón/input
click uid="<uid_botón>"               # → acción directa y confiable
take_screenshot fullPage=true         # → evidencia visual final para KB report
```

**Antipatrón**: `take_screenshot` + deducir coordenadas pixel → falla en responsive, falla en re-renders.
**Excepción**: screenshot final SÍ aplica para pegar evidencia en KB save / A2A.

---

### Pattern 3: Multi-tenant audit (verify data isolation)

**Por qué**: logout/login en mismo tab NO siempre limpia storage (localStorage, IndexedDB, cookies httpOnly).
Para RLS verification necesitas contexto aislado real.

```
1. Tab principal: tenant A logged in, datos cargados
2. mcp__chrome-devtools__new_page url="https://saas/login" isolatedContext=true
   → tab B con storage limpio (incognito-like)
3. Login tenant B en tab B
4. Navegar misma URL formulario
5. take_snapshot tab A + take_snapshot tab B → comparar:
   - RNCs/montos NO deben ser iguales
   - localStorage NO debe compartir keys con datos de tenant ajeno
   - URLs querystring deben ser distintas
```

**Aplica especialmente**: gestoriard `/clientes/...`, FacturaIA `/facturas/...`, dgii `/envios/...`.
**Antipatrón**: logout → login otro tenant en mismo tab → mock pasa, prod falla (service worker cacheado).

---

### Pattern 4: Form bug audit

```
1. navigate form_url
2. take_snapshot → identify input/button uids
3. fill_form / click → trigger validation
4. take_screenshot pre/post
5. list_console_messages types=["error"]
6. list_network_requests → filtrar POST: 200/4xx/5xx
```

**Tip**: siempre capturar network DESPUÉS del submit — el status code del POST es el diagnóstico real.

---

### Pattern 5: Responsive audit (LEY Carlos: 375/768/1440)

```
viewports = [375, 768, 1440]
for vp in viewports:
  mcp__chrome-devtools__resize_page width=vp height=812
  take_screenshot → guardar "screen-{vp}.png"
  detectar: overflow horizontal, scroll inesperado, botón fuera de viewport
```

**Viewport canónicos**:
- `375×812` → iPhone 13 (mobile)
- `768×1024` → iPad (tablet)
- `1440×900` → desktop estándar

**Antipatrón**: solo verificar desktop → mobile roto pasa desapercibido hasta que el cliente lo reporta.

---

### Pattern 6: Single-instance race condition (NO sub-agents paralelos con Chrome)

**Por qué**: Chrome MCP expone UN navegador compartido. N sub-agents Task con `mcp__chrome-devtools__*`
en paralelo → race condition: tabs se pisan, navegaciones se interrumpen, snapshots regresan basura.

```
ARQUITECTO PRINCIPAL: hace TODA la navegación Chrome MCP
  - 1 tab por SaaS / por tenant
  - Acciones Chrome: sequential dentro del arquitecto

SUB-AGENTS Task: solo trabajos NO-Chrome
  - BD queries, file edits, KB read/write, redacción A2A
  - Si necesitan ver UI → reciben URL + screenshot pegado en prompt
```

**Caso real (wave 2 060526)**: Arquitecto B1+B2 revisó 606/607/IT-1 via Chrome.
Sub-agents B3 (BD query) + B4 (docs) en paralelo en files/BD/KBs SIN tocar Chrome.
Resultado: 0 race conditions, 4 tareas completadas en 1 wave.

**Antipatrón**: 4 sub-agents Task "review formulario X via Chrome MCP en paralelo" → tabs se pisan, login se rompe a mitad.

---

### Pattern 7: Network failure detection

```
mcp__chrome-devtools__list_network_requests resourceType=["fetch","xhr"]
filtrar: status >= 400
reportar: endpoint, status, payload partial
```

**Diagnóstico típico**:
- `404` → endpoint no existe o path incorrecto
- `401/403` → auth bug o RLS
- `500` → backend crash (ver logs Docker)
- `200` con body vacío → BD query retorna 0 registros (join bug, empresa_id wrong)

---

### Pattern 8: Console capture obligatorio post-acción

**Por qué**: muchos bugs UI son `Uncaught TypeError` invisibles. La pantalla "se ve bien"
pero el botón no hace nada porque el handler explotó antes.

```
1. Después de cada navegación + cada acción crítica:
   mcp__chrome-devtools__list_console_messages types=["error","warn"]
2. Si > 0 errors rojos → fix UI ANTES de declarar OK
3. Si solo warns amarillos → log + continuar
```

**Caso real FacturaIA**: tabla 606 mostraba "0 registros". Screenshot parecía correcto.
Console: `Uncaught TypeError: Cannot read properties of undefined (reading 'monto_servicios')`
→ API devolvió shape distinto al esperado. Sin console capture: invisible.

---

### Pattern 9: Session check ligero (antes de navegar)

**Por qué**: sesiones expiran (NextAuth 30min, Supabase 1h). Detectar antes de gastar tiempo navegando tab muerto.

```
1. select_page pageIdx=N
2. navigate_page url="<URL_PROTEGIDA>"
3. wait_for "<selector_navbar_logueado>" timeout=3000
   - OK → sesión viva, continuar
   - timeout → take_snapshot
       - URL contiene /login → sesión expirada → relogin
       - URL correcta pero página vacía → bug app, no auth
```

**Atajo gestoriard**: si URL post-navegación contiene `/login?redirect=` → sesión muerta.
URL-check es más rápido que tomar snapshot completo.

---

### Pattern 10: Performance trace (páginas pesadas)

```
mcp__chrome-devtools__performance_start_trace
navigate page
wait_for page idle
mcp__chrome-devtools__performance_stop_trace
mcp__chrome-devtools__performance_analyze_insight
```

**Usar cuando**: página tarda >3s en cargar, usuarios reportan lentitud, dashboard con múltiples fetchs.

---

### Pattern 11: A11y WCAG quick scan

```
take_snapshot → JSON role tree
buscar: role="button" sin aria-label, inputs sin label asociado
take_screenshot → verificar contraste manual
```

Para scan automatizado: `evaluate_script` con axe-core inyectado (requiere internet o bundle local).

## URLs canónicas gestoriard (memorizar)

Descubiertas wave 2 060526. Son las únicas que cargan datos correctamente.

| Form | URL canónica | Notas |
|---|---|---|
| 606 | `/formularios/606/?cliente={RNC}&periodo={YYYYMM}` | RNC 9-11 dígitos sin guiones |
| 607 | `/formularios/607/?cliente={RNC}&periodo={YYYYMM}` | Filtra e-CF automáticamente |
| IT-1 | `/formularios/it1/?rnc={RNC}&periodo={YYYYMM}` | **Usa `rnc=` no `cliente=`** |
| Login | `/login/?redirect=/formularios/606/?cliente=...` | Encadenar redirect siempre |

**Antipatrón histórico**: `/dgii-formatos/606/...` (path API interno), `?empresa=` en vez de `?cliente=`,
`?period=YYYY-MM` (formato incorrecto).

## Anti-patterns consolidados

| Anti-pattern | Consecuencia | Fix |
|---|---|---|
| N sub-agents Task simultáneo Chrome MCP | Race condition, tabs se pisan | Solo arquitecto principal navega |
| `take_screenshot` sin `take_snapshot` previo | Sin uids → no puedes interactuar | Siempre snapshot primero |
| `new_page` sin `list_pages` primero | Tabs duplicadas, sesiones duplicadas | Verificar tabs existentes |
| Reportar "se ve bien" sin screenshot en KB | No hay evidencia → teatro | Screenshot obligatorio en reporte |
| Logout/login mismo tab para multi-tenant | Storage residual → falso positivo | `isolatedContext=true` en tab B |
| Navegar sin session check | 5min desperdiciados en tab muerto | `wait_for navbar` timeout=3000 |

## Output esperado en KB audit

Cada Chrome MCP audit debe producir KB con:
- `screenshots/<página>-{viewport}.png` (375/768/1440)
- Bugs encontrados table (severity P0/P1/P2)
- Network failures list (endpoint, status, description)
- Console errors list (mensaje literal, stack si disponible)
- Recomendaciones fix con `file:line` cuando aplique

## Stack relacionado

- `agent-browser-usage` skill — uso general browser automation
- `web-quality` skill — checklist QA web completo
- `design-responsive` skill — patterns mobile-first verificables con `resize_page`
- `dgii-scraping-guide` skill — Playwright stealth (NO Chrome MCP para DGII OFV)
- `chrome-mcp/patterns.md` — patterns source of truth (este doc los expande)

═══ FIRMA ═══ FacturaIA / 080526 / W19.Q3 Chrome MCP patterns
