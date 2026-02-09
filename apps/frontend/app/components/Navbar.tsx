"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation">
      <ul>
        <li>
          <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>
            Inicio
          </Link>
        </li>

        <li>
          <Link
            href="/marketplace"
            aria-current={
              pathname.startsWith("/marketplace") ? "page" : undefined
            }
          >
            Marketplace
          </Link>
        </li>

        <li>
          <Link
            href="/auth/login"
            aria-current={
              pathname.startsWith("/auth") ? "page" : undefined
            }
          >
            Login
          </Link>
        </li>
      </ul>
    </nav>
  );
}
