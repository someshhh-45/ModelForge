# ModelForge Backend (FastAPI)

This folder contains the FastAPI backend used by the ModelForge UI.

## Requirements

- Python 3.11+ recommended
- Packages (key deps):
  - `fastapi` (with standard extras)
  - `uvicorn`
  - `pandas`
  - `scikit-learn`
  - `joblib`
  - `python-multipart` (required for CSV upload via `multipart/form-data`)

> Note: `Pipfile` currently declares `python_version = "3.13"`, but the project can run on 3.11+. If you use Pipenv, consider updating the Pipfile to match your installed Python.

## Run the server

From the repo root (recommended, so imports resolve correctly):

```bash
python -m uvicorn modelforge.backend.main:app --host 127.0.0.1 --port 8001
```

You should see:

- API: http://127.0.0.1:8001
- Docs: http://127.0.0.1:8001/docs

## API endpoints

- `GET /` — health check
- `POST /upload` — upload a CSV
  - Form field: `file`
  - Returns: `columns: string[]`
- `POST /train` — train a model
  - Body: `{ "target_column": string, "algorithm": string, "task": "classification"|"regression" }`
  - Returns: score info + detected feature columns
- `POST /predict` — predict from a trained model
  - Body: `{ "values": number[] }` (also accepts legacy `{ "test_input": number[] }`)

## Important behavior

- The backend stores the uploaded dataframe and trained model in memory (process globals). If you restart the server, you must upload and train again.
- If CSV parsing fails, `/upload` returns HTTP 400 with a helpful error message.
