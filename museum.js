/* Sammlung MBG – 3D-Museum (three.js r128) */
(() => {
'use strict';

const S = window.SAMMLUNG || {};
const TITEL = S.titel || 'Sammlung', UNTER = S.untertitel || '';

// ---------- Maße ----------
const WD = 0.3;          // Wanddicke
const AUGE = 1.65;
const RADIUS = 0.35;
const BILD_Y = 1.75;
const KETTE = { W:14, L:16, H:4.6 };
const FLUR = { CW:2.6, D:9, R:9, E:5, H:4.2 };
const LOBBY = { W:20, L:22, H:6 };
const SAAL = { W:16, H:5, ABSTAND:5.5 };
const KAPAZITAET = { kette:[8, 2], flur:[6, 1], lobby:[7, 2], portale:[0, 0] };
const WANDFARBE = { lobby:'#ebe5da', kette:'#eae4da', flur:'#e4e6e3', portale:'#1f2433' };

// ---------- Daten aufbereiten ----------
const ETAGEN = (S.etagen && S.etagen.length ? S.etagen : [{ name:'Lobby', layout:'lobby', exponate:S.exponate || [] }]).map((roh, i) => {
  const layout = KAPAZITAET[roh.layout] ? roh.layout : (roh.portale ? 'portale' : i === 0 ? 'lobby' : 'kette');
  const et = Object.assign({}, roh, {
    nr:i, layout, id: roh.id || 'etage' + i, name: roh.name || `Etage ${i}`,
    kurz: roh.kurz || (layout === 'lobby' && i === 0 ? 'E' : String(i)),
    portale: (roh.portale || []).map(p => Object.assign({ titel:'Portal' }, p)),
    wand: roh.wand || WANDFARBE[layout]
  });
  et.raeumeRoh = (roh.exponate ? [{ name:et.name, exponate:roh.exponate }] : []).concat(roh.raeume || []);
  return et;
});
const etageNach = id => ETAGEN.find(e => e.id === id);

function verteile(et){
  const [kW, kV] = KAPAZITAET[et.layout];
  const liste = [];
  for (const r of et.raeumeRoh){
    const ex = (r.exponate || []).map(e => Object.assign({ art:'bild', titel:'Ohne Titel' }, e));
    const w = ex.filter(e => e.art !== 'objekt'), v = ex.filter(e => e.art === 'objekt');
    const n = Math.max(1, kW ? Math.ceil(w.length / kW) : 0, kV ? Math.ceil(v.length / kV) : 0);
    const name = r.name || `Raum ${liste.length + 1}`;
    for (let k = 0; k < n; k++){
      liste.push({ name: n > 1 ? `${name} · Teil ${k + 1}` : name, basis:name,
        wand:w.slice(k * kW, (k + 1) * kW), vitr:v.slice(k * kV, (k + 1) * kV), leer:!ex.length });
    }
  }
  if (et.layout === 'lobby' && liste.length > 1){
    const alle = { name:et.name, basis:et.name, wand:[], vitr:[], leer:false };
    liste.forEach(r => { alle.wand.push(...r.wand); alle.vitr.push(...r.vitr); });
    if (alle.wand.length > kW || alle.vitr.length > kV) console.warn('Lobby ist voll, einige Exponate fehlen.');
    alle.wand.length = Math.min(alle.wand.length, kW); alle.vitr.length = Math.min(alle.vitr.length, kV);
    liste.length = 0; liste.push(alle);
  }
  if (!liste.length && et.layout !== 'portale') liste.push({ name:et.name, basis:et.name, wand:[], vitr:[], leer:true });
  et.raumListe = liste;
}

// Wo was hängt – wird vorab berechnet, damit der Katalog direkt hinspringen kann
const PLAN = {
  kette(et){
    const { W, L } = KETTE, innen = W / 2 - WD / 2;
    et.bildMax = { b:3.0, h:2.2 };
    et.raumListe.forEach((r, ri) => {
      const zc = r.zc = -(ri + 0.5) * L;
      const pl = [
        { x:-innen, z:zc + 3.6, nx: 1, nz:0 }, { x:innen, z:zc + 3.6, nx:-1, nz:0 },
        { x:-innen, z:zc - 3.6, nx: 1, nz:0 }, { x:innen, z:zc - 3.6, nx:-1, nz:0 },
        { x:-4, z:-(ri + 1) * L + WD / 2, nx:0, nz:1 }, { x:4, z:-(ri + 1) * L + WD / 2, nx:0, nz:1 },
        { x:-4, z:-ri * L - WD / 2, nx:0, nz:-1 }, { x:4, z:-ri * L - WD / 2, nx:0, nz:-1 }
      ];
      r.wand.forEach((e, i) => { e.platz = pl[i]; });
      r.vitr.forEach((e, i) => { e.platz = { x:i % 2 ? 3.6 : -3.6, z:zc, nx:i % 2 ? -1 : 1, nz:0 }; });
      r.start = { x:0, z:-ri * L - 1.6, yaw:0 };
    });
    et.raumAn = p => et.raumListe[Math.max(0, Math.min(et.raumListe.length - 1, Math.floor(-p.z / L)))].name;
  },
  flur(et){
    const { CW, D, R, E } = FLUR;
    et.bildMax = { b:2.2, h:1.9 };
    et.raumListe.forEach((r, i) => {
      const s = r.s = i % 2 ? 1 : -1, j = Math.floor(i / 2);
      r.z1 = -(E + j * R); r.z2 = r.z1 - R; const zc = r.zc = r.z1 - R / 2;
      const xo = s * (CW + D) - s * WD / 2;
      const pl = [
        { x:xo, z:zc + 2.2, nx:-s, nz:0 }, { x:xo, z:zc - 2.2, nx:-s, nz:0 },
        { x:s * (CW + 2.3), z:r.z1 - WD / 2, nx:0, nz:-1 }, { x:s * (CW + 6.7), z:r.z1 - WD / 2, nx:0, nz:-1 },
        { x:s * (CW + 2.3), z:r.z2 + WD / 2, nx:0, nz:1 }, { x:s * (CW + 6.7), z:r.z2 + WD / 2, nx:0, nz:1 }
      ];
      r.wand.forEach((e, k) => { e.platz = pl[k]; });
      r.vitr.forEach(e => { e.platz = { x:s * (CW + D / 2), z:zc, nx:-s, nz:0 }; });
      r.start = { x:s * (CW + 1.2), z:zc, yaw:-s * Math.PI / 2 };
    });
    et.raumAn = p => {
      if (Math.abs(p.x) < CW) return 'Flur';
      const s = p.x > 0 ? 1 : -1;
      const r = et.raumListe.find(r => r.s === s && p.z <= r.z1 && p.z >= r.z2);
      return r ? r.name : 'Flur';
    };
  },
  lobby(et){
    const { W, L } = LOBBY, innen = W / 2 - WD / 2;
    et.bildMax = { b:3.0, h:2.2 };
    const pl = [
      { x:-innen, z:-11, nx:1, nz:0 }, { x:innen, z:-4, nx:-1, nz:0 }, { x:innen, z:-11, nx:-1, nz:0 },
      { x:-7.2, z:-L + WD / 2, nx:0, nz:1 }, { x:7.2, z:-L + WD / 2, nx:0, nz:1 },
      { x:-innen, z:-17.5, nx:1, nz:0 }, { x:innen, z:-17.5, nx:-1, nz:0 }
    ];
    const r = et.raumListe[0];
    r.wand.forEach((e, i) => { e.platz = pl[i]; });
    r.vitr.forEach((e, i) => { e.platz = { x:i % 2 ? 5 : -5, z:-12, nx:i % 2 ? -1 : 1, nz:0 }; });
    r.start = { x:0, z:-2.5, yaw:0 };
    et.raumAn = () => et.name;
  },
  portale(et){
    const { W, ABSTAND } = SAAL, innen = W / 2 - WD / 2;
    et.laenge = Math.max(16, 6 + Math.ceil(et.portale.length / 2) * ABSTAND + 2);
    et.portale.forEach((p, i) => {
      const s = i % 2 ? 1 : -1;
      p.platz = { x:s * innen, z:-(6 + Math.floor(i / 2) * ABSTAND), nx:-s, nz:0 };
    });
    et.raumAn = () => et.name;
  }
};

const ALLE = [];
for (const et of ETAGEN){
  verteile(et);
  PLAN[et.layout](et);
  et.liste = [];
  et.raumListe.forEach(r => [...r.wand, ...r.vitr].forEach(e => {
    e.etage = et; e.raum = r; e.nr = ALLE.length;
    e.schluessel = [et.id, e.titel, e.bild || e.text || ''].join('|');
    ALLE.push(e); et.liste.push(e);
  }));
}

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
const SCHRIFT = '"Barlow SC", sans-serif';
function canvasTex(c, wiederholen){
  const t = new THREE.CanvasTexture(c);
  t.encoding = THREE.sRGBEncoding;
  t.anisotropy = MAX_ANISO;
  if (wiederholen) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}
function leinwand(b, h){ const c = document.createElement('canvas'); c.width = b; c.height = h; return [c, c.getContext('2d')]; }

const PARKETT = (() => {
  const [c, g] = leinwand(512, 512);
  const bw = 64, bh = 256;
  for (let x = 0; x < 512; x += bw){
    const versatz = (x / bw) % 2 ? bh / 2 : 0;
    for (let y = -bh; y < 512; y += bh){
      g.fillStyle = `hsl(${26 + Math.random() * 6},${38 + Math.random() * 10}%,${32 + Math.random() * 10}%)`;
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
  return c;
})();

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
  const [c, g] = leinwand(1024, 768);
  const [a, b] = FARBEN[e.nr % FARBEN.length];
  const grad = g.createLinearGradient(0, 0, 1024, 768);
  grad.addColorStop(0, a); grad.addColorStop(1, '#14110f');
  g.fillStyle = grad; g.fillRect(0, 0, 1024, 768);
  g.strokeStyle = b; g.globalAlpha = .25; g.lineWidth = 3;
  for (let i = 0; i < 9; i++){ g.beginPath(); g.arc(780, 160, 60 + i * 55, 0, Math.PI * 2); g.stroke(); }
  g.globalAlpha = 1;
  g.fillStyle = b; g.font = `800 200px ${SCHRIFT}`;
  g.fillText(String(e.nr + 1).padStart(2, '0'), 70, 260);
  g.fillStyle = '#f4efe6'; g.font = `800 72px ${SCHRIFT}`;
  umbrechen(g, e.titel, 880).slice(0, 3).forEach((z, i) => g.fillText(z, 70, 420 + i * 80));
  g.globalAlpha = .6; g.font = `600 36px ${SCHRIFT}`;
  g.fillText('Bild folgt', 70, 700);
  return c;
}

function zitatBild(e){
  const [c, g] = leinwand(1024, 768);
  g.fillStyle = '#f4efe6'; g.fillRect(0, 0, 1024, 768);
  g.fillStyle = '#d8b46a'; g.font = '800 260px Georgia, serif'; g.fillText('„', 50, 260);
  g.fillStyle = '#1c1714';
  let gr = 70, zeilen;
  do { g.font = `italic ${gr}px Georgia, serif`; zeilen = umbrechen(g, e.text || e.titel, 860); gr -= 4; }
  while (zeilen.length * gr * 1.3 > 470 && gr > 30);
  const lh = (gr + 4) * 1.3;
  const y0 = 384 - (zeilen.length * lh) / 2 + lh * .7;
  zeilen.forEach((z, i) => g.fillText(z, 82, y0 + i * lh));
  if (e.von){ g.font = `600 40px ${SCHRIFT}`; g.fillStyle = '#7a6a58'; g.fillText('— ' + e.von, 82, 700); }
  return c;
}

function schildTex(e){
  const [c, g] = leinwand(512, 200);
  g.fillStyle = '#f7f3ec'; g.fillRect(0, 0, 512, 200);
  g.fillStyle = '#1c1714'; g.font = `800 44px ${SCHRIFT}`;
  const z = umbrechen(g, e.titel, 460).slice(0, 2);
  z.forEach((t, i) => g.fillText(t, 26, 64 + i * 46));
  g.fillStyle = '#7a6a58'; g.font = `600 30px ${SCHRIFT}`;
  const meta = [e.von, e.datum].filter(Boolean).join(' · ');
  if (meta) g.fillText(meta, 26, z.length > 1 ? 172 : 124, 460);
  g.fillStyle = '#d8b46a'; g.fillRect(0, 0, 8, 200);
  return canvasTex(c);
}

function titelTex(oben, unten, hell){
  const [c, g] = leinwand(2048, 900);
  g.textAlign = 'center';
  g.fillStyle = hell ? '#1c1714' : '#f4efe6'; g.font = `800 300px ${SCHRIFT}`;
  g.fillText(String(oben).toUpperCase(), 1024, 380, 1900);
  g.fillStyle = hell ? '#b08a42' : '#d8b46a'; g.fillRect(724, 470, 600, 8);
  g.font = `600 ${unten && unten.length > 14 ? 110 : 150}px ${SCHRIFT}`;
  g.fillText(String(unten || '').toUpperCase().split('').join(' '), 1024, 690, 1900);
  return canvasTex(c);
}

// einzeilige oder mehrzeilige Beschriftung, passt sich der Breite an
function textTafel(text, b, h, farbe = '#1c1714'){
  const [c, g] = leinwand(512, Math.max(32, Math.round(512 * h / b)));
  g.textAlign = 'center'; g.fillStyle = farbe;
  const zeilen = String(text).split('\n');
  let gr = c.height * .72 / zeilen.length;
  g.font = `800 ${gr}px ${SCHRIFT}`;
  const breiteste = Math.max(...zeilen.map(z => g.measureText(z).width));
  if (breiteste > 480){ gr *= 480 / breiteste; g.font = `800 ${gr}px ${SCHRIFT}`; }
  zeilen.forEach((z, i) => g.fillText(z, 256, c.height / 2 + (i - (zeilen.length - 1) / 2) * gr * 1.15 + gr * .35));
  return new THREE.Mesh(new THREE.PlaneGeometry(b, h), new THREE.MeshBasicMaterial({ map:canvasTex(c), transparent:true, toneMapped:false }));
}

// ---------- Geteilte Materialien ----------
const matSockel = new THREE.MeshStandardMaterial({ color:0x2a221c, roughness:.6 });
const matRahmen = new THREE.MeshStandardMaterial({ color:0x2a1d14, roughness:.45, metalness:.2 });
const matGold = new THREE.MeshStandardMaterial({ color:0xc9a35a, roughness:.3, metalness:.85 });
const matStahl = new THREE.MeshStandardMaterial({ color:0xb9bec4, roughness:.28, metalness:.85 });
const matLicht = new THREE.MeshBasicMaterial({ color:0xfff6e3, toneMapped:false });
const matGlas = new THREE.MeshPhysicalMaterial({ color:0xddeeff, roughness:.05, metalness:0, transparent:true, opacity:.16, depthWrite:false });
const matPassep = new THREE.MeshStandardMaterial({ color:0xf8f5ef, roughness:.9 });
const matPunkt = new THREE.MeshBasicMaterial({ color:0xd8b46a, toneMapped:false });
const lichtkegelMat = (() => {
  const [c, g] = leinwand(256, 256);
  const gr = g.createRadialGradient(128, 40, 10, 128, 120, 150);
  gr.addColorStop(0, 'rgba(255,236,200,.55)'); gr.addColorStop(1, 'rgba(255,236,200,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  return new THREE.MeshBasicMaterial({ map:canvasTex(c), transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, toneMapped:false, opacity:.5 });
})();
const GETEILT = new Set([matSockel, matRahmen, matGold, matStahl, matLicht, matGlas, matPassep, matPunkt, lichtkegelMat]);

// ---------- Welt einer Etage ----------
let welt = null, gen = 0, aktEtage = null, hell = true, textFarbe = '#1c1714';
let hindernisse = [], interaktiv = [], klickbar = [], drehend = [], portalUniforms = [];
let matWand = null;

function entsorge(obj){
  obj.traverse(o => {
    if (o.geometry) o.geometry.dispose();
    const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
    for (const m of ms){ if (GETEILT.has(m)) continue; if (m.map) m.map.dispose(); m.dispose(); }
  });
}

function box(x0, x1, z0, z1, y0, y1, mat, kollision = true){
  const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), mat);
  m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  welt.add(m);
  if (kollision) hindernisse.push({ x0, x1, z0, z1 });
  return m;
}

// Wand entlang x (bei z = fest) oder entlang z (bei x = fest), mit Türöffnungen
function wand(achse, fest, von, bis, h, tueren = [], tuerH = 3.3){
  const teil = (a, b, y0, y1, mat, kol, tiefe = WD) => {
    if (b - a < .01) return;
    if (achse === 'x') box(a, b, fest - tiefe / 2, fest + tiefe / 2, y0, y1, mat, kol);
    else box(fest - tiefe / 2, fest + tiefe / 2, a, b, y0, y1, mat, kol);
  };
  let c = von;
  for (const t of [...tueren].sort((a, b) => a.c - b.c)){
    const l = t.c - t.b / 2, r = t.c + t.b / 2;
    teil(c, l, 0, h, matWand, true);
    teil(l, r, tuerH, h, matWand, false);
    teil(l - .08, l, 0, tuerH + .08, matRahmen, false, WD + .08);
    teil(r, r + .08, 0, tuerH + .08, matRahmen, false, WD + .08);
    teil(l - .08, r + .08, tuerH, tuerH + .08, matRahmen, false, WD + .08);
    c = r;
  }
  teil(c, bis, 0, h, matWand, true);
}

function bodenDecke(x0, x1, z0, z1, h, toenung = 0xffffff){
  const t = canvasTex(PARKETT, true);
  t.repeat.set((x1 - x0) / 4, (z0 - z1) / 4);
  const boden = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z0 - z1), new THREE.MeshStandardMaterial({ map:t, color:toenung, roughness:.55, metalness:.05 }));
  boden.rotation.x = -Math.PI / 2; boden.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2);
  welt.add(boden);
  const deckenFarbe = new THREE.Color(aktEtage.wand).lerp(new THREE.Color(0xf3efe8), .5);
  const decke = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z0 - z1),
    new THREE.MeshStandardMaterial({ color:deckenFarbe, emissive:deckenFarbe.clone().multiplyScalar(.55), roughness:1 }));
  decke.rotation.x = Math.PI / 2; decke.position.set((x0 + x1) / 2, h, (z0 + z1) / 2);
  welt.add(decke);
}

