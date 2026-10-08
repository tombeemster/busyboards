// Web Awesome (pinned) and the components the generator places, each once per board.
// A component: type, row ('low' or 'tall'; components of similar height share rows), keep
// (always shown, the row filling places it first), nav (a board arrow: the two go to different
// low rows), stretch
// (takes its row's spare width; every other tile hugs its component), tile (framed; otherwise it
// is its own frame) and html(r, id, board) with seeded helpers r.pick/some/int/chance, a
// board-unique id and the board's shared choices: { field } (the card's input), { five } and
// { qr, secret } (whether the QR code replaces the numpad, and its secret word). Layout lives in index.html.
// Rules: nothing navigates or fetches data (no href, no src, no wa-include/zoomable-frame).

const base = 'https://cdn.jsdelivr.net/npm/@awesome.me/webawesome@3.14.0/dist-cdn';
export const lib = {
  js: `${base}/webawesome.loader.js`,
  css: look => ['webawesome.css', `themes/${look.theme}.css`, `color/palettes/${look.palette}.css`, 'color/variants.css']
    .map(f => `${base}/styles/${f}`),
  classes: look => [`wa-theme-${look.theme}`, `wa-palette-${look.palette}`, `wa-brand-${look.brand}`],
};
// Each board gets a seeded palette and brand colour; every board uses the Awesome theme. Only
// saturated brand colours: gray leaves the board without a colour (and the accent wheel without a hue).
export const looks = {
  theme: ['awesome'],
  palette: ['default', 'bright', 'shoelace', 'base'],
  brand: ['blue', 'cyan', 'green', 'indigo', 'orange', 'pink', 'purple', 'red', 'yellow'],
};

