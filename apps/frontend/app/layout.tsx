import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Breadcrumbs from "./components/Breadcrumbs";
import FocusManager from "./components/FocusManager";

export const metadata: Metadata = {
  title: "Unimarket",
  description: "Marketplace universitario accesible",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {/* Accesibilidad: saltar al contenido */}
        <a href="#contenido-principal" className="skip-link">
          Saltar al contenido principal
        </a>

        <Navbar />
        <Breadcrumbs />

        {/* Manejo de foco accesible */}
        <main id="contenido-principal">
          <FocusManager>{children}</FocusManager>
        </main>
      </body>
    </html>
  );
}
