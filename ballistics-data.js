/* Representative-but-real ballistics catalog.
   Each caliber carries a category, bullet diameter (in), a velocity-per-inch-of-barrel
   factor (fps/in) for barrel-length adjustment, and a typical test barrel length.
   Each load: manufacturer, product line, bullet weight (gr), G1 BC, G7 BC (where the
   bullet is a boat-tail/match design), advertised muzzle velocity (fps) at the listed
   test-barrel length, and a bullet-type tag.
   Numbers reflect published factory data; structured so a full catalog can be dropped in.
   Categories: Rimfire · Rifle · Magnum · Lever · Straight-Wall · Pistol */
window.BALLISTICS_DATA = [
  /* ---------------------------- RIMFIRE ---------------------------- */
  {
    id: "22lr", name: ".22 LR", category: "Rimfire", diameter: 0.224, defaultTwist: 16,
    fpsPerInch: 12, testBarrel: 24, defaultBarrel: 18,
    loads: [
      { mfr: "CCI", line: "Mini-Mag", grains: 40, bcG1: 0.138, mv: 1235, testBarrel: 24, type: "CPRN" },
      { mfr: "CCI", line: "Stinger", grains: 32, bcG1: 0.084, mv: 1640, testBarrel: 24, type: "CPHP" },
      { mfr: "CCI", line: "Velocitor", grains: 40, bcG1: 0.137, mv: 1435, testBarrel: 24, type: "CPHP" },
      { mfr: "CCI", line: "Standard Velocity", grains: 40, bcG1: 0.146, mv: 1070, testBarrel: 24, type: "LRN" },
      { mfr: "Federal", line: "Premium Gold Medal", grains: 40, bcG1: 0.172, mv: 1080, testBarrel: 24, type: "LRN" },
      { mfr: "Federal", line: "AutoMatch", grains: 40, bcG1: 0.138, mv: 1200, testBarrel: 24, type: "LRN" },
      { mfr: "Winchester", line: "Super-X", grains: 40, bcG1: 0.130, mv: 1300, testBarrel: 24, type: "CPHP" },
      { mfr: "Remington", line: "Golden Bullet", grains: 36, bcG1: 0.125, mv: 1280, testBarrel: 24, type: "CPHP" },
      { mfr: "Aguila", line: "Super Extra HV", grains: 40, bcG1: 0.130, mv: 1255, testBarrel: 24, type: "CPRN" },
      { mfr: "Aguila", line: "Interceptor", grains: 40, bcG1: 0.130, mv: 1470, testBarrel: 24, type: "CPRN" },
      { mfr: "Norma", line: "Tac-22", grains: 40, bcG1: 0.150, mv: 1100, testBarrel: 24, type: "LRN" },
      { mfr: "SK", line: "Standard Plus", grains: 40, bcG1: 0.172, mv: 1073, testBarrel: 24, type: "LRN" },
      { mfr: "Lapua", line: "Center-X", grains: 40, bcG1: 0.172, mv: 1073, testBarrel: 24, type: "LRN" },
      { mfr: "Eley", line: "Tenex", grains: 40, bcG1: 0.172, mv: 1085, testBarrel: 24, type: "LRN" }
    ]
  },
  {
    id: "17hmr", name: ".17 HMR", category: "Rimfire", diameter: 0.172, defaultTwist: 9,
    fpsPerInch: 18, testBarrel: 24, defaultBarrel: 22,
    loads: [
      { mfr: "Hornady", line: "V-MAX", grains: 17, bcG1: 0.125, mv: 2550, testBarrel: 24, type: "V-MAX" },
      { mfr: "Hornady", line: "XTP", grains: 20, bcG1: 0.130, mv: 2375, testBarrel: 24, type: "XTP" },
      { mfr: "CCI", line: "TNT", grains: 17, bcG1: 0.124, mv: 2550, testBarrel: 24, type: "JHP" },
      { mfr: "CCI", line: "A17", grains: 17, bcG1: 0.125, mv: 2650, testBarrel: 24, type: "Varmint Tip" },
      { mfr: "CCI", line: "FMJ", grains: 20, bcG1: 0.130, mv: 2375, testBarrel: 24, type: "FMJ" },
      { mfr: "Winchester", line: "Varmint HV", grains: 17, bcG1: 0.125, mv: 2550, testBarrel: 24, type: "V-MAX" },
      { mfr: "Federal", line: "Premium", grains: 20, bcG1: 0.144, mv: 2375, testBarrel: 24, type: "Tipped" }
    ]
  },
  {
    id: "22wmr", name: ".22 WMR", category: "Rimfire", diameter: 0.224, defaultTwist: 16,
    fpsPerInch: 14, testBarrel: 24, defaultBarrel: 20,
    loads: [
      { mfr: "CCI", line: "Maxi-Mag", grains: 40, bcG1: 0.125, mv: 1875, testBarrel: 24, type: "JHP" },
      { mfr: "CCI", line: "A22 GamePoint", grains: 35, bcG1: 0.110, mv: 2100, testBarrel: 24, type: "JSP" },
      { mfr: "Hornady", line: "V-MAX", grains: 30, bcG1: 0.110, mv: 2200, testBarrel: 24, type: "V-MAX" },
      { mfr: "Hornady", line: "Critical Defense", grains: 45, bcG1: 0.110, mv: 1700, testBarrel: 24, type: "FTX" },
      { mfr: "Winchester", line: "Super-X", grains: 40, bcG1: 0.106, mv: 1910, testBarrel: 24, type: "JHP" },
      { mfr: "Winchester", line: "Varmint HV", grains: 30, bcG1: 0.110, mv: 2250, testBarrel: 24, type: "V-MAX" },
      { mfr: "Federal", line: "Punch", grains: 45, bcG1: 0.121, mv: 1700, testBarrel: 24, type: "JHP" },
      { mfr: "Federal", line: "V-Shok TNT", grains: 30, bcG1: 0.103, mv: 2200, testBarrel: 24, type: "JHP" }
    ]
  },

  /* ---------------------------- .20 / .22 CENTERFIRE ---------------------------- */
  {
    id: "204ruger", name: ".204 Ruger", category: "Rifle", diameter: 0.204, defaultTwist: 12,
    fpsPerInch: 28, testBarrel: 26, defaultBarrel: 24,
    loads: [
      { mfr: "Hornady", line: "Superformance NTX", grains: 24, bcG1: 0.170, mv: 4400, testBarrel: 26, type: "NTX" },
      { mfr: "Hornady", line: "V-MAX", grains: 32, bcG1: 0.210, mv: 4225, testBarrel: 26, type: "V-MAX" },
      { mfr: "Hornady", line: "V-MAX", grains: 40, bcG1: 0.275, mv: 3900, testBarrel: 26, type: "V-MAX" },
      { mfr: "Winchester", line: "Varmint X", grains: 32, bcG1: 0.206, mv: 4000, testBarrel: 26, type: "Polymer Tip" },
      { mfr: "Remington", line: "AccuTip-V", grains: 32, bcG1: 0.210, mv: 4225, testBarrel: 26, type: "AccuTip" },
      { mfr: "Nosler", line: "Varmageddon", grains: 32, bcG1: 0.200, mv: 4000, testBarrel: 26, type: "FB Tipped" }
    ]
  },
  {
    id: "223rem", name: ".223 Rem / 5.56 NATO", category: "Rifle", diameter: 0.224, defaultTwist: 8,
    fpsPerInch: 25, testBarrel: 24, defaultBarrel: 16,
    loads: [
      { mfr: "Hornady", line: "ELD Match", grains: 73, bcG1: 0.398, bcG7: 0.200, mv: 2790, testBarrel: 24, type: "ELD-M" },
      { mfr: "Hornady", line: "ELD-X Precision Hunter", grains: 62, bcG1: 0.295, bcG7: 0.148, mv: 3000, testBarrel: 24, type: "ELD-X" },
      { mfr: "Hornady", line: "V-MAX", grains: 55, bcG1: 0.255, mv: 3240, testBarrel: 24, type: "V-MAX" },
      { mfr: "Hornady", line: "Superformance V-MAX", grains: 53, bcG1: 0.290, mv: 3465, testBarrel: 24, type: "V-MAX" },
      { mfr: "Hornady", line: "Frontier", grains: 55, bcG1: 0.243, mv: 3240, testBarrel: 24, type: "FMJ" },
      { mfr: "Hornady", line: "Black", grains: 75, bcG1: 0.395, bcG7: 0.198, mv: 2790, testBarrel: 24, type: "BTHP" },
      { mfr: "Federal", line: "Gold Medal Sierra MatchKing", grains: 77, bcG1: 0.362, bcG7: 0.181, mv: 2720, testBarrel: 24, type: "SMK" },
      { mfr: "Federal", line: "American Eagle", grains: 55, bcG1: 0.243, mv: 3240, testBarrel: 20, type: "FMJ" },
      { mfr: "Federal", line: "Fusion MSR", grains: 62, bcG1: 0.304, mv: 2750, testBarrel: 20, type: "Bonded SP" },
      { mfr: "Sierra", line: "MatchKing", grains: 69, bcG1: 0.301, bcG7: 0.151, mv: 2950, testBarrel: 24, type: "SMK" },
      { mfr: "Black Hills", line: "Match", grains: 77, bcG1: 0.420, bcG7: 0.212, mv: 2750, testBarrel: 24, type: "TMK" },
      { mfr: "Barnes", line: "VOR-TX", grains: 55, bcG1: 0.255, mv: 3100, testBarrel: 24, type: "TSX" },
      { mfr: "Nosler", line: "Ballistic Tip", grains: 55, bcG1: 0.267, mv: 3100, testBarrel: 24, type: "BT" },
      { mfr: "PMC", line: "Bronze", grains: 55, bcG1: 0.243, mv: 3200, testBarrel: 20, type: "FMJ" },
      { mfr: "Remington", line: "UMC", grains: 55, bcG1: 0.243, mv: 3240, testBarrel: 24, type: "FMJ" },
      { mfr: "Winchester", line: "USA", grains: 62, bcG1: 0.260, mv: 3020, testBarrel: 20, type: "FMJ" },
      { mfr: "Winchester", line: "M855", grains: 62, bcG1: 0.304, mv: 3060, testBarrel: 20, type: "FMJ Green Tip" },
      { mfr: "Sellier & Bellot", line: "FMJ", grains: 55, bcG1: 0.243, mv: 3150, testBarrel: 24, type: "FMJ" },
      { mfr: "Sellier & Bellot", line: "HPBT Match", grains: 69, bcG1: 0.301, bcG7: 0.151, mv: 2887, testBarrel: 24, type: "HPBT" }
    ]
  },
  {
    id: "22arc", name: ".22 ARC", category: "Rifle", diameter: 0.224, defaultTwist: 7,
    fpsPerInch: 25, testBarrel: 24, defaultBarrel: 18,
    loads: [
      { mfr: "Hornady", line: "V-Match ELD-VT", grains: 62, bcG1: 0.395, bcG7: 0.199, mv: 3300, testBarrel: 24, type: "ELD-VT" },
      { mfr: "Hornady", line: "Black ELD Match", grains: 75, bcG1: 0.467, bcG7: 0.235, mv: 3075, testBarrel: 24, type: "ELD-M" },
      { mfr: "Hornady", line: "Precision Hunter ELD-X", grains: 80, bcG1: 0.505, bcG7: 0.254, mv: 2790, testBarrel: 24, type: "ELD-X" },
      { mfr: "Hornady", line: "Match ELD Match", grains: 88, bcG1: 0.545, bcG7: 0.274, mv: 2820, testBarrel: 24, type: "ELD-M" }
    ]
  },
  {
    id: "224valkyrie", name: ".224 Valkyrie", category: "Rifle", diameter: 0.224, defaultTwist: 7,
    fpsPerInch: 25, testBarrel: 24, defaultBarrel: 20,
    loads: [
      { mfr: "Federal", line: "Gold Medal Sierra MatchKing", grains: 90, bcG1: 0.563, bcG7: 0.274, mv: 2700, testBarrel: 24, type: "SMK" },
      { mfr: "Federal", line: "Fusion", grains: 90, bcG1: 0.400, mv: 2700, testBarrel: 24, type: "Bonded SP" },
      { mfr: "Federal", line: "Varmint & Predator", grains: 60, bcG1: 0.265, mv: 3300, testBarrel: 24, type: "V-MAX" },
      { mfr: "Federal", line: "American Eagle TMJ", grains: 75, bcG1: 0.350, mv: 3000, testBarrel: 24, type: "TMJ" },
      { mfr: "Hornady", line: "ELD Match", grains: 88, bcG1: 0.545, bcG7: 0.274, mv: 2675, testBarrel: 24, type: "ELD-M" }
    ]
  },
  {
    id: "22250", name: ".22-250 Rem", category: "Rifle", diameter: 0.224, defaultTwist: 12,
    fpsPerInch: 30, testBarrel: 24, defaultBarrel: 24,
    loads: [
      { mfr: "Hornady", line: "Superformance V-MAX", grains: 50, bcG1: 0.242, mv: 4000, testBarrel: 24, type: "V-MAX" },
      { mfr: "Hornady", line: "Varmint Express V-MAX", grains: 55, bcG1: 0.255, mv: 3680, testBarrel: 24, type: "V-MAX" },
      { mfr: "Hornady", line: "ELD-X", grains: 64, bcG1: 0.345, bcG7: 0.173, mv: 3500, testBarrel: 24, type: "ELD-X" },
      { mfr: "Federal", line: "Power-Shok", grains: 55, bcG1: 0.255, mv: 3680, testBarrel: 24, type: "SP" },
      { mfr: "Winchester", line: "Varmint X", grains: 55, bcG1: 0.255, mv: 3680, testBarrel: 24, type: "Polymer Tip" },
      { mfr: "Remington", line: "AccuTip-V", grains: 50, bcG1: 0.242, mv: 3725, testBarrel: 24, type: "AccuTip" },
      { mfr: "Nosler", line: "Varmageddon", grains: 55, bcG1: 0.236, mv: 3650, testBarrel: 24, type: "FBHP" }
    ]
  },

  /* ---------------------------- 6mm / .243 ---------------------------- */
  {
    id: "243win", name: ".243 Winchester", category: "Rifle", diameter: 0.243, defaultTwist: 9,
    fpsPerInch: 28, testBarrel: 24, defaultBarrel: 22,
    loads: [
      { mfr: "Hornady", line: "ELD-X Precision Hunter", grains: 90, bcG1: 0.409, bcG7: 0.205, mv: 3150, testBarrel: 24, type: "ELD-X" },
      { mfr: "Hornady", line: "Superformance SST", grains: 95, bcG1: 0.355, mv: 3185, testBarrel: 24, type: "SST" },
      { mfr: "Hornady", line: "American Whitetail", grains: 100, bcG1: 0.405, mv: 2960, testBarrel: 24, type: "InterLock BTSP" },
      { mfr: "Federal", line: "Fusion", grains: 95, bcG1: 0.380, mv: 3000, testBarrel: 24, type: "Bonded SP" },
      { mfr: "Federal", line: "Power-Shok", grains: 100, bcG1: 0.355, mv: 2960, testBarrel: 24, type: "SP" },
      { mfr: "Nosler", line: "AccuBond", grains: 90, bcG1: 0.376, mv: 3100, testBarrel: 24, type: "AccuBond" },
      { mfr: "Remington", line: "Core-Lokt", grains: 100, bcG1: 0.356, mv: 2960, testBarrel: 24, type: "PSP" },
      { mfr: "Sierra", line: "GameChanger", grains: 90, bcG1: 0.448, bcG7: 0.224, mv: 3050, testBarrel: 24, type: "TGK" },
      { mfr: "Winchester", line: "Deer Season XP", grains: 95, bcG1: 0.347, mv: 3100, testBarrel: 24, type: "Extreme Point" }
    ]
  },
  {
    id: "6arc", name: "6mm ARC", category: "Rifle", diameter: 0.243, defaultTwist: 7.5,
    fpsPerInch: 25, testBarrel: 24, defaultBarrel: 18,
    loads: [
      { mfr: "Hornady", line: "ELD Match", grains: 108, bcG1: 0.536, bcG7: 0.270, mv: 2750, testBarrel: 24, type: "ELD-M" },
      { mfr: "Hornady", line: "Precision Hunter ELD-X", grains: 103, bcG1: 0.512, bcG7: 0.258, mv: 2800, testBarrel: 24, type: "ELD-X" },
      { mfr: "Hornady", line: "V-Match ELD-VT", grains: 80, bcG1: 0.395, bcG7: 0.199, mv: 3025, testBarrel: 24, type: "ELD-VT" },
      { mfr: "Hornady", line: "Black BTHP", grains: 105, bcG1: 0.530, bcG7: 0.267, mv: 2750, testBarrel: 24, type: "BTHP" }
    ]
  },
  {
    id: "6creedmoor", name: "6mm Creedmoor", category: "Rifle", diameter: 0.243, defaultTwist: 7.5,
    fpsPerInch: 28, testBarrel: 24, defaultBarrel: 24,
    loads: [
      { mfr: "Hornady", line: "ELD Match", grains: 108, bcG1: 0.536, bcG7: 0.270, mv: 2960, testBarrel: 24, type: "ELD-M" },
      { mfr: "Hornady", line: "Precision Hunter ELD-X", grains: 103, bcG1: 0.512, bcG7: 0.258, mv: 3050, testBarrel: 24, type: "ELD-X" },
      { mfr: "Hornady", line: "V-Match ELD-VT", grains: 80, bcG1: 0.395, bcG7: 0.199, mv: 3475, testBarrel: 24, type: "ELD-VT" },
      { mfr: "Federal", line: "Gold Medal Berger", grains: 105, bcG1: 0.545, bcG7: 0.275, mv: 2950, testBarrel: 24, type: "Berger Hybrid" },
      { mfr: "Sig Sauer", line: "Elite Match", grains: 107, bcG1: 0.527, bcG7: 0.263, mv: 2950, testBarrel: 24, type: "SMK" },
      { mfr: "Berger", line: "Long Range Hybrid Target", grains: 109, bcG1: 0.566, bcG7: 0.290, mv: 2900, testBarrel: 26, type: "LRHT" }
    ]
  },

  /* ---------------------------- .25 cal ---------------------------- */
  {
    id: "2506", name: ".25-06 Remington", category: "Rifle", diameter: 0.257, defaultTwist: 10,
    fpsPerInch: 28, testBarrel: 24, defaultBarrel: 24,
    loads: [
      { mfr: "Hornady", line: "Precision Hunter ELD-X", grains: 110, bcG1: 0.465, bcG7: 0.233, mv: 3140, testBarrel: 24, type: "ELD-X" },
      { mfr: "Hornady", line: "Superformance SST", grains: 117, bcG1: 0.390, mv: 3110, testBarrel: 24, type: "SST" },
      { mfr: "Federal", line: "Power-Shok", grains: 117, bcG1: 0.391, mv: 2990, testBarrel: 24, type: "SP" },
      { mfr: "Nosler", line: "Ballistic Tip", grains: 115, bcG1: 0.453, mv: 3000, testBarrel: 24, type: "BT" },
      { mfr: "Remington", line: "Core-Lokt", grains: 120, bcG1: 0.362, mv: 2990, testBarrel: 24, type: "SP" },
      { mfr: "Winchester", line: "Super-X", grains: 120, bcG1: 0.349, mv: 2990, testBarrel: 24, type: "PEP" }
    ]
  },
  {
    id: "257wby", name: ".257 Weatherby Magnum", category: "Magnum", diameter: 0.257, defaultTwist: 10,
    fpsPerInch: 30, testBarrel: 26, defaultBarrel: 26,
    loads: [
      { mfr: "Weatherby", line: "Select Plus AccuBond", grains: 110, bcG1: 0.418, mv: 3460, testBarrel: 26, type: "AccuBond" },
      { mfr: "Weatherby", line: "Select Plus Ballistic Tip", grains: 115, bcG1: 0.453, mv: 3400, testBarrel: 26, type: "BT" },
      { mfr: "Weatherby", line: "Select Plus TTSX", grains: 100, bcG1: 0.357, mv: 3570, testBarrel: 26, type: "TTSX" }
    ]
  },

  /* ---------------------------- 6.5mm ---------------------------- */
  {
    id: "65grendel", name: "6.5 Grendel", category: "Rifle", diameter: 0.264, defaultTwist: 8,
    fpsPerInch: 22, testBarrel: 24, defaultBarrel: 16,
    loads: [
      { mfr: "Hornady", line: "ELD Match", grains: 123, bcG1: 0.506, bcG7: 0.255, mv: 2580, testBarrel: 24, type: "ELD-M" },
      { mfr: "Hornady", line: "Black SST", grains: 123, bcG1: 0.510, mv: 2580, testBarrel: 24, type: "SST" },
      { mfr: "Federal", line: "American Eagle OTM", grains: 120, bcG1: 0.455, mv: 2600, testBarrel: 24, type: "OTM" },
      { mfr: "Federal", line: "Fusion", grains: 120, bcG1: 0.400, mv: 2600, testBarrel: 24, type: "Bonded SP" },
      { mfr: "Wolf", line: "Performance", grains: 100, bcG1: 0.305, mv: 2620, testBarrel: 24, type: "FMJ" }
    ]
  },
  {
    id: "65creedmoor", name: "6.5 Creedmoor", category: "Rifle", diameter: 0.264, defaultTwist: 8,
    fpsPerInch: 26, testBarrel: 24, defaultBarrel: 24,
    loads: [
      { mfr: "Hornady", line: "ELD Match", grains: 140, bcG1: 0.610, bcG7: 0.315, mv: 2710, testBarrel: 24, type: "ELD-M" },
      { mfr: "Hornady", line: "ELD Match", grains: 147, bcG1: 0.697, bcG7: 0.351, mv: 2695, testBarrel: 24, type: "ELD-M" },
      { mfr: "Hornady", line: "Precision Hunter ELD-X", grains: 143, bcG1: 0.625, bcG7: 0.315, mv: 2700, testBarrel: 24, type: "ELD-X" },
      { mfr: "Hornady", line: "Superformance SST", grains: 129, bcG1: 0.485, mv: 2950, testBarrel: 24, type: "SST" },
      { mfr: "Hornady", line: "American Gunner", grains: 140, bcG1: 0.580, bcG7: 0.295, mv: 2690, testBarrel: 24, type: "BTHP" },
      { mfr: "Federal", line: "Gold Medal Berger", grains: 130, bcG1: 0.562, bcG7: 0.289, mv: 2825, testBarrel: 24, type: "Berger Hybrid" },
      { mfr: "Federal", line: "Terminal Ascent", grains: 130, bcG1: 0.532, bcG7: 0.271, mv: 2800, testBarrel: 24, type: "Terminal Ascent" },
      { mfr: "Federal", line: "Terminal Ascent +Peak", grains: 130, bcG1: 0.532, bcG7: 0.271, mv: 3100, testBarrel: 24, type: "Terminal Ascent · Peak Alloy" },
      { mfr: "Federal", line: "Fusion Tipped +Peak", grains: 155, bcG1: 0.608, bcG7: 0.310, mv: 2900, testBarrel: 24, type: "Fusion Tipped · Peak Alloy" },
      { mfr: "Nosler", line: "AccuBond Long Range", grains: 142, bcG1: 0.625, bcG7: 0.310, mv: 2700, testBarrel: 24, type: "ABLR" },
      { mfr: "Berger", line: "Elite Hunter", grains: 156, bcG1: 0.679, bcG7: 0.348, mv: 2625, testBarrel: 24, type: "Elite Hunter" },
      { mfr: "Barnes", line: "VOR-TX LR", grains: 127, bcG1: 0.468, bcG7: 0.236, mv: 2825, testBarrel: 24, type: "LRX" },
      { mfr: "Remington", line: "Core-Lokt Tipped", grains: 129, bcG1: 0.467, mv: 2930, testBarrel: 24, type: "Core-Lokt Tipped" },
      { mfr: "Sig Sauer", line: "Elite Match", grains: 140, bcG1: 0.595, bcG7: 0.305, mv: 2750, testBarrel: 24, type: "OTM" },
      { mfr: "Winchester", line: "Match", grains: 140, bcG1: 0.580, bcG7: 0.297, mv: 2700, testBarrel: 24, type: "BTHP" },
      { mfr: "Sellier & Bellot", line: "FMJ-BT", grains: 140, bcG1: 0.490, mv: 2657, testBarrel: 24, type: "FMJ-BT" }
    ]
  },
  {
    id: "65prc", name: "6.5 PRC", category: "Magnum", diameter: 0.264, defaultTwist: 8,
    fpsPerInch: 30, testBarrel: 24, defaultBarrel: 24,
    loads: [
      { mfr: "Hornady", line: "ELD Match", grains: 147, bcG1: 0.697, bcG7: 0.351, mv: 2910, testBarrel: 24, type: "ELD-M" },
      { mfr: "Hornady", line: "Precision Hunter ELD-X", grains: 143, bcG1: 0.625, bcG7: 0.315, mv: 2960, testBarrel: 24, type: "ELD-X" },
      { mfr: "Hornady", line: "Outfitter CX", grains: 130, bcG1: 0.462, bcG7: 0.232, mv: 3050, testBarrel: 24, type: "CX" },
      { mfr: "Federal", line: "Terminal Ascent", grains: 130, bcG1: 0.532, bcG7: 0.271, mv: 3000, testBarrel: 24, type: "Terminal Ascent" },
      { mfr: "Nosler", line: "AccuBond Long Range", grains: 142, bcG1: 0.625, bcG7: 0.310, mv: 2960, testBarrel: 24, type: "ABLR" },
      { mfr: "Berger", line: "Elite Hunter", grains: 156, bcG1: 0.679, bcG7: 0.348, mv: 2800, testBarrel: 24, type: "Elite Hunter" }
    ]
  },

  /* ---------------------------- .270 / 6.8mm ---------------------------- */
  {
    id: "68spc", name: "6.8 SPC", category: "Rifle", diameter: 0.277, defaultTwist: 11,
    fpsPerInch: 20, testBarrel: 16, defaultBarrel: 16,
    loads: [
      { mfr: "Hornady", line: "Black V-MAX", grains: 110, bcG1: 0.370, mv: 2550, testBarrel: 16, type: "V-MAX" },
      { mfr: "Federal", line: "Fusion MSR", grains: 90, bcG1: 0.261, mv: 2850, testBarrel: 16, type: "Bonded SP" },
      { mfr: "Federal", line: "American Eagle", grains: 115, bcG1: 0.340, mv: 2470, testBarrel: 16, type: "FMJ" },
      { mfr: "Remington", line: "UMC", grains: 115, bcG1: 0.340, mv: 2625, testBarrel: 16, type: "MC" },
      { mfr: "Sellier & Bellot", line: "PTS", grains: 110, bcG1: 0.360, mv: 2625, testBarrel: 16, type: "PTS" }
    ]
  },
  {
    id: "270win", name: ".270 Winchester", category: "Rifle", diameter: 0.277, defaultTwist: 10,
    fpsPerInch: 28, testBarrel: 24, defaultBarrel: 24,
    loads: [
      { mfr: "Hornady", line: "Precision Hunter ELD-X", grains: 145, bcG1: 0.536, bcG7: 0.268, mv: 2970, testBarrel: 24, type: "ELD-X" },
      { mfr: "Hornady", line: "Superformance SST", grains: 130, bcG1: 0.460, mv: 3200, testBarrel: 24, type: "SST" },
      { mfr: "Federal", line: "Power-Shok", grains: 130, bcG1: 0.409, mv: 3060, testBarrel: 24, type: "SP" },
      { mfr: "Federal", line: "Terminal Ascent", grains: 136, bcG1: 0.493, bcG7: 0.247, mv: 3000, testBarrel: 24, type: "Terminal Ascent" },
      { mfr: "Nosler", line: "AccuBond", grains: 140, bcG1: 0.496, mv: 2950, testBarrel: 24, type: "AccuBond" },
      { mfr: "Remington", line: "Core-Lokt", grains: 130, bcG1: 0.336, mv: 3060, testBarrel: 24, type: "PSP" },
      { mfr: "Sierra", line: "GameChanger", grains: 140, bcG1: 0.508, bcG7: 0.253, mv: 2950, testBarrel: 24, type: "TGK" },
      { mfr: "Winchester", line: "Deer Season XP", grains: 130, bcG1: 0.392, mv: 3060, testBarrel: 24, type: "Extreme Point" },
      { mfr: "Winchester", line: "Power Point", grains: 150, bcG1: 0.344, mv: 2850, testBarrel: 24, type: "PP" },
      { mfr: "Barnes", line: "VOR-TX", grains: 130, bcG1: 0.412, mv: 3060, testBarrel: 24, type: "TTSX" }
    ]
  },
  {
    id: "68western", name: "6.8 Western", category: "Magnum", diameter: 0.277, defaultTwist: 8,
    fpsPerInch: 28, testBarrel: 24, defaultBarrel: 24,
    loads: [
      { mfr: "Winchester", line: "Expedition Big Game LR", grains: 165, bcG1: 0.620, bcG7: 0.313, mv: 2970, testBarrel: 24, type: "AccuBond LR" },
      { mfr: "Winchester", line: "Ballistic Silvertip", grains: 170, bcG1: 0.563, mv: 2920, testBarrel: 24, type: "Silvertip" },
      { mfr: "Winchester", line: "Copper Impact", grains: 162, bcG1: 0.583, mv: 2875, testBarrel: 24, type: "Copper Extreme Point" },
      { mfr: "Browning", line: "Long Range Pro Hunter", grains: 175, bcG1: 0.617, bcG7: 0.311, mv: 2835, testBarrel: 24, type: "Tipped GameKing" }
    ]
  },

  /* ---------------------------- 7mm ---------------------------- */
  {
    id: "7mm08", name: "7mm-08 Rem", category: "Rifle", diameter: 0.284, defaultTwist: 9.5,
    fpsPerInch: 27, testBarrel: 24, defaultBarrel: 22,
    loads: [
      { mfr: "Hornady", line: "Precision Hunter ELD-X", grains: 150, bcG1: 0.574, bcG7: 0.286, mv: 2770, testBarrel: 24, type: "ELD-X" },
      { mfr: "Hornady", line: "American Whitetail", grains: 139, bcG1: 0.392, mv: 2840, testBarrel: 24, type: "InterLock" },
      { mfr: "Federal", line: "Fusion", grains: 140, bcG1: 0.435, mv: 2800, testBarrel: 24, type: "Bonded SP" },
      { mfr: "Nosler", line: "Ballistic Tip", grains: 140, bcG1: 0.485, mv: 2820, testBarrel: 24, type: "BT" },
      { mfr: "Remington", line: "Core-Lokt", grains: 140, bcG1: 0.390, mv: 2860, testBarrel: 24, type: "PSP" },
      { mfr: "Winchester", line: "Power Point", grains: 140, bcG1: 0.396, mv: 2800, testBarrel: 24, type: "PP" }
    ]
  },
  {
    id: "280ai", name: ".280 Ackley Improved", category: "Rifle", diameter: 0.284, defaultTwist: 9,
    fpsPerInch: 28, testBarrel: 24, defaultBarrel: 24,
    loads: [
      { mfr: "Hornady", line: "Precision Hunter ELD-X", grains: 162, bcG1: 0.631, bcG7: 0.315, mv: 2850, testBarrel: 24, type: "ELD-X" },
      { mfr: "Hornady", line: "Outfitter CX", grains: 150, bcG1: 0.486, bcG7: 0.245, mv: 2900, testBarrel: 24, type: "CX" },
      { mfr: "Federal", line: "Terminal Ascent", grains: 155, bcG1: 0.586, bcG7: 0.298, mv: 2930, testBarrel: 24, type: "Terminal Ascent" },
      { mfr: "Nosler", line: "AccuBond", grains: 140, bcG1: 0.496, mv: 3150, testBarrel: 24, type: "AccuBond" }
    ]
  },
  {
    id: "7remmag", name: "7mm Rem Magnum", category: "Magnum", diameter: 0.284, defaultTwist: 9,
    fpsPerInch: 30, testBarrel: 24, defaultBarrel: 24,
    loads: [
      { mfr: "Hornady", line: "Precision Hunter ELD-X", grains: 162, bcG1: 0.631, bcG7: 0.315, mv: 2940, testBarrel: 24, type: "ELD-X" },
      { mfr: "Hornady", line: "Superformance SST", grains: 154, bcG1: 0.525, mv: 3100, testBarrel: 24, type: "SST" },
      { mfr: "Federal", line: "Terminal Ascent", grains: 155, bcG1: 0.586, bcG7: 0.298, mv: 2950, testBarrel: 24, type: "Terminal Ascent" },
      { mfr: "Federal", line: "Fusion", grains: 150, bcG1: 0.435, mv: 3050, testBarrel: 24, type: "Bonded SP" },
      { mfr: "Nosler", line: "AccuBond Long Range", grains: 168, bcG1: 0.631, bcG7: 0.323, mv: 2900, testBarrel: 24, type: "ABLR" },
      { mfr: "Remington", line: "Core-Lokt", grains: 150, bcG1: 0.346, mv: 3110, testBarrel: 24, type: "PSP" },
      { mfr: "Winchester", line: "Power Point", grains: 150, bcG1: 0.346, mv: 3090, testBarrel: 24, type: "PP" },
      { mfr: "Barnes", line: "VOR-TX", grains: 160, bcG1: 0.443, mv: 2950, testBarrel: 24, type: "TTSX" },
      { mfr: "Berger", line: "Elite Hunter", grains: 168, bcG1: 0.617, bcG7: 0.316, mv: 2900, testBarrel: 24, type: "Elite Hunter" }
    ]
  },
  {
    id: "7prc", name: "7mm PRC", category: "Magnum", diameter: 0.284, defaultTwist: 8,
    fpsPerInch: 30, testBarrel: 24, defaultBarrel: 24,
    loads: [
      { mfr: "Hornady", line: "ELD Match", grains: 180, bcG1: 0.796, bcG7: 0.401, mv: 2975, testBarrel: 24, type: "ELD-M" },
      { mfr: "Hornady", line: "Precision Hunter ELD-X", grains: 175, bcG1: 0.689, bcG7: 0.347, mv: 3000, testBarrel: 24, type: "ELD-X" },
      { mfr: "Hornady", line: "Outfitter CX", grains: 160, bcG1: 0.532, bcG7: 0.268, mv: 3000, testBarrel: 24, type: "CX" },
      { mfr: "Federal", line: "Terminal Ascent", grains: 170, bcG1: 0.645, bcG7: 0.323, mv: 2980, testBarrel: 24, type: "Terminal Ascent" },
      { mfr: "Federal", line: "ELD-X", grains: 175, bcG1: 0.689, bcG7: 0.347, mv: 3000, testBarrel: 24, type: "ELD-X" },
      { mfr: "Nosler", line: "Trophy Grade ABLR", grains: 175, bcG1: 0.648, bcG7: 0.330, mv: 2950, testBarrel: 24, type: "ABLR" },
      { mfr: "Berger", line: "Elite Hunter", grains: 175, bcG1: 0.697, bcG7: 0.355, mv: 2975, testBarrel: 24, type: "Elite Hunter" }
    ]
  },
  {
    id: "7300prc", name: "7mm-300 PRC (Wildcat)", category: "Magnum", diameter: 0.284, defaultTwist: 8,
    fpsPerInch: 32, testBarrel: 26, defaultBarrel: 26,
    /* Wildcat — .300 PRC necked to 7mm. No SAAMI spec or factory ammo;
       these are representative handloads from published builds. */
    loads: [
      { mfr: "Handload", line: "Hornady 180 ELD Match", grains: 180, bcG1: 0.796, bcG7: 0.401, mv: 3125, testBarrel: 26, type: "ELD-M · Handload" },
      { mfr: "Handload", line: "Berger 190 LRHT", grains: 190, bcG1: 0.754, bcG7: 0.387, mv: 3100, testBarrel: 26, type: "LRHT · Handload" },
      { mfr: "Handload", line: "Berger 195 EOL Elite Hunter", grains: 195, bcG1: 0.755, bcG7: 0.387, mv: 3000, testBarrel: 26, type: "EOL · Handload" }
    ]
  },
  {
    id: "28nosler", name: "28 Nosler", category: "Magnum", diameter: 0.284, defaultTwist: 9,
    fpsPerInch: 32, testBarrel: 26, defaultBarrel: 26,
    loads: [
      { mfr: "Nosler", line: "AccuBond Long Range", grains: 168, bcG1: 0.631, bcG7: 0.323, mv: 3125, testBarrel: 26, type: "ABLR" },
      { mfr: "Nosler", line: "Reloading Berger", grains: 195, bcG1: 0.755, bcG7: 0.387, mv: 2950, testBarrel: 26, type: "Berger EOL" },
      { mfr: "Federal", line: "Terminal Ascent", grains: 155, bcG1: 0.586, bcG7: 0.298, mv: 3300, testBarrel: 26, type: "Terminal Ascent" }
    ]
  },
  {
    id: "7mmbackcountry", name: "7mm Backcountry", category: "Magnum", diameter: 0.284, defaultTwist: 8,
    fpsPerInch: 28, testBarrel: 20, defaultBarrel: 20,
    loads: [
      { mfr: "Federal", line: "Terminal Ascent", grains: 155, bcG1: 0.586, bcG7: 0.296, mv: 3150, testBarrel: 20, type: "Terminal Ascent · Peak Alloy" },
      { mfr: "Federal", line: "Barnes LRX", grains: 168, bcG1: 0.513, bcG7: 0.258, mv: 3000, testBarrel: 20, type: "Barnes LRX · Peak Alloy" },
      { mfr: "Federal", line: "Terminal Ascent", grains: 170, bcG1: 0.645, bcG7: 0.323, mv: 3034, testBarrel: 20, type: "Terminal Ascent · Peak Alloy" },
      { mfr: "Federal", line: "Fusion Tipped", grains: 175, bcG1: 0.575, bcG7: 0.288, mv: 2975, testBarrel: 20, type: "Fusion Tipped · Peak Alloy" },
      { mfr: "Federal", line: "Berger Elite Hunter", grains: 195, bcG1: 0.755, bcG7: 0.384, mv: 2850, testBarrel: 20, type: "Berger Elite Hunter · Peak Alloy" },
      { mfr: "Remington", line: "Premier Long Range", grains: 175, bcG1: 0.560, bcG7: 0.281, mv: 2975, testBarrel: 20, type: "Speer Impact · Peak Alloy" },
      { mfr: "Remington", line: "Core-Lokt Tipped", grains: 175, bcG1: 0.515, bcG7: 0.258, mv: 2975, testBarrel: 20, type: "Core-Lokt Tipped · Peak Alloy" },
      { mfr: "Remington", line: "Core-Lokt", grains: 175, bcG1: 0.420, mv: 2975, testBarrel: 20, type: "Core-Lokt PSP · Peak Alloy" }
    ]
  },

  /* ---------------------------- .30 cal ---------------------------- */
  {
    id: "3030", name: ".30-30 Winchester", category: "Lever", diameter: 0.308, defaultTwist: 12,
    fpsPerInch: 22, testBarrel: 24, defaultBarrel: 20,
    loads: [
      { mfr: "Hornady", line: "LEVERevolution FTX", grains: 160, bcG1: 0.330, mv: 2400, testBarrel: 24, type: "FTX" },
      { mfr: "Hornady", line: "American Whitetail", grains: 150, bcG1: 0.186, mv: 2390, testBarrel: 24, type: "InterLock RN" },
      { mfr: "Federal", line: "Power-Shok", grains: 150, bcG1: 0.218, mv: 2390, testBarrel: 24, type: "FN SP" },
      { mfr: "Federal", line: "HammerDown", grains: 150, bcG1: 0.220, mv: 2390, testBarrel: 24, type: "Bonded SP" },
      { mfr: "Winchester", line: "Super-X", grains: 150, bcG1: 0.218, mv: 2390, testBarrel: 24, type: "Power Point" },
      { mfr: "Remington", line: "Core-Lokt", grains: 170, bcG1: 0.254, mv: 2200, testBarrel: 24, type: "SP" }
    ]
  },
  {
    id: "308win", name: ".308 Winchester", category: "Rifle", diameter: 0.308, defaultTwist: 10,
    fpsPerInch: 25, testBarrel: 24, defaultBarrel: 20,
    loads: [
      { mfr: "Hornady", line: "ELD Match", grains: 168, bcG1: 0.523, bcG7: 0.263, mv: 2700, testBarrel: 24, type: "ELD-M" },
      { mfr: "Hornady", line: "ELD Match", grains: 178, bcG1: 0.547, bcG7: 0.275, mv: 2600, testBarrel: 24, type: "ELD-M" },
      { mfr: "Hornady", line: "Precision Hunter ELD-X", grains: 178, bcG1: 0.552, bcG7: 0.277, mv: 2600, testBarrel: 24, type: "ELD-X" },
      { mfr: "Hornady", line: "Superformance SST", grains: 150, bcG1: 0.415, mv: 3000, testBarrel: 24, type: "SST" },
      { mfr: "Hornady", line: "American Whitetail", grains: 150, bcG1: 0.349, mv: 2820, testBarrel: 24, type: "InterLock" },
      { mfr: "Federal", line: "Gold Medal Sierra MatchKing", grains: 168, bcG1: 0.462, bcG7: 0.224, mv: 2650, testBarrel: 24, type: "SMK" },
      { mfr: "Federal", line: "Gold Medal Sierra MatchKing", grains: 175, bcG1: 0.505, bcG7: 0.243, mv: 2600, testBarrel: 24, type: "SMK" },
      { mfr: "Federal", line: "Gold Medal Berger", grains: 185, bcG1: 0.555, bcG7: 0.283, mv: 2600, testBarrel: 24, type: "Berger Juggernaut" },
      { mfr: "Federal", line: "Power-Shok", grains: 150, bcG1: 0.314, mv: 2820, testBarrel: 24, type: "SP" },
      { mfr: "Federal", line: "Fusion", grains: 165, bcG1: 0.400, mv: 2700, testBarrel: 24, type: "Bonded SP" },
      { mfr: "Sierra", line: "MatchKing", grains: 175, bcG1: 0.505, bcG7: 0.243, mv: 2600, testBarrel: 24, type: "SMK" },
      { mfr: "Nosler", line: "AccuBond", grains: 165, bcG1: 0.475, mv: 2750, testBarrel: 24, type: "AccuBond" },
      { mfr: "Barnes", line: "VOR-TX", grains: 168, bcG1: 0.470, mv: 2680, testBarrel: 24, type: "TTSX" },
      { mfr: "Remington", line: "Core-Lokt", grains: 150, bcG1: 0.314, mv: 2820, testBarrel: 24, type: "PSP" },
      { mfr: "Winchester", line: "Deer Season XP", grains: 150, bcG1: 0.367, mv: 2820, testBarrel: 24, type: "Extreme Point" },
      { mfr: "Winchester", line: "Match", grains: 168, bcG1: 0.462, bcG7: 0.224, mv: 2680, testBarrel: 24, type: "BTHP" },
      { mfr: "PMC", line: "Bronze", grains: 147, bcG1: 0.398, mv: 2780, testBarrel: 24, type: "FMJ-BT" },
      { mfr: "Sellier & Bellot", line: "FMJ-BT", grains: 147, bcG1: 0.400, mv: 2700, testBarrel: 24, type: "FMJ-BT" },
      { mfr: "Sellier & Bellot", line: "SP", grains: 180, bcG1: 0.448, mv: 2493, testBarrel: 24, type: "SP" }
    ]
  },
  {
    id: "3006", name: ".30-06 Springfield", category: "Rifle", diameter: 0.308, defaultTwist: 10,
    fpsPerInch: 26, testBarrel: 24, defaultBarrel: 24,
    loads: [
      { mfr: "Hornady", line: "Precision Hunter ELD-X", grains: 178, bcG1: 0.552, bcG7: 0.277, mv: 2750, testBarrel: 24, type: "ELD-X" },
      { mfr: "Hornady", line: "Superformance SST", grains: 165, bcG1: 0.447, mv: 2960, testBarrel: 24, type: "SST" },
      { mfr: "Hornady", line: "American Whitetail", grains: 150, bcG1: 0.349, mv: 2910, testBarrel: 24, type: "InterLock" },
      { mfr: "Federal", line: "Power-Shok", grains: 180, bcG1: 0.383, mv: 2700, testBarrel: 24, type: "SP" },
      { mfr: "Federal", line: "Trophy Copper", grains: 165, bcG1: 0.470, mv: 2800, testBarrel: 24, type: "Trophy Copper" },
      { mfr: "Federal", line: "Terminal Ascent", grains: 175, bcG1: 0.520, bcG7: 0.264, mv: 2730, testBarrel: 24, type: "Terminal Ascent" },
      { mfr: "Federal", line: "Fusion", grains: 165, bcG1: 0.446, mv: 2800, testBarrel: 24, type: "Bonded SP" },
      { mfr: "Nosler", line: "Partition", grains: 180, bcG1: 0.474, mv: 2700, testBarrel: 24, type: "Partition" },
      { mfr: "Remington", line: "Core-Lokt", grains: 150, bcG1: 0.314, mv: 2910, testBarrel: 24, type: "SP" },
      { mfr: "Remington", line: "Core-Lokt", grains: 180, bcG1: 0.383, mv: 2700, testBarrel: 24, type: "SP" },
      { mfr: "Winchester", line: "Power Point", grains: 180, bcG1: 0.385, mv: 2700, testBarrel: 24, type: "PP" },
      { mfr: "Barnes", line: "VOR-TX", grains: 168, bcG1: 0.470, mv: 2800, testBarrel: 24, type: "TTSX" },
      { mfr: "Sellier & Bellot", line: "SP", grains: 180, bcG1: 0.448, mv: 2625, testBarrel: 24, type: "SP" },
      { mfr: "Sellier & Bellot", line: "FMJ", grains: 150, bcG1: 0.367, mv: 2854, testBarrel: 24, type: "FMJ" }
    ]
  },
  {
    id: "300blk", name: ".300 AAC Blackout", category: "Rifle", diameter: 0.308, defaultTwist: 8,
    fpsPerInch: 18, testBarrel: 16, defaultBarrel: 16,
    loads: [
      { mfr: "Hornady", line: "Black V-MAX", grains: 110, bcG1: 0.290, mv: 2375, testBarrel: 16, type: "V-MAX" },
      { mfr: "Hornady", line: "American Gunner", grains: 125, bcG1: 0.320, mv: 2175, testBarrel: 16, type: "HP Match" },
      { mfr: "Hornady", line: "Subsonic", grains: 190, bcG1: 0.437, mv: 1050, testBarrel: 16, type: "Sub-X" },
      { mfr: "Barnes", line: "VOR-TX", grains: 110, bcG1: 0.289, mv: 2350, testBarrel: 16, type: "TAC-TX" },
      { mfr: "Sig Sauer", line: "Elite Match", grains: 220, bcG1: 0.580, bcG7: 0.295, mv: 1000, testBarrel: 16, type: "OTM Subsonic" },
      { mfr: "Federal", line: "American Eagle", grains: 150, bcG1: 0.290, mv: 1900, testBarrel: 16, type: "FMJ" },
      { mfr: "Winchester", line: "Super Suppressed", grains: 200, bcG1: 0.451, mv: 1060, testBarrel: 16, type: "OT Subsonic" },
      { mfr: "Sellier & Bellot", line: "FMJ", grains: 124, bcG1: 0.290, mv: 2152, testBarrel: 16, type: "FMJ" },
      { mfr: "Sellier & Bellot", line: "Subsonic FMJ", grains: 200, bcG1: 0.437, mv: 1013, testBarrel: 16, type: "FMJ Subsonic" }
    ]
  },
  {
    id: "86blk", name: "8.6 Blackout", category: "Rifle", diameter: 0.338, defaultTwist: 3,
    fpsPerInch: 15, testBarrel: 12, defaultBarrel: 12,
    loads: [
      { mfr: "Gorilla", line: "Barnes TSX", grains: 210, bcG1: 0.404, mv: 2040, testBarrel: 12, type: "TSX Supersonic" },
      { mfr: "Gorilla", line: "Punisher Silverback", grains: 190, bcG1: 0.330, mv: 2100, testBarrel: 12, type: "Solid Copper Supersonic" },
      { mfr: "Gorilla", line: "Pork Shredder", grains: 342, bcG1: 0.400, mv: 1000, testBarrel: 12, type: "CHP Subsonic" },
      { mfr: "Discreet Ballistics", line: "Selous", grains: 280, bcG1: 0.420, mv: 1000, testBarrel: 12, type: "Machined Expander Subsonic" }
    ]
  },
  {
    id: "300winmag", name: ".300 Winchester Magnum", category: "Magnum", diameter: 0.308, defaultTwist: 10,
    fpsPerInch: 30, testBarrel: 24, defaultBarrel: 26,
    loads: [
      { mfr: "Hornady", line: "ELD Match", grains: 195, bcG1: 0.626, bcG7: 0.314, mv: 2930, testBarrel: 24, type: "ELD-M" },
      { mfr: "Hornady", line: "Precision Hunter ELD-X", grains: 200, bcG1: 0.626, bcG7: 0.314, mv: 2860, testBarrel: 24, type: "ELD-X" },
      { mfr: "Hornady", line: "Superformance SST", grains: 180, bcG1: 0.480, mv: 3130, testBarrel: 24, type: "SST" },
      { mfr: "Federal", line: "Gold Medal Berger", grains: 215, bcG1: 0.691, bcG7: 0.354, mv: 2830, testBarrel: 24, type: "Berger Hybrid" },
      { mfr: "Federal", line: "Terminal Ascent", grains: 200, bcG1: 0.608, bcG7: 0.310, mv: 2810, testBarrel: 24, type: "Terminal Ascent" },
      { mfr: "Federal", line: "Fusion", grains: 180, bcG1: 0.422, mv: 2960, testBarrel: 24, type: "Bonded SP" },
      { mfr: "Nosler", line: "AccuBond Long Range", grains: 190, bcG1: 0.640, bcG7: 0.328, mv: 2950, testBarrel: 24, type: "ABLR" },
      { mfr: "Remington", line: "Core-Lokt", grains: 180, bcG1: 0.383, mv: 2960, testBarrel: 24, type: "PSP" },
      { mfr: "Barnes", line: "VOR-TX LR", grains: 190, bcG1: 0.561, bcG7: 0.286, mv: 2900, testBarrel: 24, type: "LRX" },
      { mfr: "Winchester", line: "Expedition Big Game", grains: 180, bcG1: 0.507, mv: 2950, testBarrel: 24, type: "AccuBond CT" }
    ]
  },
  {
    id: "300prc", name: ".300 PRC", category: "Magnum", diameter: 0.308, defaultTwist: 9,
    fpsPerInch: 30, testBarrel: 24, defaultBarrel: 26,
    loads: [
      { mfr: "Hornady", line: "ELD Match", grains: 225, bcG1: 0.777, bcG7: 0.391, mv: 2810, testBarrel: 24, type: "ELD-M" },
      { mfr: "Hornady", line: "Precision Hunter ELD-X", grains: 212, bcG1: 0.673, bcG7: 0.336, mv: 2860, testBarrel: 24, type: "ELD-X" },
      { mfr: "Hornady", line: "Outfitter CX", grains: 190, bcG1: 0.530, bcG7: 0.267, mv: 2900, testBarrel: 24, type: "CX" },
      { mfr: "Federal", line: "Terminal Ascent", grains: 200, bcG1: 0.608, bcG7: 0.310, mv: 2930, testBarrel: 24, type: "Terminal Ascent" },
      { mfr: "Berger", line: "Elite Hunter", grains: 245, bcG1: 0.825, bcG7: 0.423, mv: 2700, testBarrel: 26, type: "Elite Hunter" }
    ]
  },
  {
    id: "300wsm", name: ".300 WSM", category: "Magnum", diameter: 0.308, defaultTwist: 10,
    fpsPerInch: 30, testBarrel: 24, defaultBarrel: 24,
    loads: [
      { mfr: "Hornady", line: "Precision Hunter ELD-X", grains: 200, bcG1: 0.626, bcG7: 0.314, mv: 2790, testBarrel: 24, type: "ELD-X" },
      { mfr: "Winchester", line: "Deer Season XP", grains: 150, bcG1: 0.367, mv: 3300, testBarrel: 24, type: "Extreme Point" },
      { mfr: "Winchester", line: "Ballistic Silvertip", grains: 150, bcG1: 0.435, mv: 3300, testBarrel: 24, type: "Silvertip" },
      { mfr: "Federal", line: "Fusion", grains: 165, bcG1: 0.400, mv: 3000, testBarrel: 24, type: "Bonded SP" }
    ]
  },

  /* ---------------------------- MILITARY / CLASSIC ---------------------------- */
  {
    id: "762x39", name: "7.62x39mm", category: "Rifle", diameter: 0.310, defaultTwist: 9.5,
    fpsPerInch: 20, testBarrel: 16, defaultBarrel: 16,
    loads: [
      { mfr: "Hornady", line: "Black SST", grains: 123, bcG1: 0.295, mv: 2350, testBarrel: 16, type: "SST" },
      { mfr: "PMC", line: "Bronze", grains: 123, bcG1: 0.275, mv: 2350, testBarrel: 16, type: "FMJ" },
      { mfr: "Federal", line: "American Eagle", grains: 124, bcG1: 0.275, mv: 2300, testBarrel: 16, type: "FMJ" },
      { mfr: "Winchester", line: "USA", grains: 123, bcG1: 0.275, mv: 2350, testBarrel: 16, type: "FMJ" },
      { mfr: "Wolf", line: "Performance", grains: 122, bcG1: 0.270, mv: 2396, testBarrel: 16, type: "FMJ" },
      { mfr: "Sellier & Bellot", line: "FMJ", grains: 123, bcG1: 0.275, mv: 2421, testBarrel: 16, type: "FMJ" },
      { mfr: "Sellier & Bellot", line: "SP", grains: 124, bcG1: 0.280, mv: 2400, testBarrel: 16, type: "SP" }
    ]
  },
  {
    id: "545x39", name: "5.45x39mm", category: "Rifle", diameter: 0.221, defaultTwist: 8,
    fpsPerInch: 20, testBarrel: 16, defaultBarrel: 16,
    loads: [
      { mfr: "Hornady", line: "Black V-MAX", grains: 60, bcG1: 0.265, mv: 2810, testBarrel: 16, type: "V-MAX" },
      { mfr: "Wolf", line: "Performance", grains: 60, bcG1: 0.240, mv: 2900, testBarrel: 16, type: "FMJ" },
      { mfr: "Red Army Standard", line: "Elite", grains: 60, bcG1: 0.240, mv: 2890, testBarrel: 16, type: "FMJ" }
    ]
  },
  {
    id: "762x54r", name: "7.62x54R", category: "Rifle", diameter: 0.311, defaultTwist: 9.5,
    fpsPerInch: 22, testBarrel: 24, defaultBarrel: 24,
    loads: [
      { mfr: "Sellier & Bellot", line: "SP", grains: 180, bcG1: 0.411, mv: 2543, testBarrel: 24, type: "SP" },
      { mfr: "Sellier & Bellot", line: "FMJ", grains: 180, bcG1: 0.411, mv: 2580, testBarrel: 24, type: "FMJ" },
      { mfr: "PPU", line: "Standard", grains: 182, bcG1: 0.452, mv: 2540, testBarrel: 24, type: "FMJ-BT" },
      { mfr: "Wolf", line: "Performance", grains: 148, bcG1: 0.345, mv: 2840, testBarrel: 24, type: "FMJ" }
    ]
  },
  {
    id: "303brit", name: ".303 British", category: "Rifle", diameter: 0.312, defaultTwist: 10,
    fpsPerInch: 22, testBarrel: 24, defaultBarrel: 24,
    loads: [
      { mfr: "Hornady", line: "Custom InterLock", grains: 150, bcG1: 0.361, mv: 2685, testBarrel: 24, type: "InterLock SP" },
      { mfr: "Federal", line: "Power-Shok", grains: 180, bcG1: 0.315, mv: 2460, testBarrel: 24, type: "SP" },
      { mfr: "PPU", line: "Standard", grains: 174, bcG1: 0.392, mv: 2440, testBarrel: 24, type: "FMJ" },
      { mfr: "Sellier & Bellot", line: "FMJ", grains: 180, bcG1: 0.400, mv: 2438, testBarrel: 24, type: "FMJ" }
    ]
  },

  /* ---------------------------- BIG BORE / MAGNUM ---------------------------- */
  {
    id: "338winmag", name: ".338 Winchester Magnum", category: "Magnum", diameter: 0.338, defaultTwist: 10,
    fpsPerInch: 30, testBarrel: 24, defaultBarrel: 24,
    loads: [
      { mfr: "Hornady", line: "Superformance SST", grains: 225, bcG1: 0.515, mv: 2840, testBarrel: 24, type: "SST" },
      { mfr: "Nosler", line: "AccuBond", grains: 225, bcG1: 0.550, mv: 2800, testBarrel: 24, type: "AccuBond" },
      { mfr: "Barnes", line: "VOR-TX", grains: 225, bcG1: 0.482, mv: 2800, testBarrel: 24, type: "TTSX" },
      { mfr: "Federal", line: "Power-Shok", grains: 225, bcG1: 0.397, mv: 2780, testBarrel: 24, type: "SP" },
      { mfr: "Winchester", line: "Power Point", grains: 200, bcG1: 0.361, mv: 2960, testBarrel: 24, type: "PP" }
    ]
  },
  {
    id: "338lapua", name: ".338 Lapua Magnum", category: "Magnum", diameter: 0.338, defaultTwist: 9.4,
    fpsPerInch: 32, testBarrel: 27, defaultBarrel: 27,
    loads: [
      { mfr: "Hornady", line: "ELD Match", grains: 285, bcG1: 0.789, bcG7: 0.396, mv: 2745, testBarrel: 27, type: "ELD-M" },
      { mfr: "Hornady", line: "ELD-X", grains: 270, bcG1: 0.757, bcG7: 0.380, mv: 2840, testBarrel: 27, type: "ELD-X" },
      { mfr: "Federal", line: "Gold Medal Sierra MatchKing", grains: 250, bcG1: 0.587, bcG7: 0.301, mv: 2950, testBarrel: 27, type: "SMK" },
      { mfr: "Berger", line: "Elite Hunter", grains: 300, bcG1: 0.818, bcG7: 0.419, mv: 2700, testBarrel: 27, type: "Elite Hunter" },
      { mfr: "Lapua", line: "Scenar", grains: 250, bcG1: 0.675, bcG7: 0.337, mv: 2900, testBarrel: 27, type: "OTM" }
    ]
  },
  {
    id: "375hh", name: ".375 H&H Magnum", category: "Magnum", diameter: 0.375, defaultTwist: 12,
    fpsPerInch: 30, testBarrel: 24, defaultBarrel: 24,
    loads: [
      { mfr: "Hornady", line: "Superformance", grains: 250, bcG1: 0.431, mv: 2890, testBarrel: 24, type: "GMX" },
      { mfr: "Hornady", line: "DGX Bonded", grains: 300, bcG1: 0.298, mv: 2530, testBarrel: 24, type: "DGX" },
      { mfr: "Federal", line: "Power-Shok", grains: 300, bcG1: 0.310, mv: 2530, testBarrel: 24, type: "SP" },
      { mfr: "Barnes", line: "VOR-TX", grains: 300, bcG1: 0.382, mv: 2560, testBarrel: 24, type: "TSX" }
    ]
  },
  {
    id: "50bmg", name: ".50 BMG", category: "Magnum", diameter: 0.510, defaultTwist: 15,
    fpsPerInch: 25, testBarrel: 45, defaultBarrel: 29,
    loads: [
      { mfr: "Hornady", line: "A-MAX Match", grains: 750, bcG1: 1.050, bcG7: 0.525, mv: 2820, testBarrel: 45, type: "A-MAX" },
      { mfr: "Hornady", line: "Match", grains: 750, bcG1: 1.050, bcG7: 0.525, mv: 2800, testBarrel: 45, type: "A-MAX" },
      { mfr: "Federal", line: "American Eagle", grains: 660, bcG1: 0.620, mv: 3030, testBarrel: 45, type: "FMJ" },
      { mfr: "PMC", line: "Bronze", grains: 660, bcG1: 0.620, mv: 3080, testBarrel: 45, type: "FMJ-BT" }
    ]
  },

  /* ---------------------------- LEVER ---------------------------- */
  {
    id: "444marlin", name: ".444 Marlin", category: "Lever", diameter: 0.429, defaultTwist: 38,
    fpsPerInch: 22, testBarrel: 24, defaultBarrel: 22,
    loads: [
      { mfr: "Hornady", line: "LEVERevolution FTX", grains: 265, bcG1: 0.225, mv: 2325, testBarrel: 24, type: "FTX" },
      { mfr: "Remington", line: "Core-Lokt", grains: 240, bcG1: 0.146, mv: 2350, testBarrel: 24, type: "SP" },
      { mfr: "Buffalo Bore", line: "Heavy", grains: 300, bcG1: 0.200, mv: 2150, testBarrel: 24, type: "JFN" }
    ]
  },
  {
    id: "4570", name: ".45-70 Government", category: "Lever", diameter: 0.458, defaultTwist: 20,
    fpsPerInch: 20, testBarrel: 24, defaultBarrel: 22,
    loads: [
      { mfr: "Hornady", line: "LEVERevolution FTX", grains: 325, bcG1: 0.230, mv: 2050, testBarrel: 24, type: "FTX" },
      { mfr: "Federal", line: "Power-Shok", grains: 300, bcG1: 0.200, mv: 1850, testBarrel: 24, type: "JHP" },
      { mfr: "Federal", line: "HammerDown", grains: 300, bcG1: 0.200, mv: 1850, testBarrel: 24, type: "Bonded HP" },
      { mfr: "Winchester", line: "Super-X", grains: 300, bcG1: 0.200, mv: 1880, testBarrel: 24, type: "JHP" },
      { mfr: "Remington", line: "Core-Lokt", grains: 405, bcG1: 0.281, mv: 1330, testBarrel: 24, type: "SP" },
      { mfr: "Buffalo Bore", line: "Heavy", grains: 430, bcG1: 0.281, mv: 1925, testBarrel: 24, type: "Hard Cast" }
    ]
  },

  /* ---------------------------- STRAIGHT-WALL ---------------------------- */
  {
    id: "350legend", name: ".350 Legend", category: "Straight-Wall", diameter: 0.357, defaultTwist: 16,
    fpsPerInch: 20, testBarrel: 20, defaultBarrel: 18,
    loads: [
      { mfr: "Winchester", line: "Deer Season XP", grains: 150, bcG1: 0.223, mv: 2325, testBarrel: 20, type: "Extreme Point" },
      { mfr: "Winchester", line: "USA", grains: 145, bcG1: 0.190, mv: 2350, testBarrel: 20, type: "FMJ" },
      { mfr: "Winchester", line: "Super Suppressed", grains: 255, bcG1: 0.280, mv: 1060, testBarrel: 20, type: "OT Subsonic" },
      { mfr: "Federal", line: "Power-Shok", grains: 180, bcG1: 0.245, mv: 2100, testBarrel: 20, type: "SP" },
      { mfr: "Federal", line: "Fusion", grains: 160, bcG1: 0.230, mv: 2300, testBarrel: 20, type: "Bonded SP" },
      { mfr: "Hornady", line: "American Whitetail", grains: 170, bcG1: 0.250, mv: 2200, testBarrel: 20, type: "InterLock" }
    ]
  },
  {
    id: "360buckhammer", name: ".360 Buckhammer", category: "Straight-Wall", diameter: 0.358, defaultTwist: 12,
    fpsPerInch: 20, testBarrel: 20, defaultBarrel: 20,
    loads: [
      { mfr: "Remington", line: "Core-Lokt", grains: 180, bcG1: 0.191, mv: 2400, testBarrel: 20, type: "SP" },
      { mfr: "Remington", line: "Core-Lokt", grains: 200, bcG1: 0.212, mv: 2200, testBarrel: 20, type: "SP" },
      { mfr: "Federal", line: "Power-Shok", grains: 180, bcG1: 0.191, mv: 2390, testBarrel: 20, type: "SP" }
    ]
  },
  {
    id: "400legend", name: ".400 Legend", category: "Straight-Wall", diameter: 0.400, defaultTwist: 14,
    fpsPerInch: 20, testBarrel: 20, defaultBarrel: 20,
    loads: [
      { mfr: "Winchester", line: "Power-Point", grains: 215, bcG1: 0.226, mv: 2250, testBarrel: 20, type: "PP" },
      { mfr: "Winchester", line: "Deer Season XP", grains: 215, bcG1: 0.226, mv: 2250, testBarrel: 20, type: "Extreme Point" },
      { mfr: "Winchester", line: "Super Suppressed", grains: 300, bcG1: 0.272, mv: 1060, testBarrel: 20, type: "OT Subsonic" }
    ]
  },
  {
    id: "450bushmaster", name: ".450 Bushmaster", category: "Straight-Wall", diameter: 0.452, defaultTwist: 24,
    fpsPerInch: 20, testBarrel: 20, defaultBarrel: 16,
    loads: [
      { mfr: "Hornady", line: "Black FTX", grains: 250, bcG1: 0.210, mv: 2200, testBarrel: 20, type: "FTX" },
      { mfr: "Hornady", line: "Subsonic Sub-X", grains: 395, bcG1: 0.300, mv: 1050, testBarrel: 20, type: "Sub-X" },
      { mfr: "Winchester", line: "Deer Season XP", grains: 250, bcG1: 0.200, mv: 2165, testBarrel: 20, type: "Extreme Point" },
      { mfr: "Remington", line: "Premier AccuTip", grains: 260, bcG1: 0.180, mv: 2180, testBarrel: 20, type: "AccuTip" },
      { mfr: "Federal", line: "Power-Shok", grains: 300, bcG1: 0.197, mv: 1900, testBarrel: 20, type: "JHP" },
      { mfr: "Federal", line: "Fusion", grains: 260, bcG1: 0.190, mv: 2200, testBarrel: 20, type: "Bonded SP" }
    ]
  },

  /* ---------------------------- HANDGUN ---------------------------- */
  {
    id: "380acp", name: ".380 ACP", category: "Pistol", diameter: 0.355, defaultTwist: 16,
    fpsPerInch: 20, testBarrel: 4, defaultBarrel: 4,
    loads: [
      { mfr: "Federal", line: "HST Micro", grains: 99, bcG1: 0.120, mv: 1030, testBarrel: 4, type: "JHP" },
      { mfr: "Hornady", line: "Critical Defense", grains: 90, bcG1: 0.100, mv: 1000, testBarrel: 4, type: "FTX" },
      { mfr: "Speer", line: "Gold Dot", grains: 90, bcG1: 0.092, mv: 1040, testBarrel: 4, type: "JHP" },
      { mfr: "Federal", line: "American Eagle", grains: 95, bcG1: 0.077, mv: 980, testBarrel: 4, type: "FMJ" },
      { mfr: "Winchester", line: "USA", grains: 95, bcG1: 0.077, mv: 955, testBarrel: 4, type: "FMJ" },
      { mfr: "Sellier & Bellot", line: "FMJ", grains: 92, bcG1: 0.090, mv: 955, testBarrel: 4, type: "FMJ" }
    ]
  },
  {
    id: "9mm", name: "9mm Luger", category: "Pistol", diameter: 0.355, defaultTwist: 10,
    fpsPerInch: 25, testBarrel: 4, defaultBarrel: 4,
    loads: [
      { mfr: "Federal", line: "HST", grains: 124, bcG1: 0.165, mv: 1150, testBarrel: 4, type: "JHP" },
      { mfr: "Federal", line: "HST", grains: 147, bcG1: 0.190, mv: 1000, testBarrel: 4, type: "JHP" },
      { mfr: "Federal", line: "Punch", grains: 124, bcG1: 0.165, mv: 1150, testBarrel: 4, type: "JHP" },
      { mfr: "Speer", line: "Gold Dot", grains: 147, bcG1: 0.175, mv: 985, testBarrel: 4, type: "JHP" },
      { mfr: "Speer", line: "Gold Dot +P", grains: 124, bcG1: 0.165, mv: 1220, testBarrel: 4, type: "JHP" },
      { mfr: "Hornady", line: "Critical Defense", grains: 115, bcG1: 0.140, mv: 1140, testBarrel: 4, type: "FTX" },
      { mfr: "Hornady", line: "Critical Duty +P", grains: 135, bcG1: 0.160, mv: 1110, testBarrel: 4, type: "FlexLock" },
      { mfr: "Federal", line: "American Eagle", grains: 115, bcG1: 0.130, mv: 1180, testBarrel: 4, type: "FMJ" },
      { mfr: "Winchester", line: "USA", grains: 115, bcG1: 0.130, mv: 1190, testBarrel: 4, type: "FMJ" },
      { mfr: "CCI", line: "Blazer Brass", grains: 115, bcG1: 0.130, mv: 1145, testBarrel: 4, type: "FMJ" },
      { mfr: "Remington", line: "UMC", grains: 115, bcG1: 0.130, mv: 1145, testBarrel: 4, type: "FMJ" },
      { mfr: "Sellier & Bellot", line: "FMJ", grains: 115, bcG1: 0.140, mv: 1280, testBarrel: 4, type: "FMJ" },
      { mfr: "Sellier & Bellot", line: "FMJ", grains: 124, bcG1: 0.150, mv: 1181, testBarrel: 4, type: "FMJ" }
    ]
  },
  {
    id: "357sig", name: ".357 SIG", category: "Pistol", diameter: 0.355, defaultTwist: 16,
    fpsPerInch: 25, testBarrel: 4, defaultBarrel: 4,
    loads: [
      { mfr: "Speer", line: "Gold Dot", grains: 125, bcG1: 0.145, mv: 1375, testBarrel: 4, type: "JHP" },
      { mfr: "Sig Sauer", line: "V-Crown", grains: 125, bcG1: 0.145, mv: 1356, testBarrel: 4, type: "JHP" },
      { mfr: "Federal", line: "American Eagle", grains: 125, bcG1: 0.145, mv: 1350, testBarrel: 4, type: "FMJ" },
      { mfr: "Underwood", line: "Xtreme Defender", grains: 90, bcG1: 0.100, mv: 1550, testBarrel: 4, type: "XD Solid" }
    ]
  },
  {
    id: "38spl", name: ".38 Special", category: "Pistol", diameter: 0.357, defaultTwist: 19,
    fpsPerInch: 22, testBarrel: 4, defaultBarrel: 4,
    loads: [
      { mfr: "Federal", line: "HST Micro +P", grains: 130, bcG1: 0.150, mv: 890, testBarrel: 4, type: "JHP" },
      { mfr: "Hornady", line: "Critical Defense", grains: 110, bcG1: 0.110, mv: 1010, testBarrel: 4, type: "FTX" },
      { mfr: "Speer", line: "Gold Dot +P", grains: 135, bcG1: 0.130, mv: 975, testBarrel: 4, type: "JHP" },
      { mfr: "Federal", line: "American Eagle", grains: 158, bcG1: 0.160, mv: 760, testBarrel: 4, type: "LRN" },
      { mfr: "Winchester", line: "Super-X +P", grains: 158, bcG1: 0.169, mv: 890, testBarrel: 4, type: "LSWC-HP" },
      { mfr: "Sellier & Bellot", line: "FMJ", grains: 158, bcG1: 0.160, mv: 889, testBarrel: 4, type: "FMJ" }
    ]
  },
  {
    id: "357mag", name: ".357 Magnum", category: "Pistol", diameter: 0.357, defaultTwist: 19,
    fpsPerInch: 30, testBarrel: 6, defaultBarrel: 4,
    loads: [
      { mfr: "Federal", line: "Power-Shok", grains: 158, bcG1: 0.206, mv: 1240, testBarrel: 6, type: "JHP" },
      { mfr: "Federal", line: "American Eagle", grains: 158, bcG1: 0.206, mv: 1240, testBarrel: 6, type: "JSP" },
      { mfr: "Hornady", line: "Custom XTP", grains: 158, bcG1: 0.206, mv: 1250, testBarrel: 6, type: "XTP" },
      { mfr: "Speer", line: "Gold Dot", grains: 125, bcG1: 0.145, mv: 1450, testBarrel: 6, type: "JHP" },
      { mfr: "Buffalo Bore", line: "Heavy", grains: 180, bcG1: 0.245, mv: 1400, testBarrel: 6, type: "Hard Cast" },
      { mfr: "Sellier & Bellot", line: "SP", grains: 158, bcG1: 0.165, mv: 1263, testBarrel: 6, type: "SP" }
    ]
  },
  {
    id: "40sw", name: ".40 S&W", category: "Pistol", diameter: 0.400, defaultTwist: 16,
    fpsPerInch: 22, testBarrel: 4, defaultBarrel: 4,
    loads: [
      { mfr: "Federal", line: "HST", grains: 180, bcG1: 0.164, mv: 1010, testBarrel: 4, type: "JHP" },
      { mfr: "Speer", line: "Gold Dot", grains: 165, bcG1: 0.140, mv: 1150, testBarrel: 4, type: "JHP" },
      { mfr: "Hornady", line: "Critical Duty", grains: 175, bcG1: 0.169, mv: 1010, testBarrel: 4, type: "FlexLock" },
      { mfr: "Federal", line: "American Eagle", grains: 180, bcG1: 0.164, mv: 1000, testBarrel: 4, type: "FMJ" },
      { mfr: "Winchester", line: "USA", grains: 165, bcG1: 0.140, mv: 1060, testBarrel: 4, type: "FMJ" },
      { mfr: "Sellier & Bellot", line: "FMJ", grains: 180, bcG1: 0.164, mv: 985, testBarrel: 4, type: "FMJ" }
    ]
  },
  {
    id: "10mm", name: "10mm Auto", category: "Pistol", diameter: 0.400, defaultTwist: 16,
    fpsPerInch: 25, testBarrel: 5, defaultBarrel: 5,
    loads: [
      { mfr: "Federal", line: "HST", grains: 200, bcG1: 0.190, mv: 1130, testBarrel: 5, type: "JHP" },
      { mfr: "Federal", line: "American Eagle", grains: 180, bcG1: 0.164, mv: 1030, testBarrel: 5, type: "FMJ" },
      { mfr: "Hornady", line: "Custom XTP", grains: 180, bcG1: 0.164, mv: 1180, testBarrel: 5, type: "XTP" },
      { mfr: "Speer", line: "Gold Dot", grains: 200, bcG1: 0.190, mv: 1100, testBarrel: 5, type: "JHP" },
      { mfr: "Sig Sauer", line: "V-Crown", grains: 180, bcG1: 0.164, mv: 1250, testBarrel: 5, type: "JHP" },
      { mfr: "Buffalo Bore", line: "Heavy", grains: 220, bcG1: 0.205, mv: 1200, testBarrel: 5, type: "Hard Cast" }
    ]
  },
  {
    id: "44mag", name: ".44 Magnum", category: "Pistol", diameter: 0.429, defaultTwist: 20,
    fpsPerInch: 28, testBarrel: 6, defaultBarrel: 6,
    loads: [
      { mfr: "Hornady", line: "Custom XTP", grains: 240, bcG1: 0.205, mv: 1350, testBarrel: 6, type: "XTP" },
      { mfr: "Federal", line: "Power-Shok", grains: 240, bcG1: 0.165, mv: 1230, testBarrel: 6, type: "JHP" },
      { mfr: "Winchester", line: "Super-X", grains: 240, bcG1: 0.175, mv: 1350, testBarrel: 6, type: "HSP" },
      { mfr: "Buffalo Bore", line: "Heavy", grains: 305, bcG1: 0.205, mv: 1325, testBarrel: 6, type: "Hard Cast" }
    ]
  },
  {
    id: "45acp", name: ".45 ACP", category: "Pistol", diameter: 0.451, defaultTwist: 16,
    fpsPerInch: 18, testBarrel: 5, defaultBarrel: 5,
    loads: [
      { mfr: "Federal", line: "HST", grains: 230, bcG1: 0.195, mv: 890, testBarrel: 5, type: "JHP" },
      { mfr: "Speer", line: "Gold Dot", grains: 230, bcG1: 0.190, mv: 890, testBarrel: 5, type: "JHP" },
      { mfr: "Hornady", line: "Critical Duty +P", grains: 220, bcG1: 0.188, mv: 975, testBarrel: 5, type: "FlexLock" },
      { mfr: "Federal", line: "American Eagle", grains: 230, bcG1: 0.190, mv: 850, testBarrel: 5, type: "FMJ" },
      { mfr: "Winchester", line: "USA", grains: 230, bcG1: 0.190, mv: 835, testBarrel: 5, type: "FMJ" },
      { mfr: "Remington", line: "UMC", grains: 230, bcG1: 0.190, mv: 835, testBarrel: 5, type: "FMJ" },
      { mfr: "Sellier & Bellot", line: "FMJ", grains: 230, bcG1: 0.190, mv: 830, testBarrel: 5, type: "FMJ" }
    ]
  },
  {
    id: "45colt", name: ".45 Colt", category: "Pistol", diameter: 0.452, defaultTwist: 16,
    fpsPerInch: 20, testBarrel: 5.5, defaultBarrel: 5.5,
    loads: [
      { mfr: "Hornady", line: "Critical Defense", grains: 185, bcG1: 0.130, mv: 920, testBarrel: 5.5, type: "FTX" },
      { mfr: "Federal", line: "Champion", grains: 225, bcG1: 0.140, mv: 830, testBarrel: 5.5, type: "SWC-HP" },
      { mfr: "Winchester", line: "Super-X", grains: 255, bcG1: 0.180, mv: 860, testBarrel: 5.5, type: "LRN" },
      { mfr: "Buffalo Bore", line: "Heavy +P", grains: 325, bcG1: 0.220, mv: 1325, testBarrel: 5.5, type: "Hard Cast" }
    ]
  },
  {
    id: "57x28", name: "5.7x28mm", category: "Pistol", diameter: 0.224, defaultTwist: 9,
    fpsPerInch: 30, testBarrel: 5, defaultBarrel: 5,
    loads: [
      { mfr: "FN", line: "SS197SR", grains: 40, bcG1: 0.125, mv: 1700, testBarrel: 5, type: "V-MAX" },
      { mfr: "Speer", line: "Gold Dot", grains: 40, bcG1: 0.125, mv: 1800, testBarrel: 5, type: "JHP" },
      { mfr: "Federal", line: "American Eagle", grains: 40, bcG1: 0.125, mv: 1655, testBarrel: 5, type: "FMJ" },
      { mfr: "Sig Sauer", line: "Elite V-Crown", grains: 40, bcG1: 0.125, mv: 1800, testBarrel: 5, type: "JHP" }
    ]
  },
  {
    id: "500sw", name: ".500 S&W Magnum", category: "Pistol", diameter: 0.500, defaultTwist: 19,
    fpsPerInch: 30, testBarrel: 8.5, defaultBarrel: 8.5,
    loads: [
      { mfr: "Hornady", line: "Custom FTX", grains: 300, bcG1: 0.200, mv: 2075, testBarrel: 8.5, type: "FTX" },
      { mfr: "Winchester", line: "Super-X", grains: 350, bcG1: 0.210, mv: 1880, testBarrel: 8.5, type: "JHP" },
      { mfr: "Buffalo Bore", line: "Heavy", grains: 440, bcG1: 0.230, mv: 1625, testBarrel: 8.5, type: "Hard Cast" }
    ]
  }
];
