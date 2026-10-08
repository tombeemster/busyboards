const dates = await fetch('boards/index.json').then(r => r.json());
const asked = new URLSearchParams(location.search).get('d');
const date = dates.includes(asked) ? asked : dates[0]; // an unknown or empty ?d= shows the newest
const board = await fetch(`boards/${date}.json`).then(r => r.json());

// Moving between boards: the board's arrow tiles and the ←/→ keys (the date itself is in the
// URL). Dates are newest first, so the previous (older) board is at + 1. jump(+1) goes to the
// next (newer) board, jump(-1) to the previous one; false when there is none.
const go = d => (location.search = `?d=${d}`);
const at = dates.indexOf(date);
const jump = step => { const d = dates[at - step]; if (d) go(d); return Boolean(d); };
// The keys work unless focus is in a form field or on the board, where arrows belong to the
// component (sliders, radios, tabs…).
addEventListener('keydown', e => {
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  if (e.composedPath().some(n => n.matches?.('.board, input, select, textarea'))) return;
  if (e.key === 'ArrowLeft') jump(-1);
  if (e.key === 'ArrowRight') jump(1);
});

// The board's look: Web Awesome theme, palette and brand classes. Light or dark starts from
// the system setting and follows it, until the board picks one (choose: the card's toggle, the
// time input; see below). setMode also keeps the card's toggle showing the current mode.
const root = document.documentElement;
root.classList.add(...board.classes);
const setMode = isDark => {
  root.classList.toggle('wa-dark', isDark);
  root.classList.toggle('wa-light', !isDark);
  root.style.colorScheme = isDark ? 'dark' : 'light'; // native parts of inputs follow too
  const toggle = document.querySelector('[data-type="card"] wa-radio-group');
  if (toggle) toggle.value = isDark ? 'dark' : 'light';
};
const dark = matchMedia('(prefers-color-scheme: dark)');
dark.onchange = () => setMode(dark.matches);
const choose = isDark => { dark.onchange = null; setMode(isDark); };
setMode(dark.matches); // right away, so the page never flashes the wrong mode
const styles = board.css.map(href => new Promise(resolve => {
  document.head.append(Object.assign(document.createElement('link'), { rel: 'stylesheet', href, onload: resolve, onerror: resolve }));
}));

const el = document.getElementById('board');
el.innerHTML = board.rows.map(row => `<div class="row" data-kind="${row.kind}">${row.tiles.map(t => `<div class="item${t.keep ? ' keep' : ''}${t.stretch ? ' stretch' : ''}${t.tile ? ' tile' : ''}" data-type="${t.type}">${t.html}</div>`).join('')}</div>`).join('');

// The loader registers every wa-* element on the page. It finds its components relative to
// a <script> tag pointing at it, so add one; importing the same URL then gives the same
// module instance. Show the board once everything is defined.
document.head.append(Object.assign(document.createElement('script'), { type: 'module', src: board.js }));
const { allDefined } = await import(board.js);
await Promise.all([allDefined(), ...styles]);

