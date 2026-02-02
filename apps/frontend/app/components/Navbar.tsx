import Link from 'next/link';

export default function Navbar() {
  return (
    <nav aria-label="Navegación principal">
      <ul style={{ display: 'flex', gap: '20px', listStyle: 'none' }}>
        <li>
          <Link href="/">Inicio</Link>
        </li>
        <li>
          <Link href="/marketplace">Marketplace</Link>
        </li>
        <li>
          <Link href="/profile">Perfil</Link>
        </li>
      </ul>
    </nav>
  );
}
