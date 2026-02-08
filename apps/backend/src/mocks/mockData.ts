import { Response } from "express";

/**
 * Simula un delay (latencia de red)
 * @param ms - Milisegundos de delay
 */
export const delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Envía una respuesta con delay simulado
 */
export const sendDelayedResponse = async <T>(
    res: Response,
    data: T,
    delayMs: number,
    statusCode: number = 200
): Promise<void> => {
    await delay(delayMs);
    res.status(statusCode).json(data);
};

// Mock Data: Usuarios
export const mockUsers = [
    {
        id: 1,
        name: "Juan Pérez",
        email: "juan.perez@example.com",
        role: "student",
        createdAt: "2026-01-15T10:30:00Z",
    },
    {
        id: 2,
        name: "María García",
        email: "maria.garcia@example.com",
        role: "student",
        createdAt: "2026-01-20T14:15:00Z",
    },
    {
        id: 3,
        name: "Carlos López",
        email: "carlos.lopez@example.com",
        role: "admin",
        createdAt: "2026-01-10T09:00:00Z",
    },
    {
        id: 4,
        name: "Ana Martínez",
        email: "ana.martinez@example.com",
        role: "student",
        createdAt: "2026-01-25T16:45:00Z",
    },
];

// Mock Data: Productos
export const mockProducts = [
    {
        id: 1,
        name: "Laptop Dell XPS 13",
        description: "Laptop ultradelgada de 13 pulgadas",
        price: 1299.99,
        category: "electronics",
        stock: 15,
        sellerId: 3,
    },
    {
        id: 2,
        name: "Libro: Clean Code",
        description: "Guía para escribir código limpio y mantenible",
        price: 45.99,
        category: "books",
        stock: 50,
        sellerId: 1,
    },
    {
        id: 3,
        name: "Mochila para Laptop",
        description: "Mochila resistente con compartimento para laptop",
        price: 59.99,
        category: "accessories",
        stock: 30,
        sellerId: 2,
    },
    {
        id: 4,
        name: "Audífonos Bluetooth",
        description: "Audífonos inalámbricos con cancelación de ruido",
        price: 199.99,
        category: "electronics",
        stock: 20,
        sellerId: 3,
    },
    {
        id: 5,
        name: "Calculadora Científica",
        description: "Calculadora programable para ingeniería",
        price: 89.99,
        category: "supplies",
        stock: 40,
        sellerId: 2,
    },
];

// Mensajes de error mock
export const errorMessages = {
    400: {
        error: "Bad Request",
        message: "La solicitud no pudo ser procesada debido a datos inválidos",
        details: "Verifique que todos los campos requeridos estén presentes y sean válidos",
    },
    401: {
        error: "Unauthorized",
        message: "No ha proporcionado credenciales válidas",
        details: "Por favor, inicie sesión para acceder a este recurso",
    },
    403: {
        error: "Forbidden",
        message: "No tiene permisos para acceder a este recurso",
        details: "Su rol de usuario no permite realizar esta acción",
    },
    404: {
        error: "Not Found",
        message: "El recurso solicitado no existe",
        details: "Verifique que la URL y el ID del recurso sean correctos",
    },
    500: {
        error: "Internal Server Error",
        message: "Ha ocurrido un error inesperado en el servidor",
        details: "El equipo técnico ha sido notificado del problema",
    },
    503: {
        error: "Service Unavailable",
        message: "El servicio no está disponible temporalmente",
        details: "Por favor, intente de nuevo en unos momentos",
    },
};
