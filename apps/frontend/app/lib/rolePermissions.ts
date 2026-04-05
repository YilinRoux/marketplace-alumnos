import { AppRole } from "./AuthContext";

export const ROLE_HIERARCHY: Record<AppRole, number> = {
    user: 1,
    seller: 1, // Negocio: user == seller
    superadmin: 3,
};

export function hasMinimumRole(userRole: AppRole | undefined | null, requiredRole: AppRole): boolean {
    if (!userRole) return false;
    
    // Superadmin bypasses everything
    if (userRole === "superadmin") return true;

    const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
    const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 999;

    return userLevel >= requiredLevel;
}
