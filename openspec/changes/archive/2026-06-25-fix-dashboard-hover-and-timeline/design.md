## Context

Ajuste final del timeline de citas y deshabilitación del hover de las MetricCards.

## Goals / Non-Goals

**Goals:**
- Centrar con exactitud milimétrica el nodo del timeline sobre la línea vertical utilizando una técnica de contenedor absoluto de ancho cero.
- Eliminar los efectos de hover de escala, sombra y bordes en `MetricCard.tsx`.

## Decisions

- **Nodo con contenedor absoluto w-0 h-0:** Para resolver el problema de desalineación en pantallas con zoom (base 18px / rems), usaremos un contenedor `absolute -left-6 top-1/2 -translate-y-1/2 w-0 h-0 flex items-center justify-center` y colocaremos el círculo en su interior. Esto elimina la necesidad de `translate-x` y alinea el centro exacto del círculo con la línea vertical (que está a `-left-6` = `-24px` de distancia).
- **Desactivación de hover en MetricCards:** Revertir la clase del contenedor de `MetricCard` a una clase plana sin prefijos `hover:`.
