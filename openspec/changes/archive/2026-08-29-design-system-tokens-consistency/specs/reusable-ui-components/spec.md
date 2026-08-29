## ADDED Requirements

### Requirement: Adherencia Estricta a Tokens Semánticos de Volta UI
Todos los componentes visuales e interactivos SHALL utilizar tokens semánticos de diseño (`bg-surface`, `bg-surface-container-*`, `text-on-surface`, `text-on-surface-variant`, `border-outline-variant`) en lugar de colores fijos de Tailwind o valores hexadecimales hardcodeados.

#### Scenario: Visualización en diferentes temas y paletas
- **WHEN** un usuario selecciona una paleta de color o conmuta entre modo claro y oscuro
- **THEN** todas las superficies, textos y bordes se adaptan dinámicamente preservando los ratios de contraste WCAG AA

### Requirement: Estandarización de Controles Interactivos y Micro-Interacciones
Todos los botones de acción SHALL implementarse a través del componente `<Button>` unificado, garantizando micro-interacciones táctiles homogéneas (`active:scale-[0.98]`), estados de foco accesibles (`focus-visible:ring-2`) e indicadores de carga integrados.

#### Scenario: Interacción con botones de acción
- **WHEN** el usuario pulsa o navega por teclado sobre cualquier botón
- **THEN** el botón responde con la animación de compresión sutil y el anillo de enfoque accesible
