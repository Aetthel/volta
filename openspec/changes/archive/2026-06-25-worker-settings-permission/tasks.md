## 1. Ajustes en Navegación (Sidebar & BottomNav)

- [x] 1.1 Modificar [Sidebar.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/components/Sidebar.tsx) para incluir la opción "Ajustes" en el listado de navegación para el rol `EMPLEADO`.
- [x] 1.2 Modificar [BottomNav.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/components/BottomNav.tsx) para incluir la opción "Ajustes" en el listado de navegación para el rol `EMPLEADO`.

## 2. Ajustes en Vista de Configuración

- [x] 2.1 Modificar [ajustes/page.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/app/ajustes/page.tsx) para renderizar las pestañas "Mensajes y WhatsApp" y "Gestión del Negocio" únicamente si `role !== "EMPLEADO"`.
- [x] 2.2 Modificar [ajustes/page.tsx](file:///Users/kore/Documents/Code/Projects/volta/frontend/app/ajustes/page.tsx) para restringir el renderizado de los contenidos de otras pestañas si `role === "EMPLEADO"`.

## 3. Validación

- [x] 3.1 Comprobar que el proyecto compila y construye en producción sin errores.
