// Les thèmes de la home : src/themes/<nom>/theme.yaml (tokens, polices, ordre des sections, mouvement) + theme.css.
// Chargés par Vite au build (import.meta.glob), donc résolus depuis src/ quel que soit le cwd — contrairement aux YAML de la
// compagnie, lus par site.js depuis process.cwd(). Les polices passent par le pipeline d'assets (?url) : copiées et hachées
// dans dist/_astro/, et propagées avec src/ par kit-sync / _ensure_pages_kit.
import yaml from 'js-yaml';
const yamls = import.meta.glob('./*/theme.yaml', { eager: true, query: '?raw', import: 'default' });
const csses = import.meta.glob('./*/theme.css', { eager: true, query: '?inline', import: 'default' });
const fonts = import.meta.glob('../assets/fonts/*.woff2', { eager: true, query: '?url', import: 'default' });

export const DEFAULT_THEME = 'atelier';
export const THEMES = {};
for (const [p, raw] of Object.entries(yamls)) {
  const name = p.split('/')[1];
  const t = yaml.load(raw) || {};
  t.name = name; t.css = csses[`./${name}/theme.css`] || '';
  THEMES[name] = t;
}
export const THEME_NAMES = Object.keys(THEMES).sort();
export function getTheme(name) { return THEMES[name] || THEMES[DEFAULT_THEME] || THEMES[THEME_NAMES[0]]; }
export function fontUrl(file) { return fonts[`../assets/fonts/${file}`] || null; }

/** @font-face de chaque fichier du thème + variables --font-display / --font-text. */
export function fontCss(theme) {
  let out = '';
  const fam = {};
  for (const role of ['display', 'text']) {
    const f = (theme.fonts || {})[role]; if (!f) continue;
    for (const x of f.files || []) {
      const url = fontUrl(x.file); if (!url) continue;
      out += `@font-face{font-family:"${f.family}";font-style:${x.style || 'normal'};font-weight:${x.weight || 400};font-display:swap;src:url(${url}) format("woff2")}`;
    }
    fam[role] = `"${f.family}",${f.fallback || (role === 'display' ? 'Georgia,serif' : 'system-ui,sans-serif')}`;
  }
  return out + `:root{--font-display:${fam.display || fam.text || 'Georgia,serif'};--font-text:${fam.text || 'system-ui,sans-serif'}}`;
}

/** Tokens CSS du thème (--c-*, rayons, ombre) ; `accent` de company.yaml remplace l'accent du thème. */
export function tokenCss(theme, accent) {
  const c = Object.assign({}, theme.colors || {});
  if (accent) c.accent = accent;
  const vars = Object.entries(c).map(([k, v]) => `--c-${k}:${v}`).join(';');
  const r = theme.radius || {}; const sh = theme.shadow || 'none';
  return `:root{${vars};--r-card:${r.card || '16px'};--r-btn:${r.btn || '999px'};--shadow:${sh};color-scheme:${theme.mood === 'dark' ? 'dark' : 'light'}}`;
}
