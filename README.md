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

Next:

- Milestone 5 — Media Backend
- Milestone 6 — Local File Upload Backend
- Milestone 7 — Frontend Foundation
- Milestone 8 — Frontend Authentication

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

Planned:

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
- Frontend will run locally with Vite
- Uploaded media files will be stored locally in the MVP

## MVP Features

Planned MVP features:

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
````

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
DATABASE_URL="postgresql://homestreamlab_user:homestreamlab_password@localhost:5432/homestreamlab_db?schema=public"
JWT_SECRET="your-development-secret"
JWT_EXPIRES_IN="1d"
```

Run Prisma migration:

```bash
npx prisma migrate dev
```

Optional: run the seed script if available:

```bash
npm run prisma:seed
```

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

### 4. Start the frontend

The frontend will be added in a later milestone.

After the frontend is created, it will be started from the `frontend` folder:

```bash
cd frontend
npm install
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

Planned for upcoming milestones:

```http
GET    /media
GET    /media/:id
POST   /media/upload
PATCH  /media/:id
DELETE /media/:id
```

## Repository Structure

```txt
homestreamlab/
  backend/
  frontend/
  docs/
  docker-compose.yml
  README.md
  .gitignore
```

## Future Improvements

Not part of the first MVP:

* AWS S3 storage
* Terraform infrastructure
* Dockerized full application
* EKS deployment
* RDS PostgreSQL
* CloudFront
* Thumbnail generation
* Admin dashboard
* Sharing links
* Refresh tokens
* Role-based access control
* Background workers
* FFmpeg processing

## Project Purpose

The goal of this project is to practice and demonstrate full-stack development with a clean, understandable and portfolio-ready application.

The first version focuses on a simple local MVP before adding cloud infrastructure or advanced media processing.