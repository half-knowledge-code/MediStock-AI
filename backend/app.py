from flask import Flask, jsonify, request
from flask_cors import CORS
import random
from datetime import datetime, timedelta
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import r2_score, mean_absolute_error
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)
CORS(app)

# ───────────── CONFIG ─────────────
SENDER_EMAIL   = "shubhamwork7007@gmail.com"
SENDER_PASSWORD = "jcbprnixwmkxguko"
ADMIN_EMAIL    = "itsmeanshu248@gmail.com"

# ───────────── DATA ─────────────
medicine_names = [
    "Paracetamol","Ibuprofen","Amoxicillin","Ciprofloxacin","Azithromycin",
    "Metformin","Aspirin","Insulin","Dolo 650","Pantoprazole",
    "Cetirizine","Diclofenac","Omeprazole","Atorvastatin","Losartan","ORS","Cough Syrup"
]

categories = {
    "Paracetamol":"Analgesic","Ibuprofen":"NSAID","Amoxicillin":"Antibiotic",
    "Ciprofloxacin":"Antibiotic","Azithromycin":"Antibiotic","Metformin":"Antidiabetic",
    "Aspirin":"Antiplatelet","Insulin":"Hormone","Dolo 650":"Analgesic",
    "Pantoprazole":"PPI","Cetirizine":"Antihistamine","Diclofenac":"NSAID",
    "Omeprazole":"PPI","Atorvastatin":"Cardiac","Losartan":"Cardiac",
    "ORS":"Hydration","Cough Syrup":"Cold"
}

suppliers = {
    "Paracetamol":"Micro Labs","Ibuprofen":"Cipla Ltd","Amoxicillin":"Alkem Labs",
    "Ciprofloxacin":"MedPlus Pharma","Azithromycin":"Cipla Ltd","Metformin":"Sun Pharma",
    "Aspirin":"Bayer","Insulin":"Novo Nordisk","Dolo 650":"Micro Labs",
    "Pantoprazole":"Sun Pharma","Cetirizine":"Dr. Reddy's","Diclofenac":"Alkem Labs",
    "Omeprazole":"Dr. Reddy's","Atorvastatin":"Sun Pharma","Losartan":"MedPlus Pharma",
    "ORS":"WHO Supply","Cough Syrup":"Generic Pharma"
}

unit_prices = {
    "Paracetamol":3,"Ibuprofen":4,"Amoxicillin":6,"Ciprofloxacin":12,"Azithromycin":15,
    "Metformin":6,"Aspirin":2,"Insulin":95,"Dolo 650":3,"Pantoprazole":9,"Cetirizine":4,
    "Diclofenac":5,"Omeprazole":7,"Atorvastatin":8,"Losartan":10,"ORS":8,"Cough Syrup":12
}

# Season multipliers — which drugs spike in which season
season_rules = {
    "summer":  {"ORS":1.8, "Paracetamol":1.3, "Dolo 650":1.3, "Cetirizine":1.2},
    "monsoon": {"Ciprofloxacin":1.5, "Azithromycin":1.4, "Amoxicillin":1.3, "Paracetamol":1.2},
    "winter":  {"Cough Syrup":1.6, "Cetirizine":1.5, "Azithromycin":1.3, "Ibuprofen":1.2},
}

random.seed(42)
medicines = []
for i in range(1, 101):
    name = random.choice(medicine_names)
    expiry_date = datetime.today() + timedelta(days=random.randint(30, 900))
    medicines.append({
        "id": i,
        "name": name,
        "batch": f"BATCH-{random.randint(1000,9999)}",
        "quantity": random.randint(10, 200),
        "expiry": expiry_date.strftime("%Y-%m-%d"),
        "category": categories.get(name, "General"),
        "supplier": suppliers.get(name, "Generic"),
        "unitPrice": unit_prices.get(name, 5),
        "threshold": 50
    })

# ───────────── HELPERS ─────────────
def get_season(month):
    if month in [3,4,5,6]:   return "summer"
    elif month in [7,8,9]:   return "monsoon"
    else:                     return "winter"

def get_season_icon(season):
    return {"summer":"☀️","monsoon":"🌧️","winter":"❄️"}.get(season,"🌤️")

def simulate_history(base, name, months=12):
    """Generate realistic 12-month history with seasonal patterns"""
    history = []
    for m in range(months):
        month_num = (datetime.now().month - months + m) % 12 + 1
        season = get_season(month_num)
        multiplier = season_rules.get(season, {}).get(name, 1.0)
        noise = random.randint(-5, 8)
        val = max(5, int(base * 0.6 * multiplier + noise + m * random.uniform(0.2, 1.2)))
        history.append(val)
    return history

def send_alert_email(alerts):
    msg = MIMEMultipart()
    msg["From"]    = SENDER_EMAIL
    msg["To"]      = ADMIN_EMAIL
    msg["Subject"] = "⚠️ MediStock Alert — Action Required!"
    body = "Namaste Admin,\n\nNeeche wale items pe turant dhyan do:\n\n"
    for a in alerts:
        body += f"  • {a['name']} (Batch: {a['batch']}) — {a['reason']}\n"
    body += "\n— MediStock AI System"
    msg.attach(MIMEText(body, "plain"))
    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, ADMIN_EMAIL, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Email error: {e}")
        return False

# ───────────── ROUTES ─────────────
@app.route("/")
def home():
    return jsonify({"message": "MediStock AI Backend", "status": "online"})

@app.route("/medicines")
def get_medicines():
    return jsonify(medicines)

