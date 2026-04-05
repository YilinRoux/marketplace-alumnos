"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../lib/AuthContext";
import { useAuthorization } from "../hooks/useAuthorization";
import ProtectedUI from "./guards/ProtectedUI";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { status, isAuthenticated } = useAuthorization();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(!open);
    }
  };

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.push("/");
  };

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={`${styles.navLink} ${pathname === href ? styles.activeLink : ""}`}
    >
      {label}
    </Link>
  );

  return (
    <header className={styles.navbar}>
      {/* LOGO */}
      <Link href="/" className={styles.logo}>
        <span>UNI</span>MARKET
      </Link>

      {/* SEARCH */}
      <input
        className={styles.search}
        placeholder="Buscar productos marcas y más..."
      />

      {/* NAV LINKS + USER AREA */}
      <div className={styles.rightArea}>

        {/* Links siempre visibles */}
        <nav className={styles.navLinks}>
          {navLink("/", "Inicio")}
          {navLink("/marketplace", "Explorar Tienda")}

          <ProtectedUI>
            {navLink("/marketplace/create", "Vender")}
            {navLink("/profile", "Mis Ventas")}
          </ProtectedUI>

          <ProtectedUI minRole="superadmin">
            {navLink("/admin", "Admin Dashboard")}
          </ProtectedUI>
        </nav>

        {/* USER AREA */}
        <div className={styles.userArea} ref={menuRef}>

          {/* Loading skeleton */}
          {status === "loading" && (
            <div className={styles.skeletonAvatar} aria-hidden="true" />
          )}

          {/* No autenticado */}
          {status === "unauthenticated" && (
            <Link href="/auth/login" className={styles.loginBtn}>
              Iniciar sesión
            </Link>
          )}

          {/* Autenticado */}
          {isAuthenticated && user && (
            <>
              <button
                className={styles.avatarBtn}
                onClick={() => setOpen(!open)}
                onKeyDown={handleKeyDown}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={`Menú de ${user.name}`}
              >
                <span className={styles.userName}>
                  Hola, {user.name.split(" ")[0]}
                </span>
                <span className={styles.chevron}>▼</span>
                <img
                  src={user.avatar || "/images/default-user.png"}
                  alt={user.name}
                  className={styles.avatar}
                  onError={(e) =>
                    ((e.target as HTMLImageElement).src = "/images/default-user.png")
                  }
                />
              </button>

              {open && (
                <div className={styles.dropdown} role="menu">
                  <Link href="/profile" role="menuitem" onClick={() => setOpen(false)}>
                    Mi Perfil
                  </Link>
                  <Link href="/profile" role="menuitem" onClick={() => setOpen(false)}>
                    Mis publicaciones
                  </Link>
                  <hr className={styles.divider} />
                  <button onClick={handleLogout} className={styles.logout} role="menuitem">
                    Cerrar sesión
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}