const words = {
  colour: ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple', 'Pink', 'Teal'],
  shape: ['Circle', 'Square', 'Star', 'Heart', 'Triangle', 'Hexagon'],
  size: ['XS', 'S', 'M', 'L', 'XL'],
};
// Well-known groups of five, in their usual order, with tempting decoys from the same world.
// Each board hides one member (generate.mjs): the other four are the switches, and so the
// chart's legend; the dropdown offers the missing one among decoys.
const fives = [
  ['Backstreet Boys', ['Nick', 'Brian', 'AJ', 'Kevin', 'Howie'], ['Justin', 'Lance', 'JC', 'Joey', 'Chris']],
  ['Spice Girls', ['Scary', 'Sporty', 'Baby', 'Posh', 'Ginger'], ['Grumpy', 'Sleepy', 'Dopey', 'Sneezy']],
  ['Senses', ['Sight', 'Hearing', 'Smell', 'Taste', 'Touch'], ['Balance', 'Humour', 'Direction', 'Intuition']],
  ['Tastes', ['Sweet', 'Sour', 'Salty', 'Bitter', 'Umami'], ['Spicy', 'Smoky', 'Tangy', 'Creamy']],
  ['Olympic rings', ['Blue', 'Yellow', 'Black', 'Green', 'Red'], ['Purple', 'Orange', 'Pink', 'White']],
  ['Safari Big Five', ['Lion', 'Leopard', 'Elephant', 'Rhino', 'Buffalo'], ['Giraffe', 'Hippo', 'Cheetah', 'Zebra']],
  ['Workdays', ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], ['Saturday', 'Sunday', 'Funday', 'Someday']],
  ['The five W’s', ['Who', 'What', 'When', 'Where', 'Why'], ['How', 'Which', 'Whom', 'Whence']],
  ['Power Rangers', ['Red', 'Black', 'Blue', 'Yellow', 'Pink'], ['Green', 'White', 'Purple', 'Gold']],
  ['Ninja Turtles', ['Leonardo', 'Raphael', 'Donatello', 'Michelangelo', 'Splinter'], ['Shredder', 'April', 'Casey', 'Krang']],
  ['Mario Kart cups', ['Mushroom', 'Flower', 'Star', 'Special', 'Shell'], ['Coin', 'Feather', 'Boo', 'Cape']],
  ['Saja Boys', ['Jinu', 'Abby', 'Mystery', 'Romance', 'Baby'], ['Rumi', 'Mira', 'Zoey', 'Gwi-Ma']],
  ['CSS position', ['static', 'relative', 'absolute', 'fixed', 'sticky'], ['float', 'flex', 'inherit', 'center']],
  ['Gestalt principles', ['Proximity', 'Similarity', 'Closure', 'Continuity', 'Figure-ground'], ['Contrast', 'Hierarchy', 'Alignment', 'Repetition']],
  ['Vowels', ['A', 'E', 'I', 'O', 'U'], ['Y', 'W', 'K', 'Z']],
];
// The board's five: its name, the four on show, the missing one and three decoys.
export const five = r => {
  const [name, members, decoys] = r.pick(fives);
  const missing = r.pick(members);
  return { name, shown: members.filter(m => m !== missing), missing, decoys: r.some(decoys, 3) };
};
// The QR code's secret word (see the qr component).
export const secrets = ['wombat', 'pickle', 'marmalade', 'tadpole', 'noodle', 'biscuit', 'walrus', 'kazoo'];
const slug = text => text.toLowerCase().replace(/[^a-z0-9]+/g, '-'); // option values can't hold spaces
// The button group's clue for the fifth-member minigame: "pick option <the missing member>",
// each word in a different non-Latin script. Every member of the fives in one entry per script
// (in the order of `scripts`; null where it doesn't translate, e.g. vowels in Arabic or Chinese).
const scripts = ['ru', 'ar', 'zh', 'ko', 'ja'];
const pick = { ru: 'Выбери', ar: 'اختر', zh: '选', ko: '골라', ja: '選んで' };
const option = { ru: 'вариант', ar: 'الخيار', zh: '选项', ko: '옵션', ja: 'オプション' };
const inScripts = {
  Nick: ['Ник', 'نيك', '尼克', '닉', 'ニック'], Brian: ['Брайан', 'براين', '布莱恩', '브라이언', 'ブライアン'],
  AJ: ['Эй Джей', 'إيه جيه', null, '에이제이', 'エージェー'], Kevin: ['Кевин', 'كيفن', '凯文', '케빈', 'ケヴィン'],
  Howie: ['Хауи', 'هاوي', '豪伊', '하위', 'ハウイー'],
  Scary: ['Страшная', 'مخيفة', '恐怖', '스케어리', 'スケアリー'], Sporty: ['Спортивная', 'رياضية', '运动', '스포티', 'スポーティ'],
  Baby: ['Бэйби', 'بيبي', '宝贝', '베이비', 'ベイビー'], Posh: ['Шикарная', 'أنيقة', '高贵', '포쉬', 'ポッシュ'],
  Ginger: ['Рыжая', 'صهباء', '姜汁', '진저', 'ジンジャー'],
  Sight: ['Зрение', 'البصر', '视觉', '시각', '視覚'], Hearing: ['Слух', 'السمع', '听觉', '청각', '聴覚'],
  Smell: ['Обоняние', 'الشم', '嗅觉', '후각', '嗅覚'], Taste: ['Вкус', 'التذوق', '味觉', '미각', '味覚'],
  Touch: ['Осязание', 'اللمس', '触觉', '촉각', '触覚'],
  Sweet: ['Сладкий', 'حلو', '甜', '단맛', '甘味'], Sour: ['Кислый', 'حامض', '酸', '신맛', '酸味'],
  Salty: ['Солёный', 'مالح', '咸', '짠맛', '塩味'], Bitter: ['Горький', 'مر', '苦', '쓴맛', '苦味'],
  Umami: ['Умами', 'أومامي', '鲜', '감칠맛', 'うま味'],
  Blue: ['Синий', 'أزرق', '蓝', '파랑', '青'], Yellow: ['Жёлтый', 'أصفر', '黄', '노랑', '黄'], Black: ['Чёрный', 'أسود', '黑', '검정', '黒'],
  Green: ['Зелёный', 'أخضر', '绿', '초록', '緑'], Red: ['Красный', 'أحمر', '红', '빨강', '赤'],
  Pink: ['Розовый', 'وردي', '粉红', '분홍', 'ピンク'],
  Lion: ['Лев', 'أسد', '狮子', '사자', 'ライオン'], Leopard: ['Леопард', 'نمر', '豹', '표범', 'ヒョウ'],
  Elephant: ['Слон', 'فيل', '大象', '코끼리', 'ゾウ'], Rhino: ['Носорог', 'وحيد القرن', '犀牛', '코뿔소', 'サイ'],
  Buffalo: ['Буйвол', 'جاموس', '水牛', '물소', 'スイギュウ'],
  Monday: ['Понедельник', 'الاثنين', '星期一', '월요일', '月曜日'], Tuesday: ['Вторник', 'الثلاثاء', '星期二', '화요일', '火曜日'],
  Wednesday: ['Среда', 'الأربعاء', '星期三', '수요일', '水曜日'], Thursday: ['Четверг', 'الخميس', '星期四', '목요일', '木曜日'],
  Friday: ['Пятница', 'الجمعة', '星期五', '금요일', '金曜日'],
  Who: ['Кто', 'من', '谁', '누구', '誰'], What: ['Что', 'ماذا', '什么', '무엇', '何'], When: ['Когда', 'متى', '什么时候', '언제', 'いつ'],
  Where: ['Где', 'أين', '哪里', '어디', 'どこ'], Why: ['Почему', 'لماذا', '为什么', '왜', 'なぜ'],
  Leonardo: ['Леонардо', 'ليوناردو', '列奥纳多', '레오나르도', 'レオナルド'], Raphael: ['Рафаэль', 'رافائيل', '拉斐尔', '라파엘', 'ラファエロ'],
  Donatello: ['Донателло', 'دوناتيلو', '多纳泰罗', '도나텔로', 'ドナテロ'], Michelangelo: ['Микеланджело', 'مايكل أنجلو', '米开朗基罗', '미켈란젤로', 'ミケランジェロ'],
  Splinter: ['Сплинтер', 'سبلينتر', '斯普林特', '스플린터', 'スプリンター'],
  Mushroom: ['Гриб', 'الفطر', '蘑菇', '버섯', 'キノコ'], Flower: ['Цветок', 'الزهرة', '花', '꽃', 'フラワー'],
  Star: ['Звезда', 'النجمة', '星星', '별', 'スター'], Special: ['Особый', 'الخاص', '特别', '스페셜', 'スペシャル'],
  Shell: ['Панцирь', 'الصدفة', '龟壳', '등껍질', 'コウラ'],
  Jinu: ['Джину', 'جينو', null, '진우', 'ジヌ'], Abby: ['Эбби', 'آبي', '艾比', '애비', 'アビー'],
  Mystery: ['Мистери', 'ميستري', '神秘', '미스터리', 'ミステリー'], Romance: ['Романс', 'رومانس', '浪漫', '로맨스', 'ロマンス'],
  static: ['Статичный', 'ثابت', '静态', '정적', '静的'], relative: ['Относительный', 'نسبي', '相对', '상대', '相対'],
  absolute: ['Абсолютный', 'مطلق', '绝对', '절대', '絶対'], fixed: ['Фиксированный', 'مثبت', '固定', '고정', '固定'],
  sticky: ['Липкий', 'لاصق', '粘性', '스티키', '粘着'],
  Proximity: ['Близость', 'التقارب', '接近', '근접성', '近接'], Similarity: ['Сходство', 'التشابه', '相似', '유사성', '類同'],
  Closure: ['Замкнутость', 'الإغلاق', '闭合', '폐쇄성', '閉合'], Continuity: ['Непрерывность', 'الاستمرارية', '连续', '연속성', '連続'],
  'Figure-ground': ['Фигура и фон', 'الشكل والأرضية', '图形与背景', '전경과 배경', '図と地'],
  A: ['А', null, null, '아', 'ア'], E: ['Е', null, null, '에', 'エ'], I: ['И', null, null, '이', 'イ'],
  O: ['О', null, null, '오', 'オ'], U: ['У', null, null, '우', 'ウ'],
};
// The clue as [text, lang] per button: the member in a script it has, the other two words in two
// other scripts.
const clue = (r, missing) => {
  const names = Object.fromEntries(scripts.map((lang, i) => [lang, inScripts[missing][i]]));
  const last = r.pick(scripts.filter(lang => names[lang]));
  const [one, two] = r.some(scripts.filter(lang => lang !== last), 2);
  return [[pick[one], one], [option[two], two], [names[last], last]];
};
const numberNames = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
// A crackable series: four different digits from 1–9 (the numpad has no 0; the tag input drops
// duplicates) that follow steady steps (3 5 7 9) or alternating ones (1 4 3 6: +3 −1), and the
// next term, which may leave 1–9 (5 4 9 8 → 13) but is never one of the four (so it can be
// added as a tag at all). Seeded tries until one fits.
const series = r => {
  for (;;) {
    const steps = r.chance(0.25) // mostly alternating: those are the fun ones to crack
      ? Array(2).fill(r.pick([1, 2, -1, -2]))
      : r.shuffle([r.int(2, 5), -r.int(1, 2)]);
    const terms = [r.int(1, 9)];
    for (let i = 0; i < 4; i++) terms.push(terms[i] + steps[i % 2]);
    const [next] = terms.splice(4);
    if (terms.every(t => t >= 1 && t <= 9) && new Set([...terms, next]).size === 5 && next >= 0) return { terms, next };
  }
};
const hexes = ['#e63946', '#f4a261', '#e9c46a', '#2a9d8f', '#457b9d', '#8338ec', '#ff006e', '#06d6a0'];
const value = r => r.int(5, 95);
// Inputs that sit either in the card's header or on a tile of their own: each board puts one
// in the card and the others in the low row (generate.mjs). No visible labels.
export const fields = [
  // The dropdown offers the board's missing member among decoys, a decoy preselected; picking
  // the missing one is a minigame (data-answer, app.js).
  { type: 'select', html: (r, id, { five }) => {
    const [first, ...rest] = five.decoys;
    return `<wa-select aria-label='Who completes the ${five.name}?' data-answer='${slug(five.missing)}'>${[first, ...r.shuffle([...rest, five.missing])].map((t, i) => `<wa-option value='${slug(t)}'${i ? '' : ' selected'}>${t}</wa-option>`).join('')}</wa-select>`;
  } },
  { type: 'time', html: r => `<wa-time-input aria-label='Time' hour-format='24' value='${String(r.int(6, 22)).padStart(2, '0')}:${r.pick(['00', '15', '30', '45'])}'></wa-time-input>` },
  { type: 'number', html: r => `<wa-number-input aria-label='Amount' value='${r.int(1, 9)}' min='0'></wa-number-input>` },
];
// Inline icons (wa-icon would fetch them from a CDN).
const icon = path => `<svg viewBox='0 0 24 24' width='1.2em' height='1.2em' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'>${path}</svg>`;
const sun = icon("<circle cx='12' cy='12' r='4'/><path d='M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4'/>");
const arrow = d => icon(`<path d='${d}'/>`);
const moon = icon("<path d='M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z'/>");
const segmented = (id, items) => `<wa-radio-group name='${id}' orientation='horizontal' value='${items[0]}'>${items.map(t => `<wa-radio appearance='button' value='${t}'>${t}</wa-radio>`).join('')}</wa-radio-group>`;

