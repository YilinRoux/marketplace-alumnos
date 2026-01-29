import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "./components/Navbar";


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Marketplace universitario",
  description: "Plataforma de compra y venta entre estudiantes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        
        {/* Skip to content: accesibilidad */}
        <a href="#main-content" className="skip-link">
          Saltar al contenido principal
        </a>

        <header>
          <Navbar />
        </header>

        <main id="main-content">
          {children}
        </main>

        <footer>
          <p>© 2026 UniMarket</p>
        </footer>

      </body>
    </html>
  );
}