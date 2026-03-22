# 🧠 MediStock AI

### 🚑 AI-Powered Pharmacy Inventory Management System

![React](https://img.shields.io/badge/Frontend-React-blue)
![Flask](https://img.shields.io/badge/Backend-Flask-black)
![Python](https://img.shields.io/badge/ML-Python-green)
![Scikit-Learn](https://img.shields.io/badge/ML-ScikitLearn-orange)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📌 Overview

**MediStock AI** is an intelligent pharmacy inventory management platform designed to help pharmacies manage medicine stock efficiently.

The system monitors **expiry dates**, detects **low stock**, predicts **future medicine demand using Machine Learning**, and ensures safe storage conditions with **automated alerts**.

---

## 🚀 Key Features

### 💊 Smart Inventory Tracking

Track medicines with:

* Batch number
* Quantity
* Expiry date
* Supplier details

Real-time inventory monitoring ensures pharmacists always know current stock levels.

---

### ⏳ FEFO Algorithm (First Expiry First Out)

Medicines with the **earliest expiry date appear first** in the inventory list.

This ensures:

* Reduced medicine wastage
* Better pharmacy management
* Safer medicine distribution

---

### ⚠️ Expiry Alerts

Automatically detects medicines **expiring within 60 days** and marks them as **Expiring**.

This helps pharmacies:

* Avoid selling expired medicines
* Take timely action

---

### 📉 Low Stock Detection

The system monitors medicine quantity.

If stock goes below the threshold:

📧 **Automatic alerts are generated**

---

### 🤖 AI Demand Prediction

Uses **Machine Learning (Linear Regression)** to analyze past sales data and predict **future medicine demand**.

This helps pharmacies:

* Order medicines in advance
* Prevent stockouts
* Optimize inventory planning

---

### 🌡 Sensor Monitoring

Tracks **temperature and humidity** to ensure medicines are stored in safe conditions.

If storage conditions exceed safe limits:

📧 **Automatic email alerts are sent**

---

### 📊 Analytics Dashboard

Visual dashboard showing:

* Inventory statistics
* Stock insights
* Demand predictions
* Medicine distribution

---

### 📄 Export Inventory Reports

Generate and download **inventory reports in CSV/PDF format** for record keeping and analysis.

---

## 🏗 System Architecture


React Frontend
       ↓
Flask API Backend
       ↓
Inventory Database
       ↓
AI Prediction Engine (Scikit-Learn)
       ↓
Sensor Monitoring + Email Alerts


🛠 Tech Stack

 Frontend

* React
* Vite
* Recharts (Charts)

### Backend

* Flask
* Flask-CORS

### Machine Learning

* Python
* Scikit-Learn
* Linear Regression

### Other Tools

* SMTP (Email alerts)
* GitHub (Version control)

---

## 📷 Project Preview

Add screenshots of your dashboard here.


<img width="1908" height="912" alt="image" src="https://github.com/user-attachments/assets/e78af173-8bb8-4a66-811d-b479e14e879d" />
<img width="1906" height="911" alt="image" src="https://github.com/user-attachments/assets/0474cd7f-c364-4063-b6ca-2673cbc9d34b" />





## 🎯 Future Improvements

* Deep Learning demand prediction
* IoT sensor integration
* Mobile app for pharmacists
* Supplier auto-ordering system

---

## 👨‍💻 Author

Developed by Innovate X

---

⭐ If you like this project, consider giving it a star on GitHub!
