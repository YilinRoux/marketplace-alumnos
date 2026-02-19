import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock next/script to render nothing
vi.mock("next/script", () => ({
  __esModule: true,
  default: () => null,
}));

// Mock supabase client
vi.mock("../../../lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithIdToken: vi.fn(),
    },
  },
}));

import LoginPage from "../page";

describe("LoginPage", () => {
  test("renderiza el título UNIMARKET", () => {
    render(<LoginPage />);

    expect(screen.getByText("UNI")).toBeInTheDocument();
    expect(screen.getByText("MARKET")).toBeInTheDocument();
  });

  test("renderiza el subtítulo de bienvenida", () => {
    render(<LoginPage />);

    expect(
      screen.getByRole("heading", { name: /bienvenido/i })
    ).toBeInTheDocument();
  });

  test("renderiza el contenedor del botón de Google", () => {
    const { container } = render(<LoginPage />);

    const googleBtn = container.querySelector("#google-btn");
    expect(googleBtn).toBeInTheDocument();
  });

  test("no renderiza campos de email ni contraseña", () => {
    render(<LoginPage />);

    expect(screen.queryByLabelText(/correo/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/contraseña/i)).not.toBeInTheDocument();
  });
});
