import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Navbar from "../Navbar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("Accesibilidad Navbar", () => {
  it("permite navegación con Tab", async () => {
    const user = userEvent.setup();
    render(<Navbar />);

    await user.tab();
    expect(screen.getByRole("link", { name: /inicio/i })).toHaveFocus();
  });
});
