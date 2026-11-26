const fs = require('fs'), cp = require('child_process'), path = require('path');
const D = __dirname, html = fs.readFileSync(path.join(D, '..', 'index.html'), 'utf8');
const css = [...html.matchAll(/^\.dd-[^\n]*$/gm)].map(m => m[0]).join('\n');
const a = html.indexOf('// ---------- Duelo de Dinos: mazo y mesa'), b = html.indexOf('MESA_REGLAS.dinos');
const fns = html.slice(a, b);
const BASE = `<meta charset="utf-8"><style>
*{box-sizing:border-box}html{background:#070b08}body{margin:0;width:1280px;min-height:100vh;background:radial-gradient(ellipse at 50% 0%,#24402a 0%,#0e1a12 55%,#070b08 100%);color:#ece9e2;font:16px/1.5 'Segoe UI',Inter,system-ui,sans-serif;overflow:hidden}
.wrap{padding:40px 56px}h1{font:800 64px/1 'Segoe UI Black','Segoe UI',sans-serif;letter-spacing:2px;margin:0;color:#f0a020;text-shadow:0 4px 18px #000}
h2{font:800 40px/1.1 'Segoe UI',sans-serif;margin:0 0 6px;color:#f0a020}.sub{color:#b9c2b4;font-size:20px}
.marca{position:absolute;right:40px;bottom:22px;font-weight:800;letter-spacing:1px;color:#f0a02099}
.btn{background:#f0a020;color:#111;border:0;border-radius:8px;padding:6px 12px;font-weight:700}
${css}
.dd-carta{font-size:15px;padding:10px 12px}.dd-mano{grid-template-columns:repeat(4,1fr)!important}.dd-cab b{font-size:18px}.dd-esp{font-size:13px}.dd-est{font-size:15px}
</style>`;
const FN = `<script>const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));const $=id=>document.getElementById(id);${fns}</script>`;
const card = (nombre, especie, nivel, sexo, mut, tier, tipo, atq, def, vel) => ({ nombre, especie, nivel, sexo, mut, tier, tipo, atq, def, vel });
const REX = card('Trueno', 'Rex', 212, 'M', 3, 5, 'depredador', 4010, 3420, 128), ARG = card('Cóndor', 'Argentavis', 180, 'H', 2, 3, 'alado', 3100, 2480, 150),
  TRI = card('Cuerno', 'Triceratops', 165, 'M', 1, 3, 'herbivoro', 2790, 2860, 112), RAP = card('Filo', 'Raptor', 140, 'H', 4, 2, 'depredador', 2610, 1940, 165),
  STE = card('Placa', 'Stegosaurus', 150, 'H', 0, 3, 'herbivoro', 2400, 2700, 105), PTE = card('Brisa', 'Pteranodon', 120, 'M', 1, 2, 'alado', 2050, 1500, 170),
  DOD = card('Pipo', 'Dodo', 30, 'M', 0, 1, 'herbivoro', 540, 420, 100);
const slides = {};
slides['1-portada'] = [1280, 720, `<div style="height:720px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center">
  <div class="sub" style="letter-spacing:6px">ARGENTOPRO ARK x5 PRESENTA</div><h1 style="font-size:96px">🦖 DUELO DE DINOS</h1>
  <div class="sub" style="font-size:26px;margin-bottom:26px">El juego de cartas donde <b style="color:#fff">tus dinos son las cartas</b></div>
  <div style="display:flex;gap:26px;align-items:flex-end"><div style="width:230px;transform:rotate(-6deg)"><div id="c1"></div></div><div style="width:270px;transform:translateY(-14px) scale(1.08)"><div id="c2"></div></div><div style="width:230px;transform:rotate(6deg)"><div id="c3"></div></div></div>
  <div class="sub" style="margin-top:30px;font-size:20px">Apostá AC · 10 dinos por mazo · en la página, sección Juegos</div></div>
  <script>c1.innerHTML=ddCarta(${JSON.stringify(ARG)});c2.innerHTML=ddCarta(${JSON.stringify(REX)});c3.innerHTML=ddCarta(${JSON.stringify(TRI)})</script>`];
