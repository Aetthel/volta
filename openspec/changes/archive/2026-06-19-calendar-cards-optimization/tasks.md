## 1. Position and Expansion Calculations

- [x] 1.1 Modify `calculateOverlaps` in `frontend/app/agenda/page.tsx` to compute a lookahead column check, calculate `colspan`, and compute left/width offset percentages with 30% overlap

## 2. Visual Stacking and Cards Design

- [x] 2.1 Update card border-l styles to match the service category colors (primary, secondary, tertiary), and set the card background to a clean, light `bg-surface-container-lowest` color
- [x] 2.2 Implement inline text rendering for short cards (height <= 45px) with service name and client name inline side-by-side
- [x] 2.3 Add transition and dynamic hover styles (`hover:z-30 hover:scale-[1.03] transition-all`) to event cards

## 3. Verification

- [x] 3.1 Run build validation (`npm run build`) to ensure no compilation or navigation errors occur
