// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FinalCtaSection } from "./final-cta-section";
import { HeroSection } from "./hero-section";
import { HowItWorksSection } from "./how-it-works-section";

describe("Homepage phase-two reveals", () => {
  it("keeps the hero heading and CTAs in the DOM", () => {
    const { container } = render(<HeroSection />);

    expect(screen.getByRole("heading", { level: 1, name: "Profesional itu dirakit." })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mulai Merakit" })).toHaveAttribute("href", "/register");
    expect(screen.getByRole("button", { name: "Lihat Course" })).toHaveAttribute("href", "/courses");

    const reveals = container.querySelectorAll<HTMLElement>(".dp-css-reveal");
    expect([...reveals].map((reveal) => reveal.style.animationDelay)).toEqual(["0ms", "80ms"]);
  });

  it("keeps every assembly step in the DOM and progressively delays the rails", () => {
    const { container } = render(<HowItWorksSection />);

    for (const title of ["Pilih Rakitan", "Pelajari Konsep", "Rakit Tahap demi Tahap", "Selesaikan Karyamu"]) {
      expect(screen.getByRole("heading", { level: 3, name: title })).toBeInTheDocument();
    }

    const reveals = container.querySelectorAll<HTMLElement>(".dp-css-reveal");
    expect([...reveals].map((reveal) => reveal.style.animationDelay)).toEqual(["0ms", "100ms", "200ms", "300ms"]);
    expect(container.querySelectorAll(".dp-flow-connector-h")).toHaveLength(3);
    expect(container.querySelectorAll(".dp-flow-connector-v")).toHaveLength(3);
    expect(container.querySelector("style")?.textContent).toContain("prefers-reduced-motion: reduce");
  });

  it("keeps the final CTA heading and action in the DOM", () => {
    const { container } = render(<FinalCtaSection />);

    expect(screen.getByRole("heading", { level: 2, name: "Rakitan pertamamu dimulai di sini." })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mulai Merakit" })).toHaveAttribute("href", "/register");
    expect(container.querySelector(".dp-css-reveal")).toBeInTheDocument();
  });
});