function sockelleiste(achse, fest, von, bis, seite){
  const d = .02, f = fest + seite * (WD / 2 + d / 2);
  if (achse === 'z') box(f - d / 2, f + d / 2, von, bis, 0, .12, matSockel, false);
  else box(von, bis, f - d / 2, f + d / 2, 0, .12, matSockel, false);
}

function deckenlicht(x, z, h, gr = 1.6){
  const p = new THREE.Mesh(new THREE.PlaneGeometry(gr, gr), matLicht);
  p.rotation.x = Math.PI / 2; p.position.set(x, h - .01, z);
  welt.add(p);
}

function lampe(x, z, h, staerke = .9, weite = 22){
  const l = new THREE.PointLight(0xffeeda, staerke, weite, 1.6);
  l.position.set(x, h - .6, z);
  welt.add(l);
}

// Schild flach an einer Wand: normal = Blickrichtung des Schilds
function schild(mesh, x, y, z, nx, nz){
  mesh.position.set(x + nx * .01, y, z + nz * .01);
  mesh.rotation.y = Math.atan2(nx, nz);
  welt.add(mesh);
  return mesh;
}

function interaktion(o){ interaktiv.push(o); (o.meshes || []).forEach(m => { m.userData.io = o; klickbar.push(m); }); return o; }

