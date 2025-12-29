"use client";

import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [target, setTarget] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [task, setTask] = useState("regression");
  const [algo, setAlgo] = useState("random_forest");
  const [testInput, setTestInput] = useState("");
  const [prediction, setPrediction] = useState<string | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  const regressionAlgorithms = [
    { value: "random_forest", label: "Random Forest" },
    { value: "gradient_boosting", label: "Gradient Boosting" },
    { value: "linear_regression", label: "Linear Regression" },
    { value: "knn", label: "K-Nearest Neighbors" },
    { value: "svm", label: "Support Vector Machine" },
  ];

  const classificationAlgorithms = [
    { value: "random_forest", label: "Random Forest" },
    { value: "gradient_boosting", label: "Gradient Boosting" },
    { value: "logistic_regression", label: "Logistic Regression" },
    { value: "knn", label: "K-Nearest Neighbors" },
    { value: "svm", label: "Support Vector Machine" },
    { value: "naive_bayes", label: "Naive Bayes" },
  ];

  const algorithmOptions =
    task === "classification" ? classificationAlgorithms : regressionAlgorithms;

  // Prefer explicit env var, otherwise proxy through Next.js rewrite.
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "/backend";

  const handleCSVUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${backendUrl}/upload`, formData);
      setColumns(res.data.columns);
    } catch (error) {
      console.error("CSV Upload failed", error);
      const message =
        (error as any)?.response?.data?.detail ??
        (error as any)?.response?.data?.error ??
        "Error uploading CSV";
      alert(message);
    }
  };

  const handleTrain = async () => {
    if (!target || !algo) return;

    try {
      const res = await axios.post(`${backendUrl}/train`, {
        target_column: target,
        algorithm: algo,
        task: task,
      });

      if (res.data?.error) {
        alert(res.data.error);
        return;
      }

      const score: number | undefined =
        res.data?.metric ?? res.data?.accuracy ?? res.data?.r2;

      if (typeof score === "number") {
        setAccuracy(score);
      }

      if (Array.isArray(res.data?.features)) {
        setFeatures(res.data.features);
      }

      if (res.data?.message) {
        alert(res.data.message);
      }
    } catch (error) {
      console.error("Model training failed", error);
      alert(error);
    }
  };

  const handlePredict = async () => {
    const inputArray = testInput
      .split(",")
      .map((val) => parseFloat(val.trim()));
    try {
      const res = await axios.post(`${backendUrl}/predict`, {
        values: inputArray,
      });
      setPrediction(String(res.data.prediction));
    } catch (error) {
      console.error("Prediction failed", error);
      alert("Prediction error");
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Model
        <span className="bg-emerald-500 text-slate-800 py-1 rounded">
          Craft
        </span>
      </h1>

      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button
        onClick={handleCSVUpload}
        className="bg-slate-300 text-black px-4 py-2 mt-2 rounded hover:bg-slate-400 transition-all duration-150 font-semibold"
      >
        Upload CSV
      </button>

      {columns.length > 0 && (
        <div className="mt-4">
          <label className="block mb-1 font-medium text-orange-300">
            Target Column:
          </label>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="block border p-2 w-full"
          >
            <option>-- Select --</option>
            {columns.map((col) => (
              <option className="bg-slate-700 text-white" key={col} value={col}>
                {col}
              </option>
            ))}
          </select>

          <label className="block mt-4 mb-1 font-medium text-orange-300">
            Task Type:
          </label>
          <select
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className="w-full border p-2"
          >
            <option className="bg-slate-600 text-white" value="regression">
              Regression
            </option>
            <option className="bg-slate-600 text-white" value="classification">
              Classification
            </option>
          </select>

          <label className="block mt-4 mb-1 font-medium text-orange-300">
            Algorithm:
          </label>
          <select
            value={algo}
            onChange={(e) => setAlgo(e.target.value)}
            className="w-full border p-2"
          >
            {algorithmOptions.map((algorithm) => (
              <option
                className="bg-slate-600 text-white"
                key={algorithm.value}
                value={algorithm.value}
              >
                {algorithm.label}
              </option>
            ))}
          </select>

          <button
            onClick={handleTrain}
            className="bg-purple-400 text-slate-800 px-4 py-2 mt-2 rounded font-semibold hover:bg-purple-600 hover:text-white transition-all duration-150"
          >
            Train Model
          </button>
        </div>
      )}

      {accuracy !== null && (
        <p className="mt-2 text-emerald-300 font-semibold">
          {task === "classification"
            ? `Model Accuracy: ${(accuracy * 100).toFixed(2)}%`
            : `R² Score: ${accuracy.toFixed(4)}`}
        </p>
      )}

      {target && (
        <div className="mt-6">
          <div className="flex flex-wrap gap-2">
            {features.map((data) => (
              <p
                className="bg-blue-400 text-slate-800 font-semibold p-2 rounded-xl text-xs"
                key={data}
              >
                {data}
              </p>
            ))}
          </div>
          <input
            type="text"
            placeholder="Enter test input (comma separated)"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            className="border px-3 py-2 w-full mt-4"
          />
          <button
            onClick={handlePredict}
            className="bg-orange-400 text-slate-800 font-semibold hover:bg-orange-600 transition-all duration-150 px-4 py-2 mt-2 rounded"
          >
            Predict
          </button>
        </div>
      )}

      {prediction && (
        <div className="mt-4 p-4 bg-slate-300 rounded">
          <p className="text-lg font-semibold text-slate-800">
            Prediction: {prediction}
          </p>
        </div>
      )}
    </div>
  );
}
