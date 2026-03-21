import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import cross_val_score
from sklearn.metrics import mean_absolute_error, r2_score
import datetime
import warnings
warnings.filterwarnings("ignore")
 

# ── SEASON LOGIC ──────────────────────────────────────
def get_season(month):
    if month in [3, 4, 5, 6]:
        return "summer"
    elif month in [7, 8, 9]:
        return "monsoon"
    else:
        return "winter"
 
 
# ── SEASONAL FACTORS ──────────────────────────────────
SEASONAL_BOOST = {
    "summer":  ["ORS", "Cetirizine", "Paracetamol", "Dolo 650"],
    "monsoon": ["Amoxicillin", "Ciprofloxacin", "Azithromycin", "ORS", "Metformin"],
    "winter":  ["Cough Syrup", "Cetirizine", "Ibuprofen", "Aspirin"],
}
 
SEASONAL_FACTORS = {
    "summer":  1.5,
    "monsoon": 1.3,
    "winter":  1.4,
}
 
 
# ── FEATURE ENGINEERING ──────────────────────────────
def build_features(df):
    """
    Adds extra features to improve model accuracy:
    - month_sin/cos  → captures cyclical nature of months
    - season_encoded → encodes season as number
    - lag_1/lag_2    → previous month's sales (strong predictor)
    - rolling_3      → 3-month average (smoothens noise)
    """
    df = df.copy().sort_values("date")
 
    # Cyclical month encoding (Jan & Dec are close, not far apart)
    df["month_sin"] = np.sin(2 * np.pi * df["month"] / 12)
    df["month_cos"] = np.cos(2 * np.pi * df["month"] / 12)
 
    # Season as number
    season_map = {"summer": 0, "monsoon": 1, "winter": 2}
    df["season_enc"] = df["season"].map(season_map)
 
    # Lag features (previous months' sales)
    df["lag_1"] = df["quantity"].shift(1)
    df["lag_2"] = df["quantity"].shift(2)
 
    # 3-month rolling average
    df["rolling_3"] = df["quantity"].rolling(window=3, min_periods=1).mean().shift(1)
 
    df = df.dropna()
    return df
 
 
# ── BEST MODEL SELECTOR ──────────────────────────────
def select_best_model(X, y):
    """
    Tries 4 models and picks the one with best cross-val MAE.
    Falls back to LinearRegression if not enough data.
    """
    if len(X) < 4:
        model = LinearRegression()
        model.fit(X, y)
        return model, "LinearRegression", None
 
    candidates = {
        "Ridge":           Ridge(alpha=1.0),
        "RandomForest":    RandomForestRegressor(n_estimators=50, random_state=42),
        "GradientBoosting": GradientBoostingRegressor(n_estimators=50, random_state=42),
        "LinearRegression": LinearRegression(),
    }
 
    best_name  = None
    best_score = float("inf")
    best_model = None
 
    for name, model in candidates.items():
        try:
            scores = cross_val_score(
                model, X, y,
                cv=min(3, len(X)),
                scoring="neg_mean_absolute_error"
            )
            mae = -scores.mean()
            if mae < best_score:
                best_score = mae
                best_name  = name
                best_model = model
        except Exception:
            continue
 
    best_model.fit(X, y)
    return best_model, best_name, round(best_score, 2)
 
 
