import { useState } from "react";
import { useAuth } from "../context/AuthContext";

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

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">💊</div>
          <h1>Medi<span>Guard</span></h1>
          <p>AI Pharmacy OS · City General Hospital</p>
        </div>

        <form onSubmit={handleSubmit}>
          {err && <div className="err-msg">⚠ {err}</div>}

          <div className="ff" style={{ marginBottom:14 }}>
            <label>Email</label>
            <input
              type="email"
              placeholder="your@hospital.in"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="ff" style={{ marginBottom:20 }}>
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={pass}
              onChange={e => setPass(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            style={{ width:"100%", justifyContent:"center",backgroundColor:"var(--accent)", padding:"13px" , fontSize:15 }}
            disabled={loading}
          >
            {loading ? "⏳ Signing in…" : "Sign In →"}
          </button>
        </form>

        <div style={{ marginTop:24, padding:16, background:"rgba(0,200,255,0.06)", borderRadius:12, border:"1px solid rgba(0,200,255,0.15)" }}>
          <div style={{ fontSize:11, color:"var(--muted)", fontFamily:"Syne,sans-serif", fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:10 }}>Demo Credentials</div>
          <div style={{ fontSize:13, color:"var(--muted)", lineHeight:1.8 }}>
            <span style={{ color:"var(--accent)" }}>Admin:</span> admin@medistock.in / Admin@123<br/>
            <span style={{ color:"var(--green)" }}>Manager:</span> Add via Admin panel<br/>
            <span style={{ color:"var(--yellow)" }}>Pharmacist:</span> Add via Admin panel
          </div>
        </div>
      </div>
    </div>
  );
}
