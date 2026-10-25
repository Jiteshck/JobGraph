## Run Locally
1. `npm install -D esbuild@^0.28.`
2. Install dependencies:
   `npm install`
3. Run the app:
   `npm run dev`

## Backend + Neo4j Aura setup

The backend now uses Neo4j as its persistent store; it does not fall back to an in-memory user database.

### 1. Configure Neo4j Aura

1. Create/open a Neo4j AuraDB instance.
2. In Aura, copy the connection URI and database username, and retrieve the database password you set when creating the instance.
3. Copy `.env.example` to `.env` and set `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`, `NEO4J_DATABASE`, and a long random `SECRET_KEY`.
4. Set `ADMIN_EMAILS` to the exact email address(es) that should be granted administrator access. Public signup always creates student accounts.

Never commit or share `.env`. If credentials were previously included in a shared archive, rotate them.

### 2. Install and start the Python API

From the project root, in a virtual environment:

```bash
python -m venv .venv
# Windows PowerShell: .venv\\Scripts\\Activate.ps1
# macOS/Linux: source .venv/bin/activate
python -m pip install -r requirements.txt
python server.py
```

The API listens on `http://127.0.0.1:8000` by default. Startup verifies Aura connectivity and creates the required uniqueness constraints. If the URI, password, or network connection is wrong, startup fails rather than silently switching to demo data.

### 3. Start the existing frontend

In a second terminal:

```bash
npm install
npm run dev
```

Vite runs the existing frontend at `http://localhost:3000` and proxies `/api/*` requests to `http://127.0.0.1:8000`. To change the target, set `API_PROXY_TARGET` before starting Vite.

### 4. Verify the database connection

Open `http://127.0.0.1:8000/api/health`. A healthy response includes `status: "ok"` and a `database.connected: true` value. A database failure returns HTTP 503.

The initial schema includes unique constraints for users, student profiles, skills, jobs, and companies. The user persistence functions create a `(:User)-[:HAS_PROFILE]->(:Student)` relationship for student accounts. The remaining job, company, skill, recommendation, and graph APIs will be implemented in later phases.

### Current phase boundaries

- Implemented: Neo4j driver, connection verification, schema constraints, user persistence adapter, database-aware health endpoint, and local Vite API proxy.
- Next: remove frontend mock fallbacks, complete secure authentication/session handling, and connect student/admin workflows to persistent graph queries.
- Google sign-in must not be treated as production-secure until server-side Google ID-token verification is added.

### Authentication behavior (Phase 2)

- Signup and login require the Python API; the frontend no longer falls back to client-side account creation or accepts an email containing `admin` as proof of administrator access.
- Only an access token is stored in browser localStorage. On reload, the frontend validates it through `GET /api/auth/me`; invalid/expired tokens are removed. Old demo user caches are ignored and cleared.
- Public signup always creates a student account and a unique linked `Student` node. Passwords shorter than 8 characters are rejected.
- Google sign-in is intentionally disabled until Google ID-token verification is configured server-side. A typed email is not proof of Google identity.
- Student routes require a signed-in user in the frontend; admin routes require a user whose role is `admin`. These UI guards are not a substitute for server-side authorization on future protected data endpoints.
- Provision admins explicitly: put the exact email in `ADMIN_EMAILS`, then run `python scripts/create_admin.py`. The script prompts for a password and refuses emails outside the allowlist. Never add admin creation to public signup.

### Windows certificate bundle

`server.py` uses the `certifi` public CA bundle as `SSL_CERT_FILE` when the environment hasn't set a bundle explicitly. This keeps TLS certificate verification enabled for Neo4j Aura. If your environment sets `SSL_CERT_FILE` itself, that value is preserved.


## Phase 3: Student profiles and skills

This phase connects the student profile form and skill management to Neo4j. The existing visual design is preserved.

### New API routes

- `GET /api/skills` — returns the database-backed skill catalogue.
- `GET /api/students/me` — returns the authenticated student's own profile and skill edges.
- `PUT /api/students/me` — updates the authenticated student's profile and selected skill relationships.
- `PUT /api/students/me/skills` — adds, updates proficiency, or removes the authenticated student's skills.

All `/api/students/me` routes require `Authorization: Bearer <token>`. The backend derives the student identity from the verified token; clients cannot choose another student's ID. Email is read-only on the profile because it is the account identity.

On backend startup, `data/skill_catalog.json` seeds the initial 21-skill catalogue with `MERGE` and `ON CREATE`, so existing skill metadata is not overwritten on every restart. Each student skill is stored as a `(Student)-[:HAS_SKILL {proficiency, verified, acquiredDate}]->(Skill)` relationship.

### Scope note

The student profile and skill catalog now use Neo4j. Job/company listings, the wider recommendation engine, and parts of the admin dashboards still contain the existing demo graph service and are scheduled for later phases. Do not treat those areas as database-backed until their phase is implemented.

## Phase 4 — Live job, company, skill and admin data

Job, company, and skill management now uses the Python API and Neo4j Aura rather than the frontend's in-memory arrays.

- Public read endpoints: `GET /api/jobs`, `GET /api/jobs/{job_id}`, `GET /api/companies`, `GET /api/skills`.
- Admin endpoints require a valid Bearer token for a user whose database role is `admin`: `/api/admin/jobs`, `/api/admin/companies`, `/api/admin/skills`, `/api/admin/students`, `/api/admin/stats`.
- Job requirements are stored as `(:Job)-[:REQUIRES_SKILL]->(:Skill)` edges.
- Company links are stored as `(:Job)-[:POSTED_BY]->(:Company)` edges.
- Existing mock jobs/companies are not automatically copied into Aura. Add real companies and jobs from the admin UI after starting the backend.
- Public signup remains student-only. Admins can edit/remove existing student profiles, but cannot create a student login on the student's behalf; students must sign up themselves to set a private password.

The skill-based recommendation engine and graph explorer still require a separate integration phase to make all matching and visualization queries use Neo4j relationships end-to-end.
