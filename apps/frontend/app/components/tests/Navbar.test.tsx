import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, test, expect, vi } from "vitest";
import Navbar from "../Navbar";


vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("Navbar", () => {
  test("se renderiza correctamente", () => {
    render(<Navbar />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  test("permite navegación por teclado", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    await user.tab();
    const firstLink = screen.getAllByRole("link")[0];
    expect(firstLink).toHaveFocus();
  });
});
