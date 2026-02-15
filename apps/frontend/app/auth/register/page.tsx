"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./register.module.css";

export default function RegisterPage() {
  const router = useRouter();

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

      await new Promise((res) => setTimeout(res, 1500));

      const fakeUser = { name, email };
      localStorage.setItem("user", JSON.stringify(fakeUser));

      setStatus("success");
      setMessage(`Bienvenido ${name} 🎉 tu cuenta fue creada con éxito`);

      setTimeout(() => {
  router.push("/marketplace");
}, 2000);


    } catch (err) {
      setStatus("error");
      setMessage("Ocurrió un error al crear la cuenta.");
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

          <p className={styles.subtitle}>
            Crea tu cuenta
          </p>

          <div
            className={`${styles.feedback} ${
              status === "success"
                ? styles.successMessage
                : status === "error"
                ? styles.errorMessage
                : status === "loading"
                ? styles.loadingMessage
                : ""
            }`}
            aria-live="polite"
            role="status"
          >
            {message}
          </div>

          {/* Nombre */}
          <div className={styles.inputGroup}>
            <label>Nombre completo</label>
            <span className={styles.helperText}>
              Ingresa tu nombre como aparecerá en la plataforma
            </span>
            <input
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className={styles.inputGroup}>
            <label>Correo electrónico</label>
            <span className={styles.helperText}>
              Puedes usar cualquier correo válido
            </span>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className={styles.inputGroup}>
            <label>Contraseña</label>
            <span className={styles.helperText}>
              Mínimo 6 caracteres
            </span>

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
                className={styles.eyeButton}
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Mostrar u ocultar contraseña"
              >
                {showPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className={styles.inputGroup}>
            <label>Confirmar contraseña</label>
            <span className={styles.helperText}>
              Debe coincidir con la contraseña anterior
            </span>

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
                className={styles.eyeButton}
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                aria-label="Mostrar u ocultar contraseña"
              >
                {showConfirmPassword ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`${styles.button}
              ${status === "loading" ? styles.loading : ""}
              ${status === "success" ? styles.success : ""}
              ${status === "error" ? styles.error : ""}`}
            disabled={isDisabled}
          >
            {status === "loading"
              ? "Creando..."
              : status === "success"
              ? "Cuenta creada"
              : "Crear cuenta"}
          </button>

          <p className={styles.loginText}>
            ¿Ya tienes una cuenta?{" "}
            <Link href="/auth/login" className={styles.loginLink}>
              Inicia sesión
            </Link>
          </p>

        </form>
      </div>
    </main>
  );
}
