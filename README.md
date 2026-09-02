[![CI](https://github.com/AldrionDev/homestreamlab/actions/workflows/ci.yml/badge.svg)](https://github.com/AldrionDev/homestreamlab/actions/workflows/ci.yml)

# HomeStreamLab

HomeStreamLab is a full-stack personal media library application for uploading, browsing and viewing user-owned videos, documents and photos.

The project is built for learning, portfolio and CV/demo purposes. It is not a commercial streaming platform and is designed only for user-owned content.

## Status

Current phase: **MVP development**

Completed:

- Milestone 1 — Project Setup & Planning
- Milestone 2 — Backend Foundation
- Milestone 3 — Database Models
- Milestone 4 — Authentication Backend
- Milestone 5 — Media Backend
- Milestone 6 — Local File Upload Backend
- Milestone 7 — Frontend Foundation
- Milestone 8 — Frontend Authentication
- Milestone 9 — Media Library Frontend

In progress:

- Milestone 10 — Quality & Interview Readiness

Deployment:

- Milestone 11 — Home Lab Deployment Pipeline — optional LAN-only k3s home lab delivery path (see [`docs/deployment.md`](docs/deployment.md))

## Local-First MVP

- This project is a local-first MVP: local development is the default and everything runs on your own machine.
- The only deployment target is an optional LAN-only home lab k3s cluster; there is no public or cloud-hosted environment. See [`docs/deployment.md`](docs/deployment.md) for the deployment path and its limits.
- Uploaded files are stored locally in the backend's `uploads/` folder.
- This project is designed for user-owned content only.
- Cloud storage and deployment are future improvements, not part of the current MVP.

## Tech Stack

### Backend

- NestJS
- TypeScript
- REST API
- Prisma
- PostgreSQL
- JWT Authentication
- Swagger / OpenAPI

### Frontend

Implemented:

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

Build and run the production Docker image:

```bash
docker build -f frontend/Dockerfile -t homestreamlab-frontend --build-arg VITE_API_URL=http://localhost:3000 frontend
docker run --rm -p 8080:8080 homestreamlab-frontend
```

`VITE_API_URL` is baked into the static build at image build time (same convention as `frontend/.env`), so pass the correct backend URL via `--build-arg` for your target environment. The app is then served at `http://localhost:8080`.

### Homelab deployment

The app can be deployed to an optional LAN-only home lab k3s cluster. The frontend image for that environment must be built with `--build-arg VITE_API_URL=http://homestreamlab.homelab.home.arpa`, because the SPA and API share one hostname behind a Traefik `IngressRoute` (plain HTTP, LAN only).

See [`docs/deployment.md`](docs/deployment.md) for the full deployment path, the CI vs. CD split, and known limits, and [`infra/README.md`](infra/README.md) for the Terraform workspace and Jenkins pipeline contract.

## Authentication Test

Register:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "gabor@example.com",
    "password": "password123",
    "displayName": "Gábor"
  }'
```

Login:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "gabor@example.com",
    "password": "password123"
  }'
```

Use the returned access token:

```bash
curl http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Without a valid token, `/auth/me` should return `401 Unauthorized`.

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

The `type` field must be sent before `file` in the form. Multer resolves the
storage folder while it is still parsing the multipart stream, so it only
sees fields that arrived earlier in the request.

Maximum upload size per type:

- `VIDEO` — 500 MB
- `DOCUMENT` — 50 MB
- `PHOTO` — 20 MB

Uploads exceeding the limit for the selected type are rejected with `400 Bad Request`.

`GET /media`, `GET /media/:id`, `POST /media/upload` and `PATCH /media/:id`
responses include a `fileUrl` field (e.g. `/uploads/photos/<uuid>.jpg`) that
points directly at the stored file.

Uploaded files are served locally from `/uploads/...` as a static file mount
(`backend/uploads` mapped to `/uploads`). This is an MVP/local-development
approach: file requests under `/uploads` are **not** JWT-protected, so anyone
who knows or guesses a `fileUrl` can access the file. This is intentional for
the local MVP scope and will be replaced with protected/signed file endpoints
in a future milestone.

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

Not part of the first MVP:

- AWS S3 storage
- Dockerized full application
- EKS deployment
- RDS PostgreSQL
- CloudFront
- Thumbnail generation
- Admin dashboard
- Sharing links
- Refresh tokens
- Role-based access control
- Background workers
- FFmpeg processing

## Project Purpose

The goal of this project is to practice and demonstrate full-stack development with a clean, understandable and portfolio-ready application.

The first version focuses on a simple local MVP before adding cloud infrastructure or advanced media processing.
