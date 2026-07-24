## MODIFIED Requirements

### Requirement: Componente de botón estandarizado

El sistema SHALL proporcionar un componente de botón reutilizable (`Button`) con variantes de estilo consistentes y tipografía que evite el uso de letras negritas (`font-bold` o `font-semibold`), utilizando en su lugar un peso medio (`font-medium`).

#### Scenario: Visualización del botón primario

- **WHEN** un botón utiliza la variante `primary`
- **THEN** se muestra con fondo de color primario (`bg-primary`), texto de contraste (`text-on-primary`) de color blanco por defecto (y en hover `text-on-primary`), y tipografía de peso medio (`font-medium`) sin utilizar negrita.
