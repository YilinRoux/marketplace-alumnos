"use client";

import { useEffect, useState } from "react";
import styles from "./StepDetails.module.css";



interface Props {
  onNext: () => void;
  onBack: () => void;
}

export default function StepDetails({ onNext, onBack }: Props) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  /*  cargar datos guardados */
  useEffect(() => {
    const saved = localStorage.getItem("publish_details");
    if (saved) {
      const data = JSON.parse(saved);
      setTitle(data.title || "");
      setPrice(data.price || "");
      setDescription(data.description || "");
    }
  }, []);

  /*  guardado automático */
  useEffect(() => {
    localStorage.setItem(
      "publish_details",
      JSON.stringify({ title, price, description })
    );
  }, [title, price, description]);

  /*  Validación */
  const handleNext = () => {
    if (!title.trim()) {
      alert("Debes ingresar un título");
      return;
    }

    if (!price.trim()) {
      alert("El precio es obligatorio");
      return;
    }

    onNext();
  };

  return (
    <div className={styles.card}>
      {/* HEADER */}
      <div className={styles.header}>
        <button onClick={onBack} className={styles.backBtn}>
          ←
        </button>

        <div className={styles.stepTitle}>
          <span className={styles.active}>Paso 2</span>
          <span>Descripción</span>
        </div>
      </div>

      {/* FORM */}
      <div className={styles.form}>
        <label>
          Título del producto
          <input
            type="text"
            placeholder="Ej. Laptop Lenovo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>

        <label>
          Precio
          <input
            type="number"
            placeholder="$"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </label>

        <label>Descripción</label>
            <textarea
            className={styles.textarea}
            placeholder="Describe el producto..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            />

      </div>

      {/* BOTÓN */}
      <button className={styles.nextBtn} onClick={handleNext}>
        Siguiente
      </button>
    </div>
  );
}
