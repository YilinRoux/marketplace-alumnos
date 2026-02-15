"use client";

interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  verified: boolean;
}

interface Props {
  product: Product;
  isFavorite: boolean;
  onFavorite: () => void;
}

export default function ProductCard({
  product,
  isFavorite,
  onFavorite,
}: Props) {
  return (
    <div tabIndex={0}>
      <div style={{ height: 150, background: "#ddd", borderRadius: 10 }} />

      <p>{product.category}</p>
      <h4>{product.title}</h4>
      <p>${product.price}</p>

      {product.verified && <span>✔ Verificado</span>}

      <button
        onClick={onFavorite}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onFavorite();
        }}
        aria-pressed={isFavorite}
      >
        {isFavorite ? "❤️ Favorito" : "🤍 Agregar a favoritos"}
      </button>
    </div>
  );
}
