export const ROUTES = {
    HOME: "/",
    DASHBOARD: "/dashboard",
    
    // Autenticación (Google OAuth únicamente )
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER: "/auth/register",
      FORGOT_PASSWORD: "/forgot-password",
      RESET_PASSWORD: "/reset-password",
    },
  
    // Módulo de Marketplace
    MARKETPLACE: {
      ROOT: "/marketplace",
      CREATE: "/marketplace/create",
      DETAIL: (id: string) => `/marketplace/${id}`, // Ruta dinámica
    },
  
    // Gestión de Usuario
    PROFILE: {
      ROOT: "/profile",
      EDIT: "/profile/edit",
      SETTINGS: "/dashboard/settings",
    },
  
    // Supervisión (Personal Autorizado )
    ADMIN: "/admin",

    // Páginas de Error
    ERROR: {
      SERVER_ERROR: "/500", // Error interno del servidor
      NOT_FOUND: "/404",    // Página no encontrada
    },
  } as const;
  
  // Tipo para usar en props si fuera necesario
    export type AppRoutes = typeof ROUTES;

// Ejemplo de uso 

/**
 *  import { ROUTES } from '@/lib/routes';
 *  import { useRouter } from 'next/navigation';
 * 
 *  const router = useRouter();
 * 
 *  router.push(ROUTES.AUTH.LOGIN);
 * 
 *  router.push(ROUTES.MARKETPLACE.ROOT);
 * 
 *  router.push(ROUTES.PROFILE.ROOT);
 * 
 * etc... 
 * 
 * */ 