const otp = el.querySelector('wa-otp-input');
const faders = [...el.querySelectorAll('[data-type="faders"] wa-slider')];
// Every tile is measured at its natural width (one frame, nothing painted in between).
// Desktop: low rows hold more tiles than fit, so each is filled up to the tall row's width (or
// the board's, if that's narrower): kept tiles (a game needs them) and stretch tiles (measured
// at their minimum) first, then whichever optional tiles fill the remaining width best. Every
// row has a stretch tile, which closes the last gap, so it ends at the edge.
// Phones (--mobile, set by the CSS breakpoint): every tile shows and rows wrap. To keep small
// tiles side by side, each row is packed into lines first-fit decreasing (largest first, each
// into the first line it fits), with ← placed first and → last; the result is the tiles' CSS order.
const fill = () => {
  const items = [...el.querySelectorAll('.item')];
  items.forEach(item => { item.hidden = false; item.style.order = ''; });
  el.classList.add('measuring');
  const width = new Map(items.map(item => [item, item.getBoundingClientRect().width]));
  el.classList.remove('measuring');
  const gap = parseFloat(getComputedStyle(el.querySelector('.row')).columnGap);
  if (getComputedStyle(root).getPropertyValue('--mobile').trim() === '1') return pack(width, gap, el.parentElement.clientWidth);
  const tall = [...el.querySelectorAll('.row[data-kind="tall"] > .item')];
  const target = Math.min(tall.reduce((sum, item) => sum + width.get(item), 0) + gap * (tall.length - 1), el.parentElement.clientWidth);
  for (const row of el.querySelectorAll('.row[data-kind="low"]')) {
    const tiles = [...row.children];
    const first = item => item.matches('.keep, .stretch');
    const used = tiles.filter(first).reduce((sum, item) => sum + gap + width.get(item), -gap);
    // Of every combination of the optional tiles (at most three: eight to try), show the one
    // that fills the row furthest without passing the target.
    const optional = tiles.filter(item => !first(item));
    let best = [], most = -Infinity;
    for (let mask = 0; mask < 1 << optional.length; mask++) {
      const shown = optional.filter((_, i) => mask & (1 << i));
      const filled = shown.reduce((sum, item) => sum + gap + width.get(item), used);
      if (filled <= target && filled > most) [best, most] = [shown, filled];
    }
    optional.forEach(item => (item.hidden = !best.includes(item)));
  }
};
const pack = (width, gap, target) => {
  for (const row of el.querySelectorAll('.row')) {
    const tiles = [...row.children], lines = [];
    const fits = (line, tile) => line.used + gap + width.get(tile) <= target;
    const add = (line, tile) => { line.tiles.push(tile); line.used += gap + width.get(tile); return line; };
    const newLine = () => lines[lines.push({ tiles: [], used: -gap }) - 1];
    const prev = tiles.find(t => t.dataset.type === 'prev'), next = tiles.find(t => t.dataset.type === 'next');
    if (prev) add(newLine(), prev);
    for (const tile of tiles.filter(t => t !== prev && t !== next).sort((a, b) => width.get(b) - width.get(a))) {
      add(lines.find(line => fits(line, tile)) ?? newLine(), tile);
    }
    if (next) {
      // → goes last: into a line with room (moved to the end), else its own. (← is in the other row.)
      const line = lines.find(l => fits(l, next));
      if (line) lines.push(...lines.splice(lines.indexOf(line), 1));
      add(line ?? newLine(), next);
    }
    lines.flatMap(line => line.tiles).forEach((tile, i) => (tile.style.order = i));
  }
};
// Filled now, and again (once per frame) when the window resizes or a tall tile changes size:
// the tall row sets the target width and finishes drawing later (the chart, the QR code).
// Low tiles growing while played with (tags, the number) don't refill, so nothing moves away.
fill();
let pending;
const refill = () => { cancelAnimationFrame(pending); pending = requestAnimationFrame(fill); };
const watch = new ResizeObserver(refill);
el.querySelectorAll('.row[data-kind="tall"] > .item').forEach(item => watch.observe(item));
addEventListener('resize', refill);
setMode(dark.matches); // again, now that the card's toggle exists to show it
// The board's arrow tiles: disabled where there's no board to go to.
for (const button of el.querySelectorAll('wa-button[data-step]')) {
  const step = Number(button.dataset.step);
  button.disabled = !dates[at - step];
  button.addEventListener('click', () => jump(step));
}
el.classList.add('ready');

// Light or dark from the board: the card's Save button applies its sun/moon toggle (and the
// time input, below).
el.querySelector('[data-type="card"] wa-button')?.addEventListener('click', () => {
  choose(el.querySelector('[data-type="card"] wa-radio-group').value === 'dark');
});

