# StudySync

StudySync is a MERN study-planning app with authentication, subjects, tasks, notes, flashcards, a planner, and optional AI-assisted features.

## What is included

- Backend API built with Express and MongoDB
- Frontend built with React and Vite
- Protected app routes for the signed-in experience
- AI helpers for study workflows when a Gemini key is configured

## Requirements

- Node.js 18 or newer
- npm 9 or newer
- MongoDB connection string
- JWT secret for authentication
- Optional Gemini API key for AI features

## Setup

1. Install dependencies from the workspace root:

```bash
npm run install:all
```

2. Create `backend/.env` from the example file and set the required values:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_value
GEMINI_API_KEY=your_optional_gemini_key
```

3. Start the backend:

```bash
npm run dev:backend
```

The API runs on `http://localhost:5000`.

4. Start the frontend in a second terminal:

```bash
npm run dev:frontend
```

The app runs on `http://localhost:5173`.

## Workspace Scripts

- `npm run install:all` - Install backend and frontend dependencies
- `npm run dev:backend` - Start the API with nodemon
- `npm run dev:frontend` - Start the Vite dev server
- `npm run build:frontend` - Build the frontend for production

## Main API Areas

- `/api/auth`
- `/api/subjects`
- `/api/tasks`
- `/api/notes`
- `/api/flashcards`
- `/api/ai`

## Frontend Routes

- `/login`
- `/register`
- `/dashboard`
- `/subjects`
- `/tasks`
- `/notes`
- `/planner`
- `/flashcards`
- `/settings`

## Common Issues

### MongoDB connection fails

- Confirm `MONGO_URI` is correct
- Check that the database is reachable from your machine

### AI features do not work

- Confirm `GEMINI_API_KEY` is present
- Check that the configured Gemini model is supported by your account

### Frontend cannot reach the API

- Make sure the backend is running on port 5000
- Check that CORS is not being blocked by a browser extension or proxy
