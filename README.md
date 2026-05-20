# Swiggy SDE-1 Backend Engineering Assignment: Jira-Like Modular Monolith

A robust, enterprise-grade, and performance-oriented backend built with **NestJS**, **Prisma**, **PostgreSQL**, and **Socket.IO**. 

This system acts as a production-grade backend for a Jira-like ticket tracking application. It demonstrates mature architectural decisions, strict database modeling, highly concurrency-safe state transitions, and real-time collaboration engines.

---

## 🚀 Key Architectural & Engineering Decisions

### 1. Database Concurrency Control (Optimistic Locking)
To handle the scenario where two SDEs edit the same issue simultaneously:
- Instead of using heavy database row locks (pessimistic locking) which block connection pools and degrade scalability, I employ **Optimistic Locking**.
- Every `Issue` record maintains a `version` field. When a mutation is triggered, Prisma executes an update constraint matching the loaded version:
  ```sql
  UPDATE issues 
  SET title = :newTitle, version = version + 1 
  WHERE id = :issueId AND version = :currentVersion;
  ```
- If another process altered the issue in the interim, the condition `version = :currentVersion` fails. The count of updated rows returns `0`, causing the backend to throw a `409 Conflict` error. This prompts the client to refresh its stale copy and prevents dirty writes.

### 2. Transactional Issue Counter (Safe Sequential Numbering)
Agile boards represent issues with alphanumeric sequential keys, e.g., `PROJ-1`, `PROJ-2`.
- Querying `MAX(issue_number)` on the issues table repeatedly causes performance degradation and race conditions under concurrent workloads.
- I maintain a dedicated `issueCounter` integer directly inside the `Project` model.
- Upon issue creation, I execute a single Prisma transaction that increments the project's counter and returns the incremented counter to assign to the new issue:
  ```typescript
  const updatedProject = await tx.project.update({
    where: { id: projectId },
    data: { issueCounter: { increment: 1 } },
    select: { issueCounter: true }
  });
  const issueNumber = updatedProject.issueCounter;
  ```
- This ensures 100% sequential integrity under concurrent creations with zero table scans.

### 3. State-Machine Workflow Engine & Transition Validation
Workflows are modeled as a formal state machine inside the database:
- Transitions must match defined pairs in the `WorkflowTransition` table (e.g. `TODO -> IN_PROGRESS`, `IN_PROGRESS -> IN_REVIEW`).
- Attempting an invalid move (e.g., trying to jump from `TODO` straight to `DONE` when not permitted) results in a `422 Unprocessable Entity` response returning an array of valid allowed states from the current status.
- **Automated Workflow Actions**: Moving an issue status to `IN_REVIEW` automatically sets the reporter or project lead as the assignee/reviewer if it is left blank.

### 4. PostgreSQL GIN Full-Text Search with Cursor Pagination
To support high-speed issue searches over millions of tickets:
- I leverage PostgreSQL's native `tsvector` and `plainto_tsquery` to match text against aggregated title and description vectors dynamically.
- This dynamic compilation ensures sub-millisecond retrieval speeds with native query planning.
- I avoid `OFFSET` pagination (which suffers from $O(N)$ linear degradation as offset sizes grow). Instead, I enforce **Cursor Pagination** using timestamps (`createdAt < :cursor`) to maintain stable $O(\log N)$ performance regardless of dataset depth.

### 5. WebSockets, Presence, & Missed Event Replay
- **Socket.IO Room Isolation**: WebSockets are divided into namespaces and isolated rooms (`project:{projectId}`) to restrict broadcasts only to active project viewers.
- **Lightweight Presence Tracking**: Active SDEs viewing a project are tracked in an optimized, high-performance in-memory Map, ensuring zero socket timeout overheads or external dependencies.
- **Missed Event Replay**: Sockets that disconnect and reconnect emit a `sync_events` command sending their `lastSyncedAt` timestamp. The backend queries `ActivityLog` entries matching the project created after that time and replays missed operations to the client, solving network drop scenarios.

