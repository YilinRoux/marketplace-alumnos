import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import ConditionalBreadcrumbs from "./components/ConditionalBreadcrumbs";
import FocusManager from "./components/FocusManager";
import { AuthProvider } from "./lib/AuthContext";

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
      <link
        rel="stylesheet"
        href="https://cdn-uicons.flaticon.com/uicons-bold-straight/css/uicons-bold-straight.css"
      />

      <body>
        {/* Accesibilidad: */}
        <a href="#contenido-principal" className="skip-link">
          Saltar al contenido principal
        </a>

        <AuthProvider>
          <Navbar />

          <ConditionalBreadcrumbs />

          {/* Manejo de foco accesible */}
          <main id="contenido-principal">
            <FocusManager>{children}</FocusManager>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
