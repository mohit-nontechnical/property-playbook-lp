# Property Playbook — Paid Acquisition Plan (2026-07-05)

**Status: PLAN ONLY. No campaigns created, modified, or enabled. Zero spend.**

Prepared from: LP audit (local + production), STRATEGY.md, CLAUDE.md, ECONOMICS-MODEL.md,
ADVERTISING-FORECAST.md, generated-ads-batch1.md, creatives/index.json, Adspirer MCP
(read-only), and the IGTRE ad-campaign-best-practices playbook.

---

## 1. LP audit findings

### What works (verified today)

| Check | Result |
|---|---|
| Builds / runs | PASS. Static zero-build site. Served locally on dedicated port 4899 (HTTP 200). Production `property-playbook-lp.vercel.app` serves the identical 26,816-byte index.html. Port 3000 (MohitOS) untouched. |
| UTM spine | INTACT in code. All 5 `utm_*` keys plus `ref`/`fbclid` captured from the ad link, persisted to localStorage, POSTed to `/api/lead-sync`, and appended to the beehiiv subscribe redirect. `utm_content` (= creative_id) survives ad -> LP -> beehiiv end to end. |
| Serverless backend | DEPLOYED and executing. `/api/lead-sync` returns 405 on GET ("POST only" guard) and 400 with `valid email required` on a bad-email probe. Fans out to GHL (tags: `property-playbook`, `meta-ad`, campaign, `angle:{utm_term}`; custom field `creative_id`) and beehiiv (custom fields `creative_id`, `angle`) in parallel. |
| Pixels | Dual Meta Pixel setup in code (PP pixel 1334124178654448 + IGTRE account pixel 951250319950462). Every event auto-tagged with `creative_id`/`angle`/`campaign` via `ppTrack`. Journey events: ViewContent, scroll 25/50/75/90, Engaged15s, FormFocus, Lead, and CompleteRegistration on welcome.html. |
| Compliance | "Not financial advice" disclaimer present in footer. No guaranteed-return or passive-income claims on the page. |
| Creatives | 6 batch-1 images in `creatives/` are all AI-generated (fal.media), each with a `creative_id` in `index.json`: turnkey (b1-01, b1-06, b1-07) and short_term (b1-02, b1-09, b1-10). Compliant with the AI-only visuals rule. |

### Fixes needed before spend (ranked)

1. **BLOCKER — Angle headline-swap is missing.** CLAUDE.md documents an `ANGLES` map in
   index.html that swaps the hero headline by `utm_term` for message-match. It does not
   exist in the current file; `utm_term` is only used for pixel tagging. The forecast's LP
   conversion assumptions (25-35%) explicitly relied on this. A turnkey/STR "Truth About"
   ad currently lands on a generic "cash-flow markets everyone overlooks" hero, which is a
   message-match break. Implement the swap for `turnkey` and `short_term` (minimum) before
   launch, or accept a materially lower LP conversion estimate.
2. **BLOCKER — Stock photo on the LP.** The hero image is an Unsplash URL
   (`images.unsplash.com/photo-1448630360428...`), live in production. Violates the
   all-visuals-AI-generated rule. Replace with a fal / Creative Factory image (self-hosted,
   not hotlinked).
3. **BLOCKER — beehiiv settings cannot be verified from code.** Must confirm in the beehiiv
   dashboard: (a) "capture UTM parameters on subscribe form" is ON so `utm_content` lands as
   a subscriber attribute; (b) welcome-flow Boost stack is live (3-4 finance boosts, see
   section 5); (c) post-subscribe redirect points at `/welcome.html` so CompleteRegistration
   fires with attribution.
4. **BLOCKER — env vars unverified.** `/api/lead-sync` executes, but `GHL_PIT`,
   `GHL_LOCATION_ID`, `BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID` can only be proven by one
   end-to-end test submit with a disposable email, then checking the subscriber lands in
   beehiiv with `creative_id`/`angle` custom fields and the GHL contact is tagged. (Note:
   client-side beehiiv redirect still subscribes people even if env is missing, but the
   GHL copy and API-side attribution would silently no-op.)
