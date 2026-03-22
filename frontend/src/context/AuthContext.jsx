import { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc, setDoc, getDoc, getDocs,
  collection, deleteDoc, serverTimestamp
} from "firebase/firestore";
import { auth, db } from "../utils/firebase";
import logo from "../assets/logo.png";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [err,     setErr]     = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Check Firestore for user profile
        const snap = await getDoc(doc(db, "users", fbUser.uid));
        if (snap.exists()) {
          const data = snap.data();
          setUser({
            uid:      fbUser.uid,
            email:    fbUser.email,
            name:     data.name,
            role:     data.role,
            title:    data.title,
            initials: data.initials,
          });
        } else {
          // First time admin login — save to Firestore
          const adminData = {
            uid:      fbUser.uid,
            email:    fbUser.email,
            name:     "Admin",
            role:     "admin",
            title:    "System Administrator",
            initials: "AD",
            createdAt: serverTimestamp(),
          };
          await setDoc(doc(db, "users", fbUser.uid), adminData);
          setUser({ ...adminData, uid: fbUser.uid, email: fbUser.email });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // ── Login ──
  async function login(email, pass) {
    try {
      setErr("");
      await signInWithEmailAndPassword(auth, email.trim(), pass);
      return true;
    } catch {
      setErr("Invalid email or password!");
      return false;
    }
  }

  // ── Logout ──
  async function logout() {
    await signOut(auth);
    setUser(null);
  }

  // ── Add Staff User ──
  async function addStaffUser({ email, password, name, role, title }) {
    try {
      // Save current admin email/pass to re-login after
      const adminEmail = auth.currentUser?.email;

      // Create new Firebase Auth user
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const uid  = cred.user.uid;
      const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

      // Save to Firestore
      await setDoc(doc(db, "users", uid), {
        uid,
        email:     email.trim(),
        name,
        role,
        title,
        initials,
        createdAt: serverTimestamp(),
      });

      // Sign out new user
      await signOut(auth);

      return { success: true };
    } catch (e) {
      const msg = e.code === "auth/email-already-in-use"
        ? "Email already registered!"
        : e.code === "auth/weak-password"
        ? "Password too weak (min 6 chars)"
        : e.message;
      return { success: false, error: msg };
    }
  }

  // ── Get All Users ──
  async function getAllUsers() {
    try {
      const snap = await getDocs(collection(db, "users"));
      return snap.docs.map(d => ({ ...d.data(), uid: d.id }));
    } catch {
      return [];
    }
  }

  // ── Delete Staff User ──
  async function deleteStaffUser(uid) {
    try {
      await deleteDoc(doc(db, "users", uid));
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  if (loading)
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f0f4f8",
        flexDirection: "column",
        gap: 14,
      }}>
        <img src={logo} alt="MedStock AI" style={{ width:64, height:64, borderRadius:16, objectFit:"cover" }} />
        <div style={{ fontSize:16, fontWeight:600, color:"#0ea5e9" }}>Loading MedStock AI...</div>
      </div>
    );

  return (
    <AuthCtx.Provider value={{ user, login, logout, err, addStaffUser, getAllUsers, deleteStaffUser }}>
      {children}
    </AuthCtx.Provider>
  );
}
