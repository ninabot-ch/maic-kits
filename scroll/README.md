# Kit MyAiCompany « scroll » — une base, dix thèmes

Site statique d'une compagnie (Astro 5, sans framework côté client) dont la **page d'accueil est composée de sections au
défilement** : scène collante, rail de cartes épinglées, révélations pilotées par la progression — au niveau technique de la
home ninjob.ch (méthode `refontes-scroll-2026-09`). L'apparence est choisie par `company.yaml → theme:` parmi dix thèmes.
Le kit est un **superset du kit `vitrine`** : toutes ses pages et capacités sont conservées (contact, avis, agenda,
boutique sous `/shop/`, pages libres `/p/<slug>/`, pages légales), mêmes clés de contenu, mêmes endpoints `/api/public/*`.

Le client ne touche jamais ce dépôt à la main :
- `company.yaml` — identité, contact, mentions légales, **`theme:`** (édité depuis la Centrale du deck) ;
- `content.yaml` — textes des pages par langue (formulaires du deck, ou agent sur branche → aperçu → validation) ;
- `catalog.json` — écrit par la plateforme avant le build (produits, avis publiés, agenda) ;
- `public/images/` — photos du client (jamais propagées par `kit-sync`).

Build : `npm ci --ignore-scripts && npm run build` → `dist/`. Sans réseau, < 60 s, 2 vCPU / 2 Go. Aucune police ni script
distant : les polices sont des woff2 (sous-ensemble latin, licences OFL) dans `src/assets/fonts/`, passées par le pipeline
d'assets d'Astro (`?url`) donc copiées et hachées dans `dist/_astro/` — une compagnie mise à niveau par `kit-sync.sh`
(qui ne pousse que `src/`, `astro.config.mjs`, `package*.json`) reçoit aussi ses polices. `public/` ne porte que
`favicon.svg`, `robots.txt` et les images du client.

## Arborescence

```
kits/scroll/
├── company.yaml · content.yaml      échantillon « atelier » (compagnie fictive) — le kit build tel quel
├── src/site.js                      lecture des YAML + catalog.json, UI fr/en/de/it, thème actif (exports du kit vitrine conservés)
├── src/layouts/Base.astro           <head> (hreflang, JSON-LD, og), polices, tokens du thème, en-tête, pied de page
├── src/engine/                      le moteur de la home
│   ├── Home.astro                   compose les sections dans l'ordre du thème (clé absente = section absente)
│   ├── HeroMedia · Story · Rail · Split · Proof · Reviews · Pricing · Gallery · FAQ · CTA (.astro)
│   ├── scroll.js                    progression par section (getBoundingClientRect + rAF + lerp), vidéo du hero, compteurs
│   ├── motion.css                   signatures de mouvement (rise, curtain, slide, zoom, letters, float) pilotées par --p
│   └── icons.js                     ~24 pictogrammes SVG inline (Story.visual.icon, Rail, Split)
├── src/themes/index.js              charge src/themes/<nom>/theme.yaml + theme.css + polices
├── src/themes/<nom>/theme.yaml      palette, polices, rayons, ordre et variantes des sections, hero, mouvement
├── src/themes/<nom>/theme.css       ce qui fait le thème au-delà des tokens
├── src/assets/fonts/*.woff2         polices embarquées (scripts/fonts.py les régénère depuis google/fonts)
├── src/components/                  ContactForm, Basket (kit vitrine)
├── src/pages/[...lang]/…            index, contact, avis, reserver, cgv, mentions-legales, confidentialite, shop/*, p/[slug]
├── samples/<thème>/                 company.yaml + content.yaml d'une compagnie FICTIVE par thème (démo, captures)
└── scripts/                         build-samples.sh (build + mesures par thème), shots.mjs (captures), fonts.py
```

## `company.yaml`

Comme le kit vitrine (`name`, `slug`, `tagline{fr,en,de,it}`, `lang`, `langs`, `accent`, `contact`, `legal`, `social`, `shop`),
plus :

```yaml
theme: atelier        # atelier | studio | clinique | cabinet | table | terrain | boutique-mode | tech | nature | scene (défaut : atelier)
```

`accent` reste la couleur d'accent : elle remplace celle du thème (chaque thème a la sienne par défaut).

## `content.yaml` — les clés, par langue

Les clés du kit vitrine sont inchangées et suffisent : `hero{title,text,cta}`, `services_title`, `services[]{title,text}`, `about{title,text}`,
`shop{title,text,cta,add,soldout}`, `gallery{title,text,items[]{src,alt}}`, `contact{title,text}`, `pages{<slug>…}`.
Le Studio (`site.text`, `site.images`, `site.page`) écrit ces clés ; une langue partiellement traduite retombe sur la langue principale.

Clés **optionnelles** du moteur — une clé absente = la section n'existe pas (rien de démonstratif ne fuit) :

