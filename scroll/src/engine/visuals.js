// Compositions visuelles de la scène collante (Story) — construites par le moteur en HTML/SVG à partir du YAML du temps,
// jamais d'image générée. `visual.kind` : ui | list | chart | steps | quote | map | calendar | stat | icon | image
// (déduit si absent : image → image, number/value → stat, icon → icon, sinon ui). Tous les libellés viennent du YAML
// (donc traduits) ; le thème habille (.sv-*), le contenu compose.
import { icon } from './icons.js';
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const list = v => Array.isArray(v) ? v : [];
const badge = t => t ? `<b class="sv-badge">${esc(t)}</b>` : '';
const CHECK = icon('check', 'ico sv-check');

// Contour simplifié de la Suisse (lon/lat → x = (lon − 5.9)·100, y = (47.85 − lat)·146) et villes usuelles.
const CH = [[6.14,46.2],[5.97,46.13],[6.06,46.43],[6.45,46.75],[6.85,47.05],[7.0,47.35],[7.4,47.45],[7.59,47.59],[8.0,47.58],[8.4,47.6],[8.6,47.8],[8.9,47.65],[9.3,47.65],[9.6,47.55],[9.65,47.3],[9.5,47.1],[9.9,46.95],[10.2,46.85],[10.45,46.7],[10.49,46.6],[10.4,46.4],[10.15,46.25],[10.1,46.2],[9.9,46.35],[9.5,46.3],[9.3,46.5],[9.05,46.05],[8.85,45.95],[9.02,45.83],[8.7,46.1],[8.45,46.25],[8.1,46.15],[7.85,45.92],[7.5,45.95],[7.05,45.9],[6.8,46.1],[6.9,46.35],[6.5,46.45],[6.3,46.3]];
const CITIES = { geneve: [6.14,46.2], genf: [6.14,46.2], geneva: [6.14,46.2], ginevra: [6.14,46.2], lausanne: [6.63,46.52], losanna: [6.63,46.52], vevey: [6.84,46.46], montreux: [6.91,46.43], fribourg: [7.16,46.8], freiburg: [7.16,46.8], friburgo: [7.16,46.8], neuchatel: [6.93,46.99], neuenburg: [6.93,46.99], bienne: [7.25,47.14], biel: [7.25,47.14], berne: [7.45,46.95], bern: [7.45,46.95], berna: [7.45,46.95], thoune: [7.63,46.76], thun: [7.63,46.76], bale: [7.59,47.56], basel: [7.59,47.56], basilea: [7.59,47.56], zurich: [8.54,47.38], zurigo: [8.54,47.38], winterthur: [8.72,47.5], winterthour: [8.72,47.5], lucerne: [8.31,47.05], luzern: [8.31,47.05], lucerna: [8.31,47.05], 'saint-gall': [9.37,47.42], 'st. gallen': [9.37,47.42], 'san gallo': [9.37,47.42], coire: [9.53,46.85], chur: [9.53,46.85], coira: [9.53,46.85], lugano: [8.95,46.0], bellinzona: [9.02,46.19], locarno: [8.8,46.17], sion: [7.36,46.23], sitten: [7.36,46.23], sierre: [7.53,46.29], martigny: [7.07,46.1], bulle: [7.06,46.62], yverdon: [6.64,46.78], nyon: [6.24,46.38], morges: [6.5,46.51], delemont: [7.35,47.36], 'la chaux-de-fonds': [6.83,47.1], aarau: [8.04,47.39], zoug: [8.52,47.17], zug: [8.52,47.17], schaffhouse: [8.63,47.7], schaffhausen: [8.63,47.7], olten: [7.91,47.35], soleure: [7.54,47.21], solothurn: [7.54,47.21], davos: [9.84,46.8], interlaken: [7.86,46.69], ascona: [8.77,46.16], meyrin: [6.08,46.23], carouge: [6.14,46.18], renens: [6.59,46.53], gland: [6.27,46.42] };
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
const proj = ([lon, lat]) => [((lon - 5.9) * 100).toFixed(1), ((47.85 - lat) * 146).toFixed(1)];
function cityXY(name) { const n = norm(name); const k = Object.keys(CITIES).find(c => n === c || n.startsWith(c) || c.startsWith(n.split(/[ -]/)[0]) && n.length > 3); return proj(CITIES[k] || [7.45, 46.95]); }

