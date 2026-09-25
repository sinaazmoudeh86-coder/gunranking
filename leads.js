/* Player capture client — name + email + marketing consent for the
   America 250 promo. Talks straight to Supabase's REST API (PostgREST),
   same pattern as engine/leaderboard.js. Exposes window.LeadsDB:
     .enabled            true when config.js has Supabase credentials
     .submit(lead)       upsert by email -> { name, email, marketing,
                          best_score, caliber, month }
     .fetchAll()         -> [ all captured players ] (admin export)
   All calls reject on network/HTTP failure; callers fall back to the
   on-device mirror in localStorage ("gag_range_leads"). */
(function () {
  const cfg = window.APP_CONFIG || {};
  const BASE = (cfg.SUPABASE_URL || "").replace(/\/+$/, "");
  const KEY = cfg.SUPABASE_ANON_KEY || "";
  const enabled = !!(BASE && KEY);

  function headers(extra) {
    const h = { "apikey": KEY, "Content-Type": "application/json" };
    if (KEY.indexOf("sb_") !== 0) h["Authorization"] = "Bearer " + KEY;
    return Object.assign(h, extra || {});
  }

  // Upsert on the unique email column (resolution=merge-duplicates).
  async function submit(lead) {
    const body = {
      name: lead.name, email: (lead.email || "").toLowerCase(),
      marketing: !!lead.marketing,
      best_score: lead.best_score || 0,
      caliber: lead.caliber || null, month: lead.month || null
    };
    const res = await fetch(BASE + "/rest/v1/leads?on_conflict=email", {
      method: "POST",
      headers: headers({ "Prefer": "resolution=merge-duplicates,return=representation" }),
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error("lead submit failed: " + res.status);
    const rows = await res.json();
    return rows[0];
  }

  async function fetchAll() {
    const url = BASE + "/rest/v1/leads"
      + "?select=name,email,marketing,best_score,caliber,month,created_at"
      + "&order=best_score.desc,created_at.desc&limit=10000";
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) throw new Error("leads fetch failed: " + res.status);
    return await res.json();
  }

  window.LeadsDB = { enabled, submit, fetchAll };
})();
