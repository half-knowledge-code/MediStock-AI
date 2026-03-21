import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  ArcElement, PointElement, LineElement,
  Tooltip, Legend, Filler
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, BarElement,
  ArcElement, PointElement, LineElement,
  Tooltip, Legend, Filler
);

import { useState, useEffect } from "react";
import { useDrugs } from "../context/DrugContext";
import { useAuth } from "../context/AuthContext";
import {
  getStatus, daysToExpiry, fefoSort, exportCSV,
  inventoryValue, ML_PREDICTIONS, SUPPLIERS, CATEGORIES
} from "../utils/data";
import AlertButton from "../components/AlertButton";

// ── HELPERS ──────────────────────────────────────
function AnimNum({ v }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let c = 0;
    const s = Math.max(1, Math.ceil(v / 40));
    const t = setInterval(() => {
      c += s;
      if (c >= v) { setN(v); clearInterval(t); }
      else setN(c);
    }, 18);
    return () => clearInterval(t);
  }, [v]);
  return <span>{n}</span>;
}

function Pill({ status }) {
  const map = {
    ok:   ["ok",   "✅ Good"],
    exp:  ["exp",  "⚠ Expiring"],
    crit: ["crit", "🔴 Critical"],
    low:  ["low",  "📉 Low Stock"],
  };
  const [cls, label] = map[status] || ["ok", "Good"];
  return <span className={`pill ${cls}`}>{label}</span>;
}

