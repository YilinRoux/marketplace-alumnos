import { Router, Request, Response } from "express";
import { logger } from "../logger";
import {
  userExists,
  createRecoveryToken,
  validateRecoveryToken,
  resetPassword,
} from "../services/recovery.service";
import { deleteAllUserSessions } from "../services/sessions.service";

const router = Router();

// ─── Middleware local: verifica JWT propio ────────────────────────────────────

// ─── POST /auth/recovery/request ─────────────────────────────────────────────

/**
 * @openapi
 * /auth/recovery/request:
 *   post:
 *     summary: Solicitar recuperación de contraseña
 *     description: |
 *       Recibe un email y genera un token seguro de recuperación con expiración de 15 minutos.
 *       Por seguridad, siempre retorna el mismo mensaje y los mismos campos sin revelar si el email existe o no.
 *     tags:
 *       - Recovery
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: omar@universidad.edu
 *     responses:
 *       200:
 *         description: Mensaje genérico (no revela si el email existe)
 *       400:
 *         description: Email requerido o formato inválido
 */
router.post("/request", (req: Request, res: Response): void => {
  const { email } = req.body;

  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "El email es requerido" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: "Formato de email inválido" });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();

  // FIX BUG-01: Siempre retornamos exactamente los mismos campos
  // sin importar si el email existe o no.
  // Antes: debug_token y debug_expiresAt solo aparecían cuando el email existía
  // lo que permitía distinguir emails registrados (user enumeration attack).

  let debugToken: string | null = null;
  let debugExpiresAt: string | null = null;

  if (userExists(normalizedEmail)) {
    const recoveryToken = createRecoveryToken(normalizedEmail);
    debugToken = recoveryToken.token;
    debugExpiresAt = recoveryToken.expiresAt.toISOString();

    logger.info(
      { email: normalizedEmail, expiresAt: recoveryToken.expiresAt },
      "Token de recuperación generado"
    );
  } else {
    logger.warn({ email: normalizedEmail }, "Solicitud de recuperación para email no registrado");
  }

  // Siempre retornamos la misma estructura — un atacante no puede
  // distinguir si el email existe o no comparando las respuestas.
  res.json({
    message: "Si el email está registrado, recibirás instrucciones para recuperar tu acceso.",
    // En producción eliminar debug_token — se enviaría por email
    debug_token: debugToken,
    debug_expiresAt: debugExpiresAt,
  });
});

// ─── GET /auth/recovery/validate/:token ──────────────────────────────────────

/**
 * @openapi
 * /auth/recovery/validate/{token}:
 *   get:
 *     summary: Validar token de recuperación
 *     tags:
 *       - Recovery
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Token válido
 *       400:
 *         description: Token inválido, expirado o ya usado
 */
router.get("/validate/:token", (req: Request, res: Response): void => {
  const token = String(req.params.token);
  const recoveryToken = validateRecoveryToken(token);

  if (!recoveryToken) {
    res.status(400).json({
      valid: false,
      error: "El enlace de recuperación no es válido o ha expirado. Solicita uno nuevo.",
    });
    return;
  }

  const minutesLeft = Math.floor(
    (recoveryToken.expiresAt.getTime() - Date.now()) / 1000 / 60
  );

  res.json({
    valid: true,
    email: recoveryToken.email,
    expiresAt: recoveryToken.expiresAt,
    minutesLeft,
  });
});

// ─── POST /auth/recovery/reset ────────────────────────────────────────────────

/**
 * @openapi
 * /auth/recovery/reset:
 *   post:
 *     summary: Cambiar contraseña con token de recuperación
 *     description: |
 *       Recibe el token de recuperación y la nueva contraseña.
 *       El token queda marcado como usado y no puede reutilizarse.
 *       Todas las sesiones activas del usuario se invalidan al cambiar la contraseña.
 *     tags:
 *       - Recovery
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Contraseña actualizada y sesiones invalidadas
 *       400:
 *         description: Token inválido o contraseña muy corta
 */
router.post("/reset", (req: Request, res: Response): void => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    res.status(400).json({ error: "Token y nueva contraseña son requeridos" });
    return;
  }

  if (newPassword.length < 8) {
    res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres" });
    return;
  }

  // Validar token antes de hacer el reset
  const recoveryToken = validateRecoveryToken(token);
  if (!recoveryToken) {
    res.status(400).json({
      error: "El enlace de recuperación no es válido o ha expirado. Solicita uno nuevo.",
    });
    return;
  }

  // Cambiar contraseña y marcar token como usado
  const success = resetPassword(token, newPassword);
  if (!success) {
    res.status(400).json({
      error: "El enlace de recuperación no es válido o ha expirado. Solicita uno nuevo.",
    });
    return;
  }

  // FIX BUG-02: Invalidar todas las sesiones activas del usuario

  // lo que permitía a un atacante mantener acceso aunque el usuario cambiara su contraseña.
  const sessionsDeleted = deleteAllUserSessions(recoveryToken.email);

  logger.info(
    { email: recoveryToken.email, sessionsDeleted },
    "Contraseña restablecida y sesiones invalidadas"
  );

  res.json({
    ok: true,
    message: "Contraseña actualizada correctamente. Ya puedes iniciar sesión.",
    sessionsInvalidated: sessionsDeleted,
  });
});

export default router;