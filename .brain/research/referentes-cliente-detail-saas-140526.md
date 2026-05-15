# Research — Referentes Cliente Detail SaaS (v3 GestoriaRD)

**ID**: `research-referentes-cliente-detail-saas-140526`
**Fecha**: 2026-05-14
**Autor**: FacturaIA (rol diseñadora SaaS)
**Cliente piloto**: Yolanda Huyghu — Huyghu SRL (LUNES 14-may)
**Destino**: rediseño página `/clientes/[id]` v3 GestoriaRD

---

## 0. Fuentes citadas

Las afirmaciones marcadas con `[N]` referencian estas URLs públicas. No invento UI, sólo describo lo que las fuentes documentan:

| # | URL | Cobertura |
|---|---|---|
| 1 | https://karbonhq.com/solution/client-management/ | Karbon Client Management features |
| 2 | https://getuku.com/articles/karbon-review/ | Review independiente Karbon 2026 |
| 3 | https://help.taxdome.com/article/130-client-profile-overview | **Doc oficial TaxDome Client Profile** (alta densidad) |
| 4 | https://taxdome.com/client-management | TaxDome client management overview |
| 5 | https://support.stripe.com/questions/updates-to-the-customer-detail-page | Stripe customer detail redesign |
| 6 | https://docs.stripe.com/dashboard/basics | Stripe Dashboard basics |
| 7 | https://docs.stripe.com/stripe-apps/design | Stripe Apps design system |
| 8 | https://linear.app/docs/triage | Linear Triage doc |
| 9 | https://linear.app/now/how-we-redesigned-the-linear-ui | Linear UI redesign 2026 |
| 10 | https://linear.app/changelog/2026-03-12-ui-refresh | Linear UI refresh changelog mar-2026 |
| 11 | https://financial-cents.com/accounting-crm/ | Financial Cents CRM |
| 12 | https://financial-cents.com/resources/articles/how-to-use-accounting-crm-software-to-build-strong-client-relationships/ | FC client relationships |
| 13 | https://financial-cents.com/resources/articles/new-updates-to-the-client-crm/ | FC CRM updates |

**Limitación honesta**: ningún referente expone screenshots accesibles via WebFetch a su detalle de página. Los mockups ASCII se construyen a partir de los **labels textuales documentados** + convenciones SaaS conocidas. Donde infiero un patrón sin fuente directa, lo marco `(inferido)`.

---

## 1. ASCII Mockup — Karbon Client Detail

**Fuentes**: [1] [2]
**Features documentadas**: Consolidated client communication, Activity Timelines, AI Client Summaries, Client Portal, Custom Fields, Contact Segments, Document Storage [1]. Comprehensive contact details + communication history + custom fields + activity timelines en cada perfil [2].

```
┌────────────────────────────────────────────────────────────────────────────┐
│ ☰  Karbon       Search…                  + Create ▼   🔔   Avatar         │  ← top nav
├────────┬───────────────────────────────────────────────────────────────────┤
│        │ Clients ▸ Huyghu SRL                                              │
│ Sidebar│                                                                    │
│        │ ┌──────────────────────────────────────────────────────┐         │
│ Triage │ │  HS  Huyghu SRL                          ● Active    │         │
│ Work   │ │      130309094 · Corporation             [Edit] [⋯] │         │
│ Clients│ │      Bookkeeping + Tax · 2 contacts                  │         │
│ Tasks  │ └──────────────────────────────────────────────────────┘         │
│ Notes  │                                                                    │
│ Email  │ ─── AI Client Summary  (inferido badge: sparkles ✨) ───          │
│ Reports│ "Last quarter revenue +12%. 3 invoices overdue. Next deadline:    │
│        │  IT-1 due May 20. Last contact: 2 weeks ago via email."           │
│        │                                                                    │
│        │ ┌───┬──────┬─────────┬──────┬──────┬────────┬────────┐           │
│        │ │Tmln│Work │Emails  │Notes│Docs  │Contacts│Custom  │  ← tabs    │
│        │ ├───┴──────┴─────────┴──────┴──────┴────────┴────────┤           │
│        │ │  Activity Timeline                                  │           │
│        │ │  ◆ Today  Sarah sent email "Q1 close" — 2 replies  │           │
│        │ │  ◆ May 10 Document uploaded: Bank statement.pdf    │           │
│        │ │  ◆ May 5  Task completed: "Bookkeeping April"      │           │
│        │ │  ◆ May 1  Note added by Mark                        │           │
│        │ └───────────────────────────────────────────────────┘           │
│        │                                                                    │
│        │ [+ New Email]  [+ Task]  [+ Note]  [Upload doc]                  │
└────────┴───────────────────────────────────────────────────────────────────┘
```

