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
are created on first startup; user-created records persist across restarts.
Override the connection using `DATABASE_URL`, `DATABASE_USERNAME`, and
`DATABASE_PASSWORD` when deploying with another SQL database, and add that
database's JDBC driver to `backend/pom.xml`.

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

## Deploy with GitHub and Netlify

Netlify deploys the **React frontend**. It does not run this Spring Boot
application as a normal Netlify site, so first deploy the `backend/` service to
a Java/Docker host that provides persistent storage. The steps below use Railway
for the API and Netlify for the frontend.

1. Push this project to your GitHub repository. Do not commit `.env`, API keys,
   database files, `frontend/node_modules/`, `frontend/dist/`, or
   `backend/target/`.
2. In Railway, create a project and deploy the GitHub repository as a service.
   Set the service's **Root Directory** to `/backend`; Railway will build its
   `Dockerfile`. Generate a public domain and add a Railway volume mounted at
   `/var/data`.
3. Add these variables to the Railway service:

   ```text
   JWT_SECRET=<a newly generated private base64 secret of at least 32 bytes>
   DATABASE_URL=jdbc:h2:file:/var/data/stitchai;DB_CLOSE_ON_EXIT=FALSE
   DATABASE_USERNAME=sa
   DATABASE_PASSWORD=
   JWT_EXPIRATION_HOURS=12
   ```

   Optionally set `GEMINI_API_KEY` and `GEMINI_MODEL`. Railway supplies `PORT`.
   Configure its health check path as `/api/health`. Wait until the service is
   healthy and copy its public URL.
4. In Netlify, import the same GitHub repository. The included `netlify.toml`
   configures the frontend build and publish directory, including the
   single-page-app route fallback. Copy the Netlify site origin, for example
   `https://your-site.netlify.app`.
5. In Railway, set `CORS_ALLOWED_ORIGIN` to the exact Netlify site origin. Add
   production custom-domain origins as comma-separated values, then redeploy
   the backend.
6. In Netlify's environment variables, set `VITE_API_URL` to the Railway public
   API URL, for example `https://your-api.up.railway.app` (without a trailing
   `/api`). Trigger a new Netlify deploy after setting it.
7. Open the Netlify URL, register an account, and check the dashboard. If the
   frontend or API URL changes, update the corresponding environment variable
   and redeploy the affected service.

If `VITE_API_URL` is missing from a production build, the app shows a setup
error rather than sending requests to a nonexistent Netlify API path. Do not
put `JWT_SECRET` or `GEMINI_API_KEY` in Netlify frontend environment variables:
values bundled into the browser are public. Store those secrets only in the
backend host's secret environment settings.

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