// Colour: one picker sets the board's main accent; the colour wheel gives three more: the
// complement (+180°) and the two squares between (+90°, +270°), at the same OKLCH lightness
// and chroma (chroma reduced where needed to stay in sRGB). They become --accent-1…4 on the
// board: the button group (1–3), the card's primary button (1), the doughnut slices with
// their vertical sliders (1–4) and the horizontal sliders (1, see index.html).
const toHex = (() => { const ctx = document.createElement('canvas').getContext('2d'); return c => ((ctx.fillStyle = '#000'), (ctx.fillStyle = c), ctx.fillStyle); })();
const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
const hexOf = c => '#' + c.map(v => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0')).join('');
const toLinear = v => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const toGamma = v => (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.sign(v) * Math.abs(v) ** (1 / 2.4) - 0.055);
const mix = (m, v) => m.map(row => row.reduce((sum, x, i) => sum + x * v[i], 0));
// OKLab (Björn Ottosson): linear sRGB → LMS → cube root → Lab, and back.
const toLab = hex => mix([[0.2104542553, 0.7936177850, -0.0040720468], [1.9779984951, -2.4285922050, 0.4505937099], [0.0259040371, 0.7827717662, -0.8086757660]],
  mix([[0.4122214708, 0.5363325363, 0.0514459929], [0.2119034982, 0.6806995451, 0.1073969566], [0.0883024619, 0.2817188376, 0.6299787005]], rgb(hex).map(toLinear)).map(Math.cbrt));
const fromLab = lab => mix([[4.0767416621, -3.3077115913, 0.2309699292], [-1.2684380046, 2.6097574011, -0.3413193965], [-0.0041960863, -0.7034186147, 1.7076147010]],
  mix([[1, 0.3963377774, 0.2158037573], [1, -0.1055613458, -0.0638541728], [1, -0.0894841775, -1.2914855480]], lab).map(v => v ** 3)).map(toGamma);
const inGamut = (L, C, h) => {
  let c;
  while ((c = fromLab([L, C * Math.cos(h), C * Math.sin(h)])).some(v => v < 0 || v > 1) && C > 0.001) C *= 0.95;
  return hexOf(c);
};
const rotate = (hex, degrees) => {
  const [L, a, b] = toLab(hex);
  return inGamut(L, Math.hypot(a, b), Math.atan2(b, a) + degrees * Math.PI / 180);
};
// The main accent always has colour: a pick with too little (white, black, greys, washed-out
// tints and shades) is brought to a mid lightness and some chroma, in its own hue or, without
// one, the board's brand hue. Colourful picks are used as they are.
const vivid = hex => {
  const [L, a, b] = toLab(hex), C = Math.hypot(a, b);
  if (C >= 0.12) return hex;
  const [, ba, bb] = toLab(brand);
  return inGamut(Math.min(0.8, Math.max(0.5, L)), 0.12, C > 0.02 ? Math.atan2(b, a) : Math.atan2(bb, ba));
};
// A recoloured button also gets the colours the Awesome theme derives from its fill: the
// bevel (shadow) and borders darker, the pressed-state text lighter. Its label takes the
// theme's light or dark text colour, whichever contrasts more by the WCAG ratio; if neither
// reaches 4.5:1 (AA for text; ~28% of colours, mostly mid-tones) it falls back to black or
// white, one of which always does (at least 4.58:1).
const luminance = hex => rgb(hex).map(toLinear).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };
const better = fill => (a, b) => (contrast(fill, a) >= contrast(fill, b) ? a : b);
const rootStyle = getComputedStyle(root);
const themeText = ['--wa-color-neutral-20', '--wa-color-neutral-95'].map(v => toHex(rootStyle.getPropertyValue(v).trim()));
const labelFor = fill => { const text = themeText.reduce(better(fill)); return contrast(fill, text) >= 4.5 ? text : better(fill)('#000000', '#ffffff'); };
const paint = (button, c) => {
  for (const [name, value] of Object.entries({
    '--wa-color-fill-loud': c,
    '--wa-color-on-loud': labelFor(c),
    '--wa-color-shadow': `color-mix(in oklab, ${c}, black 30%)`, // the bevel
    '--wa-color-border-normal': `color-mix(in oklab, ${c}, black 30%)`,
    '--wa-color-border-loud': `color-mix(in oklab, ${c}, black 45%)`,
    '--wa-color-fill-quiet': `color-mix(in oklab, ${c}, white 80%)`, // pressed-state text
  })) button.style.setProperty(name, value);
};
const ctaButtons = [...el.querySelectorAll('[data-type="cta"] wa-button')];
const primary = el.querySelector('[data-type="card"] wa-button[variant="brand"]');
const setAccent = picked => {
  const main = vivid(picked);
  const accents = [0, 180, 90, 270].map(degrees => rotate(main, degrees));
  accents.forEach((c, k) => el.style.setProperty(`--accent-${k + 1}`, c));
  ctaButtons.forEach((button, k) => paint(button, accents[k]));
  if (primary) paint(primary, accents[0]);
};
const picker = el.querySelector('[data-type="colour"] wa-color-picker');
const brand = toHex(rootStyle.getPropertyValue('--wa-color-brand-fill-loud').trim()); // start from the board's brand colour
if (picker) {
  picker.value = brand;
  picker.addEventListener('input', () => setAccent(toHex(picker.value)));
}
setAccent(brand);

