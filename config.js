// config.js: every number you might want to tweak lives here.
const CONFIG = {
  saveKey: 'petHouse.save.v1',
  nameMax: 14,
  startCoins: 60,
  useOriginalColours: false, // true = use the exact #FF9621 orange floor (see CATALOG origBase)
  statFloor: 15,            // stats never drop below this (forgiving!)
  statMax: 100,
  decayPerMinute: { fullness: 1.2, joy: 0.9, energy: 0.6, fluff: 0.7 },
  offlineFactor: 0.35,      // decay while the game is closed is slower
  offlineCapMinutes: 480,   // at most 8 hours of away-time counts

  // Room colours (the UI colours are CSS variables in style.css)
  palette: {
    outline: '#5A3F33', wood: '#7A5A48', cream: '#FFF6E8',
    wall: '#F6C9D3', stripe: '#DCCBF0',
    floorBase: '#F2C9A5', floorLine: '#B98A6A',
    peach: '#F4B79A', blush: '#F4B8C5', lavender: '#CDB8EC', sage: '#B5D3B0', mint: '#BDE5D0'
  },

  // What each action does. Positive = restores, negative = costs.
  actions: {
    feed:  { fullness: 30, joy: 3,  coins: 2, friend: 2, anim: 'eating',   ms: 2200 },
    play:  { joy: 20, energy: -15, fullness: -5, coins: 3, friend: 2, anim: 'playing', ms: 2400, minEnergy: 20 },
    rest:  { energy: 35, fullness: -3, coins: 1, friend: 1, anim: 'sleeping', ms: 3000, maxEnergy: 90 },
    groom: { fluff: 35, joy: 4, coins: 2, friend: 2, anim: 'happy', ms: 2200 },
    pet:   { joy: 6, friend: 1, anim: 'happy', ms: 1200, coinEvery: 5 }
  }
};
