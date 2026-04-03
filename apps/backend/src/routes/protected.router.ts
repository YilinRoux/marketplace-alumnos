import { Router, Request, Response } from "express";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { logger } from "../logger";

const router = Router();

// ─── GET /user/profile ────────────────────────────────────────────────────────
// Solo autenticado — cualquier rol puede acceder

/**
 * @openapi
 * /user/profile:
 *   get:
 *     summary: Ver perfil del usuario autenticado
 *     description: Solo accesible con token JWT válido. Cualquier rol puede acceder.
 *     tags:
 *       - Protected Routes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *       401:
 *         description: No autenticado
 */
router.get(
  "/profile",
  authenticate,
  (req: Request, res: Response): void => {
    logger.info({ userId: req.session!.userId }, "GET /user/profile");
    res.json({
      message: "Perfil del usuario autenticado",
      user: {
        id: req.session!.userId,
        email: req.session!.email,
        role: req.session!.role,
        sessionId: req.session!.id,
        expiresAt: req.session!.expiresAt,
      },
    });
  }
);

// ─── POST /product ────────────────────────────────────────────────────────────
// Solo seller y superadmin

/**
 * @openapi
 * /product:
 *   post:
 *     summary: Crear un producto
 *     description: Solo accesible para usuarios con rol seller o superadmin.
 *     tags:
 *       - Protected Routes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Producto creado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Rol insuficiente
 */
router.post(
  "/product",
  authenticate,
  authorize("seller", "superadmin"),
  (req: Request, res: Response): void => {
    const { title, price } = req.body;

    if (!title || !price) {
      res.status(400).json({ error: "title y price son requeridos" });
      return;
    }

    logger.info({ userId: req.session!.userId, title }, "POST /product");

    res.status(201).json({
      message: "Producto creado correctamente",
      product: {
        id: `prod_${Date.now()}`,
        title,
        price,
        sellerId: req.session!.userId,
        sellerEmail: req.session!.email,
      },
    });
  }
);

// ─── DELETE /user/:id ─────────────────────────────────────────────────────────
// Solo superadmin

/**
 * @openapi
 * /user/{id}:
 *   delete:
 *     summary: Eliminar un usuario
 *     description: Solo accesible para superadmin.
 *     tags:
 *       - Protected Routes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Rol insuficiente
 */
router.delete(
  "/user/:id",
  authenticate,
  authorize("superadmin"),
  (req: Request, res: Response): void => {
    const id = String(req.params.id);
    logger.info({ adminId: req.session!.userId, targetId: id }, "DELETE /user/:id");

    res.json({
      message: `Usuario ${id} eliminado correctamente`,
      deletedBy: req.session!.email,
    });
  }
);

export default router;