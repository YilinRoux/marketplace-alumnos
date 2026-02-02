'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Breadcrumbs() {
const pathname = usePathname();
const pathSegments = pathname.split('/').filter(segment => segment !== '');

return (
    <nav aria-label="Breadcrumb" style={{ padding: '10px 20px', color: '#fff' }}>
    <ol style={{ display: 'flex', listStyle: 'none', padding: 0 }}>
        <li>
        <Link href="/">Inicio</Link>
        {pathSegments.length > 0 && <span style={{ margin: '0 8px' }}>&gt;</span>}
        </li>
        {pathSegments.map((segment, index) => {
        const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
        const isLast = index === pathSegments.length - 1;
        return (
            <li key={href}>
            {isLast ? (
                <span>{segment}</span>
            ) : (
                <>
                <Link href={href}>{segment}</Link>
                <span style={{ margin: '0 8px' }}>&gt;</span>
                </>
            )}
            </li>
        );
        })}
    </ol>
    </nav>
);
}