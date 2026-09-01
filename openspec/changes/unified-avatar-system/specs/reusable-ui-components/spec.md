## ADDED Requirements

### Requirement: Sistema Unificado de Avatares e Identidad Visual
El sistema SHALL proporcionar un componente canónico de avatar (`Avatar`) y de grupo de avatares (`AvatarGroup`) en `frontend/components/ui/` y re-exportados en `volta-ui.tsx`, garantizando que todas las entidades visuales de la plataforma (clientes, trabajadores, usuarios administradores y logotipos de negocio) utilicen una estructura estandarizada sin microindicadores invasivos.

#### Scenario: Visualización de avatar de persona con foto
- **WHEN** se renderiza un avatar de cliente, usuario o trabajador que cuenta con una URL de imagen válida (`src`)
- **THEN** el sistema renderiza la imagen con forma circular (`rounded-full`), ajuste `object-cover` y borde sutil de contorno sin microindicadores en las esquinas.

#### Scenario: Fallback con iniciales y paleta pastel determinista
- **WHEN** se renderiza un avatar de persona sin imagen cargada o con error de carga
- **THEN** el sistema calcula de forma determinista a partir del nombre/ID uno de los 7 tonos pastel fijos (Verde Salvia, Rosa Empolvado, Lavanda, Melocotón, Azul Cielo, Malva Suave, Menta Pastel) y renderiza 2 iniciales en mayúsculas con alto contraste accesible.

#### Scenario: Diferenciación de forma para Negocios y Sedes
- **WHEN** se renderiza un avatar con tipo `business` (para salones, locales o sedes)
- **THEN** el sistema aplica forma de squircle (`rounded-xl` / `rounded-2xl`) en lugar de forma circular, mostrando el logotipo subido o la inicial del negocio.

#### Scenario: Escala estándar de cinco tamaños
- **WHEN** se invoca el componente `Avatar` con la propiedad `size`
- **THEN** el componente aplica estrictamente una de las 5 medidas predefinidas (`xs: 24px`, `sm: 32px`, `md: 40px`, `lg: 56px`, `xl: 80px`).

#### Scenario: Agrupación escalable de avatares (AvatarGroup)
- **WHEN** se renderiza un conjunto de miembros con `AvatarGroup` que supera el número máximo visible configurado (`max`)
- **THEN** el sistema muestra los primeros `max` avatares superpuestos horizontalmente con margen negativo (`-space-x-2.5`) y un elemento final con el contador restante en formato `+N`.
