# Property Playbook — Strategy Playbook

<!-- Strategic directives that guide campaign creation, keyword/angle research, audience
     targeting, and budget allocation. Read this before any Property Playbook ad work.
     Directives are confirmed decisions, not rigid rules that bypass research. -->

## Active Directives

### Cross-Platform Strategy
- **CONSTRAINT: Property Playbook = only the beehiiv newsletter** (propertyplaybook.beehiiv.com) — never seed PP ads/copy from the MSN / `content_equity` content-farm data. That data is for the other newsletters (Lifestyle, Sports).
- **PREFER: contrarian "The Truth About [X]" angles** sourced only from real published posts — they match the brand, carry curiosity lift, and are compliant.
- **AVOID: aspirational/guru/hype framing** ("build wealth fast," "passive income that works," "never worry about money") — it breaks message-match with the contrarian newsletter and buys junk subscribers.
- **REQUIRE: subscriber QUALITY over volume** — the funnel breaks even on beehiiv Boosts, which pay only for qualified/engaged subs. Tight targeting + on-brand creative are the levers; cheap junk clicks break the unit economics.
- **CONSTRAINT: Mo Money voice + finance compliance** on all copy — no em-dashes, one emoji max (📘), no guaranteed-returns/effortless-passive-income claims, "Not financial advice" disclaimer on the LP.

### Meta Ads (primary platform)
- **REQUIRE: UTM spine on every ad link** — `utm_source=meta`, `utm_medium=paid_social`, `utm_campaign=property-playbook_YYYY-MM` (must equal the Meta campaign name), `utm_content={creative_id}` (from Creative Factory), `utm_term={angle_slug}`.
- **PREFER: batch-1 seed angles** `short_term` (The Truth About Short-Term Rentals) + `turnkey` (The Truth About Turnkey Rentals) — broad, contrarian, compliant.
- **REQUIRE: creatives from the `property-playbook` branch of Creative Factory** — preloaded with PP voice, angles, and compliance. Each variant gets a `creative_id`.

### Budget Allocation
- **CONSTRAINT: start with a small test budget** across the Creative Factory variants; kill losers on net CAC + acquired-open-rate, scale winners. (Specific budget TBD.)
- **AVOID: upgrading beehiiv to Scale plan for the Ad Network** — at current list size Ad Network revenue is negligible. Only upgrade if Boost payouts/withdrawals require it.

### Monetization / Funnel
- **REQUIRE: breakeven via beehiiv Boosts before scaling spend** — stack 3-4 high-relevance finance boosts on the welcome flow (The Range $6.80, Strategic Trader $6.40, No Commission $5.60, Money Minute $5.00, Exit & Equity $4.80). Cap at 3-4 to protect retention.
- **PREFER: net-negative CAC as the target** — realistic stacked boost revenue (~$5.70/sub) can exceed Meta CAC, so the front end pays for itself; backend (products → coaching → syndication) is the profit.

### Compliance / Legal
- **CONSTRAINT: deal syndication requires legal review** (Reg D / accredited-investor, general-solicitation rules) before any investment-offering content goes near paid ads.

---

## Decision Log

### 2026-06-06 — Property Playbook paid-acquisition strategy established
- **Context:** Goal is to run Meta ads to a Property Playbook landing page, break even via beehiiv Boosts, and sell backend offers (products, coaching, eventually real-estate deal syndication with investor capital). Multi-newsletter portfolio long-term.
- **Findings:** PP's real voice is contrarian ("The Truth About..."), not aspirational. Boosts marketplace is finance-dense with $4.80-$6.80/sub relevant payouts, stackable → likely net-negative CAC. Ad Network is a scale-stage LTV lever, not a CAC offset, and is gated behind Scale plan. Current list 131/2,500 subs.
- **Decisions:** (1) source ad angles only from PP's own posts; (2) lead contrarian, never hype; (3) optimize for qualified subscribers (boost + backend depend on it); (4) breakeven via stacked relevant boosts before scaling; (5) don't upgrade to Scale for the Ad Network; (6) built `property-playbook` branch of Creative Factory preloaded with PP knowledge.
- **Assets:** `~/Documents/property-playbook-lp/` (LP, PROPERTY-PLAYBOOK.md master brief, candidate headlines). CF branch `property-playbook` in `mohit-nontechnical/creative-factory`.

---

## Archived Directives
[None]
