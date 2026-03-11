"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/AuthContext";
import styles from "./login.module.css";

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.954 4 4 12.954 4 24s8.954 20 20 20s20-8.954 20-20c0-1.334-.112-2.643-.389-3.917z"/>
    <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.334-.112-2.643-.389-3.917z"/>
  </svg>
);

// Usuario simulado — mismo esquema que UserProfile en AuthContext
const DEMO_USER = {
  id: "demo-user-001",
  email: "usuario@universidad.edu",
  name: "Usuario Demo",
  avatar: null,
  role: "user" as const,
  phone: null,
};

const SESSION_KEY = "um_user_cache";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = async () => {
    setLoading(true);

    await new Promise((r) => setTimeout(r, 1500));

    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(DEMO_USER));
    } catch {
    }

    await refresh();

    router.push("/marketplace");
  };

  return (
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

          {/* Botón Google real (deshabilitado sin credenciales) */}
          <button className={styles.btnGoogle} disabled>
            <GoogleIcon />
            Acceder con Google
          </button>

          <div className={styles.separator}>
            <span>o</span>
          </div>

          
          <button
            className={styles.btnDemo}
            onClick={handleDemoLogin}
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : " Entrar como usuario"}
          </button>

          <p className={styles.demoNote}>
            Solo para pruebas — no requiere backend
          </p>

        </div>
      </div>

      <div className={styles.rightSide} />
    </main>
  );
}