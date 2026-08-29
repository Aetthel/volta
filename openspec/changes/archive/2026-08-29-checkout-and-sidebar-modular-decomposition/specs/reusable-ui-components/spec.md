## ADDED Requirements

### Requirement: Descomposición Modular de Checkout y Navegación Lateral
El modal de checkout y la barra lateral de navegación SHALL estructurar sus vistas en submódulos especializados dentro de `frontend/components/checkout/` y `frontend/components/sidebar/`.

#### Scenario: Pasos de suscripción y navegación
- **WHEN** un usuario avanza en los pasos de contratación o navega entre secciones protegidas
- **THEN** los componentes de cada paso gestionan su estado local e integran la pasarela de LemonSqueezy o el control de permisos sin sobrecargar los orquestadores
