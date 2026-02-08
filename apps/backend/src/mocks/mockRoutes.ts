import { Router, Request, Response } from "express";
import {
    delay,
    sendDelayedResponse,
    mockUsers,
    mockProducts,
    errorMessages,
} from "./mockData";
import { logger } from "../logger";

const router = Router();

// ============================================
// ENDPOINTS DE CARGA (Loading States)
// ============================================

/**
 * @openapi
 * /api/mock/loading/fast:
 *   get:
 *     summary: Simula carga rápida (500ms)
 *     description: Endpoint para probar estados de carga rápidos
 *     tags:
 *       - Mock - Loading
 *     responses:
 *       200:
 *         description: Respuesta después de 500ms
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 delay:
 *                   type: string
 *                   example: 500ms
 *                 message:
 *                   type: string
 *                   example: Carga rápida completada
 */
router.get("/loading/fast", async (_req: Request, res: Response) => {
    await sendDelayedResponse(
        res,
        { delay: "500ms", message: "Carga rápida completada", timestamp: new Date() },
        500
    );
});

/**
 * @openapi
 * /api/mock/loading/normal:
 *   get:
 *     summary: Simula carga normal (2s)
 *     description: Endpoint para probar estados de carga normales
 *     tags:
 *       - Mock - Loading
 *     responses:
 *       200:
 *         description: Respuesta después de 2 segundos
 */
router.get("/loading/normal", async (_req: Request, res: Response) => {
    await sendDelayedResponse(
        res,
        { delay: "2s", message: "Carga normal completada", timestamp: new Date() },
        2000
    );
});

/**
 * @openapi
 * /api/mock/loading/slow:
 *   get:
 *     summary: Simula carga lenta (5s)
 *     description: Endpoint para probar estados de carga lentos
 *     tags:
 *       - Mock - Loading
 *     responses:
 *       200:
 *         description: Respuesta después de 5 segundos
 */
router.get("/loading/slow", async (_req: Request, res: Response) => {
    await sendDelayedResponse(
        res,
        { delay: "5s", message: "Carga lenta completada", timestamp: new Date() },
        5000
    );
});

// ============================================
// ENDPOINTS DE ÉXITO (Success Responses)
// ============================================

/**
 * @openapi
 * /api/mock/users:
 *   get:
 *     summary: Obtener lista de usuarios mock
 *     description: Retorna una lista de usuarios de prueba
 *     tags:
 *       - Mock - Users
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.get("/users", (_req: Request, res: Response) => {
    logger.debug("Enviando lista de usuarios mock");
    res.json({
        success: true,
        count: mockUsers.length,
        data: mockUsers,
    });
});

/**
 * @openapi
 * /api/mock/users/{id}:
 *   get:
 *     summary: Obtener usuario por ID
 *     description: Retorna un usuario específico o error 404
 *     tags:
 *       - Mock - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *       404:
 *         description: Usuario no encontrado
 */
router.get("/users/:id", (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    const user = mockUsers.find((u) => u.id === userId);

    if (!user) {
        return res.status(404).json({
            success: false,
            error: "Usuario no encontrado",
            requestedId: userId,
        });
    }

    res.json({
        success: true,
        data: user,
    });
});

/**
 * @openapi
 * /api/mock/users:
 *   post:
 *     summary: Crear usuario (simulado)
 *     description: Simula la creación de un usuario
 *     tags:
 *       - Mock - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 */
router.post("/users", (req: Request, res: Response) => {
    const { name, email } = req.body;

    const newUser = {
        id: mockUsers.length + 1,
        name: name || "Nuevo Usuario",
        email: email || "nuevo@example.com",
        role: "student",
        createdAt: new Date().toISOString(),
    };

    logger.info({ user: newUser }, "Usuario mock creado");

    res.status(201).json({
        success: true,
        message: "Usuario creado exitosamente",
        data: newUser,
    });
});

/**
 * @openapi
 * /api/mock/products:
 *   get:
 *     summary: Obtener lista de productos mock
 *     description: Retorna una lista de productos de prueba
 *     tags:
 *       - Mock - Products
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *     responses:
 *       200:
 *         description: Lista de productos
 */