function ui(V, step) {
  const items = list(V.items); const chips = list(V.chips);
  const rows = items.length ? items.map(it => `<div class="sv-row">${CHECK}<span>${esc(it)}</span></div>`).join('')
    : `<div class="sv-line" style="--w:92%"></div><div class="sv-line" style="--w:70%"></div><div class="sv-line" style="--w:82%"></div>`;
  return `<div class="sv sv-ui"><div class="sv-ui__bar"><span></span><span></span><span></span><i>${esc(V.url || step.label || '')}</i></div>
  <div class="sv-ui__body"><div class="sv-ui__head"><strong>${esc(V.title || step.title || '')}</strong>${badge(V.badge)}</div>${rows}
  ${chips.length ? `<div class="sv-chips">${chips.map(c => `<span>${esc(c)}</span>`).join('')}</div>` : ''}
  ${V.bar != null ? `<div class="sv-bar" style="--v:${Math.max(0, Math.min(100, +V.bar))}%"><i></i></div>${V.bar_label ? `<small>${esc(V.bar_label)}</small>` : ''}` : ''}</div></div>`;
}
function listV(V, step) {
  const items = list(V.items);
  return `<div class="sv sv-list">${V.title ? `<strong class="sv-title">${esc(V.title)}</strong>` : ''}<ol>${items.map((it, i) => `<li><b>${String(i + 1).padStart(2, '0')}</b><span>${esc(it)}</span>${CHECK}</li>`).join('')}</ol></div>`;
}
function chart(V) {
  const s = list(V.series).filter(x => x && x.label != null); const max = Math.max(1, ...s.map(x => +x.value || 0));
  const W = 320, H = 190, pad = 24, bw = s.length ? (W - pad * 2) / s.length : 0;
  let body = '';
  if (V.type === 'line') {
    const pts = s.map((x, i) => [pad + bw * i + bw / 2, 30 + (1 - (+x.value || 0) / max) * (H - 70)]);
    body = `<path class="sv-chart__area" d="M${pts[0][0]},${H - 40} ${pts.map(p => `L${p[0]},${p[1]}`).join(' ')} L${pts[pts.length - 1][0]},${H - 40}Z"/><polyline class="sv-chart__line" points="${pts.map(p => p.join(',')).join(' ')}"/>${pts.map(p => `<circle class="sv-chart__dot" cx="${p[0]}" cy="${p[1]}" r="4"/>`).join('')}`;
  } else {
    body = s.map((x, i) => { const h = ((+x.value || 0) / max) * (H - 70); const x0 = pad + bw * i + bw * .2; return `<rect class="sv-chart__bar${x.hot ? ' is-hot' : ''}" x="${x0.toFixed(1)}" y="${(H - 40 - h).toFixed(1)}" width="${(bw * .6).toFixed(1)}" height="${h.toFixed(1)}" rx="4"/><text class="sv-chart__val" x="${(x0 + bw * .3).toFixed(1)}" y="${(H - 46 - h).toFixed(1)}" text-anchor="middle">${esc(x.value)}${esc(V.unit || '')}</text>`; }).join('');
  }
  const labels = s.map((x, i) => `<text class="sv-chart__lab" x="${(pad + bw * i + bw / 2).toFixed(1)}" y="${H - 18}" text-anchor="middle">${esc(x.label)}</text>`).join('');
  return `<div class="sv sv-chart">${V.title ? `<div class="sv-ui__head"><strong>${esc(V.title)}</strong>${badge(V.badge)}</div>` : ''}<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(V.title || '')}"><line class="sv-chart__axis" x1="${pad}" y1="${H - 40}" x2="${W - pad}" y2="${H - 40}"/>${body}${labels}</svg></div>`;
}
function steps(V) {
  const items = list(V.items); const done = V.done == null ? Math.ceil(items.length / 2) : +V.done;
  return `<div class="sv sv-steps">${V.title ? `<strong class="sv-title">${esc(V.title)}</strong>` : ''}<ol>${items.map((it, i) => `<li class="${i < done ? 'is-done' : i === done ? 'is-now' : ''}"><span class="sv-steps__dot">${i < done ? CHECK : i + 1}</span><span>${esc(it)}</span></li>`).join('')}</ol></div>`;
}
function quote(V) { return `<blockquote class="sv sv-quote"><span class="sv-quote__mark" aria-hidden="true">“</span><p>${esc(V.text)}</p>${V.author ? `<footer>${esc(V.author)}</footer>` : ''}</blockquote>`; }
function map(V, step, ctx) {
  const city = V.city || (ctx.company.contact && ctx.company.contact.city) || 'Berne'; const [x, y] = cityXY(city);
  const d = CH.map((p, i) => (i ? 'L' : 'M') + proj(p).join(',')).join(' ') + 'Z';
  return `<div class="sv sv-map"><svg viewBox="-10 -10 485 320" role="img" aria-label="${esc(V.label || city)}"><path class="sv-map__land" d="${d}"/><circle class="sv-map__pulse" cx="${x}" cy="${y}" r="16"/><circle class="sv-map__dot" cx="${x}" cy="${y}" r="6"/></svg><b class="sv-badge sv-map__label" style="--x:${(x / 465 * 100).toFixed(1)}%;--y:${(y / 300 * 100).toFixed(1)}%">${esc(V.label || city)}</b></div>`;
}
function calendar(V) {
  const n = +V.days_in_month || 30; const on = new Set(list(V.days).map(Number)); const first = ((+V.first_weekday || 1) - 1 + 7) % 7;
  const cells = Array.from({ length: first }, () => '<span class="is-empty"></span>').concat(Array.from({ length: n }, (_, i) => `<span class="${on.has(i + 1) ? 'is-on' : ''}">${i + 1}</span>`)).join('');
  return `<div class="sv sv-cal"><div class="sv-ui__head"><strong>${esc(V.month || '')}</strong>${badge(V.label)}</div><div class="sv-cal__grid">${cells}</div></div>`;
}
function stat(V, step) {
  const v = V.value ?? V.number; const bar = V.bar != null ? `<div class="sv-bar" style="--v:${Math.max(0, Math.min(100, +V.bar))}%"><i></i></div>` : '';
  return `<div class="sv sv-stat"><b class="story__num">${esc(v)}</b>${V.label || step.label ? `<strong>${esc(V.label || step.label)}</strong>` : ''}${V.sub ? `<span>${esc(V.sub)}</span>` : ''}${bar}</div>`;
}
function iconV(V, step) { return `<div class="sv sv-icon"><span class="sv-icon__ring" aria-hidden="true"></span><span class="story__ico">${icon(V.icon || 'sparkles')}</span>${V.label || step.label ? `<strong>${esc(V.label || step.label)}</strong>` : ''}</div>`; }

export function visual(V, step, ctx, i) {
  V = V || {};
  const kind = V.kind || (V.image ? 'image' : (V.number != null || V.value != null) ? 'stat' : V.icon ? 'icon' : 'ui');
  if (kind === 'image') return `<img src="${esc(V.image)}" alt="${esc(V.alt || '')}" loading="${i === 0 ? 'eager' : 'lazy'}" decoding="async">`;
  const f = { ui, list: listV, chart, steps, quote, map, calendar, stat, icon: iconV }[kind] || ui;
  return f(V, step || {}, ctx || { company: {} });
}
