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

- User authentication and authorization
- Resume parsing and storage
- Job application tracking
- Profile management
- Job recommendations
- Progress analytics

## Tech Stack

- **Frontend**: React.js, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL with pgvector for job recommendations
- **Authentication**: JWT tokens
- **Deployment**: TBD

## Contributing

Please read the contributing guidelines before submitting pull requests.

## License

MIT License
