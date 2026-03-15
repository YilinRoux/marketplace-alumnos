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

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(pinoHttp({ logger }));
app.use(express.json());
app.use(cookieParser());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/mock", mockRoutes);

// ─── Marketplace routes ───────────────────────────────────────
app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);

// ─── Auth routes ─────────────────────────────────────────────

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login con email y contraseña
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, format: email }
 *               password: { type: string, format: password }
 *     responses:
 *       200: { description: Login exitoso }
 *       400: { description: Faltan campos requeridos }
 *       401: { description: Credenciales inválidas }
 *       500: { description: Error interno del servidor }
 */
app.post("/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "email y password son requeridos" });
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session) {
      logger.warn({ email }, "Login fallido: credenciales inválidas");
      res.status(401).json({ error: "Credenciales inválidas" });
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, email, role, avatar_url")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      logger.error({ profileError, userId: data.user.id }, "Perfil no encontrado tras login");
      res.status(500).json({ error: "Error al obtener perfil de usuario" });
      return;
    }

    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? "strict" : "lax") as "strict" | "lax",
      path: "/",
    };

    res.cookie("access_token", data.session.access_token, {
      ...cookieOptions,
      maxAge: 60 * 60 * 1000, // 1 hora
    });
    res.cookie("refresh_token", data.session.refresh_token, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    logger.info({ userId: data.user.id, role: profile.role }, "Login exitoso");

    res.json({
      ok: true,
      user: {
        id: data.user.id,
        email: profile.email,
        name: profile.full_name,
        role: profile.role,
        avatar: profile.avatar_url || null,
      },
    });
  } catch (err) {
    logger.error({ err }, "Error en /auth/login");
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

/**
 * @openapi
 * /auth/set-session:
 *   post:
 *     summary: Establece la sesión del usuario con cookies HttpOnly
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [access_token, refresh_token]
 *             properties:
 *               access_token:  { type: string }
 *               refresh_token: { type: string }
 *     responses:
 *       200: { description: Sesión establecida correctamente }
 *       401: { description: Token inválido }
 *       500: { description: Error interno del servidor }
 */
app.post("/auth/set-session", async (req: Request, res: Response) => {
  try {
    const { access_token, refresh_token } = req.body;

    if (!access_token || !refresh_token) {
      res.status(400).json({ error: "access_token y refresh_token son requeridos" });
      return;
    }

    const { data, error } = await supabase.auth.getUser(access_token);
    if (error || !data.user) {
      logger.warn({ error }, "Token inválido en set-session");
      res.status(401).json({ error: "Token inválido" });
      return;
    }

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("access_token", access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: 60 * 60 * 1000,
      path: "/",
    });
    res.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "strict" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
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
 *       200: { description: Usuario autenticado }
 *       401: { description: No autenticado }
 */
app.get("/auth/me", requireAuth, (req: Request, res: Response) => {
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
 *       200: { description: Sesión cerrada correctamente }
 */
app.post("/auth/logout", async (req: Request, res: Response) => {
  try {
    const accessToken = req.cookies?.access_token;

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
    logger.error({ err }, "Error en /auth/logout (cookies limpiadas de todas formas)");
    res.clearCookie("access_token", { path: "/" });
    res.clearCookie("refresh_token", { path: "/" });
    res.json({ ok: true });
  }
});

/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     summary: Envía email de recuperación de contraseña
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200: { description: Email enviado (siempre responde OK por seguridad) }
 *       400: { description: Email requerido }
 *       500: { description: Error interno del servidor }
 */
app.post("/auth/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: "El email es requerido" });
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
    });

    if (error) {
      logger.warn({ error }, "Error en forgot-password");
    }

    logger.info({ email }, "Solicitud de recuperación de contraseña");
    res.json({ ok: true, message: "Si el email existe, recibirás un enlace de recuperación" });
  } catch (err) {
    logger.error({ err }, "Error en /auth/forgot-password");
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ─── Health / utilidad ────────────────────────────────────────

app.get("/", (_: Request, res: Response) => {
  res.send("Backend OK");
});

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

// ─── Error handlers ───────────────────────────────────────────

app.use((req: Request, res: Response) => {
  logger.warn({ path: req.originalUrl }, "Ruta no encontrada");
  res.status(404).json({
    error: "Ruta no encontrada",
    path: req.originalUrl,
  });
});

app.use((err: Error, _: Request, res: Response, __: NextFunction) => {
  logger.error({ err }, "Error interno del servidor");
  res.status(500).json({
    error: "Error interno del servidor",
  });
});

// ─── Export y arranque ────────────────────────────────────────
export default app;

if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    logger.info(`Backend corriendo en el puerto ${PORT}`);
    logger.info(`Swagger UI disponible en http://localhost:${PORT}/api-docs`);
  });
}