window.__ModuleLoader__.load({
  id: "dsh-gdash-parkour",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    let React;
    try { React = require("react"); } catch (e) { React = globalThis.React || window.React; }
    if (!React || !React.createElement) {
      try { React = require("@deepseek-ai/cordis"); } catch (e) {}
    }

    const STORAGE_KEY = "gdash-parkour:state";
    const LEFT_CUTOFF = 285;
    const DEFAULTS = {
      enabled: true,
      gap: 32,
      showColliders: true,
      particles: true,
      jump: -10.0,
      gravity: 0.82,
      speed: 3.8
    };

    function loadState() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return Object.assign({}, DEFAULTS, JSON.parse(raw));
      } catch (e) {}
      return Object.assign({}, DEFAULTS);
    }
    function saveState(s) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {}
    }

    exports.inject = ["timer"];
    exports.apply = function(ctx) {
      if (typeof document === "undefined" || typeof window === "undefined") return;
      const state = loadState();
      let listeners = [];
      function emit() { listeners.forEach(fn => fn(Object.assign({}, state))); saveState(state); }
      function subscribe(fn) { listeners.push(fn); return () => { listeners = listeners.filter(x => x !== fn); }; }

      const globalStyle = document.createElement("style");
      globalStyle.id = "gdash-parkour-global";
      globalStyle.textContent = `
        @keyframes gdash-particle {
          0% { transform: translate(0,0) scale(1) rotate(0deg); opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)) scale(0) rotate(180deg); opacity: 0; }
        }
        @keyframes gdash-gap-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.015); }
          100% { transform: scale(1); }
        }
        .gdash-gap-anim {
          transition: margin-bottom 0.45s cubic-bezier(0.22,1,0.36,1), transform 0.45s cubic-bezier(0.22,1,0.36,1) !important;
          animation: gdash-gap-pulse 0.45s ease;
        }
        .gdash-particle {
          position: absolute;
          width: 6px; height: 6px;
          background: #ffd600;
          border: 1px solid #111;
          border-radius: 1px;
          pointer-events: none;
          will-change: transform, opacity;
          animation: gdash-particle 0.6s ease-out forwards;
        }
      `;
      if (!document.getElementById("gdash-parkour-global")) document.head.appendChild(globalStyle);

      // Locale — vi + en
      const NS = "gdash-parkour";
      const dicts = {
        en: {
          title: "GDash Parkour",
          subtitle: "Geometry Dash on your chat — v1.1.0",
          enabledOn: "On",
          enabledOff: "Off",
          desc: "Control the yellow square jumping on your chat lines. Expand gaps to make platforms, drag red borders when stuck. No death — just pause.",
          gap: "Chat gap",
          gapHint: "Default 32px, collider shrunk for real gaps. Pulse + particles when expanding.",
          showColliders: "Show red border (drag to move)",
          particles: "Particles",
          jumpTuning: "Jump tuning (snap)",
          jumpForce: "Jump force",
          gravity: "Gravity",
          resetSnap: "Reset snap defaults",
          tip: "Tip: Drag red border to move blocks, drag yellow square to escape. Box rotates 360° per jump."
        },
        vi: {
          title: "GDash Parkour",
          subtitle: "Geometry Dash trên dòng chat — v1.1.0",
          enabledOn: "Bật",
          enabledOff: "Tắt",
          desc: "Điều khiển ô vàng nhảy trên chính các dòng chat. Kéo giãn dòng để tạo bậc thang, kéo viền đỏ để dời block khi kẹt. Không chết — chỉ pause.",
          gap: "Giãn dòng chat",
          gapHint: "Mặc định 32px, collider đã thu nhỏ để có khe hở. Có pulse + particle khi giãn.",
          showColliders: "Hiện viền đỏ (kéo để dời)",
          particles: "Particles",
          jumpTuning: "Tinh chỉnh nhảy (snap)",
          jumpForce: "Lực nhảy",
          gravity: "Trọng lực",
          resetSnap: "Reset snap defaults",
          tip: "Mẹo: Kéo viền đỏ để dời block, kéo ô vàng để thoát kẹt. Box xoay đủ 360° mỗi cú nhảy."
        }
      };
      const localeSvc = ctx.get("locale");
      if (localeSvc) ctx.effect(() => localeSvc.register(NS, dicts), "gdash-parkour: locale");
      const t = (() => {
        try { return (localeSvc && localeSvc.bind(NS)) || ((k) => dicts.vi[k] || k); } catch (e) { return (k) => (dicts.vi[k] || dicts.en[k] || k); }
      })();

      // Settings UI — card trong Plugins → Plugin Configuration (settings.plugin.item)
      ctx.inject(["settingsScope"], (scoped) => {
        if (!scoped || !scoped.slots) return;
        scoped.slots.inject("settings.plugin.item", () => scoped.slots.register({
          name: "settings.plugin.item",
          key: "gdash-parkour"
        }, () => {
          function SettingsCard() {
            const [s, setS] = React.useState(() => Object.assign({}, state));
            React.useEffect(() => subscribe(setS), []);
            const upd = (patch) => { Object.assign(state, patch); emit(); setS(Object.assign({}, state)); };

            return React.createElement("div", { style: { border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "14px", background: "rgba(255,255,255,0.03)", display: "flex", flexDirection: "column", gap: "12px" } },
              React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px" } },
                React.createElement("div", { style: { width: "36px", height: "36px", borderRadius: "8px", background: "#ffd600", border: "2px solid #111", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#111" } }, "⬜"),
                React.createElement("div", { style: { flex: 1 } },
                  React.createElement("div", { style: { fontWeight: 700 } }, t("title")),
                  React.createElement("div", { style: { fontSize: "12px", opacity: 0.6 } }, t("subtitle"))
                ),
                React.createElement("label", { style: { display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", background: s.enabled ? "#ffd600" : "#2a2a2a", color: s.enabled ? "#111" : "#fff", padding: "6px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 700 } },
                  React.createElement("input", { type: "checkbox", checked: s.enabled, onChange: e => upd({ enabled: e.target.checked }), style: { accentColor: "#ffd600" } }),
                  s.enabled ? t("enabledOn") : t("enabledOff")
                )
              ),
              React.createElement("div", { style: { fontSize: "12px", opacity: 0.7, lineHeight: 1.5 } }, t("desc")),
              React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "8px", background: "rgba(0,0,0,0.2)", padding: "10px", borderRadius: "8px" } },
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "12px" } },
                  React.createElement("span", { style: { fontWeight: 600 } }, t("gap")),
                  React.createElement("span", { style: { color: "#ffd600", fontWeight: 700 } }, s.gap + "px")
                ),
                React.createElement("input", { type: "range", min: 0, max: 80, value: s.gap, onChange: e => upd({ gap: parseInt(e.target.value, 10) }), style: { width: "100%", accentColor: "#ffd600" } }),
                React.createElement("div", { style: { display: "flex", gap: "6px" } },
                  React.createElement("button", { onClick: () => upd({ gap: 0 }), style: { flex: 1, padding: "5px", borderRadius: "6px", border: "1px solid #444", background: "#1f1f1f", color: "#fff", cursor: "pointer", fontSize: "12px" } }, "0px"),
                  React.createElement("button", { onClick: () => upd({ gap: 32 }), style: { flex: 1, padding: "5px", borderRadius: "6px", border: "none", background: "#ffd600", color: "#111", fontWeight: 700, cursor: "pointer", fontSize: "12px" } }, "32px"),
                  React.createElement("button", { onClick: () => upd({ gap: 56 }), style: { flex: 1, padding: "5px", borderRadius: "6px", border: "1px solid #444", background: "#1f1f1f", color: "#fff", cursor: "pointer", fontSize: "12px" } }, "56px")
                ),
                React.createElement("div", { style: { fontSize: "11px", opacity: 0.5 } }, t("gapHint"))
              ),
              React.createElement("div", { style: { display: "flex", gap: "8px", flexWrap: "wrap" } },
                React.createElement("label", { style: { display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "12px" } },
                  React.createElement("input", { type: "checkbox", checked: s.showColliders, onChange: e => upd({ showColliders: e.target.checked }), style: { accentColor: "#ffd600" } }),
                  t("showColliders")
                ),
                React.createElement("label", { style: { display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "12px" } },
                  React.createElement("input", { type: "checkbox", checked: s.particles, onChange: e => upd({ particles: e.target.checked }), style: { accentColor: "#ffd600" } }),
                  t("particles")
                )
              ),
              React.createElement("details", { style: { background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "8px" } },
                React.createElement("summary", { style: { cursor: "pointer", fontSize: "12px", fontWeight: 600 } }, t("jumpTuning")),
                React.createElement("div", { style: { marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" } },
                  React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "11px" } },
                    React.createElement("span", null, t("jumpForce")),
                    React.createElement("span", { style: { color: "#ffd600" } }, s.jump)
                  ),
                  React.createElement("input", { type: "range", min: -14, max: -7, step: 0.2, value: s.jump, onChange: e => upd({ jump: parseFloat(e.target.value) }), style: { width: "100%", accentColor: "#ffd600" } }),
                  React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "11px" } },
                    React.createElement("span", null, t("gravity")),
                    React.createElement("span", { style: { color: "#ffd600" } }, s.gravity)
                  ),
                  React.createElement("input", { type: "range", min: 0.5, max: 1.2, step: 0.02, value: s.gravity, onChange: e => upd({ gravity: parseFloat(e.target.value) }), style: { width: "100%", accentColor: "#ffd600" } }),
                  React.createElement("button", { onClick: () => upd({ jump: -10.0, gravity: 0.82 }), style: { padding: "6px", borderRadius: "6px", border: "1px solid #444", background: "#2a2a2a", color: "#fff", cursor: "pointer", fontSize: "12px" } }, t("resetSnap"))
                )
              ),
              React.createElement("div", { style: { fontSize: "11px", opacity: 0.6, background: "rgba(255,214,0,0.08)", padding: "6px 8px", borderRadius: "6px", border: "1px solid rgba(255,214,0,0.2)" } }, t("tip"))
            );
          }
          return React.createElement(SettingsCard, null);
        }));
      });

      // Game overlay
      let overlay = null, world = null, colliderLayer = null, particleLayer = null, playerEl = null, hud = null;
      let rafId = 0, paused = false;
      let colliders = [], colliderDivs = [];
      const originalMargins = new Map();
      const originalTransforms = new Map();
      let pendingGapCollect = null, moDebounce = null;
      let draggedEl = null, dragStart = { x: 0, y: 0 }, dragOrig = { x: 0, y: 0 }, isDragging = false;
      let playerDragging = false, playerDragOff = { x: 0, y: 0 };

      const player = { x: 320, y: 120, vx: 0, vy: 0, w: 22, h: 22, onGround: false, rot: 0, coyote: 0, jumpBuffer: 0, jumpStartRot: 0 };
      const keys = {};

      function isTyping() {
        const el = document.activeElement;
        if (!el) return false;
        const t = el.tagName;
        if (t === "INPUT" || t === "TEXTAREA" || t === "SELECT") return true;
        if (el.isContentEditable) return true;
        return false;
      }
      function isInLeftTab(el, rect) {
        if (rect.left < LEFT_CUTOFF) return true;
        if (el.closest('nav, aside, [role="navigation"], [class*="sidebar"], [class*="Sidebar"], [id*="sidebar"], [class*="workspace"]')) return true;
        return false;
      }
      function isBackgroundExcluded(el, rect, cs) {
        // loại bỏ box chat nền, header, container lớn
        const tag = el.tagName;
        if (tag === "HEADER" || tag === "FOOTER" || tag === "NAV") return true;
        const cls = (el.className && typeof el.className === "string") ? el.className.toLowerCase() : "";
        const bgKeywords = ["header", "footer", "top-bar", "title-bar", "composer", "chat-container", "conversation-container", "chat-header", "space-header", "background", "wrapper", "container"];
        // nếu là container lớn có keyword và kích thước lớn -> loại
        for (const kw of bgKeywords) {
          if (cls.includes(kw) && (rect.height > 60 || rect.width > 450)) return true;
        }
        // scroll container lớn (box chat)
        if ((cs.overflowY === "auto" || cs.overflowY === "scroll" || cs.overflow === "auto") && rect.height > 280 && el.children.length > 3) return true;
        // box nền lớn bao toàn bộ chat
        if (rect.width > window.innerWidth * 0.85 && rect.height > 220 && el.children.length > 5) return true;
        // header space cụ thể: cao < 120 nhưng rộng gần full và nằm trên cùng
        if (rect.top < 80 && rect.height < 120 && rect.width > window.innerWidth * 0.6) return true;
        return false;
      }
      function isChatOrFloating(el, rect, cs) {
        if (isInLeftTab(el, rect)) return false;
        if (isBackgroundExcluded(el, rect, cs)) return false;
        if (rect.left < LEFT_CUTOFF) return false;
        const vw = window.innerWidth;
        const pos = cs.position;
        const isFloating = (pos === "fixed" || pos === "absolute") && rect.width < vw * 0.7 && rect.height < 400;
        if (isFloating) {
          if (rect.width < 12 || rect.height < 10) return false;
          return true;
        }
        const text = (el.innerText || "").trim();
        if (text.length < 6 || text.length > 3000) return false;
        if (el.children.length > 5) return false;
        if (rect.width < 160 || rect.width > 920) return false;
        if (rect.height < 20 || rect.height > 340) return false;
        return true;
      }

      function spawnParticles(x, y, count, color) {
        if (!state.particles || !particleLayer) return;
        color = color || "#ffd600";
        for (let i = 0; i < count; i++) {
          const p = document.createElement("div");
          p.className = "gdash-particle";
          p.style.left = x + "px";
          p.style.top = y + "px";
          p.style.background = color;
          const angle = (Math.random() * Math.PI * 2);
          const dist = 18 + Math.random() * 28;
          const dx = Math.cos(angle) * dist;
          const dy = Math.sin(angle) * dist - Math.random() * 10;
          p.style.setProperty("--dx", dx + "px");
          p.style.setProperty("--dy", dy + "px");
          p.style.animationDelay = (Math.random() * 0.08) + "s";
          particleLayer.appendChild(p);
          ctx.timeout(() => { try { p.remove(); } catch (e) {} }, 700);
        }
      }

      function collectColliders() {
        colliders = [];
        const vw = window.innerWidth, vh = window.innerHeight;
        const all = document.body.querySelectorAll("*");
        for (const el of all) {
          if (el.closest("#gdash-overlay")) continue;
          if (el.id === "gdash-gap-style" || el.id === "gdash-parkour-global") continue;
          const cs = getComputedStyle(el);
          if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") continue;
          const r = el.getBoundingClientRect();
          if (r.width < 12 || r.height < 10) continue;
          if (r.right < LEFT_CUTOFF || r.left > vw || r.bottom < 0 || r.top > vh) continue;
          if (r.width > vw * 0.96 && r.height > vh * 0.85) continue;
          if (!isChatOrFloating(el, r, cs)) continue;
          // thu nhỏ collider text để có space nhảy — 6px ngang, 8px dọc (trước 2/4)
          const isFloating = cs.position === "fixed" || cs.position === "absolute";
          const insetX = isFloating ? 2 : 6;
          const insetY = isFloating ? 4 : 8;
          colliders.push({
            left: r.left + insetX,
            top: r.top + insetY,
            right: r.right - insetX,
            bottom: r.bottom - insetY,
            el: el,
            raw: { left: r.left, top: r.top, right: r.right, bottom: r.bottom }
          });
        }
        colliders.push({ left: LEFT_CUTOFF - 20, top: vh - 4, right: vw + 100, bottom: vh + 100, el: null });
        colliders.push({ left: LEFT_CUTOFF - 20, top: -100, right: LEFT_CUTOFF, bottom: vh + 100, el: null });
        colliders.push({ left: vw, top: -100, right: vw + 20, bottom: vh + 100, el: null });
        colliders.push({ left: LEFT_CUTOFF - 100, top: -20, right: vw + 100, bottom: 0, el: null });
        renderColliders();
        if (hud) {
          const s = hud.querySelector("#gdash-stats");
          if (s) s.textContent = "colliders:" + colliders.length + " | gap:" + state.gap + "px | " + (paused ? "⏸" : "▶") + (isDragging ? " ✋" : "");
        }
      }

      function renderColliders() {
        if (!colliderLayer) return;
        colliderDivs.forEach(d => d.remove()); colliderDivs = [];
        if (!state.showColliders) return;
        for (const c of colliders) {
          if (c.el === null) continue;
          const d = document.createElement("div");
          d.style.cssText = "position:absolute;left:" + c.left + "px;top:" + c.top + "px;width:" + (c.right - c.left) + "px;height:" + (c.bottom - c.top) + "px;border:1px solid rgba(255,60,60,0.9);background:rgba(255,60,60,0.07);border-radius:4px;pointer-events:auto;box-sizing:border-box;cursor:grab;";
          d.title = "Kéo để dời block này";
          d.addEventListener("mousedown", (e) => startDrag(e, c.el));
          d.addEventListener("touchstart", (e) => {
            const t = e.touches[0]; if (t) startDrag({ clientX: t.clientX, clientY: t.clientY, preventDefault: () => e.preventDefault(), stopPropagation: () => e.stopPropagation() }, c.el);
          }, { passive: false });
          colliderLayer.appendChild(d); colliderDivs.push(d);
        }
      }

      function clearGap() {
        const gapStyle = document.getElementById("gdash-gap-style");
        if (gapStyle) gapStyle.textContent = "";
        originalMargins.forEach((v, el) => { try { el.style.marginBottom = v; el.classList.remove("gdash-gap-anim"); } catch (e) {} });
        // không xóa map để lần sau vẫn restore đúng gốc
      }

      function applyGap(newGap) {
        if (!state.enabled) { clearGap(); return; }
        state.gap = newGap;
        const gapStyle = document.getElementById("gdash-gap-style");
        if (gapStyle) gapStyle.textContent = ":root{--gdash-gap:" + newGap + "px} [data-message-id]{margin-bottom:var(--gdash-gap) !important} .message{margin-bottom:var(--gdash-gap) !important}";
        if (newGap === 0) {
          clearGap();
          if (pendingGapCollect) pendingGapCollect();
          pendingGapCollect = ctx.timeout(() => { pendingGapCollect = null; collectColliders(); }, 80);
          emit();
          return;
        }
        const all = document.body.querySelectorAll("div, article, section, li");
        let animatedCount = 0;
        all.forEach(el => {
          if (el.closest("#gdash-overlay")) return;
          const r = el.getBoundingClientRect();
          if (r.left < LEFT_CUTOFF) return;
          if (isBackgroundExcluded(el, r, getComputedStyle(el))) return;
          const t = (el.innerText || "").trim();
          if (t.length < 8 || t.length > 4000) return;
          if (el.children.length > 6) return;
          if (r.width < 160 || r.width > 920) return;
          if (r.height < 20 || r.height > 360) return;
          const cs = getComputedStyle(el); if (cs.display === "none" || cs.visibility === "hidden") return;
          if (!originalMargins.has(el)) originalMargins.set(el, el.style.marginBottom);
          el.style.marginBottom = newGap + "px";
          el.classList.add("gdash-gap-anim");
          if (state.particles && newGap > 12 && animatedCount < 12) {
            const rr = el.getBoundingClientRect();
            spawnParticles(rr.left + rr.width * 0.5, rr.bottom - 2, 4, "#ffd600");
            spawnParticles(rr.left + 12, rr.bottom - 2, 2, "#ff8c00");
          }
          animatedCount++;
          ctx.timeout(() => el.classList.remove("gdash-gap-anim"), 500);
        });
        if (pendingGapCollect) pendingGapCollect();
        pendingGapCollect = ctx.timeout(() => { pendingGapCollect = null; collectColliders(); }, 80);
        emit();
      }

      function createOverlay() {
        if (overlay) return;
        overlay = document.createElement("div");
        overlay.id = "gdash-overlay";
        overlay.style.cssText = "position:fixed;inset:0;z-index:2147483646;pointer-events:none;overflow:hidden;font-family:system-ui,sans-serif;";
        document.body.appendChild(overlay);
        world = document.createElement("div");
        world.style.cssText = "position:absolute;inset:0;pointer-events:none;";
        overlay.appendChild(world);
        colliderLayer = document.createElement("div");
        colliderLayer.style.cssText = "position:absolute;inset:0;pointer-events:auto;";
        world.appendChild(colliderLayer);
        particleLayer = document.createElement("div");
        particleLayer.style.cssText = "position:absolute;inset:0;pointer-events:none;overflow:hidden;";
        world.appendChild(particleLayer);
        playerEl = document.createElement("div");
        playerEl.style.cssText = "position:absolute;width:22px;height:22px;background:#ffd600;border:2px solid #111;border-radius:3px;box-shadow:0 2px 8px rgba(0,0,0,0.35), inset 0 0 0 2px rgba(255,255,255,0.6);pointer-events:auto;will-change:transform;cursor:grab;";
        playerEl.title = "Kéo để di chuyển (tránh stuck)";
        playerEl.innerHTML = '<div style="position:absolute;inset:4px 4px 6px 4px;background:#111;border-radius:1px;display:flex;align-items:center;justify-content:center;gap:2px"><div style="width:4px;height:4px;background:#ffd600;border-radius:50%"></div><div style="width:4px;height:4px;background:#ffd600;border-radius:50%"></div></div><div style="position:absolute;bottom:2px;left:3px;right:3px;height:2px;background:#111;border-radius:1px"></div>';
        world.appendChild(playerEl);
        hud = document.createElement("div");
        hud.style.cssText = "position:absolute;top:12px;right:12px;pointer-events:auto;background:rgba(17,17,17,0.92);color:#fff;padding:10px 12px;border-radius:10px;min-width:300px;box-shadow:0 8px 24px rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.12);font-size:13px;line-height:1.4;backdrop-filter:blur(8px)";
        hud.innerHTML = '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px"><div style="font-weight:700;letter-spacing:0.3px">⬜ GDash Parkour <span style="font-weight:400;opacity:0.6;font-size:11px">snap 360°</span></div><button id="gdash-close" style="background:#2a2a2a;color:#fff;border:1px solid #444;border-radius:6px;padding:2px 8px;cursor:pointer;font-size:12px">✕</button></div><div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap"><button id="gdash-pause" style="flex:1;background:#ffd600;color:#111;border:none;border-radius:6px;padding:6px 8px;font-weight:700;cursor:pointer">⏸ Pause (P)</button><button id="gdash-reset" style="flex:1;background:#333;color:#fff;border:1px solid #555;border-radius:6px;padding:6px 8px;font-weight:600;cursor:pointer">↺ Reset</button><button id="gdash-recollect" style="background:#2a2a2a;color:#fff;border:1px solid #555;border-radius:6px;padding:6px 8px;cursor:pointer" title="Quét lại collider">⟳</button></div><div style="margin-bottom:8px"><label style="display:flex;align-items:center;justify-content:space-between;gap:8px"><span>Giãn dòng chat</span><span id="gdash-gap-val" style="font-weight:700;color:#ffd600">' + state.gap + 'px</span></label><input id="gdash-gap" type="range" min="0" max="80" value="' + state.gap + '" style="width:100%;accent-color:#ffd600;cursor:pointer"><div style="font-size:11px;opacity:0.7;margin-top:2px">Kéo để tách dòng — có pulse + particle</div></div><label style="display:flex;align-items:center;gap:6px;margin-bottom:6px;cursor:pointer"><input id="gdash-show" type="checkbox" ' + (state.showColliders ? 'checked' : '') + ' style="accent-color:#ffd600"> Hiện khung collider (kéo để dời)</label><div style="font-size:11px;opacity:0.85;background:rgba(255,255,255,0.07);padding:6px 8px;border-radius:6px"><b>Kéo:</b> viền đỏ để dời block, ô vàng để thoát kẹt.<br><b>Nhảy:</b> <span style="color:#ffd600">Space/W/↑</span> thấp, xoay đủ 360°.<br><b>Di chuyển:</b> <span style="color:#ffd600">A/D ←→</span> <span style="color:#ffd600">Shift</span> chạy nhanh <span style="color:#ffd600">P</span> pause</div><div id="gdash-stats" style="margin-top:6px;font-size:11px;opacity:0.7;text-align:right">colliders: 0</div>';
        overlay.appendChild(hud);
        const gapInput = hud.querySelector("#gdash-gap");
        const gapVal = hud.querySelector("#gdash-gap-val");
        const showChk = hud.querySelector("#gdash-show");
        const pauseBtn = hud.querySelector("#gdash-pause");
        const resetBtn = hud.querySelector("#gdash-reset");
        const recollectBtn = hud.querySelector("#gdash-recollect");
        const closeBtn = hud.querySelector("#gdash-close");
        gapInput.addEventListener("input", e => { const v = parseInt(e.target.value, 10); gapVal.textContent = v + "px"; applyGap(v); });
        showChk.addEventListener("change", e => { state.showColliders = e.target.checked; emit(); colliderLayer.style.display = state.showColliders ? "block" : "none"; if (state.showColliders) renderColliders(); else { colliderDivs.forEach(d => d.remove()); colliderDivs = []; } });
        pauseBtn.addEventListener("click", () => { paused = !paused; pauseBtn.textContent = paused ? "▶ Resume (P)" : "⏸ Pause (P)"; pauseBtn.style.background = paused ? "#333" : "#ffd600"; pauseBtn.style.color = paused ? "#fff" : "#111"; });
        resetBtn.addEventListener("click", resetPlayer);
        recollectBtn.addEventListener("click", collectColliders);
        closeBtn.addEventListener("click", () => { state.enabled = false; emit(); destroyOverlay(); });

        playerEl.addEventListener("mousedown", (e) => {
          e.preventDefault(); e.stopPropagation();
          playerDragging = true; playerEl.style.cursor = "grabbing";
          playerDragOff = { x: e.clientX - player.x, y: e.clientY - player.y };
          document.addEventListener("mousemove", onPlayerDrag);
          document.addEventListener("mouseup", endPlayerDrag);
        });
        let gapStyle = document.getElementById("gdash-gap-style");
        if (!gapStyle) { gapStyle = document.createElement("style"); gapStyle.id = "gdash-gap-style"; document.head.appendChild(gapStyle); }
        applyGap(state.gap);
        collectColliders();
        startLoop();
      }

      function destroyOverlay() {
        if (rafId) try { window.cancelAnimationFrame(rafId); } catch (e) {}
        rafId = 0;
        if (overlay) try { overlay.remove(); } catch (e) {}
        overlay = world = colliderLayer = particleLayer = playerEl = hud = null;
        colliderDivs = []; colliders = [];
        clearGap();
        originalTransforms.forEach((v, el) => { try { el.style.transform = v; } catch (e) {} });
      }

      function startDrag(e, el) {
        if (!el) return;
        e.preventDefault(); e.stopPropagation();
        draggedEl = el; isDragging = true;
        dragStart = { x: e.clientX, y: e.clientY };
        const cur = el.style.transform || "";
        const m = cur.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
        dragOrig = { x: m ? parseFloat(m[1]) : 0, y: m ? parseFloat(m[2]) : 0 };
        if (!originalTransforms.has(el)) originalTransforms.set(el, el.style.transform || "");
        document.addEventListener("mousemove", onDragMove);
        document.addEventListener("mouseup", onDragEnd);
        document.addEventListener("touchmove", onTouchMove, { passive: false });
        document.addEventListener("touchend", onDragEnd);
        el.style.outline = "2px solid #ffd600";
        el.style.zIndex = "9999";
        el.style.transition = "none";
      }
      function onDragMove(e) {
        if (!isDragging || !draggedEl) return;
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        draggedEl.style.transform = "translate(" + (dragOrig.x + dx) + "px, " + (dragOrig.y + dy) + "px)";
        if (!onDragMove._t) onDragMove._t = ctx.timeout(() => { onDragMove._t = null; collectColliders(); }, 16);
      }
      function onTouchMove(e) {
        if (!isDragging || !draggedEl) return;
        const t = e.touches[0]; if (!t) return; e.preventDefault();
        onDragMove({ clientX: t.clientX, clientY: t.clientY });
      }
      function onDragEnd() {
        if (draggedEl) { draggedEl.style.outline = ""; draggedEl.style.zIndex = ""; draggedEl.style.transition = ""; }
        isDragging = false; draggedEl = null;
        document.removeEventListener("mousemove", onDragMove);
        document.removeEventListener("mouseup", onDragEnd);
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", onDragEnd);
        collectColliders();
      }
      function onPlayerDrag(e) {
        if (!playerDragging) return;
        player.x = e.clientX - playerDragOff.x;
        player.y = e.clientY - playerDragOff.y;
        player.vx = 0; player.vy = 0;
      }
      function endPlayerDrag() { playerDragging = false; if (playerEl) playerEl.style.cursor = "grab"; document.removeEventListener("mousemove", onPlayerDrag); document.removeEventListener("mouseup", endPlayerDrag); }

      function resetPlayer() { player.x = LEFT_CUTOFF + 40; player.y = 80; player.vx = 0; player.vy = 0; player.onGround = false; player.coyote = 0; player.jumpBuffer = 0; }

      function rectsOverlap(ax, ay, aw, ah, b) { return ax < b.right && ax + aw > b.left && ay < b.bottom && ay + ah > b.top; }

      function updatePhysics() {
        if (paused || playerDragging || isDragging) return;
        if (player.jumpBuffer > 0) player.jumpBuffer--;
        if (player.onGround) player.coyote = 6; else if (player.coyote > 0) player.coyote--;
        const typing = isTyping();
        let move = 0;
        if (!typing) { if (keys["arrowleft"] || keys["a"]) move -= 1; if (keys["arrowright"] || keys["d"]) move += 1; }
        const isRunning = keys["shift"];
        const targetSpeed = move * state.speed * (isRunning ? 1.65 : 1);
        if (move !== 0) player.vx += (targetSpeed - player.vx) * 0.28;
        else { player.vx *= player.onGround ? 0.82 : 0.96; if (Math.abs(player.vx) < 0.08) player.vx = 0; }
        player.vy += state.gravity; const MAX_FALL = 12; if (player.vy > MAX_FALL) player.vy = MAX_FALL;

        if (player.jumpBuffer > 0 && (player.onGround || player.coyote > 0)) {
          player.vy = state.jump;
          player.onGround = false; player.coyote = 0; player.jumpBuffer = 0;
          player.jumpStartRot = player.rot;
          spawnParticles(player.x + player.w / 2, player.y + player.h, 8, "#ffd600");
        }

        let nx = player.x + player.vx, ny = player.y;
        for (const c of colliders) { if (rectsOverlap(nx, ny, player.w, player.h, c)) { if (player.vx > 0) nx = c.left - player.w; else if (player.vx < 0) nx = c.right; player.vx = 0; break; } }
        player.x = nx;
        if (player.x < LEFT_CUTOFF) { player.x = LEFT_CUTOFF; player.vx = 0; }
        if (player.x + player.w > window.innerWidth) { player.x = window.innerWidth - player.w; player.vx = 0; }

        let vy = player.vy, nextY = player.y + vy;
        let landed = false;
        let landX = 0, landY = 0;
        player.onGround = false;
        for (const c of colliders) {
          if (rectsOverlap(player.x, nextY, player.w, player.h, c)) {
            if (vy > 0) {
              const bottomBefore = player.y + player.h;
              if (bottomBefore <= c.top + 16) {
                nextY = c.top - player.h;
                landed = true; landX = player.x + player.w / 2; landY = c.top;
              } else {
                nextY = c.top - player.h;
                landed = true; landX = player.x + player.w / 2; landY = c.top;
              }
              player.vy = 0; player.onGround = true; vy = 0;
            } else if (vy < 0) {
              nextY = c.bottom; player.vy = 0; vy = 0;
            }
            break;
          }
        }
        player.y = nextY;
        if (!player.onGround) player.vy = vy; else if (landed && state.particles && Math.abs(vy) > 0.5) {
          spawnParticles(landX, landY, 5, "#fff");
        }
        if (player.y < 0) { player.y = 0; player.vy = 0; }
        if (player.y > window.innerHeight + 200) resetPlayer();
        // xoay đủ 360° mỗi cú nhảy: 15°/frame khi trên không, snap về bội 360 khi đáp
        if (!player.onGround) {
          player.rot += 15;
        } else {
          const target = Math.round(player.rot / 360) * 360;
          player.rot += (target - player.rot) * 0.25;
          if (Math.abs(target - player.rot) < 0.5) player.rot = target;
        }
      }

      function render() {
        if (!playerEl) return;
        playerEl.style.left = player.x + "px";
        playerEl.style.top = player.y + "px";
        playerEl.style.transform = "rotate(" + player.rot + "deg)";
        if (hud) {
          const s = hud.querySelector("#gdash-stats");
          if (s) s.textContent = "colliders:" + colliders.length + " | " + Math.round(player.x) + "," + Math.round(player.y) + (player.onGround ? " ●" : "") + (paused ? " ⏸" : "") + (isDragging ? " ✋" : "");
        }
      }
      function loop() { updatePhysics(); render(); rafId = window.requestAnimationFrame(loop); }
      function startLoop() { if (rafId) try { window.cancelAnimationFrame(rafId); } catch (e) {} rafId = window.requestAnimationFrame(loop); }

      function onKeyDown(e) {
        const k = e.key.toLowerCase(); keys[k] = true;
        if (k === " " || k === "arrowup" || k === "w") {
          if (isTyping()) return;
          player.jumpBuffer = 6;
          if (player.onGround || player.coyote > 0) {
            player.vy = state.jump; player.onGround = false; player.coyote = 0; player.jumpBuffer = 0;
            player.jumpStartRot = player.rot;
            spawnParticles(player.x + player.w / 2, player.y + player.h, 6, "#ffd600");
          }
          e.preventDefault();
        }
        if (k === "p" || k === "escape") {
          if (k === "escape" && isTyping()) return;
          paused = !paused;
          if (hud) {
            const b = hud.querySelector("#gdash-pause");
            if (b) { b.textContent = paused ? "▶ Resume (P)" : "⏸ Pause (P)"; b.style.background = paused ? "#333" : "#ffd600"; b.style.color = paused ? "#fff" : "#111"; }
          }
          e.preventDefault();
        }
      }
      function onKeyUp(e) { keys[e.key.toLowerCase()] = false; }

      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);
      let gapStyleEl = document.getElementById("gdash-gap-style");
      if (!gapStyleEl) { gapStyleEl = document.createElement("style"); gapStyleEl.id = "gdash-gap-style"; document.head.appendChild(gapStyleEl); }

      const mo = new MutationObserver(() => {
        if (moDebounce) moDebounce();
        moDebounce = ctx.timeout(() => { moDebounce = null; if (!state.enabled) return; if (state.gap > 0) applyGap(state.gap); else collectColliders(); }, 180);
      });
      mo.observe(document.body, { childList: true, subtree: true, characterData: true });
      window.addEventListener("resize", collectColliders);
      window.addEventListener("scroll", collectColliders, true);

      const unsub = subscribe((s) => {
        if (s.enabled && !overlay) createOverlay();
        else if (!s.enabled && overlay) destroyOverlay();
        if (overlay) {
          if (hud) {
            const gi = hud.querySelector("#gdash-gap"); if (gi) gi.value = s.gap;
            const gv = hud.querySelector("#gdash-gap-val"); if (gv) gv.textContent = s.gap + "px";
          }
          renderColliders();
        } else {
          // khi tắt, đảm bảo gap đã xóa
          clearGap();
          collectColliders();
        }
      });

      if (state.enabled) createOverlay();
      else clearGap();

      ctx.effect(() => {
        return () => {
          try { window.cancelAnimationFrame(rafId); } catch (e) {}
          if (pendingGapCollect) pendingGapCollect();
          if (moDebounce) moDebounce();
          window.removeEventListener("keydown", onKeyDown);
          window.removeEventListener("keyup", onKeyUp);
          window.removeEventListener("resize", collectColliders);
          window.removeEventListener("scroll", collectColliders, true);
          document.removeEventListener("mousemove", onDragMove);
          document.removeEventListener("mouseup", onDragEnd);
          document.removeEventListener("mousemove", onPlayerDrag);
          document.removeEventListener("mouseup", endPlayerDrag);
          try { mo.disconnect(); } catch (e) {}
          try { if (overlay) overlay.remove(); } catch (e) {}
          try { const gs = document.getElementById("gdash-gap-style"); if (gs) gs.remove(); } catch (e) {}
          try { const gg = document.getElementById("gdash-parkour-global"); if (gg) gg.remove(); } catch (e) {}
          originalMargins.forEach((v, el) => { try { el.style.marginBottom = v; el.classList.remove("gdash-gap-anim"); } catch (e) {} });
          originalTransforms.forEach((v, el) => { try { el.style.transform = v; } catch (e) {} });
          unsub();
        };
      });
    };

    return module.exports;
  }
});