// Game groundwork for the minigames: a toast, a celebration dialog, a jump to another board
// and achievements, remembered across boards in this browser. (Also on window.busyboard, to try
// them from the console.)
const stage = document.createElement('div');
stage.innerHTML = '<wa-toast placement="bottom-center"></wa-toast><wa-dialog light-dismiss with-footer></wa-dialog>';
document.body.append(stage);
const toast = (message, variant = 'brand') => {
  const item = Object.assign(document.createElement('wa-toast-item'), { variant, textContent: message });
  stage.querySelector('wa-toast').append(item); // shows itself, then removes itself after its duration
};
// Resolves when the dialog has closed: true if its button was used, false if it was dismissed
// (Escape, clicking outside), so a game can act on a deliberate choice. Dialogs queue: a second
// one opens once the first has closed.
let queue = Promise.resolve();
const celebrate = ({ title, body, action = 'Nice!' }) => (queue = queue.then(() => new Promise(resolve => {
  const dialog = stage.querySelector('wa-dialog');
  let chosen = false;
  dialog.label = title;
  dialog.innerHTML = `<p>${body}</p><wa-button slot="footer" variant="brand" data-dialog="close">${action}</wa-button>`;
  dialog.querySelector('wa-button').addEventListener('click', () => (chosen = true));
  dialog.addEventListener('wa-after-hide', () => resolve(chosen), { once: true });
  dialog.open = true;
})));
// Minigames completed on any board, remembered in this browser (in memory only when storage
// is unavailable). unlock() is true only the first time.
const progressKey = 'busyboards:minigames';
const completed = (() => { try { return new Set(JSON.parse(localStorage.getItem(progressKey) ?? '[]')); } catch { return new Set(); } })();
const unlock = name => {
  if (completed.has(name)) return false;
  completed.add(name);
  try { localStorage.setItem(progressKey, JSON.stringify([...completed])); } catch { /* memory only */ }
  return true;
};
// The minigames, collected across boards: each board has some of them (it leaves some tiles
// out), so completing them all takes more than one board. The controls this board has:
const minigames = ['code', 'series', 'fifth', 'sync', 'hundred', 'scan'];
const [tags, dropdown, time, number, qr] = ['wa-tag-input', 'wa-select[data-answer]', 'wa-time-input', 'wa-number-input', 'wa-qr-code'].map(s => el.querySelector(s));
// The first time a minigame is completed (on any board): a toast with the progress, or a
// celebration dialog when it was the last one. Repeats show nothing.
const complete = (name, message) => {
  if (!unlock(name)) return;
  const done = minigames.filter(game => completed.has(game)).length;
  if (done === minigames.length) celebrate({ title: 'All minigames done!', body: `You completed all ${done} minigames across the boards. Every toy has given up its secret.`, action: 'Yay!' });
  else toast(`${message} · Completed ${done} of ${minigames.length} minigames`, 'success');
};
window.busyboard = { toast, celebrate, jump, unlock, complete };

// The time input. Light from 07:00 to 19:00, dark otherwise (a stand-in for real sunrise and
// sunset at the visitor's location). Minigame, in sync: setting it to the current time (give or
// take a minute, as the clock may tick over while typing) completes it. The midnight jump (not a
// minigame): 00:00 offers a jump to the next (newer) board in a dialog; its button jumps. The
// newest board has nowhere to jump to yet. A cleared time does nothing.
time?.addEventListener('change', async () => {
  if (!time.value) return;
  const [hours, minutes] = String(time.value).split(':').map(Number);
  choose(hours < 7 || hours >= 19);
  const now = new Date();
  const apart = Math.abs(hours * 60 + minutes - (now.getHours() * 60 + now.getMinutes()));
  if (Math.min(apart, 24 * 60 - apart) <= 1) complete('sync', 'You’re in sync');
  if (hours || minutes) return;
  if (at <= 0) return celebrate({ title: 'Midnight!', body: 'This is the newest board. A new one appears tomorrow.', action: 'Okay' });
  if (await celebrate({ title: 'Midnight!', body: 'The clock struck twelve: a new day, a new board. Shall we jump to the next one?', action: 'Jump' })) jump(1);
});

// Minigames in the tag input. Next in the series: the tags follow a pattern; adding its next
// term as a tag (spelled out or in digits) completes it. The QR code: scanning it reveals a
// secret word; adding that as a tag completes it.
tags?.addEventListener('change', () => {
  const added = [...tags.value].map(tag => String(tag).trim().toLowerCase());
  if (added.some(tag => [tags.dataset.next, tags.dataset.nextName].includes(tag))) complete('series', 'Pattern spotted');
  if (qr && added.includes(qr.dataset.secret)) complete('scan', 'Secret found');
});

