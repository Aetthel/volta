## Context

La aplicación Volta cuenta con vistas de alta interacción (Agenda/EventManager con vistas mes/semana/día, tablas de Clientes con LOPD, paneles de Ajustes y métricas de Inicio). La arquitectura utiliza Next.js 15 (App Router) y Tailwind CSS.

## Goals / Non-Goals

**Goals:**
- Implementar división por chunks (`next/dynamic`) en componentes secundarios y modales pesados.
- Optimizar hooks (`useMemo`, `useCallback`, saneamiento de arrays de dependencias con primitivos).
- Eliminar cascadas asíncronas innecesarias en carga de vistas compuestas.
- Mantener 100% de compatibilidad funcional y cero regresiones visuales.

**Non-Goals:**
- No modificar el esquema de base de datos ni modelos de Prisma.
- No alterar endpoints REST de backend ni contratos de autenticación.

## Decisions

1. **`next/dynamic` en Secciones de Ajustes y Modales**:
   - *Decisión*: Cargar `ProfileSection`, `MessagesSection`, `BusinessSection`, `BillingSection`, `PersonalizationSection`, `UpgradeProModal`, `NewAppointmentModal` y `AddClientModal` con `next/dynamic`.
   - *Alternativa considerada*: Mantener imports estáticos globales. Se descartó porque sobrecargaba el First Load JS con componentes que el usuario no visualiza inmediatamente.
2. **Memoización focalizada (`useMemo`) en transformaciones de datos**:
   - *Decisión*: Aplicar `useMemo` a filtros de catálogo (`filteredServices`), resolución de plantillas de mensajería (`previewMessage`) y ordenamiento de miembros de equipo.
   - *Alternativa considerada*: Recalcular en cada ciclo de render. Se descartó para evitar micro-bloqueos en el hilo principal durante la escritura del usuario.
3. **Dependencias primitivas en `useEffect` (`rerender-dependencies`)**:
   - *Decisión*: Reemplazar dependencias de objetos completos (`session`) por identificadores inmutables (`session?.user?.id`, `businessId`).
   - *Alternativa considerada*: Usar `JSON.stringify(session)`. Se descartó por coste innecesario de serialización.

## Risks / Trade-offs

- **[Flash de Carga / Layout Shift en componentes dinámicos]** → Se mitiga proporcionando esqueletos de carga (`loading: () => <SkeletonSection />`) con dimensiones visuales equivalentes.
- **[Stale closures en hooks memoizados]** → Se mitiga definiendo estrictamente todas las dependencias reactivas requeridas por ESLint y TypeScript.
