## 1. Grid Responsive Adjustments

- [x] 1.1 Update the grid layout container on the main dashboard (`frontend/app/inicio/page.tsx`) to split into `md:grid-cols-10` with spans of 6 and 4 starting at tablet sizes

## 2. Height and Scroll Optimization

- [x] 2.1 Remove hardcoded heights (`lg:h-[560px]`, `h-full`, and `flex-1`) from both columns and their inner cards to allow them to flow and size naturally vertically
- [x] 2.2 Remove horizontal/vertical scroll wrappers (`overflow-y-auto min-h-0`) from all cards in the dashboard, ensuring natural layout flow

## 3. Verification

- [x] 3.1 Run build validation (`npm run build`) to ensure no compilation or navigation errors occur
