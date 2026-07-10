## ADDED Requirements

### Requirement: Responsive styling scaling using CSS variable factors
All common Volta UI components must use relative scaling calculations linked to the root CSS styling variables.

#### Scenario: Components apply dynamic roundedness
- **WHEN** a Card, Button, or FloatingInput is rendered
- **THEN** its border-radius matches the computed value scaling with the root `--radius-scale`.

#### Scenario: Text elements scale dynamically
- **WHEN** text is displayed in a component
- **THEN** its font size matches the computed value scaling with the root `--font-scale`.
