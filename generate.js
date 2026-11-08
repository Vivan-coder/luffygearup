// Generates dist/luffy-punch.svg — Luffy throws a Gum-Gum Pistol; every contribution adds power,
// and every 400 contributions he unlocks the next form (the same rule for everyone):
//   0 Gear 1 · 400 Gear 2 · 800 Gear 3 · 1,200 Boundman · 1,600 Snakeman · 2,000 Gear 5
// Usage:
//   GITHUB_TOKEN=xxx GITHUB_USER=name node generate.js   (real data, last 12 months)
//   node generate.js 800                                  (manual count, for testing)
const fs = require("fs");
const path = require("path");

// One fixed rule for everyone: a new gear every 400 contributions (Gear 5 at 2,000).
const STEP = 400;
const SCALE = STEP; // how fast raw power (reach, speed, hits) rises

async function getContributions() {
  if (process.argv[2]) return Number(process.argv[2]);
  const token = process.env.GITHUB_TOKEN;
  const user = process.env.GITHUB_USER;
  if (!token || !user) throw new Error("Set GITHUB_TOKEN and GITHUB_USER, or pass a number.");
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `query($u:String!){user(login:$u){contributionsCollection{contributionCalendar{totalContributions}}}}`,
      variables: { u: user },
    }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data.user.contributionsCollection.contributionCalendar.totalContributions;
}

// ---------------------------------------------------------------- forms
const SKIN = ["#c58e66", "#eec29a", "#d9a57c"];
const LIMB = ["#f3cba3", "#e2ab80", "#b9805a"];
const DARK_LIMB = ["#5d6075", "#1f212b", "#06070a"];
const FORMS = [
  { min: 0, id: "g1", name: "Gear 1", skin: SKIN, limb: LIMB, fist: ["#f7d6b3", "#c58a60"], fistStroke: "#a8683f", knuckle: "#9a5e38",
    legBack: "#b27b55", hair: "#14110f", shorts: ["#26457a", "#16294a"], vest: true, s: 1, hitsMax: 2, durMul: 1, reachMul: 1, armMul: 1,
    glow: "#ff9a4d", flash: "#ffd7a8" },
  { min: 1 * STEP, id: "g2", name: "Gear 2", skin: ["#b5584a", "#ea8a72", "#cf6a58"], limb: ["#f6a58c", "#e0795f", "#a9493c"], fist: ["#f8b39b", "#b9513f"],
    fistStroke: "#8f3a2f", knuckle: "#8a3428", legBack: "#a24a3d", hair: "#14110f", shorts: ["#26457a", "#16294a"], vest: true, s: 1,
    hitsMax: 6, durMul: 0.8, reachMul: 1.05, armMul: 1.05, fast: true, jitter: true, timing: { wind: 0.26, first: 0.28, sp: 0.04 }, glow: "#ff5a3c", flash: "#ffb199",
    steam: { n: 20, color: "#ffffff", op: 0.4, rise: 80, size: [6, 14] } },
  { min: 2 * STEP, id: "g3", name: "Gear 3", skin: SKIN, limb: LIMB, fist: ["#f7d6b3", "#c58a60"], fistStroke: "#a8683f", knuckle: "#9a5e38",
    legBack: "#b27b55", hair: "#14110f", shorts: ["#26457a", "#16294a"], vest: true, s: 1, hitsMax: 1, durMul: 1.25, reachMul: 0.95, armMul: 1.15,
    inflate: true, fistS: 2.3, sway: true, glow: "#ffa14d", flash: "#ffd7a8",
    steam: { n: 9, color: "#ffffff", op: 0.28, rise: 55, size: [5, 10] } },
  { min: 3 * STEP, id: "g4b", name: "Gear 4 · Boundman", skin: SKIN, limb: DARK_LIMB, fist: ["#4f5266", "#0b0c10"], fistStroke: "#000", knuckle: "#000",
    legBack: "#14151c", hair: "#14110f", shorts: ["#3a1114", "#1c0709"], vest: false, tattoo: true, s: 1.04, bounce: true, fat: true,
    hitsMax: 3, durMul: 0.9, reachMul: 1.05, armMul: 1.3, glow: "#e0323c", flash: "#ff9a9a", auraC: "#d12a35",
    steam: { n: 12, color: "#d8323c", op: 0.32, rise: 60, size: [5, 11] } },
  { min: 4 * STEP, id: "g4s", name: "Gear 4 · Snakeman", skin: SKIN, limb: DARK_LIMB, fist: ["#4f5266", "#0b0c10"], fistStroke: "#000", knuckle: "#000",
    legBack: "#14151c", hair: "#14110f", shorts: ["#3a1114", "#1c0709"], vest: false, tattoo: true, s: 1, zig: true, sway: true,
    hitsMax: 4, durMul: 0.7, reachMul: 1.15, armMul: 0.8, glow: "#ffb52e", flash: "#ffe39a", auraC: "#ffae2a",
    steam: { n: 18, color: "#ffb52e", op: 0.5, rise: 90, size: [4, 9], flame: true } },
  { min: 5 * STEP, id: "g5", name: "Gear 5", skin: SKIN, limb: LIMB, fist: ["#f7d6b3", "#c58a60"], fistStroke: "#a8683f", knuckle: "#9a5e38",
    legBack: "#b27b55", hair: "#f4f7ff", shorts: ["#f2f6ff", "#aebbd6"], vest: false, band: "#f3ead6", s: 1, hitsMax: 4, durMul: 0.8, reachMul: 1.1, armMul: 1.1, fistMul: 1.2, float: true,
    glow: "#d5e9ff", flash: "#ffffff", auraC: "#cfe4ff", white: true },
];
function formFor(count) {
  let r = FORMS[0];
  for (const fm of FORMS) if (count >= fm.min) r = fm;
  return r;
}

