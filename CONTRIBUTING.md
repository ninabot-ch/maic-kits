# Contributing a kit

A kit is an Astro project that builds a company site from data the platform writes. The
platform runs, as an unprivileged user, in a container without network access at build time:

```bash
npm ci --ignore-scripts
npm run build          # must produce dist/ in under 60 s on 2 vCPU / 2 GB
```

## Rules a kit must follow

1. **Data in, site out.** Everything company-specific comes from `company.yaml`,
   `content.yaml` and (shops) `catalog.json`, read with `process.cwd()` at build time
   (`src/site.js` shows how). Never hard-code a company.
2. **FR and EN from day one.** `content.yaml` is keyed by language. The default language
   (`company.lang`) is served at the root, the other under `/<lang>/`. Every UI string of
   the kit itself lives in the `UI` table of `src/site.js`, in both languages. `hreflang`
   and `x-default` on every page.
3. **Legal pages are not optional.** Legal notice (handles the unregistered individual
   case), privacy page (Swiss FADP wording), terms of sale for anything that sells.
4. **Forms go to the platform.** Leads: `POST /api/public/leads`. Orders:
   `POST /api/public/checkout`. Same-origin, no keys in the kit, honeypot field and consent
   checkbox kept. Never call a third party from the browser without a documented reason.
5. **No tracking.** No analytics snippet, no cookies, no external fonts or CDNs. Ship what
   you use.
6. **No `postinstall`, no native modules, no network at build.** Dependencies are reviewed;
   keep them to Astro + js-yaml unless you can justify more.
7. **Accessible and light.** Semantic HTML, contrast, keyboard-usable forms, works on a
   phone. A page should stay under 200 kB before images.
8. **`README.md` in the kit** says what it is for, which YAML keys it reads (with an
   example), and what it does not do.

## Proposing

Open an issue first with the kind of company you have in mind and the pages you plan.
Then copy `vitrine/`, rename, implement, and open a pull request. A maintainer builds it
against the sample data, checks the rules above, and once merged the kit becomes available
to every company on the platform.

By contributing you agree your code is released under the MIT licence of this repository.
