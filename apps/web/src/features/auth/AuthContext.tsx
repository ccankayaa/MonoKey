import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../../app/firebase";

import { encryptedCache } from "../vault/encryptedCache";
import { store } from "../../app/store";
import { monoKeyApi } from "../../app/api";

interface AuthState { user: User | null; loading: boolean }
const AuthContext = createContext<AuthState>({ user: null, loading: true });

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(auth?.currentUser ?? null);
  const [loading, setLoading] = useState(Boolean(auth));
  useEffect(() => {
    if (!auth) return;
    let previous = auth.currentUser?.uid;
    return onAuthStateChanged(auth, next => { if (previous !== next?.uid) { store.dispatch(monoKeyApi.util.resetApiState()); if (previous) void encryptedCache.clear(previous).catch(() => undefined); } previous = next?.uid; setUser(next); setLoading(false); });
  }, []);
  const value = useMemo(() => ({ user, loading }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState { return useContext(AuthContext); }
