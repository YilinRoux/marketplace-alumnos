"use client";

import { useEffect, useState } from "react";
import styles from "./marketplace.module.css";
import { useRequireAuth } from "../hooks/useRequireAuth";

interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  verified: boolean;
  image: string;
  description: string;
  condition: "Nuevo" | "Usado" | "Reacondicionado";
}

const PRODUCTS: Product[] = [
  {
    id: 1,
    title: "Monitor UltraWide 34”",
    category: "Tecnología",
    price: 850,
    verified: true,
    image: "/placeholder.jpg",
    description: "Resolución 4K, ideal para diseño.",
    condition: "Nuevo",
  },
  {
    id: 2,
    title: "Laptop Lenovo",
    category: "Laptops",
    price: 1200,
    verified: true,
    image: "/placeholder.jpg",
    description: "16GB RAM, SSD 512GB.",
    condition: "Usado",
  },
  {
    id: 3,
    title: "iPhone 13",
    category: "Celulares",
    price: 950,
    verified: true,
    image: "/placeholder.jpg",
    description: "Excelente estado.",
    condition: "Reacondicionado",
  },
];

export default function MarketplacePage() {
  const { isLoading } = useRequireAuth();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [priceRange, setPriceRange] = useState([0, 2000]);

  const [loading, setLoading] = useState(false);

  /* Simulación backend */
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, [search, category, condition, priceRange]);

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <p style={{ color: "#6b7280", fontSize: "16px" }}>Verificando sesión...</p>
      </div>
    );
  }


  const toggleFavorite = (id: number) => {
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
    setTimeout(() => setMessage(""), 2000);
  };

  /* FILTROS */
  const filteredProducts = PRODUCTS.filter((p) => {
    return (
      p.title.toLowerCase().includes(search.toLowerCase()) &&
      (category ? p.category === category : true) &&
      (condition ? p.condition === condition : true) &&
      p.price >= priceRange[0] &&
      p.price <= priceRange[1]
    );
  });

  return (
    <div className={styles.container}>
      {/* Toast accesible */}
      {message && (
        <div className={styles.toast} aria-live="polite">
          {message}
        </div>
      )}

      <div className={styles.content}>
        {/* SIDEBAR */}
        <aside className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>Filtros</h3>

          {/* BUSCADOR */}
          <div className={styles.filterSection}>
            <p className={styles.filterTitle}>Buscar</p>
            <input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.search}
            />
          </div>

          {/* CATEGORÍA */}
          <div className={styles.filterSection}>
            <p className={styles.filterTitle}>Categoría</p>
            <ul>
              <li onClick={() => setCategory("Laptops")}>Laptops</li>
              <li onClick={() => setCategory("Celulares")}>Celulares</li>
              <li onClick={() => setCategory("Tecnología")}>Tecnología</li>
            </ul>
          </div>

          {/* ESTADO */}
          <div className={styles.filterSection}>
            <p className={styles.filterTitle}>Estado</p>
            <ul>
              <li onClick={() => setCondition("Nuevo")}>Nuevo</li>
              <li onClick={() => setCondition("Usado")}>Usado</li>
              <li onClick={() => setCondition("Reacondicionado")}>
                Reacondicionado
              </li>
            </ul>
          </div>

          {/* PRECIO */}
          <div className={styles.filterSection}>
            <p className={styles.filterTitle}>Precio</p>
            <input
              type="range"
              min={0}
              max={2000}
              value={priceRange[1]}
              onChange={(e) =>
                setPriceRange([0, Number(e.target.value)])
              }
            />
            <p>${priceRange[0]} - ${priceRange[1]}</p>
          </div>

          <button
            className={styles.clearBtn}
            onClick={() => {
              setCategory("");
              setCondition("");
              setSearch("");
              setPriceRange([0, 2000]);
            }}
          >
            Limpiar filtros
          </button>
        </aside>

        {/* GRID */}
        <main className={styles.grid}>
          {loading ? (
            <p>Cargando productos...</p>
          ) : filteredProducts.length === 0 ? (
            <p>No hay productos.</p>
          ) : (
            filteredProducts.map((product) => {
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

                      {/* {product.verified && (
                        <span className={styles.verified}>
                          ✔ Verificado
                        </span>
                      )} */}
                    </div>

                    <h4 className={styles.title}>
                      {product.title}
                    </h4>

                    {/* DESCRIPCIÓN + FAVORITO */}
                    <div className={styles.descriptionRow}>
                      <p className={styles.description}>
                        {product.description}
                      </p>

                      {/* <button
                        type="button"
                        aria-label="Agregar a favoritos"
                        className={`${styles.favoriteBtn} ${isFavorite ? styles.active : ""
                          }`}
                        onClick={() => toggleFavorite(product.id)}
                      >
                        <i className="fi fi-bs-heart"></i>
                      </button> */}
                    </div>

                    <p className={styles.price}>${product.price}</p>

                    <button className={styles.contactBtn}>
                      Ver producto
                      {/* redirigir a /marketplace/[id] */}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </main>
      </div>
    </div>

  );
}
