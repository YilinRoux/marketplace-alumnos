"use client";

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

// Mock supabase client
vi.mock("../../../lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      getSession: vi.fn(() => ({ data: { session: null } })),
      signOut: vi.fn(),
    },
  },
}));

// Mock AuthContext
vi.mock("../../../lib/AuthContext", () => ({
  useAuth: () => ({
    status: "unauthenticated",
    user: null,
    logout: vi.fn(),
    refresh: vi.fn(),
  }),
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

  test("renderiza el botón de Google habilitado", () => {
    render(<LoginPage />);

    const googleBtn = screen.getByRole("button", { name: /acceder con google/i });
    expect(googleBtn).toBeInTheDocument();
    expect(googleBtn).not.toBeDisabled();
  });

  test("renderiza campos de email y contraseña", () => {
    render(<LoginPage />);

    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
  });

  test("renderiza el botón de usuario demo", () => {
    render(<LoginPage />);

    expect(
      screen.getByRole("button", { name: /entrar como usuario demo/i })
    ).toBeInTheDocument();
  });

  test("renderiza el botón de iniciar sesión", () => {
    render(<LoginPage />);

    expect(
      screen.getByRole("button", { name: /iniciar sesión/i })
    ).toBeInTheDocument();
  });
});
