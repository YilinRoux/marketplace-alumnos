'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Bienvenido a UniMarket</h1>
      <p>La mejor plataforma para intercambiar artículos en la universidad.</p>
      <div style={{ marginTop: '20px' }}>
        <Link href="/marketplace" style={{ backgroundColor: '#cce0ff', color: '#000', padding: '10px 20px', borderRadius: '5px', fontWeight: 'bold' }}>
          Explorar Productos
        </Link>
      </div>
    </div>
  );
}