slides['2-la-carta'] = [1280, 720, `<div class="wrap"><h2>Cada dino es una carta</h2><div class="sub">Se arma con los números reales de tu dino en el juego</div>
  <div style="display:flex;gap:50px;margin-top:26px;align-items:center"><div style="width:300px;transform:scale(1.45);transform-origin:center left;margin:0 130px 0 10px"><div id="c"></div></div>
  <div style="flex:1;display:grid;gap:12px;font-size:21px">
   <div>⭐ <b>La especie</b> da el poder base (de ★1 a ★5): un Rex arranca muy arriba de un Dodo.</div>
   <div>⚔️ <b>Ataque</b>: sube con los puntos de daño, el nivel y la especie.</div>
   <div>🛡️ <b>Defensa</b>: sube con los puntos de vida y de peso.</div>
   <div>💨 <b>Velocidad</b>: el más veloz pega +10%.</div>
   <div>🧬 <b>Mutaciones</b>: +4% a la carta por cada una.</div>
   <div>🥩🌿🦅 <b>Tipo</b>: depredador, herbívoro o alado.</div>
   <div>♂♀ <b>Sexo</b>: macho y hembra de la misma especie hacen pareja de cría.</div></div></div></div><div class="marca">DUELO DE DINOS</div>
  <script>c.innerHTML=ddCarta(${JSON.stringify(REX)})</script>`];
const campoYo = [{ c: REX, pos: 'A', nuevo: false, ataco: false, cambio: false, atq: 4010, def: 3420 }, { c: STE, pos: 'D', nuevo: true, ataco: false, cambio: false, atq: 2400, def: 2700 }, null];
const campoRiv = [{ c: ARG, pos: 'A', nuevo: false, ataco: false, cambio: false, atq: 3100, def: 2480 }, { c: TRI, pos: 'D', nuevo: false, ataco: false, cambio: false, atq: 2790, def: 2860 }, { c: RAP, pos: 'A', nuevo: false, ataco: false, cambio: false, atq: 2610, def: 1940 }];
const S = { q: 0, turno: 0, nro: 9, maxNro: 60, pv: [4650, 3120], pvMax: 6000, mano: [PTE, RAP, DOD], nMano: [3, 4], nMazo: [4, 3], campo: [campoYo, campoRiv], tumba: [[STE, DOD], [DOD, PTE, RAP]], invocado: true, ult: null,
  pred: { 0: [{ a: 3100, b: 3410 }, { a: 4010, b: 2860 }, { a: 4010, b: 3000 }] } };
slides['3-el-duelo'] = [1280, 885, `<div style="padding:22px 150px 0"><div style="display:flex;justify-content:space-between;align-items:baseline"><h2 style="font-size:34px">🦖 Un duelo en vivo</h2><span class="sub" style="font-size:16px">Entrada 1.000 AC · el ganador se lleva 1.900 AC</span></div><div id="m"></div></div>
  <script>const M={jugadores:['Ana','Beto'],estado:'jugando'};const S=${JSON.stringify(S)};ddSel={k:'campo',i:0};
  document.getElementById('m').innerHTML=dinosUI(M,S,0)</script>`];
