from sklearn.ensemble import (
    RandomForestRegressor,
    GradientBoostingRegressor,
    RandomForestClassifier,
    GradientBoostingClassifier,
)
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.svm import SVC, SVR
from sklearn.naive_bayes import GaussianNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, accuracy_score
from sklearn.preprocessing import LabelEncoder
import pandas as pd

# Global state (used by predict)
feature_names = []
task_type = "regression"
label_encoder = None


def train_model(
    df: pd.DataFrame,
    target_column: str,
    algorithm: str,
    task: str,
    test_size: float = 0.2,
):
    """
    Trains a model using train-test split and returns:
    model, evaluation_score, feature_names
    """

    global feature_names, task_type, label_encoder

    task_type = task.lower()
    algorithm = algorithm.lower()

    # ----------------------------
    # 1. Separate features & target
    # ----------------------------
    X = df.drop(columns=[target_column])
    y = df[target_column]

    feature_names = X.columns.to_list()

    # ----------------------------
    # 2. Handle classification labels
    # ----------------------------
    if task_type == "classification":
        if y.dtype == object:
            label_encoder = LabelEncoder()
            y = label_encoder.fit_transform(y)
        else:
            label_encoder = None
    else:
        label_encoder = None

    # ----------------------------
    # 3. Train-test split
    # ----------------------------
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=test_size,
        random_state=42,
        stratify=y if task_type == "classification" else None,
    )

    # ----------------------------
    # 4. Model selection
    # ----------------------------
    if task_type == "classification":
        if algorithm == "random_forest":
            model = RandomForestClassifier()
        elif algorithm == "gradient_boosting":
            model = GradientBoostingClassifier()
        elif algorithm == "logistic_regression":
            model = LogisticRegression(max_iter=200)
        elif algorithm == "knn":
            model = KNeighborsClassifier()
        elif algorithm == "svm":
            model = SVC()
        elif algorithm == "naive_bayes":
            model = GaussianNB()
        else:
            raise ValueError("Unsupported classification algorithm")

    elif task_type == "regression":
        if algorithm == "random_forest":
            model = RandomForestRegressor()
        elif algorithm == "gradient_boosting":
            model = GradientBoostingRegressor()
        elif algorithm == "linear_regression":
            model = LinearRegression()
        elif algorithm == "knn":
            model = KNeighborsRegressor()
        elif algorithm == "svm":
            model = SVR()
        else:
            raise ValueError("Unsupported regression algorithm")

    else:
        raise ValueError("Task must be 'classification' or 'regression'")

    # ----------------------------
    # 5. Train model
    # ----------------------------
    model.fit(X_train, y_train)

    # ----------------------------
    # 6. Evaluate on TEST data
    # ----------------------------
    y_pred = model.predict(X_test)

    if task_type == "classification":
        score = accuracy_score(y_test, y_pred)
    else:
        score = r2_score(y_test, y_pred)

    return model, score, feature_names


def predict(model, input_list):
    """
    Predicts output for a single input row
    """

    global feature_names, task_type, label_encoder

    # Convert input list to DataFrame
    input_df = pd.DataFrame([input_list], columns=feature_names)

    prediction = model.predict(input_df)[0]

    # Decode label for classification
    if task_type == "classification" and label_encoder is not None:
        prediction = label_encoder.inverse_transform([int(prediction)])[0]

    return prediction