**Patrón clave Karbon**:
- **Activity Timeline central** — todo lo que pasó cronológico [1]
- **AI Client Summary** arriba para contexto rápido [1]
- **Tabs horizontales** para Communications/Work/Documents/Custom Fields [1] [2]

---

## 2. ASCII Mockup — TaxDome Client Profile

**Fuentes**: [3] [4]
**Doc oficial** detalla 2 tabs principales: **Overview tab** y **Info tab** [3].

### 2.1 Overview Tab

Secciones documentadas literalmente [3]: Documents, Tasks, Email, Jobs, Chats, Unpaid invoices, Approvals, Signatures, Organizers, Login activity, Notes, Time tracking, Proposals & ELs. Cada sección tiene "View all" + badge "New" para items sin ver.

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Accounts ▸ Huyghu SRL                                       [Edit] [⋯]   │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  [Overview]  [Info]                                                        │
│                                                                            │
│  ┌──────────────────────────┐  ┌──────────────────────────┐               │
│  │ 📄 Documents         5 ▸ │  │ ✅ Tasks             5 ▸ │               │
│  │ • Bank stmt.pdf  [New]   │  │ • Bookkeeping Apr        │               │
│  │ • IT-1 abr.txt   [New]   │  │ • Reconcile QB           │               │
│  │ • 606 abr.txt            │  │ • Tax Q1 review          │               │
│  └──────────────────────────┘  └──────────────────────────┘               │
│  ┌──────────────────────────┐  ┌──────────────────────────┐               │
│  │ ✉ Email              5 ▸ │  │ 🛠 Jobs              5 ▸ │               │
│  │ • Re: Q1 close           │  │ • Mensual mayo · Stage 2 │               │
│  │ • IT-1 reminder          │  │ • IR-2 2025  · Stage 3   │               │
│  └──────────────────────────┘  └──────────────────────────┘               │
│  ┌──────────────────────────┐  ┌──────────────────────────┐               │
│  │ 💬 Chats             5 ▸ │  │ 💵 Unpaid invoices   3 ▸ │               │
│  │ • Yolanda: "subo …"      │  │ • #INV-042  RD$ 4,500    │               │
│  └──────────────────────────┘  └──────────────────────────┘               │
│  ┌──────────────────────────┐  ┌──────────────────────────┐               │
│  │ ✍ Approvals          1 ▸ │  │ 🖋 Signatures        2 ▸ │               │
│  └──────────────────────────┘  └──────────────────────────┘               │
│  ┌──────────────────────────┐  ┌──────────────────────────┐               │
│  │ 📋 Organizers        1 ▸ │  │ 🔐 Login activity        │               │
│  │                          │  │  Last: May 13, 10:22am   │               │
│  └──────────────────────────┘  └──────────────────────────┘               │
│  ┌──────────────────────────┐  ┌──────────────────────────┐               │
│  │ 📝 Notes             5 ▸ │  │ ⏱ Time tracking     5 ▸ │               │
│  └──────────────────────────┘  └──────────────────────────┘               │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Info Tab

Documentado [3]:
- **Account Info**: nombre, foto, tipo (Individual/Company/Other), legal address, tags, team members, custom fields, history of changes, account roles, QuickBooks sync status, mobile app usage, linked accounts.
- **Contacts**: nombre alfa + Unlink, phone + primary email, 4 toggles ("Login", "Notify", "Email sync", "Signatory"), description editable, signer priority, botones "Create contact" y "Link".

