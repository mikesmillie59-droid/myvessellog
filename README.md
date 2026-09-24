# My Vessel Apps website

This repository contains the website for **My Vessel Apps**, with two products:

- **My Vessel Log** — maintenance records and reminders, available worldwide.
- **My Helm — New Zealand Edition** — a supplementary navigation and anchor-watch app for New Zealand waters.
- **My Vessel Complete** — both apps bundled together.

## Website files

- `index.html` — public homepage and pricing page.
- `welcome.html` — post-purchase page for My Vessel Log.
- `welcome-helm.html` — post-purchase page for My Helm.
- `welcome-complete.html` — post-purchase page for the bundle.
- `my-helm-nz.png` — My Helm screenshot used on the homepage.
- `CNAME` — keeps the GitHub Pages domain set to `myvessellog.com`.

## Stripe payment links

The three purchase buttons are deliberately inactive until the new Stripe Payment Links are ready. In `index.html`, search for `STRIPE PLACEHOLDER`. Each marked block explains which button it belongs to.

For each button:

1. Replace `href="#"` with its Stripe Payment Link.
2. Remove the `data-stripe-placeholder="..."` attribute.
3. In Stripe, set the successful-payment redirect to the matching page below.

| Product | Price | Suggested success URL |
| --- | ---: | --- |
| My Vessel Log | US$29 one time | `https://myvessellog.com/welcome.html` |
| My Helm — New Zealand Edition | US$29 one time | `https://myvessellog.com/welcome-helm.html` |
| My Vessel Complete | US$49 one time | `https://myvessellog.com/welcome-complete.html` |

Until those edits are made, clicking a purchase button displays a short “payment link coming soon” message and cannot open an accidental checkout.

## Publishing on GitHub Pages

Upload the files to the root of the `myvessellog` repository. Keep `CNAME` unchanged. GitHub Pages will publish the new homepage at `https://myvessellog.com/`.

## My Helm availability and safety wording

My Helm is presented as a **New Zealand Edition** because it uses LINZ chart imagery. The website also explains that LINZ charts need an internet connection, while the app's GPS tools, Anchor Watch and saved places can continue once the app has loaded offline.

My Helm is a supplementary reference aid. It is not a substitute for official charts, a compliant chartplotter, prudent watchkeeping or a dedicated anchor alarm.
