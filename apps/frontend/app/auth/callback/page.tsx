"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * /auth/callback
 *
 * Handles the redirect back from Google OAuth.
 * Supabase automatically picks up the tokens from the URL hash via
 * onAuthStateChange (in AuthContext), so this page simply waits for
 * the auth state to resolve and then redirects.
 */
export default function AuthCallbackPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check URL for error params (Supabase appends these on failure)
        const hash = window.location.hash;
        const params = new URLSearchParams(hash.replace("#", "?"));
        const errorParam = params.get("error_description") || params.get("error");

        if (errorParam) {
            setError(errorParam);
            // Redirect to login after showing the error briefly
            setTimeout(() => router.replace("/auth/login"), 3000);
            return;
        }

        // On success, onAuthStateChange in AuthContext will handle the session.
        // Give it a moment, then redirect.
        const timer = setTimeout(() => {
            router.replace("/marketplace");
        }, 2000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100vh",
                gap: "1rem",
                fontFamily: "system-ui, sans-serif",
            }}
        >
            {error ? (
                <>
                    <div
                        style={{
                            background: "#fff5f5",
                            color: "#e53e3e",
                            border: "1px solid #fed7d7",
                            borderRadius: "8px",
                            padding: "16px 24px",
                            maxWidth: "400px",
                            textAlign: "center",
                        }}
                    >
                        <p style={{ margin: 0, fontWeight: 600 }}>Error de autenticación</p>
                        <p style={{ margin: "8px 0 0", fontSize: "0.875rem" }}>{error}</p>
                    </div>
                    <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>
                        Redirigiendo al login...
                    </p>
                </>
            ) : (
                <>
                    <div
                        style={{
                            width: "40px",
                            height: "40px",
                            border: "3px solid #e5e7eb",
                            borderTopColor: "#2563eb",
                            borderRadius: "50%",
                            animation: "spin 0.8s linear infinite",
                        }}
                    />
                    <p style={{ color: "#374151", fontWeight: 500 }}>
                        Completando inicio de sesión...
                    </p>
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </>
            )}
        </div>
    );
}
