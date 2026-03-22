import { Router, Request, Response } from "express";
import { logger } from "../logger";
import {
  findUserByCredentials,
  createSession,
  validateToken,
  getSessionsByUser,
  deleteSession,
  deleteAllUserSessions,
} from "../services/sessions.service";

const router = Router();

// ─── Middleware local: verifica JWT propio ────────────────────────────────────

function requireSession(req: Request, res: Response, next: () => void): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : req.cookies?.session_token;

  if (!token) {
    res.status(401).json({ error: "No autenticado — incluye el token en Authorization: Bearer <token>" });
    return;
  }

  const session = validateToken(token);
  if (!session) {
    res.status(401).json({ error: "Token inválido o sesión expirada" });
    return;
  }

  // Adjuntar sesión al request para usarla en los handlers
  (req as Request & { session: typeof session }).session = session;
  next();
}

// ─── POST /auth/login ─────────────────────────────────────────────────────────

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login — genera token de sesión
 *     description: |
 *       Autentica al usuario y crea una nueva sesión (token JWT).
 *       Permite múltiples sesiones simultáneas por usuario.
 *     tags:
 *       - Sessions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: omar@universidad.edu
 *               password:
 *                 type: string
 *                 example: "1234"
 *               device:
 *                 type: string
 *                 example: Chrome en Windows
 *     responses:
 *       200:
 *         description: Login exitoso — retorna token y datos del usuario
 *       400:
 *         description: Campos requeridos faltantes
 *       401:
 *         description: Credenciales inválidas
 */
router.post("/login", (req: Request, res: Response): void => {
  const { email, password, device } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email y contraseña son requeridos" });
    return;
  }

  const user = findUserByCredentials(email, password);
  if (!user) {
    logger.warn({ email }, "Login fallido — credenciales inválidas");
    res.status(401).json({ error: "Credenciales inválidas" });
    return;
  }

  const deviceInfo = device || req.headers["user-agent"] || "Dispositivo desconocido";
  const session = createSession(user, deviceInfo as string);

  logger.info({ userId: user.id, sessionId: session.id }, "Login exitoso");

  res.json({
    ok: true,
    token: session.token,
    expiresAt: session.expiresAt,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
});

// ─── GET /auth/sessions ───────────────────────────────────────────────────────

/**
 * @openapi
 * /auth/sessions:
 *   get:
 *     summary: Ver sesiones activas del usuario
 *     description: Retorna todas las sesiones activas del usuario autenticado.
 *     tags:
 *       - Sessions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de sesiones activas
 *       401:
 *         description: No autenticado
 */
router.get("/sessions", requireSession as unknown as (req: Request, res: Response) => void, (req: Request, res: Response): void => {
  const session = (req as Request & { session: { userId: string; id: string } }).session;
  const sessions = getSessionsByUser(session.userId);

  res.json({
    total: sessions.length,
    sessions: sessions.map((s) => ({
      id: s.id,
      device: s.device,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      isCurrent: s.id === session.id,
    })),
  });
});

// ─── DELETE /auth/sessions/:id ────────────────────────────────────────────────

/**
 * @openapi
 * /auth/sessions/{id}:
 *   delete:
 *     summary: Cerrar una sesión específica
 *     tags:
 *       - Sessions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la sesión a cerrar
 *     responses:
 *       200:
 *         description: Sesión cerrada correctamente
 *       404:
 *         description: Sesión no encontrada
 *       401:
 *         description: No autenticado
 */
router.delete("/sessions/:id", requireSession as unknown as (req: Request, res: Response) => void, (req: Request, res: Response): void => {
  const session = (req as Request & { session: { userId: string } }).session;
  const { id } = req.params;

  const deleted = deleteSession(id, session.userId);
  if (!deleted) {
    res.status(404).json({ error: "Sesión no encontrada o no pertenece a este usuario" });
    return;
  }

  logger.info({ sessionId: id, userId: session.userId }, "Sesión cerrada");
  res.json({ ok: true, message: "Sesión cerrada correctamente" });
});

// ─── POST /auth/logout-all ────────────────────────────────────────────────────

/**
 * @openapi
 * /auth/logout-all:
 *   post:
 *     summary: Cerrar todas las sesiones del usuario
 *     tags:
 *       - Sessions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todas las sesiones cerradas
 *       401:
 *         description: No autenticado
 */
router.post("/logout-all", requireSession as unknown as (req: Request, res: Response) => void, (req: Request, res: Response): void => {
  const session = (req as Request & { session: { userId: string } }).session;
  const count = deleteAllUserSessions(session.userId);

  logger.info({ userId: session.userId, count }, "Todas las sesiones cerradas");
  res.json({ ok: true, message: `${count} sesión(es) cerrada(s)` });
});

export default router;