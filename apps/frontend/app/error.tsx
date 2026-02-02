'use client';

import { useEffect } from 'react';
import { ROUTES } from './lib/routes';

/**
 * Componente de Error 500 - Error del Servidor
 * 
 * Maneja errores del servidor de forma amigable y accesible.
 * No expone información sensible al usuario.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Registrar el error de forma segura (sin exponer detalles sensibles)
    console.error('Error capturado:', error.digest || 'Error del servidor');
  }, [error]);

  return (
    <div className="error-container" role="alert" aria-live="assertive">
      <div className="error-content">
        {/* Icono de error */}
        <div className="error-icon" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="icon"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>

        {/* Código de error */}
        <h1 className="error-code">500</h1>
        
        {/* Título descriptivo */}
        <h2 className="error-title">Error del Servidor</h2>
        
        {/* Mensaje amigable sin información sensible */}
        <p className="error-message">
          Lo sentimos, algo salió mal en nuestro servidor. Nuestro equipo ha sido 
          notificado y estamos trabajando para solucionarlo.
        </p>

        {/* Sugerencias para el usuario */}
        <div className="error-suggestions">
          <p className="suggestions-title">¿Qué puedes hacer?</p>
          <ul className="suggestions-list">
            <li>Espera unos segundos e intenta nuevamente</li>
            <li>Regresa a la página de inicio</li>
            <li>Si el problema persiste, contáctanos</li>
          </ul>
        </div>

        {/* Botones de acción */}
        <div className="error-actions">
          <button
            onClick={reset}
            className="btn-primary"
            aria-label="Intentar cargar la página nuevamente"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="btn-icon"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
            Intentar de nuevo
          </button>

          <a
            href={ROUTES.HOME}
            className="btn-secondary"
            aria-label="Volver a la página de inicio"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="btn-icon"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
            Ir al inicio
          </a>
        </div>

        {/* Identificador del error (para soporte, sin info sensible) */}
        {error.digest && (
          <p className="error-reference">
            Referencia del error: <code>{error.digest}</code>
          </p>
        )}
      </div>

      <style jsx>{`
        .error-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: linear-gradient(135deg, #0F172A 0%, #1e293b 100%);
        }

        .error-content {
          max-width: 500px;
          width: 100%;
          text-align: center;
          padding: 3rem 2rem;
          background-color: #FFFFFF;
          border-radius: 1rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .error-icon {
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .icon {
          width: 4rem;
          height: 4rem;
          color: #2563EB;
        }

        .error-code {
          font-size: 5rem;
          font-weight: 800;
          color: #0F172A;
          margin: 0;
          line-height: 1;
        }

        .error-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #0F172A;
          margin: 0.5rem 0 1rem;
        }

        .error-message {
          font-size: 1rem;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .error-suggestions {
          background-color: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 0.75rem;
          padding: 1.25rem;
          margin-bottom: 2rem;
          text-align: left;
        }

        .suggestions-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #0F172A;
          margin: 0 0 0.75rem;
        }

        .suggestions-list {
          margin: 0;
          padding-left: 1.25rem;
          color: #64748b;
          font-size: 0.875rem;
          line-height: 1.8;
        }

        .suggestions-list li::marker {
          color: #10B981;
        }

        .error-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        @media (min-width: 400px) {
          .error-actions {
            flex-direction: row;
            justify-content: center;
          }
        }

        .btn-primary,
        .btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          font-size: 0.9375rem;
          font-weight: 600;
          border-radius: 0.5rem;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .btn-primary {
          background-color: #2563EB;
          color: #FFFFFF;
        }

        .btn-primary:hover {
          background-color: #1d4ed8;
          transform: translateY(-1px);
        }

        .btn-primary:focus {
          outline: 2px solid #2563EB;
          outline-offset: 2px;
        }

        .btn-secondary {
          background-color: #F8FAFC;
          color: #0F172A;
          border: 1px solid #E2E8F0;
        }

        .btn-secondary:hover {
          background-color: #E2E8F0;
          transform: translateY(-1px);
        }

        .btn-secondary:focus {
          outline: 2px solid #10B981;
          outline-offset: 2px;
        }

        .btn-icon {
          width: 1.25rem;
          height: 1.25rem;
        }

        .error-reference {
          margin-top: 2rem;
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .error-reference code {
          background-color: #F8FAFC;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-family: monospace;
          border: 1px solid #E2E8F0;
        }
      `}</style>
    </div>
  );
}
