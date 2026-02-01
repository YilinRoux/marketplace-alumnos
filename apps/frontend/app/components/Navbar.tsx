import Link from 'next/link';

export default function Navbar() {
  return (
    <nav aria-label="Navegación principal" style={{ padding: '1rem', borderBottom: '1px solid #333' }}>
      <ul style={{ display: 'flex', gap: '20px', listStyle: 'none' }}>
        <li><Link href="/">Inicio</Link></li>
        <li><Link href="/marketplace">Marketplace</Link></li>
        <li><Link href="/profile">Perfil</Link></li>
      </ul>
    </nav>
  );
}