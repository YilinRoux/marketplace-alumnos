"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./register.module.css";
import { useAuth } from "../../hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const isDisabled =
    status === "loading" ||
    !name ||
    !email ||
    !password ||
    !confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    try {
      setStatus("loading");
      setMessage("Creando cuenta...");

      //  Simulación backend
      await new Promise((res) => setTimeout(res, 1500));

      //  Login global
      login({
        name,
        email,
        avatar: "/images/default-user.png",
      });

      setStatus("success");
      setMessage(`Bienvenido ${name} 🎉`);

      setTimeout(() => {
        router.push("/marketplace");
      }, 1500);
    } catch (err) {
      setStatus("error");
      setMessage("Ocurrió un error.");
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.leftSide}></div>

      <div className={styles.rightSide}>
        <form onSubmit={handleSubmit} className={styles.card} noValidate>
          <h1 className={styles.title}>
            <span className={styles.brand}>UNI</span>MARKET
          </h1>

          <p className={styles.subtitle}>Crea tu cuenta</p>

          <div className={styles.feedback} aria-live="polite">
            {message}
          </div>

          {/* Nombre */}
          <div className={styles.inputGroup}>
            <label>Nombre completo</label>
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className={styles.inputGroup}>
            <label>Email</label>
            <input
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className={styles.inputGroup}>
            <label>Contraseña</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                👁
              </button>
            </div>
          </div>

          {/* Confirm */}
          <div className={styles.inputGroup}>
            <label>Confirmar contraseña</label>
            <div className={styles.passwordWrapper}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                className={styles.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              >
                👁
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.button}
            disabled={isDisabled}
          >
            {status === "loading" ? "Creando..." : "Crear cuenta"}
          </button>

          <p className={styles.loginText}>
            ¿Ya tienes cuenta?{" "}
            <Link href="/auth/login" className={styles.loginLink}>
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
