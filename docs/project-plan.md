# HomeStreamLab Project Plan

## Project Goal

HomeStreamLab is a full-stack personal media library application.

The goal of the project is to allow users to upload, browse, and view their own videos, documents, and photos in a clean web interface.

This project is built for learning, portfolio, and CV/demo purposes. It is not intended to be a commercial streaming platform.

The first version will focus on a simple local MVP that is easy to understand, easy to run locally.

## MVP Scope

The first MVP should include the core features needed for a personal media library.

### Included in the MVP

- project structure and documentation
- NestJS backend
- PostgreSQL with Docker Compose
- Prisma setup
- user registration
- user login
- JWT protected endpoints
- media metadata model
- local file upload
- media listing
- media detail page
- media deletion
- React frontend
- landing page
- login page
- register page
- protected app layout
- media grid
- upload page
- simple video viewer
- simple document viewer
- simple photo viewer

### Not Included in the First MVP

These features are intentionally left out of the first MVP to keep the project simple and focused:

- AWS S3 storage
- Terraform infrastructure
- Kubernetes
- EKS
- ECR
- RDS PostgreSQL
- CloudFront
- Redis
- background workers
- FFmpeg processing
- thumbnail generation
- admin dashboard
- role-based access control
- refresh token rotation
- OAuth login
- email verification
- public sharing links

## Frontend Stack

The frontend will be built with:

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

### Frontend Direction

The frontend should be clean, modern, and dark-theme first.

The design direction:

- landing page inspired by modern creative product pages
- logged-in app layout inspired by media library applications
- dark card-based media browsing
- simple and readable UI
- subtle animations only where they improve the user experience

## Backend Stack

The backend will be built with:

- NestJS
- TypeScript
- REST API
- Prisma
- PostgreSQL
- JWT Authentication
- Multer for local file upload
- Swagger / OpenAPI

### Backend Direction

The backend should use a simple NestJS structure:

- module
- controller
- service
- dto

Prisma should be used directly from services through a `PrismaService`.

The backend should avoid unnecessary abstractions in the first MVP.

For the first MVP, the app should use one media module instead of separate modules for videos, documents, and photos.

Media items will be distinguished by type:

- VIDEO
- DOCUMENT
- PHOTO

## Simple Architecture

The project will use a monorepo structure:

```txt
homestreamlab/
├── backend/
├── frontend/
├── docs/
├── README.md
└── .gitignore
````

### Backend Structure

Planned backend structure:

```txt
backend/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── prisma/
│   ├── auth/
│   ├── users/
│   └── media/
├── prisma/
├── uploads/
├── package.json
└── .env.example
```

### Frontend Structure

Planned frontend structure:

```txt
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── routes/
│   ├── lib/
│   ├── hooks/
│   ├── App.tsx
│   └── main.tsx
├── public/
├── package.json
└── .env.example
```

The exact structure may change slightly during implementation, but the first MVP should stay simple.

## Database Plan

The first database version should stay minimal.

Planned models:

* User
* MediaItem

### User

The `User` model should store basic account data.

Planned fields:

* id
* email
* passwordHash
* createdAt
* updatedAt

### MediaItem

The `MediaItem` model should store metadata about uploaded files.

Planned fields:

* id
* title
* description
* type
* category
* filename
* originalFilename
* mimeType
* size
* filePath
* ownerId
* createdAt
* updatedAt

The actual file will be stored locally in the backend during the first MVP.

## Planned Pages

### Public Pages

* Landing page
* Login page
* Register page

### Protected Pages

* Media library page
* Upload media page
* Media detail page

### Media Viewing

The media detail page should support simple viewing for:

* videos
* documents
* photos

The first version should be simple. Advanced preview generation, thumbnails, and file processing are not part of the MVP.

## Planned API Endpoints

The backend will expose a simple REST API.

### Health

```txt
GET /health
```

Used to check if the backend is running.

### Authentication

```txt
POST /auth/register
POST /auth/login
GET /auth/me
```

Used for user registration, login, and reading the current authenticated user.

### Media

```txt
POST /media
GET /media
GET /media/:id
GET /media/:id/file
DELETE /media/:id
```

Used for uploading, listing, viewing, downloading/streaming, and deleting media items.

The exact endpoint names may be adjusted during implementation, but the API should stay simple and REST-based.

## Development Roadmap

The project will be developed step by step using GitHub milestones and issues.

### Milestone 1 — Project Setup & Planning

Goal:

Set up the repository, base folders, README, and project planning documentation.

Includes:

* initial monorepo structure
* root README
* project plan document
* GitHub milestones and issues

### Milestone 2 — Backend Foundation

Goal:

Create the initial NestJS backend and local database setup.

Includes:

* NestJS backend initialization
* PostgreSQL Docker Compose setup
* Prisma installation
* Prisma configuration
* health check endpoint

### Milestone 3 — Authentication

Goal:

Add simple JWT-based authentication.

Includes:

* user registration
* user login
* password hashing
* JWT generation
* JWT guard
* protected endpoint example

### Milestone 4 — Media Backend

Goal:

Add backend support for media metadata and local file uploads.

Includes:

* MediaItem Prisma model
* media module
* upload endpoint
* list endpoint
* detail endpoint
* file serving endpoint
* delete endpoint

### Milestone 5 — Frontend Foundation

Goal:

Create the initial React frontend structure.

Includes:

* React + Vite + TypeScript setup
* Tailwind CSS setup
* shadcn/ui setup
* React Router setup
* basic layout setup

### Milestone 6 — Frontend Authentication

Goal:

Build login and registration UI and connect it to the backend.

Includes:

* register page
* login page
* auth API integration
* local JWT handling for the MVP
* protected routes

### Milestone 7 — Media Frontend

Goal:

Build the main media library user experience.

Includes:

* protected app layout
* media grid
* upload page
* media detail page
* video viewer
* document viewer
* photo viewer
* delete media action

### Milestone 8 — Polish, Documentation & Demo Preparation

Goal:

Prepare the project for portfolio and interview presentation.

Includes:

* README cleanup
* screenshots or demo notes
* API documentation
* manual test checklist
* final code cleanup
* final MVP review

## Development Principles

The project should follow these principles:

* keep the first MVP simple
* avoid overengineering
* avoid unnecessary abstractions
* prefer readable code over clever code
* build one milestone at a time
* keep features small and testable
* document important decisions
* focus on a project that is easy to explain in interviews

## Notes

HomeStreamLab is a learning and portfolio project.

The goal is not to build a production-grade streaming platform. The goal is to build a clean, realistic, understandable full-stack application that demonstrates backend, frontend, database, authentication, upload, and basic media browsing skills.
