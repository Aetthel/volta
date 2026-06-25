## 1. QR Code Display Fix

- [x] 1.1 Correct the image rendering source in `frontend/app/inicio/page.tsx` under the WhatsApp connection widget to use `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`.

## 2. Card Header Standardization

- [x] 2.1 Refactor the "Citas de Hoy" card header in `frontend/app/inicio/page.tsx` to remove the date/day subtitle and the total appointments badge.
- [x] 2.2 Add `CalendarIcon` to the card title flex container in `frontend/app/inicio/page.tsx` to align it with adjacent cards.

