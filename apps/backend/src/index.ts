import express, { Request, Response, NextFunction } from "express";
import pinoHttp from "pino-http";
import swaggerUi from "swagger-ui-express";
import { logger } from "./logger";
import { swaggerSpec } from "./swagger";

const app = express();

// Middleware para logging automático de peticiones HTTP
app.use(pinoHttp({ logger }));

app.use(express.json());

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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

