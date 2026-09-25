/* SVG charts: trajectory / point-of-impact curve and velocity+energy retention.
   Responsive via viewBox. Interactive hover crosshair on the trajectory chart.
   Exposes window.TrajectoryChart and window.RetentionChart. */
(function () {
  const { useState, useRef } = React;

  const W = 820, H = 380;
  const M = { l: 64, r: 24, t: 24, b: 46 };
  const PW = W - M.l - M.r;
  const PH = H - M.t - M.b;

  function niceTicks(min, max, count) {
    const span = max - min || 1;
    const raw = span / count;
    const mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / mag;
    let step;
    if (norm < 1.5) step = 1; else if (norm < 3) step = 2; else if (norm < 7) step = 5; else step = 10;
    step *= mag;
    const start = Math.ceil(min / step) * step;
    const ticks = [];
    for (let v = start; v <= max + 1e-9; v += step) ticks.push(v);
    return ticks;
  }

  function TrajectoryChart({ result, metric, showWind }) {
    const [hx, setHx] = useState(null);
    const ref = useRef(null);
    if (!result) return null;
    const path = result.path;
    const rangeMax = path[path.length - 1].rangeYd;
    const distConv = metric ? 0.9144 : 1;
    const lenConv = metric ? 2.54 : 1;       // inches -> cm
    const lenUnit = metric ? "cm" : "in";
    const distUnit = metric ? "m" : "yd";

    const xs = path.map(p => p.rangeYd * distConv);
    const drops = path.map(p => p.dropIn * lenConv);
    const winds = path.map(p => p.windIn * lenConv);

    const xMin = 0, xMax = rangeMax * distConv;
    let yMin = Math.min(0, ...drops);
    let yMax = Math.max(0, ...drops);
    if (showWind) { yMin = Math.min(yMin, ...winds); yMax = Math.max(yMax, ...winds); }
    const pad = (yMax - yMin) * 0.08 || 1;
    yMin -= pad; yMax += pad;

    const sx = (v) => M.l + (v - xMin) / (xMax - xMin) * PW;
    const sy = (v) => M.t + (yMax - v) / (yMax - yMin) * PH;

    const line = (arr) => arr.map((d, i) => (i ? "L" : "M") + sx(xs[i]).toFixed(1) + " " + sy(d).toFixed(1)).join(" ");

    const xticks = niceTicks(xMin, xMax, 8);
    const yticks = niceTicks(yMin, yMax, 6);

    // hover -> nearest sample
    let hi = null;
    if (hx != null) {
      const rangeV = xMin + (hx - M.l) / PW * (xMax - xMin);
      let bd = 1e9;
      xs.forEach((xv, i) => { const d = Math.abs(xv - rangeV); if (d < bd) { bd = d; hi = i; } });
    }

    function onMove(e) {
      const r = ref.current.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width * W;
      if (x >= M.l && x <= W - M.r) setHx(x); else setHx(null);
    }

    return (
      <div className="chart-block">
        <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="chart-svg"
             onMouseMove={onMove} onMouseLeave={() => setHx(null)}>
          {/* gridlines */}
          {yticks.map((t, i) => (
            <g key={"y" + i}>
              <line x1={M.l} y1={sy(t)} x2={W - M.r} y2={sy(t)}
                stroke={Math.abs(t) < 1e-6 ? "var(--grid-zero)" : "var(--grid)"}
                strokeWidth={Math.abs(t) < 1e-6 ? 1.4 : 1} />
              <text x={M.l - 9} y={sy(t) + 3.5} textAnchor="end" className="axis-lbl">{t.toFixed(0)}</text>
            </g>
          ))}
          {xticks.map((t, i) => (
            <g key={"x" + i}>
              <line x1={sx(t)} y1={M.t} x2={sx(t)} y2={H - M.b} stroke="var(--grid)" strokeWidth="1" />
              <text x={sx(t)} y={H - M.b + 18} textAnchor="middle" className="axis-lbl">{t.toFixed(0)}</text>
            </g>
          ))}
          {/* zero range marker */}
          {(() => {
            const zx = sx(result.summary.zeroRange * distConv);
            return <line x1={zx} y1={M.t} x2={zx} y2={H - M.b} stroke="var(--chart-2)"
              strokeWidth="1.2" strokeDasharray="4 4" opacity="0.8" />;
          })()}
          {/* wind curve */}
          {showWind && <path d={line(winds)} fill="none" stroke="var(--chart-2)" strokeWidth="2" opacity="0.85" />}
          {/* drop curve */}
          <path d={line(drops)} fill="none" stroke="var(--accent-2)" strokeWidth="2.6" />
          {/* hover */}
          {hi != null && (
            <g>
              <line x1={sx(xs[hi])} y1={M.t} x2={sx(xs[hi])} y2={H - M.b} stroke="var(--ink)" strokeWidth="1" opacity="0.4" />
              <circle cx={sx(xs[hi])} cy={sy(drops[hi])} r="4.5" fill="var(--accent-2)" stroke="#fff" strokeWidth="1.5" />
              {showWind && <circle cx={sx(xs[hi])} cy={sy(winds[hi])} r="3.5" fill="var(--chart-2)" stroke="#fff" strokeWidth="1.2" />}
            </g>
          )}
          {/* axis titles */}
          <text x={M.l + PW / 2} y={H - 6} textAnchor="middle" className="axis-title">Range ({distUnit})</text>
          <text x={16} y={M.t + PH / 2} textAnchor="middle" className="axis-title"
            transform={`rotate(-90 16 ${M.t + PH / 2})`}>Path ({lenUnit})</text>
        </svg>
        <div className="chart-readout">
          {hi != null ? (
            <React.Fragment>
              <span className="cr-k">{Math.round(xs[hi])}{distUnit}</span>
              <span className="cr-v" style={{ color: "var(--accent-2)" }}>{drops[hi].toFixed(1)} {lenUnit} drop</span>
              {showWind && <span className="cr-v" style={{ color: "var(--chart-2)" }}>{winds[hi].toFixed(1)} {lenUnit} wind</span>}
              <span className="cr-v">{Math.round(path[hi].velocity * (metric ? 0.3048 : 1))} {metric ? "m/s" : "fps"}</span>
            </React.Fragment>
          ) : (
            <span className="cr-hint">Hover the curve · <b style={{ color: "var(--accent-2)" }}>bullet path</b> · <b style={{ color: "var(--chart-2)" }}>{showWind ? "wind drift / zero" : "zero range"}</b></span>
          )}
        </div>
      </div>
    );
  }

  function RetentionChart({ result, metric, transonicMach }) {
    if (!result) return null;
    const path = result.path;
    const distConv = metric ? 0.9144 : 1;
    const distUnit = metric ? "m" : "yd";
    const velConv = metric ? 0.3048 : 1;
    const velUnit = metric ? "m/s" : "fps";
    const enConv = metric ? 1.35582 : 1;     // ft-lb -> J
    const enUnit = metric ? "J" : "ft·lb";

    const xs = path.map(p => p.rangeYd * distConv);
    const vel = path.map(p => p.velocity * velConv);
    const en = path.map(p => p.energy * enConv);
    const xMax = xs[xs.length - 1];
    const vMax = Math.max(...vel) * 1.05;
    const eMax = Math.max(...en) * 1.05;

    const sx = (v) => M.l + v / xMax * PW;
    const syV = (v) => M.t + (vMax - v) / vMax * PH;
    const syE = (v) => M.t + (eMax - v) / eMax * PH;
    const lineV = vel.map((d, i) => (i ? "L" : "M") + sx(xs[i]).toFixed(1) + " " + syV(d).toFixed(1)).join(" ");
    const lineE = en.map((d, i) => (i ? "L" : "M") + sx(xs[i]).toFixed(1) + " " + syE(d).toFixed(1)).join(" ");

    const xticks = niceTicks(0, xMax, 8);
    const vticks = niceTicks(0, vMax, 5);
    const eticks = niceTicks(0, eMax, 5);

    // transonic / subsonic threshold line
    const sos = result.summary.sos;
    const machX = (() => {
      for (let i = 0; i < path.length; i++) if (path[i].velocity <= sos * 1.0) return sx(xs[i]);
      return null;
    })();

    return (
      <div className="chart-block">
        <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg">
          {vticks.map((t, i) => (
            <g key={"v" + i}>
              <line x1={M.l} y1={syV(t)} x2={W - M.r} y2={syV(t)} stroke="var(--grid)" strokeWidth="1" />
              <text x={M.l - 9} y={syV(t) + 3.5} textAnchor="end" className="axis-lbl" style={{ fill: "var(--accent-2)" }}>{Math.round(t)}</text>
            </g>
          ))}
          {eticks.map((t, i) => (
            <text key={"e" + i} x={W - M.r + 8} y={syE(t) + 3.5} textAnchor="start" className="axis-lbl" style={{ fill: "var(--chart-2)" }}>{Math.round(t)}</text>
          ))}
          {xticks.map((t, i) => (
            <g key={"x" + i}>
              <line x1={sx(t)} y1={M.t} x2={sx(t)} y2={H - M.b} stroke="var(--grid)" strokeWidth="1" />
              <text x={sx(t)} y={H - M.b + 18} textAnchor="middle" className="axis-lbl">{Math.round(t)}</text>
            </g>
          ))}
          {machX != null && (
            <g>
              <line x1={machX} y1={M.t} x2={machX} y2={H - M.b} stroke="var(--ink)" strokeDasharray="3 4" strokeWidth="1" opacity="0.45" />
              <text x={machX + 4} y={M.t + 12} className="axis-lbl" style={{ opacity: 0.7 }}>Mach 1</text>
            </g>
          )}
          <path d={lineE} fill="none" stroke="var(--chart-2)" strokeWidth="2.4" />
          <path d={lineV} fill="none" stroke="var(--accent-2)" strokeWidth="2.6" />
          <text x={M.l + PW / 2} y={H - 6} textAnchor="middle" className="axis-title">Range ({distUnit})</text>
          <text x={16} y={M.t + PH / 2} textAnchor="middle" className="axis-title"
            transform={`rotate(-90 16 ${M.t + PH / 2})`} style={{ fill: "var(--accent-2)" }}>Velocity ({velUnit})</text>
          <text x={W - 12} y={M.t + PH / 2} textAnchor="middle" className="axis-title"
            transform={`rotate(90 ${W - 12} ${M.t + PH / 2})`} style={{ fill: "var(--chart-2)" }}>Energy ({enUnit})</text>
        </svg>
        <div className="chart-readout">
          <span className="cr-hint"><b style={{ color: "var(--accent-2)" }}>Velocity</b> &amp; <b style={{ color: "var(--chart-2)" }}>energy</b> retention vs range{machX != null ? " · dashed = transonic" : ""}</span>
        </div>
      </div>
    );
  }

  /* ----------------------------------------------------------------
     Multi-caliber trajectory comparison.
     series: [{ result, color, label, loadLabel, mv, velUnit }]
     Every line is drawn on ONE shared, fixed X/Y scale derived from the
     full min/max drop across *all* series — so switching or adding a
     caliber never rescales the reference frame. Works for 1..N series
     (a single series renders just like the classic chart). Hover (mouse)
     or drag (touch) scrubs a vertical readout across every line.
  ---------------------------------------------------------------- */
  function dropAtRange(path, lenConv, rangeYd) {
    if (rangeYd <= path[0].rangeYd) return path[0].dropIn * lenConv;
    for (let i = 1; i < path.length; i++) {
      if (path[i].rangeYd >= rangeYd) {
        const a = path[i - 1], b = path[i];
        const f = (rangeYd - a.rangeYd) / ((b.rangeYd - a.rangeYd) || 1);
        return (a.dropIn + (b.dropIn - a.dropIn) * f) * lenConv;
      }
    }
    return path[path.length - 1].dropIn * lenConv;
  }
  function velAtRange(path, rangeYd) {
    if (rangeYd <= path[0].rangeYd) return path[0].velocity;
    for (let i = 1; i < path.length; i++) {
      if (path[i].rangeYd >= rangeYd) {
        const a = path[i - 1], b = path[i];
        const f = (rangeYd - a.rangeYd) / ((b.rangeYd - a.rangeYd) || 1);
        return a.velocity + (b.velocity - a.velocity) * f;
      }
    }
    return path[path.length - 1].velocity;
  }

  function TrajectoryCompareChart({ series, metric, zeroRange, maxRange }) {
    const [hx, setHx] = useState(null);
    const ref = useRef(null);
    const pressed = useRef(false);
    if (!series || !series.length) return null;

    const distConv = metric ? 0.9144 : 1;
    const lenConv = metric ? 2.54 : 1;
    const lenUnit = metric ? "cm" : "in";
    const distUnit = metric ? "m" : "yd";

    // SHARED X: every line shares the requested max range (not its own
    // integration cut-off), so all curves sit on one identical axis.
    const xMin = 0, xMax = maxRange * distConv;

    // SHARED, FIXED Y: scan EVERY series' full drop curve for the global
    // min/max — auto-scaled to the union, anchored to include the zero line.
    let yMin = 0, yMax = 0;
    series.forEach(s => {
      s.result.path.forEach(p => {
        if (p.rangeYd > maxRange + 0.5) return;
        const d = p.dropIn * lenConv;
        if (d < yMin) yMin = d;
        if (d > yMax) yMax = d;
      });
    });
    const pad = (yMax - yMin) * 0.08 || 1;
    yMin -= pad; yMax += pad;

    const sx = (v) => M.l + (v - xMin) / (xMax - xMin) * PW;
    const sy = (v) => M.t + (yMax - v) / (yMax - yMin) * PH;

    const xticks = niceTicks(xMin, xMax, 8);
    const yticks = niceTicks(yMin, yMax, 6);

    // build a clipped path string for a series (only up to xMax)
    const linePath = (s) => {
      const pts = [];
      s.result.path.forEach(p => {
        if (p.rangeYd > maxRange + 0.5) return;
        pts.push(sx(p.rangeYd * distConv).toFixed(1) + " " + sy(p.dropIn * lenConv).toFixed(1));
      });
      return pts.map((pt, i) => (i ? "L" : "M") + pt).join(" ");
    };
    // endpoint of each curve (last sample within range)
    const endPoint = (s) => {
      let last = s.result.path[0];
      for (const p of s.result.path) { if (p.rangeYd > maxRange + 0.5) break; last = p; }
      return { x: sx(last.rangeYd * distConv), y: sy(last.dropIn * lenConv) };
    };

    // hovered range
    let hoverRangeYd = null;
    if (hx != null) {
      const v = xMin + (hx - M.l) / PW * (xMax - xMin);   // display units
      hoverRangeYd = Math.max(0, Math.min(maxRange, v / distConv));
    }

    function pointerToX(e) {
      const r = ref.current.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width * W;
      if (x >= M.l && x <= W - M.r) setHx(x); else setHx(null);
    }
    function onPointerMove(e) {
      if (e.pointerType !== "mouse" && !pressed.current) return;
      pointerToX(e);
    }
    function onPointerDown(e) { pressed.current = true; pointerToX(e); }
    function onPointerUp() { pressed.current = false; }

    return (
      <div className="chart-block">
        <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="chart-svg cmp-chart"
             onPointerMove={onPointerMove} onPointerDown={onPointerDown}
             onPointerUp={onPointerUp} onPointerLeave={() => { pressed.current = false; setHx(null); }}>
          {yticks.map((tk, i) => (
            <g key={"y" + i}>
              <line x1={M.l} y1={sy(tk)} x2={W - M.r} y2={sy(tk)}
                stroke={Math.abs(tk) < 1e-6 ? "var(--grid-zero)" : "var(--grid)"}
                strokeWidth={Math.abs(tk) < 1e-6 ? 1.4 : 1} />
              <text x={M.l - 9} y={sy(tk) + 3.5} textAnchor="end" className="axis-lbl">{tk.toFixed(0)}</text>
            </g>
          ))}
          {xticks.map((tk, i) => (
            <g key={"x" + i}>
              <line x1={sx(tk)} y1={M.t} x2={sx(tk)} y2={H - M.b} stroke="var(--grid)" strokeWidth="1" />
              <text x={sx(tk)} y={H - M.b + 18} textAnchor="middle" className="axis-lbl">{tk.toFixed(0)}</text>
            </g>
          ))}
          {/* shared zero marker */}
          {(() => {
            const zx = sx(zeroRange * distConv);
            return <line x1={zx} y1={M.t} x2={zx} y2={H - M.b} stroke="var(--chart-2)"
              strokeWidth="1.2" strokeDasharray="4 4" opacity="0.7" />;
          })()}
          {/* one curve per caliber */}
          {series.map((s, i) => (
            <path key={"ln" + i} d={linePath(s)} fill="none" stroke={s.color}
              strokeWidth={series.length === 1 ? 2.6 : 2.2}
              strokeLinejoin="round" strokeLinecap="round" />
          ))}
          {/* endpoint markers */}
          {series.map((s, i) => {
            const e = endPoint(s);
            return <circle key={"ep" + i} cx={e.x} cy={e.y} r="3.2" fill={s.color} stroke="var(--surface)" strokeWidth="1.4" />;
          })}
          {/* hover guide + per-series dots */}
          {hoverRangeYd != null && (
            <g>
              <line x1={sx(hoverRangeYd * distConv)} y1={M.t} x2={sx(hoverRangeYd * distConv)} y2={H - M.b}
                stroke="var(--ink)" strokeWidth="1" opacity="0.4" />
              {series.map((s, i) => {
                const d = dropAtRange(s.result.path, lenConv, hoverRangeYd);
                return <circle key={"hd" + i} cx={sx(hoverRangeYd * distConv)} cy={sy(d)} r="4.2"
                  fill={s.color} stroke="#fff" strokeWidth="1.4" />;
              })}
            </g>
          )}
          <text x={M.l + PW / 2} y={H - 6} textAnchor="middle" className="axis-title">Range ({distUnit})</text>
          <text x={16} y={M.t + PH / 2} textAnchor="middle" className="axis-title"
            transform={`rotate(-90 16 ${M.t + PH / 2})`}>Path ({lenUnit})</text>
        </svg>

        <div className="cmp-legend-readout">
          {hoverRangeYd != null && (
            <span className="clr-range mono">{Math.round(hoverRangeYd * distConv)}{distUnit}</span>
          )}
          {series.map((s, i) => (
            <span className="clr-item" key={"lg" + i}>
              <i className="clr-swatch" style={{ background: s.color }}></i>
              <span className="clr-name">{s.label}</span>
              {hoverRangeYd != null && (
                <b className="clr-val mono" style={{ color: s.color }}>
                  {dropAtRange(s.result.path, lenConv, hoverRangeYd).toFixed(1)} {lenUnit}
                </b>
              )}
            </span>
          ))}
          {hoverRangeYd == null && <span className="clr-hint">Hover or drag across the chart to read drop at any range · zero held at {metric ? Math.round(zeroRange * 0.9144) + "m" : zeroRange + "yd"}</span>}
        </div>
      </div>
    );
  }

  window.TrajectoryChart = TrajectoryChart;
  window.RetentionChart = RetentionChart;
  window.TrajectoryCompareChart = TrajectoryCompareChart;
})();
