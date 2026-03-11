import type { Metadata } from "next";
import Head from "next/head";
import "./globals.css";
import Navbar from "./components/Navbar";
import { Toaster } from "sonner";
import ConditionalBreadcrumbs from "./components/ConditionalBreadcrumbs";
import FocusManager from "./components/FocusManager";
import { AuthProvider } from "./lib/AuthContext";
import { ToastProvider } from "./components/ToastProvider";

export const metadata: Metadata = {
  title: "Unimarket",
  description: "Marketplace universitario accesible",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <Head>
        <link rel="stylesheet" href="https://cdn-uicons.flaticon.com/uicons-bold-straight/css/uicons-bold-straight.css" />
      </Head>
      <body>
        <a href="#contenido-principal" className="skip-link">
          Saltar al contenido principal
        </a>
        <AuthProvider>
          <ToastProvider>
            <Navbar />
            <ConditionalBreadcrumbs />
            <main id="contenido-principal">
              <FocusManager>{children}</FocusManager>
            </main>
            <Toaster position="bottom-right" richColors />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}