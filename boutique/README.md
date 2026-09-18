# Kit MyAiCompany « Boutique »

Site statique d'une compagnie (Astro). Le client ne touche jamais ce dépôt à la main :
- `company.yaml` — identité, contact, mentions légales (édité depuis la Centrale du deck)
- `catalog.json` — le catalogue (produits actifs de la Mairie), récupéré par le builder à chaque build
- `content.yaml` — textes des pages (formulaires du deck, ou agent sur branche → aperçu → validation)
- `public/images/` — photos

Le formulaire de contact poste sur `/api/public/leads` (proxifié par nginx vers maic-core avec le slug de la compagnie) : chaque message devient un prospect au Marché.
Pages générées : accueil, contact, mentions légales, confidentialité (LPD). Build : `npm ci && npm run build` → `dist/`.
