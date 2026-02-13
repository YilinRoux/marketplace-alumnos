import pino from "pino";

// Determinar si estamos en desarrollo o producción
const isDevelopment = process.env.NODE_ENV !== "production";

// Configurar el logger según el entorno
export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
        },
      }
    : undefined, // En producción usa JSON format (por defecto)
});
