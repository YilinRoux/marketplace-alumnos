import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "mi_secreto_super_seguro_123";
const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hora en ms

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Session {
  id: string;
  userId: string;
  email: string;
  token: string;
  device: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: "user" | "seller" | "superadmin";
}

// ─── Mock Users (simulan la tabla profiles de Supabase) ───────────────────────

export const mockUsers: MockUser[] = [
  { id: "user-001", email: "omar@universidad.edu", name: "Omar Lazaro", role: "seller" },
  { id: "user-002", email: "yilin@universidad.edu", name: "Yilin Roux", role: "seller" },
  { id: "user-003", email: "admin@universidad.edu", name: "Admin User", role: "superadmin" },
];

// ─── In-memory session store ───────────────────────────────────────────────────
// Cuando lleguen credenciales reales de Supabase, esto se reemplaza
// por una tabla "sessions" en la base de datos.

const sessionStore = new Map<string, Session>();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function isExpired(session: Session): boolean {
  return new Date() > session.expiresAt;
}

// ─── Service functions ────────────────────────────────────────────────────────

/**
 * Busca un usuario mock por email y contraseña.
 * En producción esto consultaría Supabase Auth.
 */
export function findUserByCredentials(email: string, password: string): MockUser | null {
  // Para el mock cualquier contraseña funciona siempre que el email exista
  if (password.length < 4) return null;
  return mockUsers.find((u) => u.email === email) ?? null;
}

/**
 * Crea una nueva sesión para el usuario y genera un JWT.
 * Permite múltiples sesiones por usuario (diferente device/IP).
 */
export function createSession(user: MockUser, device: string): Session {
  const sessionId = generateSessionId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + TOKEN_EXPIRY_MS);

  const token = jwt.sign(
    {
      sessionId,
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  const session: Session = {
    id: sessionId,
    userId: user.id,
    email: user.email,
    token,
    device,
    createdAt: now,
    expiresAt,
  };

  sessionStore.set(sessionId, session);
  return session;
}

/**
 * Valida un token JWT y retorna la sesión si es válida.
 */
export function validateToken(token: string): Session | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sessionId: string };
    const session = sessionStore.get(payload.sessionId);

    if (!session) return null;
    if (isExpired(session)) {
      sessionStore.delete(session.id);
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Retorna todas las sesiones activas de un usuario.
 */
export function getSessionsByUser(userId: string): Session[] {
  const now = new Date();
  const active: Session[] = [];

  for (const session of sessionStore.values()) {
    if (session.userId === userId) {
      if (isExpired(session)) {
        sessionStore.delete(session.id);
      } else {
        active.push(session);
      }
    }
  }

  return active.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Cierra una sesión específica por ID.
 * Retorna true si existía, false si no.
 */
export function deleteSession(sessionId: string, userId: string): boolean {
  const session = sessionStore.get(sessionId);
  if (!session || session.userId !== userId) return false;
  sessionStore.delete(sessionId);
  return true;
}

/**
 * Cierra todas las sesiones de un usuario.
 */
export function deleteAllUserSessions(userId: string): number {
  let count = 0;
  for (const [id, session] of sessionStore.entries()) {
    if (session.userId === userId) {
      sessionStore.delete(id);
      count++;
    }
  }
  return count;
}