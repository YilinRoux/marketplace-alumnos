"use client";

import { useEffect, useRef } from "react";

export default function LoginPage() {
  const tituloRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    tituloRef.current?.focus();
  }, []);

  return (
    <section className="centered">
      <div className="card" aria-labelledby="login-title">
        <h1
          id="login-title"
          ref={tituloRef}
          tabIndex={-1}
        >
          Iniciar sesión
        </h1>

        <form>
          <label htmlFor="email">Correo institucional</label>
          <input
            id="email"
            type="email"
            required
          />

          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            required
          />

          <button type="submit">Entrar</button>
        </form>
      </div>
    </section>
  );
}