slides['4-ventajas'] = [1280, 720, `<div class="wrap"><h2>Las ventajas que cambian el duelo</h2><div class="sub">Mirás el campo rival y elegís bien a quién atacar</div>
  <div style="display:flex;gap:40px;margin-top:20px;align-items:center">
  <svg width="440" height="400" viewBox="0 0 440 400"><defs><marker id="f" markerUnits="userSpaceOnUse" markerWidth="18" markerHeight="18" refX="14" refY="9" orient="auto"><path d="M0,0 L18,9 L0,18 z" fill="#f0a020"/></marker></defs>
   <g font-family="Segoe UI" text-anchor="middle"><circle cx="220" cy="70" r="58" fill="#c0392b33" stroke="#c0392b" stroke-width="4"/><text x="220" y="76" font-size="46">🥩</text><text x="220" y="150" fill="#fff" font-size="18" font-weight="700">Depredador</text>
   <circle cx="80" cy="300" r="58" fill="#2e8b4a33" stroke="#2e8b4a" stroke-width="4"/><text x="80" y="306" font-size="46">🌿</text><text x="80" y="380" fill="#fff" font-size="18" font-weight="700">Herbívoro</text>
   <circle cx="360" cy="300" r="58" fill="#2a7fc133" stroke="#2a7fc1" stroke-width="4"/><text x="360" y="306" font-size="46">🦅</text><text x="360" y="380" fill="#fff" font-size="18" font-weight="700">Alado</text></g>
   <path d="M180,118 Q110,190 100,236" fill="none" stroke="#f0a020" stroke-width="5" marker-end="url(#f)"/><path d="M130,300 Q220,345 300,305" fill="none" stroke="#f0a020" stroke-width="5" marker-end="url(#f)"/><path d="M345,238 Q330,170 262,118" fill="none" stroke="#f0a020" stroke-width="5" marker-end="url(#f)"/></svg>
  <div style="flex:1;display:grid;gap:14px;font-size:21px">
   <div style="background:#ffffff10;border-radius:12px;padding:12px 16px"><b style="color:#f0a020">Triángulo</b> · quien tiene la ventaja de tipo ataca con <b>+25%</b></div>
   <div style="background:#ffffff10;border-radius:12px;padding:12px 16px">💨 <b style="color:#f0a020">Velocidad</b> · el más veloz pega <b>+10%</b></div>
   <div style="background:#ffffff10;border-radius:12px;padding:12px 16px">💞 <b style="color:#f0a020">Pareja de cría</b> · macho + hembra de la misma especie en tu campo: <b>+15%</b> de ataque y defensa</div>
   <div style="background:#ffffff10;border-radius:12px;padding:12px 16px">🔥 <b style="color:#f0a020">Tributo</b> · los dinos ★5 piden sacrificar a uno de tu campo para entrar</div>
   <div style="background:#ffffff10;border-radius:12px;padding:12px 16px">👁️ <b style="color:#f0a020">Se ve todo</b> · la pantalla te avisa "¡lo vencés!" o "¡perdés!" antes de atacar</div></div></div></div><div class="marca">DUELO DE DINOS</div>`];
const paso = (n, t, d) => `<div style="flex:1;background:#ffffff10;border-radius:16px;padding:20px;border-top:6px solid #f0a020"><div style="font:800 46px/1 'Segoe UI';color:#f0a020">${n}</div><div style="font-weight:800;font-size:24px;margin:6px 0">${t}</div><div style="color:#c9d2c4;font-size:18px">${d}</div></div>`;
slides['5-como-se-juega'] = [1280, 720, `<div class="wrap"><h2>Cómo se juega</h2><div class="sub">1 contra 1 · apostás AC · ganás el pozo menos 5% de la casa</div>
  <div style="display:flex;gap:18px;margin-top:26px">${paso(1, 'Elegí tu mazo', '10 dinos de tu tribu para la partida. Los leés del juego y los guardás en la página.')}${paso(2, 'Robá e invocá', 'Arrancás con 6.000 de vida y 3 cartas. Cada turno robás 1 e invocás 1 dino en ataque ⚔️ o defensa 🛡️.')}${paso(3, 'Atacá', 'Con los dinos que ya estaban en el campo. Ataque contra ataque: cae el más flojo y su dueño pierde la diferencia.')}${paso(4, 'Ganá', 'Dejá al rival sin vida o sin dinos. Si no tiene dinos en el campo, pegás directo. A los 60 turnos gana el que tenga más vida.')}</div>
  <div style="margin-top:34px;text-align:center;font:800 34px 'Segoe UI';color:#fff">🏆 Entrá a la página → <span style="color:#f0a020">Juegos</span> → Duelo de Dinos</div></div><div class="marca">ARGENTOPRO ARK x5</div>`];
const exe = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
for (const [n, [w, h, body]] of Object.entries(slides)) {
  const f = path.join(D, n + '.html'); fs.writeFileSync(f, `<!doctype html><html><head>${BASE}</head><body>${body}${FN.replace('</script>', '</script>')}</body></html>`.replace(/<body>([\s\S]*)(<script>const esc[\s\S]*<\/script>)<\/body>/, (m, b, fn) => `<body>${fn}${b}</body>`));
  cp.spawnSync(exe, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--window-size=${w},${h}`, '--virtual-time-budget=2000', `--screenshot=${path.join(D, n + '.png')}`, 'file:///' + f.replace(/\\/g, '/')], { stdio: 'ignore' });
  fs.unlinkSync(f);
}
console.log(fs.readdirSync(D).filter(x => x.endsWith('.png')));
