## MODIFIED Requirements

### Requirement: Production Build Command

The frontend package build script SHALL execute standard production builds (`next build`) without development prerender debugging flags.

#### Scenario: Production build execution
- **WHEN** `pnpm build` or `pnpm --filter frontend build` is run
- **THEN** Next.js MUST execute standard production compilation and typechecking without `--debug-prerender`