// ---------------------------------------------------------------- helpers
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const f = (n) => +n.toFixed(3);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const SPLINE = "0.35 0 0.15 1";

function track(pairs) {
  const p = pairs.map(([t, v]) => [clamp(t, 0, 1), v]).sort((a, b) => a[0] - b[0]);
  if (p[0][0] > 0) p.unshift([0, p[0][1]]);
  if (p[p.length - 1][0] < 1) p.push([1, p[p.length - 1][1]]);
  return { values: p.map((x) => x[1]).join(";"), keyTimes: p.map((x) => f(x[0])).join(";"), n: p.length };
}
function spl(t, spline) {
  return spline ? ` calcMode="spline" keySplines="${Array(t.n - 1).fill(SPLINE).join(";")}"` : "";
}
function animate(attr, pairs, dur, { spline = false, begin = 0 } = {}) {
  const t = track(pairs);
  return `<animate attributeName="${attr}" values="${t.values}" keyTimes="${t.keyTimes}"${spl(t, spline)} dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>`;
}
function animateT(pairs, dur, { spline = false, begin = 0, type = "translate" } = {}) {
  const t = track(pairs);
  return `<animateTransform attributeName="transform" type="${type}" values="${t.values}" keyTimes="${t.keyTimes}"${spl(t, spline)} dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>`;
}

// Tapered, muscular, stretching arm outline. Same point count every call so SMIL can morph it.
function armPath(x0, y0, len, th, { wave = 0, phase = 0, inflate = 0, K = 4.3 } = {}) {
  const N = 16, top = [], bot = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    let prof = (1 - 0.28 * Math.sin(Math.PI * t)) * (1 + 0.42 * (1 - t) * (1 - t)); // bicep at shoulder, thin mid, wrist
    if (inflate) prof = (0.85 + K * Math.pow(t, 1.6) * inflate) * (1 + 0.2 * (1 - t));
    const h = (th * prof) / 2;
    const yc = y0 + wave * Math.sin(t * Math.PI * 2.5 + phase) * Math.sin(Math.PI * t);
    const x = x0 + len * t;
    top.push(`${f(x)} ${f(yc - h)}`);
    bot.push(`${f(x)} ${f(yc + h)}`);
  }
  return `M${top.join(" L")} L${bot.reverse().join(" L")} Z`;
}
// Snakeman: zigzag "lightning bolt" arm. Fixed point count so SMIL can morph it.
function zigPath(x0, y0, len, amp, tip) {
  const Z = 6, pts = [];
  for (let j = 0; j <= Z; j++) {
    const x = x0 + len * (j / Z);
    let y = y0;
    if (j === Z) y = y0 + tip;
    else if (j > 0) y = y0 + (j % 2 ? -1 : 1) * amp * Math.pow(Math.sin((Math.PI * j) / Z), 0.7);
    pts.push(`${f(x)} ${f(y)}`);
  }
  return `M${pts.join(" L")}`;
}
function armHighlight(x0, y0, len, th, o) {
  const N = 16, pts = [];
  for (let i = 1; i < N; i++) {
    const t = i / N;
    let prof = (1 - 0.28 * Math.sin(Math.PI * t)) * (1 + 0.42 * (1 - t) * (1 - t));
    if (o.inflate) prof = (0.85 + (o.K || 4.3) * Math.pow(t, 1.6) * o.inflate) * (1 + 0.2 * (1 - t));
    const yc = y0 + (o.wave || 0) * Math.sin(t * Math.PI * 2.5 + (o.phase || 0)) * Math.sin(Math.PI * t);
    pts.push(`${f(x0 + len * t)} ${f(yc - (th * prof) / 2 + th * prof * 0.2)}`);
  }
  return `M${pts.join(" L")}`;
}

