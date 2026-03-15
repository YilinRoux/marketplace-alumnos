"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    ReactNode,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AppRole = "user" | "seller" | "superadmin";

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
    role: AppRole;
    phone: string | null;
}

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthState {
    status: AuthStatus;
    user: UserProfile | null;
}

interface AuthContextValue extends AuthState {
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
}

// ─── sessionStorage key ───────────────────────────────────────────────────────

const SESSION_KEY = "um_user_cache";

function readSessionCache(): UserProfile | null {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        return raw ? (JSON.parse(raw) as UserProfile) : null;
    } catch {
        return null;
    }
}

function writeSessionCache(user: UserProfile): void {
    try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } catch { }
}

function clearSessionCache(): void {
    try {
        sessionStorage.removeItem(SESSION_KEY);
    } catch { }
}

// Demo users never have a real backend session — detect by id prefix
function isDemoUser(user: UserProfile): boolean {
    return user.id.startsWith("demo-");
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>(() => {
        const cached = readSessionCache();
        if (cached) {
            return { status: "loading", user: cached };
        }
        return { status: "loading", user: null };
    });

    const fetchUser = useCallback(async () => {
        setState(prev => ({ ...prev, status: "loading" }));

        // Si hay un usuario demo en cache, usarlo directamente sin llamar al backend
        const cached = readSessionCache();
        if (cached && isDemoUser(cached)) {
            setState({ status: "authenticated", user: cached });
            return;
        }

        try {
            const res = await fetch(`${BACKEND_URL}/auth/me`, {
                credentials: "include",
                cache: "no-store",
            });

            if (res.ok) {
                const data = (await res.json()) as { user: UserProfile };
                writeSessionCache(data.user);
                setState({ status: "authenticated", user: data.user });
            } else {
                // 401 — sesión real inválida, limpiar cache (no es demo)
                clearSessionCache();
                setState({ status: "unauthenticated", user: null });
            }
        } catch {
            // Error de red — usar cache si existe
            if (cached) {
                setState({ status: "authenticated", user: cached });
            } else {
                setState({ status: "unauthenticated", user: null });
            }
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const logout = useCallback(async () => {
        try {
            await fetch(`${BACKEND_URL}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch { } finally {
            clearSessionCache();
            setState({ status: "unauthenticated", user: null });
        }
    }, []);

    return (
        <AuthContext.Provider value={{ ...state, logout, refresh: fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth debe usarse dentro de <AuthProvider>");
    }
    return ctx;
}