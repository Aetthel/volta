# Design: Granular RBAC & Role Permission Security

## Role Permission Matrix

| Route / API                    | ADMIN | JEFE | EMPLEADO                   |
| :----------------------------- | :---- | :--- | :------------------------- |
| `/inicio`                      | ✅    | ✅   | ✅                         |
| `/agenda`                      | ✅    | ✅   | ✅                         |
| `/clientes`                    | ✅    | ✅   | ✅                         |
| `/ajustes` (Front)             | ✅    | ✅   | ❌ (Redirect to `/inicio`) |
| `/sedes` (Front)               | ✅    | ❌   | ❌                         |
| `/admin` (Front)               | ✅    | ❌   | ❌                         |
| `/api/whatsapp/*`              | ✅    | ✅   | ❌ (403 Forbidden)         |
| `/api/business/*` (PUT)        | ✅    | ✅   | ❌ (403 Forbidden)         |
| `/api/users/*` (Create/Delete) | ✅    | ✅   | ❌ (403 Forbidden)         |

## Backend Middleware (`backend/src/middleware/authMiddleware.js`)

```js
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: "No autorizado." });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Acceso denegado: Permisos insuficientes." });
    }
    next();
  };
};
```

## Frontend Navigation (`Sidebar.tsx`)

Filter sidebar navigation links dynamically using `session.user.role`:

- If `role === 'EMPLEADO'`, omit `/ajustes`.
- If `role !== 'ADMIN'`, omit `/sedes` and `/admin`.
