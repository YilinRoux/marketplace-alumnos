import { Request, Response, NextFunction } from "express";

export type Role = "user" | "seller" | "superadmin";

/**
 * Middleware: authorize(...roles)
 * Verifica que el usuario autenticado tenga uno de los roles permitidos.
 * DEBE usarse DESPUÉS de authenticate.
 *
 * Uso: app.post("/ruta", authenticate, authorize("seller", "superadmin"), handler)
 *
 * Retorna 403 si el rol del usuario no está en la lista de roles permitidos.
 * Nota: superadmin siempre tiene acceso a cualquier ruta protegida.
 */
export function authorize(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session) {
      res.status(401).json({
        error: "No autenticado",
        detail: "El middleware authenticate debe aplicarse antes de authorize",
      });
      return;
    }

    const userRole = req.session.role as Role;

    // superadmin siempre tiene acceso a cualquier ruta
    if (userRole === "superadmin") {
      next();
      return;
    }

    if (!roles.includes(userRole)) {
      res.status(403).json({
        error: "Acceso denegado",
        detail: `Tu rol '${userRole}' no tiene permiso para esta acción. Roles permitidos: ${roles.join(", ")}`,
      });
      return;
    }

    next();
  };
}