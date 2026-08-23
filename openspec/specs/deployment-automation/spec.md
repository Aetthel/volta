# Capability: Deployment Automation

## Purpose

Automate production container deployment and update cycles.

## Requirements

### Requirement: Automatic container updates

The system SHALL monitor the GitHub Container Registry (GHCR) and update the running application containers automatically when a new image is pushed to the `latest` tag.

#### Scenario: Successful auto-update

- **WHEN** a new image is pushed to `ghcr.io/kore29/volta:latest`
- **THEN** the Watchtower service pulls the new image, restarts the application containers, and cleans up the old image

### Requirement: Production Build Command

The frontend package build script SHALL execute standard production builds (`next build`) without development prerender debugging flags.

#### Scenario: Production build execution

- **WHEN** `pnpm build` or `pnpm --filter frontend build` is run
- **THEN** Next.js MUST execute standard production compilation and typechecking without `--debug-prerender`
