import { Router, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { logger } from "../logger";
import { getCategoriesService } from "../services/categories.service";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ─── Helpers de respuesta estandarizada ──────────────────────────────────────

const ok = (res: Response, data: unknown, message = "OK", status = 200) =>
  res.status(status).json({ success: true, message, data });

const fail = (res: Response, message: string, status = 400) =>
  res.status(status).json({ success: false, message, data: null });

// ─── GET / ─── Lista todas las categorías ────────────────────────────────────

/**
 * @openapi
 * /api/categories:
 *   get:
 *     summary: Lista todas las categorías disponibles
 *     tags:
 *       - Categories
 *     responses:
 *       200:
 *         description: Array de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 message: { type: string }
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:   { type: string, format: uuid }
 *                       name: { type: string }
 *                       slug: { type: string }
 */
router.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await getCategoriesService(supabase);
    logger.info({ count: categories.length }, "GET /api/categories");
    ok(res, categories, "Categorías obtenidas");
  } catch (err) {
    logger.error({ err }, "Error en GET /api/categories");
    fail(res, "Error interno del servidor", 500);
  }
});

// ─── GET /:id ─── Obtener categoría por ID ────────────────────────────────────

/**
 * @openapi
 * /api/categories/{id}:
 *   get:
 *     summary: Obtiene una categoría por su ID
 *     tags:
 *       - Categories
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Categoría encontrada
 *       404:
 *         description: Categoría no encontrada
 */
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("id", id)
      .single();

    if (error || !data) {
      fail(res, "Categoría no encontrada", 404); return;
    }

    logger.info({ categoryId: id }, "GET /api/categories/:id");
    ok(res, data, "Categoría obtenida");
  } catch (err) {
    logger.error({ err }, "Error en GET /api/categories/:id");
    fail(res, "Error interno del servidor", 500);
  }
});

// ─── POST / ─── Crear categoría (solo superadmin) ────────────────────────────

/**
 * @openapi
 * /api/categories:
 *   post:
 *     summary: Crea una nueva categoría (solo superadmin)
 *     tags:
 *       - Categories
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, slug]
 *             properties:
 *               name: { type: string }
 *               slug: { type: string, description: "Identificador URL-friendly, ej: electronica" }
 *     responses:
 *       201:
 *         description: Categoría creada
 *       400:
 *         description: Datos inválidos o slug duplicado
 *       403:
 *         description: Rol insuficiente
 */
router.post(
  "/",
  requireAuth,
  requireRole("superadmin"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, slug } = req.body;

      if (!name?.trim()) {
        fail(res, "El campo 'name' es requerido"); return;
      }
      if (!slug?.trim()) {
        fail(res, "El campo 'slug' es requerido"); return;
      }

      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(slug.trim())) {
        fail(res, "El slug solo puede contener letras minúsculas, números y guiones"); return;
      }

      const { data, error } = await supabase
        .from("categories")
        .insert({ name: name.trim(), slug: slug.trim() })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          fail(res, "Ya existe una categoría con ese slug"); return;
        }
        throw new Error(error.message);
      }

      logger.info({ categoryId: data.id, slug: data.slug }, "Categoría creada");
      ok(res, data, "Categoría creada exitosamente", 201);
    } catch (err) {
      logger.error({ err }, "Error en POST /api/categories");
      fail(res, "Error interno del servidor", 500);
    }
  }
);

// ─── PATCH /:id ─── Editar categoría (solo superadmin) ───────────────────────

/**
 * @openapi
 * /api/categories/{id}:
 *   patch:
 *     summary: Edita una categoría (solo superadmin)
 *     tags:
 *       - Categories
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               slug: { type: string }
 *     responses:
 *       200:
 *         description: Categoría actualizada
 *       404:
 *         description: Categoría no encontrada
 */
router.patch(
  "/:id",
  requireAuth,
  requireRole("superadmin"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, slug } = req.body;

      const updates: Record<string, string> = {};
      if (name !== undefined) updates.name = name.trim();
      if (slug !== undefined) updates.slug = slug.trim();

      if (Object.keys(updates).length === 0) {
        fail(res, "No se enviaron campos para actualizar"); return;
      }

      const { data, error } = await supabase
        .from("categories")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          fail(res, "Ya existe una categoría con ese slug"); return;
        }
        if (error.code === "PGRST116") {
          fail(res, "Categoría no encontrada", 404); return;
        }
        throw new Error(error.message);
      }

      logger.info({ categoryId: id }, "Categoría actualizada");
      ok(res, data, "Categoría actualizada exitosamente");
    } catch (err) {
      logger.error({ err }, "Error en PATCH /api/categories/:id");
      fail(res, "Error interno del servidor", 500);
    }
  }
);

// ─── DELETE /:id ─── Eliminar categoría (solo superadmin) ────────────────────

/**
 * @openapi
 * /api/categories/{id}:
 *   delete:
 *     summary: Elimina una categoría (solo superadmin)
 *     tags:
 *       - Categories
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Categoría eliminada
 *       404:
 *         description: Categoría no encontrada
 *       409:
 *         description: No se puede eliminar, tiene productos asociados
 */
router.delete(
  "/:id",
  requireAuth,
  requireRole("superadmin"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const { data: existing } = await supabase
        .from("categories")
        .select("id")
        .eq("id", id)
        .single();

      if (!existing) {
        fail(res, "Categoría no encontrada", 404); return;
      }

      const { count } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("category_id", id)
        .eq("status", "active");

      if (count && count > 0) {
        fail(res, `No se puede eliminar: hay ${count} producto(s) activo(s) en esta categoría`, 409);
        return;
      }

      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw new Error(error.message);

      logger.info({ categoryId: id }, "Categoría eliminada");
      ok(res, null, "Categoría eliminada exitosamente");
    } catch (err) {
      logger.error({ err }, "Error en DELETE /api/categories/:id");
      fail(res, "Error interno del servidor", 500);
    }
  }
);

export default router;