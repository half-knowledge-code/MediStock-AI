import { createContext, useContext, useState, useEffect } from "react";
import {
  collection, onSnapshot, addDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy
} from "firebase/firestore";
import { db } from "../utils/firebase";

const DrugCtx = createContext(null);
export const useDrugs = () => useContext(DrugCtx);

const BASE = "http://localhost:5000";

export function DrugProvider({ children }) {
  const [drugs,   setDrugs]   = useState([]);
  const [mlData,  setMlData]  = useState([]);
  const [stats,   setStats]   = useState({ total:0, low_stock:0, near_expiry:0, critical:0, inventory_value:0 });
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState({ msg:"", type:"" });
  const [seeded,  setSeeded]  = useState(false);

  // Realtime Firestore listener
  useEffect(() => {
    const q = query(collection(db, "medicines"), orderBy("expiry", "asc"));
    const unsub = onSnapshot(q, async (snap) => {
      if (snap.empty && !seeded) {
        // Seed from Flask backend
        await seedFromBackend();
        setSeeded(true);
      } else {
        const meds = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setDrugs(meds);
        computeStats(meds);
        setLoading(false);
      }
    }, () => {
      // Firestore error — load from Flask
      loadFromFlask();
    });
    return unsub;
  }, []);

  // Load ML data from Flask
  useEffect(() => {
    fetch(`${BASE}/ml-predict`).then(r => r.json()).then(setMlData).catch(() => {});
  }, []);

  async function seedFromBackend() {
    try {
      const res  = await fetch(`${BASE}/medicines`);
      const meds = await res.json();
      for (const m of meds) {
        await addDoc(collection(db, "medicines"), {
          ...m,
          threshold: m.threshold || 30,
          unitPrice: m.unitPrice || 5,
          createdAt: serverTimestamp()
        });
      }
    } catch {
      showToast("⚠ Could not seed from backend", "error");
      setLoading(false);
    }
  }

  async function loadFromFlask() {
    try {
      const meds = await fetch(`${BASE}/medicines`).then(r => r.json());
      setDrugs(meds);
      computeStats(meds);
    } catch {
      showToast("⚠ Backend offline!", "error");
    } finally {
      setLoading(false);
    }
  }

  function computeStats(meds) {
    const today = new Date();
    let low=0, near=0, crit=0, val=0;
    meds.forEach(m => {
      const days = Math.ceil((new Date(m.expiry) - today) / 86400000);
      if (days <= 30)    crit++;
      else if (days <= 180) near++;
      if (m.quantity <= (m.threshold||30)) low++;
      val += (m.quantity||0) * (m.unitPrice||0);
    });
    setStats({ total:meds.length, low_stock:low, near_expiry:near, critical:crit, inventory_value:val });
  }

  function showToast(msg, type="success") {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg:"", type:"" }), 3000);
  }

  async function addDrug(d) {
    try {
      await addDoc(collection(db, "medicines"), { ...d, quantity:+d.quantity, threshold:+d.threshold||30, unitPrice:+d.unitPrice||0, createdAt: serverTimestamp() });
      showToast("✅ Drug added to Firestore!");
    } catch {
      showToast("❌ Failed to add drug", "error");
    }
  }

  async function deleteDrug(id) {
    try {
      await deleteDoc(doc(db, "medicines", id));
      showToast("🗑 Deleted from Firestore");
    } catch {
      setDrugs(prev => prev.filter(m => m.id !== id));
      showToast("🗑 Deleted locally");
    }
  }

  async function dispenseDrug(name, quantity, ward="OPD") {
    try {
      const res = await fetch(`${BASE}/dispense`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ name, quantity, ward })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ Dispensed ${quantity}x ${name} — FEFO: ${data.log.fefo_expiry}`);
        // Update Firestore quantity
        const drug = drugs.find(d => d.name === name);
        if (drug) {
          const ref = doc(db, "medicines", drug.id);
          await import("firebase/firestore").then(({ updateDoc }) =>
            updateDoc(ref, { quantity: drug.quantity - quantity })
          );
        }
      } else {
        showToast(`❌ ${data.error}`, "error");
      }
    } catch { showToast("❌ Dispense failed", "error"); }
  }

  function reorderDrug() { showToast("📬 Reorder sent!", "info"); }
  function clearAll()    { setDrugs([]); showToast("Cleared", "error"); }

  return (
    <DrugCtx.Provider value={{ drugs, stats, mlData, loading, addDrug, deleteDrug, dispenseDrug, reorderDrug, clearAll, toast }}>
      {children}
    </DrugCtx.Provider>
  );
}
