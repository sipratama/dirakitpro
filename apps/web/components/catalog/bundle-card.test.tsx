// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Bundle } from "@dirakitpro/database";
import { BundleCard } from "./bundle-card";

function buildBundle(overrides: Partial<Bundle> = {}): Bundle {
  return {
    id: "bundle-1",
    slug: "paket-merdeka",
    title: "Paket Merdeka",
    description: "Pilih 2 course dari eligible catalog.",
    type: "CHOOSE_N",
    selectionCount: 2,
    price: "299000",
    currency: "IDR",
    status: "ACTIVE",
    startsAt: null,
    endsAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("BundleCard", () => {
  it("shows 'Pilih N dari M course' for a CHOOSE_N bundle", () => {
    render(<BundleCard bundle={buildBundle({ type: "CHOOSE_N", selectionCount: 2 })} courseCount={3} />);
    expect(screen.getByText("Pilih 2 dari 3 course")).toBeInTheDocument();
  });

  it("shows the included course count for a FIXED bundle", () => {
    render(<BundleCard bundle={buildBundle({ type: "FIXED", selectionCount: null })} courseCount={4} />);
    expect(screen.getByText("4 course termasuk")).toBeInTheDocument();
  });

  it("links to the bundle detail route by slug", () => {
    render(<BundleCard bundle={buildBundle({ slug: "paket-spesial" })} courseCount={2} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/bundles/paket-spesial");
  });
});
