import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import pinoHttp from "pino-http";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { createClient } from "@supabase/supabase-js";
import { logger } from "./logger";
import { swaggerSpec } from "./swagger";
import mockRoutes from "./mocks/mockRoutes";
import { requireAuth } from "./middleware/auth";
import productsRouter from "./routes/products.router";
import categoriesRouter from "./routes/categories.router";
import sessionsRouter from "./routes/sessions.router";

// Supabase admin client (service role key for server-side token validation)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const app = express();

// CORS — permite credenciales desde el frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Middleware para logging automático de peticiones HTTP
app.use(pinoHttp({ logger }));

app.use(express.json());
app.use(cookieParser());

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mock endpoints para pruebas del frontend
app.use("/api/mock", mockRoutes);

// ─── Marketplace routes ───────────────────────────────────────
app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);

// ─── Sessions routes ─────────────────────────────────────────────────────────
app.use("/auth", sessionsRouter);

// ─── Auth routes ─────────────────────────────────────────────

/**
 * @openapi
 * /auth/set-session:
 *   post:
 *     summary: Establece la sesión del usuario con cookies HttpOnly
 *     description: |
 *       Recibe access_token y refresh_token del frontend después del login con Google,
 *       valida el token con Supabase y setea cookies HttpOnly seguras.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - access_token
 *               - refresh_token
 *             properties:
 *               access_token:
 *                 type: string
 *               refresh_token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sesión establecida correctamente
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Error interno del servidor
 */
app.post("/auth/set-session", async (req: Request, res: Response) => {
  try {
    const { access_token, refresh_token } = req.body;

    if (!access_token || !refresh_token) {
      res.status(400).json({ error: "access_token y refresh_token son requeridos" });
      return;
    }

    // Validate token with Supabase
    const { data, error } = await supabase.auth.getUser(access_token);
    if (error || !data.user) {
      logger.warn({ error }, "Token inválido en set-session");
      res.status(401).json({ error: "Token inválido" });
      return;
    }

    const isProduction = process.env.NODE_ENV === "production";

    // Set HttpOnly cookies
    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: 60 * 60 * 1000, // 1 hour
      path: "/",
    });

    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    logger.info({ userId: data.user.id }, "Sesión establecida");
    res.json({ ok: true });
  } catch (err) {
    logger.error({ err }, "Error en set-session");
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Obtiene el usuario autenticado actual
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Usuario autenticado
 *       401:
 *         description: No autenticado
 */
app.get("/auth/me", requireAuth, (req: Request, res: Response) => {
  // requireAuth ya validó el token, hizo refresh si fue necesario,
  // y cargó el perfil completo desde public.profiles en req.user
  res.json({ user: req.user });
});

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Cierra la sesión del usuario
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Sesión cerrada correctamente
 */
app.post("/auth/logout", async (req: Request, res: Response) => {
  try {
    const accessToken = req.cookies?.access_token;

    // Invalidar el token en Supabase para prevenir replay attacks
    if (accessToken) {
      const { data: userData } = await supabase.auth.getUser(accessToken);
      if (userData?.user?.id) {
        await supabase.auth.admin.signOut(userData.user.id);
        logger.info({ userId: userData.user.id }, "Sesión invalidada en Supabase");
      }
    }

    res.clearCookie("access_token", { path: "/" });
    res.clearCookie("refresh_token", { path: "/" });
    res.json({ ok: true });
  } catch (err) {
    // Aunque falle la invalidación en Supabase, siempre limpiamos las cookies
    logger.error({ err }, "Error en /auth/logout (cookies limpiadas de todas formas)");
    res.clearCookie("access_token", { path: "/" });
    res.clearCookie("refresh_token", { path: "/" });
    res.json({ ok: true });
  }
});

/**
 * @openapi
 * /:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns a simple message to verify the backend is running
 *     responses:
 *       200:
 *         description: Backend is running correctly
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Backend OK
 */
app.get("/", (_: Request, res: Response) => {
  res.send("Backend OK");
});

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns detailed health information about the backend service
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2026-02-07T19:39:55.000Z
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 *                   example: 3600
 *                 service:
 *                   type: string
 *                   example: marketplace-alumnos-backend
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 memory:
 *                   type: object
 *                   properties:
 *                     rss:
 *                       type: string
 *                       description: Resident Set Size in MB
 *                     heapTotal:
 *                       type: string
 *                       description: Total heap size in MB
 *                     heapUsed:
 *                       type: string
 *                       description: Used heap size in MB
 */
app.get("/health", (_: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();

  const healthInfo = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: "marketplace-alumnos-backend",
    version: "1.0.0",
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
    },
  };

  logger.debug(healthInfo, "Health check solicitado");
  res.json(healthInfo);
});

// Ruta no encontrada (404)
app.use((req: Request, res: Response) => {
  logger.warn({ path: req.originalUrl }, "Ruta no encontrada");
  res.status(404).json({
    error: "Ruta no encontrada",
    path: req.originalUrl,
  });
});

// Manejador de errores del servidor (500)
app.use((err: Error, _: Request, res: Response, __: NextFunction) => {
  logger.error({ err }, "Error interno del servidor");
  res.status(500).json({
    error: "Error interno del servidor",
  });
});


const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  logger.info(`Backend corriendo en el puerto ${PORT}`);
  logger.info(`Swagger UI disponible en http://localhost:${PORT}/api-docs`);
});