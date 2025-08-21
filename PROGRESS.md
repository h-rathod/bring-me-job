# Bring Me Job - Progress Tracker

## Step 1: Backend Foundation

- [x] Initialized project structure (frontend, backend folders).
- [x] Set up Node.js/Express/TypeScript server in backend.
- [x] Configured Prisma with PostgreSQL and defined all database models.
- [x] Implemented /api/auth/register endpoint.
- [x] Implemented /api/auth/login endpoint with JWT.
- [x] Created .env.example with necessary variables.


## Step 2: Frontend with Modern Aesthetics

- [x] Initialized React/Vite/TypeScript project with Tailwind CSS.
- [x] Set up a minimal main layout with a functional theme switcher.
- [x] Header includes Profile, Logout, and Theme Switcher actions.
- [x] Created modern, minimal Login/Registration pages.
- [x] Implemented API calls with toast notifications for user feedback.
- [ ] Implemented JWT storage and protected routing.

### UI System

- [x] Integrated shadcn/ui (Vite) and refactored common components (`Button`, `Input`, `Label`, `Card`, `DropdownMenu`).

## Step 3: AI Parsing & Profile Management

- [x] Created backend endpoints for resume upload and profile fetching.

- [x] Integrated Gemini API for resume parsing.

- [x] Designed an intuitive UI for the "Add Resume" flow.

- [x] Implemented a "Profile" modal to display user info and skills.

- [x] Handled loading states during resume processing for a smooth UX.

## Step 4: Job Matching Engine

- [x] Created backend script to aggregate jobs and create vector embeddings.
- [x] Implemented protected `/api/jobs/matches` endpoint for semantic search.
- [x] Built frontend UI using shadcn/ui `Card` components to display a list of matched jobs.
- [x] Implemented `Skeleton` components for a polished loading experience.

## Step 5: Skill Gap Analysis & Interactive UI

- [x] Created backend endpoint for skill gap analysis with a percentage score.
- [x] Integrated YouTube API for learning recommendations.
- [x] Enhanced the JobCard UI to display the percentage match score using a Badge.
- [x] Implemented a Dialog or Drawer to show the detailed skill gap analysis.
- [x] Used Badge components to visually differentiate matching vs. missing skills.
- [x] Displayed learning resources and an "Apply" button within the details view.

## Docker Integration

- [x] Created `backend/Dockerfile` for Node/Express with Prisma generate and dev server.
- [x] Created `frontend/Dockerfile` for Vite React with external accessibility.
- [x] Added root `docker-compose.yml` with services: `db` (pgvector), `backend`, `frontend`.
- [x] Added root `.dockerignore` to optimize Docker build context.
