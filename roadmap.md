# Roadmap

Playfulness and copy, split into phases. Each phase is shippable on its own; later phases
build on earlier ones.

## Phase 1 · Wit (copy only, `catalog.mjs`) ✓

- **Chart / switches** and **dropdown:** since replaced by the fifth-member minigame.
- **Button group:** a clue for the fifth member: "pick option <the missing one>", each word in a
  different non-Latin script (Russian, Arabic, Chinese, Korean, Japanese); right-to-left
  scripts sit in a `<bdi>`, so the button itself stays left-to-right.

## Phase 2 · Light and dark from the board ✓

- The card's segmented control is a sun/moon toggle; its Save button applies the mode (the
  narrower card also keeps the tall row on one line). Replaces the earlier S/M/XL size idea.
- Changing the time input sets the mode: light from 07:00 to 19:00, dark otherwise.
- Later: real sunrise and sunset for the visitor's location (computed locally from the date
  and position; asking for location needs the visitor's permission).

## Phase 3 · Game groundwork (`app.js`) ✓

- One helper each for a celebration dialog (`wa-dialog`), a toast (`wa-toast`) and moving to
  the next/previous board.
- Remember unlocked achievements per viewer (localStorage).
- Principle 2 already allows board-to-board navigation.

## Phase 4 · Minigames, one at a time

Up to six minigames (code, next in the series, the fifth member, time in sync, counting to a
hundred, the QR code); each board leaves one or two of the code, time and number tiles out, so
the optional tiles get room too, and the controls it has are always on show. Completing one the
first time, on any board, shows a toast, "<what> · Completed n of 6 minigames"; completing the last one opens a celebration dialog instead; repeats show nothing.
The midnight jump is not a minigame, and keeps its own dialog.

1. **Code** ✓: the tag input starts with four different digits, spelled out ("five, nine…"; 1–9:
   the numpad has no 0, the tag input drops duplicates); typed into
   the four-digit code in that order they complete the game.
   A wrong code shows an error state (danger boxes, a shake). Both tiles are always shown.
2. **Time in sync** ✓: setting the time input to the current time (±1 minute) shows a toast:
   "You're in sync".
3. **Midnight jump** ✓ (a board switch, not counted as a minigame): setting the time to 00:00 opens a dialog introducing the jump; its
   Jump button moves to the next (newer) board, dismissing cancels. The newest board says a new
   one appears tomorrow.
4. **Counting to a hundred** ✓: the number input has no upper limit. Changing it to 10 or more turns
   the chart into a single-colour percentage counter (10 → 10%, full at 100), its legend dimmed;
   touching the chart's switches or sliders turns it back. Reaching 100 completes it.
5. **Next in the series** ✓: the tags are a series of four different digits 1–9, steady (3 5 7 9)
   or alternating (1 4 3 6: +3 −1), spelled out; adding the next term as a tag (spelled out or in
   digits, e.g. "eleven" or "11") completes it. The four digits are still the code.
6. **The fifth member** ✓: each board hides one member of a well-known five (Backstreet Boys,
   Spice Girls, Oceans…); the other four are the switches and the legend, and picking the
   missing one from the dropdown (among decoys from the same world) completes it.
7. **The QR code** ✓: on about half the boards a QR code replaces the numpad (the code can be
   typed by keyboard too). It holds a message, not a link: scanning it reveals a secret word, and
   adding that word as a tag completes it. Counted only on boards with a QR code (6 instead of 5).

## Phase 5 · Hints

- The segmented control's labels hint at a minigame that's on this board, e.g. "Zero" / "to" /
  "one-hundred" for the counter. Chosen in the browser, since only then is it known which
  tiles are shown.

## Decided

- Achievements are collected across boards (no board has every minigame).
- Clues stay within the board (no chain across boards, for now).
