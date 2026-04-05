"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { apiClient } from "../lib/apiClient";
import styles from "./marketplace.module.css";
import ProductCard from "../components/ProductCard/ProductCard";
import SkeletonCard from "../components/SkeletonCard/SkeletonCard";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface DemoProduct {
  id: string;
  categoria: string;
  titulo: string;
  descripcion: string;
  precio: string;
  estaVerificado: boolean;
  imagen: string;
  vendedorEmail: string;
}

interface BackendProduct {
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
const DEMO_PRODUCTS_KEY = "um_demo_products";

function loadDemoProducts(): DemoProduct[] {
  try {
    const raw = sessionStorage.getItem(DEMO_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const [search, setSearch]               = useState("");
  const [category, setCategory]           = useState("");
  const [precioMaximo, setPrecioMaximo]   = useState(2000);
  const [precioInput, setPrecioInput]     = useState(2000); // valor visual del slider
  const [sort, setSort]                   = useState("recent");
  const [page, setPage]                   = useState(1);

  const [products, setProducts]           = useState<BackendProduct[]>([]);
  const [demoProducts, setDemoProducts]   = useState<DemoProduct[]>([]);
  const [categories, setCategories]       = useState<Category[]>([]);
  const [pagination, setPagination]       = useState<Pagination | null>(null);
  const [loading, setLoading]             = useState(true);

  // ── Debounce del slider de precio ──────────────────────────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePrecioChange = (value: number) => {
    setPrecioInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPrecioMaximo(value);
      setPage(1);
    }, 400);
  };

  // ── Cargar productos demo desde sessionStorage ──────────────────────────────
  // Se ejecuta al montar Y cada vez que se dispara el evento
  const refreshDemos = useCallback(() => {
    setDemoProducts(loadDemoProducts());
  }, []);

  useEffect(() => {
    refreshDemos(); // carga inicial (cubre el caso de navegación desde /create)

    window.addEventListener("demo-products-updated", refreshDemos);
    return () => window.removeEventListener("demo-products-updated", refreshDemos);
  }, [refreshDemos]);

  // ── Fetch categorías ────────────────────────────────────────────────────────
  useEffect(() => {
    apiClient("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        const list: Category[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.categories)
          ? data.categories
          : [];
        setCategories(list);
      })
      .catch(() => setCategories([]));
  }, []);

  // ── Fetch productos del backend ─────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (category)      params.set("category", category);
    if (precioMaximo < 2000) params.set("maxPrice", String(precioMaximo));
    params.set("sort",  sort);
    params.set("page",  String(page));
    params.set("limit", String(LIMIT));

    try {
      const res = await apiClient(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setProducts(Array.isArray(json.data) ? json.data : []);
      setPagination(json.pagination ?? null);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, precioMaximo, sort, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const limpiarFiltros = () => {
    setSearch(""); setCategory(""); setPrecioMaximo(2000);
    setPrecioInput(2000); setSort("recent"); setPage(1);
  };

  // ── Filtrar demos ───────────────────────────────────────────────────────────
  const filteredDemos = demoProducts.filter((p) => {
    const matchSearch = !search   || p.titulo.toLowerCase().includes(search.toLowerCase());
    const matchCat    = !category || p.categoria.toLowerCase() === category.toLowerCase();
    const matchPrice  = Number(p.precio) <= precioMaximo;
    return matchSearch && matchCat && matchPrice;
  });

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 1;

  return (
    <div className={styles.storeContainer}>
      <div className={styles.breadcrumbs}>
        Inicio {">"} <span>Explorar Tienda</span>
      </div>

      <div className={styles.mainLayout}>
        {/* SIDEBAR */}
        <aside className={styles.sidebar}>
          <h2>Filtros</h2>

          <div className={styles.filterSection}>
            <h3>Buscar</h3>
            <input
              type="text"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterSection}>
            <h3>Categoría</h3>
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`${styles.filterRow} ${cat.slug === category ? styles.activeFilter : ""}`}
                onClick={() => { setCategory(cat.slug === category ? "" : cat.slug); setPage(1); }}
              >
                <span>{cat.name}</span>
              </div>
            ))}
            {categories.length === 0 && (
              <p style={{ fontSize: "0.85rem", color: "#9ca3af" }}>Sin categorías</p>
            )}
          </div>

          <div className={styles.filterSection}>
            <h3>Precio: Hasta ${precioInput}</h3>
            <input
              type="range" min={0} max={2000} value={precioInput}
              onChange={(e) => handlePrecioChange(Number(e.target.value))}
              style={{ width: "100%", cursor: "pointer" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#64748B", marginTop: "5px" }}>
              <span>$0</span><span>$2000</span>
            </div>
          </div>

          <div className={styles.filterSection}>
            <h3>Ordenar por</h3>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className={styles.searchInput}
            >
              <option value="recent">Más recientes</option>
              <option value="price_asc">Precio: menor a mayor</option>
              <option value="price_desc">Precio: mayor a menor</option>
            </select>
          </div>

          <button className={styles.btnClearFilters} onClick={limpiarFiltros}>
            Limpiar Filtros
          </button>
        </aside>

        {/* GRID */}
        <main className={styles.productGrid}>
          {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}

          {/* Productos demo (sessionStorage) — siempre al inicio */}
          {!loading && filteredDemos.map((p) => (
            <ProductCard
              key={p.id}
              categoria={p.categoria}
              titulo={p.titulo}
              descripcion={`$${p.precio}`}
              estaVerificado={p.estaVerificado}
              imagen={p.imagen}
            />
          ))}

          {/* Productos del backend */}
          {!loading && products.map((p) => (
            <ProductCard
              key={p.id}
              categoria={p.category?.name ?? "Sin categoría"}
              titulo={p.title}
              descripcion={`$${p.price.toFixed(2)} · ${p.seller?.full_name ?? "—"}`}
              estaVerificado={true}
              imagen={undefined}
            />
          ))}

          {!loading && filteredDemos.length === 0 && products.length === 0 && (
            <p style={{ color: "#6b7280", gridColumn: "1 / -1" }}>
              No hay productos que coincidan con los filtros.
            </p>
          )}

          {!loading && pagination && totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className={styles.btnClearFilters}
              >
                ← Anterior
              </button>
              <span>Página {page} de {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={styles.btnClearFilters}
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