"use client";

import { usePathname } from "next/navigation";
import Breadcrumbs from "./Breadcrumbs";

export default function ConditionalBreadcrumbs() {
  const pathname = usePathname();

  const hiddenRoutes = ["/", "/auth/login", "/auth/register"];

  if (hiddenRoutes.includes(pathname)) return null;

  return <Breadcrumbs />;
}