# StitchAI

StitchAI is a full-stack custom apparel operations application with a **React**
frontend and a **Java 21 / Spring Boot** REST API. It includes JWT-protected
workflows for orders, quotes, artwork estimates, CRM leads, and a retrieval-
grounded apparel assistant.

## Project layout

```text
stitchai/
├── frontend/                         # React 18 + Vite client
│   ├── src/                          # React application and styles
│   ├── public/legacy/                # Preserved original StitchAI workspace
│   ├── Dockerfile
│   └── vite.config.js                # Proxies /api to Spring Boot in development
├── backend/                          # Java 21 + Spring Boot REST API
│   ├── src/main/java/com/stitchai/api/
│   ├── src/main/resources/           # SQL schema and assistant knowledge base
│   ├── Dockerfile
│   └── pom.xml
├── docker-compose.yml
└── .env.example
```

## Run locally

Prerequisites: Java 21, Maven 3.9+, Node.js 20+, and npm.

1. In the terminal you will use for the backend, create a fresh JWT signing
   secret:

   ```bash
   export JWT_SECRET="$(openssl rand -base64 32)"
   ```

   Keep this value private. Use a different, stable secret for each deployed
   environment. The API intentionally refuses to start without it.

2. In that same terminal, start the API:

   ```bash
   cd backend
   mvn spring-boot:run
   ```

3. Start the frontend in another terminal:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Open **http://localhost:5173**, register an account, and sign in. Vite proxies
   `/api` requests to **http://localhost:8080**.

Set `GEMINI_API_KEY` in the backend environment to enable Gemini-generated
answers. Without it, the assistant answers from the bundled local retrieval
knowledge base. `GEMINI_MODEL` and `PORT` can also be configured with environment
variables.

The H2 database is persisted to `backend/data/` by default. Seed orders and leads
are created on first startup; user-created records persist across restarts. For
deployment with PostgreSQL, set `DATABASE_URL`, `DATABASE_USERNAME`, and
`DATABASE_PASSWORD`; the PostgreSQL JDBC driver is included.

## Included workflows

- Dashboard with orders, order value, payment status, and lead summaries.
- Order progress with stages from inquiry through delivery.
- Saved quotation estimates with garment volume tiers, placements, stitch
  counts, packaging, and turnaround multipliers.
- Embroidery estimates with Madeira thread suggestions, stitch estimates, and
  saved artwork analyses.
- CRM lead pipeline seeded with example records.
- AI assistant with keyword-ranked retrieval from the curated apparel
  knowledge base and optional Gemini generation using retrieved context.
- Preserved original full StitchAI interface under **Classic workspace**.
- Simulated checkout records a clearly marked demo transaction only; it does
  not connect to Stripe or Razorpay or charge a payment method.

The current artwork endpoint calculates a planning estimate from a supplied
filename; it does not upload or inspect image bytes. Use a digitizer-verified
design before manufacturing. The demo payment workflow must not be represented
as real payment processing.

## API

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Create an account |
| `POST` | `/api/auth/login` | Public | Sign in and issue a JWT |
| `GET` | `/api/health` | Public | API health |
| `GET` | `/api/dashboard` | JWT | Dashboard orders and leads |
| `GET`, `POST` | `/api/orders` | JWT | List and create orders |
| `PATCH` | `/api/orders/{id}/stage` | JWT | Advance an order |
| `POST` | `/api/orders/{id}/checkout` | JWT | Record a simulated checkout |
| `GET`, `POST` | `/api/quotes` | JWT | List saved quotes and create a quote |
| `GET` | `/api/leads` | JWT | List CRM leads |
| `POST` | `/api/artworks/analyze` | JWT | Estimate and save artwork metrics |
| `POST` | `/api/ai/chat` | JWT | Ask the retrieval-grounded assistant |
| `GET` | `/api/jobs` | JWT | List example production jobs |

