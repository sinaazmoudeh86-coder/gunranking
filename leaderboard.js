/* Global leaderboard client — talks straight to Supabase's REST API (PostgREST),
   no SDK required. Exposes window.Leaderboard:
     .enabled              true when config.js has Supabase credentials
     .fetchBoard(month)    -> { entries: top 10, total } for the month
     .submit(row)          -> inserted row ({ name, score, hits, month, caliber })
     .rank(month, score)   -> 1-based rank (count of strictly-better scores + 1)
   All calls reject on network/HTTP failure — callers fall back to the
   on-device scoreboard. */
(function () {
  const cfg = window.APP_CONFIG || {};
  const BASE = (cfg.SUPABASE_URL || "").replace(/\/+$/, "");
  const KEY = cfg.SUPABASE_ANON_KEY || "";
  const enabled = !!(BASE && KEY);

  function headers(extra) {
    const h = { "apikey": KEY, "Content-Type": "application/json" };
    // Legacy JWT-style anon keys ("eyJ...") also go in the Authorization header;
    // new publishable keys ("sb_publishable_...") must NOT — apikey alone is correct.
    if (KEY.indexOf("sb_") !== 0) h["Authorization"] = "Bearer " + KEY;
    return Object.assign(h, extra || {});
  }

  async function fetchBoard(month) {
    const url = BASE + "/rest/v1/scores?select=id,name,score,hits,caliber,created_at"
      + "&month=eq." + encodeURIComponent(month)
      + "&order=score.desc,created_at.asc&limit=5";
    const res = await fetch(url, { headers: headers({ "Prefer": "count=exact" }) });
    if (!res.ok) throw new Error("leaderboard fetch failed: " + res.status);
    const entries = await res.json();
    const cr = res.headers.get("content-range") || "";
    const total = parseInt(cr.split("/")[1], 10);
    return { entries, total: isNaN(total) ? entries.length : total };
  }

  async function submit(row) {
    const res = await fetch(BASE + "/rest/v1/scores", {
      method: "POST",
      headers: headers({ "Prefer": "return=representation" }),
      body: JSON.stringify(row)
    });
    if (!res.ok) throw new Error("score submit failed: " + res.status);
    const rows = await res.json();
    return rows[0];
  }

  async function rank(month, score) {
    const url = BASE + "/rest/v1/scores?select=id"
      + "&month=eq." + encodeURIComponent(month)
      + "&score=gt." + encodeURIComponent(score);
    const res = await fetch(url, { method: "HEAD", headers: headers({ "Prefer": "count=exact" }) });
    if (!res.ok) throw new Error("rank fetch failed: " + res.status);
    const cr = res.headers.get("content-range") || "";
    const better = parseInt(cr.split("/")[1], 10);
    return (isNaN(better) ? 0 : better) + 1;
  }

  window.Leaderboard = { enabled, fetchBoard, submit, rank };
})();
