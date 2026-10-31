// Velvet Fyxx — homepage fly-through. Native scroll drives a camera along a spline through gold portals
// into rooms that each hold one of Maria's photographs. One renderer, render-on-demand, lazy textures.
import * as THREE from 'https://esm.sh/three@0.170.0';
import { RoomEnvironment } from 'https://esm.sh/three@0.170.0/examples/jsm/environments/RoomEnvironment.js';

const W = window, D = document, root = D.documentElement;
const fly = D.getElementById('fly'), stage = fly.querySelector('.fly__stage');
const LIGHT = W.innerWidth < 800;
const IMG = n => `assets/img/${n}-${LIGHT ? 800 : 1200}.webp`;
const ALL = [
  { img: 'hero-palace-of-fine-arts', a: 1594 / 1200, name: 'San Francisco', line: 'The Palace of Fine Arts, after dark', portal: 'arch' },
  { img: 'hilton-garden-inn', a: 1, name: 'Hilton Garden Inn', line: 'Sip. Relax. Stay awhile.', portal: 'tunnel' },
  { img: 'fogao-gaucho', a: 1, name: 'Fogão Gaúcho', line: 'Make tonight unforgettable.', portal: 'ring' },
  { img: 'billy-roys', a: 1, name: 'Billy Roy’s', line: 'Good food. Great company.', portal: 'arch', full: 1 },
  { img: 'sushi-tsunami', a: 2134 / 1200, name: 'Sushi Tsunami', line: 'Sushi night done right.', portal: 'tunnel', full: 1 },
  { img: 'mrs-ramen', a: 2134 / 1200, name: 'Mrs. Ramen', line: 'Your next craving starts here.', portal: 'ring' },
  { img: 'gusto-al-gusto', a: 1, name: 'Gusto al Gusto', line: 'Fashion meets place.', portal: 'arch', full: 1 },
  { cta: 1, name: 'Partner With Me', line: 'Hotels · Restaurants · Beauty · Fashion', portal: 'ring' },
];
const ROOMS = LIGHT ? ALL.filter(r => !r.full) : ALL;
const N = ROOMS.length, GAP = 34;
fly.style.setProperty('--rooms', N + 1);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(W.devicePixelRatio || 1, LIGHT ? 1.25 : 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
renderer.setClearColor(0x050405, 1);
stage.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x050405, 14, 62);
const pm = new THREE.PMREMGenerator(renderer);
scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose();
scene.environmentIntensity = 0.55;
scene.add(new THREE.HemisphereLight(0xffe9c4, 0x050405, 0.25));
const cam = new THREE.PerspectiveCamera(LIGHT ? 58 : 42, 1, 0.1, 120);
const lamp = new THREE.PointLight(0xffd9a0, 40, 26, 1.6); cam.add(lamp); lamp.position.set(0, 1.5, -2); scene.add(cam);

const gold = new THREE.MeshStandardMaterial({ color: 0xc8a15a, metalness: 1, roughness: 0.28 });
const glow = new THREE.MeshBasicMaterial({ color: 0xf3dfa8 });
const floorM = new THREE.MeshStandardMaterial({ color: 0x0b0908, metalness: 0.5, roughness: 0.55, envMapIntensity: 0.12 });

// path: gentle S through the rooms
const pts = [];
for (let i = -1; i <= N; i++) pts.push(new THREE.Vector3(Math.sin(i * 1.3) * 2.2, 0.2 + Math.sin(i * 0.7) * 0.25, -i * GAP));
const path = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
const total = path.getLength();
const uAt = z => { // curve param for a given z (curve is monotonic in z)
  let lo = 0, hi = 1; for (let k = 0; k < 24; k++) { const m = (lo + hi) / 2; path.getPointAt(m).z > z ? (lo = m) : (hi = m); } return lo;
};

const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, GAP * (N + 2)), floorM);
floor.rotation.x = -Math.PI / 2; floor.position.set(0, -3.2, -GAP * N / 2); scene.add(floor);

function archShape(w, h, t) {
  const s = new THREE.Shape(), r = w / 2;
  s.moveTo(-r - t, -3.2); s.lineTo(-r - t, h); s.absarc(0, h, r + t, Math.PI, 0, true); s.lineTo(r + t, -3.2); s.lineTo(-r - t, -3.2);
  const hole = new THREE.Path(); hole.moveTo(-r, -3.2); hole.lineTo(r, -3.2); hole.lineTo(r, h); hole.absarc(0, h, r, 0, Math.PI, false); hole.lineTo(-r, -3.2);
  s.holes.push(hole); return s;
}
function rectShape(w, h, t) {
  const s = new THREE.Shape(); s.moveTo(-w / 2 - t, -3.2); s.lineTo(w / 2 + t, -3.2); s.lineTo(w / 2 + t, h + t); s.lineTo(-w / 2 - t, h + t);
  const hole = new THREE.Path(); hole.moveTo(-w / 2, -3.2); hole.lineTo(-w / 2, h); hole.lineTo(w / 2, h); hole.lineTo(w / 2, -3.2); s.holes.push(hole); return s;
}
const ext = { depth: 0.35, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3, curveSegments: 64 };
const ARCH = new THREE.ExtrudeGeometry(archShape(7.5, 2.4, 0.22), ext);
const RECT = new THREE.ExtrudeGeometry(rectShape(7, 5.2, 0.12), { ...ext, depth: 0.18 });
const RING = new THREE.TorusGeometry(4.6, 0.09, 24, 160), HALO = new THREE.TorusGeometry(4.42, 0.018, 8, 160);

