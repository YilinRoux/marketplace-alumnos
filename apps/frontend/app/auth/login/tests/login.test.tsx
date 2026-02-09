import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import LoginPage from "../page";

describe("LoginPage", () => {
  test("renderiza el formulario de login", () => {
    render(<LoginPage />);

    expect(
      screen.getByRole("heading", { name: /iniciar sesión/i })
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/correo institucional/i)
    ).toBeInTheDocument();

    expect(
      screen.getByLabelText(/contraseña/i)
    ).toBeInTheDocument();
  });

  test("el botón responde al click", () => {
    render(<LoginPage />);

    const button = screen.getByRole("button", { name: /entrar/i });
    expect(button).toBeEnabled();
  });
});
