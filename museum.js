/* Sammlung MBG – 3D-Museum (three.js r128) */
(() => {
'use strict';

const S = window.SAMMLUNG || { titel:'Sammlung', untertitel:'', exponate:[] };
const EXPONATE = (S.exponate || []).map((e, i) => Object.assign({ art:'bild', titel:'Ohne Titel' }, e, { nr:i }));

// ---------- Maße ----------
const RW = 14;          // Raumbreite (x)
const RL = 16;          // Raumlänge (z)
const RH = 4.6;         // Raumhöhe
const WD = 0.3;         // Wanddicke
const TUER = 3.2;       // Türbreite
const TUER_H = 3.3;
const AUGE = 1.65;
const RADIUS = 0.35;
const BILD_Y = 1.75;
const BILD_MAX_B = 3.0, BILD_MAX_H = 2.2;

// ---------- Exponate auf Räume verteilen ----------
const wand = EXPONATE.filter(e => e.art !== 'objekt');
const vitr = EXPONATE.filter(e => e.art === 'objekt');
const RAEUME = Math.max(1, Math.ceil(wand.length / 8), Math.ceil(vitr.length / 2));

// Wandplätze je Raum in Besuchsreihenfolge: links/rechts vorn, links/rechts hinten, Rückwand, Vorderwand
function wandPlatz(raum, i){
  const zc = -(raum + 0.5) * RL;
  const innen = RW / 2 - WD / 2;
  const plaetze = [
    { x:-innen, z:zc + 3.6, nx: 1, nz:0 },
    { x: innen, z:zc + 3.6, nx:-1, nz:0 },
    { x:-innen, z:zc - 3.6, nx: 1, nz:0 },
    { x: innen, z:zc - 3.6, nx:-1, nz:0 },
    { x:-4.0, z:-(raum + 1) * RL + WD / 2, nx:0, nz: 1 },
    { x: 4.0, z:-(raum + 1) * RL + WD / 2, nx:0, nz: 1 },
    { x:-4.0, z:-raum * RL - WD / 2, nx:0, nz:-1 },
    { x: 4.0, z:-raum * RL - WD / 2, nx:0, nz:-1 },
  ];
  return plaetze[i];
}
wand.forEach((e, i) => { e.raum = Math.floor(i / 8); e.platz = wandPlatz(e.raum, i % 8); });
vitr.forEach((e, i) => {
  e.raum = Math.floor(i / 2);
  e.platz = { x: i % 2 ? 3.6 : -3.6, z: -(e.raum + 0.5) * RL, nx: i % 2 ? -1 : 1, nz:0 };
});

// ---------- Grundgerüst ----------
const canvas = document.getElementById('welt');
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, powerPreference:'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1512);
scene.fog = new THREE.Fog(0x1a1512, 30, 70);
const camera = new THREE.PerspectiveCamera(70, 1, 0.05, 200);
camera.rotation.order = 'YXZ';
const MAX_ANISO = renderer.capabilities.getMaxAnisotropy();

function groesse(){
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.fov = w < h ? 82 : 70;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', groesse);
groesse();

scene.add(new THREE.HemisphereLight(0xfff4e6, 0x3a2c22, 0.75));
const sonne = new THREE.DirectionalLight(0xfff1dc, 0.35);
sonne.position.set(4, 10, 3);
scene.add(sonne);

// ---------- Texturen aus Canvas ----------
function canvasTex(c, wiederholen){
  const t = new THREE.CanvasTexture(c);
  t.encoding = THREE.sRGBEncoding;
  t.anisotropy = MAX_ANISO;
  if (wiederholen){ t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  return t;
}

function parkett(){
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const g = c.getContext('2d');
  const bw = 64, bh = 256;
  for (let x = 0; x < 512; x += bw){
    const versatz = (x / bw) % 2 ? bh / 2 : 0;
    for (let y = -bh; y < 512; y += bh){
      const l = 32 + Math.random() * 10;
      g.fillStyle = `hsl(${26 + Math.random() * 6},${38 + Math.random() * 10}%,${l}%)`;
      g.fillRect(x, y + versatz, bw, bh);
      g.globalAlpha = 0.08;
      for (let k = 0; k < 14; k++){
        g.fillStyle = Math.random() < .5 ? '#000' : '#fff';
        g.fillRect(x + Math.random() * bw, y + versatz, 1 + Math.random() * 2, bh);
      }
      g.globalAlpha = 1;
      g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 2;
      g.strokeRect(x + 1, y + versatz + 1, bw - 2, bh - 2);
    }
  }
  const t = canvasTex(c, true);
  return t;
}

function umbrechen(g, text, maxB){
  const woerter = String(text).split(/\s+/), zeilen = [];
  let z = '';
  for (const w of woerter){
    const probe = z ? z + ' ' + w : w;
    if (g.measureText(probe).width > maxB && z){ zeilen.push(z); z = w; } else z = probe;
  }
  if (z) zeilen.push(z);
  return zeilen;
}

const FARBEN = [['#2b3a55','#d8b46a'],['#4a2c2a','#f0c987'],['#23443d','#cfe3c8'],['#3d2f4f','#f2b6c6'],['#2e4152','#9fd3e6'],['#4f3a22','#f4dca4']];
function platzhalterBild(e){
  const c = document.createElement('canvas'); c.width = 1024; c.height = 768;
  const g = c.getContext('2d');
  const [a, b] = FARBEN[e.nr % FARBEN.length];
  const grad = g.createLinearGradient(0, 0, 1024, 768);
  grad.addColorStop(0, a); grad.addColorStop(1, '#14110f');
  g.fillStyle = grad; g.fillRect(0, 0, 1024, 768);
  g.strokeStyle = b; g.globalAlpha = .25; g.lineWidth = 3;
  for (let i = 0; i < 9; i++){ g.beginPath(); g.arc(780, 160, 60 + i * 55, 0, Math.PI * 2); g.stroke(); }
  g.globalAlpha = 1;
  g.fillStyle = b; g.font = '800 200px "Barlow SC", sans-serif'; g.textAlign = 'left';
  g.fillText(String(e.nr + 1).padStart(2, '0'), 70, 260);
  g.fillStyle = '#f4efe6'; g.font = '800 72px "Barlow SC", sans-serif';
  umbrechen(g, e.titel, 880).slice(0, 3).forEach((z, i) => g.fillText(z, 70, 420 + i * 80));
  g.globalAlpha = .6; g.font = '600 36px "Barlow SC", sans-serif';
  g.fillText('Bild folgt', 70, 700);
  return c;
}

function zitatBild(e){
  const c = document.createElement('canvas'); c.width = 1024; c.height = 768;
  const g = c.getContext('2d');
  g.fillStyle = '#f4efe6'; g.fillRect(0, 0, 1024, 768);
  g.fillStyle = '#d8b46a'; g.font = '800 260px Georgia, serif'; g.fillText('„', 50, 260);
  g.fillStyle = '#1c1714';
  let gr = 70, zeilen;
  do { g.font = `italic ${gr}px Georgia, serif`; zeilen = umbrechen(g, e.text || e.titel, 860); gr -= 4; }
  while (zeilen.length * gr * 1.3 > 470 && gr > 30);
  const lh = (gr + 4) * 1.3;
  const y0 = 384 - (zeilen.length * lh) / 2 + lh * .7;
  zeilen.forEach((z, i) => g.fillText(z, 82, y0 + i * lh));
  if (e.von){ g.font = '600 40px "Barlow SC", sans-serif'; g.fillStyle = '#7a6a58'; g.fillText('— ' + e.von, 82, 700); }
  return c;
}

function schildTex(e){
  const c = document.createElement('canvas'); c.width = 512; c.height = 200;
  const g = c.getContext('2d');
  g.fillStyle = '#f7f3ec'; g.fillRect(0, 0, 512, 200);
  g.fillStyle = '#1c1714'; g.font = '800 44px "Barlow SC", sans-serif';
  const z = umbrechen(g, e.titel, 460).slice(0, 2);
  z.forEach((t, i) => g.fillText(t, 26, 64 + i * 46));
  g.fillStyle = '#7a6a58'; g.font = '600 30px "Barlow SC", sans-serif';
  const meta = [e.von, e.datum].filter(Boolean).join(' · ');
  if (meta) g.fillText(meta, 26, z.length > 1 ? 172 : 124, 460);
  g.fillStyle = '#d8b46a'; g.fillRect(0, 0, 8, 200);
  return canvasTex(c);
}

function titelTex(){
  const c = document.createElement('canvas'); c.width = 2048; c.height = 900;
  const g = c.getContext('2d');
  g.textAlign = 'center';
  g.fillStyle = '#1c1714'; g.font = '800 300px "Barlow SC", sans-serif';
  g.fillText(String(S.titel).toUpperCase(), 1024, 380, 1900);
  g.fillStyle = '#b08a42'; g.fillRect(724, 470, 600, 8);
  g.font = '600 150px "Barlow SC", sans-serif';
  g.fillText(String(S.untertitel || '').toUpperCase().split('').join(' '), 1024, 690, 1900);
  return canvasTex(c);
}

function textTafel(text, b, h, groesse){
  const c = document.createElement('canvas'); c.width = 1024; c.height = Math.round(1024 * h / b);
  const g = c.getContext('2d');
  g.textAlign = 'center'; g.fillStyle = '#1c1714'; g.font = `800 ${groesse}px "Barlow SC", sans-serif`;
  const zeilen = String(text).split('\n');
  zeilen.forEach((z, i) => g.fillText(z, 512, c.height / 2 + (i - (zeilen.length - 1) / 2) * groesse * 1.15 + groesse * .35));
  return new THREE.Mesh(new THREE.PlaneGeometry(b, h), new THREE.MeshBasicMaterial({ map:canvasTex(c), transparent:true, toneMapped:false }));
}

// ---------- Materialien ----------
const matWand = new THREE.MeshStandardMaterial({ color:0xeae4da, roughness:.95 });
const matSockel = new THREE.MeshStandardMaterial({ color:0x2a221c, roughness:.6 });
const matBoden = (() => { const t = parkett(); t.repeat.set(RW / 4, RL * RAEUME / 4); return new THREE.MeshStandardMaterial({ map:t, roughness:.55, metalness:.05 }); })();
const matDecke = new THREE.MeshStandardMaterial({ color:0xf3efe8, emissive:0x8a847c, roughness:1 });
const matRahmen = new THREE.MeshStandardMaterial({ color:0x2a1d14, roughness:.45, metalness:.2 });
const matGold = new THREE.MeshStandardMaterial({ color:0xc9a35a, roughness:.3, metalness:.85 });
const matLicht = new THREE.MeshBasicMaterial({ color:0xfff6e3, toneMapped:false });
const matGlas = new THREE.MeshPhysicalMaterial({ color:0xddeeff, roughness:.05, metalness:0, transparent:true, opacity:.16, depthWrite:false });

// ---------- Kollision ----------
const hindernisse = [];
function box(x0, x1, z0, z1, y0, y1, mat, kollision = true){
  const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), mat);
  m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  scene.add(m);
  if (kollision) hindernisse.push({ x0, x1, z0, z1 });
  return m;
}

// ---------- Gebäude ----------
const LANG = RAEUME * RL;
const boden = new THREE.Mesh(new THREE.PlaneGeometry(RW, LANG), matBoden);
boden.rotation.x = -Math.PI / 2; boden.position.set(0, 0, -LANG / 2);
scene.add(boden);
const decke = new THREE.Mesh(new THREE.PlaneGeometry(RW, LANG), matDecke);
decke.rotation.x = Math.PI / 2; decke.position.set(0, RH, -LANG / 2);
scene.add(decke);

// Seitenwände + Sockelleisten
box(-RW / 2 - WD / 2, -RW / 2 + WD / 2, -LANG, 0, 0, RH, matWand);
box( RW / 2 - WD / 2,  RW / 2 + WD / 2, -LANG, 0, 0, RH, matWand);
box(-RW / 2 + WD / 2, -RW / 2 + WD / 2 + .02, -LANG, 0, 0, .12, matSockel, false);
box( RW / 2 - WD / 2 - .02,  RW / 2 - WD / 2, -LANG, 0, 0, .12, matSockel, false);

// Querwände: vorn (Eingang, geschlossen), dazwischen mit Tür, hinten geschlossen
for (let i = 0; i <= RAEUME; i++){
  const z = -i * RL;
  const z0 = z - WD / 2, z1 = z + WD / 2;
  if (i === 0 || i === RAEUME){
    box(-RW / 2, RW / 2, z0, z1, 0, RH, matWand);
  } else {
    box(-RW / 2, -TUER / 2, z0, z1, 0, RH, matWand);
    box(TUER / 2, RW / 2, z0, z1, 0, RH, matWand);
    box(-TUER / 2, TUER / 2, z0, z1, TUER_H, RH, matWand, false);
    // Türrahmen
    box(-TUER / 2 - .08, -TUER / 2, z0 - .04, z1 + .04, 0, TUER_H + .08, matRahmen, false);
    box(TUER / 2, TUER / 2 + .08, z0 - .04, z1 + .04, 0, TUER_H + .08, matRahmen, false);
    box(-TUER / 2 - .08, TUER / 2 + .08, z0 - .04, z1 + .04, TUER_H, TUER_H + .08, matRahmen, false);
    // Raumnummer über der Tür (beide Seiten)
    for (const s of [1, -1]){
      const t = textTafel(`Raum ${s > 0 ? i + 1 : i}`, 1.6, .35, 150);
      t.position.set(0, TUER_H + .45, z + s * (WD / 2 + .01));
      if (s < 0) t.rotation.y = Math.PI;
      scene.add(t);
    }
  }
}

// Deckenlichter + eine Lampe pro Raum
for (let r = 0; r < RAEUME; r++){
  const zc = -(r + .5) * RL;
  for (const dz of [-4, 4]) for (const dx of [-3.2, 3.2]){
    const p = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), matLicht);
    p.rotation.x = Math.PI / 2; p.position.set(dx, RH - .01, zc + dz);
    scene.add(p);
  }
  if (r < 12){
    const l = new THREE.PointLight(0xffeeda, 0.9, 22, 1.6);
    l.position.set(0, RH - .6, zc);
    scene.add(l);
  }
}