// ---------- Etagen bauen ----------
const BAU = {
  kette(et){
    const { W, L, H } = KETTE, R = et.raumListe, n = R.length, lang = n * L;
    bodenDecke(-W / 2, W / 2, 0, -lang, H);
    wand('z', -W / 2, -lang, 0, H); wand('z', W / 2, -lang, 0, H);
    sockelleiste('z', -W / 2, -lang, 0, 1); sockelleiste('z', W / 2, -lang, 0, -1);
    for (let i = 0; i <= n; i++){
      const z = -i * L;
      if (i === 0 || i === n){ wand('x', z, -W / 2, W / 2, H); continue; }
      wand('x', z, -W / 2, W / 2, H, [{ c:0, b:3.2 }]);
      schild(textTafel(R[i].name, 3, .45, textFarbe), 0, 3.85, z + WD / 2, 0, 1);
      schild(textTafel(R[i - 1].name, 3, .45, textFarbe), 0, 3.85, z - WD / 2, 0, -1);
    }
    R.forEach((r, ri) => {
      for (const dz of [-4, 4]) for (const dx of [-3.2, 3.2]) deckenlicht(dx, r.zc + dz, H);
      if (ri < 10) lampe(0, r.zc, H);
      if (r.leer) schild(textTafel('Dieser Raum wird\nnoch gefüllt', 2.6, .9, textFarbe), -W / 2 + WD / 2, 1.8, r.zc, 1, 0);
    });
    const t = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 1.93), new THREE.MeshBasicMaterial({ map:titelTex(et.name, et.untertitel, hell), transparent:true }));
    schild(t, 0, 2.6, -lang + WD / 2, 0, 1);
  },

  flur(et){
    const { CW, D, R, E, H } = FLUR, L = et.raumListe;
    const proSeite = { '-1':L.filter(r => r.s < 0).length, '1':L.filter(r => r.s > 0).length };
    const lang = E + Math.max(proSeite[-1], proSeite[1], 1) * R + 3;
    bodenDecke(-(CW + D), CW + D, 0, -lang, H);
    wand('x', 0, -CW, CW, H);
    wand('x', -lang, -CW, CW, H);
    for (const s of [-1, 1]){
      const n = proSeite[s];
      wand('z', s * CW, -lang, 0, H, L.filter(r => r.s === s).map(r => ({ c:r.zc, b:2.4 })), 3.0);
      sockelleiste('z', s * CW, -lang, 0, -s);
      if (!n) continue;
      wand('z', s * (CW + D), -(E + n * R), -E, H);
      for (let j = 0; j <= n; j++){
        const a = s > 0 ? CW : -(CW + D), b = s > 0 ? CW + D : -CW;
        wand('x', -(E + j * R), a, b, H);
      }
    }
    for (let z = -3; z > -lang + 1; z -= 4.5) deckenlicht(0, z, H, 1.2);
    L.forEach(r => {
      const s = r.s;
      schild(textTafel(r.name, 2.2, .42, textFarbe), s * (CW - WD / 2), 3.6, r.zc, -s, 0);
      schild(textTafel(r.name, 2.2, .42, textFarbe), s * (CW + WD / 2), 3.6, r.zc, s, 0);
      deckenlicht(s * (CW + D / 2), r.zc - 2, H, 1.4);
      deckenlicht(s * (CW + D / 2), r.zc + 2, H, 1.4);
      schild(textTafel(r.name, 3.4, .6, textFarbe), s * (CW + D - WD / 2), 3.55, r.zc, -s, 0);
      if (r.leer) schild(textTafel('Dieser Raum wird\nnoch gefüllt', 1.8, .6, textFarbe), s * (CW + D - WD / 2), 1.8, r.zc, -s, 0);
    });
    lampe(0, -lang / 2, H, .6, 40);
    const t = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 1.93), new THREE.MeshBasicMaterial({ map:titelTex(et.name, et.untertitel, hell), transparent:true }));
    schild(t, 0, 2.5, -lang + WD / 2, 0, 1);
  },

  lobby(et){
    const { W, L, H } = LOBBY;
    bodenDecke(-W / 2, W / 2, 0, -L, H);
    wand('z', -W / 2, -L, 0, H); wand('z', W / 2, -L, 0, H);
    wand('x', 0, -W / 2, W / 2, H); wand('x', -L, -W / 2, W / 2, H);
    sockelleiste('z', -W / 2, -L, 0, 1); sockelleiste('z', W / 2, -L, 0, -1);
    sockelleiste('x', -L, -W / 2, W / 2, 1);
    for (const dz of [-5, -11, -17]) for (const dx of [-5, 0, 5]) deckenlicht(dx, dz, H, 2);
    lampe(0, -6, H, 1, 30); lampe(0, -16, H, 1, 30);
    // Titel an der Rückwand
    const t = new THREE.Mesh(new THREE.PlaneGeometry(9, 3.96), new THREE.MeshBasicMaterial({ map:titelTex(TITEL, UNTER, true), transparent:true }));
    schild(t, 0, 3.4, -L + WD / 2, 0, 1);
    // Bodenmedaillon
    const [c, g] = leinwand(512, 512);
    g.fillStyle = '#2a221c'; g.beginPath(); g.arc(256, 256, 250, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#c9a35a'; g.lineWidth = 10; g.beginPath(); g.arc(256, 256, 230, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#d8b46a'; g.textAlign = 'center'; g.font = `800 150px ${SCHRIFT}`; g.fillText('MBG', 256, 290);
    g.font = `600 52px ${SCHRIFT}`; g.fillText(String(UNTER).toUpperCase(), 256, 370);
    const med = new THREE.Mesh(new THREE.CircleGeometry(2.4, 48), new THREE.MeshStandardMaterial({ map:canvasTex(c), transparent:true, roughness:.4, metalness:.2 }));
    med.rotation.x = -Math.PI / 2; med.position.set(0, .01, -11);
    welt.add(med);
    // Wegweiser
    const innen = W / 2 - WD / 2;
    const ww = schild(new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.8), new THREE.MeshBasicMaterial({ map:wegweiserTex(), toneMapped:false })), -innen, 1.9, -4, 1, 0);
    const wr = box(-innen + .01, -innen + .06, -5.5, -2.5, .45, 3.35, matRahmen, false);
    ww.position.x += .06;
    interaktion({ anker:new THREE.Vector3(-innen, 1.8, -4), nx:1, nz:0, nurVorn:true, hinweis:'Etagenplan ansehen', aktion:oeffneAufzug, meshes:[ww, wr] });
    // Bänke
    for (const x of [-5, 5]){
      box(x - .25, x + .25, -7.2, -4.8, .38, .46, matRahmen);
      for (const dz of [-1, 1]) box(x - .2, x + .2, -6 + dz - .06, -6 + dz + .06, 0, .38, matSockel, false);
    }
  },

  portale(et){
    const { W, H } = SAAL, lang = et.laenge;
    bodenDecke(-W / 2, W / 2, 0, -lang, H, 0x8090b0);
    wand('z', -W / 2, -lang, 0, H); wand('z', W / 2, -lang, 0, H);
    wand('x', 0, -W / 2, W / 2, H); wand('x', -lang, -W / 2, W / 2, H);
    for (let z = -4; z > -lang + 1; z -= 5) deckenlicht(0, z, H, 1.2);
    lampe(0, -lang / 2, H, .5, 40);
    const t = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 1.93), new THREE.MeshBasicMaterial({ map:titelTex(et.name, et.untertitel, hell), transparent:true }));
    schild(t, 0, 2.6, -lang + WD / 2, 0, 1);
    et.portale.forEach(baue => bauPortal(baue));
  }
};