Authenticated requests use `Authorization: Bearer <token>`. Compatibility routes
for the preserved classic workspace are also available under `/api/db/*`,
`/api/quote`, `/api/analyze-artwork`, `/api/gemini/chat`, and
`/api/whatsapp-simulator`.

## Run with Docker Compose

Create a `.env` file at the project root using `.env.example` as a guide. Set
`JWT_SECRET` to a private base64-encoded secret containing at least 32 bytes;
optionally set `GEMINI_API_KEY`. Then run:

```bash
docker compose up --build
```

Open **http://localhost:3000**. The Nginx frontend container serves the React
application and proxies `/api` to Spring Boot. The H2 database is stored in the
Docker `stitchai-data` volume. Back up that volume when preserving production
data; changing or losing the JWT secret invalidates all active sessions.

## Deploy with GitHub, Render, Neon, and Netlify

Netlify serves the React frontend. Render runs the Spring Boot API from the
included `render.yaml`; Neon provides PostgreSQL so account and workflow data
survive free web-service sleeps and redeployments.

These providers offer free plans, but their limits apply: Render free services
can sleep and take time to wake; Neon Free has usage/storage limits and scales
to zero. This setup is intended for a demo or small project, not production
availability. Do not enable paid upgrades unless you have reviewed and approved
the current pricing.

1. Push this project to GitHub. Do not commit `.env`, API keys, database files,
   `frontend/node_modules/`, `frontend/dist/`, or `backend/target/`.
2. Create a Neon Free project and copy the PostgreSQL connection details. Use
   the pooled connection host and require SSL. The JDBC URL format is
   `jdbc:postgresql://<host>/<database>?sslmode=require`; copy the database
   username and password separately. Neon Free is $0/month, with limited
   compute and storage.
3. In Render, choose **New > Blueprint** and connect this repository. Render
   reads `render.yaml` and creates the API as a **Free** Docker web service.
   Supply the Neon database values when prompted. The blueprint automatically
   generates a private base64-encoded `JWT_SECRET`. The blueprint restricts the
   service to the free compute plan and checks `/api/health`.
4. Wait for the service to deploy. Open `<Render service URL>/api/health`; it
   should return JSON with `"status":"healthy"`. Copy the service origin, for
   example `https://stitchai-api.onrender.com`.
5. In Netlify, open **Site configuration > Environment variables** and add
   `VITE_API_URL` with the Render service origin only (no trailing slash and no
   `/api`). Trigger a production redeploy so Vite includes this build-time
   value.
6. In Render, set `CORS_ALLOWED_ORIGIN` to the exact Netlify site origin:
   `https://videm-24eg107f58.netlify.app`. Redeploy the API after changing
   it.
7. Open the Netlify URL on another device, register an account, and verify the
   dashboard. The Render service may need up to a minute to wake after
   inactivity. Neon data remains in the database when Render sleeps.

If `VITE_API_URL` is missing from a production build, the app shows a setup
error rather than sending requests to a nonexistent Netlify API path. Do not
put `JWT_SECRET`, database credentials, or `GEMINI_API_KEY` in Netlify frontend
environment variables: values bundled into the browser are public. Store
secrets only in the backend/database provider settings.

## Security and production notes

- Passwords are hashed using BCrypt. JWT access tokens expire after 12 hours by
  default; set `JWT_EXPIRATION_HOURS` to change the lifetime.
- API endpoints other than registration, login, and health require a valid
  bearer token. CORS defaults to `http://localhost:5173` and
  `http://127.0.0.1:5173`; configure
  `CORS_ALLOWED_ORIGIN` for the deployed frontend.
- Secrets belong in environment configuration, never in source control.
- Configure TLS, managed backups, database migrations, monitoring, and a real
  payment-provider integration before handling production customer or payment
  data. Demo checkout is not a payment gateway.
- Gemini requests send the user's question and retrieved public project
  knowledge to Google's Generative Language API when `GEMINI_API_KEY` is set.
  Do not submit confidential customer, payment, or credential data to the
  assistant.
