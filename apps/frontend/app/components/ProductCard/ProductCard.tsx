"use client";

import { useState } from "react";
import { toast } from "sonner";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  categoria: string;
  titulo: string;
  descripcion: string;
  estaVerificado: boolean;
  imagen?: string;
}

export default function ProductCard({ categoria, titulo, descripcion, estaVerificado, imagen }: ProductCardProps) {
  const [leGusta, setLeGusta] = useState(false);

  const handleContactar = () => {
    toast.success(`Iniciando chat por: ${titulo}`);
  };

  const handleFavorito = () => {
    const nuevoEstado = !leGusta;
    setLeGusta(nuevoEstado);
    if (nuevoEstado) {
      toast.info(`Guardado en favoritos: ${titulo}`);
    } else {
      toast.error(`Eliminado de favoritos: ${titulo}`);
    }
  };

  return (
    <div className={styles.cardContainer}>
      {imagen ? (
        <img src={imagen} alt={titulo} className={styles.productImage} />
      ) : (
        <div className={styles.imagePlaceholder} />
      )}

      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.category}>{categoria}</span>
          {estaVerificado && (
            <span className={styles.verified}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Verificado
            </span>
          )}
        </div>

        <h3 className={styles.title}>{titulo}</h3>
        <p className={styles.description}>{descripcion}</p>

        <div className={styles.actions}>
          <button className={styles.contactButton} onClick={handleContactar}>
            Contactar Vendedor
          </button>
          <button
            className={`${styles.heartButton} ${leGusta ? styles.activeHeart : ""}`}
            onClick={handleFavorito}
            aria-label={leGusta ? "Quitar de favoritos" : "Agregar a favoritos"}
          >
            <svg className={styles.heartIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}