"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function FocusManager({
  children,
}: {
  children: React.ReactNode;
}) {
  const mainRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    mainRef.current?.focus();
  }, [pathname]);

  return (
    <div
      ref={mainRef}
      tabIndex={-1}
      style={{ outline: "none" }}
    >
      {children}
    </div>
  );
}
