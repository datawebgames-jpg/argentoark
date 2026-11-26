// Baraja española y francesa propias del Fogón, dibujadas en SVG (sin imágenes de terceros).
// carta(numero, palo, ancho) -> string SVG. Palos: oro, copa, espada, basto (españolas); pica, corazon, diamante, trebol (francesas).
(function () {
  const COL = { oro: '#d79a12', copa: '#c8322a', espada: '#2f5fa8', basto: '#3c7d2c', pica: '#1d1d1d', trebol: '#1d1d1d', corazon: '#c8322a', diamante: '#c8322a' };
  // un dibujo de cada palo en una caja de 40x40
  const PALO = {
    oro: `<circle cx="20" cy="20" r="16" fill="#f2c230" stroke="#8a5a00" stroke-width="2"/><circle cx="20" cy="20" r="10.5" fill="none" stroke="#a86e00" stroke-width="1.6"/><circle cx="20" cy="20" r="4" fill="#d79a12" stroke="#8a5a00"/>${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<line x1="20" y1="7" x2="20" y2="10" stroke="#8a5a00" stroke-width="1.4" transform="rotate(${a} 20 20)"/>`).join('')}`,
    copa: `<path d="M8 5 H32 Q32 19 20 21 Q8 19 8 5Z" fill="#d23b2f" stroke="#7a1410" stroke-width="1.5"/><rect x="7" y="4" width="26" height="3" rx="1" fill="#f2c230" stroke="#8a5a00" stroke-width=".8"/><rect x="18" y="21" width="4" height="9" fill="#f2c230" stroke="#8a5a00" stroke-width=".8"/><ellipse cx="20" cy="33" rx="9" ry="3.5" fill="#d23b2f" stroke="#7a1410" stroke-width="1.3"/><circle cx="20" cy="12" r="2.4" fill="#f2c230"/>`,
    espada: `<g transform="rotate(-30 20 20)"><polygon points="20,1 23,6 23,27 17,27 17,6" fill="#cfe0f0" stroke="#24467a" stroke-width="1.3"/><line x1="20" y1="5" x2="20" y2="26" stroke="#7d9cc0" stroke-width="1"/><rect x="11" y="27" width="18" height="3.4" rx="1.5" fill="#f2c230" stroke="#8a5a00" stroke-width=".8"/><rect x="18" y="30.4" width="4" height="6" fill="#2f5fa8" stroke="#1a3360" stroke-width=".8"/><circle cx="20" cy="38" r="2.3" fill="#f2c230" stroke="#8a5a00" stroke-width=".8"/></g>`,
    basto: `<g transform="rotate(-25 20 20)"><path d="M16 38 L14 14 Q13 4 20 2 Q27 4 26 14 L24 38 Z" fill="#7a4a1f" stroke="#3c220a" stroke-width="1.3"/><circle cx="16.5" cy="12" r="2" fill="#a0672f"/><circle cx="23" cy="19" r="2" fill="#a0672f"/><circle cx="17" cy="27" r="1.8" fill="#a0672f"/><path d="M14 17 Q7 14 6 9 Q12 10 14.5 15Z" fill="#3c7d2c"/><path d="M25.5 24 Q32 22 34 17 Q28 18 25 22Z" fill="#3c7d2c"/></g>`,
    pica: `<path d="M20 4 C28 14 36 18 36 25 C36 31 29 33 22 28 L24 37 H16 L18 28 C11 33 4 31 4 25 C4 18 12 14 20 4Z" fill="#1d1d1d"/>`,
    trebol: `<circle cx="20" cy="11" r="7.5" fill="#1d1d1d"/><circle cx="11" cy="23" r="7.5" fill="#1d1d1d"/><circle cx="29" cy="23" r="7.5" fill="#1d1d1d"/><path d="M18 22 L16 37 H24 L22 22Z" fill="#1d1d1d"/>`,
    corazon: `<path d="M20 36 C8 26 3 20 3 13 C3 7 8 4 12 4 C16 4 19 7 20 10 C21 7 24 4 28 4 C32 4 37 7 37 13 C37 20 32 26 20 36Z" fill="#c8322a"/>`,
    diamante: `<path d="M20 2 L35 20 L20 38 L5 20Z" fill="#c8322a"/>`,
  };
  // donde va cada dibujo del palo (en una caja de 100x150, zona central)
  const L = {
    1: [[50, 75, 2.1]], 2: [[50, 38], [50, 112]], 3: [[50, 34], [50, 75], [50, 116]], 4: [[32, 40], [68, 40], [32, 110], [68, 110]],
    5: [[32, 38], [68, 38], [50, 75], [32, 112], [68, 112]], 6: [[32, 36], [68, 36], [32, 75], [68, 75], [32, 114], [68, 114]],
    7: [[32, 34], [68, 34], [50, 55], [32, 78], [68, 78], [32, 116], [68, 116]],
    8: [[32, 34], [68, 34], [50, 55], [32, 75], [68, 75], [50, 96], [32, 116], [68, 116]],
    9: [[32, 32], [68, 32], [32, 60], [68, 60], [50, 75], [32, 90], [68, 90], [32, 118], [68, 118]],
    10: [[32, 32], [68, 32], [50, 48], [32, 64], [68, 64], [32, 86], [68, 86], [50, 102], [32, 118], [68, 118]],
  };
  const use = (palo, x, y, s = 0.62) => `<g transform="translate(${x - 20 * s} ${y - 20 * s}) scale(${s})">${PALO[palo]}</g>`;
  // figuras: sota (10), caballo (11), rey (12) en la española; J Q K en la francesa
  function figura(n, palo, frances) {
    const c = COL[palo], capa = palo === 'oro' ? '#2f5fa8' : palo === 'espada' ? '#c8322a' : palo === 'copa' ? '#2f5fa8' : '#c8322a';
    const cara = `<circle cx="50" cy="46" r="11" fill="#f5d5b0" stroke="#5a3a1a" stroke-width="1.2"/><circle cx="46" cy="45" r="1.2" fill="#222"/><circle cx="54" cy="45" r="1.2" fill="#222"/><path d="M46 51 Q50 53 54 51" stroke="#5a3a1a" fill="none" stroke-width="1.1"/>`;
    const cuerpo = `<path d="M30 122 L35 64 Q50 56 65 64 L70 122Z" fill="${capa}" stroke="#222" stroke-width="1.2"/><path d="M42 64 L50 92 L58 64" fill="#f2c230" stroke="#8a5a00" stroke-width="1"/>`;
    let gorro;
    if (n === 12 || (frances && n === 13)) gorro = `<path d="M38 38 L38 26 L44 32 L50 22 L56 32 L62 26 L62 38Z" fill="#f2c230" stroke="#8a5a00" stroke-width="1.2"/><circle cx="50" cy="30" r="2" fill="#c8322a"/>`;
    else if (n === 11 || (frances && n === 12)) gorro = frances ? `<path d="M39 38 Q50 22 61 38Z" fill="#f2c230" stroke="#8a5a00"/><circle cx="50" cy="28" r="2" fill="#2f5fa8"/>` : `<path d="M38 38 Q50 24 62 38Z" fill="${c}" stroke="#222"/><path d="M60 30 Q70 24 72 32" stroke="#c8322a" stroke-width="3" fill="none"/>`;
    else gorro = `<path d="M37 39 Q50 28 63 39 L60 34 Q50 26 40 34Z" fill="${c}" stroke="#222" stroke-width="1"/><circle cx="62" cy="33" r="3" fill="#f2c230"/>`;
    const caballo = !frances && n === 11 ? `<path d="M22 140 L26 112 Q30 98 50 100 Q66 98 76 108 L84 100 L86 112 L78 118 L76 140 L70 140 L68 122 L36 124 L32 140Z" fill="#8a5a2a" stroke="#3c220a" stroke-width="1.2"/>` : '';
    return `${caballo}${cuerpo}${cara}${gorro}${use(palo, 74, 92, 0.7)}`;
  }
  // corte del marco: la "pinta" de la baraja española (oro sin corte, copa 1, espada 2, basto 3)
  function marco(palo) {
    const cortes = { oro: 0, copa: 1, espada: 2, basto: 3 }[palo] ?? 0;
    let s = `<rect x="7" y="7" width="86" height="136" rx="5" fill="none" stroke="${COL[palo]}" stroke-width="1.6"/>`;
    for (let i = 0; i < cortes; i++) s += `<rect x="${30 + i * 8}" y="5" width="4" height="4" fill="#f6eed8"/><rect x="${30 + i * 8}" y="141" width="4" height="4" fill="#f6eed8"/>`;
    return s;
  }
  window.carta = function (n, palo, w = 92, dorso = false) {
    const h = w * 1.5;
    if (dorso) return `<svg width="${w}" height="${h}" viewBox="0 0 100 150"><rect x="1" y="1" width="98" height="148" rx="8" fill="#f6eed8" stroke="#5a4a2a" stroke-width="1"/><rect x="6" y="6" width="88" height="138" rx="5" fill="#1f3f6e"/><g opacity=".9">${Array.from({ length: 6 }, (_, r) => Array.from({ length: 4 }, (_, k) => `<path d="M${17 + k * 22} ${18 + r * 23} l6 -6 l6 6 l-6 6z" fill="#74acdf"/>`).join('')).join('')}</g><rect x="22" y="58" width="56" height="34" rx="4" fill="#f6eed8"/><text x="50" y="81" font-family="Roboto,Arial" font-weight="700" font-size="18" text-anchor="middle" fill="#1f3f6e">AP</text></svg>`;
    const frances = ['pica', 'trebol', 'corazon', 'diamante'].includes(palo);
    const fig = frances ? n >= 11 && n <= 13 : n >= 10;
    const etiq = frances ? ({ 1: 'A', 11: 'J', 12: 'Q', 13: 'K' }[n] || n) : n;
    let centro;
    if (fig) centro = figura(n, palo, frances);
    else if (n === 1) centro = use(palo, 50, 75, frances ? 1.3 : 1.6);
    else centro = L[n].map(([x, y]) => use(palo, x, y, frances ? 0.5 : 0.6)).join('');
    const esq = `<text x="13" y="24" font-family="Roboto,Arial" font-weight="700" font-size="17" text-anchor="middle" fill="${COL[palo]}">${etiq}</text>${frances ? use(palo, 13, 34, 0.28) : ''}`;
    return `<svg width="${w}" height="${h}" viewBox="0 0 100 150"><rect x="1" y="1" width="98" height="148" rx="8" fill="#f6eed8" stroke="#8a7a5a" stroke-width="1.2"/>${frances ? '' : marco(palo)}${esq}<g transform="rotate(180 50 75)">${esq}</g>${centro}</svg>`;
  };
  // dado de generala
  window.dado = function (v, w = 64, guardado = false) {
    const P = { 1: [[50, 50]], 2: [[28, 28], [72, 72]], 3: [[28, 28], [50, 50], [72, 72]], 4: [[28, 28], [72, 28], [28, 72], [72, 72]], 5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]], 6: [[28, 26], [72, 26], [28, 50], [72, 50], [28, 74], [72, 74]] };
    return `<svg width="${w}" height="${w}" viewBox="0 0 100 100"><rect x="4" y="4" width="92" height="92" rx="18" fill="${guardado ? '#ffe9a8' : '#fbf7ee'}" stroke="${guardado ? '#f6b40e' : '#9a8a6a'}" stroke-width="${guardado ? 6 : 3}"/>${P[v].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="${v === 1 ? '#c8322a' : '#1d1d1d'}"/>`).join('')}</svg>`;
  };
})();
