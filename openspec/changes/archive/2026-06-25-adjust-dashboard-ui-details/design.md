## Context

Pequeños ajustes visuales de alineación y limpieza visual en las tarjetas de citas diarias del panel de control.

## Goals / Non-Goals

**Goals:**
- Ajustar el border-radius de las tarjetas de citas del listado a la redondez estándar.
- Eliminar el borde coloreado izquierdo de las citas.
- Ocultar visualmente el badge de estado si la cita está en estado `PENDING`.
- Alinear el punto (nodo) del timeline al eje de la línea vertical usando `-translate-x-1/2` y un posicionamiento relativo a la sangría.

**Non-Goals:**
- Cambiar la lógica de persistencia de las citas.

## Decisions

- **Alineación de Timeline:** Posicionar el nodo a la izquierda utilizando `left-[value]` y la traslación `transform: translateX(-50%)` para asegurar que el centro del nodo coincida con el píxel exacto de la línea vertical.
- **Ocultamiento de Badge Pendiente:** Condicionar la renderización del componente `Badge` a `app.status !== "PENDING"`.