| clé | section | contenu |
|---|---|---|
| `hero.kicker` | HeroMedia | surtitre (défaut : la tagline) ; `hero.cta_href` (défaut `/contact/`), `hero.cta2`, `hero.cta2_href` |
| `hero.media` | HeroMedia | `video` (mp4), `webm`, `poster`, `video_portrait`, `webm_portrait`, `poster_portrait` — chemins `/api/public/media/<id>` ou `/images/…`. Muette, en boucle, `playsinline`, montée par JS seulement ; jamais sous `prefers-reduced-motion` ni `saveData`. Sur mobile, seulement si `video_portrait` existe. |
| `hero.image` | HeroMedia | image fixe (repli de la vidéo) ; sans image ni vidéo : fond du thème |
| `services[].detail`, `.price`, `.icon` | Rail | détail dépliable (`<details>` natif), prix affiché, pictogramme (nom du jeu d'icônes) |
| `story` | Story | `{kicker, title, text, steps[]{label, title, text, visual}}` — `visual.kind` : voir le tableau des compositions ci-dessous |
| `split` | Split | `[{title, text, image?, alt?, icon?, cta?, href?}]` texte + visuel alternés ; `about` est rendu par la même section |
| `proof` | Proof | `{title?, text?, items[]{value, label, note?}}` — chiffres **fournis par le client**, jamais inventés |
| `pricing` | Pricing | `{title, text?, note?, items[]{name, price, unit?, text?, features[], cta?, href?, featured?}}` |
| `faq` | FAQ | `{title, text?, items[]{q, a}}` |
| `cta` | CTA | `{title, text?, button, href?}` (défaut `/contact/`) |

### Les compositions de la scène (`story.steps[].visual`)

Le cadre collant montre, à chaque temps, une composition **construite par le moteur en HTML/SVG à partir du YAML**
(`src/engine/visuals.js`) — jamais d'image générée. Tous les libellés viennent du temps, donc sont traduits ; le thème habille
(`.sv-*`), le contenu compose. `kind` absent : `image` si `image`, `stat` si `number`/`value`, `icon` si `icon`, sinon `ui`.

| `kind` | clés | rendu |
|---|---|---|
| `ui` | `url?, title?, badge?, items[]?, chips[]?, bar? (0-100), bar_label?` | faux écran produit : barre de fenêtre, lignes cochées, pastilles, barre de progression |
| `list` | `title?, items[]` (3 idéalement) | trois cartes numérotées, décalées |
| `chart` | `title?, badge?, unit?, type: bars\|line, series[]{label, value, hot?}` | diagramme SVG normalisé (barres ou courbe), valeurs affichées |
| `steps` | `title?, items[], done?` | chronologie verticale, étapes faites / en cours / à venir |
| `quote` | `text, author?` | citation en grand, guillemet du thème |
| `map` | `city? (défaut company.contact.city), label?` | contour simplifié de la Suisse, point pulsé sur la ville (≈ 60 villes connues, repli Berne) |
| `calendar` | `month?, label?, days[], first_weekday? (1 = lundi), days_in_month?` | grille du mois, jours mis en avant |
| `stat` | `value` (ou `number`), `label?, sub?, bar?` | chiffre géant, légende, jauge |
| `icon` | `icon, label?` | pictogramme du jeu d'icônes sur anneaux (repli) |
| `image` | `image, alt` | photo du client (`/images/…`) |

`caption` (sur `visual`) ajoute une légende en bas du cadre, quel que soit le `kind`.

Les avis (`Reviews`) viennent de `catalog.json` (avis publiés par la compagnie), pas de `content.yaml`.
Tout texte d'interface (navigation, boutons génériques, libellés des formulaires, pages légales) vient de la table `UI`
de `src/site.js` en fr/en/de/it.

## Le moteur (`src/engine/`)

- **État de repos correct sans JS** : chaque section est complète et lisible avant que `scroll.js` ne tourne (`var(--p, 1)`) ;
  aucun `opacity: 0` sans repli. `prefers-reduced-motion: reduce` → le script ne fait rien (et la vidéo n'est pas montée).
- **`scroll.js`** (un module, ~150 lignes) : pour chaque `[data-scroll]`, une progression 0→1 mesurée par `getBoundingClientRect`
  sur `scroll`/`resize`, lissée par un lerp dans `requestAnimationFrame`, écrite dans la variable CSS `--p` de la section et,
  pour les sections à temps (`data-steps`), dans `data-step` + classes `is-active`. Modes : `pin` (section haute, contenu
  `position: sticky` natif), `reveal` (entrée dans la fenêtre), `hero` (sortie du hero). Le rail mesure son débattement
  (`--travel`) ; les chiffres `[data-count]` comptent une fois à l'entrée.
- **Transform / opacity uniquement**, `position: sticky` natif — jamais de pin JS, jamais de conteneur translaté au-dessus d'un
  sticky, aucune lib d'animation, aucune physique.
- **Signatures de mouvement** (`motion.css`, choisie par `theme.motion`) : `rise` (papier posé), `curtain` (rideau vertical),
  `slide` (glissement latéral alterné), `zoom` (zoom lent des visuels), `letters` (apparition mot à mot des titres), `float`
  (flottement organique). Le hero a en plus une **entrée orchestrée** au chargement (kicker → titre → texte → boutons, média
  qui glisse) et, par thème, un **fond vivant en CSS pur** (halos qui dérivent, grille en perspective, feuilles qui respirent,
  faisceaux néon, soleil et collines, hachures qui défilent…) — coupé sous `prefers-reduced-motion` avec le reste.

## Les thèmes (`src/themes/<nom>/`)

`theme.yaml` : `label`, `mood` (light|dark), `fonts.display/text` (famille, fichiers woff2, graisses — 2 familles au plus),
`colors` (tokens `--c-*`), `radius`, `shadow`, `hero` (`editorial` deux colonnes | `full` plein écran | `type` typo géante),
`motion`, `sections` (ordre de la home), `variants` (ex. `rail: pinned|grid`, `proof: band|cards`). `theme.css` porte le reste :
matière du hero sans média, forme des cartes, en-tête, détails. `src/themes/index.js` les expose (`getTheme(name)`, `THEMES`).

| thème | pour | polices | hero | mouvement |
|---|---|---|---|---|
| `atelier` | artisanat, métiers d'art | Fraunces 600 · Manrope 400/700 | éditorial : feuilles posées qui respirent, initiale gravée | rise · rail épinglé · chiffres en bandeau |
| `studio` | création, design, agences | Syne 800 · Inter 400/500 | typo géante noire, dernier mot au trait, hachures, halo acide | letters · rail épinglé · carte tarif jaune |
| `clinique` | santé, bien-être | Outfit 600 · DM Sans 400/600 | éditorial : galet vert, formes rondes | zoom · services en grille · chiffres en cartes |
| `cabinet` | conseil, juridique, finance | Playfair Display 600 · IBM Plex Sans 400/600 | éditorial : plaque nuit et or, filets | slide · rail épinglé · bandeau |
| `table` | restaurant, café, traiteur | DM Serif Display · Work Sans 400/600 | plein cadre : braise ocre, grain | zoom · rail épinglé · galerie |
| `terrain` | bâtiment, artisans techniques | Barlow Condensed 700 · Barlow 400/600 | typo géante condensée, grille de plan, hachures orange/noir qui défilent | curtain · cartes carrées ombre dure |
| `boutique-mode` | mode, beauté, éditorial | Cormorant Garamond 600 / italique 500 · Jost 400 | éditorial : cadre 3:4 hairline, initiale italique, lumière qui glisse | curtain · services en grille · rayons 0 |
| `tech` | SaaS, dev, produit | Sora 700 · Inter 400/500 | plein écran : nébuleuse violet/cyan qui dérive, grille en perspective | rise · cadre de scène = fenêtre d'app, verre |
| `nature` | agri, outdoor, tourisme | Lora 600 · Nunito 400/700 | plein écran : ciel, soleil, collines, bord arrondi | float · formes organiques |
| `scene` | événementiel, musique, associations | Bebas Neue · Rubik 400/600 | typo géante néon magenta/cyan, faisceaux, scintillement | letters · lueurs |

## Échantillons et scripts

`samples/<thème>/{company.yaml,content.yaml}` : une compagnie **fictive** suisse par thème, quatre langues, textes courts.
Aucun chiffre n'y est présenté comme mesuré sur une vraie entreprise. Le `company.yaml`/`content.yaml` à la racine du kit
= l'échantillon `atelier`.

- `scripts/build-samples.sh [thème…]` — pour chaque thème : copie l'échantillon à la place des YAML, `npm run build`, mesure le
  temps (< 60 s) et le poids de la home (`index.html` + CSS/JS/polices référencés, ≤ 300 Ko hors vidéo/images), vérifie les
  pages du contrat, puis restaure les YAML de la racine.
- `scripts/shots.mjs [thème…]` — `astro preview` + Playwright (chromium du frontend ninjob, `PW_ROOT`) : captures desktop
  1440×900 à trois positions de défilement et mobile 390×844, dans `SHOTS_DIR`.
- `scripts/fonts.py` — régénère les woff2 (réseau, développement seulement).
- `scripts/yaml-fix.py <fichiers>` — cite les scalaires YAML qui contiennent « : » et vérifie que chaque fichier se charge.

⚠️ Dans les échantillons, pas de virgule dans un élément de séquence en accolades/crochets sans le citer (`items: ["a, b", c]`).

## Ce que la plateforme doit savoir

- Nom de kit à déclarer : `scroll` (`api/join.py`, `api/connectors/site.py` — listes fermées `("vitrine","boutique")`).
- `_ensure_pages_kit` pousse tout `src/` en bloc : le moteur, les thèmes **et les polices** vivent sous `src/`, jamais dans un dossier frère.
- `samples/` n'est jamais propagé (hors `src/`) ; `scripts/` non plus.
- Le contrôle anti-démo du Studio (`check_site`) refuse « lumen », « lampe », « lamp », « bois récupéré » : aucun échantillon ne les contient.
