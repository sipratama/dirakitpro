// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FinalCtaSection } from "./final-cta-section";
import { HeroSection } from "./hero-section";
import { HowItWorksSection } from "./how-it-works-section";
import { WhyDirakitProSection } from "./why-dirakitpro-section";

describe("Homepage phase-two reveals", () => {
  it("keeps the hero heading and CTAs in the DOM", () => {
    const { container } = render(<HeroSection />);

    expect(screen.getByRole("heading", { level: 1, name: "Profesional itu dirakit." })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mulai Merakit" })).toHaveAttribute("href", "/register");
    expect(screen.getByRole("button", { name: "Lihat Course" })).toHaveAttribute("href", "/courses");

    expect(container.querySelector("section")).toHaveClass("bg-brand-cream");
    expect(container.querySelectorAll(".dp-shape-bob")).toHaveLength(1);
    const reveals = container.querySelectorAll<HTMLElement>(".dp-css-reveal");
    expect([...reveals].map((reveal) => reveal.style.animationDelay)).toEqual(["0ms", "80ms"]);
  });

  it("keeps every assembly step in the DOM and progressively delays the rails", () => {
    const { container } = render(<HowItWorksSection />);

    for (const title of ["Pilih Rakitan", "Pelajari Konsep", "Rakit Tahap demi Tahap", "Selesaikan Karyamu"]) {
      expect(screen.getByRole("heading", { level: 3, name: title })).toBeInTheDocument();
    }

    expect(container.querySelector("section")).toHaveClass("bg-brand-cream");
    const reveals = container.querySelectorAll<HTMLElement>(".dp-css-reveal");
    expect([...reveals].map((reveal) => reveal.style.animationDelay)).toEqual(["0ms", "100ms", "200ms", "300ms"]);

    const stepCards = container.querySelectorAll(".dp-step-card");
    expect(stepCards).toHaveLength(4);
    for (const card of stepCards) {
      expect(card).toHaveClass("hover:-translate-y-1", "hover:shadow-hard-sm");
      expect(card).not.toHaveClass("cursor-pointer");
      expect(card).not.toHaveAttribute("role", "button");
    }
    expect(container.querySelectorAll(".dp-step-active-glow")).toHaveLength(1);

    const horizontalConnectors = container.querySelectorAll(".dp-flow-connector-h");
    const verticalConnectors = container.querySelectorAll(".dp-flow-connector-v");
    expect(horizontalConnectors).toHaveLength(3);
    expect(verticalConnectors).toHaveLength(3);
    expect(horizontalConnectors[0]).toHaveClass("h-1.5", "w-8", "bg-brand-teal");
    expect(horizontalConnectors[2]).toHaveClass("bg-neutral-300");
    expect(verticalConnectors[0]).toHaveClass("h-8", "w-1.5", "bg-brand-teal");
    expect(verticalConnectors[2]).toHaveClass("bg-neutral-300");

    const styles = container.querySelector("style")?.textContent;
    expect(styles).toContain("animation: dp-flow-fill-h 600ms");
    expect(styles).toContain('[data-connector="2"] { animation-delay: 1650ms; }');
    expect(styles).toContain("animation: dp-step-glow-pulse 2.8s");
    expect(styles).toContain("prefers-reduced-motion: reduce");
    expect(styles).toContain(".dp-step-active-glow");
    expect(styles).toContain("opacity: 0.2");
  });

  it("uses a white surface for the differentiators section", () => {
    const { container } = render(<WhyDirakitProSection />);

    expect(screen.getByRole("heading", { level: 2, name: "Bukan cuma selesai belajar." })).toBeInTheDocument();
    expect(container.querySelector("section")).toHaveClass("bg-surface");
  });

  it("keeps the final CTA heading and action in the DOM", () => {
    const { container } = render(<FinalCtaSection />);

    expect(screen.getByRole("heading", { level: 2, name: "Rakitan pertamamu dimulai di sini." })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mulai Merakit" })).toHaveAttribute("href", "/register");
    expect(container.querySelector("section")).toHaveClass("bg-brand-ink");
    expect(container.querySelector(".dp-css-reveal")).toBeInTheDocument();
  });
});
