// room.js: draws the customisable parts of the room. Every look comes from CATALOG (data.js),
// so adding a wallpaper/rug/curtain is a data change, not a drawing change (unless it needs a new pattern).
const Room = (() => {
  const P = CONFIG.palette, W = 384, FLOOR = 150, WIN = { x: 66, y: 32, w: 76, h: 68 };
  const R = (c, col, x, y, w, h) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
  const look = (cat, id) => (CATALOG[cat].find((i) => i.id === id) || CATALOG[cat][0]).look;
  const base = (l) => (CONFIG.useOriginalColours && l.origBase) || l.base;
  const BULB = { warmWhite: '#FFE9A8', softPink: '#FFC2D6', lavender: '#D9C6FF' };
  const RAINBOW = ['#FFC2D6', '#FFE0A8', '#C8F0D2', '#BFE0F5', '#D9C6FF'];

  // Wallpaper + baseboard + floor
  function wall(c, room) {
    const w = look('wallpaper', room.wallpaper), f = look('floor', room.floor), wb = FLOOR - 5;
    R(c, base(w), 0, 0, W, FLOOR);
    if (w.kind === 'stripe') for (let x = 6; x < W; x += 16) R(c, w.accent, x, 0, 4, wb);
    if (w.kind === 'brick') for (let y = 0, row = 0; y < wb; y += 7, row++) {
      R(c, w.accent, 0, y, W, 1);                                   // mortar row
      for (let x = (row % 2) * 12; x < W; x += 24) { R(c, w.accent, x, y + 1, 1, 6); R(c, w.hi, x + 2, y + 1, 20, 1); }
    }
    if (w.kind === 'dots') {
      for (let y = 6, r = 0; y < wb - 14; y += 14, r++) for (let x = 4 + (r % 2) * 10; x < W; x += 20) R(c, w.accent, x, y, 2, 2);
      R(c, w.accent2, 0, wb - 12, W, 2);                            // cream trim line
    }
    R(c, P.cream, 0, wb, W, 4); R(c, P.wood, 0, FLOOR - 1, W, 1);
    R(c, base(f), 0, FLOOR, W, 66);
    for (let y = FLOOR, row = 0; y < 216; y += f.row, row++) {
      R(c, f.line, 0, y, W, 1);
      for (let x = f.stagger * (row % 2) * (f.joint / 2); x < W; x += f.joint) { R(c, f.line, x, y + 1, 1, f.row - 1); R(c, f.hi, x + 4, y + 3, 3, 1); }
    }
  }

  // The one window always gets exactly one pair of curtains (a single style id, never null).
  function curtains(c, room) {
    const l = look('curtain', room.curtain), top = 30, hem = l.len;
    R(c, P.wood, 44, 26, 122, 3); R(c, P.wood, 41, 24, 4, 7); R(c, P.wood, 165, 24, 4, 7);   // rod + finials
    [[50, 18], [140, 18]].forEach(([x, w], side) => {
      R(c, l.fabric, x, top, w, hem - top);
      if (l.pattern === 'check') {
        for (let y = top, r = 0; y < hem; y += 4, r++) for (let xx = x + (r % 2) * 4; xx < x + w; xx += 8) R(c, l.check, xx, y, Math.min(4, x + w - xx), Math.min(4, hem - y));
        R(c, l.ribbon, x + w / 2 - 3, top + 2, 6, 3); R(c, l.edge, x + w / 2 - 1, top + 2, 2, 3);   // tiny bow
      }
      for (let i = 3; i < w; i += 5) R(c, l.fold, x + i, top, 1, hem - top);      // fold shadows
      for (let i = 1; i < w; i += 5) R(c, l.hi, x + i, top, 1, hem - top);        // fold highlights
      R(c, l.edge, x, top, 1, hem - top); R(c, l.edge, x + w - 1, top, 1, hem - top);
      if (l.pattern === 'floral') for (let fy = 44; fy < hem - 14; fy += 22) for (let fx = 4 + ((fy / 22) % 2) * 4; fx < w - 3; fx += 8) {
        R(c, '#F2A0B4', x + fx, fy - 1, 1, 3); R(c, '#F2A0B4', x + fx - 1, fy, 3, 1); R(c, '#FFE08A', x + fx, fy, 1, 1);
      }
      if (l.pattern === 'sheer') for (let y = top + 3; y < hem - 6; y += 7) R(c, l.hi, x + 2, y, 1, 4);   // sheer sparkle
      if (l.tieback) { R(c, l.ribbon, x, 96, w, 3); R(c, l.ribbon, side ? x - 1 : x + w - 3, 92, 4, 11); }  // ribbon + bow
      if (l.band) R(c, l.band, x, hem - 6, w, 3);
      if (l.hem === 'scallop') for (let cx = 0; cx < w; cx++) {
        const h = (cx % 4 === 1 || cx % 4 === 2) ? 4 : 2;
        R(c, l.fabric, x + cx, hem - 3, 1, h); R(c, l.edge, x + cx, hem - 3 + h, 1, 1);
      } else R(c, l.edge, x, hem - 1, w, 1);
    });
  }

  function rug(c, room) {
    const l = look('rug', room.rug), x = 116, y = 160, w = 152, h = 46;
    R(c, l.line, x + 2, y, w - 4, h); R(c, l.line, x, y + 2, w, h - 4);
    R(c, l.border, x + 3, y + 1, w - 6, h - 2); R(c, l.border, x + 1, y + 3, w - 2, h - 6);
    R(c, l.field, x + 7, y + 5, w - 14, h - 10);
    if (l.pattern === 'flower') for (let fy = y + 12, r = 0; fy < y + h - 8; fy += 14, r++) for (let fx = x + 16 + (r % 2) * 9; fx < x + w - 12; fx += 18) {
      R(c, l.dot, fx, fy - 2, 1, 5); R(c, l.dot, fx - 2, fy, 5, 1); R(c, l.alt, fx, fy, 1, 1);
    }
    if (l.pattern === 'check') for (let yy = y + 5, r = 0; yy < y + h - 5; yy += 6, r++) for (let xx = x + 7 + (r % 2) * 6; xx < x + w - 7; xx += 12) {
      R(c, l.alt, xx, yy, Math.min(6, x + w - 7 - xx), Math.min(6, y + h - 5 - yy));
    }
    if (l.pattern === 'leaf') for (let xx = x + 22; xx < x + w - 14; xx += 22) {   // little botanical sprigs
      R(c, l.alt, xx, y + 12, 1, 22); R(c, l.alt, xx - 3, y + 17, 3, 2); R(c, l.alt, xx + 1, y + 23, 3, 2); R(c, l.alt, xx - 3, y + 28, 3, 2);
      R(c, l.dot, xx + 9, y + 22, 2, 2); R(c, l.dot, xx + 12, y + 25, 2, 2);
    }
  }

  // ----- Furniture. Essentials are fixed; the three slots below are the player's choices. -----
  const bowl = (c, x, y, fill) => { R(c, P.wood, x, y, 18, 8); R(c, fill, x + 2, y + 1, 14, 3); R(c, '#E9D3BE', x + 1, y + 4, 16, 3); };
  const HEART = ['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'];
  const artFrame = (c) => { R(c, P.wood, 172, 56, 28, 28); R(c, P.cream, 174, 58, 24, 24); };
  const SLOT_ITEMS = {
    bedsideTable(c) {
      R(c, P.wood, 9, 164, 30, 4); R(c, P.cream, 10, 165, 28, 2); R(c, P.wood, 11, 168, 26, 30); R(c, P.cream, 12, 169, 24, 28);
      R(c, P.lavender, 14, 172, 20, 8); R(c, P.wood, 22, 175, 3, 2); R(c, P.mint, 14, 184, 20, 8); R(c, P.wood, 22, 187, 3, 2);
      R(c, P.sage, 20, 156, 4, 8); R(c, P.blush, 18, 152, 8, 5);   // tiny vase with a flower
    },
    cabinet(c) {
      R(c, P.wood, 8, 152, 34, 46); R(c, P.cream, 9, 153, 32, 44); R(c, P.wood, 24, 156, 2, 38);
      R(c, P.mint, 12, 158, 10, 14); R(c, P.mint, 28, 158, 10, 14); R(c, P.mint, 12, 176, 10, 16); R(c, P.mint, 28, 176, 10, 16);
      R(c, P.wood, 21, 175, 2, 3); R(c, P.wood, 27, 175, 2, 3);
    },
    chest(c) {
      R(c, P.wood, 6, 178, 36, 20); R(c, '#C9A27A', 7, 179, 34, 18); R(c, P.wood, 6, 184, 36, 2);
      R(c, P.blush, 21, 185, 6, 6); R(c, P.wood, 23, 187, 2, 2);
    },
    floorPlant(c) {
      R(c, P.wood, 362, 184, 14, 14); R(c, P.peach, 363, 185, 12, 12);
      R(c, '#9CC59A', 361, 150, 16, 14); R(c, P.sage, 358, 160, 22, 10); R(c, '#9CC59A', 367, 168, 3, 17);
    },
    storageBasket(c) {
      R(c, P.wood, 360, 180, 22, 18); R(c, '#C9A27A', 361, 181, 20, 16); R(c, '#B08A62', 361, 186, 20, 1); R(c, '#B08A62', 361, 190, 20, 1);
      R(c, P.blush, 363, 176, 16, 6);
    },
    heartFrame(c) {
      artFrame(c); R(c, P.cream, 176, 60, 20, 20);
      HEART.forEach((row, ry) => [...row].forEach((ch, rx) => { if (ch === 'X') R(c, '#E88FB0', 179 + rx * 2, 65 + ry * 2, 2, 2); }));
    },
    flowerFrame(c) {
      artFrame(c); R(c, P.mint, 176, 60, 20, 20);
      R(c, '#F2A0B4', 184, 63, 4, 4); R(c, '#F2A0B4', 184, 73, 4, 4); R(c, '#F2A0B4', 179, 68, 4, 4); R(c, '#F2A0B4', 189, 68, 4, 4); R(c, '#FFE08A', 184, 68, 4, 4);
    }
  };

  function furniture(c, room) {
    // fixed essentials: shelf, pet bed, bowls, toy basket
    R(c, P.wood, 258, 74, 82, 6); R(c, P.cream, 259, 74, 80, 4); R(c, P.wood, 264, 80, 3, 6); R(c, P.wood, 330, 80, 3, 6);
    R(c, P.wood, 271, 63, 12, 11); R(c, P.peach, 272, 64, 10, 9);
    R(c, '#9CC59A', 270, 52, 14, 6); R(c, P.sage, 273, 47, 8, 6); R(c, '#9CC59A', 276, 56, 2, 8);
    R(c, P.lavender, 300, 62, 6, 12); R(c, P.mint, 306, 64, 5, 10); R(c, P.blush, 311, 60, 5, 14);
    R(c, P.wood, 290, 174, 68, 26); R(c, P.cream, 292, 176, 64, 22);
    R(c, P.wood, 294, 168, 60, 14); R(c, P.blush, 296, 170, 56, 10); R(c, P.lavender, 298, 164, 18, 8);
    bowl(c, 52, 190, '#E8A87C'); bowl(c, 76, 190, '#8CC3EA');
    R(c, P.wood, 104, 188, 24, 16); R(c, '#C9A27A', 105, 190, 22, 13); R(c, P.blush, 112, 184, 8, 8);
    // player-chosen slots (one item per slot, so nothing can overlap)
    Object.values(room.furniture || {}).forEach((id) => { if (id && SLOT_ITEMS[id]) SLOT_ITEMS[id](c); });
  }

  // Fairy lights: exactly one arrangement is drawn. The wire always shows; glow only when on.
  function lights(c, L, t) {
    const lk = look('light', L.arrangement), bulbs = [];
    lk.segs.forEach(([x0, y0, x1, y1, sag]) => {
      const n = Math.max(12, Math.ceil(Math.hypot(x1 - x0, y1 - y0) + sag));
      for (let i = 0; i <= n; i++) {
        const u = i / n, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u + sag * 4 * u * (1 - u);
        R(c, '#8A6A55', x, y, 1, 1);
        if (i % 12 === 6) bulbs.push([x, y + 2]);
      }
    });
    bulbs.forEach(([x, y], i) => {
      const col = L.color === 'rainbow' ? RAINBOW[i % RAINBOW.length] : (BULB[L.color] || BULB.warmWhite);
      R(c, '#8A6A55', x, y - 2, 1, 2);
      const shape = (cc) => lk.star ? (R(c, cc, x, y - 2, 1, 5), R(c, cc, x - 2, y, 5, 1), R(c, cc, x - 1, y - 1, 3, 3)) : R(c, cc, x - 1, y - 1, 3, 3);
      if (!L.on) { shape('#D8CBB4'); return; }
      const tw = 0.9 + 0.1 * Math.sin(t * 2 + i * 1.7);
      // Soft radial halo avoids the harsh nested square layers of the old glow.
      if (L.glow > 0) {
        const radius = 3 + 12 * L.glow;
        const gradient = c.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, col + 'B8');
        gradient.addColorStop(0.35, col + '55');
        gradient.addColorStop(1, col + '00');
        c.save(); c.globalAlpha = Math.min(0.8, L.glow * 0.72) * tw;
        c.fillStyle = gradient; c.fillRect(x - radius, y - radius, radius * 2, radius * 2); c.restore();
      }
      c.globalAlpha = 0.5 + 0.5 * L.brightness; shape(col);
      c.globalAlpha = 1;
      R(c, '#FFFCF0', x, y, 1, 1);
    });
  }

  return { wall, curtains, rug, furniture, lights };
})();
