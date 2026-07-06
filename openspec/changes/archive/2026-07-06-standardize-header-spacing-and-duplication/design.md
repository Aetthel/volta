## Context

Align header margins and hide redundant header indicators in mobile views.

## Goals / Non-Goals

**Goals:**
- Unify layout margins between page header and content.
- Hide redundant mobile header actions in the Agenda calendar card.

## Decisions

### Spacing in Inicio Page
- **Decision:** Change `<main className="p-gutter max-w-container-max w-full mx-auto flex-1 flex flex-col gap-gutter">` in `inicio/page.tsx` to `<main className="p-gutter max-w-container-max w-full mx-auto flex-1 flex flex-col">`. Add explicit `mb-gutter` or separate elements with standard margin rules, keeping spacing below `PageHeader` at exactly 1x gutter.
- **Rationale:** Ensures page vertical flow is consistent across all pages.

### Mobile Duplication of Header in Agenda Page
- **Decision:** Wrap the `<Header />` block inside the calendar control bar in a `hidden md:block` wrapper.
- **Rationale:** Eliminates redundant rendering of notifications/avatars on mobile where they are already handled by the `PageHeader` element.
