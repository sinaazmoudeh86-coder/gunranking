/* 3-DOF point-mass exterior ballistics solver.
   Imperial internal units (feet, fps, grains, inches). Numerically integrates the
   trajectory with a G1/G7 drag model, auto-solves the zero (launch) angle, and
   supports wind, shooting angle (incline), sight height, and muzzle-velocity override.

   window.BallisticsSolver.solve(params) -> { rows, summary }
*/
(function () {
  const GRAVITY = 32.174;            // ft/s^2
  const RHO_STD = 0.0023769;         // slug/ft^3, sea-level standard air density
  const BC_TO_SLUGFT2 = 4.4756;      // convert conventional BC (lb/in^2) -> slug/ft^2
  const KPI8 = Math.PI / 8;          // drag constant from derivation a = (pi/8) rho Cd v^2 / BC

  // Speed of sound (ft/s) for a given temperature (deg F).
  function speedOfSound(tempF) {
    const tempR = tempF + 459.67;            // Rankine
    return 49.0223 * Math.sqrt(tempR);       // ft/s
  }

  // Air density ratio vs standard given temp(F), pressure(inHg), altitude(ft).
  // Uses a simple barometric model when pressure not supplied.
  function densityRatio(tempF, pressureInHg, altitudeFt) {
    let p = pressureInHg;
    if (p == null || isNaN(p)) {
      // standard pressure at altitude (inHg)
      p = 29.92 * Math.pow(1 - 6.8753e-6 * (altitudeFt || 0), 5.2559);
    }
    const tempR = tempF + 459.67;
    // density proportional to P / T ; standard ref 29.92 inHg @ 59F (518.67R)
    return (p / 29.92) * (518.67 / tempR);
  }

  // Integrate trajectory for a given super-elevation angle (rad), return path samples.
  // Coordinate frame is tilted to the line of sight by lookAngle (incline).
  // x = distance along line of sight (ft), y = vertical offset from LOS (ft, +up),
  // z = horizontal deflection (ft, +right).
  function integrate(opts, launchAngle) {
    const { mv, bc, dragFn, sos, rhoRatio, sightHeight, lookAngle,
            windHead, windCross, maxRangeFt, weightGr } = opts;

    const rho = RHO_STD * rhoRatio;
    const bcSlug = bc * BC_TO_SLUGFT2;
    const k = KPI8 * rho / bcSlug;   // a = k * Cd * |vrel| * vrel

    // gravity components in the tilted (LOS) frame
    const gAlong = -GRAVITY * Math.sin(lookAngle);   // along range axis
    const gPerp  = -GRAVITY * Math.cos(lookAngle);   // perpendicular to LOS (drop)

    let x = 0;
    let y = -sightHeight / 12;            // start sightHeight inches below LOS
    let z = 0;
    let vx = mv * Math.cos(launchAngle);
    let vy = mv * Math.sin(launchAngle);
    let vz = 0;
    let t = 0;
    const dt = 0.00025;                   // seconds

    const samples = [];
    let nextSample = 0;
    const sampleStep = maxRangeFt / 400;  // ~400 samples across the range

    let guard = 0;
    while (x <= maxRangeFt && vx > 50 && guard < 2_000_000) {
      guard++;
      // relative-to-air velocity
      const rvx = vx - windHead;
      const rvy = vy;
      const rvz = vz - windCross;
      const speed = Math.sqrt(rvx * rvx + rvy * rvy + rvz * rvz);
      const mach = speed / sos;
      const cd = dragFn(mach);
      const decel = k * cd * speed;       // = k*Cd*|vrel|, multiply by component for accel

      const ax = -decel * rvx + gAlong;
      const ay = -decel * rvy + gPerp;
      const az = -decel * rvz;

      // sample before stepping (capture crossing of sampleStep marks)
      while (x >= nextSample && nextSample <= maxRangeFt + 1) {
        samples.push({ x, y, z, t, v: Math.sqrt(vx * vx + vy * vy + vz * vz) });
        nextSample += sampleStep;
      }

      vx += ax * dt;
      vy += ay * dt;
      vz += az * dt;
      x += vx * dt;
      y += vy * dt;
      z += vz * dt;
      t += dt;
    }
    samples.push({ x, y, z, t, v: Math.sqrt(vx * vx + vy * vy + vz * vz) });
    return samples;
  }

  // y-offset (ft) from LOS at a given range (ft), interpolated from samples.
  function yAtRange(samples, rangeFt) {
    if (rangeFt <= samples[0].x) return samples[0].y;
    for (let i = 1; i < samples.length; i++) {
      if (samples[i].x >= rangeFt) {
        const a = samples[i - 1], b = samples[i];
        const f = (rangeFt - a.x) / (b.x - a.x);
        return a.y + (b.y - a.y) * f;
      }
    }
    return samples[samples.length - 1].y;
  }

  function interpAt(samples, rangeFt) {
    if (rangeFt <= samples[0].x) return samples[0];
    for (let i = 1; i < samples.length; i++) {
      if (samples[i].x >= rangeFt) {
        const a = samples[i - 1], b = samples[i];
        const f = (rangeFt - a.x) / (b.x - a.x);
        return {
          x: rangeFt,
          y: a.y + (b.y - a.y) * f,
          z: a.z + (b.z - a.z) * f,
          t: a.t + (b.t - a.t) * f,
          v: a.v + (b.v - a.v) * f
        };
      }
    }
    return samples[samples.length - 1];
  }

  // Solve launch angle so trajectory crosses LOS (y=0) at the zero range.
  function solveZero(opts, zeroFt) {
    let lo = -0.02, hi = 0.06;   // radians bracketing super-elevation
    let fLo = yAtRange(integrate(opts, lo), zeroFt);
    let fHi = yAtRange(integrate(opts, hi), zeroFt);
    // expand if needed
    let tries = 0;
    while (fLo * fHi > 0 && tries < 20) {
      hi += 0.04;
      fHi = yAtRange(integrate(opts, hi), zeroFt);
      tries++;
    }
    let mid = 0;
    for (let i = 0; i < 60; i++) {
      mid = (lo + hi) / 2;
      const fMid = yAtRange(integrate(opts, mid), zeroFt);
      if (Math.abs(fMid) < 1e-5) break;
      if (fLo * fMid <= 0) { hi = mid; fHi = fMid; }
      else { lo = mid; fLo = fMid; }
    }
    return mid;
  }

  /* params:
     { bcG1, bcG7, dragModel('G1'|'G7'), muzzleVelocity, bulletWeight(gr),
       sightHeight(in), zeroRange(yd), shootingAngle(deg),
       windSpeed(mph), windDir(clock hours 1-12 or deg), windIsDeg,
       tempF, pressureInHg, altitudeFt,
       maxRange(yd), increment(yd) }
     Returns rows in imperial; UI converts to metric for display. */
  function solve(p) {
    const dragModel = p.dragModel || 'G1';
    const bc = dragModel === 'G7' ? (p.bcG7 || p.bcG1) : p.bcG1;
    const dragFn = window.DRAG_TABLES[dragModel] || window.DRAG_TABLES.G1;

    const sos = speedOfSound(p.tempF != null ? p.tempF : 59);
    const rhoRatio = densityRatio(
      p.tempF != null ? p.tempF : 59,
      p.pressureInHg,
      p.altitudeFt || 0
    );

    // wind decomposition: clock direction -> head & cross components (fps)
    const windFps = (p.windSpeed || 0) * 1.46667;
    let windAngleRad;
    if (p.windIsDeg) {
      windAngleRad = (p.windDir || 0) * Math.PI / 180;
    } else {
      // clock: 12 o'clock = headwind (from front), 3 = from right, 6 = tailwind
      windAngleRad = ((p.windDir || 12) % 12) / 12 * 2 * Math.PI;
    }
    // wind FROM that direction: head component pushes back when from 12.
    const windHead = windFps * Math.cos(windAngleRad);   // +ve = headwind reduces vx
    const windCross = windFps * Math.sin(windAngleRad);   // +ve = from right -> pushes left? handle sign
    // We treat windCross as the air's lateral velocity (wind from 3 o'clock moves air to the left,
    // i.e. air velocity toward -z). Define air moving toward +z for wind from 9 o'clock.
    const airCross = -windCross;  // wind from right => air moving left (-z)
    const airHead = -windHead;    // wind from 12 (front) => air moving toward shooter (-x)

    const lookAngle = (p.shootingAngle || 0) * Math.PI / 180;
    const maxRangeFt = (p.maxRange || 1000) * 3;
    const sightHeight = p.sightHeight != null ? p.sightHeight : 1.5;

    const opts = {
      mv: p.muzzleVelocity,
      bc, dragFn, sos, rhoRatio,
      sightHeight, lookAngle,
      windHead: airHead,         // pass air velocity components
      windCross: airCross,
      maxRangeFt, weightGr: p.bulletWeight
    };

    const zeroFt = (p.zeroRange || 100) * 3;
    const launchAngle = solveZero(opts, zeroFt);
    const samples = integrate(opts, launchAngle);

    // ---- gyroscopic stability (Miller) + spin drift (Litz) ----
    // SG from twist, bullet diameter, weight and an estimated length; spin drift is a
    // constant-direction horizontal offset (right for RH twist) growing with time of flight.
    const twist = p.twist;            // barrel twist, inches per turn (>0)
    const dia = p.diameter;           // bullet diameter, inches
    let stabilitySG = null, sdSign = p.leftTwist ? -1 : 1;
    if (twist && dia) {
      const len = p.bulletLength || (p.bulletWeight / (dia * dia * 1500));   // est. length (in)
      const tcal = twist / dia, lcal = len / dia;
      const sg0 = 30 * p.bulletWeight / (tcal * tcal * Math.pow(dia, 3) * lcal * (1 + lcal * lcal));
      const fv = Math.pow(Math.max(0.1, (p.muzzleVelocity || 2800)) / 2800, 1 / 3);
      stabilitySG = sg0 * fv / (rhoRatio || 1);   // atmosphere correction ≈ 1/density-ratio
    }
    const spinOn = stabilitySG != null && p.spinDrift !== false;
    const spinDriftIn = (tof) => spinOn ? sdSign * 1.25 * (stabilitySG + 1.2) * Math.pow(Math.max(0, tof), 1.83) : 0;

    // Build output rows at each increment.
    const inc = p.increment || 100;
    const rows = [];
    const weight = p.bulletWeight;
    for (let r = 0; r <= p.maxRange; r += inc) {
      const rangeFt = r * 3;
      const s = interpAt(samples, rangeFt);
      const dropIn = s.y * 12;                 // +up, -down relative to LOS
      const sdIn = spinDriftIn(s.t);           // spin drift (in, +right)
      const windIn = s.z * 12 + sdIn;          // total horizontal: wind + spin drift
      const rangeYd = r || 0.0001;
      const moaPerIn = 1 / (1.04720 * rangeYd / 100);
      const milPerIn = 1 / (3.59999 * rangeYd / 100);
      const energy = weight * s.v * s.v / 450240;  // ft-lb
      rows.push({
        rangeYd: r,
        rangeM: r * 0.9144,
        velocity: s.v,                          // fps
        mach: s.v / sos,
        energy,                                 // ft-lb
        tof: s.t,                               // s
        dropIn,                                 // inches (signed, +up)
        dropMOA: r === 0 ? 0 : dropIn * moaPerIn,
        dropMIL: r === 0 ? 0 : dropIn * milPerIn,
        windIn,
        windMOA: r === 0 ? 0 : windIn * moaPerIn,
        windMIL: r === 0 ? 0 : windIn * milPerIn,
        spinDriftIn: sdIn,
        spinDriftMOA: r === 0 ? 0 : sdIn * moaPerIn,
        spinDriftMIL: r === 0 ? 0 : sdIn * milPerIn
      });
    }

    // dense path for charting (yards, drop inches, wind inches, velocity, energy)
    const path = samples.map(s => ({
      rangeYd: s.x / 3,
      dropIn: s.y * 12,
      windIn: s.z * 12 + spinDriftIn(s.t),
      velocity: s.v,
      energy: weight * s.v * s.v / 450240
    }));

    // find max ordinate (highest point above LOS) and supersonic range
    let maxOrdinate = 0, maxOrdRange = 0;
    for (const s of samples) {
      if (s.y * 12 > maxOrdinate) { maxOrdinate = s.y * 12; maxOrdRange = s.x / 3; }
    }
    let transRange = null;
    for (const s of samples) {
      if (s.v / sos <= 1.0) { transRange = s.x / 3; break; }
    }

    return {
      rows, path,
      summary: {
        launchAngleMOA: launchAngle * 180 / Math.PI * 60,
        zeroRange: p.zeroRange,
        maxOrdinate, maxOrdRange,
        transonicRange: transRange,
        dragModel, bc, sos, rhoRatio, stabilitySG
      }
    };
  }

  // Gyroscopic stability factor (Miller) at standard atmosphere for a UI readout.
  // twistIn = barrel twist (in/turn), dia = bullet dia (in), weightGr (gr), mv (fps),
  // lenIn optional (else estimated from weight & diameter).
  function stability(twistIn, dia, weightGr, mv, lenIn) {
    if (!twistIn || !dia || !weightGr) return null;
    const len = lenIn || (weightGr / (dia * dia * 1500));
    const tcal = twistIn / dia, lcal = len / dia;
    const sg0 = 30 * weightGr / (tcal * tcal * Math.pow(dia, 3) * lcal * (1 + lcal * lcal));
    const fv = Math.pow(Math.max(0.1, (mv || 2800)) / 2800, 1 / 3);
    return { sg: sg0 * fv, lengthIn: len };
  }

  // Adjust muzzle velocity for barrel length difference from the load's test barrel.
  function adjustMV(baseMV, testBarrel, actualBarrel, fpsPerInch) {
    if (actualBarrel == null || testBarrel == null) return baseMV;
    return Math.max(200, baseMV + (actualBarrel - testBarrel) * (fpsPerInch || 25));
  }

  window.BallisticsSolver = { solve, adjustMV, speedOfSound, densityRatio, stability };
})();
