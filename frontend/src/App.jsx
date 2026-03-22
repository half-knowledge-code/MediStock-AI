import ReorderPage from "./pages/ReorderPage";
import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DrugProvider, useDrugs } from "./context/DrugContext";
import LoginPage from "./pages/LoginPage";
import Sidebar from "./components/Sidebar";
import UserManagement from "./pages/UserManagement";
import "./App.css"; 

import {
  Dashboard,
  Inventory,
  ExpiryAlerts,
  AddDrug,
  ReorderQueue,
  Suppliers,
  AIPredictions,
  Analytics,
  Reports,
  Settings
} from "./pages/Pages";

import "./index.css";

function Toast() {
  const { toast } = useDrugs();

  return (
    <div className={`toast ${toast.type} ${toast.msg ? "show" : ""}`}>
      {toast.msg}
    </div>
  );
}

function AccessDenied() {
  return (
    <div
      className="page active"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "60vh",
        flexDirection: "column",
        gap: 16
      }}
    >
      <div style={{ fontSize: 60 }}>🔒</div>

      <div
        style={{
          fontFamily: "Syne",
          fontWeight: 800,
          fontSize: 22,
          color: "var(--red)"
        }}
      >
        Access Denied
      </div>

      <div style={{ color: "var(--muted)", fontSize: 14 }}>
        You don't have permission to view this page.
      </div>
    </div>
  );
}

function AppShell() {

  const { user } = useAuth();
  const [page, setPage] = useState("dashboard");


  const role = user?.role || "admin";

  if (!user) return <LoginPage />;

 const canAccess = {
  dashboard: ["admin", "manager", "pharmacist"],
  inventory: ["admin", "manager", "pharmacist"],
  alerts: ["admin", "manager", "pharmacist"],
  add: ["admin"],
  reorder: ["admin", "manager"],
  suppliers: ["admin", "manager"],
  users: ["admin"],
  ai: ["admin", "manager", "pharmacist"],
  analytics: ["admin", "manager"],
  reports: ["admin", "manager"],
  settings: ["admin"],
  reorderPage: ["admin", "manager", "pharmacist"] 
};
  const allowed = canAccess[page]?.includes(role);

 const PAGES = {
  dashboard: <Dashboard setPage={setPage} />,
  inventory: <Inventory setPage={setPage} />,
  alerts: <ExpiryAlerts />,
  add: <AddDrug setPage={setPage} />,
  reorder: <ReorderQueue />,
  suppliers: <Suppliers />,
  users: <UserManagement />,
  ai: <AIPredictions />,
  analytics: <Analytics />,
  reports: <Reports />,
  settings: <Settings />,
  reorderPage: <ReorderPage />   
};

  return (
    <div className="shell">

      <Sidebar page={page} setPage={setPage} />

      <main className="main">
        {allowed ? (PAGES[page] || PAGES.dashboard) : <AccessDenied />}
      </main>

      <Toast />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DrugProvider>
        <AppShell />
      </DrugProvider>
    </AuthProvider>
  );
}