@app.route("/fefo")
def fefo():
    return jsonify(sorted(medicines, key=lambda x: x["expiry"])[:10])

@app.route("/expiry-alert")
def expiry_alert():
    today = datetime.today()
    alert = []
    for m in medicines:
        days = (datetime.strptime(m["expiry"], "%Y-%m-%d") - today).days
        if days < 45:
            alert.append({**m, "days_left": days})
    return jsonify(sorted(alert, key=lambda x: x["days_left"]))

@app.route("/low-stock")
def low_stock():
    return jsonify(sorted(
        [m for m in medicines if m["quantity"] <= m["threshold"]],
        key=lambda x: x["quantity"]
    ))

@app.route("/stats")
def stats():
    today = datetime.today()
    low = near = crit = val = 0
    for m in medicines:
        days = (datetime.strptime(m["expiry"], "%Y-%m-%d") - today).days
        if days <= 30:    crit += 1
        elif days <= 180: near += 1
        if m["quantity"] <= m["threshold"]: low += 1
        val += m["quantity"] * m["unitPrice"]
    return jsonify({
        "total": len(medicines), "low_stock": low,
        "near_expiry": near, "critical": crit, "inventory_value": val
    })

@app.route("/check-alerts")
def check_alerts():
    today = datetime.today()
    alerts = []
    for m in medicines:
        days = (datetime.strptime(m["expiry"], "%Y-%m-%d") - today).days
        if days < 45:
            alerts.append({"id":m["id"],"name":m["name"],"batch":m["batch"],"reason":f"Expiry {days} din mein ({m['expiry']})","type":"expiry"})
        if m["quantity"] < 50:
            alerts.append({"id":m["id"],"name":m["name"],"batch":m["batch"],"reason":f"Stock kam hai: {m['quantity']} units","type":"stock"})
    email_sent = send_alert_email(alerts) if alerts else False
    return jsonify({"alerts": alerts, "total": len(alerts), "email_sent": email_sent})

# ───────────── UPGRADED ML PREDICT ─────────────
@app.route("/ml-predict")
def ml_predict():
    drug_data = {}
    for m in medicines:
        drug_data.setdefault(m["name"], []).append(m["quantity"])

    current_month  = datetime.now().month
    current_season = get_season(current_month)
    season_icon    = get_season_icon(current_season)
    results = []

    for name, qtys in drug_data.items():
        base        = int(sum(qtys) / len(qtys))
        history     = simulate_history(base, name, months=12)

        # ── Build feature matrix: [month_index, season_encoded] ──
        X = np.array([[i, 1 if get_season((datetime.now().month - 12 + i) % 12 + 1) == "summer"
                           else 2 if get_season((datetime.now().month - 12 + i) % 12 + 1) == "monsoon"
                           else 3] for i in range(len(history))])
        y = np.array(history, dtype=float)

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        model = LinearRegression().fit(X_scaled, y)

        # Predict next month
        next_month_num = (current_month % 12) + 1
        next_season    = get_season(next_month_num)
        next_season_enc = 1 if next_season=="summer" else 2 if next_season=="monsoon" else 3
        X_next = scaler.transform([[len(history), next_season_enc]])
        predicted_raw = max(10, int(model.predict(X_next)[0]))

        # Season boost
        season_mult   = season_rules.get(current_season, {}).get(name, 1.0)
        predicted     = int(predicted_raw * season_mult)
        season_effect = round((season_mult - 1.0) * 100)

        # Accuracy metrics
        y_pred_train = model.predict(X_scaled)
        r2     = max(0, round(r2_score(y, y_pred_train) * 100, 1))
        mae    = round(mean_absolute_error(y, y_pred_train), 1)
        confidence = min(98, max(60, int(r2 * 0.9 + 10)))

        # Without AI (simple avg)
        without_ai = int(sum(history[-3:]) / 3)

        current_stock = sum(qtys)
        reorder_qty   = max(0, predicted - current_stock)
        status        = "LOW_STOCK" if reorder_qty > 0 else "STOCK_OK"
        trend         = "up" if predicted > without_ai else "down"
        avg_monthly   = int(sum(history) / len(history))

        results.append({
            "name":            name,
            "predicted_demand":predicted,
            "without_ai":      without_ai,
            "ai_improvement":  predicted - without_ai,
            "current_stock":   current_stock,
            "suggest_reorder": reorder_qty,
            "status":          status,
            "season":          current_season,
            "season_icon":     season_icon,
            "season_effect":   season_effect,
            "season_multiplier": season_mult,
            "confidence":      confidence,
            "r2_score":        r2,
            "mae":             mae,
            "trend":           trend,
            "avg_monthly":     avg_monthly,
            "history":         history,
            "method":          "Linear Regression + Season Boost + StandardScaler",
            "features_used":   ["month_index", "season_encoded"],
        })

    return jsonify(sorted(results, key=lambda x: x["suggest_reorder"], reverse=True))

# ───────────── DISPENSE ─────────────
@app.route("/dispense", methods=["POST"])
def dispense():
    data = request.get_json()
    name = data.get("name")
    qty  = int(data.get("quantity", 1))
    matching = sorted(
        [m for m in medicines if m["name"].lower() == name.lower()],
        key=lambda x: x["expiry"]
    )
    if not matching:
        return jsonify({"error": "Drug not found"}), 404
    batch = matching[0]
    if batch["quantity"] < qty:
        return jsonify({"error": "Insufficient stock"}), 400
    batch["quantity"] -= qty
    return jsonify({"success": True})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)