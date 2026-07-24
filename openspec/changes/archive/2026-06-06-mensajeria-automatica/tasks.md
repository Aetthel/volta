## 1. Backend Implementation

- [x] 1.1 Create WhatsApp pairing endpoints `/api/whatsapp/init`, `/api/whatsapp/status`, and `/api/whatsapp/disconnect` in the Express router
- [x] 1.2 Create templates API endpoints `GET /api/whatsapp/templates` and `POST /api/whatsapp/templates` to retrieve and save templates
- [x] 1.3 Create a public, unauthenticated endpoint `POST /api/lopd/:id/accept` to update client status to Aceptado
- [x] 1.4 Modify `POST /api/appointments` to automatically send the LOPD consent message if the client is Pendiente, and skip the welcome message
- [x] 1.5 Modify `sendWelcomeMessage` and `runSentinel` in `bot.js` to ensure they only send messages if `client.lopdStatus === 'Aceptado'`
- [x] 1.6 Implement retroactive sending of the welcome message for future appointments immediately after a client grants LOPD consent

## 2. Frontend UI Implementation

- [x] 2.1 Add the "Mensajes y WhatsApp" tab/interface in `frontend/app/ajustes/page.tsx`
- [x] 2.2 Implement the WhatsApp Pairing card (shows status, button to initialize, renders QR code, handles polling, and shows disconnect button)
- [x] 2.3 Implement the template editor forms (with fields for welcomeMessage and reminderMessage, dynamic preview, and save action)
- [x] 2.4 Create the public LOPD consent page at `frontend/app/lopd/[id]/page.tsx` with high-quality styling, explicit consent text, and acceptance action
