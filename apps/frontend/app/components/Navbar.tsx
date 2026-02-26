"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/AuthContext";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { status, user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // FIX Bug 3: event listener dentro de useEffect (no en el render body)
  // para evitar memory leaks y registros duplicados en cada render.
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

  return (
    <header className={styles.navbar}>
      {/* LOGO */}
      <Link href="/" className={styles.logo}>
        <span>UNI</span>MARKET
      </Link>

      {/* SEARCH */}
      <input className={styles.search} placeholder="Buscar productos..." />

      {/* USER AREA */}
      <div className={styles.userArea} ref={menuRef}>

        {/* Estado: loading → skeleton */}
        {status === "loading" && (
          <div className={styles.skeletonAvatar} aria-hidden="true" />
        )}

        {/* Estado: no autenticado */}
        {status === "unauthenticated" && (
          <Link href="/auth/login" className={styles.loginBtn}>
            Iniciar sesión
          </Link>
        )}

        {/* Estado: autenticado */}
        {status === "authenticated" && user && (
          <>
            {/* Botón Vender */}
            <Link href="/marketplace/create" className={styles.sellBtn}>
              + Vender
            </Link>

            {/* Avatar + dropdown */}
            <button
              className={styles.avatarBtn}
              onClick={() => setOpen(!open)}
              onKeyDown={handleKeyDown}
              aria-haspopup="menu"
              aria-expanded={open}
              aria-label={`Menú de ${user.name}`}
            >
              <span className={styles.userName}>{user.name}</span>
              <img
                src={user.avatar || "/images/default-user.png"}
                alt={user.name}
                className={styles.avatar}
                onError={(e) =>
                  ((e.target as HTMLImageElement).src = "/images/user.png")
                }
              />
            </button>

            {open && (
              <div className={styles.dropdown} role="menu">
                <Link href="/profile" role="menuitem" onClick={() => setOpen(false)}>
                  Perfil
                </Link>
                <Link href="/marketplace/mis-publicaciones" role="menuitem" onClick={() => setOpen(false)}>
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
    </header>
  );
}
