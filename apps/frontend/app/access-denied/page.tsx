import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Acceso Denegado | Unimarket",
};

export default function AccessDeniedPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
            <i className="fi fi-bs-lock text-6xl text-red-500 mb-4"></i>
            <h1 className="text-3xl font-bold mb-2">Acceso Denegado</h1>
            <p className="text-gray-600 mb-8 max-w-md">
                No tienes los permisos necesarios para ver esta página o realizar esta acción. 
                Si crees que esto es un error, por favor ponte en contacto con el soporte.
            </p>
            <Link 
                href="/" 
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
            >
                Volver al Inicio
            </Link>
        </div>
    );
}