function wegweiserTex(){
  const [c, g] = leinwand(1024, 1024);
  g.fillStyle = '#231c17'; g.fillRect(0, 0, 1024, 1024);
  g.fillStyle = '#d8b46a'; g.font = `800 80px ${SCHRIFT}`; g.fillText('WEGWEISER', 70, 130);
  g.fillRect(70, 160, 200, 6);
  const lh = Math.min(92, 780 / ETAGEN.length);
  [...ETAGEN].reverse().forEach((et, i) => {
    const y = 250 + i * lh;
    g.fillStyle = '#d8b46a'; g.font = `800 ${lh * .55}px ${SCHRIFT}`; g.fillText(et.kurz, 80, y);
    g.fillStyle = '#f4efe6'; g.fillText(et.name, 190, y, 760);
    if (et.untertitel){ g.fillStyle = 'rgba(244,239,230,.55)'; g.font = `600 ${lh * .3}px ${SCHRIFT}`; g.fillText(et.untertitel, 190, y + lh * .33, 760); }
  });
  return canvasTex(c);
}

function bauAufzug(et){
  const g = new THREE.Group();
  g.position.set(0, 0, -WD / 2 - .005); g.rotation.y = Math.PI;
  welt.add(g);
  const teil = (b, h, t, x, y, z, mat) => { const m = new THREE.Mesh(new THREE.BoxGeometry(b, h, t), mat); m.position.set(x, y, z); g.add(m); return m; };
  teil(2.5, 3.05, .08, 0, 1.525, .04, matRahmen);
  const tl = teil(.99, 2.72, .05, -.5, 1.38, .1, matStahl);
  const tr = teil(.99, 2.72, .05, .5, 1.38, .1, matStahl);
  // Etagenanzeige
  const [c, gg] = leinwand(512, 128);
  gg.fillStyle = '#0d0b0a'; gg.fillRect(0, 0, 512, 128);
  gg.fillStyle = '#ffb648'; gg.textAlign = 'center'; gg.font = `800 76px ${SCHRIFT}`;
  gg.fillText(`${et.kurz} · ${et.name}`.toUpperCase(), 256, 92, 480);
  const anz = new THREE.Mesh(new THREE.PlaneGeometry(1.4, .35), new THREE.MeshBasicMaterial({ map:canvasTex(c), toneMapped:false }));
  anz.position.set(0, 3.35, .03); g.add(anz);
  // Rufknopf
  const tafel = teil(.2, .36, .04, -1.55, 1.25, .02, matStahl);
  const knopf = new THREE.Mesh(new THREE.CircleGeometry(.05, 20), new THREE.MeshBasicMaterial({ color:0xffb648, toneMapped:false }));
  knopf.position.set(-1.55, 1.3, .045); g.add(knopf);
  interaktion({ anker:new THREE.Vector3(0, 1.5, -WD / 2), nx:0, nz:-1, nurVorn:true, hinweis:'Aufzug benutzen', aktion:oeffneAufzug, meshes:[tl, tr, tafel] });
}

