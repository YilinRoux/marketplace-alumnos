'use client'; // Para que el componente sea cliente y pueda usar el router
import { ROUTES } from './lib/routes';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  return (
    <main>
      <h1>UniMarket</h1>
      <p>Marketplace universitario</p>
      <Link href={ROUTES.AUTH.LOGIN}>Login</Link> {/* Ejemplo de uso de Link */}
      <button onClick={() => router.push(ROUTES.AUTH.LOGIN)}>Login</button> {/* Ejemplo de uso de router */}
    </main>
    
  );
}
