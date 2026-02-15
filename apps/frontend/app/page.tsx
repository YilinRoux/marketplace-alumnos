"use client";

import Link from "next/link";
import styles from "./page.module.css";
import Image from "next/image";

export default function HomePage() {
  return (
    <section className={styles.container}>
      
      {/* HERO */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>
            UNIMARKET <br />
            <span>Ideal para el intercambio universitario</span>
          </h1>

          <p>
            Compra, vende o intercambia productos entre estudiantes de forma
            segura y sencilla.
          </p>

          <Link href="/productos" className={styles.primaryButton}>
            Ver productos
          </Link>
        </div>

      <div className={styles.heroImage}>
  <Image
    src="/images/landing.jpg"
    alt="Landing UNIMARKET"
    fill
    className={styles.heroImg}
    priority
  />
</div>

      </header>

      {/* CATEGORÍAS */}
      <section
        className={styles.categories}
        aria-labelledby="categories-title"
      >
        <h2 id="categories-title">Categorías destacadas</h2>

        <ul className={styles.categoryGrid}>
          <li>
            <button className={styles.card}>
              <div className={styles.iconBox}>📚</div>
              <span>Material académico</span>
            </button>
          </li>

          <li>
            <button className={styles.card}>
              <div className={styles.iconBox}>💻</div>
              <span>Tecnología</span>
            </button>
          </li>

          <li>
            <button className={styles.card}>
              <div className={styles.iconBox}>🛠</div>
              <span>Servicios</span>
            </button>
          </li>
        </ul>
      </section>

      {/* CÓMO FUNCIONA */}
      <section
        className={styles.howItWorks}
        aria-labelledby="how-title"
      >
        <h2 id="how-title">¿Cómo funciona?</h2>

        <ol className={styles.steps}>
          <li>
            <strong>1.</strong>
            <p>Regístrate con tu cuenta universitaria</p>
          </li>
          <li>
            <strong>2.</strong>
            <p>Publica o busca productos fácilmente</p>
          </li>
          <li>
            <strong>3.</strong>
            <p>Conecta y concreta el intercambio</p>
          </li>
        </ol>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          
          <div className={styles.footerBrand}>
            <h3>UNIMARKET</h3>
            <p>
              Plataforma universitaria para comprar, vender e intercambiar
              productos entre estudiantes.
            </p>
          </div>

          <div className={styles.footerLinks}>
            <h4>Enlaces</h4>
            <ul>
              <li><Link href="/">Inicio</Link></li>
              <li><Link href="/productos">Productos</Link></li>
              <li><Link href="/auth/login">Login</Link></li>
            </ul>
          </div>

          <div className={styles.footerContact}>
            <h4>Contacto</h4>
            <p>soporte@unimarket.edu</p>
            <p>© 2026 UNIMARKET</p>
          </div>

        </div>
      </footer>

    </section>
  );
}
