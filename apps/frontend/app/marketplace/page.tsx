"use client";

import { useEffect, useState } from "react";
import styles from "./marketplace.module.css";

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
    title: "Producto de ejemplo",
    category: "Tecnología",
    price: 850,
    verified: true,
    image: "/placeholder.jpg",
  },
  {
    id: 2,
    title: "Producto de ejemplo",
    category: "Tecnología",
    price: 850,
    verified: true,
    image: "/placeholder.jpg",
  },
  {
    id: 3,
    title: "Producto de ejemplo",
    category: "Tecnología",
    price: 850,
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
  console.log("Click favorito:", id);

  if (favorites.includes(id)) {
    setFavorites(favorites.filter((fav) => fav !== id));
    showMessage("Eliminado de favoritos");
  } else {
    setFavorites([...favorites, id]);
    showMessage("Agregado a favoritos");
  }
};


  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => {
      setMessage("");
    }, 2000);
  };

  return (
    <div className={styles.container}>
      
      {message && <div className={styles.toast}>{message}</div>}

      <header className={styles.header}>
        <div className={styles.logo}>
          <span>UNI</span>MARKET
        </div>

        <input
          className={styles.search}
          placeholder="Buscar productos..."
        />

        <div className={styles.user}>
          {userName && <span> Bienvenido {userName}</span>}
        </div>
      </header>

      <div className={styles.content}>
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

        <main className={styles.grid}>
          {PRODUCTS.map((product) => {
            const isFavorite = favorites.includes(product.id);

            return (
              <div key={product.id} className={styles.card}>
                <div className={styles.imageWrapper}>
                  <img src={product.image} alt={product.title} />
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

                  <p className={styles.price}>${product.price}</p>

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