# ── MAIN PREDICTION FUNCTION ─────────────────────────
def train_and_predict():
    # ── Load Data ──
    try:
        df = pd.read_csv("data/drug_sales.csv")
    except FileNotFoundError:
        print("❌ data/drug_sales.csv not found!")
        return {}
 
    # ── Validate Columns ──
    required = {"date", "drug", "quantity"}
    if not required.issubset(df.columns):
        print(f"❌ CSV must have columns: {required}")
        return {}
 
    df["date"]   = pd.to_datetime(df["date"])
    df["month"]  = df["date"].dt.month
    df["season"] = df["month"].apply(get_season)
 
    current_month  = datetime.datetime.now().month
    current_season = get_season(current_month)
 
    FEATURE_COLS = ["month_sin", "month_cos", "season_enc", "lag_1", "lag_2", "rolling_3"]
 
    predictions = {}
 
    for drug in df["drug"].unique():
        drug_df = df[df["drug"] == drug].copy()
 
        # ── Not enough data → use mean ──
        if len(drug_df) < 2:
            predictions[drug] = {
                "predicted_demand": int(drug_df["quantity"].mean()),
                "model_used":       "mean_fallback",
                "mae":              None,
                "r2":               None,
                "season":           current_season,
                "seasonal_boost":   False,
            }
            continue
 
        # ── Feature Engineering ──
        featured = build_features(drug_df)
 
        available_features = [f for f in FEATURE_COLS if f in featured.columns]
 
        # ── Train / Predict ──
        if len(featured) >= 2 and available_features:
            X = featured[available_features]
            y = featured["quantity"]
 
            model, model_name, cv_mae = select_best_model(X, y)
 
            # Build prediction row for current month
            pred_row = pd.DataFrame([{
                "month":      current_month,
                "season":     current_season,
                "quantity":   drug_df["quantity"].mean(),  # placeholder for lag
            }])
            pred_row["month_sin"]  = np.sin(2 * np.pi * current_month / 12)
            pred_row["month_cos"]  = np.cos(2 * np.pi * current_month / 12)
            pred_row["season_enc"] = {"summer": 0, "monsoon": 1, "winter": 2}[current_season]
            pred_row["lag_1"]      = drug_df["quantity"].iloc[-1]
            pred_row["lag_2"]      = drug_df["quantity"].iloc[-2] if len(drug_df) >= 2 else drug_df["quantity"].mean()
            pred_row["rolling_3"]  = drug_df["quantity"].tail(3).mean()
 
            predicted = model.predict(pred_row[available_features])[0]
 
            # Evaluate on training data
            y_pred = model.predict(X)
            mae = round(mean_absolute_error(y, y_pred), 2)
            r2  = round(r2_score(y, y_pred), 3) if len(y) > 1 else None
 
        else:
            # Simple linear regression fallback
            X_simple = drug_df[["month"]]
            y_simple  = drug_df["quantity"]
            model = LinearRegression().fit(X_simple, y_simple)
            predicted  = model.predict([[current_month]])[0]
            model_name = "LinearRegression_simple"
            mae = None
            r2  = None
 
        # ── Seasonal Boost ──
        seasonal_boost  = drug in SEASONAL_BOOST.get(current_season, [])
        seasonal_factor = SEASONAL_FACTORS[current_season] if seasonal_boost else 1.0
 
        final_prediction = max(10, int(predicted * seasonal_factor))
 
        predictions[drug] = {
            "predicted_demand": final_prediction,
            "model_used":       model_name,
            "mae":              mae,
            "r2":               r2,
            "season":           current_season,
            "seasonal_boost":   seasonal_boost,
            "seasonal_factor":  seasonal_factor,
        }
 
    return predictions
 
 
# ── FLASK ROUTE HELPER ────────────────────────────────
def get_predictions_for_api(inventory):
    """
    Call this from your Flask /ml-predict route.
    inventory = list of medicine dicts from app.py
    Returns list sorted by reorder quantity desc.
    """
    ml_preds = train_and_predict()
 
    # Group current stock by drug name
    stock_map = {}
    for item in inventory:
        name = item["name"]
        stock_map[name] = stock_map.get(name, 0) + item["quantity"]
 
    results = []
    for drug, pred in ml_preds.items():
        current_stock  = stock_map.get(drug, 0)
        predicted      = pred["predicted_demand"]
        reorder_qty    = max(0, predicted - current_stock)
        status         = "LOW_STOCK" if reorder_qty > 0 else "STOCK_OK"
 
        results.append({
            "name":             drug,
            "predicted_demand": predicted,
            "current_stock":    current_stock,
            "suggest_reorder":  reorder_qty,
            "status":           status,
            "model_used":       pred["model_used"],
            "mae":              pred["mae"],
            "r2":               pred["r2"],
            "season":           pred["season"],
            "seasonal_boost":   pred["seasonal_boost"],
            "method":           f"{pred['model_used']} + Seasonal Logic",
        })
 
    return sorted(results, key=lambda x: x["suggest_reorder"], reverse=True)
 
 
# ── TEST RUN ──────────────────────────────────────────
if __name__ == "__main__":
    preds = train_and_predict()
    print(f"\n{'Drug':<20} {'Predicted':>10} {'Model':<22} {'MAE':>6} {'R2':>6} {'Boost'}")
    print("-" * 75)
    for drug, p in preds.items():
        print(
            f"{drug:<20} {p['predicted_demand']:>10} "
            f"{p['model_used']:<22} "
            f"{str(p['mae']):>6} "
            f"{str(p['r2']):>6} "
            f"{'✅' if p['seasonal_boost'] else ''}"
        )
        results.append({
    "name": drug,
    "predicted_demand": int(predicted),
    "current_stock": current_stock,
    "suggest_reorder": reorder,
    "priority": priority
})