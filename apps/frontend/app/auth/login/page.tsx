"use client";

export const dynamic = "force-dynamic";

import React, { useState, useId } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/AuthContext";
import { supabase } from "../../lib/supabase";
import styles from "./login.module.css";

// ── Ícono Google ──────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 48 48"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.954 4 4 12.954 4 24s8.954 20 20 20s20-8.954 20-20c0-1.334-.112-2.643-.389-3.917z"
    />
    <path
      fill="#FF3D00"
      d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.334-.112-2.643-.389-3.917z"
    />
  </svg>
);

// ── Íconos ojo ────────────────────────────────────────────────────────────────
const EyeOpen = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 24 24"
    stroke="#6b7280"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

const EyeClosed = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 24 24"
    stroke="#6b7280"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
    />
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
    upper: /[A-Z]/.test(value),
    number: /[0-9]/.test(value),
    symbol: /[^A-Za-z0-9]/.test(value),
  };
  const score = Object.values(checks).filter(Boolean).length;
  const level = score <= 1 ? "debil" : score <= 3 ? "media" : "fuerte";
  const percent =
    score === 0
      ? 0
      : score === 1
        ? 25
        : score === 2
          ? 50
          : score === 3
            ? 75
            : 100;
  return { level, percent, checks };
}

function validatePassword(value: string): string {
  if (!value) return "La contraseña es obligatoria.";
  if (value.length < 8) return "Mínimo 8 caracteres.";
  const { level } = getPasswordStrength(value);
  if (level === "debil") return "La contraseña es muy débil.";
  return "";
}

