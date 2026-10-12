// render.js: draws everything on a 384x216 canvas using small rectangles (pixel art in code).
// To use your own PNG art later, replace the draw functions here; game logic stays untouched.
const Render = (() => {
  const P = CONFIG.palette, OUT = P.outline;
  const R = (c, col, x, y, w, h) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
  const W = 384, FLOOR = 150, WIN = { x: 66, y: 32, w: 76, h: 68 };
  const DAY = ['#BFE0F5', '#C9E6F7', '#D6EDF9', '#E3F2FB'];
  const NIGHT = ['#2B3270', '#363D82', '#454B94', '#5A5AA6'];
  const STARS = [[78, 44], [92, 60], [104, 40], [84, 78], [126, 70], [72, 66]];
  const BULB = { warmWhite: '#FFE9A8', softPink: '#FFC2D6', lavender: '#D9C6FF' };
  const RAINBOW = ['#FFC2D6', '#FFE0A8', '#C8F0D2', '#BFE0F5', '#D9C6FF'];


  // Sky inside the window. night: 0 (day) to 1 (night); blended so the change is smooth.
  function sky(c, t, night) {
    const ix = WIN.x + 1, iy = WIN.y + 1, iw = WIN.w - 2, ih = WIN.h - 2, bh = Math.ceil(ih / 4);
    DAY.forEach((col, i) => R(c, col, ix, iy + i * bh, iw, bh));
    c.save(); c.beginPath(); c.rect(ix, iy, iw, ih); c.clip();
    c.globalAlpha = 1 - night;
    const cx = ix + ((t * 2) % (iw + 40)) - 30;
    R(c, '#FFFFFF', cx, iy + 14, 24, 6); R(c, '#FFFFFF', cx + 6, iy + 10, 12, 4);
    c.globalAlpha = night;
    NIGHT.forEach((col, i) => R(c, col, ix, iy + i * bh, iw, bh));
    // A readable pixel crescent: warm moon pixels with a sky-coloured bite on the upper-right.
    const mx = ix + 53, my = iy + 10;
    [[2,0,4,1],[1,1,6,1],[0,2,7,1],[0,3,7,2],[1,5,6,1],[2,6,4,1]].forEach(([x,y,w,h]) => R(c, '#FFF3C8', mx+x, my+y, w, h));
    [[5,0,2,1],[6,1,2,1],[6,2,2,2],[5,4,2,1],[4,5,2,1]].forEach(([x,y,w,h]) => R(c, NIGHT[0], mx+x, my+y, w, h));
    STARS.forEach(([sx, sy], i) => { const big = Math.sin(t * 2 + i * 2) > 0; R(c, '#FFF8D6', sx, sy, big ? 2 : 1, big ? 2 : 1); });
    c.restore();
  }

  function windowFrame(c) {
    const { x, y, w, h } = WIN;
    R(c, P.wood, x - 2, y - 2, w + 4, 2); R(c, P.wood, x - 2, y + h, w + 4, 2);
    R(c, P.wood, x - 2, y, 2, h); R(c, P.wood, x + w, y, 2, h);
    R(c, P.cream, x + w / 2 - 1, y, 2, h); R(c, P.cream, x, y + h / 2 - 1, w, 2);   // window bars
    R(c, P.wood, x - 7, y + h + 2, w + 14, 6); R(c, P.cream, x - 6, y + h + 3, w + 12, 3); // sill
  }








  // Room layers live in room.js (wallpaper, floor, curtains, rug, furniture, lights).
  function scene(c, room, t, night) {
    Room.wall(c, room); sky(c, t, night); windowFrame(c); Room.curtains(c, room);
    if (room.rug) Room.rug(c, room);
    Room.furniture(c, room);
  }
  // Night tint first, then lights on top so they still glow at night.
  function overlay(c, room, t, night) {
    if (night > 0) { c.globalAlpha = 0.22 * night; R(c, '#3A3C7A', 0, 0, W, 216); c.globalAlpha = 1; }
    Room.lights(c, room.lights, t);
  }

  // ---- Pets: chibi style, one soft outline around the whole silhouette ----
  function pet(c, p, ox, oy, o) {
    const t = o.t, a = o.anim || 'idle', col = p.colors, cat = p.species === 'cat', still = o.reduced;
    let dx = 0, dy = 0, hd = 0, closed = false, mouth = null, tail = 0;
    if (a === 'idle') { if (!still) dy = Math.sin(t * 2.2) > 0.6 ? -1 : 0; tail = Math.sin(t * 3) > 0 ? 0 : 1; }
    if (a === 'happy') { if (!still) dy = -Math.round(Math.abs(Math.sin(t * 9)) * 4); closed = true; mouth = 'smile'; tail = Math.sin(t * 14) > 0 ? 0 : 2; }
    if (a === 'playing') { if (!still) { dx = Math.round(Math.sin(t * 5) * 12); dy = -Math.round(Math.abs(Math.sin(t * 10)) * 5); } mouth = 'smile'; tail = Math.sin(t * 14) > 0 ? 0 : 2; }
    if (a === 'eating') { hd = 3 + (still ? 0 : Math.round(Math.sin(t * 10))); mouth = 'open'; }
    if (a === 'sleeping') { hd = 4; closed = true; }
    if (!closed && Math.floor(t * 10) % 38 === 0) closed = true;   // blink

    const bodyP = [[-14, -22, 28, 20, col.body, 1], [-8, -12, 16, 10, col.light, 0], [-13, -4, 9, 4, col.light, 1], [4, -4, 9, 4, col.light, 1]];
    const tailP = cat ? [[14, -20, 4, 10, col.body, 1], [16, -26 - tail, 4, 8, col.accent, 1]] : [[14, -20 - tail, 4, 8, col.accent, 1]];
    const headP = [[-14, -42, 28, 22, col.body, 1], [-6, -30, 12, 8, col.light, 0]];
    const earsCat = [[-14, -48, 7, 7, col.body, 1], [7, -48, 7, 7, col.body, 1], [-12, -46, 3, 4, col.earIn, 0], [9, -46, 3, 4, col.earIn, 0]];
    const earsDog = [[-19, -42, 6, 14, col.accent, 1], [13, -42, 6, 14, col.accent, 1]];
    const marks = (head) => p.marks.filter((m) => !!m[5] === head).map((m) => [m[0], m[1], m[2], m[3], m[4], 0]);

    const L = [];
    const add = (parts, off = 0) => parts.forEach((q) => L.push([q[0] + ox + dx, q[1] + oy + dy + off, q[2], q[3], q[4], q[5]]));
    R(c, 'rgba(90,63,51,0.18)', ox - 17 + dx, oy - 1, 34, 3);   // floor shadow
    add(tailP); add(bodyP.concat(marks(false)));
    if (cat) add(earsCat, hd);
    add(headP.concat(marks(true)), hd);
    if (!cat) add(earsDog, hd);
    // Draw clean colour blocks without the heavy expanded outline pass.
    L.forEach((q) => R(c, q[4], q[0], q[1], q[2], q[3]));                                 // colour pass

    // face
    const fx = ox + dx, fy = oy + dy + hd, D = '#3A2A26';
    if (closed) { R(c, D, fx - 9, fy - 33, 4, 1); R(c, D, fx + 5, fy - 33, 4, 1); }
    else { R(c, D, fx - 8, fy - 35, 2, 3); R(c, D, fx + 6, fy - 35, 2, 3); }
    R(c, '#F4A6B4', fx - 11, fy - 30, 3, 2); R(c, '#F4A6B4', fx + 8, fy - 30, 3, 2);   // blush cheeks
    R(c, col.nose, fx - 1, fy - 30, 3, 2);
    if (mouth === 'smile') {
      R(c, D, fx - 2, fy - 27, 1, 1); R(c, D, fx + 2, fy - 27, 1, 1); R(c, D, fx - 1, fy - 26, 3, 1);
      if (!cat) R(c, '#F08A98', fx - 1, fy - 25, 3, 2);
    } else if (mouth === 'open') R(c, '#C0525F', fx - 2, fy - 27, 4, 3);
    if (a === 'sleeping') {
      for (let k = 0; k < 2; k++) {
        const zx = fx + 14 + k * 8, zy = Math.round(fy - 46 - ((t * 8 + k * 7) % 14));
        R(c, '#8A7AB8', zx, zy, 4, 1); R(c, '#8A7AB8', zx + 2, zy + 1, 1, 1); R(c, '#8A7AB8', zx + 1, zy + 2, 1, 1); R(c, '#8A7AB8', zx, zy + 3, 4, 1);
      }
    }
  }

  // Small static portrait for the adoption screens (64x64 canvas)
  function preview(canvas, p) {
    const c = canvas.getContext('2d');
    c.clearRect(0, 0, canvas.width, canvas.height);
    pet(c, p, 30, 58, { anim: 'idle', t: 0, reduced: true });
  }

  return { scene, overlay, pet, preview };
})();
