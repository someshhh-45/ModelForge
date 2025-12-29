# ModelForge Frontend (Next.js)

This folder contains the Next.js UI for uploading a CSV, training a model, and running predictions via the ModelForge FastAPI backend.

## Requirements

- Node.js (LTS recommended)
- Backend running (see `../backend/README.md`)

## Run (development)

From this folder:

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Backend integration

By default, the UI sends requests to a same-origin path:

- `POST /backend/upload`
- `POST /backend/train`
- `POST /backend/predict`

Next.js rewrites `/backend/*` to the FastAPI server (configured in `next.config.ts`).

### Config options

- `BACKEND_URL` (server-side env var for Next.js rewrite)
	- Default: `http://127.0.0.1:8001`
	- Example:
		```bash
		BACKEND_URL=http://127.0.0.1:8001 npm run dev
		```

- `NEXT_PUBLIC_BACKEND_URL` (client-side override)
	- If set, the UI will call the backend directly instead of using the `/backend/*` proxy.
	- Example:
		```bash
		NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8001 npm run dev
		```

## Notes

- If you see `ECONNREFUSED` proxy errors in the Next.js terminal, the backend is not running (or is on a different port than `BACKEND_URL`).
