# Repository implementation rules

## Required order for frontend and CSS work

For CSS implementation, read `.github/skills/css-architecture/SKILL.md`. For cross-page visual or component changes, also read `.github/skills/frontend-audit/SKILL.md` before editing.

Before changing frontend presentation or behavior, follow this sequence:

1. **Inspect** the current branch, working changes, page entry point, imported assets, and runtime behavior.
2. **Trace ownership** of every affected component, selector, token, and script. Identify the original rule before editing.
3. **Reuse** existing design tokens, Atlas primitives, shared components, and established page patterns.
4. **Change the source rule** in its owning stylesheet or component. Do not append corrective overrides merely to win the cascade.
5. **Consolidate** duplicate selectors and obsolete declarations in the same change when they are part of the affected component.
6. **Validate** JavaScript syntax, CSS structure, responsive behavior, accessibility, and affected page variants.
7. **Report** the files changed, behavior affected, tests run, and any checks that could not be performed.

## CSS cascade guardrails

- Do not add a second declaration block for an existing component selector without first checking and consolidating its original rule.
- Do not append "final fixes", "refinements", or page-wide override sections to the end of a stylesheet.
- Avoid `!important`; use correct ownership, load order, and the smallest reasonable selector specificity.
- Do not duplicate tokens or hard-code colors when semantic CSS variables already exist.
- Keep shared primitives in shared stylesheets and page-specific composition in the page stylesheet.
- Keep one source of truth for component spacing, typography, colors, states, and responsive behavior.
- When a shared contract changes, search all consumers before editing it.
- Preserve native dialog semantics, keyboard behavior, focus restoration, and reduced-motion preferences.
- Do not use a new class or utility when an established component already expresses the same intent.

## Git workflow

- Work on the existing task branch unless explicitly instructed otherwise.
- Do not create a branch for each implementation.
- Use conventional, English commit messages.
- Run relevant checks before opening or merging a pull request.
- Never merge into `main` without explicit authorization.
