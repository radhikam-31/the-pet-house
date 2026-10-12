// data.js: content only. To add a pet, copy one entry in PETS and change it.
// marks: [x, y, w, h, colour, isHead] small patches/stripes drawn on the pet.
const PERSONALITIES = {
  playful: { label: 'Playful', bonus: { play: { joy: 6 } } },
  gentle:  { label: 'Gentle',  bonus: { pet:  { joy: 4 } } },
  curious: { label: 'Curious', bonus: { feed: { joy: 4 } } },
  sleepy:  { label: 'Sleepy',  bonus: { rest: { joy: 5 } } }
};

const PETS = [
  { id: 'mochi', species: 'cat', defaultName: 'Mochi', personality: 'sleepy',
    desc: 'A fluffy cream loaf who adores naps.',
    colors: { body: '#FFF6EC', light: '#FFFFFF', accent: '#E6D8C6', earIn: '#F4B8C5', nose: '#E89AA8' }, marks: [] },
  { id: 'marmalade', species: 'cat', defaultName: 'Marmalade', personality: 'playful',
    desc: 'An orange tabby with endless zoomies.',
    colors: { body: '#F0B26A', light: '#FBE3BE', accent: '#D58C42', earIn: '#F4B8C5', nose: '#E89AA8' },
    marks: [[-2,-42,2,5,'#D58C42',1],[3,-42,2,4,'#D58C42',1],[-6,-22,2,6,'#D58C42',0],[0,-22,2,7,'#D58C42',0],[6,-22,2,6,'#D58C42',0]] },
  { id: 'misty', species: 'cat', defaultName: 'Misty', personality: 'gentle',
    desc: 'A soft grey-and-white cat who loves cuddles.',
    colors: { body: '#E6E1EA', light: '#FBF9FC', accent: '#A9A2B4', earIn: '#F4B8C5', nose: '#E89AA8' },
    marks: [[-14,-42,10,9,'#A9A2B4',1],[2,-20,10,10,'#A9A2B4',0]] },
  { id: 'biscuit', species: 'dog', defaultName: 'Biscuit', personality: 'curious',
    desc: 'A tan-and-white pup who sniffs out everything.',
    colors: { body: '#F3D6A8', light: '#FFF6EC', accent: '#C98F54', earIn: '#F4B8C5', nose: '#5A3F33' },
    marks: [[4,-42,10,10,'#C98F54',1]] },
  { id: 'honey', species: 'dog', defaultName: 'Honey', personality: 'gentle',
    desc: 'A golden pup with soft floppy ears.',
    colors: { body: '#F0C77E', light: '#FBE7B8', accent: '#D49A4A', earIn: '#F4B8C5', nose: '#5A3F33' }, marks: [] },
  { id: 'cocoa', species: 'dog', defaultName: 'Cocoa', personality: 'playful',
    desc: 'A chocolate-brown pup full of bounce.',
    colors: { body: '#8B5A3C', light: '#C99A74', accent: '#5E3A26', earIn: '#F4B8C5', nose: '#2E1D16' },
    marks: [[-9,-38,2,2,'#C99A74',1],[7,-38,2,2,'#C99A74',1]] }
];

// Speech bubbles. A personality's own lines are mixed in with the default lines.
const DIALOGUE = {
  default: {
    welcome: ['You came back! I missed you.'],
    idle: ['This room is so cozy.', 'Look at the little lights!'],
    feed: ['Yum! Thank you!', 'Nom nom nom!'],
    play: ['That was fun!', 'Again, again!'],
    rest: ['Zzz... so cozy...'],
    groom: ['Mmm, that feels so nice!', 'All fluffy again!'],
    pet: ['Hehe, that tickles!', 'I love you!'],
    full: ["I'm full, thank you!"],
    tired: ["I'm too sleepy to play..."],
    notSleepy: ["I'm not sleepy yet!"],
    clean: ["I'm already squeaky clean!"],
    hungry: ["I'm a little hungry!"],
    bored: ['Can we play together?'],
    sleepy: ["I'm getting sleepy..."],
    messy: ['I could use a brushing.'],
    levelUp: ["We're getting closer, friend!"]
  },
  playful: { play: ['Wheee! Throw it again!'], pet: ['Pet me more! Pet me more!'] },
  gentle:  { pet: ['Mmm... gentle pats are the best.'], groom: ["Ahh... that's so relaxing."] },
  curious: { feed: ['Ooh, what is this smell? Yum!'], idle: ["What's behind the curtain?"] },
  sleepy:  { rest: ['Finally... a nap...'], idle: ['*yawn*'] }
};

// Which speech event matches which low stat
const NEED_EVENT = { fullness: 'hungry', joy: 'bored', energy: 'sleepy', fluff: 'messy' };