router.get("/products", (req: Request, res: Response) => {
    const { category } = req.query;
    let products = mockProducts;

    if (category) {
        products = mockProducts.filter((p) => p.category === category);
    }

    res.json({
        success: true,
        count: products.length,
        data: products,
    });
});

/**
 * @openapi
 * /api/mock/products/{id}:
 *   get:
 *     summary: Obtener producto por ID
 *     description: Retorna un producto específico o error 404
 *     tags:
 *       - Mock - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 */
router.get("/products/:id", (req: Request, res: Response) => {
    const productId = parseInt(req.params.id);
    const product = mockProducts.find((p) => p.id === productId);

    if (!product) {
        return res.status(404).json({
            success: false,
            error: "Producto no encontrado",
            requestedId: productId,
        });
    }

    res.json({
        success: true,
        data: product,
    });
});

// ============================================
// ENDPOINTS DE ERROR (Error Simulation)
// ============================================

/**
 * @openapi
 * /api/mock/error/{code}:
 *   get:
 *     summary: Simular error HTTP
 *     description: Retorna el código de error especificado
 *     tags:
 *       - Mock - Errors
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: integer
 *           enum: [400, 401, 403, 404, 500, 503]
 *         description: Código de error HTTP a simular
 *     responses:
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not Found
 *       500:
 *         description: Internal Server Error
 *       503:
 *         description: Service Unavailable
 */
router.get("/error/:code", (req: Request, res: Response) => {
    const errorCode = parseInt(req.params.code) as keyof typeof errorMessages;

    if (!errorMessages[errorCode]) {
        return res.status(400).json({
            error: "Código de error no soportado",
            supportedCodes: [400, 401, 403, 404, 500, 503],
        });
    }

    logger.warn({ errorCode }, "Simulando error HTTP");

    res.status(errorCode).json({
        success: false,
        timestamp: new Date().toISOString(),
        ...errorMessages[errorCode],
    });
});

// ============================================
// ESCENARIOS ESPECIALES
// ============================================

/**
 * @openapi
 * /api/mock/random:
 *   get:
 *     summary: Respuesta aleatoria
 *     description: Retorna éxito o error aleatoriamente
 *     tags:
 *       - Mock - Special
 *     responses:
 *       200:
 *         description: Respuesta exitosa
 *       500:
 *         description: Error simulado
 */
router.get("/random", (_req: Request, res: Response) => {
    const isSuccess = Math.random() > 0.5;

    if (isSuccess) {
        res.json({
            success: true,
            message: "Respuesta exitosa aleatoria",
            data: { randomValue: Math.floor(Math.random() * 100) },
        });
    } else {
        res.status(500).json({
            success: false,
            ...errorMessages[500],
        });
    }
});

/**
 * @openapi
 * /api/mock/flaky:
 *   get:
 *     summary: Endpoint inestable
 *     description: Tiene 50% de probabilidad de fallar (útil para probar reintentos)
 *     tags:
 *       - Mock - Special
 *     responses:
 *       200:
 *         description: Respuesta exitosa
 *       503:
 *         description: Servicio no disponible
 */
router.get("/flaky", (_req: Request, res: Response) => {
    const shouldFail = Math.random() > 0.5;

    if (shouldFail) {
        logger.warn("Endpoint flaky retornando error");
        return res.status(503).json({
            success: false,
            ...errorMessages[503],
        });
    }

    res.json({
        success: true,
        message: "Endpoint inestable funcionó esta vez",
        data: { attempt: Date.now() },
    });
});

/**
 * @openapi
 * /api/mock/timeout:
 *   get:
 *     summary: Simula timeout
 *     description: Demora 30 segundos antes de responder (para probar timeouts)
 *     tags:
 *       - Mock - Special
 *     responses:
 *       200:
 *         description: Respuesta después de 30 segundos
 */
router.get("/timeout", async (_req: Request, res: Response) => {
    logger.warn("Iniciando delay de 30s para simular timeout");
    await sendDelayedResponse(
        res,
        {
            message: "Si ves esto, tu cliente no tiene timeout configurado",
            delay: "30s",
        },
        30000
    );
});

export default router;
