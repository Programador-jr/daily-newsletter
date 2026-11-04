---
name: css-architecture
description: Audit and implement frontend styling without creating cascading override layers. Use for CSS changes, component styling, modal/dialog work, responsive fixes, and visual consistency tasks.
---

# CSS Architecture Skill

## Mandatory workflow

Follow this exact order before writing or editing CSS:

1. **Map the page**
   - Identify the HTML entry point and CSS import order.
   - Identify the JavaScript renderer and the markup it generates.
   - Inspect the reference page/component that defines the desired visual standard.
   - Check current branch state and existing uncommitted changes before any write.

2. **Audit the cascade**
   - Search every stylesheet for the affected selectors, states, pseudo-elements, media queries, and tokens.
   - Record selector duplication, specificity, source order, and conflicting declarations.
   - Check whether a shared component already provides the required layout or visual behavior.
   - Trace CSS custom properties from their definition through every consumer.
   - Inspect JavaScript-generated classes and inline custom properties; do not assume the CSS is the only source of behavior.

3. **Choose the owner**
   - Shared behavior belongs in the shared component or design-system stylesheet.
   - Atlas-wide dialog, axis, list, and link primitives belong in the Atlas layer.
   - Catalog-only content composition belongs in the political catalog stylesheet.
   - Data and DOM structure belong in the renderer that owns that component.
   - Do not move page-specific styling into a global stylesheet merely to make it reusable.

4. **Implement at the source**
   - Edit the existing rule or component that owns the behavior.
   - Reuse established tokens and primitives.
   - Keep a single source of truth for each selector/state.
   - Consolidate old declarations and remove superseded rules in the same change.
   - Do not append a new override block at the bottom of a stylesheet.
   - Do not add `!important` to compensate for incorrect cascade ownership.
   - Avoid pseudo-elements that duplicate real DOM icons, labels, or markers.
   - Keep CSS custom-property names and units consistent between JavaScript and CSS.

5. **Validate all consumers**
   - Check all pages that import the modified shared stylesheet.
   - Check all variants of a shared renderer (e.g. books, ideologies, countries, personalities, parties, and values).
   - Check desktop and narrow viewport rules.
   - Check focus-visible, keyboard dismissal, focus restoration, scroll locking, backdrop, and reduced motion for dialogs.
   - Run JavaScript syntax checks and the repository's relevant tests.
   - Search again for duplicate selectors, obsolete variables, orphaned classes, and remaining override blocks.

6. **Document the result**
   - Explain the original source of the conflict.
   - List the owning files changed and why.
   - Report checks that passed and checks that were not possible.
   - Do not claim visual verification unless the actual rendered page was inspected.

## Design contract for King's Newsletter

- Use the semantic tokens from `styles.css` (`--text-main`, `--text-muted`, `--primary`, `--border`, `--card-bg`, and related theme variables).
- Use shared Atlas primitives for dialog shells, headers, bodies, sections, axis rows, markers, lists, and buttons when their semantics match.
- Keep dialog content readable and consistently aligned; do not center every paragraph by default.
- Related resources must look interactive: visible border, consistent radius, hover/focus state, and clear link semantics.
- Muted text must use the existing muted token; do not create page-specific competing definitions.
- Axis icons and pole colors must come from the axis data/tokens, not decorative fallback dots that duplicate SVG icons.
- Axis markers must use the same CSS custom-property contract everywhere: `--position` with an explicit percentage unit.
- Preserve the native `<dialog>` element where it is already used; do not replace it with a custom overlay without a separate accessibility and behavior review.

## Review checklist

- [ ] The original selector/component was located before editing.
- [ ] No append-only override section was introduced.
- [ ] Duplicate/conflicting declarations were consolidated.
- [ ] No unnecessary `!important` was added.
- [ ] Shared tokens/primitives were reused.
- [ ] JavaScript and CSS custom properties agree, including units.
- [ ] No duplicate icon or marker is rendered.
- [ ] All affected page variants and breakpoints were checked.
- [ ] Keyboard, focus, dialog, and reduced-motion behavior were preserved.
- [ ] Syntax and relevant project tests passed.
