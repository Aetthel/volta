## 1. Reusable Context Menu Component

- [x] 1.1 Implement context menu state and subcomponents (`ContextMenu`, `ContextMenuTrigger`, `ContextMenuContent`, `ContextMenuItem`, `ContextMenuSeparator`) in `frontend/components/ui/volta-ui.tsx` with screen boundary overflow detection and scale/fade entrance transition
- [x] 1.2 Add touch long-press gesture detection inside `ContextMenuTrigger` to dispatch the virtual context menu on mobile screens

## 2. Integrate Client Table Context Actions

- [x] 2.1 Refactor `frontend/app/clientes/page.tsx` table rows to use `<ContextMenuTrigger>` and map quick actions (Edit, Delete, Send LOPD/Custom WhatsApp)
- [x] 2.2 Add clipboard copy options ("Copiar teléfono", "Copiar email") to the client context menu and trigger existing Toast notifications for confirmation

## 3. Integrate Calendar Agenda Context Actions

- [x] 3.1 Refactor `frontend/app/inicio/page.tsx` appointment cards to use `<ContextMenuTrigger>` and map quick actions (Edit/View, Change status, Delete appointment)
- [x] 3.2 Add empty grid slot cell context menu actions to allow booking a new appointment at the right-clicked day/time slot
- [x] 3.3 Implement delete appointment and status updates in `inicio/page.tsx` to handle context menu events

## 4. Verification

- [x] 4.1 Verify correct execution of context menus, responsive alignment, and compilation success by running the project build