const PORTALFARBEN = ['#7b5cff', '#2fd2c9', '#ff6fa8', '#ffb648', '#5cb0ff', '#8be36b'];
const portalVert = 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const portalFrag = `
  uniform float t; uniform vec3 c1; uniform vec3 c2; uniform float offen; varying vec2 vP;
  void main(){
    vec2 p = vP - vec2(0.0, 1.7);
    float r = length(p), a = atan(p.y, p.x);
    float wirbel = sin(a * 3.0 + r * 6.0 - t * 2.2) * 0.5 + 0.5;
    float glanz = smoothstep(2.2, 0.0, r);
    vec3 col = mix(c1, c2, wirbel) * (0.55 + glanz * 0.9) + vec3(1.0) * pow(glanz, 4.0) * 0.6;
    col = mix(vec3(0.08, 0.09, 0.12) + c1 * 0.08 * wirbel, col, offen);
    gl_FragColor = vec4(col, 1.0);
  }`;
function bauPortal(p){
  const pl = p.platz;
  const g = new THREE.Group();
  g.position.set(pl.x + pl.nx * .01, 0, pl.z + pl.nz * .01);
  g.rotation.y = Math.atan2(pl.nx, pl.nz);
  welt.add(g);
  const nr = aktEtage.portale.indexOf(p);
  const farbe = new THREE.Color(p.farbe || PORTALFARBEN[nr % PORTALFARBEN.length]);
  const offen = p.link || p.etage ? 1 : 0;
  const u = { t:{ value:Math.random() * 10 }, c1:{ value:farbe }, c2:{ value:farbe.clone().lerp(new THREE.Color(0xffffff), .55) }, offen:{ value:offen } };
  portalUniforms.push(u);
  const mat = new THREE.ShaderMaterial({ uniforms:u, vertexShader:portalVert, fragmentShader:portalFrag });
  const rechteck = new THREE.PlaneGeometry(2.3, 3.0); rechteck.translate(0, 1.5, 0);
  const bogen = new THREE.CircleGeometry(1.15, 32, 0, Math.PI); bogen.translate(0, 3.0, 0);
  const m1 = new THREE.Mesh(rechteck, mat), m2 = new THREE.Mesh(bogen, mat);
  m1.position.z = m2.position.z = .03;
  g.add(m1, m2);
  for (const x of [-1.27, 1.27]){ const s = new THREE.Mesh(new THREE.BoxGeometry(.24, 3.0, .3), matGold); s.position.set(x, 1.5, .15); g.add(s); }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.27, .12, 12, 40, Math.PI), matGold);
  ring.position.set(0, 3.0, .15); g.add(ring);
  const name = textTafel(p.titel, 2.8, .5, '#f4efe6');
  name.position.set(0, 4.55, .02); g.add(name);
  if (!offen){ const zu = textTafel('geschlossen', 1.6, .3, 'rgba(244,239,230,.6)'); zu.position.set(0, 1.7, .05); g.add(zu); }
  // Licht auf dem Boden davor
  const schein = new THREE.Mesh(new THREE.CircleGeometry(1.6, 32), new THREE.MeshBasicMaterial({ color:farbe, transparent:true, opacity:offen ? .22 : .05, blending:THREE.AdditiveBlending, depthWrite:false, toneMapped:false }));
  schein.rotation.x = -Math.PI / 2; schein.position.set(0, .02, .9); g.add(schein);
  hindernisse.push({ x0:Math.min(pl.x, pl.x + pl.nx * .35) - (pl.nz ? 1.4 : 0), x1:Math.max(pl.x, pl.x + pl.nx * .35) + (pl.nz ? 1.4 : 0),
    z0:Math.min(pl.z, pl.z + pl.nz * .35) - (pl.nx ? 1.4 : 0), z1:Math.max(pl.z, pl.z + pl.nz * .35) + (pl.nx ? 1.4 : 0) });
  interaktion({ anker:new THREE.Vector3(pl.x, 1.7, pl.z), nx:pl.nx, nz:pl.nz, nurVorn:true, reichweite:5,
    hinweis: offen ? `Portal „${p.titel}“ betreten` : `Portal „${p.titel}“ (geschlossen)`, aktion:() => portalAktion(p), meshes:[m1, m2] });
}

// ---------- Exponate ----------
const loader = new THREE.TextureLoader();
function ladeBild(e, fertig){
  const meineGen = gen;
  const ok = (t, r) => { if (meineGen !== gen){ t.dispose(); return; } fertig(t, r); };
  if (e.art === 'zitat'){ const c = zitatBild(e); e.vorschau = c.toDataURL('image/jpeg', .85); return ok(canvasTex(c), 4 / 3); }
  const ersatz = () => { const c = platzhalterBild(e); e.vorschau = c.toDataURL('image/jpeg', .85); ok(canvasTex(c), 4 / 3); };
  if (!e.bild) return ersatz();
  loader.load(e.bild, t => {
    t.encoding = THREE.sRGBEncoding; t.anisotropy = MAX_ANISO;
    e.vorschau = e.bild;
    ok(t, t.image.width / t.image.height);
  }, undefined, () => { console.warn('Bild nicht gefunden:', e.bild); ersatz(); });
}

