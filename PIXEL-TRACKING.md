# Property Playbook — Pixel Tracking & Retargeting

Granular customer-journey tracking across the two-domain funnel (our LP → beehiiv), built for
retargeting. Pixel in use: **`951250319950462`** ("Idiots Guide To RE"). The LP supports MULTIPLE
pixels — add IDs to `window.PP_PIXELS` and every event fires to all of them.

## The two-domain reality
The journey crosses domains, so the pixel must live on BOTH, using the SAME ID:
- **Our LP** (`property-playbook-lp.vercel.app`) — full control. Rich custom events. DONE.
- **Beehiiv** (`propertyplaybook.beehiiv.com`) — add the same pixel via beehiiv's native Meta
  Pixel integration so the subscribe-confirmation fires on the same pixel. (See beehiiv setup.)

Every event is auto-tagged with `creative_id` (= utm_content), `angle` (utm_term), and `campaign`
(utm_campaign), so audiences can be sliced by the exact creative someone saw.

## Event taxonomy

### On our LP (built + deployed)
| Stage | Event | Type | Fires when |
|---|---|---|---|
| Landed | `PageView` | standard | page load |
| Landed | `ViewContent` | standard | load — `content_name=angle`, `content_ids=[creative_id]` |
| Engaged | `PP_Scroll25/50/75/90` | custom | scroll depth thresholds |
| Engaged | `PP_Engaged15s` | custom | 15s on page |
| Intent | `PP_FormFocus` | custom | focused the email field |
| Intent | `PP_SubmitInvalid` | custom | submitted a bad email |
| **Lead** | `Lead` | standard | valid email submitted (+ **Advanced Matching** on hashed email) |

### On beehiiv (you add — same pixel ID)
| Stage | Event | How |
|---|---|---|
| Subscribe page | `PageView` | beehiiv native pixel integration |
| **Subscribed** | `CompleteRegistration` / `Subscribe` | beehiiv fires on confirmed subscribe |

That `Lead` (LP submit) → `CompleteRegistration` (beehiiv confirm) gap is the key drop-off you
asked about: people who started subscribing but didn't finish. It becomes its own retarget.

## Subscribe tracking WITHOUT Zapier (built 2026-06-07)
No Zapier. The subscribe conversion (`CompleteRegistration`) fires from a page WE host:
**`https://property-playbook-lp.vercel.app/welcome`**.

How it works: the LP stores `creative_id` + email in localStorage. On submit it hands off to
beehiiv subscribe. Set beehiiv's **"redirect after subscribe"** to `/welcome` — when the new
subscriber lands back on our origin, the welcome page reads localStorage and fires
`CompleteRegistration` on the pixel, attributed to the exact ad. Same browser, same origin, no
Zapier, no beehiiv API. Advanced Matching uses the stored email.

**To activate:** beehiiv → subscribe form / signup settings → **Redirect URL after subscription** →
`https://property-playbook-lp.vercel.app/welcome`. (This form setting is available on more beehiiv
plans than the native pixel integration. If your flow is double-opt-in across a new
browser/session, attribution may drop but the event still fires.)

This is the source for the "Subscribed" + "Started, not finished" audiences. Until it's wired,
optimize Meta on the LP `Lead` event (fully ours, already firing) — you are NOT blocked.

## Beehiiv native pixel (alternative, plan-gated)
1. beehiiv → **Settings → Integrations** (or **Web → Advanced**) → **Meta Pixel** → paste
   `951250319950462`. (Native pixel/conversion tracking is gated to paid plans — likely needs
   Scale, same plan question as Boosts.)
2. If your plan allows **custom head HTML**, you can instead paste the Meta base code there for
   full control. Either way, USE THE SAME PIXEL ID so the journey stitches together.
3. Turn on **UTM capture** on the subscribe form so attribution persists into the subscriber.

## Retargeting audiences (the payoff)
Create these as Website Custom Audiences (Ads Manager → Audiences, or programmatically — see
below). All driven by the pixel events above.

| Audience | Rule | Use |
|---|---|---|
| LP visitors (30d) | `PageView` | broad retarget |
| Angle viewers | `ViewContent` where content_name = turnkey / short_term | angle-matched retarget |
| Engaged, no submit | (`PP_Scroll50` OR `PP_Engaged15s`) AND NOT `Lead` | high-intent, new creative |
| Form-starters, no submit | `PP_FormFocus` AND NOT `Lead` | "almost in" nudge |
| **Started but didn't finish** | `Lead` AND NOT `CompleteRegistration` | "finish subscribing" — the drop-off |
| Subscribed | `CompleteRegistration` | EXCLUDE from acquisition; backend upsell |
| Leads (lookalike seed) | `Lead` | seed a 1% Lookalike for cheaper acquisition |

**Acquisition campaigns should EXCLUDE** "Leads" + "Subscribed" so you never pay to re-acquire.
**Lookalikes:** seed a 1% LAL from "Subscribed" (best) or "Leads" to lower CAC.

## CREATED programmatically (2026-06-07)

**Dedicated pixel:** `1334124178654448` ("Property Playbook"). The LP now fires to BOTH this and
the account pixel `951250319950462`. Audiences + conversions below are built on the dedicated pixel.

**Retargeting audiences (Website Custom Audiences):**
| ID | Audience |
|---|---|
| 120245404753900714 | PP — All LP visitors (30d) |
| 120245404754070714 | PP — Engaged, no submit (30d) |
| 120245404754110714 | PP — Form-started, no submit (30d) |
| 120245404754220714 | PP — Leads / LP submitted (90d) |
| 120245404754390714 | PP — Started, not finished (30d) |
| 120245404754420714 | PP — Subscribed (180d) |
| 120245404754460714 | PP — Viewed turnkey angle (30d) |

**Custom conversions:**
| ID | Type | Name |
|---|---|---|
| 1268876708652657 | LEAD | PP — Lead (LP submit) |
| 1517097253191901 | COMPLETE_REGISTRATION | PP — Subscribed |
| 1025353933170120 | OTHER | PP — Engaged 50% |
| 853830507440391 | OTHER | PP — Form Focus |
| 981973274454173 | OTHER | PP — LP Visit (URL) |

Note: audiences are EMPTY until traffic flows. "Subscribed" + "Started, not finished" only populate
once the beehiiv pixel is firing `CompleteRegistration` (add pixel `1334124178654448` to beehiiv).
To add more angle audiences (short_term, adu), clone the "Viewed turnkey" rule with a different
`content_name`.

## Programmatic / "different pixels & events" — what's possible with the API
We have the Meta token, so on request I can do these via the Marketing API (writes — your go):
- **Create a dedicated Property Playbook pixel** (`POST /act_.../adspixels`) for clean per-funnel
  data, then add its ID to `PP_PIXELS`.
- **Create the retargeting Custom Audiences above** (`POST /act_.../customaudiences` with pixel
  rules) — so you don't hand-build them.
- **Create Custom Conversions** (`POST /act_.../customconversions`) to optimize delivery toward a
  specific event (e.g. Lead) once volume exists.

## Reliability upgrade (phase 2): Conversions API (CAPI)
Browser pixels lose ~10-30% of events to iOS/ad-blockers. CAPI sends the same events server-side
with an `event_id` for dedup. The LP is static, so this means adding one Vercel serverless
function that forwards `Lead`/`PageView` to Meta. Recommended once the funnel is spending.

## Verify it's working
Use the **Meta Pixel Helper** Chrome extension on the LP, or Events Manager → **Test Events**.
You should see PageView + ViewContent on load, scroll/engagement events, and Lead on submit.