```
┌────────────────────────────────────────────────────────────────────────────┐
│  [Overview]  [Info]                                          [Edit]        │
├────────────────────────────────────────────────────────────────────────────┤
│  Account Info                                                              │
│  ┌──────────┐  Name: Huyghu SRL                                            │
│  │  Photo   │  Type: Company                                               │
│  │   HS     │  Legal address: Av. ...                                      │
│  └──────────┘  Tags: [Bookkeeping] [Premium] [QB linked]                  │
│                                                                            │
│  Team members:   Sarah ★   Mark   + Add                                    │
│  Custom fields:  Entity type · Formation date · Tax ID                     │
│  QB sync:  🟢 Invoicing connected   🟢 GL connected                       │
│  Mobile app:  🟢 Active                                                    │
│                                                                            │
│  ─── History of changes ───                                                │
│  May 12 — Sarah added to team                                              │
│  May 5  — Tag "Premium" added                                              │
│                                                                            │
│  ─── Contacts ──────────────────────────────────────────────────────────  │
│  Yolanda Huyghu  ★                          [Unlink]                       │
│    📞 809-555-…   ✉ yolanda@huyghusrl.com                                 │
│    [✓ Login]  [✓ Notify]  [✓ Email sync]  [✓ Signatory]                  │
│    Signer priority: 1                                                      │
│                                                                            │
│  [+ Create contact]  [+ Link contact]                                      │
└────────────────────────────────────────────────────────────────────────────┘
```

**Patrón clave TaxDome**:
- **Overview = grid de 13 mini-cards** (5 items max + View all) — densidad alta con jerarquía clara [3]
- **Info = tab separado** para datos crudos editables [3]
- **Sin sidebar de propiedades** — todo en flujo vertical
- **Badge "New"** en items sin ver [3]
- Toggles fine-grained por contacto (Login/Notify/Email sync/Signatory) [3]

---

## 3. ASCII Mockup — Stripe Customer Detail

**Fuentes**: [5] [6] [7]
**Doc**: "Stripe has redesigned the customer details page to adopt a new page layout and updated technologies" [5]. "Details pages give a detailed look into a particular Stripe object" [6]. Layout principles: "stacked metric cards, clear badges for performance trends, a gross volume card for quick comparison, and obvious indicators for growth or issues" [7]. "The header houses your app name, view name, external link to your product, and a few top level actions" [7].

