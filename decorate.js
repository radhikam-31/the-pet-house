// decorate.js: the Decorate panel. It only calls Game.buy / Game.apply / Game.setLight;
// all rules (prices, ownership, saving) live in game.js.
(() => {
  const $ = (s) => document.querySelector(s);
  const TABS = [['wallpaper', 'Room Style'], ['curtain', 'Curtains'], ['rug', 'Rugs'], ['furniture', 'Furniture'], ['light', 'Fairy Lights']];
  const COLORS = [['warmWhite', 'Warm white'], ['softPink', 'Soft pink'], ['lavender', 'Lavender'], ['rainbow', 'Pastel rainbow']];
  let tab = 'wallpaper', sel = null;   // sel = the card the player is previewing

  const say = (t) => { $('#deco-msg').textContent = t; };
  const coins = () => { $('#coins').textContent = Game.state.coins; $('#deco-coins').textContent = Game.state.coins; };
  const equipped = (it) => {
    const r = Game.state.room;
    return it.category === 'furniture' ? r.furniture[it.slot] === it.id : it.category === 'light' ? r.lights.arrangement === it.id : r[it.category] === it.id;
  };
  const none = (category, slot, name) => ({ category, slot, id: null, name, price: 0, swatch: ['#FFFFFF', '#E6D8C6'], none: true });

  function entries() {
    if (tab === 'furniture') {
      return Object.keys(SLOTS).flatMap((slot) => [none('furniture', slot, 'Empty')]
        .concat(CATALOG.furniture.filter((i) => i.slot === slot).map((i) => Object.assign({ category: 'furniture' }, i))));
    }
    const list = CATALOG[tab].map((i) => Object.assign({ category: tab }, i));
    if (tab === 'wallpaper') list.forEach((it) => { it.name = ({ pinkStripe: 'Pink Stripes + Peach Wood', brick: 'Warm Brick + Grey Floor', freshGreen: 'Fresh Green + Orange Panels' })[it.id] || it.name; });
    if (tab === 'rug') list.push(none('rug', undefined, 'No rug'));
    return list;
  }

  function render() {
    coins();
    const tabs = $('#deco-tabs'); tabs.innerHTML = '';
    TABS.forEach(([k, label]) => {
      const b = document.createElement('button');
      b.className = 'btn small tab'; b.textContent = label; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(k === tab));
      b.onclick = () => { tab = k; sel = null; Game.session.preview = null; say(''); render(); };
      tabs.appendChild(b);
    });
    const list = $('#deco-list'), scroll = list.scrollTop; list.innerHTML = '';
    let lastSlot = null;
    entries().forEach((it) => {
      if (it.category === 'furniture' && it.slot !== lastSlot) {
        lastSlot = it.slot; const h = document.createElement('h3'); h.textContent = SLOTS[it.slot]; list.appendChild(h);
      }
      const own = it.none || Game.owned(it.id), b = document.createElement('button');
      b.className = 'item' + (sel && sel.id === it.id && sel.category === it.category && sel.slot === it.slot ? ' sel' : '');
      b.innerHTML = '<span class="sw"></span><span class="sw"></span><b></b><small></small>';
      const sw = b.querySelectorAll('.sw'); sw[0].style.background = it.swatch[0]; sw[1].style.background = it.swatch[1];
      b.querySelector('b').textContent = it.name;
      b.querySelector('small').textContent = equipped(it) ? 'In use' : own ? 'Owned' : it.price + ' Treat Coins';
      b.onclick = () => {   // clicking = preview (temporary, never saved)
        sel = it; Game.session.preview = { category: it.category, id: it.id, slot: it.slot };
        say('Previewing ' + it.name + ' in your room.'); render();
      };
      list.appendChild(b);
    });
    list.scrollTop = scroll;
    detail(); extras();
  }

  function doApply(id) {
    const res = Game.apply(sel.category, id, sel.slot);
    say(res.msg);
    if (res.ok) { Game.session.preview = null; if (id === null && !sel.none) sel = null; }
    render();
  }
  function doBuy() { const res = Game.buy(sel.id); say(res.msg); render(); }

  function detail() {
    const d = $('#deco-detail'); d.innerHTML = '';
    if (!sel) { d.textContent = 'Tap an item to preview it in your room.'; return; }
    const add = (label, fn, cls) => { const b = document.createElement('button'); b.className = 'btn ' + (cls || ''); b.textContent = label; b.onclick = fn; d.appendChild(b); };
    const name = document.createElement('b'); name.className = 'dtitle'; name.textContent = sel.name; d.appendChild(name);
    const own = sel.none || Game.owned(sel.id);
    if (equipped(sel)) {
      const s = document.createElement('span'); s.textContent = 'In your room'; d.appendChild(s);
      if (!sel.none && (sel.category === 'rug' || sel.category === 'furniture')) add('Remove', () => doApply(null));
    } else if (own) add('Apply', () => doApply(sel.id), 'primary');
    else add('Buy for ' + sel.price + ' Treat Coins', doBuy, 'primary');
  }

  // Fairy-light controls (shown only on the Fairy Lights tab)
  function extras() {
    const box = $('#deco-extra'); box.classList.toggle('hidden', tab !== 'light');
    if (tab !== 'light') return;
    if (!box.firstChild) {
      box.innerHTML = '<label class="ctl"><input type="checkbox" id="lt-on"> Lights on</label>' +
        '<label class="ctl">Bulb brightness <input type="range" id="lt-bright" min="0" max="100"></label>' +
        '<label class="ctl">Glow spread <input type="range" id="lt-glow" min="0" max="100"></label>' +
        '<div id="lt-colors"></div><small>Brightness changes how bright the bulbs look. Glow spread changes the soft halo around them.</small>';
      $('#lt-on').onchange = (e) => Game.setLight('on', e.target.checked);
      $('#lt-bright').oninput = (e) => Game.setLight('brightness', e.target.value / 100);
      $('#lt-glow').oninput = (e) => Game.setLight('glow', e.target.value / 100);
      COLORS.forEach(([k, label]) => {
        const b = document.createElement('button'); b.className = 'btn small'; b.textContent = label; b.dataset.color = k;
        b.onclick = () => { Game.setLight('color', k); extras(); }; $('#lt-colors').appendChild(b);
      });
    }
    const L = Game.state.room.lights;
    $('#lt-on').checked = L.on; $('#lt-bright').value = Math.round(L.brightness * 100); $('#lt-glow').value = Math.round(L.glow * 100);
    $('#lt-colors').querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.color === L.color)));
  }

  $('#deco-open').onclick = () => { $('#care').classList.add('hidden'); $('#deco').classList.remove('hidden'); say(''); render(); };
  $('#deco-close').onclick = () => {
    Game.session.preview = null; sel = null;
    $('#deco').classList.add('hidden'); $('#care').classList.remove('hidden');
  };
})();