// Minigame, the fifth member: the switches (and legend) show four of a well-known five; picking
// the missing one in the dropdown completes it.
dropdown?.addEventListener('change', () => {
  if (dropdown.value === dropdown.dataset.answer) complete('fifth', 'Five out of five');
});

// Minigame, the code: the tag input starts with four digits spelled out; in that order they
// crack the code input (the digits are its data-code, so editing the tags doesn't move them).
// A full code is checked, typed or entered on the numpad: right completes the game, wrong shows
// an error state until the next input.
const secret = tags?.dataset.code ?? '';
const checkCode = () => {
  if (otp.value !== secret) {
    otp.classList.add('wrong');
    otp.customError = 'Not this code';
    return;
  }
  complete('code', 'Code cracked');
};
const clearCode = () => { otp.classList.remove('wrong'); otp.customError = null; };
// Typing clears an earlier error, then checks a full code (one handler, so the check comes last).
otp?.addEventListener('input', () => { clearCode(); if (otp.value.length === otp.length) checkCode(); });

// Numpad keys type into the code; once it's full, the next key starts a new one.
el.querySelector('.numpad')?.addEventListener('click', e => {
  const key = e.target.closest('wa-button');
  if (!key || !otp) return;
  const code = otp.value ?? '';
  clearCode();
  otp.value = (code.length >= otp.length ? '' : code) + key.textContent.trim();
  if (otp.value.length === otp.length) checkCode(); // setting value from script fires no events
});

// Minigame, counting to a hundred: changing the number input to 10 or more turns the chart into
// a counter (see below); touching the chart's switches or sliders turns it back. Reaching 100
// completes the game. These listeners sit on the controls themselves, so they run before the
// chart's redraw on the board.
const counting = () => Number(number?.value) || 0;
let counter = false;
for (const type of ['input', 'change']) {
  number?.addEventListener(type, () => (counter = counting() >= 10));
  for (const control of el.querySelectorAll('[data-type="switches"] wa-switch, [data-type="faders"] wa-slider')) {
    control.addEventListener(type, () => (counter = false));
  }
}
number?.addEventListener('change', () => {
  if (counting() < 100) return;
  complete('hundred', 'One hundred!');
});

// Chart tile: a toy driven by the board's own controls. The four vertical sliders set the
// slices (slice and slider share an accent colour); the four switches show or hide them and
// lend them their labels, and moving a hidden slice's slider switches it back on;
// the plain horizontal slider sets the doughnut's thickness. In counter mode (see above) the
// chart is a single-colour percentage counter instead, its legend dimmed as if switched off.
const chart = el.querySelector('.chart');
if (chart) {
  const colour = k => `var(--accent-${k + 1})`;
  const switches = [...el.querySelectorAll('[data-type="switches"] wa-switch')];
  const thickness = el.querySelector('[data-type="sliders"] wa-slider:not([range])');
  const labels = switches.map(s => s.textContent.trim());
  faders.forEach((f, k) => {
    f.style.setProperty('--wa-form-control-activated-color', colour(k));
    // Runs before the board's own listener below, so the chart redraws with the switch on.
    f.addEventListener('input', () => { if (switches[k]) switches[k].checked = true; });
  });
  const legend = chart.querySelector('.legend');
  legend.innerHTML = labels.map((label, k) => `<li style="--swatch:${colour(k)}">${label}</li>`).join('');
  const draw = () => {
    const count = counting();
    chart.classList.toggle('counting', counter);
    chart.style.setProperty('--hole', `${thickness ? 80 - thickness.value * 0.6 : 55}%`);
    if (counter) {
      chart.querySelector('.doughnut').style.background = `conic-gradient(${colour(0)} ${Math.min(count, 100)}%, var(--wa-color-surface-border) 0)`;
      chart.querySelector('.count').textContent = `${count}%`;
      return;
    }
    const values = switches.map((s, k) => (s.checked ? faders[k]?.value ?? 0 : 0));
    const total = values.reduce((sum, v) => sum + v, 0) || 1;
    let from = 0;
    // Slices, then transparent from the last stop on, so an all-zero chart shows the plain ring below.
    chart.querySelector('.doughnut').style.background = `conic-gradient(${values.map((v, k) => `${colour(k)} ${from}turn ${(from += v / total)}turn`).join(', ')}, transparent ${from}turn), var(--wa-color-surface-border)`;
    [...legend.children].forEach((li, k) => li.classList.toggle('off', !values[k]));
  };
  el.addEventListener('input', draw);
  el.addEventListener('change', draw);
  draw();
}