// Eingangswand mit Titel
const titel = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 1.93), new THREE.MeshBasicMaterial({ map:titelTex(), transparent:true }));
titel.position.set(0, 2.5, -WD / 2 - .01); titel.rotation.y = Math.PI;
scene.add(titel);
const ende = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 1.93), new THREE.MeshBasicMaterial({ map:titelTex(), transparent:true }));
ende.position.set(0, 2.6, -LANG + WD / 2 + .01);
scene.add(ende);

// Bank im Eingangsraum
(() => {
  const zc = -RL / 2;
  box(-1.2, 1.2, zc - .25, zc + .25, .38, .46, matRahmen);
  for (const dx of [-1, 1]) box(dx - .06, dx + .06, zc - .2, zc + .2, 0, .38, matSockel, false);
})();

// ---------- Exponate bauen ----------
const klickbar = [];
const loader = new THREE.TextureLoader();

function ladeBild(e, fertig){
  if (e.art === 'zitat'){ const c = zitatBild(e); e.vorschau = c.toDataURL('image/jpeg', .85); return fertig(canvasTex(c), 4 / 3); }
  const ersatz = () => { const c = platzhalterBild(e); e.vorschau = c.toDataURL('image/jpeg', .85); fertig(canvasTex(c), 4 / 3); };
  if (!e.bild) return ersatz();
  loader.load(e.bild, t => {
    t.encoding = THREE.sRGBEncoding; t.anisotropy = MAX_ANISO;
    e.vorschau = e.bild;
    fertig(t, t.image.width / t.image.height);
  }, undefined, () => { console.warn('Bild nicht gefunden:', e.bild); ersatz(); });
}