---

## 🛠️ Technology Stack

- **Framework**: NestJS (TypeScript Monolith Modular Architecture)
- **Database**: PostgreSQL (Relational consistency, custom GIN full-text indexes)
- **ORM**: Prisma ORM v7 (Standard configurations and typesafe client queries via PostgreSQL driver adapter)
- **Realtime**: Socket.IO WebSockets (Namespaces & room separation)
- **Security**: Passport JWT Auth Guard & BCrypt password hashing
- **Documentation**: Swagger OpenAPI interactive docs

---

## 📂 Code Organization & Directory Structure

Adhering to a clean **Modular Monolith Architecture**, each feature folder contains its own self-contained domain components:

```
src/
 ├── modules/
 │    ├── auth/            # JWT authentication & User registration
 │    ├── projects/        # Project CRUD, keys, and Board API
 │    ├── issues/          # Issues CRUD, optimistic locking (versioning)
 │    ├── workflow/        # Custom Workflow validation engine & auto-actions
 │    ├── sprints/         # Sprint planning, start/complete, carry-overs, velocity
 │    ├── comments/        # Flat comments list on issues
 │    ├── activity/        # Event-driven activity logs (audit trail)
 │    ├── notifications/   # DB-only in-app notification box
 │    ├── websocket/       # Socket.IO Gateway, presence rooms, missed event replay
 │    └── fields/          # Watchers & TEXT/DROPDOWN custom issue fields
 ├── common/
 │    ├── guards/          # JwtAuthGuard (APP_GUARD - secured by default)
 │    ├── decorators/      # CurrentUser, @Public (bypass JWT)
 │    ├── filters/         # HttpExceptionFilter (maps Prisma errors, 409, 422 formats)
 ├── prisma/               # Schema configurations
 └── main.ts               # Application entrypoint & Swagger bootstrap
```

---

## 💾 Database Schema ERD (Prisma representation)

```mermaid
erDiagram
    User ||--o{ Project : creates
    User ||--o{ Issue : reports
    User ||--o{ Issue : assigned
    User ||--o{ Comment : writes
    User ||--o{ Notification : receives
    Project ||--|{ Workflow : governs
    Project ||--o{ Sprint : schedules
    Project ||--o{ Issue : contains
    Workflow ||--|{ WorkflowStatus : defines
    Workflow ||--|{ WorkflowTransition : permits
    Issue ||--o{ Comment : holds
    Issue ||--o{ Watcher : has
    Issue ||--o{ IssueCustomFieldValue : stores
    CustomField ||--o{ IssueCustomFieldValue : values
```

---

## ⚙️ Setup & Local Installation

### Prerequisites
- Node.js v20.x
- PostgreSQL instance (local or hosted, e.g., Neon/Supabase)
- *Optional*: Docker & Docker Compose (if installing dependencies via container)

### Step 1: Clone and install packages
```bash
npm install
```

### Step 2: Configure Environment Variables
Create a `.env` file in the root directory (or copy `.env.example`) and replace the placeholders with your own values:
```env
PORT=3000
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/postgres" # use your own DB host/user/password
JWT_SECRET="replace-with-a-strong-secret" # keep this secret safe
JWT_EXPIRATION="24h"
PRISMA_CLIENT_ENGINE_TYPE="library"
```

### Step 3: Run Database Sync
Initialize the schema and tables in the target database:
```bash
npx prisma db push
```

### Step 4: GIN Search Index Creation SQL
To build the Generalized Inverted Index (GIN) on the issue text search vectors in PostgreSQL for maximum lookup speeds, run the following SQL command on your target database:
```sql
CREATE INDEX idx_issues_search ON issues USING GIN(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));
```

### Step 5: Start the Server
```bash
# Run in development mode
npm run start:dev

# Run in production mode
npm run build
npm run start:prod
```