function neuPunkt(eltern, pos){
  const m = new THREE.Mesh(new THREE.SphereGeometry(.05, 12, 8), matPunkt);
  m.position.copy(pos); eltern.add(m);
  return m;
}

function exponatInteraktion(e, anker){
  e.io = interaktion({ anker, nx:e.platz.nx, nz:e.platz.nz, nurVorn:e.art !== 'objekt', hinweis:`${e.titel} ansehen`, aktion:() => oeffne(e), meshes:[] });
}
function klick(e, ...meshes){ meshes.forEach(m => { m.userData.io = e.io; klickbar.push(m); }); }

function bauWandExponat(e){
  const p = e.platz, max = aktEtage.bildMax;
  const gruppe = new THREE.Group();
  gruppe.position.set(p.x + p.nx * .01, 0, p.z + p.nz * .01);
  gruppe.rotation.y = Math.atan2(p.nx, p.nz);
  welt.add(gruppe);
  exponatInteraktion(e, new THREE.Vector3(p.x, BILD_Y, p.z));

  ladeBild(e, (tex, ratio) => {
    let b = max.b, h = b / ratio;
    if (h > max.h){ h = max.h; b = h * ratio; }
    const rand = e.art === 'zitat' ? .06 : .1, passep = e.art === 'zitat' ? 0 : .12, tiefe = .07;
    const rb = b + passep * 2, rh = h + passep * 2;
    const pp = new THREE.Mesh(new THREE.BoxGeometry(rb, rh, .03), matPassep);
    pp.position.set(0, BILD_Y, .02); gruppe.add(pp);
    const mR = e.art === 'zitat' ? matGold : matRahmen;
    [[0, rh / 2 + rand / 2, rb + rand * 2, rand], [0, -rh / 2 - rand / 2, rb + rand * 2, rand],
     [rb / 2 + rand / 2, 0, rand, rh], [-rb / 2 - rand / 2, 0, rand, rh]].forEach(([x, y, w, hh]) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, hh, tiefe), mR);
      m.position.set(x, BILD_Y + y, tiefe / 2); gruppe.add(m);
    });
    const bild = new THREE.Mesh(new THREE.PlaneGeometry(b, h), new THREE.MeshBasicMaterial({ map:tex, toneMapped:false }));
    bild.position.set(0, BILD_Y, .04); gruppe.add(bild);
    const kegel = new THREE.Mesh(new THREE.PlaneGeometry(rb + 1.6, 3.4), lichtkegelMat);
    kegel.position.set(0, BILD_Y + .35, .005); gruppe.add(kegel);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(.06, .09, .22, 12), matSockel);
    arm.position.set(0, BILD_Y + rh / 2 + .55, .35); arm.rotation.x = -.9; gruppe.add(arm);
    const schildM = new THREE.Mesh(new THREE.PlaneGeometry(.64, .25), new THREE.MeshBasicMaterial({ map:schildTex(e), toneMapped:false }));
    schildM.position.set(rb / 2 + rand + .5, 1.15, .02); gruppe.add(schildM);
    klick(e, bild, pp, schildM);
    e.punkt = neuPunkt(gruppe, new THREE.Vector3(rb / 2 + rand + .5, 1.42, .05));
    aktualisierePunkt(e);
  });
}

function bauVitrine(e){
  const p = e.platz, s = .55;
  const g = new THREE.Group();
  g.position.set(p.x, 0, p.z);
  welt.add(g);
  box(p.x - s, p.x + s, p.z - s, p.z + s, 0, 1.0, matSockel);
  const deckel = new THREE.Mesh(new THREE.BoxGeometry(s * 2 + .04, .04, s * 2 + .04), matGold);
  deckel.position.y = 1.0; g.add(deckel);
  const glas = new THREE.Mesh(new THREE.BoxGeometry(s * 2 - .04, 1.1, s * 2 - .04), matGlas);
  glas.position.y = 1.57; g.add(glas);
  const kante = new THREE.LineSegments(new THREE.EdgesGeometry(glas.geometry), new THREE.LineBasicMaterial({ color:0xc9a35a, transparent:true, opacity:.6 }));
  kante.position.copy(glas.position); g.add(kante);
  const licht = new THREE.Mesh(new THREE.PlaneGeometry(s * 1.6, s * 1.6), matLicht);
  licht.rotation.x = Math.PI / 2; licht.position.y = 2.115; g.add(licht);
  exponatInteraktion(e, new THREE.Vector3(p.x, 1.5, p.z));
  klick(e, glas);
  ladeBild(e, (tex, ratio) => {
    let b = .8, h = b / ratio;
    if (h > .9){ h = .9; b = h * ratio; }
    const tafel = new THREE.Mesh(new THREE.PlaneGeometry(b, h), new THREE.MeshBasicMaterial({ map:tex, side:THREE.DoubleSide, toneMapped:false }));
    tafel.position.y = 1.08 + h / 2 + .05;
    g.add(tafel); drehend.push(tafel); klick(e, tafel);
  });
  const schildM = new THREE.Mesh(new THREE.PlaneGeometry(.64, .25), new THREE.MeshBasicMaterial({ map:schildTex(e), toneMapped:false }));
  schildM.position.set(p.nx * (s + .01), .78, p.nz * (s + .01)); schildM.rotation.y = Math.atan2(p.nx, p.nz);
  g.add(schildM); klick(e, schildM);
  e.punkt = neuPunkt(g, new THREE.Vector3(p.nx * (s + .02), .95, p.nz * (s + .02)));
  aktualisierePunkt(e);
}

function baueEtage(et){
  if (welt){ scene.remove(welt); entsorge(welt); }
  welt = new THREE.Group(); scene.add(welt);
  gen++; aktEtage = et;
  hindernisse = []; interaktiv = []; klickbar = []; drehend = []; portalUniforms = [];
  ziel = null; kreuz.classList.remove('aktiv'); hinweis.style.display = 'none';
  const wf = new THREE.Color(et.wand);
  hell = wf.getHSL({}).l > .45;
  textFarbe = hell ? '#1c1714' : '#f4efe6';
  matWand = new THREE.MeshStandardMaterial({ color:wf, roughness:.95 });
  BAU[et.layout](et);
  bauAufzug(et);
  for (const e of et.liste) (e.art === 'objekt' ? bauVitrine : bauWandExponat)(e);
  aktuellerRaum = null;
}

// ---------- Entdeckt-Zähler ----------
const SPEICHER = 'mbg2028-entdeckt';
let entdeckt = new Set();
try { entdeckt = new Set(JSON.parse(localStorage.getItem(SPEICHER) || '[]')); } catch (_) {}
function aktualisierePunkt(e){ if (e.punkt) e.punkt.visible = !entdeckt.has(e.schluessel); }
function zaehler(){
  const n = ALLE.filter(e => entdeckt.has(e.schluessel)).length;
  document.getElementById('fund').innerHTML = `Entdeckt <b>${n}</b>/${ALLE.length}`;
  return n;
}
function markiere(e){
  if (entdeckt.has(e.schluessel)) return;
  entdeckt.add(e.schluessel);
  try { localStorage.setItem(SPEICHER, JSON.stringify([...entdeckt])); } catch (_) {}
  aktualisierePunkt(e);
  const n = zaehler();
  if (n === ALLE.length && n > 0) melde('Alles entdeckt! Du kennst jetzt die ganze Sammlung.', 4000);
}

