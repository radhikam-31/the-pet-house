// main.js: connects the buttons and screens to Game (logic) and Render (drawing).
(() => {
  const $ = (s) => document.querySelector(s);
  const SCREENS = ['species', 'pick', 'name', 'game'];
  const STAT_UI = [['fullness', 'Fullness', '#F2A27A'], ['joy', 'Joy', '#F28BA8'], ['energy', 'Energy', '#8CC3EA'], ['fluff', 'Fluff', '#B79BE0']];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const roomCanvas = $('#room'), ctx = roomCanvas.getContext('2d');
  let chosenSpecies = null, chosenPet = null, nightMix = 0;

  const show = (name) => SCREENS.forEach((s) => $('#screen-' + s).classList.toggle('hidden', s !== name));

  // ----- Adoption flow: species -> individual -> name -----
  document.querySelectorAll('[data-species]').forEach((btn) => {
    Render.preview(btn.querySelector('canvas'), PETS.find((p) => p.species === btn.dataset.species));
    btn.addEventListener('click', () => { chosenSpecies = btn.dataset.species; buildCards(); show('pick'); });
  });

  function buildCards() {
    $('#pick-title').textContent = 'Choose your ' + chosenSpecies;
    const box = $('#pick-cards'); box.innerHTML = '';
    PETS.filter((p) => p.species === chosenSpecies).forEach((p) => {
      const b = document.createElement('button');
      b.className = 'card pixel';
      b.innerHTML = '<canvas width="64" height="64"></canvas><span class="card-name"></span><small></small>';
      b.querySelector('.card-name').textContent = p.defaultName;
      b.querySelector('small').textContent = PERSONALITIES[p.personality].label + ': ' + p.desc;
      Render.preview(b.querySelector('canvas'), p);
      b.addEventListener('click', () => {
        chosenPet = p;
        Render.preview($('#name-preview'), p);
        $('#name-desc').textContent = PERSONALITIES[p.personality].label + '. ' + p.desc;
        $('#name-input').value = p.defaultName;
        show('name'); $('#name-input').focus();
      });
      box.appendChild(b);
    });
  }
  $('#pick-back').onclick = () => show('species');
  $('#name-back').onclick = () => show('pick');
  $('#name-confirm').onclick = () => {
    Game.adopt(chosenPet.id, $('#name-input').value.trim() || chosenPet.defaultName);
    enterGame(true);
  };

  // ----- HUD -----
  const statsBox = $('#stats');
  statsBox.innerHTML = STAT_UI.map(([k, label, color]) =>
    `<div class="stat"><span>${label}</span><div class="track" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="100"><div class="fill" id="fill-${k}" style="background:${color}"></div></div><span id="val-${k}"></span></div>`
  ).join('') + '<div class="stat"><span>Friendship</span><div class="track"><div class="fill" id="fill-friend" style="background:#E88FB0"></div></div><span class="hearts" id="friend-level"></span></div>';

  function updateHud() {
    const s = Game.state; if (!s) return;
    $('#pet-title').textContent = s.name;
    $('#coins').textContent = s.coins;
    STAT_UI.forEach(([k]) => {
      const v = Math.round(s.stats[k]);
      const fill = $('#fill-' + k);
      fill.style.width = v + '%'; fill.classList.toggle('low', v < 30);
      fill.parentElement.setAttribute('aria-valuenow', v);
      $('#val-' + k).textContent = v;
    });
    $('#fill-friend').style.width = Math.round(Game.levelProgress() * 100) + '%';
    $('#friend-level').textContent = '\u2665 ' + Game.level();
  }

  function enterGame(first) {
    show('game');
    if (first) Game.say(`Hi! I'm ${Game.state.name}. Let's be friends!`, 5000);
    updateHud();
  }

  // ----- Actions -----
  function floater(text) {
    const f = document.createElement('div');
    f.className = 'floater'; f.textContent = text;
    $('#floaters').appendChild(f);
    setTimeout(() => f.remove(), 1300);
  }
  function act(name) {
    const res = Game.doAction(name);
    updateHud();
    if (res.coins) floater('+' + res.coins + (res.coins > 1 ? ' Treat Coins' : ' Treat Coin'));
  }
  document.querySelectorAll('[data-action]').forEach((b) => b.addEventListener('click', () => act(b.dataset.action)));
  roomCanvas.addEventListener('click', (e) => {   // clicking the pet pets it
    const r = roomCanvas.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width * 384, y = (e.clientY - r.top) / r.height * 216;
    if (x > 150 && x < 236 && y > 118 && y < 188) act('pet');
  });
  $('#reset').onclick = () => {
    if (confirm('Start over? Your pet and all progress will be permanently deleted.')) { document.querySelector('#deco-close').click(); Game.reset(); show('species'); }
  };

  // ----- Game loop -----
  const bubble = $('#bubble');
  const petCache = {};
  function frame(ms) {
    const s = Game.state;
    if (s) {
      const t = ms / 1000, now = Date.now();
      const h = new Date().getHours(), target = (h >= 19 || h < 6) ? 1 : 0;
      nightMix += Math.sign(target - nightMix) * Math.min(Math.abs(target - nightMix), 0.01);   // smooth day/night
      const def = petCache[s.petId] || (petCache[s.petId] = PETS.find((p) => p.id === s.petId));
      const anim = now < Game.session.animUntil ? Game.session.anim : 'idle';
      const room = Game.viewRoom();   // saved room + any temporary preview
      Render.scene(ctx, room, t, nightMix);
      Render.pet(ctx, def, 192, 182, { anim, t, reduced });
      Render.overlay(ctx, room, t, nightMix);
      const showB = now < Game.session.bubbleUntil;
      bubble.classList.toggle('show', showB);
      if (showB && bubble.textContent !== Game.session.bubble) bubble.textContent = Game.session.bubble;
    }
    requestAnimationFrame(frame);
  }

  let seconds = 0;
  setInterval(() => {
    const s = Game.state; if (!s) return;
    seconds++;
    Game.tick(1); updateHud();
    if (seconds % 14 === 0 && Date.now() > Game.session.bubbleUntil) {   // occasional pet chatter
      const need = Game.neediest();
      if (need) Game.say(Game.line(NEED_EVENT[need]));
      else if (Math.random() < 0.4) Game.say(Game.line('idle'));
    }
    if (seconds % 10 === 0) Game.save();
  }, 1000);
  window.addEventListener('pagehide', () => Game.save());
  document.addEventListener('visibilitychange', () => { if (document.hidden) Game.save(); });

  // ----- Start -----
  const info = Game.load();
  if (Game.state) {
    enterGame(false);
    if (info.away > 30) Game.say(Game.line('welcome'), 5000);
  } else show('species');
  requestAnimationFrame(frame);
})();
