"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

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

    // Simulación de login (frontend)
    if (email && password) {
      localStorage.setItem("auth", "true");
      router.push("/productos");
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to bottom, #000000, #111827)",
      }}
    >
      <form onSubmit={handleSubmit} className="login-container" aria-labelledby="login-title">
        <h1
          id="login-title"
          className="login-title"
          ref={tituloRef}
          tabIndex={-1}
        >
          Iniciar sesión
        </h1>

        <label htmlFor="email" className="login-label">
          Correo institucional
        </label>
        <input
          id="email"
          type="email"
          className="login-input"
          placeholder="correo@universidad.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="password" className="login-label">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          className="login-input"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="btn-primary">
          Iniciar Sesion
        </button>
      </form>
    </main>
  );
}
