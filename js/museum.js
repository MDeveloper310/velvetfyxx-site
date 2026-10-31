/* Velvet Fyxx — homepage museum. A pre-rendered cinematic fly-through (JPG frame sequence on a canvas)
   is scrubbed by native scroll with lerp smoothing; Maria's real brand photos float over it as exhibits. */
(function () {
  var W = window, D = document, root = D.documentElement;
  var fly = D.getElementById('fly'); if (!fly) return;
  var stage = fly.querySelector('.fly__stage');
  var LIGHT = W.innerWidth < 800;
  var F = LIGHT ? 125 : 200, DIR = 'assets/museum/' + (LIGHT ? 'm/' : 'd/');
  var src = function (i) { return DIR + String(i + 1).padStart(3, '0') + '.jpg'; };
  var ALL = [
    { img: 'hilton-garden-inn', name: 'Hilton Garden Inn', kind: 'Hotel stay', line: 'Sip. Relax. Stay awhile.', note: 'A poolside hotel-stay story built around slow moments.' },
    { img: 'fogao-gaucho', name: 'Fogão Gaúcho', kind: 'Dining night', line: 'Make tonight unforgettable.', note: 'A candlelit churrascaria evening against the wine wall.' },
    { img: 'sushi-tsunami', name: 'Sushi Tsunami', kind: 'Dining feature', line: 'Sushi night done right.', note: 'An all-you-can-eat table styled as a night out.', full: 1 },
    { img: 'billy-roys', name: 'Billy Roy’s', kind: 'Dining feature', line: 'Good food. Great company.', note: 'Burgers and drinks with a glam point of view.' },
    { img: 'gusto-al-gusto', name: 'Gusto al Gusto', kind: 'Location look', line: 'Fashion meets place.', note: 'A styled look against the restaurant’s signature arch.', full: 1 },
    { img: 'mrs-ramen', name: 'Mrs. Ramen', kind: 'Dining feature', line: 'Your next craving starts here.', note: 'A bold, playful street-food story.' }
  ];
  var EX = LIGHT ? ALL.filter(function (e) { return !e.full; }) : ALL, N = EX.length;
  fly.style.setProperty('--rooms', N + 3);

  var cv = D.createElement('canvas'), cx = cv.getContext('2d', { alpha: false });
  cv.setAttribute('aria-hidden', 'true'); stage.appendChild(cv);
  var imgs = new Array(F), ok = new Array(F);
  function load(i) { if (imgs[i]) return; var im = new Image(); im.decoding = 'async'; im.onload = function () { ok[i] = 1; if (Math.abs(i - cur) < 3) kick(true); }; im.src = src(i); imgs[i] = im; }
  // poster first, then a coarse pass, then fill in (keeps first paint cheap)
  load(0);
  var order = []; for (var s = 16; s >= 1; s = s >> 1) for (var j = 0; j < F; j += s) order.push(j);
  var qi = 0; function pump() { var n = 0; while (qi < order.length && n < 6) { if (!imgs[order[qi]]) { load(order[qi]); n++; } qi++; } if (qi < order.length) setTimeout(pump, 120); }

  // exhibits + UI
  var exWrap = D.createElement('div'); exWrap.className = 'fly__ex';
  EX.forEach(function (e, i) {
    var b = D.createElement('button'); b.type = 'button'; b.className = 'exh ' + (i % 2 ? 'exh--r' : 'exh--l');
    b.setAttribute('aria-label', e.name + ' — open placard'); b.tabIndex = -1;
    b.innerHTML = '<span class="exh__frame"><img alt="" loading="lazy" decoding="async"></span><span class="exh__tag"><span class="label">' + String(i + 1).padStart(2, '0') + ' · ' + e.kind + '</span><span class="exh__name">' + e.name + '</span></span>';
    b.addEventListener('click', function () { open(e, b); });
    e.el = b; e.im = b.querySelector('img'); exWrap.appendChild(b);
  });
  stage.appendChild(exWrap);
  var ui = D.createElement('div'); ui.className = 'fly__ui';
  ui.innerHTML = '<a class="fly__skip label" href="#after">Skip intro</a><div class="fly__prog" aria-hidden="true"><i></i><span class="label">01 / ' + String(N).padStart(2, '0') + '</span></div>' +
    '<div class="fly__cta"><p class="label">The Rotunda</p><p class="wordmark gold fly__cta-h">Partner With Me</p><div class="fly__cta-b"><a class="btn" href="contact.html">Book Maria <span class="arr" aria-hidden="true">→</span></a><a class="btn btn--ghost" href="work.html">See the Portfolio</a></div></div>' +
    '<div class="placard" role="dialog" aria-modal="false" aria-labelledby="pl-h" hidden><button type="button" class="placard__x" aria-label="Close placard">×</button><p class="label pl-k"></p><h2 id="pl-h" class="pl-h"></h2><p class="pl-l"></p><p class="pl-n muted"></p><a class="btn btn--ghost" href="work.html">View in the Work <span class="arr" aria-hidden="true">→</span></a></div>';
  stage.appendChild(ui);
  var bar = ui.querySelector('.fly__prog i'), num = ui.querySelector('.fly__prog span'), cta = ui.querySelector('.fly__cta'), pl = ui.querySelector('.placard');
  function open(e, from) {
    pl.querySelector('.pl-k').textContent = e.kind; pl.querySelector('.pl-h').textContent = e.name;
    pl.querySelector('.pl-l').textContent = '“' + e.line + '”'; pl.querySelector('.pl-n').textContent = e.note;
    pl.classList.toggle('placard--l', from.classList.contains('exh--r')); pl.hidden = false; requestAnimationFrame(function () { pl.classList.add('on'); }); pl._from = from; pl.querySelector('.placard__x').focus({ preventScroll: true });
  }
  function close() { if (pl.hidden) return; pl.classList.remove('on'); setTimeout(function () { pl.hidden = true; }, 400); if (pl._from) pl._from.focus({ preventScroll: true }); }
  pl.querySelector('.placard__x').addEventListener('click', close);
  D.addEventListener('keydown', function (k) { if (k.key === 'Escape') close(); });
  stage.addEventListener('click', function (k) { if (!pl.hidden && !k.target.closest('.placard,.exh')) close(); });

  // scroll → frame
  var vw = 1, vh = 1, dpr = Math.min(W.devicePixelRatio || 1, LIGHT ? 1.5 : 1.25), top0 = 0, len = 1;
  var cur = -1, tgt = 0, running = false, last = 0, mx = 0, my = 0, cmx = 0, cmy = 0, shown = -1, drawn = -1, lastIdx = -1;
  function measure() {
    vw = W.innerWidth; vh = W.innerHeight; cv.width = Math.round(vw * dpr); cv.height = Math.round(vh * dpr);
    var r = fly.getBoundingClientRect(); top0 = r.top + W.scrollY; len = Math.max(1, r.height - vh); drawn = -1;
  }
  function nearest(i) { if (ok[i]) return i; for (var d = 1; d < F; d++) { if (ok[i - d]) return i - d; if (ok[i + d]) return i + d; } return -1; }
  function draw(i) {
    var k = nearest(i); if (k < 0 || k === drawn) return; drawn = k;
    var im = imgs[k], iw = im.naturalWidth, ih = im.naturalHeight, sc = Math.max(cv.width / iw, cv.height / ih);
    var w = iw * sc, h = ih * sc; cx.drawImage(im, (cv.width - w) / 2, (cv.height - h) / 2, w, h);
  }
  var span = 0.72 / N; // exhibits occupy p ∈ [0.1, 0.82]; rotunda after
  function frame(now) {
    var dt = Math.min(0.05, (now - (last || now)) / 1000) || 1 / 60; last = now;
    var a = 1 - Math.pow(1 - 0.08, dt * 60);
    var p = Math.min(1, Math.max(0, (W.scrollY - top0) / len));
    tgt = p * (F - 1); if (cur < 0) cur = tgt;
    cur += (tgt - cur) * a; cmx += (mx - cmx) * a * 0.6; cmy += (my - cmy) * a * 0.6;
    var fi = Math.round(cur); draw(Math.max(0, Math.min(F - 1, fi)));
    cv.style.transform = 'translate3d(' + (-cmx * 14).toFixed(2) + 'px,' + (-cmy * 9).toFixed(2) + 'px,0) scale(1.05)';
    var cp = cur / (F - 1), idx = -1;
    EX.forEach(function (e, i) {
      var c = 0.1 + span * (i + 0.5), t = (cp - c) / (span * 0.5); // -1..1 window
      var vis = Math.abs(t) < 1.25;
      if (vis && !e.im.src) e.im.src = 'assets/img/' + e.img + '-' + (LIGHT ? 800 : 1200) + '.webp';
      var o = vis ? Math.max(0, 1 - Math.pow(Math.max(0, Math.abs(t) - 0.35) / 0.9, 2)) : 0;
      var z = 0.86 + 0.18 * (t + 1) / 2, side = i % 2 ? 1 : -1, ry = side * (8 - 6 * o);
      e.el.style.opacity = o.toFixed(3); e.el.style.visibility = o > 0.01 ? 'visible' : 'hidden';
      e.el.style.transform = 'translate3d(' + (cmx * 10 + side * t * -2).toFixed(2) + 'vw,' + (-t * 4 + cmy * 6).toFixed(2) + 'vh,0) scale(' + z.toFixed(3) + ') rotateY(' + ry.toFixed(2) + 'deg)';
      var act = o > 0.6; e.el.tabIndex = act ? 0 : -1; if (act) idx = i;
    });
    if (idx !== lastIdx && idx < 0) close(); lastIdx = idx;
    bar.style.transform = 'scaleY(' + p.toFixed(4) + ')';
    var n = Math.min(N, Math.max(1, Math.floor((cp - 0.1) / span) + 1)); if (n !== shown) { shown = n; num.textContent = String(n).padStart(2, '0') + ' / ' + String(N).padStart(2, '0'); }
    cta.classList.toggle('on', p > 0.9); ui.classList.toggle('done', p >= 1);
    if (!D.hidden && (Math.abs(tgt - cur) > 0.01 || Math.abs(mx - cmx) + Math.abs(my - cmy) > 1e-3)) requestAnimationFrame(frame); else { running = false; last = 0; }
  }
  function kick(force) { if (force) drawn = -1; if (!running) { running = true; requestAnimationFrame(frame); } }
  measure();
  addEventListener('scroll', function () { kick(); }, { passive: true });
  addEventListener('resize', function () { measure(); kick(true); });
  D.addEventListener('visibilitychange', function () { if (!D.hidden) kick(); });
  if (!LIGHT) stage.addEventListener('pointermove', function (e) { mx = e.clientX / vw - 0.5; my = e.clientY / vh - 0.5; kick(); }, { passive: true });

  imgs[0].addEventListener('load', function () {
    var sy = W.scrollY, hero = D.querySelector('.hero'), hh = hero ? hero.offsetHeight : 0; root.classList.add('fly-on'); measure();
    if (sy > 4) W.scrollTo(0, sy + fly.offsetHeight - hh); // keep reading position after the track appears
    cur = -1; kick(true); requestAnimationFrame(function () { root.classList.add('fly-ready'); });
    setTimeout(pump, 300);
  });
})();
