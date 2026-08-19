# dsh-gdash-parkour

> Biến DeepSeek Harness thành Geometry Dash — nhảy ô vàng trên chính dòng chat của bạn.
> *Turn your chat into a Geometry Dash level — English & Tiếng Việt supported.*



[English](README.en.md) | **Tiếng Việt**



[npm version](https://www.npmjs.com/package/dsh-gdash-parkour)
[License: MIT](LICENSE)
[DSH Plugin](https://github.com/deepseek-ai/deepseek-harness)
[i18n](https://github.com/<you>/dsh-gdash-parkour)

---



### Chơi ngay trên chat

Bạn chat như bình thường — mỗi dòng chat, mỗi bubble, mỗi panel nổi bỗng thành **sàn nhảy**. Điều khiển ô vuông vàng, giãn dòng chat thành bậc thang, kéo block khi kẹt.

*Chat as usual — every message and floating panel becomes a platform. Control the yellow square, expand gaps into stairs, drag blocks when stuck.*

> **Ngôn ngữ / Language:** Plugin tự theo ngôn ngữ DSH của bạn (Settings → Language). Hỗ trợ **Tiếng Việt** và **English** đầy đủ — card trong `Plugins` cũng dịch tự động.

demo

---



## Cài đặt — 1 lệnh

Mở terminal và chạy:

```bash
dsh plugin --profile web add dsh-gdash-parkour@latest
```

Xong restart DSH (`dsh web` lại), mở `http://127.0.0.1:3080`.

> Chưa publish lên npm? Dùng GitHub:
>
> ```bash
> dsh plugin --profile web add github:<you>/dsh-gdash-parkour
> ```

Gỡ:

```bash
dsh plugin --profile web remove dsh-gdash-parkour
```

---



## Bật và chơi

1. Vào **Settings → Plugins → Plugin Configuration** → tìm card **GDash Parkour** → gạt **Bật**.
2. Ô vàng xuất hiện ở góc trái. Chat của bạn giờ là màn chơi.
3. Chơi xong gạt **Tắt** là mọi dòng chat trở lại bình thường.

---



## Điều khiển


| Phím                     | Làm gì                      |
| ------------------------ | --------------------------- |
| **A / D** hoặc **← / →** | Di chuyển trái / phải       |
| **Shift** (giữ)          | Chạy nhanh                  |
| **Space / W / ↑**        | Nhảy — xoay đủ 1 vòng 360°  |
| **P**                    | Pause / Resume              |
| **Kéo viền đỏ**          | Dời block chat khi kẹt      |
| **Kéo ô vàng**           | Dời nhân vật khi kẹt        |
| `⟳` / `↺` trong HUD      | Quét lại sàn / Reset vị trí |


> Đang gõ trong ô chat thì phím game tự nhường — không sợ nhảy lung tung.

---



## Tùy chỉnh trong Settings

Mở **Plugins → GDash Parkour**:

- **Giãn dòng chat** — slider `0 → 80px` (mặc định `32px`). Kéo lên, các dòng tách thành bậc thang kèm hiệu ứng pulse + particle vàng/cam. Nút `0 / 32 / 56` để thử nhanh.
- **Hiện viền đỏ** — bật để thấy collider (kéo để dời), tắt cho gọn.
- **Particles** — bật/tắt hiệu ứng khi nhảy, đáp, giãn dòng.
- **Tinh chỉnh nhảy** — kéo **Lực nhảy** / **Trọng lực** nếu muốn nhảy cao/thấp hơn, có nút **Reset snap** về mặc định (`-10.0 / 0.82`).

Mọi tùy chỉnh lưu tự động.

---



## Mẹo

- Dòng chat mặc định hơi dính nhau — **kéo giãn lên 32-40px** là dễ nhảy nhất.
- Kẹt giữa 2 block? **Kéo viền đỏ** của 1 block ra chỗ khác, hoặc kéo luôn ô vàng qua.
- Muốn sàn thoáng hơn: tắt **Hiện viền đỏ** sau khi đã dời xong.
- Nhảy hụt? Nhảy thấp mặc định đã snap chính xác đáy — chỉ cần chạm mép trên là dính.

---



## FAQ

**Bật rồi mà không thấy giãn?** Gạt Tắt rồi Bật lại trong card, hoặc bấm `⟳ Quét` trong HUD góc phải.

**Ô vàng không xoay đủ vòng?** Đã fix ở v1.1.0 — xoay `15°/frame` đủ 360° mỗi cú nhảy, đáp tự snap về 360°.

**Tab bên trái cũng thành sàn?** Không — plugin đã loại hoàn toàn `left < 285px` và các `header / composer / container` nền.

**Có làm hỏng chat không?** Không. Tắt plugin là mọi `margin` và `transform` của dòng chat được trả về như cũ.

---



## Giấy phép

MIT — dùng thoải mái. [LICENSE](LICENSE)

---

Cho developer — cấu trúc & publish

```
gdash-parkour/
  package.json       # dsh.bundle.patch + dsh.client
  cordis.patch.yml   # bundle patch
  client/client.js   # game + card (window.__ModuleLoader__)
  lib/index.js       # host stub
  patch.dev.yml      # dsh --patch (dev)
```

```bash
# dev không cài
dsh --patch ./gdash-parkour/patch.dev.yml

# publish update
npm version patch
npm publish
dsh plugin --profile web update dsh-gdash-parkour
```

PR welcome!

