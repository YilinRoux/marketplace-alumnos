import { render } from "@testing-library/react";
import { vi } from "vitest";
import Breadcrumbs from "../Breadcrumbs";

// 👇 mock de Next navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/profile",
}));

describe("Breadcrumbs", () => {
  it("renderiza sin errores", () => {
    render(<Breadcrumbs />);
  });
});