function portal(type, z, x) {
  const g = new THREE.Group(); g.position.set(x, 0, z);
  if (type === 'arch') { const a = new THREE.Mesh(ARCH, gold); a.position.z = -0.17; g.add(a); const b = a.clone(); b.position.z = -5; g.add(b); }
  if (type === 'tunnel') for (let k = 0; k < 5; k++) { const m = new THREE.Mesh(RECT, gold); m.position.z = -k * 1.6; g.add(m); }
  if (type === 'ring') { const r = new THREE.Mesh(RING, gold); r.position.y = 1.1; g.add(r); const h = new THREE.Mesh(HALO, glow); h.position.set(0, 1.1, -0.05); g.add(h); }
  scene.add(g);
}

function typeTex(name, line) { // thin spatial type rendered once to a texture
  const c = D.createElement('canvas'); c.width = 2048; c.height = 512; const x = c.getContext('2d');
  x.textAlign = 'center'; x.fillStyle = '#efe2c4';
  x.font = '400 132px "Bodoni Moda", Didot, serif'; if ('letterSpacing' in x) x.letterSpacing = '28px';
  x.fillText(name.toUpperCase(), 1024, 230);
  x.fillStyle = '#c8a15a'; x.fillRect(984, 290, 80, 2);
  x.font = 'italic 300 64px "Cormorant Garamond", Georgia, serif'; if ('letterSpacing' in x) x.letterSpacing = '2px'; x.fillStyle = '#d9cbb0';
  x.fillText(line, 1024, 400);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

const rooms = [], loader = new THREE.TextureLoader();
ROOMS.forEach((r, i) => {
  const z = -i * GAP - 14, pz = z - 9, c = path.getPointAt(uAt(pz + 9));
  portal(r.portal, z, c.x);
  const room = { r, pz, x: c.x, loaded: false };
  if (!r.cta) {
    const h = Math.min(7.2, 5.4 * r.a), w = h / r.a;
    const mat = new THREE.MeshStandardMaterial({ color: 0x111010, roughness: 0.85, metalness: 0, emissive: 0xffffff, emissiveIntensity: 0, transparent: true, opacity: 1 });
    const ph = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); ph.position.set(c.x + (i % 2 ? -2.6 : 2.6) * (LIGHT ? 0 : 1), 0.4, pz); scene.add(ph);
    // hairline gold frame
    const fr = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.12, h + 0.12), gold); fr.position.copy(ph.position); fr.position.z -= 0.02; scene.add(fr);
    room.mat = mat;
  }
  const tm = new THREE.MeshBasicMaterial({ map: typeTex(r.name, r.line), transparent: true, depthWrite: false });
  const tp = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 1.6), tm);
  tp.position.set(r.cta ? c.x : c.x + (i % 2 ? 2.7 : -2.7) * (LIGHT ? 0 : 1), r.cta ? 1.1 : (LIGHT ? -2.3 : 0.2), pz + (r.cta ? 0 : 1.2));
  if (LIGHT) tp.scale.setScalar(r.cta ? 0.55 : 0.62);
  scene.add(tp); room.type = tp; rooms.push(room);
});

function want(t) { // lazy textures: load the current and the next two rooms
  const cz = path.getPointAt(t).z;
  rooms.forEach(rm => {
    if (rm.loaded || !rm.mat || cz - rm.pz > GAP * 2.6) return; rm.loaded = true;
    loader.load(IMG(rm.r.img), tex => { tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; rm.mat.map = tex; rm.mat.emissiveMap = tex; rm.mat.color.set(0xffffff); rm.mat.emissiveIntensity = 0.55; rm.mat.needsUpdate = true; rm.fade = 0; kick(); });
  });
}

