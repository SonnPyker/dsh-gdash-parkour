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
      showColliders: false,
      particles: true,
      jump: -10.0,
      gravity: 0.82,
      speed: 3.8,
      paused: false,
      randomPlatform: false
    };

    function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
    function loadState() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          const out = Object.assign({}, DEFAULTS, parsed);
          out.gap = clamp(parseInt(out.gap, 10) || 0, 0, 80);
          out.jump = clamp(parseFloat(out.jump) || DEFAULTS.jump, -14, -7);
          out.gravity = clamp(parseFloat(out.gravity) || DEFAULTS.gravity, 0.45, 1.2);
          out.speed = clamp(parseFloat(out.speed) || DEFAULTS.speed, 1, 8);
          out.enabled = !!out.enabled;
          out.showColliders = !!out.showColliders;
          out.particles = !!out.particles;
          out.paused = !!out.paused;
          out.randomPlatform = !!out.randomPlatform;
          out.enemyCount = clamp(parseInt(out.enemyCount,10)||2, 0, 6);
          out.enemySpeed = clamp(parseFloat(out.enemySpeed)||1.0, 0.6, 2.2);
          out.coinCount = clamp(parseInt(out.coinCount,10)||8, 0, 15);
          out.powerupEnabled = !!out.powerupEnabled;
          out.powerupRate = clamp(parseFloat(out.powerupRate)||0.15, 0, 1);
          out.highscore = Math.max(0, parseInt(out.highscore,10)||0);
          return out;
        }
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
      function emit() { const snap = Object.assign({}, state); listeners.forEach(function(fn){ try{ fn(snap);}catch(e){}}); saveState(state); }
      function subscribe(fn) { listeners.push(fn); return function(){ listeners = listeners.filter(function(x){ return x!==fn; }); }; }

      // ——— global styles (particles + gap pulse) ———
      const globalStyle = document.createElement("style");
      globalStyle.id = "gdash-parkour-global";
      globalStyle.textContent = "\n        @keyframes gdash-particle {\n          0% { transform: translate(0,0) scale(1) rotate(0deg); opacity: 1; }\n          100% { transform: translate(var(--dx), var(--dy)) scale(0) rotate(180deg); opacity: 0; }\n        }\n        @keyframes gdash-gap-pulse {\n          0% { transform: scale(1); }\n          50% { transform: scale(1.015); }\n          100% { transform: scale(1); }\n        }\n        .gdash-gap-anim {\n          transition: margin-bottom 0.45s cubic-bezier(0.22,1,0.36,1), transform 0.45s cubic-bezier(0.22,1,0.36,1) !important;\n          animation: gdash-gap-pulse 0.45s ease;\n        }\n        .gdash-particle {\n          position: absolute;\n          width: 6px; height: 6px;\n          background: #ffd600;\n          border: 1px solid #111;\n          border-radius: 1px;\n          pointer-events: none;\n          will-change: transform, opacity;\n          animation: gdash-particle 0.6s ease-out forwards;\n        }\n        @keyframes gdash-coin-spin { 0% { transform: rotateY(0deg) } 50% { transform: rotateY(180deg) scale(1.08) } 100% { transform: rotateY(360deg) } }\n        @keyframes gdash-enemy-bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-2px) } }\n        @keyframes gdash-power-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(79,124,255,0.6) } 50% { box-shadow: 0 0 0 6px rgba(79,124,255,0) } }\n        .gdash-coin { animation: gdash-coin-spin 1.4s ease-in-out infinite; }\n        .gdash-enemy { animation: gdash-enemy-bob 0.9s ease-in-out infinite; }\n        .gdash-power { animation: gdash-power-pulse 1s ease-in-out infinite; }\n        /* range — DSW compliant */\n        .gdash-range { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 999px; background: var(--dsw-alias-border-l2, rgba(255,255,255,0.12)); outline: none; }\n        .gdash-range::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: var(--dsw-alias-label-primary, #f5f5f5); border: 2px solid var(--dsw-alias-bg-layer-3, #252525); box-shadow: 0 1px 4px rgba(0,0,0,.35); cursor: pointer; }\n        .gdash-range::-moz-range-thumb { width: 16px; height: 16px; border-radius: 50%; background: var(--dsw-alias-label-primary, #f5f5f5); border: 2px solid var(--dsw-alias-bg-layer-3, #252525); cursor: pointer; }\n      ";
      if (!document.getElementById("gdash-parkour-global")) document.head.appendChild(globalStyle);

      // ——— i18n ———
      const NS = "gdash-parkour";
      const dicts = {
        en: {
          title: "GDash Parkour",
          subtitle: "Geometry Dash on your chat",
          enabledOn: "Enabled",
          enabledOff: "Disabled",
          desc: "The yellow square jumps on your chat bubbles. Expand gaps to build stairs, hold Alt and drag a bubble when stuck. No death — just play.",
          gap: "Chat gap",
          gapHint: "Expands message spacing (0 = off). Pulse + particles when expanding.",
          showColliders: "Show bounds",
          showCollidersHint: "Hold Alt and drag a bubble to move it",
          particles: "Particles",
          randomPlatform: "Shuffle into platform level",
          randomPlatformHint: "Arrange messages into a random platform course with transition",
          shuffle: "Shuffle",
          jumpTuning: "Jump tuning",
          jumpForce: "Jump force",
          gravity: "Gravity",
          resetSnap: "Reset to defaults",
          tip: "Tip: Hold Alt + drag any bubble to reposition it. Drag the yellow square to escape a trap.",
          pause: "Pause",
          resume: "Resume",
          resetPos: "Reset position",
          rescan: "Rescan",
          controls: "A / D or ← → to move · Shift to sprint · Space / W / ↑ to jump · P to pause",
          version: "v1.3.0"
        },
        vi: {
          title: "GDash Parkour",
          subtitle: "Geometry Dash trên dòng chat",
          enabledOn: "Đang bật",
          enabledOff: "Đã tắt",
          desc: "Ô vàng nhảy trên chính bubble chat của bạn. Kéo giãn dòng để tạo bậc thang, giữ Alt và kéo bubble khi kẹt. Không có chết — chỉ chơi thôi.",
          gap: "Giãn dòng chat",
          gapHint: "Tăng khoảng cách giữa các tin nhắn (0 = tắt). Có hiệu ứng pulse + particle.",
          showColliders: "Hiện khung",
          showCollidersHint: "Giữ Alt và kéo bubble để dời",
          particles: "Hiệu ứng hạt",
          randomPlatform: "Xếp ngẫu nhiên thành màn chơi",
          randomPlatformHint: "Tự động xếp tin nhắn thành màn platform ngẫu nhiên, có animation",
          shuffle: "Xáo trộn lại",
          jumpTuning: "Tinh chỉnh nhảy",
          jumpForce: "Lực nhảy",
          gravity: "Trọng lực",
          resetSnap: "Về mặc định",
          tip: "Mẹo: Giữ Alt và kéo bubble để dời. Kéo ô vàng để thoát kẹt.",
          pause: "Tạm dừng",
          resume: "Tiếp tục",
          resetPos: "Đặt lại vị trí",
          rescan: "Quét lại",
          controls: "A / D hoặc ← → để di chuyển · Shift chạy nhanh · Space / W / ↑ để nhảy · P tạm dừng",
          version: "v1.3.0"
        }
      };
      const localeSvc = ctx.get("locale");
      if (localeSvc) ctx.effect(function(){ return localeSvc.register(NS, dicts); }, "gdash-parkour: locale");
      const t = (function(){ try { return (localeSvc && localeSvc.bind(NS)) || function(k){ return (dicts.vi[k] || dicts.en[k] || k); }; } catch(e){ return function(k){ return (dicts.vi[k] || dicts.en[k] || k); }; } })();

      // ——— Settings page — DSW design system (own left-nav section, like original) ———
      const slots = ctx.get("slots");
      if (slots) {
        slots.inject("settings.section", function(){ return slots.register(
          { name: "settings.section", id: "gdash-parkour", label: function(){ return t("title"); }, order: 20 },
          function(){
            function Toggle(props){
              const checked = !!props.checked;
              return React.createElement("button", {
                type: "button",
                role: "switch",
                "aria-checked": checked,
                "aria-label": props.label || "",
                onClick: function(){ props.onChange(!checked); },
                style: {
                  width: "40px", height: "22px", borderRadius: "999px", padding: "2px",
                  display: "inline-flex", alignItems: "center",
                  background: checked ? "var(--dsw-alias-brand-primary, #4f7cff)" : "var(--dsw-alias-border-l2, rgba(255,255,255,0.16))",
                  border: "1px solid " + (checked ? "var(--dsw-alias-brand-primary, #4f7cff)" : "var(--dsw-alias-border-l1, rgba(255,255,255,0.08))"),
                  cursor: "pointer", transition: "background .16s, border-color .16s", flex: "none"
                }
              }, React.createElement("span", {
                style: {
                  width: "16px", height: "16px", borderRadius: "50%",
                  background: "var(--dsw-alias-bg-layer-1, #fff)",
                  boxShadow: "0 1px 3px rgba(0,0,0,.3)",
                  transform: checked ? "translateX(18px)" : "translateX(0)",
                  transition: "transform .18s cubic-bezier(.22,1,.36,1)"
                }
              }));
            }

            function SettingsCard(){
              const [s, setS] = React.useState(function(){ return Object.assign({}, state); });
              const [openTuning, setOpenTuning] = React.useState(false);
              React.useEffect(function(){ return subscribe(setS); }, []);
              const upd = function(patch){ Object.assign(state, patch); emit(); setS(Object.assign({}, state)); };

              const cardStyle = {
                border: "1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.10))",
                background: "var(--dsw-alias-bg-layer-3, #1e1e1e)",
                borderRadius: "12px",
                overflow: "hidden",
                transition: "border-color .16s, background .16s"
              };
              const headerStyle = {
                display: "flex", alignItems: "center", gap: "12px",
                padding: "14px 16px",
                borderBottom: "1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.10))"
              };
              const iconStyle = {
                width: "36px", height: "36px", borderRadius: "9px",
                background: "#ffd600", border: "1.5px solid #111",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.55), 0 1px 6px rgba(0,0,0,.25)",
                flex: "none"
              };
              const nameStyle = { color: "var(--dsw-alias-label-primary, #f5f5f5)", fontSize: "14px", fontWeight: 600, lineHeight: "1.35" };
              const descStyle = { color: "var(--dsw-alias-label-tertiary, #8a8a8a)", fontSize: "12.5px", lineHeight: "1.5" };
              const bodyStyle = { padding: "14px 16px", display: "flex", flexDirection: "column", gap: "14px", background: "var(--dsw-alias-bg-layer-2, #1a1a1a)" };
              const sectionStyle = {
                background: "var(--dsw-alias-bg-layer-3, #232326)",
                border: "1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.06))",
                borderRadius: "10px", padding: "12px"
              };
              const labelStyle = { fontSize: "12.5px", fontWeight: 600, color: "var(--dsw-alias-label-primary, #f5f5f5)" };
              const hintStyle = { fontSize: "11.5px", color: "var(--dsw-alias-label-tertiary, #8a8a8a)", lineHeight: "1.45", marginTop: "4px" };
              const smallBtn = {
                padding: "5px 10px", borderRadius: "8px",
                border: "1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.12))",
                background: "transparent", color: "var(--dsw-alias-label-secondary, #a8a8a8)",
                fontSize: "12px", lineHeight: "1", cursor: "pointer"
              };
              const primaryBtn = {
                padding: "6px 12px", borderRadius: "8px", border: "1px solid transparent",
                background: "var(--dsw-alias-label-primary, #f5f5f5)", color: "var(--dsw-alias-bg-layer-3, #1a1a1a)",
                fontSize: "12.5px", fontWeight: 600, cursor: "pointer"
              };

              return React.createElement("div", { style: cardStyle },
                // header
                React.createElement("div", { style: headerStyle },
                  React.createElement("div", { style: iconStyle },
                    React.createElement("div", { style: { width: "18px", height: "18px", background: "#111", borderRadius: "2px", display: "flex", alignItems: "center", justifyContent: "center", gap: "2px" } },
                      React.createElement("div", { style: { width: "3.5px", height: "3.5px", background: "#ffd600", borderRadius: "999px" } }),
                      React.createElement("div", { style: { width: "3.5px", height: "3.5px", background: "#ffd600", borderRadius: "999px" } })
                    )
                  ),
                  React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                    React.createElement("div", { style: Object.assign({}, nameStyle, { display: "flex", alignItems: "center", gap: "6px" }) },
                      t("title"),
                      React.createElement("span", { style: { fontSize: "10px", fontWeight: 500, letterSpacing: "0.04em", padding: "1px 5px", borderRadius: "999px", background: "var(--dsw-alias-bg-layer-1, rgba(255,255,255,0.06))", border: "1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.06))", color: "var(--dsw-alias-label-tertiary, #8a8a8a)" } }, t("version"))
                    ),
                    React.createElement("div", { style: { fontSize: "12px", color: "var(--dsw-alias-label-tertiary, #8a8a8a)", lineHeight: "1.3" } }, t("subtitle"))
                  ),
                  React.createElement("div", { style: { display: "flex", alignItems: "center", gap: "8px", flex: "none" } },
                    React.createElement("span", { style: { fontSize: "12px", color: s.enabled ? "var(--dsw-alias-label-primary, #f5f5f5)" : "var(--dsw-alias-label-tertiary, #8a8a8a)", fontWeight: 500 } }, s.enabled ? t("enabledOn") : t("enabledOff")),
                    React.createElement(Toggle, { checked: s.enabled, onChange: function(v){ upd({ enabled: v }); }, label: "enable gdash" })
                  )
                ),
                // body
                React.createElement("div", { style: bodyStyle },
                  React.createElement("div", { style: descStyle }, t("desc")),
                  // quick actions
                  React.createElement("div", { style: { display: "flex", gap: "8px" } },
                    React.createElement("button", { onClick: function(){ upd({ paused: !s.paused }); }, style: Object.assign({}, s.paused ? smallBtn : primaryBtn, { flex: 1, padding: "8px" }) }, s.paused ? t("resume") + " · P" : t("pause") + " · P"),
                    React.createElement("button", { onClick: function(){ window.dispatchEvent(new CustomEvent("gdash-reset")); }, style: Object.assign({}, smallBtn, { padding: "8px 12px" }) }, t("resetPos")),
                    React.createElement("button", { onClick: function(){ window.dispatchEvent(new CustomEvent("gdash-rescan")); }, style: Object.assign({}, smallBtn, { padding: "8px 10px" }) }, t("rescan"))
                  ),
                  // gap section
                  React.createElement("div", { style: sectionStyle },
                    React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" } },
                      React.createElement("span", { style: labelStyle }, t("gap")),
                      React.createElement("span", { style: { fontSize: "12.5px", fontWeight: 700, color: "var(--dsw-alias-label-primary, #f5f5f5)", background: "var(--dsw-alias-bg-layer-1, rgba(255,255,255,0.06))", padding: "2px 7px", borderRadius: "999px", border: "1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.06))" } }, s.gap + "px")
                    ),
                    React.createElement("input", { className: "gdash-range", type: "range", min: 0, max: 80, value: s.gap, disabled: !!s.randomPlatform, onInput: function(e){ if(s.randomPlatform) return; upd({ gap: parseInt(e.target.value, 10) }); }, onChange: function(e){ if(s.randomPlatform) return; upd({ gap: parseInt(e.target.value, 10) }); }, style: { width: "100%", accentColor: "var(--dsw-alias-brand-primary, #4f7cff)", opacity: s.randomPlatform ? 0.45 : 1 } }),
                    React.createElement("div", { style: { display: "flex", gap: "6px", marginTop: "10px" } },
                      React.createElement("button", { onClick: function(){ if(s.randomPlatform) return; upd({ gap: 0 }); }, disabled: !!s.randomPlatform, style: Object.assign({}, smallBtn, s.gap===0 ? { background: "var(--dsw-alias-label-primary, #f5f5f5)", color: "var(--dsw-alias-bg-layer-3, #1a1a1a)", borderColor: "transparent", fontWeight: 600 } : {}, s.randomPlatform ? { opacity: 0.45, cursor: "not-allowed" } : {}) }, "0"),
                      React.createElement("button", { onClick: function(){ if(s.randomPlatform) return; upd({ gap: 24 }); }, disabled: !!s.randomPlatform, style: Object.assign({}, smallBtn, s.gap===24 ? { background: "var(--dsw-alias-label-primary, #f5f5f5)", color: "var(--dsw-alias-bg-layer-3, #1a1a1a)", borderColor: "transparent", fontWeight: 600 } : {}, s.randomPlatform ? { opacity: 0.45, cursor: "not-allowed" } : {}) }, "24"),
                      React.createElement("button", { onClick: function(){ if(s.randomPlatform) return; upd({ gap: 48 }); }, disabled: !!s.randomPlatform, style: Object.assign({}, smallBtn, s.gap===48 ? { background: "var(--dsw-alias-label-primary, #f5f5f5)", color: "var(--dsw-alias-bg-layer-3, #1a1a1a)", borderColor: "transparent", fontWeight: 600 } : {}, s.randomPlatform ? { opacity: 0.45, cursor: "not-allowed" } : {}) }, "48"),
                      React.createElement("button", { onClick: function(){ if(s.randomPlatform) return; upd({ gap: 64 }); }, disabled: !!s.randomPlatform, style: Object.assign({}, smallBtn, s.gap===64 ? { background: "var(--dsw-alias-label-primary, #f5f5f5)", color: "var(--dsw-alias-bg-layer-3, #1a1a1a)", borderColor: "transparent", fontWeight: 600 } : {}, s.randomPlatform ? { opacity: 0.45, cursor: "not-allowed" } : {}) }, "64")
                    ),
                    React.createElement("div", { style: hintStyle }, s.randomPlatform ? "⚠️ " + t("randomPlatformHint") + " — gap tạm tắt" : t("gapHint"))
                  ),
                  // toggles
                  React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "10px" } },
                    React.createElement("label", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", cursor: "pointer", padding: "8px 10px", borderRadius: "8px", background: "var(--dsw-alias-bg-layer-3, #232326)", border: "1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.06))" } },
                      React.createElement("span", { style: { display: "flex", flexDirection: "column", gap: "2px" } },
                        React.createElement("span", { style: { fontSize: "12.5px", fontWeight: 500, color: "var(--dsw-alias-label-primary, #f5f5f5)" } }, t("showColliders")),
                        React.createElement("span", { style: { fontSize: "11px", color: "var(--dsw-alias-label-tertiary, #8a8a8a)", lineHeight: "1.3" } }, t("showCollidersHint"))
                      ),
                      React.createElement(Toggle, { checked: s.showColliders, onChange: function(v){ upd({ showColliders: v }); } })
                    ),
                    React.createElement("label", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", cursor: "pointer", padding: "8px 10px", borderRadius: "8px", background: "var(--dsw-alias-bg-layer-3, #232326)", border: "1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.06))" } },
                      React.createElement("span", { style: { fontSize: "12.5px", fontWeight: 500, color: "var(--dsw-alias-label-primary, #f5f5f5)" } }, t("particles")),
                      React.createElement(Toggle, { checked: s.particles, onChange: function(v){ upd({ particles: v }); } })
                    ),
                    React.createElement("label", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", cursor: "pointer", padding: "8px 10px", borderRadius: "8px", background: s.randomPlatform ? "var(--dsw-alias-bg-layer-1, #232326)" : "var(--dsw-alias-bg-layer-3, #232326)", border: "1px solid " + (s.randomPlatform ? "var(--dsw-alias-brand-primary, #4f7cff)" : "var(--dsw-alias-border-l1, rgba(255,255,255,0.06))") } },
                      React.createElement("span", { style: { display: "flex", flexDirection: "column", gap: "2px" } },
                        React.createElement("span", { style: { fontSize: "12.5px", fontWeight: 500, color: s.randomPlatform ? "var(--dsw-alias-brand-primary, #4f7cff)" : "var(--dsw-alias-label-primary, #f5f5f5)" } }, t("randomPlatform")),
                        React.createElement("span", { style: { fontSize: "11px", color: "var(--dsw-alias-label-tertiary, #8a8a8a)", lineHeight: "1.3" } }, t("randomPlatformHint"))
                      ),
                      React.createElement(Toggle, { checked: s.randomPlatform, onChange: function(v){
                        upd({ randomPlatform: v });
                        if (v) { try{ window.dispatchEvent(new CustomEvent("gdash-random-enter")); }catch(e){} } else { try{ window.dispatchEvent(new CustomEvent("gdash-random-exit")); }catch(e){} }
                      } })
                    ),
                    s.randomPlatform ? React.createElement("button", { onClick: function(){ try{ window.dispatchEvent(new CustomEvent("gdash-random-shuffle")); }catch(e){} }, style: Object.assign({}, { padding: "7px 10px", borderRadius: "8px", border: "1px solid var(--dsw-alias-border-l2, rgba(255,255,255,0.12))", background: "var(--dsw-alias-label-primary, #f5f5f5)", color: "var(--dsw-alias-bg-layer-3, #1a1a1a)", fontSize: "12px", fontWeight: 600, cursor: "pointer", width: "100%" }) }, "🎲 " + t("shuffle")) : null
                  ),
                  // stats
                  React.createElement("div", { style: sectionStyle },
                    React.createElement("div", { style: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px"} },
                      React.createElement("span", {style: labelStyle}, "Stats & Highscore"),
                      React.createElement("span", {style: {fontSize:"11px", color:"var(--dsw-alias-label-tertiary)"}}, "Lưu localStorage")
                    ),
                    React.createElement("div", { style: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginBottom:"8px"} },
                      React.createElement("div", {style:{background:"var(--dsw-alias-bg-layer-1, rgba(255,255,255,0.04))", border:"1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.06))", borderRadius:"8px", padding:"8px", textAlign:"center"}},
                        React.createElement("div", {style:{fontSize:"11px", color:"var(--dsw-alias-label-tertiary)"}}, "SCORE"),
                        React.createElement("div", {style:{fontSize:"18px", fontWeight:800, color:"var(--dsw-alias-label-primary)"}}, String(score))
                      ),
                      React.createElement("div", {style:{background:"var(--dsw-alias-bg-layer-1, rgba(255,255,255,0.04))", border:"1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.06))", borderRadius:"8px", padding:"8px", textAlign:"center"}},
                        React.createElement("div", {style:{fontSize:"11px", color:"var(--dsw-alias-label-tertiary)"}}, "HIGH"),
                        React.createElement("div", {style:{fontSize:"18px", fontWeight:800, color:"#ffd600"}}, String(s.highscore||0))
                      )
                    ),
                    React.createElement("button", { onClick: function(){ state.highscore=0; score=0; saveState(state); upd({highscore:0}); updateHUD(); }, style: Object.assign({}, smallBtn, {width:"100%"})}, "Reset highscore")
                  ),
                  // game objects
                  React.createElement("div", {style: sectionStyle},
                    React.createElement("div", {style: {fontSize:"12.5px", fontWeight:600, color:"var(--dsw-alias-label-primary)", marginBottom:"10px"}}, "Enemies / Coins / Power-ups"),
                    React.createElement("div", {style:{display:"flex", justifyContent:"space-between", alignItems:"center"}},
                      React.createElement("span", {style:{fontSize:"12px", color:"var(--dsw-alias-label-secondary)"}}, "Enemies"),
                      React.createElement("span", {style:{fontSize:"12px", fontWeight:600, color:"var(--dsw-alias-label-primary)"}}, String(s.enemyCount))
                    ),
                    React.createElement("input", {className:"gdash-range", type:"range", min:0, max:6, step:1, value:s.enemyCount, onInput:function(e){ const v=parseInt(e.target.value,10); upd({enemyCount:v}); ctx.timeout(function(){ spawnGameObjects(); }, 120); }, style:{width:"100%"}}),
                    React.createElement("div", {style:{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"8px"}},
                      React.createElement("span", {style:{fontSize:"12px", color:"var(--dsw-alias-label-secondary)"}}, "Enemy speed"),
                      React.createElement("span", {style:{fontSize:"12px", fontWeight:600, color:"var(--dsw-alias-label-primary)"}}, String(s.enemySpeed))
                    ),
                    React.createElement("input", {className:"gdash-range", type:"range", min:0.6, max:2.2, step:0.1, value:s.enemySpeed, onInput:function(e){ const v=Math.round(parseFloat(e.target.value)*10)/10; upd({enemySpeed:v}); enemies.forEach(function(en){ en.vx = Math.sign(en.vx||1) * 1.0 * v; }); }, style:{width:"100%"}}),
                    React.createElement("div", {style:{display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:"8px"}},
                      React.createElement("span", {style:{fontSize:"12px", color:"var(--dsw-alias-label-secondary)"}}, "Coins"),
                      React.createElement("span", {style:{fontSize:"12px", fontWeight:600, color:"var(--dsw-alias-label-primary)"}}, String(s.coinCount))
                    ),
                    React.createElement("input", {className:"gdash-range", type:"range", min:0, max:15, step:1, value:s.coinCount, onInput:function(e){ const v=parseInt(e.target.value,10); upd({coinCount:v}); ctx.timeout(function(){ spawnGameObjects(); }, 120); }, style:{width:"100%"}}),
                    React.createElement("label", {style:{display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px", cursor:"pointer", marginTop:"10px", padding:"7px 9px", borderRadius:"8px", background:"var(--dsw-alias-bg-layer-1, rgba(255,255,255,0.03))", border:"1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.06))"}},
                      React.createElement("span", {style:{fontSize:"12px", fontWeight:500, color:"var(--dsw-alias-label-primary)"}}, "Power-up ★"),
                      React.createElement(Toggle, {checked: !!s.powerupEnabled, onChange:function(v){ upd({powerupEnabled: v}); ctx.timeout(function(){ spawnGameObjects(); }, 120); }})
                    )
                  ),
                  // tuning
                  React.createElement("div", { style: Object.assign({}, sectionStyle, { padding: 0, overflow: "hidden" }) },
                    React.createElement("button", {
                      type: "button",
                      onClick: function(){ setOpenTuning(function(v){ return !v; }); },
                      style: {
                        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px",
                        padding: "10px 12px", background: "transparent", border: "none", cursor: "pointer",
                        color: "var(--dsw-alias-label-primary, #f5f5f5)", fontSize: "12.5px", fontWeight: 600
                      }
                    },
                      React.createElement("span", null, t("jumpTuning")),
                      React.createElement("span", { style: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: "20px", height: "20px", borderRadius: "6px", border: "1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.08))", background: "var(--dsw-alias-bg-layer-1, rgba(255,255,255,0.04))", transform: openTuning ? "rotate(180deg)" : "rotate(0deg)", transition: "transform .16s" } }, "⌄")
                    ),
                    openTuning ? React.createElement("div", { style: { padding: "0 12px 12px", display: "flex", flexDirection: "column", gap: "10px", borderTop: "1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.06))", marginTop: "0", paddingTop: "12px" } },
                      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } },
                        React.createElement("span", { style: { fontSize: "12px", color: "var(--dsw-alias-label-secondary, #a8a8a8)" } }, t("jumpForce")),
                        React.createElement("span", { style: { fontSize: "12px", fontWeight: 600, color: "var(--dsw-alias-label-primary, #f5f5f5)", minWidth: "48px", textAlign: "right" } }, String(s.jump))
                      ),
                      React.createElement("input", { className: "gdash-range", type: "range", min: -14, max: -7, step: 0.2, value: s.jump, onInput: function(e){ upd({ jump: parseFloat(e.target.value) }); }, onChange: function(e){ upd({ jump: parseFloat(e.target.value) }); }, style: { width: "100%" } }),
                      React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2px" } },
                        React.createElement("span", { style: { fontSize: "12px", color: "var(--dsw-alias-label-secondary, #a8a8a8)" } }, t("gravity")),
                        React.createElement("span", { style: { fontSize: "12px", fontWeight: 600, color: "var(--dsw-alias-label-primary, #f5f5f5)", minWidth: "48px", textAlign: "right" } }, String(s.gravity))
                      ),
                      React.createElement("input", { className: "gdash-range", type: "range", min: 0.5, max: 1.2, step: 0.02, value: s.gravity, onInput: function(e){ upd({ gravity: parseFloat(e.target.value) }); }, onChange: function(e){ upd({ gravity: parseFloat(e.target.value) }); }, style: { width: "100%" } }),
                      React.createElement("button", { onClick: function(){ upd({ jump: -10.0, gravity: 0.82 }); }, style: Object.assign({}, smallBtn, { alignSelf: "flex-start", marginTop: "4px" }) }, t("resetSnap"))
                    ) : null
                  ),
                  React.createElement("div", { style: { fontSize: "11.5px", lineHeight: "1.5", color: "var(--dsw-alias-label-secondary, #a8a8a8)", background: "var(--dsw-alias-bg-layer-1, rgba(255,255,255,0.04))", border: "1px solid var(--dsw-alias-border-l1, rgba(255,255,255,0.06))", padding: "8px 10px", borderRadius: "8px" } }, t("tip")),
                  React.createElement("div", { style: { fontSize: "11px", color: "var(--dsw-alias-label-tertiary, #7a7a7a)", lineHeight: "1.45", textAlign: "center", marginTop: "-2px" } }, t("controls"))
                )
              );
            }
            return React.createElement(SettingsCard, null);
          }
        ); });
      }

      // ——— Game overlay ———
      let overlay = null, world = null, colliderLayer = null, particleLayer = null, playerEl = null;
      let rafId = 0;
      let colliders = [], colliderDivs = [];
      const originalMargins = new Map();
      const originalTransforms = new Map();
      let pendingGapCollect = null, moDebounce = null;
      let draggedEl = null, dragStart = { x: 0, y: 0 }, dragOrig = { x: 0, y: 0 }, isDragging = false;
      let playerDragging = false, playerDragOff = { x: 0, y: 0 };
      let randomTransitioning = false;
      let enemies = []; let coins = []; let powerups = [];
      let enemyLayer=null, coinLayer=null, powerupLayer=null, hudEl=null;
      let score = 0; let coinsCollected = 0; let invincibleUntil = 0;

      function updateHUD(){
        if (!hudEl) return;
        const hs = state.highscore || 0;
        const inv = Date.now() < invincibleUntil ? " ★" + Math.ceil((invincibleUntil - Date.now())/1000) + "s" : "";
        hudEl.textContent = "Score " + score + " · High " + hs + " · Coins " + coins.filter(function(c){ return !c.collected; }).length + " left" + inv;
      }
      function addScore(n){
        score += n;
        if (score > (state.highscore||0)) { state.highscore = score; saveState(state); }
        updateHUD();
        // also notify settings UI via emit
        emit();
      }
      function clearGameObjects(){
        enemies.forEach(function(e){ try{ e.el.remove(); }catch(_){}}); enemies=[];
        coins.forEach(function(c){ try{ c.el.remove(); }catch(_){}}); coins=[];
        powerups.forEach(function(p){ try{ p.el.remove(); }catch(_){}}); powerups=[];
      }
      function spawnGameObjects(){
        clearGameObjects();
        if (!state.enabled || !overlay) return;
        const plats = colliders.filter(function(c){ return c.el !== null && isFinite(c.left) && isFinite(c.right); });
        if (plats.length === 0) return;
        // shuffle copy
        const shuffled = plats.slice().sort(function(){ return Math.random()-0.5; });
        // enemies
        const ec = Math.min(Math.max(0, parseInt(state.enemyCount,10)||0), shuffled.length);
        for (let i=0;i<ec;i++){
          const plat = shuffled[i];
          const el = document.createElement("div");
          el.className = "gdash-enemy";
          el.style.cssText = "position:absolute;width:18px;height:18px;background:#ff4d4d;border:2px solid #111;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,.3);pointer-events:none;will-change:transform;display:flex;align-items:center;justify-content:center;";
          el.innerHTML = '<div style="position:absolute;inset:3px 2px 4px 2px;background:#111;border-radius:1px;display:flex;align-items:center;justify-content:center;gap:2px"><div style="width:3px;height:3px;background:#fff;border-radius:50%"></div><div style="width:3px;height:3px;background:#fff;border-radius:50%"></div></div><div style="position:absolute;bottom:2px;left:3px;right:3px;height:2px;background:#111;border-radius:1px"></div>';
          enemyLayer.appendChild(el);
          const dir = Math.random()<0.5 ? -1 : 1;
          const platW = plat.right - plat.left;
          const startX = plat.left + Math.max(4, (platW - 18)/2 + (Math.random()*20-10));
          enemies.push({ el: el, x: startX, y: plat.top - 20, w:18, h:18, vx: dir * 1.0 * (parseFloat(state.enemySpeed)||1.0), platform: plat, dir: dir });
        }
        // coins
        const remainingForCoins = shuffled.slice(ec);
        const cc = Math.min(Math.max(0, parseInt(state.coinCount,10)||0), remainingForCoins.length);
        for (let i=0;i<cc;i++){
          const plat = remainingForCoins[i];
          const el = document.createElement("div");
          el.className = "gdash-coin";
          el.style.cssText = "position:absolute;width:12px;height:12px;background:radial-gradient(circle at 30% 30%, #ffec8b, #ffd600 60%, #b89600);border:1.5px solid #7a5a00;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.7);pointer-events:none;will-change:transform;display:flex;align-items:center;justify-content:center;font-size:7px;color:#7a5a00;font-weight:700;";
          el.textContent = "●";
          coinLayer.appendChild(el);
          const platW = plat.right - plat.left;
          const rx = plat.left + 6 + Math.random() * Math.max(0, platW - 18);
          const offX = rx - plat.left;
          coins.push({ el: el, x: rx, y: plat.top - 18, w:12, h:12, collected:false, platform: plat, offX: offX });
        }
        // powerups
        if (state.powerupEnabled) {
          const remainingForPower = remainingForCoins.slice(cc);
          if (remainingForPower.length > 0 && Math.random() < (parseFloat(state.powerupRate)||0.15) + 0.25) {
            const plat = remainingForPower[Math.floor(Math.random()*remainingForPower.length)];
            const el = document.createElement("div");
            el.className = "gdash-power";
            el.style.cssText = "position:absolute;width:16px;height:16px;background:radial-gradient(circle at 30% 30%, #8ab4ff, #4f7cff);border:2px solid #111;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,.3);pointer-events:none;will-change:transform;display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:800;";
            el.textContent = "★";
            powerupLayer.appendChild(el);
            const offPX = (plat.left+plat.right)/2 -8 - plat.left;
            powerups.push({ el: el, x: (plat.left+plat.right)/2 -8, y: plat.top - 20, w:16, h:16, type:"star", platform: plat, offX: offPX });
          }
        }
        updateHUD();
      }
      function updateEnemies(){
        // update enemies patrol
        for (const e of enemies){
          e.x += e.vx;
          let curPlat = null;
          for (const c of colliders) if (c.el === e.platform.el) { curPlat = c; break; }
          if (curPlat) { e.platform = curPlat; }
          const l = e.platform.left, r = e.platform.right;
          if (e.x < l) { e.x = l; e.vx *= -1; }
          if (e.x + e.w > r) { e.x = r - e.w; e.vx *= -1; }
          e.el.style.left = e.x + "px";
          e.el.style.top = e.y + "px";
          e.y = e.platform.top - 20;
        }
        // sync coins/powerups to moving platforms (scroll / shuffle)
        for (const c of coins) if (!c.collected && c.platform) {
          let cur=null; for (const p of colliders) if (p.el===c.platform.el) { cur=p; break; }
          if (cur) { c.platform=cur; c.x = cur.left + (c.offX||0); c.y = cur.top - 18; c.el.style.left = c.x+"px"; c.el.style.top = c.y+"px"; }
        }
        for (const p of powerups) {
          let cur=null; for (const c of colliders) if (c.el===p.platform.el) { cur=c; break; }
          if (cur) { p.platform=cur; p.x = cur.left + (p.offX||0); p.y = cur.top -20; p.el.style.left = p.x+"px"; p.el.style.top = p.y+"px"; }
        }
      }
      function checkObjectCollisions(){
        if (!overlay) return;
        const px = player.x, py = player.y, pw = player.w, ph = player.h;
        // coins
        for (const c of coins) if (!c.collected) {
          if (px < c.x + c.w && px + pw > c.x && py < c.y + c.h && py + ph > c.y) {
            c.collected = true; try{ c.el.style.transition="transform 0.3s ease, opacity 0.3s ease"; c.el.style.transform="scale(1.6)"; c.el.style.opacity="0"; }catch(_){}
            (function(coin){ ctx.timeout(function(){ try{ coin.el.remove(); }catch(_){}}, 320); })(c);
            addScore(10);
            spawnParticles(c.x + c.w/2, c.y + c.h/2, 6, "#ffd600");
            coinsCollected++;
          }
        }
        // powerups
        for (let i=powerups.length-1; i>=0; i--){
          const p = powerups[i];
          if (px < p.x + p.w && px + pw > p.x && py < p.y + p.h && py + ph > p.y) {
            invincibleUntil = Date.now() + 5000;
            try{ p.el.remove(); }catch(_){}
            powerups.splice(i,1);
            addScore(25);
            spawnParticles(p.x + p.w/2, p.y + p.h/2, 10, "#4f7cff");
            updateHUD();
            // visual on player
            if (playerEl) { playerEl.style.boxShadow="0 0 0 3px rgba(79,124,255,0.85), 0 2px 8px rgba(0,0,0,.35), inset 0 0 0 1.5px rgba(255,255,255,.6)"; ctx.timeout(function(){ if(playerEl) playerEl.style.boxShadow="0 2px 8px rgba(0,0,0,0.35), inset 0 0 0 1.5px rgba(255,255,255,0.6)"; }, 5200); }
          }
        }
        // enemies
        const inv = Date.now() < invincibleUntil;
        for (let i=enemies.length-1; i>=0; i--){
          const e = enemies[i];
          if (px < e.x + e.w && px + pw > e.x && py < e.y + e.h && py + ph > e.y) {
            if (inv) {
              try{ e.el.style.transform="scale(0)"; e.el.style.opacity="0"; }catch(_){}
              (function(enemy){ ctx.timeout(function(){ try{ enemy.el.remove(); }catch(_){}}, 280); })(e);
              enemies.splice(i,1);
              addScore(30);
              spawnParticles(e.x + e.w/2, e.y+e.h/2, 8, "#ff4d4d");
            } else {
              // hit without powerup: penalty and reset
              addScore(-15); if(score<0) score=0; updateHUD();
              spawnParticles(px+pw/2, py+ph/2, 7, "#ff4d4d");
              resetPlayer();
              // brief invincibility
              invincibleUntil = Date.now() + 1200;
              break;
            }
          }
        }
        // update enemy/coin/powerup DOM positions (coins static, but need after shuffle)
        for (const c of coins) if(!c.collected){ c.el.style.left = c.x + "px"; c.el.style.top = c.y + "px"; }
        for (const p of powerups){ p.el.style.left = p.x + "px"; p.el.style.top = p.y + "px"; }
      }

      function getChatElementsForRandom(){
        const root = getChatRoot();
        let cands; try { cands = root.querySelectorAll("div, article, section, li, p"); } catch(e){ cands = []; }
        const out = [];
        for (const el of cands){
          if (el.closest("#gdash-overlay")) continue;
          if (el.id === "gdash-gap-style" || el.id === "gdash-parkour-global") continue;
          try {
            const cs = getComputedStyle(el);
            if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") continue;
            const r = el.getBoundingClientRect();
            if (r.width < 14 || r.height < 12) continue;
            if (r.right < LEFT_CUTOFF) continue;
            if (!isChatText(el, r, cs) && !isChatOrFloating(el, r, cs)) continue;
            out.push(el);
          } catch(e){}
        }
        // keep leaves only — each bubble, not containers
        return out.filter(function(el){ return !out.some(function(a){ return a !== el && el.contains(a); }); });
      }
      function arrangeRandomPlatforms(shouldShuffle){
        const elems = getChatElementsForRandom();
        if (elems.length === 0) return;
        const vw = window.innerWidth, vh = window.innerHeight;
        const startX = LEFT_CUTOFF + 24;
        const availW = Math.max(200, vw - startX - 24);
        // if gap active, temporarily clear it for clean platform calc
        // store current gap margins but set to 0 for layout calc
        const cols = Math.max(3, Math.min(6, Math.floor(availW / 165)));
        const gapX = Math.floor(availW / cols);
        const baseY = vh * 0.62;
        const stepY = 88;
        let ordered = elems.slice();
        if (shouldShuffle) ordered.sort(function(){ return Math.random() - 0.5; });
        ordered.forEach(function(el){
          if (!originalTransforms.has(el)) originalTransforms.set(el, el.style.transform || "");
          if (!el.dataset.gdashOrigTransition) el.dataset.gdashOrigTransition = el.style.transition || "";
        });
        randomTransitioning = true;
        ordered.forEach(function(el, idx){
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          const jitterX = (Math.random()*26 - 13);
          const jitterY = (Math.random()*18 - 9);
          const targetLeft = startX + col * gapX + jitterX + 10;
          const rowWobble = (cols - col) * 5;
          const targetTop = baseY - row * stepY - rowWobble + jitterY;
          const r = el.getBoundingClientRect();
          const dx = targetLeft - r.left;
          const dy = targetTop - r.top;
          const origTr = originalTransforms.get(el) || "";
          const m = origTr.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)/);
          const ox = m ? parseFloat(m[1]) : 0;
          const oy = m ? parseFloat(m[2]) : 0;
          const newX = ox + dx;
          const newY = oy + dy;
          el.style.transition = "transform 0.72s cubic-bezier(0.22,1,0.36,1)";
          el.style.transitionDelay = (col * 26 + row * 20) + "ms";
          el.style.marginBottom = "0px";
          el.style.transform = "translate(" + newX + "px, " + newY + "px)";
        });
        ctx.timeout(function(){
          randomTransitioning = false;
          ordered.forEach(function(el){ el.style.transitionDelay = ""; });
          collectColliders();
          spawnGameObjects();
          if (state.particles){
            ordered.slice(0, Math.min(ordered.length, 12)).forEach(function(el){
              const rr = el.getBoundingClientRect();
              spawnParticles(rr.left + rr.width * 0.5, rr.top - 2, 3, "#ffd600");
              if (Math.random() < 0.5) spawnParticles(rr.left + 12, rr.top + rr.height*0.5, 2, "#4f7cff");
            });
          }
        }, 900);
      }
      function restoreRandomPlatforms(){
        const elems = getChatElementsForRandom();
        elems.forEach(function(el){
          const orig = originalTransforms.get(el);
          el.style.transition = "transform 0.58s cubic-bezier(0.22,1,0.36,1)";
          el.style.transform = orig || "";
          if (originalMargins.has(el)) el.style.marginBottom = originalMargins.get(el);
          else el.style.marginBottom = "";
          el.style.transitionDelay = "";
        });
        ctx.timeout(function(){
          elems.forEach(function(el){
            el.style.transition = el.dataset.gdashOrigTransition || "";
            try{ delete el.dataset.gdashOrigTransition; }catch(e){ el.dataset.gdashOrigTransition = ""; }
          });
          if (state.gap > 0) applyGap(state.gap); else collectColliders();
          ctx.timeout(function(){ spawnGameObjects(); }, 120);
        }, 640);
      }

      const player = { x: 320, y: 120, vx: 0, vy: 0, w: 22, h: 22, onGround: false, rot: 0, coyote: 0, jumpBuffer: 0, jumpStartRot: 0 };
      const keys = {};

      function isTyping() {
        const el = document.activeElement;
        if (!el) return false;
        const t = el.tagName;
        if (t === "INPUT" || t === "TEXTAREA" || t === "SELECT") return true;
        if (el.isContentEditable) return true;
        if (el.closest && el.closest('[contenteditable="true"]')) return true;
        return false;
      }
      function isInLeftTab(el, rect) {
        if (rect.left < LEFT_CUTOFF) return true;
        if (el.closest('nav, aside, [role="navigation"], [class*="sidebar"], [class*="Sidebar"], [id*="sidebar"], [class*="workspace"]')) return true;
        return false;
      }
      function isComposerOrHeader(el){
        return !!el.closest('form, [class*="composer"], [class*="input"], [class*="prompt"], header, footer, [class*="title-bar"], [class*="header"]');
      }
      function isBackgroundExcluded(el, rect, cs) {
        const tag = el.tagName;
        if (tag === "HEADER" || tag === "FOOTER" || tag === "NAV") return true;
        if (isComposerOrHeader(el) && (rect.height < 140 || rect.width > window.innerWidth * 0.5)) {
          if (rect.height > 50 && rect.width > 300) return true;
        }
        const cls = (el.className && typeof el.className === "string") ? el.className.toLowerCase() : "";
        const bgKeywords = ["top-bar", "title-bar", "composer", "chat-container", "conversation-container", "space-header", "background", "wrapper"];
        for (const kw of bgKeywords) {
          if (cls.includes(kw) && (rect.height > 60 || rect.width > 450)) return true;
        }
        if ((cs.overflowY === "auto" || cs.overflowY === "scroll" || cs.overflow === "auto") && rect.height > 280 && el.children.length > 4) return true;
        if (rect.width > window.innerWidth * 0.85 && rect.height > 220 && el.children.length > 6) return true;
        if (rect.top < 70 && rect.height < 110 && rect.width > window.innerWidth * 0.55) return true;
        return false;
      }
      function isChatText(el, rect, cs) {
        if (isInLeftTab(el, rect)) return false;
        if (isBackgroundExcluded(el, rect, cs)) return false;
        if (rect.left < LEFT_CUTOFF) return false;
        if (isComposerOrHeader(el)) return false;
        const text = (el.innerText || "").trim();
        // strong signal: DSH bubble / markdown containers — be permissive
        let cls = ""; try { cls = (el.className && typeof el.className === "string") ? el.className : ""; } catch(e){}
        let isBubbleish = false; try { if (el.matches && el.matches('[class*="bubble"], [class*="Markdown"], [class*="markdown"], [class*="userStack"], [class*="userRow"]')) isBubbleish = true; } catch(e){}
        if (cls.includes("bubble") || cls.includes("Markdown") || cls.includes("markdown")) isBubbleish = true;
        if (isBubbleish) {
          if (text.length >= 1 && text.length <= 8000 && rect.width >= 80 && rect.width <= 1100 && rect.height >= 14 && rect.height <= 800) return true;
        }
        if (text.length < 2 || text.length > 8000) return false;
        if (el.children.length > 22) return false;
        if (rect.width < 80 || rect.width > 980) return false;
        if (rect.height < 14 || rect.height > 800) return false;
        const inChatArea = el.closest('main, [role="main"], [class*="conversation"], [class*="chat"], [data-testid*="conversation"]') !== null;
        if (!inChatArea) {
          if (rect.left < LEFT_CUTOFF + 30) return false;
        }
        return true;
      }
      function isChatOrFloating(el, rect, cs) {
        if (isInLeftTab(el, rect)) return false;
        if (isBackgroundExcluded(el, rect, cs)) return false;
        if (rect.left < LEFT_CUTOFF) return false;
        const vw = window.innerWidth;
        const pos = cs.position;
        const isFloating = (pos === "fixed" || pos === "absolute") && rect.width < vw * 0.7 && rect.height < 420;
        if (isFloating) {
          if (rect.width < 12 || rect.height < 10) return false;
          return true;
        }
        return isChatText(el, rect, cs);
      }

      function getChatRoot(){
        return document.querySelector('main') || document.querySelector('[class*="conversation"]') || document.body;
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
          ctx.timeout(function(){ try { p.remove(); } catch (e) {} }, 700);
        }
      }

      function collectColliders() {
        try {
          for (const k of Array.from(originalMargins.keys())) if (!document.body.contains(k)) originalMargins.delete(k);
          for (const k of Array.from(originalTransforms.keys())) if (!document.body.contains(k)) originalTransforms.delete(k);
        } catch (e) {}
        colliders = [];
        const vw = window.innerWidth, vh = window.innerHeight;
        const root = getChatRoot();
        let candidates;
        try { candidates = root.querySelectorAll("div, article, section, li, p"); } catch (e) { candidates = document.body.querySelectorAll("div, article, section, li, p"); }
        const seen = new Set();
        for (const el of candidates) {
          if (seen.has(el)) continue;
          if (el.closest("#gdash-overlay")) continue;
          if (el.id === "gdash-gap-style" || el.id === "gdash-parkour-global") continue;
          let cs; try { cs = getComputedStyle(el); } catch (e) { continue; }
          if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") continue;
          const r = el.getBoundingClientRect();
          if (r.width < 14 || r.height < 12) continue;
          if (r.right < LEFT_CUTOFF || r.left > vw || r.bottom < 0 || r.top > vh) continue;
          if (r.width > vw * 0.97 && r.height > vh * 0.86) continue;
          if (!isChatOrFloating(el, r, cs)) continue;
          // keep leaves only: prefer smallest bubble, not giant containers
          let shouldSkip = false;
          for (let i = colliders.length - 1; i >= 0; i--) {
            const c = colliders[i];
            if (!c.el) continue;
            if (c.el.contains(el)) {
              // existing is ancestor -> remove ancestor, keep leaf
              colliders.splice(i, 1);
            } else if (el.contains(c.el)) {
              // new is ancestor of existing leaf -> skip new
              shouldSkip = true;
              break;
            }
          }
          if (shouldSkip) continue;
          const isFloating = cs.position === "fixed" || cs.position === "absolute";
          const insetX = isFloating ? 1 : 4;
          const insetY = isFloating ? 2 : 4;
          colliders.push({
            left: r.left + insetX,
            top: r.top + insetY,
            right: r.right - insetX,
            bottom: r.bottom - insetY,
            el: el,
            raw: { left: r.left, top: r.top, right: r.right, bottom: r.bottom }
          });
          seen.add(el);
        }
        colliders.push({ left: LEFT_CUTOFF - 20, top: vh - 4, right: vw + 100, bottom: vh + 100, el: null });
        colliders.push({ left: LEFT_CUTOFF - 20, top: -100, right: LEFT_CUTOFF, bottom: vh + 100, el: null });
        colliders.push({ left: vw, top: -100, right: vw + 20, bottom: vh + 100, el: null });
        colliders.push({ left: LEFT_CUTOFF - 100, top: -20, right: vw + 100, bottom: 0, el: null });
        renderColliders();
      }

      function renderColliders() {
        if (!colliderLayer) return;
        colliderDivs.forEach(function(d){ try{ d.remove(); }catch(e){} }); colliderDivs = [];
        if (!state.showColliders) return;
        for (const c of colliders) {
          if (c.el === null) continue;
          const d = document.createElement("div");
          d.style.cssText = "position:absolute;left:" + c.left + "px;top:" + c.top + "px;width:" + (c.right - c.left) + "px;height:" + (c.bottom - c.top) + "px;border:1px solid rgba(255,60,60,0.9);background:rgba(255,60,60,0.07);border-radius:6px;pointer-events:none;box-sizing:border-box;";
          d.title = "Alt+drag để dời";
          colliderLayer.appendChild(d); colliderDivs.push(d);
        }
      }

      function clearGap() {
        try { const gs = document.getElementById("gdash-gap-style"); if (gs) gs.textContent = ""; } catch (e) {}
        originalMargins.forEach(function(v, el){ try { el.style.marginBottom = v; el.classList.remove("gdash-gap-anim"); } catch (e) {} });
      }

      function applyGap(newGap) {
        if (!state.enabled) { clearGap(); return; }
        if (state.randomPlatform) return; // random mode owns layout
        state.gap = clamp(newGap, 0, 80);
        const gapStyle = document.getElementById("gdash-gap-style");
        if (gapStyle) gapStyle.textContent = "";
        if (state.gap === 0) {
          clearGap();
          if (pendingGapCollect) { try{ pendingGapCollect(); }catch(e){} pendingGapCollect=null; }
          pendingGapCollect = ctx.timeout(function(){ pendingGapCollect = null; collectColliders(); }, 80);
          emit();
          return;
        }
        const root = getChatRoot();
        let candidates; try { candidates = root.querySelectorAll("div, article, section, li, p"); } catch(e){ candidates = document.body.querySelectorAll("div, article, section, li, p"); }
        let animatedCount = 0;
        for (const el of candidates) {
          if (el.closest("#gdash-overlay")) continue;
          let r, cs; try { r = el.getBoundingClientRect(); cs = getComputedStyle(el); } catch(e){ continue; }
          if (!isChatText(el, r, cs)) continue;
          if (!originalMargins.has(el)) originalMargins.set(el, el.style.marginBottom);
          el.style.marginBottom = state.gap + "px";
          el.classList.add("gdash-gap-anim");
          if (state.particles && animatedCount < 10) {
            const rr = el.getBoundingClientRect();
            spawnParticles(rr.left + rr.width * 0.5, rr.bottom - 2, 3, "#ffd600");
          }
          animatedCount++;
          (function(node){ ctx.timeout(function(){ try{ node.classList.remove("gdash-gap-anim"); }catch(e){} }, 520); })(el);
        }
        if (pendingGapCollect) { try{ pendingGapCollect(); }catch(e){} }
        pendingGapCollect = ctx.timeout(function(){ pendingGapCollect = null; collectColliders(); }, 90);
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
        colliderLayer.style.cssText = "position:absolute;inset:0;pointer-events:none;";
        world.appendChild(colliderLayer);
        enemyLayer = document.createElement("div");
        enemyLayer.style.cssText = "position:absolute;inset:0;pointer-events:none;";
        world.appendChild(enemyLayer);
        coinLayer = document.createElement("div");
        coinLayer.style.cssText = "position:absolute;inset:0;pointer-events:none;";
        world.appendChild(coinLayer);
        powerupLayer = document.createElement("div");
        powerupLayer.style.cssText = "position:absolute;inset:0;pointer-events:none;";
        world.appendChild(powerupLayer);
        particleLayer = document.createElement("div");
        particleLayer.style.cssText = "position:absolute;inset:0;pointer-events:none;overflow:hidden;";
        world.appendChild(particleLayer);
        // HUD
        hudEl = document.createElement("div");
        hudEl.style.cssText = "position:absolute;top:10px;left:50%;transform:translateX(-50%);background:rgba(18,18,20,0.94);color:#f5f5f5;padding:6px 12px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:0.02em;border:1px solid rgba(255,255,255,0.10);pointer-events:none;box-shadow:0 4px 18px rgba(0,0,0,.35);display:flex;align-items:center;gap:6px;white-space:nowrap;";
        hudEl.textContent = "Score 0 · High " + (state.highscore||0);
        world.appendChild(hudEl);
        playerEl = document.createElement("div");
        playerEl.style.cssText = "position:absolute;width:22px;height:22px;background:#ffd600;border:2px solid #111;border-radius:3px;box-shadow:0 2px 8px rgba(0,0,0,0.35), inset 0 0 0 1.5px rgba(255,255,255,0.6);pointer-events:auto;will-change:transform;cursor:grab;touch-action:none;";
        playerEl.title = "Kéo để di chuyển — Alt+drag bubble để dời block";
        playerEl.innerHTML = '<div style="position:absolute;inset:4px 4px 6px 4px;background:#111;border-radius:1px;display:flex;align-items:center;justify-content:center;gap:2px"><div style="width:4px;height:4px;background:#ffd600;border-radius:50%"></div><div style="width:4px;height:4px;background:#ffd600;border-radius:50%"></div></div><div style="position:absolute;bottom:2px;left:3px;right:3px;height:2px;background:#111;border-radius:1px"></div>';
        world.appendChild(playerEl);

        playerEl.addEventListener("mousedown", function(e){
          e.preventDefault(); e.stopPropagation();
          playerDragging = true; if (playerEl) playerEl.style.cursor = "grabbing";
          playerDragOff = { x: e.clientX - player.x, y: e.clientY - player.y };
          document.addEventListener("mousemove", onPlayerDrag);
          document.addEventListener("mouseup", endPlayerDrag);
        });
        playerEl.addEventListener("touchstart", function(e){
          const t = e.touches[0]; if (!t) return;
          e.preventDefault();
          playerDragging = true;
          playerDragOff = { x: t.clientX - player.x, y: t.clientY - player.y };
          document.addEventListener("touchmove", onPlayerDragTouch, { passive: false });
          document.addEventListener("touchend", endPlayerDragTouch);
        }, { passive: false });

        let gapStyle = document.getElementById("gdash-gap-style");
        if (!gapStyle) { gapStyle = document.createElement("style"); gapStyle.id = "gdash-gap-style"; document.head.appendChild(gapStyle); }
        if (state.gap > 0 && !state.randomPlatform) applyGap(state.gap);
        collectColliders();
        spawnGameObjects();
        updateHUD();
        startLoop();
      }

      function destroyOverlay() {
        if (rafId) try { window.cancelAnimationFrame(rafId); } catch (e) {}
        rafId = 0;
        try{ clearGameObjects(); }catch(e){}
        if (overlay) try { overlay.remove(); } catch (e) {}
        overlay = world = colliderLayer = particleLayer = playerEl = enemyLayer = coinLayer = powerupLayer = hudEl = null;
        colliderDivs = []; colliders = [];
        clearGap();
        originalTransforms.forEach(function(v, el){ try { el.style.transform = v; } catch (e) {} });
        originalTransforms.clear();
        score = 0; coinsCollected = 0; invincibleUntil = 0;
      }

      function onAltDragStart(e) {
        if (!state.enabled || !e.altKey) return;
        const target = e.target;
        if (!target || target.closest("#gdash-overlay")) return;
        let cand = target;
        for (let i=0;i<4 && cand; i++){
          if (cand === document.body || cand === document.documentElement) break;
          try {
            const r = cand.getBoundingClientRect();
            const cs = getComputedStyle(cand);
            if (isChatText(cand, r, cs) || isChatOrFloating(cand, r, cs)) { startDrag(e, cand); return; }
          } catch (err) {}
          cand = cand.parentElement;
        }
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
        el.style.outlineOffset = "1px";
        el.style.zIndex = "9999";
        el.style.transition = "none";
      }
      function onDragMove(e) {
        if (!isDragging || !draggedEl) return;
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        draggedEl.style.transform = "translate(" + (dragOrig.x + dx) + "px, " + (dragOrig.y + dy) + "px)";
        if (!onDragMove._t) onDragMove._t = ctx.timeout(function(){ onDragMove._t = null; collectColliders(); }, 16);
      }
      function onTouchMove(e) {
        if (!isDragging || !draggedEl) return;
        const t = e.touches[0]; if (!t) return; e.preventDefault();
        onDragMove({ clientX: t.clientX, clientY: t.clientY });
      }
      function onDragEnd() {
        if (draggedEl) { draggedEl.style.outline = ""; draggedEl.style.outlineOffset = ""; draggedEl.style.zIndex = ""; draggedEl.style.transition = ""; }
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
      function onPlayerDragTouch(e){
        if (!playerDragging) return;
        const t = e.touches[0]; if (!t) return; e.preventDefault();
        onPlayerDrag({ clientX: t.clientX, clientY: t.clientY });
      }
      function endPlayerDrag() { playerDragging = false; if (playerEl) playerEl.style.cursor = "grab"; document.removeEventListener("mousemove", onPlayerDrag); document.removeEventListener("mouseup", endPlayerDrag); }
      function endPlayerDragTouch(){ playerDragging=false; document.removeEventListener("touchmove", onPlayerDragTouch); document.removeEventListener("touchend", endPlayerDragTouch); }

      function resetPlayer() { player.x = LEFT_CUTOFF + 40; player.y = 80; player.vx = 0; player.vy = 0; player.onGround = false; player.coyote = 0; player.jumpBuffer = 0; }
      function rectsOverlap(ax, ay, aw, ah, b) { return ax < b.right && ax + aw > b.left && ay < b.bottom && ay + ah > b.top; }

      function updatePhysics() {
        const paused = state.paused;
        if (paused || playerDragging || isDragging) return;
        const wasOnGround = player.onGround;
        if (!isTyping() && (keys["w"] || keys["arrowup"] || keys[" "] )) player.jumpBuffer = 6;
        if (player.jumpBuffer > 0) player.jumpBuffer--;
        if (player.onGround) player.coyote = 6; else if (player.coyote > 0) player.coyote--;
        const typing = isTyping();
        let move = 0;
        if (!typing) { if (keys["arrowleft"] || keys["a"]) move -= 1; if (keys["arrowright"] || keys["d"]) move += 1; }
        const isRunning = !!keys["shift"];
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

        // horizontal — find nearest wall in move direction (prevent teleport to distant platform)
        let nx = player.x + player.vx;
        if (player.vx !== 0) {
          let bestWall = null; let bestDist = Infinity;
          for (const c of colliders) {
            if (player.y + player.h <= c.top || player.y >= c.bottom) continue;
            if (player.vx > 0) {
              if (c.left >= player.x + player.w && c.left <= nx + player.w) {
                const d = c.left - (player.x + player.w);
                if (d < bestDist) { bestDist = d; bestWall = c; }
              }
            } else {
              if (c.right <= player.x && c.right >= nx) {
                const d = player.x - c.right;
                if (d < bestDist) { bestDist = d; bestWall = c; }
              }
            }
          }
          if (bestWall) {
            nx = player.vx > 0 ? bestWall.left - player.w : bestWall.right;
            player.vx = 0;
          } else {
            for (const c of colliders) if (rectsOverlap(nx, player.y, player.w, player.h, c)) { nx = player.vx > 0 ? c.left - player.w : c.right; player.vx = 0; break; }
          }
        }
        player.x = nx;
        if (player.x < LEFT_CUTOFF) { player.x = LEFT_CUTOFF; player.vx = 0; }
        if (player.x + player.w > window.innerWidth) { player.x = window.innerWidth - player.w; player.vx = 0; }

        let vy = player.vy;
        let nextY = player.y;
        let landed = false;
        let landX = 0, landY = 0;
        const steps = Math.max(1, Math.ceil(Math.abs(vy) / 8));
        const stepDy = vy / steps;
        player.onGround = false;
        for (let s=0; s<steps; s++){
          const testY = nextY + stepDy;
          let best = null; let bestDist = Infinity;
          for (const c of colliders) {
            if (player.x + player.w <= c.left || player.x >= c.right) continue;
            if (vy > 0) {
              if (c.top >= player.y + player.h && c.top <= testY + player.h) {
                const d = c.top - (player.y + player.h);
                if (d < bestDist) { bestDist = d; best = c; }
              }
            } else if (vy < 0) {
              if (c.bottom <= player.y && c.bottom >= testY) {
                const d = player.y - c.bottom;
                if (d < bestDist) { bestDist = d; best = c; }
              }
            }
          }
          if (best) {
            if (vy > 0) {
              nextY = best.top - player.h;
              landed = true; landX = player.x + player.w / 2; landY = best.top;
              vy = 0; player.onGround = true;
              break;
            } else {
              nextY = best.bottom; vy = 0;
              break;
            }
          }
          // fallback: direct overlap at testY (inside spawn)
          let fallback = null;
          for (const c of colliders) if (rectsOverlap(player.x, testY, player.w, player.h, c)) { fallback = c; break; }
          if (fallback) {
            if (vy > 0) {
              nextY = fallback.top - player.h;
              landed = true; landX = player.x + player.w / 2; landY = fallback.top;
              vy = 0; player.onGround = true;
              break;
            } else {
              nextY = fallback.bottom; vy = 0;
              break;
            }
          }
          nextY = testY;
        }
        player.y = nextY;
        if (!player.onGround) player.vy = vy; else player.vy = 0;
        if (landed && !wasOnGround && state.particles) {
          spawnParticles(landX, landY, 4, "rgba(255,255,255,0.92)");
        }
        if (player.y < 0) { player.y = 0; player.vy = 0; }
        if (player.y > window.innerHeight + 220) resetPlayer();
        if (!player.onGround) {
          player.rot += 15;
        } else {
          const target = Math.round(player.rot / 360) * 360;
          player.rot += (target - player.rot) * 0.25;
          if (Math.abs(target - player.rot) < 0.5) player.rot = target;
        }
        // game objects
        try{ updateEnemies(); checkObjectCollisions(); }catch(e){}
        if (Date.now() < invincibleUntil) updateHUD();
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
        if (k === "p") {
          if (isTyping()) return;
          Object.assign(state, { paused: !state.paused }); emit();
          e.preventDefault();
        }
        if (k === "escape" && !isTyping()) {
          Object.assign(state, { paused: !state.paused }); emit();
          e.preventDefault();
        }
      }
      function onKeyUp(e) { keys[e.key.toLowerCase()] = false; }
      function onBlur(){ for (const k in keys) keys[k]=false; }
      function onVisibility(){ if (document.hidden) for (const k in keys) keys[k]=false; }

      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);
      window.addEventListener("blur", onBlur);
      document.addEventListener("visibilitychange", onVisibility);
      function onRandomEnter(){ arrangeRandomPlatforms(false); }
      function onRandomExit(){ restoreRandomPlatforms(); }
      function onRandomShuffle(){ if (state.randomPlatform) arrangeRandomPlatforms(true); }
      window.addEventListener("mousedown", onAltDragStart);
      window.addEventListener("gdash-reset", resetPlayer);
      window.addEventListener("gdash-rescan", collectColliders);
      window.addEventListener("gdash-random-enter", onRandomEnter);
      window.addEventListener("gdash-random-exit", onRandomExit);
      window.addEventListener("gdash-random-shuffle", onRandomShuffle);

      let gapStyleEl = document.getElementById("gdash-gap-style");
      if (!gapStyleEl) { gapStyleEl = document.createElement("style"); gapStyleEl.id = "gdash-gap-style"; document.head.appendChild(gapStyleEl); }

      const mo = new MutationObserver(function(){
        if (moDebounce) { try{ moDebounce(); }catch(e){} moDebounce=null; }
        moDebounce = ctx.timeout(function(){ moDebounce = null; if (!state.enabled) return; collectColliders(); }, 220);
      });
      try { mo.observe(document.body, { childList: true, subtree: true, characterData: true }); } catch(e){}

      window.addEventListener("resize", collectColliders);
      window.addEventListener("scroll", collectColliders, true);

      const unsub = subscribe(function(s){
        if (s.enabled && !overlay) createOverlay();
        else if (!s.enabled && overlay) destroyOverlay();
        if (overlay) renderColliders(); else clearGap();
      });

      if (state.enabled) {
        createOverlay();
        if (state.randomPlatform) ctx.timeout(function(){ arrangeRandomPlatforms(false); }, 500);
      } else clearGap();

      ctx.effect(function(){
        return function(){
          try { window.cancelAnimationFrame(rafId); } catch (e) {}
          if (pendingGapCollect) { try{ pendingGapCollect(); }catch(e){} pendingGapCollect=null; }
          if (moDebounce) { try{ moDebounce(); }catch(e){} moDebounce=null; }
          window.removeEventListener("keydown", onKeyDown);
          window.removeEventListener("keyup", onKeyUp);
          window.removeEventListener("blur", onBlur);
          document.removeEventListener("visibilitychange", onVisibility);
          window.removeEventListener("mousedown", onAltDragStart);
          window.removeEventListener("gdash-reset", resetPlayer);
          window.removeEventListener("gdash-rescan", collectColliders);
          try{ window.removeEventListener("gdash-random-enter", onRandomEnter); }catch(e){}
          try{ window.removeEventListener("gdash-random-exit", onRandomExit); }catch(e){}
          try{ window.removeEventListener("gdash-random-shuffle", onRandomShuffle); }catch(e){}
          window.removeEventListener("resize", collectColliders);
          window.removeEventListener("scroll", collectColliders, true);
          document.removeEventListener("mousemove", onDragMove);
          document.removeEventListener("mouseup", onDragEnd);
          document.removeEventListener("touchmove", onTouchMove);
          document.removeEventListener("touchend", onDragEnd);
          document.removeEventListener("mousemove", onPlayerDrag);
          document.removeEventListener("mouseup", endPlayerDrag);
          document.removeEventListener("touchmove", onPlayerDragTouch);
          document.removeEventListener("touchend", endPlayerDragTouch);
          try { mo.disconnect(); } catch (e) {}
          try { if (overlay) overlay.remove(); } catch (e) {}
          try { const gs = document.getElementById("gdash-gap-style"); if (gs) gs.remove(); } catch (e) {}
          try { const gg = document.getElementById("gdash-parkour-global"); if (gg) gg.remove(); } catch (e) {}
          originalMargins.forEach(function(v, el){ try { el.style.marginBottom = v; el.classList.remove("gdash-gap-anim"); } catch (e) {} });
          originalTransforms.forEach(function(v, el){ try { el.style.transform = v; } catch (e) {} });
          originalMargins.clear(); originalTransforms.clear();
          unsub();
        };
      });
    };

    return module.exports;
  }
});
