"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "../../lib/AuthContext";
import styles from "./create.module.css";

const DEMO_PRODUCTS_KEY = "um_demo_products";
const CATEGORIAS = ["Deportes", "Tecnología", "Libros", "Ropa", "Servicios", "Otros"];

function loadDemoProducts() {
  try {
    const raw = sessionStorage.getItem(DEMO_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveDemoProducts(products: unknown[]) {
  try {
    sessionStorage.setItem(DEMO_PRODUCTS_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event("demo-products-updated"));
  } catch { }
}

export default function CreatePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [paso, setPaso] = useState(1);
  const [imagenes, setImagenes] = useState<string[]>([]);
  const [titulo, setTitulo] = useState("");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("Tecnología");
  const [publicando, setPublicando] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const urls = files.map((f) => URL.createObjectURL(f));
    setImagenes((prev) => [...prev, ...urls]);
  };

  const handleSiguiente = () => {
    if (paso === 1 && imagenes.length < 6) {
      return toast.error("Necesitas subir al menos 6 imágenes.");
    }
    if (paso === 2 && (!titulo || !precio || !descripcion)) {
      return toast.error("Completa todos los campos.");
    }
    setPaso(paso + 1);
  };

  const handlePublicar = async () => {
    setPublicando(true);
    toast.loading("Publicando...");
    await new Promise((r) => setTimeout(r, 1500));
    toast.dismiss();

    const nuevoProducto = {
      id: `demo-${Date.now()}`,
      categoria,
      titulo,
      descripcion,
      precio,
      estaVerificado: true,
      imagen: imagenes[0],
      vendedorEmail: user?.email ?? "usuario@universidad.edu",
    };

    const productos = loadDemoProducts();
    saveDemoProducts([nuevoProducto, ...productos]);

    toast.success("¡Producto publicado!");
    setPublicando(false);
    router.push("/marketplace");
  };

  return (
    <div className={styles.venderPage}>
      <button className={styles.btnBackTop} onClick={() => router.back()}>←</button>

      <div className={styles.card}>
        <div className={styles.header}>
          <span>Publicar producto</span>
          <span style={{ color: "#64748b", fontSize: "0.9rem" }}>Paso {paso} de 3</span>
        </div>

        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${(paso / 3) * 100}%` }} />
        </div>

        <div className={styles.stepContent}>
          {paso === 1 && (
            <div>
              <div className={styles.uploadArea}>
                <input type="file" multiple accept="image/*" className={styles.fileInput} onChange={handleFileChange} />
                <p>Click o arrastra tus fotos</p>
                <span className={styles.imageCount}>
                  {imagenes.length === 0
                    ? "Sin imágenes (mínimo 6)"
                    : `${imagenes.length} imagen${imagenes.length > 1 ? "es" : ""} subida${imagenes.length > 1 ? "s" : ""} ${imagenes.length < 6 ? `· faltan ${6 - imagenes.length}` : "✓"}`}
                </span>
              </div>
              {imagenes.length > 0 && (
                <div className={styles.previewGrid}>
                  {imagenes.map((url, i) => (
                    <img key={i} src={url} alt={`preview-${i}`} className={styles.previewImg} />
                  ))}
                </div>
              )}
            </div>
          )}

          {paso === 2 && (
            <div>
              <div className={styles.inputGroup}>
                <label>Título</label>
                <input type="text" placeholder="Ej: Laptop HP 15 pulgadas" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
              </div>
              <div className={styles.inputGroup}>
                <label>Precio ($)</label>
                <input type="number" placeholder="Ej: 500" value={precio} onChange={(e) => setPrecio(e.target.value)} min={0} />
              </div>
              <div className={styles.inputGroup}>
                <label>Descripción</label>
                <textarea rows={4} placeholder="Describe el estado y características..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
              </div>
            </div>
          )}

          {paso === 3 && (
            <div>
              <div className={styles.inputGroup}>
                <label>Selecciona una categoría</label>
                <div className={styles.categoryGrid}>
                  {CATEGORIAS.map((cat) => (
                    <button key={cat} onClick={() => setCategoria(cat)}
                      className={`${styles.btnCategory} ${categoria === cat ? styles.active : ""}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.resumen}>
                <h4>Resumen</h4>
                <p><strong>Título:</strong> {titulo}</p>
                <p><strong>Precio:</strong> ${precio}</p>
                <p><strong>Categoría:</strong> {categoria}</p>
                <p><strong>Imágenes:</strong> {imagenes.length}</p>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          {paso > 1 && (
            <button className={styles.btnOutline} onClick={() => setPaso(paso - 1)}>Atrás</button>
          )}
          <button
            className={styles.btnSolid}
            onClick={paso < 3 ? handleSiguiente : handlePublicar}
            disabled={publicando}
            style={{ marginLeft: paso === 1 ? "auto" : undefined }}
          >
            {paso < 3 ? "Siguiente →" : publicando ? "Publicando..." : "Publicar"}
          </button>
        </div>
      </div>
    </div>
  );
}