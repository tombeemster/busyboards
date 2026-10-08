# busyboards
A daily board of real, interactive components from a web component library, like a digital toddler's busy board.

Each date gets its own seeded board of [Web Awesome](https://webawesome.com) components: a look, a selection of toys and a handful of minigames to discover. Boards are kept as snapshots, so every day stays the same forever.

## Run it locally

No build step. Serve the folder with any static server:

```sh
npx serve
```

## Generate boards

```sh
node generate.mjs              # today
node generate.mjs 2026-10-08 2026-10-31   # a range
```

This writes `boards/YYYY-MM-DD.json` and updates `boards/index.json`. Existing boards are never overwritten.

## Files

- `catalog.mjs`: the components and their content
- `generate.mjs`: the seeded generator
- `app.js`: renders a board, lays out its rows and wires up the minigames
- `index.html`: the page and all its CSS
- `product.md` and `roadmap.md`: principles and plan