### Step 6: Docker Container Launch (Optional)
If Docker is installed in your target server:
```bash
docker-compose up --build
```
This launches a PostgreSQL image and the NestJS application container, binding port `3000`.

---

## 📖 API Walkthrough & Swagger Docs

Once the application starts, navigate to the interactive OpenAPI playground:
👉 **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

### Complete API Endpoint Index

| Module | Method | Route | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | POST | `/auth/register` | Create a user account |
| **Auth** | POST | `/auth/login` | Authenticate and obtain JWT token |
| **Projects** | POST | `/projects` | Initialize a project and default workflow |
| **Projects** | GET | `/projects` | List all projects |
| **Projects** | GET | `/projects/:idOrKey` | Retrieve single project details |
| **Projects** | GET | `/projects/:idOrKey/board` | Get board statuses and issues grouped for Kanban |
| **Issues** | POST | `/projects/:projectId/issues` | Create an issue (safely serialized numbering) |
| **Issues** | GET | `/issues/:idOrKey` | Retrieve single issue details by ID or Key |
| **Issues** | PATCH | `/issues/:idOrKey` | Update issue (concurrency & transition validation) |
| **Issues** | POST | `/issues/:idOrKey/transitions` | Explicit status state machine changes |
| **Sprints** | POST | `/projects/:projectId/sprints` | Create a new sprint in PLANNING stage |
| **Sprints** | GET | `/projects/:projectId/sprints` | List all sprints for a project |
| **Sprints** | POST | `/sprints/:id/start` | Activate a planning sprint (asserts only 1 active allowed) |
| **Sprints** | POST | `/sprints/:id/complete` | Complete active sprint, compute velocity & carry-overs |
| **Comments** | POST | `/issues/:issueId/comments` | Add flat comment to issue (triggers event notifications) |
| **Comments** | GET | `/issues/:issueId/comments` | List issue comments, sorted newest first |
| **Fields & Watchers** | POST | `/projects/:projectId/custom-fields` | Define custom fields (TEXT/DROPDOWN) for project |
| **Fields & Watchers** | POST | `/issues/:issueId/custom-fields` | Set custom field values on specific ticket |
| **Fields & Watchers** | POST | `/issues/:issueId/watch` | Subscribe to watch ticket updates |
| **Fields & Watchers** | DELETE | `/issues/:issueId/watch` | Unwatch ticket updates |
| **Search** | GET | `/search` | Full-Text Search (GIN-driven) + cursor pagination |
| **Activity** | GET | `/projects/:projectId/activity` | Get project activity log history with cursor pagination |
| **Notifications** | GET | `/notifications` | Fetch user in-app notification inbox |
| **Notifications** | PATCH | `/notifications/read` | Mark all notifications as read |
| **Notifications** | PATCH | `/notifications/:id/read` | Mark specific notification as read |

---

## 📈 Engineering Tradeoffs Made

1. **Monolith vs. Microservices**:
   - *Choice*: I built a **Modular Monolith**.
   - *Tradeoff*: A monolith is far faster to deploy, has no network latency between service boundaries, sharing transaction contexts is trivial, and is much simpler to verify. By keeping domains strictly separated into clean self-contained NestJS modules, this codebase can be split into individual microservices in the future with minimal refactoring.
2. **Optimistic vs. Pessimistic Locking**:
   - *Choice*: **Optimistic locking** using a `version` count.
   - *Tradeoff*: Pessimistic locking (blocking DB rows) degrades performance dramatically as user count increases. Optimistic locking maintains maximum throughput by assuming conflicts are rare but handles them safely, mapping conflict exceptions to standard HTTP `409` payloads.
3. **Database-Only Notifications**:
   - *Choice*: Standard relational tables.
   - *Tradeoff*: I avoided setting up email queues (RabbitMQ/BullMQ) or push notification servers to minimize infrastructure overhead. Since DB notifications are fully decoupled using NestJS events, connecting an external push gateway later requires editing only a single event listener without modifying core controllers.
# swiggy-assesment
