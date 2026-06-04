# Volta UI Design System Standard (Zoomed-In Pro)

This document defines the visual and architectural standards for the Volta Salon Pro interface. All new components must adhere to these rules to maintain the "Zoomed-In" premium aesthetic.

## 1. Core Tokens

### Typography (Refined Zoom)
- **Base Font Size**: `18px` (defined in `layout.js`).
- **Headings**: Use `font-semibold` or `font-medium`. **NEVER** use `font-black` or `font-bold` for large titles to avoid a "heavy" look.
- **Weights**:
  - Titles: `text-5xl font-semibold`
  - Subtitles: `text-sm font-semibold uppercase tracking-[0.3em]`
  - Body: `text-base font-medium`
  - Meta/Caption: `text-[11px] font-semibold uppercase tracking-widest`

### Colors (Teal Precision)
- **Primary**: `teal-600` (`#0d9488`). Used for main actions and branding.
- **Surface**: `white`. All data containers must be pure white.
- **Background**: `slate-50`. Use for the main app canvas.
- **Borders**: `slate-100`. Use for subtle separation.

### Shapes & Depth
- **Main Containers**: `rounded-[3rem]` (48px).
- **Secondary Cards/Buttons**: `rounded-[2rem]` (32px).
- **Small Elements (Icons/Badges)**: `rounded-[1.25rem]` (20px).
- **Shadows**: **NO SHADOWS** on colored elements. Use `shadow-sm` ONLY on white cards over a slate background.

## 2. Component Architecture

### The Volta Card
Atomic container for all data modules.
- **Padding**: Large (`p-10` to `p-14`).
- **Border**: `border-slate-100`.
- **Interaction**: `hover:border-teal-200 transition-all`.

### The Volta Input (Outlined)
- **Height**: `h-20`.
- **Radius**: `rounded-2xl`.
- **Focus**: `focus:border-teal-600 focus:ring-2 focus:ring-teal-600/10`.
- **Label**: Floating/Elevated font-semibold meta text.

### The Volta Button
- **Height**: `h-20` (Primary) or `h-14` (Action).
- **Font**: `font-semibold text-sm uppercase tracking-widest`.
- **Feedback**: `active:scale-[0.98] transition-all`.

## 3. Layout Principles
- **Max-Width**: Limit main content to `max-w-5xl` to force the "Zoomed" prominence.
- **Padding**: Generous (`lg:p-20`) to prevent information overload.
- **Icons**: Thin strokes (`stroke-[1.5]` or `stroke-[2]`) to match the refined typography.