function bauWandExponat(e){
  const p = e.platz;
  const gruppe = new THREE.Group();
  gruppe.position.set(p.x + p.nx * .01, 0, p.z + p.nz * .01);
  gruppe.rotation.y = Math.atan2(p.nx, p.nz);
  scene.add(gruppe);
  e.anker = new THREE.Vector3(p.x, BILD_Y, p.z);

  ladeBild(e, (tex, ratio) => {
    let b = BILD_MAX_B, h = b / ratio;
    if (h > BILD_MAX_H){ h = BILD_MAX_H; b = h * ratio; }
    const rand = e.art === 'zitat' ? .06 : .1;
    const passep = e.art === 'zitat' ? 0 : .12;
    const tiefe = .07;
    // Rückplatte (Passepartout)
    const pp = new THREE.Mesh(new THREE.BoxGeometry(b + passep * 2, h + passep * 2, .03), new THREE.MeshStandardMaterial({ color:0xf8f5ef, roughness:.9 }));
    pp.position.set(0, BILD_Y, .02); gruppe.add(pp);
    // Rahmen
    const rb = b + passep * 2, rh = h + passep * 2;
    const mR = e.art === 'zitat' ? matGold : matRahmen;
    [[0, rh / 2 + rand / 2, rb + rand * 2, rand], [0, -rh / 2 - rand / 2, rb + rand * 2, rand],
     [rb / 2 + rand / 2, 0, rand, rh], [-rb / 2 - rand / 2, 0, rand, rh]].forEach(([x, y, w, hh]) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, hh, tiefe), mR);
      m.position.set(x, BILD_Y + y, tiefe / 2); gruppe.add(m);
    });
    // Bild
    const bild = new THREE.Mesh(new THREE.PlaneGeometry(b, h), new THREE.MeshBasicMaterial({ map:tex, toneMapped:false }));
    bild.position.set(0, BILD_Y, .04); bild.userData.exponat = e; gruppe.add(bild);
    klickbar.push(bild, pp);
    pp.userData.exponat = e;
    // Lichtkegel an der Wand
    const kegel = new THREE.Mesh(new THREE.PlaneGeometry(rb + 1.6, 3.4), lichtkegelMat);
    kegel.position.set(0, BILD_Y + .35, .005); gruppe.add(kegel);
    // Strahler
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(.06, .09, .22, 12), matSockel);
    arm.position.set(0, BILD_Y + rh / 2 + .55, .35); arm.rotation.x = -.9; gruppe.add(arm);
    // Schild
    const schild = new THREE.Mesh(new THREE.PlaneGeometry(.64, .25), new THREE.MeshBasicMaterial({ map:schildTex(e), toneMapped:false }));
    schild.position.set(rb / 2 + rand + .5, 1.15, .02); schild.userData.exponat = e; gruppe.add(schild);
    klickbar.push(schild);
    // Neu-Markierung
    e.punkt = neuPunkt(gruppe, new THREE.Vector3(rb / 2 + rand + .5, 1.42, .05));
    aktualisierePunkt(e);
  });
}

