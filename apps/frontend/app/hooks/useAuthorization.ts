"use client";

import { useAuth, AppRole, AuthStatus } from "../lib/AuthContext";
import { hasMinimumRole } from "../lib/rolePermissions";

interface AuthorizationResult {
    status: AuthStatus;
    isAuthenticated: boolean;
    isSuperAdmin: boolean;
    hasRole: (requiredRole: AppRole) => boolean;
}

export function useAuthorization(): AuthorizationResult {
    const { status, user } = useAuth();
    
    const isAuthenticated = status === "authenticated" && user !== null;
    const isSuperAdmin = user?.role === "superadmin";

    const hasRole = (requiredRole: AppRole) => {
        if (!isAuthenticated || !user) return false;
        return hasMinimumRole(user.role, requiredRole);
    };

    return {
        status,
        isAuthenticated,
        isSuperAdmin,
        hasRole,
    };
}
