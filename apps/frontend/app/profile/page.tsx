"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "../lib/AuthContext";
import ProductCard from "../components/ProductCard/ProductCard";
import RoleGuard from "../components/guards/RoleGuard";
import styles from "./profile.module.css";

interface DemoProduct {
  id: string;
  categoria: string;
  titulo: string;
  descripcion: string;
  precio: string;
  estaVerificado: boolean;
  imagen: string;
  vendedorEmail: string;
}

const DEMO_PRODUCTS_KEY = "um_demo_products";
const DEMO_EMAIL = "usuario@universidad.edu";

function loadDemoProducts(): DemoProduct[] {
  try {
    const raw = sessionStorage.getItem(DEMO_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveDemoProducts(products: DemoProduct[]) {
  try {
    sessionStorage.setItem(DEMO_PRODUCTS_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event("demo-products-updated"));
  } catch { }
}

export default function ProfilePage() {
  const { user, status } = useAuth();
  const [misProductos, setMisProductos] = useState<DemoProduct[]>([]);

  useEffect(() => {
    // Esperar a que el AuthContext termine de cargar
    if (status === "loading") return;

    const todos = loadDemoProducts();
    // Usar email del usuario autenticado, o fallback al email demo
    const email = user?.email ?? DEMO_EMAIL;
    const mios = todos.filter((p) => p.vendedorEmail === email);
    setMisProductos(mios);
  }, [user, status]);

  const handleEliminar = (id: string) => {
    const todos = loadDemoProducts();
    const actualizados = todos.filter((p) => p.id !== id);
    saveDemoProducts(actualizados);
    setMisProductos((prev) => prev.filter((p) => p.id !== id));
    toast.error("Publicación eliminada correctamente");
  };

  if (status === "loading") {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>Mis Publicaciones Activas</h1>
          <p style={{ color: "#6b7280" }}>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard minRole="user">
      <div className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>Mis Publicaciones Activas</h1>

          {misProductos.length === 0 ? (
            <div className={styles.empty}>
              <p>Aún no tienes productos a la venta.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {misProductos.map((producto) => (
                <div key={producto.id} className={styles.cardWrapper}>
                  <button
                    className={styles.btnEliminar}
                    onClick={() => handleEliminar(producto.id)}
                  >
                    Eliminar
                  </button>
                  <ProductCard
                    categoria={producto.categoria}
                    titulo={producto.titulo}
                    descripcion={producto.descripcion}
                    estaVerificado={producto.estaVerificado}
                    imagen={producto.imagen}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGuard>
  );
}