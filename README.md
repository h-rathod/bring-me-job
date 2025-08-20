# Bring Me Job

A modern job search and resume management platform that helps job seekers organize their job applications and track their progress.

## Project Structure

This is a monorepo containing both frontend and backend applications:

- `frontend/` - React.js frontend application
- `backend/` - Node.js/Express backend with TypeScript

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

### Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your database credentials
4. Run database migrations: `npx prisma migrate dev`
5. Start the server: `npm run dev`

### Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Features

- User authentication (register/login) using JWT
- Resume upload (PDF) with AI parsing to build your profile
- Profile management (full name, headline, skills)
- Vector-based job matching (pgvector similarity)
- "Bring Me Job!" action to fetch matches on demand
- Sort by most match or most recent; free-text location filter
- Job details with skill gap analysis and match percentage badge
- Learning resources for missing skills (YouTube API with caching/fallback)
- Job aggregation script pulling from Remotive API (with embeddings)
- Robust UI built with React, TypeScript, Tailwind, Radix primitives

## Tech Stack

- **Frontend**: React.js, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL with pgvector for job recommendations
- **Authentication**: JWT tokens
- **Deployment**: TBD

## Architecture Overview

- **Monorepo** with `frontend/` and `backend/`.
- **Backend**: Express + Prisma + PostgreSQL (Supabase) with `pgvector` for embeddings.
- **AI**: Google Gemini for resume parsing and text embeddings.
- **Aggregator**: Script that fetches jobs from Remotive, embeds them, and stores in DB.
- **Frontend**: React + Vite + Tailwind + Radix UI. Matches are fetched after pressing "Bring Me Job!" and can be sorted/filtered.

## Environment Setup

### Backend `.env`
Copy `backend/.env.example` to `backend/.env` and set:

```bash
DATABASE_URL=postgresql://...           # Supabase/Postgres connection
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_google_generative_ai_key
GEMINI_EMBEDDING_MODEL=text-embedding-004
AGGREGATOR_LIMIT=50                      # optional, cap ingested jobs
YOUTUBE_API_KEY=your_youtube_api_key     # optional; caching & fallbacks included
```

Ensure pgvector is enabled on your database.

### Frontend `.env`
Copy `frontend/.env.example` to `frontend/.env` and set API base if needed, e.g.:

```bash
VITE_API_URL=http://localhost:3001
```

## Running Locally

### Backend
```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```
Server: `http://localhost:3001`  |  Health: `/health`

Auth endpoints: `/api/auth/register`, `/api/auth/login`
Protected endpoints require `Authorization: Bearer <token>`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App: `http://localhost:5173` (default Vite port)

## Data & Matching

- `Job` table includes `embedding` vector column. We compare candidate profile embeddings to jobs for similarity.
- Resume upload parses full name, headline, and skills, then persists to `Profile` and `Skill` tables via Prisma.
- Matches endpoint returns jobs plus a similarity score; UI sorts by similarity or recency (`createdAt`).

## Aggregator

Location: `backend/src/jobs/aggregator.ts`

What it does:
- Fetches jobs from Remotive public API.
- Creates embeddings with Gemini and stores jobs + vectors.

Run it (once or periodically):
```bash
cd backend
npx ts-node src/jobs/aggregator.ts
```
Note: The script disconnects after completion. Avoid running it in watch mode to prevent many DB connections.

## Skill Gap Analysis & Learning Resources

- Endpoint computes missing vs matching skills and a percentage match score displayed as a badge in `JobCard`.
- For missing skills, we request YouTube learning resources (with caching and curated fallbacks). If quota is exceeded, UI still remains functional with fallbacks.

## Frontend UX Highlights

- Home page (`frontend/src/pages/Home.tsx`):
  - Upload/Update resume dialog
  - Bring Me Job! button gates fetching to reduce noise
  - Sort dropdown (Radix Select) with dark theme support
  - Location filter input
  - Skeletons during loading, empty-state messaging

## Operational Notes

- Prisma Singleton: `backend/src/lib/prisma.ts` ensures one PrismaClient across hot reloads to avoid exhausting Postgres connection slots (common on Supabase free tier).
- If you see `remaining connection slots are reserved for roles with the SUPERUSER attribute`, stop background processes, wait a minute, or restart the Supabase project. Ensure only one backend process is running.
- If YouTube quota is exceeded, learning resources may use cached/fallback items; core job matching continues to work.

## Troubleshooting

- No jobs appear: ensure you have uploaded a resume (profile exists) and click "Bring Me Job!".
- Empty matches: run the aggregator to seed jobs; verify embeddings and `pgvector` extension.
- Prisma/DB errors: verify `DATABASE_URL`, run migrations, ensure singleton prisma usage.
- 403 YouTube quota: confirm API key, expect fallback resources.

## Scripts

- Backend: `npm run dev`, `npx prisma migrate dev`, `npx ts-node src/jobs/aggregator.ts`
- Frontend: `npm run dev`

## Contributing

Please read the contributing guidelines before submitting pull requests.

## License

MIT License
