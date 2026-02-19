import { Router, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { logger } from "../logger";
import { getCategoriesService } from "../services/categories.service";

const router = Router();

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:   { type: string, format: uuid }
 *                   name: { type: string }
 *                   slug: { type: string }
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", async (_req: Request, res: Response): Promise<void> => {
    try {
        const categories = await getCategoriesService(supabase);

        logger.info({ count: categories.length }, "GET /api/categories");

        res.json(categories);
    } catch (err) {
        logger.error({ err }, "Error en GET /api/categories");
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

export default router;
