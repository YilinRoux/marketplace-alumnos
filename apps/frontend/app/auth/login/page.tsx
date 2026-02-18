"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const tituloRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    tituloRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (email && password) {
      const fakeUser = {
        name: "Usuario",
        email,
      };

      localStorage.setItem("user", JSON.stringify(fakeUser));
      window.dispatchEvent(new Event("storage"));

      router.push("/marketplace");
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.leftSide}></div>

      <div className={styles.rightSide}>
        <form
          onSubmit={handleSubmit}
          className={styles.card}
          aria-labelledby="login-title"
        >
          <h1
            id="login-title"
            className={styles.title}
            ref={tituloRef}
            tabIndex={-1}
          >
            UNIMARKET
          </h1>

          <p className={styles.subtitle}>
            Inicia sesión con tu cuenta
          </p>

          <div className={styles.inputGroup}>
            <label htmlFor="email">Correo</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="correo@universidad.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.button}>
            Iniciar sesión
          </button>

          <p className={styles.registerText}>
            ¿No tienes una cuenta?{" "}
            <Link href="/auth/register" className={styles.registerLink}>
              Créala
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
