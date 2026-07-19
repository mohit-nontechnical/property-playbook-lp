// ============================================================================
// LEAD SYNC HUB — one endpoint, fans every lead out to BOTH GoHighLevel + beehiiv.
// No Zapier. Called by: the LP form (inline) and the Meta Lead Ads webhook.
//
// POST JSON: { email, name?, phone?, utm_source?, utm_medium?, utm_campaign?,
//              utm_content?, utm_term?, source? }
// Returns:   { ok, ghl:{ok,id?,error?}, beehiiv:{ok,id?,error?} }
//
// Env (set on this Vercel project):
//   GHL_PIT, GHL_LOCATION_ID, GHL_API_VERSION (default 2021-07-28)
//   BEEHIIV_API_KEY, BEEHIIV_PUBLICATION_ID
// ============================================================================

const GHL_BASE = "https://services.leadconnectorhq.com";
const BEE_BASE = "https://api.beehiiv.com/v2";

function validEmail(e) {
  return typeof e === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
}

async function toGHL(lead) {
  const PIT = process.env.GHL_PIT;
  const LOC = process.env.GHL_LOCATION_ID;
  const VER = process.env.GHL_API_VERSION || "2021-07-28";
  if (!PIT || !LOC) return { ok: false, error: "GHL env not set" };
  const [firstName, ...rest] = (lead.name || "").trim().split(/\s+/);
  const tags = ["property-playbook", "meta-ad"];
  if (lead.utm_campaign) tags.push(lead.utm_campaign);
  if (lead.utm_term) tags.push("angle:" + lead.utm_term);
  const body = {
    locationId: LOC,
    email: lead.email,
    firstName: firstName || undefined,
    lastName: rest.join(" ") || undefined,
    phone: lead.phone || undefined,
    source: lead.source || "Meta Ad — Property Playbook",
    tags,
    customFields: [
      lead.utm_content ? { key: "creative_id", field_value: lead.utm_content } : null,
      lead.utm_campaign ? { key: "utm_campaign", field_value: lead.utm_campaign } : null,
      lead.utm_term ? { key: "angle", field_value: lead.utm_term } : null,
    ].filter(Boolean),
  };
  try {
    const r = await fetch(`${GHL_BASE}/contacts/upsert`, {
      method: "POST",
      headers: { Authorization: `Bearer ${PIT}`, Version: VER, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: (j.message || `HTTP ${r.status}`).toString().slice(0, 160) };
    return { ok: true, id: j.contact?.id || j.id };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function toBeehiiv(lead, sendWelcome) {
  const KEY = process.env.BEEHIIV_API_KEY;
  const PUB = process.env.BEEHIIV_PUBLICATION_ID;
  if (!KEY || !PUB) return { ok: false, error: "beehiiv env not set" };
  const body = {
    email: lead.email,
    reactivate_existing: false,
    send_welcome_email: sendWelcome !== false,
    utm_source: lead.utm_source || "meta",
    utm_medium: lead.utm_medium || "paid_social",
    utm_campaign: lead.utm_campaign || undefined,
    // Top-level utm_content/utm_term so they land as subscriber ATTRIBUTES —
    // utm_content (= creative_id) is the warehouse join key for net CAC per
    // creative. Custom fields below stay as a belt-and-suspenders copy.
    utm_content: lead.utm_content || undefined,
    utm_term: lead.utm_term || undefined,
    referring_site: "property-playbook-lp.vercel.app",
    custom_fields: [
      lead.utm_content ? { name: "creative_id", value: lead.utm_content } : null,
      lead.utm_term ? { name: "angle", value: lead.utm_term } : null,
    ].filter(Boolean),
  };
  try {
    const r = await fetch(`${BEE_BASE}/publications/${PUB}/subscriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: (j.errors?.[0]?.message || j.message || `HTTP ${r.status}`).toString().slice(0, 160) };
    return { ok: true, id: j.data?.id };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "POST only" });
    return;
  }
  let lead = req.body;
  if (typeof lead === "string") { try { lead = JSON.parse(lead); } catch { lead = {}; } }
  lead = lead || {};
  if (!validEmail(lead.email)) {
    res.status(400).json({ ok: false, error: "valid email required" });
    return;
  }
  const [ghl, beehiiv] = await Promise.all([toGHL(lead), toBeehiiv(lead, lead.sendWelcome)]);
  res.status(ghl.ok || beehiiv.ok ? 200 : 502).json({ ok: ghl.ok && beehiiv.ok, ghl, beehiiv });
};