// ---------- Steuerung ----------
const istTouch = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;
const pos = new THREE.Vector3(0, AUGE, -2.5);
let yaw = 0, pitch = 0, laeuft = false, pausiert = true, gesperrt = false, wechselt = false;
const tasten = {};
const stick = { x:0, y:0, id:null };

function startSpiel(){
  document.getElementById('start').style.display = 'none';
  document.getElementById('hud').style.display = 'flex';
  document.getElementById('fadenkreuz').style.display = istTouch ? 'none' : 'block';
  if (istTouch) document.getElementById('stick').style.display = 'block';
  if (!laeuft){ pos.set(0, AUGE, -2.5); yaw = 0; pitch = 0; }
  laeuft = true; pausiert = false;
  if (!istTouch && canvas.requestPointerLock) canvas.requestPointerLock();
}
document.getElementById('betreten').addEventListener('click', startSpiel);
if (istTouch){ document.getElementById('hilfeMaus').style.display = 'none'; document.getElementById('hilfeTouch').style.display = 'block'; }

document.addEventListener('pointerlockchange', () => {
  gesperrt = document.pointerLockElement === canvas;
  if (!gesperrt && laeuft && !schichtOffen()){
    pausiert = true;
    document.getElementById('start').style.display = 'flex';
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
  if (ziel) ziel.aktion();
});
document.addEventListener('keydown', e => {
  tasten[e.code] = true;
  if (e.code === 'Escape' && schichtOffen()) schliesseAlles();
  if (!laeuft) return;
  if (e.code === 'KeyE' || e.code === 'Enter'){
    if (schichtOffen('detail') || schichtOffen('portalInfo')) schliesseAlles();
    else if (ziel && !schichtOffen()) ziel.aktion();
  }
  if (e.code === 'KeyK' || e.code === 'Tab'){ e.preventDefault(); schichtOffen('katalog') ? schliesseAlles() : oeffneKatalog(); }
  if (e.code === 'KeyF' && !schichtOffen()) oeffneAufzug();
  if (schichtOffen('detail')){
    if (e.code === 'ArrowRight') blaettern(1);
    if (e.code === 'ArrowLeft') blaettern(-1);
  }
});
document.addEventListener('keyup', e => { tasten[e.code] = false; });
window.addEventListener('blur', () => { for (const k in tasten) tasten[k] = false; });

// Touch: Joystick links, Umschauen auf dem Rest, Tippen öffnet
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
  if (!laeuft || schichtOffen() || wechselt) return;
  ray.setFromCamera(new THREE.Vector2(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1), camera);
  ray.far = 9;
  const treffer = ray.intersectObjects(klickbar, false)[0];
  if (treffer && treffer.object.userData.io) treffer.object.userData.io.aktion();
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
  const tempo = l > 0 ? (tasten.ShiftLeft || tasten.ShiftRight ? 4.6 : 2.7) : 0;
  const s = Math.sin(yaw), c = Math.cos(yaw);
  const dx = (vx * c + vz * s) * tempo * dt, dz = (-vx * s + vz * c) * tempo * dt;
  const n = Math.ceil(Math.hypot(dx, dz) / .1) || 1;
  for (let i = 0; i < n; i++){ pos.x += dx / n; pos.z += dz / n; kollidiere(pos); }
  schritt += Math.hypot(dx, dz) * 2.2;
  setzeKamera(Math.min(1, l));
}
function setzeKamera(wippen = 0){
  camera.position.set(pos.x, AUGE + Math.sin(schritt) * .025 * wippen, pos.z);
  camera.rotation.set(pitch, yaw, 0);
}

// ---------- Ziel erkennen ----------
let ziel = null;
const vorne = new THREE.Vector3(), zuIhm = new THREE.Vector3();
const hinweis = document.getElementById('hinweis'), kreuz = document.getElementById('fadenkreuz');
function sucheZiel(){
  camera.getWorldDirection(vorne);
  let bester = null, besterWert = Infinity;
  for (const o of interaktiv){
    zuIhm.subVectors(o.anker, camera.position);
    const d = zuIhm.length();
    if (d > (o.reichweite || 4.5)) continue;
    if (o.nurVorn && zuIhm.x * o.nx + zuIhm.z * o.nz > 0) continue;
    const winkel = vorne.angleTo(zuIhm.normalize());
    if (winkel > .45) continue;
    const wert = winkel * 3 + d;
    if (wert < besterWert){ besterWert = wert; bester = o; }
  }
  if (bester !== ziel){
    ziel = bester;
    kreuz.classList.toggle('aktiv', !!ziel);
    if (ziel){
      hinweis.innerHTML = `${istTouch ? 'Tippen' : '<b>E</b>'} · ${esc(ziel.hinweis)}`;
      hinweis.style.display = 'block';
    } else hinweis.style.display = 'none';
  }
}
hinweis.addEventListener('click', () => { if (ziel) ziel.aktion(); });

let aktuellerRaum = null;
function raumAnzeige(){
  const r = aktEtage.raumAn(pos);
  if (r !== aktuellerRaum){
    aktuellerRaum = r;
    document.getElementById('hudRaum').textContent = r === aktEtage.name ? r : `${aktEtage.name} · ${r}`;
  }
}

// ---------- Etagenwechsel ----------
const blende = document.getElementById('blende');
function wechsleEtage(et, wohin = {}){
  if (wechselt) return;
  wechselt = true;
  blende.classList.add('zu');
  setTimeout(() => {
    if (et !== aktEtage) baueEtage(et);
    if (wohin.exponat) stelleVor(wohin.exponat);
    else {
      const r = wohin.raum && et.raumListe.find(r => r.basis === wohin.raum || r.name === wohin.raum);
      const st = (r && r.start) || { x:0, z:-2.5, yaw:0 };
      pos.set(st.x, AUGE, st.z); yaw = st.yaw; pitch = 0;
    }
    kollidiere(pos); setzeKamera();
    blende.classList.remove('zu');
    wechselt = false;
    melde(`${et.kurz === 'E' ? 'Erdgeschoss' : 'Etage ' + et.kurz} · ${et.name}`);
  }, 380);
}
function stelleVor(e){
  const p = e.platz, abstand = e.art === 'objekt' ? 1.9 : (e.etage.layout === 'flur' ? 2.4 : 2.8);
  pos.set(p.x + p.nx * abstand, AUGE, p.z + p.nz * abstand);
  yaw = Math.atan2(p.nx, p.nz); pitch = e.art === 'objekt' ? -.12 : 0;
}
function gehZu(e){
  if (e.etage !== aktEtage) return wechsleEtage(e.etage, { exponat:e });
  stelleVor(e); kollidiere(pos); setzeKamera();
}

function portalAktion(p){
  const et = p.etage && etageNach(p.etage);
  if (et){ schliesseAlles(); return wechsleEtage(et, { raum:p.raum }); }
  if (p.link){
    document.getElementById('pTitel').textContent = p.titel;
    document.getElementById('pBeschr').textContent = p.beschreibung || '';
    const a = document.getElementById('pLink');
    a.href = p.link;
    zeigeSchicht('portalInfo');
    return;
  }
  melde('Dieses Portal ist noch geschlossen.');
}

