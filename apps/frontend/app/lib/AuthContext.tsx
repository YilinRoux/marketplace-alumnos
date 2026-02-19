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
    /** Fuerza una re-verificación con /auth/me (útil post-login) */
    refresh: () => Promise<void>;
}

// ─── sessionStorage key (solo guarda datos de presentación, nunca tokens) ────

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
    } catch {
        // sessionStorage no disponible (SSR, modo privado, etc.)
    }
}

function clearSessionCache(): void {
    try {
        sessionStorage.removeItem(SESSION_KEY);
    } catch { }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
    // Inicializar con caché de sessionStorage para evitar parpadeo
    const [state, setState] = useState<AuthState>(() => {
        const cached = readSessionCache();
        if (cached) {
            return { status: "loading", user: cached }; // 'loading' hasta confirmar con /auth/me
        }
        return { status: "loading", user: null };
    });

    const fetchUser = useCallback(async () => {
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
                // 401 u otro error → sesión inválida
                clearSessionCache();
                setState({ status: "unauthenticated", user: null });
            }
        } catch {
            // Error de red — usar caché si existe, si no → no autenticado
            const cached = readSessionCache();
            if (cached) {
                setState({ status: "authenticated", user: cached });
            } else {
                setState({ status: "unauthenticated", user: null });
            }
        }
    }, []);

    // Verificar sesión al montar
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const logout = useCallback(async () => {
        try {
            await fetch(`${BACKEND_URL}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch {
            // Aunque falle la petición, siempre limpiar estado local
        } finally {
            clearSessionCache();
            setState({ status: "unauthenticated", user: null });
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{ ...state, logout, refresh: fetchUser }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * Acceder al contexto de autenticación.
 * Debe usarse dentro de <AuthProvider>.
 */
export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth debe usarse dentro de <AuthProvider>");
    }
    return ctx;
}
