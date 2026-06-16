# Wiring Creative Factory → Meta Ads (one-click export)

Goal: from Creative Factory - Property Playbook, push selected ads to Meta with one button,
while keeping the existing CSV export. This doc lists the two paths, what gets built, and what
Mohit needs to provide.

## Two ways to do "one-click to Meta"

### Path A — Direct Meta Marketing API from Creative Factory
CF gets its own Meta integration. The reserved `app/api/fb-push/route.ts` stub gets built out:
upload each image → get `image_hash` → create Ad Creative (page, UTM link, copy, CTA) → create
a PAUSED Ad under a chosen/created campaign + ad set.

- **Pros:** the button lives in CF; self-contained.
- **Cons:** CF must store a Meta token; more code to build/maintain; image upload + hierarchy
  handling; you manage two systems that both talk to Meta.

### Path B — Export to Adspirer (RECOMMENDED), keep CSV
CF button = "Send to Adspirer." CF posts the selected ads (image URLs + copy + UTMs + angle) to
an endpoint; Adspirer (already connected to your Meta account) creates the campaign — PAUSED,
UTM-tagged, with the campaign-execution-contract verification (readback of ads/creatives/budget).

- **Pros:** nothing new to authenticate in CF (no token stored there); reuses the Meta connection
  you already have; you get paused+verified campaigns and the safety guardrails; one system owns
  Meta writes.
- **Cons:** the actual "create" happens through Adspirer, not purely inside CF (the button still
  lives in CF).

**Recommendation:** Path B. Less to build, no token sprawl, safer (paused + verified), and it
fits the funnel we already designed. CSV stays exactly as-is either way.

## What gets built (either path)
1. A **"Export to Meta"** button on each ad + a **"Export selected"** bulk action.
2. UTM links auto-attached per the convention (`utm_content = creative_id`, etc.).
3. Ads created **PAUSED** (never auto-live).
4. CSV export untouched (still available).
5. Path B adds: a small CF→Adspirer payload endpoint; Adspirer creates campaign/ad set/ads.
   Path A adds: full `fb-push` (adimages → adcreatives → ads).

## What I need from you (Meta side)

### Required IDs
- [ ] **Ad Account ID** — `act_XXXXXXXXXX` (Ads Manager → top-left account dropdown)
- [ ] **Facebook Page ID** — the Page the ads run from (Page → About → Page ID)
- [ ] **Landing page URL** — the deployed Property Playbook LP (still pending deploy). Ads need a
      destination. Confirm beehiiv is set to capture UTMs on the subscribe form.

### Required for Path A only (skip if Path B)
- [ ] **Meta App** — App ID + App Secret (developers.facebook.com → your app), with Marketing API.
- [ ] **System User access token** with scopes `ads_management`, `business_management`,
      `pages_read_engagement`, and the ad account + Page assigned to that system user.
      - Note: for YOUR OWN ad account you can generate this without full App Review if you're an
        admin/developer of the app. Full App Review is only needed to act on accounts you don't own.
- [ ] **Pixel ID** (optional but recommended) — for conversion optimization later.

### Decisions (I can recommend defaults)
- [ ] **Objective:** Traffic/Leads. For the $5 test optimizing on Landing Page Views → Traffic.
- [ ] **Optimization event:** Landing Page Views (per the forecast, to get volume + exit learning).
- [ ] **Daily budget:** $5 per campaign (your plan: 1 campaign / 1 ad set / 1 ad).
- [ ] **Audience:** broad US, 25-55, real-estate/investing interests — or fully broad (Advantage+).
      I'll propose specifics.
- [ ] **Placements:** Advantage+ (automatic) recommended for a $5 test.
- [ ] **Geo:** United States (confirm).

## Still-open dependencies (block actual launch, not the build)
- [ ] Deploy the landing page + turn on beehiiv UTM capture.
- [ ] Confirm beehiiv Boost payouts don't require the Scale plan.
- [ ] Render the ad images (turnkey + short-term winners) so there's a creative to push.

## STATUS: Path A BUILT (2026-06-07)

Chosen Path A. IDs captured: Ad Account `1177351133249394`, Page `109577611993514`,
Business `358172430546536`.

- `app/api/fb-push/route.ts` — full Meta Marketing API push. Per ad: upload image → PAUSED
  campaign (OUTCOME_TRAFFIC) → ad set ($5/day, LANDING_PAGE_VIEWS, US 25-60) → ad creative
  (page, UTM link, copy, CTA) → PAUSED ad.
- "▶ EXPORT TO META" button live in the app (selected ads, or all rendered). CSV kept.
- Verified live: `POST /pp/api/fb-push` responds (reports missing token cleanly).

### The ONE remaining step: the System User token
1. business.facebook.com → **Business Settings → Users → System Users → Add**. Name it
   `creative-factory`, role Admin.
2. **Assign assets** to that system user: the Ad Account (`1177351133249394`, full control)
   AND the Page (`109577611993514`).
3. **Generate new token**: pick an App (if none, create a basic app at developers.facebook.com
   and add the Marketing API product — no App Review needed for your own account). Scopes:
   `ads_management`, `business_management`, `pages_read_engagement`, `pages_manage_ads`.
   Copy the token (system-user tokens are long-lived).
4. **Add to Vercel** (project `creative-factory` → Settings → Environment Variables, Production +
   Preview): `META_SYSTEM_USER_TOKEN = <token>`. (Ad account + page IDs are already defaulted in
   code; only override via `META_AD_ACCOUNT_ID` / `META_PAGE_ID` if needed.)
5. Tell me — I redeploy property-playbook + re-point the /pp alias so it picks up the token.

### Caveats
- **Housing special ad category:** a newsletter-subscription ad is education, not a housing
  listing, so we send `special_ad_categories=[]`. If Meta rejects it, we switch to HOUSING
  (which restricts age/gender/zip targeting). Flag if you see a rejection.
- **Destination URL:** currently defaults to `propertyplaybook.beehiiv.com/subscribe` because the
  LP isn't deployed yet. Once the LP is live I'll switch the default. UTMs are attached regardless.

### Remaining to actually launch
1. Add the token (above).
2. Render the top ~6 images (turnkey + short-term) — Meta push needs a creative.
3. Deploy the LP + beehiiv UTM capture.
4. One-click EXPORT TO META → review PAUSED campaigns in Ads Manager → flip live.
