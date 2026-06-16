# Property Playbook — Ad Landing Page

A self-contained, zero-build landing page for paid subscriber acquisition. Ads point here;
this page captures the email and forwards it (plus all UTMs) to your beehiiv subscribe page,
so attribution survives end to end. That UTM passthrough is the join spine your warehouse
needs (`utm_content = creative_id`).

## Files
- `index.html` — the page. One file. No build step.
- `CANDIDATE-HEADLINES.md` — proven headline seeds for Creative Factory, pulled from `content_equity`.

## Before you ship — 1 thing to confirm
Open `index.html`, find `PP_CONFIG.beehiivSubscribeUrl`. It is set to
`https://propertyplaybook.beehiiv.com/subscribe`. Confirm that is your real subscribe path.
Also: in beehiiv, turn ON "capture UTM parameters on the subscribe form" so the UTMs we
pass through get stored as subscriber attributes.

## Deploy (pick one)
**Vercel (recommended, matches your stack):**
```
cd ~/Documents/property-playbook-lp
vercel deploy --prod
```
**Netlify drop:** drag this folder onto app.netlify.com/drop.

Then point a clean domain/subdomain at it (e.g. `go.propertyplaybook.com` or
`join.propertyplaybook.com`).

## How the UTM flow works
1. Meta ad link → `https://<your-lp>/?utm_source=meta&utm_medium=paid_social&utm_campaign=property-playbook_2026-06&utm_content=<creative_id>&utm_term=<angle>`
2. LP reads + stores those UTMs.
3. `utm_term` swaps the headline to match the ad angle (message match = higher conversion).
4. On submit, LP redirects to beehiiv with `email` + all UTMs attached.
5. beehiiv records the subscriber with `utm_content = creative_id` → joins back to spend in the warehouse.

## Angle slugs supported by the headline-swap
`turnkey`, `short_term`, `adu`, `why_not_buy`, `expensive_poor`, `capital_stack`.
Each maps to a REAL Property Playbook post (see CANDIDATE-HEADLINES.md). Do not invent angles
that are not actual newsletter posts. Pass one as `utm_term` to match the ad. Unknown/empty
term = default headline. Add more in the `ANGLES` map in `index.html` as new posts publish.

## Compliance
Footer carries the required "Not financial advice" disclaimer. Do not run ad copy that
frames real estate as effortless passive income (see CANDIDATE-HEADLINES.md).
