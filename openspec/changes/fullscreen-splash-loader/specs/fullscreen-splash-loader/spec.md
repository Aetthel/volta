# FullScreen Splash Loader Capability Spec

## Requirements

### Requirement: FullScreen Splash Component

El sistema DEBE proveer un componente de carga a pantalla completa (`FullScreenSplash`) que respete la paleta de colores de la aplicación y la tipografía configurada.

#### Scenario: Rendering full-screen splash loader
- GIVEN a user triggers a full-application bootstrapping process or demo creation
- WHEN the `FullScreenSplash` component is rendered
- THEN it MUST cover the full viewport (`fixed inset-0 z-50`) with the background token `bg-surface`
- AND it MUST display the Volta brand logo with a subtle breathing opacity animation
- AND it MUST display a centered 180px linear progress bar using the primary theme gradient (`from-primary to-inverse-primary`)

#### Scenario: Indeterminate loading state
- GIVEN the progress percentage is not explicitly provided
- WHEN `FullScreenSplash` is active
- THEN the linear progress fill MUST animate infinitely back and forth across the track

#### Scenario: Demo creation splash integration
- GIVEN a visitor clicks "Ver Demo" on the landing page
- WHEN the backend request `/api/backend/demo` is pending
- THEN the UI MUST display the `FullScreenSplash` loader immediately
- AND it MUST transition smoothly to `/inicio` upon completion without abrupt page jumps