const lichtkegelMat = (() => {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  const gr = g.createRadialGradient(128, 40, 10, 128, 120, 150);
  gr.addColorStop(0, 'rgba(255,236,200,.55)'); gr.addColorStop(1, 'rgba(255,236,200,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  return new THREE.MeshBasicMaterial({ map:canvasTex(c), transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, toneMapped:false, opacity:.5 });
})();

function neuPunkt(eltern, pos){
  const m = new THREE.Mesh(new THREE.SphereGeometry(.05, 12, 8), new THREE.MeshBasicMaterial({ color:0xd8b46a, toneMapped:false }));
  m.position.copy(pos); eltern.add(m);
  return m;
}

const drehend = [];
function bauVitrine(e){
  const p = e.platz;
  const g = new THREE.Group();
  g.position.set(p.x, 0, p.z);
  scene.add(g);
  const s = .55;
  box(p.x - s, p.x + s, p.z - s, p.z + s, 0, 1.0, matSockel);
  const deckel = new THREE.Mesh(new THREE.BoxGeometry(s * 2 + .04, .04, s * 2 + .04), matGold);
  deckel.position.y = 1.0; g.add(deckel);
  const glas = new THREE.Mesh(new THREE.BoxGeometry(s * 2 - .04, 1.1, s * 2 - .04), matGlas);
  glas.position.y = 1.57; g.add(glas);
  const kante = new THREE.LineSegments(new THREE.EdgesGeometry(glas.geometry), new THREE.LineBasicMaterial({ color:0xc9a35a, transparent:true, opacity:.6 }));
  kante.position.copy(glas.position); g.add(kante);
  const licht = new THREE.Mesh(new THREE.PlaneGeometry(s * 1.6, s * 1.6), matLicht);
  licht.rotation.x = Math.PI / 2; licht.position.y = 2.115; g.add(licht);
  glas.userData.exponat = e; klickbar.push(glas);
  e.anker = new THREE.Vector3(p.x, 1.5, p.z);

  ladeBild(e, (tex, ratio) => {
    let b = .8, h = b / ratio;
    if (h > .9){ h = .9; b = h * ratio; }
    const tafel = new THREE.Mesh(new THREE.PlaneGeometry(b, h), new THREE.MeshBasicMaterial({ map:tex, side:THREE.DoubleSide, toneMapped:false }));
    tafel.position.y = 1.08 + h / 2 + .05; tafel.userData.exponat = e;
    g.add(tafel); klickbar.push(tafel); drehend.push(tafel);
  });
  // Schild am Sockel, Richtung Gang
  const schild = new THREE.Mesh(new THREE.PlaneGeometry(.64, .25), new THREE.MeshBasicMaterial({ map:schildTex(e), toneMapped:false }));
  schild.position.set(p.nx * (s + .01), .78, 0); schild.rotation.y = Math.atan2(p.nx, p.nz);
  schild.userData.exponat = e; g.add(schild); klickbar.push(schild);
  e.punkt = neuPunkt(g, new THREE.Vector3(p.nx * (s + .02), .95, 0));
  aktualisierePunkt(e);
}

// ---------- Entdeckt-Zähler ----------
const SPEICHER = 'mbg2028-entdeckt';
let entdeckt = new Set();
try { entdeckt = new Set(JSON.parse(localStorage.getItem(SPEICHER) || '[]')); } catch (_) {}
const schluessel = e => e.titel + '|' + (e.bild || e.text || e.nr);
function aktualisierePunkt(e){ if (e.punkt) e.punkt.visible = !entdeckt.has(schluessel(e)); }
function zaehler(){
  const n = EXPONATE.filter(e => entdeckt.has(schluessel(e))).length;
  document.getElementById('fund').innerHTML = `Entdeckt <b>${n}</b>/${EXPONATE.length}`;
  return n;
}
function markiere(e){
  const k = schluessel(e);
  if (entdeckt.has(k)) return;
  entdeckt.add(k);
  try { localStorage.setItem(SPEICHER, JSON.stringify([...entdeckt])); } catch (_) {}
  aktualisierePunkt(e);
  const n = zaehler();
  if (n === EXPONATE.length && n > 0) melde('Alles entdeckt! Du kennst jetzt die ganze Sammlung.', 4000);
}

// ---------- Steuerung ----------
const istTouch = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;
const pos = new THREE.Vector3(0, AUGE, -2.2);
let yaw = 0, pitch = 0, laeuft = false, pausiert = true;
const tasten = {};
const stick = { x:0, y:0, id:null };
let gesperrt = false;

function startSpiel(){
  document.getElementById('start').style.display = 'none';
  document.getElementById('hud').style.display = 'flex';
  document.getElementById('fadenkreuz').style.display = istTouch ? 'none' : 'block';
  if (istTouch) document.getElementById('stick').style.display = 'block';
  laeuft = true; pausiert = false;
  if (!istTouch && canvas.requestPointerLock) canvas.requestPointerLock();
}
document.getElementById('betreten').addEventListener('click', startSpiel);
if (istTouch){ document.getElementById('hilfeMaus').style.display = 'none'; document.getElementById('hilfeTouch').style.display = 'block'; }

document.addEventListener('pointerlockchange', () => {
  gesperrt = document.pointerLockElement === canvas;
  if (!gesperrt && laeuft && !schichtOffen()){
    pausiert = true;
    const s = document.getElementById('start');
    s.style.display = 'flex';
    document.getElementById('betreten').textContent = 'Weiter';
  }
});

document.addEventListener('mousemove', e => {
  if (!gesperrt) return;
  if (Math.abs(e.movementX) > 250 || Math.abs(e.movementY) > 250) return; // Sprünge mancher Browser ignorieren
  yaw -= e.movementX * .0022;
  pitch = Math.max(-1.3, Math.min(1.3, pitch - e.movementY * .0022));
});
canvas.addEventListener('click', () => {
  if (istTouch || !laeuft) return;
  if (!gesperrt){ canvas.requestPointerLock(); return; }
  if (ziel) oeffne(ziel);
});
document.addEventListener('keydown', e => {
  tasten[e.code] = true;
  if (e.code === 'Escape' && schichtOffen()) schliesseAlles();
  if (!laeuft) return;
  if (e.code === 'KeyE' || e.code === 'Enter'){ if (schichtOffen('detail')) schliesseAlles(); else if (ziel && !schichtOffen()) oeffne(ziel); }
  if (e.code === 'KeyK' || e.code === 'Tab'){ e.preventDefault(); schichtOffen('katalog') ? schliesseAlles() : oeffneKatalog(); }
  if (schichtOffen('detail')){
    if (e.code === 'ArrowRight') blaettern(1);
    if (e.code === 'ArrowLeft') blaettern(-1);
  }
});
document.addEventListener('keyup', e => { tasten[e.code] = false; });
window.addEventListener('blur', () => { for (const k in tasten) tasten[k] = false; });

// Touch: Joystick links, Umschauen rechts, Tippen öffnet
const stickEl = document.getElementById('stick'), knauf = stickEl.querySelector('i');
const blicke = new Map();
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  for (const t of e.changedTouches) blicke.set(t.identifier, { x:t.clientX, y:t.clientY, sx:t.clientX, sy:t.clientY, zeit:performance.now() });
}, { passive:false });
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  for (const t of e.changedTouches){
    const b = blicke.get(t.identifier); if (!b) continue;
    yaw += (t.clientX - b.x) * .0045;
    pitch = Math.max(-1.3, Math.min(1.3, pitch + (t.clientY - b.y) * .0045));
    b.x = t.clientX; b.y = t.clientY;
  }
}, { passive:false });
canvas.addEventListener('touchend', e => {
  for (const t of e.changedTouches){
    const b = blicke.get(t.identifier); blicke.delete(t.identifier);
    if (b && Math.hypot(t.clientX - b.sx, t.clientY - b.sy) < 12 && performance.now() - b.zeit < 350) tippe(t.clientX, t.clientY);
  }
});
function stickSetzen(t){
  const r = stickEl.getBoundingClientRect();
  let dx = (t.clientX - (r.left + r.width / 2)) / (r.width / 2);
  let dy = (t.clientY - (r.top + r.height / 2)) / (r.height / 2);
  const l = Math.hypot(dx, dy); if (l > 1){ dx /= l; dy /= l; }
  stick.x = dx; stick.y = dy;
  knauf.style.transform = `translate(${dx * 38}px,${dy * 38}px)`;
}
stickEl.addEventListener('touchstart', e => { e.preventDefault(); const t = e.changedTouches[0]; stick.id = t.identifier; stickSetzen(t); }, { passive:false });
stickEl.addEventListener('touchmove', e => { e.preventDefault(); for (const t of e.changedTouches) if (t.identifier === stick.id) stickSetzen(t); }, { passive:false });
const stickLos = e => { for (const t of e.changedTouches) if (t.identifier === stick.id){ stick.id = null; stick.x = stick.y = 0; knauf.style.transform = ''; } };
stickEl.addEventListener('touchend', stickLos); stickEl.addEventListener('touchcancel', stickLos);

