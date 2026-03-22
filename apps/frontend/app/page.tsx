import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <div>

      {/* CONTENEDOR CENTRAL */}
      <div className={styles.container}>

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className={styles.hero}>
          <Image
            src="/images/hero-image.jpg"
            alt="Escritorio universitario"
            width={600}
            height={400}
            className={styles.heroImage}
            priority
          />
          <div className={styles.heroContent}>
            <h1>
              UNI<span>MARKET</span><br />
              IDEAL<br />
              PARA EL<br />
              INTERCAMBIO<br />
              UNIVERSITARIO
            </h1>
            <Link href="/marketplace" className={styles.btnPrimary}>
              VER PRODUCTOS
            </Link>
          </div>
        </section>

        {/* ── CATEGORÍAS ───────────────────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Categorías Destacadas</h2>
          <div className={styles.grid}>
            <div className={styles.card}>
              <Image
                src="/images/book.png.png"
                alt="Libro"
                width={60}
                height={60}
                className={styles.cardIcon}
              />
              <h3 className={styles.cardTitle}>Material<br />Académico</h3>
              <p style={{ fontSize: "0.8rem" }}>Libros, apuntes y herramientas para tus clases</p>
            </div>
            <div className={styles.card}>
              <Image
                src="/images/communication.png"
                alt="Tecnología"
                width={60}
                height={60}
                className={styles.cardIcon}
              />
              <h3 className={styles.cardTitle}>Tecnología</h3>
              <p style={{ fontSize: "0.8rem" }}>Dispositivos y accesorios a precios de estudiante</p>
            </div>
            <div className={styles.card}>
              <Image
                src="/images/save-instagram.png"
                alt="Servicios"
                width={60}
                height={60}
                className={styles.cardIcon}
              />
              <h3 className={styles.cardTitle}>Servicios y<br />habilidades</h3>
              <p style={{ fontSize: "0.8rem" }}>Clases, diseño, reparaciones y más entre alumnos</p>
            </div>
          </div>
        </section>

        {/* ── CÓMO FUNCIONA ────────────────────────────────────── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Como funciona:</h2>
          <div className={styles.grid}>
            <div className={styles.card}>
              <Image
                src="/images/default-user.png"
                alt="Usuario"
                width={60}
                height={60}
                className={styles.cardIcon}
              />
              <p><strong>Regístrate</strong> con tu cuenta universitaria</p>
            </div>
            <div className={styles.card}>
              <Image
                src="/images/buscar.png"
                alt="Buscar"
                width={60}
                height={60}
                className={styles.cardIcon}
              />
              <p><strong>Publica</strong> o <strong>explora</strong> productos</p>
            </div>
            <div className={styles.card}>
              <Image
                src="/images/marque-el-circulo.png"
                alt="Conectar"
                width={60}
                height={60}
                className={styles.cardIcon}
              />
              <p>Conecta y concreta</p>
            </div>
          </div>
        </section>

      </div>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>UNI<span>MARKET</span></div>
        <div className={styles.footerColumn}>
          <h4>Comprar</h4>
          <p>Tendencias</p>
          <p>Categoría</p>
          <p>Ofertas Flash</p>
        </div>
        <div className={styles.footerColumn}>
          <h4>Vender</h4>
          <p><Link href="/marketplace/create" style={{ color: "#94A3B8", textDecoration: "none" }}>Publicar producto</Link></p>
          <p><Link href="/profile" style={{ color: "#94A3B8", textDecoration: "none" }}>Mis publicaciones</Link></p>
        </div>
        <div className={styles.footerColumn}>
          <h4>Comentarios</h4>
          <div className={styles.footerInput}>
            <input type="text" placeholder="Escribe aquí..." />
            <button type="button">→</button>
          </div>
        </div>
      </footer>

    </div>
  );
}