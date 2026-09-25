# GunRanking Ballistics Calculator

The site loads the single-file bundle `deploy/tools/ballistics-calculator.html`, built from this folder. Images used by the JSX are inlined in `assets/images.js` (window.GR_TOOL_IMG) so the bundle carries them; regenerate that file if you change an image.

# Ballistic Range Game

A browser-based ballistic calculator + precision-rifle holdover game.
Build your rig (caliber → load → barrel → zero → optic), study your dope,
then shoot a 10-station course from memory — reading live wind — and post
your score to a monthly global leaderboard.

Everything is static HTML/JS: the 3-DOF solver runs entirely in the browser.
No build step, no server — the only backend is a single Supabase table for
the leaderboard (optional).

## Files

```
index.html              the whole app (rename of "Ballistic Calculator.html")
app.jsx                 app shell, modes, state
components/             UI: game, charts, reticle, inputs, hero compare
engine/                 solver, drag tables, Excel export, leaderboard client
data/                   cartridge + factory-load library
config.js               <-- paste your Supabase keys here
supabase/schema.sql     <-- run once in Supabase to create the scores table
mobile.css              responsive styles
assets/                 logo
```

## Launch checklist

### 1. Put it on GitHub Pages
1. Create a new GitHub repo and copy this project in
   (you can skip `screenshots/` and `uploads/` — they're working files).
2. Rename **`Ballistic Calculator.html` → `index.html`**.
3. Repo → Settings → Pages → Source: *Deploy from a branch* → `main` / root.
4. Your game is live at `https://<you>.github.io/<repo>/`.

Without any further setup the game is fully playable — scores just stay
on each player's device.

### 2. Turn on the global leaderboard (Supabase, free tier)
1. Create a project at [supabase.com](https://supabase.com) (free).
2. In the dashboard: **SQL Editor → New query** → paste the contents of
   `supabase/schema.sql` → **Run**. That creates the `scores` table with
   open read/insert policies (this is a casual game — no auth needed).
3. **Settings → API** → copy the **Project URL** and the **anon public** key.
4. Paste both into `config.js`:
   ```js
   window.APP_CONFIG = {
     SUPABASE_URL: "https://yourproject.supabase.co",
     SUPABASE_ANON_KEY: "eyJ..."
   };
   ```
   The anon key is designed to be public — safe to commit.
5. Push. Done. The results screen now shows the **global monthly top 10**
   and **your rank of all shooters**, and falls back to the device-local
   board automatically if the network is down.

### 3. Player capture + Admin export (America 250 promo)
The "Test Your Setup" tab opens on a gate that captures **name + email**
(with a default-on marketing opt-in) before play. Players are upserted by
email into a `leads` table so you can contact the **Top 5** winners.

1. The updated `supabase/schema.sql` also creates the `leads` table — re-run
   it (or just the second block) in the SQL Editor.
2. Set your **Admin PIN** and contact email in `config.js`:
   ```js
   ADMIN_PIN: "grabagun250",          // change before launch
   ADMIN_EMAIL: "marketing@grabagun.com"
   ```
3. Footer → **Admin** → enter the PIN → view every captured player and
   **Download CSV** (all players, or marketing opt-ins only). The CSV opens
   in Excel / Google Sheets; an "Email list to us" button composes a mail to
   `ADMIN_EMAIL` with the list inlined.

> ⚠️ The anon key can read the `leads` table, so treat captured emails as
> effectively public and the Admin PIN as convenience-only (not real access
> control). For true privacy, move reads behind a Postgres function / Edge
> Function backed by the service-role key.

## How the leaderboard works

- One table: `scores (name, score, hits, month, caliber, created_at)`.
- Seasons are monthly — the board keys on `month` (`YYYY-MM`), so it
  resets automatically on the 1st with full history kept.
- The client talks to Supabase's REST API directly (`engine/leaderboard.js`,
  ~60 lines, no SDK). Rank = count of strictly better scores this month + 1.
- Max possible score is 1300 (10 × 100 ring points + 300 time bonus);
  the table CHECK constraints reject anything outside valid bounds.
- No anti-cheat by design — it's for fun. If it ever takes off, the upgrade
  path is: submit the shot log instead of the score and re-score it in a
  Supabase Edge Function with the same solver.

## Local development

It's all static files — serve the folder with anything
(`python3 -m http.server`) and open `index.html`. Opening the file
directly with `file://` won't work because the JSX components are
fetched at runtime.
