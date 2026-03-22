import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

export default function LoginPage() {
  const { login, err } = useAuth();
  const [email, setEmail]     = useState("");
  const [pass,  setPass]      = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    await login(email, pass);
    setLoading(false);
  }

  const features = [
    { icon: "🤖", title: "AI-Powered Predictions", desc: "ML forecasting for drug demand using Linear Regression" },
    { icon: "📦", title: "Smart Inventory",         desc: "FEFO-based stock management with real-time alerts" },
    { icon: "📄", title: "PDF Reports",             desc: "One-click professional reports for expiry & low stock" },
    { icon: "🔔", title: "Instant Alerts",          desc: "Auto email to admin when stock or expiry threshold hit" },
  ];

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      fontFamily: "'Inter', system-ui, sans-serif",
      background: "#f0f4f8",
    }}>

      {/* ── LEFT PANEL ── */}
      <div style={{
        flex: 1,
        background: "linear-gradient(135deg, #0ea5e9 0%, #0369a1 60%, #075985 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "60px 56px",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Decorative circles */}
        <div style={{ position:"absolute", top:-80, right:-80, width:300, height:300, borderRadius:"50%", background:"rgba(255,255,255,0.06)" }} />
        <div style={{ position:"absolute", bottom:-60, left:-60, width:240, height:240, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
        <div style={{ position:"absolute", top:"40%", right:40, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.04)" }} />

        {/* Logo + Brand */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:52 }}>
          <img
            src={logo}
            alt="MedStock AI"
            style={{
              width:56, height:56,
              borderRadius:14,
              objectFit:"cover",
              background:"rgba(255,255,255,0.12)",
              padding:4,
              boxShadow:"0 2px 12px rgba(0,0,0,0.2)"
            }}
          />
          <div>
            <div style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:22, color:"#fff", lineHeight:1 }}>
              Med<span style={{ color:"#bae6fd" }}>Stock</span> AI
            </div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.6)", marginTop:2 }}>AI Pharmacy OS</div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ marginBottom:40 }}>
          <h2 style={{
            fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:34,
            color:"#fff", lineHeight:1.25, marginBottom:12, margin:0, marginBottom:12
          }}>
            Smart Drug Inventory<br/>
            <span style={{ color:"#bae6fd" }}>for Modern Hospitals</span>
          </h2>
          <p style={{ fontSize:15, color:"rgba(255,255,255,0.72)", lineHeight:1.7, maxWidth:380, marginTop:12 }}>
            Manage your pharmacy with AI-powered predictions, real-time alerts, and automated PDF reports — all in one place.
          </p>
        </div>

        {/* Features */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {features.map(f => (
            <div key={f.title} style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
              <div style={{
                width:38, height:38, borderRadius:10, flexShrink:0,
                background:"rgba(255,255,255,0.12)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:18
              }}>{f.icon}</div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:"#fff", marginBottom:2 }}>{f.title}</div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)", lineHeight:1.5 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom badge */}
        <div style={{
          marginTop:48, display:"flex", alignItems:"center", gap:8,
          padding:"10px 16px", background:"rgba(255,255,255,0.1)",
          borderRadius:10, width:"fit-content"
        }}>
          <span style={{ width:8, height:8, borderRadius:"50%", background:"#4ade80", display:"inline-block", boxShadow:"0 0 6px #4ade80" }} />
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.85)", fontWeight:500 }}>City General Hospital · Pharmacy Dept.</span>
        </div>

      </div>
      {/* END LEFT PANEL */}

      {/* ── RIGHT PANEL ── */}
      <div style={{
        width: 480,
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "52px 48px",
        boxShadow: "-4px 0 30px rgba(0,0,0,0.06)",
      }}>

        {/* Header */}
        <div style={{ marginBottom:36 }}>
          <h3 style={{ fontFamily:"Syne,sans-serif", fontWeight:800, fontSize:26, color:"#1e293b", marginBottom:6 }}>
            Welcome back 👋
          </h3>
          <p style={{ fontSize:14, color:"#64748b", margin:0 }}>Sign in to your MedStock AI account</p>
        </div>

        {/* Error */}
        {err && (
          <div style={{
            padding:"10px 14px", borderRadius:8, marginBottom:18,
            background:"rgba(220,38,38,0.06)", border:"1px solid rgba(220,38,38,0.2)",
            fontSize:13, color:"#dc2626", fontWeight:500
          }}>⚠ {err}</div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:18 }}>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:".06em", marginBottom:6 }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="your@hospital.in"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width:"100%", padding:"11px 14px",
                border:"1.5px solid #e2e8f0", borderRadius:9,
                fontSize:14, color:"#1e293b", background:"#f8fafc",
                outline:"none", boxSizing:"border-box"
              }}
              onFocus={e => { e.target.style.borderColor="#0ea5e9"; e.target.style.boxShadow="0 0 0 3px rgba(14,165,233,0.1)"; e.target.style.background="#fff"; }}
              onBlur={e  => { e.target.style.borderColor="#e2e8f0"; e.target.style.boxShadow="none"; e.target.style.background="#f8fafc"; }}
            />
          </div>

          <div style={{ marginBottom:28 }}>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:".06em", marginBottom:6 }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••••"
              value={pass}
              onChange={e => setPass(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width:"100%", padding:"11px 14px",
                border:"1.5px solid #e2e8f0", borderRadius:9,
                fontSize:14, color:"#1e293b", background:"#f8fafc",
                outline:"none", boxSizing:"border-box"
              }}
              onFocus={e => { e.target.style.borderColor="#0ea5e9"; e.target.style.boxShadow="0 0 0 3px rgba(14,165,233,0.1)"; e.target.style.background="#fff"; }}
              onBlur={e  => { e.target.style.borderColor="#e2e8f0"; e.target.style.boxShadow="none"; e.target.style.background="#f8fafc"; }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width:"100%", padding:"13px",
              background: loading ? "#94a3b8" : "linear-gradient(135deg,#0ea5e9,#0284c7)",
              color:"#fff", border:"none", borderRadius:9,
              fontSize:15, fontWeight:600, cursor: loading ? "not-allowed" : "pointer",
              boxShadow:"0 4px 14px rgba(14,165,233,0.35)",
              letterSpacing:".02em"
            }}
            onMouseOver={e => { if (!loading) e.target.style.opacity=".88"; }}
            onMouseOut={e  => { e.target.style.opacity="1"; }}
          >
            {loading ? "⏳ Signing in…" : "Sign In →"}
          </button>
        </form>

        {/* Demo Credentials */}
        <div style={{
          marginTop:28, padding:"16px 18px",
          background:"#f8fafc", borderRadius:10,
          border:"1px solid #e2e8f0"
        }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#94a3b8", letterSpacing:".08em", textTransform:"uppercase", marginBottom:10 }}>
            Demo Credentials
          </div>
          {[
            ["Admin",      "admin@medistock.in / Admin@123", "#0ea5e9"],
            ["Manager",    "Add via Admin panel",            "#16a34a"],
            ["Pharmacist", "Add via Admin panel",            "#d97706"],
          ].map(([role, cred, color]) => (
            <div key={role} style={{ display:"flex", gap:8, marginBottom:6, fontSize:13, alignItems:"baseline" }}>
              <span style={{ color, fontWeight:700, minWidth:80 }}>{role}:</span>
              <span style={{ color:"#64748b" }}>{cred}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop:32, textAlign:"center", fontSize:12, color:"#94a3b8" }}>
          MedStock AI v2.0 · Secure Login · 🔒 Firebase Auth
        </div>

      </div>
      {/* END RIGHT PANEL */}

    </div>
  );
}
