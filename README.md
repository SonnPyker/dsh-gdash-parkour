# dsh-gdash-parkour

Geometry Dash Parkour cho **DeepSeek Harness (DSH)** — điều khiển ô vuông vàng nhảy trên chính các dòng chat và UI nổi. Kéo giãn dòng chat thành bậc thang, kéo viền đỏ để dời block khi kẹt, nhảy snap chính xác mặt dưới.

> Plugin folder này sẵn sàng push lên GitHub và cài vào DSH như 1 client plugin với UI trong **Settings → GDash Parkour**.

## ✨ Tính năng

- **Platformer tự do**: `A/D` hoặc `←→` di chuyển, `Shift` chạy nhanh, `Space/W/↑` nhảy thấp và snap chính xác đáy nhân vật lên mép trên collider (coyote 6 frame + jump buffer).
- **Collider chỉ từ chat + UI nổi**: loại bỏ hoàn toàn tab trái (`left < 285px` và `nav/aside/sidebar`), inset collider `2px` ngang / `4px` dọc nên không còn “collider to” che khe hở.
- **Giãn dòng**: slider `0→80px` (mặc định `32px`), CSS `cubic-bezier(0.22,1,0.36,1)` + `pulse` scale, áp dụng chỉ vùng chat phải.
- **Particles & animation**: burst particle vàng/cam khi giãn dòng, khi nhảy và khi đáp đất; toggle trong Settings.
- **Kéo box tránh stuck**: hover viền đỏ → `grab` → kéo để `translate` block gốc; kéo luôn ô vàng để thoát kẹt.
- **Settings riêng**: `Settings → GDash Parkour` có toggle bật/tắt, giãn dòng, lực nhảy, trọng lực, hiện collider, particles. Lưu `localStorage` (`gdash-parkour:state`).
- **Không chết, chỉ pause**: `P` hoặc nút Pause; rơi quá đáy tự respawn.

## 📁 Cấu trúc

```
gdash-parkour/
  package.json          # dsh.bundle.patch + dsh.client
  cordis.patch.yml      # bundle patch (tự load khi dsh plugin add)
  patch.dev.yml         # dev patch (file:./gdash-parkour) cho dsh --patch
  src/client.ts         # source tham khảo
  lib/index.js          # host stub (no-op)
  client/client.js      # client half (game + Settings UI) — window.__ModuleLoader__
  lib/client.js         # copy cũ (giữ tương thích)
  README.md
```

## 🚀 Cài vào DSH

### Cách 1 (khuyên dùng sau khi publish): `dsh plugin --profile web add`

Đây chính là lệnh bạn hỏi — **1 lệnh là xong**, không cần đụng `cordis.patch.yml` thủ công:

```bash
# Cài từ npm (sau khi bạn npm publish)
dsh plugin --profile web add dsh-gdash-parkour

# Cài thẳng từ GitHub (không cần publish)
dsh plugin --profile web add github:<you>/dsh-gdash-parkour

# Cài từ file local (dev)
dsh plugin --profile web add file:./gdash-parkour
# hoặc với đường dẫn tuyệt đối (Windows):
dsh plugin --profile web add file:E:\VibeCodeProjects\DSH\gdash-parkour
```

**Tại sao 1 lệnh này hoạt động?** `dsh plugin` thực chất là `pnpm` forwarder trong thư mục profile (`~/.dsh/profiles/web`):

1. `pnpm add <package>` cài package vào `~/.dsh/profiles/web/node_modules/` và ghi vào `package.json` của profile.
2. Sau khi cài, DSH tự **reconcile** `dsh.profile.bundles`: nếu package có `dsh.bundle.patch` (như plugin này có `"dsh": { "bundle": { "patch": "./cordis.patch.yml" } }`) thì nó được append vào `bundles` → lần boot sau DSH tự load `cordis.patch.yml` của plugin (trong đó `insert: gdash-parkour → dsh-gdash-parkour`), và `dsh.client` trong `package.json` tự load `client/client.js`.
3. Restart DSH là thấy: `http://127.0.0.1:3080` → `Settings ⚙️` → `GDash Parkour`.

Gỡ:

```bash
dsh plugin --profile web remove dsh-gdash-parkour
```

### Cách 2: --patch khi chạy (dev, không cần cài)

```bash
# dùng patch.dev.yml (file:./gdash-parkour)
dsh --patch ./gdash-parkour/patch.dev.yml
# hoặc trỏ thẳng:
dsh --patch E:\VibeCodeProjects\DSH\gdash-parkour\patch.dev.yml
```

### Cách 3: merge thủ công vào profile

Copy `cordis.patch.yml` vào `~/.dsh/profiles/web/cordis.patch.yml` (merge array) rồi restart DSH. Chỉ dùng khi bạn không muốn dùng `dsh plugin add`.

## 🎮 Điều khiển

- `A/D` hoặc `←/→` di chuyển, giữ `Shift` chạy nhanh
- `Space / W / ↑` nhảy (đã thấp hơn: `-10.0`, gravity `0.82`, snap đáy)
- `P` pause, `⟳` quét lại collider, `↺` reset vị trí
- Khi đang gõ trong `input/textarea` thì phím game tạm dừng
- Kéo **viền đỏ** để dời block chat/UI, kéo **ô vàng** để dời nhân vật

## 🔧 Tinh chỉnh trong Settings

- **Giãn dòng**: 0 / 32 / 56 px quick buttons
- **Lực nhảy** `-14 → -7` (mặc định `-10`), **trọng lực** `0.5 → 1.2` (mặc định `0.82`)
- Toggle `Hiện collider` và `Particles`

## 🛠 Dev

Không cần build — `lib/client.js` là plain JS. Sửa trực tiếp và restart DSH hoặc chạy với `dsh --patch`.

Nếu muốn build TS:

```bash
npm run build
```

## 📤 Push lên GitHub

```bash
cd gdash-parkour
git init
git add .
git commit -m "feat: gdash parkour v1 - snap jump, inset collider, particles"
git branch -M main
git remote add origin https://github.com/<you>/dsh-gdash-parkour.git
git push -u origin main
```

## 📝 License

MIT
