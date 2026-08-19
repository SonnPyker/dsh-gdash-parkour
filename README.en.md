# dsh-gdash-parkour — v1.4.0

> Turn **DeepSeek Harness** into **Geometry Dash** — the yellow square now jumps with **enemies, coins, star power-ups, shuffled courses and a high-score**.
> *Biến DeepSeek Harness thành Geometry Dash — giờ có cả enemy, coin, sao xanh và màn random.*

<div align="right">

**English** | [Tiếng Việt](README.md)

</div>

[![npm version](https://img.shields.io/npm/v/dsh-gdash-parkour?color=ffd600)](https://www.npmjs.com/package/dsh-gdash-parkour)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![DSH Plugin](https://img.shields.io/badge/DSH-Plugin-4f7cff)](https://github.com/deepseek-ai/deepseek-harness)
[![i18n](https://img.shields.io/badge/i18n-en%20%7C%20vi-22c55e)](README.md)
[![UI](https://img.shields.io/badge/UI-DSW%20tokens-334155)](https://github.com/deepseek-ai/deepseek-harness)

---

### Play on your chat

Chat as usual — every **bubble / markdown / floating panel** becomes a **platform**. Hold `W` to bunny-hop the `22×22` yellow square, expand gaps into stairs or hit **Shuffle** to re-arrange the whole chat into a random course, collect `●` coins, dodge red patrollers and grab the blue `★`.

*Chat như thường — mỗi dòng chat bỗng thành sàn nhảy. Giữ `W` để nhảy liên tục, nhặt coin, né enemy đỏ, ăn sao xanh bất tử 5s.*

> **Language:** Follows `Settings → Language`. Full **English / Tiếng Việt**, HUD and Settings both translate.

![demo](https://via.placeholder.com/900x420?text=GDash+Parkour+v1.4+Demo)

---

## Features v1.4.0

- **Platforms from real chat** — `getBoundingClientRect()` + leaf dedup (drops containers, keeps bubbles), inset `4px` gap, excludes `left<285px / header / composer`.
- **Tuned physics** — gravity `0.82`, jump `-10`, `coyote 6f`, `jumpBuffer 6f`, sub-step `vy/8`, **nearest-wall/platform** search (no teleport through floors), `15°/frame` spin.
- **Hold to jump** — hold `W / ↑ / Space` keeps buffer → auto-jump on landing.
- **Typing guard** — `isTyping()` (`INPUT/TEXTAREA/contenteditable`) blocks all movement/jump while typing.
- **Gap animation** — slider `0→80px` (default `32`), `gdash-gap-anim` + `gdash-gap-pulse` + yellow particles.
- **Shuffled course** — **Shuffle into platform level** arranges bubbles into `3-6` columns, `gapX`, `baseY 62%vh`, `stepY 88`, jitter, `transform 0.72s cubic-bezier(0.22,1,0.36,1)` + `delay col*26+row*20ms`, button `🎲 Shuffle`.
- **Pacman enemies** — `2` default (`0-6`) `18×18 #ff4d4d`, patrol `vx=1.0*enemySpeed` on its own platform, bounce at edges, `+30` when stomped with star, `-15` + reset + `1.2s` invincibility otherwise.
- **Coins** — `8` default (`0-15`) `12×12 radial #ffd600`, `offX` pinned to platform, `+10`, pop `scale 1.6`.
- **Star power-up** — `16×16 #4f7cff` `★`, `~40%` spawn when enabled, `+25`, `5s` invincibility (HUD `★3s`), glow.
- **High-score + HUD** — pill `top:50%` `Score · High · Coins left`, high-score in `localStorage`, resettable.
- **DSW UI** — all Settings use `var(--dsw-alias-*)` (`bg-layer-3/2`, `border-l1/l2`, `label-primary`, `brand-primary`), toggle `40×22`, range `gdash-range`, card `radius 12`.

---

## Install — 1 command

```bash
dsh plugin --profile web add dsh-gdash-parkour@latest
# restart
dsh web
# open http://127.0.0.1:3080
```

> Not on npm yet?
> ```bash
> dsh plugin --profile web add github:<you>/dsh-gdash-parkour
> # or dev without install:
> dsh --patch ./gdash-parkour/patch.dev.yml
> ```

Uninstall:

```bash
dsh plugin --profile web remove dsh-gdash-parkour
```

---

## Enable & Play

1. Go to **Settings → GDash Parkour** (own entry on the left, `order:20`) — not `Plugins → Plugin list` (that is just `Mounted` inventory).
2. Toggle **Enabled** (blue `brand-primary` when on). Yellow square spawns at `320,120`.
3. Play — collect, dodge. Toggle **Disabled** to restore every `margin/transform`.

---

## Controls

| Key | Action |
|-----|--------|
| **A / D** or **← / →** | Left / right (hold **Shift** = `×1.65` sprint) |
| **W / ↑ / Space (hold)** | Jump — hold to auto-jump on landing, full 360° spin |
| **P / Esc** | Pause / Resume (saved to `state.paused`) |
| **Alt + drag bubble** | Move a platform when stuck (`#ffd600` outline) |
| **Drag yellow square** | Move player (grab → grabbing) |
| Buttons in Settings | `Pause · P` / `Reset position` / `Rescan` / `🎲 Shuffle` |

> When an input is focused, game keys are ignored.

---

## Settings — Settings → GDash Parkour

All auto-save to `localStorage gdash-parkour:state`:

**1. Stats & Highscore**
- `SCORE` / `HIGH` (gold) live, `Reset highscore`.

**2. Quick actions**
- `Pause · P` (primary when running), `Reset position`, `Rescan`.

**3. Chat gap**
- Slider `0→80px` (default `32`), `accent --brand-primary`, quick `0/24/48/64`, hint. Dimmed `0.45` when Shuffle mode is on.

**4. Toggles**
- **Show bounds** — red `rgba(255,60,60,0.07)` borders, hint `Hold Alt and drag`.
- **Particles** — `6×6 #ffd600` on jump/land/gap.
- **Shuffle into platform level** — blue when on, arranges chat into a random course with stagger.

**5. Game objects**
- **Enemies** `0→6` (default `2`) — `spawnGameObjects()` live.
- **Enemy speed** `0.6→2.2` (default `1.0`) — `vx = dir*1.0*speed` live.
- **Coins** `0→15` (default `8`).
- **Power-up ★** toggle.

**6. Jump tuning** (collapsible)
- **Jump force** `-14→-7` step `0.2` (default `-10.0`)
- **Gravity** `0.5→1.2` step `0.02` (default `0.82`)
- `Reset to defaults`.

---

## Game objects & HUD

- **HUD** pill atop overlay `Score · High · Coins left · ★s` on `rgba(18,18,20,0.94)`.
- **Enemy**: patrols its own platform, `y = platform.top-20`, `x += vx`, bounce, `+30` with star else `-15` + reset + `1.2s` invincibility.
- **Coin / Power-up**: `offX = rx - plat.left` pinned, each frame `x = curPlat.left + offX`, `y = curPlat.top -18/20`, synced on scroll/shuffle. Coin `spin 1.4s`, enemy `bob 0.9s`, power `pulse 1s`.

---

## Tips

- Default gap tight → **expand to 32-40px** or hit **Shuffle** for a staircase.
- Stuck? **Alt+drag** a red border or drag the yellow square. Turn **Show bounds** off after.
- Coins hard? Raise `Coins` to 12, lower `Enemies` to 1.
- Want hell? `Enemies 5 + Speed 1.8 + Coins 12`.

---

## FAQ

**Enabled but no gap?** Toggle Off/On in the card or `Rescan`. Spawn is `LEFT_CUTOFF+40,80`. If Shuffle is on, gap is disabled.

**Square doesn't fall / not controllable?** Pre-v1.4 leaf dedup kept the container → fake floor. Fixed v1.4 keeps leaves. Try `Reset position` or `Ctrl+Shift+R`, check `P` pause and that chat input isn't focused.

**Still sprays particles while standing?** Fixed `landed && !wasOnGround`.

**Many texts no collider / empty spots have one?** Loosened to `text 2-8000, children≤22, 80-980×14-800` + `*bubble*/*Markdown*` + leaf dedup.

**Shuffled enemies/coins float off platform?** Now `offX` pinned and synced each frame on `curPlat.left`.

**Does it break chat?** No. Disabling restores every `originalMargins`/`originalTransforms`, removes `gdash-gap-style`.

---

## For developers

```
gdash-parkour/
  package.json       # dsh.bundle.patch + dsh.client | version 1.4.0
  cordis.patch.yml   # - insert: {id: gdash-parkour}
  client/client.js   # game + Settings.section (window.__ModuleLoader__)
  lib/index.js       # host stub
  lib/client.js      # copy
  patch.dev.yml      # dsh --patch (dev)
  src/client.ts      # ref, build to lib/client.js
```

```bash
# dev without install
dsh --patch ./gdash-parkour/patch.dev.yml

# publish
npm version patch # 1.4.0 → 1.4.1
npm publish
dsh plugin --profile web update dsh-gdash-parkour
```

**Storage:** `localStorage` key `gdash-parkour:state` holds `{enabled,gap,showColliders,particles,jump,gravity,speed,paused,randomPlatform,enemyCount,enemySpeed,coinCount,powerupEnabled,powerupRate,highscore}`. `score` is session only.

**Changelog**
- **v1.4.0** — Hold W jump, typing guard, nearest-platform teleport fix, leaf dedup, enemies/coins/star + highscore + HUD, shuffled course with stagger, DSW sectioned UI.
- **v1.3.0** — DSW UI, own `settings.section`, gap pulse, inset `4px`.
- **v1.2.x** — Alt+drag bubble, coyote/jumpBuffer, `left 285px` cutoff.
- **v1.1.0** — `15°/frame` 360° spin.

PRs welcome! [LICENSE](LICENSE)
