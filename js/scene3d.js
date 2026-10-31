// Velvet Fyxx — floating gold & glass objects. One renderer, low-poly, render-on-demand.
import * as THREE from 'https://esm.sh/three@0.170.0';
import { RoomEnvironment } from 'https://esm.sh/three@0.170.0/examples/jsm/environments/RoomEnvironment.js';

const W = window, D = document;
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = W.innerWidth < 700;

const canvas = D.createElement('canvas');
canvas.className = 'fx3d'; canvas.setAttribute('aria-hidden', 'true');
D.body.appendChild(canvas);
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
renderer.setPixelRatio(Math.min(W.devicePixelRatio || 1, 1.5));
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; pmrem.dispose();
const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100); cam.position.z = 14;
const key = new THREE.DirectionalLight(0xfff1d6, 1.6); key.position.set(3, 5, 6); scene.add(key);

const gold = new THREE.MeshPhysicalMaterial({ color: 0xd8b26a, metalness: 1, roughness: 0.16, clearcoat: 0.6, clearcoatRoughness: 0.1, envMapIntensity: 1.25 });
const glass = new THREE.MeshPhysicalMaterial({ color: 0xf3e2c0, metalness: 0.1, roughness: 0.02, transparent: true, opacity: 0.42, clearcoat: 1, ior: 1.5, envMapIntensity: 2.2, flatShading: true, depthWrite: false, side: THREE.DoubleSide });
const gem = new THREE.MeshPhysicalMaterial({ color: 0xf4efe6, metalness: 0.75, roughness: 0.03, clearcoat: 1, ior: 2.4, envMapIntensity: 1.6, flatShading: true });

function diamond() { // brilliant cut: table, crown, girdle, pavilion — 10 facets around
  const p = [[0, -1.25], [1, 0], [1, 0.12], [0.62, 0.55], [0, 0.55]].map(([x, y]) => new THREE.Vector2(x, y));
  const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.LatheGeometry(p, 10), gem)); return g;
}
function bottle() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.05, 1.7, 8, 1), glass); g.add(body);
  const juice = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.88, 1.15, 8, 1), new THREE.MeshPhysicalMaterial({ color: 0xc8872e, metalness: 0.3, roughness: 0.1, transparent: true, opacity: 0.55, envMapIntensity: 1.5, flatShading: true }));
  juice.position.y = -0.22; g.add(juice);
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.28, 16), gold); collar.position.y = 0.99; g.add(collar);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.75, 8), gold); cap.position.y = 1.5; g.add(cap);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.55, 0.14, 8), gold); top.position.y = 1.94; g.add(top);
  g.children.forEach(m => m.position.y -= 0.35); return g;
}
function ring() {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.TorusGeometry(1, 0.15, 12, 48), gold));
  const set = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.12, 0.25, 8), gold); set.position.y = 1.15; g.add(set);
  const st = diamond(); st.scale.setScalar(0.36); st.position.y = 1.5; g.add(st); return g;
}

// objects: [mesh, base scale, side offset per section]
const defs = small
  ? [{ m: diamond(), s: 0.42, lanes: [0.78, 0.74] }]
  : [{ m: diamond(), s: 0.62, lanes: [0.8, 0.62, 0.84, 0.7] }, { m: bottle(), s: 0.5, lanes: [-0.9, -0.86, -0.92, -0.88] }, { m: ring(), s: 0.48, lanes: [0.5, 0.86, 0.55, 0.9], mouse: 1 }];
defs.forEach((o, i) => { o.cur = { x: 0, y: 0, s: 0, r: 0 }; o.ph = i * 2.1; scene.add(o.m); });

let vw = 1, vh = 1, halfW = 1, halfH = 1, secs = [];
function measure() {
  vw = W.innerWidth; vh = W.innerHeight;
  renderer.setSize(vw, vh, false); cam.aspect = vw / vh; cam.updateProjectionMatrix();
  halfH = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2)) * cam.position.z; halfW = halfH * cam.aspect;
  secs = [...D.querySelectorAll('main > section, main > div, footer')].map(e => { const r = e.getBoundingClientRect(); return { top: r.top + W.scrollY, h: r.height }; });
}

// target for object i at scroll y: choreographed by the section at the viewport centre
function target(o, i, y, out) {
  const c = y + vh * 0.5;
  let k = 0; while (k < secs.length - 1 && secs[k + 1].top <= c) k++;
  const sec = secs[k] || { top: 0, h: vh }, f = Math.min(1, Math.max(0, (c - sec.top) / Math.max(sec.h, 1)));
  const L = o.lanes, lA = L[k % L.length], lB = L[(k + 1) % L.length];
  const e = f * f * (3 - 2 * f); // smoothstep hand-off between sections; objects stay in the margins
  out.x = (lA + (lB - lA) * e) * halfW;
  // drift down with the page, wrapping lanes so objects travel through each section
  out.y = halfH * (0.5 - 0.9 * f + [0, 0.35, -0.3][i] );
  out.s = o.s * (0.85 + 0.25 * Math.sin(f * Math.PI)) * (k === 0 && i === 0 ? 1.15 : 1);
  out.r = y * 0.0022 + o.ph;
}

let mx = 0, my = 0, cmx = 0, cmy = 0, running = false, last = 0, hidden = D.hidden;
const tgt = { x: 0, y: 0, s: 0, r: 0 };
function frame(now) {
  const dt = Math.min(0.05, (now - (last || now)) / 1000) || 1 / 60; last = now;
  const a = 1 - Math.pow(1 - 0.085, dt * 60); // frame-rate independent lerp
  const y = W.scrollY; let moving = false;
  cmx += (mx - cmx) * a; cmy += (my - cmy) * a;
  if (Math.abs(mx - cmx) + Math.abs(my - cmy) > 1e-3) moving = true;
  defs.forEach((o, i) => {
    target(o, i, y, tgt); const c = o.cur;
    for (const k of ['x', 'y', 's', 'r']) { const d = tgt[k] - c[k]; c[k] += d * a; if (Math.abs(d) > 1e-3) moving = true; }
    const px = o.mouse ? cmx * 0.6 : cmx * 0.12, py = o.mouse ? cmy * 0.4 : cmy * 0.08;
    o.m.position.set(c.x + px, c.y - py, 0);
    o.m.scale.setScalar(c.s);
    o.m.rotation.set(0.35 * Math.sin(c.r * 0.6) + (o.mouse ? cmy * 0.25 : 0), c.r, 0.12 * Math.cos(c.r * 0.4) + (o.mouse ? -cmx * 0.2 : 0));
  });
  renderer.render(scene, cam);
  if (moving && !hidden && !RM) requestAnimationFrame(frame); else { running = false; last = 0; }
}
function kick() { if (!running && !hidden) { running = true; requestAnimationFrame(frame); } }

measure();
if (RM) {
  // static composition: snap to targets, one frame
  defs.forEach((o, i) => { target(o, i, 0, o.cur); });
  frame(performance.now());
  addEventListener('resize', () => { measure(); defs.forEach((o, i) => target(o, i, W.scrollY, o.cur)); frame(performance.now()); });
} else {
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', () => { measure(); kick(); }, { passive: true });
  if (matchMedia('(pointer:fine)').matches) addEventListener('pointermove', e => { mx = (e.clientX / vw - 0.5) * 2; my = (e.clientY / vh - 0.5) * 2; kick(); }, { passive: true });
  D.addEventListener('visibilitychange', () => { hidden = D.hidden; if (!hidden) kick(); });
  new ResizeObserver(() => { measure(); kick(); }).observe(D.body);
  kick();
}
requestAnimationFrame(() => canvas.classList.add('on'));
