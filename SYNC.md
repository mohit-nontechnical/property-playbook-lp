# Lead Sync — FB / LP → GoHighLevel + beehiiv (no Zapier)

Every lead, from any source, fanned out to **both** GoHighLevel (CRM / backend sales) and
beehiiv (newsletter / Boosts). One endpoint does the fan-out. No Zapier.

## The hub
`https://property-playbook-lp.vercel.app/api/lead-sync` (serverless function, deployed).

`POST` JSON `{ email, name?, phone?, utm_source?, utm_medium?, utm_campaign?, utm_content?, utm_term?, source? }`
→ writes a **GHL contact** (upsert, tagged `property-playbook` + `meta-ad` + campaign + `angle:<utm_term>`,
with `creative_id` custom field) **and** a **beehiiv subscriber** (with UTM attribution + creative_id).
Returns `{ ok, ghl:{ok,id}, beehiiv:{ok,id} }`. Verified working (GHL 181 contacts, beehiiv = Property Playbook pub).

## Sources

### 1. Landing-page leads — WIRED
The LP form fires a fire-and-forget POST to `/api/lead-sync` on submit (plus the existing pixel
`Lead` + beehiiv flow). So every LP signup lands in GHL + beehiiv with full creative attribution.
If the hub env isn't set yet, it no-ops and the beehiiv redirect still subscribes — the funnel never breaks.

### 2. Facebook Lead Ads (instant forms) — GHL NATIVE (chosen path)
No Zapier, no token-scope wrangling. Do these in GHL:

**a. Connect Facebook in GHL**
- GHL → **Settings → Integrations → Facebook** → Connect → authorize → select the
  **Idiot's Guide To Real Estate** Page → map/allow its lead forms.
- FB instant-form submissions now flow into GHL as **contacts** automatically.

**b. Push those FB leads into beehiiv via a GHL Workflow (native webhook)**
- GHL → **Automation → Workflows → Create**.
- **Trigger:** "Facebook Lead Form Submitted" (or "Contact Created" filtered to source = Facebook).
- **Action:** "Webhook" → **POST** to `https://property-playbook-lp.vercel.app/api/lead-sync`
  - Header: `Content-Type: application/json`
  - Body (JSON, using GHL merge fields):
    ```json
    {
      "email": "{{contact.email}}",
      "name": "{{contact.name}}",
      "phone": "{{contact.phone}}",
      "source": "Facebook Lead Ad",
      "utm_campaign": "{{contact.attributionSource.utmCampaign}}",
      "utm_content": "{{contact.attributionSource.utmContent}}"
    }
    ```
  (Leave the UTM lines out if those attribution fields aren't populated — the hub still subscribes.)
- Result: every FB lead lands in GHL (native) AND beehiiv (via the hub). Done.

### Optional / dormant: Meta leadgen webhook
`/api/leadgen-webhook.js` is built and the verify handshake works, but it's **inactive** (Meta token
removed from this project for security, page not subscribed). Only needed if you ever want to bypass
GHL and have Meta post leads straight to the hub — would require a token with `leads_retrieval` +
`pages_manage_metadata` and the App-dashboard webhook config. Not used in the chosen architecture.

## Env to add (you, in Vercel — these are YOUR secrets)
Project **property-playbook-lp** → Settings → Environment Variables (Production + Preview):

| Key | Where the value lives |
|---|---|
| `GHL_PIT` | `~/Documents/ghl_mcp/.env` (recommend a NEW, contacts-only Private Integration Token for this) |
| `GHL_LOCATION_ID` | `~/Documents/ghl_mcp/.env` |
| `GHL_API_VERSION` | `2021-07-28` |
| `BEEHIIV_API_KEY` | `~/Documents/igtre-studio/.env.local` |
| `BEEHIIV_PUBLICATION_ID` | `~/Documents/igtre-studio/.env.local` |

Then redeploy (or tell me and I'll redeploy + run a test lead, then clean it up).

## Security notes
- `/api/lead-sync` is public by nature (the browser form calls it) — like any newsletter signup
  backend. It validates email. Add rate-limiting / a honeypot later if abused.
- **Use a dedicated, minimally-scoped GHL token** (contacts write only) here, not your full PIT —
  the LP project is public-facing.

## The full architecture (chosen)
```
AD CREATION:  Creative Factory ──(Meta Marketing API)──► PAUSED Meta campaigns  [built ✅]

CAPTURE:
  LP form ─────────────────────► /api/lead-sync ──► GHL contact + beehiiv subscriber  [LIVE ✅]
  FB Lead Ads ─(GHL native FB)─► GHL contact ─(GHL workflow webhook)─► /api/lead-sync ─► beehiiv
```
- **Ad creation** stays on the direct Meta API from Creative Factory (Export to Meta button).
- **LP leads** → hub → GHL + beehiiv. Live and verified.
- **FB Lead Ads** → GHL native → workflow webhook → hub → beehiiv. (GHL-side config above.)

Result: one lead → CRM + newsletter, every time. LP leads carry full creative_id attribution;
FB-form leads carry whatever GHL captures.