// ---------- Overlays ----------
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const ARTNAME = { bild:'Bild', zitat:'Zitat', objekt:'Objekt' };
let offenes = null;
function schichtOffen(id){
  return id ? document.getElementById(id).classList.contains('offen') : !!document.querySelector('.schicht.offen');
}
function zeigeSchicht(id){
  document.querySelectorAll('.schicht').forEach(s => s.classList.toggle('offen', s.id === id));
  if (document.pointerLockElement) document.exitPointerLock();
  for (const k in tasten) tasten[k] = false;
  stick.x = stick.y = 0;
}
function oeffne(e){
  offenes = e;
  const img = document.getElementById('dBild');
  img.src = e.vorschau || ''; img.style.display = e.vorschau ? '' : 'none';
  document.getElementById('dArt').textContent = `${ARTNAME[e.art] || 'Exponat'} · ${e.etage.name} · ${e.raum.name}`;
  document.getElementById('dTitel').textContent = e.titel;
  document.getElementById('dMeta').textContent = [e.von, e.datum].filter(Boolean).join(' · ');
  const z = document.getElementById('dZitat');
  z.textContent = e.art === 'zitat' && e.text ? `„${e.text}“` : ''; z.style.display = z.textContent ? '' : 'none';
  document.getElementById('dBeschr').textContent = e.beschreibung || '';
  zeigeSchicht('detail');
  markiere(e);
}
function blaettern(r){
  if (!offenes) return;
  const l = offenes.etage.liste, i = l.indexOf(offenes);
  const n = l[(i + r + l.length) % l.length];
  if (!n.vorschau) n.vorschau = n.art === 'zitat' ? zitatBild(n).toDataURL('image/jpeg', .85) : n.bild || platzhalterBild(n).toDataURL('image/jpeg', .85);
  oeffne(n);
}
document.getElementById('dWeiter').addEventListener('click', () => blaettern(1));
document.getElementById('dZurueck').addEventListener('click', () => blaettern(-1));

function oeffneAufzug(){
  const l = document.getElementById('aListe');
  l.innerHTML = [...ETAGEN].reverse().map(et => `
    <button class="etage${et === aktEtage ? ' hier' : ''}" data-etage="${et.nr}">
      <span class="nr">${esc(et.kurz)}</span>
      <span><b>${esc(et.name)}</b>${et.untertitel ? `<small>${esc(et.untertitel)}</small>` : ''}</span>
      ${et === aktEtage ? '<span class="klein">Du bist hier</span>' : ''}
    </button>`).join('');
  zeigeSchicht('aufzug');
}
document.getElementById('aListe').addEventListener('click', ev => {
  const b = ev.target.closest('[data-etage]'); if (!b) return;
  const et = ETAGEN[+b.dataset.etage];
  schliesseAlles();
  if (et !== aktEtage) wechsleEtage(et);
});

function oeffneKatalog(){
  let html = '';
  for (const et of ETAGEN){
    html += `<div class="etagenkopf"><span class="nr">${esc(et.kurz)}</span>${esc(et.name)}</div>`;
    if (et.layout !== 'lobby' && et.raumListe.length){
      html += '<div class="chips">' + et.raumListe.map((r, i) => `<button class="chip" data-raum="${et.nr}:${i}">${esc(r.name)}</button>`).join('') + '</div>';
    }
    if (et.layout === 'portale') html += '<div class="chips">' + et.portale.map(p => `<span class="chip still">${esc(p.titel)}</span>`).join('') + '</div>';
    for (const e of et.liste){
      const ok = entdeckt.has(e.schluessel);
      html += `<button class="eintrag" data-nr="${e.nr}"><span class="haken">${ok ? '✓' : '•'}</span><span>${esc(e.titel)}</span><span class="klein">${esc(e.raum.name)} · ${ARTNAME[e.art] || ''}</span></button>`;
    }
  }
  document.getElementById('kListe').innerHTML = html;
  zeigeSchicht('katalog');
}
document.getElementById('katalogKnopf').addEventListener('click', oeffneKatalog);
document.getElementById('aufzugKnopf').addEventListener('click', oeffneAufzug);
document.getElementById('kListe').addEventListener('click', ev => {
  const b = ev.target.closest('[data-nr],[data-raum]'); if (!b) return;
  schliesseAlles();
  if (b.dataset.nr) return gehZu(ALLE[+b.dataset.nr]);
  const [ei, ri] = b.dataset.raum.split(':').map(Number);
  const et = ETAGEN[ei], r = et.raumListe[ri];
  if (et !== aktEtage) return wechsleEtage(et, { raum:r.name });
  pos.set(r.start.x, AUGE, r.start.z); yaw = r.start.yaw; pitch = 0; setzeKamera();
});
function schliesseAlles(){
  document.querySelectorAll('.schicht').forEach(s => s.classList.remove('offen'));
  offenes = null;
  if (laeuft && !istTouch && !gesperrt){ pausiert = false; document.getElementById('start').style.display = 'none'; canvas.requestPointerLock(); }
}
document.querySelectorAll('[data-zu]').forEach(b => b.addEventListener('click', schliesseAlles));
document.querySelectorAll('.schicht').forEach(s => s.addEventListener('click', ev => { if (ev.target === s) schliesseAlles(); }));
document.getElementById('pLink').addEventListener('click', () => setTimeout(schliesseAlles, 50));

let meldTimer;
function melde(text, ms = 2500){
  const m = document.getElementById('meldung');
  m.textContent = text; m.style.opacity = 1;
  clearTimeout(meldTimer); meldTimer = setTimeout(() => { m.style.opacity = 0; }, ms);
}

// ---------- Start ----------
document.title = `${TITEL} · ${UNTER}`;
document.getElementById('startTitel').textContent = TITEL;
document.getElementById('startUnter').textContent = UNTER;
document.getElementById('hudTitel').textContent = TITEL;

const schrift = document.fonts ? Promise.all([document.fonts.load(`800 40px ${SCHRIFT}`), document.fonts.load(`600 40px ${SCHRIFT}`)]).catch(() => {}) : Promise.resolve();
schrift.then(() => {
  baueEtage(ETAGEN[0]);
  zaehler();
});

const uhr = new THREE.Clock();
let warteBild = 0;
function schleife(){
  requestAnimationFrame(schleife);
  const dt = Math.min(uhr.getDelta(), .05);
  for (const t of drehend) t.rotation.y += dt * .5;
  for (const u of portalUniforms) u.t.value += dt;
  if (!aktEtage){ renderer.render(scene, camera); return; }
  if (laeuft && !pausiert && !schichtOffen() && !wechselt){ bewege(dt); sucheZiel(); raumAnzeige(); }
  else if (!laeuft){
    // Vorschau auf dem Startbildschirm: langsamer Schwenk durch die Lobby
    warteBild += dt * .12;
    camera.position.set(Math.sin(warteBild) * 2, AUGE + .2, -3 - (1 - Math.cos(warteBild)) * 2);
    camera.rotation.set(-.02, Math.sin(warteBild * .7) * .5, 0);
  }
  renderer.render(scene, camera);
}
schleife();
})();
