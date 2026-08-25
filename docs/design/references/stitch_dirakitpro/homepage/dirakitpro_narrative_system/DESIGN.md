---
name: DirakitPro Narrative System
colors:
  surface: '#fff8f0'
  surface-dim: '#dfd9d2'
  surface-bright: '#fff8f0'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f9f3eb'
  surface-container: '#f3ede5'
  surface-container-high: '#ede7e0'
  surface-container-highest: '#e7e2da'
  on-surface: '#1d1b17'
  on-surface-variant: '#4c463f'
  inverse-surface: '#32302b'
  inverse-on-surface: '#f6f0e8'
  outline: '#7d766e'
  outline-variant: '#cec5bc'
  surface-tint: '#645d56'
  primary: '#16120c'
  on-primary: '#ffffff'
  primary-container: '#2b2620'
  on-primary-container: '#958d84'
  inverse-primary: '#cec5bc'
  secondary: '#835500'
  on-secondary: '#ffffff'
  secondary-container: '#feae2c'
  on-secondary-container: '#6b4500'
  tertiary: '#00170b'
  on-tertiary: '#ffffff'
  tertiary-container: '#002e1b'
  on-tertiary-container: '#32a070'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ebe1d7'
  primary-fixed-dim: '#cec5bc'
  on-primary-fixed: '#1f1b15'
  on-primary-fixed-variant: '#4c463f'
  secondary-fixed: '#ffddb4'
  secondary-fixed-dim: '#ffb955'
  on-secondary-fixed: '#291800'
  on-secondary-fixed-variant: '#633f00'
  tertiary-fixed: '#8ef7c0'
  tertiary-fixed-dim: '#71dba5'
  on-tertiary-fixed: '#002112'
  on-tertiary-fixed-variant: '#005234'
  background: '#fff8f0'
  on-background: '#1d1b17'
  surface-variant: '#e7e2da'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  caption:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1200px
  gutter: 24px
---

## Brand & Style

The design system is built on a "Craftsman’s Workshop" philosophy. It moves away from the cold, sterile nature of traditional SaaS to create a space that feels tactile, supportive, and human. The visual personality is grounded in professional reliability while maintaining a warm, approachable atmosphere specifically for Indonesian beginners.

The style is a blend of **Minimalism** and **Tactile Modernism**. It prioritizes high-quality typography and generous whitespace to reduce cognitive load for new learners. Unlike typical "ed-tech" apps that rely on bright primary colors and childish illustrations, this system uses a sophisticated, editorial-inspired palette and structured layouts to signify quality and professional outcomes.

Key visual principles:
- **Outcome-First:** Every screen should clearly highlight progress and tangible goals.
- **Warm Professionalism:** Using cream and ink instead of white and black to reduce eye strain and feel more "crafted."
- **Clarity over Flash:** Transitions and effects are functional, not decorative.

## Colors

The palette is inspired by natural materials—paper, ink, and wood—to evoke a sense of physical learning tools.

- **Surface (#FDF7EF):** A warm off-white used as the primary background. It provides a soft, non-clinical environment for long reading sessions.
- **Text & Structure (#2B2620):** A deep, warm ink used for all primary text, borders, and structural elements. It provides high contrast without the harshness of pure black.
- **Action & Accent (#F5A623):** A warm amber used exclusively for primary calls-to-action and key interactive highlights. It represents energy and optimism.
- **Progress & Success (#2F9E6E):** A restrained teal used for completion states, badges, and progress indicators. It is calming and signifies growth.
- **Elevation Layer (#FFFFFF):** Pure white is reserved for cards, modals, and "Project Surfaces"—areas where the student is actively creating or viewing content.

## Typography

The typography system uses an editorial scale to create a clear information hierarchy. 

**Manrope** is used for headlines and UI labels. Its geometric but slightly softened terminals feel modern and professional. It provides the "Structure" in the brand personality.

**Be Vietnam Pro** is used for all body text. It is exceptionally legible for Indonesian readers and has a friendly, contemporary character that makes long-form educational content feel less daunting.

**Usage Rules:**
- Use `display-lg` for landing page hero sections only.
- Body text should never go below `body-md` (16px) for core learning content to ensure accessibility for beginners.
- Use `label-md` in All Caps sparingly for section headers to add a "structured" feel.

## Layout & Spacing

This design system utilizes a **12-column Fluid Grid** with fixed maximum constraints for readability.

- **Desktop (1440px+):** 12 columns, 24px gutters, 80px side margins.
- **Tablet (768px - 1023px):** 8 columns, 16px gutters, 40px side margins.
- **Mobile (Up to 767px):** 4 columns, 16px gutters, 16px side margins.

**Rhythm:** Spacing follows a base-8 increment. Use `lg` (48px) to separate major content sections and `md` (24px) for internal card padding. For educational modules, content width is capped at 720px (approx. 8 columns) to maintain an optimal line length for reading.

## Elevation & Depth

The system uses **Tonal Layering** combined with **Restrained Shadows** to create a sense of physical papers on a workshop desk.

- **Level 0 (Base):** Warm Surface (#FDF7EF). This is the "floor" of the application.
- **Level 1 (Cards/Content):** White (#FFFFFF) with a very thin (1px) border in Deep Warm Ink at 10% opacity. This creates a subtle lift without needing heavy shadows.
- **Level 2 (Interactive/Floating):** White (#FFFFFF) with a soft, diffused shadow. 
  - *Shadow Specs:* Y: 4px, Blur: 12px, Color: #2B2620 at 8% opacity.
- **Focus State:** 2px solid stroke of Warm Amber (#F5A623) with a 4px offset.

Avoid using heavy blurs or colorful glows. The depth should feel "printed" and intentional.

## Shapes

The shape language is **Rounded (Level 2)**. This specific radius (8px base) strikes a balance between the "sharpness" of professional tools and the "softness" of a friendly mentor.

- **Standard Elements (Buttons, Inputs, Cards):** 8px (0.5rem).
- **Large Containers (Modals, Feature Sections):** 16px (1rem).
- **Progress Bars & Badges:** Full pill-shaped (999px) to contrast against the structured grid.

Borders should be kept thin (1px) and use the Deep Warm Ink color at low opacities (15-20%) to maintain a "crafted" look.

## Components

### Buttons
- **Primary:** Warm Amber background, Deep Warm Ink text. Bold, 8px radius.
- **Secondary:** Deep Warm Ink ghost style (transparent background, 1px ink border).
- **Action Feedback:** On click, buttons shift 1px down to simulate a tactile press.

### Chips & Badges
- **Status Badges:** Small, uppercase `label-md` font. For "Completed," use the Restrained Teal with 10% opacity background.
- **Tags:** Surface-colored (#FDF7EF) background with 1px border.

### Input Fields
- **Default:** White background, 1px Ink border (20% opacity). 
- **Focus:** Border color shifts to Warm Amber.
- **Labels:** Always placed above the input in `label-md`, never hidden as placeholders.

### Cards (The "Learning Module")
- White background, 8px radius, 1px subtle border. 
- Internal padding is 24px (md).
- Use a vertical "Progress Stripe" (4px wide) on the left edge of cards to indicate active/completed status using the Teal accent.

### Progress Trackers
- Use a thick (8px) track height.
- Background track in Deep Warm Ink at 5% opacity.
- Fill in Restrained Teal. No gradients.

### Lists
- Use "Clean Separators"—1px ink lines at 10% opacity.
- Include generous vertical padding (16px) between items to ensure a "beginner-friendly" readable list.