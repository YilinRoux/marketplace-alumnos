"use client";

import React, { Suspense, useState, useEffect, useId, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ROUTES } from "../lib/routes";
import styles from "./reset-password.module.css";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

const EyeOpen = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"
    viewBox="0 0 24 24" stroke="#6b7280" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeClosed = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none"
    viewBox="0 0 24 24" stroke="#6b7280" strokeWidth="2" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const AlertIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

type TokenStatus = "validating" | "valid" | "invalid" | "expired";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const passwordId = useId();
  const confirmId = useId();
  const passwordErrorId = useId();
  const confirmErrorId = useId();
  const alertId = useId();

  const [tokenStatus, setTokenStatus] = useState<TokenStatus>("validating");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState({ password: false, confirm: false });

  const validatePassword = useCallback((value: string): string => {
    if (!value) return "La contraseña es obligatoria.";
    if (value.length < 8) return "Mínimo 8 caracteres.";
    return "";
  }, []);

  const validateConfirm = useCallback(
    (value: string, pw: string): string => {
      if (!value) return "La confirmación es obligatoria.";
      if (value !== pw) return "Las contraseñas no coinciden.";
      return "";
    },
    []
  );

  useEffect(() => {
    if (!token) {
      setTokenStatus("invalid");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/auth/validate-reset-token`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ token }),
          }
        );

        if (cancelled) return;

        if (res.ok) {
          setTokenStatus("valid");
        } else {
          const data = await res.json().catch(() => null);
          const errorMsg = data?.error?.toLowerCase() || "";
          if (errorMsg.includes("expir")) {
            setTokenStatus("expired");
          } else {
            setTokenStatus("invalid");
          }
        }
      } catch {
        if (!cancelled) setTokenStatus("invalid");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => {
      router.push(ROUTES.AUTH.LOGIN);
    }, 3000);
    return () => clearTimeout(timer);
  }, [success, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const pErr = validatePassword(password);
    const cErr = validateConfirm(confirm, password);
    setPasswordError(pErr);
    setConfirmError(cErr);
    setTouched({ password: true, confirm: true });

    if (pErr || cErr) return;

    setServerError("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.error || "No se pudo restablecer la contraseña."
        );
      }

      setSuccess(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Error de conexión. Intenta de nuevo.";
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  // ── Validating ──
  if (tokenStatus === "validating") {
    return (
      <div className={styles.loadingBox} role="status" aria-live="polite">
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Verificando enlace...</p>
      </div>
    );
  }

  // ── Invalid token ──
  if (tokenStatus === "invalid") {
    return (
      <div className={styles.errorBox} role="alert" aria-live="assertive">
        <div className={styles.errorIcon}>
          <AlertIcon />
        </div>
        <p className={styles.errorTitle}>Enlace no válido</p>
        <p className={styles.errorText}>
          El enlace de recuperación no es válido. Es posible que ya haya sido
          utilizado o que la dirección sea incorrecta.
        </p>
        <Link href={ROUTES.AUTH.FORGOT_PASSWORD} className={styles.requestNewLink}>
          Solicitar un nuevo enlace
        </Link>
        <div className={styles.backLinkCenter}>
          <Link href={ROUTES.AUTH.LOGIN} className={styles.backLink}>
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  // ── Expired token ──
  if (tokenStatus === "expired") {
    return (
      <div className={styles.errorBox} role="alert" aria-live="assertive">
        <div className={styles.errorIcon}>
          <AlertIcon />
        </div>
        <p className={styles.errorTitle}>Enlace expirado</p>
        <p className={styles.errorText}>
          El enlace de recuperación ha expirado. Por seguridad, los enlaces
          tienen una duración limitada. Solicita uno nuevo.
        </p>
        <Link href={ROUTES.AUTH.FORGOT_PASSWORD} className={styles.requestNewLink}>
          Solicitar un nuevo enlace
        </Link>
        <div className={styles.backLinkCenter}>
          <Link href={ROUTES.AUTH.LOGIN} className={styles.backLink}>
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  // ── Success ──
  if (success) {
    return (
      <div className={styles.successBox} role="status" aria-live="polite">
        <div className={styles.successIcon}>
          <CheckIcon />
        </div>
        <p className={styles.successTitle}>Contraseña restablecida</p>
        <p className={styles.successText}>
          Tu contraseña ha sido actualizada correctamente. Ahora puedes iniciar
          sesión con tu nueva contraseña.
        </p>
        <p className={styles.redirectNote}>
          Serás redirigido al inicio de sesión en unos segundos...
        </p>
        <div className={styles.backLinkCenter}>
          <Link href={ROUTES.AUTH.LOGIN} className={styles.backLink}>
            ← Ir al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  // ── Form ──
  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Formulario de restablecimiento de contraseña"
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
        <label htmlFor={passwordId} className={styles.label}>
          Nueva contraseña
        </label>
        <div className={styles.passwordWrapper}>
          <input
            id={passwordId}
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            className={styles.input}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (touched.password)
                setPasswordError(validatePassword(e.target.value));
              if (touched.confirm)
                setConfirmError(validateConfirm(confirm, e.target.value));
            }}
            onBlur={() => {
              setTouched((t) => ({ ...t, password: true }));
              setPasswordError(validatePassword(password));
            }}
            aria-required="true"
            aria-invalid={
              touched.password && !!passwordError ? "true" : "false"
            }
            aria-describedby={
              touched.password && passwordError ? passwordErrorId : undefined
            }
            disabled={loading}
            placeholder="Mínimo 8 caracteres"
          />
          <button
            type="button"
            className={styles.eyeBtn}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            tabIndex={-1}
          >
            {showPassword ? <EyeClosed /> : <EyeOpen />}
          </button>
        </div>
        {touched.password && passwordError && (
          <span
            id={passwordErrorId}
            role="alert"
            aria-live="polite"
            className={styles.fieldError}
          >
            {passwordError}
          </span>
        )}
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor={confirmId} className={styles.label}>
          Confirmar contraseña
        </label>
        <div className={styles.passwordWrapper}>
          <input
            id={confirmId}
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            className={styles.input}
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              if (touched.confirm)
                setConfirmError(validateConfirm(e.target.value, password));
            }}
            onBlur={() => {
              setTouched((t) => ({ ...t, confirm: true }));
              setConfirmError(validateConfirm(confirm, password));
            }}
            aria-required="true"
            aria-invalid={
              touched.confirm && !!confirmError ? "true" : "false"
            }
            aria-describedby={
              touched.confirm && confirmError ? confirmErrorId : undefined
            }
            disabled={loading}
            placeholder="Repite tu nueva contraseña"
          />
          <button
            type="button"
            className={styles.eyeBtn}
            onClick={() => setShowConfirm(!showConfirm)}
            aria-label={
              showConfirm
                ? "Ocultar confirmación de contraseña"
                : "Mostrar confirmación de contraseña"
            }
            tabIndex={-1}
          >
            {showConfirm ? <EyeClosed /> : <EyeOpen />}
          </button>
        </div>
        {touched.confirm && confirmError && (
          <span
            id={confirmErrorId}
            role="alert"
            aria-live="polite"
            className={styles.fieldError}
          >
            {confirmError}
          </span>
        )}
      </div>

      <button
        type="submit"
        className={styles.btnPrimary}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? "Restableciendo..." : "Restablecer contraseña"}
      </button>

      <div className={styles.backLinkCenter}>
        <Link href={ROUTES.AUTH.LOGIN} className={styles.backLink}>
          ← Volver al inicio de sesión
        </Link>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
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
            <h2 className={styles.subtitle}>Restablecer contraseña</h2>
            <p className={styles.description}>
              Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta.
            </p>
          </div>

          <Suspense
            fallback={
              <div className={styles.loadingBox} role="status" aria-live="polite">
                <div className={styles.spinner} />
                <p className={styles.loadingText}>Cargando...</p>
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>

      <div className={styles.rightSide} />
    </main>
  );
}
