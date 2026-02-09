export default function HomePage() {
  return (
    <section className="hero" aria-labelledby="home-title">
      <h1 id="home-title">UNIMARKET</h1>

      <p className="hero-subtitle">
        Tienda para la universidad UTTc
      </p>

      <nav aria-label="Acciones principales">
        <a
          href="/marketplace"
          className="link-principal"
        >
          Ver productos
        </a>
      </nav>
    </section>
  );
}
