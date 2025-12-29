# ModelForge 

ModelForge is a small full-stack app:

- **Backend:** FastAPI (CSV upload → train → predict)
- **Frontend:** Next.js UI (uploads CSV, selects target + algorithm, triggers training/prediction)

---

## 1) Clone the repo

```bash
git clone <https://github.com/someshhh-45/ModelForge.git>
cd ModelForge
```

> If you already have the folder, just `cd ModelForge`.

---

## 2) Start the backend (FastAPI)

### Option A (simple): use pip + venv

From the repo root:

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate

pip install -U pip
pip install fastapi "fastapi[standard]" uvicorn pandas scikit-learn joblib python-multipart
```

Start the API (recommended command):

```bash
python -m uvicorn modelforge.backend.main:app --host 127.0.0.1 --port 8001
```

Backend URLs:

- API: http://127.0.0.1:8001
- Swagger docs: http://127.0.0.1:8001/docs

### Option B: Pipenv (if you prefer)

There are Pipfiles in the repo. If you use Pipenv, be aware the declared Python version may not match what you have installed.

From the backend folder:

```bash
cd modelforge\backend
pipenv install
pipenv run python -m uvicorn modelforge.backend.main:app --host 127.0.0.1 --port 8001
```

---

## 3) Start the frontend (Next.js)

Open a **second terminal**.

From the repo root:

```bash
cd modelforge\frontend
npm install
npm run dev
```

Frontend URL:

- http://localhost:3000

---

## 4) How frontend talks to backend

The frontend calls these paths:

- `POST /backend/upload`
- `POST /backend/train`
- `POST /backend/predict`

Next.js rewrites `/backend/*` to the FastAPI server. Default backend target:

- `http://127.0.0.1:8001`

### Change backend URL (optional)

If your backend runs elsewhere, set an env var when starting Next.js:

```bash
# PowerShell
$env:BACKEND_URL="http://127.0.0.1:8001"; npm run dev
```

Or, to bypass the proxy and call the backend directly from the browser:

```bash
# PowerShell
$env:NEXT_PUBLIC_BACKEND_URL="http://127.0.0.1:8001"; npm run dev
```

---

## 5) Common issues

- **CSV upload fails**: make sure `python-multipart` is installed in the backend environment.
- **Frontend shows proxy `ECONNREFUSED`**: backend is not running (or not on the port `BACKEND_URL` points to).
- **Backend restarts/gets unstable in `--reload` mode on Windows**: run without `--reload` (the command above does that).

---

## More details

- Backend details: see `modelforge/backend/README.md`
- Frontend details: see `modelforge/frontend/README.md`

