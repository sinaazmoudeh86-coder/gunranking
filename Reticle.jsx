/* Reticle hold visualizer — renders a scope view (dark field) with the chosen reticle
   pattern and overlays computed holdover/wind-hold marks for a set of ranges.
   Reticle types: MIL grid, MOA grid, BDC, Duplex, Christmas-tree.
   Exposes window.Reticle. */
(function () {
  const { useState } = React;

  const C = 200;            // center of 400x400 viewBox
  const ACCENT = "var(--accent-2)";
  const HOLD = "var(--accent-2)";

  const nz = (v, d) => { let s = v.toFixed(d); if (/^-0(\.0+)?$/.test(s)) s = s.slice(1); return s; };

  // Pick holds from rows: nonzero ranges, capped to ~7 marks, evenly stepped.
  function pickHolds(rows, zeroRange) {
    const candidates = rows.filter(r => r.rangeYd > 0);
    if (candidates.length <= 8) return candidates;
    const step = Math.ceil(candidates.length / 7);
    const out = [];
    for (let i = 0; i < candidates.length; i += step) out.push(candidates[i]);
    if (out[out.length - 1] !== candidates[candidates.length - 1])
      out.push(candidates[candidates.length - 1]);
    return out;
  }

  function fmtRange(r, metric) {
    return metric ? Math.round(r.rangeM) + "m" : r.rangeYd + "y";
  }

  // compact cartridge label for the comparison ledger header
  function shortCal(name) {
    return name
      .replace("Winchester Magnum", "Win Mag").replace("Winchester", "Win")
      .replace("Magnum", "Mag").replace("Creedmoor", "Creed")
      .replace("Springfield", "Sprg").replace("Remington", "Rem")
      .replace("Government", "Gov").replace(" / 5.56 NATO", "").replace(" NATO", "");
  }

  function Reticle({ result, reticleType, scopeUnit, metric, showWind, series, activeId }) {
    const [hover, setHover] = useState(null);
    if (!result) return null;
    const multi = !!(series && series.length > 1);
    const rows = result.rows;
    const unitKey = scopeUnit === "MIL" ? "MIL" : "MOA";
    const holds = pickHolds(rows, result.summary.zeroRange);

    // value (in scope units) for a row
    const dropVal = (r) => -r["drop" + unitKey];   // bullet drops below LOS -> hold below center (positive down)
    const windVal = (r) => r["wind" + unitKey];

    // comparison: each line's picked holds (ranges align — all solved on same increment)
    const seriesHolds = multi ? series.map(s => ({
      id: s.id, color: s.color, label: s.cal ? s.cal.name : s.label, result: s.result,
      holds: pickHolds(s.result.rows, s.result.summary.zeroRange)
    })) : null;
    const allHolds = multi ? seriesHolds.reduce((a, s) => a.concat(s.holds), []) : holds;

    // field extent — must fit the deepest hold across EVERY compared line
    let maxV = unitKey === "MIL" ? 3 : 10;
    allHolds.forEach(r => {
      maxV = Math.max(maxV, Math.abs(dropVal(r)) * 1.12, Math.abs(windVal(r)) * 1.3);
    });
    // round up to a clean number
    const stepUnit = unitKey === "MIL" ? 1 : 5;
    maxV = Math.ceil(maxV / stepUnit) * stepUnit;
    const usable = 168;
    const px = usable / maxV;                 // px per scope unit
    const toX = (v) => C + v * px;
    const toY = (v) => C + v * px;            // +down

    const tickEvery = unitKey === "MIL" ? 1 : (maxV > 30 ? 10 : 5);
    const subEvery = unitKey === "MIL" ? 0.5 : (maxV > 30 ? 5 : 1);

    // ---- reticle geometry per type ----
    const els = [];
    const thin = "rgba(255,255,255,0.85)";
    const faint = "rgba(255,255,255,0.32)";
    const post = "rgba(255,255,255,0.92)";

    function gridReticle(unit) {
      // main crosshair (fine center, thicker outer posts)
      const gap = 10;
      els.push(<line key="vt1" x1={C} y1="14" x2={C} y2={C - gap} stroke={post} strokeWidth="2.4" />);
      els.push(<line key="vt2" x1={C} y1={C + gap} x2={C} y2="386" stroke={post} strokeWidth="2.4" />);
      els.push(<line key="hz1" x1="14" y1={C} x2={C - gap} y2={C} stroke={post} strokeWidth="2.4" />);
      els.push(<line key="hz2" x1={C + gap} y1={C} x2="386" y2={C} stroke={post} strokeWidth="2.4" />);
      // fine inner cross
      els.push(<line key="fv" x1={C} y1={C - gap} x2={C} y2={C + gap} stroke={thin} strokeWidth="1" />);
      els.push(<line key="fh" x1={C - gap} y1={C} x2={C + gap} y2={C} stroke={thin} strokeWidth="1" />);
      // ticks
      for (let v = -maxV; v <= maxV + 0.001; v += subEvery) {
        if (Math.abs(v) < 1e-6) continue;
        const isMajor = Math.abs(v % tickEvery) < 1e-6;
        const len = isMajor ? 7 : 4;
        // vertical axis ticks
        els.push(<line key={"vy" + v} x1={C - len} y1={toY(v)} x2={C + len} y2={toY(v)}
          stroke={isMajor ? thin : faint} strokeWidth={isMajor ? 1.4 : 0.8} />);
        // horizontal axis ticks
        els.push(<line key={"hx" + v} x1={toX(v)} y1={C - len} x2={toX(v)} y2={C + len}
          stroke={isMajor ? thin : faint} strokeWidth={isMajor ? 1.4 : 0.8} />);
        if (isMajor && Math.abs(v) >= tickEvery - 1e-6) {
          els.push(<text key={"lvy" + v} x={C + 11} y={toY(v) + 3} fill={faint}
            fontSize="9" fontFamily="var(--mono)">{Math.abs(v)}</text>);
        }
      }
    }

    function duplexReticle() {
      const inner = 26;
      els.push(<line key="vt1" x1={C} y1="6" x2={C} y2={C - inner} stroke={post} strokeWidth="7" />);
      els.push(<line key="vt2" x1={C} y1={C + inner} x2={C} y2="394" stroke={post} strokeWidth="7" />);
      els.push(<line key="hz1" x1="6" y1={C} x2={C - inner} y2={C} stroke={post} strokeWidth="7" />);
      els.push(<line key="hz2" x1={C + inner} y1={C} x2="394" y2={C} stroke={post} strokeWidth="7" />);
      els.push(<line key="fv" x1={C} y1={C - inner} x2={C} y2={C + inner} stroke={thin} strokeWidth="1.2" />);
      els.push(<line key="fh" x1={C - inner} y1={C} x2={C + inner} y2={C} stroke={thin} strokeWidth="1.2" />);
    }

    function bdcReticle() {
      // vertical & horizontal fine lines, with stadia circles at fixed subtensions
      els.push(<line key="v" x1={C} y1="14" x2={C} y2="386" stroke={thin} strokeWidth="1" />);
      els.push(<line key="h" x1="40" y1={C} x2="360" y2={C} stroke={thin} strokeWidth="1" />);
      // center ring
      els.push(<circle key="cr" cx={C} cy={C} r="5" fill="none" stroke={post} strokeWidth="1.4" />);
      // BDC stadia sit at FIXED subtensions (fixed in the glass). Only the RANGE each
      // mark represents changes with conditions — interpolated from the trajectory.
      const fixedMarks = unitKey === "MIL"
        ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        : [2, 4, 6, 8, 10, 12, 15, 20, 25, 30, 35];
      const path = result.path;
      const perInch = (rng) => unitKey === "MIL" ? 1 / (3.59999 * rng / 100) : 1 / (1.04720 * rng / 100);
      // find the range (yd) where downward hold equals subtension v
      function rangeForSub(v) {
        for (let i = 1; i < path.length; i++) {
          const ra = path[i - 1].rangeYd, rb = path[i].rangeYd;
          if (ra <= 0) continue;
          const da = -path[i - 1].dropIn * perInch(ra);   // positive = below LOS
          const db = -path[i].dropIn * perInch(rb);
          if (da <= v && db >= v) {
            const f = (v - da) / ((db - da) || 1);
            return ra + (rb - ra) * f;
          }
        }
        return null;
      }
      fixedMarks.forEach((v, i) => {
        if (v > maxV + 1e-6) return;
        const y = toY(v);
        els.push(<circle key={"bc" + i} cx={C} cy={y} r="4" fill="none" stroke={post} strokeWidth="1.3" />);
        els.push(<line key={"bl" + i} x1={C - 14} y1={y} x2={C - 6} y2={y} stroke={faint} strokeWidth="1" />);
        els.push(<line key={"br" + i} x1={C + 6} y1={y} x2={C + 14} y2={y} stroke={faint} strokeWidth="1" />);
        els.push(<text key={"bv" + i} x={C - 18} y={y + 3} textAnchor="end" fill={faint}
          fontSize="8.5" fontFamily="var(--mono)">{v}{unitKey === "MIL" ? "" : ""}</text>);
        const rng = rangeForSub(v);
        if (rng != null) {
          const yd = Math.round(rng / 5) * 5;
          const lbl = metric ? Math.round(yd * 0.9144 / 5) * 5 + "m" : yd + "y";
          els.push(<text key={"bt" + i} x={C + 17} y={y + 3} fill={ACCENT}
            fontSize="9.5" fontFamily="var(--mono)" fontWeight="600">{lbl}</text>);
        }
      });
    }

    function treeReticle() {
      // central stadia line with widening wind dots forming a tree
      els.push(<line key="vt1" x1={C} y1="12" x2={C} y2={C - 9} stroke={post} strokeWidth="2.2" />);
      els.push(<line key="hz1" x1="20" y1={C} x2={C - 9} y2={C} stroke={post} strokeWidth="2.2" />);
      els.push(<line key="hz2" x1={C + 9} y1={C} x2="380" y2={C} stroke={post} strokeWidth="2.2" />);
      els.push(<line key="fv" x1={C} y1={C - 9} x2={C} y2="392" stroke={thin} strokeWidth="1" />);
      // horizontal wind hashes on the upper line
      for (let v = -maxV; v <= maxV + 1e-6; v += (unitKey === "MIL" ? 1 : tickEvery)) {
        if (Math.abs(v) < 1e-6) continue;
        els.push(<line key={"wt" + v} x1={toX(v)} y1={C - 5} x2={toX(v)} y2={C + 5}
          stroke={faint} strokeWidth="1" />);
      }
      // tree rows: at each mil below center, dots spreading wider
      const rowStep = unitKey === "MIL" ? 1 : tickEvery;
      for (let v = rowStep; v <= maxV + 1e-6; v += rowStep) {
        const y = toY(v);
        const spread = Math.min(maxV, v * 0.5 + 0.5);
        const dotStep = unitKey === "MIL" ? 0.5 : tickEvery;
        for (let w = -spread; w <= spread + 1e-6; w += dotStep) {
          els.push(<circle key={"td" + v + "_" + w} cx={toX(w)} cy={y} r="1.5"
            fill={Math.abs(w) < 1e-6 ? thin : faint} />);
        }
        els.push(<text key={"tl" + v} x={C - spread * px - 16} y={y + 3} fill={faint}
          fontSize="8.5" fontFamily="var(--mono)">{v}</text>);
      }
    }

    if (reticleType === "Duplex") duplexReticle();
    else if (reticleType === "BDC") bdcReticle();
    else if (reticleType === "Christmas Tree") treeReticle();
    else gridReticle(unitKey);   // MIL grid / MOA grid

    // ---- holdover marks (suppressed for BDC: its own marks carry the range labels) ----
    // Compare mode: one colored dot per line at its true drop; the ACTIVE line's
    // marks carry the white range labels. Single mode keeps the classic behavior.
    let holdEls;
    if (reticleType === "BDC") {
      holdEls = [];
    } else if (multi) {
      holdEls = [];
      seriesHolds.forEach((s, si) => {
        const isActive = s.id === activeId;
        s.holds.forEach((r, i) => {
          const y = toY(dropVal(r));
          if (y > 392 || y < 8) return;
          holdEls.push(
            <circle key={"d" + si + "_" + i} cx={C} cy={y} r={isActive ? 4.8 : 3.4}
              fill={s.color} stroke="#0c0e11" strokeWidth="1.2" opacity={isActive ? 1 : 0.92} />
          );
          if (isActive) {
            holdEls.push(
              <text key={"t" + si + "_" + i} x={C + 10} y={y + 3.5} fill="#fff" fontSize="10"
                fontFamily="var(--mono)" fontWeight="600"
                style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.6)", strokeWidth: 2.5 }}>
                {fmtRange(r, metric)}
              </text>
            );
          }
        });
      });
    } else {
      holdEls = holds.map((r, i) => {
        const y = toY(dropVal(r));
        const x = showWind ? toX(windVal(r)) : C;
        if (y > 392 || y < 8) return null;
        const isHover = hover === i;
        return (
          <g key={"h" + i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
             style={{ cursor: "pointer" }}>
            <circle cx={x} cy={y} r={isHover ? 6 : 4.2} fill={HOLD} stroke="#fff" strokeWidth="1.2" />
            <text x={x + 9} y={y + 3.5} fill="#fff" fontSize="10.5" fontFamily="var(--mono)"
              fontWeight="600" style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.55)", strokeWidth: 2.5 }}>
              {fmtRange(r, metric)}
            </text>
          </g>
        );
      });
    }

    const hovered = (!multi && hover != null) ? holds[hover] : null;

    return (
      <div className="reticle-wrap">
        <svg viewBox="0 0 400 400" className="reticle-svg" role="img" aria-label="Reticle hold view">
          <defs>
            <radialGradient id="scopeField" cx="50%" cy="46%" r="62%">
              <stop offset="0%" stopColor="#3a4048" />
              <stop offset="70%" stopColor="#23272d" />
              <stop offset="100%" stopColor="#15181c" />
            </radialGradient>
          </defs>
          <circle cx={C} cy={C} r="196" fill="url(#scopeField)" />
          <circle cx={C} cy={C} r="195" fill="none" stroke="#0c0e11" strokeWidth="8" />
          {els}
          {holdEls}
        </svg>
        <div className="reticle-readout">
          {hovered ? (
            <React.Fragment>
              <span className="rr-range">{fmtRange(hovered, metric)}</span>
              <span className="rr-pair"><b>{hovered["drop" + unitKey].toFixed(unitKey === "MIL" ? 1 : 1)}</b> {unitKey} drop</span>
              {showWind && <span className="rr-pair"><b>{hovered["wind" + unitKey].toFixed(1)}</b> {unitKey} wind</span>}
              <span className="rr-pair"><b>{Math.round(hovered.velocity)}</b> fps</span>
            </React.Fragment>
          ) : (
            <span className="rr-hint">{multi
              ? <React.Fragment>Each color is one caliber&rsquo;s holds in <b>{unitKey}</b> · read exact dials in the ledger</React.Fragment>
              : reticleType === "BDC"
              ? <React.Fragment>Stadia fixed in <b>{unitKey}</b> · labels = range each mark holds in current conditions</React.Fragment>
              : <React.Fragment>Hover a hold mark · marks in <b>{unitKey}</b>{showWind ? " · wind applied" : ""}</React.Fragment>}</span>
          )}
        </div>
        {multi && (
          <div className="reticle-ledger">
            <div className="rl-row rl-head">
              <span className="rl-rng">Range</span>
              {seriesHolds.map((s) => (
                <span className="rl-cal" key={"hc" + s.id} title={s.label}>
                  <i className="rl-dot" style={{ background: s.color }}></i>{shortCal(s.label)}
                </span>
              ))}
            </div>
            {holds.map((r, ri) => (
              <div className="rl-row" key={"rr" + ri}>
                <span className="rl-rng mono">{fmtRange(r, metric)}</span>
                {seriesHolds.map((s) => {
                  const row = s.result.rows.find(x => x.rangeYd === r.rangeYd);
                  return (
                    <span className="rl-val mono" key={"rv" + s.id} style={{ color: s.color }}>
                      {row ? nz(row["drop" + unitKey], 1) : "\u2014"}
                    </span>
                  );
                })}
              </div>
            ))}
            <div className="rl-foot">holds in <b>{unitKey}</b> · come-up to dial or hold under</div>
          </div>
        )}
      </div>
    );
  }

  window.Reticle = Reticle;
})();
