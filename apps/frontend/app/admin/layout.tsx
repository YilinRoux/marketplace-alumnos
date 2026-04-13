"use client";

import { useAuth } from "../lib/AuthContext";
import RoleGuard from "../components/guards/RoleGuard";
import AdminSidebar from "./components/AdminSidebar";
import styles from "./layout.module.css";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const now = new Date();
  const dateStr = now.toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const greeting =
    now.getHours() < 12
      ? "Buenos días"
      : now.getHours() < 18
        ? "Buenas tardes"
        : "Buenas noches";

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "SA";

  return (
    <div className={styles.adminWrapper}>
      <AdminSidebar />

      <div className={styles.contentArea}>
        {/* Top Header */}
        <header className={styles.topHeader}>
          <div className={styles.headerLeft}>
            <span className={styles.headerGreeting}>
              {greeting}, {user?.name?.split(" ")[0] || "Admin"}
            </span>
            <h1 className={styles.headerTitle}>Panel de Administración</h1>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.headerDate}>{dateStr}</span>
            <div className={styles.headerAvatar} title={user?.name || "Admin"}>
              {initials}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className={styles.mainContent}>{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard minRole="superadmin">
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </RoleGuard>
  );
}
