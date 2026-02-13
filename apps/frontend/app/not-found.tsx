import Link from "next/link";

export default function NotFound() {
  return (
    <section
      aria-labelledby="not-found-title"
      style={{ padding: "64px", textAlign: "center" }}
    >
      <h1 id="not-found-title">Página no encontrada</h1>
      <p>La página que buscas no existe</p>

      <Link
        href="/"
        style={{
          display: "inline-block",
          marginTop: "16px",
          padding: "10px 16px",
          background: "#2563eb",
          color: "white",
          borderRadius: "6px",
          textDecoration: "none",
        }}
      >
        Volver al inicio
      </Link>
    </section>
  );
}
