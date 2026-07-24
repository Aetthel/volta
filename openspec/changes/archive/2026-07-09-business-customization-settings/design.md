## Context

The user wants to allow each business to personalize the styling of their dashboard application, including:

1. **Primary Color Palette**: Select from a set of predefined corporate color schemes (Teal, Indigo, Rose, Amber, Emerald).
2. **Text Sizing**: Scale all text elements across the app in 3 levels (Pequeño, Mediano/Predeterminado, Grande).
3. **Border Radius**: Customize border roundedness in 3 levels (Recto/Sin redondeado, Suave/Predeterminado, Muy Redondeado).

## Goals / Non-Goals

**Goals:**

- Add `themeColor`, `fontSizeLevel`, and `borderRadiusLevel` fields to the database `Business` model.
- Expose these styling options under a new "Personalización" section on the `/ajustes` page.
- Load the styling choices from the logged-in user's business dynamically when mounting the workspace.
- Propagate colors, text sizing, and border roundedness globally using Tailwind v4 CSS Custom Properties (CSS variables) dynamically updated on the document root.

**Non-Goals:**

- Allow custom arbitrary hex inputs (only select from a predefined list of high-quality palettes).
- Change layout structure dynamically (only spacing/fonts/colors/borders change).

## Decisions

### 1. Database Schema Extensions

We will add the following fields to the `Business` table in `schema.prisma`:

- `themeColor`: `String` with default `"TEAL"`
- `fontSizeLevel`: `String` with default `"MEDIUM"`
- `borderRadiusLevel`: `String` with default `"MEDIUM"`

### 2. Predefined Theme Palettes

We will define 4 distinct corporate palettes to choose from:

- **Teal (Default)**:
  - `--color-primary`: `#006565`
  - `--color-primary-container`: `#008080`
  - `--color-secondary`: `#296767`
  - `--color-secondary-container`: `#b0eeed`
- **Indigo**:
  - `--color-primary`: `#3f51b5`
  - `--color-primary-container`: `#c5cae9`
  - `--color-secondary`: `#303f9f`
  - `--color-secondary-container`: `#e8eaf6`
- **Rose**:
  - `--color-primary`: `#e91e63`
  - `--color-primary-container`: `#f8bbd0`
  - `--color-secondary`: `#c2185b`
  - `--color-secondary-container`: `#fce4ec`
- **Amber**:
  - `--color-primary`: `#ff9800`
  - `--color-primary-container`: `#ffe082`
  - `--color-secondary`: `#f57c00`
  - `--color-secondary-container`: `#fff8e1`

### 3. Dynamic Styling Propagation (Global CSS)

We will update `globals.css` to redefine variables using multiplier coefficients:

- **Font Scale factor (`--font-scale`)**:
  - `SMALL`: `0.9`
  - `MEDIUM` (Default): `1.0`
  - `LARGE`: `1.15`
- **Radius Scale factor (`--radius-scale`)**:
  - `SMALL` (Sharp/None): `0.0`
  - `MEDIUM` (Default/Suave): `1.0`
  - `LARGE` (Muy Redondeado): `2.0`

Redefinitions in `globals.css`:

```css
:root {
  --font-scale: 1;
  --radius-scale: 1;

  --text-body-lg: calc(1rem * var(--font-scale));
  --text-body-md: calc(0.875rem * var(--font-scale));
  --text-body-sm: calc(0.75rem * var(--font-scale));
  --text-title-lg: calc(1.25rem * var(--font-scale));
  --text-title-md: calc(1.125rem * var(--font-scale));
  --text-headline-lg: calc(1.75rem * var(--font-scale));
  --text-headline-md: calc(1.5rem * var(--font-scale));
  --text-headline-sm: calc(1.25rem * var(--font-scale));
  --text-label-lg: calc(0.875rem * var(--font-scale));
  --text-label-md: calc(0.75rem * var(--font-scale));
  --text-label-sm: calc(0.7rem * var(--font-scale));

  --radius-sm: calc(0.25rem * var(--radius-scale));
  --radius-md: calc(0.375rem * var(--radius-scale));
  --radius-lg: calc(0.5rem * var(--radius-scale));
  --radius-xl: calc(0.75rem * var(--radius-scale));
  --radius-default: calc(0.375rem * var(--radius-scale));
}
```

We will create a Client Component `<ThemeInitializer />` placed inside `RootLayout` that fetches/subscribes to the active business configuration, updating CSS variables on `document.documentElement` dynamically.

## Risks / Trade-offs

- **[Risk]**: The user might experience a flash of default (Teal/Medium) styling on page load before the session is retrieved.
  - **Mitigation**: Server-render default styling variables and apply the theme Client Component immediately upon hydration.
