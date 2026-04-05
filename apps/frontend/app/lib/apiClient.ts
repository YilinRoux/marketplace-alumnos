const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

/**
 * Wrapper sobre fetch para centralizar errores HTTP (401 y 403)
 */
export async function apiClient(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = endpoint.startsWith("http") ? endpoint : `${BACKEND_URL}${endpoint}`;
    
    // Por defecto habilitar cookies cross-origin si no se especifica
    options.credentials = options.credentials || "include";

    const response = await fetch(url, options);

    // Si la respuesta es de nuestra API interceptamos globales
    if (response.status === 401) {
        if (typeof window !== "undefined") {
            // Emitimos evento para que AuthContext.tsx decida limpiar sesión y redirigir
            window.dispatchEvent(new CustomEvent("um-unauthorized"));
        }
    } else if (response.status === 403) {
        if (typeof window !== "undefined" && window.location.pathname !== "/access-denied") {
            window.location.href = "/access-denied";
        }
    }

    return response;
}
