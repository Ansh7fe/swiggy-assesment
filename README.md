# Swiggy SDE-1 Backend Assignment — Jira-Like Project Management Platform

A production-oriented, modular monolith backend inspired by Jira. Built with **NestJS**, **Prisma**, **PostgreSQL**, and **Socket.IO** — designed to handle concurrent team collaboration, workflow-driven issue management, real-time board sync, and auditability at scale.

Throughout this document, the term Issue refers to a generic work item/ticket within the project management system. Depending on the type, an issue can represent a Bug, Task, Story, Epic, or Sub-task.

---

## 🔗 Live Demo

| Resource | URL |
|---|---|
| **Swagger / API Docs** | [https://swiggy-assesment.onrender.com/api/docs](https://swiggy-assesment.onrender.com/api/docs) |
| **Base API URL** | `https://swiggy-assesment.onrender.com` |

> ⚠️ Hosted on Render free tier — first request may take 30–60 seconds to cold-start.

---

## 🛠️ Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Framework | NestJS (TypeScript) | Modular DI, decorators, guards, interceptors out of the box |
| Database | PostgreSQL (Supabase) | Relational integrity, GIN full-text search, transactional safety |
| ORM | Prisma v5 | Type-safe queries, schema-first migrations, great DX |
| Auth | JWT + Passport + bcrypt | Stateless, scalable authentication |
| Realtime | Socket.IO | Room-isolated WebSocket broadcasting with reconnection support |
| Docs | Swagger / OpenAPI | Interactive API playground |
| Deployment | Render | Zero-config CI/CD |

---

## 🏗️ Architecture Overview

This system is intentionally designed as a **Modular Monolith** — not microservices.

```
┌─────────────────────────────────────────────────────────┐
│                    NestJS Application                   │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │  Auth    │  │ Projects │  │  Issues  │  │Sprints │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │Workflow  │  │ Comments │  │ Activity │  │Notifs  │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
│  ┌──────────┐  ┌──────────┐                             │
│  │WebSocket │  │  Search  │                             │
│  └──────────┘  └──────────┘                             │
│                                                         │
│              Shared: Guards · Filters · Interceptors    │
└─────────────────────────────────────────────────────────┘
              │                        │
      ┌───────▼───────┐       ┌────────▼──────┐
      │  PostgreSQL   │       │   Socket.IO   │
      │  (Supabase)   │       │   (Realtime)  │
      └───────────────┘       └───────────────┘
```

**Why Modular Monolith over Microservices?**

Microservices add network latency between service boundaries, distributed tracing complexity, and eventual consistency challenges that are premature for this scale. A modular monolith gives us:

- Shared database transactions across domains (critical for workflow + activity + notification writes)
- Zero inter-service network overhead
- Simple local development — one process, one DB
- Clean domain separation that *can* be extracted to microservices later with minimal refactoring effort

---

## 📂 Project Structure

```
src/
 ├── modules/
 │    ├── auth/              # JWT registration, login, Passport strategy
 │    ├── projects/          # Project CRUD, board API, workflow init
 │    ├── issues/            # Issues CRUD, optimistic locking, transitions
 │    ├── workflow/          # State machine engine, transition validation, auto-actions
 │    ├── sprints/           # Sprint lifecycle, carry-over, velocity tracking
 │    ├── comments/          # Flat comment threads, @mention parsing
 │    ├── activity/          # Event-driven audit log, activity feed API
 │    ├── notifications/     # In-app notification inbox, read/unread state
 │    ├── websocket/         # Socket.IO gateway, presence, missed event replay
 │    └── fields/            # Custom field definitions, watcher subscriptions
 │
 ├── common/
 │    ├── guards/            # JwtAuthGuard (applied globally as APP_GUARD)
 │    ├── decorators/        # @CurrentUser(), @Public() (bypass JWT)
 │    ├── filters/           # Global exception filter — maps Prisma & domain errors
 │    └── interceptors/      # Response transforms, logging
 │
 ├── prisma/                 # Prisma schema + client singleton
 └── main.ts                 # Bootstrap, Swagger setup, Socket.IO adapter
```

---

## 💾 Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Project : creates
    User ||--o{ Issue : reports
    User ||--o{ Issue : assigned_to
    User ||--o{ Comment : writes
    User ||--o{ Notification : receives
    User ||--o{ Watcher : watches

    Project ||--|{ Workflow : governs
    Project ||--o{ Sprint : schedules
    Project ||--o{ Issue : contains
    Project ||--o{ CustomField : defines

    Workflow ||--|{ WorkflowStatus : defines
    Workflow ||--|{ WorkflowTransition : permits

    Sprint ||--o{ Issue : groups

    Issue ||--o{ Comment : holds
    Issue ||--o{ Watcher : has
    Issue ||--o{ ActivityLog : logs
    Issue ||--o{ IssueCustomFieldValue : stores
    Issue ||--o{ Issue : parent_child

    CustomField ||--o{ IssueCustomFieldValue : values
    ActivityLog ||--o{ Notification : triggers
```

### Core Entities

| Entity | Responsibility |
|---|---|
| `User` | Auth identity, assignee, reporter, watcher |
| `Project` | Workspace with key (e.g. `PROJ`), issue counter, workflow config |
| `Workflow` / `WorkflowStatus` / `WorkflowTransition` | Configurable state machine per project |
| `Issue` | Core ticket — title, status, type, priority, version (optimistic lock), parent ref |
| `Sprint` | Time-boxed iteration with velocity tracking |
| `Comment` | Flat threaded discussion on issues |
| `ActivityLog` | Immutable audit trail for every state mutation |
| `Notification` | Per-user in-app inbox driven by activity events |
| `CustomField` | Project-scoped field definitions (TEXT, DROPDOWN, NUMBER, DATE) |
| `Watcher` | Issue subscription for change notifications |

---

## ⚙️ Core Engineering Decisions

### 1. Optimistic Locking — Concurrent Issue Updates

**Problem:** Two engineers update the same issue simultaneously — without coordination, one write silently overwrites the other (dirty write).

**Solution:** Every `Issue` row carries a `version` integer. Mutations execute a conditional update:

```sql
UPDATE issues
SET title = $1, version = version + 1
WHERE id = $2 AND version = $3;
```

If another request already incremented `version`, the `WHERE` clause matches zero rows. The system detects this and returns `409 Conflict`, forcing the client to re-fetch and retry with fresh state.

**Why not pessimistic locking?** `SELECT ... FOR UPDATE` holds a row lock for the duration of the transaction. Under 500+ concurrent users this saturates the connection pool and serializes writes — exactly the opposite of what a collaborative tool needs. Optimistic locking assumes conflicts are rare (they are) and handles them safely without blocking.

---

### 2. Transactional Issue Counter — Sequential Key Generation

**Problem:** Generating keys like `PROJ-1`, `PROJ-2` safely under concurrent issue creation.

**Naive approach:**
```sql
SELECT MAX(issue_number) FROM issues WHERE project_id = $1;
-- Then insert with MAX + 1
```
This is a classic TOCTOU race condition — two simultaneous inserts read the same MAX and generate duplicate keys.

**Solution:** Each `Project` row holds an `issueCounter` integer. Issue creation runs inside a Prisma transaction that atomically increments and reads it:

```typescript
const updated = await tx.project.update({
  where: { id: projectId },
  data: { issueCounter: { increment: 1 } },
  select: { issueCounter: true, key: true },
});
const issueKey = `${updated.key}-${updated.issueCounter}`;
```

PostgreSQL's row-level locking on the single project row serializes only the counter increment — not the full issue write — keeping throughput high.

---

### 3. Workflow State Machine Engine

Issues follow configurable, project-level state machines. Transitions are stored as explicit pairs in `WorkflowTransition`:

```
TODO → IN_PROGRESS → IN_REVIEW → DONE
                 ↑___________|           (back-transition allowed)
```

**On a transition request:**
1. Load all allowed transitions from current status
2. If target status not in allowed set → `422 Unprocessable Entity` with allowed transitions listed
3. If valid → apply transition, execute auto-actions, write activity log, emit WebSocket event

**Auto-actions example — moving to `IN_REVIEW`:**
If `assignee` is null, automatically assign the project lead as reviewer. This is configurable per transition.

```json
{
  "error": "Invalid transition from TODO to DONE",
  "allowedTransitions": ["IN_PROGRESS"]
}
```

---

### 4. Event-Driven Activity & Notification System

Every issue mutation emits a domain event internally (NestJS `EventEmitter2`). Listeners handle side effects in isolation:

```
IssueService.update()
    │
    ├──→ ActivityListener  → writes ActivityLog row
    ├──→ NotificationListener → writes Notification rows for watchers/assignees
    └──→ WebSocketListener → broadcasts to project room
```

This keeps controllers and core business logic free of side-effect code. Adding a future email/push notification channel requires only a new listener — zero changes to existing code.

---

### 5. PostgreSQL Full-Text Search with Cursor Pagination

**Full-text search** uses a GIN index over `tsvector` for sub-millisecond retrieval on millions of rows:

```sql
-- Index (run once after schema push)
CREATE INDEX idx_issues_search ON issues
USING GIN(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'')));

-- Query
SELECT * FROM issues
WHERE to_tsvector('english', title || ' ' || description) @@ plainto_tsquery('english', $1)
  AND project_id = $2
  AND status = $3
ORDER BY created_at DESC;
```

**Cursor pagination** instead of `OFFSET`:

| Approach | Performance at page 1000 |
|---|---|
| `OFFSET 10000` | O(N) — scans and discards 10,000 rows |
| `WHERE created_at < :cursor` | O(log N) — indexed seek, constant cost |

---

### 6. WebSocket Real-Time Sync

**Room isolation:** Clients join `project:{projectId}` on board open, `issue:{issueId}` on issue detail open. Events are broadcast only to relevant rooms — no global fan-out.

**Event types:**

| Event | Trigger |
|---|---|
| `issue_created` | New issue added to project |
| `issue_updated` | Any field change |
| `issue_moved` | Sprint or status change |
| `comment_added` | New comment posted |
| `sprint_updated` | Sprint started or completed |

**Presence tracking:** Active viewers per board are tracked in an in-memory `Map<projectId, Set<userId>>`. When a socket disconnects, the user is removed and a `presence_updated` event is emitted to remaining viewers.

**Missed event replay:** On reconnect, clients send `lastSyncedAt`. The server queries `ActivityLog` for entries after that timestamp and replays them — solving the network drop scenario without requiring a message queue.

---

## 🔌 API Reference

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Authenticate, receive JWT |

### Projects

| Method | Endpoint | Description |
|---|---|---|
| POST | `/projects` | Create project + initialize default workflow |
| GET | `/projects` | List all accessible projects |
| GET | `/projects/:idOrKey` | Get project details |
| GET | `/projects/:idOrKey/board` | Kanban board — issues grouped by status |

### Issues

| Method | Endpoint | Description |
|---|---|---|
| POST | `/projects/:projectId/issues` | Create issue (safe sequential key) |
| GET | `/issues/:idOrKey` | Get issue by ID or key (e.g. `PROJ-42`) |
| PATCH | `/issues/:idOrKey` | Update fields (optimistic lock enforced) |
| POST | `/issues/:idOrKey/transitions` | Transition status via workflow engine |

### Sprints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/projects/:projectId/sprints` | Create sprint in `PLANNING` state |
| GET | `/projects/:projectId/sprints` | List all sprints |
| POST | `/sprints/:id/start` | Activate sprint (enforces only 1 active at a time) |
| POST | `/sprints/:id/complete` | Complete sprint — surfaces incomplete items, calculates velocity |

### Comments

| Method | Endpoint | Description |
|---|---|---|
| POST | `/issues/:issueId/comments` | Add comment (triggers notifications + activity) |
| GET | `/issues/:issueId/comments` | List comments, newest first |

### Watchers & Custom Fields

| Method | Endpoint | Description |
|---|---|---|
| POST | `/issues/:issueId/watch` | Subscribe to issue updates |
| DELETE | `/issues/:issueId/watch` | Unsubscribe |
| POST | `/projects/:projectId/custom-fields` | Define custom field (TEXT, DROPDOWN, NUMBER, DATE) |
| POST | `/issues/:issueId/custom-fields` | Set custom field value on issue |

### Search & Activity

| Method | Endpoint | Description |
|---|---|---|
| GET | `/search?q=...&status=...&assignee=...` | Full-text + structured search, cursor paginated |
| GET | `/projects/:projectId/activity` | Paginated project activity feed |

### Notifications

| Method | Endpoint | Description |
|---|---|---|
| GET | `/notifications` | Fetch in-app inbox |
| PATCH | `/notifications/:id/read` | Mark one as read |
| PATCH | `/notifications/read` | Mark all as read |

---

## 🔄 Key Scenarios

### Scenario 1: Concurrent Issue Updates

1. User A fetches issue at `version: 5`, changes assignee
2. User B fetches same issue at `version: 5`, changes priority
3. User A's PATCH fires first → `version` becomes `6`
4. User B's PATCH arrives → `WHERE version = 5` matches 0 rows → `409 Conflict`
5. User B's client re-fetches (`version: 6`), retries with priority change → succeeds, `version` becomes `7`
6. Both changes applied. Both users receive WebSocket events with final state.

### Scenario 2: Sprint Completion with Carry-Over

```http
POST /sprints/:id/complete
{
  "carryOverIssueIds": ["issue-uuid-1", "issue-uuid-3"]
}
```

- Incomplete issues are surfaced in the response
- Selected issues are moved to the next sprint (or backlog)
- Velocity = sum of `storyPoints` on issues with `status.category = DONE`
- Activity log records the sprint completion event

### Scenario 3: Workflow Violation

```http
POST /issues/PROJ-42/transitions
{ "toStatusId": "done-status-uuid" }

→ 422 Unprocessable Entity
{
  "message": "Invalid transition from TODO to DONE",
  "allowedTransitions": [
    { "id": "...", "name": "IN_PROGRESS" }
  ]
}
```

---

## ⚡ Local Setup

### Prerequisites

- Node.js v20+
- PostgreSQL (local or [Supabase](https://supabase.com) free tier)
- npm

### 1. Clone & Install

```bash
git clone <repository-url>
cd swiggy-assessment
npm install
```

### 2. Environment Variables

```env
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/postgres
JWT_SECRET=your-strong-secret-here
JWT_EXPIRATION=24h
```

### 3. Database Setup

```bash
# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Create GIN full-text search index (run once in your DB)
psql $DATABASE_URL -c "
  CREATE INDEX IF NOT EXISTS idx_issues_search
  ON issues
  USING GIN(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'')));
"
```

### 4. Start Server

```bash
# Development (hot reload)
npm run start:dev

# Production
npm run build && npm run start:prod
```

### 5. Docker (optional)

```bash
docker-compose up --build
```

Launches PostgreSQL + NestJS application. API available at `http://localhost:3000`.

---

## 📊 Engineering Tradeoffs

| Decision | Choice Made | Alternative Considered | Reason |
|---|---|---|---|
| Architecture | Modular Monolith | Microservices | Simpler transactions, faster iteration, no distributed complexity at this scale |
| Concurrency control | Optimistic locking (`version`) | Pessimistic (`SELECT FOR UPDATE`) | Pessimistic locks block connection pool under high concurrency; optimistic scales better |
| Search | PostgreSQL GIN + tsvector | Elasticsearch | Avoided extra infrastructure; Postgres FTS is sufficient for assignment scope, same DB transaction boundary |
| Pagination | Cursor-based (`createdAt < :cursor`) | OFFSET | OFFSET degrades O(N) at depth; cursor is O(log N) with an index |
| Comments | Flat list | Nested/threaded tree | Recursive queries and WebSocket sync for nested trees add significant complexity with marginal UX gain |
| Notifications | DB-only (relational table) | Redis pub/sub + BullMQ | Eliminated external infrastructure; NestJS EventEmitter keeps side effects decoupled — plugging in a queue later requires only a new listener |
| WebSocket presence | In-memory Map | Redis-backed shared state | Single-node deployment makes in-memory sufficient; Redis adapter is the documented upgrade path for horizontal scaling |

---

## 🚀 Future Improvements

If this were a production system at scale, the next engineering investments would be:

- **Redis adapter for Socket.IO** — enables horizontal scaling of WebSocket servers across multiple nodes
- **BullMQ for async notifications** — decouple notification delivery from the request path; enables email/push/Slack integrations
- **Role-based access control (RBAC)** — project-level permissions (Admin, Member, Viewer)
- **Elasticsearch integration** — for cross-project search, faceted filters, and analytics at 10M+ issue scale
- **PgBouncer connection pooling** — manage connection limits under 500+ concurrent users hitting PostgreSQL
- **File attachment support** — S3-backed uploads linked to issues
- **Webhook system** — let external tools subscribe to project events
- **Multi-workspace / organisation support**

---

## 📝 Final Notes

This project prioritizes:

- **Correctness under concurrency** — optimistic locking, transactional counters, atomic transitions
- **Clean architecture** — domain isolation, event-driven side effects, no business logic in controllers
- **Production-grade patterns** — cursor pagination, GIN indexing, WebSocket room isolation, missed event replay
- **Justified tradeoffs** — every non-obvious decision is documented with the reasoning and the acknowledged limitations
