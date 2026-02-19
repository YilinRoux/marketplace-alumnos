"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "./marketplace.module.css";
import { useRequireAuth } from "../hooks/useRequireAuth";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  title: string;
  price: number;
  condition: string | null;
  created_at: string;
  category: { name: string; slug: string } | null;
  seller: { id: string; full_name: string | null } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";
const LIMIT = 20;

// ─── Component ────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const { isLoading: authLoading } = useRequireAuth();

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);

  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [message, setMessage] = useState("");

  // ── Fetch categories once on mount ────────────────────────────────────────
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/categories`, { credentials: "include" })
      .then((r) => r.json())
      .then((data: Category[]) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  // ── Fetch products on filter/page change ──────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (category) params.set("category", category);
    if (condition) params.set("condition", condition);
    if (priceRange[0] > 0) params.set("minPrice", String(priceRange[0]));
    if (priceRange[1] < 2000) params.set("maxPrice", String(priceRange[1]));
    params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", String(LIMIT));

    try {
      const res = await fetch(`${BACKEND_URL}/api/products?${params.toString()}`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const json = await res.json();
      setProducts(json.data ?? []);
      setPagination(json.pagination ?? null);
    } catch {
      setError("No se pudieron cargar los productos. Intenta de nuevo.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, condition, priceRange, sort, page]);

  useEffect(() => {
    if (!authLoading) fetchProducts();
  }, [authLoading, fetchProducts]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2000);
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setCondition("");
    setPriceRange([0, 2000]);
    setSort("recent");
    setPage(1);
    showMessage("Filtros limpiados");
  };

  // ── Auth loading guard ────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <p style={{ color: "#6b7280", fontSize: "16px" }}>Verificando sesión...</p>
      </div>
    );
  }

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 1;

  return (
    <div className={styles.container}>
      {/* Toast */}
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
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className={styles.search}
            />
          </div>

          {/* CATEGORÍAS (dinámicas) */}
          <div className={styles.filterSection}>
            <p className={styles.filterTitle}>Categoría</p>
            <ul>
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  onClick={() => { setCategory(cat.slug === category ? "" : cat.slug); setPage(1); }}
                  style={{ fontWeight: cat.slug === category ? 700 : 400, cursor: "pointer" }}
                >
                  {cat.name}
                </li>
              ))}
              {categories.length === 0 && (
                <li style={{ color: "#9ca3af", fontSize: "0.85rem" }}>Cargando...</li>
              )}
            </ul>
          </div>

          {/* ESTADO */}
          <div className={styles.filterSection}>
            <p className={styles.filterTitle}>Estado</p>
            <ul>
              {["Nuevo", "Usado", "Reacondicionado"].map((c) => (
                <li
                  key={c}
                  onClick={() => { setCondition(condition === c ? "" : c); setPage(1); }}
                  style={{ fontWeight: condition === c ? 700 : 400, cursor: "pointer" }}
                >
                  {c}
                </li>
              ))}
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
              onChange={(e) => { setPriceRange([0, Number(e.target.value)]); setPage(1); }}
            />
            <p>${priceRange[0]} - ${priceRange[1]}</p>
          </div>

          {/* ORDENAMIENTO */}
          <div className={styles.filterSection}>
            <p className={styles.filterTitle}>Ordenar por</p>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className={styles.search}
            >
              <option value="recent">Más recientes</option>
              <option value="price_asc">Precio: menor a mayor</option>
              <option value="price_desc">Precio: mayor a menor</option>
            </select>
          </div>

          <button className={styles.clearBtn} onClick={clearFilters}>
            Limpiar filtros
          </button>
        </aside>

        {/* GRID */}
        <main className={styles.grid}>
          {/* Estado de carga / error */}
          {loading && <p>Cargando productos...</p>}
          {!loading && error && <p style={{ color: "red" }}>{error}</p>}

          {!loading && !error && products.length === 0 && (
            <p>No hay productos que coincidan con los filtros.</p>
          )}

          {!loading && !error && products.map((product) => (
            <div key={product.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                <img src="/placeholder.jpg" alt={product.title} />
              </div>

              <div className={styles.cardBody}>
                <div className={styles.categoryRow}>
                  <span className={styles.category}>
                    {product.category?.name ?? "Sin categoría"}
                  </span>
                </div>

                <h4 className={styles.title}>{product.title}</h4>

                <div className={styles.descriptionRow}>
                  <p className={styles.description} style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                    Vendedor: {product.seller?.full_name ?? "—"}
                  </p>
                </div>

                <p className={styles.price}>${product.price.toFixed(2)}</p>

                <button className={styles.contactBtn}>
                  Ver producto
                </button>
              </div>
            </div>
          ))}

          {/* Paginación */}
          {!loading && pagination && totalPages > 1 && (
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "8px", marginTop: "16px", justifyContent: "center" }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={styles.clearBtn}
              >
                ← Anterior
              </button>
              <span style={{ alignSelf: "center", fontSize: "0.9rem" }}>
                Página {page} de {totalPages} ({pagination.total} productos)
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={styles.clearBtn}
              >
                Siguiente →
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
