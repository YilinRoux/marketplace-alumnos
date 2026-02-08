import swaggerJsdoc from "swagger-jsdoc";
import { Options } from "swagger-jsdoc";

const options: Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Marketplace Alumnos API",
            version: "1.0.0",
            description: "API documentation for Marketplace Alumnos backend",
            contact: {
                name: "API Support",
            },
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 4000}`,
                description: "Development server",
            },
        ],
    },
    // Rutas donde se buscarán los comentarios JSDoc
    apis: ["./src/**/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
