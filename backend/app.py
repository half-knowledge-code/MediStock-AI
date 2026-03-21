from flask import Flask, jsonify, request
from flask_cors import CORS
import random
from datetime import datetime, timedelta
import numpy as np
from sklearn.linear_model import LinearRegression
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

app = Flask(__name__)
CORS(app)

# ------------------- CONFIG -------------------

SENDER_EMAIL = "shubhamwork7007@gmail.com"
SENDER_PASSWORD = "mdvqqtqnrvodumea"   # ← sirf yahan apna Gmail App Password daalo
ADMIN_EMAIL = "itsmeanshu248@gmail.com"

# ------------------- DATA -------------------

medicine_names = [
    "Paracetamol","Ibuprofen","Amoxicillin","Ciprofloxacin","Azithromycin",
    "Metformin","Aspirin","Insulin","Dolo 650","Pantoprazole",
    "Cetirizine","Diclofenac","Omeprazole","Atorvastatin","Losartan","ORS","Cough Syrup"
]

categories = {
    "Paracetamol":"Analgesic","Ibuprofen":"NSAID","Amoxicillin":"Antibiotic","Ciprofloxacin":"Antibiotic",
    "Azithromycin":"Antibiotic","Metformin":"Antidiabetic","Aspirin":"Antiplatelet","Insulin":"Hormone",
    "Dolo 650":"Analgesic","Pantoprazole":"PPI","Cetirizine":"Antihistamine","Diclofenac":"NSAID",
    "Omeprazole":"PPI","Atorvastatin":"Cardiac","Losartan":"Cardiac","ORS":"Hydration","Cough Syrup":"Cold"
}

suppliers = {
    "Paracetamol":"Micro Labs","Ibuprofen":"Cipla Ltd","Amoxicillin":"Alkem Labs","Ciprofloxacin":"MedPlus Pharma",
    "Azithromycin":"Cipla Ltd","Metformin":"Sun Pharma","Aspirin":"Bayer","Insulin":"Novo Nordisk",
    "Dolo 650":"Micro Labs","Pantoprazole":"Sun Pharma","Cetirizine":"Dr. Reddy's","Diclofenac":"Alkem Labs",
    "Omeprazole":"Dr. Reddy's","Atorvastatin":"Sun Pharma","Losartan":"MedPlus Pharma","ORS":"WHO Supply",
    "Cough Syrup":"Generic Pharma"
}

unit_prices = {
    "Paracetamol":3,"Ibuprofen":4,"Amoxicillin":6,"Ciprofloxacin":12,"Azithromycin":15,
    "Metformin":6,"Aspirin":2,"Insulin":95,"Dolo 650":3,"Pantoprazole":9,"Cetirizine":4,
    "Diclofenac":5,"Omeprazole":7,"Atorvastatin":8,"Losartan":10,"ORS":8,"Cough Syrup":12
}

# ------------------- GENERATE STOCK -------------------

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
        "threshold": 50   # ← 50 kar diya
    })

# ------------------- EMAIL -------------------

def send_alert_email(alerts):
    msg = MIMEMultipart()
    msg["From"] = SENDER_EMAIL
    msg["To"] = ADMIN_EMAIL
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

# ------------------- HELPERS -------------------

def simulate_history(base, months=6):
    h = []
    for m in range(months):
        h.append(max(5, int(base * 0.6 + random.randint(-8, 12) + m * random.uniform(0.3, 1.5))))
    return h

def get_season(month):
    if month in [3, 4, 5, 6]:
        return "summer"
    elif month in [7, 8, 9]:
        return "monsoon"
    else:
        return "winter"

# ------------------- ROUTES -------------------

@app.route("/")
def home():
    return jsonify({"message": "MediStock AI Backend", "status": "online"})

@app.route("/medicines")
def get_medicines():
    return jsonify(medicines)

@app.route("/fefo")
def fefo():
    return jsonify(sorted(medicines, key=lambda x: x["expiry"])[:10])

@app.route("/low-stock")
def low_stock():
    return jsonify(
        sorted(
            [m for m in medicines if m["quantity"] <= m["threshold"]],
            key=lambda x: x["quantity"]
        )
    )

@app.route("/stats")
def stats():
    today = datetime.today()
    low = near = crit = val = 0
    for m in medicines:
        days = (datetime.strptime(m["expiry"], "%Y-%m-%d") - today).days
        if days <= 30:
            crit += 1
        elif days <= 180:
            near += 1
        if m["quantity"] <= m["threshold"]:
            low += 1
        val += m["quantity"] * m["unitPrice"]
    return jsonify({
        "total": len(medicines),
        "low_stock": low,
        "near_expiry": near,
        "critical": crit,
        "inventory_value": val
    })

# ------------------- EXPIRY + STOCK ALERT (FIXED) -------------------

@app.route("/expiry-alert")
def expiry_alert():
    today = datetime.today()
    alert = []
    for m in medicines:
        days = (datetime.strptime(m["expiry"], "%Y-%m-%d") - today).days
        if days < 45:        # ← 45 din
            alert.append({**m, "days_left": days})
    return jsonify(sorted(alert, key=lambda x: x["days_left"]))

@app.route("/check-alerts")
def check_alerts():
    today = datetime.today()
    alerts = []

    for m in medicines:
        days = (datetime.strptime(m["expiry"], "%Y-%m-%d") - today).days

        # Expiry 45 din se kam
        if days < 45:
            alerts.append({
                "id": m["id"],
                "name": m["name"],
                "batch": m["batch"],
                "reason": f"Expiry {days} din mein ({m['expiry']})",
                "type": "expiry"
            })

        # Stock 50 se kam
        if m["quantity"] < 50:
            alerts.append({
                "id": m["id"],
                "name": m["name"],
                "batch": m["batch"],
                "reason": f"Stock kam hai: {m['quantity']} units",
                "type": "stock"
            })

    email_sent = False
    if alerts:
        email_sent = send_alert_email(alerts)

    return jsonify({
        "alerts": alerts,
        "total": len(alerts),
        "email_sent": email_sent
    })

# ------------------- ML PREDICTION -------------------

@app.route("/ml-predict")
def ml_predict():
    drug_data = {}
    for m in medicines:
        drug_data.setdefault(m["name"], []).append(m["quantity"])

    current_month = datetime.now().month
    current_season = get_season(current_month)
    results = []

    for name, qtys in drug_data.items():
        base = int(sum(qtys) / len(qtys))
        history = simulate_history(base)
        X = np.array(range(len(history))).reshape(-1, 1)
        y = np.array(history, dtype=float)
        model = LinearRegression().fit(X, y)
        predicted = max(10, int(model.predict([[len(history)]])[0]))

        seasonal_factor = 1
        if name == "ORS" and current_season == "summer":
            seasonal_factor = 1.5
        elif name in ["Cough Syrup", "Cetirizine"] and current_season == "winter":
            seasonal_factor = 1.4

        predicted = int(predicted * seasonal_factor)
        current_stock = sum(qtys)

        results.append({
            "name": name,
            "predicted_demand": predicted,
            "current_stock": current_stock,
            "suggest_reorder": max(0, predicted - current_stock),
            "status": "STOCK_OK" if current_stock >= predicted else "LOW_STOCK",
            "season": current_season,
            "method": "Linear Regression + Season Logic"
        })

    return jsonify(sorted(results, key=lambda x: x["suggest_reorder"], reverse=True))

# ------------------- DISPENSE -------------------

@app.route("/dispense", methods=["POST"])
def dispense():
    data = request.get_json()
    name = data.get("name")
    qty = int(data.get("quantity", 1))
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

# ------------------- RUN -------------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)