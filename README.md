# The Pet House (Stage 3: playable core)

## Run it
Double-click `index.html`, or from this folder run `python3 -m http.server 8000` and open http://localhost:8000.
(The scripts are plain files, not ES modules, so it also works when opened directly.)

## Files
- `config.js`: every tunable number and the room palette (decay speed, action effects, coins).
- `data.js`: the 6 pets, personalities and speech-bubble lines. To add a pet, copy an entry in `PETS`.
- `game.js`: the single `state` object, care actions, saving/loading/validation.
- `render.js`: draws the room and pets on the canvas. Swap these functions for PNG drawing to use your own art.
- `main.js`: screens, buttons, stat bars, game loop.
- `style.css`: UI design tokens at the top (`:root`). Change colours and fonts there.

## How it works (short)
Buttons call `Game.doAction(name)`, which checks the rules, changes `Game.state`, and saves. The screen then re-reads the state: `updateHud()` for bars and coins, and the canvas loop for the pet and room. Saves live in `localStorage` under `petHouse.save.v1` and are validated on load; broken data falls back to the adoption screen.

## Assets
Everything is drawn by original code. No third-party art, fonts files or audio are bundled (Nunito and Pixelify Sans load from Google Fonts, SIL OFL, with system fallbacks).

## Stage 4: customisation
Tap **Decorate** to open the panel. Tap an item to *preview* it in the room (previews are never saved), then **Buy** (Treat Coins) and **Apply**. Rugs and furniture can be removed; wallpaper, floor, curtains and lights always keep one choice.
- `room.js`: draws wallpaper, floor, curtains, rugs, furniture and fairy lights.
- `data.js` `CATALOG`: every item's name, price and colours. To add a rug, copy a rug entry and change the colours.
- `decorate.js`: the panel. Rules (prices, ownership, saving) are in `game.js`: `buy`, `apply`, `setLight`.
- The orange floor is softened (#F2A04D). Set `useOriginalColours: true` in `config.js` for the exact #FF9621.

## Not built yet
Weather (rain/rainbow), music and sound effects, daily goals, free drag-and-drop furniture (furniture uses 3 fixed slots instead).

## Testing status
Game rules and drawing were tested in Node with a fake canvas (49 checks, all pass). The page itself has not been run in a real browser by the author. Please play through the checklist: adopt each pet, use all 5 actions, refresh (progress should persist), clear the save with Reset, and resize to a phone width.
