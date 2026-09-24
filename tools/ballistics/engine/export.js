/* Excel export for the Ballistics Lab.
   Builds a genuine multi-sheet Excel workbook in SpreadsheetML 2003 XML (opens natively
   in Excel / Google Sheets / Numbers, no libraries needed) covering:
     • Setup        — the full firing-solution inputs
     • Holdover     — drop & windage table (range increments, in/MOA/MIL + wind)
     • Chart Data   — dense trajectory path driving every Lab chart (drop, wind, velocity, energy)
   window.exportBallisticsXLS(payload) triggers the download. */
(function () {
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  // a cell: number -> numeric cell, else string cell. opts: {style}
  function cell(v, style) {
    const st = style ? ` ss:StyleID="${style}"` : "";
    if (typeof v === "number" && isFinite(v)) {
      return `<Cell${st}><Data ss:Type="Number">${v}</Data></Cell>`;
    }
    return `<Cell${st}><Data ss:Type="String">${esc(v == null ? "" : v)}</Data></Cell>`;
  }
  function row(cells, styleForAll) {
    return "<Row>" + cells.map(c => (c && c.__cell) ? c.v : cell(c, styleForAll)).join("") + "</Row>";
  }
  // header row helper
  function hrow(arr) { return "<Row>" + arr.map(h => cell(h, "hdr")).join("") + "</Row>"; }

  function sheet(name, columns, rowsXml) {
    const cols = columns.map(w => `<Column ss:Width="${w}"/>`).join("");
    return `<Worksheet ss:Name="${esc(name)}"><Table>${cols}${rowsXml}</Table>` +
      `<WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel"><FreezePanes/><FrozenNoSplit/><SplitHorizontal>1</SplitHorizontal><TopRowBottomPane>1</TopRowBottomPane><ActivePane>2</ActivePane></WorksheetOptions></Worksheet>`;
  }

  function round(v, d) { const m = Math.pow(10, d); return Math.round(v * m) / m; }

  function exportBallisticsXLS(p) {
    const { cal, load, state, metric, result, activeMV, dragModel } = p;
    const distC = metric ? 0.9144 : 1, lenC = metric ? 2.54 : 1, velC = metric ? 0.3048 : 1, enC = metric ? 1.35582 : 1;
    const distU = metric ? "m" : "yd", lenU = metric ? "cm" : "in", velU = metric ? "m/s" : "fps", enU = metric ? "J" : "ft-lb";
    const bc = dragModel === "G7" ? (load.bcG7 || load.bcG1) : load.bcG1;
    const windDirTxt = state.windSpeed > 0 ? `${state.windSpeed} mph @ ${state.windDir} o'clock` : "none";

    // ---- Setup sheet ----
    const setupRows = [];
    setupRows.push(`<Row><Cell ss:StyleID="title" ss:MergeAcross="1"><Data ss:Type="String">GunRanking Ballistics — Firing Solution</Data></Cell></Row>`);
    const kv = [
      ["Cartridge", cal.name],
      ["Manufacturer", load.mfr],
      ["Product line", load.line],
      ["Bullet", `${load.grains} gr ${load.type}`],
      ["Ballistic coefficient", `${bc.toFixed(3)} (${dragModel})`],
      ["Muzzle velocity", `${Math.round(activeMV * velC)} ${velU}${state.mvOverride != null ? " (override)" : ""}`],
      ["Barrel length", `${state.barrelLength}"`],
      ["Zero range", `${Math.round(state.zeroRange * distC)} ${distU}`],
      ["Sight height", `${round(state.sightHeight * lenC, 2)} ${lenU}`],
      ["Shooting angle", `${state.shootingAngle}°`],
      ["Wind", windDirTxt],
      ["Temperature", `${metric ? round((state.tempF - 32) * 5 / 9, 1) + " °C" : state.tempF + " °F"}`],
      ["Altitude", `${Math.round(state.altitudeFt * (metric ? 0.3048 : 1))} ${metric ? "m" : "ft"}`],
      ["Scope unit", state.scopeUnit],
      ["Max range", `${Math.round(state.maxRange * distC)} ${distU}`],
      ["Units", metric ? "Metric" : "Imperial"],
      ["Supersonic to", result.summary.transonicRange ? `${Math.round(result.summary.transonicRange * distC)} ${distU}` : "stays supersonic"],
      ["Generated", new Date().toLocaleString()]
    ];
    kv.forEach(([k, v]) => {
      setupRows.push(`<Row>${cell(k, "label")}${cell(v)}</Row>`);
    });
    const setup = sheet("Setup", [150, 240], setupRows.join(""));

    // ---- Holdover table sheet ----
    const holdHeader = [
      `Range (${distU})`, `Velocity (${velU})`, `Energy (${enU})`,
      `Drop (${lenU})`, "Drop (MOA)", "Drop (MIL)",
      `Wind (${lenU})`, "Wind (MOA)", "Wind (MIL)", "ToF (s)", "Mach"
    ];
    let holdRows = hrow(holdHeader);
    result.rows.forEach(r => {
      const cells = [
        cell(Math.round(r.rangeYd * distC), "rangecol"),
        cell(Math.round(r.velocity * velC)),
        cell(Math.round(r.energy * enC)),
        cell(round(r.dropIn * lenC, 1)),
        cell(round(r.dropMOA, 1)),
        cell(round(r.dropMIL, 2)),
        cell(round(r.windIn * lenC, 1)),
        cell(round(r.windMOA, 1)),
        cell(round(r.windMIL, 2)),
        cell(round(r.tof, 2)),
        cell(round(r.mach, 2))
      ];
      holdRows += "<Row>" + cells.join("") + "</Row>";
    });
    const hold = sheet("Holdover Table", [80, 90, 90, 70, 70, 70, 70, 70, 70, 60, 55], holdRows);

    // ---- Chart data sheet (dense path) ----
    const chartHeader = [`Range (${distU})`, `Drop (${lenU})`, `Wind (${lenU})`, `Velocity (${velU})`, `Energy (${enU})`];
    let chartRows = hrow(chartHeader);
    // sample the dense path to a clean step so the file stays tidy (~1 row per ~5 units)
    const path = result.path;
    const maxYd = path[path.length - 1].rangeYd;
    const stepYd = maxYd > 800 ? 10 : maxYd > 300 ? 5 : 2;
    let nextAt = 0;
    path.forEach((s, i) => {
      if (s.rangeYd + 1e-6 >= nextAt || i === path.length - 1) {
        chartRows += "<Row>" + [
          cell(round(s.rangeYd * distC, 1), "rangecol"),
          cell(round(s.dropIn * lenC, 2)),
          cell(round(s.windIn * lenC, 2)),
          cell(Math.round(s.velocity * velC)),
          cell(Math.round(s.energy * enC))
        ].join("") + "</Row>";
        nextAt += stepYd;
      }
    });
    const chart = sheet("Chart Data", [80, 80, 80, 90, 90], chartRows);

    const styles = `<Styles>
      <Style ss:ID="Default" ss:Name="Normal"><Alignment ss:Vertical="Bottom"/><Font ss:FontName="Calibri" ss:Size="11"/></Style>
      <Style ss:ID="title"><Font ss:Bold="1" ss:Size="14" ss:Color="#0973BA"/></Style>
      <Style ss:ID="hdr"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#15181C" ss:Pattern="Solid"/><Alignment ss:Horizontal="Center"/></Style>
      <Style ss:ID="label"><Font ss:Bold="1" ss:Color="#4A4F57"/></Style>
      <Style ss:ID="rangecol"><Font ss:Bold="1"/><Interior ss:Color="#F3F1EA" ss:Pattern="Solid"/></Style>
    </Styles>`;

    const xml = `<?xml version="1.0"?>\n<?mso-application progid="Excel.Sheet"?>\n` +
      `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40">` +
      `<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"><Title>GunRanking Ballistics</Title><Author>GunRanking.com</Author></DocumentProperties>` +
      styles + setup + hold + chart + `</Workbook>`;

    const safe = (s) => String(s).replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
    const fname = `GunRanking-Ballistics_${safe(cal.name)}_${safe(load.mfr + "-" + load.grains + "gr")}.xls`;
    const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = fname;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1500);
  }

  window.exportBallisticsXLS = exportBallisticsXLS;
})();
