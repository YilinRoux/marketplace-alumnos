"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import styles from "./Navbar.module.css";

interface User {
  name: string;
  email: string;
  avatar?: string;
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);


  const loadUser = () => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();

    window.addEventListener("storage", loadUser);

    return () => {
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    loadUser(); 
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setOpen(false);
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(!open);
    }
  };

  return (
    <header className={styles.navbar}>
      {/* LOGO */}
      <Link href="/marketplace" className={styles.logo}>
        <span>UNI</span>MARKET
      </Link>

      {/* SEARCH */}
      <input className={styles.search} placeholder="Buscar productos..." />

      {/* USER */}
      <div className={styles.userArea} ref={menuRef}>
        {!user ? (
          <Link href="/auth/login" className={styles.loginBtn}>
            Iniciar sesión
          </Link>
        ) : (
          <>
            <button
              className={styles.avatarBtn}
              onClick={() => setOpen(!open)}
              onKeyDown={handleKeyDown}
              aria-haspopup="menu"
              aria-expanded={open}
            >
              <span className={styles.userName}>{user.name}</span>

              <img
                src={user.avatar || "/images/default-user.png"}
                alt="Usuario"
                className={styles.avatar}
                onError={(e) =>
                  ((e.target as HTMLImageElement).src = "/images/user.png")
                }
              />
            </button>

            {open && (
              <div className={styles.dropdown} role="menu">
                <Link href="/perfil" role="menuitem">
                  Perfil
                </Link>
                <Link href="/favoritos" role="menuitem">
                  Favoritos
                </Link>
                <Link href="/mis-publicaciones" role="menuitem">
                  Mis publicaciones
                </Link>

                <button onClick={logout} className={styles.logout}>
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
