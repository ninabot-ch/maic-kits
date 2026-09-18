# maic-kits — site kits for MyAiCompany companies

[Français plus bas](#français)

**MyAiCompany** (myaicompany.ch) lets anyone start a company and run it from a living
"city" of AI agents. Every company gets a website. That website is built from one of the
**kits** in this repository: an [Astro](https://astro.build) project that turns two YAML
files (`company.yaml`, `content.yaml`) and, for shops, a `catalog.json`, into a static site
published at `<slug>.myaicompany.ch` or on the company's own domain.

The company owner never edits a kit by hand. The platform forks the kit into a private
repository per company, writes the YAML from the back-office ("deck"), rebuilds on every
push and publishes the result. Agents propose content on branches; the owner previews and
approves.

| Kit | Pages | For |
|---|---|---|
| [`vitrine/`](vitrine) | home, contact, legal notice, privacy (Swiss FADP) | a service, a craft, a freelancer |
| [`boutique/`](boutique) | vitrine + shop, product page, basket, thank-you, terms of sale | selling a few products, TWINT / card or pay-later |

Both kits are **bilingual by design** (FR + EN, default language at the root, the other
under `/en/` or `/fr/`, `hreflang` set), ship the legal pages Swiss law expects, and post
forms to the platform API (`/api/public/leads`, `/api/public/checkout`), which is proxied
next to the site. See [`docs/contract.md`](docs/contract.md) for the exact contract a kit
must honour.

## Try a kit locally

```bash
cd vitrine
npm ci --ignore-scripts
npm run dev        # http://localhost:4321 — uses the sample company.yaml / content.yaml
npm run build      # → dist/
```

The sample company (Lumen Atelier) is fictional.

## Contributing a kit

New kinds of companies need new kits: services with booking, events, digital products,
restaurants, associations… Read [`CONTRIBUTING.md`](CONTRIBUTING.md), copy `vitrine/`,
keep the contract, open a pull request. Kits merged here are offered to every MyAiCompany
company. Licence: MIT.

The platform core (ledger, agents runtime, back-office) is not in this repository.

---

## Français

Ce dépôt contient les **kits de site** de MyAiCompany : des projets Astro qui transforment
`company.yaml`, `content.yaml` (et `catalog.json` pour une boutique) en site statique publié
sur `<slug>.myaicompany.ch` ou sur le domaine de la compagnie. Le client ne touche jamais au
kit : la plateforme le forke dans un dépôt privé par compagnie, écrit les YAML depuis le deck,
rebâtit à chaque push. Les agents proposent du contenu sur des branches, le client valide.

- `vitrine/` : accueil, contact, mentions légales, confidentialité (LPD).
- `boutique/` : vitrine + boutique, fiche produit, panier, merci, CGV.

FR + EN obligatoires, pages légales suisses incluses, formulaires vers l'API de la plateforme.
Contrat détaillé dans `docs/contract.md`, règles de contribution dans `CONTRIBUTING.md`.
Licence MIT. Le cœur de la plateforme n'est pas ici.
