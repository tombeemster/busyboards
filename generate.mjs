// Writes boards/YYYY-MM-DD.json for each date and updates boards/index.json.
// Usage: node generate.mjs [from] [to]   (defaults to today; existing boards are kept)
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { lib, looks, fields, five, secrets, components } from './catalog.mjs';

const today = new Date().toLocaleDateString('sv-SE'); // local YYYY-MM-DD (toISOString is UTC)
const [from = today, to = from] = process.argv.slice(2);

// Seeded PRNG (mulberry32) from a string hash, so a date always gives the same board.
function rng(seed) {
  let a = [...seed].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 2654435761), 1779033703);
  const next = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const r = {
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    pick: arr => arr[Math.floor(next() * arr.length)],
    chance: p => next() < p,
    shuffle: arr => arr.map(x => [next(), x]).sort((x, y) => x[0] - y[0]).map(x => x[1]),
    some: (arr, n) => r.shuffle(arr).slice(0, n),
  };
  return r;
}

// Three rows in a seeded order: the tall row with every tall component (the chart, numpad and
// their partners belong together; the QR code takes the numpad's place when the board has
// one), and two low rows that share all low components (minus the
// field that went into the card), dealt in a seeded order with the stretch and kept tiles
// spread over both first. The low rows hold more than fits: the viewer shows them in order while they fit
// the tall row's width (app.js). Each row's tiles in a seeded order.
function rows(r, board) {
  const left = [board.field.type, board.qr ? 'numpad' : 'qr', ...board.out];
  const used = components.filter(c => !left.includes(c.type));
  const low = r.shuffle(used.filter(c => c.row === 'low'));
  const lowRows = [[], []];
  // Dealt alternately so both rows share them: stretch tiles that aren't kept, then kept tiles
  // (stretching ones first, then the two board arrows, then the others), then the rest. Each row
  // gets one stretch tile, one arrow and half the other kept ones.
  const order = c => (c.stretch && !c.keep ? 0 : c.keep ? (c.stretch ? 1 : c.nav ? 2 : 3) : 4);
  [...low].sort((a, b) => order(a) - order(b)).forEach((c, i) => lowRows[i % 2].push(c));
  // Within a row the order is seeded, except the arrows: ← always first, → always last.
  const place = t => (t.type === 'prev' ? -1 : t.type === 'next' ? 1 : 0);
  return r.shuffle([
    ...lowRows.map(tiles => ({ kind: 'low', tiles: r.shuffle(tiles).sort((a, b) => place(a) - place(b)) })),
    { kind: 'tall', tiles: r.shuffle(used.filter(c => c.row === 'tall')) },
  ]);
}

function generate(date) {
  const r = rng(date);
  const look = Object.fromEntries(Object.entries(looks).map(([k, v]) => [k, r.pick(v)]));
  // Choices several components share. Each board leaves one or two minigame tiles out (the code,
  // and the time and number inputs that aren't in the card), so the optional low tiles get room
  // too; the dropdown and tag input stay, as other games and the clue build on them. Without the
  // code there's nothing to type into, so the QR code takes the numpad's place.
  const field = r.pick(fields);
  const out = r.some(['otp', ...['time', 'number'].filter(type => type !== field.type)], r.int(1, 2));
  const board = { field, five: five(r), out, qr: out.includes('otp') || r.chance(0.5), secret: r.pick(secrets) };
  return {
    date,
    look,
    css: lib.css(look),
    js: lib.js,
    classes: lib.classes(look),
    rows: rows(r, board).map(({ kind, tiles }, row) => ({ kind, tiles: tiles.map((c, i) => ({
      type: c.type, ...(c.keep && { keep: true }), ...(c.stretch && { stretch: true }), ...(c.tile && { tile: true }), html: c.html(r, `r${row}t${i}`, board),
    })) })),
  };
}

mkdirSync('boards', { recursive: true });
const index = new Set(existsSync('boards/index.json') ? JSON.parse(readFileSync('boards/index.json', 'utf8')) : []);
for (let d = new Date(from); d <= new Date(to); d.setUTCDate(d.getUTCDate() + 1)) {
  const date = d.toISOString().slice(0, 10);
  const file = `boards/${date}.json`;
  if (existsSync(file)) { console.log(`${date} exists, kept`); }
  else { writeFileSync(file, JSON.stringify(generate(date), null, 2) + '\n'); console.log(`${date} written`); }
  index.add(date);
}
writeFileSync('boards/index.json', JSON.stringify([...index].sort().reverse()) + '\n');
