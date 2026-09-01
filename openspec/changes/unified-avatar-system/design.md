## Context

Ver `proposal.md` para la motivación. Actualmente existen múltiples implementaciones locales de avatares en componentes de clientes, equipo, encabezado y barra lateral.

## Goals / Non-Goals

**Goals:**
- Proporcionar un componente canónico y tipado `<Avatar />` y `<AvatarGroup />` en `frontend/components/ui/avatar.tsx`.
- Implementar una función hash determinista para seleccionar uno de los 7 tonos pastel sin importar el tema activo.
- Sustituir el 100% de las implementaciones manuales de avatares en la plataforma.

**Non-Goals:**
- No incluir puntos de estado de conexión, badges LOPD o microindicadores en los avatares (se mantiene el diseño puro y limpio).
- No alterar esquemas de base de datos ni modelos de Prisma (las URLs existentes `avatarUrl`, `logoUrl`, etc. son suficientes).

## Decisions

### 1. Algoritmo de Color Pastel Determinista
- **Decisión**: Utilizar una función de hash simple (`(hash << 5) - hash + char.charCodeAt(0)`) sobre el nombre o ID para indexar un array inmutable de 7 combinaciones de colores pastel (`bg-*-100 text-*-800 border-*-200/60`).
- **Alternativas consideradas**: 
  - *Colores dinámicos del tema activo*: Descartado para evitar que todos los usuarios compartan el mismo color exacto sin foto.
  - *Generación aleatoria*: Descartado porque cambiaría el color en cada recarga de página.

### 2. Forma Semántica: Personas vs Negocios
- **Decisión**: 
  - `type="person"` (default): `rounded-full` con 2 iniciales.
  - `type="business"`: `rounded-xl` con 1 inicial.
- **Alternativas consideradas**: Forzar todo circular. Se descartó porque los logos de negocios quedan cortados en círculos estrictos y visualmente ayuda a diferenciar humanos de organizaciones.

### 3. Agrupación y Superposición
- **Decisión**: `<AvatarGroup />` implementa `-space-x-2.5 hover:-space-x-1` con anillo de corte `border-2 border-surface` y badge neutral `+N` (`bg-surface-container-highest`).

## Risks / Trade-offs

- *[Imágenes rotas o URLs caídas]* → El componente `Avatar` captura el evento `onError` nativo de la etiqueta `<img>` y conmuta instantáneamente al fallback pastel con iniciales sin parpadeos.
- *[Nombres compuestos o de una sola letra]* → La función `getInitials` extrae las dos primeras letras de nombres individuales o la primera letra del nombre y primer apellido de forma segura.
