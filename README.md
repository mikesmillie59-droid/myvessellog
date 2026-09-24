# My Vessel Apps website

This is the multi-page website for **My Vessel Apps**, hosted with GitHub Pages at `myvessellog.com`.

## Main pages

- `index.html` — short umbrella-brand homepage.
- `maintenance.html` — My Vessel Log product page and maintenance demo link.
- `helm.html` — My Helm New Zealand Edition product page.
- `pricing.html` — US$29 / US$29 / US$49 pricing and Stripe placeholders.
- `helm-demo.html` — safe simulated Helm demonstration; it never requests GPS or triggers real alarms.
- `welcome.html` — post-purchase page for My Vessel Log.
- `welcome-helm.html` — post-purchase page for My Helm.
- `welcome-complete.html` — post-purchase page for the bundle.

## Shared assets

- `styles.css` — shared website styling.
- `site.js` — mobile navigation, year and safe Stripe-placeholder behaviour.
- `helm-demo.css` and `helm-demo.js` — simulated demonstration styling and behaviour.
- `my-vessel-logo.svg` — sharp website logo.
- `my-vessel-logo.png` — transparent 512px logo fallback.
- `my-helm-nz.png` — product screenshot.
- `CNAME` — keeps the GitHub Pages domain set to `myvessellog.com`.

## Stripe payment links

The three purchase buttons are deliberately inactive. In `pricing.html`, search for `STRIPE PLACEHOLDER`.

For each marked button:

1. Replace `href="#"` with its Stripe Payment Link.
2. Remove the `data-stripe-placeholder="..."` attribute.
3. Configure the matching Stripe success URL.

| Product | Price | Stripe success URL |
| --- | ---: | --- |
| My Vessel Log | US$29 one time | `https://myvessellog.com/welcome.html` |
| My Helm — New Zealand Edition | US$29 one time | `https://myvessellog.com/welcome-helm.html` |
| My Vessel Complete | US$49 one time | `https://myvessellog.com/welcome-complete.html` |

Until those edits are made, a purchase-button click only displays a short “payment link still needs to be added” message.

## Publishing

Upload every file in this package to the root of the GitHub repository `mikesmillie59-droid/myvessellog`, replacing files with the same names. Keep `CNAME` unchanged.

## My Helm demonstration and safety

The demo uses a stylised sample map, fictional coordinates and simulated movement at 8 knots. It does not request GPS, notification, audio or persistent-storage permission. Saved Places filters control both the sample map and list, while simulated proximity-alert logic remains active for hidden categories. Anchor Watch is demonstrated independently.

My Helm is a supplementary reference aid. It is not a substitute for current official charts, compliant navigation equipment, prudent watchkeeping or a dedicated anchor alarm. LINZ chart images in the real app require internet access.
