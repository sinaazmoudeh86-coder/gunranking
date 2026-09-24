/* Shared UI / brand kit — gives the product a consistent identity:
   reticle brand mark, inline icon set, section eyebrows, and a premium gunmetal
   rifle emblem (replaces emoji placeholders). Exposes window.UI. */
(function () {
  // ---- brand reticle mark ----
  function Mark({ size = 26, stroke = "#fff", accent = "var(--accent-2)" }) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="13" stroke={stroke} strokeWidth="1.6" opacity="0.92" />
        <circle cx="16" cy="16" r="7.5" stroke={stroke} strokeWidth="1.2" opacity="0.5" />
        <circle cx="16" cy="16" r="2.1" fill={accent} />
        <path d="M16 1.5V8M16 24v6.5M1.5 16H8M24 16h6.5" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M16 11.5v9M11.5 16h9" stroke={accent} strokeWidth="1" opacity="0.7" />
      </svg>
    );
  }

  // ---- full wordmark lockup ----
  function Wordmark() {
    return (
      <div className="brand">
        <a href="../#/" target="_top" style={{ display: "flex" }}><img src={(window.GR_TOOL_IMG || {})["assets/gunranking-logo.png"] || "assets/gunranking-logo.png"} alt="GunRanking" className="brand-img" /></a>
        <span className="brand-words">
          <span className="brand-sub"><b>Ballistics</b> <span className="brand-thin">Experience &amp; Calculation</span></span>
        </span>
      </div>
    );
  }

  // ---- icon set (24x24 stroke icons) ----
  const P = (d, extra) => <path d={d} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none" {...extra} />;
  const ICONS = {
    crosshair: <g><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" fill="none" />{P("M12 2v4M12 18v4M2 12h4M18 12h4")}<circle cx="12" cy="12" r="1.6" fill="currentColor" /></g>,
    gauge: <g>{P("M12 13l4-3")}{P("M5 18a9 9 0 1 1 14 0")}<circle cx="12" cy="13" r="1.3" fill="currentColor" /></g>,
    target: <g><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" fill="none" /><circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.5" fill="none" /><circle cx="12" cy="12" r="1.4" fill="currentColor" /></g>,
    bolt: P("M13 2L4.5 13.5H11l-1 8.5L18.5 10H12l1-8z", { fill: "currentColor", stroke: "none" }),
    arc: <g>{P("M3 19c5-12 13-12 18 0")}{P("M3 19h2M19 19h2")}<circle cx="3" cy="19" r="1.4" fill="currentColor" /></g>,
    mute: <g>{P("M4 9v6h4l5 4V5L8 9H4z")}{P("M17 9l4 6M21 9l-4 6")}</g>,
    scale: <g>{P("M12 4v16M7 20h10M12 5l-6 2 6-2 6-2-6 2z")}{P("M3 12l3-7 3 7a3 3 0 0 1-6 0zM15 10l3-7 3 7a3 3 0 0 1-6 0z")}</g>,
    deer: <g>{P("M7 3l2 4M17 3l-2 4M9 7c-1 2 0 4 3 4s4-2 3-4")}{P("M12 11v4M12 15c-3 0-5 2-5 6M12 15c3 0 5 2 5 6")}</g>,
    wind: P("M3 8h11a2.5 2.5 0 1 0-2.5-2.5M3 12h15a2.5 2.5 0 1 1-2.5 2.5M3 16h9a2 2 0 1 1-2 2"),
    sheet: <g>{P("M4 3h16v18H4zM4 9h16M4 15h16M10 3v18")}</g>,
    download: P("M12 3v12M7 11l5 4 5-4M5 20h14"),
    spark: P("M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"),
    chevron: P("M9 6l6 6-6 6"),
    sliders: <g>{P("M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0")}<circle cx="16" cy="6" r="2.2" fill="currentColor" /><circle cx="8" cy="12" r="2.2" fill="currentColor" /><circle cx="18" cy="18" r="2.2" fill="currentColor" /></g>,
    x: P("M6 6l12 12M18 6L6 18")
  };
  function Icon({ name, size = 18 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">{ICONS[name] || ICONS.crosshair}</svg>;
  }

  // ---- section eyebrow header ----
  function Eyebrow({ icon, label, title, desc, light }) {
    return (
      <div className={"eyebrow" + (light ? " eyebrow-light" : "")}>
        <div className="eb-tag"><span className="eb-ico"><Icon name={icon} size={15} /></span>{label}</div>
        <div className="eb-titles">
          <h2 className="eb-title">{title}</h2>
          {desc && <p className="eb-desc">{desc}</p>}
        </div>
        <div className="eb-rule"></div>
      </div>
    );
  }

  // ---- premium rifle emblem (gunmetal panel + reticle watermark + action badge) ----
  const ACTION_GLYPH = {
    Bolt: "M5 12h14M16 9l3 3-3 3M7 8v8",
    Semi: "M4 12h13l3-3v6l-3-3M7 16h6",
    Lever: "M5 12h12M14 12c0 3 2 5 4 5M7 9v6"
  };
  function RifleEmblem({ rifle, size = "md" }) {
    const action = rifle.action || "Bolt";
    return (
      <div className={"emblem emblem-" + size} title={rifle.brand + " " + rifle.model}>
        <svg viewBox="0 0 120 70" className="emblem-bg" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <defs>
            <linearGradient id="emsteel" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2A3036" /><stop offset="55%" stopColor="#1E2329" /><stop offset="100%" stopColor="#14181C" />
            </linearGradient>
          </defs>
          <rect width="120" height="70" fill="url(#emsteel)" />
          <g stroke="#fff" opacity="0.06" strokeWidth="1">
            {[14, 28, 42, 56].map(r => <circle key={r} cx="92" cy="20" r={r} fill="none" />)}
          </g>
          <g stroke="var(--accent)" opacity="0.85" strokeWidth="1.6" fill="none" strokeLinecap="round">
            <path d="M20 50q22 -30 60 -34" opacity="0.55" strokeDasharray="2 3" />
          </g>
        </svg>
        <div className="emblem-fore">
          <span className="emblem-action"><svg viewBox="0 0 24 24" width="13" height="13" fill="none"><path d={ACTION_GLYPH[action] || ACTION_GLYPH.Bolt} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>{action}</span>
          <span className="emblem-brand">{rifle.brand}</span>
        </div>
      </div>
    );
  }

  window.UI = { Mark, Wordmark, Icon, Eyebrow, RifleEmblem };
})();
