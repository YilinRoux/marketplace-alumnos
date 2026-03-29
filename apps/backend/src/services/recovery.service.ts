import crypto from "crypto";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RecoveryToken {
  token: string;
  email: string;
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
}

// ─── Mock Users (mismos que sessions.service.ts) ──────────────────────────────

const mockUsers = [
  { id: "user-001", email: "omar@universidad.edu", name: "Omar Lazaro" },
  { id: "user-002", email: "yilin@universidad.edu", name: "Yilin Roux" },
  { id: "user-003", email: "admin@universidad.edu", name: "Admin User" },
];

// ─── In-memory token store ────────────────────────────────────────────────────
// Cuando lleguen credenciales reales de Supabase, esto se reemplaza
// por una tabla "recovery_tokens" en la base de datos.

const tokenStore = new Map<string, RecoveryToken>();

// Mock passwords store (simula tabla de usuarios con contraseñas)
const passwordStore = new Map<string, string>([
  ["omar@universidad.edu", "password123"],
  ["yilin@universidad.edu", "password123"],
  ["admin@universidad.edu", "password123"],
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TOKEN_EXPIRY_MINUTES = 15;

function generateSecureToken(): string {
  // crypto.randomBytes genera tokens criptográficamente seguros
  return crypto.randomBytes(32).toString("hex");
}

function isExpired(recoveryToken: RecoveryToken): boolean {
  return new Date() > recoveryToken.expiresAt;
}

// Limpia tokens expirados del store para no acumular basura
function cleanExpiredTokens(): void {
  for (const [key, token] of tokenStore.entries()) {
    if (isExpired(token)) {
      tokenStore.delete(key);
    }
  }
}

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * Verifica si el email existe en el sistema.
 * IMPORTANTE: Siempre retorna el mismo mensaje al cliente,
 * sin importar si el email existe o no (evita user enumeration attack).
 */
export function userExists(email: string): boolean {
  return mockUsers.some((u) => u.email === email);
}

/**
 * Crea un token de recuperación seguro para el email dado.
 * Invalida tokens anteriores del mismo email.
 */
export function createRecoveryToken(email: string): RecoveryToken {
  cleanExpiredTokens();

  // Invalidar tokens anteriores del mismo email
  for (const [key, token] of tokenStore.entries()) {
    if (token.email === email) {
      tokenStore.delete(key);
    }
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + TOKEN_EXPIRY_MINUTES * 60 * 1000);
  const token = generateSecureToken();

  const recoveryToken: RecoveryToken = {
    token,
    email,
    createdAt: now,
    expiresAt,
    used: false,
  };

  tokenStore.set(token, recoveryToken);
  return recoveryToken;
}

/**
 * Valida un token de recuperación.
 * Retorna el token si es válido, null si no existe, expiró o ya fue usado.
 */
export function validateRecoveryToken(token: string): RecoveryToken | null {
  const recoveryToken = tokenStore.get(token);

  if (!recoveryToken) return null;
  if (isExpired(recoveryToken)) {
    tokenStore.delete(token);
    return null;
  }
  if (recoveryToken.used) return null;

  return recoveryToken;
}

/**
 * Cambia la contraseña del usuario usando el token de recuperación.
 * Marca el token como usado después del cambio.
 */
export function resetPassword(token: string, newPassword: string): boolean {
  const recoveryToken = validateRecoveryToken(token);
  if (!recoveryToken) return false;

  // Cambiar contraseña en el store mock
  passwordStore.set(recoveryToken.email, newPassword);

  // Marcar token como usado para que no pueda reutilizarse
  recoveryToken.used = true;
  tokenStore.set(token, recoveryToken);

  return true;
}

/**
 * Retorna info del token sin datos sensibles (para debugging/testing).
 */
export function getTokenInfo(token: string): Omit<RecoveryToken, "token"> | null {
  const recoveryToken = tokenStore.get(token);
  if (!recoveryToken) return null;

  const { token: _, ...info } = recoveryToken;
  return info;
}