// scroll → camera: dwell in front of each photo, glide between them
const rest = rooms.map(rm => uAt(rm.pz + (LIGHT ? 12 : 12.5)));
const startU = uAt(4);
function camU(p) {
  const k = p * N; const i = Math.min(N - 1, Math.floor(k)), f = k - i;
  const e = f < 0.22 ? 0 : f > 0.86 ? 1 : (x => x * x * x * (x * (6 * x - 15) + 10))((f - 0.22) / 0.64);
  const a = i === 0 ? startU : rest[i - 1], b = rest[i];
  return i === 0 ? startU + (b - startU) * (k < 1 ? e : 1) : a + (b - a) * e;
}
// UI: progress, skip, final CTA, cursor
const ui = D.createElement('div'); ui.className = 'fly__ui';
ui.innerHTML = '<a class="fly__skip label" href="#after">Skip intro</a><div class="fly__prog" aria-hidden="true"><i></i><span class="label">01 / ' + String(N).padStart(2, '0') + '</span></div><div class="fly__cta"><a class="btn" href="contact.html">Book Maria <span class="arr" aria-hidden="true">→</span></a><a class="btn btn--ghost" href="work.html">See the Portfolio</a></div>';
stage.appendChild(ui);
const bar = ui.querySelector('.fly__prog i'), num = ui.querySelector('.fly__prog span'), cta = ui.querySelector('.fly__cta');

let vw = 1, vh = 1, top0 = 0, len = 1, cur = -1, tgtU = 0, running = false, last = 0, mx = 0, my = 0, cmx = 0, cmy = 0, shown = -1;
function measure() {
  vw = W.innerWidth; vh = W.innerHeight; renderer.setSize(vw, vh); cam.aspect = vw / vh; cam.updateProjectionMatrix();
  const r = fly.getBoundingClientRect(); top0 = r.top + W.scrollY; len = Math.max(1, r.height - vh);
}
const lk = new THREE.Vector3();
function frame(now) {
  const dt = Math.min(0.05, (now - (last || now)) / 1000) || 1 / 60; last = now;
  const a = 1 - Math.pow(1 - 0.055, dt * 60);
  const p = Math.min(1, Math.max(0, (W.scrollY - top0) / len));
  tgtU = camU(p); if (cur < 0) cur = tgtU;
  cur += (tgtU - cur) * a; cmx += (mx - cmx) * a; cmy += (my - cmy) * a;
  const u = Math.min(0.999, Math.max(0, cur));
  cam.position.copy(path.getPointAt(u)); cam.position.x += cmx * 0.35; cam.position.y += -cmy * 0.2;
  lk.copy(path.getPointAt(Math.min(1, u + 0.012))); lk.y -= 0.05; cam.lookAt(lk.x + cmx * 0.6, lk.y - cmy * 0.3, lk.z);
  want(u);
  let anim = false;
  rooms.forEach(rm => { if (rm.fade !== undefined && rm.fade < 1) { rm.fade = Math.min(1, rm.fade + dt * 1.2); rm.mat.emissiveIntensity = 0.55 * rm.fade; rm.mat.color.setScalar(0.07 + 0.93 * rm.fade); anim = true; } });
  renderer.render(scene, cam);
  bar.style.transform = 'scaleY(' + p.toFixed(4) + ')';
  const idx = Math.min(N, Math.round(p * N) + 1); if (idx !== shown) { shown = idx; num.textContent = String(Math.min(idx, N)).padStart(2, '0') + ' / ' + String(N).padStart(2, '0'); }
  cta.classList.toggle('on', p > 0.93); ui.classList.toggle('done', p >= 1);
  if (!D.hidden && (anim || Math.abs(tgtU - cur) > 2e-5 || Math.abs(mx - cmx) + Math.abs(my - cmy) > 1e-3)) requestAnimationFrame(frame); else { running = false; last = 0; }
}
function kick() { if (!running && !D.hidden) { running = true; requestAnimationFrame(frame); } }

await (D.fonts && D.fonts.load ? Promise.all([D.fonts.load('400 40px "Bodoni Moda"'), D.fonts.load('italic 300 40px "Cormorant Garamond"')]).catch(() => 0) : 0);
rooms.forEach(rm => { const t = typeTex(rm.r.name, rm.r.line); rm.type.material.map.dispose(); rm.type.material.map = t; });
// enable: keep the visitor's place if they already scrolled
const before = fly.offsetHeight, y0 = W.scrollY;
root.classList.add('fly-on');
const added = fly.offsetHeight - before; if (y0 > 10) W.scrollTo(0, y0 + added);
measure(); renderer.compile(scene, cam); want(startU);
addEventListener('scroll', kick, { passive: true });
addEventListener('resize', () => { measure(); kick(); }, { passive: true });
if (matchMedia('(pointer:fine)').matches) addEventListener('pointermove', e => { mx = e.clientX / vw - 0.5; my = e.clientY / vh - 0.5; kick(); }, { passive: true });
D.addEventListener('visibilitychange', kick);
kick();
requestAnimationFrame(() => root.classList.add('fly-ready'));
