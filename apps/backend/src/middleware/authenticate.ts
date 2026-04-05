import { Request, Response, NextFunction } from "express";
import { validateToken, Session } from "../services/sessions.service";

declare global {
  namespace Express {
    interface Request {
      session?: Session;
    }
  }
}

/**
 * Middleware: authenticate
 * Verifica que el token JWT sea válido, extrae el usuario
 * y lo adjunta al request como req.session.
 *
 * Uso: app.get("/ruta", authenticate, handler)
 *
 * Retorna 401 si:
 * - No hay token en el header Authorization
 * - El token es inválido
 * - El token ha expirado
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  // Verificar que el header Authorization existe y tiene formato correcto
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      error: "No autenticado",
      detail: "Incluye el token en el header: Authorization: Bearer <token>",
    });
    return;
  }

  const token = authHeader.slice(7); // Remover "Bearer "

  const session = validateToken(token);

  if (!session) {
    res.status(401).json({
      error: "Token inválido o sesión expirada",
      detail: "Inicia sesión nuevamente para obtener un token válido",
    });
    return;
  }

  // Adjuntar sesión al request para usarla en los handlers
  req.session = session;
  next();
}