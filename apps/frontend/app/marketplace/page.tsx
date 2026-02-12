export default function MarketplacePage() {
  return (
    <main tabIndex={-1}>
      <h1>Marketplace</h1>

      <section style={{ display: "grid", gap: "1.5rem" }}>
        <article className="card">
          <h2>Producto ejemplo</h2>
          <p>Descripción corta del producto.</p>
          <button>Ver producto</button>
        </article>
      </section>
    </main>
  );
}
