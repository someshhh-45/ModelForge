from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import io
from typing import List, Optional


from .train import train_model, predict

app = FastAPI(title="ModelForge API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

df_cache = None
trained_model = None
trained_features = None



class TrainRequest(BaseModel):
    target_column: str
    algorithm: str
    task: str


class PredictInput(BaseModel):
    # Frontend currently sends: { values: [..] }
    # Keep backward-compat with: { test_input: [..] }
    values: Optional[List[float]] = None
    test_input: Optional[List[float]] = None

@app.get("/")
def home():
    return {"message": "ModelForge backend running "}

@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    global df_cache
    try:
        contents = await file.read()
        df_cache = pd.read_csv(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid CSV: {e}")

    return {
        "message": "CSV uploaded successfully",
        "columns": df_cache.columns.tolist()
    }


@app.post("/train")
def train_api(data: TrainRequest):
    global trained_model, trained_features, df_cache

    if df_cache is None:
        return {"error": "Please upload CSV first"}

    try:
        trained_model, score, trained_features = train_model(
            df_cache,
            data.target_column,
            data.algorithm,
            data.task
        )

        metric_name = "accuracy" if data.task.lower() == "classification" else "r2"

        return {
            "message": f"Model trained using {data.algorithm}",
            "metric": score,
            "metric_name": metric_name,
            metric_name: score,
            "features": trained_features
        }

    except Exception as e:
        return {"error": str(e)}


@app.post("/predict")
def predict_api(data: PredictInput):
    if trained_model is None:
        return {"error": "Model not trained yet"}

    try:
        input_values = data.values if data.values is not None else data.test_input
        if input_values is None:
            return {"error": "Missing 'values' (or legacy 'test_input')"}

        prediction = predict(trained_model, input_values)
        return {"prediction": prediction}

    except Exception as e:
        return {"error": str(e)}
