"use client";

import React, { useState, useId } from "react";
import Link from "next/link";
import { ROUTES } from "../lib/routes";
import styles from "./forgot-password.module.css";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

function validateEmail(value: string): string {
  if (!value.trim()) return "El correo es obligatorio.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) return "Ingresa un correo electrónico válido.";
  return "";
}

const CheckIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#16a34a"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function ForgotPasswordPage() {
  const emailId = useId();
  const emailErrorId = useId();
  const alertId = useId();

  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleBlur = () => {
    setTouched(true);
    setEmailError(validateEmail(email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const err = validateEmail(email);
    setEmailError(err);
    setTouched(true);
    if (err) return;

    setServerError("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Error al procesar la solicitud.");
      }

      setSuccess(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error de conexión. Intenta de nuevo.";
      setServerError(message);
    } finally {
      setLoading(false);
    }
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
            <h2 className={styles.subtitle}>Recuperar contraseña</h2>
            <p className={styles.description}>
              Ingresa tu correo electrónico y te enviaremos instrucciones para
              restablecer tu contraseña.
            </p>
          </div>

          {success ? (
            <div className={styles.successBox} role="status" aria-live="polite">
              <div className={styles.successIcon}>
                <CheckIcon />
              </div>
              <p className={styles.successTitle}>Solicitud enviada</p>
              <p className={styles.successText}>
                Si el correo está registrado, recibirás instrucciones para
                restablecer tu contraseña. Revisa tu bandeja de entrada y la
                carpeta de spam.
              </p>
              <div className={styles.backLinkCenter}>
                <Link href={ROUTES.AUTH.LOGIN} className={styles.backLink}>
                  ← Volver al inicio de sesión
                </Link>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              aria-label="Formulario de recuperación de contraseña"
            >
              {serverError && (
                <div
                  id={alertId}
                  role="alert"
                  aria-live="assertive"
                  className={styles.authError}
                >
                  {serverError}
                </div>
              )}

              <div className={styles.fieldGroup}>
                <label htmlFor={emailId} className={styles.label}>
                  Correo electrónico
                </label>
                <input
                  id={emailId}
                  type="email"
                  autoComplete="email"
                  className={styles.input}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (touched) setEmailError(validateEmail(e.target.value));
                  }}
                  onBlur={handleBlur}
                  aria-required="true"
                  aria-invalid={touched && !!emailError ? "true" : "false"}
                  aria-describedby={
                    touched && emailError ? emailErrorId : undefined
                  }
                  disabled={loading}
                  placeholder="correo@universidad.edu"
                />
                {touched && emailError && (
                  <span
                    id={emailErrorId}
                    role="alert"
                    aria-live="polite"
                    className={styles.fieldError}
                  >
                    {emailError}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? "Enviando..." : "Enviar instrucciones"}
              </button>

              <div className={styles.backLinkCenter}>
                <Link href={ROUTES.AUTH.LOGIN} className={styles.backLink}>
                  ← Volver al inicio de sesión
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className={styles.rightSide} />
    </main>
  );
}
