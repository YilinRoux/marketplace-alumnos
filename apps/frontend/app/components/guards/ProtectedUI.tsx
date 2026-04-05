"use client";

import { useAuthorization } from "../../hooks/useAuthorization";
import { AppRole } from "../../lib/AuthContext";

interface ProtectedUIProps {
    children: React.ReactNode;
    allowedRoles?: AppRole[];
    minRole?: AppRole;
    requireAuth?: boolean;
}

export default function ProtectedUI({ 
    children, 
    allowedRoles, 
    minRole, 
    requireAuth = true 
}: ProtectedUIProps) {
    const { status, isAuthenticated, isSuperAdmin, hasRole } = useAuthorization();

    if (status === "loading") return null;

    if (requireAuth && !isAuthenticated) return null;

    // Si solo hay que estar logueado y no pasamos roles
    if (requireAuth && !minRole && (!allowedRoles || allowedRoles.length === 0)) {
        return <>{children}</>;
    }

    // Si es superadmin tiene poder bypass
    if (isSuperAdmin) return <>{children}</>;

    let hasAccess = false;
    
    if (minRole) {
        hasAccess = hasRole(minRole);
    } else if (allowedRoles && allowedRoles.length > 0) {
        hasAccess = allowedRoles.some(r => hasRole(r));
    }

    if (!hasAccess) return null;

    return <>{children}</>;
}
