"use client";

import React from "react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { supabase } from "../../lib/supabase";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nonceRef = useRef({ raw: "", hashed: "" });
  const callbackRef = useRef<(r: { credential: string }) => void>(() => { });

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
      router.push("/marketplace");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setLoading(false);
    }
  };

  const handleGoogleScriptLoad = async () => {
    const raw = crypto.randomUUID();
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(raw)
    );
    const hashed = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    nonceRef.current = { raw, hashed };

    const google = (window as unknown as { google: any }).google;
    if (!google) return;

    google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      callback: (r: { credential: string }) => callbackRef.current(r),
      nonce: hashed,
    });

    const container = document.getElementById("google-btn");
    if (container) {
      google.accounts.id.renderButton(container, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "signin_with",
        locale: "es",
        width: 380,
      });
    }
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
