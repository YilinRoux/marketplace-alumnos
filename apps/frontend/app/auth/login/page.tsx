"use client";

export const dynamic = "force-dynamic";

import React from "react";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/AuthContext";
import styles from "./login.module.css";

/**
 * Inicializa y renderiza el botón de Google Sign-In.
 * Extirpamos esta lógica a una función reutilizable porque necesitamos
 * llamarla tanto en onLoad (primera visita) como en useEffect (visitas
 * subsecuentes via client-side navigation donde el script ya está en memoria).
 */
async function initGoogleButton(
  callbackRef: React.MutableRefObject<(r: { credential: string }) => void>,
  nonceRef: React.MutableRefObject<{ raw: string; hashed: string }>
) {
  const google = (window as unknown as { google?: { accounts: { id: { initialize: (c: object) => void; renderButton: (el: HTMLElement, opts: object) => void } } } }).google;
  if (!google?.accounts?.id) return;

  const raw = crypto.randomUUID();
  const hashBuffer = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(raw)
  );
  const hashed = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  nonceRef.current = { raw, hashed };

  google.accounts.id.initialize({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    callback: (r: { credential: string }) => callbackRef.current(r),
    nonce: hashed,
  });

  const container = document.getElementById("google-btn");
  if (container) {
    // Limpiar contenido previo antes de re-renderizar (evita duplicados)
    container.innerHTML = "";
    google.accounts.id.renderButton(container, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "signin_with",
      locale: "es",
      width: 380,
    });
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nonceRef = useRef({ raw: "", hashed: "" });
  const callbackRef = useRef<(r: { credential: string }) => void>(() => { });

  // FIX Bug 2: Si el script GSI ya está en memoria (navegación client-side post-logout),
  // onLoad no se vuelve a disparar. Lo inicializamos en useEffect como fallback.
  useEffect(() => {
    const google = (window as unknown as { google?: object }).google;
    if (google) {
      // El script ya estaba cargado — renderizar el botón directamente
      initGoogleButton(callbackRef, nonceRef);
    }
    // Si google no está en window aún, onLoad del <Script> se encargará
  }, []); // Solo al montar

  callbackRef.current = async (response) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } =
        await supabase.auth.signInWithIdToken({
          provider: "google",
          token: response.credential,
          nonce: nonceRef.current.raw,
        });

      if (authError || !data.session) {
        throw new Error(authError?.message || "No se pudo iniciar sesión");
      }

      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
      const res = await fetch(`${backendUrl}/auth/set-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        }),
      });

      if (!res.ok) throw new Error("Error al establecer sesión en el servidor");

      // FIX Bug 1: Notificar al AuthContext del nuevo login ANTES de navegar.
      // Esto resetea status a 'loading' → AuthContext verifica /auth/me
      // → status: 'authenticated'. Evita que useRequireAuth rediriga de vuelta.
      await refresh();

      router.push("/marketplace");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setLoading(false);
    }
  };

  const handleGoogleScriptLoad = () => {
    initGoogleButton(callbackRef, nonceRef);
  };

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={handleGoogleScriptLoad}
        strategy="afterInteractive"
      />
      <main className={styles.container}>
        <div className={styles.leftSide}>
          <div className={styles.card}>
            <div className={styles.titleBlock}>
              <h1 className={styles.title}>
                UNI<span className={styles.titleAccent}>MARKET</span>
              </h1>
            </div>

            <div className={styles.subtitleBlock}>
              <h2 className={styles.subtitle}>Bienvenido</h2>
              <p className={styles.description}>
                Inicia sesión o regístrate para acceder a tu cuenta
              </p>
            </div>

            <div id="google-btn" className={styles.googleBtn} />

            {loading && (
              <p className={styles.loadingText}>Procesando...</p>
            )}

            {error && (
              <p className={styles.errorText}>{error}</p>
            )}
          </div>
        </div>

        <div className={styles.rightSide} />
      </main>
    </>
  );
}
