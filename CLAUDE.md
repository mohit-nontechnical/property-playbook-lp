# Property Playbook Landing Page — CLAUDE.md

## What this is
Custom landing page for paid acquisition into the Property Playbook beehiiv newsletter.
Static, zero-build site (no framework, no package.json) deployed to Vercel, plus two
serverless functions that fan a captured lead out to GoHighLevel and beehiiv. Meta ads
point here; this LP is the only step between ad click and newsletter subscribe.

## Stack & commands
- No `package.json`, no build step, no framework. `index.html` is the entire page
  (inline `<style>`, inline JS, Meta Pixel loader, UTM capture, headline-swap by angle).
- `welcome.html`, `privacy.html` — supporting static pages.
- `api/lead-sync.js` — Vercel serverless function (`module.exports = async (req,res)=>...`,
  Node runtime, no framework). POST `{email, name?, phone?, utm_*, source?}` →  writes to
  both GHL (`services.leadconnectorhq.com`) and beehiiv (`api.beehiiv.com/v2`) in parallel.
  Env vars: `GHL_PIT`, `GHL_LOCATION_ID`, `GHL_API_VERSION`, `BEEHIIV_API_KEY`,
  `BEEHIIV_PUBLICATION_ID`.
- `api/leadgen-webhook.js` — Meta Lead Ads webhook (GET verify handshake + POST
  `leadgen_id` → Graph API fetch → forwards to `/api/lead-sync`). Env: `META_VERIFY_TOKEN`,
  `META_SYSTEM_USER_TOKEN`.
- Deploy: `vercel deploy --prod` from this folder (linked project `property-playbook-lp`,
  org `team_7OGRxfIedhpM8V5bJF0n70q0`). Netlify drag-and-drop is a documented fallback.
- No test suite, no linter, no CI config in this repo.
- `creatives/` holds the batch-1 Creative Factory image exports + `index.json` manifest.
  `generated-ads-batch1.{json,md}` are the copy that shipped with them.

## Funnel position & metrics
Meta ads → this LP → email capture → redirect to `propertyplaybook.beehiiv.com/subscribe`
(with UTMs attached) → beehiiv Boosts on the welcome flow offset acquisition cost.
- North-star metric: **net CAC** (Meta spend minus stacked Boost payout per sub), not
  raw CPL or subscriber volume.
- UTM spine (must match Meta campaign naming): `utm_source=meta`, `utm_medium=paid_social`,
  `utm_campaign=property-playbook_YYYY-MM`, `utm_content={creative_id}`,
  `utm_term={angle_slug}`. `utm_content` is the join key back to spend in the warehouse —
  never break this on either the ad link or the beehiiv subscribe redirect.
- `utm_term` drives client-side headline-swap (see `ANGLES` map in `index.html`) for
  message-match. Supported slugs: `turnkey`, `short_term`, `adu`, `why_not_buy`,
  `expensive_poor`, `capital_stack` — each maps to a real published PP post. Do not invent
  new angle slugs; add one only when a corresponding newsletter post exists.
- Two Meta Pixel IDs fire on every event (dedicated PP pixel + account "Idiots Guide To RE"
  pixel), auto-tagged with `creative_id`/`angle`/`campaign` via `window.ppTrack(...)`.

## Copy rules
- **No fabrication, ever.** Ground all copy/testimonials/numbers in Mohit's real deals only:
  Cleveland multifamily 8-unit (sold at ~$35k loss), 14-unit, an SFH, 22-unit, minority-GP
  strip mall. First deal 4/15/2020. Do not invent deals or reference Tucson (a known
  fabrication artifact). "45 units and $10M worth of deals by 30" IS approved (Mohit
  2026-09-25), used verbatim and cumulative; the old ban on "45 units" is superseded.
- **Voice:** contrarian "The Truth About [X]" framing only, sourced from real published PP
  posts. No aspirational/guru/hype language ("build wealth fast," "passive income that
  works," "never worry about money") — breaks message-match and attracts junk subs.
  No em-dashes. Avoid AI-tell phrases. One emoji max (📘 is the house mark).
- **Compliance:** no guaranteed-return or effortless-passive-income claims. Keep the
  "Not financial advice" disclaimer in the footer. Deal-syndication content is legal-review
  gated (Reg D / accredited-investor rules) — don't let LP or ad copy imply an investment
  offering.
- **Newsletter is in trust phase right now** — long personal issues, no pitch/CTA yet.
  Don't write LP copy that assumes a hard-sell backend exists today.
- PP brand scope is the newsletter only. Never pull copy, headlines, or story material from
  MSN / `content_equity` content-farm data (that's for Lifestyle/Sports, not PP).

## Related systems
- **beehiiv** (`propertyplaybook.beehiiv.com`) — subscribe destination; must have "capture
  UTM parameters on subscribe form" turned on so `utm_content` lands as a subscriber
  attribute. Boosts marketplace is the CAC offset (see STRATEGY.md for the specific stack).
- **Creative Factory** (separate GitHub/Vercel app) — generates the Meta ad creatives that
  link to this LP, from its `property-playbook` branch (preloaded with PP voice/angles/
  compliance). PP edition is currently on hold; `creatives/` in this repo holds what's
  already been generated. Each creative has a `creative_id` = `utm_content`.
- **MohitOS attribution** — the warehouse-side join uses `utm_content = creative_id` as the
  spine end to end (ad → LP → beehiiv subscriber attribute → net CAC calc).
- **GoHighLevel** — parallel lead destination via `api/lead-sync.js`, tagged
  `property-playbook`, `meta-ad`, campaign name, and `angle:{utm_term}`.

## Directives
Strategic decisions (angle priorities, budget rules, boost stack, compliance constraints,
decision history) live in `STRATEGY.md` in this folder — read it before any campaign,
copy, or targeting work. This file is operational/structural only; STRATEGY.md is
authoritative for strategy and is not to be modified casually.
