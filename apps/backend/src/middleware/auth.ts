import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import { logger } from "../logger";

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type AppRole = "user" | "seller" | "superadmin";

const ROLE_HIERARCHY: Record<AppRole, number> = {
    user: 1,
    seller: 2,
    superadmin: 3,
};

export interface AuthenticatedUser {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
    role: AppRole;
    phone: string | null;
}

// Augmentar el tipo Request de Express
declare global {
    namespace Express {
        interface Request {
            user?: AuthenticatedUser;
        }
    }
}

/**
 * Middleware: verifica el access_token de la cookie.
 * Si está expirado, intenta renovarlo con el refresh_token.
 * Si el refresh es exitoso, re-setea las cookies y continúa.
 * Si falla → 401.
 */
export async function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const accessToken = req.cookies?.access_token;
    const refreshToken = req.cookies?.refresh_token;

    if (!accessToken) {
        res.status(401).json({ error: "No autenticado" });
        return;
    }

    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: (isProduction ? "strict" : "lax") as "strict" | "lax",
        path: "/",
    };

    // Intentar validar el access_token actual
    const { data: userData, error: userError } =
        await supabase.auth.getUser(accessToken);

    let supabaseUserId: string;

    if (userError || !userData.user) {
        // Token inválido o expirado — intentar refresh
        if (!refreshToken) {
            logger.warn("Token expirado y sin refresh_token");
            res.status(401).json({ error: "Sesión expirada" });
            return;
        }

        const { data: refreshData, error: refreshError } =
            await supabase.auth.refreshSession({ refresh_token: refreshToken });

        if (refreshError || !refreshData.session) {
            logger.warn({ refreshError }, "Refresh token inválido");
            res.clearCookie("access_token", { path: "/" });
            res.clearCookie("refresh_token", { path: "/" });
            res.status(401).json({ error: "Sesión expirada, inicia sesión nuevamente" });
            return;
        }

        // Refresh exitoso — re-setear cookies
        res.cookie("access_token", refreshData.session.access_token, {
            ...cookieOptions,
            maxAge: 60 * 60 * 1000, // 1 hora
        });
        res.cookie("refresh_token", refreshData.session.refresh_token, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
        });

        supabaseUserId = refreshData.session.user.id;
        logger.info({ userId: supabaseUserId }, "Sesión renovada transparentemente");
    } else {
        supabaseUserId = userData.user.id;
    }

    // Consultar public.profiles para obtener rol y datos del perfil
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, email, role, phone")
        .eq("id", supabaseUserId)
        .single();

    if (profileError || !profile) {
        logger.error({ profileError, supabaseUserId }, "Perfil no encontrado");
        res.status(401).json({ error: "Perfil de usuario no encontrado" });
        return;
    }

    req.user = {
        id: supabaseUserId,
        email: profile.email,
        name: profile.full_name || "",
        avatar: profile.avatar_url || null,
        role: profile.role as AppRole,
        phone: profile.phone || null,
    };

    next();
}

/**
 * Middleware: verifica que el usuario autenticado tenga el rol mínimo requerido.
 * Debe usarse DESPUÉS de requireAuth.
 */
export function requireRole(minRole: AppRole) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: "No autenticado" });
            return;
        }

        const userLevel = ROLE_HIERARCHY[req.user.role] ?? 0;
        const requiredLevel = ROLE_HIERARCHY[minRole] ?? 999;

        if (userLevel < requiredLevel) {
            logger.warn(
                { userId: req.user.id, role: req.user.role, required: minRole },
                "Acceso denegado por rol insuficiente"
            );
            res.status(403).json({ error: "Acceso denegado: rol insuficiente" });
            return;
        }

        next();
    };
}
