# Luffy Contribution Punch

An animated SVG for your GitHub profile. Luffy throws a Gum-Gum Pistol, and **your contributions power him up**.

- Every contribution adds a little more reach, speed, extra hits, motion blur, shockwave, dust and screen shake.
- Every **STEP contributions** unlocks the next form. `STEP` defaults to **250**, so Gear 5 is at 1,250 contributions a year (about 3.4 a day). You can change the pace, see [Choose your pace](#choose-your-pace).

| Form | Unlocks at | With the default `STEP=250` |
|---|---|---|
| Gear 1 | 0 | 0 |
| Gear 2 | 1 × STEP | 250 |
| Gear 3 | 2 × STEP | 500 |
| Gear 4 · Boundman | 3 × STEP | 750 |
| Gear 4 · Snakeman | 4 × STEP | 1,000 |
| Gear 5 | 5 × STEP | 1,250 |

Each form also moves differently:

| Form | Signature motion |
|---|---|
| Gear 1 | Classic Gum-Gum Pistol: wind-up, stretch, snap back |
| Gear 2 | Blindingly fast flurry of punches with heavy blur afterimages and a vibrating, steaming body |
| Gear 3 | The arm inflates as it stretches, ending in a bigger fist; slow and heavy |
| Gear 4 · Boundman | Bigger, fat and heavy; bounces up and down like a ball (squashing on landing, stretching in the air) with a black Haki arm |
| Gear 4 · Snakeman | The arm whips out in a zigzag, and he sways |
| Gear 5 | Floats off the ground, bobbing and tilting, while still punching in gear 5 form |

## Showcase

<table>
<tr>
<td align="center"><img src="dist/forms/showcase-gear1.svg" width="440" alt="Gear 1"/><br/><b>Gear 1</b></td>
<td align="center"><img src="dist/forms/showcase-gear2.svg" width="440" alt="Gear 2"/><br/><b>Gear 2</b></td>
</tr>
<tr>
<td align="center"><img src="dist/forms/showcase-gear3.svg" width="440" alt="Gear 3"/><br/><b>Gear 3</b></td>
<td align="center"><img src="dist/forms/showcase-boundman.svg" width="440" alt="Gear 4 Boundman"/><br/><b>Gear 4 · Boundman</b></td>
</tr>
<tr>
<td align="center"><img src="dist/forms/showcase-snakeman.svg" width="440" alt="Gear 4 Snakeman"/><br/><b>Gear 4 · Snakeman</b></td>
<td align="center"><img src="dist/forms/showcase-gear5.svg" width="440" alt="Gear 5"/><br/><b>Gear 5</b></td>
</tr>
</table>

Download the repo and open `dist/gallery.html` to preview every stage.

## Use it on your profile

1. **Fork** this repo (or use it as a template). If you want it on your profile page, add the image to your special profile repo, the one named exactly like your GitHub username.
2. **Enable Actions in your fork.** GitHub turns off workflows, including scheduled ones, in forks until you enable them (Actions tab → *I understand my workflows, go ahead and enable them*).
3. Go to **Actions → Generate Luffy punch → Run workflow**. It reads *your* contribution count (the repo owner's) and commits `dist/luffy-punch.svg`. It then re-runs daily.
4. Add this to your profile `README.md` (replace `YOU` and `REPO`):

   ```md
   ![Luffy](https://raw.githubusercontent.com/YOU/REPO/main/dist/luffy-punch.svg)
   ```

Private contributions are only counted if you enable *Include private contributions* in your profile contribution settings. The count covers the last 12 months, so a form can drop back if your activity slows down.

### Keep-alive

GitHub disables scheduled workflows in a repo after 60 days with no activity. The workflow guards against that: if the newest commit is older than 30 days, it adds an empty `chore: keep scheduled workflow alive` commit, so the daily schedule keeps running even when your count doesn't change.

## Choose your pace

`STEP` is the number of contributions per gear. Pick one you can realistically reach:

| `STEP` | Gear 5 at | Good for |
|---|---|---|
| 150 | 750 / year | casual contributors |
| **250** (default) | 1,250 / year | most developers |
| 500 | 2,500 / year | very active contributors |
| 1000 | 5,000 / year | hardcore |

In your fork set it as a repository variable: **Settings → Secrets and variables → Actions → Variables → New repository variable**, name `STEP`. Locally, use `STEP=500 node generate.js 800`.

## Run locally

```bash
node generate.js 800       # any number, writes dist/luffy-punch.svg
node gallery.js            # rebuilds dist/gallery.html and dist/forms/*.svg
GITHUB_TOKEN=... GITHUB_USER=you node generate.js   # real data
STEP=500 node gallery.js   # preview a different pace
```

Requires Node 18+. No dependencies.

## Tuning

- `STEP` (env, default `250`): contributions per gear.
- `GOAL` (env, defaults to `STEP`): how fast raw power (reach, speed, hits) rises.
- Form looks and motions live in the `FORMS` table at the top of `generate.js`.

## Credits

All artwork is original, hand-built vector drawing inspired by the *One Piece* character Monkey D. Luffy. *One Piece* and its characters belong to Eiichiro Oda / Shueisha / Toei Animation. This is an unofficial fan project and is not affiliated with or endorsed by them.
