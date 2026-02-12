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
        <Navbar />
        <Breadcrumbs />

        {/* Manejo de foco accesible */}
        <FocusManager>{children}</FocusManager>
      </body>
    </html>
  );
}
