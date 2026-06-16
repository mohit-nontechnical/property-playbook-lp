# Property Playbook — Advertising Forecast & Test Plan

Predictions for the $5/day Meta test campaigns. Goal: learn real CAC and find the levers to
push it toward $1. Reality check up front: with beehiiv Boosts paying ~$5.70 per qualified
subscriber, **anything under ~$5.70 CAC is profitable at the front end.** $1 is the stretch
target, not the breakeven line.

> Budget assumption: $5/day per campaign, 1 campaign = 1 ad set = 1 ad. (If you meant $5
> lifetime, halve the timelines below and treat the numbers as one-shot reads.)

## The funnel math

```
Impressions/day = (daily spend / CPM) x 1000
Link clicks/day = Impressions x CTR
CPC             = daily spend / link clicks   = CPM / (1000 x CTR)
Subscribers/day = link clicks x LP-conversion
CAC             = CPC / LP-conversion         = daily spend / subscribers/day
```

## Scenarios (US real-estate/finance, cold traffic, $5/day)

| Metric | Pessimistic | Base | Optimistic | What $1 CAC needs |
|---|---|---|---|---|
| CPM (cost / 1,000 impressions) | $35 | $25 | $18 | $18 |
| Link CTR | 0.8% | 1.5% | 2.5% | ~5% |
| CPC | $4.38 | $1.67 | $0.72 | $0.35 |
| Landing-page conversion | 18% | 25% | 35% | 35% |
| **CAC** | **~$24** | **~$6.70** | **~$2.05** | **$1.00** |
| Subscribers / day @ $5 | 0.2 | 0.75 | 2.4 | 5.0 |
| Subscribers / week @ $5 | ~1.5 | ~5 | ~17 | ~35 |

### After Boosts (~$5.70/qualified sub) — net CAC
| | Pessimistic | Base | Optimistic | $1 target |
|---|---|---|---|---|
| Net CAC | +$18 (loss) | ~+$1 (≈breakeven) | **−$3.65 (profit)** | **−$4.70 (profit)** |

Takeaway: the **base case is roughly breakeven after Boosts**, and any creative that gets you
into the optimistic column means you're getting *paid* to acquire subscribers. The whole game is
moving CTR and LP-conversion up.

## Why $1 is a stretch (and the only ways to get there)
CAC = CPC / LP-conversion. To hit $1 you need either:
- **Exceptional creative:** link CTR of 3-5% (vs 1-1.5% average). Contrarian "Truth About" hooks
  are your best shot here — curiosity gaps drive clicks.
- **A high-converting LP:** 35-50% visitor→subscriber. Single email field, tight message-match
  (the LP already swaps its headline to match the ad angle), fast load. We have this.
- **OR a cheaper path:** Meta Lead Ads (instant forms) skip the LP and often run $1-3/lead, sometimes
  sub-$1. BUT instant-form subs are lower quality, and quality is what Boost partners pay for. Only
  test this if LP-traffic CAC stays stubbornly high, and watch the open-rate/qualification closely.

## The constraint nobody warns you about: volume at $5/day
- **Statistical signal:** one $5 conversion reads as "$5 CAC" but means nothing. You want ~20-30
  subscribers per angle before the CAC number is trustworthy. At base case (~5 subs/week) that's
  4-6 weeks per angle. CTR, by contrast, is readable in 2-3 days off a few hundred impressions.
- **Meta's learning phase:** the algorithm wants ~50 optimization events/week per ad set to exit
  learning and stabilize cost. At ~5 subscribes/week you'd never exit if you optimize for the
  "subscribe" event — costs stay inflated.
  - **Fix:** optimize the test campaigns for an upper-funnel event with volume — **Landing Page
    Views** (or Link Clicks) — to find the cheapest, highest-CTR angle fast. Once an angle wins,
    scale its budget and switch to conversion optimization.

## Recommended test matrix (your structure, applied)
Run 3 angle tests in parallel, each its own campaign / 1 ad set / 1 ad, $5/day = **$15/day total**:

| Campaign | Angle (utm_term) | Why |
|---|---|---|
| `pp_short-term` | `short_term` — The Truth About Short-Term Rentals | Airbnb is broad + high-intent |
| `pp_turnkey` | `turnkey` — The Truth About Turnkey Rentals | Debunks the #1 beginner pitch |
| `pp_adu` | `adu` — The Truth About ADUs | Trendy, over-hyped, strong curiosity |

- Optimize for **Landing Page Views** for the first ~5-7 days.
- Generate 1 ad per angle from **Creative Factory - Property Playbook** (each carries its own
  `creative_id` = `utm_content`).
- Every ad link carries the full UTM set (`utm_source=meta`, `utm_medium=paid_social`,
  `utm_campaign=property-playbook_YYYY-MM`, `utm_content={creative_id}`, `utm_term={angle}`).

## What to watch, and what each signal means (diagnostic ladder)
Benchmarks (US finance/real-estate): CPM $20-35 | good CTR >1.5%, great >2.5% | good CPC <$1,
great <$0.50 | good LP-conv >25%, great >35%.

- **Low CTR (<1%)** → creative problem. The hook/image isn't stopping the scroll. Kill the angle
  or try a new hook. (Fastest signal — act on it in days.)
- **Good CTR but high CPM** → audience too narrow or low engagement penalty. Broaden targeting.
- **Good CTR, clicks, but low LP-conversion** → landing-page / message-match problem, not the ad.
- **High CAC but everything upstream looks fine** → it's a volume/learning-phase artifact; give it
  more conversions before judging.

## Expected first-week outcome (all 3 angles, $15/day, $105/week)
- Pessimistic: ~4-5 subs, CTR tells you which angle to kill.
- Base: ~15 subs, a clear CTR/CPC winner emerging.
- Optimistic: ~45-50 subs, a scalable winner with CAC trending toward $2 and net-negative after Boosts.

## Sequence
1. Deploy the LP (still pending) + turn on beehiiv UTM capture.
2. Confirm Boost payouts don't require the Scale plan.
3. Launch the 3-angle matrix, optimize for Landing Page Views.
4. After ~3 days: cut the lowest-CTR angle, shift its $5 to the leader.
5. After ~20-30 subs on the leader: trust the CAC, switch to conversion optimization, scale budget.
