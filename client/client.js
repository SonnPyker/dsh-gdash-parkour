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
      gap: 0,
      showColliders: false,
      particles: true,
      jump: -10.0,
      gravity: 0.82,
      speed: 3.8,
      paused: false
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
          subtitle: "Geometry Dash on your chat — v1.2.1",
          enabledOn: "On",
          enabledOff: "Off",
          desc: "Control the yellow square jumping on your chat lines. Expand gaps to make platforms, drag with Alt when stuck. No death — just pause.",
          gap: "Chat gap",
          gapHint: "Only chat text is expanded (0 = off). Pulse + particles when expanding.",
          showColliders: "Show colliders (Alt+drag to move)",
          particles: "Particles",
          jumpTuning: "Jump tuning (snap)",
          jumpForce: "Jump force",
          gravity: "Gravity",
          resetSnap: "Reset snap defaults",
          tip: "Tip: Hold Alt and drag a chat bubble to move it. Drag the yellow square to escape.",
          pause: "Pause",
          resume: "Resume",
          resetPos: "Reset position",
          rescan: "Rescan colliders",
          controls: "Controls"
        },
        vi: {
          title: "GDash Parkour",
          subtitle: "Geometry Dash trên dòng chat — v1.2.1",
          enabledOn: "Bật",
          enabledOff: "Tắt",
          desc: "Điều khiển ô vàng nhảy trên chính các dòng chat. Kéo giãn dòng để tạo bậc thang, giữ Alt để kéo block khi kẹt. Không chết — chỉ pause.",
          gap: "Giãn dòng chat",
          gapHint: "Chỉ giãn text chat (0 = tắt). Có pulse + particle khi giãn.",
          showColliders: "Hiện khung (giữ Alt kéo để dời)",
          particles: "Particles",
          jumpTuning: "Tinh chỉnh nhảy (snap)",
          jumpForce: "Lực nhảy",
          gravity: "Trọng lực",
          resetSnap: "Reset snap defaults",
          tip: "Mẹo: Giữ Alt và kéo bubble chat để dời. Kéo ô vàng để thoát kẹt.",
          pause: "Pause",
          resume: "Resume",
          resetPos: "Reset vị trí",
          rescan: "Quét lại",
          controls: "Điều khiển"
        }
      };
      const localeSvc = ctx.get("locale");
      if (localeSvc) ctx.effect(() => localeSvc.register(NS, dicts), "gdash-parkour: locale");
      const t = (() => {
        try { return (localeSvc && localeSvc.bind(NS)) || ((k) => dicts.vi[k] || k); } catch (e) { return (k) => (dicts.vi[k] || dicts.en[k] || k); }
      })();

      // Settings UI — chỉ trong Plugins → Plugin Configuration
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

            return React.createElement("div", { style: { border: "1px solid var(--vscode-widget-border, rgba(255,255,255,0.08))", borderRadius: "8px", padding: "12px", background: "transparent", display: "flex", flexDirection: "column", gap: "12px" } },
              React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "10px" } },
                React.createElement("div", { style: { width: "28px", height: "28px", borderRadius: "6px", border: "1px solid var(--vscode-widget-border, rgba(255,255,255,0.15))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" } }, "▦"),
                React.createElement("div", { style: { flex: 1 } },
                  React.createElement("div", { style: { fontWeight: 700 } }, t("title")),
                  React.createElement("div", { style: { fontSize: "12px", opacity: 0.6 } }, t("subtitle"))
                ),
                React.createElement("label", { style: { display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", border: "1px solid var(--vscode-widget-border, rgba(255,255,255,0.15))", background: s.enabled ? "var(--vscode-button-background, #0e639c)" : "transparent", color: s.enabled ? "var(--vscode-button-foreground, #fff)" : "inherit", padding: "4px 10px", borderRadius: "6px", fontSize: "12px" } },
                  React.createElement("input", { type: "checkbox", checked: s.enabled, onChange: e => upd({ enabled: e.target.checked }), style: { accentColor: "" } }),
                  s.enabled ? t("enabledOn") : t("enabledOff")
                )
              ),
              React.createElement("div", { style: { fontSize: "12px", opacity: 0.7, lineHeight: 1.5 } }, t("desc")),
              // Controls chỉ trong config, không còn HUD ngoài
              React.createElement("div", { style: { display: "flex", gap: "6px" } },
                React.createElement("button", { onClick: () => upd({ paused: !s.paused }), style: { flex: 1, padding: "7px", borderRadius: "8px", border: "none", background: s.paused ? "var(--vscode-button-secondaryBackground, #3c3c3c)" : "var(--vscode-button-background, #0e639c)", color: "var(--vscode-button-foreground, #fff)", cursor: "pointer", fontSize: "12px" } }, s.paused ? t("resume") + " (P)" : t("pause") + " (P)"),
                React.createElement("button", { onClick: () => { const ev = new CustomEvent("gdash-reset"); window.dispatchEvent(ev); }, style: { padding: "7px 12px", borderRadius: "8px", border: "1px solid var(--vscode-widget-border, rgba(255,255,255,0.12))", background: "transparent", color: "inherit", cursor: "pointer", fontSize: "12px" } }, t("resetPos")),
                React.createElement("button", { onClick: () => { const ev = new CustomEvent("gdash-rescan"); window.dispatchEvent(ev); }, style: { padding: "7px 10px", borderRadius: "8px", border: "1px solid var(--vscode-widget-border, rgba(255,255,255,0.12))", background: "transparent", color: "inherit", cursor: "pointer", fontSize: "12px" } }, t("rescan"))
              ),
              React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "8px", background: "rgba(0,0,0,0.2)", padding: "10px", borderRadius: "8px" } },
                React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "12px" } },
                  React.createElement("span", { style: { fontWeight: 600 } }, t("gap")),
                  React.createElement("span", { style: { opacity: 0.8, fontWeight: 700 } }, s.gap + "px")
                ),
                React.createElement("input", { type: "range", min: 0, max: 80, value: s.gap, onChange: e => upd({ gap: parseInt(e.target.value, 10) }), style: { width: "100%", accentColor: "" } }),
                React.createElement("div", { style: { display: "flex", gap: "6px" } },
                  React.createElement("button", { onClick: () => upd({ gap: 0 }), style: { flex: 1, padding: "5px", borderRadius: "6px", border: "1px solid var(--vscode-widget-border, rgba(255,255,255,0.12))", background: "transparent", color: "inherit", cursor: "pointer", fontSize: "12px" } }, "0px"),
                  React.createElement("button", { onClick: () => upd({ gap: 24 }), style: { flex: 1, padding: "5px", borderRadius: "6px", border: "1px solid var(--vscode-widget-border, rgba(255,255,255,0.12))", background: "transparent", color: "inherit", cursor: "pointer", fontSize: "12px" } }, "24px"),
                  React.createElement("button", { onClick: () => upd({ gap: 48 }), style: { flex: 1, padding: "5px", borderRadius: "6px", border: "1px solid var(--vscode-widget-border, rgba(255,255,255,0.12))", background: "transparent", color: "inherit", cursor: "pointer", fontSize: "12px" } }, "48px")
                ),
                React.createElement("div", { style: { fontSize: "11px", opacity: 0.5 } }, t("gapHint"))
              ),
              React.createElement("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap" } },
                React.createElement("label", { style: { display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "12px" } },
                  React.createElement("input", { type: "checkbox", checked: s.showColliders, onChange: e => upd({ showColliders: e.target.checked }), style: { accentColor: "" } }),
                  t("showColliders")
                ),
                React.createElement("label", { style: { display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "12px" } },
                  React.createElement("input", { type: "checkbox", checked: s.particles, onChange: e => upd({ particles: e.target.checked }), style: { accentColor: "" } }),
                  t("particles")
                )
              ),
              React.createElement("details", { style: { background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "8px" } },
                React.createElement("summary", { style: { cursor: "pointer", fontSize: "12px", fontWeight: 600 } }, t("jumpTuning")),
                React.createElement("div", { style: { marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" } },
                  React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "11px" } },
                    React.createElement("span", null, t("jumpForce")),
                    React.createElement("span", { style: { opacity: 0.8 } }, s.jump)
                  ),
                  React.createElement("input", { type: "range", min: -14, max: -7, step: 0.2, value: s.jump, onChange: e => upd({ jump: parseFloat(e.target.value) }), style: { width: "100%", accentColor: "" } }),
                  React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "11px" } },
                    React.createElement("span", null, t("gravity")),
                    React.createElement("span", { style: { opacity: 0.8 } }, s.gravity)
                  ),
                  React.createElement("input", { type: "range", min: 0.5, max: 1.2, step: 0.02, value: s.gravity, onChange: e => upd({ gravity: parseFloat(e.target.value) }), style: { width: "100%", accentColor: "" } }),
                  React.createElement("button", { onClick: () => upd({ jump: -10.0, gravity: 0.82 }), style: { padding: "6px", borderRadius: "6px", border: "1px solid #444", background: "#2a2a2a", color: "#fff", cursor: "pointer", fontSize: "12px" } }, t("resetSnap"))
                )
              ),
              React.createElement("div", { style: { fontSize: "11px", opacity: 0.6, background: "rgba(255,214,0,0.08)", padding: "6px 8px", borderRadius: "6px", border: "1px solid rgba(255,214,0,0.2)" } }, t("tip")),
              React.createElement("div", { style: { fontSize: "11px", opacity: 0.5 } }, t("controls") + ": A/D ←→, Space/W/↑, Shift, P")
            );
          }
          return React.createElement(SettingsCard, null);
        }));
      });

      // Game overlay — KHÔNG còn HUD ngoài, chỉ world + player
      let overlay = null, world = null, colliderLayer = null, particleLayer = null, playerEl = null;
      let rafId = 0;
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
        const tag = el.tagName;
        if (tag === "HEADER" || tag === "FOOTER" || tag === "NAV") return true;
        const cls = (el.className && typeof el.className === "string") ? el.className.toLowerCase() : "";
        const bgKeywords = ["header", "footer", "top-bar", "title-bar", "composer", "chat-container", "conversation-container", "chat-header", "space-header", "background", "wrapper", "container"];
        for (const kw of bgKeywords) {
          if (cls.includes(kw) && (rect.height > 60 || rect.width > 450)) return true;
        }
        if ((cs.overflowY === "auto" || cs.overflowY === "scroll" || cs.overflow === "auto") && rect.height > 280 && el.children.length > 3) return true;
        if (rect.width > window.innerWidth * 0.85 && rect.height > 220 && el.children.length > 5) return true;
        if (rect.top < 80 && rect.height < 120 && rect.width > window.innerWidth * 0.6) return true;
        return false;
      }
      function isChatText(el, rect, cs) {
        // chỉ text chat, không lấy UI nền
        if (isInLeftTab(el, rect)) return false;
        if (isBackgroundExcluded(el, rect, cs)) return false;
        if (rect.left < LEFT_CUTOFF) return false;
        // chỉ lấy element có text thực sự, nằm trong vùng chat
        const text = (el.innerText || "").trim();
        if (text.length < 8 || text.length > 3000) return false;
        if (el.children.length > 4) return false;
        if (rect.width < 180 || rect.width > 900) return false;
        if (rect.height < 20 || rect.height > 140) return false;
        // phải nằm trong main / conversation area
        const inChatArea = el.closest('main, [role="main"], [class*="conversation"], [class*="chat"]') !== null;
        if (!inChatArea) {
          // fallback: nếu không tìm thấy container, chấp nhận nếu ở giữa màn hình
          if (rect.left < LEFT_CUTOFF + 40) return false;
        }
        return true;
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
        return isChatText(el, rect, cs);
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
      }

      function renderColliders() {
        if (!colliderLayer) return;
        colliderDivs.forEach(d => d.remove()); colliderDivs = [];
        if (!state.showColliders) return;
        for (const c of colliders) {
          if (c.el === null) continue;
          const d = document.createElement("div");
          // pointer-events none để không chặn click chat
          d.style.cssText = "position:absolute;left:" + c.left + "px;top:" + c.top + "px;width:" + (c.right - c.left) + "px;height:" + (c.bottom - c.top) + "px;border:1px solid rgba(255,60,60,0.9);background:rgba(255,60,60,0.07);border-radius:4px;pointer-events:none;box-sizing:border-box;";
          d.title = "Alt+drag chat bubble để dời";
          colliderLayer.appendChild(d); colliderDivs.push(d);
        }
      }

      function clearGap() {
        const gapStyle = document.getElementById("gdash-gap-style");
        if (gapStyle) gapStyle.textContent = "";
        originalMargins.forEach((v, el) => { try { el.style.marginBottom = v; el.classList.remove("gdash-gap-anim"); } catch (e) {} });
      }

      function applyGap(newGap) {
        if (!state.enabled) { clearGap(); return; }
        state.gap = newGap;
        const gapStyle = document.getElementById("gdash-gap-style");
        if (gapStyle) gapStyle.textContent = "";
        if (newGap === 0) {
          clearGap();
          if (pendingGapCollect) pendingGapCollect();
          pendingGapCollect = ctx.timeout(() => { pendingGapCollect = null; collectColliders(); }, 80);
          emit();
          return;
        }
        // chỉ giãn text chat, không đụng UI khác
        const all = document.body.querySelectorAll("div, article, section, li, p");
        let animatedCount = 0;
        all.forEach(el => {
          if (el.closest("#gdash-overlay")) return;
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          if (!isChatText(el, r, cs)) return;
          if (!originalMargins.has(el)) originalMargins.set(el, el.style.marginBottom);
          el.style.marginBottom = newGap + "px";
          el.classList.add("gdash-gap-anim");
          if (state.particles && animatedCount < 10) {
            const rr = el.getBoundingClientRect();
            spawnParticles(rr.left + rr.width * 0.5, rr.bottom - 2, 3, "#ffd600");
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
        // pointer-events none toàn bộ để không chặn click
        overlay.style.cssText = "position:fixed;inset:0;z-index:2147483646;pointer-events:none;overflow:hidden;font-family:system-ui,sans-serif;";
        document.body.appendChild(overlay);
        world = document.createElement("div");
        world.style.cssText = "position:absolute;inset:0;pointer-events:none;";
        overlay.appendChild(world);
        colliderLayer = document.createElement("div");
        colliderLayer.style.cssText = "position:absolute;inset:0;pointer-events:none;";
        world.appendChild(colliderLayer);
        particleLayer = document.createElement("div");
        particleLayer.style.cssText = "position:absolute;inset:0;pointer-events:none;overflow:hidden;";
        world.appendChild(particleLayer);
        playerEl = document.createElement("div");
        // player vẫn pointer-events auto để kéo được, nhưng không chặn chat vì nó nhỏ
        playerEl.style.cssText = "position:absolute;width:22px;height:22px;background:#ffd600;border:2px solid #111;border-radius:3px;box-shadow:0 2px 8px rgba(0,0,0,0.35), inset 0 0 0 2px rgba(255,255,255,0.6);pointer-events:auto;will-change:transform;cursor:grab;";
        playerEl.title = "Kéo để di chuyển (tránh stuck) — hoặc Alt+drag bubble chat";
        playerEl.innerHTML = '<div style="position:absolute;inset:4px 4px 6px 4px;background:#111;border-radius:1px;display:flex;align-items:center;justify-content:center;gap:2px"><div style="width:4px;height:4px;background:#ffd600;border-radius:50%"></div><div style="width:4px;height:4px;background:#ffd600;border-radius:50%"></div></div><div style="position:absolute;bottom:2px;left:3px;right:3px;height:2px;background:#111;border-radius:1px"></div>';
        world.appendChild(playerEl);

        playerEl.addEventListener("mousedown", (e) => {
          e.preventDefault(); e.stopPropagation();
          playerDragging = true; playerEl.style.cursor = "grabbing";
          playerDragOff = { x: e.clientX - player.x, y: e.clientY - player.y };
          document.addEventListener("mousemove", onPlayerDrag);
          document.addEventListener("mouseup", endPlayerDrag);
        });
        let gapStyle = document.getElementById("gdash-gap-style");
        if (!gapStyle) { gapStyle = document.createElement("style"); gapStyle.id = "gdash-gap-style"; document.head.appendChild(gapStyle); }
        // mặc định 0 nên không giãn ngay
        if (state.gap > 0) applyGap(state.gap);
        collectColliders();
        startLoop();
      }

      function destroyOverlay() {
        if (rafId) try { window.cancelAnimationFrame(rafId); } catch (e) {}
        rafId = 0;
        if (overlay) try { overlay.remove(); } catch (e) {}
        overlay = world = colliderLayer = particleLayer = playerEl = null;
        colliderDivs = []; colliders = [];
        clearGap();
        originalTransforms.forEach((v, el) => { try { el.style.transform = v; } catch (e) {} });
      }

      // Alt+drag bubble chat để dời — không cần viền đỏ chặn click
      function onAltDragStart(e) {
        if (!state.enabled || !e.altKey) return;
        const target = e.target;
        if (!target || target.closest("#gdash-overlay")) return;
        const r = target.getBoundingClientRect();
        const cs = getComputedStyle(target);
        if (!isChatText(target, r, cs) && !isChatOrFloating(target, r, cs)) {
          // thử parent
          const parent = target.closest("div, article, section, li, p");
          if (!parent) return;
          const pr = parent.getBoundingClientRect();
          const pcs = getComputedStyle(parent);
          if (!isChatText(parent, pr, pcs)) return;
          startDrag(e, parent);
          return;
        }
        startDrag(e, target);
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
        const paused = state.paused;
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
          const newPaused = !state.paused;
          Object.assign(state, { paused: newPaused }); emit();
          e.preventDefault();
        }
      }
      function onKeyUp(e) { keys[e.key.toLowerCase()] = false; }

      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);
      // Alt+drag listener — chỉ khi giữ Alt mới kéo bubble
      window.addEventListener("mousedown", onAltDragStart);
      window.addEventListener("gdash-reset", resetPlayer);
      window.addEventListener("gdash-rescan", collectColliders);
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
          renderColliders();
        } else {
          clearGap();
          // không cần collect khi tắt
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
          window.removeEventListener("mousedown", onAltDragStart);
          window.removeEventListener("gdash-reset", resetPlayer);
          window.removeEventListener("gdash-rescan", collectColliders);
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
