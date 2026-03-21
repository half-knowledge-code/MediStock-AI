import { useState } from "react";

export default function AlertButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const checkAndNotify = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("http://localhost:5000/check-alerts");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: "Backend se connect nahi ho paya" });
    }
    setLoading(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={checkAndNotify}
        disabled={loading}
        className="btn btn-outline btn-sm"
        style={{ borderColor: "rgba(255,77,109,0.5)", color: "var(--red)" }}
      >
        {loading ? "Checking..." : "🔔 Notify Admin"}
      </button>

      {result && !result.error && (
        <div style={{
          position: "absolute", top: "110%", right: 0, zIndex: 999,
          background: "var(--card)", border: "1px solid var(--border)",
          borderRadius: 12, padding: "14px 16px", minWidth: 280,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
        }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
            {result.email_sent ? "✅ Email bhej di admin ko!" : "ℹ️ Koi alert nahi mila"}
          </div>
          {result.alerts.slice(0, 5).map((a, i) => (
            <div key={i} style={{
              fontSize: 12, padding: "5px 8px", marginBottom: 4,
              borderRadius: 6,
              background: a.type === "stock" ? "rgba(255,140,66,0.1)" : "rgba(255,77,109,0.1)",
              color: a.type === "stock" ? "var(--orange)" : "var(--red)"
            }}>
              <b>{a.name}</b> — {a.reason}
            </div>
          ))}
          {result.total > 5 && (
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
              ...aur {result.total - 5} alerts hain
            </div>
          )}
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 8, textAlign: "right" }}>
            Total: {result.total} alerts
          </div>
        </div>
      )}

      {result?.error && (
        <div style={{
          position: "absolute", top: "110%", right: 0, zIndex: 999,
          background: "var(--card)", border: "1px solid rgba(255,77,109,0.3)",
          borderRadius: 12, padding: "12px 16px", minWidth: 220,
          color: "var(--red)", fontSize: 13
        }}>
          ❌ {result.error}
        </div>
      )}
    </div>
  );
}