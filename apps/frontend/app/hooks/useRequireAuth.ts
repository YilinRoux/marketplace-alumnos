"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/AuthContext";

/**
 * Hook de protección de rutas del lado del cliente.
 *
 * Uso: llamarlo al principio del componente de cada página protegida.
 *
 * - Si status === 'loading' → retorna { isLoading: true } (renderizar spinner)
 * - Si status === 'unauthenticated' → redirige a /auth/login
 * - Si status === 'authenticated' → retorna { isLoading: false, user }
 */
export function useRequireAuth() {
    const { status, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/auth/login");
        }
    }, [status, router]);

    return {
        isLoading: status === "loading",
        user: status === "authenticated" ? user : null,
    };
}
