/* GunRanking Ballistics Calculator (built from the GrabAGun Ballistics Experience) — main app shell, state, solver wiring, output tabs. */
(function () {
  const { useState, useMemo } = React;

  // persist user settings across mode switches & reloads
  function loadLS(k) { try { const v = localStorage.getItem(k); return v == null ? null : JSON.parse(v); } catch (e) { return null; } }
  function saveLS(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  const nz = (v, d) => { let s = v.toFixed(d); if (/^-0(\.0+)?$/.test(s)) s = s.slice(1); return s; };

  const DEFAULTS = {
    caliberId: "65creedmoor",
    mfr: "Hornady", line: "ELD Match", loadIdx: 0,
    barrelLength: 24, mvOverride: null, bcOverride: null,
    twist: 8, twistDir: "R", showSpinDrift: true,
    zeroRange: 100, sightHeight: 1.5, shootingAngle: 0,
    windSpeed: 10, windDir: 3,
    tempF: 59, altitudeFt: 0,
    scopeUnit: "MIL", reticleType: "MIL Grid",
    maxRange: 1000, increment: 100, dragModel: "Auto",
    showWind: true
  };

  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "accent": "#FF5A1F",
    "accent2": "#1FA8A4",
    "density": "regular"
  }/*EDITMODE-END*/;

  const TABS = ["Trajectory", "Reticle Holds", "Energy & Velocity", "Data Table"];
  const APP_VERSION = "1.0.0-beta";

  // Read integration params: ?mode=lab|range|plan
  function readUrl() {
    try {
      const q = new URLSearchParams(window.location.search);
      const out = {};
      if (q.get("mode")) { const m = q.get("mode"); out.mode = (m === "lab" || m === "range") ? m : "hunt"; }
      return out;
    } catch (e) { return {}; }
  }

  function StatCard({ label, value, unit, sub }) {
    return (
      <div className="stat-card">
        <span className="stat-label">{label}</span>
        <span className="stat-value mono">{value}<em>{unit}</em></span>
        {sub && <span className="stat-sub">{sub}</span>}
      </div>
    );
  }

  // ---- CSV helpers + admin player-DB export ----
  function csvEscape(v) { if (v == null) v = ""; v = String(v); return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  function toCSV(rows, cols) {
    const head = cols.map(c => csvEscape(c.label)).join(",");
    const body = rows.map(r => cols.map(c => csvEscape(c.get(r))).join(",")).join("\r\n");
    return head + "\r\n" + body;
  }
  function downloadCSV(filename, csv) {
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  function localLeads() { try { const d = JSON.parse(localStorage.getItem("gag_range_leads") || "null"); return d && Array.isArray(d.rows) ? d.rows : []; } catch (e) { return []; } }
  const LEAD_COLS = [
    { label: "Name", get: r => r.name },
    { label: "Email", get: r => r.email },
    { label: "Marketing Opt-In", get: r => (r.marketing ? "YES" : "NO") },
    { label: "Best Score", get: r => r.best_score || 0 },
    { label: "Caliber", get: r => r.caliber || "" },
    { label: "Season", get: r => r.month || "" },
    { label: "Captured", get: r => (r.created_at || "").slice(0, 10) }
  ];

  function AdminPortal({ onClose }) {
    const PIN = (window.APP_CONFIG && window.APP_CONFIG.ADMIN_PIN) || "grabagun";
    const ADMIN_EMAIL = (window.APP_CONFIG && window.APP_CONFIG.ADMIN_EMAIL) || "";
    const cloudOn = !!(window.LeadsDB && window.LeadsDB.enabled);
    const [authed, setAuthed] = useState(false);
    const [pin, setPin] = useState("");
    const [err, setErr] = useState("");
    const [source, setSource] = useState(cloudOn ? "global" : "local");
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadErr, setLoadErr] = useState("");
    const monthK = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"); };

    function load(src) {
      if (src === "global" && cloudOn) {
        setLoading(true); setLoadErr("");
        window.LeadsDB.fetchAll()
          .then(rows => setLeads(rows || []))
          .catch(() => { setLoadErr("Couldn't reach the cloud DB — showing this device only."); setLeads(localLeads()); setSource("local"); })
          .finally(() => setLoading(false));
      } else { setLeads(localLeads()); }
    }
    function unlock() { if (pin.trim() === PIN) { setAuthed(true); setErr(""); load(source); } else { setErr("Incorrect PIN."); } }
    function pick(s) { setSource(s); load(s); }

    const optIns = leads.filter(r => r.marketing);
    const dl = (rows, name) => { if (rows.length) downloadCSV(name, toCSV(rows, LEAD_COLS)); };
    function emailToUs() {
      const csv = toCSV(leads, LEAD_COLS);
      const subject = "GunRanking Range Challenge — player list (" + leads.length + ")";
      const body = "Player capture export, " + new Date().toLocaleString() + ":\n\n" + csv;
      window.location.href = "mailto:" + ADMIN_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    }

    return (
      <div className="admin-overlay" onClick={e => { if (e.target.classList.contains("admin-overlay")) onClose(); }}>
        <div className="admin-modal">
          <div className="admin-head">
            <div className="admin-title"><window.UI.Icon name="sheet" size={18} /> Player Database</div>
            <button className="admin-close" onClick={onClose} aria-label="Close">×</button>
          </div>
          <div className="admin-body">
            {!authed ? (
              <div className="admin-pin">
                <label>Enter the admin PIN to view &amp; export captured players.</label>
                <div className="admin-pin-row">
                  <input className="admin-input" type="password" value={pin} autoFocus placeholder="PIN"
                    onChange={e => setPin(e.target.value)} onKeyDown={e => { if (e.key === "Enter") unlock(); }} />
                  <button className="admin-btn" onClick={unlock}>Unlock</button>
                </div>
                {err && <div className="admin-err">{err}</div>}
              </div>
            ) : (
              <React.Fragment>
                <div className="admin-stats">
                  <div className="admin-stat"><span>Total players</span><b>{leads.length}</b></div>
                  <div className="admin-stat"><span>Marketing opt-ins</span><b>{optIns.length}</b></div>
                  <div className="admin-stat"><span>Source</span><b style={{ fontSize: "12px" }}>{source === "global" ? "CLOUD · ALL" : "THIS DEVICE"}</b></div>
                </div>
                {cloudOn && (
                  <div className="admin-source">
                    <span>View:</span>
                    <button className={"admin-btn ghost" + (source === "global" ? " on" : "")} onClick={() => pick("global")}>Cloud (all devices)</button>
                    <button className={"admin-btn ghost" + (source === "local" ? " on" : "")} onClick={() => pick("local")}>This device</button>
                  </div>
                )}
                {loading && <div className="admin-note">Loading players…</div>}
                {loadErr && <div className="admin-err">{loadErr}</div>}
                <div className="admin-actions">
                  <button className="admin-btn" onClick={() => dl(leads, "gunranking-players-" + monthK() + ".csv")} disabled={!leads.length}><window.UI.Icon name="download" size={14} /> Download all ({leads.length})</button>
                  <button className="admin-btn ghost" onClick={() => dl(optIns, "gunranking-marketing-optins-" + monthK() + ".csv")} disabled={!optIns.length}>Marketing opt-ins ({optIns.length})</button>
                  {ADMIN_EMAIL && <button className="admin-btn ghost" onClick={emailToUs} disabled={!leads.length}>Email list to us</button>}
                </div>
                <div className="admin-tablewrap">
                  <table className="admin-table">
                    <thead><tr><th>Name</th><th>Email</th><th>Mktg</th><th>Best</th><th>Captured</th></tr></thead>
                    <tbody>
                      {leads.length === 0 && <tr><td colSpan={5} className="am-no">No players captured yet.</td></tr>}
                      {leads.slice(0, 250).map((r, i) => (
                        <tr key={i}><td>{r.name}</td><td>{r.email}</td><td className={r.marketing ? "am-mk" : "am-no"}>{r.marketing ? "YES" : "—"}</td><td>{r.best_score || 0}</td><td className="am-no">{(r.created_at || "").slice(0, 10)}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="admin-note">CSV opens in Excel / Google Sheets. Only email players whose <b>Marketing Opt-In</b> is YES. {cloudOn ? "Cloud view aggregates every device; winners are the Top 5 by best score." : "Add Supabase keys (see README) to collect players across all devices — otherwise this is this browser only."}</p>
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
    );
  }

  function App() {
    const [t, setTweak] = window.useTweaks(TWEAK_DEFAULTS);
    const urlInit = React.useRef(readUrl()).current;
    const [mode, setMode] = useState(urlInit.mode || loadLS("gag_mode") || "hunt");
    const [adminOpen, setAdminOpen] = useState(false);
    const [state, setState] = useState(() => ({ ...DEFAULTS, ...(loadLS("gag_lab_state") || {}) }));
    const [metric, setMetric] = useState(() => { const v = loadLS("gag_metric"); return v == null ? false : !!v; });
    const [tab, setTab] = useState("Trajectory");
    const [inputsOpen, setInputsOpen] = useState(false);
    const data = window.BALLISTICS_DATA;

    const set = (patch) => setState(s => ({ ...s, ...patch }));

    // Jump a hero setup into the full Ballistics Lab.
    const openLab = (rec) => {
      const cal = rec.caliber;
      const idx = cal.loads.filter(l => l.mfr === rec.load.mfr && l.line === rec.load.line)
        .findIndex(l => l === rec.load);
      setState(s => ({
        ...s, caliberId: cal.id, mfr: rec.load.mfr, line: rec.load.line,
        loadIdx: Math.max(0, idx),
        barrelLength: rec.barrelLength != null ? rec.barrelLength : cal.defaultBarrel,
        mvOverride: null,
        bcOverride: null,
        twist: cal.defaultTwist != null ? cal.defaultTwist : s.twist,
        sightHeight: rec.sightHeight != null ? rec.sightHeight : s.sightHeight,
        zeroRange: rec.zeroRange != null ? rec.zeroRange : s.zeroRange,
        scopeUnit: rec.scopeUnit || s.scopeUnit,
        reticleType: rec.reticleType || s.reticleType,
        maxRange: rec.maxRange != null ? Math.max(300, rec.maxRange) : Math.max(300, s.maxRange)
      }));
      setMode("lab"); setTab("Trajectory");
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const cal = data.find(c => c.id === state.caliberId);
    const loads = cal.loads.filter(l => l.mfr === state.mfr && l.line === state.line);
    const load = loads[state.loadIdx] || loads[0] || cal.loads[0];

    const computedMV = window.BallisticsSolver.adjustMV(load.mv, load.testBarrel, state.barrelLength, cal.fpsPerInch);
    const activeMV = state.mvOverride != null ? state.mvOverride : computedMV;
    const dragModel = state.dragModel === "Auto" ? (load.bcG7 ? "G7" : "G1") : state.dragModel;
    const useG7 = dragModel === "G7";
    const effBcG1 = (state.bcOverride != null && !useG7) ? state.bcOverride : load.bcG1;
    const effBcG7 = (state.bcOverride != null && useG7) ? state.bcOverride : load.bcG7;
    const activeBC = useG7 ? (effBcG7 || effBcG1) : effBcG1;

    const result = useMemo(() => {
      return window.BallisticsSolver.solve({
        bcG1: effBcG1, bcG7: effBcG7, dragModel,
        muzzleVelocity: activeMV, bulletWeight: load.grains,
        sightHeight: state.sightHeight, zeroRange: state.zeroRange,
        shootingAngle: state.shootingAngle,
        windSpeed: state.showWind ? state.windSpeed : 0, windDir: state.windDir,
        tempF: state.tempF, altitudeFt: state.altitudeFt,
        twist: state.twist, leftTwist: state.twistDir === "L", diameter: cal.diameter, spinDrift: state.showSpinDrift,
        maxRange: state.maxRange, increment: state.increment
      });
    }, [load, dragModel, effBcG1, effBcG7, activeMV, state.sightHeight, state.zeroRange, state.shootingAngle,
        state.showWind, state.windSpeed, state.windDir, state.tempF, state.altitudeFt,
        cal.diameter, state.twist, state.twistDir, state.showSpinDrift,
        state.maxRange, state.increment]);

    // summary values
    const last = result.rows[result.rows.length - 1];
    const distUnit = metric ? "m" : "yd";
    const velUnit = metric ? "m/s" : "fps";
    const lenUnit = metric ? "cm" : "in";
    const enUnit = metric ? "J" : "ft·lb";
    const moaOrMil = state.scopeUnit;
    const lastDial = last["drop" + moaOrMil];
    const trans = result.summary.transonicRange;

    React.useEffect(() => {
      document.documentElement.style.setProperty("--accent", t.accent);
      document.documentElement.style.setProperty("--accent-2", t.accent2);
      document.body.dataset.density = t.density;
    }, [t.accent, t.accent2, t.density]);

    React.useEffect(() => { saveLS("gag_lab_state", state); }, [state]);
    React.useEffect(() => { saveLS("gag_metric", metric); }, [metric]);
    React.useEffect(() => { saveLS("gag_mode", mode); }, [mode]);

    const holds = result.rows.filter(r => r.rangeYd > 0);
    const holdSubset = holds;   // honor the chosen table step exactly (no decimation)

    return (
      <div className="app" data-mode={mode}>
        <header className="topbar">
          <window.UI.Wordmark />
          <span className="brand-beta">Beta</span>
          <div className="mode-switch">
            <button className={mode === "hunt" ? "active" : ""} onClick={() => setMode("hunt")}><window.UI.Icon name="gauge" size={16} />Shot Planner</button>
            <button className={mode === "lab" ? "active" : ""} onClick={() => setMode("lab")}><window.UI.Icon name="crosshair" size={16} />Ballistics Lab</button>
            <button className={mode === "range" ? "active" : ""} onClick={() => setMode("range")}>
              <span className="ms-target" aria-hidden="true">
                <svg viewBox="0 0 20 20" width="17" height="17">
                  <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.5"></circle>
                  <circle cx="10" cy="10" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.65"></circle>
                  <circle cx="10" cy="10" r="1.5" fill="currentColor"></circle>
                  <circle className="mst-pulse" cx="13.2" cy="6.8" r="2"></circle>
                  <circle className="mst-hit" cx="13.2" cy="6.8" r="1.7"></circle>
                </svg>
              </span>
              Test Your Setup
            </button>
          </div>
          {(mode === "lab" || mode === "range") && (
            <div className="load-strip">
              <span className="ls-cal">{cal.name}</span>
              <span className="ls-load">{load.mfr} {load.line} · {load.grains}gr {load.type}</span>
            </div>
          )}
          <div className="topbar-right">
            <div className="unit-toggle">
              <button className={!metric ? "active" : ""} onClick={() => setMetric(false)}>Yards</button>
              <button className={metric ? "active" : ""} onClick={() => setMetric(true)}>Meters</button>
            </div>
          </div>
        </header>

        {mode === "hunt" ? (
          <main className="hunt-page">
            <window.HeroBallistics metric={metric} data={data} onOpenLab={openLab} />
            <a className="hp-ad" href="https://grabagun.com/ammo-subscription" target="_blank" rel="noopener noreferrer">
              <img src={(window.GR_TOOL_IMG || {})["assets/ammo-subscription.png"] || "assets/ammo-subscription.png"} alt="GrabAGun Ammo Subscription — never run dry" />
              <span className="rg-ad-tag">Ad</span>
              <span className="rg-ad-cta">Never run dry — subscribe &amp; save <span className="rg-ad-arrow">→</span></span>
            </a>
            <footer className="methodology">
              <span>3-DOF point-mass solver · advertised factory velocities adjusted for barrel length. Verify against your own chronograph &amp; drops before relying on a firing solution.</span>
            </footer>
          </main>
        ) : mode === "range" ? (
          <main className="range-page">
            <window.RangeGame state={state} load={load} cal={cal} metric={metric} />
          </main>
        ) : (
        <div className={"layout" + (inputsOpen ? " inputs-open" : "")}>
          <div className="rail-backdrop" onClick={() => setInputsOpen(false)} aria-hidden="true"></div>
          <aside className="rail">
            <div className="rail-sheet-head">
              <span className="rail-sheet-grab" aria-hidden="true"></span>
              <span className="rail-sheet-title">Setup &amp; inputs</span>
              <button className="rail-sheet-done" onClick={() => setInputsOpen(false)}>Done</button>
            </div>
            <window.InputPanel state={state} set={set} metric={metric} data={data} />
          </aside>

          <main className="content">
            <button className="setup-fab" onClick={() => setInputsOpen(true)}>
              <span className="setup-fab-info">
                <span className="setup-fab-cal">{cal.name}</span>
                <span className="setup-fab-load">{load.mfr} {load.line} · {load.grains}gr {load.type}</span>
              </span>
              <span className="setup-fab-cta"><window.UI.Icon name="sliders" size={15} /> Adjust</span>
            </button>
            <div className="summary-strip">
              <StatCard label="Muzzle vel" value={Math.round(window.U.vel.to(activeMV, metric))} unit={" " + velUnit}
                sub={state.mvOverride != null ? "override" : state.barrelLength + '" barrel'} />
              <StatCard label="Zero" value={metric ? Math.round(state.zeroRange * 0.9144) : state.zeroRange} unit={" " + distUnit}
                sub={dragModel + " · BC " + activeBC.toFixed(3) + (state.bcOverride != null ? " trued" : "")} />
              <StatCard label={"Drop @ " + (metric ? Math.round(state.maxRange * 0.9144) : state.maxRange) + distUnit}
                value={(window.U.len.to(last.dropIn, metric)).toFixed(1)} unit={" " + lenUnit}
                sub={Math.abs(lastDial).toFixed(moaOrMil === "MIL" ? 1 : 1) + " " + moaOrMil + " come-up"} />
              <StatCard label={"Velocity @ " + (metric ? Math.round(state.maxRange * 0.9144) : state.maxRange) + distUnit}
                value={Math.round(window.U.vel.to(last.velocity, metric))} unit={" " + velUnit}
                sub={"Mach " + last.mach.toFixed(2)} />
              <StatCard label={"Energy @ " + (metric ? Math.round(state.maxRange * 0.9144) : state.maxRange) + distUnit}
                value={Math.round((metric ? 1.35582 : 1) * last.energy)} unit={" " + enUnit} />
              <StatCard label="Supersonic to" value={trans ? (metric ? Math.round(trans * 0.9144) : Math.round(trans)) : "—"}
                unit={trans ? " " + distUnit : ""} sub={trans ? "transonic limit" : "stays supersonic"} />
            </div>

            <nav className="tabs">
              {TABS.map(tb => (
                <button key={tb} className={tab === tb ? "tab active" : "tab"} onClick={() => setTab(tb)}><window.UI.Icon name={{"Trajectory": "arc", "Reticle Holds": "crosshair", "Energy & Velocity": "spark", "Data Table": "sheet"}[tb]} size={15} />{tb}</button>
              ))}
              <button className="export-btn" onClick={() => window.exportBallisticsXLS({ cal, load, state, metric, result, activeMV, dragModel })}
                title="Download the holdover table and all chart data as an Excel workbook">
                <window.UI.Icon name="sheet" size={15} /> Export to Excel
              </button>
            </nav>

            <div className="panel">
              {tab === "Trajectory" && (
                <div className="panel-pad">
                  <div className="panel-head">
                    <h2>Point of impact · trajectory</h2>
                    <p>Bullet path relative to line of sight from muzzle to {metric ? Math.round(state.maxRange * 0.9144) + " m" : state.maxRange + " yd"}, zeroed at {metric ? Math.round(state.zeroRange * 0.9144) + " m" : state.zeroRange + " yd"}.</p>
                  </div>
                  <window.TrajectoryChart result={result} metric={metric} showWind={state.showWind && state.windSpeed > 0} />
                </div>
              )}
              {tab === "Reticle Holds" && (
                <div className="panel-pad reticle-layout">
                  <div className="reticle-main">
                    <div className="panel-head">
                      <h2>{state.reticleType} · holds in {state.scopeUnit}</h2>
                      <p>{state.reticleType === "BDC"
                        ? "Marks are fixed in the glass — each label is the range that mark holds in the current solution."
                        : "Each mark is the hold for that range" + (state.showWind && state.windSpeed > 0 ? " with current wind applied." : ".")}</p>
                    </div>
                    <window.Reticle result={result} reticleType={state.reticleType} scopeUnit={state.scopeUnit}
                      metric={metric} showWind={state.showWind && state.windSpeed > 0} />
                  </div>
                  <div className="hold-list">
                    <div className="hl-head">
                      <span>Range</span><span>Drop</span><span>{state.showWind && state.windSpeed > 0 ? "Wind" : "—"}</span>
                    </div>
                    {holdSubset.map((r, i) => (
                      <div className="hl-row" key={i}>
                        <span className="mono hl-range">{metric ? Math.round(r.rangeM) + "m" : r.rangeYd + "y"}</span>
                        <span className="mono hl-drop">{nz(r["drop" + state.scopeUnit], state.scopeUnit === "MIL" ? 1 : 1)} <em>{state.scopeUnit}</em></span>
                        <span className="mono hl-wind">{state.showWind && state.windSpeed > 0 ? nz(r["wind" + state.scopeUnit], 1) + " " + state.scopeUnit : "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {tab === "Energy & Velocity" && (
                <div className="panel-pad">
                  <div className="panel-head">
                    <h2>Velocity &amp; energy retention</h2>
                    <p>Downrange speed and kinetic energy. Dashed line marks the transonic threshold (Mach 1).</p>
                  </div>
                  <window.RetentionChart result={result} metric={metric} />
                </div>
              )}
              {tab === "Data Table" && (
                <div className="panel-pad">
                  <div className="panel-head">
                    <h2>Drop &amp; windage table</h2>
                    <p>Full solution at {metric ? Math.round(state.increment * 0.9144) + " m" : state.increment + " yd"} increments. Scroll horizontally for all columns.</p>
                  </div>
                  <window.DataTable result={result} metric={metric} />
                </div>
              )}
            </div>

            <footer className="methodology">
              <span>3-DOF point-mass solver · {dragModel} drag model · standard atmosphere modeled from temperature &amp; altitude.</span>
              <span>Velocities are advertised factory data adjusted for barrel length. Verify against your own chronograph &amp; drops before relying on a firing solution.</span>
            </footer>
          </main>
        </div>
        )}

        <footer className="site-footer">
          <window.UI.Wordmark />
          <div className="sf-note">
            Ballistic outputs are planning guidance generated from advertised factory data — verify against your own chronograph and confirmed dope before relying on a firing solution.
          </div>
          <span className="sf-version mono">v{APP_VERSION}</span>
          <button className="sf-admin" onClick={() => setAdminOpen(true)}>Admin</button>
        </footer>

        {adminOpen && <AdminPortal onClose={() => setAdminOpen(false)} />}

        <window.TweaksPanel>
          <window.TweakSection label="Theme" />
          <window.TweakColor label="CTA accent (action)" value={t.accent}
            options={["#FF5A1F", "#0973BA", "#3FB37F", "#E5484D", "#74D8D6"]}
            onChange={(v) => setTweak("accent", v)} />
          <window.TweakColor label="Data accent" value={t.accent2}
            options={["#74D8D6", "#0973BA", "#F5C842", "#B7C2CC", "#3FB37F"]}
            onChange={(v) => setTweak("accent2", v)} />
          <window.TweakRadio label="Density" value={t.density} options={["compact", "regular", "comfy"]}
            onChange={(v) => setTweak("density", v)} />
        </window.TweaksPanel>
      </div>
    );
  }

  window.BallisticApp = App;
})();
