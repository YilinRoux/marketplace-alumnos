"use client";

export const dynamic = "force-dynamic";

import React, { useState, useId } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/AuthContext";
import styles from "./login.module.css";

// ── Ícono Google ──────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.954 4 4 12.954 4 24s8.954 20 20 20s20-8.954 20-20c0-1.334-.112-2.643-.389-3.917z"/>
    <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.334-.112-2.643-.389-3.917z"/>
  </svg>
);



// ── Usuario simulado ──────────────────────────────────────────────────────────
const DEMO_USER = {
  id: "demo-user-001",
  email: "usuario@universidad.edu",
  name: "Usuario Demo",
  avatar: null,
  role: "user" as const,
  phone: null,
};

const SESSION_KEY = "um_user_cache";

// ── Validaciones ──────────────────────────────────────────────────────────────
function validateEmail(value: string): string {
  if (!value.trim()) return "El correo es obligatorio.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) return "Ingresa un correo electrónico válido.";
  return "";
}

function getPasswordStrength(value: string) {
  const checks = {
    length: value.length >= 8,
    upper:  /[A-Z]/.test(value),
    number: /[0-9]/.test(value),
    symbol: /[^A-Za-z0-9]/.test(value),
  };
  const score = Object.values(checks).filter(Boolean).length;
  const level =
    score <= 1 ? "debil" :
    score <= 3 ? "media" :
    "fuerte";
  const percent = score === 0 ? 0 : score === 1 ? 25 : score === 2 ? 50 : score === 3 ? 75 : 100;
  return { level, percent, checks };
}

