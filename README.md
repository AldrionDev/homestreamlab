[![CI](https://github.com/AldrionDev/homestreamlab/actions/workflows/ci.yml/badge.svg)](https://github.com/AldrionDev/homestreamlab/actions/workflows/ci.yml)

# HomeStreamLab

HomeStreamLab is a full-stack personal media library application for uploading, browsing and viewing user-owned videos, documents and photos.

The project is built for learning, portfolio and CV/demo purposes. It is not a commercial streaming platform and is designed only for user-owned content.

## What This Project Demonstrates

Interview-relevant skills exercised end to end in this repository:

- Full-stack development with React (Vite, TypeScript) and NestJS (TypeScript, Prisma, PostgreSQL)
- JWT authentication with protected, per-user data scoping
- Media upload and local file storage with per-type size limits and validation
- Backend and frontend automated tests (Jest, Vitest) plus backend end-to-end tests
- GitHub Actions CI on every pull request, with `main` branch protection requiring the `Backend` and `Frontend` checks
- Production Docker images for the backend and frontend
- Infrastructure as code with Terraform (HCP Terraform Cloud holds remote state only)
- Gated deployment pipeline with a human approval step before any cluster change (Jenkins)
- Least-privilege Kubernetes deployment identity
- Runtime-proven LAN delivery on k3s behind Traefik

## Status

Milestones 1–11 are complete. The local-first MVP is finished, and an optional
LAN-only k3s home-lab deployment path is implemented and runtime-proven. There is
no public or cloud-hosted environment.

| Area | Milestones | State |
| --- | --- | --- |
| Backend foundation, database models | 1–3 | Complete |
| Authentication backend | 4 | Complete |
| Media backend and local file upload | 5–6 | Complete |
| Frontend foundation, auth, media library | 7–9 | Complete |
| Quality, testing and CI | 10 | Complete |
| Home-lab deployment pipeline | 11 | Complete |

Milestone and issue history: [GitHub Milestones](https://github.com/AldrionDev/homestreamlab/milestones).
The deployment path and its limits are documented in [`docs/deployment.md`](docs/deployment.md).

## Local-First MVP

- Local development is the default: everything runs on your own machine (see [Local Setup](#local-setup)).
- An optional, runtime-proven LAN-only home-lab k3s deployment exists. See [`docs/deployment.md`](docs/deployment.md) for the deployment path and its limits.
- There is no public or cloud-hosted environment.
- Uploaded files are stored locally in the backend's `uploads/` folder.
- This project is designed for user-owned content only.
- Local Docker images and the LAN k3s deployment already exist; managed cloud storage and public/cloud hosting remain future improvements.

## Tech Stack

### Backend

- NestJS
- TypeScript
- REST API
- Prisma
- PostgreSQL
- JWT Authentication
- Swagger / OpenAPI
- Jest

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Lucide React
- Embla Carousel
- React Router
- TanStack Query
- Vitest

### Testing & CI

- Backend unit tests (Jest) and end-to-end tests; unit tests need no database
- Frontend component tests (Vitest)
- GitHub Actions CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs `Backend` and `Frontend` jobs on every pull request
- `main` branch protection requires a pull request and the `Backend` and `Frontend` checks

### Delivery & Infrastructure

Used only for the optional LAN-only home-lab deployment; not required for local development.

- Production Docker images for the backend and frontend
- Jenkins gated pipeline: build and publish images, `terraform plan`, human approval, `terraform apply`, verify
- Terraform-managed application resources; HCP Terraform Cloud holds remote state only (Local execution mode)
- k3s single-node cluster with Traefik ingress
- Local container registry for SHA-tagged images
- Least-privilege Kubernetes deployment identity

Details: [`docs/deployment.md`](docs/deployment.md) and [`infra/README.md`](infra/README.md).

### Local Development

- PostgreSQL runs with Docker Compose
- Backend runs locally with npm scripts
- Frontend runs locally with Vite
- Uploaded media files are stored locally in the MVP

## MVP Features

Implemented MVP features:

- User registration
- User login
- JWT protected endpoints
- Media metadata model
- Local file upload
- Media listing
- Media detail page
- Media deletion
- Landing page
- Login and register pages
- Protected app layout
- Media grid
- Upload page
- Simple video, document and photo viewing

## Simple Architecture

```txt
React Frontend
    |
    v
NestJS REST API
    |
    +--> PostgreSQL
    |
    +--> Local uploads folder
```

The diagram above is the local development topology. The LAN-only home-lab
deployment topology (k3s, Traefik, persistent volumes) is described in
[`docs/deployment.md`](docs/deployment.md).

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/AldrionDev/homestreamlab.git
cd homestreamlab
```

### 2. Start PostgreSQL

From the project root:

```bash
docker compose up -d
```

This starts the local PostgreSQL database.

### 3. Start the backend

Go to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file based on `.env.example`.

Example:

```env
DATABASE_URL="postgresql://homestreamlab_user:homestreamlab_password@localhost:5433/homestreamlab?schema=public"
JWT_SECRET="your-development-secret"
JWT_EXPIRES_IN="1d"
```

Run Prisma migration:

```bash
npx prisma migrate dev
```

Seed the database with local demo data:

```bash
npx prisma db seed
```

This creates a demo user you can log in with (see [Demo login](#demo-login-local-development-only) below).

Start the backend:

```bash
npm run start:dev
```

Backend URL:

```txt
http://localhost:3000
```

Swagger API docs:

```txt
http://localhost:3000/api
```

Health check:

```txt
http://localhost:3000/health
```

Expected response:

```json
{
  "status": "ok"
}
```

#### Local server config

The backend, frontend and CORS settings are tied together through these local defaults:

- Backend listens on `PORT` (default `3000`).
- Frontend calls the backend through `VITE_API_URL` (default `http://localhost:3000`, set in `frontend/.env.example`).
- Backend allows browser requests from the frontend through `FRONTEND_ORIGIN` (default `http://localhost:5173`), used for CORS.

Both `PORT` and `FRONTEND_ORIGIN` are documented in `backend/.env.example`. Existing developers do not need to change their local `.env` file — these defaults match the current local setup.

#### Demo login (local development only)

After seeding the database, you can log in with:

- Email: `demo@homestreamlab.com`
- Password: `Password123!`

This account and its sample media items are local development data only. They are created by `backend/prisma/seed.ts` and are not real credentials for any deployed environment.

### 4. Start the frontend

Go to the frontend folder:

```bash
cd frontend
npm install
```

Create a `.env` file based on `.env.example` (defaults already point at the local backend):

```env
VITE_API_URL=http://localhost:3000
```

Start the frontend dev server:

```bash
npm run dev
```

Frontend URL:

```txt
http://localhost:5173
```

## Useful Backend Commands

From the `backend` folder:

```bash
npm run start:dev
```

Run Prisma Studio:

```bash
npx prisma studio
```

Run database migration:

```bash
npx prisma migrate dev
```

Generate Prisma Client:

```bash
npx prisma generate
```

Run build:

```bash
npm run build
```

Run lint:

```bash
npm run lint
```

Run tests:

```bash
npm test
```

`npm test` runs the backend unit tests and does **not** require a running database.

Run end-to-end tests:

```bash
npm run test:e2e
```

`npm run test:e2e` requires PostgreSQL running with migrations applied (`docker compose up -d` and `npx prisma migrate dev`/`deploy`) and a `JWT_SECRET` environment variable set.

## Useful Frontend Commands

From the `frontend` folder:

```bash
npm run dev
```

Run build:

```bash
npm run build
```

Run lint:

```bash
npm run lint
```

Run tests:

```bash
npm test
```

`npm test` runs the frontend component tests with Vitest and does **not** require a running database.

Build and run the production Docker image locally:

```bash
docker build -f frontend/Dockerfile -t homestreamlab-frontend --build-arg VITE_API_URL=http://localhost:3000 frontend
docker run --rm -p 8080:8080 homestreamlab-frontend
```

`VITE_API_URL` is baked into the static build at image build time, so pass the correct backend URL via `--build-arg` for your target environment. The app is then served at `http://localhost:8080`.

For the optional LAN-only home-lab (k3s) image build and deployment, see [`docs/deployment.md`](docs/deployment.md) and [`infra/README.md`](infra/README.md).

## Quick Verify

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"gabor@example.com","password":"password123","displayName":"Gábor"}'

# Login (returns an access token)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"gabor@example.com","password":"password123"}'

# Authenticated request
curl http://localhost:3000/auth/me -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Without a valid token, `/auth/me` returns `401 Unauthorized`.

## Current Backend API

### Auth

```http
POST /auth/register
POST /auth/login
GET  /auth/me
```

### Health

```http
GET /health
```

### Media

JWT-protected, scoped to the authenticated user's own media items:

```http
GET    /media
GET    /media/:id
POST   /media/upload
PATCH  /media/:id
DELETE /media/:id
```

`POST /media/upload` accepts a `multipart/form-data` body:

- `file` — the media file
- `title` — required
- `type` — required, one of `VIDEO` / `DOCUMENT` / `PHOTO`
- `description` — optional
- `category` — optional

The `type` field must be sent before `file` in the form, because the upload
handler resolves the storage folder while the multipart stream is still parsing.

Maximum upload size per type:

- `VIDEO` — 500 MB
- `DOCUMENT` — 50 MB
- `PHOTO` — 20 MB

Uploads exceeding the limit for the selected type are rejected with `400 Bad Request`.

`GET /media`, `GET /media/:id`, `POST /media/upload` and `PATCH /media/:id`
responses include a `fileUrl` field (e.g. `/uploads/photos/<uuid>.jpg`) that
points directly at the stored file.

Uploaded files are served from `/uploads/...` as a static file mount
(`backend/uploads` mapped to `/uploads`) and are **not** JWT-protected — anyone
who knows or guesses a `fileUrl` can access the file. This is intentional for
the local MVP scope.

`DELETE /media/:id` also removes the media item's local file from disk. If the
file is already missing, deletion still succeeds and the database record is
removed; if the file cannot be deleted for another reason, the request fails
and the database record is kept.

## Repository Structure

```txt
homestreamlab/
  backend/
  frontend/
  infra/
  docs/
  docker-compose.yml
  README.md
  .gitignore
```

## Future Improvements

Out of scope for the current project. Local Docker images and the LAN-only k3s
deployment already exist and are **not** in this list.

Managed cloud / public hosting:

- AWS S3 storage
- RDS PostgreSQL
- EKS deployment
- CloudFront

Application features:

- Thumbnail generation
- Admin dashboard
- Sharing links
- Refresh tokens
- Role-based access control
- Background workers
- FFmpeg processing

## Project Purpose

The goal of this project is to practice and demonstrate full-stack development with a clean, understandable and portfolio-ready application.

It is a local-first MVP with a real infrastructure-as-code and gated home-lab delivery path. Managed cloud infrastructure and advanced media processing remain out of scope.
