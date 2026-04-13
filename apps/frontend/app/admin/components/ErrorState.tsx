"use client";

import { XCircle } from "lucide-react";
import styles from "./EmptyState.module.css";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  message = "Ocurrió un error al cargar los datos",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className={styles.wrapper}>
      <span className={styles.icon}><XCircle size={40} /></span>
      <h3 className={styles.title}>Error</h3>
      <p className={styles.description}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            marginTop: 12,
            padding: "8px 20px",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            background: "#fff",
            color: "#334155",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            width: "auto",
          }}
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
