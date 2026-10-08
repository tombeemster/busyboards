# Busyboards

A daily board of real, interactive components from one web component library, here
[Web Awesome](https://webawesome.com), like a toddler's busy board for grown-ups. An art
project and fun experiment, not a product: weight is fine, delight matters more.

This file holds the principles that rarely change. The exact component set lives in
`catalog.mjs`, the layout numbers in `index.html`, the plan in `roadmap.md`, and the way of
working in `.claude/skills/busyboards/SKILL.md`.

## Principles

1. **One library per board.** Components come straight from the library, styled by its own
   theme; no mixing, no isolation layer. Library JS is welcome.
2. **Toys, not tools.** Everything can be poked, toggled, slid and typed into, but nothing
   leaves the board: no external links, no data fetching. Moving between boards is the only
   navigation.
3. **The board is one system.** Components influence each other (sliders drive the chart, the
   numpad types into the code, one picked colour recolours the board). New components should
   connect to what's there rather than sit alone.
4. **Daily, seeded, kept.** Each date seeds its own board (look, selection, order, content) and
   is stored as a snapshot that never changes afterwards.
5. **Rows by height, tiles hug.** Components of similar height share a row; tiles hug their
   component, and only designated stretch tiles absorb a row's spare width so rows end at the
   same edge. Rows are filled in the browser, where widths are known.
6. **Gestalt spacing.** Tight spacing inside a set of controls, looser padding inside tiles,
   one gap between tiles and rows; sliders get extra room to be grabbed. Tiles mark a region
   with a subtle frame on the page's own background.
7. **One accent, a colour wheel.** A single main colour; the other accents are derived from it
   (complement and squares on the OKLCH wheel), so the board always reads as one palette.
8. **Accessible by rule.** Text on coloured surfaces always meets WCAG AA; theme colours first,
   with a guaranteed fallback.
9. **Small and simple.** Grow from a small, balanced set, one component at a time. When a
   component fights the setup, drop it rather than patch around it.

## Learned along the way

- Web Awesome's autoloader finds its components relative to a `<script>` tag for the loader,
  so `app.js` adds one before importing it.
- Components expose CSS custom properties and `::part()`s; recolouring a button means setting
  its `--wa-color-*` variables on the element (inline beats `:host([variant])`).
- `wa-switch` reflects `checked`, so CSS `:has()` can react to it without JS.
- `wa-otp-input` caps its box row (`::part(segments)`) at 100% width and scrolls; sized to its
  content that clips the last box, so the cap is lifted.
- A vertical `wa-slider` track is a fixed 200px tall; boxing it in less pushes it off-centre.
- `wa-comparison` lays out "before" in flow and overlays "after" at 100% height; stretching it
  makes the two sides differ in height.
- Tried and dropped: accordion, drawer, stepper, animation, tree, tab group, pagination,
  carousel, spinner; dense grids with smaller components; space-between layouts; shaped panels
  with fillers, families and per-board limits; strict grids; tiles with their own background.

## Later

- The same setup for the other shortlisted libraries (Spectrum, UI5, Ionic, Carbon), then
  decide between a library per board or a library per day.
- GitHub repo, hosting and a daily generation job.
