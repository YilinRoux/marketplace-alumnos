import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import Breadcrumbs from "../Breadcrumbs";

vi.mock("next/navigation", () => ({
  usePathname: () => "/marketplace/producto",
}));

describe("Breadcrumbs", () => {
  test("muestra la ruta actual", () => {
    render(<Breadcrumbs />);

    expect(screen.getByText("marketplace")).toBeInTheDocument();
    expect(screen.getByText("producto")).toBeInTheDocument();
  });
});
