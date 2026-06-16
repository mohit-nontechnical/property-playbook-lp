// ============================================================================
// META LEAD ADS WEBHOOK — FB instant-form leads → the sync hub (GHL + beehiiv).
// Meta posts a leadgen_id; we fetch the lead's fields via the Graph API and forward
// to /api/lead-sync. No Zapier.
//
// Env (on this Vercel project):
//   META_VERIFY_TOKEN       - a secret string you also paste in the App webhook config
//   META_SYSTEM_USER_TOKEN  - token with leads_retrieval to read the lead fields
// ============================================================================

const GRAPH = "https://graph.facebook.com/v21.0";
const SYNC_URL = "https://property-playbook-lp.vercel.app/api/lead-sync";

module.exports = async (req, res) => {
  const VERIFY = process.env.META_VERIFY_TOKEN;
  const TOKEN = process.env.META_SYSTEM_USER_TOKEN;

  // 1. Verification handshake (Meta calls this once when you save the webhook)
  if (req.method === "GET") {
    const q = req.query || {};
    if (q["hub.mode"] === "subscribe" && q["hub.verify_token"] === VERIFY) {
      res.status(200).send(q["hub.challenge"]);
      return;
    }
    res.status(403).send("verification failed");
    return;
  }
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  // 2. Lead events
  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = {}; } }
  const entries = (body && body.entry) || [];
  const results = [];

  for (const e of entries) {
    for (const ch of e.changes || []) {
      if (ch.field !== "leadgen") continue;
      const leadgenId = ch.value && ch.value.leadgen_id;
      if (!leadgenId) continue;
      try {
        const lr = await fetch(`${GRAPH}/${leadgenId}?fields=field_data,campaign_name,ad_name,form_id&access_token=${TOKEN}`);
        const lead = await lr.json();
        if (lead.error) { results.push({ leadgenId, error: lead.error.message }); continue; }
        const f = {};
        (lead.field_data || []).forEach((x) => { f[x.name] = (x.values || [])[0]; });
        const payload = {
          email: f.email,
          name: f.full_name || f.name || [f.first_name, f.last_name].filter(Boolean).join(" ") || undefined,
          phone: f.phone_number || f.phone || undefined,
          source: "Meta Lead Ad: " + (lead.ad_name || lead.campaign_name || "form"),
          utm_source: "meta",
          utm_medium: "paid_social",
          utm_campaign: lead.campaign_name || undefined,
          // hidden form fields named utm_content/utm_term map straight through if present
          utm_content: f.utm_content || undefined,
          utm_term: f.utm_term || undefined,
        };
        const sr = await fetch(SYNC_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        results.push({ leadgenId, synced: sr.ok });
      } catch (err) {
        results.push({ leadgenId, error: err.message });
      }
    }
  }

  // Always 200 so Meta doesn't keep retrying
  res.status(200).json({ received: true, results });
};