// ---- Stage 4: shop catalogue. price 0 = free. The FIRST item in each category is the default. ----
// To add an item: copy an entry, change id/name/price/swatch/look. Furniture needs a drawing in room.js SLOT_ITEMS.
const SLOTS = { leftFloor: 'Left corner', farRight: 'Right corner', wallArt: 'Wall art' };
const CATALOG = {
  wallpaper: [
    { id: 'pinkStripe', name: 'Pink Stripes', price: 0, swatch: ['#F6C9D3', '#DCCBF0'], look: { kind: 'stripe', base: '#F6C9D3', accent: '#DCCBF0' } },
    { id: 'brick', name: 'Warm Brick', price: 120, swatch: ['#B97A56', '#8F5A3F'], look: { kind: 'brick', base: '#B97A56', accent: '#8F5A3F', hi: '#CB8E68' } },
    { id: 'freshGreen', name: 'Fresh Green', price: 150, swatch: ['#9AED79', '#FFF6E8'], look: { kind: 'dots', base: '#9AED79', accent: '#86DC66', accent2: '#FFF6E8' } }
  ],
  // orange floor is softened; the original #FF9621 is kept in origBase (set CONFIG.useOriginalColours = true to restore)
  floor: [
    { id: 'peachWood', name: 'Peach Wood', price: 0, swatch: ['#F2C9A5', '#B98A6A'], look: { base: '#F2C9A5', line: '#B98A6A', hi: '#F8DCC0', row: 12, joint: 64, stagger: 1 } },
    { id: 'greyTile', name: 'Grey Tiles', price: 100, swatch: ['#708090', '#5C6B7A'], look: { base: '#708090', line: '#5C6B7A', hi: '#8494A4', row: 12, joint: 24, stagger: 0 } },
    { id: 'orangeWood', name: 'Orange Panels', price: 130, swatch: ['#F2A04D', '#B9702F'], look: { base: '#F2A04D', origBase: '#FF9621', line: '#B9702F', hi: '#F7B56F', row: 16, joint: 48, stagger: 1 } }
  ],
  curtain: [
    { id: 'creamFloral', name: 'Cream Floral', price: 0, swatch: ['#FBEFD5', '#F4B79A'], look: { pattern: 'floral', len: 140, fabric: '#FBEFD5', fold: '#EBD9B4', hi: '#FFF9EA', edge: '#F4B79A', band: '#F4B79A', hem: 'scallop' } },
    { id: 'blushGingham', name: 'Blush Gingham', price: 70, swatch: ['#F4B8C5', '#FFF6E8'], look: { pattern: 'check', len: 112, fabric: '#FFF6E8', check: '#F4B8C5', fold: '#E8C9CF', hi: '#FFFFFF', edge: '#D98FA6', ribbon: '#E88FB0', hem: 'straight' } },
    { id: 'lavenderSheer', name: 'Lavender Sheer', price: 90, swatch: ['#E6DAF5', '#B79BE0'], look: { pattern: 'sheer', len: 140, fabric: '#E6DAF5', fold: '#CDB8EC', hi: '#F7F1FD', edge: '#B79BE0', ribbon: '#F4A6C8', tieback: 1, hem: 'straight' } }
  ],
  rug: [
    { id: 'blushFloral', name: 'Blush Floral', price: 0, swatch: ['#F4B8C5', '#FBEFD5'], look: { pattern: 'flower', line: '#C98F9E', border: '#FBEFD5', field: '#F4B8C5', dot: '#FBEFD5', alt: '#FFE08A' } },
    { id: 'lavCheck', name: 'Lavender Check', price: 80, swatch: ['#CDB8EC', '#FFF6E8'], look: { pattern: 'check', line: '#9C86C4', border: '#F3ECFA', field: '#CDB8EC', alt: '#FFF6E8' } },
    { id: 'sageCottage', name: 'Sage Cottage', price: 80, swatch: ['#B5D3B0', '#F4B79A'], look: { pattern: 'leaf', line: '#8FAF8A', border: '#F4C9A8', field: '#B5D3B0', alt: '#8DB58A', dot: '#F4B79A' } }
  ],
  light: [
    { id: 'wallDrape', name: 'Wall Drape', price: 0, swatch: ['#FFE9A8', '#8A6A55'], look: { segs: [[0, 8, 192, 12, 14], [192, 12, 384, 8, 14]] } },
    { id: 'windowFrame', name: 'Window Frame', price: 60, swatch: ['#FFE9A8', '#66A8D8'], look: { segs: [[58, 20, 150, 20, 6], [58, 20, 58, 112, 0], [150, 20, 150, 112, 0], [58, 112, 150, 112, 5]] } },
    { id: 'shelfGarland', name: 'Shelf Garland', price: 70, swatch: ['#FFE9A8', '#C9A27A'], look: { segs: [[258, 82, 340, 82, 8]] } },
    { id: 'bedCanopy', name: 'Bed Canopy', price: 90, swatch: ['#FFE9A8', '#F4B8C5'], look: { segs: [[284, 146, 324, 150, 8], [324, 150, 364, 146, 8]] } },
    { id: 'starryCurtain', name: 'Starry Curtain', price: 110, swatch: ['#FFF3B0', '#CDB8EC'], look: { star: true, segs: [[214, 0, 214, 40, 0], [234, 0, 234, 64, 0], [254, 0, 254, 48, 0], [274, 0, 274, 72, 0], [294, 0, 294, 44, 0], [314, 0, 314, 60, 0], [334, 0, 334, 52, 0], [354, 0, 354, 68, 0]] } }
  ],
  furniture: [
    { id: 'bedsideTable', slot: 'leftFloor', name: 'Bedside Table', price: 40, swatch: ['#FFF6E8', '#CDB8EC'] },
    { id: 'cabinet', slot: 'leftFloor', name: 'Mint Cabinet', price: 70, swatch: ['#FFF6E8', '#BDE5D0'] },
    { id: 'chest', slot: 'leftFloor', name: 'Storage Chest', price: 60, swatch: ['#C9A27A', '#F4B8C5'] },
    { id: 'floorPlant', slot: 'farRight', name: 'Leafy Plant', price: 30, swatch: ['#9CC59A', '#F4B79A'] },
    { id: 'storageBasket', slot: 'farRight', name: 'Blanket Basket', price: 40, swatch: ['#C9A27A', '#F4B8C5'] },
    { id: 'heartFrame', slot: 'wallArt', name: 'Heart Picture', price: 25, swatch: ['#FFF6E8', '#E88FB0'] },
    { id: 'flowerFrame', slot: 'wallArt', name: 'Flower Picture', price: 30, swatch: ['#BDE5D0', '#F2A0B4'] }
  ]
};
