// game.js: the single source of truth. All changes to pet/coins/room go through here.
// The UI only READS Game.state and calls Game.doAction(...).
const Game = (() => {
  const STATS = ['fullness', 'joy', 'energy', 'fluff'];
  let state = null;
  // "session" is temporary (not saved): current animation and speech bubble
  const session = { anim: 'idle', animUntil: 0, bubble: '', bubbleUntil: 0, preview: null };

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const num = (v, d) => (Number.isFinite(v) ? v : d);
  const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const petDef = () => PETS.find((p) => p.id === state.petId);

  // Look up any shop item by id (searches every category)
  const findItem = (id) => { for (const cat of Object.keys(CATALOG)) { const it = CATALOG[cat].find((i) => i.id === id); if (it) return it; } return null; };
  const owned = (s, id) => { const it = findItem(id); return !!it && (it.price === 0 || s.inventory.includes(id)); };

  function defaultRoom() {
    return { wallpaper: 'pinkStripe', floor: 'peachWood', curtain: 'creamFloral', rug: 'blushFloral', furniture: { leftFloor: null, farRight: null, wallArt: null },
             lights: { arrangement: 'wallDrape', on: true, brightness: 0.85, glow: 0.5, color: 'warmWhite' } };
  }

  // Build a clean, safe state from untrusted data (a save file, or null).
  function validate(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const def = PETS.find((p) => p.id === raw.petId);
    if (!def) return null;
    const s = {
      petId: def.id,
      name: String(raw.name || '').trim().slice(0, CONFIG.nameMax) || def.defaultName,
      coins: Math.max(0, Math.floor(num(raw.coins, CONFIG.startCoins))),
      friendship: Math.max(0, num(raw.friendship, 0)),
      petCount: Math.max(0, Math.floor(num(raw.petCount, 0))),
      lastSeen: num(raw.lastSeen, Date.now()),
      stats: {}, room: defaultRoom()
    };
    for (const k of STATS) s.stats[k] = clamp(num(raw.stats && raw.stats[k], 80), CONFIG.statFloor, CONFIG.statMax);
    const r = raw.room || {}, L = r.lights || {};
    if (typeof r.wallpaper === 'string') s.room.wallpaper = r.wallpaper;
    // Wallpaper and flooring are one coordinated room style. Older saves are normalised here.
    s.room.floor = ({ pinkStripe: 'peachWood', brick: 'greyTile', freshGreen: 'orangeWood' })[s.room.wallpaper] || 'peachWood';
    if (typeof r.curtain === 'string') s.room.curtain = r.curtain;   // never null: window always has curtains
    if (r.rug === null || typeof r.rug === 'string') s.room.rug = r.rug;
    Object.assign(s.room.lights, {
      on: L.on !== false, brightness: clamp(num(L.brightness, 0.85), 0, 1), glow: clamp(num(L.glow, 0.5), 0, 1),
      color: typeof L.color === 'string' ? L.color : 'warmWhite',
      arrangement: typeof L.arrangement === 'string' ? L.arrangement : 'wallDrape'
    });
    // Stage 4 data. Old (Stage 3) saves have none of this, so every field falls back safely.
    s.inventory = Array.isArray(raw.inventory) ? raw.inventory.filter((id) => typeof id === 'string' && findItem(id)) : [];
    const fu = r.furniture || {};
    for (const slot of Object.keys(s.room.furniture)) {
      const it = findItem(fu[slot]);
      s.room.furniture[slot] = it && it.slot === slot && owned(s, it.id) ? it.id : null;
    }
    // an equipped item must exist AND be owned, otherwise use the free default (the window always keeps curtains)
    for (const cat of ['wallpaper', 'curtain', 'rug']) {
      if (cat === 'rug' && s.room.rug === null) continue;
      const it = CATALOG[cat].find((i) => i.id === s.room[cat]);
      if (!it || !owned(s, it.id)) s.room[cat] = CATALOG[cat][0].id;
    }
    const arr = CATALOG.light.find((i) => i.id === s.room.lights.arrangement);
    if (!arr || !owned(s, arr.id)) s.room.lights.arrangement = CATALOG.light[0].id;
    return s;
  }

  function save() {
    if (!state) return;
    state.lastSeen = Date.now();
    try { localStorage.setItem(CONFIG.saveKey, JSON.stringify(state)); } catch (e) { /* storage blocked: game still works */ }
  }

  function decay(minutes, factor) {
    for (const k of STATS) {
      state.stats[k] = clamp(state.stats[k] - CONFIG.decayPerMinute[k] * minutes * factor, CONFIG.statFloor, CONFIG.statMax);
    }
  }

  // Returns { away: minutes } if a save was restored, otherwise null.
  function load() {
    try { state = validate(JSON.parse(localStorage.getItem(CONFIG.saveKey))); } catch (e) { state = null; }
    if (!state) return null;
    const away = clamp((Date.now() - state.lastSeen) / 60000, 0, CONFIG.offlineCapMinutes);
    decay(away, CONFIG.offlineFactor);
    return { away };
  }

  function adopt(petId, name) {
    const def = PETS.find((p) => p.id === petId);
    state = validate({ petId, name: name || def.defaultName, coins: CONFIG.startCoins, stats: {} });
    save();
  }

  function reset() { try { localStorage.removeItem(CONFIG.saveKey); } catch (e) {} state = null; }

  function tick(seconds) { if (state) decay(seconds / 60, 1); }

  const level = () => Math.floor(state.friendship / 20) + 1;
  const levelProgress = () => (state.friendship % 20) / 20;

  function line(event) {
    const own = (DIALOGUE[petDef().personality] || {})[event] || [];
    return pickOne(own.concat(DIALOGUE.default[event] || ['...']));
  }
  function say(text, ms = 3500) { session.bubble = text; session.bubbleUntil = Date.now() + ms; }

  // Lowest stat if it is getting low, otherwise null
  function neediest() {
    let worst = null;
    for (const k of STATS) if (state.stats[k] < 30 && (!worst || state.stats[k] < state.stats[worst])) worst = k;
    return worst;
  }

  // Run one care action. Returns { ok, coins }.
  function doAction(name) {
    const a = CONFIG.actions[name];
    if (!state || !a) return { ok: false, coins: 0 };
    const now = Date.now(), st = state.stats;
    const busy = ['eating', 'playing', 'sleeping'].includes(session.anim) && now < session.animUntil;
    if (busy && name !== 'pet') return { ok: false, coins: 0 };

    const blocked = (name === 'feed' && st.fullness >= 95 && 'full') ||
                    (name === 'play' && st.energy < a.minEnergy && 'tired') ||
                    (name === 'rest' && st.energy >= a.maxEnergy && 'notSleepy') ||
                    (name === 'groom' && st.fluff >= 95 && 'clean');
    if (blocked) { say(line(blocked)); return { ok: false, coins: 0 }; }

    const bonus = ((PERSONALITIES[petDef().personality].bonus[name]) || {}).joy || 0;
    for (const k of STATS) {
      let d = a[k] || 0;
      if (k === 'joy') { d += bonus; if (d > 0 && st.fluff < 30) d = Math.round(d * 0.7); } // messy fur dulls joy
      if (d) st[k] = clamp(st[k] + d, CONFIG.statFloor, CONFIG.statMax);
    }

    let coins = a.coins || 0;
    if (name === 'pet') { state.petCount++; coins = state.petCount % a.coinEvery === 0 ? 1 : 0; }
    else if (st.fullness < 30) coins = Math.max(1, coins - 1);   // hungry pets earn a little less
    state.coins += coins;

    const before = level();
    state.friendship += a.friend;
    session.anim = a.anim; session.animUntil = now + a.ms;
    say(level() > before ? line('levelUp') : line(name));
    save();
    return { ok: true, coins };
  }

  // ----- Shop and room customisation -----
  const ownedNow = (id) => !!state && owned(state, id);

  function buy(id) {
    const it = findItem(id);
    if (!state || !it) return { ok: false, msg: 'Unknown item.' };
    if (ownedNow(id)) return { ok: false, msg: 'You already own this.' };          // never charge twice
    if (state.coins < it.price) return { ok: false, msg: `You need ${it.price - state.coins} more Treat Coins.` };
    state.coins -= it.price; state.inventory.push(id); save();
    return { ok: true, msg: `Unlocked ${it.name}! Tap Apply to use it.` };
  }

  // category: wallpaper | floor | curtain | rug | light | furniture.  id null = remove (rug / furniture only).
  function apply(category, id, slot) {
    const r = state && state.room;
    if (!r || !CATALOG[category]) return { ok: false, msg: 'Nothing to apply.' };
    if (id === null) {
      if (category === 'rug') r.rug = null;
      else if (category === 'furniture' && slot in r.furniture) r.furniture[slot] = null;
      else return { ok: false, msg: 'Your room always needs one of these.' };   // wallpaper, floor, curtains, lights
      save(); return { ok: true, msg: 'Removed.' };
    }
    const it = CATALOG[category].find((i) => i.id === id);
    if (!it) return { ok: false, msg: 'That does not belong here.' };
    if (!ownedNow(id)) return { ok: false, msg: 'Unlock it first.' };
    if (category === 'furniture') { if (it.slot !== slot) return { ok: false, msg: 'That does not fit there.' }; r.furniture[slot] = id; }
    else if (category === 'light') r.lights.arrangement = id;
    else if (category === 'wallpaper') { r.wallpaper = id; r.floor = ({ pinkStripe: 'peachWood', brick: 'greyTile', freshGreen: 'orangeWood' })[id] || 'peachWood'; }
    else r[category] = id;                                                          // one id per category: replaces, never stacks
    save(); return { ok: true, msg: `${it.name} applied!` };
  }

  function setLight(key, value) {
    if (!state) return;
    const L = state.room.lights;
    if (key === 'on') L.on = !!value;
    else if (key === 'brightness' || key === 'glow') L[key] = clamp(num(Number(value), L[key]), 0, 1);
    else if (key === 'color' && ['warmWhite', 'softPink', 'lavender', 'rainbow'].includes(value)) L.color = value;
    save();
  }

  // The room as drawn right now: saved room plus any temporary preview (previews are never saved)
  function viewRoom() {
    const p = session.preview, r = state.room;
    if (!p) return r;
    const v = Object.assign({}, r);
    if (p.category === 'furniture') v.furniture = Object.assign({}, r.furniture, { [p.slot]: p.id });
    else if (p.category === 'light') v.lights = Object.assign({}, r.lights, { arrangement: p.id });
    else if (p.category === 'wallpaper') { v.wallpaper = p.id; v.floor = ({ pinkStripe: 'peachWood', brick: 'greyTile', freshGreen: 'orangeWood' })[p.id] || 'peachWood'; }
    else v[p.category] = p.id;
    return v;
  }

  return {
    buy, apply, setLight, viewRoom, owned: ownedNow,
    load, adopt, reset, save, tick, doAction, line, say, neediest, level, levelProgress, session,
    get state() { return state; }
  };
})();