```
┌────────────────────────────────────────────────────────────────────────────┐
│  ← Customers / cus_NjAvL8xQ…                                              │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│   Yolanda Huyghu                                  [Edit] [⋯ Actions ▼]    │  ← header [7]
│   yolanda@huyghusrl.com · Customer since Apr 2024                         │
│                                                                            │
│   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│   │ Total spent  │ │  Balance     │ │ Open invoices│ │ MRR          │    │  ← metric cards [7]
│   │ $4,820       │ │  -$45        │ │  3           │ │  $250        │    │     stacked
│   │ ▲ 12% YoY    │ │              │ │  RD$ 12k     │ │  ▲ 2 new     │    │     trend badges
│   └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘    │
│                                                                            │
│   [Payments]  [Subscriptions]  [Invoices]  [Payment methods]  [Quotes]   │  ← tabs [6]
│                                                                            │
│   Payments (12)                                                            │
│   ┌────────────────────────────────────────────────────────────────┐     │
│   │ Date        Amount    Status     Description                   │     │
│   ├────────────────────────────────────────────────────────────────┤     │
│   │ May 10      $250.00   Succeeded  Mensual plan                  │     │
│   │ Apr 10      $250.00   Succeeded  Mensual plan                  │     │
│   │ Apr 5       $4,500    Refunded   Setup fee                     │     │
│   └────────────────────────────────────────────────────────────────┘     │
│                                                                            │
│   ─── Right rail / property panel (inferido por convención) ───            │
│   Metadata:                                                                │
│     • plan: monthly                                                        │
│     • country: DO                                                          │
│     • rnc: 130309094                                                       │
│   Tax IDs:  130309094 (DO)                                                │
│   Shipping addr:  Av. …                                                    │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

**Patrón clave Stripe**:
- **Metric cards stacked arriba** con trend badges (▲/▼ con %) [7]
- **Clarity y predictable layouts** [7]
- **Top actions en header** (Edit, Actions dropdown) [7]
- **Tabs horizontales** por tipo de objeto relacionado [6]
- **Property panel lateral derecho** con metadata (`key:value`) — convención Stripe documentada en Stripe Apps Design [7]

---

## 4. ASCII Mockup — Linear (Triage / Issue Detail pattern)

**Fuentes**: [8] [9] [10]
**Doc**: Triage es "a special inbox for your team … will appear under the team name in the sidebar" [8]. UI refresh 2026: "navigation sidebars being slightly dimmer, allowing the main content area to stand out" [9] [10]. "Linear adjusted the sidebar, tabs, headers, and panels to reduce visual noise, maintain visual alignment, and increase the hierarchy and density of navigation elements" [9]. "Side panels to display meta properties, as well as the actual display" [9]. Layouts soportados: "list, board, timeline, split, and fullscreen" [9].

```
┌────────────────────────────────────────────────────────────────────────────┐
│  ☰      ›  Customers › HUY-042                              ⌘K   🔔  ☉    │
├──┬───────────────────────────────────────────────────────────┬─────────────┤
│☰ │ HUY-042                                                    │ Properties │  ← split layout [9]
│  │                                                            │            │
│My│ Huyghu SRL — Onboarding incomplete                        │ Status     │
│Inb│                                                           │ ● In Prog  │
│Tri│ Customer is missing 3 of 14 perfilado fields. Yolanda     │            │
│age│ pending review for ABC tier assignment.                   │ Assignee   │
│   │                                                           │ Sarah ★    │
│Pjs│ ┌─────────────────────────────────────────────────────┐  │            │
│   │ │ Sub-issues (3)                                       │ │ Priority   │
│   │ │ ○ Verify RNC matches DGII             • Open        │ │ ⚠ Urgent   │
│   │ │ ○ Confirm fiscal regime               • Open        │ │            │
│   │ │ ● Upload incorporation docs           • Done        │ │ Labels     │
│   │ └─────────────────────────────────────────────────────┘ │ • piloto   │
│   │                                                           │ • huyghu   │
│   │ ─── Activity ───────────────────────────────────────────  │            │
│   │ ◆ Sarah changed status to In Progress      · 2h ago       │ Cycle      │
│   │ ◆ Sarah added comment "DGII login OK"      · 1d ago       │ may26-W3   │
│   │ ◆ System: triaged from Inbox               · 2d ago       │            │
│   │                                                           │ Project    │
│   │ ┌─────────────────────────────────────────────────────┐  │ Piloto LUN │
│   │ │ Comment…                                             │ │            │
│   │ │                                                      │ │ Customer   │
│   │ │                                            [Send]    │ │ Huyghu SRL │
│   │ └─────────────────────────────────────────────────────┘ │            │
└──┴───────────────────────────────────────────────────────────┴─────────────┘
```

**Patrón clave Linear**:
- **Split view**: contenido central + **property panel derecho** con Status, Assignee, Priority, Labels, Cycle, Project, Customer [9]
- **Sidebar atenuado** para que el contenido domine [9] [10]
- **Sub-issues nested** dentro del detail
- **Triage = inbox** para clasificar pendientes antes de meter al pipeline [8]
- **Visual noise reducido** — espacios, jerarquía via density no chrome [9]
- Layouts switcheables (list/board/timeline/split/fullscreen) [9]

---

## 5. ASCII Mockup — Financial Cents Client Detail

**Fuentes**: [11] [12] [13]
**Doc**: Client Information Dashboard como primera vista del perfil [12]. Secciones: Activity Tab (audit trail de comunicaciones), Custom Fields (birthday, formation date, tax ID, entity type), Client Vault (passwords encriptados), Files Tab (organizado en carpetas), Team Chat (interno), Client Notes (meetings) [12]. Integraciones: QBO, emails bajo cada cliente, upload seguro de docs [12]. Audit trail "who spoke to the client, when and about what in one simple view" [13].

```
┌────────────────────────────────────────────────────────────────────────────┐
│  ☰ FC  Clients › Huyghu SRL                          [+ New] [⋯]          │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌────────────────────────────────────────────────────────────┐           │
│  │ HS  Huyghu SRL                            [Edit profile]   │           │  ← header
│  │     yolanda@huyghusrl.com · 809-555-…                       │           │
│  │     [Bookkeeping] [Tax] [Premium]                          │           │
│  └────────────────────────────────────────────────────────────┘           │
│                                                                            │
│  [Activity] [Custom Fields] [Vault] [Files] [Chat] [Notes]               │  ← tabs [12]
│                                                                            │
│  ─── Activity (audit trail) [13] ──────────────────────────────────────   │
│  Filter: [All] [Email] [Call] [Note] [File] [Task]                       │
│                                                                            │
│  ● May 13  Sarah  📞 Call · 12 min                                        │
│            "Confirmed IT-1 abril paid. Discussed Q2 forecast."            │
│  ● May 10  Mark   ✉ Email "Q1 close documents"                            │
│  ● May 5   Sarah  📝 Note "Cliente prefiere WhatsApp para urgencias"      │
│  ● May 1   System 🔄 QBO sync — 24 invoices imported                      │
│                                                                            │
│  ─── Right column (inferido) — Quick info ─────                           │
│  Entity type:    SRL                                                       │
│  Formation date: 2014-03-15                                                │
│  Tax ID:         130309094                                                 │
│  QBO:           🟢 Connected                                              │
│  Birthday:       Apr 22                                                    │
└────────────────────────────────────────────────────────────────────────────┘
```

**Patrón clave Financial Cents**:
- **Activity tab por defecto** con audit trail filtrable por tipo [13]
- **Custom Fields propios de contabilidad**: entity type, formation date, tax ID, birthday [12]
- **Client Vault** para passwords (DGII/TSS/QB credenciales) [11] [12]
- **Header simple** con tags inline
- **QBO sync indicator** visible siempre [12]

---

## 6. Tabla comparativa

| Dimensión | Karbon | TaxDome | Stripe | Linear | Financial Cents |
|---|---|---|---|---|---|
| **Above-the-fold** | Header simple + AI Summary | Tabs Overview/Info | Header + 4 metric cards stacked | Header + breadcrumb minimal | Header + tags + 6 tabs |
| **Tabs** | Timeline · Work · Emails · Notes · Docs · Contacts · Custom | Overview · Info | Payments · Subs · Invoices · Methods · Quotes | (no tabs — split view) | Activity · Custom · Vault · Files · Chat · Notes |
| **Property panel lateral** | No (todo en flujo) | No | Sí, derecha (metadata, tax IDs) | **Sí, derecha** (Status, Assignee, Priority, Labels) [9] | Sí (inferido) — quick info derecha |
| **Activity feed** | **Timeline central** [1] | "Notes" tab + "Login activity" card [3] | (no central, en sub-tabs) | **Activity bajo contenido + comments** | **Activity como tab default** [13] |
| **Metric cards** | (no destacadas) | 13 mini-cards Overview [3] | **4-6 stacked + trend badges** [7] | (no metrics) | (no metrics como cards) |
| **Acciones primarias** | + Email, + Task, + Note | [Edit] + secciones inline | [Edit] [Actions ▼] | (en property panel) | [+ New] [Edit profile] |
| **Custom fields** | Sí, definibles [1] | Sí, en Info tab [3] | Metadata key:value [7] | Labels/Cycle/Project [9] | Específicos contabilidad [12] |
| **AI Summary** | **Sí** (AI Client Summaries) [1] | No documentado | No | No | No |
| **Vault credenciales** | No | No | No | No | **Sí (Client Vault)** [11] [12] |
| **Mobile** | Client Portal app | Mobile app cliente [3] | Dashboard responsive | App nativa | (no documentado) |
| **Densidad info** | Media | **Alta** (13 cards) | Media | Baja (whitespace) | Media |
| **Multi-tenant clarity** | Workspace switch | Account/Subaccount tree | Account switch top | Workspace switch | Firm view |

---

## 7. Propuesta v3 — `/clientes/[id]` GestoriaRD

### 7.1 Decisión: copiar lo mejor de cada uno

| Pieza | Inspirado en | Por qué |
|---|---|---|
| **Header con avatar + estado + tags + 4 metric cards** | Stripe [7] + TaxDome [3] | Densidad de info crítica en primer scroll |
| **AI Client Summary en banner** | Karbon [1] | Yolanda contadora con 503 clientes — necesita resumen pre-llamada |
| **Property panel derecho (sticky)** | Linear [9] + Stripe [7] | RNC, régimen, tier ABC, contador asignado siempre visibles |
| **Tabs centrales: Resumen · Actividad · Fiscal · Comunicación · Documentos · Configuración** | TaxDome [3] + Financial Cents [12] | Cubre los 13 dominios sin abrumar — 6 tabs ≈ Miller's law |
| **Tab "Resumen" = grid de mini-cards** (8 cards estilo TaxDome) | TaxDome Overview [3] | Estado fiscal de un vistazo |
| **Activity audit trail con filtros** | Financial Cents [13] + Linear [9] | Auditoría compliance contadora |
| **Client Vault** (DGII pw + TSS pw + QB) | Financial Cents [11] | DGII RD: necesitan compartir credenciales con el despacho |
| **Sub-items nested** (casos, formularios, facturas relacionadas) | Linear [9] | Drill-down sin perder contexto |
| **Bottom sticky action bar** mobile | (extensión propia) | Yolanda mobile-first |

### 7.2 ASCII Mockup desktop 1440px — `/clientes/[id]` v3

```
┌────────────────────────────────────────────────────────────────────────────────────────────┐
│ ☰  GestoriaRD    ⌘K Buscar…                          + Nuevo ▼   🔔   Avatar admin       │
├────────┬───────────────────────────────────────────────────────────────────────┬───────────┤
│        │ Clientes › Huyghu SRL                                                  │           │
│ Side   │                                                                        │           │
│ bar    │ ┌──────────────────────────────────────────────────────────────────┐ │ PROPIEDADES│
│ ATEN   │ │  HS   Huyghu SRL                              [Edit]   [⋯ Más ▼]│ │           │
│ UADO   │ │       RNC 130309094 · SRL · Régimen Ordinario                   │ │ Estado    │
│ [9]    │ │       🟢 Activo  [Premium] [Bookkeeping+Tax] [Piloto LUN]       │ │ 🟢 Activo │
│        │ └──────────────────────────────────────────────────────────────────┘ │           │
│ Dash   │                                                                        │ Tier ABC  │
│ Chat   │ ─── ✨ Resumen IA  (auto-gen — actualizado hace 12 min) ───            │ ● A — Top │
│ Cli★   │ "Cliente al día con DGII. Próx vencimiento: IT-1 mayo en 6 días.       │           │
│ Casos  │  Última factura escaneada hace 2h. Yolanda llamó ayer pidiendo TXT 606."│ Contador  │
│ Agend  │                                                                        │ Sarah ★   │
│ Form   │ ┌─────────────┐┌─────────────┐┌─────────────┐┌─────────────┐         │           │
│ QB     │ │ Vencimien.  ││ Pendientes  ││ Por escanear││ Score DGII  │         │ Régimen   │
│ DGII   │ │ ⚠ 2 (7d)    ││ 4           ││ 12 facturas ││ 92/100  ▲3  │         │ Ordinario │
│ TSS    │ │ 🔴 1 vencido││ Casos: 2    ││ Auto: 8     ││ Verde       │         │           │
│ Score  │ └─────────────┘└─────────────┘└─────────────┘└─────────────┘         │ Empleados │
│ Bibli  │      ↑ Stripe [7] stacked metric cards con trend badges                │ 12        │
│        │                                                                        │           │
│        │ [Resumen] [Actividad] [Fiscal] [Comunicación] [Documentos] [Config]  │ QB sync   │
│        │  ─────────                                                             │ 🟢 OK     │
│        │                                                                        │           │
│        │ === RESUMEN (grid 8 mini-cards estilo TaxDome [3]) ===                 │ TSS       │
│        │                                                                        │ 🟢 Activa │
│        │ ┌─────────────────────────┐  ┌─────────────────────────┐             │           │
│        │ │ 📋 Formularios pendientes│  │ ⚠ Vencimientos próximos │             │ Vault 🔐  │
│        │ │ IT-1 abril  ● vencido    │  │ IT-1 mayo  · 20-may     │             │ 3 cred.   │
│        │ │ 606 mayo    ● vence 6d   │  │ 606 mayo   · 15-may  ⚠ │             │ DGII · TSS│
│        │ │ 607 mayo    ● vence 6d   │  │ TSS mayo   · 03-jun     │             │ QB        │
│        │ │ [Ver todos]              │  │ [Calendario fiscal]     │             │           │
│        │ └─────────────────────────┘  └─────────────────────────┘             │ Custom    │
│        │ ┌─────────────────────────┐  ┌─────────────────────────┐             │ Constit.  │
│        │ │ 📞 Casos abiertos     2 │  │ 💵 Facturación (mes)    │             │ 2014-03-15│
│        │ │ #2026-000018 Aclar.      │  │ 606 compras  RD$ 84,200 │             │ Cumple    │
│        │ │ #2026-000015 Auditoría   │  │ 607 ventas   RD$ 312,5k │             │ 31-mar    │
│        │ │ [Ver todos]              │  │ ITBIS neto   RD$ 19,300 │             │           │
│        │ └─────────────────────────┘  └─────────────────────────┘             │ Contactos │
│        │ ┌─────────────────────────┐  ┌─────────────────────────┐             │ ─────────│
│        │ │ 🤖 Facturas FacturaIA   │  │ 📂 Documentos recientes │             │ Yolanda H.│
│        │ │ 42 mes · 8 sin clasifico│  │ • Cert.RNC.pdf  [New]   │             │ ★ Signat. │
│        │ │ 3 con warning RNC       │  │ • IT-1 abr.txt  [New]   │             │ 📞 ✉ 💬   │
│        │ │ [Abrir cola revisión]   │  │ • 606 abr.txt           │             │           │
│        │ └─────────────────────────┘  └─────────────────────────┘             │ + 1 más   │
│        │ ┌─────────────────────────┐  ┌─────────────────────────┐             │           │
│        │ │ ⏱ Tiempo invertido (mes)│  │ ✉ Última comunicación   │             │ [Agendar  │
│        │ │ Sarah: 4.2h  Mark: 1.1h │  │ Yolanda · WhatsApp · 2h │             │  reunión] │
│        │ │ Total: 5.3h              │  │ "Subí 12 facturas hoy"  │             │           │
│        │ └─────────────────────────┘  └─────────────────────────┘             │           │
│        │                                                                        │           │
└────────┴───────────────────────────────────────────────────────────────────────┴───────────┘
```

### 7.3 Tabs detalle (esbozo, no expansión completa)

| Tab | Contenido principal | Inspirado en |
|---|---|---|
| **Resumen** | Grid 8 mini-cards (anterior) | TaxDome Overview [3] |
| **Actividad** | Timeline filtrable (call/email/file/task/system QB/scrape DGII) | Karbon Timeline [1] + Financial Cents Audit [13] |
| **Fiscal** | Sub-tabs: Calendario · Formularios histórico · Pagos DGII · IR-2 anual · Anticipos | (propio — mockup calendario fiscal cliente 14-may KB 16919) |
| **Comunicación** | Threads email + WhatsApp + Notas internas + Llamadas log | Financial Cents Chat/Notes [12] |
| **Documentos** | Carpetas (Constitución · DGII · TSS · Bancos · Contratos) + Búsqueda | Financial Cents Files [12] |
| **Configuración** | Custom fields editables + Vault credenciales + Roles team + Tags + Archivar | TaxDome Info tab [3] + Financial Cents Vault [11] |

### 7.4 Mobile-first 375px (Yolanda Huyghu — APK + responsive web)

Yolanda contadora usa móvil en campo (visitas, sótano, parqueo cliente). Performance + thumb-zone crítico.

```
┌──────────────────────────┐
│ ← Huyghu SRL        ⋯    │  ← header colapsable
├──────────────────────────┤
│ HS  RNC 130309094         │
│     🟢 ● A Premium        │
│                           │
│ ✨ Resumen IA            │  ← collapsible (default open)
│ "IT-1 mayo en 6 días.    │
│  12 facturas sin clasif."│
│                           │
│ ┌──────────┬──────────┐  │  ← KPI 2×2 (no 4 cols)
│ │ ⚠ 2 (7d) │ 🔴 1 venc│  │
│ ├──────────┼──────────┤  │
│ │ 12 escan │ Score 92 │  │
│ └──────────┴──────────┘  │
│                           │
│  ◀ ▸  scroll horiz tabs ▸ │  ← tabs swipe
│ [Resumen][Activ][Fiscal]…│
│                           │
│ ─── Resumen ───────────  │  ← mini-cards stack vertical
│ ┌──────────────────────┐ │
│ │ 📋 Formularios pend. │ │
│ │ IT-1 abril ● vencido │ │
│ │ 606 mayo   ● 6d      │ │
│ │ [Ver todos →]        │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ 🤖 FacturaIA 42 mes  │ │
│ │ 8 sin clasificar     │ │
│ │ [Abrir cola →]       │ │
│ └──────────────────────┘ │
│ … (resto cards stack)    │
│                           │
├──────────────────────────┤
│ 📞 ✉ 💬 + Nuevo caso ⋯  │  ← bottom action bar sticky
└──────────────────────────┘
  ↑ thumb zone 44pt+ touch
