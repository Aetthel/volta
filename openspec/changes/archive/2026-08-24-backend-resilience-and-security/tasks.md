## 1. Validación de Configuración y Secretos

- [x] 1.1 Implementar validación Zod de variables de entorno en `backend/src/config/index.js`
- [x] 1.2 Añadir esquemas de validación Zod para peticiones en `backend/src/controllers/publicBookingController.js`

## 2. Resiliencia e Infraestructura

- [x] 2.1 Configurar `retryStrategy` exponencial en `backend/src/config/redis.js`
- [x] 2.2 Implementar manejador de *Graceful Shutdown* en `backend/src/index.js` para `SIGTERM` / `SIGINT`

## 3. Pruebas y Verificación

- [x] 3.1 Verificar mediante pruebas unitarias que la falta de variables detenga el arranque