// ── Mapeo de errores de Supabase a mensajes amigables ─────────────────────────
function mapSupabaseError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials"))
    return "Usuario o contraseña incorrectos.";
  if (lower.includes("email not confirmed"))
    return "Tu correo aún no ha sido confirmado. Revisa tu bandeja de entrada.";
  if (lower.includes("too many requests") || lower.includes("rate limit"))
    return "Demasiados intentos. Espera un momento antes de intentar de nuevo.";
  if (lower.includes("user not found"))
    return "No existe una cuenta con ese correo.";
  if (lower.includes("user already exists"))
    return "Este correo ya está registrado.";
  if (lower.includes("password should be"))
    return "La contraseña ingresada es demasiado débil.";
  if (lower.includes("email rate limit"))
    return "Se ha excedido el límite de envío de correos. Intenta más tarde.";
  if (lower.includes("signup disabled"))
    return "El registro de nuevos usuarios está deshabilitado.";
  return message || "Error de autenticación. Intenta de nuevo.";
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();

  // IDs accesibles únicos
  const emailId = useId();
  const passwordId = useId();
  const emailErrorId = useId();
  const passwordErrorId = useId();
  const authErrorId = useId();

  // Estados
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(
    getPasswordStrength(""),
  );

  const isAnyLoading = loading || googleLoading;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleBlurEmail = () => {
    setTouched((t) => ({ ...t, email: true }));
    setEmailError(validateEmail(email));
  };

  const handleBlurPassword = () => {
    setTouched((t) => ({ ...t, password: true }));
    setPasswordError(validatePassword(password));
  };

  // ── Email/Password Login via Supabase ────────────────────────────────────────
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

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setAuthError(mapSupabaseError(error.message));
          setLoading(false);
          return;
        }

        // onAuthStateChange in AuthContext handles token forwarding and fetchUser.
        // Wait a moment for the state to propagate, then redirect.
        await refresh();

        router.push("/marketplace");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) {
          setAuthError(mapSupabaseError(error.message));
          setLoading(false);
          return;
        }

        // Si el usuario ya existe y Supabase tiene activada la ofuscación:
        if (
          data?.user &&
          data.user.identities &&
          data.user.identities.length === 0
        ) {
          setAuthError(
            "Este correo ya está registrado. Por favor, inicia sesión.",
          );
        } else {
          setAuthError("Revisa tu correo para confirmar tu cuenta.");
        }
        setLoading(false);
      }
    } catch {
      setAuthError("Error de conexión. Verifica tu conexión a internet.");
      setLoading(false);
    }
  };

  // ── Google OAuth Login ───────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setAuthError("");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setAuthError(mapSupabaseError(error.message));
        setGoogleLoading(false);
      }
      // If no error, the browser redirects away to Google.
      // googleLoading stays true until the page unloads.
    } catch {
      setAuthError("No se pudo iniciar el login con Google. Intenta de nuevo.");
      setGoogleLoading(false);
    }
  };

  // ── Demo Login (unchanged) ──────────────────────────────────────────────────
  const handleDemoLogin = async () => {
    setLoading(true);
    setAuthError("");

    await new Promise((r) => setTimeout(r, 1500));

    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(DEMO_USER));
    } catch {
      setAuthError(
        "No se pudo iniciar sesión. Por favor, intenta en un navegador compatible.",
      );
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
            <h2 className={styles.subtitle}>
              {isLogin ? "Bienvenido" : "Crear cuenta"}
            </h2>
            <p className={styles.description}>
              {isLogin
                ? "Inicia sesión para acceder a tu cuenta"
                : "Regístrate para empezar a utilizar la plataforma"}
            </p>
          </div>

          {/* Botón Google */}
          <button
            className={styles.btnGoogle}
            onClick={handleGoogleLogin}
            disabled={isAnyLoading}
            aria-busy={googleLoading}
          >
            <GoogleIcon />
            {googleLoading ? "Redirigiendo a Google..." : "Acceder con Google"}
          </button>

          <div className={styles.separator} aria-hidden="true">
            <span>o</span>
          </div>

          {/* ── Formulario ─────────────────────────────────────────────────────── */}
          <form
            onSubmit={handleFormLogin}
            noValidate
            aria-label="Formulario de inicio de sesión"
          >
            {/* Error de autenticación */}
            {authError && (
              <div
                id={authErrorId}
                role="alert"
                aria-live="assertive"
                className={styles.authError}
              >
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
                  if (touched.email)
                    setEmailError(validateEmail(e.target.value));
                }}
                onBlur={handleBlurEmail}
                aria-required="true"
                aria-invalid={touched.email && !!emailError ? "true" : "false"}
                aria-describedby={
                  touched.email && emailError ? emailErrorId : undefined
                }
                disabled={isAnyLoading}
                placeholder="correo@universidad.edu"
              />
              {touched.email && emailError && (
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
                    if (touched.password)
                      setPasswordError(validatePassword(e.target.value));
                  }}
                  onBlur={handleBlurPassword}
                  aria-required="true"
                  aria-invalid={
                    touched.password && !!passwordError ? "true" : "false"
                  }
                  aria-describedby={
                    touched.password && passwordError
                      ? passwordErrorId
                      : undefined
                  }
                  disabled={isAnyLoading}
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  tabIndex={-1}
                >
                  {showPassword ? <EyeClosed /> : <EyeOpen />}
                </button>
              </div>

              {/* Checklist de requisitos — desaparece cuando todos se cumplen */}
              {password && passwordStrength.level !== "fuerte" && (
                <ul
                  className={styles.checkList}
                  aria-label="Requisitos de contraseña"
                >
                  {!passwordStrength.checks.length && (
                    <li className={styles.checkPending}>
                      ○ Mínimo 8 caracteres
                    </li>
                  )}
                  {!passwordStrength.checks.upper && (
                    <li className={styles.checkPending}>
                      ○ Al menos una mayúscula (A-Z)
                    </li>
                  )}
                  {!passwordStrength.checks.number && (
                    <li className={styles.checkPending}>
                      ○ Al menos un número (0-9)
                    </li>
                  )}
                  {!passwordStrength.checks.symbol && (
                    <li className={styles.checkPending}>
                      ○ Al menos un símbolo (!@#$%...)
                    </li>
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
                    <span
                      className={
                        styles[`strengthText_${passwordStrength.level}`]
                      }
                    >
                      {passwordStrength.level === "debil" && "Contraseña débil"}
                      {passwordStrength.level === "media" && "Contraseña media"}
                      {passwordStrength.level === "fuerte" &&
                        "✓ ¡Contraseña fuerte!"}
                    </span>
                  </div>
                </div>
              )}

              {/* Error de contraseña */}
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

            {/* Botón submit */}
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={isAnyLoading}
              aria-busy={loading}
            >
              {loading
                ? isLogin
                  ? "Iniciando sesión..."
                  : "Registrando..."
                : isLogin
                  ? "Iniciar sesión"
                  : "Registrarse"}
            </button>
          </form>

          <div className={styles.separator} aria-hidden="true">
            <span>o</span>
          </div>

          {/* Botón demo */}
          <button
            className={styles.btnDemo}
            onClick={handleDemoLogin}
            disabled={isAnyLoading}
            aria-busy={loading}
          >
            {loading ? "Iniciando sesión..." : "Entrar como usuario demo"}
          </button>

          <p className={styles.demoNote}>
            Solo para pruebas — no requiere backend
          </p>

          {/* Toggle Login/Registro */}
          <p
            className={styles.demoNote}
            style={{
              marginTop: "1.5rem",
              cursor: "pointer",
              color: "#2563eb",
              fontWeight: 500,
              fontSize: "0.9rem",
            }}
            onClick={() => {
              setIsLogin(!isLogin);
              setAuthError("");
              setEmailError("");
              setPasswordError("");
              setTouched({ email: false, password: false });
            }}
          >
            {isLogin
              ? "¿No tienes cuenta? Regístrate"
              : "¿Ya tienes cuenta? Inicia sesión"}
          </p>
        </div>
      </div>

      <div className={styles.rightSide} />
    </main>
  );
}
