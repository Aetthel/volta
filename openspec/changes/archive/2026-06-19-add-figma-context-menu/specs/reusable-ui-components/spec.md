## ADDED Requirements

### Requirement: Componente de Menú Contextual Estilo Figma
El sistema SHALL proporcionar un conjunto de componentes reutilizables de menú contextual (`ContextMenu`, `ContextMenuTrigger`, `ContextMenuContent`, `ContextMenuItem`, `ContextMenuSeparator`) en `volta-ui.tsx` para gestionar menús de clic derecho (desktop) y de pulsación prolongada (móviles/táctiles). Este componente debe seguir los estándares visuales de Volta UI con tipografía en peso medio/semibold, bordes redondeados y micro-animaciones de entrada de escala/opacidad.

#### Scenario: Clic derecho sobre el disparador abre el menú en las coordenadas del cursor
- **WHEN** el usuario realiza un clic derecho (evento `contextmenu`) sobre un elemento envuelto en `ContextMenuTrigger`
- **THEN** el sistema previene el comportamiento por defecto del navegador y despliega el componente `ContextMenuContent` justo en la posición X e Y del cursor, con una transición suave de entrada y adaptándose a los límites de la pantalla para evitar desbordamientos.

#### Scenario: Pulsación prolongada en móvil despliega el menú contextual
- **WHEN** un usuario en un dispositivo táctil mantiene presionado un elemento envuelto en `ContextMenuTrigger` durante más de 500 ms (evento `touchstart`/`touchend` con temporizador)
- **THEN** el sistema despliega el menú contextual (`ContextMenuContent`) en la posición táctil del usuario de forma análoga al comportamiento de escritorio.
