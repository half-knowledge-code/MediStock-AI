import { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

import { auth } from "../utils/firebase";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const unsub = onAuthStateChanged(auth, (fbUser) => {

      if (fbUser) {

        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          role: "admin"
        });

      } else {
        setUser(null);
      }

      setLoading(false);

    });

    return unsub;

  }, []);

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

  async function logout() {
    await signOut(auth);
    setUser(null);
  }

  if (loading)
    return (
      <div style={{
        minHeight:"100vh",
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        background:"#040d1a",
        color:"#00c8ff",
        fontSize:20
      }}>
        Loading MedStockAI...
      </div>
    );

  return (
    <AuthCtx.Provider value={{ user, login, logout, err }}>
      {children}
    </AuthCtx.Provider>
  );
}