5. **BLOCKER (if launching via Adspirer) — Meta connection needs reauth.** Adspirer
   `get_connections_status` shows Meta account "Idiot's Guide To Real Estate"
   (1177351133249394) in `needs_reauth`; a performance pull errored with "No meta_ads
   account connected." Reauth at adspirer.ai/connections, or launch manually in Ads
   Manager. Google Ads (2136723874) is connected but out of scope.
6. Medium — pixel verification: confirm both pixel IDs fire (Events Manager Test Events)
   and the LP domain is verified in Business Manager.
7. Minor — dead CTAs: "Read the full issue" card and two "Read →" market rows have no
   href. Either link to the beehiiv archive posts or make them scroll to #subscribe.
8. Minor — author headshot hotlinks graph.facebook.com (has onerror fallback, but replace
   with a self-hosted image for reliability).
9. Minor — git hygiene: `CLAUDE.md` and `.gitignore` are untracked; repo is one commit old.
   Commit before making launch-critical edits so changes are diffable.
10. Grounding flag — batch-1 ads 03/12/18 (`lesson_500k`, "my actual Airbnb number") cite
    facts not in the grounded deal list, and `lesson_500k` is not a supported angle slug.
    Do not launch those. Also: ECONOMICS-MODEL.md cites "~45 units" while CLAUDE.md
    (updated 2026-07-05) flags "45 units" as a fabrication artifact — keep unit counts out
    of all ad copy.

---

## 2. Confirmed strategy directives (from STRATEGY.md / CLAUDE.md / skill)

- Funnel: Meta ads -> this LP -> beehiiv -> Boosts. North-star metric is **net CAC**
  (spend minus stacked Boost payout), not raw CPL.
- Contrarian "The Truth About [X]" angles only, sourced from real published PP posts.
  No hype/guru framing. Quality subscribers over volume (Boosts pay only for engaged subs).
- Batch-1 seed angles: `short_term` + `turnkey` (both have AI creatives ready).
- UTM spine on every ad link: `utm_source=meta`, `utm_medium=paid_social`,
  `utm_campaign=property-playbook_YYYY-MM` (must equal the Meta campaign name),
  `utm_content={creative_id}`, `utm_term={angle_slug}`.
- **Housing Special Ad Category is mandatory** on every Meta campaign for this account
  (per the IGTRE ads playbook): no age/gender/ZIP targeting, limited interests, lookalikes
  capped. Strategy is therefore broad audience + creative-led differentiation.
- Test budgets stay small (sub-$25/day); create everything PAUSED; never auto-launch;
  scale winners in 20-30% steps.
- Mo Money voice + finance compliance: no em-dashes, one emoji max (📘 house mark), no
  guaranteed returns or effortless-passive-income claims, no syndication/investment-offering
  language anywhere near paid ads (Reg D gate).

---

## 3. Proposed campaign structure

**One campaign, launch with 2 ad sets (option to add a 3rd once ADU creative exists).**

```
Campaign: property-playbook_2026-07          <- name = utm_campaign, exactly
  Objective: Traffic -> Landing Page Views (first 5-7 days), then switch the
             winner to Conversions (Lead) once an angle proves out
  Special Ad Category: Housing
  Budget: ad-set level (ABO), $5/day each    <- ABO not CBO, so each angle
                                                gets a guaranteed read
  Ad set 1: pp_turnkey    (utm_term=turnkey)
    3 ads: creative_ids b1-01, b1-06, b1-07 (existing fal images)
  Ad set 2: pp_short-term (utm_term=short_term)
    3 ads: creative_ids b1-02, b1-09, b1-10 (existing fal images)
  [Later] Ad set 3: pp_adu (utm_term=adu)
    Blocked on creative: no ADU images exist in creatives/ and the Creative
    Factory PP branch is on hold. Add only after 2-3 fal images are generated
    and an `adu` headline is added to the LP ANGLES map.
```

Why this shape: the ADVERTISING-FORECAST test matrix wanted 3 parallel angle tests; the
task brief caps at 1 campaign / 2-3 ad sets. Ad-set-per-angle inside one Housing-SAC
campaign preserves the angle-level CTR read (the fastest, most reliable signal at this
budget) while keeping naming and UTMs clean. Landing Page View optimization first is
deliberate: at ~5-15 subs/week the account would never exit learning on a Lead event.

