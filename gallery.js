// Builds dist/forms/*.svg and dist/gallery.html — a preview of every form and growth stage.
// Stages are expressed in multiples of STEP, so the preview matches whatever pace you configure.
const fs = require("fs");
const path = require("path");
const { build, formFor, STEP } = require("./generate");

const dir = path.join(__dirname, "dist", "forms");
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });

// remove stale demo files from earlier versions
for (const f of fs.readdirSync(path.join(__dirname, "dist"))) if (/^demo-.*\.svg$/.test(f)) fs.unlinkSync(path.join(__dirname, "dist", f));

// stable-named files used by the README showcase
const showcase = { "showcase-gear1": 0, "showcase-gear2": 1.9, "showcase-gear3": 2.5, "showcase-boundman": 3, "showcase-snakeman": 4, "showcase-gear5": 5 };
for (const [name, mult] of Object.entries(showcase)) fs.writeFileSync(path.join(dir, `${name}.svg`), build(Math.round(mult * STEP)));

const mults = [0, 0.25, 0.5, 0.75, 1, 1.5, 1.9, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6.5];
const stages = [...new Set(mults.map((m) => Math.round(m * STEP)))];
const tiles = stages.map((n) => {
  const form = formFor(n);
  fs.writeFileSync(path.join(dir, `${n}.svg`), build(n));
  const unlock = n === form.min;
  return `<figure class="${unlock ? "unlock" : ""}"><img src="forms/${n}.svg" alt="${form.name} at ${n}"/>
    <figcaption><b>${n.toLocaleString("en-US")}</b> contributions <span>${form.name}${unlock ? " — unlocked" : ""}</span></figcaption></figure>`;
});

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Luffy Contribution Forms</title>
<style>
  :root{color-scheme:dark;--bg:#0d1117;--card:#161b22;--line:#30363d;--fg:#e6edf3;--mute:#8b98a8;--hi:#39d353}
  body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,Segoe UI,sans-serif;padding:28px 16px}
  h1{margin:0 0 4px;font-size:24px} p{color:var(--mute);margin:0 0 22px;max-width:70ch}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(420px,1fr));gap:16px}
  figure{margin:0;background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden}
  figure.unlock{border-color:var(--hi)}
  img{display:block;width:100%;height:auto}
  figcaption{padding:10px 14px;display:flex;justify-content:space-between;gap:8px;color:var(--mute);font-size:13px}
  figcaption b{color:var(--fg)} figcaption span{color:var(--fg)}
  @media(max-width:480px){.grid{grid-template-columns:1fr}}
</style></head><body>
<h1>Luffy — every form, every stage</h1>
<p>A new form unlocks every ${STEP.toLocaleString("en-US")} contributions (green border). Between unlocks, each contribution still adds reach, speed, extra hits, blur, shockwave and debris.</p>
<div class="grid">${tiles.join("\n")}</div>
</body></html>`;
fs.writeFileSync(path.join(__dirname, "dist", "gallery.html"), html);
console.log(`gallery written: ${stages.length} stages + ${Object.keys(showcase).length} showcase files (STEP=${STEP})`);
