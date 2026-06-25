## Context

Corrección del desfase horizontal de los círculos del timeline.

## Goals / Non-Goals

**Goals:**
- Centrar exactamente el nodo circular del timeline sobre la línea vertical.
- Evitar el uso de clases conflictivas de translate horizontal y vertical en Tailwind v4.

**Non-Goals:**
- Modificar otros aspectos visuales.

## Decisions

- **Alineación sin translate horizontal:** En lugar de posicionar a `-left-[24px]` y aplicar `-translate-x-1/2` (que entra en conflicto con `-translate-y-1/2` en Tailwind v4 al traducirse al mismo atributo CSS `translate`), se calculará de forma estática la distancia: `-left-[29px]` (24px de padding + 5px de la mitad del ancho de 10px). Esto mantiene el círculo exactamente centrado en el eje de la línea vertical.
