# StudySync Backend

## Setup

1. Copy `.env.example` to `.env` and fill in:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `GEMINI_API_KEY` (optional, for AI features)

2. Install dependencies:
   ```
   npm install
   ```

3. Start server:
   ```
   npm run dev
   ```

## Scripts

- `npm run dev` — Start with nodemon
- `npm start` — Start normally

## API

- Base URL: `http://localhost:5000`
- Main endpoints: `/api/auth`, `/api/subjects`, `/api/tasks`, `/api/notes`, `/api/flashcards`, `/api/ai`

## Tech

- Express, Mongoose, JWT, Multer, Google Gemini API, PDF parsing

## Troubleshooting

- **Model errors:** Check `GEMINI_API_KEY` and model name in `.env`
- **MongoDB errors:** Check `MONGO_URI`
