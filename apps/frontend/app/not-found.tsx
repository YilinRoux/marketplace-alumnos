import Link from 'next/link';

export default function NotFound() {
return (
    <main style={{ 
    backgroundColor: '#121212', 
    color: 'white', 
    height: '100vh', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center',
    textAlign: 'center',
    fontFamily: 'sans-serif'
    }}>
    
    <p style={{ maxWidth: '600px', fontSize: '1.2rem', padding: '0 20px' }}>
        Error 404: La página que buscas no existe... pero tenemos muchas otras que sí. 
        <br />
        <strong>Haz Clic en inicio para volver</strong>
    </p>

    
    <h1 style={{ fontSize: '8rem', margin: '20px 0' }}>404</h1>

    <Link href="/" style={{
        backgroundColor: '#cce0ff', 
        color: '#000',
        padding: '10px 30px',
        borderRadius: '5px',
        textDecoration: 'none',
        fontWeight: 'bold',
        textTransform: 'uppercase'
    }}>
        Inicio
    </Link>
    </main>
);
}