## 1. Preparación e Infraestructura

- [x] 1.1 Crear las nuevas carpetas `controllers/` y `services/` bajo `backend/src/`.

## 2. Refactorización del Módulo de Clientes

- [x] 2.1 Crear `backend/src/services/clientsService.js` extrayendo las consultas Prisma y lógica de negocio (como el envío de LOPD).
- [x] 2.2 Crear `backend/src/controllers/clientsController.js` para gestionar el intercambio HTTP (request/response) de clientes.
- [x] 2.3 Refactorizar `backend/src/routes/clients.js` para que solo defina las rutas HTTP y delegue la lógica en el controlador de clientes.

## 3. Refactorización del Módulo de Citas (Appointments)

- [x] 3.1 Crear `backend/src/services/appointmentsService.js` encapsulando la lógica de creación y actualización de citas de Prisma.
- [x] 3.2 Crear `backend/src/controllers/appointmentsController.js` para canalizar las peticiones HTTP de citas.
- [x] 3.3 Refactorizar `backend/src/routes/appointments.js` para mapear las rutas HTTP directamente hacia el controlador de citas.