```

**Decisiones mobile críticas (Yolanda)**:
1. **Property panel** → bottom sheet swipeable (no se pierde, pero no ocupa pantalla)
2. **Tabs** → scroll horizontal con snap (no dropdown)
3. **KPI cards** → 2×2 grid, no 4 columnas (legibilidad)
4. **Bottom action bar sticky**: Call · Email · WhatsApp · Nuevo caso · Más — thumb-friendly
5. **Pull-to-refresh** re-sync QB + DGII
6. **FAB cámara** flotante → deep-link APK FacturaIA `facturaia://scan?clienteId=…`
7. **Offline cache** AsyncStorage del último render — Yolanda visita cliente sin señal
8. **Push notifs**: D-7/D-1/D+1 vencimientos del cliente abierto

---

## 8. Implementación — Plan 3 sprints

| Sprint | Scope | Dependencia |
|---|---|---|
| **S1** | Header + 4 metric cards + property panel derecho sticky + tab Resumen (8 mini-cards) | API `GET /api/v2/clientes/[id]/dashboard` que agrega datos de 6+ tablas |
| **S2** | Tabs Actividad (timeline audit) + Fiscal (sub-tabs calendario + formularios) + Documentos | Endpoint `clientes/[id]/activity?type=*&limit=50` + bucket MinIO docs |
| **S3** | Tab Comunicación (email+WA+notas) + Tab Config (custom fields + Vault) + Mobile responsive + APK CalendarioScreen | WhatsApp Business API + crypto vault + Expo deep-links |

