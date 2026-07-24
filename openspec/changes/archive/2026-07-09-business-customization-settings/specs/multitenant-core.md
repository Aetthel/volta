## ADDED Requirements

### Requirement: Propagate customized styling variables based on active tenant

All workspace sessions must load and apply the visual customizations of their specific business automatically.

#### Scenario: Session carries customization variables

- **WHEN** a user logs in
- **THEN** the session payload includes `themeColor`, `fontSizeLevel`, and `borderRadiusLevel` variables.

#### Scenario: Global layout injects style variables

- **WHEN** a business dashboard page is rendered
- **THEN** the page root DOM node has CSS custom property values set corresponding to the active business customization settings.