export const components = [
  // Tiled, kept: the arrows to the previous (older) and next (newer) board, one in each low row:
  // ← first in its row, → last (generate.mjs); app.js wires them
  { type: 'prev', row: 'low', keep: true, nav: true, tile: true, html: () => `<wa-button aria-label='Previous board' data-step='-1'>${arrow('M19 12H5M12 19l-7-7 7-7')}</wa-button>` },
  { type: 'next', row: 'low', keep: true, nav: true, tile: true, html: () => `<wa-button aria-label='Next board' data-step='1'>${arrow('M5 12h14M12 5l7 7-7 7')}</wa-button>` },

  // Tiled, kept: the fields that aren't in the card this board (minus those the board leaves
  // out, see generate.mjs)
  ...fields.map(f => ({ ...f, row: 'low', keep: true, tile: true })),

  // No tile (the card is its own frame): one of the fields in its header, a light/dark toggle
  // and a Save button that applies it (app.js)
  { type: 'card', row: 'tall', html: (r, id, board) => `<wa-card with-header><div slot='header'>${board.field.html(r, id, board)}</div>`
    + `<div class='set spread'><wa-radio-group name='${id}' orientation='horizontal' value='light' aria-label='Mode'>`
    + `<wa-radio appearance='button' value='light' aria-label='Light'>${sun}</wa-radio><wa-radio appearance='button' value='dark' aria-label='Dark'>${moon}</wa-radio></wa-radio-group>`
    + `<wa-button variant='brand'>Save</wa-button></div></wa-card>` },

  // Tiled: a 3×3 numpad
  { type: 'numpad', row: 'tall', tile: true, html: () => `<div class='numpad'>${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<wa-button>${n}</wa-button>`).join('')}</div>` },

  // Tiled: a button group in three colours: the fifth member's clue, "pick option <missing>",
  // each word in another script (see clue). Each word is in a <bdi>, so right-to-left scripts read correctly while the buttons stay left-to-right
  // (dir on a button would mirror its rounded corners at the group's ends).
  { type: 'cta', row: 'low', tile: true, html: (r, id, { five }) => { const variants = r.some(['brand', 'success', 'warning', 'danger'], 3); return `<wa-button-group label='A clue'>${clue(r, five.missing).map(([text, lang], i) => `<wa-button variant='${variants[i]}' lang='${lang}'><bdi>${text}</bdi></wa-button>`).join('')}</wa-button-group>`; } },

  // Tiled: four vertical sliders; they drive the chart (app.js)
  { type: 'faders', row: 'tall', tile: true, html: r => `<div class='faders'>${[1, 2, 3, 4].map(() => `<wa-slider orientation='vertical' value='${value(r)}'></wa-slider>`).join('')}</div>` },

  // Tiled, stretches: two horizontal sliders, a default one and a range, as wide as the tile
  { type: 'sliders', row: 'low', stretch: true, tile: true, html: r => { const lo = r.int(10, 40); return `<div class='sliders'><wa-slider value='${value(r)}'></wa-slider><wa-slider range min-value='${lo}' max-value='${lo + r.int(20, 50)}'></wa-slider></div>`; } },

  // Tiled: a segmented control
  { type: 'segmented', row: 'low', tile: true, html: (r, id) => segmented(id, r.some(r.pick([words.size, words.colour, words.shape]), 3)) },

  // Tiled: one colour picker for the board's main accent; the other accents follow from it (app.js)
  { type: 'colour', row: 'low', tile: true, html: () => `<wa-color-picker swatches='${hexes.join('; ')}' aria-label='Main colour'></wa-color-picker>` },

  // Tiled: the board's five minus its missing member, as switches under the group's name, one
  // per chart slice (app.js)
  { type: 'switches', row: 'tall', tile: true, html: (r, id, { five }) => `<wa-checkbox-group label='${five.name}'>${five.shown.map(t => `<wa-switch${r.chance(.5) ? ' checked' : ''}>${t}</wa-switch>`).join('')}</wa-checkbox-group>` },

  // Tiled, on about half the boards instead of the numpad (generate.mjs): a QR code holding a
  // message, not a link (nothing leaves the board). Scanning it reveals a secret word; adding
  // that word as a tag is a minigame (data-secret, app.js).
  { type: 'qr', row: 'tall', tile: true, html: (r, id, { secret }) => `<wa-qr-code value='Add &#39;${secret}&#39; as tag' size='160' label='A secret message' data-secret='${secret}'></wa-qr-code>` },

  // Tiled: a doughnut chart with a legend, driven live by the board's sliders and switches
  // (app.js); this is just its frame.
  { type: 'chart', row: 'tall', tile: true, html: () => `<div class='chart'><div class='dial'><div class='doughnut'></div><span class='count'></span></div><ul class='legend'></ul></div>` },

  // Tiled, kept: a four-digit code; the numpad types into it, and the tag input's four digits
  // crack it (app.js).
  { type: 'otp', row: 'low', keep: true, tile: true, html: () => `<wa-otp-input aria-label='Code' type='numeric' length='4'></wa-otp-input>` },

  // Tiled, kept, stretches: a tag input that starts with a series (spelled out). In that order
  // the four digits are the code for the code input (data-code); adding the series' next term as
  // a tag is a minigame too (data-next, data-next-name). See app.js.
  { type: 'tags', row: 'low', keep: true, stretch: true, tile: true, html: r => {
    const { terms, next } = series(r);
    return `<wa-tag-input aria-label='Tags' placeholder='What comes next?' value='${terms.map(t => numberNames[t]).join(',')}' data-code='${terms.join('')}' data-next='${next}' data-next-name='${numberNames[next]}' style='width:100%'></wa-tag-input>`;
  } },
];