**Cross-agent**:
- **gestoriard**: implementa `/clientes/[id]/page.tsx` + endpoint API + property panel componente
- **dgii**: provee envios + score + scraper status para metric cards
- **FacturaIA (yo)**: APK responsive view + cámara deep-link + Chrome MCP audit 3 viewports
- **arquitecto-servidor-infra**: configura crypto vault MinIO + cron WhatsApp

---

## 9. Verificación pre-deploy (Chrome MCP)

- [ ] 1440px: header + property panel + 8 mini-cards sin overflow
- [ ] 768px: property panel se mueve a bottom drawer
- [ ] 375px: KPI 2×2 + tabs swipe + bottom action bar visible
- [ ] Multi-tenant: Yolanda Huyghu vs otro tenant — sin leak
- [ ] Console: 0 errors, 0 hydration warnings
- [ ] A11y: contraste ≥ 4.5:1 en tags/badges, navegación keyboard, screen reader labels
- [ ] Performance: LCP < 2.5s, CLS < 0.1, INP < 200ms
- [ ] AI Summary fallback: si LLM down, ocultar banner (no romper page)
- [ ] Vault: re-auth requerido al expandir credenciales (zero-knowledge)
- [ ] Empty states: cliente nuevo sin historial, sin QB sync, sin DGII login

