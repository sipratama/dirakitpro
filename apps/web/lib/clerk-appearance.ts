// Minimal theming of Clerk's built-in UI with DESIGN.md tokens (2.1, 4) —
// not a custom-designed auth page. Layout/IA for auth screens isn't speced yet.
export const clerkAppearance = {
  variables: {
    colorPrimary: "#F5A623", // brand-amber
    colorText: "#2B2620", // brand-ink
    colorBackground: "#FFFFFF", // surface
    colorInputBackground: "#FFFFFF",
    colorInputText: "#2B2620",
    borderRadius: "10px", // control radius (DESIGN.md 4)
    fontFamily: "var(--font-sans)",
  },
};
