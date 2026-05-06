# HomeStreamLab

HomeStreamLab is a full-stack personal media library application.

The goal of the project is to let users upload, browse, and view their own videos, documents, and photos in a clean web interface.

This project is built for portfolio and CV/demo purposes. It is not intended to be a commercial streaming platform.

## Project Goal

The main goal of HomeStreamLab is to build a simple but realistic full-stack application step by step.

The first version will focus on a local MVP where users can:

- register an account
- log in
- upload their own media files
- browse uploaded media
- view media details
- open videos, documents, and photos
- delete their own media items

## Planned Tech Stack

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

### Backend

- NestJS
- TypeScript
- REST API
- Prisma
- PostgreSQL
- JWT Authentication
- Multer for local file upload
- Swagger / OpenAPI

### Local Development

- PostgreSQL running with Docker Compose
- Backend running locally with npm scripts
- Frontend running locally with Vite
- Uploaded files stored locally in the first MVP

## MVP Features

The first MVP should include:

- project structure and documentation
- NestJS backend setup
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
- React frontend setup
- landing page
- login and register pages
- protected app layout
- media grid
- upload page
- simple video, document, and photo viewing

## Future Improvements

These features are intentionally not part of the first local MVP, but may be added later:

- AWS S3 storage
- Terraform infrastructure
- Dockerized full application
- ECR
- EKS deployment
- RDS PostgreSQL
- CloudFront
- thumbnail generation
- admin dashboard
- sharing links
- refresh tokens
- role-based access control
- background workers
- Redis / queues
- FFmpeg processing

## Project Structure

```txt
homestreamlab/
├── backend/
├── frontend/
├── docs/
├── README.md
└── .gitignore
```

## Development Roadmap

The roadmap below shows the planned implementation order for the local MVP and later improvements.

### Milestone 1 — Project Setup & Planning

Set up the initial repository structure and project documentation.

Includes:

- monorepo folder structure
- initial README
- project plan documentation
- GitHub issues and milestones

### Milestone 2 — Backend Foundation

Create the basic NestJS backend and connect it to a local PostgreSQL database.

Includes:

- NestJS backend initialization
- PostgreSQL with Docker Compose
- Prisma setup
- basic backend configuration
- health check endpoint

### Milestone 3 — Authentication

Add simple user authentication for the MVP.

Includes:

- user registration
- user login
- password hashing
- JWT authentication
- protected backend endpoints

### Milestone 4 — Media Backend

Add backend support for media metadata and local file uploads.

Includes:

- media database model
- media module
- local file upload with Multer
- media listing endpoint
- media detail endpoint
- media delete endpoint

### Milestone 5 — Frontend Foundation

Create the basic React frontend structure with routing and styling.

Includes:

- React + Vite + TypeScript setup
- Tailwind CSS setup
- shadcn/ui setup
- React Router setup
- basic layout structure

### Milestone 6 — Frontend Authentication

Connect the login and registration pages to the backend authentication API.

Includes:

- register page
- login page
- authentication API calls
- storing JWT locally for the MVP
- protected frontend routes

### Milestone 7 — Media Frontend

Build the main media browsing, upload, detail, and viewing experience.

Includes:

- protected app layout
- media grid
- upload page
- media detail page
- video viewer
- image viewer
- document viewer
- delete action

### Milestone 8 — Polish, Documentation & Demo Preparation

Clean up the project and prepare it for portfolio/CV presentation.

Includes:

- README improvements
- project screenshots or demo notes
- API documentation
- manual test checklist
- code cleanup
- final MVP review

## Current Status

The project is currently in Milestone 1, focused on project setup, planning, and documentation.