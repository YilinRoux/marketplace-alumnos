"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/productos", label: "Productos" },
    { href: "#", label: "Explorar" },
    { href: "#", label: "Vender" },
  ];

  return (
    <nav className={styles.nav} aria-label="Navegación principal">
      {/* LOGO */}
      <div className={styles.logo}>
        <Link href="/">UNIMARKET</Link>
      </div>

      {/* BUSCADOR */}
      <div className={styles.searchContainer}>
        <input
          type="search"
          placeholder="Buscar productos, marcas y más..."
          className={styles.search}
          aria-label="Buscar productos"
        />
      </div>

      {/* MENÚ */}
      <ul className={styles.menu}>
        {navLinks.map((link) => {
          const isActive = pathname === link.href;

          return (
            <li key={link.label}>
              <Link
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={isActive ? styles.active : undefined}
              >
                {link.label}
              </Link>
            </li>
          );
        })}

        {/* BOTÓN LOGIN */}
        <li>
          <Link href="/auth/login" className={styles.loginButton}>
            Iniciar sesión
          </Link>
        </li>
      </ul>
    </nav>
  );
}
