import { Router, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { logger } from "../logger";
import { getProductsService, SortOption } from "../services/products.service";
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

// ─── GET / ─── Lista productos con filtros, búsqueda y paginación ─────────────

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
 *         description: Búsqueda por título
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
 *         name: verified
 *         schema: { type: boolean }
 *         description: Filtrar solo productos verificados
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
 *       400:
 *         description: Parámetros inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category, condition, sort } = req.query as Record<string, string | undefined>;

    const page     = parseInt((req.query.page  as string) ?? "1",  10);
    const limit    = parseInt((req.query.limit as string) ?? "20", 10);
    const minPrice = req.query.minPrice !== undefined ? parseFloat(req.query.minPrice as string) : undefined;
    const maxPrice = req.query.maxPrice !== undefined ? parseFloat(req.query.maxPrice as string) : undefined;
    const verified = req.query.verified !== undefined ? req.query.verified === "true" : undefined;

    if (isNaN(page) || page < 1) {
      fail(res, "El parámetro 'page' debe ser un entero >= 1"); return;
    }
    if (isNaN(limit) || limit < 1 || limit > 100) {
      fail(res, "El parámetro 'limit' debe ser un entero entre 1 y 100"); return;
    }
    if (minPrice !== undefined && isNaN(minPrice)) {
      fail(res, "El parámetro 'minPrice' debe ser un número"); return;
    }
    if (maxPrice !== undefined && isNaN(maxPrice)) {
      fail(res, "El parámetro 'maxPrice' debe ser un número"); return;
    }
    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      fail(res, "'minPrice' no puede ser mayor que 'maxPrice'"); return;
    }

    const allowedSorts: SortOption[] = ["recent", "price_asc", "price_desc"];
    const validatedSort: SortOption =
      sort && allowedSorts.includes(sort as SortOption) ? (sort as SortOption) : "recent";

    const result = await getProductsService(supabase, {
      search, category, minPrice, maxPrice, condition, verified,
      page, limit, sort: validatedSort,
    });

    logger.info({ page, limit, total: result.pagination.total, search, category, verified }, "GET /api/products");
    res.json(result);
  } catch (err) {
    logger.error({ err }, "Error en GET /api/products");
    fail(res, "Error interno del servidor", 500);
  }
});

// ─── GET /:id ─── Obtener un producto por ID ──────────────────────────────────

/**
 * @openapi
 * /api/products/{id}:
 *   get:
 *     summary: Obtiene un producto por su ID
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("products")
      .select(`
        id, title, description, price, verified, status, images, created_at,
        categories ( id, name, slug ),
        profiles!seller_id ( id, full_name, avatar_url, phone )
      `)
      .eq("id", id)
      .eq("status", "active")
      .single();

    if (error || !data) {
      fail(res, "Producto no encontrado", 404); return;
    }

    logger.info({ productId: id }, "GET /api/products/:id");
    ok(res, data, "Producto obtenido");
  } catch (err) {
    logger.error({ err }, "Error en GET /api/products/:id");
    fail(res, "Error interno del servidor", 500);
  }
});

// ─── POST / ─── Crear producto ────────────────────────────────────────────────

/**
 * @openapi
 * /api/products:
 *   post:
 *     summary: Crea un nuevo producto (requiere rol seller o superadmin)
 *     tags:
 *       - Products
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, price, category_id]
 *             properties:
 *               title:       { type: string }
 *               description: { type: string }
 *               price:       { type: number }
 *               category_id: { type: string, format: uuid }
 *               images:      { type: array, items: { type: string } }
 *     responses:
 *       201:
 *         description: Producto creado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Rol insuficiente
 */
router.post(
  "/",
  requireAuth,
  requireRole("seller"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, description, price, category_id, images } = req.body;

      if (!title?.trim()) {
        fail(res, "El campo 'title' es requerido"); return;
      }
      if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
        fail(res, "El campo 'price' debe ser un número >= 0"); return;
      }
      if (!category_id) {
        fail(res, "El campo 'category_id' es requerido"); return;
      }

      const { data, error } = await supabase
        .from("products")
        .insert({
          title: title.trim(),
          description: description?.trim() ?? null,
          price: Number(price),
          category_id,
          images: images ?? [],
          seller_id: req.user!.id,
          status: "active",
          verified: false,
        })
        .select()
        .single();

      if (error) {
        logger.error({ error }, "Error al crear producto en Supabase");
        fail(res, "Error al crear el producto", 500); return;
      }

      logger.info({ productId: data.id, sellerId: req.user!.id }, "Producto creado");
      ok(res, data, "Producto creado exitosamente", 201);
    } catch (err) {
      logger.error({ err }, "Error en POST /api/products");
      fail(res, "Error interno del servidor", 500);
    }
  }
);

// ─── PATCH /:id ─── Editar producto ──────────────────────────────────────────

/**
 * @openapi
 * /api/products/{id}:
 *   patch:
 *     summary: Edita un producto (solo el vendedor dueño o superadmin)
 *     tags:
 *       - Products
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
 *               title:       { type: string }
 *               description: { type: string }
 *               price:       { type: number }
 *               category_id: { type: string, format: uuid }
 *               images:      { type: array, items: { type: string } }
 *               status:      { type: string, enum: [active, inactive] }
 *               verified:    { type: boolean, description: "Solo superadmin" }
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       403:
 *         description: Sin permiso para editar este producto
 *       404:
 *         description: Producto no encontrado
 */