---

## 10. Fuentes (markdown links)

- [Karbon Practice Management Software](https://karbonhq.com/solution/client-management/)
- [Karbon Review 2026 — Uku](https://getuku.com/articles/karbon-review/)
- [TaxDome Client Profile Overview — Help Center](https://help.taxdome.com/article/130-client-profile-overview)
- [TaxDome Client Management](https://taxdome.com/client-management)
- [Stripe — Updates to the customer detail page](https://support.stripe.com/questions/updates-to-the-customer-detail-page)
- [Stripe Dashboard Basics](https://docs.stripe.com/dashboard/basics)
- [Stripe Apps — Design your app](https://docs.stripe.com/stripe-apps/design)
- [Linear Triage Docs](https://linear.app/docs/triage)
- [How we redesigned the Linear UI](https://linear.app/now/how-we-redesigned-the-linear-ui)
- [Linear UI refresh changelog 2026-03-12](https://linear.app/changelog/2026-03-12-ui-refresh)
- [Financial Cents — Accounting CRM](https://financial-cents.com/accounting-crm/)
- [Financial Cents — Client Relationships](https://financial-cents.com/resources/articles/how-to-use-accounting-crm-software-to-build-strong-client-relationships/)
- [Financial Cents — New CRM Updates](https://financial-cents.com/resources/articles/new-updates-to-the-client-crm/)

═══ FIRMA ═══ FacturaIA / 2026-05-14 / research-referentes-cliente-detail-saas
