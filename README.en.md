# dsh-gdash-parkour

> Turn DeepSeek Harness into Geometry Dash — jump the yellow square on your own chat.

<div align="right">

**English** | [Tiếng Việt](README.md)

</div>

[![npm version](https://img.shields.io/npm/v/dsh-gdash-parkour?color=ffd600)](https://www.npmjs.com/package/dsh-gdash-parkour)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![DSH Plugin](https://img.shields.io/badge/DSH-Plugin-blue)](https://github.com/deepseek-ai/deepseek-harness)
[![i18n](https://img.shields.io/badge/i18n-en%20%7C%20vi-green)](https://github.com/<you>/dsh-gdash-parkour)

---

### Play on your chat

Chat as usual — every message, bubble, and floating panel becomes a **platform**. Control the yellow square, expand chat gaps into stairs, drag blocks when stuck.

![demo](https://via.placeholder.com/800x400?text=GDash+Parkour+Demo)

> **Language:** The plugin follows your DSH language (Settings → Language). Fully supports **English** and **Tiếng Việt** — the card in `Plugins` translates automatically.

---

## Install — 1 command

Open a terminal and run:

```bash
dsh plugin --profile web add dsh-gdash-parkour
```

Then restart DSH (`dsh web` again) and open `http://127.0.0.1:3080`.

> Not published to npm yet? Use GitHub:
> ```bash
> dsh plugin --profile web add github:<you>/dsh-gdash-parkour
> ```

Uninstall:

```bash
dsh plugin --profile web remove dsh-gdash-parkour
```

---

## Enable & Play

1. Go to **Settings → Plugins → Plugin Configuration** → find card **GDash Parkour** → toggle **On**.
2. The yellow square appears at the top-left. Your chat is now the level.
3. Toggle **Off** when done — all chat margins return to normal.

---

## Controls

| Key | Action |
|-----|--------|
| **A / D** or **← / →** | Move left / right |
| **Shift** (hold) | Run faster |
| **Space / W / ↑** | Jump — full 360° spin |
| **P** | Pause / Resume |
| **Drag red border** | Move a chat block when stuck (hold Alt) |
| **Drag yellow square** | Move the player when stuck |
| `Rescan` / `Reset` in card | Rescan colliders / Reset position |

> When typing in an input/textarea, game keys are ignored.

---

## Settings

Open **Plugins → GDash Parkour**:

- **Chat gap** — slider `0 → 80px` (default `0`, try `32px`). Gaps become stairs with pulse + yellow/orange particles. Quick buttons `0 / 24 / 48`.
- **Show colliders** — show red borders (hold Alt to drag), off for clean view.
- **Particles** — toggle effects on jump, land, and gap expand.
- **Jump tuning** — drag **Jump force** / **Gravity**, button **Reset snap defaults** (`-10.0 / 0.82`).

All settings auto-save to `localStorage`.

---

## Tips

- Default chat is tight — **expand to 24-32px** for easiest jumps.
- Stuck between 2 blocks? **Hold Alt and drag** one block elsewhere, or drag the yellow square.
- Want cleaner platforms? Turn **Show colliders** off after arranging.
- Jump feels precise — low jump with snap, just touch the top edge to stick.

---

## FAQ

**Enabled but no gap?** Toggle Off then On in the card, or hit `Rescan` in the card.

**Yellow square doesn't spin full circle?** Fixed in v1.2.1 — `15°/frame` = 360° per jump, snaps to 360° on land.

**Left tab also becomes platform?** No — plugin excludes `left < 285px` and `header / composer / container` backgrounds entirely.

**Does it break chat?** No. Disabling restores every `margin` and `transform`.

---

## License

MIT — do what you want. [LICENSE](LICENSE)

---

<details>
<summary>For developers — structure & publish</summary>

```
gdash-parkour/
  package.json       # dsh.bundle.patch + dsh.client
  cordis.patch.yml   # bundle patch
  client/client.js   # game + card (window.__ModuleLoader__)
  lib/index.js       # host stub
  patch.dev.yml      # dsh --patch (dev)
```

```bash
# dev without install
dsh --patch ./gdash-parkour/patch.dev.yml

# publish update
npm version patch
npm publish
dsh plugin --profile web update dsh-gdash-parkour
```

PRs welcome!

</details>