// Maus ohne Pointer-Lock (Fallback): ziehen zum Umschauen
let ziehen = null;
canvas.addEventListener('mousedown', e => { if (!istTouch && !gesperrt && laeuft) ziehen = { x:e.clientX, y:e.clientY }; });
window.addEventListener('mouseup', () => { ziehen = null; });
window.addEventListener('mousemove', e => {
  if (!ziehen) return;
  yaw += (e.clientX - ziehen.x) * .004; pitch = Math.max(-1.3, Math.min(1.3, pitch + (e.clientY - ziehen.y) * .004));
  ziehen.x = e.clientX; ziehen.y = e.clientY;
});

const ray = new THREE.Raycaster();
function tippe(x, y){
  if (!laeuft || schichtOffen()) return;
  ray.setFromCamera(new THREE.Vector2(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1), camera);
  ray.far = 9;
  const treffer = ray.intersectObjects(klickbar, false)[0];
  if (treffer) oeffne(treffer.object.userData.exponat);
}

// ---------- Bewegung & Kollision ----------
function kollidiere(p){
  for (const h of hindernisse){
    const cx = Math.max(h.x0, Math.min(p.x, h.x1));
    const cz = Math.max(h.z0, Math.min(p.z, h.z1));
    const dx = p.x - cx, dz = p.z - cz, d = Math.hypot(dx, dz);
    if (d < RADIUS){
      if (d > 1e-5){ p.x = cx + dx / d * RADIUS; p.z = cz + dz / d * RADIUS; }
      else {
        const wege = [[p.x - h.x0 + RADIUS, -1, 0], [h.x1 - p.x + RADIUS, 1, 0], [p.z - h.z0 + RADIUS, 0, -1], [h.z1 - p.z + RADIUS, 0, 1]].sort((a, b) => a[0] - b[0]);
        p.x += wege[0][1] * wege[0][0]; p.z += wege[0][2] * wege[0][0];
      }
    }
  }
}

