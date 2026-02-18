"use client";

import { useEffect, useState } from "react";
import styles from "../marketplace.module.css";


interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  verified: boolean;
  image: string;
}

const PRODUCTS: Product[] = [
  {
    id: 1,
    title: "",
    category: "",
    price: 0,
    verified: true,
    image: "/placeholder.jpg",
  },
  {
    id: 2,
    title: "",
    category: "",
    price: 0,
    verified: true,
    image: "/placeholder.jpg",
  },
  {
    id: 3,
    title: "",
    category: "",
    price: 0,
    verified: true,
    image: "/placeholder.jpg",
  },
  {
    id: 4,
    title: "",
    category: "",
    price: 0,
    verified: true,
    image: "/placeholder.jpg",
  },
];

export default function MarketplacePage() {
  const [userName, setUserName] = useState("");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUserName(parsed.name);
    }
  }, []);

  const toggleFavorite = (id: number) => {
    const isFav = favorites.includes(id);

    if (isFav) {
      setFavorites(favorites.filter((f) => f !== id));
      setMessage("Eliminado de favoritos");
    } else {
      setFavorites([...favorites, id]);
      setMessage("Agregado a favoritos ❤️");
    }

    setTimeout(() => setMessage(""), 2000);
  };

  return (
    <div className={styles.container}>
      {/* Mensaje accesible */}
      {message && (
        <div aria-live="polite" className={styles.toast}>
          {message}
        </div>
      )}

      <div className={styles.content}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>Filtros</h3>

          <div className={styles.filterSection}>
            <p className={styles.filterTitle}>Categoría</p>
            <ul>
              <li>Laptops</li>
              <li>Celulares</li>
              <li>Accesorios</li>
            </ul>
          </div>

          <button className={styles.clearBtn}>
            Limpiar Filtros
          </button>
        </aside>

        {/* Grid */}
        <main className={styles.grid}>
          {PRODUCTS.map((product) => {
            const isFavorite = favorites.includes(product.id);

            return (
              <div key={product.id} className={styles.card}>
                <div className={styles.imageWrapper}>
                  <img src={product.image} alt="Producto" />
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.categoryRow}>
                    <span className={styles.category}>
                      {product.category}
                    </span>

                    {product.verified && (
                      <span className={styles.verified}>
                        ✔ Verificado
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    aria-label="Agregar a favoritos"
                    className={`${styles.favoriteBtn} ${
                      isFavorite ? styles.active : ""
                    }`}
                    onClick={() => toggleFavorite(product.id)}
                  >
                    ♥
                  </button>

                  <h4 className={styles.title}>{product.title}</h4>

                  <p className={styles.price}>
                    {product.price ? `$${product.price}` : ""}
                  </p>

                  <button className={styles.contactBtn}>
                    Contactar Vendedor
                  </button>
                </div>
              </div>
            );
          })}
        </main>
      </div>
    </div>
  );
}
