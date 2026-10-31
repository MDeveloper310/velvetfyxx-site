/* Velvet Fyxx — homepage gallery walk. A filmed-style first-person walk (WebP frame sequence on a canvas)
   is scrubbed by native scroll; each scroll step walks to the next gilded frame and eases into a hold.
   Maria's photos are composited into the frames in the footage; hotspots follow the tracked frame corners. */
(function () {
  var W = window, D = document, root = D.documentElement;
  var fly = D.getElementById('fly'); if (!fly) return;
  var stage = fly.querySelector('.fly__stage');
  var M = W.innerWidth < 800, F = 138, DIR = 'assets/forum/' + (M ? 'm/' : 'd/');
  var KEYS = [0, 26, 53, 81, 109, 137]; // hold frames (start, four frames, rotunda)
  var STEPS = KEYS.length - 1;
  var EX = [
    { name: 'Hilton Garden Inn', kind: 'Hotel stay', line: 'Sip. Relax. Stay awhile.', note: 'A poolside hotel-stay story built around slow moments.' },
    { name: 'Fogão Gaúcho', kind: 'Dining night', line: 'Make tonight unforgettable.', note: 'A candlelit churrascaria evening against the wine wall.' },
    { name: 'Billy Roy’s', kind: 'Dining feature', line: 'Good food. Great company.', note: 'Burgers and drinks with a glam point of view.' },
    { name: 'Gusto al Gusto', kind: 'Location look', line: 'Fashion meets place.', note: 'A styled look against the restaurant’s signature arch.' }
  ];
  fly.style.setProperty('--rooms', STEPS * 1.6 + 1);
  var src = function (i) { return DIR + String(i + 1).padStart(3, '0') + '.webp'; };

  var cv = D.createElement('canvas'), cx = cv.getContext('2d', { alpha: false });
  cv.setAttribute('aria-hidden', 'true'); stage.appendChild(cv);
  var imgs = new Array(F), ok = new Array(F), Q = null;
  function load(i) { if (imgs[i]) return imgs[i]; var im = new Image(); im.decoding = 'async'; im.onload = function () { ok[i] = 1; if (Math.abs(i - cur) < 2) kick(true); }; im.src = src(i); return (imgs[i] = im); }
  var order = []; KEYS.forEach(function (k) { order.push(k); }); for (var s = 8; s >= 1; s = s >> 1) for (var j = 0; j < F; j += s) order.push(j);
  var qi = 0; function pump() { var n = 0; while (qi < order.length && n < 4) { if (!imgs[order[qi]]) { load(order[qi]); n++; } qi++; } if (qi < order.length) setTimeout(pump, 150); }
  fetch('assets/forum/quads.json').then(function (r) { return r.json(); }).then(function (j) { Q = j; kick(true); }).catch(function () {});

  // exhibit hotspots (real buttons, always in tab order) + glow layer
  var svgNS = 'http://www.w3.org/2000/svg', glow = D.createElementNS(svgNS, 'svg'); glow.setAttribute('class', 'fly__glow'); glow.setAttribute('aria-hidden', 'true');
  glow.innerHTML = '<defs><filter id="fg" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="10"/></filter><radialGradient id="sp" cx="50%" cy="0%" r="90%"><stop offset="0" stop-color="#ffd9a0" stop-opacity=".16"/><stop offset="1" stop-color="#ffd9a0" stop-opacity="0"/></radialGradient></defs><polygon class="g1" filter="url(#fg)"/><polygon class="g2"/><polygon class="g3"/>';
  stage.appendChild(glow);
  var g1 = glow.querySelector('.g1'), g2 = glow.querySelector('.g2'), g3 = glow.querySelector('.g3');
  var hs = D.createElement('div'); hs.className = 'fly__hs'; stage.appendChild(hs);
  var hot = -1, cap = D.createElement('div'); cap.className = 'fly__cap'; cap.setAttribute('aria-hidden', 'true'); stage.appendChild(cap);
  EX.forEach(function (e, i) {
    var b = D.createElement('button'); b.type = 'button'; b.className = 'hs';
    b.setAttribute('aria-label', 'Exhibit ' + (i + 1) + ' of 4: ' + e.name + '. Open placard');
    b.addEventListener('click', function () { open(i, b); });
    b.addEventListener('pointerenter', function () { hot = i; kick(); }); b.addEventListener('pointerleave', function () { if (hot === i) hot = -1; kick(); });
    b.addEventListener('focus', function () { hot = i; if (vis(i) < 0.5) goTo(i + 1); kick(); }); b.addEventListener('blur', function () { if (hot === i) hot = -1; kick(); });
    e.b = b; hs.appendChild(b);
  });
  var ui = D.createElement('div'); ui.className = 'fly__ui';
  ui.innerHTML = '<a class="fly__skip label" href="#after">Skip intro</a><div class="fly__prog" aria-hidden="true"><i></i><span class="label">01 / 04</span></div>' +
    '<div class="fly__cta"><p class="label">The Rotunda</p><p class="wordmark gold fly__cta-h">Partner With Me</p><div class="fly__cta-b"><a class="btn" href="contact.html">Book Maria <span class="arr" aria-hidden="true">→</span></a><a class="btn btn--ghost" href="work.html">See the Portfolio</a></div></div>';
  stage.appendChild(ui);
  var dlg = D.createElement('dialog'); dlg.className = 'placard'; dlg.setAttribute('aria-labelledby', 'pl-h'); dlg.setAttribute('aria-describedby', 'pl-l');
  dlg.innerHTML = '<button type="button" class="placard__x" aria-label="Close placard">×</button><p class="label pl-k"></p><h2 id="pl-h" class="pl-h"></h2><p id="pl-l" class="pl-l"></p><p class="pl-n muted"></p><a class="btn btn--ghost" href="work.html">View in the Work <span class="arr" aria-hidden="true">→</span></a>';
  D.body.appendChild(dlg);
  var bar = ui.querySelector('.fly__prog i'), num = ui.querySelector('.fly__prog span'), cta = ui.querySelector('.fly__cta'), from = null;
  function open(i, b) {
    var e = EX[i]; from = b;
    dlg.querySelector('.pl-k').textContent = 'Exhibit ' + (i + 1) + ' · ' + e.kind; dlg.querySelector('.pl-h').textContent = e.name;
    dlg.querySelector('.pl-l').textContent = '“' + e.line + '”'; dlg.querySelector('.pl-n').textContent = e.note;
    dlg.classList.toggle('placard--l', i % 2 === 1);
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    dlg.querySelector('.placard__x').focus();
  }
  function close() { if (dlg.open) dlg.close(); }
  dlg.querySelector('.placard__x').addEventListener('click', close);
  dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
  dlg.addEventListener('close', function () { if (from) from.focus({ preventScroll: true }); });

  var vw = 1, vh = 1, dpr = Math.min(W.devicePixelRatio || 1, 1.5), top0 = 0, len = 1;
  var cur = -1, tgt = 0, running = false, last = 0, mx = 0, my = 0, cmx = 0, cmy = 0, shown = -1, dk = '', box = { x: 0, y: 0, w: 1, h: 1 };
  function measure() {
    vw = W.innerWidth; vh = W.innerHeight; cv.width = Math.round(vw * dpr); cv.height = Math.round(vh * dpr); dk = '';
    var r = fly.getBoundingClientRect(); top0 = r.top + W.scrollY; len = Math.max(1, r.height - vh);
    glow.setAttribute('viewBox', '0 0 ' + vw + ' ' + vh);
    // image box in CSS px: desktop = cover (16:9); mobile = square fitted to width, centered
    if (M) { var s = vw; box = { w: s, h: s, x: (vw - s) / 2, y: (vh - s) / 2 }; }
    else { var sc = Math.max(vw / 16, vh / 9); box = { w: 16 * sc, h: 9 * sc, x: (vw - 16 * sc) / 2, y: (vh - 9 * sc) / 2 }; }
  }
  // map a normalized footage point to screen px (with the parallax transform applied)
  var PX = 1.04;
  function pt(x, y) {
    if (M) x = (x * 1920 - 420) / 1080;
    var sx = box.x + x * box.w, sy = box.y + y * box.h;
    return [(sx - vw / 2) * PX + vw / 2 - cmx * 14, (sy - vh / 2) * PX + vh / 2 - cmy * 9];
  }
  function near(i) { if (ok[i]) return i; for (var d = 1; d < F; d++) { if (ok[i - d]) return i - d; if (ok[i + d]) return i + d; } return -1; }
  function blit(im, a) { cx.globalAlpha = a; cx.drawImage(im, box.x * dpr, box.y * dpr, box.w * dpr, box.h * dpr); }
  function draw(f) {
    var a = Math.floor(f), b = Math.min(F - 1, a + 1), t = f - a, ka = near(a), key = ka + ':' + (ok[b] ? b : -1) + ':' + t.toFixed(2);
    if (ka < 0 || key === dk) return; dk = key;
    if (M) { cx.fillStyle = '#050405'; cx.globalAlpha = 1; cx.fillRect(0, 0, cv.width, cv.height); }
    blit(imgs[ka], 1); var u = Math.min(1, Math.max(0, (t - 0.3) / 0.4)); u = u * u * (3 - 2 * u); if (ok[b] && ka === a && u > 0.02) blit(imgs[b], u); // crossfade between sampled frames
    cx.globalAlpha = 1;
    if (M) { // feather the square into black
      var y0 = box.y * dpr, y1 = (box.y + box.h) * dpr, h = 0.18 * box.h * dpr, gr = cx.createLinearGradient(0, y0, 0, y0 + h);
      gr.addColorStop(0, '#050405'); gr.addColorStop(1, 'rgba(5,4,5,0)'); cx.fillStyle = gr; cx.fillRect(0, y0, cv.width, h);
      gr = cx.createLinearGradient(0, y1 - h, 0, y1); gr.addColorStop(0, 'rgba(5,4,5,0)'); gr.addColorStop(1, '#050405'); cx.fillStyle = gr; cx.fillRect(0, y1 - h, cv.width, h);
    }
  }
  function dwell(x) { // ease out of one hold and into the next, with a flat hold at each end
    x = Math.min(1, Math.max(0, (x - 0.16) / 0.68)); return x * x * x * (x * (6 * x - 15) + 10);
  }
  function frameAt(p) { var k = Math.min(STEPS - 1e-6, p * STEPS), s = Math.floor(k); return KEYS[s] + (KEYS[s + 1] - KEYS[s]) * dwell(k - s); }
  function goTo(step) { W.scrollTo({ top: top0 + len * step / STEPS, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
  function quadAt(fi, k) { if (!Q) return null; var l = Q[Math.round(fi)] || []; for (var j = 0; j < l.length; j++) if (l[j][0] === k) return l[j][1]; return null; }
  function vis(k) { var q = quadAt(cur, k); if (!q) return 0; var w = Math.abs(q[1][0] - q[0][0]); return Math.min(1, w / 0.3); }
  function frame(now) {
    var dt = Math.min(0.05, (now - (last || now)) / 1000) || 1 / 60; last = now;
    var a = 1 - Math.pow(1 - 0.09, dt * 60);
    var p = Math.min(1, Math.max(0, (W.scrollY - top0) / len));
    tgt = frameAt(p); if (cur < 0) cur = tgt;
    cur += (tgt - cur) * a; cmx += (mx - cmx) * a * 0.6; cmy += (my - cmy) * a * 0.6;
    draw(Math.max(0, Math.min(F - 1, cur)));
    cv.style.transform = 'translate3d(' + (-cmx * 14).toFixed(2) + 'px,' + (-cmy * 9).toFixed(2) + 'px,0) scale(' + PX + ')';
    var act = -1;
    EX.forEach(function (e, k) {
      var q = quadAt(cur, k), b = e.b;
      if (!q) { b.classList.remove('on'); return; }
      var P = q.map(function (c) { return pt(c[0], c[1]); });
      var x0 = Math.min(P[0][0], P[3][0]), x1 = Math.max(P[1][0], P[2][0]), y0 = Math.min(P[0][1], P[1][1]), y1 = Math.max(P[2][1], P[3][1]);
      var onS = (x1 - x0) > vw * (M ? 0.45 : 0.2) && x0 > -vw * 0.1 && x1 < vw * 1.1;
      b.classList.toggle('on', onS);
      b.style.cssText = 'left:' + x0.toFixed(1) + 'px;top:' + y0.toFixed(1) + 'px;width:' + (x1 - x0).toFixed(1) + 'px;height:' + (y1 - y0).toFixed(1) + 'px';
      e.P = P; e.bb = [x0, y0, x1, y1]; if (onS && (x1 - x0) > vw * (M ? 0.6 : 0.3)) act = k;
    });
    var gk = hot >= 0 && EX[hot].b.classList.contains('on') ? hot : -1;
    glow.classList.toggle('on', gk >= 0);
    if (gk >= 0) { var ps = EX[gk].P.map(function (c) { return c[0].toFixed(1) + ',' + c[1].toFixed(1); }).join(' '); g1.setAttribute('points', ps); g2.setAttribute('points', ps); g3.setAttribute('points', ps); }
    if (act >= 0) { var e = EX[act]; cap.innerHTML = '<span class="label">' + String(act + 1).padStart(2, '0') + ' · ' + e.kind + '</span><span class="fly__cap-n">' + e.name + '</span><span class="fly__cap-h">Click the frame for the placard</span>';
    }
    cap.classList.toggle('on', act >= 0 && p > 0.06);
    bar.style.transform = 'scaleY(' + p.toFixed(4) + ')';
    var n = Math.min(4, Math.max(1, Math.round(p * STEPS))); if (n !== shown) { shown = n; num.textContent = String(n).padStart(2, '0') + ' / 04'; }
    cta.classList.toggle('on', p > 0.9); ui.classList.toggle('done', p >= 1);
    if (!D.hidden && (Math.abs(tgt - cur) > 0.004 || Math.abs(mx - cmx) + Math.abs(my - cmy) > 1e-3)) requestAnimationFrame(frame); else { running = false; last = 0; }
  }
  function kick(force) { if (force) dk = ''; if (!running) { running = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', function () { kick(); }, { passive: true });
  addEventListener('resize', function () { measure(); kick(true); });
  D.addEventListener('visibilitychange', function () { if (!D.hidden) kick(); });
  if (!M) stage.addEventListener('pointermove', function (e) { mx = e.clientX / vw - 0.5; my = e.clientY / vh - 0.5; kick(); }, { passive: true });

  load(0).addEventListener('load', function () {
    var sy = W.scrollY, hero = D.querySelector('.hero'), hh = hero ? hero.offsetHeight : 0; root.classList.add('fly-on'); measure();
    if (sy > 4) W.scrollTo(0, sy + fly.offsetHeight - hh);
    cur = -1; kick(true); requestAnimationFrame(function () { root.classList.add('fly-ready'); });
    setTimeout(pump, 300);
  });
})();
