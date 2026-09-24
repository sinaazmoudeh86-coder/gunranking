/* Drop / windage data table by range. Toggles imperial/metric and the holdover unit
   (inches/cm, MOA, MIL). Highlights the zero range and flags sub/transonic rows.
   Exposes window.DataTable. */
(function () {
  // format avoiding "-0.0"
  function f(v, d) { let s = v.toFixed(d); if (/^-0(\.0+)?$/.test(s)) s = s.slice(1); return s; }
  function DataTable({ result, metric }) {
    if (!result) return null;
    const rows = result.rows;
    const sos = result.summary.sos;
    const distUnit = metric ? "m" : "yd";
    const lenUnit = metric ? "cm" : "in";
    const velUnit = metric ? "m/s" : "fps";
    const enUnit = metric ? "J" : "ft·lb";
    const lenC = metric ? 2.54 : 1;
    const velC = metric ? 0.3048 : 1;
    const enC = metric ? 1.35582 : 1;

    return (
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th className="sticky-col">Range<span>{distUnit}</span></th>
              <th>Velocity<span>{velUnit}</span></th>
              <th>Energy<span>{enUnit}</span></th>
              <th>Drop<span>{lenUnit}</span></th>
              <th>Drop<span>MOA</span></th>
              <th>Drop<span>MIL</span></th>
              <th>Wind<span>{lenUnit}</span></th>
              <th>Wind<span>MOA</span></th>
              <th>Wind<span>MIL</span></th>
              <th>ToF<span>s</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const isZero = Math.abs(r.rangeYd - result.summary.zeroRange) < 1e-6;
              const sub = r.velocity <= sos;
              const trans = r.velocity <= sos * 1.2 && r.velocity > sos;
              return (
                <tr key={i} className={isZero ? "row-zero" : ""}>
                  <td className="sticky-col mono">
                    {metric ? Math.round(r.rangeM) : r.rangeYd}
                    {isZero && <span className="zero-pill">ZERO</span>}
                  </td>
                  <td className={"mono " + (sub ? "sub" : trans ? "trans" : "")}>{Math.round(r.velocity * velC)}</td>
                  <td className="mono">{Math.round(r.energy * enC)}</td>
                  <td className="mono strong">{f(r.dropIn * lenC, 1)}</td>
                  <td className="mono">{f(r.dropMOA, 1)}</td>
                  <td className="mono">{f(r.dropMIL, 2)}</td>
                  <td className="mono">{f(r.windIn * lenC, 1)}</td>
                  <td className="mono">{f(r.windMOA, 1)}</td>
                  <td className="mono">{f(r.windMIL, 2)}</td>
                  <td className="mono dim">{r.tof.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="table-legend">
          <span><i className="lg-zero"></i> Zero range</span>
          <span><i className="lg-trans"></i> Transonic</span>
          <span><i className="lg-sub"></i> Subsonic</span>
          <span className="tl-note">Drop &amp; wind are holds below / into the line of sight. Dial the come-up = drop value.</span>
        </div>
      </div>
    );
  }
  window.DataTable = DataTable;
})();