// ---------------------------------------------------------------- scene
function build(count) {
  const form = formFor(count);
  const W = 900, H = 300, groundY = 248;
  const shoulderX = 148, armY = 116;
  const s = form.s;
  const fat = !!form.fat;
  const pivX = 116;
  const wx = (x) => pivX + (x - pivX) * s; // local -> world, x
  const wy = (y) => groundY + (y - groundY) * s;

  // power rises with every single contribution
  const p = 1 - Math.exp(-count / (SCALE * 2.5));
  const fistR0 = (13 + p * 9) * (form.fistMul || 1);
  const S = form.fistS || 1; // max fist scale (Gear 3 inflates)
  const fistR = f(fistR0);
  const armH = f((13 + p * 8) * form.armMul);
  const hits = clamp(1 + Math.floor(p * 5), 1, form.hitsMax);
  const dur = f((3.2 - p * 1.3) * form.durMul);
  const rest = 8, windup = -12;
  const lean = 11;
  const reachMax = (W - 26 - lean * s - pivX) / s + pivX - shoulderX - fistR * S * 1.08;
  const reach = Math.round(Math.min(reachMax, (90 + p * (reachMax - 90)) * form.reachMul));

  // ---------- timeline (fractions of the loop) ----------
  const tm = form.timing || { wind: 0.24, first: 0.3, sp: 0.1 };
  const slow = tm.sp >= 0.1;
  const win = Math.min(1, tm.sp / 0.1); // shrink per-hit effect windows for rapid-fire forms
  const hitT = [];
  for (let i = 0; i < hits; i++) hitT.push(f(tm.first + i * tm.sp));
  const last = hitT[hitT.length - 1];
  const zg = form.zig ? 1 : 0;
  const ev = [{ t: 0, len: rest }, { t: Math.min(0.12, tm.wind - 0.04), len: rest }, { t: tm.wind, len: windup }];
  if (zg) ev.push({ t: tm.wind + 0.022, len: (windup + reach) * 0.35, amp: 26, tip: 22 }, { t: tm.wind + 0.042, len: (windup + reach) * 0.72, amp: 22, tip: -18 });
  hitT.forEach((t, i) => {
    ev.push({ t, len: reach, amp: zg * 14, tip: 0 });
    if (i < hitT.length - 1) {
      if (slow) ev.push({ t: t + 0.03, len: reach, amp: zg * 14, tip: 0 });
      ev.push({ t: f(t + tm.sp * 0.55), len: reach * 0.5, amp: zg * 10, tip: zg * (i % 2 ? 8 : -8) });
    }
  });
  if (zg) ev.push({ t: last + 0.16, len: reach * 0.55, amp: 16, tip: -10 });
  ev.push({ t: last + 0.1, len: reach, amp: zg * 14, tip: 0 }, { t: last + 0.3, len: rest }, { t: 1, len: rest });
  ev.sort((a, b) => a.t - b.t);
  const sc = (len) => (S === 1 ? 1 : 0.55 + (S - 0.55) * Math.pow(clamp((len - windup) / (reach - windup), 0, 1), 1.6));
  const infK = Math.max(1, (1.6 * fistR * S) / armH - 0.85);
  const infl = (e) => (form.inflate ? sc(e.len) / S : 0);
  const armD = ev.map((e) => [e.t, zg ? zigPath(shoulderX, armY, Math.max(1, e.len), e.amp || 0, e.tip || 0) : armPath(shoulderX, armY, Math.max(1, e.len), armH, { inflate: infl(e), K: infK })]);
  const hiD = ev.map((e) => [e.t, zg ? zigPath(shoulderX, armY, Math.max(1, e.len), e.amp || 0, e.tip || 0) : armHighlight(shoulderX, armY, Math.max(1, e.len), armH, { inflate: infl(e), K: infK })]);
  const fistPairs = ev.map((e) => [e.t, `${f(shoulderX + e.len)} ${f(armY + (e.tip || 0))}`]);
  const scalePairs = ev.map((e) => [e.t, f(sc(e.len))]);
  const leanPairs = [[0, 0], [Math.min(0.12, tm.wind - 0.04), 0], [tm.wind, -10]];
  hitT.forEach((t, i) => {
    leanPairs.push([t, lean]);
    if (i < hitT.length - 1) leanPairs.push([f(t + tm.sp * 0.55), 4]);
  });
  leanPairs.push([last + 0.1, lean], [last + 0.3, 0], [1, 0]);

  const impactX = f(wx(shoulderX + reach + fistR * S * 1.08) + lean * s);
  const impY = f(wy(armY));
  const R = rng(count * 7919 + 13);

  // ---------- fist ----------
  const fist = (r) => `<ellipse rx="${f(r * 1.08)}" ry="${f(r)}" fill="url(#fistG)" stroke="${form.fistStroke}" stroke-width="1.2"/>
      <path d="M${f(r * 0.25)} ${f(-r * 0.62)} q${f(r * 0.7)} ${f(r * 0.1)} ${f(r * 0.75)} ${f(r * 0.45)}
               M${f(r * 0.3)} ${f(-r * 0.2)} q${f(r * 0.65)} ${f(r * 0.08)} ${f(r * 0.72)} ${f(r * 0.42)}
               M${f(r * 0.3)} ${f(r * 0.2)} q${f(r * 0.6)} ${f(r * 0.1)} ${f(r * 0.66)} ${f(r * 0.4)}"
            fill="none" stroke="${form.knuckle}" stroke-width="${f(1.4 * Math.max(1, S * 0.6))}" stroke-linecap="round" opacity="0.8"/>
      <ellipse cx="${f(-r * 0.3)}" cy="${f(-r * 0.45)}" rx="${f(r * 0.45)}" ry="${f(r * 0.2)}" fill="#fff" opacity="${form.limb === DARK_LIMB ? 0.3 : 0.18}"/>`;

  const white = !!form.white;
  const puff = (x, y, r, o = 0.94) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="#fff" opacity="${o}"/>`;
  const bob = (d, amp, b = 0) => `<animateTransform attributeName="transform" type="translate" values="0 0;0 ${-amp};0 0" dur="${d}s" begin="${b}s" repeatCount="indefinite"/>`;
  const fistCloud = white
    ? `<g filter="url(#soft)">${puff(-fistR * 0.6, -fistR * 0.95, fistR * 0.55)}${puff(fistR * 0.1, -fistR * 1.15, fistR * 0.5)}${puff(-fistR * 1.0, 0, fistR * 0.5, 0.9)}${puff(-fistR * 0.6, fistR * 0.95, fistR * 0.55)}${puff(fistR * 0.1, fistR * 1.1, fistR * 0.45, 0.9)}</g>`
    : "";

  // ---------- punching arm ----------
  const zigArm = `<path d="${armD[0][1]}" fill="none" stroke="#000" stroke-width="${f(armH + 2.5)}" stroke-linecap="round" stroke-linejoin="round">${animate("d", armD, dur, { spline: true })}</path>
    <path d="${armD[0][1]}" fill="none" stroke="#1d1f29" stroke-width="${armH}" stroke-linecap="round" stroke-linejoin="round">${animate("d", armD, dur, { spline: true })}</path>
    <path d="${hiD[0][1]}" fill="none" stroke="#7c8199" stroke-opacity="0.55" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 ${f(-armH * 0.24)})">${animate("d", hiD, dur, { spline: true })}</path>`;
  const arm = zg ? zigArm : `<path d="${armD[0][1]}" fill="url(#armG)"${white ? ' stroke="#fff" stroke-opacity="0.65" stroke-width="2"' : form.limb === DARK_LIMB ? ' stroke="#000" stroke-width="1"' : ' stroke="#a8683f" stroke-opacity="0.5" stroke-width="1"'}>
      ${animate("d", armD, dur, { spline: true })}
    </path>
    <path d="${hiD[0][1]}" fill="none" stroke="#fff" stroke-opacity="${form.limb === DARK_LIMB ? 0.35 : 0.3}" stroke-width="2" stroke-linecap="round">
      ${animate("d", hiD, dur, { spline: true })}
    </path>`;
  const ghosts = Math.round(1 + p * 4) + (form.fast ? 4 : 0);
  let trail = "";
  for (let k = ghosts; k >= 1; k--) {
    const dly = k * (form.fast ? 0.012 : 0.022);
    trail += `<g filter="url(#mb)" opacity="${f((form.fast ? 0.5 : 0.34) / Math.sqrt(k))}">
      ${animateT(fistPairs, dur, { spline: true, begin: dly })}
      <g>${animateT(scalePairs, dur, { spline: true, begin: dly, type: "scale" })}
        <ellipse rx="${f(fistR * 1.1)}" ry="${f(fistR * 0.9)}" fill="${form.limb === DARK_LIMB ? "#2a2c38" : white ? "#fff" : "#e8b88f"}"/></g>
    </g>`;
  }
  const mainFist = `<g>
      ${animateT(fistPairs, dur, { spline: true })}
      <g>${animateT(scalePairs, dur, { spline: true, type: "scale" })}
        ${fist(fistR)}
        ${fistCloud}
      </g>
    </g>`;

  // ---------- impact effects ----------
  let fx = "";
  const flashR = f((36 + p * 70) * Math.max(1, S * 0.8));
  const flashPairs = [[0, 0]];
  hitT.forEach((t) => flashPairs.push([t - 0.006 * win, 0], [t, 0.3 + 0.55 * p], [t + 0.07 * win, 0]));
  fx += `<circle cx="${impactX}" cy="${impY}" r="${flashR}" fill="url(#flashG)" opacity="0">${animate("opacity", flashPairs, dur)}</circle>`;
  hitT.forEach((t) => {
    const rings = p > 0.3 ? 2 : 1;
    for (let k = 0; k < rings; k++) {
      const d = k * 0.025;
      const rx = f((26 + p * 55) * (1 + k * 0.45) * Math.max(1, S * 0.6)), ry = f((52 + p * 95) * (1 + k * 0.45) * Math.max(1, S * 0.6));
      fx += `<ellipse cx="${impactX}" cy="${impY}" rx="0" ry="0" fill="none" stroke="#e9f2ff" stroke-width="${f(2.4 - k * 0.8)}" opacity="0">
      ${animate("rx", [[0, 0], [t + d, 0], [t + d + 0.13, rx], [1, rx]], dur)}
      ${animate("ry", [[0, 0], [t + d, 0], [t + d + 0.13, ry], [1, ry]], dur)}
      ${animate("opacity", [[0, 0], [t + d - 0.001, 0], [t + d, 0.75 - k * 0.25], [t + d + 0.13, 0], [1, 0]], dur)}
    </ellipse>`;
    }
  });

  const nStreak = Math.round(5 + p * 16);
  let streaks = "";
  for (let i = 0; i < nStreak; i++) {
    const y = f(50 + R() * 175), x = f(wx(shoulderX) + 60 + R() * Math.max(60, impactX - wx(shoulderX) - 120)), len = f(50 + R() * 140 * (0.5 + p));
    const o = f(0.14 + R() * 0.3 * (0.4 + p));
    const pairs = [[0, 0]];
    hitT.forEach((t) => pairs.push([t - 0.05 * win, 0], [t - 0.01 * win, o], [t + 0.04 * win, 0]));
    streaks += `<line x1="${x}" y1="${y}" x2="${f(x + len)}" y2="${y}" stroke="#dfeaff" stroke-width="${f(0.8 + R() * 1.2)}" stroke-linecap="round" opacity="0">${animate("opacity", pairs, dur)}</line>`;
  }

  const nDust = form.float ? 0 : Math.round(3 + p * 18);
  let dust = "";
  for (let j = 0; j < nDust; j++) {
    const t = hitT[j % hits];
    const x0 = f(70 + R() * 140), dx = f(-(25 + R() * 85)), dy = f(-(8 + R() * 38)), r0 = f(1.2 + R() * 2.2);
    dust += `<circle cx="${x0}" cy="${groundY - 2}" r="${r0}" fill="#9aa4b0" opacity="0">
      ${animate("cx", [[0, x0], [t, x0], [t + 0.28, x0 + dx], [1, x0 + dx]], dur)}
      ${animate("cy", [[0, groundY - 2], [t, groundY - 2], [t + 0.12, groundY - 2 + dy], [t + 0.28, groundY - 2 + dy * 0.4], [1, groundY - 2 + dy * 0.4]], dur)}
      ${animate("r", [[0, r0], [t, r0], [t + 0.28, r0 * 2.6], [1, r0 * 2.6]], dur)}
      ${animate("opacity", [[0, 0], [t, 0.6], [t + 0.28, 0], [1, 0]], dur)}
    </circle>`;
  }

  // steam / flame wisps rising off the body (Gear 2, 3, 4)
  let steam = "";
  if (form.steam) {
    const st = form.steam;
    for (let i = 0; i < st.n; i++) {
      const x = f(62 + R() * 150), y0 = f(100 + R() * 130), sd = f(1.1 + R() * 1.3), r = f(st.size[0] + R() * (st.size[1] - st.size[0]));
      const bg = f(R() * sd);
      const body = st.flame
        ? `<ellipse cx="${x}" cy="${y0}" rx="${f(r * 0.45)}" ry="${f(r * 1.8)}" fill="${st.color}" opacity="0" filter="url(#soft)">`
        : `<circle cx="${x}" cy="${y0}" r="${r}" fill="${st.color}" opacity="0" filter="url(#soft)">`;
      steam += `${body}
        <animate attributeName="cy" values="${y0};${f(y0 - st.rise)}" dur="${sd}s" begin="${bg}s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0;${st.op};0" dur="${sd}s" begin="${bg}s" repeatCount="indefinite"/>
        </${st.flame ? "ellipse" : "circle"}>`;
    }
  }

  // Gear 5 clouds & hair
  let clouds = "", hairExtra = "";
  if (white) {
    hairExtra = `<g fill="${form.hair}">
        <path d="M133 78 Q118 74 112 86 Q124 84 131 92 Z"/>
        <path d="M134 86 Q120 92 118 106 Q130 100 136 98 Z"/>
        <path d="M140 100 Q132 112 134 122 Q142 112 146 104 Z"/>
        <path d="M146 66 Q142 56 150 52 Q150 62 154 68 Z"/>
        <path d="M132 74 Q122 66 124 58 Q134 62 138 72 Z"/>
        ${animateT([[0, "0 0"], [0.5, "-3 2"], [1, "0 0"]], 1.4)}
      </g>`;
    clouds = `<g filter="url(#soft)">${bob(1.8, 3)}${puff(104, 114, 12)}${puff(118, 104, 14)}${puff(134, 100, 13)}${puff(148, 106, 11)}${puff(98, 126, 9, 0.85)}</g>
      <g filter="url(#soft)">${bob(2.3, 2.5, 0.4)}${puff(112, 178, 12)}${puff(128, 174, 12)}${puff(142, 178, 10)}${puff(100, 184, 8, 0.8)}</g>`;
  }
  const mouth = white
    ? `<path d="M157.5 98 Q165 112 173 97 Z" fill="#fff" stroke="#6e2a1b" stroke-width="1"/><path d="M158 100 Q165 103 172.5 99.5" fill="none" stroke="#6e2a1b" stroke-width="0.6"/>`
    : `<rect x="159" y="99" width="11" height="4.2" rx="1.8" fill="#f1f1f1" stroke="#6e2a1b" stroke-width="0.9"/><path d="M159.5 101.1 H169.5" stroke="#6e2a1b" stroke-width="0.7"/>`;
  const auraSvg = form.auraC
    ? `<ellipse cx="125" cy="150" rx="${white ? 110 : 100}" ry="${white ? 135 : 125}" fill="url(#aura)" opacity="0.8">${animate("opacity", [[0, 0.5], [0.5, 1], [1, 0.5]], white ? 2 : 0.8)}</ellipse>`
    : "";

  // Haki tattoo patterns (Gear 4)
  const tattoo = form.tattoo
    ? `<g fill="#07070b" opacity="0.92"${form.fat ? ' transform="translate(-19 0) scale(1.18 1)"' : ""}>
        <path d="M108 112 Q122 124 112 140 Q128 148 116 164 L121 178 L111 178 L108 150 Q116 136 108 124 Z"/>
        <path d="M148 108 Q138 124 144 140 Q134 150 140 166 L142 176 Q150 150 146 138 Q154 124 148 108 Z"/>
        <path d="M126 112 L130 124 L124 128 L132 138 L126 146" fill="none" stroke="#07070b" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M120 150 q8 4 14 -2 M118 160 q9 5 17 -2" fill="none" stroke="#07070b" stroke-width="2.4" stroke-linecap="round"/>
      </g>`
    : "";

  // camera shake
  const A = f(0.5 + p * 4.5);
  const shake = [[0, "0 0"]];
  hitT.forEach((t) => shake.push([t, "0 0"], [t + 0.012 * win, `${A} ${f(-A * 0.5)}`], [t + 0.024 * win, `${-A} ${f(A * 0.5)}`], [t + 0.036 * win, `${f(A * 0.5)} 0`], [t + 0.05 * win, "0 0"]));
  const sp2 = "0.4 0 0.6 1";
  let idleAnim = "", tiltAnim = "", shadowAnim = "";
  let squashOpen = "", squashClose = "";
  if (form.bounce) {
    // Boundman: heavy bouncing ball. Squash on landing, stretch in the air, shadow shrinks with height.
    const bk = "0;0.15;0.5;0.85;1";
    const bs = '0.3 0 0.7 1;0.2 0.6 0.4 1;0.6 0 0.8 0.4;0.3 0 0.7 1';
    idleAnim = `<animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 -13;0 -3;0 0" keyTimes="${bk}" calcMode="spline" keySplines="${bs}" dur="0.8s" repeatCount="indefinite"/>`;
    squashOpen = `<g transform="translate(116 248)"><g><animateTransform attributeName="transform" type="scale" values="1.1 0.9;1 1;0.97 1.03;1 1;1.1 0.9" keyTimes="${bk}" calcMode="spline" keySplines="${bs}" dur="0.8s" repeatCount="indefinite"/><g transform="translate(-116 -248)">`;
    squashClose = "</g></g></g>";
    shadowAnim = `<animate attributeName="rx" values="92;88;66;88;92" keyTimes="${bk}" dur="0.8s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.6;0.5;0.28;0.5;0.6" keyTimes="${bk}" dur="0.8s" repeatCount="indefinite"/>`;
  }
  if (form.jitter) idleAnim = `<animateTransform attributeName="transform" type="translate" values="0 0;-1.3 0.7;1.3 -0.7;-0.8 -0.5;0 0" dur="0.1s" repeatCount="indefinite"/>`;
  if (form.sway && form.inflate) idleAnim = `<animateTransform attributeName="transform" type="translate" values="0 0;0 2.4;0 0" keyTimes="0;0.5;1" calcMode="spline" keySplines="${sp2};${sp2}" dur="1.9s" repeatCount="indefinite"/>`;
  if (form.sway && zg) idleAnim = `<animateTransform attributeName="transform" type="translate" values="0 0;6 0;0 0;-6 0;0 0" keyTimes="0;0.25;0.5;0.75;1" calcMode="spline" keySplines="${sp2};${sp2};${sp2};${sp2}" dur="1.3s" repeatCount="indefinite"/>`;
  if (form.float) {
    // Gear 5 hovers off the ground, bobbing and tilting slowly while it keeps punching
    idleAnim = `<animateTransform attributeName="transform" type="translate" values="0 -14;0 -30;0 -14" keyTimes="0;0.5;1" calcMode="spline" keySplines="${sp2};${sp2}" dur="2.8s" repeatCount="indefinite"/>`;
    tiltAnim = `<animateTransform attributeName="transform" type="rotate" values="-2.2 116 170;2.2 116 170;-2.2 116 170" keyTimes="0;0.5;1" calcMode="spline" keySplines="${sp2};${sp2}" dur="3.6s" repeatCount="indefinite"/>`;
    shadowAnim = `<animate attributeName="rx" values="74;50;74" keyTimes="0;0.5;1" calcMode="spline" keySplines="${sp2};${sp2}" dur="2.8s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.5;0.22;0.5" keyTimes="0;0.5;1" calcMode="spline" keySplines="${sp2};${sp2}" dur="2.8s" repeatCount="indefinite"/>`;
  }
  const glowOp = f(0.1 + 0.25 * p + (white ? 0.15 : 0));

  const vestSvg = form.vest
    ? `<path d="M107 110 L121 109 L120 178 L111 178 Z" fill="url(#vest)"/>
      <path d="M141 107 L148 106 L141 176 L134 176 Z" fill="url(#vest)"/>`
    : "";
  const sashFill = white ? "#f4f7ff" : form.vest ? "#d9c27a" : "#2a0d10";
  const sashLine = white ? "#c3cfe6" : form.vest ? "#a58f4c" : "#000";
  const sash = fat
    ? `<path d="M96 165 L160 163 L159 176 L98 180 Z" fill="${sashFill}"/><path d="M96 170 L160 168" stroke="${sashLine}" stroke-width="1"/>`
    : `<path d="M108 166 L143 164 L142 174 L110 177 Z" fill="${sashFill}"/>
      <path d="M108 170 L143 168" stroke="${sashLine}" stroke-width="1"/>`;
  const torsoD = fat ? "M97 112 Q96 96 118 106 L150 104 Q173 132 161 160 Q156 177 146 181 L104 183 Q89 150 97 112 Z" : "M107 110 L148 106 L141 176 L111 178 Z";
  const shortsD = fat ? "M96 174 L158 172 L170 206 L148 213 L131 199 L114 213 L88 207 Z" : "M108 174 L146 172 L154 202 L140 208 L128 197 L116 210 L98 205 Z";
  const eyeRx = white ? 4.4 : 3.4, eyeRy = white ? 3.4 : 2.1, pupilR = white ? 1.3 : 1.7;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Luffy ${form.name}, ${count} contributions">
  <title>${count} contributions - ${form.name}</title>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#070b14"/><stop offset="0.7" stop-color="#18222f"/><stop offset="1" stop-color="#26303b"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.82" cy="0.45" r="0.6">
      <stop offset="0" stop-color="${form.glow}" stop-opacity="${glowOp}"/><stop offset="1" stop-color="${form.glow}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b232d"/><stop offset="1" stop-color="#0c1117"/></linearGradient>
    <linearGradient id="skin" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${form.skin[0]}"/><stop offset="0.55" stop-color="${form.skin[1]}"/><stop offset="1" stop-color="${form.skin[2]}"/></linearGradient>
    <linearGradient id="armG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${form.limb[0]}"/><stop offset="0.5" stop-color="${form.limb[1]}"/><stop offset="1" stop-color="${form.limb[2]}"/></linearGradient>
    <radialGradient id="fistG" cx="0.35" cy="0.3" r="0.9"><stop offset="0" stop-color="${form.fist[0]}"/><stop offset="1" stop-color="${form.fist[1]}"/></radialGradient>
    <linearGradient id="vest" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7d1613"/><stop offset="1" stop-color="#c22a24"/></linearGradient>
    <linearGradient id="shorts" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${form.shorts[0]}"/><stop offset="1" stop-color="${form.shorts[1]}"/></linearGradient>
    <linearGradient id="straw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1d682"/><stop offset="1" stop-color="#c9a24a"/></linearGradient>
    <radialGradient id="flashG"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="0.35" stop-color="${form.flash}" stop-opacity="0.55"/><stop offset="1" stop-color="${form.glow}" stop-opacity="0"/></radialGradient>
    <radialGradient id="aura"><stop offset="0" stop-color="${form.auraC || "#fff"}" stop-opacity="0.35"/><stop offset="0.6" stop-color="${form.auraC || "#fff"}" stop-opacity="0.15"/><stop offset="1" stop-color="${form.auraC || "#fff"}" stop-opacity="0"/></radialGradient>
    <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.55"/></radialGradient>
    <filter id="mb" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="7 1.2"/></filter>
    <filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.6"/></filter>
  </defs>

  <rect width="${W}" height="${H}" rx="10" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" rx="10" fill="url(#glow)"/>
  <path d="M0 ${groundY - 34} Q200 ${groundY - 46} 420 ${groundY - 30} T900 ${groundY - 38} V${groundY} H0 Z" fill="#101823" opacity="0.8"/>
  <rect y="${groundY}" width="${W}" height="${H - groundY}" fill="url(#gnd)"/>
  <rect y="${groundY}" width="${W}" height="1.5" fill="#3a4654"/>

  <g>
    ${animateT(shake, dur)}
    ${streaks}
    ${dust}

    <g transform="translate(${pivX} ${groundY}) scale(${s}) translate(${-pivX} ${-groundY})">
     <ellipse cx="116" cy="${groundY + 2}" rx="${fat ? 92 : 78}" ry="6" fill="#000" opacity="0.5" filter="url(#soft)">${shadowAnim}</ellipse>
     <g>
      ${idleAnim}
      <g>
      ${tiltAnim}
      ${squashOpen}
      ${auraSvg}
      ${steam}
      <g>
      ${animateT(leanPairs.map(([t, x]) => [t, `${x} 0`]), dur, { spline: true })}

      <!-- back arm, cocked -->
      <path d="M112 116 L88 140 L108 152" fill="none" stroke="url(#armG)" stroke-width="${fat ? 19 : 12}" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="110" cy="153" rx="${fat ? 11 : 8}" ry="${fat ? 10 : 7.5}" fill="url(#fistG)" stroke="${form.fistStroke}" stroke-width="1"/>

      <!-- legs -->
      <path d="M118 196 L90 222 L60 244" fill="none" stroke="${form.legBack}" stroke-width="${fat ? 23 : 14}" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M136 196 L166 218 L170 243" fill="none" stroke="url(#armG)" stroke-width="${fat ? 25 : 15}" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M121 200 L95 224 M139 200 L166 220" fill="none" stroke="#fff" stroke-opacity="0.14" stroke-width="3" stroke-linecap="round"/>
      <path d="M52 249 L82 249 L80 242 L60 240 Z" fill="#3d2a1a"/>
      <path d="M160 249 L190 249 L188 243 L168 241 Z" fill="#3d2a1a"/>

      <!-- shorts -->
      <path d="${shortsD}" fill="url(#shorts)"/>
      <path d="M128 197 L130 175" stroke="#000" stroke-width="1.2" opacity="0.4"/>

      <!-- torso -->
      <path d="${torsoD}" fill="url(#skin)"/>
      ${fat ? '<ellipse cx="146" cy="148" rx="15" ry="24" fill="#fff" opacity="0.09"/><path d="M104 120 Q96 150 106 178" fill="none" stroke="#000" stroke-width="3" opacity="0.18"/>' : ""}
      <path d="M112 118 q10 12 22 2 M110 134 q12 8 26 0" fill="none" stroke="#7a4a30" stroke-width="1.4" opacity="0.45"/>
      <path d="M110 144 q12 6 24 0 M111 156 q12 6 26 0" fill="none" stroke="#7a4a30" stroke-width="1.2" opacity="0.4"/>
      <path d="M118 108 Q130 100 142 106" fill="none" stroke="#7a4a30" stroke-width="1.2" opacity="0.4"/>
      ${vestSvg}
      ${tattoo}
      <path d="M124 122 L138 138 M138 122 L124 138" stroke="${form.tattoo ? "#d9a98a" : white ? "#b98f7a" : "#8c3a2a"}" stroke-width="2" stroke-linecap="round" opacity="0.8"/>
      ${sash}
      ${clouds}

      <!-- neck + head -->
      <path d="M140 92 L158 92 L160 110 L138 110 Z" fill="${form.skin[0]}"/>
      <circle cx="153" cy="86" r="19" fill="url(#skin)"/>
      <path d="M134 80 Q132 94 140 100 L144 88 Z" fill="${form.hair}"/>${hairExtra}
      <ellipse cx="156" cy="80" rx="19" ry="6" fill="#000" opacity="0.28"/>
      <path d="M156 79 L169 83" stroke="#14110f" stroke-width="2.4" stroke-linecap="round"/>
      <ellipse cx="163" cy="86" rx="${eyeRx}" ry="${eyeRy}" fill="#fafafa"/><circle cx="164.4" cy="86" r="${pupilR}" fill="#111"/>
      <path d="M162 91.5 L162 96.5 M160 93 L164 93 M160 95 L164 95" stroke="#8a3b2c" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M171 88 q3 3 0 5.5" fill="none" stroke="#a9704a" stroke-width="1.2"/>
      ${mouth}
      <path d="M146 100 Q154 108 168 104" fill="none" stroke="#000" stroke-width="2" opacity="0.15"/>

      <!-- straw hat -->
      <ellipse cx="153" cy="71" rx="44" ry="8" fill="#7a5a1f"/>
      <ellipse cx="153" cy="69" rx="44" ry="8" fill="url(#straw)"/>
      <path d="M121 68 Q153 28 187 68 Z" fill="url(#straw)"/>
      <path d="M122 66 Q153 55 186 66 L186 60 Q153 47 122 60 Z" fill="${form.band || "#a8241d"}"/>
      <path d="M128 52 Q153 40 178 52 M134 45 Q153 36 172 45" fill="none" stroke="#b08c3a" stroke-width="1" opacity="0.5"/>

      <!-- shoulder + punching arm -->
      <circle cx="${shoulderX - 2}" cy="${armY}" r="${f(Math.min(armH * 0.95, fat ? 19 : 15))}" fill="url(#armG)"/>
      ${arm}
      ${white ? `<g filter="url(#soft)">${bob(1.8, 2)}${puff(shoulderX + 2, armY, armH * 1.05)}${puff(shoulderX - 8, armY - 6, armH * 0.8, 0.85)}</g>` : ""}
      ${trail}
      ${mainFist}
      </g>
      ${squashClose}
      </g>
     </g>
    </g>

    ${fx}
  </g>

  <rect width="${W}" height="${H}" rx="10" fill="url(#vig)" pointer-events="none"/>
  <text x="22" y="${H - 14}" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="13" fill="#8b98a8" letter-spacing="0.5">${count.toLocaleString("en-US")} contributions  ·  ${form.name}</text>
</svg>
`;
}

module.exports = { build, formFor, FORMS, STEP };

if (require.main === module) {
  (async () => {
    const count = await getContributions();
    const out = path.join(__dirname, "dist", "luffy-punch.svg");
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, build(count));
    console.log(`Wrote ${out} (${count} contributions, ${formFor(count).name})`);
  })().catch((e) => { console.error(e); process.exit(1); });
}
