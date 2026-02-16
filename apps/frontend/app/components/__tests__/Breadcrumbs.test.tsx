import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import Breadcrumbs from "../Breadcrumbs";


vi.mock("next/navigation", () => ({
  usePathname: () => "/marketplace/producto",
}));

describe("Breadcrumbs - Accesibilidad", () => {
  test("muestra la ruta actual", () => {
    render(<Breadcrumbs />);

    expect(screen.getByText("marketplace")).toBeInTheDocument();
    expect(screen.getByText("producto")).toBeInTheDocument();
  });

  test("permite navegación con teclado (Tab)", async () => {
    const user = userEvent.setup();
    render(<Breadcrumbs />);

    await user.tab();
    const firstLink = screen.getAllByRole("link")[0];
    expect(firstLink).toHaveFocus();
  });
});
