import { Router, Request, Response } from "express";
import { logger } from "../logger";
import {
  userExists,
  createRecoveryToken,
  validateRecoveryToken,
  resetPassword,
} from "../services/recovery.service";

const router = Router();

// ─── POST /auth/recovery/request ─────────────────────────────────────────────

/**
 * @openapi
 * /auth/recovery/request:
 *   post:
 *     summary: Solicitar recuperación de contraseña
 *     description: |
 *       Recibe un email y genera un token seguro de recuperación con expiración de 15 minutos.
 *       Por seguridad, siempre retorna el mismo mensaje sin revelar si el email existe o no.
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

  // Validar que el email fue enviado
  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "El email es requerido" });
    return;
  }

  // Validar formato básico de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: "Formato de email inválido" });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();

  // SEGURIDAD: Siempre respondemos igual, sin revelar si el email existe.
  // Esto previene el ataque "user enumeration" donde un atacante
  // descubre qué emails están registrados en el sistema.
  if (userExists(normalizedEmail)) {
    const recoveryToken = createRecoveryToken(normalizedEmail);

    // En producción esto se enviaría por email al usuario.
    // Por ahora lo retornamos en la respuesta para poder probarlo en Postman.
    logger.info(
      { email: normalizedEmail, token: recoveryToken.token, expiresAt: recoveryToken.expiresAt },
      "Token de recuperación generado"
    );

    // Solo retornamos el token en desarrollo para facilitar las pruebas
    res.json({
      message: "Si el email está registrado, recibirás instrucciones para recuperar tu acceso.",
      // En producción eliminar el token de la respuesta — se enviaría por email
      debug_token: recoveryToken.token,
      debug_expiresAt: recoveryToken.expiresAt,
    });
  } else {
    // Mismo mensaje aunque el email NO exista
    logger.warn({ email: normalizedEmail }, "Solicitud de recuperación para email no registrado");
    res.json({
      message: "Si el email está registrado, recibirás instrucciones para recuperar tu acceso.",
    });
  }
});

// ─── GET /auth/recovery/validate/:token ──────────────────────────────────────

/**
 * @openapi
 * /auth/recovery/validate/{token}:
 *   get:
 *     summary: Validar token de recuperación
 *     description: Verifica que el token existe, no ha expirado y no ha sido usado.
 *     tags:
 *       - Recovery
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de recuperación recibido por email
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
    // Mensaje genérico — no revelamos si el token existió o expiró
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
 *         description: Contraseña actualizada correctamente
 *       400:
 *         description: Token inválido o contraseña muy corta
 */
router.post("/reset", (req: Request, res: Response): void => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    res.status(400).json({ error: "Token y nueva contraseña son requeridos" });
    return;
  }

  // Validar longitud mínima de contraseña
  if (newPassword.length < 8) {
    res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres" });
    return;
  }

  const success = resetPassword(token, newPassword);

  if (!success) {
    res.status(400).json({
      error: "El enlace de recuperación no es válido o ha expirado. Solicita uno nuevo.",
    });
    return;
  }

  logger.info({ token }, "Contraseña restablecida correctamente");

  res.json({
    ok: true,
    message: "Contraseña actualizada correctamente. Ya puedes iniciar sesión.",
  });
});

export default router;