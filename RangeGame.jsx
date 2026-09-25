/* "Test Your Setup" — engine-accurate holdover trainer / precision-rifle qualifier.
   PHASE 1 (setup): the shooter builds their rig in-tab (caliber → load → barrel → zero → optic)
   and reviews a ballistic DOPE TREE (reticle holdovers) before running.
   PHASE 2 (run): a 4-stage course (100/300/500/1000 yd). Holds are hidden — read the wind,
   apply dope from memory, place the reticle, FIRE (with muzzle flash + recoil + impact FX).
   Impact is computed by the SAME engine (window.BallisticsSolver) and scored. Correct dope
   is revealed only after the course completes. Exposes window.RangeGame. */
(function () {
  const { useState, useMemo, useRef, useEffect } = React;

  const LEAD = [100, 300, 500, 1000];
  function genCourse() {
    const pool = []; for (let r = 125; r <= 975; r += 25) if (!LEAD.includes(r)) pool.push(r);
    const extra = [];
    while (extra.length < 6 && pool.length) { const i = Math.floor(Math.random() * pool.length); extra.push(pool.splice(i, 1)[0]); }
    return LEAD.concat(extra);   // 10 stations: fixed 100/300/500/1000 then 6 random
  }
  function todayKey() { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function monthKey() { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"); }
  function loadHS() { try { const h = JSON.parse(localStorage.getItem("gag_range_hs") || "{}"); if (h.month !== monthKey()) return { month: monthKey(), days: {}, monthBest: 0 }; return h; } catch (e) { return { month: monthKey(), days: {}, monthBest: 0 }; } }
  function saveHS(h) { try { localStorage.setItem("gag_range_hs", JSON.stringify(h)); } catch (e) {} }
  function loadBoard() { try { const b = JSON.parse(localStorage.getItem("gag_range_board") || "{}"); if (b.month !== monthKey()) return { month: monthKey(), entries: [] }; return b; } catch (e) { return { month: monthKey(), entries: [] }; } }
  function saveBoard(b) { try { localStorage.setItem("gag_range_board", JSON.stringify(b)); } catch (e) {} }
  function monthName() { return new Date().toLocaleString(undefined, { month: "long" }); }
  const CW = 480, C = 240, USABLE = 190;
  const PLATE_IN = 18;
  const WIND_HOURS = [2, 3, 4, 8, 9, 10];
  // ----- downrange lane perspective: map a range (yd) to a screen Y on the ground,
  // and the lane half-width at that depth. Gives the "further and further away" read. -----
  const LANE_YH = 262, LANE_YNEAR = 446, LANE_D0 = 195, LANE_HALF = 174;
  function laneY(range) { return LANE_YH + (LANE_YNEAR - LANE_YH) * (LANE_D0 / (LANE_D0 + range)); }
  function laneT(y) { return (y - LANE_YH) / (LANE_YNEAR - LANE_YH); }   // 0 at horizon → 1 near

  const QUALS = [
    { min: 9, name: "MASTER", cls: "q-master" },
    { min: 7, name: "EXPERT", cls: "q-expert" },
    { min: 5, name: "SHARPSHOOTER", cls: "q-sharp" },
    { min: 3, name: "MARKSMAN", cls: "q-marks" },
    { min: 0, name: "UNQUALIFIED", cls: "q-none" }
  ];

  function nz(v, d) { let s = (+v).toFixed(d); if (/^-0(\.0+)?$/.test(s)) s = s.slice(1); return s; }
  function genWind() {
    return { spd: 4 + Math.round(Math.random() * 11), hour: WIND_HOURS[Math.floor(Math.random() * WIND_HOURS.length)] };
  }
  function genWindSeq(base, n) { const a = []; for (let i = 0; i < n; i++) { const sign = Math.random() < 0.5 ? -1 : 1; a.push(Math.max(1, Math.round(base.spd + sign * (5 + Math.random() * 5)))); } return a; }
  function windValue(hour) { return (hour === 3 || hour === 9) ? "FULL" : "¾"; }
  function windPush(hour) { return (hour >= 1 && hour <= 5) ? "RIGHT→LEFT" : "LEFT→RIGHT"; }
  function loadPB() { try { return JSON.parse(localStorage.getItem("gag_range_pb") || "{}"); } catch (e) { return {}; } }
  function savePB(p) { try { localStorage.setItem("gag_range_pb", JSON.stringify(p)); } catch (e) {} }
  // ----- player capture (name/email/marketing) — on-device mirror of the cloud leads DB -----
  function loadLeads() { try { const d = JSON.parse(localStorage.getItem("gag_range_leads") || "null"); return d && Array.isArray(d.rows) ? d : { v: 1, rows: [] }; } catch (e) { return { v: 1, rows: [] }; } }
  function saveLeadLocal(lead) {
    try {
      const db = loadLeads(); const em = (lead.email || "").toLowerCase(); const now = new Date().toISOString();
      const i = db.rows.findIndex(r => (r.email || "").toLowerCase() === em);
      if (i >= 0) db.rows[i] = { ...db.rows[i], ...lead, best_score: Math.max(db.rows[i].best_score || 0, lead.best_score || 0), updated_at: now };
      else db.rows.push({ ...lead, created_at: now, updated_at: now });
      localStorage.setItem("gag_range_leads", JSON.stringify(db));
    } catch (e) {}
  }
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function uniq(a) { return Array.from(new Set(a)); }

  function RangeGame({ state, load, cal, metric }) {
    const data = window.BALLISTICS_DATA;

    // ----- rig configuration (editable in-tab; seeded from the Lab) -----
    const [cfg, setCfg] = useState(() => {
      const loads = cal.loads.filter(l => l.mfr === load.mfr && l.line === load.line);
      return {
        caliberId: cal.id, mfr: load.mfr, line: load.line,
        loadIdx: Math.max(0, loads.indexOf(load)),
        barrel: state.barrelLength, zeroRange: state.zeroRange, scopeUnit: state.scopeUnit,
        sightHeight: state.sightHeight != null ? state.sightHeight : 1.8,
        twist: cal.defaultTwist != null ? cal.defaultTwist : 10
      };
    });
    const gcal = data.find(c => c.id === cfg.caliberId);
    const gMfrs = useMemo(() => uniq(gcal.loads.map(l => l.mfr)), [gcal]);
    const gLines = useMemo(() => uniq(gcal.loads.filter(l => l.mfr === cfg.mfr).map(l => l.line)), [gcal, cfg.mfr]);
    const gLoads = useMemo(() => gcal.loads.filter(l => l.mfr === cfg.mfr && l.line === cfg.line), [gcal, cfg.mfr, cfg.line]);
    const gload = gLoads[cfg.loadIdx] || gLoads[0] || gcal.loads[0];
    const scopeUnit = cfg.scopeUnit;
    const groups = useMemo(() => { const g = {}; data.forEach(c => { (g[c.category] = g[c.category] || []).push(c); }); return g; }, [data]);

    function chooseCaliber(id) { const c = data.find(x => x.id === id); const m = c.loads[0].mfr; const ln = c.loads.find(l => l.mfr === m).line; setCfg(s => ({ ...s, caliberId: id, mfr: m, line: ln, loadIdx: 0, barrel: c.defaultBarrel, twist: c.defaultTwist != null ? c.defaultTwist : 10 })); }
    function chooseMfr(m) { const ln = gcal.loads.find(l => l.mfr === m).line; setCfg(s => ({ ...s, mfr: m, line: ln, loadIdx: 0 })); }
    function chooseLine(ln) { setCfg(s => ({ ...s, line: ln, loadIdx: 0 })); }

    const dragModel = gload.bcG7 ? "G7" : "G1";
    const activeMV = window.BallisticsSolver.adjustMV(gload.mv, gload.testBarrel, cfg.barrel, gcal.fpsPerInch);

    const [phase, setPhase] = useState("intro");   // hero popup first; START enters the game; EDIT SETUP returns to setup
    const [wind, setWind] = useState(genWind);
    const [windSeq, setWindSeq] = useState(() => genWindSeq(wind, 10));
    const [course, setCourse] = useState(genCourse);
    const [hs, setHs] = useState(loadHS);
    const [board, setBoard] = useState(loadBoard);
    const [nameInput, setNameInput] = useState(() => { try { return localStorage.getItem("gag_range_name") || ""; } catch (e) { return ""; } });
    const [emailInput, setEmailInput] = useState(() => { try { return localStorage.getItem("gag_range_email") || ""; } catch (e) { return ""; } });
    const [marketing, setMarketing] = useState(() => { try { const v = localStorage.getItem("gag_range_marketing"); return v === null ? true : v === "1"; } catch (e) { return true; } });
    const [capErr, setCapErr] = useState("");
    const [submitted, setSubmitted] = useState(null);
    // global leaderboard (Supabase via engine/leaderboard.js) — falls back to the on-device board
    const lbOn = !!(window.Leaderboard && window.Leaderboard.enabled);
    const [gboard, setGboard] = useState(null);     // { entries: top 10, total }
    const [gRank, setGRank] = useState(null);
    const [lbErr, setLbErr] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const result = useMemo(() => window.BallisticsSolver.solve({
      bcG1: gload.bcG1, bcG7: gload.bcG7, dragModel,
      muzzleVelocity: activeMV, bulletWeight: gload.grains,
      sightHeight: cfg.sightHeight, zeroRange: cfg.zeroRange,
      shootingAngle: 0, windSpeed: wind.spd, windDir: wind.hour,
      tempF: 59, altitudeFt: 0, twist: cfg.twist, diameter: gcal.diameter, spinDrift: true, maxRange: 1000, increment: 25
    }), [gload, dragModel, activeMV, cfg.zeroRange, cfg.sightHeight, cfg.twist, gcal, wind]);

    const holds = useMemo(() => course.map(r => {
      const row = result.rows.find(x => x.rangeYd === r) || result.rows[result.rows.length - 1];
      return { range: r, dropU: row["drop" + scopeUnit], windU: row["wind" + scopeUnit], velocity: row.velocity, energy: row.energy, dropIn: row.dropIn };
    }), [result, scopeUnit]);

    // ----- run state -----
    const [stationIdx, setStationIdx] = useState(0);
    const [aim, setAim] = useState({ x: C, y: C - 20 });
    const [shots, setShots] = useState([]);
    const [fired, setFired] = useState(null);
    const [recoil, setRecoil] = useState(false);
    const [beginTs, setBeginTs] = useState(() => Date.now());
    const [endTs, setEndTs] = useState(null);
    const [now, setNow] = useState(Date.now());
    const [pb, setPb] = useState(loadPB);
    const svgRef = useRef(null);
    const isTouch = useRef(false);
    const dragging = useRef(false);
    const [zoom, setZoom] = useState(12);
    const complete = phase === "complete";

    useEffect(() => { if (phase !== "run") return; const t = setInterval(() => setNow(Date.now()), 200); return () => clearInterval(t); }, [phase]);

    // pull the global top-10 when the results modal opens
    useEffect(() => {
      if (phase !== "complete" || !lbOn) return;
      let alive = true;
      window.Leaderboard.fetchBoard(monthKey())
        .then(b => { if (alive) { setGboard(b); setLbErr(false); } })
        .catch(() => { if (alive) setLbErr(true); });
      return () => { alive = false; };
    }, [phase]);

    // prefetch the global top scores so the in-run leaderboard is live
    useEffect(() => {
      if (!lbOn) return;
      let alive = true;
      window.Leaderboard.fetchBoard(monthKey())
        .then(b => { if (alive) { setGboard(b); setLbErr(false); } })
        .catch(() => { if (alive) setLbErr(true); });
      return () => { alive = false; };
    }, []);

    const cur = holds[stationIdx];
    const geo = useMemo(() => {
      const dropU = Math.abs(cur.dropU);
      const gust = windSeq[stationIdx] || wind.spd;
      const driftU = wind.spd > 0 ? cur.windU * gust / wind.spd : cur.windU;
      const ppu = (zoom / 12) * (scopeUnit === "MIL" ? 20 : 6);   // first focal plane: subtension scales with magnification
      const factor = scopeUnit === "MIL" ? 3.43775 : 1.04720;
      const subU = PLATE_IN / (factor * cur.range / 100);
      const targetR = Math.max(15, (subU / 2) * ppu);
      const baseY = laneY(cur.range);                    // feet of the silhouette, on the lane
      const tcx = C, tcy = baseY - targetR * 1.35;        // A-zone center sits above the feet
      return { dropU, driftU, unitsToPx: ppu, tcx, tcy, targetR, baseY, correctAim: { x: tcx - driftU * ppu, y: tcy - dropU * ppu } };
    }, [cur, scopeUnit, zoom, windSeq, stationIdx, wind.spd]);

    // How far ABOVE the fingertip the reticle floats on touch, so the thumb
    // never covers the target / point of impact (in viewBox units; CW = 480).
    const TOUCH_LIFT = 78;
    function toSvg(e, lift) {
      const r = svgRef.current.getBoundingClientRect();
      let x = (e.clientX - r.left) / r.width * CW, y = (e.clientY - r.top) / r.height * CW - (lift || 0);
      return { x: Math.max(6, Math.min(CW - 6, x)), y: Math.max(6, Math.min(CW - 6, y)) };
    }
    function onMove(e) { if (!fired && !complete) setAim(toSvg(e)); }
    function onTouchAim(e) {
      if (fired || complete) return;
      isTouch.current = true;
      dragging.current = true;
      const t = e.touches && e.touches[0];
      if (t) { setAim(toSvg(t, TOUCH_LIFT)); }
    }
    // Track the drag on window so the thumb can move OUTSIDE the optic panel
    // (e.g. rest below the glass) and still steer the reticle.
    useEffect(() => {
      function move(e) {
        if (!dragging.current || fired || complete) return;
        const t = e.touches && e.touches[0];
        if (t) { setAim(toSvg(t, TOUCH_LIFT)); e.preventDefault(); }
      }
      function end() { dragging.current = false; }
      window.addEventListener("touchmove", move, { passive: false });
      window.addEventListener("touchend", end);
      window.addEventListener("touchcancel", end);
      return () => {
        window.removeEventListener("touchmove", move, { passive: false });
        window.removeEventListener("touchend", end);
        window.removeEventListener("touchcancel", end);
      };
    }, [fired, complete]);

    function fire() {
      if (fired || complete) return;
      const g = geo;
      const impact = { x: aim.x + g.driftU * g.unitsToPx, y: aim.y + g.dropU * g.unitsToPx };
      const dx = impact.x - g.tcx, dy = impact.y - g.tcy, distPx = Math.hypot(dx, dy);
      const distU = distPx / g.unitsToPx, ratio = distPx / g.targetR, hit = distPx <= g.targetR;
      setFired({ range: cur.range, hit, distU, vMiss: dy / g.unitsToPx, hMiss: dx / g.unitsToPx,
        score: hit ? Math.round(100 - 55 * ratio) : 0, ring: hit ? Math.max(5, Math.ceil(10 - ratio * 5)) : 0, impact });
      setShots(s => [...s, { range: cur.range, hit, distU, vMiss: dy / g.unitsToPx, hMiss: dx / g.unitsToPx, score: hit ? Math.round(100 - 55 * ratio) : 0, ring: hit ? Math.max(5, Math.ceil(10 - ratio * 5)) : 0, impact }]);
      setRecoil(true); setTimeout(() => setRecoil(false), 340);
    }
    function next() {
      if (stationIdx < course.length - 1) { setStationIdx(i => i + 1); setFired(null); setAim({ x: C, y: C - 20 }); }
      else finish();
    }
    function begin(base) { const b = base || wind; setWindSeq(genWindSeq(b, course.length)); setPhase("run"); setStationIdx(0); setShots([]); setFired(null); setEndTs(null); setBeginTs(Date.now()); setAim({ x: C, y: C - 20 }); setSubmitted(null); setGboard(null); setGRank(null); setLbErr(false); setSubmitting(false); }
    function submitScore() {
      if (submitting) return;
      const nm = (nameInput || "").trim().slice(0, 18).toUpperCase() || "ANON";
      try { localStorage.setItem("gag_range_name", nm); } catch (e) {}
      const rig = gcal.name + " · " + gload.grains + "gr " + gload.line;
      const entry = { name: nm, score: finalScore, hits, ts: Date.now(), caliber: rig };
      const logLocal = () => {
        const b = { month: monthKey(), entries: [...board.entries, entry].sort((a, x) => x.score - a.score).slice(0, 50) };
        setBoard(b); saveBoard(b); setSubmitted(entry);
      };
      if (!lbOn) { logLocal(); return; }
      setSubmitting(true);
      window.Leaderboard.submit({ name: nm, score: finalScore, hits, month: monthKey(), caliber: rig })
        .then(async (row) => {
          const [r, b] = await Promise.all([
            window.Leaderboard.rank(monthKey(), finalScore),
            window.Leaderboard.fetchBoard(monthKey())
          ]);
          setGRank(r); setGboard(b); setLbErr(false);
          setSubmitted({ ...entry, id: row && row.id });
        })
        .catch(() => { setLbErr(true); logLocal(); })
        .finally(() => setSubmitting(false));
    }
    function finish() {
      setPhase("complete"); setEndTs(Date.now());
      const hits = shots.filter(s => s.hit).length, clean = hits === course.length;
      const tSecs = Math.floor((Date.now() - beginTs) / 1000);
      const tBonus = Math.max(0, Math.min(300, Math.round((180 - tSecs) * 1.6)));
      const total = shots.reduce((a, s) => a + s.score, 0) + tBonus;
      const nx = { ...pb, bestScore: Math.max(pb.bestScore || 0, total), bestHits: Math.max(pb.bestHits || 0, hits), runs: (pb.runs || 0) + 1 };
      if (clean) { nx.cleanRuns = (pb.cleanRuns || 0) + 1; nx.fastestClean = pb.fastestClean ? Math.min(pb.fastestClean, Date.now() - beginTs) : Date.now() - beginTs; }
      setPb(nx); savePB(nx);
      const tk = todayKey(); const nh = { month: monthKey(), days: { ...hs.days }, monthBest: Math.max(hs.monthBest || 0, total) };
      nh.days[tk] = Math.max(hs.days[tk] || 0, total); setHs(nh); saveHS(nh);
      captureLead(total);
    }
    // Every start / retry rerolls the wind AND the random stations — no two runs read the same.
    function restart() { const nw = genWind(); setWind(nw); setCourse(genCourse()); begin(nw); }
    // upsert the player into the capture DB (local mirror + cloud if configured)
    function captureLead(score) {
      const nm = (nameInput || "").trim().slice(0, 60);
      const em = (emailInput || "").trim().toLowerCase();
      if (!em || !EMAIL_RE.test(em)) return;
      const lead = { name: nm, email: em, marketing: !!marketing, best_score: Math.max(pb.bestScore || 0, score || 0), caliber: gcal.name, month: monthKey() };
      saveLeadLocal(lead);
      if (window.LeadsDB && window.LeadsDB.enabled) window.LeadsDB.submit(lead).catch(() => {});
    }
    // validate the gate, persist the player, then run `go` (start course or open setup)
    function gateThen(go) {
      const nm = (nameInput || "").trim(); const em = (emailInput || "").trim();
      if (nm.length < 2) { setCapErr("Please enter your name."); return; }
      if (!EMAIL_RE.test(em)) { setCapErr("Please enter a valid email address."); return; }
      setCapErr("");
      try { localStorage.setItem("gag_range_name", nm.slice(0, 60)); localStorage.setItem("gag_range_email", em.toLowerCase()); localStorage.setItem("gag_range_marketing", marketing ? "1" : "0"); } catch (e) {}
      captureLead();
      go();
    }

    const hits = shots.filter(s => s.hit).length;
    const fdCount = shots.length;
    const acc = fdCount ? Math.round(hits / fdCount * 100) : 0;
    const sessionScore = shots.reduce((a, s) => a + s.score, 0);
    let streak = 0; for (let i = shots.length - 1; i >= 0; i--) { if (shots[i].hit) streak++; else break; }
    const secs = Math.floor((((complete && endTs) ? endTs : now) - beginTs) / 1000);
    const mmss = beginTs ? `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}` : "00:00";
    const timeBonus = Math.max(0, Math.min(300, Math.round((180 - secs) * 1.6)));
    const finalScore = sessionScore + timeBonus;

    const badges = useMemo(() => {
      const out = [], s0 = shots[0];
      if (s0 && s0.hit) out.push({ id: "fri", name: "First Round Impact", ico: "target" });
      if (s0 && s0.hit && (s0.distU / (geo.targetR / geo.unitsToPx)) < 0.5) out.push({ id: "cold", name: "Cold Bore", ico: "spark" });
      const k = shots.find(s => s.range === 1000); if (k && k.hit) out.push({ id: "k", name: "1000 Yard Expert", ico: "crosshair" });
      if (wind.spd >= 8 && shots.some(s => s.hit)) out.push({ id: "wind", name: "Wind Reader", ico: "wind" });
      if (complete && hits === course.length) out.push({ id: "prs", name: "Clean Stage Run", ico: "bolt" });
      return out;
    }, [shots, complete, hits, wind, geo]);
    const qual = QUALS.find(q => hits >= q.min);

    const distUnit = metric ? "m" : "yd";
    const rangeDisp = metric ? Math.round(cur.range * 0.9144) : cur.range;
    const curWind = windSeq[stationIdx] || wind.spd;   // actual wind for this shot — shown accurately in the call
    const pushRight = !(wind.hour >= 1 && wind.hour <= 5);   // wind from the left half pushes the bullet right

    // ===================== INTRO / PROMO HERO POPUP =====================
    if (phase === "intro") {
      return (
        <div className="rg-modal-overlay">
          <div className="rg-intro">
            <div className="rg-intro-body">
              <div className="rg-intro-kicker">GunRanking Range Challenge</div>
              <h2 className="rg-intro-title">Test Your Setup</h2>
              <p className="rg-intro-lede">Build your rifle, read the wind, and shoot a 10-station course from memory — then post your score to this month’s leaderboard.</p>

              <div className="rg-intro-capture">
                <div className="rg-intro-h"><window.UI.Icon name="bolt" size={15} /> Enter to play &amp; post your score</div>
                <div className="rg-cap-fields">
                  <input className="rg-cap-input" type="text" maxLength={60} placeholder="Full name" value={nameInput}
                    onChange={e => setNameInput(e.target.value)} />
                  <input className="rg-cap-input" type="email" maxLength={120} placeholder="Email address" value={emailInput}
                    onChange={e => setEmailInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") gateThen(() => restart()); }} />
                </div>
                <label className="rg-cap-opt">
                  <input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} />
                  <span>Yes — email me GunRanking rank updates and GrabAGun deals &amp; new arrivals.</span>
                </label>
                {capErr && <div className="rg-cap-err">{capErr}</div>}
              </div>

              <button className="rg-intro-start" onClick={() => gateThen(() => setPhase("setup"))}><window.UI.Icon name="crosshair" size={17} /> BUILD YOUR RIG &rarr;</button>
              <p className="rg-cap-fine">Step 1: dial in your exact rifle, load &amp; optic and study your dope &mdash; then start the course. Your name shows on the leaderboard; your email is only used to contact top finishers. Marketing emails only if you opt in above &mdash; unsubscribe anytime.</p>

              <div className="rg-intro-info">
                <div className="rg-intro-rulesbox">
                  <div className="rg-intro-h"><window.UI.Icon name="target" size={15} /> How it works</div>
                  <ol className="rg-intro-rules">
                    <li><b>10 stations, 100 → 1000 yd.</b> The first four ranges are fixed; the rest are called at random distances.</li>
                    <li><b>Holds are hidden.</b> Study your dope in setup, then shoot from memory — read the live wind and place the reticle yourself.</li>
                    <li><b>Wind is always live.</b> It shifts every shot and rerolls every run — no two strings read the same.</li>
                    <li><b>Score each station up to 100</b> (dead-center X). Finish under par <b>3:00</b> for up to <b>+300</b> time bonus.</li>
                    <li><b>Submit your name</b> to climb the monthly global leaderboard.</li>
                  </ol>
                </div>

                <div className="rg-intro-prize">
                  <div className="rg-intro-prize-head"><span className="rgp-star">★</span><span className="rg-intro-prize-title">Monthly leaderboard</span></div>
                  <div className="rg-intro-prize-body">
                    <p>Every month starts a new season. Post your best run and see where you rank against every shooter this month.</p>
                    <div className="rg-intro-deadline"><window.UI.Icon name="gauge" size={13} /> Board resets on the <b>1st</b>; full history is kept.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // ===================== SETUP PHASE =====================
    if (phase === "setup") {
      return (
        <div className="rg-setupwrap">
          <window.UI.Eyebrow icon="crosshair" label="Step 1 of 2 · Build Your Rig"
            title="Build your rig, review your dope, then test your holds"
            desc="Dial in the exact rifle, load and optic you run. Study the holdover tree below — then the course hides it and you shoot from memory." />

          <div className="rg-setupgrid">
            {/* config */}
            <div className="rg-card rg-cfg">
              <div className="rg-card-h">Rifle &amp; Load</div>
              <label className="rg-field"><span>Caliber</span>
                <select className="select" value={cfg.caliberId} onChange={e => chooseCaliber(e.target.value)}>
                  {Object.keys(groups).map(cat => <optgroup key={cat} label={cat}>{groups[cat].map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</optgroup>)}
                </select>
              </label>
              <div className="rg-field2">
                <label className="rg-field"><span>Manufacturer</span>
                  <select className="select" value={cfg.mfr} onChange={e => chooseMfr(e.target.value)}>{gMfrs.map(m => <option key={m} value={m}>{m}</option>)}</select>
                </label>
                <label className="rg-field"><span>Product line</span>
                  <select className="select" value={cfg.line} onChange={e => chooseLine(e.target.value)}>{gLines.map(l => <option key={l} value={l}>{l}</option>)}</select>
                </label>
              </div>
              <label className="rg-field"><span>Load</span>
                <select className="select" value={cfg.loadIdx} onChange={e => setCfg(s => ({ ...s, loadIdx: parseInt(e.target.value) }))}>
                  {gLoads.map((l, i) => <option key={i} value={i}>{l.grains}gr {l.type} · {l.mv} fps</option>)}
                </select>
              </label>
              <label className="rg-field"><span>Barrel length <b className="mono">{cfg.barrel.toFixed(1)}"</b></span>
                <input type="range" min="4" max={gcal.id === "50bmg" ? 45 : (gcal.category === "Pistol" ? 10 : 30)} step="0.5" value={cfg.barrel} onChange={e => setCfg(s => ({ ...s, barrel: parseFloat(e.target.value) }))} />
              </label>
              <div className="rg-field2">
                <label className="rg-field"><span>Zero range</span>
                  <div className="seg-mini">{[36, 50, 100, 200, 300].map(z => <button key={z} type="button" className={cfg.zeroRange === z ? "active" : ""} onClick={() => setCfg(s => ({ ...s, zeroRange: z }))}>{z}</button>)}</div>
                </label>
                <label className="rg-field"><span>Optic</span>
                  <div className="seg-mini">{["MIL", "MOA"].map(u => <button key={u} type="button" className={cfg.scopeUnit === u ? "active" : ""} onClick={() => setCfg(s => ({ ...s, scopeUnit: u }))}>{u}</button>)}</div>
                </label>
              </div>
              <div className="rg-field2">
                <label className="rg-field"><span>Optic height <b className="mono">{cfg.sightHeight.toFixed(1)}"</b></span>
                  <input type="range" min="0.5" max="4" step="0.1" value={cfg.sightHeight} onChange={e => setCfg(s => ({ ...s, sightHeight: parseFloat(e.target.value) }))} />
                </label>
                <label className="rg-field"><span>Barrel twist <b className="mono">1:{cfg.twist}</b></span>
                  <input type="range" min="3" max="20" step="0.5" value={cfg.twist} onChange={e => setCfg(s => ({ ...s, twist: parseFloat(e.target.value) }))} />
                </label>
              </div>
              <div className="rg-cfg-spec">
                <div><span>Muzzle vel</span><b className="mono">{Math.round(activeMV)} fps</b></div>
                <div><span>BC ({dragModel})</span><b className="mono">{(dragModel === "G7" ? (gload.bcG7 || gload.bcG1) : gload.bcG1).toFixed(3)}</b></div>
                <div><span>Bullet</span><b className="mono">{gload.grains} gr</b></div>
              </div>
            </div>

            {/* dope tree */}
            <div className="rg-card rg-dopecard">
              <div className="rg-card-h">Dope Tree · {scopeUnit} holdovers</div>
              <window.Reticle result={result} reticleType="Christmas Tree" scopeUnit={scopeUnit} metric={metric} showWind={true} />
            </div>

            {/* dope table */}
            <div className="rg-card rg-dopetable">
              <div className="rg-card-h">Your Dope</div>
              <div className="rg-dope-row rg-dope-head"><span>Range</span><span>Drop</span><span>Wind</span><span>Vel</span></div>
              {result.rows.filter(r => r.rangeYd > 0 && r.rangeYd % 100 === 0).map((r, i) => (
                <div className="rg-dope-row" key={i}>
                  <span className="mono">{metric ? Math.round(r.rangeM) : r.rangeYd}{distUnit}</span>
                  <span className="mono dope-drop">{nz(r["drop" + scopeUnit], 1)} {scopeUnit}</span>
                  <span className="mono dope-wind">{nz(r["wind" + scopeUnit], 1)} {scopeUnit}</span>
                  <span className="mono dope-vel">{Math.round(r.velocity)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rg-begin-bar">
            <div className="rg-begin-wind">
              <window.UI.Icon name="wind" size={16} />
              <span>Course wind: <b className="mono">{wind.spd} mph</b> from <b>{wind.hour} o'clock</b> ({windValue(wind.hour)}-value)</span>
              <button className="rg-rewind" onClick={() => setWind(genWind())} title="Reroll wind">⟳ New wind</button>
            </div>
            <button className="rg-begin" onClick={() => begin()}><window.UI.Icon name="target" size={16} /> BEGIN COURSE · 100 → 1000 YD</button>
          </div>
        </div>
      );
    }

    // ===================== RUN / COMPLETE PHASE =====================
    const g = geo;
    const RLENS = 232;
    const reticleU = scopeUnit === "MIL" ? 1 : 5, subTick = scopeUnit === "MIL" ? 0.5 : 1;
    const hashes = []; const maxUnits = RLENS / g.unitsToPx;
    for (let u = subTick; u <= maxUnits; u += subTick) {
      const isMaj = Math.abs(u % reticleU) < 1e-6, len = isMaj ? 8 : 4.5;
      [-1, 1].forEach(sgn => {
        hashes.push(<line key={"v" + sgn + u} x1={aim.x - len} y1={aim.y + sgn * u * g.unitsToPx} x2={aim.x + len} y2={aim.y + sgn * u * g.unitsToPx} stroke="rgba(255,255,255,0.82)" strokeWidth={isMaj ? 1.4 : 0.8} />);
        hashes.push(<line key={"h" + sgn + u} x1={aim.x + sgn * u * g.unitsToPx} y1={aim.y - len} x2={aim.x + sgn * u * g.unitsToPx} y2={aim.y + len} stroke="rgba(255,255,255,0.82)" strokeWidth={isMaj ? 1.4 : 0.8} />);
        if (isMaj) hashes.push(<text key={"n" + sgn + u} x={aim.x + 11} y={aim.y + sgn * u * g.unitsToPx + 3} fill="rgba(255,255,255,0.45)" fontSize="9" fontFamily="var(--mono)">{u}</text>);
      });
    }

    return (
      <React.Fragment>
      <div className={"rg" + (complete ? " rg-complete" : "")}>
        {/* LEFT */}
        <aside className="rg-side">
          <div className="rg-card">
            <div className="rg-card-h">Course</div>
            <div className="rg-course">PRS Qualifier · {course.length} stations</div>
            <div className="rg-stations">
              {course.map((r, i) => {
                const s = shots[i]; const st = i === stationIdx && !complete ? "active" : s ? (s.hit ? "hit" : "miss") : "pending";
                return <div key={r} className={"rg-st rg-st-" + st}><span className="rg-st-r">{metric ? Math.round(r * 0.9144) : r}</span><span className="rg-st-u">{distUnit}</span></div>;
              })}
            </div>
          </div>
          <div className="rg-card">
            <div className="rg-card-h">Your Rifle</div>
            <div className="rg-setup">
              <div className="rg-kv"><span>Cartridge</span><b>{gcal.name}</b></div>
              <div className="rg-kv"><span>Load</span><b>{gload.grains}gr {gload.type}</b></div>
              <div className="rg-kv"><span>Muzzle</span><b className="mono">{Math.round(activeMV)} fps</b></div>
              <div className="rg-kv"><span>Zero</span><b className="mono">{cfg.zeroRange} yd</b></div>
              <div className="rg-kv"><span>Optic</span><b>{scopeUnit}</b></div>
            </div>
            <button className="rg-editbtn" onClick={() => setPhase("setup")}>⟵ EDIT SETUP</button>
          </div>
          <div className="rg-card rg-wind">
            <div className="rg-card-h">Wind Call</div>
            <div className="rg-wind-row">
              <svg viewBox="0 0 60 60" className="rg-windflag" aria-hidden="true">
                <circle cx="30" cy="30" r="26" fill="none" stroke="var(--line)" />
                {[12, 3, 6, 9].map((h, i) => { const a = (h / 12) * Math.PI * 2 - Math.PI / 2; return <line key={i} x1={30 + Math.cos(a) * 20} y1={30 + Math.sin(a) * 20} x2={30 + Math.cos(a) * 25} y2={30 + Math.sin(a) * 25} stroke="var(--ink-3)" strokeWidth="1" />; })}
                {(() => { const a = (wind.hour / 12) * Math.PI * 2 - Math.PI / 2; return <g><line x1="30" y1="30" x2={30 + Math.cos(a) * 22} y2={30 + Math.sin(a) * 22} stroke="var(--accent-2)" strokeWidth="2.4" /><circle cx={30 + Math.cos(a) * 22} cy={30 + Math.sin(a) * 22} r="3" fill="var(--accent-2)" /></g>; })()}
              </svg>
              <div className="rg-wind-meta">
                <div className="rg-wind-spd mono">{curWind}<em>mph</em></div>
                <div className="rg-wind-dir">{wind.hour} o'clock</div>
                <div className={"rg-windflow " + (pushRight ? "to-right" : "to-left")} title={"Wind pushes " + windPush(wind.hour)} aria-label={"Wind pushes " + windPush(wind.hour)}>
                  <span className="rg-wf"></span>
                  <span className="rg-wf"></span>
                  <span className="rg-wf"></span>
                  <svg className="rg-wf-head" viewBox="0 0 12 12" width="11" height="11" aria-hidden="true"><path d="M3 2 L8.5 6 L3 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                </div>
                <div className="rg-wind-gust">live call · shifts each shot</div>
              </div>
            </div>
          </div>
          <div className="rg-card rg-livestats">
            <div className="rg-stat"><span>Shots</span><b className="mono">{fdCount}/{course.length}</b></div>
            <div className="rg-stat"><span>Hits</span><b className="mono">{hits}</b></div>
            <div className="rg-stat"><span>Accuracy</span><b className="mono">{acc}%</b></div>
            <div className="rg-stat"><span>Score</span><b className="mono">{sessionScore}</b></div>
            <div className="rg-stat"><span>Streak</span><b className="mono">{streak}{streak >= 2 ? "🔥" : ""}</b></div>
            <div className="rg-stat"><span>Time</span><b className="mono">{mmss}</b></div>
          </div>
        </aside>

        {/* CENTER scope + timer */}
        <div className="rg-center">
        <section className="rg-scene">
          <div className={"rg-shaker" + (recoil ? " rg-recoil" : "")}>
          <svg ref={svgRef} viewBox={`0 0 ${CW} ${CW}`} className="rg-scope" onMouseMove={onMove}
               onTouchStart={onTouchAim}
               onClick={() => { if (isTouch.current) { isTouch.current = false; return; } if (!fired && !complete) fire(); }} style={{ cursor: fired || complete ? "default" : "none", touchAction: "none" }}>
            <defs>
              <linearGradient id="rgSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7d93a6" /><stop offset="40%" stopColor="#62758a" />
                <stop offset="56%" stopColor="#4a5a52" /><stop offset="100%" stopColor="#33433a" />
              </linearGradient>
              <radialGradient id="rgHaze" cx="50%" cy="55%" r="62%"><stop offset="0%" stopColor="#aebfca" stopOpacity={0.05 + 0.16 * (stationIdx / 9)} /><stop offset="100%" stopColor="#aebfca" stopOpacity="0" /></radialGradient>
              <mask id="lensMask"><rect x="0" y="0" width={CW} height={CW} fill="#fff" /><circle cx={aim.x} cy={aim.y} r={RLENS} fill="#000" /></mask>
              <clipPath id="lensClip"><circle cx={aim.x} cy={aim.y} r={RLENS} /></clipPath>
            </defs>
            {/* full-bleed downrange perspective */}
            <rect x="0" y="0" width={CW} height={CW} fill="url(#rgSky)" />
            <polygon points={`0,${CW} ${CW},${CW} ${C + 64},${C + 22} ${C - 64},${C + 22}`} fill="#3c4b40" opacity="0.6" />
            <ellipse cx={C} cy={C + 22} rx={CW} ry="30" fill="#46584a" opacity="0.4" />
            {/* lane edges + receding range posts → depth-of-field read */}
            {(() => {
              const marks = []; for (let r = 100; r <= 1000; r += 100) marks.push(r);
              const eL = (y) => C - LANE_HALF * laneT(y), eR = (y) => C + LANE_HALF * laneT(y);
              return <g>
                <line x1={C - LANE_HALF} y1={LANE_YNEAR} x2={C} y2={LANE_YH} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
                <line x1={C + LANE_HALF} y1={LANE_YNEAR} x2={C} y2={LANE_YH} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
                {marks.map(r => {
                  const y = laneY(r), t = laneT(y), xL = eL(y), xR = eR(y);
                  const H = 4 + 30 * t, fs = 6 + 8 * t, isCur = r === cur.range;
                  const disp = metric ? Math.round(r * 0.9144) : r;
                  return <g key={r}>
                    <line x1={xL} y1={y} x2={xR} y2={y} stroke={isCur ? "rgba(116,216,214,0.34)" : "rgba(255,255,255,0.055)"} strokeWidth="1" />
                    <line x1={xR} y1={y} x2={xR} y2={y - H} stroke={isCur ? "var(--accent-2)" : "rgba(210,220,230,0.5)"} strokeWidth={0.7 + 1.5 * t} />
                    <line x1={xL} y1={y} x2={xL} y2={y - H} stroke={isCur ? "var(--accent-2)" : "rgba(210,220,230,0.5)"} strokeWidth={0.7 + 1.5 * t} />
                    <rect x={xR + 3} y={y - H - fs} width={fs * 2.7} height={fs * 1.5} rx="2" fill={isCur ? "var(--accent-2)" : "rgba(11,15,22,0.72)"} stroke={isCur ? "none" : "rgba(255,255,255,0.14)"} strokeWidth="0.8" />
                    <text x={xR + 3 + fs * 1.35} y={y - H - fs + fs * 1.07} textAnchor="middle" fontSize={fs} fontFamily="var(--mono)" fontWeight="700" fill={isCur ? "#06121a" : "#c9d3dd"}>{disp}</text>
                  </g>;
                })}
                <text x={C + LANE_HALF + 6} y={LANE_YNEAR - 3} fontSize="9" fontFamily="var(--mono)" fill="rgba(180,190,200,0.5)">{metric ? "m" : "yd"}</text>
              </g>;
            })()}
            <rect x="0" y="0" width={CW} height={CW} fill="url(#rgHaze)" />
            {/* IPSC cardboard silhouette — sized by subtension, seated on the lane */}
            {(() => {
              const op = 1 - 0.14 * (stationIdx / 9);
              const cx = g.tcx, cy = g.tcy, R = g.targetR;
              const bodyTop = cy - 1.22 * R, bodyBot = cy + 1.68 * R, wsh = R, wbot = 0.66 * R;
              const headTop = bodyTop - 0.86 * R, headBot = bodyTop - 0.04 * R, hw = 0.48 * R;
              const sw = (k) => Math.max(0.5, R * k);
              const body = `M ${cx - wsh} ${bodyTop + 0.2 * R} Q ${cx - wsh} ${bodyTop} ${cx - wsh * 0.58} ${bodyTop} L ${cx + wsh * 0.58} ${bodyTop} Q ${cx + wsh} ${bodyTop} ${cx + wsh} ${bodyTop + 0.2 * R} L ${cx + wbot} ${bodyBot} L ${cx - wbot} ${bodyBot} Z`;
              const tan = "#c6a973", edge = "#5a4322", perf = "rgba(60,44,22,0.5)", dash = `${R * 0.1} ${R * 0.07}`;
              return <g opacity={op}>
                <ellipse cx={cx} cy={bodyBot + 0.14 * R} rx={wbot * 1.55} ry={0.2 * R + 1} fill="rgba(0,0,0,0.3)" />
                <rect x={cx - hw} y={headTop} width={hw * 2} height={headBot - headTop} rx={0.2 * R} fill={tan} stroke={edge} strokeWidth={sw(0.03)} />
                {R > 22 && <rect x={cx - hw * 0.5} y={headTop + (headBot - headTop) * 0.16} width={hw} height={(headBot - headTop) * 0.5} rx="1" fill="none" stroke={perf} strokeWidth={sw(0.02)} strokeDasharray={dash} />}
                <path d={body} fill={tan} stroke={edge} strokeWidth={sw(0.035)} />
                {R > 22 && <rect x={cx - wsh * 0.8} y={cy - 1.02 * R} width={wsh * 1.6} height={2.0 * R} rx={0.46 * R} fill="none" stroke={perf} strokeWidth={sw(0.02)} strokeDasharray={dash} />}
                <rect x={cx - 0.5 * R} y={cy - 0.8 * R} width={R} height={1.6 * R} rx={0.16 * R} fill="rgba(60,44,22,0.09)" stroke={perf} strokeWidth={sw(0.03)} strokeDasharray={dash} />
                {R > 34 && <text x={cx} y={cy + 0.12 * R} textAnchor="middle" fontSize={R * 0.32} fontFamily="var(--mono)" fontWeight="700" fill="rgba(60,44,22,0.45)">A</text>}
                {shots.filter(s => s.range === cur.range).map((s, i) => <circle key={i} cx={s.impact.x} cy={s.impact.y} r={Math.max(2.2, R * 0.07)} fill="#1a1206" stroke="#fff" strokeWidth="1" />)}
              </g>;
            })()}
            {/* scope shade outside the lens */}
            <rect x="0" y="0" width={CW} height={CW} fill="#05070b" opacity="0.6" mask="url(#lensMask)" />
            {/* reticle — crosshair fixed at the lens center (= cursor) */}
            {!complete && <g clipPath="url(#lensClip)">
              <line x1={aim.x} y1={aim.y - RLENS} x2={aim.x} y2={aim.y - 10} stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" />
              <line x1={aim.x} y1={aim.y + 10} x2={aim.x} y2={aim.y + RLENS} stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" />
              <line x1={aim.x - RLENS} y1={aim.y} x2={aim.x - 10} y2={aim.y} stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" />
              <line x1={aim.x + 10} y1={aim.y} x2={aim.x + RLENS} y2={aim.y} stroke="rgba(255,255,255,0.9)" strokeWidth="1.2" />
              {hashes}
              <circle cx={aim.x} cy={aim.y} r="1.6" fill="var(--accent-2)" />
            </g>}
            {/* shot trace + impact */}
            {fired && (
              <g>
                <line x1={C} y1={CW} x2={fired.impact.x} y2={fired.impact.y} stroke="#ffd28a" strokeWidth="1.2" opacity="0.5" strokeDasharray="3 4" />
                <circle className="rg-impact-pulse" cx={fired.impact.x} cy={fired.impact.y} r={Math.max(g.targetR, 14)} fill="none" stroke={fired.hit ? "var(--good)" : "var(--bad)"} strokeWidth="2" />
                <circle className="rg-impact-spark" cx={fired.impact.x} cy={fired.impact.y} r="7" fill={fired.hit ? "var(--good)" : "var(--bad)"} opacity="0.9" />
                <circle cx={fired.impact.x} cy={fired.impact.y} r="2.4" fill="#fff" />
              </g>
            )}
            {complete && <circle cx={g.correctAim.x} cy={g.correctAim.y} r="6" fill="none" stroke="var(--accent-2)" strokeWidth="1.5" strokeDasharray="3 3" />}
            {/* scope tube ring */}
            <circle cx={aim.x} cy={aim.y} r={RLENS} fill="none" stroke="#000" strokeWidth="7" opacity="0.9" />
            <circle cx={aim.x} cy={aim.y} r={RLENS + 3.5} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
          </svg>
          {recoil && <div className="rg-muzzle"></div>}
          </div>

          {/* HUD */}
          <div className="rg-hud rg-hud-tl">
            <div className="rg-hud-range mono">{rangeDisp}<em>{distUnit}</em></div>
            <div className="rg-hud-stage">STAGE {stationIdx + 1}/{course.length} · TARGET</div>
          </div>
          <div className="rg-hud rg-hud-tr">
            <span className="rg-hud-windv mono">{curWind} MPH</span>
            <span className="rg-hud-windd">{wind.hour} O'CLOCK</span>
            <span className="rg-hud-windpush">{pushRight ? "DRIFT →" : "← DRIFT"}</span>
          </div>
          <div className={"rg-windbig " + (pushRight ? "to-right" : "to-left")} aria-hidden="true">
            <div className="rg-wb-arrow">
              <svg viewBox="0 0 24 24" width="40" height="40"><path d="M8 4 L17 12 L8 20" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"></path></svg>
              <svg viewBox="0 0 24 24" width="40" height="40"><path d="M8 4 L17 12 L8 20" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"></path></svg>
              <svg viewBox="0 0 24 24" width="40" height="40"><path d="M8 4 L17 12 L8 20" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"></path></svg>
              <svg viewBox="0 0 24 24" width="40" height="40"><path d="M8 4 L17 12 L8 20" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"></path></svg>
            </div>
            <div className="rg-wb-label">WIND · {curWind} MPH · {wind.hour} O'CLOCK</div>
          </div>
          <div className="rg-zoom">
            <span>ZOOM</span>
            {[6, 10, 14, 18, 24].map(z => <button key={z} className={zoom === z ? "active" : ""} onClick={() => setZoom(z)}>{z}×</button>)}
            <em>{zoom}× FFP</em>
          </div>

          {!fired && !complete && <div className="rg-prompt">Hold for <b>{rangeDisp} {distUnit}</b> &amp; wind · place the reticle · <b>click to fire</b></div>}

          {fired && !complete && (
            <div className={"rg-feedback " + (fired.hit ? "fb-hit" : "fb-miss")}>
              <div className="fb-verdict">{fired.hit ? `HIT · ${fired.ring >= 9 ? "A" : fired.ring >= 6 ? "C" : "D"}-ZONE` : "MISS"}</div>
              <div className="fb-detail mono">Impact {nz(Math.abs(fired.vMiss), 1)} {scopeUnit} {fired.vMiss > 0 ? "LOW" : "HIGH"} · {nz(Math.abs(fired.hMiss), 1)} {scopeUnit} {fired.hMiss > 0 ? "RIGHT" : "LEFT"}</div>
              <div className="fb-correct">Correct: hold {nz(Math.abs(fired.vMiss), 1)} {fired.vMiss > 0 ? "higher" : "lower"} · {nz(Math.abs(fired.hMiss), 1)} {fired.hMiss > 0 ? "left" : "right"}</div>
              <button className="rg-next" onClick={next}>{stationIdx < course.length - 1 ? "NEXT TARGET →" : "VIEW RESULTS →"}</button>
            </div>
          )}
          {!fired && !complete && <button className="rg-fire" onClick={fire}><window.UI.Icon name="crosshair" size={16} /> FIRE</button>}
        </section>
        <div className="rg-timerbar">
          <div className="rg-tb-l"><window.UI.Icon name="gauge" size={18} /> Elapsed</div>
          <div className="rg-tb-time mono">{mmss}</div>
          <div className="rg-tb-bonus">Time bonus<b className="mono">+{timeBonus}</b><em>par 3:00</em></div>
        </div>
        {(() => {
          const globalMode = lbOn && !lbErr && !!gboard;
          const src = globalMode ? gboard.entries : board.entries;
          const top = src.slice(0, 5);
          const leader = top.length ? top[0].score : 0;
          const proj = src.filter(e => e.score > finalScore).length + 1;
          const liveName = (nameInput || "").trim().toUpperCase() || "YOU";
          return (
            <div className="rg-lb">
              <div className="rg-lb-head">
                <span className="rg-lb-title"><window.UI.Icon name="bolt" size={13} /> {monthName()} Leaderboard</span>
                <span className={"rg-lb-scope mono" + (globalMode ? " global" : "")}>{globalMode ? gboard.total + " SHOOTERS · GLOBAL" : "THIS DEVICE"}</span>
              </div>
              <div className="rg-lb-rows">
                {top.length === 0 && <div className="rg-lb-empty">No scores logged yet this month — finish your string to set the bar.</div>}
                {top.map((e, i) => (
                  <div className={"rg-lb-row r" + (i + 1)} key={globalMode && e.id ? e.id : "l" + i}>
                    <span className="rg-lb-rank mono">{i + 1}</span>
                    <span className="rg-lb-name"><span className="rg-lb-who">{e.name}</span>{e.caliber ? <span className="rg-lb-rig">{e.caliber}</span> : null}</span>
                    <span className="rg-lb-hits mono">{e.hits}/{course.length}</span>
                    <span className="rg-lb-score mono">{e.score}</span>
                    <span className="rg-lb-bar" style={{ width: (leader ? Math.max(6, e.score / leader * 100) : 0) + "%" }}></span>
                  </div>
                ))}
                <div className="rg-lb-row you">
                  <span className="rg-lb-rank mono">{proj}</span>
                  <span className="rg-lb-name"><span className="rg-lb-who">{liveName}<span className="rg-lb-livetag"><i className="rg-lb-pulse"></i>LIVE RUN</span></span><span className="rg-lb-rig">{gcal.name} · {gload.grains}gr {gload.line}</span></span>
                  <span className="rg-lb-hits mono">{hits}/{course.length}</span>
                  <span className="rg-lb-score mono">{finalScore}</span>
                  <span className="rg-lb-bar live" style={{ width: (leader ? Math.min(100, Math.max(6, finalScore / leader * 100)) : 100) + "%" }}></span>
                </div>
              </div>
            </div>
          );
        })()}
        </div>

        {/* RIGHT */}
        <aside className="rg-prog">
          <div className="rg-card rg-dopetable">
            <div className="rg-card-h">Dope Chart</div>
            <div className="rg-dope-row rg-dope-head"><span>Range</span><span>Drop</span><span>Wind</span><span>Vel</span></div>
            {result.rows.filter(r => r.rangeYd > 0 && r.rangeYd % 100 === 0).map((r, i) => (
              <div className="rg-dope-row" key={i}>
                <span className="mono">{metric ? Math.round(r.rangeM) : r.rangeYd}{distUnit}</span>
                <span className="mono dope-drop">{nz(r["drop" + scopeUnit], 1)}</span>
                <span className="mono dope-wind">{nz(r["wind" + scopeUnit], 1)}</span>
                <span className="mono dope-vel">{Math.round(r.velocity)}</span>
              </div>
            ))}
          </div>
          <div className="rg-card">
            <div className="rg-card-h">Shot Log</div>
            {shots.length === 0 && <div className="rg-empty">No shots fired yet. Read the wind, trust your dope.</div>}
            {shots.map((s, i) => (
              <div className="rg-shot" key={i}><span className="rs-range mono">{s.range}y</span><span className={"rs-tag " + (s.hit ? "rs-hit" : "rs-miss")}>{s.hit ? "HIT " + s.ring : "MISS"}</span><span className="rs-dev mono">{nz(s.distU, 1)} {scopeUnit}</span></div>
            ))}
          </div>
          <div className="rg-card"><div className="rg-card-h">Live Group</div><window.RGGroup shots={shots} scopeUnit={scopeUnit} /></div>
          <div className="rg-card rg-pb"><div className="rg-card-h">High Scores</div>
            <div className="rg-kv"><span>Today's high</span><b className="mono">{hs.days[todayKey()] || 0}</b></div>
            <div className="rg-kv"><span>This month</span><b className="mono">{hs.monthBest || 0}</b></div>
            <div className="rg-kv"><span>Your top score</span><b className="mono">{pb.bestScore || 0}</b></div>
          </div>
        </aside>
      </div>

      {complete && (
        <div className="rg-modal-overlay">
          <div className="rg-modal">
            <div className={"rg-modal-qual " + qual.cls}>
              <div className="rg-qual-l">Course Complete · {course.length} shots</div>
              <div className="rg-qual-name">{qual.name}</div>
              <div className="rg-modal-score mono">{finalScore}</div>
              <div className="rg-qual-break">Accuracy {sessionScore} · Time +{timeBonus} · {hits}/{course.length} hits · {mmss}</div>
              {finalScore > 0 && finalScore >= (hs.days[todayKey()] || 0) && <div className="rg-newbest">★ NEW DAILY HIGH SCORE</div>}
            </div>
            {badges.length > 0 && <div className="rg-modal-badges">{badges.map(b => <span className="rg-badge" key={b.id}><window.UI.Icon name={b.ico} size={14} />{b.name}</span>)}</div>}
            <div className="rg-modal-board">
              <div className="rg-card-h">{monthName()} Leaderboard {lbOn && !lbErr ? "· GLOBAL" : "· THIS DEVICE"}</div>
              {!submitted ? (
                <div className="rg-submit">
                  <div className="rg-submit-l">Enter your name to log <b className="mono">{finalScore}</b>{lbOn && !lbErr ? " to the global board" : ""}</div>
                  <div className="rg-submit-row">
                    <input className="rg-nameinput" maxLength={18} placeholder="YOUR NAME" value={nameInput} autoFocus
                      onChange={e => setNameInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") submitScore(); }} />
                    <button className="rg-submitbtn" onClick={submitScore} disabled={submitting}>{submitting ? "SENDING…" : "SUBMIT"}</button>
                  </div>
                </div>
              ) : (
                <div className="rg-submit-done">✓ Logged as <b>{submitted.name}</b> · rank #{gRank != null ? gRank : board.entries.findIndex(e => e.ts === submitted.ts) + 1}{gRank != null && gboard ? " of " + gboard.total + " shooters" : ""}</div>
              )}
              <div className="rg-board-list">
                {(() => {
                  const globalMode = lbOn && !lbErr;
                  if (globalMode && !gboard) return <div className="rg-empty">Loading global scores…</div>;
                  const rows = globalMode ? gboard.entries.slice(0, 5) : board.entries.slice(0, 5);
                  const mine = (e) => !!submitted && (globalMode ? (!!submitted.id && e.id === submitted.id) : submitted.ts === e.ts);
                  return (
                    <React.Fragment>
                      {rows.length === 0 && <div className="rg-empty">No scores logged yet this month{globalMode ? " — be the first" : ""}.</div>}
                      {rows.map((e, i) => (
                        <div className={"rg-board-row" + (mine(e) ? " me" : "")} key={globalMode ? e.id : i}>
                          <span className="rb-rank mono">{i + 1}</span><span className="rb-name">{e.name}{e.caliber ? <em className="rb-rig">{e.caliber}</em> : null}</span><span className="rb-hits mono">{e.hits}/{course.length}</span><span className="rb-score mono">{e.score}</span>
                        </div>
                      ))}
                      {globalMode && submitted && gRank > 5 && (
                        <div className="rg-board-row me">
                          <span className="rb-rank mono">{gRank}</span><span className="rb-name">{submitted.name}{submitted.caliber ? <em className="rb-rig">{submitted.caliber}</em> : null}</span><span className="rb-hits mono">{submitted.hits}/{course.length}</span><span className="rb-score mono">{submitted.score}</span>
                        </div>
                      )}
                      {lbErr && <div className="rg-empty">Global board unreachable — score saved on this device.</div>}
                    </React.Fragment>
                  );
                })()}
              </div>
            </div>
            <div className="rg-promo-reminder">
              <span className="rgp-star">★</span>
              <span>The monthly board resets on the <b>1st</b>. Wind rerolls every run, so go again.</span>
            </div>
            <div className="rg-actions">
              <button className="rg-replay" onClick={() => restart()}><window.UI.Icon name="crosshair" size={15} /> PLAY AGAIN · NEW WIND</button>
              <button className="rg-replay alt" onClick={() => setPhase("intro")}>RULES</button>
            </div>
            <a className="rg-ad" href="https://grabagun.com/ammo-subscription" target="_blank" rel="noopener noreferrer">
              <img src={(window.GR_TOOL_IMG || {})["assets/ammo-subscription.png"] || "assets/ammo-subscription.png"} alt="GrabAGun Ammo Subscription — never run dry" />
              <span className="rg-ad-tag">Ad</span>
              <span className="rg-ad-cta">Never run dry — subscribe &amp; save <span className="rg-ad-arrow">→</span></span>
            </a>
          </div>
        </div>
      )}
      </React.Fragment>
    );
  }

  function RGGroup({ shots, scopeUnit, big }) {
    const R = big ? 92 : 70, cx = R, cy = R;
    let maxU = 2; shots.forEach(s => { maxU = Math.max(maxU, Math.abs(s.vMiss), Math.abs(s.hMiss)); });
    const scale = (R - 14) / (maxU || 2);
    return (
      <svg viewBox={`0 0 ${R * 2} ${R * 2}`} className="rg-group" style={{ width: "100%", maxWidth: big ? 200 : 150, display: "block", margin: "0 auto 8px" }}>
        <circle cx={cx} cy={cy} r={R - 6} fill="var(--bg-2)" stroke="var(--line)" />
        <circle cx={cx} cy={cy} r={(R - 6) * 0.5} fill="none" stroke="var(--line-2)" />
        <line x1={cx} y1={8} x2={cx} y2={R * 2 - 8} stroke="var(--line-2)" /><line x1={8} y1={cy} x2={R * 2 - 8} y2={cy} stroke="var(--line-2)" />
        <circle cx={cx} cy={cy} r="2" fill="var(--accent-2)" />
        {shots.map((s, i) => <circle key={i} cx={cx + s.hMiss * scale} cy={cy + s.vMiss * scale} r="3.4" fill={s.hit ? "var(--good)" : "var(--bad)"} stroke="#0d0f12" strokeWidth="0.8" />)}
      </svg>
    );
  }

  window.RangeGame = RangeGame;
  window.RGGroup = RGGroup;
})();
