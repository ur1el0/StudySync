# StudySync

Quick run guide for this workspace.

## Requirements

- Node.js 18+
- npm 9+
- A valid `backend/.env` file with:
	- `MONGO_URI`
	- `JWT_SECRET`
	- `GEMINI_API_KEY` (optional, but required for AI extraction/generation)

## 1. Open the project root

```bash
cd /run/media/dokja/A262F53062F509B5/Users/Dell/vsc/Projects/mern-projects/ss
```

## 2. Install dependencies

```bash
npm run install:all
```

## 3. Run backend

```bash
npm run dev:backend
```

Backend runs on `http://localhost:5000`.

## 4. Run frontend (new terminal)

```bash
cd /run/media/dokja/A262F53062F509B5/Users/Dell/vsc/Projects/mern-projects/ss
npm run dev:frontend
```

Frontend runs on `http://localhost:5173`.

## 5. Available workspace scripts

```bash
npm run install:all
npm run dev:backend
npm run dev:frontend
npm run build:frontend
```

## 6. Common issues

### Gemini `404 model not found`

If logs show model errors, set a supported model in `backend/.env`:

```env
GEMINI_MODEL=gemini-2.0-flash
```

### Gemini `429 Too Many Requests` / `quota exceeded`

This is a quota/billing limit from Gemini, not an app crash.

- Wait and retry later
- Check Gemini usage and billing in your Google AI project
- Optional retry tuning in `backend/.env`:

```env
GEMINI_MAX_RETRIES=4
GEMINI_RETRY_BASE_MS=600
```

### MongoDB connection issues

- Confirm `MONGO_URI` is valid in `backend/.env`
- Make sure your Atlas IP allowlist includes your current IP

## 7. Notes

- Run commands from this `ss` folder (not the parent `mern-projects` folder).
- Use local MongoDB URI only if you are intentionally running a local MongoDB server.

