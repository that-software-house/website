# Studio Website Redesign

Date: 2026-04-17

## Goal

Replace the current primary marketing experience with the new `TSH/` studio direction while keeping older marketing and tool pages available as non-primary routes.

## Decisions

- The primary information architecture becomes:
  - `/`
  - `/services`
  - `/work`
  - `/approach`
  - `/team`
  - `/contact`
- The global shell is replaced with a darker editorial visual system based on the new HTML/CSS prototype.
- Older routes remain registered but are removed from the primary navigation.
- The current small-business `/services` page is preserved under hidden legacy routes so the content is not lost.
- Existing tool and product routes stay live for direct access and future reuse.

## Implementation Notes

- Rebuild the shell in React rather than embedding the static HTML directly.
- Consolidate the new design system into shared CSS and page-specific styles.
- Preserve SEO metadata on the new studio pages.
- Remove the old primary navigation hierarchy and chat widget from the global shell.
