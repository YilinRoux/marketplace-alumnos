"use client";

import React from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="error-container" role="alert">
      <h1>Ocurrió un error</h1>
      <p>Algo salió mal. Intenta de nuevo.</p>

      <button onClick={reset}>Reintentar</button>

      <style>{`
        .error-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          text-align: center;
        }

        button {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
