import { useAuth } from "../context/AuthContext";
import { useDrugs } from "../context/DrugContext";

export default function Sidebar({ page, setPage }) {
  const { user, logout } = useAuth();
  const { drugs } = useDrugs();
  const role = user?.role;

  const TODAY = new Date();
  const expiring = drugs.filter(d => Math.ceil((new Date(d.expiry) - TODAY) / 86400000) <= 60).length;
  const reorders = drugs.filter(d => d.quantity <= (d.threshold || 30)).length;

  // Role-based nav
  const allNav = [
    { id:"dashboard",  icon:"⊞",  label:"Dashboard",      roles:["admin","manager","pharmacist"], section:"Overview" },
    { id:"inventory",  icon:"📦", label:"Inventory",       roles:["admin","manager","pharmacist"], badge: drugs.length, green:true },
    { id:"alerts",     icon:"🔔", label:"Expiry Alerts",   roles:["admin","manager","pharmacist"], badge: expiring||null },
    { id:"add",        icon:"➕", label:"Add Drug",         roles:["admin"],                        section:"Management" },
    { id:"reorder",    icon:"🛒", label:"Reorder Queue",   roles:["admin","manager"],               badge: reorders||null },
    { id:"suppliers",  icon:"🏪", label:"Suppliers",       roles:["admin","manager"] },
    { id:"users",      icon:"👥", label:"User Management", roles:["admin"] },
    { id:"ai",         icon:"🤖", label:"AI Predictions",  roles:["admin","manager","pharmacist"], section:"Intelligence" },
    { id:"analytics",  icon:"📊", label:"Analytics",       roles:["admin","manager"] },
    { id:"reports",    icon:"📋", label:"Reports",         roles:["admin","manager"] },
    { id:"settings",   icon:"⚙️", label:"Settings",        roles:["admin"],                        section:"System" },
{ id:"reorderPage", icon:"📦", label:"Order Drugs", roles:["admin","manager","pharmacist"] },
  ];

  const nav = allNav.filter(n => n.roles.includes(role));

  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-icon">💊</div>
        <div className="logo-text">
          Med<span className="hi">Stock</span>
          <br/>
          <span style={{fontSize:10,color:"var(--muted)",fontWeight:400}}>AI Pharmacy OS</span>
        </div>
      </div>

      <nav className="nav">
        {nav.map(item => (
          <div key={item.id}>
            {item.section && <div className="nav-label">{item.section}</div>}
            <div className={`nav-item${page===item.id?" active":""}`} onClick={()=>setPage(item.id)}>
              <span className="ni">{item.icon}</span>
              {item.label}
              {item.badge!=null && <span className={`nbadge${item.green?" g":""}`}>{item.badge}</span>}
            </div>
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="av-row">
          <div className="av">{user?.initials||"?"}</div>
          <div>
            <div className="av-name">{user?.name}</div>
            <div className="av-role" style={{color: role==="admin"?"var(--red)":role==="manager"?"var(--green)":"var(--accent)"}}>
              {user?.title} · {role?.toUpperCase()}
            </div>
          </div>
        </div>
        <button className="logout-btn" onClick={logout}>Sign Out</button>
      </div>
    </aside>
  );
}
