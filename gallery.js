// Builds dist/forms/*.svg and dist/gallery.html — a preview of every form and growth stage.
const fs = require("fs");
const path = require("path");
const { build, formFor } = require("./generate");

const dir = path.join(__dirname, "dist", "forms");
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });

// remove stale demo files from earlier versions
for (const f of fs.readdirSync(path.join(__dirname, "dist"))) if (/^demo-.*\.svg$/.test(f)) fs.unlinkSync(path.join(__dirname, "dist", f));

const stages = [0, 250, 500, 750, 1000, 1500, 1900, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 6500];
const tiles = stages.map((n) => {
  const form = formFor(n);
  fs.writeFileSync(path.join(dir, `${n}.svg`), build(n));
  const unlock = n % 1000 === 0 && n <= 5000;
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
<p>A new form unlocks every 1,000 contributions (green border). Between unlocks, each contribution still adds reach, speed, extra hits, blur, shockwave and debris.</p>
<div class="grid">${tiles.join("\n")}</div>
</body></html>`;
fs.writeFileSync(path.join(__dirname, "dist", "gallery.html"), html);
console.log("gallery written:", stages.length, "stages");
