"use client";

import { useEffect, useState } from "react";
import styles from "./StepCategory.module.css";

interface Props {
  onBack: () => void;
}

export default function StepCategory({ onBack }: Props) {
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("Usado");

  const categories = [
    "Tecnología",
    "Ropa",
    "Calzado",
    "Accesorios",
    "Libros",
    "Deportes",
    "Hogar",
    "Mochilas",
    "Electrónica",
    "Otros",
  ];

  /* cargar */
  useEffect(() => {
    const saved = localStorage.getItem("publish_category");
    if (saved) {
      const data = JSON.parse(saved);
      setCategory(data.category || "");
      setCondition(data.condition || "Usado");
    }
  }, []);

  /* guardar */
  useEffect(() => {
    localStorage.setItem(
      "publish_category",
      JSON.stringify({ category, condition })
    );
  }, [category, condition]);

  const handlePublish = () => {
    if (!category) {
      alert("Selecciona una categoría");
      return;
    }

    alert("Publicación guardada");
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        {/* HEADER */}
        <div className={styles.header}>
          <button onClick={onBack} className={styles.backBtn}>
            ←
          </button>

          <div>
            <span className={styles.step}>Paso 3</span>
            <h3>Categoría</h3>
          </div>
        </div>

        <p className={styles.label}>¿Dónde encaja?</p>

        {/* GRID */}
        <div className={styles.categoriesGrid}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`${styles.categoryBtn} ${
                category === cat ? styles.active : ""
              }`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* SELECT */}
        <label className={styles.label}>
          Estado del producto
          <select
            className={styles.select}
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          >
            <option>Nuevo</option>
            <option>Usado</option>
            <option>Reacondicionado</option>
          </select>
        </label>

        <button className={styles.publishBtn} onClick={handlePublish}>
          Publicar
        </button>
      </div>
    </div>
  );
}
