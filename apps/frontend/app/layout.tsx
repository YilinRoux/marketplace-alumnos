import "./globals.css";
import Navbar from "./components/Navbar";
import Breadcrumbs from "./components/Breadcrumbs";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {/* Accesibilidad */}
        <a href="#contenido-principal" className="skip-link">
          Saltar al contenido principal
        </a>

        <Navbar />
        <Breadcrumbs />

        <main id="contenido-principal">
          {children}
        </main>
      </body>
    </html>
  );
}