let schritt = 0;
function bewege(dt){
  let vx = 0, vz = 0;
  if (tasten.KeyW || tasten.ArrowUp) vz -= 1;
  if (tasten.KeyS || tasten.ArrowDown) vz += 1;
  if (tasten.KeyA || tasten.ArrowLeft) vx -= 1;
  if (tasten.KeyD || tasten.ArrowRight) vx += 1;
  vx += stick.x; vz += stick.y;
  const l = Math.hypot(vx, vz);
  if (l > 1){ vx /= l; vz /= l; }
  const tempo = (tasten.ShiftLeft || tasten.ShiftRight ? 4.6 : 2.7) * Math.min(1, l > 0 ? 1 : 0);
  const s = Math.sin(yaw), c = Math.cos(yaw);
  const dx = (vx * c + vz * s) * tempo * dt, dz = (-vx * s + vz * c) * tempo * dt;
  // in kleinen Schritten, damit nichts durch Wände rutscht
  const n = Math.ceil(Math.hypot(dx, dz) / .1) || 1;
  for (let i = 0; i < n; i++){ pos.x += dx / n; pos.z += dz / n; kollidiere(pos); }
  schritt += Math.hypot(dx, dz) * 2.2;
  camera.position.set(pos.x, AUGE + Math.sin(schritt) * .025 * Math.min(1, l), pos.z);
  camera.rotation.set(pitch, yaw, 0);
}

