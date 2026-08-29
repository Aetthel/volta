## ADDED Requirements

### Requirement: Optimización de Componentes React según Vercel Best Practices
El frontend de Next.js SHALL implementar patrones de optimización de Vercel Engineering, incluyendo `bundle-dynamic-imports` para subpaneles y modales secundarios, `rerender-memo` para filtros y transformaciones pesadas, y `rerender-dependencies` con valores primitivos en arrays de dependencias.

#### Scenario: Carga bajo demanda de secciones en Preferencias
- **WHEN** un usuario navega a la página de preferencias `/ajustes`
- **THEN** la vista de tarjetas generales se renderiza de inmediato y los módulos individuales (`ProfileSection`, `MessagesSection`, `BusinessSection`, `BillingSection`, `PersonalizationSection`) se descargan asíncronamente bajo demanda solo cuando el usuario selecciona dicha categoría

#### Scenario: Filtrado reactivo optimizado en catálogos y mensajes
- **WHEN** un usuario busca un servicio en el catálogo o escribe una plantilla en el simulador de WhatsApp
- **THEN** el cálculo de los elementos filtrados y la interpolación en vivo de variables se ejecuta mediante `useMemo` sin re-evaluar expresiones regulares ni filtrados en re-renders no relacionados

### Requirement: Eliminación de Cascadas Asíncronas en Páginas y Clientes
Las llamadas al backend en componentes del cliente SHALL ejecutarse en paralelo cuando no existan dependencias directas entre ellas (`async-parallel`), y cualquier operación `await` SHALL diferirse hasta la rama donde sea estrictamente necesaria (`async-defer-await`).

#### Scenario: Carga simultánea de horarios y servicios
- **WHEN** se carga la sección de configuración del negocio
- **THEN** las peticiones de horarios comerciales y catálogo de servicios se inician concurrentemente en paralelo evitando bloqueos en cascada
