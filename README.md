# dsh-gdash-parkour — v1.4.0

> Biến DeepSeek Harness thành **Geometry Dash** — ô vàng nhảy trên chính bubble chat của bạn, giờ có cả **enemy, coin, power-up, màn random và highscore**.
> *Turn your chat into a Geometry Dash level — now with enemies, coins, star power-ups and a shuffled platform course.*

<div align="right">

[English](README.en.md) | **Tiếng Việt**

</div>

[![npm version](https://img.shields.io/npm/v/dsh-gdash-parkour?color=ffd600)](https://www.npmjs.com/package/dsh-gdash-parkour)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![DSH Plugin](https://img.shields.io/badge/DSH-Plugin-4f7cff)](https://github.com/deepseek-ai/deepseek-harness)
[![i18n](https://img.shields.io/badge/i18n-en%20%7C%20vi-22c55e)](README.md)
[![UI](https://img.shields.io/badge/UI-DSW%20tokens-334155)](https://github.com/deepseek-ai/deepseek-harness)

---

### Chơi ngay trên chat

Bạn chat như bình thường — mỗi **bubble / markdown / panel nổi** bỗng thành **sàn nhảy**. Ô vuông vàng `22×22` lướt trên đó, giãn dòng thành bậc thang, giữ `W` để bunny-hop, nhặt coin, né enemy đỏ, ăn sao xanh để bất tử 5s.

*Chat as usual — every message becomes a platform. Hold `W` to keep jumping, collect coins, dodge the red patrollers and grab the blue star.*

> **Ngôn ngữ:** Plugin tự theo `Settings → Language` của DSH. Hỗ trợ **Tiếng Việt / English** đầy đủ, cả HUD và Settings đều dịch.

![demo](https://via.placeholder.com/900x420?text=GDash+Parkour+v1.4+Demo)

---

## Tính năng v1.4.0

- **Platform từ chat thật** — phát hiện `bubble / Markdown / userStack` bằng `getBoundingClientRect()`, giữ **leaves** (bỏ container cha), inset `4px` để có khe hở, loại `left<285px / header / composer`.
- **Vật lý chuẩn** — trọng lực `0.82`, nhảy `-10`, `coyote 6f`, `jumpBuffer 6f`, sub-step `vy/8`, tìm **sàn gần nhất** theo hướng rơi (chống teleport xuyên sàn), xoay `15°/frame` đủ 360°.
- **Giữ để nhảy** — giữ `W / ↑ / Space` là tự nhảy liên tục khi chạm đất.
- **Chặn khi gõ** — `isTyping()` (`INPUT/TEXTAREA/contenteditable`) thì toàn bộ di chuyển/nhảy dừng, tránh vừa chat vừa di chuyển.
- **Gap có animation** — slider `0→80px` (mặc định `32`), class `gdash-gap-anim` + `gdash-gap-pulse` + particle vàng.
- **Màn random** — `Xếp ngẫu nhiên thành màn chơi` xếp bubble thành lưới `3-6 cột`, `gapX`, `baseY 62%vh`, `stepY 88`, jitter, `transition 0.72s cubic-bezier(0.22,1,0.36,1)` + `delay col*26+row*20ms`, nút `🎲 Xáo trộn lại` shuffle thứ tự.
- **Enemy pacman** — `2` mặc định (`0-6`) `18×18 #ff4d4d`, tuần tra `vx=1.0*enemySpeed` trên chính platform, đổi chiều ở mép, ăn khi có sao thì `+30` và nổ hạt đỏ.
- **Coin** — `8` mặc định (`0-15`) `12×12 radial #ffd600`, `offX` bám platform, ăn `+10`, `scale 1.6 → opacity 0`.
- **Power-up ★** — `16×16 #4f7cff` sao xanh, spawn `~40%` khi bật, ăn `+25`, bất tử `5s` (HUD hiện `★3s`), glow `boxShadow 3px #4f7cff`.
- **Highscore + HUD** — HUD `top:50%` pill `Score X · High Y · Coins left Z` bám overlay, highscore lưu `localStorage STORAGE_KEY`, reset được.
- **UI DSW** — toàn bộ Settings dùng `var(--dsw-alias-*)` (`bg-layer-3/layer-2`, `border-l1/l2`, `label-primary/secondary/tertiary`, `brand-primary`), toggle `40×22`, range `gdash-range`, card `radius 12`, section `radius 10`.

---

## Cài đặt — 1 lệnh

```bash
dsh plugin --profile web add dsh-gdash-parkour@latest
# restart
dsh web
# mở http://127.0.0.1:3080
```

> Chưa lên npm? Dùng local/GitHub:
> ```bash
> dsh plugin --profile web add github:<you>/dsh-gdash-parkour
> # hoặc test không cài:
> dsh --patch ./gdash-parkour/patch.dev.yml
> ```

Gỡ:

```bash
dsh plugin --profile web remove dsh-gdash-parkour
```

---

## Bật & chơi

1. Vào **Settings → GDash Parkour** (mục riêng bên trái, `order:20`) — không phải `Plugins → Plugin list` (cái đó chỉ là inventory `Mounted`).
2. Gạt **Đang bật** (toggle `40×22` xanh `brand-primary`). Ô vàng xuất hiện `320,120`.
3. Chơi, nhặt coin, né enemy. Tắt là mọi `margin/transform` trả về như cũ.

---

## Điều khiển

| Phím | Hành động |
|------|-----------|
| **A / D** hoặc **← / →** | Trái / phải (Shift giữ = chạy `×1.65`) |
| **W / ↑ / Space (giữ)** | Nhảy — giữ là tự nhảy liên tục khi đáp, xoay 360° |
| **P / Esc** | Pause / Resume (lưu `state.paused`) |
| **Alt + kéo bubble** | Dời platform khi kẹt (outline `#ffd600`, `z-index 9999`) |
| **Kéo ô vàng** | Dời player (grab → grabbing) |
| Nút trong Settings | `Tạm dừng · P` / `Đặt lại vị trí` / `Quét lại` / `🎲 Xáo trộn lại` |

> Đang focus `input/textarea/contenteditable` thì toàn bộ phím game tự nhường.

---

## Tùy chỉnh trong Settings → GDash Parkour

Mở **Settings → GDash Parkour** — tất cả lưu `localStorage gdash-parkour:state`, auto-save:

**1. Stats & Highscore**
- Ô `SCORE` / `HIGH` (vàng) live, nút `Reset highscore`.

**2. Điều khiển nhanh**
- `Tạm dừng · P` (primary khi chạy), `Đặt lại vị trí`, `Quét lại`.

**3. Giãn dòng chat**
- Slider `0→80px` (mặc định `32`), `accent --brand-primary`, nút `0/24/48/64`, hint `Tăng khoảng cách...`. Tự tắt (mờ `0.45`) khi bật Random Platform.

**4. Toggles**
- **Hiện khung** — viền đỏ `rgba(255,60,60,0.07)` + `pointer-events:none`, hint `Giữ Alt và kéo bubble`.
- **Hiệu ứng hạt** — particle `6×6 #ffd600` khi nhảy/đáp/giãn.
- **Xếp ngẫu nhiên thành màn chơi** — toggle xanh, bật là `arrangeRandomPlatforms()` với stagger delay, tắt là `restoreRandomPlatforms()` trả về `originalTransforms`.

**5. Game objects**
- **Enemies** `0→6` (mặc định `2`) — đổi là `spawnGameObjects()` ngay.
- **Enemy speed** `0.6→2.2` (mặc định `1.0`) — `vx = dir*1.0*speed`, update live.
- **Coins** `0→15` (mặc định `8`).
- **Power-up ★** toggle — spawn sao xanh, rate `0.15+0.25`.

**6. Tinh chỉnh nhảy** (collapsible)
- **Lực nhảy** `-14→-7` step `0.2` (mặc định `-10.0`)
- **Trọng lực** `0.5→1.2` step `0.02` (mặc định `0.82`)
- Nút `Về mặc định`.

Mọi thay đổi `emit() → saveState()` ngay.

---

## Game objects & HUD

- **HUD** pill trên overlay `top:10px left:50%` `Score · High · Coins left · ★s` nền `rgba(18,18,20,0.94)` viền `border-l1`.
- **Enemy**: tuần tra trên đúng `collider.right-left`, `y = platform.top-20`, đổi chiều ở mép. Chạm khi không sao → `-15` (không âm), `resetPlayer()` + bất tử `1.2s`; khi có sao → enemy nổ `scale 0`, `+30`.
- **Coin / Power-up**: `offX` lưu theo `platform.left`, mỗi frame sync `x = curPlat.left + offX` (theo scroll/shuffle), `y = curPlat.top -18/20`. Coin `spin 1.4s`, enemy `bob 0.9s`, power `pulse 1s`.

---

## Mẹo

- Dòng mặc định dính → **giãn 32-40px** hoặc bật **Random Platform** rồi `Xáo trộn lại` để có màn staircase đẹp.
- Kẹt giữa 2 block? **Alt+kéo viền đỏ** hoặc kéo luôn ô vàng. Tắt `Hiện khung` cho gọn sau khi xếp.
- Coin khó lấy? Tăng `Coin` lên 12, giảm `Enemies` xuống 1.
- Muốn khó? `Enemies 5 + Enemy speed 1.8 + Coin 12` là màn hell.

---

## FAQ

**Bật rồi không thấy gì?** Kiểm tra `Settings → GDash Parkour → Đang bật`, rồi `Quét lại`. Ô vàng spawn `LEFT_CUTOFF+40,80`. Nếu vẫn không, tắt `Xếp ngẫu nhiên` rồi `Quét lại` (random có thể đẩy bubble ra ngoài viewport).

**Ô vàng không rơi / không điều khiển?** Do trước v1.3 dedup giữ container cha → sàn ảo đè spawn. Đã fix v1.4 giữ leaves. Nếu còn, `Reset vị trí` hoặc `Ctrl+Shift+R` hard refresh, kiểm tra `P` có đang pause không, và không focus vào ô chat (isTyping chặn).

**Box vừa đứng đã phun hạt?** Đã fix `landed && !wasOnGround` — chỉ khi vừa tiếp đất mới phun.

**Nhiều text không có collider / chỗ trống lại có?** Đã nới `text 2-8000, children≤22, width 80-980, height 14-800` + nhận diện `bubble/Markdown/userStack` + dedup giữ leaves.

**Random xong enemy/coin không trên sàn?** Có, `spawnGameObjects()` luôn chọn `colliders.filter(c.el!=null)` và `offX` bám `platform.left`, mỗi frame sync khi platform di chuyển.

**Có hỏng chat không?** Không. Tắt plugin → `originalMargins` + `originalTransforms` trả hết, `gdash-gap-style` và `gdash-parkour-global` bị xóa.

---

## Cho developer

```
gdash-parkour/
  package.json       # dsh.bundle.patch + dsh.client | version 1.4.0
  cordis.patch.yml   # - insert: {id: gdash-parkour}
  client/client.js   # game + Settings.section (window.__ModuleLoader__)
  lib/index.js       # host stub (no-op)
  lib/client.js      # copy của client/client.js
  patch.dev.yml      # dsh --patch (dev)
  src/client.ts      # tham khảo, build ra lib/client.js
```

```bash
# dev không cài — load thẳng workspace
dsh --patch ./gdash-parkour/patch.dev.yml
# hoặc dsh web với --patch flag

# publish
npm version patch # 1.4.0 → 1.4.1
npm publish
dsh plugin --profile web update dsh-gdash-parkour
```

**Lưu trữ:** `localStorage` key `gdash-parkour:state` chứa `{enabled,gap,showColliders,particles,jump,gravity,speed,paused,randomPlatform,enemyCount,enemySpeed,coinCount,powerupEnabled,powerupRate,highscore}`. `score` là session, reset khi `destroyOverlay()`.

**Changelog**
- **v1.4.0** — Hold W nhảy, chặn input khi gõ, fix teleport (nearest wall/platform), leaf dedup + nới filter, enemy/coin/power-up + highscore + HUD, Random Platform với stagger animation, UI DSW chia khu vực.
- **v1.3.0** — DSW UI, `settings.section` riêng, gap pulse, particle, inset collider `4px`.
- **v1.2.x** — Alt+drag bubble, coyote/jumpBuffer, left-cutoff `285px`.
- **v1.1.0** — Xoay `15°/frame` đủ 360°.

PR welcome! [LICENSE](LICENSE)