function DonutChart({ good, exp, crit, low }) {
  const total = good + exp + crit + low || 1;
  const r = 54, cx = 64, cy = 64, circ = 2 * Math.PI * r;
  let offset = 0;
  const segs = [
    { val: good, color: "#00e5a0" },
    { val: exp,  color: "#ffcb47" },
    { val: crit, color: "#ff4d6d" },
    { val: low,  color: "#ff8c42" },
  ].map(s => { const d = { ...s, offset }; offset += s.val / total * circ; return d; });

  return (
    <div className="donut-wrap">
      <svg width="128" height="128" className="donut-svg">
        {segs.map((s, i) => (
          <circle key={i} r={r} cx={cx} cy={cy} fill="none" stroke={s.color}
            strokeWidth="18"
            strokeDasharray={`${s.val / total * circ} ${circ}`}
            strokeDashoffset={-s.offset} />
        ))}
        <circle r="40" cx={cx} cy={cy} fill="var(--card)" />
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#e8f4ff" fontSize="18"
          fontWeight="800" fontFamily="Syne" transform={`rotate(90 ${cx} ${cy})`}>{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="var(--muted)" fontSize="10"
          transform={`rotate(90 ${cx} ${cy})`}>drugs</text>
      </svg>
      <div className="legend">
        {[["#00e5a0","Good",good],["#ffcb47","Expiring",exp],["#ff4d6d","Critical",crit],["#ff8c42","Low Stock",low]].map(([c,l,v])=>(
          <div className="li" key={l}>
            <div className="ld" style={{ background: c }} />
            <span>{l}</span>
            <span style={{ marginLeft:"auto", color:"var(--muted)", fontSize:12 }}>{((v/total)*100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── DASHBOARD ──────────────────────────────────────
export function Dashboard({ setPage }) {
  const { drugs } = useDrugs();
  const statuses = drugs.map(d => getStatus(d));
  const good = statuses.filter(s => s === "ok").length;
  const exp  = statuses.filter(s => s === "exp").length;
  const crit = statuses.filter(s => s === "crit").length;
  const low  = statuses.filter(s => s === "low").length;
  const val  = inventoryValue(drugs);
  const recent = fefoSort(drugs).slice(0, 6);
  const alerts = drugs.filter(d => { const s = getStatus(d); return s === "crit" || s === "low"; });

  return (
    <div className="page active">
      <div className="topbar">
        <div>
          <div className="page-title">AI-Powered Drug <span>Inventory</span></div>
          <div className="page-sub">City General Hospital · Pharmacy Dept. · <span style={{ color:"var(--green)" }}>● System Online</span></div>
        </div>
        <div className="topbar-right">
          {alerts.length > 0 && (
            <span style={{ background:"rgba(255,77,109,0.12)", border:"1px solid rgba(255,77,109,0.3)", borderRadius:100, padding:"6px 14px", fontSize:12, fontWeight:700, color:"var(--red)" }}>
              ⚠ {alerts.length} Alert{alerts.length > 1 ? "s" : ""} Active
            </span>
          )}
          <AlertButton />
          <button className="btn btn-primary btn-sm" onClick={() => setPage("add")}>➕ Add Drug</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div className="kpi-icon">💊</div>
          <div className="kpi-val"><AnimNum v={drugs.length} /></div>
          <div className="kpi-label">Total Drug Items</div>
          <div className="kpi-sub">₹{val.toLocaleString()} inventory value</div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-icon">✅</div>
          <div className="kpi-val"><AnimNum v={good} /></div>
          <div className="kpi-label">In-Stock & Valid</div>
          <div className="kpi-sub">{((good / (drugs.length || 1)) * 100).toFixed(0)}% healthy stock</div>
        </div>
        <div className="kpi-card yellow">
          <div className="kpi-icon">⚠️</div>
          <div className="kpi-val"><AnimNum v={exp} /></div>
          <div className="kpi-label">Expiring &lt;180 Days</div>
          <div className="kpi-sub">{crit} critical (&lt;30 days)</div>
        </div>
        <div className="kpi-card red">
          <div className="kpi-icon">📉</div>
          <div className="kpi-val"><AnimNum v={low} /></div>
          <div className="kpi-label">Low Stock Items</div>
          <div className="kpi-sub">Below reorder threshold</div>
        </div>
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">Recent Inventory (FEFO Order)</span>
            <button className="btn btn-outline btn-sm" onClick={() => setPage("inventory")}>View All →</button>
          </div>
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>Drug Name</th><th>Category</th><th>Stock</th><th>Expiry</th><th>Status</th></tr></thead>
              <tbody>
                {recent.map(d => (
                  <tr key={d.id}>
                    <td><b>{d.name}</b></td>
                    <td><span className="chip">{d.category}</span></td>
                    <td style={{ fontWeight:700, color: d.quantity <= d.threshold ? "var(--red)" : "var(--text)" }}>{d.quantity}</td>
                    <td style={{ color: daysToExpiry(d.expiry) <= 90 ? "var(--yellow)" : "var(--muted)", fontSize:13 }}>{d.expiry}</td>
                    <td><Pill status={getStatus(d)} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="side-stack">
          <div className="panel">
            <div className="panel-head"><span className="panel-title">Stock Health</span></div>
            <div className="panel-body">
              <DonutChart good={good} exp={exp} crit={crit} low={low} />
            </div>
          </div>
          <div className="panel">
            <div className="panel-head"><span className="panel-title">🚨 Active Alerts</span></div>
            <div className="panel-body" style={{ maxHeight:200, overflowY:"auto" }}>
              {alerts.length === 0 && <div className="empty"><div className="ei">✅</div><p>No active alerts</p></div>}
              {alerts.slice(0, 4).map(d => {
                const s = getStatus(d);
                return (
                  <div className="alert-item" key={d.id}>
                    <div className={`adot ${s === "crit" ? "critical" : "warning"}`} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600 }}>{d.name} — {d.batch}</div>
                      <div style={{ fontSize:12, color:"var(--muted)" }}>
                        {s === "crit" ? `Expires in ${daysToExpiry(d.expiry)} days` : `Stock: ${d.quantity} (threshold: ${d.threshold})`}
                      </div>
                    </div>
                    <span className={`atag ${s === "crit" ? "critical" : "warning"}`}>{s === "crit" ? "Critical" : "Low Stock"}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── INVENTORY ──────────────────────────────────────
export function Inventory({ setPage }) {
  const { drugs, deleteDrug } = useDrugs();
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("all");
  const [sortKey, setSortKey] = useState("expiry");
  const [sortDir, setSortDir] = useState("asc");
  const [pg, setPg]           = useState(1);
  const [detail, setDetail]   = useState(null);
  const PER = 10;

  const filtered = fefoSort(drugs)
    .filter(d => {
      const s = search.toLowerCase();
      return d.name.toLowerCase().includes(s) || d.batch.toLowerCase().includes(s) ||
        d.category.toLowerCase().includes(s) || d.supplier.toLowerCase().includes(s);
    })
    .filter(d => filter === "all" || getStatus(d) === filter)
    .sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (typeof av === "string") { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      return sortDir === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

  const pages = Math.max(1, Math.ceil(filtered.length / PER));
  const paged = filtered.slice((pg - 1) * PER, pg * PER);

  function thClick(k) {
    if (sortKey === k) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
  }
  const arrow = k => sortKey === k ? (sortDir === "asc" ? " ↑" : " ↓") : " ↕";

  return (
    <div className="page active">
      <div className="topbar">
        <div>
          <div className="page-title">📦 <span>Inventory</span></div>
          <div className="page-sub">All {drugs.length} drug stock records · FEFO sorted</div>
        </div>
        <div className="topbar-right">
          <div className="search-box">
            <span>🔍</span>
            <input placeholder="Search drug, batch, supplier…" value={search}
              onChange={e => { setSearch(e.target.value); setPg(1); }} />
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => exportCSV(drugs)}>📤 Export CSV</button>
          <button className="btn btn-primary btn-sm" onClick={() => setPage("add")}>➕ Add Drug</button>
        </div>
      </div>

      <div className="panel">
        <div className="filter-row">
          {[["all","All"],["ok","✅ Good"],["exp","⚠ Expiring"],["crit","🔴 Critical"],["low","📉 Low Stock"]].map(([k,l]) => (
            <button key={k} className={`filter-btn${filter === k ? " active" : ""}`}
              onClick={() => { setFilter(k); setPg(1); }}>{l}</button>
          ))}
          <span style={{ marginLeft:"auto", fontSize:12, color:"var(--muted)" }}>{filtered.length} results</span>
        </div>

        <div className="tbl-wrap">
          <table>
            <thead><tr>
              {[["id","#"],["name","Drug Name"],["category","Category"],["batch","Batch"],["quantity","Stock"],["expiry","Expiry"],["supplier","Supplier"]].map(([k,l]) => (
                <th key={k} onClick={() => thClick(k)}>{l}{arrow(k)}</th>
              ))}
              <th>Status</th><th>Action</th>
            </tr></thead>
            <tbody>
              {paged.length === 0 && <tr><td colSpan={9}><div className="empty"><div className="ei">📦</div><p>No drugs found</p></div></td></tr>}
              {paged.map(d => (
                <tr key={d.id} onClick={() => setDetail(d)}>
                  <td style={{ color:"var(--muted)", fontSize:12 }}>#{d.id}</td>
                  <td><b>{d.name}</b></td>
                  <td><span className="chip">{d.category}</span></td>
                  <td style={{ fontFamily:"monospace", fontSize:12, color:"var(--muted)" }}>{d.batch}</td>
                  <td style={{ fontWeight:700, color: d.quantity <= d.threshold ? "var(--red)" : "var(--green)" }}>{d.quantity}</td>
                  <td style={{ color: daysToExpiry(d.expiry) <= 90 ? "var(--yellow)" : "var(--muted)", fontSize:13 }}>
                    {d.expiry}<br /><span style={{ fontSize:11 }}>{daysToExpiry(d.expiry)}d left</span>
                  </td>
                  <td style={{ fontSize:13 }}>{d.supplier}</td>
                  <td><Pill status={getStatus(d)} /></td>
                  <td onClick={e => e.stopPropagation()}>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteDrug(d.id)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button className="pg-btn" disabled={pg === 1} onClick={() => setPg(p => p - 1)}>‹</button>
          {Array.from({ length: pages }, (_, i) => (
            <button key={i} className={`pg-btn${pg === i + 1 ? " active" : ""}`} onClick={() => setPg(i + 1)}>{i + 1}</button>
          ))}
          <button className="pg-btn" disabled={pg === pages} onClick={() => setPg(p => p + 1)}>›</button>
        </div>
      </div>

      {detail && (
        <div className="modal-overlay open" onClick={() => setDetail(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <span className="modal-title">💊 Drug Details</span>
              <button className="modal-close" onClick={() => setDetail(null)}>✕</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              {[["Name",detail.name],["Category",detail.category],["Batch",detail.batch],
                ["Quantity",detail.quantity],["Threshold",detail.threshold],["Unit Price","₹"+detail.unitPrice],
                ["Expiry",detail.expiry],["Days Left",daysToExpiry(detail.expiry)+" days"],
                ["Supplier",detail.supplier],["Status",<Pill key="s" status={getStatus(detail)} />]
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize:11, color:"var(--muted)", marginBottom:4, fontWeight:700, letterSpacing:".07em", textTransform:"uppercase" }}>{k}</div>
                  <div style={{ fontSize:15, fontWeight:600 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:10, marginTop:22 }}>
              <button className="btn btn-danger" onClick={() => { deleteDrug(detail.id); setDetail(null); }}>🗑 Delete Record</button>
              <button className="btn btn-outline" style={{ marginLeft:"auto" }} onClick={() => setDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── EXPIRY ALERTS ──────────────────────────────────────
export function ExpiryAlerts() {
  const { drugs } = useDrugs();
  const [resolved, setResolved] = useState(new Set());

  const alerts = fefoSort(drugs)
    .filter(d => !resolved.has(d.id))
    .map(d => ({ ...d, days: daysToExpiry(d.expiry), status: getStatus(d) }))
    .filter(d => d.days <= 180 || d.status === "low")
    .sort((a, b) => a.days - b.days);

  return (
    <div className="page active">
      <div className="topbar">
        <div>
          <div className="page-title">⬰ <span>Expiry Alerts</span></div>
          <div className="page-sub">Drugs expiring soon or critically low — {alerts.length} active</div>
        </div>
        <button className="btn btn-success btn-sm" onClick={() => setResolved(new Set(alerts.map(a => a.id)))}>✔ Resolve All</button>
      </div>

      {alerts.length === 0 && <div className="panel"><div className="empty"><div className="ei">✅</div><p>No active alerts. All drugs are in good condition.</p></div></div>}
      {alerts.map(d => (
        <div className="panel" key={d.id} style={{ marginBottom:12 }}>
          <div style={{ padding:"16px 20px", display:"flex", alignItems:"center", gap:14 }}>
            <div className={`adot ${d.days <= 30 ? "critical" : d.status === "low" ? "warning" : "info"}`} style={{ width:12, height:12 }} />
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:15 }}>{d.name} <span style={{ fontFamily:"monospace", fontSize:12, color:"var(--muted)" }}>{d.batch}</span></div>
              <div style={{ fontSize:13, color:"var(--muted)", marginTop:3 }}>
                {d.supplier} · Stock: <b style={{ color: d.quantity <= d.threshold ? "var(--red)" : "var(--text)" }}>{d.quantity}</b> units · Expires: <b style={{ color:"var(--yellow)" }}>{d.expiry}</b>
              </div>
              <div style={{ marginTop:8, height:5, background:"rgba(255,255,255,0.06)", borderRadius:20, overflow:"hidden", maxWidth:300 }}>
                <div style={{ width: Math.min(100, Math.max(5, d.days / 180 * 100)) + "%", height:"100%", borderRadius:20, background: d.days <= 30 ? "var(--red)" : d.days <= 90 ? "var(--yellow)" : "var(--green)" }} />
              </div>
              <div style={{ fontSize:11, color:"var(--muted)", marginTop:4 }}>{d.days} days remaining</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8 }}>
              <Pill status={d.status} />
              <button className="btn btn-success btn-sm" onClick={() => setResolved(p => new Set([...p, d.id]))}>✔ Mark Resolved</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── ADD DRUG (FIXED) ──────────────────────────────────────
export function AddDrug({ setPage }) {
  const { addDrug } = useDrugs();
  const [form, setForm] = useState({ name:"", category:"", batch:"", quantity:"", threshold:"30", unitPrice:"", expiry:"", supplier:"", notes:"" });

  function upd(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function submit(e) {
    e.preventDefault();
    addDrug({ ...form, quantity: +form.quantity, threshold: +form.threshold, unitPrice: +form.unitPrice });
    setPage("inventory");
  }

  return (
    <div className="page active">
      <div className="topbar">
        <div>
          <div className="page-title">➕ Add <span>New Drug</span></div>
          <div className="page-sub">Add a new drug entry to the inventory</div>
        </div>
      </div>
      <div className="panel">
        <div className="panel-head"><span className="panel-title">Drug Entry Form</span></div>
        <div className="panel-body">
          <form onSubmit={submit}>
            <div className="form-grid">
              <div className="ff"><label>Drug Name *</label><input placeholder="e.g. Paracetamol" value={form.name} onChange={e => upd("name", e.target.value)} required /></div>
              <div className="ff"><label>Category *</label>
                <select value={form.category} onChange={e => upd("category", e.target.value)} required>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="ff"><label>Batch No. *</label><input placeholder="e.g. BATCH-1234" value={form.batch} onChange={e => upd("batch", e.target.value)} required /></div>
              <div className="ff"><label>Quantity *</label><input type="number" min="0" placeholder="Units in stock" value={form.quantity} onChange={e => upd("quantity", e.target.value)} required /></div>
              <div className="ff"><label>Expiry Date *</label><input type="date" value={form.expiry} onChange={e => upd("expiry", e.target.value)} required /></div>
              <div className="ff"><label>Reorder Threshold</label><input type="number" min="0" value={form.threshold} onChange={e => upd("threshold", e.target.value)} /></div>
              <div className="ff"><label>Unit Price (₹)</label><input type="number" min="0" step="0.01" placeholder="Price per unit" value={form.unitPrice} onChange={e => upd("unitPrice", e.target.value)} /></div>
              <div className="ff"><label>Supplier</label><input placeholder="Supplier name" value={form.supplier} onChange={e => upd("supplier", e.target.value)} /></div>
              <div className="ff full"><label>Notes</label><textarea placeholder="Additional notes…" value={form.notes} onChange={e => upd("notes", e.target.value)} /></div>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:20 }}>
              <button className="btn btn-primary" type="submit">💾 Save Drug Entry</button>
              <button className="btn btn-outline" type="button" onClick={() => setPage("inventory")}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── REORDER QUEUE ──────────────────────────────────────
export function ReorderQueue() {
  const { drugs, reorderDrug } = useDrugs();
  const reorders = drugs.filter(d => d.quantity <= d.threshold).sort((a, b) => a.quantity - b.quantity);

  return (
    <div className="page active">
      <div className="topbar">
        <div>
          <div className="page-title">🛒 <span>Reorder Queue</span></div>
          <div className="page-sub">{reorders.length} items below reorder threshold</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => reorders.forEach(d => reorderDrug(d.id))}>📨 Reorder All</button>
      </div>
      <div className="panel">
        {reorders.length === 0 && <div className="empty"><div className="ei">✅</div><p>All drugs are adequately stocked</p></div>}
        {reorders.map(d => (
          <div className="ro-item" key={d.id}>
            <div style={{ width:42, height:42, borderRadius:11, background:"rgba(255,77,109,0.12)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>💊</div>
            <div className="ro-info">
              <div className="ro-name">{d.name} <span style={{ fontFamily:"monospace", fontSize:11, color:"var(--muted)" }}>{d.batch}</span></div>
              <div className="ro-meta">Stock: <b style={{ color:"var(--red)" }}>{d.quantity}</b> / Threshold: {d.threshold} · {d.supplier}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:13, color:"var(--muted)", marginBottom:6 }}>Suggest reorder: <b style={{ color:"var(--accent)" }}>{d.threshold * 3}</b> units</div>
              <button className="btn btn-primary btn-sm" onClick={() => reorderDrug(d.id)}>📨 Reorder</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── SUPPLIERS ──────────────────────────────────────
export function Suppliers() {
  return (
    <div className="page active">
      <div className="topbar">
        <div><div className="page-title">🏪 <span>Suppliers</span></div><div className="page-sub">Registered pharmacy suppliers</div></div>
        <button className="btn btn-primary btn-sm">➕ Add Supplier</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
        {SUPPLIERS.map(s => (
          <div className="panel" key={s.id}>
            <div className="panel-body">
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:"rgba(0,200,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🏪</div>
                <div><div style={{ fontWeight:700, fontSize:14 }}>{s.name}</div><div style={{ fontSize:11, color:"var(--muted)" }}>{s.area}</div></div>
              </div>
              <div style={{ fontSize:13, color:"var(--muted)", marginBottom:4 }}>📞 {s.contact}</div>
              <div style={{ fontSize:13, color:"var(--muted)", marginBottom:12 }}>✉ {s.email}</div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span style={{ fontSize:12, color:"var(--green)" }}>★ {s.rating}/5.0</span>
                <button className="btn btn-outline btn-sm" onClick={() => window.open(`mailto:${s.email}`)}>Contact</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── AI PREDICTIONS ──────────────────────────────────────
export function AIPredictions() {
  const [selected, setSelected] = useState(null);
  const [animating, setAnimating] = useState(false);

  const totalReorder = ML_PREDICTIONS.reduce((s, p) => s + p.reorderQty, 0);
  const highRisk     = ML_PREDICTIONS.filter(p => p.reorderQty > 50).length;
  const upTrend      = ML_PREDICTIONS.filter(p => p.trend === "up").length;

  function handleSelect(p) {
    setAnimating(true);
    setSelected(p);
    setTimeout(() => setAnimating(false), 300);
  }

  return (
    <div className="page active">
      <div className="topbar">
        <div>
          <div className="page-title">🤖 AI <span>Predictions</span></div>
          <div className="page-sub">scikit-learn Linear Regression · Season-aware · Updated daily</div>
        </div>
        <div className="topbar-right">
          <div style={{ display:"flex", gap:6, alignItems:"center", background:"rgba(0,200,255,0.08)", border:"1px solid rgba(0,200,255,0.2)", borderRadius:20, padding:"5px 12px", fontSize:12 }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:"#00e5a0", display:"inline-block", boxShadow:"0 0 6px #00e5a0" }} />
            ML Model Active
          </div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
        {[
          { icon:"📦", label:"Total Reorder Units", val: totalReorder, color:"var(--accent)", sub:"across all drugs" },
          { icon:"⚠️", label:"High Risk Drugs",     val: highRisk,     color:"var(--red)",    sub:"need urgent reorder" },
          { icon:"📈", label:"Upward Trend",        val: upTrend,      color:"var(--green)",  sub:"demand increasing" },
        ].map(s => (
          <div key={s.label} className="panel" style={{ padding:"18px 20px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ fontSize:28 }}>{s.icon}</div>
              <div>
                <div style={{ fontFamily:"Syne", fontWeight:800, fontSize:26, color:s.color, lineHeight:1 }}>{s.val}</div>
                <div style={{ fontSize:12, fontWeight:600, marginTop:2 }}>{s.label}</div>
                <div style={{ fontSize:11, color:"var(--muted)" }}>{s.sub}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:16, alignItems:"start" }}>
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">💊 Drug-wise Predictions</span>
            <span style={{ fontSize:12, color:"var(--muted)" }}>{ML_PREDICTIONS.length} drugs</span>
          </div>
          <div style={{ padding:"8px 0" }}>
            {ML_PREDICTIONS.map((p, i) => {
              const isSelected = selected?.name === p.name;
              return (
                <div key={p.name} onClick={() => handleSelect(p)} style={{
                  display:"flex", alignItems:"center", gap:14, padding:"12px 20px", cursor:"pointer",
                  borderLeft: isSelected ? "3px solid var(--accent)" : "3px solid transparent",
                  background: isSelected ? "rgba(0,102,255,0.06)" : "transparent",
                  transition:"all 0.15s", borderBottom:"1px solid var(--border)"
                }}>
                  <div style={{ fontSize:11, color:"var(--muted)", width:20, textAlign:"center", fontFamily:"monospace" }}>{String(i+1).padStart(2,"0")}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                      <span style={{ fontWeight:700, fontSize:14 }}>{p.name}</span>
                      <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:20, background: p.trend === "up" ? "rgba(0,229,160,0.12)" : "rgba(255,77,109,0.12)", color: p.trend === "up" ? "var(--green)" : "var(--red)" }}>
                        {p.trend === "up" ? "↑ Rising" : "↓ Falling"}
                      </span>
                      {p.reorderQty > 50 && <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:20, background:"rgba(255,203,71,0.12)", color:"var(--yellow)" }}>⚠ Urgent</span>}
                    </div>
                    <div style={{ height:4, background:"rgba(255,255,255,0.06)", borderRadius:10, overflow:"hidden" }}>
                      <div style={{ width: Math.min(100, p.predicted / 200 * 100) + "%", height:"100%", borderRadius:10, background: p.reorderQty > 50 ? "linear-gradient(90deg,var(--red),#ff8c42)" : "linear-gradient(90deg,var(--accent2),var(--accent))", transition:"width 0.6s ease" }} />
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:4, fontSize:11, color:"var(--muted)" }}>
                      <span>Avg: {p.avgMonthly}/mo</span>
                      <span style={{ color:"var(--accent)" }}>Predicted: {p.predicted}/mo</span>
                    </div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:10, color:"var(--muted)", marginBottom:2 }}>Reorder</div>
                    <div style={{ fontFamily:"Syne", fontWeight:800, fontSize:18, color: p.reorderQty > 0 ? "var(--red)" : "var(--green)" }}>
                      {p.reorderQty > 0 ? `+${p.reorderQty}` : "✓ OK"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ position:"sticky", top:20 }}>
          {selected ? (
            <div className="panel" style={{ opacity: animating ? 0 : 1, transform: animating ? "translateY(8px)" : "translateY(0)", transition:"all 0.3s ease" }}>
              <div className="panel-head">
                <span className="panel-title">🔍 Drug Detail</span>
                <button className="btn btn-outline btn-sm" onClick={() => setSelected(null)}>✕</button>
              </div>
              <div style={{ padding:"16px 20px" }}>
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontFamily:"Syne", fontWeight:800, fontSize:20, marginBottom:4 }}>{selected.name}</div>
                  <div style={{ display:"flex", gap:8 }}>
                    <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background: selected.trend === "up" ? "rgba(0,229,160,0.12)" : "rgba(255,77,109,0.12)", color: selected.trend === "up" ? "var(--green)" : "var(--red)" }}>
                      {selected.trend === "up" ? "↑ Rising Demand" : "↓ Falling Demand"}
                    </span>
                    <span style={{ fontSize:11, padding:"3px 10px", borderRadius:20, background:"rgba(0,102,255,0.1)", color:"var(--accent)" }}>{selected.season || "—"}</span>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                  {[
                    ["Avg Monthly", selected.avgMonthly, "var(--muted)"],
                    ["Predicted",   selected.predicted,  "var(--accent)"],
                    ["Reorder Qty", selected.reorderQty > 0 ? `+${selected.reorderQty}` : "✓ OK", selected.reorderQty > 0 ? "var(--red)" : "var(--green)"],
                    ["Confidence",  `${selected.confidence}%`, "var(--yellow)"],
                  ].map(([l, v, c]) => (
                    <div key={l} style={{ background:"rgba(255,255,255,0.03)", borderRadius:10, padding:"10px 12px" }}>
                      <div style={{ fontSize:10, color:"var(--muted)", marginBottom:4, textTransform:"uppercase", letterSpacing:".07em" }}>{l}</div>
                      <div style={{ fontFamily:"Syne", fontWeight:800, fontSize:18, color:c }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom:16 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"var(--muted)", marginBottom:6 }}>
                    <span>Model Confidence</span>
                    <span style={{ color:"var(--yellow)", fontWeight:700 }}>{selected.confidence}%</span>
                  </div>
                  <div style={{ height:6, background:"rgba(255,255,255,0.06)", borderRadius:10, overflow:"hidden" }}>
                    <div style={{ width: selected.confidence + "%", height:"100%", borderRadius:10, background:"linear-gradient(90deg,#ffcb47,#ff8c42)", transition:"width 0.6s ease" }} />
                  </div>
                </div>
                <div style={{ fontSize:11, color:"var(--muted)", background:"rgba(255,255,255,0.03)", borderRadius:8, padding:"8px 12px", fontFamily:"monospace" }}>
                  🧠 {selected.method || "Linear Regression + Season Logic"}
                </div>
                {selected.reorderQty > 0 && (
                  <div style={{ marginTop:14, padding:"10px 14px", borderRadius:10, background:"rgba(255,77,109,0.08)", border:"1px solid rgba(255,77,109,0.2)", fontSize:13, color:"var(--red)", fontWeight:600 }}>
                    ⚠ Reorder <b>{selected.reorderQty} units</b> immediately to meet predicted demand.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="panel" style={{ padding:"32px 20px", textAlign:"center" }}>
              <div style={{ fontSize:40, marginBottom:12 }}>👈</div>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:6 }}>Select a Drug</div>
              <div style={{ fontSize:13, color:"var(--muted)" }}>Click any drug on the left to see detailed AI prediction breakdown</div>
            </div>
          )}
          <div className="panel" style={{ marginTop:14 }}>
            <div className="panel-head"><span className="panel-title">🧠 How AI Works</span></div>
            <div style={{ padding:"12px 20px" }}>
              {[
                ["📊", "Data Input",  "Historical stock + dispensing data"],
                ["📉", "Model",       "scikit-learn Linear Regression"],
                ["🌤", "Seasonality", "Summer/Monsoon/Winter adjustments"],
                ["✅", "Output",      "Predicted demand + reorder qty"],
              ].map(([icon, title, desc]) => (
                <div key={title} style={{ display:"flex", gap:10, marginBottom:12, alignItems:"flex-start" }}>
                  <div style={{ fontSize:18, flexShrink:0, marginTop:1 }}>{icon}</div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700 }}>{title}</div>
                    <div style={{ fontSize:11, color:"var(--muted)" }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ANALYTICS (CHART.JS — CLEAN BLUE THEME) ──────────────────────────────────────
export function Analytics() {
  const { drugs } = useDrugs();
  const val = inventoryValue(drugs);

  const statuses = drugs.map(d => getStatus(d));
  const good = statuses.filter(s => s === "ok").length;
  const exp  = statuses.filter(s => s === "exp").length;
  const crit = statuses.filter(s => s === "crit").length;
  const low  = statuses.filter(s => s === "low").length;

  // ── Bar Chart: Single blue family, varying opacity ──
  const catLabels = CATEGORIES;
  const catQtys   = CATEGORIES.map(c => drugs.filter(d => d.category === c).reduce((s, d) => s + d.quantity, 0));

  const barData = {
    labels: catLabels,
    datasets: [{
      label: "Units in Stock",
      data: catQtys,
      backgroundColor: catQtys.map((_, i) => `rgba(${20 + i * 4}, ${140 - i * 6}, ${255 - i * 10}, 0.78)`),
      borderColor:     catQtys.map((_, i) => `rgba(${20 + i * 4}, ${140 - i * 6}, ${255 - i * 10}, 1)`),
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  const barOptions = {
    responsive: true,
    animation: { duration: 1200, easing: "easeOutQuart" },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(10,15,30,0.95)",
        titleColor: "#00c8ff",
        bodyColor: "#e8f4ff",
        borderColor: "rgba(0,180,255,0.25)",
        borderWidth: 1,
        padding: 12,
        callbacks: { label: ctx => `  ${ctx.parsed.y} units in stock` }
      }
    },
    scales: {
      x: { ticks: { color: "#6b7fa0", font: { size: 11 } }, grid: { color: "rgba(255,255,255,0.04)" } },
      y: { ticks: { color: "#6b7fa0", font: { size: 11 } }, grid: { color: "rgba(255,255,255,0.06)" }, beginAtZero: true }
    }
  };

  // ── Doughnut Chart ──
  const doughnutData = {
    labels: ["Good", "Expiring", "Critical", "Low Stock"],
    datasets: [{
      data: [good, exp, crit, low],
      backgroundColor: ["rgba(0,229,160,0.85)","rgba(255,203,71,0.85)","rgba(255,77,109,0.85)","rgba(255,140,66,0.85)"],
      borderColor: ["#00e5a0","#ffcb47","#ff4d6d","#ff8c42"],
      borderWidth: 2,
      hoverOffset: 12,
    }]
  };

  const doughnutOptions = {
    responsive: true,
    animation: { animateRotate: true, animateScale: true, duration: 1000 },
    cutout: "65%",
    plugins: {
      legend: { position:"bottom", labels: { color:"#6b7fa0", padding:16, font:{ size:12 }, usePointStyle:true, pointStyleWidth:10 } },
      tooltip: { backgroundColor:"rgba(10,15,30,0.95)", titleColor:"#00c8ff", bodyColor:"#e8f4ff", borderColor:"rgba(0,180,255,0.25)", borderWidth:1, padding:12 }
    }
  };

  // ── Line Chart: Avg vs Predicted ──
  const lineData = {
  labels: topDrugs.map(p => p.name),
  datasets: [
    {
      label: "Avg Monthly",
      data: topDrugs.map(p => p.avgMonthly),
      borderColor: "rgba(180,100,255,0.9)",
      backgroundColor: (ctx) => {
        const chart = ctx.chart;
        const { ctx: c, chartArea } = chart;
        if (!chartArea) return "transparent";
        const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, "rgba(160,80,255,0.35)");
        gradient.addColorStop(1, "rgba(100,40,200,0.02)");
        return gradient;
      },
      pointBackgroundColor: "rgba(200,130,255,1)",
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 10,
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: "rgba(200,130,255,1)",
      pointHoverBorderWidth: 3,
      tension: 0.45,
      fill: true,
      borderWidth: 2.5,
    },
    {
      label: "AI Predicted",
      data: topDrugs.map(p => p.predicted),
      borderColor: "rgba(130,80,255,0.9)",
      backgroundColor: (ctx) => {
        const chart = ctx.chart;
        const { ctx: c, chartArea } = chart;
        if (!chartArea) return "transparent";
        const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, "rgba(100,50,220,0.3)");
        gradient.addColorStop(1, "rgba(60,20,160,0.02)");
        return gradient;
      },
      pointBackgroundColor: "rgba(150,100,255,1)",
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 10,
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: "rgba(150,100,255,1)",
      pointHoverBorderWidth: 3,
      tension: 0.45,
      fill: true,
      borderDash: [6, 3],
      borderWidth: 2.5,
    }
  ]
};

const lineOptions = {
  responsive: true,
  animation: { duration: 1400, easing: "easeInOutQuart" },
  interaction: {
    mode: "index",
    intersect: false,  // ← cursor pe dono lines ka data dikhega
  },
  plugins: {
    legend: {
      labels: {
        color: "#b080ff",
        font: { size: 12 },
        usePointStyle: true,
        pointStyleWidth: 10
      }
    },
    tooltip: {
      backgroundColor: "rgba(20,10,50,0.92)",
      titleColor: "#c090ff",
      bodyColor: "#e8d8ff",
      borderColor: "rgba(160,80,255,0.4)",
      borderWidth: 1,
      padding: 14,
      cornerRadius: 10,
      mode: "index",
      intersect: false,
      callbacks: {
        label: ctx => `  ${ctx.dataset.label}: ${ctx.parsed.y} units`
      }
    }
  },
  scales: {
    x: {
      ticks: { color: "#7050a0", font: { size: 10 }, maxRotation: 30 },
      grid: { color: "rgba(150,80,255,0.06)" }
    },
    y: {
      ticks: { color: "#7050a0", font: { size: 11 } },
      grid: { color: "rgba(150,80,255,0.08)" },
      beginAtZero: true
    }
  }
};
  
  return (
    <div className="page active">
      <div className="topbar">
        <div>
          <div className="page-title">📊 <span>Analytics</span></div>
          <div className="page-sub">Live inventory insights · Powered by Chart.js</div>
        </div>
      </div>

      {/* KPI Row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        {[
          ["💰", "Inventory Value", "₹"+val.toLocaleString(), "#00e5a0"],
          ["📦", "Total SKUs",      drugs.length,              "#00c8ff"],
          ["🔴", "Critical",        crit,                      "#ff4d6d"],
          ["📉", "Low Stock",       low,                       "#ff8c42"],
        ].map(([icon, label, v, color]) => (
          <div key={label} className="panel" style={{ padding:"16px 18px" }}>
            <div style={{ fontSize:22, marginBottom:6 }}>{icon}</div>
            <div style={{ fontFamily:"Syne", fontWeight:800, fontSize:22, color, lineHeight:1 }}>{v}</div>
            <div style={{ fontSize:12, color:"var(--muted)", marginTop:4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Row 1: Bar + Doughnut */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:16, marginBottom:16 }}>
        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">📦 Stock by Category</span>
            <span style={{ fontSize:11, color:"var(--muted)" }}>hover for details</span>
          </div>
          <div className="panel-body" style={{ padding:"12px 16px" }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <span className="panel-title">🩺 Stock Health</span>
            <span style={{ fontSize:11, color:"var(--muted)" }}>{drugs.length} total</span>
          </div>
          <div className="panel-body" style={{ padding:"12px 16px", display:"flex", flexDirection:"column", alignItems:"center" }}>
            <div style={{ position:"relative", width:200 }}>
              <Doughnut data={doughnutData} options={doughnutOptions} />
              <div style={{ position:"absolute", top:"36%", left:"50%", transform:"translate(-50%,-50%)", textAlign:"center", pointerEvents:"none" }}>
                <div style={{ fontFamily:"Syne", fontWeight:800, fontSize:26, color:"#e8f4ff" }}>{good}</div>
                <div style={{ fontSize:11, color:"var(--muted)" }}>Good</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Line Chart */}
      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">📈 AI Predicted vs Avg Monthly Demand</span>
          <span style={{ fontSize:11, color:"var(--muted)" }}>Top 8 drugs · dashed = AI prediction</span>
        </div>
        <div className="panel-body" style={{ padding:"12px 16px" }}>
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>

      {/* FEFO */}
      <div className="panel" style={{ marginTop:16 }}>
        <div className="panel-body" style={{ display:"flex", alignItems:"center", gap:20, padding:"16px 20px" }}>
          <div style={{ fontFamily:"Syne", fontWeight:800, fontSize:42, color:"var(--green)" }}>100%</div>
          <div>
            <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>FEFO Compliance</div>
            <div style={{ fontSize:13, color:"var(--muted)" }}>First Expiry First Out · All dispensing is FEFO compliant · Zero wastage policy active</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── REPORTS ──────────────────────────────────────
export function Reports() {
  const { drugs } = useDrugs();

  function exportPDF(title, data) {
    import("jspdf").then(({ jsPDF }) => {
      const doc = new jsPDF();
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 30, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("MediGuard — " + title, 14, 18);
      doc.setFontSize(9);
      doc.setTextColor(160, 180, 200);
      doc.text("Generated: " + new Date().toLocaleString(), 14, 26);

      const headers = ["#", "Drug Name", "Batch", "Qty", "Expiry", "Supplier", "Status"];
      const colWidths = [10, 40, 28, 15, 28, 35, 28];
      let y = 42;

      doc.setFillColor(30, 41, 59);
      doc.rect(10, y - 6, 190, 8, "F");
      doc.setTextColor(100, 200, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      let x = 12;
      headers.forEach((h, i) => { doc.text(h, x, y); x += colWidths[i]; });

      y += 6;
      data.forEach((d, idx) => {
        if (y > 270) { doc.addPage(); y = 20; }
        if (idx % 2 === 0) { doc.setFillColor(20, 30, 48); doc.rect(10, y - 5, 190, 7, "F"); }
        doc.setTextColor(220, 230, 240);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        const days = daysToExpiry(d.expiry);
        const status = days <= 30 ? "Critical" : days <= 180 ? "Expiring" : d.quantity <= d.threshold ? "Low Stock" : "Good";
        const row = [String(idx+1), d.name, d.batch, String(d.quantity), d.expiry, d.supplier, status];
        x = 12;
        row.forEach((val, i) => {
          if (i === 6) {
            const c = status === "Critical" ? [255,77,109] : status === "Expiring" ? [255,203,71] : status === "Low Stock" ? [255,140,66] : [0,229,160];
            doc.setTextColor(...c);
          } else { doc.setTextColor(220, 230, 240); }
          doc.text(String(val).substring(0, 18), x, y);
          x += colWidths[i];
        });
        y += 7;
      });

      doc.setTextColor(80, 100, 120);
      doc.setFontSize(8);
      doc.text(`Total Records: ${data.length}  |  MediGuard v2.0  |  City General Hospital`, 14, 285);
      doc.save(`MediGuard_${title.replace(/ /g,"_")}.pdf`);
    });
  }

  const reports = [
    { icon:"📅", title:"Expiry Report",   sub:"Drugs expiring within 90 days",  fn: () => exportPDF("Expiry Report",   fefoSort(drugs).filter(d => daysToExpiry(d.expiry) <= 90)), color:"var(--yellow)" },
    { icon:"📉", title:"Low Stock Report",sub:"Drugs below reorder threshold",   fn: () => exportPDF("Low Stock Report",drugs.filter(d => d.quantity <= d.threshold)),              color:"var(--red)" },
    { icon:"📋", title:"Full Inventory",  sub:"Complete inventory snapshot",     fn: () => exportPDF("Full Inventory",  drugs),                                                     color:"var(--accent)" },
  ];

  return (
    <div className="page active">
      <div className="topbar">
        <div>
          <div className="page-title">📋 <span>Reports</span></div>
          <div className="page-sub">Generate pharmacy reports as PDF</div>
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18 }}>
        {reports.map(r => (
          <div className="panel" key={r.title} style={{ cursor:"pointer" }} onClick={r.fn}>
            <div className="panel-body" style={{ textAlign:"center", padding:"32px 20px" }}>
              <div style={{ fontSize:40, marginBottom:14 }}>{r.icon}</div>
              <div style={{ fontFamily:"Syne", fontWeight:800, fontSize:16, marginBottom:6, color:r.color }}>{r.title}</div>
              <div style={{ fontSize:13, color:"var(--muted)", marginBottom:20 }}>{r.sub}</div>
              <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center" }}>📄 Download PDF</button>
            </div>
          </div>
        ))}
      </div>
      <div className="panel" style={{ marginTop:18 }}>
        <div className="panel-body" style={{ display:"flex", alignItems:"center", gap:16, padding:"14px 20px" }}>
          <div style={{ fontSize:28 }}>📄</div>
          <div>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:3 }}>PDF Format</div>
            <div style={{ fontSize:12, color:"var(--muted)" }}>Dark-themed professional PDF · Colored status rows · Auto page break · Hospital header & footer</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── SETTINGS ──────────────────────────────────────
export function Settings() {
  const { clearAll } = useDrugs();
  const { user }     = useAuth();
  const [settings, setSettings] = useState({
    hospital: "City General Hospital",
    pharmacist: user?.name || "",
    dept: "Pharmacy Department",
    alertDays: "90",
    threshold: "30",
  });

  return (
    <div className="page active">
      <div className="topbar">
        <div><div className="page-title">⚙️ <span>Settings</span></div><div className="page-sub">System preferences</div></div>
      </div>
      <div className="two-col" style={{ gridTemplateColumns:"1fr 1fr" }}>
        <div className="panel">
          <div className="panel-head"><span className="panel-title">Pharmacy Info</span></div>
          <div className="panel-body">
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {[["Hospital Name","hospital","text"],["Pharmacist Name","pharmacist","text"],["Department","dept","text"],["Expiry Alert (days)","alertDays","number"],["Low Stock Threshold","threshold","number"]].map(([l,k,t]) => (
                <div className="ff" key={k}>
                  <label>{l}</label>
                  <input type={t} value={settings[k]} onChange={e => setSettings(s => ({ ...s, [k]: e.target.value }))} />
                </div>
              ))}
            </div>
            <button className="btn btn-primary" style={{ marginTop:16 }}>💾 Save Settings</button>
          </div>
        </div>
        <div>
          <div className="panel" style={{ borderColor:"rgba(255,77,109,0.25)" }}>
            <div className="panel-head"><span className="panel-title" style={{ color:"var(--red)" }}>⚠ Danger Zone</span></div>
            <div className="panel-body">
              <p style={{ fontSize:13, color:"var(--muted)", marginBottom:16 }}>This will permanently remove all drug records from the system.</p>
              <button className="btn btn-danger" onClick={() => { if (window.confirm("Clear ALL data? This cannot be undone.")) clearAll(); }}>🗑 Clear All Data</button>
            </div>
          </div>
          <div className="panel" style={{ marginTop:18 }}>
            <div className="panel-head"><span className="panel-title">System Info</span></div>
            <div className="panel-body">
              {[["Version","MediGuard v2.0"],["Tech","React + Vite"],["DB","Firebase Firestore"],["ML","Python Flask · scikit-learn"],["Auth","Firebase Auth"]].map(([k,v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid var(--border)" }}>
                  <span style={{ fontSize:13, color:"var(--muted)" }}>{k}</span>
                  <span style={{ fontSize:13, fontWeight:600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