router.patch(
  "/:id",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = req.user!;

      const { data: existing, error: fetchError } = await supabase
        .from("products")
        .select("id, seller_id")
        .eq("id", id)
        .single();

      if (fetchError || !existing) {
        fail(res, "Producto no encontrado", 404); return;
      }

      if (user.role !== "superadmin" && existing.seller_id !== user.id) {
        fail(res, "No tienes permiso para editar este producto", 403); return;
      }

      const { title, description, price, category_id, images, status, verified } = req.body;
      const updates: Record<string, unknown> = {};
      if (title !== undefined)       updates.title = title.trim();
      if (description !== undefined) updates.description = description.trim();
      if (price !== undefined)       updates.price = Number(price);
      if (category_id !== undefined) updates.category_id = category_id;
      if (images !== undefined)      updates.images = images;
      if (status !== undefined && ["active", "inactive"].includes(status)) {
        updates.status = status;
      }
      // Solo superadmin puede marcar como verificado
      if (verified !== undefined && user.role === "superadmin") {
        updates.verified = verified;
      }

      if (Object.keys(updates).length === 0) {
        fail(res, "No se enviaron campos para actualizar"); return;
      }

      const { data, error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        logger.error({ error }, "Error al actualizar producto");
        fail(res, "Error al actualizar el producto", 500); return;
      }

      logger.info({ productId: id, userId: user.id }, "Producto actualizado");
      ok(res, data, "Producto actualizado exitosamente");
    } catch (err) {
      logger.error({ err }, "Error en PATCH /api/products/:id");
      fail(res, "Error interno del servidor", 500);
    }
  }
);

// ─── DELETE /:id ─── Eliminar producto ───────────────────────────────────────

/**
 * @openapi
 * /api/products/{id}:
 *   delete:
 *     summary: Elimina un producto (soft delete — cambia status a inactive)
 *     tags:
 *       - Products
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Producto eliminado
 *       403:
 *         description: Sin permiso
 *       404:
 *         description: Producto no encontrado
 */
router.delete(
  "/:id",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = req.user!;

      const { data: existing, error: fetchError } = await supabase
        .from("products")
        .select("id, seller_id")
        .eq("id", id)
        .single();

      if (fetchError || !existing) {
        fail(res, "Producto no encontrado", 404); return;
      }

      if (user.role !== "superadmin" && existing.seller_id !== user.id) {
        fail(res, "No tienes permiso para eliminar este producto", 403); return;
      }

      const { error } = await supabase
        .from("products")
        .update({ status: "inactive" })
        .eq("id", id);

      if (error) {
        logger.error({ error }, "Error al eliminar producto");
        fail(res, "Error al eliminar el producto", 500); return;
      }

      logger.info({ productId: id, userId: user.id }, "Producto eliminado (soft delete)");
      ok(res, null, "Producto eliminado exitosamente");
    } catch (err) {
      logger.error({ err }, "Error en DELETE /api/products/:id");
      fail(res, "Error interno del servidor", 500);
    }
  }
);

// ─── POST /:id/images ─── Subir imágenes a Supabase Storage ──────────────────

/**
 * @openapi
 * /api/products/{id}/images:
 *   post:
 *     summary: Sube imágenes para un producto a Supabase Storage
 *     tags:
 *       - Products
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fileName, fileBase64, mimeType]
 *             properties:
 *               fileName:   { type: string }
 *               fileBase64: { type: string, description: "Archivo en base64" }
 *               mimeType:   { type: string, example: "image/jpeg" }
 *     responses:
 *       200:
 *         description: URL pública de la imagen subida
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: Sin permiso
 */
router.post(
  "/:id/images",
  requireAuth,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = req.user!;
      const { fileName, fileBase64, mimeType } = req.body;

      if (!fileName || !fileBase64 || !mimeType) {
        fail(res, "fileName, fileBase64 y mimeType son requeridos"); return;
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(mimeType)) {
        fail(res, "Tipo de archivo no permitido. Usa jpeg, png o webp"); return;
      }

      const { data: existing } = await supabase
        .from("products")
        .select("seller_id, images")
        .eq("id", id)
        .single();

      if (!existing) {
        fail(res, "Producto no encontrado", 404); return;
      }
      if (user.role !== "superadmin" && existing.seller_id !== user.id) {
        fail(res, "No tienes permiso para subir imágenes a este producto", 403); return;
      }

      const buffer = Buffer.from(fileBase64, "base64");
      const ext = mimeType.split("/")[1];
      const storagePath = `products/${id}/${Date.now()}-${fileName}.${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(storagePath, buffer, { contentType: mimeType, upsert: false });

      if (uploadError) {
        logger.error({ uploadError }, "Error al subir imagen a Storage");
        fail(res, "Error al subir la imagen", 500); return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(uploadData.path);

      const updatedImages = [...(existing.images ?? []), publicUrl];
      await supabase.from("products").update({ images: updatedImages }).eq("id", id);

      logger.info({ productId: id, path: uploadData.path }, "Imagen subida");
      ok(res, { url: publicUrl }, "Imagen subida exitosamente");
    } catch (err) {
      logger.error({ err }, "Error en POST /api/products/:id/images");
      fail(res, "Error interno del servidor", 500);
    }
  }
);

export default router;