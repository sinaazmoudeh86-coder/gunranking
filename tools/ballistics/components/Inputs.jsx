/* Input panel: cartridge cascade (caliber -> manufacturer -> line -> load), rifle setup,
   environment, and solution config. Stores values internally in imperial; converts for
   display when metric is active. Exposes window.InputPanel + helpers window.U. */
(function () {
  const { useMemo } = React;

  /* ---- unit conversion helpers (internal store is always imperial) ---- */
  const U = {
    dist: { to: (yd, m) => m ? yd * 0.9144 : yd, from: (v, m) => m ? v / 0.9144 : v, unit: (m) => m ? "m" : "yd" },
    len:  { to: (inch, m) => m ? inch * 2.54 : inch, from: (v, m) => m ? v / 2.54 : v, unit: (m) => m ? "cm" : "in" },
    vel:  { to: (fps, m) => m ? fps * 0.3048 : fps, from: (v, m) => m ? v / 0.3048 : v, unit: (m) => m ? "m/s" : "fps" },
    spd:  { to: (mph, m) => m ? mph * 1.60934 : mph, from: (v, m) => m ? v / 1.60934 : v, unit: (m) => m ? "km/h" : "mph" },
    temp: { to: (f, m) => m ? (f - 32) * 5 / 9 : f, from: (v, m) => m ? v * 9 / 5 + 32 : v, unit: (m) => m ? "°C" : "°F" },
    alt:  { to: (ft, m) => m ? ft * 0.3048 : ft, from: (v, m) => m ? v / 0.3048 : v, unit: (m) => m ? "m" : "ft" }
  };
  window.U = U;

  function uniq(arr) { return Array.from(new Set(arr)); }

  function Field({ label, hint, children }) {
    return (
      <label className="field">
        <span className="field-label">{label}{hint && <em>{hint}</em>}</span>
        {children}
      </label>
    );
  }

  function NumberInput({ value, onChange, conv, metric, step, min, max, decimals }) {
    const disp = conv ? conv.to(value, metric) : value;
    const f = Math.pow(10, decimals != null ? decimals : 2);
    const rounded = Math.round(disp * f) / f;
    const commit = (nextDisp) => {
      let v = nextDisp;
      if (min != null) v = Math.max(min, v);
      if (max != null) v = Math.min(max, v);
      onChange(conv ? conv.from(v, metric) : v);
    };
    const st = step || 1;
    return (
      <div className="num-input">
        <input type="number" value={rounded} step={st} min={min} max={max}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (isNaN(v)) return;
            commit(v);
          }} />
        {conv && <span className="num-unit">{conv.unit(metric)}</span>}
        <div className="num-steps">
          <button type="button" tabIndex={-1} aria-label="increase" onClick={() => commit(rounded + st)}>▲</button>
          <button type="button" tabIndex={-1} aria-label="decrease" onClick={() => commit(rounded - st)}>▼</button>
        </div>
      </div>
    );
  }

  function Slider({ value, onChange, conv, metric, min, max, step, fmt }) {
    const disp = conv ? conv.to(value, metric) : value;
    return (
      <div className="slider-row">
        <input type="range" min={min} max={max} step={step} value={disp}
          onChange={(e) => onChange(conv ? conv.from(parseFloat(e.target.value), metric) : parseFloat(e.target.value))} />
        <span className="slider-val mono">{fmt ? fmt(disp) : Math.round(disp)}{conv ? " " + conv.unit(metric) : ""}</span>
      </div>
    );
  }

  function Segmented({ value, options, onChange }) {
    return (
      <div className="segmented">
        {options.map(o => (
          <button key={o.v} className={value === o.v ? "seg active" : "seg"}
            onClick={() => onChange(o.v)} type="button">{o.l}</button>
        ))}
      </div>
    );
  }

  function WindDial({ dir, onChange }) {
    const cx = 38, cy = 38, r = 28;
    const ang = ((dir % 12) / 12) * Math.PI * 2 - Math.PI / 2;
    const ax = cx + Math.cos(ang) * r, ay = cy + Math.sin(ang) * r;
    return (
      <svg viewBox="0 -14 76 90" className="wind-dial">
        <text x={cx} y="-4" textAnchor="middle" className="dial-12">12</text>
        <circle cx={cx} cy={cy} r={r + 5} fill="var(--surface-2)" stroke="var(--line)" />
        <line x1={cx} y1={cy} x2={ax} y2={ay} stroke="var(--accent)" strokeWidth="2" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
          const sel = (dir % 12) === i;
          return <g key={i} style={{ cursor: "pointer" }} onClick={() => onChange(i === 0 ? 12 : i)}>
            <circle cx={x} cy={y} r="9" fill="transparent" />
            <circle cx={x} cy={y} r={sel ? 4.5 : 3} fill={sel ? "var(--accent)" : "var(--ink-3)"} />
          </g>;
        })}
        <circle cx={cx} cy={cy} r="2.5" fill="var(--ink)" pointerEvents="none" />
      </svg>
    );
  }

  function InputPanel(props) {
    const { state, set, metric, data } = props;
    const cal = useMemo(() => data.find(c => c.id === state.caliberId), [data, state.caliberId]);

    const mfrs = useMemo(() => uniq(cal.loads.map(l => l.mfr)), [cal]);
    const lines = useMemo(() => uniq(cal.loads.filter(l => l.mfr === state.mfr).map(l => l.line)), [cal, state.mfr]);
    const loads = useMemo(() => cal.loads.filter(l => l.mfr === state.mfr && l.line === state.line), [cal, state.mfr, state.line]);
    const load = loads[state.loadIdx] || loads[0] || cal.loads[0];

    // grouped caliber options by category
    const groups = useMemo(() => {
      const g = {};
      data.forEach(c => { (g[c.category] = g[c.category] || []).push(c); });
      return g;
    }, [data]);

    function chooseCaliber(id) {
      const c = data.find(x => x.id === id);
      const m = c.loads[0].mfr;
      const ln = c.loads.find(l => l.mfr === m).line;
      set({ caliberId: id, mfr: m, line: ln, loadIdx: 0, barrelLength: c.defaultBarrel, mvOverride: null, bcOverride: null, twist: c.defaultTwist != null ? c.defaultTwist : 10 });
    }
    function chooseMfr(m) {
      const ln = cal.loads.find(l => l.mfr === m).line;
      set({ mfr: m, line: ln, loadIdx: 0, mvOverride: null, bcOverride: null });
    }
    function chooseLine(ln) { set({ line: ln, loadIdx: 0, mvOverride: null, bcOverride: null }); }
    function chooseLoad(i) { set({ loadIdx: i, mvOverride: null, bcOverride: null }); }

    const computedMV = window.BallisticsSolver.adjustMV(load.mv, load.testBarrel, state.barrelLength, cal.fpsPerInch);
    const activeMV = state.mvOverride != null ? state.mvOverride : computedMV;
    const dragModel = state.dragModel === "Auto" ? (load.bcG7 ? "G7" : "G1") : state.dragModel;
    const activeBC = dragModel === "G7" ? (load.bcG7 || load.bcG1) : load.bcG1;
    const stab = window.BallisticsSolver.stability(state.twist, cal.diameter, load.grains, activeMV);

    return (
      <div className="input-panel">
        {/* CARTRIDGE */}
        <section className="grp">
          <h3 className="grp-title">Cartridge</h3>
          <Field label="Caliber">
            <select className="select" value={state.caliberId} onChange={(e) => chooseCaliber(e.target.value)}>
              {Object.keys(groups).map(cat => (
                <optgroup key={cat} label={cat}>
                  {groups[cat].map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </optgroup>
              ))}
            </select>
          </Field>
          <div className="two-col">
            <Field label="Manufacturer">
              <select className="select" value={state.mfr} onChange={(e) => chooseMfr(e.target.value)}>
                {mfrs.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Product line">
              <select className="select" value={state.line} onChange={(e) => chooseLine(e.target.value)}>
                {lines.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Load">
            <select className="select" value={state.loadIdx} onChange={(e) => chooseLoad(parseInt(e.target.value))}>
              {loads.map((l, i) => <option key={i} value={i}>{l.grains} gr {l.type} · {l.mv} fps</option>)}
            </select>
          </Field>
          <div className="spec-chips">
            <div className="chip"><span>Weight</span><b className="mono">{load.grains} gr</b></div>
            <div className="chip"><span>BC (G1)</span><b className="mono">{load.bcG1.toFixed(3)}</b></div>
            {load.bcG7 && <div className="chip"><span>BC (G7)</span><b className="mono">{load.bcG7.toFixed(3)}</b></div>}
            <div className="chip"><span>Test barrel</span><b className="mono">{load.testBarrel}"</b></div>
            <div className="chip"><span>Drag</span><b className="mono">{dragModel}</b></div>
            <div className="chip accent"><span>Muzzle vel</span><b className="mono">{Math.round(U.vel.to(activeMV, metric))} {U.vel.unit(metric)}</b></div>
          </div>
        </section>

        {/* RIFLE */}
        <section className="grp">
          <h3 className="grp-title">Rifle &amp; Optic Setup</h3>
          <Field label="Velocity correction" hint="barrel-length model">
            <Slider value={state.barrelLength} onChange={(v) => set({ barrelLength: v, mvOverride: null })}
              min={4} max={cal.category === "Pistol" ? 10 : (cal.id === "50bmg" ? 45 : 30)} step={0.5}
              fmt={(v) => Math.round(U.vel.to(window.BallisticsSolver.adjustMV(load.mv, load.testBarrel, v, cal.fpsPerInch), metric)) + " " + U.vel.unit(metric)} />
          </Field>
          <div className="vel-note">
            {state.barrelLength.toFixed(1)}" barrel approximation · {cal.fpsPerInch} fps/in from {load.testBarrel}" test barrel
          </div>
          <Field label="Muzzle velocity override">
            <div className="override-row">
              <input type="checkbox" checked={state.mvOverride != null}
                onChange={(e) => set({ mvOverride: e.target.checked ? Math.round(computedMV) : null })} />
              <NumberInput value={activeMV} onChange={(v) => set({ mvOverride: v })} conv={U.vel} metric={metric}
                step={5} min={200} max={5000} />
            </div>
          </Field>
          <Field label={"True BC · " + dragModel} hint="match your drops">
            <div className="override-row">
              <input type="checkbox" checked={state.bcOverride != null}
                onChange={(e) => set({ bcOverride: e.target.checked ? activeBC : null })} />
              <NumberInput value={state.bcOverride != null ? state.bcOverride : activeBC} onChange={(v) => set({ bcOverride: v })}
                step={0.001} min={0.05} max={1.5} decimals={3} />
            </div>
          </Field>
          <div className="vel-note">{state.bcOverride != null ? "Solving on your trued " + dragModel + " BC of " + state.bcOverride.toFixed(3) : "Factory " + dragModel + " BC " + activeBC.toFixed(3) + " — tick to true it to your observed drops"}</div>
          <div className="two-col">
            <Field label="Zero range">
              <NumberInput value={state.zeroRange} onChange={(v) => set({ zeroRange: Math.round(v) })} conv={U.dist} metric={metric} step={5} min={10} max={500} />
            </Field>
            <Field label="Optic height" hint="over bore">
              <NumberInput value={state.sightHeight} onChange={(v) => set({ sightHeight: v })} conv={U.len} metric={metric} step={0.1} min={0.5} max={4} />
            </Field>
          </div>
          <Field label="Shooting angle" hint="incline / decline">
            <Slider value={state.shootingAngle} onChange={(v) => set({ shootingAngle: v })} min={-60} max={60} step={1}
              fmt={(v) => (v > 0 ? "+" : "") + v + "°"} />
          </Field>
          <div className="two-col">
            <Field label="Barrel twist" hint="1 turn in N inches">
              <NumberInput value={state.twist} onChange={(v) => set({ twist: v })} step={0.5} min={3} max={40} />
            </Field>
            <Field label="Twist direction" hint="rifling hand">
              <Segmented value={state.twistDir || "R"} onChange={(v) => set({ twistDir: v })}
                options={[{ v: "R", l: "Right" }, { v: "L", l: "Left" }]} />
            </Field>
          </div>
          <div className="vel-note">
            {stab
              ? "1:" + (Math.round(state.twist * 10) / 10) + '" · SG ' + stab.sg.toFixed(2) + " · " + (stab.sg >= 1.5 ? "well stabilized" : stab.sg >= 1.0 ? "marginal" : "under-stabilized") + " · " + ((state.twistDir || "R") === "L" ? "LH twist \u2192 drifts left" : "RH twist \u2192 drifts right")
              : "Enter barrel twist for a stability estimate."}
          </div>
        </section>

        {/* ENVIRONMENT */}
        <section className="grp">
          <h3 className="grp-title">Environment</h3>
          <div className="wind-block">
            <div className="wind-fields">
              <Field label="Wind speed">
                <NumberInput value={state.windSpeed} onChange={(v) => set({ windSpeed: v })} conv={U.spd} metric={metric} step={1} min={0} max={60} />
              </Field>
              <Field label="Direction" hint={"clock · " + state.windDir + " o'clock"}>
                <WindDial dir={state.windDir} onChange={(d) => set({ windDir: d })} />
              </Field>
            </div>
          </div>
          <details className="advanced">
            <summary>Atmosphere (advanced)</summary>
            <div className="two-col">
              <Field label="Temperature">
                <NumberInput value={state.tempF} onChange={(v) => set({ tempF: v })} conv={U.temp} metric={metric} step={1} min={-40} max={130} />
              </Field>
              <Field label="Altitude">
                <NumberInput value={state.altitudeFt} onChange={(v) => set({ altitudeFt: v })} conv={U.alt} metric={metric} step={100} min={0} max={15000} />
              </Field>
            </div>
            <div className="hint-sm">Pressure auto-modeled from altitude (standard atmosphere). Density altitude drives drag.</div>
          </details>
        </section>

        {/* SOLUTION */}
        <section className="grp">
          <h3 className="grp-title">Solution &amp; Reticle</h3>
          <Field label="Scope adjustment / hold unit">
            <Segmented value={state.scopeUnit} onChange={(v) => set({ scopeUnit: v })}
              options={[{ v: "MIL", l: "MIL / MRAD" }, { v: "MOA", l: "MOA" }]} />
          </Field>
          <Field label="Reticle pattern">
            <select className="select" value={state.reticleType} onChange={(e) => set({ reticleType: e.target.value })}>
              <option>MIL Grid</option>
              <option>MOA Grid</option>
              <option>BDC</option>
              <option>Duplex</option>
              <option>Christmas Tree</option>
            </select>
          </Field>
          <Field label="Max range">
            <Slider value={state.maxRange} onChange={(v) => set({ maxRange: Math.round(v / 50) * 50 })} conv={U.dist} metric={metric}
              min={metric ? 90 : 100} max={metric ? 1820 : 2000} step={metric ? 45 : 50} />
          </Field>
          <div className="two-col">
            <Field label="Table step">
              <select className="select" value={state.increment} onChange={(e) => set({ increment: parseInt(e.target.value) })}>
                {[25, 50, 100].map(s => <option key={s} value={s}>{metric ? Math.round(s * 0.9144) + " m" : s + " yd"}</option>)}
              </select>
            </Field>
            <Field label="Drag model">
              <select className="select" value={state.dragModel} onChange={(e) => set({ dragModel: e.target.value, bcOverride: null })}>
                <option value="Auto">Auto ({load.bcG7 ? "G7" : "G1"})</option>
                <option value="G1">G1</option>
                {load.bcG7 && <option value="G7">G7</option>}
              </select>
            </Field>
          </div>
          <label className="toggle-row">
            <input type="checkbox" checked={state.showWind} onChange={(e) => set({ showWind: e.target.checked })} />
            <span>Apply wind to reticle &amp; trajectory holds</span>
          </label>
          <label className="toggle-row">
            <input type="checkbox" checked={state.showSpinDrift} onChange={(e) => set({ showSpinDrift: e.target.checked })} />
            <span>Apply spin drift to holds</span>
          </label>
        </section>
      </div>
    );
  }

  window.InputPanel = InputPanel;
})();
