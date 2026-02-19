import { Router, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { logger } from "../logger";
import { getProductsService, SortOption } from "../services/products.service";

const router = Router();

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * @openapi
 * /api/products:
 *   get:
 *     summary: Lista productos activos del marketplace
 *     tags:
 *       - Products
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Búsqueda por título (ilike)
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Slug de la categoría
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: condition
 *         schema: { type: string }
 *         description: Reservado para futura columna condition
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [recent, price_asc, price_desc]
 *           default: recent
 *     responses:
 *       200:
 *         description: Lista paginada de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     total: { type: integer }
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", async (req: Request, res: Response): Promise<void> => {
    try {
        // ── Parse & validate query params ────────────────────────────────────────
        const { search, category, condition, sort } = req.query as Record<string, string | undefined>;

        const page = parseInt((req.query.page as string) ?? "1", 10);
        const limit = parseInt((req.query.limit as string) ?? "20", 10);
        const minPrice = req.query.minPrice !== undefined ? parseFloat(req.query.minPrice as string) : undefined;
        const maxPrice = req.query.maxPrice !== undefined ? parseFloat(req.query.maxPrice as string) : undefined;

        if (isNaN(page) || page < 1) {
            res.status(400).json({ error: "El parámetro 'page' debe ser un entero >= 1" });
            return;
        }
        if (isNaN(limit) || limit < 1 || limit > 100) {
            res.status(400).json({ error: "El parámetro 'limit' debe ser un entero entre 1 y 100" });
            return;
        }
        if (minPrice !== undefined && isNaN(minPrice)) {
            res.status(400).json({ error: "El parámetro 'minPrice' debe ser un número" });
            return;
        }
        if (maxPrice !== undefined && isNaN(maxPrice)) {
            res.status(400).json({ error: "El parámetro 'maxPrice' debe ser un número" });
            return;
        }
        if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
            res.status(400).json({ error: "'minPrice' no puede ser mayor que 'maxPrice'" });
            return;
        }

        const allowedSorts: SortOption[] = ["recent", "price_asc", "price_desc"];
        const validatedSort: SortOption =
            sort && allowedSorts.includes(sort as SortOption)
                ? (sort as SortOption)
                : "recent";

        // ── Call service ─────────────────────────────────────────────────────────
        const result = await getProductsService(supabase, {
            search,
            category,
            minPrice,
            maxPrice,
            condition,
            page,
            limit,
            sort: validatedSort,
        });

        logger.info(
            { page, limit, total: result.pagination.total, search, category },
            "GET /api/products"
        );

        res.json(result);
    } catch (err) {
        logger.error({ err }, "Error en GET /api/products");
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

export default router;
