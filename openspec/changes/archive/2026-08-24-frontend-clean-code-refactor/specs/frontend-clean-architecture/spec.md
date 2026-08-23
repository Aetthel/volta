## ADDED Requirements

### Requirement: Separación de Lógica de Negocio y Presentación
Los componentes de UI del frontend (componentes y páginas) NO DEBEN contener llamadas directas de mutación a la API ni gestión compleja de estado local fuera de utilidades o custom hooks dedicados.

#### Scenario: Componente Modal usa Custom Hook de Negocio
- **WHEN** un modal (como `AddClientModal` o `AddServiceModal`) realiza operaciones de creación/edición
- **THEN** el componente delega el manejo del formulario, validación y mutaciones al custom hook correspondiente sin contener la lógica en línea

### Requirement: Complejidad Ciclomática y Anidamiento Reducido
Todas las funciones y controladores de eventos en el frontend DEBEN usar cláusulas de guarda (*guard clauses*) para retornos tempranos y evitar bloques de condicionales anidados mayores a 2 niveles.

#### Scenario: Manejo de envío de formulario con retornos tempranos
- **WHEN** el usuario envía un formulario incompleto o no válido
- **THEN** el handler interrumpe la ejecución inmediatamente con un retorno temprano y notifica el error sin anidar bloques `else`

### Requirement: Ausencia de Código Muerto y Code Smells
El código del frontend DEBE estar libre de importaciones no utilizadas, variables obsoletas, tipos `any` implícitos y comentarios redundantes.

#### Scenario: Compilación e inspección de linter
- **WHEN** se ejecuta el proceso de linter o compilación del frontend
- **THEN** no se generan advertencias ni errores por imports sin uso o variables no declaradas
