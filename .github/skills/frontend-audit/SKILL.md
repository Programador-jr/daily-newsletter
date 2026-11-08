---
name: frontend-audit
description: Audit a frontend page and its reference implementation before changing shared components, dialogs, or visual patterns.
---

# Frontend Audit Skill

Use this skill whenever a task changes a page's visual system, modal/dialog, reusable component, or shared stylesheet.

## Required audit order

1. **Establish the reference**
   - Open the requested reference route and target route in the same environment.
   - Identify the exact component being compared; do not infer visual parity from filenames or class names.
   - Record layout, alignment, spacing, typography, iconography, links, muted text, responsive behavior, and interaction states.

2. **Trace both implementations**
   - Read the HTML entry points and compare CSS import order.
   - Find the JavaScript renderer responsible for each component.
   - Compare the actual generated DOM structure and semantic elements.
   - Identify differences between native dialogs, custom overlays, and inline detail panels.

3. **Map dependencies and risks**
   - Search every stylesheet and script for affected selectors, classes, tokens, and custom properties.
   - Identify all pages consuming a shared stylesheet or renderer.
   - Check keyboard behavior, focus management, scroll locking, Escape handling, backdrop clicks, URL/hash changes, and reduced motion.
   - Identify content variants and edge cases before selecting a shared abstraction.

4. **Write the change plan before implementation**
   - State the owning files and why each needs to change.
   - Separate shared structure from page-specific content.
   - List behavior that must remain unchanged.
   - Do not begin edits while the ownership or impact of a selector is unclear.

5. **Implement the smallest coherent refactor**
   - Reuse the reference component's shared primitives where semantics match.
   - Preserve page-specific editorial content and native platform behavior.
   - Avoid duplicating markup builders, CSS tokens, icons, and axis rendering.
   - Update the original component and its owning styles; do not layer emergency overrides on top.

6. **Verify the full surface**
   - Test each content variant, not just the first item.
   - Test desktop, tablet, and mobile widths.
   - Test keyboard and pointer interaction.
   - Re-open both reference and target routes after changes.
   - Run syntax checks, project tests, and linting where available.
   - Report anything that could not be verified.

## Completion criteria

A task is not complete merely because the target page looks closer in one screenshot. The component must use a clear shared contract, avoid redundant cascade rules, preserve behavior and accessibility, and remain consistent across every variant that consumes it.
