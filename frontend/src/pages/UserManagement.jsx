import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const ROLES = [
  { value:"manager",    label:"Store Manager",    title:"Store Manager",    color:"var(--green)" },
  { value:"pharmacist", label:"Pharmacist",        title:"Chief Pharmacist", color:"var(--accent)" },
];

export default function UserManagement() {
  const { addStaffUser, getAllUsers, deleteStaffUser, user } = useAuth();
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState({ name:"", email:"", password:"", role:"pharmacist" });
  const [msg,     setMsg]     = useState({ text:"", type:"" });
  const [adding,  setAdding]  = useState(false);
  const [showForm,setShowForm]= useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const all = await getAllUsers();
    setUsers(all);
    setLoading(false);
  }

  function showMsg(text, type="success") {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text:"", type:"" }), 3000);
  }

  async function handleAdd(e) {
    e.preventDefault();
    setAdding(true);
    const role = ROLES.find(r => r.value === form.role);
    const result = await addStaffUser({
      email:    form.email,
      password: form.password,
      name:     form.name,
      role:     form.role,
      title:    role?.title || form.role,
    });
    if (result.success) {
      showMsg(`✅ ${form.name} added as ${form.role}!`);
      setForm({ name:"", email:"", password:"", role:"pharmacist" });
      setShowForm(false);
      await load();
    } else {
      showMsg(`❌ ${result.error}`, "error");
    }
    setAdding(false);
  }

  async function handleDelete(uid, name) {
    if (!window.confirm(`Remove ${name}?`)) return;
    await deleteStaffUser(uid);
    showMsg(`🗑 ${name} removed`);
    await load();
  }

  const roleColor = { admin:"var(--red)", manager:"var(--green)", pharmacist:"var(--accent)" };

  return (
    <div className="page active">
      <div className="topbar">
        <div>
          <div className="page-title">👥 <span>User Management</span></div>
          <div className="page-sub">Admin only · Add managers & pharmacists</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(f=>!f)}>
          {showForm ? "✕ Cancel" : "➕ Add User"}
        </button>
      </div>

      {msg.text && (
        <div style={{ padding:"12px 18px", borderRadius:12, marginBottom:18, fontSize:13, fontWeight:600, background: msg.type==="error"?"rgba(255,77,109,0.12)":"rgba(0,229,160,0.12)", border:`1px solid ${msg.type==="error"?"rgba(255,77,109,0.3)":"rgba(0,229,160,0.3)"}`, color: msg.type==="error"?"var(--red)":"var(--green)" }}>
          {msg.text}
        </div>
      )}

      {/* Add User Form */}
      {showForm && (
        <div className="panel" style={{ marginBottom:20 }}>
          <div className="panel-head"><span className="panel-title">Add New Staff Member</span></div>
          <div className="panel-body">
            <form onSubmit={handleAdd}>
              <div className="form-grid">
                <div className="ff">
                  <label>Full Name *</label>
                  <input placeholder="Dr. Priya Sharma" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required/>
                </div>
                <div className="ff">
                  <label>Role *</label>
                  <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
                    {ROLES.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div className="ff">
                  <label>Email *</label>
                  <input type="email" placeholder="staff@medistock.in" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required/>
                </div>
                <div className="ff">
                  <label>Password *</label>
                  <input type="password" placeholder="Min 6 characters" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} required minLength={6}/>
                </div>
              </div>
              <div style={{ marginTop:18, padding:14, background:"rgba(0,200,255,0.06)", borderRadius:10, fontSize:12, color:"var(--muted)", marginBottom:16 }}>
                <b style={{color:"var(--accent)"}}>Permissions:</b><br/>
                {form.role==="manager" ? "✅ View inventory · ✅ View alerts · ✅ Reorder drugs · ✅ View reports · ❌ Add/Delete drugs" : "✅ View inventory · ✅ Dispense drugs (FEFO) · ✅ View alerts · ❌ Manage users · ❌ Delete records"}
              </div>
              <div style={{display:"flex",gap:10}}>
                <button className="btn btn-primary" type="submit" disabled={adding}>{adding?"⏳ Adding…":"💾 Add Staff Member"}</button>
                <button className="btn btn-outline" type="button" onClick={()=>setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="panel">
        <div className="panel-head"><span className="panel-title">Staff Members ({users.length})</span></div>
        {loading && <div style={{padding:30,textAlign:"center",color:"var(--muted)"}}>⏳ Loading...</div>}
        <div className="tbl-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Access Level</th><th>Added</th><th>Action</th></tr></thead>
            <tbody>
              {users.map(u=>(
                <tr key={u.uid}>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${roleColor[u.role]||"var(--accent)"}33,${roleColor[u.role]||"var(--accent)"}11)`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,color:roleColor[u.role]||"var(--accent)",border:`1px solid ${roleColor[u.role]||"var(--accent)"}33`}}>
                        {u.initials||u.name?.slice(0,2).toUpperCase()}
                      </div>
                      <b>{u.name}</b>
                    </div>
                  </td>
                  <td style={{fontSize:13,color:"var(--muted)"}}>{u.email}</td>
                  <td><span className="pill" style={{background:`${roleColor[u.role]||"var(--accent)"}15`,color:roleColor[u.role]||"var(--accent)",border:`1px solid ${roleColor[u.role]||"var(--accent)"}30`}}>{u.role?.toUpperCase()}</span></td>
                  <td style={{fontSize:12,color:"var(--muted)"}}>
                    {u.role==="admin"?"Full Access":u.role==="manager"?"View + Reorder":"View + Dispense"}
                  </td>
                  <td style={{fontSize:12,color:"var(--muted)"}}>{u.createdAt?.slice(0,10)||"—"}</td>
                  <td>
                    {u.role!=="admin" && u.uid !== user?.uid && (
                      <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(u.uid,u.name)}>🗑 Remove</button>
                    )}
                    {u.role==="admin"&&<span style={{fontSize:11,color:"var(--muted)"}}>Protected</span>}
                  </td>
                </tr>
              ))}
              {users.length===0&&!loading&&<tr><td colSpan={6}><div className="empty"><div className="ei">👥</div><p>No users yet</p></div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permissions Card */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginTop:4}}>
        {[
          {role:"Admin",color:"var(--red)",icon:"🔐",perms:["Full system access","Add/Remove users","Delete records","View all reports","Manage settings"]},
          {role:"Manager",color:"var(--green)",icon:"📦",perms:["View inventory","View expiry alerts","Reorder drugs","View analytics","Export reports"]},
          {role:"Pharmacist",color:"var(--accent)",icon:"💊",perms:["View inventory (FEFO)","Dispense drugs","View expiry alerts","View AI predictions","No user management"]},
        ].map(r=>(
          <div className="panel" key={r.role}>
            <div className="panel-body">
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                <span style={{fontSize:24}}>{r.icon}</span>
                <div style={{fontFamily:"Syne",fontWeight:800,fontSize:15,color:r.color}}>{r.role}</div>
              </div>
              {r.perms.map(p=>(
                <div key={p} style={{fontSize:12,color:"var(--muted)",padding:"5px 0",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:6}}>
                  <span style={{color:r.color}}>✓</span> {p}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
