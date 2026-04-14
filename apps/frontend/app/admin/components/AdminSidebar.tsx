"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  Flag,
  ArrowLeft,
  Menu,
  X,
  Shield,
} from "lucide-react";
import styles from "./AdminSidebar.module.css";
import { mockReports } from "../_mock/mockData";

const pendingReports = mockReports.filter((r) => r.status === "pending").length;

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Vista General", icon: <LayoutDashboard size={18} /> },
  { href: "/admin/users", label: "Usuarios", icon: <Users size={18} /> },
  { href: "/admin/products", label: "Publicaciones", icon: <Package size={18} /> },
  {
    href: "/admin/moderation",
    label: "Moderación",
    icon: <Flag size={18} />,
    badge: pendingReports,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className={styles.mobileToggle}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayVisible : ""}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}
        role="navigation"
        aria-label="Navegación administrativa"
      >
        {/* Logo */}
        <div className={styles.logoSection}>
          <Link href="/admin" className={styles.logoLink} onClick={() => setIsOpen(false)}>
            <span className={styles.logoIcon}>
              <Shield size={18} />
            </span>
            <span className={styles.logoText}>
              <span className={styles.logoTitle}>Unimarket</span>
              <span className={styles.logoSubtitle}>Panel Admin</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          <span className={styles.navLabel}>Menú principal</span>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${isActive(item.href) ? styles.navLinkActive : ""}`}
              onClick={() => setIsOpen(false)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
              {item.badge !== undefined && item.badge > 0 && (
                <span className={styles.badge}>{item.badge}</span>
              )}
            </Link>
          ))}
        </nav>

        <hr className={styles.divider} />

        {/* Footer */}
        <div className={styles.footer}>
          <Link href="/marketplace" className={styles.backLink}>
            <span className={styles.navIcon}><ArrowLeft size={16} /></span>
            Volver al Marketplace
          </Link>
        </div>
      </aside>
    </>
  );
}