function validatePassword(value: string): string {
  if (!value) return "La contraseña es obligatoria.";
  if (value.length < 8) return "Mínimo 8 caracteres.";
  const { level } = getPasswordStrength(value);
  if (level === "debil") return "La contraseña es muy débil.";
  return "";
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();

  // IDs accesibles únicos
  const emailId         = useId();
  const passwordId      = useId();
  const emailErrorId    = useId();
  const passwordErrorId = useId();
  const authErrorId     = useId();

  // Estados
  const [email,            setEmail]            = useState("");
  const [password,         setPassword]         = useState("");
  const [emailError,       setEmailError]       = useState("");
  const [passwordError,    setPasswordError]    = useState("");
  const [authError,        setAuthError]        = useState("");
  const [loading,          setLoading]          = useState(false);
  const [touched,          setTouched]          = useState({ email: false, password: false });
  const [showPassword,     setShowPassword]     = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(getPasswordStrength(""));

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleBlurEmail = () => {
    setTouched((t) => ({ ...t, email: true }));
    setEmailError(validateEmail(email));
  };

  const handleBlurPassword = () => {
    setTouched((t) => ({ ...t, password: true }));
    setPasswordError(validatePassword(password));
  };

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    setTouched({ email: true, password: true });

    if (eErr || pErr) return;

    setAuthError("");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 1500));

    const isValid = email === DEMO_USER.email && password.length >= 8;

    if (!isValid) {
      setAuthError("Usuario o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(DEMO_USER));
    } catch {}

    await refresh();

    const role: string = DEMO_USER.role;
    if (role === "admin")       router.push("/admin");
    else if (role === "seller") router.push("/seller");
    else                        router.push("/marketplace");
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setAuthError("");

    await new Promise((r) => setTimeout(r, 1500));

    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(DEMO_USER));
    } catch {
      setAuthError("No se pudo iniciar sesión. Por favor, intenta en un navegador compatible.");
      setLoading(false);
      return;
    }

    await refresh();

    router.push("/marketplace");
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <main className={styles.container}>
      <div className={styles.leftSide}>
        <div className={styles.card}>

          {/* Título */}
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>
              UNI<span className={styles.titleAccent}>MARKET</span>
            </h1>
          </div>

          {/* Subtítulo */}
          <div className={styles.subtitleBlock}>
            <h2 className={styles.subtitle}>Bienvenido</h2>
            <p className={styles.description}>
              Inicia sesión o regístrate para acceder a tu cuenta
            </p>
          </div>

          {/* Botón Google deshabilitado */}
          <button className={styles.btnGoogle} disabled aria-disabled="true">
            <GoogleIcon />
            Acceder con Google
          </button>

          <div className={styles.separator} aria-hidden="true"><span>o</span></div>

          {/* ── Formulario ─────────────────────────────────────────────────────── */}
          <form onSubmit={handleFormLogin} noValidate aria-label="Formulario de inicio de sesión">

            {/* Error de autenticación */}
            {authError && (
              <div id={authErrorId} role="alert" aria-live="assertive" className={styles.authError}>
                {authError}
              </div>
            )}

            {/* Campo email */}
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
                  if (touched.email) setEmailError(validateEmail(e.target.value));
                }}
                onBlur={handleBlurEmail}
                aria-required="true"
                aria-invalid={touched.email && !!emailError ? "true" : "false"}
                aria-describedby={touched.email && emailError ? emailErrorId : undefined}
                disabled={loading}
                placeholder="correo@universidad.edu"
              />
              {touched.email && emailError && (
                <span id={emailErrorId} role="alert" aria-live="polite" className={styles.fieldError}>
                  {emailError}
                </span>
              )}
            </div>

            {/* Campo contraseña */}
            <div className={styles.fieldGroup}>
              <label htmlFor={passwordId} className={styles.label}>
                Contraseña
              </label>

              {/* Input + ojo */}
              <div className={styles.passwordWrapper}>
                <input
                  id={passwordId}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className={styles.input}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordStrength(getPasswordStrength(e.target.value));
                    if (touched.password) setPasswordError(validatePassword(e.target.value));
                  }}
                  onBlur={handleBlurPassword}
                  aria-required="true"
                  aria-invalid={touched.password && !!passwordError ? "true" : "false"}
                  aria-describedby={touched.password && passwordError ? passwordErrorId : undefined}
                  disabled={loading}
                  placeholder="Mínimo 8 caracteres"
                />
                
              </div>

              {/* Checklist de requisitos — desaparece cuando todos se cumplen */}
              {password && passwordStrength.level !== "fuerte" && (
                <ul className={styles.checkList} aria-label="Requisitos de contraseña">
                  {!passwordStrength.checks.length && (
                    <li className={styles.checkPending}>○ Mínimo 8 caracteres</li>
                  )}
                  {!passwordStrength.checks.upper && (
                    <li className={styles.checkPending}>○ Al menos una mayúscula (A-Z)</li>
                  )}
                  {!passwordStrength.checks.number && (
                    <li className={styles.checkPending}>○ Al menos un número (0-9)</li>
                  )}
                  {!passwordStrength.checks.symbol && (
                    <li className={styles.checkPending}>○ Al menos un símbolo (!@#$%...)</li>
                  )}
                </ul>
              )}

              {/* Barra de fortaleza */}
              {password && (
                <div className={styles.strengthWrapper}>
                  <div className={styles.strengthBar}>
                    <div
                      className={`${styles.strengthFill} ${styles[`strength_${passwordStrength.level}`]}`}
                      style={{ width: `${passwordStrength.percent}%` }}
                    />
                  </div>
                  <div className={styles.strengthLabels}>
                    <span className={styles[`strengthText_${passwordStrength.level}`]}>
                      {passwordStrength.level === "debil"  && "Contraseña débil"}
                      {passwordStrength.level === "media"  && "Contraseña media"}
                      {passwordStrength.level === "fuerte" && "✓ ¡Contraseña fuerte!"}
                    </span>
                  </div>
                </div>
              )}

              {/* Error de contraseña */}
              {touched.password && passwordError && (
                <span id={passwordErrorId} role="alert" aria-live="polite" className={styles.fieldError}>
                  {passwordError}
                </span>
              )}
            </div>

            {/* Botón submit */}
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>

          <div className={styles.separator} aria-hidden="true"><span>o</span></div>

          {/* Botón demo */}
          <button
            className={styles.btnDemo}
            onClick={handleDemoLogin}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Iniciando sesión..." : "Entrar como usuario demo"}
          </button>

          <p className={styles.demoNote}>Solo para pruebas — no requiere backend</p>

        </div>
      </div>

      <div className={styles.rightSide} />
    </main>
  );
}