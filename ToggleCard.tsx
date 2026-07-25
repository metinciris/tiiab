:root {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #18202a;
  background: #eef1f4;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  --line: #d8dee5;
  --muted: #687381;
  --panel: #ffffff;
  --green: #116a49;
  --green-soft: #c8f0dc;
  --red: #a62130;
  --red-soft: #ffd2da;
  --blue: #2767aa;
  --blue-soft: #edf5ff;
  --amber: #8b5a12;
  --amber-soft: #fff6e5;
  --ink: #18202a;
}

* { box-sizing: border-box; }
body { margin: 0; min-width: 320px; min-height: 100vh; }
button, input, textarea { font: inherit; }
button { cursor: pointer; }
button:disabled { cursor: not-allowed; opacity: .45; }

.app-shell { min-height: 100vh; }
.topbar {
  height: 54px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255,255,255,.97);
  border-bottom: 1px solid var(--line);
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(10px);
}
.brand-block { min-width: 0; }
.topbar h1 { margin: 0; font-size: 17px; letter-spacing: -.02em; }
.eyebrow { margin: 0; font-size: 8px; font-weight: 850; color: var(--muted); text-transform: uppercase; letter-spacing: .09em; }
.storage-status { display: flex; align-items: center; gap: 6px; font-size: 10px; color: var(--muted); white-space: nowrap; }
.storage-dot { width: 7px; height: 7px; border-radius: 50%; background: #29a36a; box-shadow: 0 0 0 3px #e3f6ec; }

.workspace {
  display: grid;
  grid-template-columns: 176px minmax(680px, 1fr) 322px;
  min-height: calc(100vh - 54px);
}
.sidebar, .preview-panel { background: var(--panel); }
.sidebar {
  padding: 10px;
  border-right: 1px solid var(--line);
  position: sticky;
  top: 54px;
  height: calc(100vh - 54px);
  overflow: auto;
}
.sidebar__head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 7px; }
.sidebar__head > div { display: grid; }
.sidebar__label { font-size: 8px; color: var(--muted); text-transform: uppercase; letter-spacing: .08em; font-weight: 850; }
.sidebar__head strong { font-size: 12px; }
.icon-button { border: 1px solid var(--line); background: #fff; border-radius: 7px; width: 28px; height: 28px; font-size: 18px; line-height: 1; }
.sample-list { display: grid; gap: 4px; margin-bottom: 6px; }
.sample-item {
  width: 100%;
  display: grid;
  grid-template-columns: 25px 1fr 13px;
  gap: 6px;
  align-items: center;
  text-align: left;
  border: 1px solid transparent;
  background: #f6f7f9;
  border-radius: 8px;
  padding: 5px;
  color: var(--ink);
}
.sample-item:hover { border-color: #c6d0da; }
.sample-item.is-active { background: #eaf3ff; border-color: #75a4dc; box-shadow: inset 3px 0 0 #2868b1; }
.sample-item--lap.is-active { background: #fff4dc; border-color: #d49a38; box-shadow: inset 3px 0 0 #b66f08; }
.sample-number { display: grid; place-items: center; width: 23px; height: 23px; border-radius: 6px; background: #fff; font-size: 10px; font-weight: 900; border: 1px solid var(--line); }
.sample-text { display: grid; min-width: 0; }
.sample-text strong { font-size: 10px; }
.sample-text small { font-size: 8px; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sample-state { font-size: 13px; color: #9aa3ae; }
.sample-state.is-done { color: var(--green); font-weight: 900; }
.sidebar-actions, .backup-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; margin-top: 5px; }

.add-mode-bar {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 34px;
  border-radius: 9px;
  overflow: hidden;
  border: 1px solid #9ba9b7;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.45), 0 2px 7px rgba(25,37,49,.10);
  margin-top: 7px;
}
.add-mode-bar button {
  border: 0;
  min-width: 0;
  padding: 7px 4px;
  color: #fff;
  font-size: 9px;
  font-weight: 950;
  letter-spacing: .02em;
  text-shadow: 0 1px 1px rgba(0,0,0,.18);
}
.add-mode-bar button span { font-size: 13px; line-height: 0; vertical-align: -1px; }
.add-mode-bar__tiiab { background: linear-gradient(#2c8bc7, #176aa4); border-right: 1px solid rgba(255,255,255,.5) !important; }
.add-mode-bar__other { background: linear-gradient(#d7962d, #a96508); }
.add-mode-bar button:hover { filter: brightness(1.08); }
.add-mode-bar button:active { filter: brightness(.92); box-shadow: inset 0 2px 5px rgba(0,0,0,.25); }

.stain-card { margin-top: 8px; border: 1px solid var(--line); background: #fafbfc; border-radius: 9px; padding: 8px; }
.stain-card__head { display: flex; justify-content: space-between; align-items: center; }
.stain-card__head span { font-size: 9px; font-weight: 850; color: var(--muted); text-transform: uppercase; letter-spacing: .05em; }
.stain-card__head strong { font-size: 19px; }
.stain-card small { display: block; color: var(--muted); font-size: 8px; margin-top: -2px; }
.stain-card label { display: grid; grid-template-columns: 42px 1fr; align-items: center; gap: 4px; font-size: 8px; color: var(--muted); margin-top: 6px; }
.stain-card input { width: 100%; border: 1px solid var(--line); border-radius: 6px; padding: 4px 6px; background: #fff; font-size: 9px; }
.backup-actions { margin-top: 7px; }

.editor {
  padding: 8px 10px 18px;
  min-width: 0;
  height: calc(100vh - 54px);
  overflow: auto;
}
.editor-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 5px; }
.editor-index { color: var(--muted); font-size: 8px; font-weight: 850; text-transform: uppercase; letter-spacing: .08em; }
.editor h2 { margin: 0; font-size: 15px; letter-spacing: -.02em; }
.editor-subtitle { display: block; margin-top: 1px; color: var(--muted); font-size: 8px; }
.editor-head__actions { display: flex; gap: 2px; white-space: nowrap; }

.page-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-bottom: 5px; }
.page-tabs button {
  min-width: 0;
  height: 34px;
  border: 1px solid var(--line);
  background: #fff;
  border-radius: 8px;
  padding: 5px 10px;
  color: #596575;
  font-size: 12px;
  font-weight: 900;
}
.page-tabs button:hover { border-color: #9eacbb; }
.page-tabs button.is-active { color: #0f4f38; background: #e0f5ea; border-color: #2b8a63; box-shadow: inset 0 0 0 1px rgba(17,106,73,.12); }
.click-hint {
  font-size: 8px;
  line-height: 1.25;
  color: #65717e;
  padding: 4px 7px;
  border-left: 3px solid #7ea9df;
  background: #f2f7fd;
  border-radius: 3px 6px 6px 3px;
  margin-bottom: 5px;
}

.mode-editor { display: grid; gap: 4px; }
.mode-intro, .other-specimen-bar {
  min-height: 36px;
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 5px 7px;
  background: #fff;
}
.mode-intro { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.mode-intro > div:first-child { display: grid; }
.mode-intro span, .other-specimen-bar__label span { color: var(--muted); font-size: 7px; font-weight: 900; text-transform: uppercase; letter-spacing: .08em; }
.mode-intro strong, .other-specimen-bar__label strong { font-size: 10px; }
.mode-intro--thyroid { border-color: #aac8e8; background: #f7fbff; }
.fixed-location { flex: 0 0 auto; font-size: 9px; color: #496071; border: 1px solid #c8d8e8; border-radius: 999px; padding: 4px 8px; background: #fff; }

.other-specimen-bar {
  display: grid;
  grid-template-columns: 88px minmax(300px, 1fr) 150px;
  gap: 6px;
  align-items: center;
  border-color: #e2c78e;
  background: #fffaf0;
}
.other-specimen-bar__label { display: grid; }
.specimen-buttons { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 3px; }
.specimen-buttons button {
  min-height: 29px;
  border: 1px solid #d8c9ad;
  border-radius: 6px;
  background: #fff;
  color: #5d5140;
  padding: 4px 6px;
  font-size: 9px;
  font-weight: 800;
}
.specimen-buttons button.is-active { color: #714600; border: 2px solid #aa6d10; background: #ffe6b5; box-shadow: 0 0 0 2px rgba(170,109,16,.12); padding: 3px 5px; }
.custom-location { display: grid; gap: 2px; }
.custom-location span { color: var(--muted); font-size: 7px; font-weight: 850; text-transform: uppercase; }
.custom-location input { width: 100%; min-width: 0; border: 1px solid #d8c9ad; border-radius: 6px; background: #fff; padding: 5px 6px; color: var(--ink); outline: none; font-size: 9px; }
.custom-location.is-active input { border-color: #aa6d10; box-shadow: 0 0 0 2px rgba(170,109,16,.1); }

.dense-form { display: grid; gap: 3px; }
.dense-section {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  gap: 5px;
  align-items: stretch;
  border: 1px solid var(--line);
  border-radius: 7px;
  padding: 4px;
  background: #fff;
}
.dense-section.is-diagnosis { border-width: 2px; }
.dense-section--thyroid.is-diagnosis { border-color: #7ea9d8; background: #f7fbff; }
.dense-section--other.is-diagnosis { border-color: #d0a14d; background: #fffaf0; }
.dense-section__label {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1px;
  border-right: 1px solid var(--line);
  padding: 2px 6px 2px 3px;
}
.dense-section--thyroid .dense-section__label { border-right-color: #c9d9ea; }
.dense-section--other .dense-section__label { border-right-color: #e1d3b8; }
.dense-section__label h3 { margin: 0; font-size: 9px; line-height: 1.15; }
.dense-section__label span { color: var(--muted); font-size: 6.5px; font-weight: 850; text-transform: uppercase; letter-spacing: .05em; }
.dense-option-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(108px, 1fr));
  gap: 3px;
  align-content: start;
}
.is-diagnosis .dense-option-grid { grid-template-columns: repeat(auto-fit, minmax(125px, 1fr)); }
.toggle-card {
  min-height: 29px;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 3px;
  text-align: left;
  border: 1px solid #d7dde4;
  background: #fff;
  color: #303a46;
  border-radius: 6px;
  padding: 3px 5px;
  transition: border-color .1s ease, background .1s ease, box-shadow .1s ease, transform .1s ease;
}
.toggle-card:hover { transform: translateY(-1px); border-color: #8d9baa; box-shadow: 0 2px 6px rgba(24,32,42,.08); }
.toggle-card.is-tumor { border-color: #d99aa2; color: #8f2632; background: #fff; }
.toggle-card.is-active {
  background: var(--green-soft);
  border: 2px solid #16724d;
  color: #074b31;
  box-shadow: 0 0 0 2px rgba(22,114,77,.15), 0 3px 8px rgba(10,83,54,.14);
  padding: 2px 4px;
  font-weight: 900;
}
.toggle-card.is-tumor.is-active {
  background: var(--red-soft);
  border-color: #a91428;
  color: #700d1a;
  box-shadow: 0 0 0 2px rgba(169,20,40,.16), 0 3px 8px rgba(112,13,26,.14);
}
.toggle-card__text { min-width: 0; font-size: 8.3px; line-height: 1.12; font-weight: 650; overflow-wrap: anywhere; }
.toggle-card.is-active .toggle-card__text { font-weight: 900; }
.toggle-card__meta { display: inline-flex; align-items: center; gap: 2px; font-size: 6px; line-height: 1; opacity: .8; font-weight: 900; white-space: nowrap; }
.toggle-card:not(.is-active) .toggle-card__meta:empty { display: none; }
.selected-mark { display: grid; place-items: center; width: 13px; height: 13px; border-radius: 50%; background: currentColor; color: #fff; font-size: 8px; }

.notes-disclosure { border: 1px solid var(--line); border-radius: 7px; background: #fff; }
.notes-disclosure summary { cursor: pointer; padding: 5px 8px; color: #53606d; font-size: 8px; font-weight: 850; text-transform: uppercase; letter-spacing: .04em; }
.notes-disclosure[open] summary { border-bottom: 1px solid var(--line); }
.notes-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 6px; }
.notes-grid label { display: grid; gap: 2px; }
.notes-grid span { font-size: 7px; color: var(--muted); font-weight: 850; text-transform: uppercase; letter-spacing: .05em; }
textarea { width: 100%; resize: vertical; min-height: 42px; line-height: 1.3; border: 1px solid var(--line); border-radius: 7px; background: #fff; padding: 6px 7px; color: var(--ink); outline: none; font-size: 10px; }
textarea:focus, input:focus { border-color: #6799d2; box-shadow: 0 0 0 2px #e6f0fd; }

.preview-panel {
  border-left: 1px solid var(--line);
  padding: 10px;
  position: sticky;
  top: 54px;
  height: calc(100vh - 54px);
  display: flex;
  flex-direction: column;
  gap: 7px;
}
.preview-head { display: flex; align-items: center; justify-content: space-between; gap: 7px; }
.preview-head > div:first-child { display: grid; }
.preview-head span { color: var(--muted); font-size: 8px; text-transform: uppercase; letter-spacing: .08em; font-weight: 850; }
.preview-head strong { font-size: 12px; }
.preview-head > small { color: var(--muted); font-size: 7px; text-align: right; }
.preview-switch { display: flex; gap: 2px; background: #edf0f3; padding: 2px; border-radius: 7px; }
.preview-switch button { border: 0; background: transparent; padding: 4px 6px; border-radius: 5px; color: var(--muted); font-size: 8px; font-weight: 850; }
.preview-switch button.is-active { background: #fff; color: var(--ink); box-shadow: 0 1px 4px rgba(20,30,40,.08); }
.report-output { flex: 1; min-height: 220px; margin: 0; white-space: pre-wrap; overflow: auto; background: #f8f9fb; border: 1px solid var(--line); border-radius: 8px; padding: 9px; font-family: "Segoe UI", Arial, sans-serif; font-size: 10px; line-height: 1.4; color: #1b2430; scroll-behavior: smooth; }
.report-output--all { display: block; }
.preview-report { border: 1px solid transparent; border-radius: 7px; padding: 6px 7px; cursor: pointer; transition: background .16s ease, border-color .16s ease, box-shadow .16s ease; }
.preview-report + .preview-report { margin-top: 1.4em; }
.preview-report pre, .preview-stains pre { margin: 0; white-space: pre-wrap; font: inherit; line-height: inherit; }
.preview-report:hover { background: #fff; border-color: #d7dde4; }
.preview-report.is-active { box-shadow: 0 2px 10px rgba(29, 46, 64, .10); }
.preview-report--tiiab.is-active { background: #e8f5ff; border-color: #69a7d7; box-shadow: inset 4px 0 0 #2879b6, 0 2px 10px rgba(40, 121, 182, .13); }
.preview-report--lap.is-active { background: #fff1d6; border-color: #d69b35; box-shadow: inset 4px 0 0 #b46c08, 0 2px 10px rgba(180, 108, 8, .13); }
.preview-stains { margin-top: 2.8em; padding: 0 7px 8px; }
.copy-stack { display: grid; gap: 4px; }
.primary, .secondary, .ghost { border-radius: 7px; padding: 6px 8px; font-weight: 850; font-size: 9px; }
.primary { border: 1px solid #0f5d41; background: var(--green); color: #fff; }
.primary:hover { background: #0d5d40; }
.secondary { border: 1px solid var(--line); background: #fff; color: var(--ink); }
.secondary:hover, .ghost:hover { border-color: #aeb8c4; background: #f7f8fa; }
.ghost { border: 1px solid transparent; background: transparent; color: #5f6a77; padding: 5px 6px; }
.compact-button { padding-block: 5px; }
.full { width: 100%; }
.danger-text { color: #a22a34; }
.toast { position: fixed; right: 16px; bottom: 16px; z-index: 50; background: #17212b; color: #fff; padding: 8px 11px; border-radius: 8px; font-weight: 850; font-size: 10px; box-shadow: 0 12px 30px rgba(0,0,0,.22); animation: toast-in .18s ease-out; }
@keyframes toast-in { from { transform: translateY(8px); opacity: 0; } }

@media (max-width: 1450px) {
  .workspace { grid-template-columns: 168px minmax(610px, 1fr) 292px; }
  .dense-section { grid-template-columns: 102px minmax(0, 1fr); }
  .dense-option-grid { grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); }
  .is-diagnosis .dense-option-grid { grid-template-columns: repeat(auto-fit, minmax(116px, 1fr)); }
  .toggle-card__text { font-size: 8px; }
}

@media (max-width: 1080px) {
  .workspace { grid-template-columns: 160px minmax(500px, 1fr) 275px; }
  .other-specimen-bar { grid-template-columns: 80px 1fr; }
  .custom-location { grid-column: 1 / -1; grid-template-columns: 80px 1fr; align-items: center; }
  .dense-section { grid-template-columns: 94px minmax(0, 1fr); }
  .dense-option-grid { grid-template-columns: repeat(auto-fit, minmax(94px, 1fr)); }
}

@media (max-width: 900px) {
  .workspace { display: block; }
  .editor { height: auto; overflow: visible; }
  .sidebar, .preview-panel { position: static; height: auto; border: 0; }
  .sidebar { border-bottom: 1px solid var(--line); }
  .sample-list { grid-template-columns: repeat(auto-fit, minmax(145px, 1fr)); }
  .preview-panel { border-top: 1px solid var(--line); }
  .report-output { min-height: 300px; }
}

@media (max-width: 620px) {
  .topbar { min-height: 51px; height: auto; padding: 7px 9px; align-items: flex-start; gap: 6px; }
  .storage-status { font-size: 8px; margin-top: 4px; }
  .editor { padding: 8px 6px 18px; }
  .editor-head { align-items: flex-start; }
  .editor-head__actions { display: grid; }
  .mode-intro { align-items: flex-start; }
  .other-specimen-bar { grid-template-columns: 1fr; }
  .specimen-buttons { grid-template-columns: 1fr 1fr; }
  .custom-location { grid-column: auto; grid-template-columns: 1fr; }
  .dense-section { grid-template-columns: 1fr; }
  .dense-section__label { border-right: 0; border-bottom: 1px solid var(--line); padding: 2px 3px 4px; }
  .dense-option-grid, .is-diagnosis .dense-option-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .notes-grid { grid-template-columns: 1fr; }
}

.version-badge { display: inline-flex; align-items: center; margin-left: 7px; padding: 2px 6px; border-radius: 999px; background: #e8eef5; color: #526273; font-size: 10px; font-weight: 700; vertical-align: middle; }
