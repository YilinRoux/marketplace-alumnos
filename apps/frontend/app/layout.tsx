import type { Metadata } from "next";
import Head from "next/head";
import "./globals.css";
import Navbar from "./components/Navbar";

import ConditionalBreadcrumbs from "./components/ConditionalBreadcrumbs";
import FocusManager from "./components/FocusManager";
import { AuthProvider } from "./lib/AuthContext";
import { ToastProvider } from "./components/ToastProvider";

// Hacemos Navbar dinámico para que solo se renderice en cliente y evitemos errores de hidratación

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
      {/* Head para CSS externo y metadatos */}
      <Head>
        <link
          rel="stylesheet"
          href="https://cdn-uicons.flaticon.com/uicons-bold-straight/css/uicons-bold-straight.css"
        />
      </Head>

      <body>
        {/* Accesibilidad: Saltar al contenido principal */}
        <a href="#contenido-principal" className="skip-link">
          Saltar al contenido principal
        </a>

        <AuthProvider>
          <ToastProvider>
            {/* Navbar dinámico (solo cliente) */}
            <Navbar />

            <ConditionalBreadcrumbs />

            {/* Manejo de foco accesible */}
            <main id="contenido-principal">
              <FocusManager>{children}</FocusManager>
            </main>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
