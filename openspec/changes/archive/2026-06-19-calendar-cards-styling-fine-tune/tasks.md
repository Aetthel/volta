## 1. Card Layout Adjustment

- [x] 1.1 Update `frontend/app/agenda/page.tsx` to remove the left border color stripe (`border-l-[5px]`) from cards
- [x] 1.2 Change card rounded class from `rounded-md`/`rounded-lg` to sharp `rounded-[4px]` (short events) and `rounded-[6px]` (normal events)
- [x] 1.3 Change card background color back to solid category colors (`app.colorClass`) with dynamic highlights (`isActive`/`isNext` rings/glow)
- [x] 1.4 Update text elements to inherit text color and use opacity (e.g. `opacity-80` for client name) rather than forcing surface variables

## 2. Verification

- [x] 2.1 Run build validation (`npm run build`) to ensure no compilation or navigation errors occur