**Ad link template (every ad, no exceptions):**

```
https://property-playbook-lp.vercel.app/?utm_source=meta&utm_medium=paid_social&utm_campaign=property-playbook_2026-07&utm_content={creative_id}&utm_term={angle_slug}
```

---

## 4. Audience targeting

Housing Special Ad Category constrains almost everything, so targeting is intentionally
simple and creative does the segmentation:

- **Geo:** United States, nationwide.
- **Age/gender:** locked to 18-65+/all by Housing SAC. Do not attempt workarounds.
- **Detailed targeting:** broad. If Meta allows any interests under SAC, limit to broad
  finance/entrepreneurship interests; skip narrow stacks entirely.
- **Placements:** Advantage+ (auto) to start; review placement breakdown at day 7 and trim
  only clear waste (per playbook, do not pre-restrict at this budget).
- **Exclusions:** existing subscribers when a customer list is uploadable (~131 subs is
  below Meta's useful minimum, so skip for now; revisit at ~1,000).
- **Retargeting (phase 2, not at launch):** the pixel already builds the audiences —
  ViewContent, PP_Scroll75, PP_Engaged15s, PP_FormFocus-without-Lead. Once traffic
  accumulates, a small retargeting ad set on "engaged, no submit" is the first add.
- **Lookalikes (phase 3):** 1-15% (SAC floor) seeded from beehiiv engaged-subscriber list
  once it is big enough to matter. Not now.

---

## 5. Ad copy (3 launch variants, IGTRE/PP voice)

All grounded in vetted batch-1 copy tied to real published PP posts. No em-dashes, max one
emoji, no income claims, no guarantees. Each maps to an existing AI creative.

### Variant A — turnkey, hook-led (creative b1-01)

> **Primary text:**
> The turnkey rental pitch is the #1 lie sold to beginners.
>
> You pay $140k for a $60k property with $25k of work.
>
> The 12% cap rate? Closer to 5% after real costs.
>
> **Headline:** The Truth About Turnkey Rentals
> **Description:** Weekly. No guru nonsense.
> **CTA:** Subscribe
> **Link:** `...utm_content=b1-01&utm_term=turnkey`

### Variant B — short_term, stat-led (creative b1-02)

> **Primary text:**
> $84k projected Airbnb income. $48k actual.
>
> The projection tools sell the dream. The bank statement tells the truth.
>
> I run the real numbers on short-term rentals. Every week. Free. 📘
>
> **Headline:** Real STR Numbers
> **Description:** 5-minute weekly read
> **CTA:** Sign Up
> **Link:** `...utm_content=b1-02&utm_term=short_term`

### Variant C — short_term, curiosity-gap (creative b1-10)

> **Primary text:**
> The day your city votes in a 90-day rental cap, the Airbnb math changes overnight.
>
> Nobody mentions that in the pitch.
>
> I read the ordinances and the fine print so you don't have to.
>
> **Headline:** The Airbnb Truth
> **Description:** Real numbers. Real Talk.
> **CTA:** Subscribe
> **Link:** `...utm_content=b1-10&utm_term=short_term`

Rotation bench (already vetted, ready if a launch ad fatigues): batch-1 ads 06, 07, 09
map to the remaining creatives b1-06, b1-07, b1-09. Do NOT use ads 03/12/18 (grounding
flags, unsupported slug). Before launch, spot-check each cited stat ($140k/$60k markup,
$84k/$48k, 90-day cap) against the corresponding published PP post.

---

## 6. Budget recommendation + net-CAC math

**Start: $10/day total ($5/day per ad set, ABO). ~$70/week, ~$300/month.**
Well under the sub-$25/day playbook cap. If/when the ADU ad set is added: $15/day.

Unit economics (from ADVERTISING-FORECAST.md + ECONOMICS-MODEL.md, US finance/RE cold
traffic benchmarks CPM $20-35, good CTR >1.5%, good LP conv >25%):

| Scenario | CPM | CTR | CPC | LP conv | Gross CAC | Boost offset | **Net CAC** |
|---|---|---|---|---|---|---|---|
| Pessimistic | $35 | 0.8% | $4.38 | 18% | ~$24.00 | ~$5.70 | **+$18 (stop/fix)** |
| Base | $25 | 1.5% | $1.67 | 25% | ~$6.70 | ~$5.70 | **~+$1 (≈breakeven)** |
| Optimistic | $18 | 2.5% | $0.72 | 35% | ~$2.05 | ~$5.70 | **−$3.65 (paid to grow)** |

Boost offset assumes the welcome-flow stack is live BEFORE launch: The Range $6.80,
Strategic Trader $6.40, No Commission $5.60, Money Minute $5.00, Exit & Equity $4.80.
Stack 3-4 (cap to protect retention); ~$5.70/qualified sub is the realistic blended yield.
Boosts pay on engaged subs only, which is why junk clicks break the model.

Volume reality at $10/day: base case ~5-10 subs/week. CAC is not trustworthy until ~20-30
subs per angle (4-6 weeks). CTR is readable in 2-3 days and is the kill/keep signal.

**Decision rules:**
- Day 3-4: kill the lower-CTR ad within each ad set if CTR <1% with >500 impressions.
- Day 7: if one angle's CTR is >2x the other, shift its $5/day to the winner.
- ~25 subs on the winner: trust the CAC read. If gross CAC <$5.70 (net-negative), switch
  that ad set to Conversions (Lead) and scale +20-30% per step.
- Any point: acquired-sub open rate <30% means quality problem; tighten creative before
  scaling, regardless of CAC.
- Hard stop: if gross CAC >$15 after 2 weeks of iteration, pause and rework LP/creative.
- Month-1 spend cap: ~$300. Set a campaign spend limit at creation.

---

## 7. Go / no-go checklist

Launch only when every box is checked. Items 1-9 are the gate; 10-12 are launch-day.

**LP / funnel readiness**
- [ ] 1. ANGLES headline-swap implemented in index.html for `turnkey` + `short_term`
        (message-match), deployed to prod, tested with `?utm_term=turnkey`.
- [ ] 2. Unsplash hero replaced with a self-hosted AI-generated (fal) image. No stock
        anywhere on the LP.
- [ ] 3. End-to-end test submit with a disposable email + full UTM string: subscriber
        appears in beehiiv with `creative_id` and `angle` attributes; GHL contact created
        with tags; welcome.html fires CompleteRegistration (check Events Manager).
- [ ] 4. beehiiv: "capture UTM parameters on subscribe form" ON; post-subscribe redirect
        set to the LP `/welcome.html`.
- [ ] 5. beehiiv Boost stack live on welcome flow (3-4 of: The Range, Strategic Trader,
        No Commission, Money Minute, Exit & Equity) and payout/withdrawal confirmed to
        work on the current plan (no Scale upgrade).
- [ ] 6. Both Meta pixels verified firing in Events Manager; LP domain verified in
        Business Manager.

**Compliance / grounding**
- [ ] 7. Ad copy pass: no em-dashes, max one emoji, no income/return guarantees, no
        "passive income that works" framing, no syndication/offering language, no unit
        counts, no ungrounded stats (each number traced to a published PP post).
- [ ] 8. Campaign set to Housing Special Ad Category.

**Account / tooling**
- [ ] 9. Adspirer Meta connection reauthorized at adspirer.ai/connections (only if
        launching/monitoring via MCP; manual Ads Manager launch is the fallback).

**Launch-day**
- [ ] 10. Campaign name exactly `property-playbook_2026-07` and every ad link carries the
         full UTM template with the correct per-ad `creative_id`.
- [ ] 11. Everything created PAUSED; Mohit reviews campaign, ad sets, ads, links, and
         spend limit before anything is enabled. Campaign spend cap ~$300 set.
- [ ] 12. Day-3 and day-7 review reminders set (CTR kill rule, budget shift rule).

---

*Plan only. Nothing was created or changed in any ad account. Not financial advice;
planning assumptions, not promises.*
