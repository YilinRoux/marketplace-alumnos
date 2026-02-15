"use client";

interface Props {
  search: string;
  setSearch: (value: string) => void;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
  setMessage: (msg: string) => void;
}

export default function Filters({
  search,
  setSearch,
  priceRange,
  setPriceRange,
  setMessage,
}: Props) {
  return (
    <div>
      <h3>Filtros</h3>

      <input
        type="text"
        placeholder="Buscar productos..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setMessage("Filtro de búsqueda aplicado 🔍");
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setSearch("");
        }}
      />

      <h4>Precio</h4>

      <input
        type="range"
        min="100"
        max="1500"
        value={priceRange[1]}
        onChange={(e) => {
          setPriceRange([priceRange[0], Number(e.target.value)]);
          setMessage("Rango de precio actualizado 💰");
        }}
      />

      <p>
        {priceRange[0]} - {priceRange[1]}
      </p>
    </div>
  );
}