// ---------- Ziel erkennen ----------
let ziel = null;
const vorne = new THREE.Vector3(), zuIhm = new THREE.Vector3();
const hinweis = document.getElementById('hinweis'), kreuz = document.getElementById('fadenkreuz');
function sucheZiel(){
  camera.getWorldDirection(vorne);
  let bester = null, besterWert = Infinity;
  for (const e of EXPONATE){
    if (!e.anker) continue;
    zuIhm.subVectors(e.anker, camera.position);
    const d = zuIhm.length();
    if (d > 4.5) continue;
    // nur von vorn
    if (zuIhm.x * e.platz.nx + zuIhm.z * e.platz.nz > 0 && e.art !== 'objekt') continue;
    const winkel = vorne.angleTo(zuIhm.normalize());
    if (winkel > .45) continue;
    const wert = winkel * 3 + d;
    if (wert < besterWert){ besterWert = wert; bester = e; }
  }
  if (bester !== ziel){
    ziel = bester;
    kreuz.classList.toggle('aktiv', !!ziel);
    if (ziel){
      hinweis.innerHTML = `${istTouch ? 'Tippen' : '<b>E</b>'} · ${esc(ziel.titel)} ansehen`;
      hinweis.style.display = 'block';
    } else hinweis.style.display = 'none';
  }
}
hinweis.addEventListener('click', () => { if (ziel) oeffne(ziel); });

let aktuellerRaum = -1;
function raumAnzeige(){
  const r = Math.max(0, Math.min(RAEUME - 1, Math.floor(-pos.z / RL)));
  if (r !== aktuellerRaum){
    aktuellerRaum = r;
    document.getElementById('hudRaum').textContent = r === 0 ? 'Raum 1 · Eingang' : `Raum ${r + 1}`;
  }
}

