import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "./components/Navbar";
import Breadcrumbs from "./components/Breadcrumbs"; // Asegúrate de tener este archivo en components

const geistSans = localFont({ src: "./fonts/GeistVF.woff", variable: "--font-geist-sans" });
const geistMono = localFont({ src: "./fonts/GeistMonoVF.woff", variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "UniMarket | Marketplace Universitario",
  description: "Plataforma de compra y venta entre estudiantes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable}`} style={{ backgroundColor: '#000', color: '#fff' }}>
        <header>
          <Navbar />
          <Breadcrumbs /> {/* Esto activa el mapa de navegación en todo el sitio */}
        </header>

        <main id="main-content" style={{ minHeight: '80vh', padding: '20px' }}>
          {children}
        </main>

        <footer style={{ textAlign: 'center', padding: '20px', borderTop: '1px solid #333' }}>
          <p>©</p>
        </footer>
      </body>
    </html>
  );
}