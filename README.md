# Job Skill Matcher (JobGraph)

Job Skill Matcher is a graph-database-powered web application that helps students understand how their skills align with job requirements. It stores users, student profiles, skills, jobs, companies, and their relationships in **Neo4j AuraDB**. Students can maintain their profiles and skills, browse jobs, and review skill-based job matches. Administrators manage the job/company data and inspect student and skill information.

> **Security note:** Never commit your real `.env` file, database password, JWT secret, administrator password, or Google OAuth secrets to GitHub.

## Contents

- [Features and dashboards](#features-and-dashboards)
- [Technology stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [First-time setup](#first-time-setup)
  - [1. Get Neo4j Aura ready](#1-get-neo4j-aura-ready)
  - [2. Configure the backend environment](#2-configure-the-backend-environment)
  - [3. Create and activate a Python virtual environment](#3-create-and-activate-a-python-virtual-environment)
  - [4. Install frontend dependencies](#4-install-frontend-dependencies)
  - [5. Create the administrator account](#5-create-the-administrator-account)
  - [6. Start the application](#6-start-the-application)
  - [7. Verify the database connection](#7-verify-the-database-connection)
- [How administrator access works](#how-administrator-access-works)
- [Neo4j graph model](#neo4j-graph-model)
- [Environment variable reference](#environment-variable-reference)
- [Deployment notes](#deployment-notes)
- [Troubleshooting](#troubleshooting)

## Features and dashboards

### Student dashboard

- View and update the student's own profile.
- Add skills and specify proficiency levels.
- Browse published jobs and their required skills.
- View job-match results, match percentages, and skills that may need improvement where available.
- Review the relationship between a student's skills and job requirements.

Each public signup creates a student account. Users cannot register themselves as administrators.

### Administrator dashboard

- View dashboard statistics.
- Manage jobs and companies.
- Manage skills where supported by the admin interface.
- View student records and student-skill information.
- Review job-skill relationships.

Administrator API routes require a valid access token and a user whose role is `admin`.

### Graph data

The application stores graph entities and relationships in Neo4j AuraDB. The graph can be inspected using Neo4j Aura's Query interface or explored in Bloom. Bloom is a separate visualization workspace: nodes that exist in the database may not automatically appear in the currently open Bloom scene.

## Technology stack

- **Frontend:** React, TypeScript, Vite
- **Backend:** Python, FastAPI, Uvicorn
- **Graph database:** Neo4j AuraDB
- **Authentication:** Password-based login, signed JWT access tokens
- **Graph queries:** Cypher

Google sign-in should only be enabled after server-side Google ID-token verification has been implemented and configured. Do not treat a typed email address as proof of Google identity.

## Prerequisites

Install the following before setup:

- Git
- Node.js and npm
- Python 3.10 or a compatible version supported by the project's dependencies
- A Neo4j AuraDB instance

Run all commands from the repository root unless a step says otherwise. On Windows, use PowerShell for the commands below.

## First-time setup

### 1. Get Neo4j Aura ready

1. Open [Neo4j Aura Console](https://console.neo4j.io/) and create a Neo4j AuraDB instance, or open your existing instance.
2. Wait until the instance is running.
3. Open the instance's **Connect** details and copy its connection URI. It will look similar to:
   `neo4j+s://YOUR_INSTANCE.databases.neo4j.io`
4. Note the database username, normally `neo4j`, and the password created for that Aura instance.
5. Note the database name shown by Aura. Use the actual database name in `.env`; do not assume it is the same as the Aura instance ID.

Keep the Aura URI, username, and password private. If a credential has been exposed, rotate it in Aura before continuing.

### 2. Configure the backend environment

Create a local `.env` file by copying `.env.example`.

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

**macOS/Linux:**

```bash
cp .env.example .env
```

Open `.env` and replace the placeholder values. For example:

```dotenv
PORT=8000
HOST=127.0.0.1
ENVIRONMENT=development

NEO4J_URI=neo4j+s://YOUR_INSTANCE.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=YOUR_REAL_AURA_PASSWORD
NEO4J_DATABASE=neo4j

SECRET_KEY=REPLACE_WITH_A_LONG_RANDOM_SECRET
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

ADMIN_EMAILS=admin@example.com

CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173
```

Important:

- Use the real Aura values for `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`, and `NEO4J_DATABASE`.
- Replace `SECRET_KEY` with a long, random secret. Do not use the example value in production.
- Set `ADMIN_EMAILS` to the exact email address that should have administrator access. Multiple addresses can be separated by commas.
- Keep `.env` local and make sure it is ignored by Git.
- Do not add quotes around values unless your environment loader requires them.

To generate a random secret with Python, run:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Copy the generated value into `SECRET_KEY`.

### 3. Create and activate a Python virtual environment

From the project root:

```bash
python -m venv .venv
```

**Windows PowerShell:**

```powershell
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks script activation, use Command Prompt instead:

```bat
.venv\Scripts\activate.bat
```

**macOS/Linux:**

```bash
source .venv/bin/activate
```

Install the backend dependencies:

```bash
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

### 4. Install frontend dependencies

Open a second terminal in the project root. Install the JavaScript dependencies:

```bash
npm install
```

If your repository's `package.json` or build error specifically requires the esbuild version used by this project, follow the repository's dependency instructions. Normally, `npm install` should be the first step rather than installing extra packages blindly.

### 5. Create the administrator account

Administrator access is controlled by the `ADMIN_EMAILS` allowlist and a separately created account. Adding an email to `ADMIN_EMAILS` alone does **not** create the account or set its password.

1. In `.env`, set the exact administrator email. For example:

   ```dotenv
   ADMIN_EMAILS=admin@example.com
   ```

2. Make sure the email you intend to use is exactly the same as the allowlisted email.
3. With the Python virtual environment activated and dependencies installed, run:

   ```bash
   python scripts/create_admin.py
   ```

4. Follow the script's prompts to enter the administrator email and set its password. The script should refuse emails that are not in `ADMIN_EMAILS`.
5. Use that email and password on the login page, then open the administrator dashboard.

Choose a strong, unique password and do not put it in this README, `.env.example`, source code, or GitHub.

If the script cannot connect to Aura, confirm the `.env` values and that the backend machine can reach your Aura instance. If the script reports that the email is not allowed, check `ADMIN_EMAILS` for spelling and whitespace, then run the script again.

**Do not** create an administrator by changing the frontend role or by using a special-looking email. Public signup is student-only; administrator role assignment must be handled by the backend's trusted provisioning process.

### 6. Start the application

Start the backend in the first terminal (with `.venv` activated):

```bash
python server.py
```

The API normally listens at:

`http://127.0.0.1:8000`

Start the frontend in the second terminal:

```bash
npm run dev
```

Vite normally serves the frontend at:

`http://localhost:3000`

Open the URL printed by Vite if it chooses a different port. The local Vite development proxy forwards `/api/*` requests to `http://127.0.0.1:8000`. To use another backend address locally, set `API_PROXY_TARGET` before starting Vite.

### 7. Verify the database connection

Open this endpoint in a browser:

`http://127.0.0.1:8000/api/health`

A healthy response should report `status: "ok"` and `database.connected: true`. If the API reports an error or HTTP 503, check the backend terminal and your Aura connection settings.

On startup, the backend verifies the Neo4j connection and initializes required constraints. The application stores persistent records in Neo4j rather than relying on a temporary in-memory user store.

## How administrator access works

- `ADMIN_EMAILS` is an allowlist of administrator email addresses.
- `python scripts/create_admin.py` provisions the admin account and prompts for its password.
- Public signup creates student accounts only.
- Signing in as a student does not grant access to admin endpoints.
- Admin API requests require a valid bearer token and an account with the `admin` role in the database.
- Changing the frontend UI or a browser-stored role is not a secure way to grant admin access.

If you need to change which email is allowed to be an administrator, update `ADMIN_EMAILS` in the backend environment and restart/redeploy the backend as appropriate. Follow the project's trusted admin-provisioning process to create or update the account. Never share an administrator password.

## Neo4j graph model

The core graph labels and relationships include:

```text
(:User)-[:HAS_PROFILE]->(:Student)
(:Student)-[:HAS_SKILL]->(:Skill)
(:Job)-[:REQUIRES_SKILL]->(:Skill)
(:Job)-[:POSTED_BY]->(:Company)
```

The `HAS_SKILL` relationship can store details such as proficiency. Job-to-skill relationships can store requirement details such as importance and minimum proficiency, depending on the data recorded by the application.

### Inspect the graph in Neo4j Aura Query

Count nodes by label:

```cypher
MATCH (n)
RETURN labels(n) AS NodeType, count(n) AS Total
ORDER BY NodeType;
```

Count relationships by type:

```cypher
MATCH (a)-[r]->(b)
RETURN labels(a) AS From,
       type(r) AS Relationship,
       labels(b) AS To,
       count(*) AS Total
ORDER BY From, Relationship, To;
```

Return connected nodes and relationships for inspection:

```cypher
MATCH (a)-[r]->(b)
RETURN a, r, b
LIMIT 200;
```

### View the graph in Neo4j Bloom

Bloom scenes are separate from the database itself. If a node exists in Aura but is not visible in Bloom:

1. Open Bloom and create or clear a scene.
2. Search for a node label such as `Job` or `Student`.
3. Add matching nodes to the scene.
4. Expand the relevant relationships (`POSTED_BY`, `REQUIRES_SKILL`, or `HAS_SKILL`) to bring connected nodes into view.
5. Search for isolated nodes separately if you want to display every node, including nodes without relationships.

Do not create duplicate records just because they are not currently visible in Bloom.

## Environment variable reference

| Variable | Purpose |
|---|---|
| `PORT` | Backend port. The deployment platform may provide this automatically. |
| `HOST` | Host interface to bind the API to. Local development commonly uses `127.0.0.1`; hosted services should bind to `0.0.0.0`. |
| `ENVIRONMENT` | Environment name, such as `development` or `production`. |
| `NEO4J_URI` | Aura connection URI. |
| `NEO4J_USERNAME` | Aura database username. |
| `NEO4J_PASSWORD` | Aura database password. |
| `NEO4J_DATABASE` | Database name in Aura. |
| `SECRET_KEY` | Secret used to sign application JWTs. Keep it private and stable across instances. |
| `JWT_ALGORITHM` | JWT signing algorithm; the example uses `HS256`. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access-token lifetime in minutes. |
| `ADMIN_EMAILS` | Comma-separated allowlist of admin emails. |
| `CORS_ORIGINS` | Comma-separated browser origins allowed to call the API. Include the exact deployed frontend origin when hosting. |

`.env.example` should contain placeholders only. Do not put real secrets into it.

## Deployment notes

### Frontend on Vercel

- Deploy the frontend repository to Vercel.
- If the project uses a `vercel.json` rewrite to forward `/api/*` to the backend, keep that file in the frontend project root and make sure the destination points to the current backend host.
- After changing Vercel configuration, redeploy and test the login request in the browser Network panel.

### Backend on Render

Configure the backend environment variables in Render's service settings. Set the host to `0.0.0.0` (or ensure the server binds to the platform's required interface) and use the platform-provided port when supported by the server configuration.

For `CORS_ORIGINS`, include the exact frontend origin, for example:

```dotenv
CORS_ORIGINS=https://your-frontend-name.vercel.app
```

Do not include a trailing slash in the origin. After changing backend environment variables, redeploy or restart the service.

Never commit production `.env` files or paste secrets into logs, issues, or chat.

## Troubleshooting

### The backend cannot connect to Neo4j Aura

- Confirm the URI, username, password, and database name.
- Confirm the Aura instance is running.
- Check the backend startup logs.
- Do not disable TLS certificate verification to work around a certificate error. Use a valid CA bundle; the backend may use `certifi` for this.

### Login or API requests return 404 on Vercel

- Check that the deployed frontend has the intended Vercel rewrite configuration for `/api/*`.
- Confirm the rewrite destination points to the Render backend.
- Redeploy after changing `vercel.json`.
- Inspect the request URL and response in the browser Network panel. A Vercel `NOT_FOUND` response often means the request was not forwarded to the backend.

### Browser reports a CORS error

- Add the exact deployed frontend origin to backend `CORS_ORIGINS`.
- Restart or redeploy the backend after changing the setting.
- CORS errors are different from a route returning `404`.

### Admin login fails

- Confirm the email is included exactly in `ADMIN_EMAILS`.
- Run `python scripts/create_admin.py` and follow its prompts.
- Check that the backend is connected to the same Aura database used by the deployed app.
- Do not use public student signup to try to create an admin account.

### A node is missing from Bloom

- Check node counts in Aura Query first.
- If the node exists, search for it and add it to the Bloom scene.
- Expand relationships to display connected nodes.
- Check for isolated nodes separately.

### Google sign-in is unavailable

Google sign-in must not be enabled just by adding a Google button or setting an OAuth client ID. The backend must verify the Google ID token and map the verified identity to an application account. Until that is implemented and configured, use the supported email/password authentication.

---

## Security checklist

- [ ] `.env` is not committed to Git.
- [ ] Aura credentials are private and have not been pasted into source code.
- [ ] `SECRET_KEY` is a long, random secret.
- [ ] `ADMIN_EMAILS` contains only intended administrators.
- [ ] The admin account was created with `python scripts/create_admin.py`.
- [ ] Production `CORS_ORIGINS` contains the exact frontend origin.
- [ ] Google sign-in is not exposed as secure until server-side token verification is implemented.