// ---------- Overlays ----------
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const ARTNAME = { bild:'Bild', zitat:'Zitat', objekt:'Objekt' };
const reihenfolge = [...EXPONATE].sort((a, b) => a.raum - b.raum || (a.art === 'objekt') - (b.art === 'objekt') || a.nr - b.nr);
let offenes = null;
function schichtOffen(id){
  const ids = id ? [id] : ['detail', 'katalog'];
  return ids.some(i => document.getElementById(i).classList.contains('offen'));
}
function oeffne(e){
  offenes = e;
  document.getElementById('katalog').classList.remove('offen');
  const d = document.getElementById('detail');
  const img = document.getElementById('dBild');
  img.src = e.vorschau || ''; img.style.display = e.vorschau ? '' : 'none';
  document.getElementById('dArt').textContent = `${ARTNAME[e.art] || 'Exponat'} · Raum ${e.raum + 1}`;
  document.getElementById('dTitel').textContent = e.titel;
  document.getElementById('dMeta').textContent = [e.von, e.datum].filter(Boolean).join(' · ');
  const z = document.getElementById('dZitat');
  z.textContent = e.art === 'zitat' && e.text ? `„${e.text}“` : ''; z.style.display = z.textContent ? '' : 'none';
  document.getElementById('dBeschr').textContent = e.beschreibung || '';
  d.classList.add('offen');
  markiere(e);
  if (document.pointerLockElement) document.exitPointerLock();
  for (const k in tasten) tasten[k] = false;
}
function blaettern(r){
  if (!offenes) return;
  const i = reihenfolge.indexOf(offenes);
  oeffne(reihenfolge[(i + r + reihenfolge.length) % reihenfolge.length]);
}
document.getElementById('dWeiter').addEventListener('click', () => blaettern(1));
document.getElementById('dZurueck').addEventListener('click', () => blaettern(-1));

function oeffneKatalog(){
  const l = document.getElementById('kListe');
  let html = '', raum = -1;
  for (const e of reihenfolge){
    if (e.raum !== raum){ raum = e.raum; html += `<div class="raum">Raum ${raum + 1}</div>`; }
    const ok = entdeckt.has(schluessel(e));
    html += `<button class="eintrag" data-nr="${e.nr}"><span class="haken">${ok ? '✓' : '•'}</span><span>${esc(e.titel)}</span><span class="klein">${ARTNAME[e.art] || ''}</span></button>`;
  }
  l.innerHTML = html || '<div class="unter">Noch keine Exponate.</div>';
  document.getElementById('detail').classList.remove('offen');
  document.getElementById('katalog').classList.add('offen');
  if (document.pointerLockElement) document.exitPointerLock();
}
document.getElementById('katalogKnopf').addEventListener('click', oeffneKatalog);
document.getElementById('kListe').addEventListener('click', ev => {
  const b = ev.target.closest('[data-nr]'); if (!b) return;
  gehZu(EXPONATE[+b.dataset.nr]);
  schliesseAlles();
});
function gehZu(e){
  const p = e.platz, abstand = e.art === 'objekt' ? 1.9 : 2.8;
  pos.set(p.x + p.nx * abstand, AUGE, p.z + p.nz * abstand);
  kollidiere(pos);
  yaw = Math.atan2(p.nx, p.nz); pitch = e.art === 'objekt' ? -.12 : 0;
}
function schliesseAlles(){
  document.querySelectorAll('.schicht').forEach(s => s.classList.remove('offen'));
  offenes = null;
  if (laeuft && !istTouch && !gesperrt){ pausiert = false; document.getElementById('start').style.display = 'none'; canvas.requestPointerLock(); }
}
document.querySelectorAll('[data-zu]').forEach(b => b.addEventListener('click', schliesseAlles));
document.querySelectorAll('.schicht').forEach(s => s.addEventListener('click', ev => { if (ev.target === s) schliesseAlles(); }));

let meldTimer;
function melde(text, ms = 2500){
  const m = document.getElementById('meldung');
  m.textContent = text; m.style.opacity = 1;
  clearTimeout(meldTimer); meldTimer = setTimeout(() => { m.style.opacity = 0; }, ms);
}

// ---------- Start ----------
document.title = `${S.titel} · ${S.untertitel}`;
document.getElementById('startTitel').textContent = S.titel;
document.getElementById('startUnter').textContent = S.untertitel || '';
document.getElementById('hudTitel').textContent = S.titel;

const schrift = document.fonts ? Promise.all([document.fonts.load('800 40px "Barlow SC"'), document.fonts.load('600 40px "Barlow SC"')]).catch(() => {}) : Promise.resolve();
schrift.then(() => {
  titel.material.map = titelTex(); ende.material.map = titelTex();
  wand.forEach(bauWandExponat);
  vitr.forEach(bauVitrine);
  zaehler();
});

const uhr = new THREE.Clock();
let warteBild = 0;
function schleife(){
  requestAnimationFrame(schleife);
  const dt = Math.min(uhr.getDelta(), .05);
  for (const t of drehend) t.rotation.y += dt * .5;
  if (laeuft && !pausiert && !schichtOffen()){ bewege(dt); sucheZiel(); raumAnzeige(); }
  else if (!laeuft){
    // Vorschau auf dem Startbildschirm: langsamer Schwenk
    warteBild += dt * .12;
    camera.position.set(Math.sin(warteBild) * 2, AUGE + .2, -3 - (1 - Math.cos(warteBild)) * 2);
    camera.rotation.set(-.04, Math.sin(warteBild * .7) * .5, 0);
  }
  renderer.render(scene, camera);
}
schleife();
})();
