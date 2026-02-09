"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav aria-label="Breadcrumb">
      <ol style={{ display: "flex", gap: "0.5rem" }}>
        <li>
          <Link href="/">Inicio</Link>
        </li>

        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/");
          return (
            <li key={href}>
              {" / "}
              <Link href={href}>{segment}</Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
