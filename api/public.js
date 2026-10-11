// Funcion de Vercel: trae el estado en vivo del server desde la PC del cluster.
// 1) Pide el JSON del panel (puerto 8096 de la PC). 2) Si no responde, consulta cada mapa por A2S (UDP).
// La IP se configura en Vercel con la variable de entorno ARK_HOST (no queda en el repo).
const dgram = require('dgram');

const HOST = process.env.ARK_HOST;
const WEB_PORT = process.env.ARK_WEB_PORT || 8096;
const MAPS = [
  { name: 'The Island', queryPort: 27018, rotating: false },
  { name: 'Fjordur', queryPort: 27019, rotating: false },
  { name: 'Rotativo', queryPort: 27017, rotating: true },
];

function a2s(host, port) {
  return new Promise(resolve => {
    const s = dgram.createSocket('udp4');
    const Q = Buffer.concat([Buffer.from([255, 255, 255, 255, 0x54]), Buffer.from('Source Engine Query\0')]);
    const done = v => { try { s.close(); } catch { } resolve(v); };
    s.on('error', () => done(null));
    s.on('message', m => {
      if (m[4] === 0x41) return s.send(Buffer.concat([Q, m.slice(5)]), port, host); // challenge
      let o = 6;
      const str = () => { const e = m.indexOf(0, o); const v = m.slice(o, e).toString('utf8'); o = e + 1; return v; };
      const name = str(), map = str(); str(); str(); o += 2;
      done({ name, map, players: m[o], max: m[o + 1] });
    });
    s.send(Q, port, host);
    setTimeout(() => done(null), 2500);
  });
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=60');
  if (!HOST) return res.status(500).json({ error: 'Falta configurar ARK_HOST en Vercel' });
  try {
    const r = await fetch(`http://${HOST}:${WEB_PORT}/api/public`, { signal: AbortSignal.timeout(4000) });
    if (r.ok) return res.status(200).json(await r.json());
  } catch { }
  // plan B: consultar los mapas directo
  const info = await Promise.all(MAPS.map(m => a2s(HOST, m.queryPort)));
  const maps = MAPS.map((m, i) => ({
    name: m.rotating && info[i] ? (info[i].name.match(/- ([^-(]+?) - \(v/) || [])[1] || m.name : m.name,
    rotating: m.rotating, online: !!info[i], players: info[i]?.players || 0, maxPlayers: info[i]?.max || 70, queryPort: m.queryPort,
  }));
  res.status(200).json({
    name: 'ArgentoPro ARK x5', ip: HOST, maps,
    rotation: { enabled: true, day: 'lunes', time: '06:00', active: maps[2].name, next: '-', votes: [] },
    rates: { xp: 5, taming: 5, harvest: 5, stack: 5, breeding: 5, maturation: 5, structures: 5 },
  });
};
