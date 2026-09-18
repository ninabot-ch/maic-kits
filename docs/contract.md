# The kit contract

What the platform guarantees to a kit, and what a kit must guarantee to the platform.

## Inputs written by the platform

`company.yaml` (identity, written from the deck's "Centrale"):

```yaml
name: Lumen Atelier
slug: lumen-atelier          # subdomain: <slug>.myaicompany.ch
tagline: {fr: "…", en: "…"}
lang: fr                     # default language, served at the root
langs: [fr, en]              # published languages
accent: "#C98B3A"
contact: {email: "…", phone: "", city: "…"}
legal:
  responsible: Alex Morel    # the person, when no registered company
  address: Lausanne, Suisse
  registered: false          # true → registered company (IDE below)
  ide: ""
social: {}
shop:                        # boutique kit only
  shipping_chf: 900          # cents
  free_from_chf: 8000
  pickup: true
```

`content.yaml`: page texts, keyed by language (`fr:`, `en:`). Written by the deck forms or
by an agent on a branch. Keys are defined by the kit and documented in its README.

`catalog.json` (boutique kit): written by the builder just before `npm run build` from the
company's active products: `{ "products": [{id, name, price_cents, stock, images, …}],
"company": {"online_payment": true|false} }`.

## Build

```
npm ci --ignore-scripts && npm run build   →   dist/
```

Non-root user, no network, 2 vCPU / 2 GB, 60 s budget. `dist/` is copied atomically to the
web root. Files like `company.yaml`, `catalog.json` and `.git` are never served.

## Runtime endpoints available to the site (same origin)

| Endpoint | Body | Effect |
|---|---|---|
| `POST /api/public/leads` | `{name, email, msg, consent, hp}` | becomes a prospect in the owner's "Marché"; acknowledgement e-mail sent |
| `POST /api/public/checkout` | basket + customer details + delivery mode | creates a customer and an order; returns a Stripe Checkout URL when online payment is enabled, otherwise an offline order |
| `GET /api/public/products` | — | active catalogue (used by the builder, usable at runtime) |

Rate limits apply per visitor IP. Responses are JSON; the kit shows `f_ok` / `f_err` strings
from its `UI` table.

## What the platform adds around the site

`/deck/` (the owner's back-office) on the same host, security headers (CSP frame-ancestors,
HSTS, nosniff), the "coming soon" page while no build exists, and the custom domain once the
owner registers one from the deck.
