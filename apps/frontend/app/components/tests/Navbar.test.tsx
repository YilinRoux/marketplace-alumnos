import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import Navbar from "../Navbar";


vi.mock("next/navigation", () => ({
  usePathname: () => "/marketplace",
}));

describe("Navbar - Accesibilidad e interacción", () => {
  test("se renderiza correctamente", () => {
    render(<Navbar />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  test("permite navegación con Tab", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    await user.tab();
    const firstLink = screen.getAllByRole("link")[0];
    expect(firstLink).toHaveFocus();
  });

  test("activa enlace con Enter", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    const firstLink = screen.getAllByRole("link")[0];
    firstLink.focus();

    await user.keyboard("{Enter}");

    expect(firstLink).toHaveFocus();
  });

  test("soporta interacción con click y teclado", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    const firstLink = screen.getAllByRole("link")[0];

   
    await user.click(firstLink);
    expect(firstLink).toBeInTheDocument();

    firstLink.focus();
    await user.keyboard("{Enter}");
    expect(firstLink).toHaveFocus();
  });

  test("marca la página actual con aria-current", () => {
    render(<Navbar />);
    const activeLink = screen.getByRole("link", { current: "page" });
    expect(activeLink).toBeInTheDocument();
  });
});
