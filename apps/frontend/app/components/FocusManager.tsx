"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useToast } from "./ToastProvider";
import styles from "./FocusManager.module.css";

export default function FocusManager({
  children,
}: {
  children: React.ReactNode;
}) {
  const mainRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { showToast } = useToast();

  useEffect(() => {
    mainRef.current?.focus();
    // Mostrar toast de página cargada
    showToast(`Página cargada`, "success");
  }, [pathname, showToast]);

  return (
    <div
      ref={mainRef}
      tabIndex={-1}
      className={styles.focusContainer}
    >
      {children}
    </div>
  );
}

