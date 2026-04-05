"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthorization } from "../../hooks/useAuthorization";
import { AppRole } from "../../lib/AuthContext";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles?: AppRole[];
    minRole?: AppRole;
}

export default function RoleGuard({ children, allowedRoles, minRole }: RoleGuardProps) {
    const { status, isAuthenticated, isSuperAdmin, hasRole } = useAuthorization();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;

        if (!isAuthenticated) {
            router.replace("/auth/login");
            return;
        }

        if (isSuperAdmin) return;

        let hasAccess = false;
        
        if (minRole) {
            hasAccess = hasRole(minRole);
        } else if (allowedRoles && allowedRoles.length > 0) {
            hasAccess = allowedRoles.some(r => hasRole(r));
        } else {
            hasAccess = true;
        }

        if (!hasAccess) {
            router.replace("/access-denied");
        }
    }, [status, isAuthenticated, isSuperAdmin, hasRole, minRole, allowedRoles, router]);

    if (status === "loading") {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        ); 
    }

    if (!isAuthenticated) return null;

    let hasAccess = isSuperAdmin;
    if (!hasAccess && status === "authenticated") {
        if (minRole) {
            hasAccess = hasRole(minRole);
        } else if (allowedRoles && allowedRoles.length > 0) {
            hasAccess = allowedRoles.some(r => hasRole(r));
        } else {
            hasAccess = true;
        }
    }

    if (!hasAccess) return null;

    return <>{children}</>;
}
