## ADDED Requirements

### Requirement: Automatic container updates
The system SHALL monitor the GitHub Container Registry (GHCR) and update the running application containers automatically when a new image is pushed to the `latest` tag.

#### Scenario: Successful auto-update
- **WHEN** a new image is pushed to `ghcr.io/kore29/volta:latest`
- **THEN** the Watchtower service pulls the new image, restarts the application containers, and cleans up the old image
