"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, Zap, Info } from "lucide-react";
import styles from "./ConfirmDialog.module.css";

type DialogVariant = "danger" | "warning" | "info";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: DialogVariant;
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANT_ICONS: Record<DialogVariant, React.ReactNode> = {
  danger: <AlertTriangle size={22} />,
  warning: <Zap size={22} />,
  info: <Info size={22} />,
};

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onCancel]);

  // Trap focus
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  const variantClass =
    variant === "danger"
      ? styles.btnDanger
      : variant === "warning"
        ? styles.btnWarning
        : styles.btnInfo;

  const iconClass =
    variant === "danger"
      ? styles.iconDanger
      : variant === "warning"
        ? styles.iconWarning
        : styles.iconInfo;

  return (
    <div className={styles.overlay} onClick={onCancel} role="dialog" aria-modal="true">
      <div
        className={styles.dialog}
        ref={dialogRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`${styles.iconWrapper} ${iconClass}`}>
          {VARIANT_ICONS[variant]}
        </div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.btnCancel} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className={`${styles.btnConfirm} ${variantClass}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
