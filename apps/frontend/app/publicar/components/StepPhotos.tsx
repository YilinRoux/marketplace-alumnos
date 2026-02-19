"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./StepPhotos.module.css";

interface Props {
  onNext: () => void;
}

export default function StepPhotos({ onNext }: Props) {
  const [photos, setPhotos] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  /* cargar progreso ligero */
  useEffect(() => {
    const saved = localStorage.getItem("publish_photos_meta");
    if (saved) {
      setPhotos(JSON.parse(saved));
    }
  }, []);

  /* guardar SOLO metadata */
  useEffect(() => {
    localStorage.setItem("publish_photos_meta", JSON.stringify(photos));
  }, [photos]);

  const uploadFiles = (files: FileList) => {
    const newPhotos: string[] = [];

    Array.from(files).forEach((file) => {
      if (photos.length + newPhotos.length < 4) {
        const url = URL.createObjectURL(file);
        newPhotos.push(url);
      }
    });

    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    uploadFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileRef.current?.click();
  };

  const removePhoto = (index: number) => {
    const updated = [...photos];
    updated.splice(index, 1);
    setPhotos(updated);
  };

  const next = () => {
    if (photos.length < 4) {
      alert("Te faltan fotos por agregar");
      return;
    }
    onNext();
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        {/* HEADER */}
        <div className={styles.header}>
          <button className={styles.backBtn}>←</button>
          <div>
            <span className={styles.step}>Paso 1</span>
            <span className={styles.title}>Fotos</span>
          </div>
        </div>

        {/* DROP ZONE */}
        <div
          className={styles.dropZone}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          {photos.length === 0 ? (
            <>
              <img
                src="/images/anadir-imagen.png"
                alt="Agregar fotos"
                className={styles.icon}
              />
              <p>Arrastra tus fotos aquí "4 fotos" o haz clic para agregar</p>
            </>
          ) : (
            <div className={styles.previewGrid}>
              {photos.map((photo, i) => (
                <div key={i} className={styles.preview}>
                  <img src={photo} alt="preview" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhoto(i);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className={styles.nextBtn} onClick={next}>
          Siguiente
        </button>

        <input
          ref={fileRef}
          type="file"
          hidden
          multiple
          accept="image/*"
          onChange={(e) => {
            if (e.target.files) uploadFiles(e.target.files);
          }}
        />
      </div>
    </div>
  );
}
