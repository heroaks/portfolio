/* ============================================================================
   AYUSH KUMAR SRIVASTAVA — DevSecOps & Platform Engineering
   Single-file App.jsx (drop-in replacement — no local imports required)

   WHAT CHANGED IN THIS REVISION
   ---------------------------------------------------------------------------
   1. FIXED  All corrupted CSS tokens from the previous build
             (e.g. "margin:0 aut o", "var(--radi us)", "1p x solid",
             "fon t-size", "grid-tem plate-columns", "1100 0") which were
             silently killing the resume sheet, project index and media queries.
   2. FIXED  Illegal dynamic class names ("st IN PROGRESS") — status is now a
             colour-mapped token system (production / implemented / in-progress
             / poc / designed / learning), used consistently everywhere.
   3. FIXED  Dead links to /resume.pdf and /resume.json (404 on Vercel).
             TXT, MD and JSON resumes are now generated client-side; PDF goes
             through the print-optimised sheet.
   4. FIXED  Data conflicts vs. the master summary + resume:
             Castler headcount (sub-100, not "250+"), role titles, dates
             (Jul 2024 – Jan 2026 / Feb 2026 – Present), phone number added,
             invented domain removed, Kubernetes/EKS moved to lab tier,
             Pulumi/Terraform kept hands-on per resume, school results kept
             in the resume sheet only.
   5. NEW    Two extra case files (Observability platform replacement,
             Apache Guacamole browser bastion) — both strong FinOps + platform
             stories that were buried in the project index.
   6. NEW    Two new architecture diagrams (observability pipeline, bastion
             path) + diagrams now render inside expanded case files.
   7. NEW    ⌘K / Ctrl+K command palette, "/" to search the project index,
             "R" for resume, scroll-progress bar, live IST clock, JSON-LD +
             meta/OG injection, skip-link, focus restore, body-scroll lock.
   8. UX     Sticky work panel (desktop), horizontally scrollable diagrams
             (mobile) instead of hiding them, honest-metric disclaimer,
             copy-email action, keyboard-accessible accordion.
   9. PERF   Single injected stylesheet, no Tailwind dependency, IntersectionObserver
             with one-shot reveals, reduced-motion respected throughout.
   ========================================================================== */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/* ============================== tokens ================================== */

const EASE = [0.22, 1, 0.36, 1];
const cx = (...a) => a.filter(Boolean).join(" ");

const STATUS_COLORS = {
  PRODUCTION: "#00FF9D",
  OPERATED: "#00FF9D",
  IMPLEMENTED: "#E7EEF7",
  "IN PROGRESS": "#FFC46B",
  POC: "#7DD3FC",
  DESIGNED: "#C4B5FD",
  LEARNING: "#8892A0",
  COMPLETED: "#00FF9D",
  SUPPORTED: "#7DD3FC",
  "EVIDENCE PREPARED": "#7DD3FC",
  DELIVERED: "#C4B5FD",
};
const stColor = (s) => STATUS_COLORS[s] || STATUS_COLORS.LEARNING;

const STYLES = `
@import url('https://cdn.jsdelivr.net/npm/@fontsource-variable/inter/index.css');
@import url('https://cdn.jsdelivr.net/npm/@fontsource-variable/archivo/index.css');
@import url('https://cdn.jsdelivr.net/npm/@fontsource-variable/jetbrains-mono/index.css');

@page{size:A4;margin:13mm}

:root{
  --ink:#070A0E; --ink2:#0A0E14; --surface:#0F141B; --surface2:#131A23;
  --paper:#E7EEF7; --muted:#8A94A3; --dim:#5D6774;
  --line:rgba(231,238,247,.10); --line2:rgba(231,238,247,.05);
  --accent:#00FF9D; --on-accent:#04140C;
  --warn:#FFC46B; --info:#7DD3FC; --plan:#C4B5FD;
  --gut:32px; --radius:6px; --ease:cubic-bezier(.22,1,.36,1);
  --mono:'JetBrains Mono Variable',ui-monospace,SFMono-Regular,Menlo,monospace;
  --disp:'Archivo Variable','Space Grotesk Variable',system-ui,sans-serif;
  --body:'Inter Variable',system-ui,-apple-system,'Segoe UI',sans-serif;
  --doc:#F5F7FA; --doc-ink:#0B0F14; --doc-muted:#5A6673; --doc-line:rgba(11,15,20,.14);
}

*,*::before,*::after{box-sizing:border-box}
html{background:var(--ink);scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{
  margin:0;color:var(--paper);overflow-x:hidden;font-family:var(--body);
  font-size:16px;line-height:1.65;font-weight:400;
  background:
    radial-gradient(1100px 620px at 82% -10%, rgba(0,255,157,.075), transparent 62%),
    radial-gradient(880px 520px at 2% 8%, rgba(125,211,252,.05), transparent 60%),
    var(--ink);
  background-attachment:fixed;
  -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
}
a{color:inherit;text-decoration:none}
button{font:inherit;color:inherit;background:none;border:0;cursor:pointer;padding:0}
input{font:inherit;color:inherit}
img,svg{display:block}
::selection{background:var(--accent);color:var(--on-accent)}
:focus-visible{outline:1px solid var(--accent);outline-offset:3px;border-radius:2px}
hr{border:0;border-top:1px solid var(--line);margin:0}

.grid-bg{position:fixed;inset:0;z-index:0;pointer-events:none;
  background-image:linear-gradient(var(--line2) 1px,transparent 1px),linear-gradient(90deg,var(--line2) 1px,transparent 1px);
  background-size:72px 72px;
  -webkit-mask-image:radial-gradient(circle at 50% 12%,#000 0%,transparent 76%);
  mask-image:radial-gradient(circle at 50% 12%,#000 0%,transparent 76%)}
.site-root{position:relative;z-index:1}

.shell{width:100%;max-width:1240px;margin:0 auto;padding:0 var(--gut)}
.section{padding:104px 0;scroll-margin-top:72px;position:relative}
.surface-sec{background:linear-gradient(180deg,rgba(19,26,35,.72),rgba(15,20,27,.72));
  border-top:1px solid var(--line);border-bottom:1px solid var(--line)}

.meta{font-family:var(--mono);font-weight:500;font-size:11.5px;text-transform:uppercase;
  letter-spacing:.09em;color:var(--muted);line-height:1.5}
.meta.dim{color:var(--dim)}
.meta.paper{color:var(--paper)}
.meta.plain{text-transform:none;letter-spacing:.03em;font-size:12px}
.meta.accent{color:var(--accent)}
.display{font-family:var(--disp);font-weight:900;font-size:clamp(42px,6.4vw,100px);
  line-height:.94;letter-spacing:-.035em;margin:0}
.accent{color:var(--accent)}

.sec-head{display:flex;align-items:center;gap:20px;margin-bottom:40px;flex-wrap:wrap}
.sec-head .grow{flex:1;height:1px;background:linear-gradient(90deg,var(--line),transparent);min-width:24px}
.sec-lead{margin:0 0 34px;max-width:74ch;font-weight:300;font-size:16px;line-height:1.75;color:rgba(231,238,247,.76)}

.skip{position:fixed;top:-100px;left:16px;z-index:200;background:var(--accent);color:var(--on-accent);
  font-family:var(--mono);font-size:11px;letter-spacing:.09em;text-transform:uppercase;padding:11px 15px;
  border-radius:var(--radius);transition:top .3s var(--ease)}
.skip:focus{top:14px}

/* ---------------------------------- nav -------------------------------- */
.nav{position:fixed;top:0;left:0;right:0;height:64px;z-index:70;
  border-bottom:1px solid transparent;transition:background .45s var(--ease),border-color .45s var(--ease),backdrop-filter .45s var(--ease)}
.nav.solid{background:rgba(7,10,14,.82);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border-bottom-color:var(--line)}
.nav-in{height:64px;display:flex;align-items:center;justify-content:space-between;gap:16px}
.progress{position:absolute;left:0;right:0;bottom:-1px;height:1px;background:transparent;overflow:hidden}
.progress i{display:block;height:100%;background:var(--accent);transform-origin:left;transform:scaleX(0);
  box-shadow:0 0 12px rgba(0,255,157,.6)}
.wordmark{font-family:var(--disp);font-weight:800;font-size:15px;letter-spacing:.14em;
  display:inline-flex;align-items:center;gap:10px;white-space:nowrap}
.wordmark b{font-weight:800}
.wordmark s{text-decoration:none;color:var(--dim)}
.wordmark i{width:5px;height:5px;background:var(--accent);display:block;flex:0 0 auto;
  box-shadow:0 0 10px rgba(0,255,157,.75)}
.nav-links{display:flex;align-items:center;gap:22px}
.nav-link{position:relative;padding:6px 0;color:var(--muted);transition:color .3s var(--ease)}
.nav-link::after{content:"";position:absolute;left:0;bottom:0;width:100%;height:1px;background:var(--accent);
  transform:scaleX(0);transform-origin:left;transition:transform .4s var(--ease)}
.nav-link:hover{color:var(--paper)}
.nav-link:hover::after,.nav-link.on::after{transform:scaleX(1)}
.nav-link.on{color:var(--accent)}
.nav-cta{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line);
  border-radius:var(--radius);padding:8px 13px;color:var(--muted);
  transition:border-color .35s var(--ease),color .35s var(--ease),background .35s var(--ease)}
.nav-cta:hover{border-color:var(--accent);color:var(--accent);background:rgba(0,255,157,.05)}
.nav-cta kbd{font-family:var(--mono);font-size:9.5px;border:1px solid var(--line);border-radius:3px;
  padding:1px 4px;color:var(--dim)}
.burger{display:none;width:38px;height:38px;align-items:center;justify-content:center;
  border:1px solid var(--line);border-radius:var(--radius)}
.burger span{display:block;width:15px;height:1px;background:var(--paper);position:relative;transition:background .2s}
.burger span::before,.burger span::after{content:"";position:absolute;left:0;width:15px;height:1px;
  background:var(--paper);transition:transform .35s var(--ease)}
.burger span::before{top:-5px}.burger span::after{top:5px}
.burger.open span{background:transparent}
.burger.open span::before{transform:translateY(5px) rotate(45deg)}
.burger.open span::after{transform:translateY(-5px) rotate(-45deg)}
.nav-drawer{overflow:hidden;background:rgba(7,10,14,.97);border-bottom:1px solid var(--line)}
.nav-drawer a{padding:15px 0;border-bottom:1px solid var(--line2);display:flex;
  justify-content:space-between;align-items:center;color:var(--muted)}
.nav-drawer a:last-child{border-bottom:0}

/* ------------------------------ command bar ---------------------------- */
.cmd-overlay{position:fixed;inset:0;z-index:150;background:rgba(4,7,10,.72);
  backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);padding:12vh 16px 16px;overflow-y:auto}
.cmd{max-width:600px;margin:0 auto;background:var(--surface);border:1px solid var(--line);
  border-radius:10px;overflow:hidden;box-shadow:0 40px 90px rgba(0,0,0,.6)}
.cmd-in{display:flex;align-items:center;gap:11px;padding:15px 17px;border-bottom:1px solid var(--line)}
.cmd-in input{flex:1;background:none;border:0;outline:none;font-size:15px;color:var(--paper);font-family:var(--body)}
.cmd-in input::placeholder{color:var(--dim)}
.cmd-list{max-height:min(52vh,420px);overflow-y:auto;padding:7px}
.cmd-grp{font-family:var(--mono);font-size:9.5px;letter-spacing:.13em;text-transform:uppercase;
  color:var(--dim);padding:11px 11px 6px}
.cmd-item{width:100%;display:flex;align-items:center;gap:11px;padding:10px 11px;border-radius:6px;
  text-align:left;color:var(--muted);transition:background .16s,color .16s}
.cmd-item.sel{background:rgba(0,255,157,.09);color:var(--paper)}
.cmd-item .cmd-k{flex:1;font-size:13.6px;font-weight:400}
.cmd-item .cmd-h{font-family:var(--mono);font-size:9.5px;letter-spacing:.07em;color:var(--dim);text-transform:uppercase}
.cmd-foot{display:flex;gap:16px;flex-wrap:wrap;padding:10px 15px;border-top:1px solid var(--line);
  background:rgba(7,10,14,.5)}

/* --------------------------------- hero -------------------------------- */
.hero{min-height:clamp(560px,86vh,820px);display:flex;align-items:stretch;padding-top:64px;position:relative}
.hero-in{display:flex;flex-direction:column;justify-content:space-between;width:100%;
  padding-top:48px;padding-bottom:28px;gap:40px}
.hero-grid{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:56px;align-items:end}
.hero-top{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.pill{display:inline-flex;align-items:center;gap:8px;border:1px solid rgba(0,255,157,.28);
  background:rgba(0,255,157,.06);border-radius:999px;padding:5px 12px;
  font-family:var(--mono);font-size:10px;letter-spacing:.09em;text-transform:uppercase;color:var(--accent)}
.pill i{width:5px;height:5px;border-radius:50%;background:var(--accent);animation:pulse 2.4s infinite}
@keyframes pulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(0,255,157,.5)}50%{opacity:.55;box-shadow:0 0 0 5px rgba(0,255,157,0)}}
.hero h1{max-width:min(880px,100%)}
.ln-mask{display:block;overflow:hidden}
.ln-mask>span{display:block}
.hero-sub{margin:28px 0 0;max-width:64ch;font-weight:300;font-size:clamp(15px,1.25vw,17px);
  line-height:1.75;color:rgba(231,238,247,.76)}
.hero-rail{border-left:1px solid var(--line);padding-left:24px;display:flex;flex-direction:column;gap:22px}
.rail-role{font-family:var(--disp);font-weight:600;font-size:15px;letter-spacing:-.01em;margin-top:6px}
.rail-org{font-family:var(--mono);font-size:10.5px;letter-spacing:.07em;text-transform:uppercase;color:var(--muted);margin-top:4px}
.hero-foot{display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap}
.scroll-cue{display:inline-flex;align-items:center;gap:9px;color:var(--muted)}
.scroll-cue svg{animation:bob 2.8s var(--ease) infinite}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(4px)}}
.packet-track{position:relative;height:1px;background:var(--line);width:100%}
.packet{position:absolute;top:-1.5px;left:-4px;width:4px;height:4px;background:var(--accent);
  box-shadow:0 0 10px rgba(0,255,157,.8);animation:packetRun 26s steps(80,end) infinite}
.packet.rest{animation:none;left:auto;right:0}
@keyframes packetRun{0%{left:-4px;opacity:1}17%{left:100%;opacity:1}17.6%{left:100%;opacity:0}99%{left:-4px;opacity:0}100%{left:-4px;opacity:1}}

/* ------------------------------- signals ------------------------------- */
.signals{border-bottom:1px solid var(--line);padding:40px 0 46px}
.sig-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;margin-top:26px;
  background:var(--line2);border:1px solid var(--line2);border-radius:var(--radius);overflow:hidden}
.sig{background:var(--ink);padding:20px 20px 22px;transition:background .4s var(--ease)}
.sig:hover{background:var(--surface2)}
.sig-v{font-family:var(--disp);font-weight:800;font-size:clamp(22px,2.4vw,32px);letter-spacing:-.03em;line-height:1}
.sig-l{margin-top:9px;font-size:10.5px;line-height:1.5}
.disclaim{margin:20px 0 0;border-left:1px solid rgba(255,196,107,.5);padding-left:16px;
  font-family:var(--mono);font-size:10.5px;letter-spacing:.04em;line-height:1.7;color:var(--dim);max-width:96ch}

/* ----------------------------- selected work --------------------------- */
.work-grid{display:grid;grid-template-columns:minmax(0,1.06fr) minmax(0,1fr);gap:56px;align-items:start}
.work-list{display:flex;flex-direction:column}
.work-row{display:grid;grid-template-columns:40px minmax(0,1fr);gap:14px;align-items:baseline;width:100%;
  border-top:1px solid var(--line);padding:20px 0;text-align:left;color:var(--muted);
  transition:color .35s var(--ease),padding-left .35s var(--ease)}
.work-list .work-row:last-child{border-bottom:1px solid var(--line)}
.work-row:hover,.work-row.on{color:var(--paper);padding-left:6px}
.work-idx{font-family:var(--mono);font-size:11.5px;letter-spacing:.08em;color:var(--dim);transition:color .35s var(--ease)}
.work-row.on .work-idx{color:var(--accent)}
.work-tw{display:flex;align-items:flex-start;gap:13px}
.work-sq{width:6px;height:6px;background:var(--accent);flex:0 0 auto;margin-top:9px;
  opacity:0;transform:scale(.3);transition:.35s var(--ease)}
.work-row.on .work-sq,.work-row:hover .work-sq{opacity:1;transform:scale(1)}
.work-title{font-family:var(--disp);font-weight:700;font-size:clamp(19px,2.1vw,29px);
  line-height:1.12;letter-spacing:-.025em;margin:0}
.work-kind{display:block;margin-top:9px}
.work-tags{display:none;flex-wrap:wrap;gap:6px;margin-top:13px}
.tag{font-family:var(--mono);font-size:9.5px;letter-spacing:.07em;text-transform:uppercase;
  color:var(--muted);border:1px solid var(--line);border-radius:4px;padding:4px 7px}
.tag.hot{color:var(--accent);border-color:rgba(0,255,157,.32)}
.work-panel{position:sticky;top:88px;height:600px;border:1px solid var(--line);border-radius:var(--radius);
  background:linear-gradient(180deg,rgba(231,238,247,.03),rgba(231,238,247,.008));overflow:hidden}
.panel-in{position:absolute;inset:0;padding:22px;display:flex;flex-direction:column;gap:14px}
.panel-top{display:flex;align-items:center;justify-content:space-between;gap:12px}
.badge{font-family:var(--mono);font-size:9.5px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;
  border:1px solid currentColor;border-radius:4px;padding:4px 8px;white-space:nowrap;display:inline-flex;align-items:center;gap:7px}
.badge i{width:5px;height:5px;border-radius:50%;background:currentColor;flex:0 0 auto}
.panel-art{flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;overflow-x:auto;overflow-y:hidden}
.panel-art svg{width:100%;height:100%;flex:1;min-height:0}
.panel-art pre{width:100%;height:100%}
.panel-copy{margin:0;font-size:14.5px;line-height:1.66;color:rgba(231,238,247,.76);font-weight:300}
.panel-foot{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;
  border-top:1px solid var(--line);padding-top:13px}
.snippet{margin:0;height:100%;overflow:auto;font-family:var(--mono);font-size:11.5px;line-height:1.8;white-space:pre}
.sn-num{display:inline-block;width:26px;color:rgba(138,148,163,.42);font-size:10px;user-select:none}
.sn-k,.sn-a{color:var(--accent)}.sn-v{color:var(--paper)}.sn-d,.sn-c{color:rgba(138,148,163,.9)}

/* ------------------------------ case files ----------------------------- */
.case{border-top:1px solid var(--line)}
.case:last-child{border-bottom:1px solid var(--line)}
.case-head{width:100%;display:grid;grid-template-columns:66px minmax(0,1fr) auto;gap:18px;
  align-items:center;padding:26px 0;text-align:left}
.case-head:hover .case-title{color:var(--accent)}
.case-title{font-family:var(--disp);font-weight:700;font-size:clamp(18px,2vw,26px);
  letter-spacing:-.025em;line-height:1.16;margin:0;transition:color .3s var(--ease)}
.case-sum{display:block;margin-top:9px;font-size:13.5px;line-height:1.6;color:var(--muted);font-weight:300;max-width:82ch}
.case-chev{transition:transform .4s var(--ease);color:var(--muted)}
.case-chev.open{transform:rotate(90deg);color:var(--accent)}
.case-body{overflow:hidden}
.case-in{padding:0 0 38px;display:grid;grid-template-columns:66px minmax(0,1fr);gap:18px}
.case-art{border:1px solid var(--line);border-radius:var(--radius);background:rgba(7,10,14,.4);
  padding:16px;margin-bottom:24px;overflow-x:auto}
.case-art svg{width:100%;height:auto;min-width:520px}
.case-meta{display:flex;gap:11px;flex-wrap:wrap;margin-bottom:14px;align-items:center}
.fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 44px}
.field{border-top:1px solid var(--line);padding:16px 0}
.field p{margin:8px 0 0;font-size:14.4px;line-height:1.7;color:rgba(231,238,247,.8);font-weight:300}

/* ------------------------------ philosophy ----------------------------- */
.phil{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2.1fr);gap:52px;align-items:start}
.phil-q{margin:0;font-family:var(--disp);font-weight:700;font-size:clamp(21px,2.3vw,33px);
  line-height:1.24;letter-spacing:-.028em;max-width:24ch}
.phil-cols{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:30px 40px}
.phil-item{border-top:1px solid var(--line);padding-top:16px}
.phil-item h4{font-family:var(--disp);font-weight:700;font-size:15.5px;letter-spacing:-.015em;margin:11px 0 8px}
.phil-item p{margin:0;font-size:13.8px;line-height:1.7;color:rgba(231,238,247,.72);font-weight:300}

/* ------------------------------- experience ---------------------------- */
.exp{border-top:1px solid var(--line)}
.exp-item{border-bottom:1px solid var(--line);padding:42px 0;display:grid;
  grid-template-columns:minmax(0,.74fr) minmax(0,1.9fr);gap:48px}
.exp-org{font-family:var(--disp);font-weight:800;font-size:clamp(24px,2.7vw,36px);
  letter-spacing:-.03em;line-height:1.04;margin:9px 0 0}
.exp-role{font-family:var(--disp);font-weight:500;font-size:16px;letter-spacing:-.01em;margin-top:9px}
.exp-scope{margin-top:16px;padding-top:16px;border-top:1px solid var(--line);font-size:11px;line-height:1.7}
.grp{border-top:1px solid var(--line);padding:18px 0;display:grid;grid-template-columns:136px minmax(0,1fr);gap:22px}
.grp:first-child{border-top:0;padding-top:0}
.grp ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:12px}
.grp li{display:grid;grid-template-columns:14px minmax(0,1fr);gap:12px;font-size:14.6px;
  line-height:1.66;color:rgba(231,238,247,.82);font-weight:300}
.grp li i{display:block;width:5px;height:5px;background:var(--accent);margin-top:9px}

/* ----------------------------- project index --------------------------- */
.idx-bar{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:22px}
.search{display:flex;align-items:center;gap:9px;border:1px solid var(--line);border-radius:var(--radius);
  padding:9px 12px;flex:1;min-width:220px;transition:border-color .3s var(--ease)}
.search:focus-within{border-color:rgba(0,255,157,.5)}
.search input{flex:1;background:none;border:0;outline:none;font-size:13.5px}
.search input::placeholder{color:var(--dim)}
.search kbd{font-family:var(--mono);font-size:9.5px;border:1px solid var(--line);border-radius:3px;padding:1px 5px;color:var(--dim)}
.filters{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:26px}
.chip{font-family:var(--mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;
  border:1px solid var(--line);border-radius:4px;padding:7px 11px;color:var(--muted);transition:.3s var(--ease)}
.chip:hover{color:var(--paper);border-color:rgba(231,238,247,.3)}
.chip.on{color:var(--on-accent);background:var(--accent);border-color:var(--accent)}
.pi-row{display:grid;grid-template-columns:46px minmax(0,1.9fr) minmax(0,.85fr) minmax(0,1.5fr) 140px;
  gap:18px;align-items:baseline;border-top:1px solid var(--line);padding:15px 8px;
  transition:background .3s var(--ease)}
.pi-row:last-child{border-bottom:1px solid var(--line)}
.pi-row:hover{background:rgba(231,238,247,.028)}
.pi-name{font-family:var(--disp);font-weight:500;font-size:15.2px;letter-spacing:-.012em;line-height:1.36}
.pi-stack{font-family:var(--mono);font-size:10.5px;color:rgba(138,148,163,.92);line-height:1.6}
.pi-head{border-top:0;padding-bottom:10px}
.pi-head:hover{background:none}
.st{font-family:var(--mono);font-size:9.5px;letter-spacing:.09em;text-transform:uppercase;
  display:inline-flex;align-items:center;gap:7px;color:var(--muted);white-space:nowrap}
.st i{width:5px;height:5px;border-radius:50%;background:currentColor;flex:0 0 auto}
.idx-empty{padding:34px 0;text-align:center;color:var(--dim);font-family:var(--mono);font-size:12px;letter-spacing:.06em}

/* ------------------------------- compliance ---------------------------- */
.cmp-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:0 52px}
.cmp-row{border-top:1px solid var(--line);padding:18px 0;display:grid;
  grid-template-columns:minmax(0,1fr) auto;gap:16px;align-items:baseline}
.cmp-name{font-family:var(--disp);font-weight:600;font-size:15.6px;letter-spacing:-.015em}
.cmp-detail{grid-column:1/-1;margin:8px 0 0;font-size:13.6px;line-height:1.66;color:rgba(231,238,247,.7);font-weight:300}
.stack-wrap{border:1px solid var(--line);border-radius:var(--radius);padding:22px;
  background:rgba(7,10,14,.35);margin-bottom:44px;overflow-x:auto}
.stack-wrap svg{min-width:600px}
.scope-note{margin-top:30px;border-left:1px solid var(--accent);padding-left:18px;
  font-size:13px;line-height:1.7;color:rgba(231,238,247,.7);font-weight:300;max-width:96ch}

/* -------------------------------- arsenal ------------------------------ */
.legend{display:flex;gap:22px;align-items:center;margin-bottom:28px;flex-wrap:wrap}
.dot{width:5px;height:5px;border-radius:50%;flex:0 0 auto;background:var(--dim);display:inline-block}
.dot.hands{background:var(--accent)}
.ar-row{display:grid;grid-template-columns:minmax(0,.62fr) minmax(0,2fr);gap:32px;align-items:start;
  border-top:1px solid var(--line);padding:22px 0}
.ar-row:last-child{border-bottom:1px solid var(--line)}
.ar-tools{display:flex;flex-wrap:wrap;gap:10px 22px}
.ar-tool{display:inline-flex;align-items:center;gap:9px;font-family:var(--mono);font-size:11.5px;
  letter-spacing:.02em;color:rgba(231,238,247,.86)}

/* ---------------------------------- lab -------------------------------- */
.lab-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-top:36px}
.lab-card{border:1px solid var(--line);border-radius:var(--radius);padding:22px;
  background:rgba(7,10,14,.4);display:flex;flex-direction:column;gap:11px;
  transition:border-color .4s var(--ease),transform .4s var(--ease),background .4s var(--ease)}
.lab-card:hover{border-color:rgba(0,255,157,.38);transform:translateY(-3px);background:rgba(19,26,35,.6)}
.lab-title{font-family:var(--disp);font-weight:700;font-size:16.6px;letter-spacing:-.02em;line-height:1.24;margin:0}
.lab-body{margin:0;font-size:13.4px;line-height:1.66;color:rgba(231,238,247,.72);font-weight:300}

/* --------------------------------- notes ------------------------------- */
.note{border-top:1px solid var(--line);padding:30px 0;display:grid;grid-template-columns:130px minmax(0,1fr);gap:28px}
.note:last-child{border-bottom:1px solid var(--line)}
.note-h{font-family:var(--disp);font-weight:700;font-size:clamp(17px,1.8vw,23px);letter-spacing:-.025em;line-height:1.24;margin:0}
.note-b{margin:12px 0 0;font-size:14.6px;line-height:1.72;color:rgba(231,238,247,.78);font-weight:300;max-width:78ch}
.note-ev{margin-top:14px;font-size:10px}

/* ----------------------------- credentials ----------------------------- */
.cred{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:48px}
.cred-item{border-top:1px solid var(--line);padding:18px 0}
.cred-t{font-family:var(--disp);font-weight:600;font-size:17px;letter-spacing:-.015em;margin:8px 0 0}
.cert{display:flex;justify-content:space-between;gap:18px;align-items:baseline;border-top:1px solid var(--line);padding:14px 0}
.cert-t{font-family:var(--disp);font-weight:500;font-size:15px;letter-spacing:-.012em}
.link-row{display:flex;gap:9px;align-items:center;color:var(--muted);transition:color .3s var(--ease)}
.link-row:hover{color:var(--accent)}

/* ------------------------------ resume band ---------------------------- */
.res-band{border:1px solid var(--line);border-radius:var(--radius);padding:42px 38px;
  background:linear-gradient(135deg,rgba(0,255,157,.045),rgba(231,238,247,.012));
  display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:44px;align-items:center}
.res-h{font-family:var(--disp);font-weight:900;font-size:clamp(27px,3.5vw,46px);
  letter-spacing:-.035em;line-height:1.03;margin:16px 0 0}
.btn{display:inline-flex;align-items:center;gap:9px;border:1px solid var(--line);border-radius:var(--radius);
  padding:12px 17px;font-family:var(--mono);font-size:11px;font-weight:500;letter-spacing:.09em;
  text-transform:uppercase;color:var(--muted);transition:.32s var(--ease)}
.btn:hover{border-color:var(--accent);color:var(--accent);background:rgba(0,255,157,.05)}
.btn.solid{background:var(--accent);color:var(--on-accent);border-color:var(--accent);font-weight:600}
.btn.solid:hover{background:transparent;color:var(--accent)}
.btn.sm{padding:9px 13px;font-size:10px}
.btn-row{display:flex;gap:11px;flex-wrap:wrap;margin-top:26px}
.res-toc{border-left:1px solid var(--line);padding-left:28px;display:flex;flex-direction:column;gap:9px}

/* -------------------------------- contact ------------------------------ */
.contact{background:var(--accent);color:var(--on-accent);border-radius:var(--radius);padding:48px 40px;position:relative;overflow:hidden}
.contact::after{content:"";position:absolute;right:-90px;top:-90px;width:320px;height:320px;border-radius:50%;
  background:rgba(7,10,14,.07)}
.contact-in{display:flex;align-items:flex-end;justify-content:space-between;gap:34px;flex-wrap:wrap;position:relative;z-index:1}
.contact .meta{color:rgba(4,20,12,.62)}
.contact-mail{font-family:var(--disp);font-weight:800;font-size:clamp(18px,3vw,42px);letter-spacing:-.035em;
  line-height:1.06;color:var(--on-accent);display:inline-block;border-bottom:2px solid rgba(4,20,12,.24);
  padding-bottom:6px;transition:border-color .35s var(--ease);word-break:break-word}
.contact-mail:hover{border-bottom-color:var(--on-accent)}
.contact-links{display:flex;gap:20px;flex-wrap:wrap}
.contact-links a,.contact-links button{display:inline-flex;align-items:center;gap:8px;font-family:var(--mono);
  font-size:11px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:var(--on-accent);
  opacity:.76;transition:opacity .3s var(--ease)}
.contact-links a:hover,.contact-links button:hover{opacity:1}

/* -------------------------------- footer ------------------------------- */
.foot-markwrap{overflow:hidden;margin-top:48px}
.foot-mark{font-family:var(--disp);font-weight:900;font-size:clamp(76px,17.5vw,235px);line-height:.82;
  letter-spacing:-.05em;color:var(--paper);opacity:.09;margin:0 0 -.17em;white-space:nowrap;user-select:none}
.foot-end{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:24px 0 40px;flex-wrap:wrap}
.totop{position:fixed;right:22px;bottom:22px;z-index:65;width:42px;height:42px;border:1px solid var(--line);
  border-radius:var(--radius);background:rgba(7,10,14,.86);backdrop-filter:blur(8px);
  display:flex;align-items:center;justify-content:center;color:var(--muted);transition:.35s var(--ease)}
.totop:hover{border-color:var(--accent);color:var(--accent);transform:translateY(-2px)}

/* ---------------------------- resume overlay --------------------------- */
.res-overlay{position:fixed;inset:0;z-index:120;background:rgba(4,7,10,.9);overflow-y:auto;padding:40px 20px}
.res-bar{position:sticky;top:0;z-index:2;max-width:880px;margin:0 auto 18px;display:flex;gap:9px;
  justify-content:flex-end;flex-wrap:wrap}
.res-bar .btn{background:rgba(15,20,27,.94);backdrop-filter:blur(8px)}
.res-sheet{max-width:880px;margin:0 auto;background:var(--doc);color:var(--doc-ink);
  border-radius:var(--radius);padding:48px 50px;font-family:var(--body);font-size:13.2px;line-height:1.58}
.res-sheet h1{font-family:var(--disp);font-weight:900;font-size:34px;letter-spacing:-.035em;margin:0;line-height:1}
.res-role{font-family:var(--mono);font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:var(--doc-muted);margin-top:10px}
.res-links{display:flex;flex-wrap:wrap;gap:6px 16px;margin-top:15px;padding-top:14px;
  border-top:1px solid var(--doc-line);font-family:var(--mono);font-size:10.5px;color:var(--doc-muted);letter-spacing:.02em}
.res-links a{color:var(--doc-ink);border-bottom:1px solid var(--doc-line)}
.res-sec{margin-top:26px}
.res-sec>h2{font-family:var(--mono);font-size:10.5px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;
  color:var(--doc-ink);margin:0 0 13px;padding-bottom:8px;border-bottom:1px solid var(--doc-line)}
.res-job{margin-bottom:18px;break-inside:avoid}
.res-job-h{display:flex;justify-content:space-between;gap:16px;align-items:baseline;flex-wrap:wrap}
.res-job-t{font-family:var(--disp);font-weight:700;font-size:15px;letter-spacing:-.015em}
.res-job-d{font-family:var(--mono);font-size:10.5px;color:var(--doc-muted);letter-spacing:.05em}
.res-job-r{font-size:12.4px;color:var(--doc-muted);margin-top:3px}
.res-sheet ul{margin:10px 0 0;padding:0;list-style:none}
.res-sheet li{position:relative;padding-left:15px;margin-bottom:7px;font-size:12.7px;line-height:1.56}
.res-sheet li::before{content:"";position:absolute;left:0;top:7px;width:4px;height:4px;background:var(--doc-ink)}
.res-sk{display:grid;grid-template-columns:172px minmax(0,1fr);gap:8px 18px;margin:0}
.res-sk dt{font-family:var(--mono);font-size:10.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--doc-muted)}
.res-sk dd{margin:0;font-size:12.6px}
.res-2col{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 30px}
.res-proj{margin-bottom:12px;break-inside:avoid}
.res-proj b{font-family:var(--disp);font-weight:700;font-size:13px}
.res-proj span{display:block;font-size:12.4px;color:var(--doc-muted);margin-top:3px}
.res-foot{margin-top:24px;padding-top:13px;border-top:1px solid var(--doc-line);font-size:10.5px;
  color:var(--doc-muted);font-family:var(--mono);letter-spacing:.03em;line-height:1.7}

.toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:200;background:var(--accent);
  color:var(--on-accent);font-family:var(--mono);font-size:10.5px;font-weight:600;letter-spacing:.09em;
  text-transform:uppercase;padding:11px 16px;border-radius:var(--radius);display:inline-flex;align-items:center;gap:9px;
  box-shadow:0 14px 40px rgba(0,0,0,.5)}

/* ------------------------------ responsive ----------------------------- */
@media (max-width:1180px){
  .nav-links{gap:16px}
  .nav-link.opt{display:none}
}
@media (max-width:1024px){
  .work-grid{grid-template-columns:minmax(0,1fr);gap:32px}
  .work-panel{position:relative;top:0;height:520px}
  .lab-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .pi-row{grid-template-columns:40px minmax(0,1.7fr) minmax(0,.8fr) 132px}
  .pi-stack{display:none}
  .sig-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
  .phil-cols{grid-template-columns:minmax(0,1fr)}
}
@media (max-width:900px){
  .hero-grid{grid-template-columns:minmax(0,1fr);gap:36px}
  .hero-rail{border-left:0;border-top:1px solid var(--line);padding-left:0;padding-top:24px;
    display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}
  .phil,.exp-item,.res-band,.cmp-grid,.fields,.note{grid-template-columns:minmax(0,1fr)}
  .res-band{gap:30px}
  .res-toc{border-left:0;border-top:1px solid var(--line);padding-left:0;padding-top:22px}
  .grp{grid-template-columns:minmax(0,1fr);gap:12px}
  .cred,.res-2col{grid-template-columns:minmax(0,1fr)}
  .case-head{grid-template-columns:52px minmax(0,1fr) auto;gap:13px}
  .case-in{grid-template-columns:minmax(0,1fr)}
  .nav-links{display:none}
  .burger{display:flex}
  .exp-item{gap:30px}
}
@media (max-width:768px){
  :root{--gut:20px}
  .section{padding:72px 0}
  .packet{animation-duration:52s}
  .work-tags{display:flex}
  .work-kind{display:none}
  .work-row{padding:18px 0;grid-template-columns:32px minmax(0,1fr)}
  .work-panel{height:auto;min-height:0;position:relative;top:0}
  .panel-in{position:relative;inset:auto;padding:18px;gap:14px}
  .panel-art{max-height:260px}
  .panel-art svg{min-width:540px;height:230px;flex:0 0 auto}
  .panel-art pre{min-width:520px}
  .pi-row{grid-template-columns:32px minmax(0,1fr) 108px;gap:12px;padding:15px 4px}
  .pi-dom{display:none}
  .contact{padding:32px 22px}
  .res-sheet{padding:30px 22px}
  .res-overlay{padding:20px 12px}
  .sig-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .res-sk{grid-template-columns:minmax(0,1fr);gap:4px}
  .res-sk dd{margin-bottom:10px}
  .totop{right:14px;bottom:14px}
  .case-head{grid-template-columns:44px minmax(0,1fr) auto}
  .lab-grid{grid-template-columns:minmax(0,1fr)}
  .cmd-overlay{padding:8vh 10px 10px}
  .hero{min-height:auto;padding-top:88px}
  .hero-in{padding-top:24px}
  .wordmark s{display:none}
}
@media (max-width:420px){
  .sig-grid{grid-template-columns:minmax(0,1fr)}
  .hero-rail{grid-template-columns:minmax(0,1fr)}
}

@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  .packet{display:none}
  .scroll-cue svg{animation:none}
  .pill i{animation:none}
  *,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;
    transition-duration:.001ms!important}
}

@media print{
  html,body{background:#fff!important}
  .site-root,.res-bar,.toast,.totop,.skip,.cmd-overlay,.grid-bg{display:none!important}
  .res-overlay{position:static!important;background:#fff!important;padding:0!important;overflow:visible!important;display:block!important}
  .res-sheet{max-width:none!important;width:100%!important;padding:0!important;border-radius:0!important;background:#fff!important}
  .res-sec,.res-job,.res-proj{break-inside:avoid}
  a{color:inherit!important}
}
`;

/* =============================== icons ================================== */

const PATHS = {
  upRight: "M7 17L17 7M9 7h8v8",
  down: "M6 9l6 6 6-6",
  right: "M9 6l6 6-6 6",
  up: "M12 19V5M5 12l7-7 7 7",
  close: "M18 6L6 18M6 6l12 12",
  check: "M20 6L9 17l-5-5",
  printer: "M6 9V3h12v6M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v7H6z",
  file: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M12 18v-6M9 15l3 3 3-3",
  json: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M10 12a1.6 1.6 0 00-1.6 1.6v.8A1.6 1.6 0 017 16a1.6 1.6 0 011.4 1.6v.8A1.6 1.6 0 0010 20M14 12a1.6 1.6 0 011.6 1.6v.8A1.6 1.6 0 0017 16a1.6 1.6 0 00-1.4 1.6v.8A1.6 1.6 0 0114 20",
  eye: "M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7-10-7-10-7zM12 15a3 3 0 100-6 3 3 0 000 6z",
  copy: "M9 9h10a1 1 0 011 1v10a1 1 0 01-1 1H9a1 1 0 01-1-1V10a1 1 0 011-1zM5 15H4a1 1 0 01-1-1V4a1 1 0 011-1h10a1 1 0 011 1v1",
  search: "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3",
  cmd: "M9 6a3 3 0 10-3 3h12a3 3 0 10-3-3v12a3 3 0 103-3H6a3 3 0 103 3z",
  mail: "M3 6h18v12H3zM3 7l9 6 9-6",
  phone: "M5 3h4l2 5-3 2a12 12 0 006 6l2-3 5 2v4a1 1 0 01-1 1A17 17 0 014 4a1 1 0 011-1z",
  pin: "M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11zM12 12a2.6 2.6 0 100-5.2A2.6 2.6 0 0012 12z",
  bolt: "M13 2L4 14h6l-1 8 9-12h-6z",
};

const Ico = ({ n, s = 14, sw = 1.8, style }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>
    <path d={PATHS[n]} />
  </svg>
);

const StatusBadge = ({ s, className }) => (
  <span className={cx("badge", className)} style={{ color: stColor(s) }}>
    <i />{s}
  </span>
);

/* ================================ data ================================== */

const PROFILE = {
  name: "Ayush Kumar Srivastava",
  wordmark: "AYUSH SRIVASTAVA",
  footmark: "RYUGA",
  role: "DevSecOps & Platform Engineer",
  email: "ayush.kumar.srivastava150@gmail.com",
  phone: "+91 63903 67652",
  phoneHref: "+916390367652",
  location: "Lucknow, India",
  tz: "Asia/Kolkata",
  updated: "16 October 2026",
  github: { label: "GitHub", handle: "heroaks", url: "https://github.com/heroaks" },
  linkedin: { label: "LinkedIn", handle: "ayush-srivastava-150", url: "https://www.linkedin.com/in/ayush-srivastava-150" },
  elsewhere: [
    { label: "LeetCode", handle: "ryuga__", url: "https://leetcode.com/ryuga__" },
    { label: "HackerRank", handle: "ryuga__", url: "https://www.hackerrank.com/ryuga__" },
    { label: "GeeksforGeeks", handle: "ryuga__", url: "https://auth.geeksforgeeks.org/user/ryuga__" },
  ],
};

const HERO = {
  meta: "DevSecOps · Cloud Infrastructure · Platform Engineering",
  lineA: "Building secure, observable,",
  lineB: "cost-conscious cloud infrastructure.",
  sub:
    "I work across AWS and Azure estates, container platforms, CI/CD, identity and endpoint security, observability, and cloud cost. My bias is toward systems that are repeatable by design: role-based access instead of shared keys, infrastructure as code instead of console drift, and evidence-based troubleshooting instead of guesswork.",
  rail: [
    { k: "Current", role: "DevOps Engineer", org: "NIIT Limited · Feb 2026 –" },
    { k: "Previous", role: "Associate DevSecOps Engineer", org: "Castler · Jul 2024 – Jan 2026" },
    { k: "Focus", role: "ECS · MSK · CI/CD · Zero Trust", org: "Observability · FinOps · IaC" },
  ],
};

const SIGNALS = [
  { v: "110+", l: "VMs under management across AWS and Azure" },
  { v: "10+", l: "Enterprise applications in scope" },
  { v: "~60%", l: "Azure spend reduction at NIIT (reported)" },
  { v: "~25%", l: "AWS spend reduction at NIIT (reported)" },
  { v: "~87%", l: "Azure spend reduction at Castler (reported)" },
  { v: "20–30", l: "Legacy servers decommissioned" },
  { v: "100+", l: "Endpoints under Intune management" },
  { v: "30+", l: "Zero Trust endpoint baselines" },
  { v: "10+", l: "SSO and Conditional Access integrations" },
  { v: "100+", l: "Custom Wazuh SIEM alert rules" },
  { v: "50+", l: "Developers migrated to a browser bastion" },
  { v: "~60%", l: "Faster detection and response (reported)" },
];

const WORK = [
  {
    n: "01", kind: "Platform architecture", art: "micro", status: "PRODUCTION",
    title: "Spring Boot microservices on ECS",
    copy:
      "An ECS cluster carrying a Spring Boot estate — authentication, transactions, scheduling, and Debezium CDC — behind an API gateway, with Amazon MSK for events, Redis for hot state, and Consul for discovery and configuration. Delivered through Jenkins with a controlled deployment gate.",
    tech: "AWS ECS · Spring Boot · API Gateway · Amazon MSK · Redis · Consul · Jenkins",
  },
  {
    n: "02", kind: "Data path", art: "stream", status: "PRODUCTION",
    title: "Event backbone with MSK, Debezium and Redis",
    copy:
      "Change data capture from PostgreSQL into Kafka topics, consumed by idempotent services with explicit offset commits. The event path is deliberately isolated from the synchronous request path so a consumer rebalance cannot degrade checkout latency.",
    tech: "Amazon MSK · Kafka · Debezium · Redis · RDS PostgreSQL · ECS",
  },
  {
    n: "03", kind: "Observability", art: "observe", status: "PRODUCTION",
    title: "Open-source observability platform",
    copy:
      "Replaced licensed monitoring (Pingdom, OpManager) with a centralized Grafana, Loki, Prometheus, Fluent Bit, and Uptime Kuma platform. Alert routing across AWS SNS, SendGrid, Teams, and Telegram, with deployment annotations so a release shows up on the same graph as the latency it caused.",
    tech: "Grafana · Loki · Prometheus · Fluent Bit · Uptime Kuma · SNS · Athena",
  },
  {
    n: "04", kind: "Secure access", art: "bastion", status: "PRODUCTION",
    title: "Browser bastion with Apache Guacamole",
    copy:
      "Containerized Guacamole on Linux behind Nginx and TLS, brokering RDP and SSH into private subnets. Moved 50+ developers off a legacy Windows bastion and VPN path, removed per-seat licensing, and eliminated inbound RDP exposure without slowing anyone down.",
    tech: "Apache Guacamole · guacd · Docker · Nginx · TLS · EC2 · RDP / SSH",
  },
  {
    n: "05", kind: "Platform revamp", art: "ecs", status: "IN PROGRESS",
    title: "ECS platform engineering and revamp",
    copy:
      "A Next.js frontend, Strapi CMS, and Fastify gateway on ECS with EC2 capacity. The revamp separates content-team capacity from production using distinct ASGs and capacity providers, adds ARM64 golden images, Service Connect for internal traffic, task-role access, and deployment circuit breakers.",
    tech: "ECS · ARM64 / Graviton · ALB · CloudFront · Service Connect · Secrets Manager",
  },
  {
    n: "06", kind: "Delivery pipeline", art: "cicd", status: "IMPLEMENTED",
    title: "GitLab CI/CD migration with security gates",
    copy:
      "Migrated source control and CI/CD from CodeCommit and CodeBuild to self-hosted GitLab with self-hosted runners. Commit-SHA image tags, ECR publishing, Trivy and Snyk gates, SonarQube analysis, and a manual deployment stage that registers a new task definition revision.",
    tech: "GitLab · GitLab Runner · Docker · AWS IAM · ECR · Trivy · Snyk · SonarQube",
  },
  {
    n: "07", kind: "Identity and endpoint", art: "identity", status: "PRODUCTION",
    title: "Endpoint, identity and Zero Trust foundation",
    copy:
      "Organization-wide Intune and Entra ID at a fintech: 100+ endpoints enrolled, 30+ baselines covering BitLocker, Defender for Endpoint, LAPS, app restrictions, web filtering, and removable media, with SSO, SAML, and Conditional Access across 10+ applications.",
    tech: "Microsoft Intune · Entra ID · Conditional Access · Defender · LAPS · SAML",
  },
  {
    n: "08", kind: "Production evidence", art: "incident", status: "PRODUCTION",
    title: "Production performance investigation",
    copy:
      "Severe slowness and intermittent 502s under elevated traffic, investigated with ALB access logs in Athena SQL, correlated against service CPU and memory, target health, and health-check configuration in the same time window — evidence first, capacity second.",
    tech: "ALB access logs · Athena SQL · CloudWatch · ECS · FireLens / Fluent Bit",
  },
];

const CASES = [
  {
    id: "CF-01", art: "micro", status: "PRODUCTION",
    title: "Spring Boot microservices on ECS with MSK, Redis, and Consul",
    summary:
      "A transaction-heavy microservice estate moved onto a managed ECS cluster with a durable event backbone, centralized discovery, and pipeline-driven releases.",
    stack: "AWS ECS · Spring Boot · API Gateway · Amazon MSK · Kafka · Debezium · Redis · Consul · Jenkins · ECR",
    fields: [
      ["Context",
        "A platform of Spring Boot services covering authentication, transaction processing, scheduling, and change data capture. Each service needed an independent release path while sharing eventing, caching, and discovery, and the estate had to run inside an existing private VPC with strict egress rules."],
      ["Problem",
        "Services reached each other through shared ingress paths and static configuration. Deployments were manual, credentials travelled with environment files, discovery was a hardcoded list, and there was no durable event path for state changes that downstream services depended on — so integration was polling-based and brittle."],
      ["My role",
        "Deployed and operated the ECS cluster, defined task definitions, capacity providers, and health checks, integrated API gateway routing, stood up MSK, Redis, and Consul, and built the Jenkins delivery path. Service-level application design was owned jointly with the service authors; I owned the platform and the pipeline."],
      ["Architecture",
        "API gateway and ALB in the public path. ECS services in private subnets with task-role-based AWS access. Consul for registration, health checking, and runtime configuration. Amazon MSK carrying CDC and domain events. Redis for hot lookups and short-lived state. RDS PostgreSQL as the system of record. No account IDs, cluster names, topic names, or private endpoints are published here."],
      ["Implementation",
        "Debezium runs as Kafka Connect workers on ECS and publishes table changes to MSK topics partitioned by aggregate ID. Transaction and scheduler services consume with explicit offset commits and idempotent handlers. Every service uses its own task role rather than shared credentials, secrets live in Secrets Manager, images are ARM64/Graviton, and Jenkins builds, scans, publishes to ECR, then registers a new task definition revision selecting the application container by name."],
      ["Challenges",
        "Multi-container task definitions include a FireLens log-router sidecar, so an index-based container update mutated the wrong container's image. Consul health and ALB target health disagreed during rollouts until deregistration delays and draining were tuned. Consumer-group rebalances surfaced as latency spikes during deploys until partitioning and handler idempotency were tightened."],
      ["Outcome",
        "Repeatable Jenkins-driven releases, a durable event path that decouples transaction processing from downstream consumers, centralized discovery and configuration, and internal traffic that no longer traverses public ingress components."],
      ["Lessons",
        "Select containers by name, never by array index. Validate the whole path — host bootstrap, agent health, registration, capacity provider association, placement constraints, image pull, secret retrieval, container health. Discovery health and load-balancer health are two different signals and both need to be watched."],
    ],
  },
  {
    id: "CF-02", art: "incident", status: "PRODUCTION",
    title: "Production performance investigation with ALB logs and Athena",
    summary:
      "Severe slowness and intermittent 502s during elevated traffic, resolved with correlated evidence rather than by adding capacity first.",
    stack: "ALB access logs · Athena SQL · CloudWatch · ECS · FireLens / Fluent Bit",
    fields: [
      ["Context",
        "A production web platform serving customer traffic through CloudFront and an Application Load Balancer into ECS, composed of a Next.js frontend, a Strapi CMS, and a Fastify gateway, with RDS PostgreSQL and S3 behind them."],
      ["Problem",
        "Users reported severe slowness and intermittent failures during elevated traffic. There was no single view connecting request volume, route behaviour, status codes, target latency, and service resource usage, so the first instinct in the room was to scale out."],
      ["My role",
        "Led the investigation across logs, metrics, and configuration; correlated the evidence into a timeline; and produced the analysis. Remediation was agreed and implemented with the application owners."],
      ["Architecture",
        "CloudFront to ALB to ECS tasks in private subnets, with RDS PostgreSQL and S3 behind them, and FireLens plus Fluent Bit shipping container logs to a centralized store. ALB access logs land in S3 and are queried in place with Athena."],
      ["Implementation",
        "Queried ALB access logs with Athena SQL, breaking results down by route, status code (2xx, 502, 504), and target response time. Compared request volume against service CPU and memory in the same window. Reviewed health-check interval, threshold, and timeout behaviour under load. Inspected internal service-to-service paths that were unnecessarily crossing shared ingress instead of using direct discovery."],
      ["Challenges",
        "Two separate observation windows were recorded: one with typical traffic around 1.5K–2K requests per minute and a spike above 10K; another with a typical average near 1.18K, peaks around 2.5K, and spikes near 7.93K. They are different windows and must never be merged into a single baseline. Health-check configuration and dependency latency contributed as much as raw volume."],
      ["Outcome",
        "A defensible, evidence-based picture of which routes failed, when 502s appeared, and how target latency related to request volume during the incident window — plus the specific configuration and path changes that followed."],
      ["Lessons",
        "A traffic graph is one piece of evidence, not a root cause. Correlate volume, latency, status codes, target health, and resource data inside the same window. Adding instances does not fix every overload pattern, and a health check that flaps under load will take capacity away exactly when it is needed."],
    ],
  },
  {
    id: "CF-03", art: "identity", status: "PRODUCTION",
    title: "Zero Trust, detection, and compliance foundation at a fintech",
    summary:
      "Endpoint, identity, detection, data protection, and audit evidence work in a small regulated environment where I was initially the primary security resource.",
    stack: "Intune · Entra ID · Conditional Access · Defender EDR · Sentinel · Wazuh · Purview DLP · Trivy · Snyk · OWASP ZAP · Nessus",
    fields: [
      ["Context",
        "A sub-100-person fintech startup expanding into regulated banking relationships, with device access and application sign-on managed informally and audit evidence assembled by hand at request time."],
      ["Problem",
        "No centralized endpoint management, inconsistent local administrator control, scattered application credentials, no unified detection across endpoint and cloud, and compliance evidence that had to be reconstructed for every auditor question."],
      ["My role",
        "Initially the primary security-focused resource. Built the Intune and Entra ID foundation, integrated security tooling into delivery, configured data loss prevention, deployed the SIEM, and prepared technical evidence for audits. Certification ownership and sign-off remained with the business."],
      ["Architecture",
        "Entra ID as the identity plane, Conditional Access as the policy layer, Intune as the endpoint plane, SSO and SAML in front of 10+ applications, Defender for Endpoint and Wazuh for detection across EC2, RDS, CloudWatch, and CloudTrail, and scanning gates inside the build pipeline so findings appear before release."],
      ["Implementation",
        "100+ endpoints enrolled. 30+ baseline controls including BitLocker, Defender for Endpoint, LAPS, application installation restrictions, web filtering, and removable-media control. SSO, SAML, and Conditional Access across 10+ tools. Trivy, Snyk, and OWASP ZAP inside Jenkins, with Nessus for infrastructure scanning. Purview DLP with custom sensitive information types. Wazuh as the primary monitoring platform with 100+ custom alert rules plus Grafana and Prometheus dashboards, routed to Teams, Discord, Telegram, and email."],
      ["Challenges",
        "One person connecting endpoint, server, cloud, and identity evidence. Balancing control strictness against developer friction — an over-tight baseline gets quietly routed around. Demonstrating data residency for RBI expectations while services spanned multiple clouds. Tuning 100+ alert rules so the SIEM produced signal rather than noise."],
      ["Outcome",
        "Centrally applied, auditable policy across endpoints and identities; earlier visibility of vulnerabilities in the delivery path; and evidence available as a byproduct of the control rather than a separate project. Supported technical preparation for ISO/IEC 27001:2022, PCI DSS v4.0, SOC 2 Type II, and AWS FTR, with RBI data localization work completed."],
      ["Lessons",
        "Policy applied centrally beats policy documented in a wiki. Evidence should fall out of the control automatically. Use 'supported' and 'prepared evidence for' unless you formally owned the certification — precision is what makes a security claim believable."],
    ],
  },
  {
    id: "CF-04", art: "observe", status: "PRODUCTION",
    title: "Replacing licensed monitoring with an open-source observability platform",
    summary:
      "Consolidating logs, metrics, uptime, and deployment timing into one queryable stack, then retiring the paid tools after a parallel run.",
    stack: "Grafana · Loki · Prometheus · Fluent Bit / FireLens · Uptime Kuma · Node Exporter · CloudWatch · Athena · SNS · SendGrid · Teams · Telegram",
    fields: [
      ["Context",
        "A multi-cloud estate of roughly 110 VMs and 10+ enterprise applications, monitored by licensed tools with per-monitor pricing, fragmented coverage between AWS and Azure, and alert routing that did not always reach the team that owned the service."],
      ["Problem",
        "No single pane across logs, metrics, uptime, and deployments. Alert noise without ownership, retention limits that made post-incident review impossible, and a renewal cost that grew with every monitor added."],
      ["My role",
        "Selected the target stack, deployed and configured it on self-hosted infrastructure, defined the alert signal set and routing matrix, migrated monitors, ran a parallel period, and then retired the licensed tooling."],
      ["Architecture",
        "Container logs from ECS via FireLens and Fluent Bit into Loki. Host metrics from Node Exporter across AMD64 and ARM64, plus container metrics, into Prometheus. ALB access logs retained in S3 and queried with Athena for deep dives. Uptime Kuma for external and synthetic checks. Grafana as the single query and visualization layer over all of it, with alerting out through SNS to Teams, Telegram, and SendGrid email."],
      ["Implementation",
        "Everything runs containerized on EC2 with persistent volumes, correct file ownership, TLS at an Nginx reverse proxy, backups, and routine image cleanup. EC2 service discovery keeps Prometheus targets aligned with Auto Scaling events. Dashboards are organized around RED signals per service plus saturation for the hosts, with deployment timestamps annotated so a release appears on the same graph as the behaviour it changed. Alert rules are tied to signals that justify a page: ALB target response time, unhealthy target count, 5xx rate, running versus desired task count, and host CPU, memory, and disk."],
      ["Challenges",
        "Alert fatigue versus missed pages — the routing matrix and severity tiers took longer than the deployment. Proving parity with a commercial uptime monitor before anyone agreed to retire it. Retention cost on Loki and Prometheus, which forced a deliberate per-signal-class retention policy instead of keeping everything. Exporter version drift across mixed-architecture hosts."],
      ["Outcome",
        "One centralized observability path with lower recurring licence cost, alerts routed to service owners, deploy-window correlation for incident review, and retention long enough to answer the question asked a week later."],
      ["Lessons",
        "Observability is a product with users; the alert list is the real deliverable. Retention should be proportional to the question you will need to answer later. Always parallel-run before retiring a paid tool, and write down who is paged at 3am before you cut over."],
    ],
  },
  {
    id: "CF-05", art: "bastion", status: "PRODUCTION",
    title: "Browser-based bastion with Apache Guacamole",
    summary:
      "Removing inbound RDP exposure, VPN friction, and per-seat licensing in one move, without making access slower for 50+ developers.",
    stack: "Apache Guacamole · guacd · Docker · Nginx · TLS · EC2 · RDP / SSH · Security Groups",
    fields: [
      ["Context",
        "Developers and administrators needed access to Windows VMs and some Linux hosts in private subnets. The existing path was a Windows bastion plus VPN, with per-seat licensing, a heavy client experience, and access tied to VPN account lifecycle."],
      ["Problem",
        "Inbound RDP exposure and a wide VPN network footprint, licence cost that scaled with headcount, no consistent session audit trail, and onboarding and offboarding that required changes in two separate systems."],
      ["My role",
        "Designed and operated the containerized Guacamole deployment on Linux, defined the connection inventory and access model, migrated users in waves, and decommissioned the legacy Windows bastion path afterwards."],
      ["Architecture",
        "Browser to Nginx with TLS and an authentication gate, to the Guacamole web application container, to guacd, then RDP or SSH to hosts in private subnets. No public RDP or SSH listeners. Connection credentials are held in the broker and secrets store rather than on developer machines, and security groups allow guacd to reach targets only from the application tier."],
      ["Implementation",
        "Docker Compose on EC2 with persistent volumes and correct ownership, health checks, backups of the connection store, image cleanup, and reproducible configuration. Access is grouped by role so a team gets the hosts it owns. Session behaviour is tuned for constrained bandwidth: colour depth, wallpaper and font smoothing disabled, and thin-client settings enabled."],
      ["Challenges",
        "RDP session quality over poor links was the make-or-break detail — an unusable session means people route around the bastion. Clipboard and drive redirection policy had to be decided deliberately rather than left at defaults. Keyboard layout differences and Ctrl+Alt+End handling generated most of the support tickets. Proving the licensing and operational saving without disrupting anyone mid-sprint required a staged migration."],
      ["Outcome",
        "50+ developers migrated off the legacy Windows bastion and VPN workflow, the associated licensing overhead removed, access centralized and attributable per user, and no inbound RDP from the internet."],
      ["Lessons",
        "A bastion is a UX product; if it is slower than the VPN it replaces, it will be bypassed. The best migrations remove a network hop, a licence line, and an attack surface in the same change — that combination is what makes them easy to approve."],
    ],
  },
];

const EXPERIENCE = [
  {
    n: "01", org: "NIIT Limited", role: "DevOps Engineer", dates: "Feb 2026 – Present",
    scope:
      "Scope / Multi-cloud estate of roughly 110 VMs (≈40 AWS, ≈70 Azure) and 10+ enterprise applications, with platform, delivery, observability, access, cost, and modernization responsibilities. Enterprise environment mixing a newer AWS landing and web estate with a decade-old legacy Azure estate.",
    groups: [
      {
        label: "Platform", bullets: [
          "Deploy and manage an ECS cluster for a Spring Boot microservice estate covering authentication, transactions, scheduling, and Debezium CDC, integrating API gateway routing and private-subnet networking.",
          "Stand up and operate Amazon MSK for change data capture and domain events, Redis for hot lookups and short-lived state, and Consul for service registration, health checking, and configuration.",
          "Operate an ECS-on-EC2 application platform running a Next.js frontend, Strapi CMS, and Fastify gateway, with ECR images, ALB and CloudFront ingress, RDS PostgreSQL, S3 media, and centralized container logging.",
          "Build ARM64 / Graviton-compatible images, an Ubuntu golden ECS host image, launch templates, and cluster registration configuration, moving toward awsvpc networking with Service Connect and Cloud Map.",
          "Prefer ECS task roles for application-level AWS access, keep secrets in Secrets Manager, and separate secret references from ordinary environment configuration.",
        ]
      },
      {
        label: "Delivery", bullets: [
          "Migrate source control and CI/CD from AWS CodeCommit and CodeBuild to self-hosted GitLab with GitLab Runners, adding Trivy, SonarQube, and Snyk gates for container scanning, static analysis, and vulnerability detection.",
          "Build Jenkins pipelines for the microservice estate, separating image creation from a controlled deployment stage that registers a new task definition revision.",
          "Author infrastructure as code for a Next.js, Strapi, and Fastify platform using Pulumi on AWS ECS, alongside Terraform modules for compute with encrypted gp3 storage and IMDSv2.",
          "Handle multi-container task definitions so automation updates the intended application container by name rather than by array position.",
        ]
      },
      {
        label: "Observability", bullets: [
          "Replace a licensed monitoring stack (Pingdom, OpManager) with a centralized open-source platform using Grafana, Loki, Prometheus, Fluent Bit, and Uptime Kuma.",
          "Build alert routing through AWS SNS, SendGrid, Microsoft Teams, and Telegram, with signals around ALB target response time, unhealthy target count, 5xx rate, and running versus desired task counts.",
          "Design EC2 service discovery so monitoring targets follow Auto Scaling events, and plan Node Exporter coverage across mixed AMD64 and ARM64 hosts.",
        ]
      },
      {
        label: "Cost", bullets: [
          "Reduce reported Azure spend by approximately 60% (₹20L → ₹8L per month) and AWS spend by approximately 25% (₹6L → ₹4.5L per month) through rightsizing, consolidation, archival strategy, and migration to open-source alternatives.",
          "Decommission 20–30 legacy servers and migrate managed Redis and database backup workloads onto existing infrastructure, lowering recurring cloud service cost.",
          "Assess storage growth and backup retention for a self-hosted GitLab service, distinguishing live application data from older backup data and weighing archival cost against restore requirements and existing AMI lifecycle coverage.",
        ]
      },
      {
        label: "Access", bullets: [
          "Design and operate containerized browser-based bastion infrastructure using Apache Guacamole on Linux, migrating 50+ developers off legacy Windows bastion and VPN workflows and removing the associated licensing overhead.",
          "Run self-hosted engineering services on EC2 and Docker with persistent volumes, file ownership, TLS, Nginx reverse proxy, backups, and image cleanup.",
        ]
      },
      {
        label: "Investigation", bullets: [
          "Investigate production performance using ALB access logs, Athena SQL, request volume and status code trends, target latency, health checks, and service resource metrics.",
          "Resolve ECS host registration and task placement failures across host bootstrap, agent health, capacity provider association, subnet IP capacity, security groups, image pull, and secret retrieval.",
          "Lead modernization of legacy .NET Framework applications on Windows toward Node.js-based containerized services on AWS Linux, staged as discover → target architecture → incremental migration → validate → retire.",
        ]
      },
    ],
  },
  {
    n: "02", org: "Castler", role: "Associate DevSecOps Engineer", dates: "Jul 2024 – Jan 2026",
    scope:
      "Progression / Campus-hired as a Trainee Engineer, then progressed into DevSecOps responsibilities and title. Sub-100-person fintech where DevOps, IT, and security overlapped and I was initially the primary security-focused resource.",
    groups: [
      {
        label: "Identity", bullets: [
          "Implement Microsoft Intune organization-wide with 30+ Zero Trust policies and integrate SSO with Conditional Access across 10+ applications, strengthening identity governance and reducing credential sprawl.",
          "Bring 100+ endpoints under managed configuration and policy coverage with baselines for BitLocker, Defender for Endpoint, LAPS, application installation restrictions, web filtering, and removable media.",
          "Centralize AWS multi-account governance with enforced tagging, IAM Identity Center SSO, and DNS routing for secure, compliant operations.",
        ]
      },
      {
        label: "Detection", bullets: [
          "Deploy Microsoft Defender EDR, Sentinel SIEM, and XDR for unified threat detection, automated response, and cross-domain investigation, reducing incident detection and response time by approximately 60% (reported).",
          "Design and implement Wazuh SIEM as the primary monitoring platform across production cloud resources including EC2, RDS, CloudWatch, and CloudTrail, with 100+ custom alert rules and Grafana plus Prometheus dashboards.",
          "Route alerts through Teams, Discord, Telegram, and email, and align AWS multi-account monitoring with AWS FTR best practices.",
        ]
      },
      {
        label: "DevSecOps", bullets: [
          "Manage ECS and Docker workloads, migrate CI/CD from Azure DevOps to Jenkins, and automate vulnerability scanning with Snyk and Trivy, reducing deployment time from 10–30 minutes to 5–15 minutes.",
          "Integrate OWASP ZAP dynamic testing and Nessus scanning into delivery workflows so findings surface before release rather than after.",
          "Author Ansible playbooks for OS and system hardening across Amazon Linux, RHEL 9, and Ubuntu 22 and 24.",
        ]
      },
      {
        label: "Compliance", bullets: [
          "Complete RBI data localization compliance work and lead technical preparation for PCI DSS v4.0, ISO/IEC 27001:2022, SOC 2 Type II, and external bank audits.",
          "Implement Microsoft Purview DLP with custom sensitive information types and organization-wide policies covering data at rest and in transit.",
          "Conduct quarterly VAPT cycles, BCP and DR drills, and organization-wide security training, and contribute to AWS Foundational Technical Review preparation.",
        ]
      },
      {
        label: "Cost & network", bullets: [
          "Lead cost optimization across AWS, Azure, GCP, Cloudflare, and Microsoft 365, achieving an approximately 87% Azure spend reduction and 30%+ AWS savings (reported).",
          "Replace a paid uptime monitor with Uptime Kuma and multi-channel alerting, cutting annual monitoring cost by roughly $180.",
          "Configure a FortiGate 80F environment with dual ISP connectivity and VPN access, migrate from OpenVPN toward FortiClient, and operate private VPC boundaries with ALB and Cloudflare DNS.",
        ]
      },
      {
        label: "Automation", bullets: [
          "Automate an approval workflow with Power Automate, with a reported reduction of roughly 40% in manual effort or turnaround.",
          "Build an Ollama and n8n workflow to summarize downtime logs and explore more consistent incident report preparation.",
          "Migrate an internal CRM workload from a VM-based setup to a local Kubernetes environment using kind.",
        ]
      },
    ],
  },
  {
    n: "03", org: "Independent Engineering", role: "Personal projects and lab", dates: "2024 – Present",
    scope:
      "Scope / Self-directed work outside employment. Kept deliberately separate from professional deliverables and labelled as POC, design, or learning.",
    groups: [
      {
        label: "Software & AI", bullets: [
          "Build a multi-agent code quality and optimization application combining AST-oriented static analysis, hybrid retrieval, specialist review agents, confidence validation, and source attribution behind FastAPI, PostgreSQL, and Docker.",
          "Ship a multi-file implementation with CLI and browser interfaces plus an automated test suite covering inefficient algorithms, N+1 query patterns, duplication, behavioural drift, coverage gaps, and circular dependencies.",
        ]
      },
      {
        label: "Infrastructure", bullets: [
          "Build a reproducible Proxmox VE and Talos Linux Kubernetes lab to practise VM provisioning, cluster lifecycle, and infrastructure as code with Terraform and talosctl.",
          "Develop a reusable Terraform configuration for AWS compute with explicit networking, encrypted gp3 storage, variables, outputs, and IMDSv2 hardening.",
        ]
      },
    ],
  },
];

const INDEX = [
  { n: "01", name: "Spring Boot microservices platform on ECS", domain: "Platform", stack: "ECS, Spring Boot, API Gateway, Consul, Jenkins", status: "PRODUCTION" },
  { n: "02", name: "Event backbone with MSK, Debezium and Redis", domain: "Data / Streaming", stack: "Amazon MSK, Kafka, Debezium, Redis, PostgreSQL", status: "PRODUCTION" },
  { n: "03", name: "Jenkins delivery pipelines for microservices", domain: "Delivery", stack: "Jenkins, Docker, ECR, Trivy, Snyk, OWASP ZAP", status: "PRODUCTION" },
  { n: "04", name: "Open-source observability platform", domain: "Observability", stack: "Grafana, Loki, Prometheus, Fluent Bit, Uptime Kuma", status: "PRODUCTION" },
  { n: "05", name: "Browser bastion with Apache Guacamole", domain: "Access", stack: "Guacamole, guacd, Docker, Nginx, TLS", status: "PRODUCTION" },
  { n: "06", name: "Wazuh SIEM and AWS multi-account governance", domain: "Security", stack: "Wazuh, CloudTrail, Sentinel, IAM Identity Center", status: "PRODUCTION" },
  { n: "07", name: "Endpoint, identity and Zero Trust foundation", domain: "Security", stack: "Intune, Entra ID, Conditional Access, SAML SSO", status: "PRODUCTION" },
  { n: "08", name: "Production performance investigation", domain: "Investigation", stack: "ALB access logs, Athena SQL, CloudWatch", status: "PRODUCTION" },
  { n: "09", name: "Ansible hardening and configuration playbooks", domain: "Automation", stack: "Ansible, Amazon Linux, RHEL 9, Ubuntu", status: "PRODUCTION" },
  { n: "10", name: "Compliance and audit evidence programme", domain: "Assurance", stack: "ISO 27001, PCI DSS v4.0, SOC 2, RBI, AWS FTR", status: "OPERATED" },
  { n: "11", name: "AWS ECS platform engineering and revamp", domain: "Platform", stack: "ECS, ARM64, ALB, CloudFront, Service Connect", status: "IN PROGRESS" },
  { n: "12", name: "Cloud cost and estate modernization", domain: "FinOps", stack: "AWS, Azure, Rightsizing, Archival, Open source", status: "IN PROGRESS" },
  { n: "13", name: "Self-hosted GitLab CI/CD to ECR and ECS", domain: "Delivery", stack: "GitLab, Runner, Docker, AWS IAM, ECS", status: "IMPLEMENTED" },
  { n: "14", name: "Infrastructure as code with Pulumi and Terraform", domain: "IaC", stack: "Pulumi, Terraform, AWS ECS, EC2, IMDSv2", status: "IMPLEMENTED" },
  { n: "15", name: "SonarQube Community in CI", domain: "Quality", stack: "SonarQube, PostgreSQL, SonarScanner, OpenJDK 17", status: "IMPLEMENTED" },
  { n: "16", name: "GitLab storage, backup and retention assessment", domain: "Operations", stack: "EBS, S3, AMI lifecycle, Archival analysis", status: "IMPLEMENTED" },
  { n: "17", name: "Serverless deployment notifications", domain: "Automation", stack: "Lambda, Python, Secrets Manager, Teams webhook", status: "POC" },
  { n: "18", name: "AI-assisted downtime log summarization", domain: "Exploration", stack: "Ollama, n8n, Local LLM, Operational logs", status: "POC" },
  { n: "19", name: "Autonomous code quality and optimization system", domain: "Software / AI", stack: "Python, FastAPI, PostgreSQL, AST, Docker", status: "POC" },
  { n: "20", name: "Cloud billing analytics path", domain: "FinOps", stack: "Billing exports, CloudQuery, PostgreSQL, Metabase", status: "DESIGNED" },
  { n: "21", name: "Monthly uptime reporting automation", domain: "Automation", stack: "Uptime Kuma, SQLite, EC2, Scheduling", status: "DESIGNED" },
  { n: "22", name: "Cross-account EC2 start/stop automation", domain: "Automation", stack: "EC2, IAM roles, Cross-account access, Scheduling", status: "DESIGNED" },
  { n: "23", name: "Proxmox and Talos Kubernetes homelab", domain: "Lab", stack: "Proxmox VE, Talos Linux, Kubernetes, Terraform", status: "LEARNING" },
  { n: "24", name: "Ubuntu application and DevOps lab", domain: "Lab", stack: "kind, Helm, Jenkins, Argo CD, Grafana", status: "LEARNING" },
  { n: "25", name: "Icinga deployment pattern evaluation", domain: "Evaluation", stack: "Proxmox, LXC, Virtual machines, Docker", status: "LEARNING" },
];

const FILTERS = ["ALL", "PRODUCTION", "OPERATED", "IN PROGRESS", "IMPLEMENTED", "POC", "DESIGNED", "LEARNING"];

const PHILOSOPHY_LEAD = "Infrastructure is a system, not a collection of consoles.";
const PHILOSOPHY = [
  { h: "Repeatable by default", p: "Golden images, launch templates, IaC, and validated bootstrap. If a host cannot be rebuilt from code in an emergency, it is not finished." },
  { h: "Private unless proven otherwise", p: "Workloads live in private subnets with explicit, minimal ingress paths. Roles and secret managers replace long-lived credentials." },
  { h: "Evidence before opinion", p: "Logs, metrics, traffic, and deployment timestamps correlated in the same window. A graph is a lead, not a conclusion." },
  { h: "Deployments must be reversible", p: "Health checks, circuit breakers, rollback, graceful draining, and deregistration delays. A pipeline without an undo path is a risk generator." },
  { h: "Cost is an engineering signal", p: "Rightsizing, consolidation, archival, and open-source substitution — but retention and tooling stay proportional to operational value." },
  { h: "Label the status honestly", p: "Production, implemented, POC, in progress, designed, learning. The distinction between what runs and what is proposed is the whole credibility of the page." },
];

const COMPLIANCE_LEAD =
  "Security work is only credible when the control, the evidence, and the owner are all named. This is the assurance layer I built and operated: identity and endpoint policy, detection, data protection, secure delivery, and audit evidence — with the wording kept deliberately precise about what I owned versus what I supported.";

const COMPLIANCE = [
  { name: "ISO/IEC 27001:2022", status: "EVIDENCE PREPARED", detail: "Led technical preparation and control evidence across the ISMS audit cycle, mapping infrastructure and identity controls to requirements." },
  { name: "PCI DSS v4.0", status: "EVIDENCE PREPARED", detail: "Technical control mapping and evidence collection for cardholder data environment requirements, including access control, logging, and scanning." },
  { name: "SOC 2 Type II", status: "SUPPORTED", detail: "Supported control evidence across security, availability, and confidentiality criteria and responded to auditor technical questions." },
  { name: "RBI data localization", status: "COMPLETED", detail: "Technical owner for data residency work relevant to Indian payment data, covering storage location, retention, and access boundaries." },
  { name: "AWS Foundational Technical Review", status: "SUPPORTED", detail: "Contributed to FTR preparation and to responses for bank and customer audits, including evidence collection across accounts." },
  { name: "Quarterly VAPT", status: "OPERATED", detail: "Coordinated vulnerability assessment and penetration testing cycles, triaged findings, and tracked remediation to closure with development teams." },
  { name: "BCP / DR drills", status: "OPERATED", detail: "Ran business continuity and disaster recovery exercises, validating restore paths and documenting gaps for follow-up." },
  { name: "Security awareness training", status: "DELIVERED", detail: "Delivered organization-wide training covering credential hygiene, phishing, device policy, and safe handling of customer data." },
  { name: "Data loss prevention", status: "IMPLEMENTED", detail: "Configured Microsoft Purview DLP with custom sensitive information types and organization-wide policies covering data at rest and in transit." },
  { name: "SIEM and threat detection", status: "PRODUCTION", detail: "Wazuh as the primary monitoring platform across EC2, RDS, CloudWatch, and CloudTrail with 100+ custom alert rules, alongside Defender for Endpoint EDR, Sentinel, XDR, and ClamAV host scanning." },
  { name: "Identity governance", status: "PRODUCTION", detail: "Entra ID Conditional Access, SSO and SAML across 10+ applications, privileged access controls, IAM Identity Center, enforced tagging, and multi-account AWS governance." },
  { name: "Secure delivery", status: "PRODUCTION", detail: "Trivy, Snyk, OWASP ZAP, Nessus, and SonarQube gates inside Jenkins and GitLab pipelines so findings surface before release rather than after." },
  { name: "Network boundary", status: "OPERATED", detail: "FortiGate 80F with dual ISP and VPN access, OpenVPN to FortiClient migration, private VPC boundaries, ALB exposure control, Cloudflare DNS, and TLS termination at Nginx reverse proxies." },
  { name: "Secrets and runtime config", status: "PRODUCTION", detail: "Secrets Manager backed configuration, task and instance roles instead of long-lived static credentials, build-context exclusions for environment files, and least privilege per service." },
];

const ARSENAL = [
  { cat: "AWS infrastructure", level: "Hands-on · professional", tools: ["EC2", "ECS", "ECR", "ALB", "CloudFront", "VPC", "IAM", "S3", "RDS PostgreSQL", "Secrets Manager", "Lambda", "EventBridge", "CloudWatch", "Athena", "Amazon MSK", "IAM Identity Center"] },
  { cat: "Microsoft cloud & identity", level: "Hands-on · professional", tools: ["Azure VMs", "Entra ID", "Intune", "Conditional Access", "Purview DLP", "Defender for Endpoint", "Sentinel", "LAPS", "BitLocker"] },
  { cat: "Containers & orchestration", level: "Hands-on · professional", tools: ["Docker", "Docker Compose", "ECS task definitions", "Sidecars & FireLens", "Consul", "ECR image builds", "ARM64 / Graviton"] },
  { cat: "CI/CD & automation", level: "Hands-on · professional", tools: ["Jenkins", "GitLab CI/CD", "GitLab Runner", "Ansible", "Ansible Semaphore", "Power Automate", "n8n", "Bash"] },
  { cat: "Infrastructure as code", level: "Hands-on · professional", tools: ["Terraform", "HCL", "AWS provider", "Pulumi", "Launch templates", "Golden images"] },
  { cat: "Observability", level: "Hands-on · professional", tools: ["Grafana", "Loki", "Prometheus", "Fluent Bit", "CloudWatch", "Uptime Kuma", "Node Exporter", "ECS Container Insights"] },
  { cat: "Security & compliance", level: "Hands-on · professional", tools: ["Wazuh", "Trivy", "Snyk", "OWASP ZAP", "Nessus", "SonarQube", "ClamAV", "Burp Suite", "Wireshark", "ISO 27001:2022", "PCI DSS v4.0", "SOC 2 Type II", "AWS FTR"] },
  { cat: "Data & messaging", level: "Hands-on · professional", tools: ["Kafka", "Debezium CDC", "Redis", "PostgreSQL", "MySQL", "SQLite", "Athena SQL", "Metabase", "CloudQuery"] },
  { cat: "Network & access", level: "Hands-on · professional", tools: ["FortiGate 80F", "FortiClient", "VPN", "Cloudflare DNS", "Nginx", "TLS", "Apache Guacamole", "Security groups"] },
  { cat: "Languages & scripting", level: "Hands-on · professional", tools: ["Python", "Bash", "SQL", "YAML", "JavaScript", "Node.js", "FastAPI", "Java fundamentals"] },
  { cat: "Systems, lab & learning", level: "Lab / POC", tools: ["Proxmox VE", "Talos Linux", "Kubernetes", "kind", "Helm", "Argo CD", "Go", "Icinga", "Twingate", "Ubuntu", "RHEL", "Arch", "Kali", "Neovim"] },
];

const LAB = [
  { status: "LEARNING", title: "Proxmox and Talos Kubernetes homelab", body: "A non-HA cluster on Proxmox VE targeting one Talos control-plane node and two workers, with VM templates, networking, talosctl, and Terraform for repeatable provisioning.", stack: "Proxmox VE · Talos Linux · Kubernetes · Terraform" },
  { status: "POC", title: "Autonomous code quality and optimization system", body: "A multi-agent code analysis application pairing AST-oriented static checks with hybrid retrieval, confidence validation, and source attribution behind FastAPI, PostgreSQL, and Docker.", stack: "Python · FastAPI · PostgreSQL · Docker" },
  { status: "LEARNING", title: "Ubuntu application and DevOps lab", body: "A small Ubuntu Server environment for container and Kubernetes practice using Docker, Twingate, kind, and Helm, with a planned stack of Jenkins, Argo CD, Grafana, and Prometheus.", stack: "Ubuntu · kind · Helm · Argo CD" },
  { status: "IMPLEMENTED", title: "Terraform AWS compute module", body: "A reusable Terraform configuration for an EC2 instance in an existing VPC and private subnet, with security group rules, encrypted gp3 storage, variables, outputs, and IMDSv2.", stack: "Terraform · HCL · AWS provider" },
  { status: "DESIGNED", title: "Cross-account EC2 start/stop automation", body: "Centralized scheduled start and stop for EC2 instances across multiple AWS accounts, orchestrated through a management environment and cross-account role assumption to cut idle compute.", stack: "EC2 · IAM roles · EventBridge" },
  { status: "POC", title: "AI-assisted downtime log summarization", body: "A local Ollama and n8n workflow that summarizes downtime logs to explore more consistent incident report preparation without sending operational data to a hosted model.", stack: "Ollama · n8n · Local LLM" },
];

const NOTES = [
  { h: "An ACTIVE container instance does not prove a task can be placed.", b: "A custom Ubuntu ECS host joined the Auto Scaling Group but never registered because the agent service was disabled in the image. Enabling and restarting it restored registration. A later deployment still sat in PROVISIONING with pending tasks and no assigned container instance. Validate the whole path: boot, agent startup, registration, capacity provider association, placement constraints, subnet IP capacity, security groups, image pull, secret retrieval, and container health.", ev: "Evidence / ECS agent state · launch template · capacity provider · task placement" },
  { h: "Select the container by name, never by array index.", b: "The task definition holds an application container and a log-router sidecar. Deployment scripting that assumed the first array element was the application mutated the wrong container image. Locating the container by name is a small change that removes an entire class of silent pipeline failure.", ev: "Evidence / Task definition revision diffs · pipeline deployment stage" },
  { h: "A traffic graph is one piece of evidence, not a root cause.", b: "During a production slowdown, request volume, target latency, status codes, target health, and service CPU and memory only made sense when correlated inside the same window. Two separate observation windows were recorded and are reported separately rather than merged into one baseline. Health-check configuration and dependency latency contributed as much as raw volume.", ev: "Evidence / ALB access logs · Athena SQL · CloudWatch metrics" },
  { h: "If .env can reach the build context, assume it reached the image.", b: "A container packaging review found that .dockerignore did not exclude .env, so build context and resulting images could carry environment files. The durable fix is structural: secrets in Secrets Manager, task roles for cloud access, no static credentials in configuration, least privilege per service — followed by verification of published artifacts and rotation where needed.", ev: "Evidence / Build context review · image history · secret rotation record" },
  { h: "The backup question is not whether it can be compressed.", b: "A storage review found a large live GitLab footprint alongside an older backup set holding several hundred gigabytes. The useful questions were which data is live, which is duplicated, which restore points are actually required, what daily AMI snapshots and lifecycle policies already cover, how quickly archived data must be restored, and what the total retrieval cost is.", ev: "Evidence / Live versus backup data comparison · snapshot lifecycle policy" },
  { h: "Roles and secret managers beat long-lived credentials.", b: "Runner authentication moved to instance-role-based AWS access in place of static keys. Application-level access moved to ECS task roles. Webhook URLs moved out of source into Secrets Manager with environment-driven selection. Every one of these removes a credential that would otherwise need rotation, audit, and an incident plan.", ev: "Evidence / Runner auth model · task role policies · secret references" },
  { h: "Keep monitoring retention proportional to operational value.", b: "Replacing a licensed monitoring suite is not only a cost decision. Coverage, ownership, retention, alert routing, and who is paged at 3am all have to be answered before a tool is retired. The open-source path only wins if the alerts are as trustworthy as the ones it replaces.", ev: "Evidence / Alert signal inventory · routing matrix · retention policy" },
  { h: "A bastion that is slower than the VPN gets bypassed.", b: "Migrating 50+ developers to a browser-based Guacamole path only worked because session quality was tuned deliberately — colour depth, font smoothing, thin-client settings, clipboard and drive redirection policy. Security controls that degrade the workflow do not get adopted, they get routed around.", ev: "Evidence / Migration waves · session tuning config · licensing removal" },
  { h: "Separate what is deployed from what is designed.", b: "Some of the work here runs in production, some is configured but not customer-facing, some is a proof of concept, and some is an architecture on paper. Status labels are attached to every project on this site because that distinction is the difference between an engineer and a brochure.", ev: "Evidence / Status labels on every project entry" },
];

const EDUCATION = [{ org: "Amity University Lucknow", deg: "B.Tech, Computer Science & Engineering", dates: "Sep 2020 – Jun 2024", note: "CGPA 8.27 / 10" }];
const SCHOOL = [
  { org: "City Montessori School", deg: "Class XII (Senior Secondary)", dates: "Apr 2018 – Mar 2020", note: "95%" },
  { org: "City Montessori School", deg: "Class X (Secondary)", dates: "Apr 2016 – Mar 2018", note: "90%" },
];
const CERTS = [
  { name: "SQLi Attacks", issuer: "EC-Council" },
  { name: "Docker Fundamentals", issuer: "Cantrill" },
  { name: "Introduction to Cybersecurity", issuer: "Cisco" },
  { name: "CCNA: Introduction to Networks", issuer: "Cisco" },
];

const RESUME_SUMMARY =
  "DevOps and DevSecOps engineer working across AWS and Azure infrastructure, container platforms, CI/CD automation, observability, and security-minded operations. Experience spans fintech security foundations and enterprise cloud and platform work, from endpoint and identity controls to ECS delivery workflows, production troubleshooting, and cloud cost optimization. I turn manual, fragile processes into repeatable systems using automation, role-based access, infrastructure as code, and evidence-driven monitoring.";

const RESUME_SKILLS = [
  { g: "Cloud & infrastructure", v: "AWS (EC2, ECS, ECR, ALB, CloudFront, VPC, IAM, S3, RDS, MSK, Lambda, Athena, CloudWatch, Secrets Manager), Azure, GCP exposure, Cloudflare" },
  { g: "DevSecOps & automation", v: "Jenkins, GitLab CI/CD, GitLab Runner, Docker, Ansible, Ansible Semaphore, Terraform, Pulumi, Power Automate, n8n" },
  { g: "Security & compliance", v: "ISO 27001:2022, PCI DSS v4.0, SOC 2 Type II, RBI data localization, Intune, Entra ID, Defender EDR, Sentinel, Wazuh, Trivy, Snyk, OWASP ZAP, Nessus, SonarQube, Purview DLP, VAPT" },
  { g: "Observability", v: "Grafana, Loki, Prometheus, Fluent Bit, CloudWatch, Uptime Kuma, Node Exporter, ALB access log analysis with Athena" },
  { g: "Data & messaging", v: "Amazon MSK, Kafka, Debezium, Redis, PostgreSQL, MySQL, SQLite, Athena SQL, Metabase" },
  { g: "Languages & systems", v: "Python, Bash, SQL, YAML, JavaScript / Node.js, Java fundamentals, Go (learning), Linux (Ubuntu, RHEL, Amazon Linux, Arch, Kali)" },
];

const RESUME_JOBS = [
  {
    org: "NIIT Limited", role: "DevOps Engineer", dates: "Feb 2026 – Present", sub: "",
    bullets: [
      "Modernize and operate multi-cloud infrastructure across AWS and Azure covering 110+ VMs and 10+ enterprise applications, reducing reported Azure spend by approximately 60% (₹20L to ₹8L per month) and AWS spend by approximately 25% (₹6L to ₹4.5L per month) through rightsizing, consolidation, archival, and open-source replacements.",
      "Deploy and manage an ECS cluster for a Spring Boot microservice estate including authentication, transaction, scheduler, and Debezium CDC services, integrating API gateway routing, Amazon MSK, Redis, and Consul, with delivery through Jenkins.",
      "Migrate source control and CI/CD from AWS CodeCommit and CodeBuild to self-hosted GitLab with GitLab Runners, integrating Trivy, SonarQube, and Snyk gates for container scanning, static analysis, and vulnerability detection.",
      "Replace a licensed monitoring stack (Pingdom, OpManager) with a centralized open-source observability platform using Grafana, Loki, Prometheus, Fluent Bit, and Uptime Kuma, with alert routing through AWS SNS, SendGrid, Microsoft Teams, and Telegram.",
      "Design and operate a containerized browser-based bastion using Apache Guacamole on Linux, migrating 50+ developers off legacy Windows bastion and VPN workflows and eliminating the associated licensing overhead.",
      "Containerize backend services with Docker, build GitLab CI/CD pipelines replacing manual deployment, and author infrastructure as code for a Next.js, Strapi, and Fastify platform using Pulumi and AWS ECS.",
      "Decommission 20-30 legacy servers and migrate managed Redis and database backup workloads onto existing infrastructure, reducing recurring cloud service cost.",
      "Investigate production performance using ALB access logs, Athena SQL, and service resource metrics, and resolve ECS host registration and task placement failures across bootstrap, agent health, capacity, and network layers.",
    ],
  },
  {
    org: "Castler", role: "Associate DevSecOps Engineer", dates: "Jul 2024 – Jan 2026",
    sub: "Progressed from a campus-hired Trainee Engineer role into DevSecOps responsibilities in a sub-100-person fintech; initially the primary security-focused resource.",
    bullets: [
      "Implement Microsoft Intune organization-wide with 30+ Zero Trust policies and integrate SSO with Conditional Access across 10+ applications, covering 100+ endpoints and reducing credential sprawl.",
      "Deploy Microsoft Defender EDR, Sentinel SIEM, and XDR for unified threat detection, automated response, and cross-domain investigation, reducing incident detection and response time by approximately 60%.",
      "Design and implement Wazuh SIEM as the primary monitoring platform across production cloud resources (EC2, RDS, CloudWatch, CloudTrail) with 100+ custom alert rules and Grafana plus Prometheus dashboards.",
      "Manage ECS and Docker workloads, migrate CI/CD from Azure DevOps to Jenkins, and automate vulnerability scanning with Snyk and Trivy, reducing deployment time from 10-30 minutes to 5-15 minutes.",
      "Author Ansible playbooks for OS and system hardening across Amazon Linux, RHEL 9, and Ubuntu 22 and 24, ensuring secure and consistent deployment.",
      "Lead cost optimization across AWS, Azure, GCP, Cloudflare, and Microsoft 365, achieving an approximately 87% reduction in Azure spend and 30%+ AWS savings.",
      "Complete RBI data localization compliance and lead technical preparation for PCI DSS v4.0, ISO/IEC 27001:2022, SOC 2 Type II, and external bank audits; run quarterly VAPT, BCP and DR drills, and organization-wide security training.",
      "Centralize AWS multi-account governance with enforced tagging, IAM Identity Center SSO, and DNS routing; configure FortiGate 80F with dual ISP and VPN access.",
    ],
  },
];

const RESUME_PROJECTS = [
  { n: "Spring Boot microservices platform on ECS", d: "ECS cluster for authentication, transaction, scheduler, and Debezium CDC services with API gateway, Amazon MSK, Redis, and Consul, delivered through Jenkins." },
  { n: "Event backbone with MSK, Debezium and Redis", d: "Change data capture from PostgreSQL into Kafka topics with idempotent consumers, explicit offset commits, and a request path kept separate from the event path." },
  { n: "Open-source observability platform", d: "Grafana, Loki, Prometheus, Fluent Bit, and Uptime Kuma replacing licensed monitoring, with EC2 service discovery and multi-channel alert routing." },
  { n: "Browser bastion with Apache Guacamole", d: "Containerized Guacamole and guacd behind Nginx and TLS, brokering RDP and SSH into private subnets for 50+ developers." },
  { n: "Autonomous code quality and optimization system", d: "Multi-agent code analysis combining AST-oriented static checks, hybrid retrieval, confidence validation, and source attribution behind FastAPI, PostgreSQL, and Docker." },
  { n: "Proxmox and Talos Kubernetes homelab", d: "Reproducible lab for VM provisioning, cluster lifecycle, and infrastructure as code using Proxmox VE, Talos Linux, Terraform, and talosctl." },
];

const RESUME_COMPLIANCE = [
  "ISO/IEC 27001:2022, PCI DSS v4.0, SOC 2 Type II technical preparation and control evidence",
  "RBI data localization compliance, technical ownership",
  "AWS Foundational Technical Review preparation and bank / customer audit responses",
  "Quarterly VAPT coordination, remediation tracking, BCP and DR drills",
  "Microsoft Purview DLP with custom sensitive information types",
  "Organization-wide security awareness training",
];

const RESUME_TOC = ["Summary", "Skills", "Experience", "Selected projects", "Compliance & assurance", "Education", "Certifications"];

const NAV = [
  { id: "work", label: "Work" },
  { id: "cases", label: "Case files" },
  { id: "experience", label: "Experience" },
  { id: "index", label: "Index", opt: true },
  { id: "compliance", label: "Security" },
  { id: "arsenal", label: "Stack", opt: true },
  { id: "notes", label: "Notes", opt: true },
];

/* ============================== utilities =============================== */

function useLockBody(active) {
  useEffect(() => {
    if (!active) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [active]);
}

function useReveal() {
  const reduce = useReducedMotion();
  return useCallback((delay = 0, y = 22) => (reduce ? {} : {
    initial: { opacity: 0, y },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.12 },
    transition: { duration: 0.75, delay, ease: EASE },
  }), [reduce]);
}

const wrap = (s, w = 96) => {
  const out = [];
  let cur = "";
  String(s).split(/\s+/).forEach((word) => {
    if ((cur + " " + word).trim().length > w) { out.push(cur.trim()); cur = word; }
    else cur += (cur ? " " : "") + word;
  });
  if (cur.trim()) out.push(cur.trim());
  return out.join("\n");
};
const indent = (s) => s.replace(/^/gm, "  ");

function resumeText() {
  const R = "=".repeat(78);
  const L = [];
  L.push(PROFILE.name.toUpperCase(), PROFILE.role, "");
  L.push(PROFILE.email + "  |  " + PROFILE.phone + "  |  " + PROFILE.location);
  L.push("GitHub: " + PROFILE.github.handle + "  |  LinkedIn: " + PROFILE.linkedin.handle);
  L.push("LeetCode / HackerRank / GFG: ryuga__");
  L.push("", R, "", "SUMMARY", "", indent(wrap(RESUME_SUMMARY)), "");
  L.push(R, "", "SKILLS", "");
  RESUME_SKILLS.forEach((s) => { L.push(s.g.toUpperCase() + ":"); L.push(indent(wrap(s.v, 74))); });
  L.push("", R, "", "EXPERIENCE", "");
  RESUME_JOBS.forEach((j) => {
    L.push(j.org + "  |  " + j.role + "  |  " + j.dates);
    if (j.sub) L.push(indent(wrap(j.sub, 76)));
    j.bullets.forEach((b) => L.push(indent(wrap("* " + b, 76))));
    L.push("");
  });
  L.push(R, "", "SELECTED PROJECTS", "");
  RESUME_PROJECTS.forEach((p) => { L.push("* " + p.n); L.push(indent(wrap(p.d, 74))); });
  L.push("", R, "", "COMPLIANCE & ASSURANCE", "");
  RESUME_COMPLIANCE.forEach((c) => L.push(indent(wrap("* " + c, 76))));
  L.push("", R, "", "EDUCATION", "");
  EDUCATION.concat(SCHOOL).forEach((e) => L.push(e.org + "  |  " + e.deg + "  |  " + e.dates + "  |  " + e.note));
  L.push("", R, "", "CERTIFICATIONS", "");
  CERTS.forEach((c) => L.push("* " + c.name + " — " + c.issuer));
  L.push("", R);
  L.push("Updated " + PROFILE.updated + ". Cost and efficiency figures are reported values from the referenced comparison windows, not independently audited metrics.");
  return L.join("\n");
}

function resumeMarkdown() {
  const L = [];
  L.push("# " + PROFILE.name, "**" + PROFILE.role + "**", "");
  L.push("`" + PROFILE.email + "` · `" + PROFILE.phone + "` · " + PROFILE.location);
  L.push("[GitHub](" + PROFILE.github.url + ") · [LinkedIn](" + PROFILE.linkedin.url + ") · LeetCode/HackerRank/GFG: `ryuga__`", "");
  L.push("## Summary", RESUME_SUMMARY, "", "## Skills");
  RESUME_SKILLS.forEach((s) => L.push("- **" + s.g + ":** " + s.v));
  L.push("", "## Experience");
  RESUME_JOBS.forEach((j) => {
    L.push("### " + j.org + " — " + j.role, "`" + j.dates + "`", "");
    if (j.sub) L.push(j.sub, "");
    j.bullets.forEach((b) => L.push("- " + b));
    L.push("");
  });
  L.push("## Selected Projects");
  RESUME_PROJECTS.forEach((p) => L.push("- **" + p.n + "** — " + p.d));
  L.push("", "## Compliance & Assurance");
  RESUME_COMPLIANCE.forEach((c) => L.push("- " + c));
  L.push("", "## Education");
  EDUCATION.concat(SCHOOL).forEach((e) => L.push("- " + e.org + " — " + e.deg + ", " + e.dates + " (" + e.note + ")"));
  L.push("", "## Certifications");
  CERTS.forEach((c) => L.push("- " + c.name + " — " + c.issuer));
  L.push("", "---", "Updated " + PROFILE.updated + ". Cost and efficiency figures are reported values from the referenced comparison windows, not independently audited metrics.");
  return L.join("\n");
}

function resumeJSON() {
  return JSON.stringify({
    basics: {
      name: PROFILE.name, label: PROFILE.role, email: PROFILE.email, phone: PROFILE.phone,
      location: { city: "Lucknow", countryCode: "IN" },
      summary: RESUME_SUMMARY,
      profiles: [
        { network: "GitHub", username: PROFILE.github.handle, url: PROFILE.github.url },
        { network: "LinkedIn", username: PROFILE.linkedin.handle, url: PROFILE.linkedin.url },
        { network: "LeetCode", username: "ryuga__", url: "https://leetcode.com/ryuga__" },
        { network: "HackerRank", username: "ryuga__", url: "https://www.hackerrank.com/ryuga__" },
        { network: "GeeksforGeeks", username: "ryuga__", url: "https://auth.geeksforgeeks.org/user/ryuga__" },
      ],
    },
    work: RESUME_JOBS.map((j) => ({ name: j.org, position: j.role, startDate: j.dates, summary: j.sub || undefined, highlights: j.bullets })),
    skills: RESUME_SKILLS.map((s) => ({ name: s.g, keywords: s.v.split(",").map((x) => x.trim()) })),
    projects: RESUME_PROJECTS.map((p) => ({ name: p.n, description: p.d })),
    compliance: RESUME_COMPLIANCE,
    education: EDUCATION.concat(SCHOOL).map((e) => ({ institution: e.org, area: e.deg, startDate: e.dates, score: e.note })),
    certifications: CERTS.map((c) => ({ name: c.name, issuer: c.issuer })),
    meta: { updated: PROFILE.updated, note: "Cost and efficiency figures are reported values from referenced comparison windows, not independently audited metrics." },
  }, null, 2);
}

function download(filename, content, mime) {
  try {
    const blob = new Blob([content], { type: mime || "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    return true;
  } catch (e) { return false; }
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch (e) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (e2) { return false; }
  }
}

/* ============================ diagram kit =============================== */

const DC = {
  fill: "rgba(231,238,247,0.035)", fillHot: "rgba(0,255,157,0.07)",
  stroke: "rgba(231,238,247,0.20)", soft: "rgba(231,238,247,0.13)",
  hot: "rgba(0,255,157,0.5)", paper: "#E7EEF7", muted: "#8A94A3",
  accent: "#00FF9D", info: "#7DD3FC", warn: "#FFC46B",
};
const MONO = "'JetBrains Mono Variable',ui-monospace,monospace";

function Defs({ id }) {
  return (
    <defs>
      <pattern id={id} width="18" height="18" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.7" fill="rgba(231,238,247,0.07)" />
      </pattern>
    </defs>
  );
}

function Bx({ x, y, w, h, label, hot, sub, tone }) {
  const col = tone === "info" ? DC.info : tone === "warn" ? DC.warn : hot ? DC.accent : DC.paper;
  const stroke = tone === "info" ? "rgba(125,211,252,0.45)" : hot ? DC.hot : DC.stroke;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="3"
        fill={hot || tone ? DC.fillHot : DC.fill} stroke={stroke} strokeWidth="1" />
      <text x={x + 10} y={sub ? y + h / 2 - 1 : y + h / 2 + 3.4} fontFamily={MONO} fontSize="9.5"
        letterSpacing="0.08em" fill={col}>{label}</text>
      {sub ? (
        <text x={x + 10} y={y + h / 2 + 11} fontFamily={MONO} fontSize="8" letterSpacing="0.06em"
          fill={DC.muted}>{sub}</text>
      ) : null}
    </g>
  );
}

function Wr({ pts, hot, node }) {
  const d = pts.map((p, i) => (i === 0 ? "M " : "L ") + p[0] + "," + p[1]).join(" ");
  const mid = pts[Math.floor(pts.length / 2)];
  return (
    <g>
      <path d={d} fill="none" stroke={hot ? DC.hot : DC.soft} strokeWidth="1" />
      {node ? <rect x={mid[0] - 2} y={mid[1] - 2} width="4" height="4" fill={hot ? DC.accent : DC.muted} /> : null}
    </g>
  );
}

function Lb({ x, y, children, tone = "muted", size = 8.5, anchor = "start" }) {
  return (
    <text x={x} y={y} fontFamily={MONO} fontSize={size} letterSpacing="0.09em" textAnchor={anchor}
      fill={tone === "accent" ? DC.accent : tone === "paper" ? DC.paper : tone === "info" ? DC.info : DC.muted}>
      {children}
    </text>
  );
}

function DiagramMicro() {
  const svc = [["AUTH SERVICE", "SPRING BOOT"], ["TRANSACTION SERVICE", "SPRING BOOT"], ["SCHEDULER SERVICE", "SPRING BOOT"], ["DEBEZIUM CONNECT", "KAFKA CONNECT"], ["NOTIFICATION SERVICE", "SPRING BOOT"]];
  const infra = [["AMAZON MSK", "KAFKA TOPICS"], ["REDIS", "CACHE / STATE"], ["RDS POSTGRESQL", "SYSTEM OF RECORD"], ["CONSUL", "DISCOVERY / CONFIG"], ["S3", "ARCHIVE / EXPORTS"]];
  const ys = [138, 174, 210, 246, 282];
  return (
    <svg viewBox="0 0 560 400" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Spring Boot microservices on ECS">
      <Defs id="gm" />
      <rect x="0" y="0" width="560" height="400" fill="url(#gm)" />
      <Bx x={16} y={16} w={104} h={30} label="CLIENTS" />
      <Bx x={150} y={16} w={118} h={30} label="API GATEWAY" hot />
      <Bx x={298} y={16} w={76} h={30} label="ALB" />
      <Bx x={440} y={16} w={104} h={30} label="JENKINS" />
      <Bx x={440} y={62} w={104} h={30} label="ECR" />
      <Wr pts={[[120, 31], [150, 31]]} node />
      <Wr pts={[[268, 31], [298, 31]]} node />
      <Wr pts={[[336, 46], [336, 104]]} />
      <Wr pts={[[492, 46], [492, 62]]} />
      <Wr pts={[[492, 92], [492, 104]]} />
      <Lb x={344} y={80}>PUBLIC INGRESS</Lb>
      <Lb x={432} y={86} anchor="end">PUBLISH</Lb>
      <rect x={16} y={104} width={528} height={232} rx="3" fill="rgba(231,238,247,0.015)" stroke={DC.soft} strokeWidth="1" />
      <Lb x={28} y={124}>PRIVATE SUBNETS · ECS CLUSTER · SPRING BOOT ON ARM64</Lb>
      {ys.map((y, i) => (
        <g key={"svc" + y}>
          <Bx x={40} y={y} w={150} h={28} label={svc[i][0]} sub={svc[i][1]} />
          <Bx x={370} y={y} w={158} h={28} label={infra[i][0]} sub={infra[i][1]} />
          <Wr pts={[[190, y + 14], [262, y + 14]]} />
          <Wr pts={[[262, y + 14], [370, y + 14]]} node />
        </g>
      ))}
      <path d="M262,146 L262,296" stroke={DC.hot} strokeWidth="1" fill="none" />
      <rect x={260} y={144} width="4" height="4" fill={DC.accent} />
      <rect x={260} y={294} width="4" height="4" fill={DC.accent} />
      <Lb x={40} y={326} tone="accent">CONSUL REGISTRATION + HEALTH CHECKS ON THE INTERNAL PATH</Lb>
      <Lb x={16} y={362} tone="paper">JENKINS → ECR → NEW TASK DEFINITION REVISION → CONTROLLED DEPLOY</Lb>
      <Lb x={16} y={382}>CDC PATH: POSTGRESQL → DEBEZIUM → MSK TOPICS → IDEMPOTENT CONSUMERS</Lb>
    </svg>
  );
}

function DiagramStream() {
  const topics = ["auth.events", "txn.events", "cdc.outbox"];
  return (
    <svg viewBox="0 0 560 350" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Event backbone with MSK and Debezium">
      <Defs id="gs" />
      <rect x="0" y="0" width="560" height="350" fill="url(#gs)" />
      <Bx x={16} y={20} w={150} h={34} label="RDS POSTGRESQL" sub="WAL / LOGICAL REPL." />
      <Bx x={205} y={20} w={150} h={34} label="DEBEZIUM CONNECT" sub="WORKERS ON ECS" />
      <Bx x={394} y={20} w={150} h={34} label="AMAZON MSK" sub="MANAGED KAFKA" hot />
      <Wr pts={[[166, 37], [205, 37]]} node />
      <Wr pts={[[355, 37], [394, 37]]} node />
      <Wr pts={[[469, 54], [469, 66]]} />
      <rect x={394} y={66} width={150} height={84} rx="3" fill="rgba(231,238,247,0.02)" stroke={DC.soft} strokeWidth="1" />
      <Lb x={404} y={84}>TOPICS</Lb>
      {topics.map((t, i) => (
        <g key={t}>
          <rect x={404} y={92 + i * 18} width={130} height={14} rx="2" fill={DC.fill} stroke={DC.stroke} strokeWidth="1" />
          <text x={412} y={102 + i * 18} fontFamily={MONO} fontSize="8.5" letterSpacing="0.05em" fill={DC.paper}>{t}</text>
        </g>
      ))}
      <path d="M469,150 L469,164 L86,164 L86,178" stroke={DC.soft} strokeWidth="1" fill="none" />
      <path d="M280,164 L280,178" stroke={DC.soft} strokeWidth="1" fill="none" />
      <path d="M469,164 L469,178" stroke={DC.soft} strokeWidth="1" fill="none" />
      <rect x={84} y={162} width="4" height="4" fill={DC.accent} />
      <Bx x={16} y={178} w={150} h={34} label="TRANSACTION SVC" sub="CONSUMER" />
      <Bx x={205} y={178} w={150} h={34} label="SCHEDULER SVC" sub="CONSUMER" />
      <Bx x={394} y={178} w={150} h={34} label="ARCHIVE / S3" sub="SINK" />
      <Wr pts={[[86, 212], [86, 250]]} node />
      <Wr pts={[[280, 212], [280, 250]]} />
      <Wr pts={[[469, 212], [469, 250]]} />
      <Bx x={16} y={250} w={150} h={34} label="REDIS" sub="HOT LOOKUPS" />
      <Bx x={205} y={250} w={150} h={34} label="CONSUL" sub="DISCOVERY / CONFIG" />
      <Bx x={394} y={250} w={150} h={34} label="API GATEWAY" sub="PUBLIC PATH" hot />
      <Lb x={16} y={312} tone="paper">OFFSET COMMITS + RETRY · IDEMPOTENT CONSUMERS · PARTITION KEY BY AGGREGATE ID</Lb>
      <Lb x={16} y={332}>THE EVENT PATH IS DELIBERATELY SEPARATE FROM THE SYNCHRONOUS REQUEST PATH</Lb>
    </svg>
  );
}

function DiagramECS() {
  const rows = [
    { y: 158, l: "NEXT.JS FRONTEND", r: "RDS POSTGRESQL" },
    { y: 198, l: "STRAPI CMS", r: "S3 MEDIA STORE" },
    { y: 238, l: "FASTIFY GATEWAY", r: "SECRETS MANAGER" },
  ];
  return (
    <svg viewBox="0 0 520 360" preserveAspectRatio="xMidYMid meet" role="img" aria-label="ECS platform architecture">
      <Defs id="ge" />
      <rect x="0" y="0" width="520" height="360" fill="url(#ge)" />
      <Bx x={16} y={20} w={130} h={32} label="CLOUDFRONT" />
      <Bx x={196} y={20} w={90} h={32} label="ALB" hot />
      <Bx x={344} y={20} w={160} h={32} label="GITLAB CI/CD" />
      <Bx x={344} y={76} w={160} h={32} label="ECR · ARM64 IMAGES" />
      <Wr pts={[[146, 36], [196, 36]]} node />
      <Wr pts={[[424, 52], [424, 76]]} />
      <Wr pts={[[241, 52], [241, 124]]} node />
      <Wr pts={[[424, 108], [424, 124]]} />
      <Lb x={252} y={92}>PUBLIC INGRESS</Lb>
      <Lb x={432} y={100}>PUBLISH</Lb>
      <rect x={16} y={124} width={488} height={212} rx="3" fill="rgba(231,238,247,0.015)" stroke={DC.soft} strokeWidth="1" />
      <Lb x={28} y={144}>PRIVATE SUBNETS · ECS ON EC2 · ARM64 GRAVITON</Lb>
      {rows.map((r) => (
        <g key={"r" + r.y}>
          <Bx x={40} y={r.y} w={150} h={30} label={r.l} />
          <Bx x={330} y={r.y} w={150} h={30} label={r.r} />
          <Wr pts={[[190, r.y + 15], [330, r.y + 15]]} node />
        </g>
      ))}
      <Lb x={40} y={292} tone="accent">ASG + CAPACITY PROVIDER SPLIT: CONTENT vs PRODUCTION</Lb>
      <Lb x={40} y={310} tone="paper">LOGS → FIRELENS / FLUENT BIT → LOKI</Lb>
      <Lb x={40} y={328}>TASK ROLES FOR APP ACCESS · SECRETS OUTSIDE ENV CONFIG</Lb>
    </svg>
  );
}

function DiagramObserve() {
  const sources = [["ECS TASKS", "FIRELENS"], ["EC2 HOSTS", "NODE EXPORTER"], ["ALB", "ACCESS LOGS → S3"], ["UPTIME KUMA", "SYNTHETIC"]];
  const ys = [112, 152, 192, 232];
  return (
    <svg viewBox="0 0 560 400" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Observability pipeline">
      <Defs id="go" />
      <rect x="0" y="0" width="560" height="400" fill="url(#go)" />
      <Lb x={16} y={28} tone="paper">SOURCES</Lb>
      <Lb x={212} y={28} tone="paper">COLLECT</Lb>
      <Lb x={360} y={28} tone="paper">STORE</Lb>
      <Lb x={470} y={28} tone="paper">ACT</Lb>
      <line x1={16} y1={40} x2={544} y2={40} stroke={DC.soft} strokeWidth="1" />
      {ys.map((y, i) => (
        <g key={"ob" + y}>
          <Bx x={16} y={y} w={168} h={30} label={sources[i][0]} sub={sources[i][1]} />
          <Wr pts={[[184, y + 15], [212, y + 15]]} node />
        </g>
      ))}
      <Bx x={212} y={112} w={120} h={70} label="FLUENT BIT" sub="LOG SHIPPER" hot />
      <Bx x={212} y={192} w={120} h={70} label="PROMETHEUS" sub="SCRAPE + SD" hot />
      <Wr pts={[[332, 147], [360, 147]]} />
      <Wr pts={[[332, 227], [360, 227]]} />
      <Bx x={360} y={112} w={100} h={70} label="LOKI" sub="LOGS" tone="info" />
      <Bx x={360} y={192} w={100} h={70} label="PROM TSDB" sub="METRICS" tone="info" />
      <Wr pts={[[460, 147], [488, 147], [488, 172]]} />
      <Wr pts={[[460, 227], [488, 227], [488, 202]]} />
      <Bx x={470} y={172} w={74} h={30} label="GRAFANA" hot />
      <Wr pts={[[507, 202], [507, 292]]} node />
      <rect x={16} y={292} width={528} height={62} rx="3" fill="rgba(231,238,247,0.015)" stroke={DC.soft} strokeWidth="1" />
      <Lb x={28} y={312} tone="paper">ALERT ROUTING · SEVERITY TIERS · OWNER MATRIX</Lb>
      {["AWS SNS", "TEAMS", "TELEGRAM", "SENDGRID"].map((c, i) => (
        <g key={c}>
          <rect x={28 + i * 126} y={322} width={116} height={22} rx="3" fill={DC.fill} stroke={DC.stroke} strokeWidth="1" />
          <text x={28 + i * 126 + 58} y={337} textAnchor="middle" fontFamily={MONO} fontSize="8.5" letterSpacing="0.06em" fill={DC.paper}>{c}</text>
        </g>
      ))}
      <Lb x={16} y={382}>DEPLOY TIMESTAMPS ANNOTATED ON THE SAME GRAPH AS THE BEHAVIOUR THEY CHANGED</Lb>
    </svg>
  );
}

function DiagramBastion() {
  return (
    <svg viewBox="0 0 560 330" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Browser bastion path">
      <Defs id="gb" />
      <rect x="0" y="0" width="560" height="330" fill="url(#gb)" />
      <Bx x={16} y={26} w={120} h={34} label="50+ DEVELOPERS" sub="BROWSER ONLY" />
      <Bx x={182} y={26} w={120} h={34} label="NGINX" sub="TLS + AUTH GATE" hot />
      <Bx x={348} y={26} w={196} h={34} label="GUACAMOLE WEBAPP" sub="CONTAINER ON EC2" />
      <Wr pts={[[136, 43], [182, 43]]} node />
      <Wr pts={[[302, 43], [348, 43]]} node />
      <Wr pts={[[446, 60], [446, 108]]} />
      <Bx x={348} y={108} w={196} h={34} label="GUACD" sub="PROTOCOL BROKER" />
      <rect x={16} y={176} width={528} height={112} rx="3" fill="rgba(231,238,247,0.015)" stroke={DC.soft} strokeWidth="1" />
      <Lb x={28} y={196}>PRIVATE SUBNETS · NO INBOUND RDP OR SSH FROM THE INTERNET</Lb>
      <Wr pts={[[400, 142], [400, 160], [130, 160], [130, 210]]} />
      <Wr pts={[[446, 142], [446, 160], [330, 160], [330, 210]]} />
      <Bx x={40} y={210} w={180} h={32} label="WINDOWS VMS" sub="RDP" />
      <Bx x={240} y={210} w={180} h={32} label="LINUX HOSTS" sub="SSH" />
      <Bx x={440} y={210} w={92} h={32} label="SECRETS" sub="BROKERED" tone="info" />
      <Wr pts={[[420, 226], [440, 226]]} node />
      <Lb x={40} y={266} tone="accent">SECURITY GROUPS: GUACD REACHES TARGETS FROM THE APP TIER ONLY</Lb>
      <Lb x={16} y={314} tone="paper">PER-USER BROKERED SESSIONS · CONNECTION STORE BACKED UP · SESSION TUNING FOR LOW BANDWIDTH</Lb>
    </svg>
  );
}

const CICD = [
  [["stages:", "k"]],
  [["  - ", "d"], ["build", "v"], ["       # docker build + trivy scan", "c"]],
  [["  - ", "d"], ["publish", "v"], ["     # push commit-SHA tag to ECR", "c"]],
  [["  - ", "d"], ["deploy", "v"], ["      # manual gate, new task def revision", "c"]],
  [[]],
  [["publish:", "k"]],
  [["  image: ", "d"], ["docker:27", "v"]],
  [["  script:", "d"]],
  [["    - ", "d"], ["docker build --platform linux/arm64 \\", "v"]],
  [["        -t ", "v"], ["\"$REG/$SVC:$CI_COMMIT_SHA\"", "a"], [" .", "v"]],
  [["    - ", "d"], ["trivy image --exit-code 1 ", "v"], ["\"$REG/$SVC:$CI_COMMIT_SHA\"", "a"]],
  [["    - ", "d"], ["docker push ", "v"], ["\"$REG/$SVC:$CI_COMMIT_SHA\"", "a"]],
  [[]],
  [["deploy:", "k"]],
  [["  stage: ", "d"], ["deploy", "v"]],
  [["  when: ", "d"], ["manual", "a"], ["    # controlled release gate", "c"]],
  [["  script:", "d"]],
  [["    - ", "d"], ["./scripts/register-task-def.sh", "v"]],
  [["    - ", "d"], ["./scripts/update-ecs-service.sh", "v"]],
  [[]],
  [["# select the app container by name, not by array index", "c"]],
  [["# runner auth via EC2 instance role — no static keys", "c"]],
  [["# .dockerignore excludes .env — secrets stay in Secrets Manager", "c"]],
];

function SnippetCICD() {
  return (
    <pre className="snippet">
      {CICD.map((segs, i) => (
        <div key={"ln" + i}>
          <span className="sn-num">{String(i + 1).padStart(2, "0")}</span>
          {segs.map((s, j) => <span key={"s" + i + j} className={"sn-" + s[1]}>{s[0]}</span>)}
        </div>
      ))}
    </pre>
  );
}

function DiagramIdentity() {
  const chips = ["BITLOCKER", "DEFENDER", "LAPS", "WEB FILTER", "MEDIA CTRL"];
  return (
    <svg viewBox="0 0 520 370" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Endpoint and identity foundation">
      <Defs id="gi" />
      <rect x="0" y="0" width="520" height="370" fill="url(#gi)" />
      <Bx x={190} y={16} w={140} h={34} label="ENTRA ID" hot />
      <Wr pts={[[260, 50], [260, 74], [120, 74], [120, 104]]} />
      <Wr pts={[[260, 74], [400, 74], [400, 104]]} />
      <Bx x={30} y={104} w={180} h={34} label="CONDITIONAL ACCESS" />
      <Bx x={310} y={104} w={180} h={34} label="SSO / SAML" />
      <Wr pts={[[120, 138], [120, 186]]} node />
      <Wr pts={[[400, 138], [400, 186]]} node />
      <Bx x={30} y={186} w={180} h={34} label="100+ ENDPOINTS" sub="MANAGED CONFIGURATION" />
      <Bx x={310} y={186} w={180} h={34} label="10+ APPLICATIONS" sub="POLICY MANAGED ACCESS" />
      <Wr pts={[[120, 220], [120, 254]]} />
      <rect x={30} y={254} width={460} height={88} rx="3" fill="rgba(231,238,247,0.02)" stroke={DC.soft} strokeWidth="1" />
      <Lb x={44} y={276} tone="paper">MICROSOFT INTUNE · 30+ BASELINES</Lb>
      {chips.map((c, i) => (
        <g key={c}>
          <rect x={44 + i * 90} y={290} width={82} height={26} rx="3" fill={DC.fill} stroke={DC.stroke} strokeWidth="1" />
          <text x={44 + i * 90 + 41} y={307} textAnchor="middle" fontFamily={MONO} fontSize="8" letterSpacing="0.05em" fill={DC.paper}>{c}</text>
        </g>
      ))}
      <Lb x={30} y={362}>PRIVILEGED ACCESS CONTROLS · AUDITABLE, CENTRALLY APPLIED POLICY</Lb>
    </svg>
  );
}

const TRAFFIC = [1500, 1700, 1600, 1900, 1750, 1600, 10400, 2000, 1800, 1650, 1900, 1700, 1600, 1850, 1750, 1600];

function ChartIncident() {
  const base = 220, top = 40, max = 11000;
  const sc = (v) => base - (v / max) * (base - top);
  return (
    <svg viewBox="0 0 520 300" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Request volume during the incident window">
      <Defs id="gc" />
      <rect x="0" y="0" width="520" height="300" fill="url(#gc)" />
      {[10000, 5000, 0].map((v) => (
        <g key={"g" + v}>
          <line x1={40} y1={sc(v)} x2={500} y2={sc(v)} stroke={DC.soft} strokeWidth="1" />
          <Lb x={32} y={sc(v) + 3.5} anchor="end">{v === 0 ? "0" : v / 1000 + "K"}</Lb>
        </g>
      ))}
      <rect x={40} y={sc(2000)} width={460} height={sc(1500) - sc(2000)} fill="rgba(0,255,157,0.07)" />
      <Lb x={44} y={sc(2000) - 7} tone="accent">TYPICAL 1.5K–2K REQ/MIN</Lb>
      {TRAFFIC.map((v, i) => (
        <rect key={"b" + i} x={44 + i * 28} y={sc(v)} width={18} height={base - sc(v)}
          fill={v > 5000 ? DC.accent : "rgba(231,238,247,0.22)"} />
      ))}
      <Wr pts={[[215, sc(10400) - 6], [215, 24], [300, 24]]} hot />
      <Lb x={306} y={27} tone="paper">SPIKE ABOVE 10K REQ/MIN</Lb>
      <Lb x={44} y={250}>WINDOW A · REQUESTS PER MINUTE · ALB ACCESS LOGS</Lb>
      <Lb x={44} y={270}>502 RATE, TARGET LATENCY, AND HEALTH CHECKS CORRELATED IN ATHENA SQL</Lb>
      <Lb x={44} y={288} tone="info">WINDOW B (SEPARATE) AVG ≈1.18K · PEAK ≈2.5K · SPIKE ≈7.93K</Lb>
    </svg>
  );
}

const LAYERS = [
  ["IDENTITY & ACCESS", "Entra ID · Conditional Access · SSO/SAML · PAM · IAM Identity Center"],
  ["ENDPOINT", "Intune · 30+ baselines · BitLocker · LAPS · Defender for Endpoint"],
  ["NETWORK", "FortiGate · VPN · Private VPC · ALB · Cloudflare DNS · TLS"],
  ["DATA", "Purview DLP · Custom SITs · Data localization · Encryption at rest"],
  ["DELIVERY", "Trivy · Snyk · OWASP ZAP · SonarQube · Nessus · Manual deploy gate"],
  ["DETECTION", "Wazuh SIEM · 100+ rules · Sentinel · XDR · Grafana / Prometheus"],
  ["ASSURANCE", "ISO 27001:2022 · PCI DSS v4.0 · SOC 2 Type II · AWS FTR · VAPT · BCP/DR"],
];

function ControlStack() {
  return (
    <svg viewBox="0 0 620 252" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Layered control stack"
      style={{ width: "100%", height: "auto" }}>
      <line x1={5} y1={8} x2={5} y2={238} stroke={DC.soft} strokeWidth="1" />
      {LAYERS.map((l, i) => {
        const y = 8 + i * 33;
        const last = i === LAYERS.length - 1;
        return (
          <g key={l[0]}>
            <rect x={14} y={y} width={600} height={28} rx="3" fill={last ? DC.fillHot : DC.fill}
              stroke={last ? DC.hot : DC.stroke} strokeWidth="1" />
            <rect x={1} y={y + 12} width={7} height={4} fill={last ? DC.accent : DC.muted} />
            <text x={26} y={y + 18} fontFamily={MONO} fontSize="9.5" letterSpacing="0.09em"
              fill={last ? DC.accent : DC.paper}>{l[0]}</text>
            <text x={606} y={y + 18} textAnchor="end" fontFamily={MONO} fontSize="8.5" letterSpacing="0.05em"
              fill={DC.muted}>{l[1]}</text>
          </g>
        );
      })}
    </svg>
  );
}

const ART = {
  micro: DiagramMicro, stream: DiagramStream, ecs: DiagramECS, observe: DiagramObserve,
  bastion: DiagramBastion, cicd: SnippetCICD, identity: DiagramIdentity, incident: ChartIncident,
};

/* ============================== sections ================================ */

function Clock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const fmt = () => {
      try {
        return new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit", minute: "2-digit", second: "2-digit",
          hour12: false, timeZone: PROFILE.tz,
        }).format(new Date());
      } catch (e) { return new Date().toTimeString().slice(0, 8); }
    };
    setT(fmt());
    const id = window.setInterval(() => setT(fmt()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return <span className="meta dim">{t} IST</span>;
}

function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setP(max > 0 ? Math.min(1, el.scrollTop / max) : 0);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
  }, []);
  return <div className="progress" aria-hidden="true"><i style={{ transform: "scaleX(" + p + ")" }} /></div>;
}

function Nav({ active, onOpenResume, onOpenCmd }) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 80);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const all = [...NAV, { id: "lab", label: "Lab" }, { id: "credentials", label: "Credentials" }, { id: "resume", label: "Resume" }, { id: "contact", label: "Contact" }];
  return (
    <header className={cx("nav", (solid || open) && "solid")}>
      <div className="shell nav-in">
        <a href="#top" className="wordmark" onClick={() => setOpen(false)} aria-label="Ayush Kumar Srivastava — home">
          <b>AYUSH</b><s>K.</s><b>SRIVASTAVA</b><i />
        </a>
        <nav className="nav-links" aria-label="Primary">
          {NAV.map((l) => (
            <a key={l.id} href={"#" + l.id} className={cx("nav-link meta", l.opt && "opt", active === l.id && "on")}>{l.label}</a>
          ))}
          <button className="nav-cta meta" onClick={onOpenCmd} type="button" aria-label="Open command menu">
            <Ico n="cmd" s={13} /> <kbd>⌘K</kbd>
          </button>
          <button className="nav-cta meta" onClick={onOpenResume} type="button">
            Resume <Ico n="upRight" s={13} />
          </button>
        </nav>
        <button className={cx("burger", open && "open")} onClick={() => setOpen((v) => !v)}
          aria-label="Menu" aria-expanded={open} aria-controls="nav-drawer"><span /></button>
      </div>
      <ScrollProgress />
      <AnimatePresence>
        {open && (
          <motion.div className="nav-drawer" id="nav-drawer" initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}>
            <div className="shell">
              {all.map((l, i) => (
                <a key={l.id} href={"#" + l.id} className="meta" onClick={() => setOpen(false)}>
                  <span className={active === l.id ? "accent" : undefined}>{l.label}</span>
                  <span className="dim">{String(i + 1).padStart(2, "0")}</span>
                </a>
              ))}
              <button className="meta" type="button" style={{ padding: "15px 0", display: "flex", width: "100%", justifyContent: "space-between" }}
                onClick={() => { setOpen(false); onOpenResume(); }}>
                <span className="accent">View resume</span><span className="dim">R</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function CommandMenu({ open, onClose, onOpenResume, onCopyEmail, onDownloadTxt, onDownloadJson }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef(null);
  const lastFocus = useRef(null);
  useLockBody(open);

  const items = useMemo(() => {
    const nav = NAV.concat([{ id: "lab", label: "Lab" }, { id: "credentials", label: "Credentials" }, { id: "contact", label: "Contact" }])
      .map((s) => ({ g: "Go to", k: s.label, h: "section", run: () => { const el = document.getElementById(s.id); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); } }));
    const acts = [
      { g: "Actions", k: "View resume", h: "R", run: onOpenResume },
      { g: "Actions", k: "Copy email address", h: "copy", run: onCopyEmail },
      { g: "Actions", k: "Download resume (TXT)", h: "download", run: onDownloadTxt },
      { g: "Actions", k: "Download resume (JSON)", h: "download", run: onDownloadJson },
      { g: "Actions", k: "Print resume to PDF", h: "print", run: () => { onOpenResume(); window.setTimeout(() => window.print(), 500); } },
      { g: "Links", k: "GitHub — " + PROFILE.github.handle, h: "open", run: () => window.open(PROFILE.github.url, "_blank", "noopener") },
      { g: "Links", k: "LinkedIn — " + PROFILE.linkedin.handle, h: "open", run: () => window.open(PROFILE.linkedin.url, "_blank", "noopener") },
      { g: "Links", k: "LeetCode — ryuga__", h: "open", run: () => window.open("https://leetcode.com/ryuga__", "_blank", "noopener") },
    ];
    const all = acts.concat(nav);
    const s = q.trim().toLowerCase();
    return s ? all.filter((i) => i.k.toLowerCase().includes(s)) : all;
  }, [q, onOpenResume, onCopyEmail, onDownloadTxt, onDownloadJson]);

  useEffect(() => { if (open) { lastFocus.current = document.activeElement; setQ(""); setSel(0); window.setTimeout(() => inputRef.current && inputRef.current.focus(), 60); } }, [open]);
  useEffect(() => { setSel(0); }, [q]);

  const groups = useMemo(() => {
    const out = [];
    items.forEach((it) => {
      const last = out[out.length - 1];
      if (last && last.g === it.g) last.items.push(it);
      else out.push({ g: it.g, items: [it] });
    });
    return out;
  }, [items]);

  const runSel = useCallback(() => {
    const it = items[sel];
    if (!it) return;
    onClose();
    window.setTimeout(() => it.run(), 60);
  }, [items, sel, onClose]);

  const onKey = (e) => {
    if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => (items.length ? (s + 1) % items.length : 0)); return; }
    if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => (items.length ? (s - 1 + items.length) % items.length : 0)); return; }
    if (e.key === "Enter") { e.preventDefault(); runSel(); }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="cmd-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: EASE }} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
          role="dialog" aria-modal="true" aria-label="Command menu">
          <motion.div className="cmd" initial={{ y: 14, opacity: 0, scale: 0.985 }} animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 8, opacity: 0 }} transition={{ duration: 0.28, ease: EASE }}>
            <div className="cmd-in">
              <Ico n="search" s={15} />
              <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey}
                placeholder="Jump to a section or run an action…" aria-label="Command input" autoComplete="off" />
              <span className="meta dim">ESC</span>
            </div>
            <div className="cmd-list" role="listbox" aria-label="Results">
              {items.length === 0 ? (
                <div className="cmd-grp">No matches for “{q}”</div>
              ) : groups.map((g) => (
                <div key={g.g}>
                  <div className="cmd-grp">{g.g}</div>
                  {g.items.map((it) => {
                    const gi = items.indexOf(it);
                    return (
                      <button key={it.k} type="button" role="option" aria-selected={gi === sel}
                        className={cx("cmd-item", gi === sel && "sel")}
                        onMouseEnter={() => setSel(gi)} onClick={runSel}>
                        <Ico n={it.g === "Links" ? "upRight" : it.g === "Go to" ? "right" : "bolt"} s={13} />
                        <span className="cmd-k">{it.k}</span>
                        <span className="cmd-h">{it.h}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="cmd-foot">
              <span className="meta dim">↑ ↓ navigate</span>
              <span className="meta dim">↵ select</span>
              <span className="meta dim">R resume</span>
              <span className="meta dim">/ search projects</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const PacketLine = ({ rest }) => (
  <div className="shell">
    <div className="packet-track"><span className={cx("packet", rest && "rest")} /></div>
  </div>
);

function Head({ label, right, reveal }) {
  return (
    <motion.div className="sec-head" {...reveal(0)}>
      <span className="meta">{label}</span>
      <span className="grow" />
      {right ? <span className="meta dim">{right}</span> : null}
    </motion.div>
  );
}

function Hero() {
  const reduce = useReducedMotion();
  const rise = (d) => reduce ? {} : {
    initial: { opacity: 0, y: 26 }, animate: { opacity: 1, y: 0 },
    transition: { duration: 0.95, delay: d, ease: EASE },
  };
  return (
    <section className="hero" id="top">
      <div className="shell hero-in">
        <motion.div className="hero-top" {...rise(0.05)}>
          <span className="pill"><i />Open to DevOps / Platform roles</span>
          <span className="meta dim">{HERO.meta}</span>
        </motion.div>
        <div className="hero-grid">
          <div>
            <h1 className="display">
              <span className="ln-mask"><motion.span {...rise(0.12)}>{HERO.lineA}</motion.span></span>
              <span className="ln-mask"><motion.span className="accent" {...rise(0.22)}>{HERO.lineB}</motion.span></span>
            </h1>
            <motion.p className="hero-sub" {...rise(0.38)}>{HERO.sub}</motion.p>
          </div>
          <motion.aside className="hero-rail" {...rise(0.5)}>
            {HERO.rail.map((r) => (
              <div key={r.k}>
                <span className="meta dim">{r.k}</span>
                <div className="rail-role">{r.role}</div>
                <div className="rail-org">{r.org}</div>
              </div>
            ))}
            <div>
              <span className="meta dim">Local time</span>
              <div className="rail-role"><Clock /></div>
              <div className="rail-org">{PROFILE.location}</div>
            </div>
          </motion.aside>
        </div>
        <motion.div className="hero-foot" {...rise(0.62)}>
          <span className="meta scroll-cue">Scroll to explore <Ico n="down" s={13} sw={1.6} /></span>
          <span className="meta dim">⌘K command menu · R resume · Updated {PROFILE.updated}</span>
        </motion.div>
      </div>
    </section>
  );
}

function Signals() {
  const reveal = useReveal();
  return (
    <section className="signals" aria-label="Reported outcomes">
      <div className="shell">
        <motion.div {...reveal(0)}>
          <span className="meta">Reported outcomes</span>
        </motion.div>
        <div className="sig-grid">
          {SIGNALS.map((s, i) => (
            <motion.div className="sig" key={s.l} {...reveal(0.02 + i * 0.018)}>
              <div className="sig-v">{s.v}</div>
              <div className="meta sig-l">{s.l}</div>
            </motion.div>
          ))}
        </div>
        <p className="disclaim">
          Figures above are reported values from referenced comparison windows, not independently audited metrics.
          The qualifier is kept intentionally — precision about what was measured, and by whom, is part of the work.
        </p>
      </div>
    </section>
  );
}

function SelectedWork() {
  const reduce = useReducedMotion();
  const reveal = useReveal();
  const [active, setActive] = useState(0);
  const p = WORK[active];
  const ArtC = ART[p.art];
  return (
    <section className="section" id="work">
      <div className="shell">
        <Head label="001 / Selected work" right={String(WORK.length).padStart(2, "0") + " projects · sanitized · no internal identifiers"} reveal={reveal} />
        <div className="work-grid">
          <motion.div className="work-list" {...reveal(0.04)}>
            {WORK.map((w, i) => (
              <button key={w.n} type="button" className={cx("work-row", active === i && "on")}
                onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => setActive(i)}
                aria-pressed={active === i}>
                <span className="work-idx">{w.n}</span>
                <span>
                  <span className="work-tw">
                    <span className="work-sq" />
                    <span className="work-title">{w.title}</span>
                  </span>
                  <span className="meta work-kind">{w.kind} · <span style={{ color: stColor(w.status) }}>{w.status}</span></span>
                  <span className="work-tags">
                    <span className={cx("tag", w.status === "PRODUCTION" && "hot")} style={w.status !== "PRODUCTION" ? { color: stColor(w.status) } : undefined}>{w.status}</span>
                    {w.tech.split(" · ").slice(0, 5).map((t) => <span className="tag" key={w.n + t}>{t}</span>)}
                  </span>
                </span>
              </button>
            ))}
          </motion.div>
          <motion.div className="work-panel" {...reveal(0.08)}>
            <AnimatePresence initial={false} mode="wait">
              <motion.div key={p.n} className="panel-in"
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.28, ease: EASE }}>
                <div className="panel-top">
                  <span className="meta">{p.n} / {p.kind}</span>
                  <StatusBadge s={p.status} />
                </div>
                <div className="panel-art"><ArtC /></div>
                <p className="panel-copy">{p.copy}</p>
                <div className="panel-foot">
                  <span className="meta dim plain">{p.tech}</span>
                  <span className="meta dim">{p.n} of {String(WORK.length).padStart(2, "0")}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CaseFiles() {
  const reduce = useReducedMotion();
  const reveal = useReveal();
  const [open, setOpen] = useState(CASES[0].id);
  return (
    <section className="section surface-sec" id="cases">
      <div className="shell">
        <Head label="002 / Case files" right="Context · Problem · Role · Architecture · Outcome · Lessons" reveal={reveal} />
        <motion.p className="sec-lead" {...reveal(0.04)}>
          Five pieces of work written up in full, using the same structure each time: what the system was, what broke or was
          missing, what I owned versus what the team owned, how it was built, what made it hard, and what changed in my
          approach afterwards. Account IDs, internal hostnames, bucket names, and proprietary configuration are omitted by design.
        </motion.p>
        <div>
          {CASES.map((c, i) => {
            const isOpen = open === c.id;
            const ArtC = c.art ? ART[c.art] : null;
            return (
              <motion.div className="case" key={c.id} {...reveal(i * 0.04)}>
                <h3 style={{ margin: 0 }}>
                  <button className="case-head" onClick={() => setOpen(isOpen ? null : c.id)}
                    aria-expanded={isOpen} aria-controls={"case-" + c.id} type="button" style={{ width: "100%" }}>
                    <span className="meta accent">{c.id}</span>
                    <span>
                      <span className="case-title" style={{ display: "block" }}>{c.title}</span>
                      <span className="case-sum">{c.summary}</span>
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <StatusBadge s={c.status} />
                      <Ico n="right" s={17} sw={1.6} className={undefined} />
                      <span className={cx("case-chev", isOpen && "open")} style={{ display: "inline-flex" }}>
                        <Ico n="right" s={16} sw={1.6} />
                      </span>
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div className="case-body" id={"case-" + c.id} role="region" aria-label={c.title}
                      initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}>
                      <div className="case-in">
                        <span />
                        <div>
                          {ArtC ? (
                            <div className="case-art"><ArtC /></div>
                          ) : null}
                          <div className="case-meta">
                            <span className="tag hot">Stack</span>
                            <span className="meta dim plain">{c.stack}</span>
                          </div>
                          <div className="fields">
                            {c.fields.map((f) => (
                              <div className="field" key={f[0]}>
                                <span className="meta">{f[0]}</span>
                                <p>{f[1]}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Philosophy() {
  const reveal = useReveal();
  return (
    <section className="section" id="philosophy">
      <div className="shell">
        <motion.div className="phil" {...reveal(0)}>
          <div>
            <span className="meta">003 / Philosophy</span>
            <p className="phil-q" style={{ marginTop: 18 }}>
              {PHILOSOPHY_LEAD.split("not")[0]}
              <span className="accent">not {PHILOSOPHY_LEAD.split("not")[1]}</span>
            </p>
          </div>
          <div className="phil-cols">
            {PHILOSOPHY.map((p, i) => (
              <motion.div className="phil-item" key={p.h} {...reveal(0.05 + i * 0.05)}>
                <span className="meta dim">{String(i + 1).padStart(2, "0")}</span>
                <h4>{p.h}</h4>
                <p>{p.p}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Experience() {
  const reveal = useReveal();
  return (
    <section className="section surface-sec" id="experience">
      <div className="shell">
        <Head label="004 / Experience" right="02 employers · 01 independent track" reveal={reveal} />
        <div className="exp">
          {EXPERIENCE.map((e, i) => (
            <motion.article className="exp-item" key={e.org} {...reveal(i * 0.05)}>
              <div>
                <span className="meta dim">{e.n}</span>
                <h3 className="exp-org">{e.org}</h3>
                <div className="exp-role">{e.role}</div>
                <div className="meta" style={{ marginTop: 8 }}>{e.dates}</div>
                <div className="meta exp-scope plain dim">{e.scope}</div>
              </div>
              <div>
                {e.groups.map((g) => (
                  <div className="grp" key={g.label}>
                    <span className="meta accent">{g.label}</span>
                    <ul>
                      {g.bullets.map((b, bi) => (
                        <li key={g.label + bi}><i /><span>{b}</span></li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectIndex() {
  const reveal = useReveal();
  const reduce = useReducedMotion();
  const [f, setF] = useState("ALL");
  const [q, setQ] = useState("");
  const searchRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      const typing = t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);
      if (!typing && e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        const el = document.getElementById("index");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        window.setTimeout(() => searchRef.current && searchRef.current.focus(), 500);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return INDEX.filter((r) =>
      (f === "ALL" || r.status === f) &&
      (!s || (r.name + " " + r.domain + " " + r.stack).toLowerCase().includes(s))
    );
  }, [f, q]);

  return (
    <section className="section" id="index">
      <div className="shell">
        <Head label="005 / Project index"
          right={String(rows.length).padStart(2, "0") + " / " + String(INDEX.length).padStart(2, "0") + " entries"} reveal={reveal} />
        <motion.div className="idx-bar" {...reveal(0.03)}>
          <label className="search">
            <Ico n="search" s={14} />
            <input ref={searchRef} value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search projects, domains, or stack…" aria-label="Search projects" />
            <kbd>/</kbd>
          </label>
        </motion.div>
        <motion.div className="filters" {...reveal(0.05)} role="group" aria-label="Filter by status">
          {FILTERS.map((x) => (
            <button key={x} type="button" className={cx("chip", f === x && "on")}
              onClick={() => setF(x)} aria-pressed={f === x}
              style={f === x ? undefined : { color: x === "ALL" ? undefined : stColor(x) }}>{x}</button>
          ))}
        </motion.div>
        <div>
          <div className="pi-row pi-head" aria-hidden="true">
            <span className="meta dim">#</span>
            <span className="meta dim">Project</span>
            <span className="meta dim pi-dom">Domain</span>
            <span className="meta dim pi-stack">Stack</span>
            <span className="meta dim">Status</span>
          </div>
          <AnimatePresence initial={false}>
            {rows.map((r) => (
              <motion.div className="pi-row" key={r.n} layout={!reduce}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: EASE }}>
                <span className="meta dim">{r.n}</span>
                <span className="pi-name">{r.name}</span>
                <span className="meta pi-dom">{r.domain}</span>
                <span className="pi-stack">{r.stack}</span>
                <span className="st" style={{ color: stColor(r.status) }}><i />{r.status}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          {rows.length === 0 ? (
            <div className="idx-empty">No entries match “{q}”{f !== "ALL" ? " · " + f : ""}</div>
          ) : null}
        </div>
        <motion.p className="scope-note" {...reveal(0.06)}>
          Status vocabulary / <span className="accent">Production</span> running and supported ·
          <span className="accent"> Operated</span> run as a recurring responsibility ·
          <span className="accent"> Implemented</span> built and configured, not necessarily customer-facing ·
          <span className="accent"> In progress</span> rollout underway ·
          <span className="accent"> POC</span> bounded proof, limited operational guarantees ·
          <span className="accent"> Designed</span> architecture exists, not deployed ·
          <span className="accent"> Learning</span> lab or evaluation.
        </motion.p>
      </div>
    </section>
  );
}

function Compliance() {
  const reveal = useReveal();
  return (
    <section className="section surface-sec" id="compliance">
      <div className="shell">
        <Head label="006 / Compliance & assurance" right="Controls · Evidence · Ownership" reveal={reveal} />
        <motion.p className="sec-lead" {...reveal(0.04)}>{COMPLIANCE_LEAD}</motion.p>
        <motion.div className="stack-wrap" {...reveal(0.07)}>
          <span className="meta dim">Control stack / layered view</span>
          <div style={{ marginTop: 16 }}><ControlStack /></div>
        </motion.div>
        <div className="cmp-grid">
          {COMPLIANCE.map((c, i) => (
            <motion.div className="cmp-row" key={c.name} {...reveal(0.02 + i * 0.018)}>
              <span className="cmp-name">{c.name}</span>
              <span className="st" style={{ color: stColor(c.status), whiteSpace: "nowrap" }}><i />{c.status}</span>
              <p className="cmp-detail">{c.detail}</p>
            </motion.div>
          ))}
        </div>
        <motion.p className="scope-note" {...reveal(0.08)}>
          Scope note / Wording is kept deliberately precise. Where I built and operated the control it says implemented or
          operated. Where I contributed technical evidence for a programme owned by the business it says supported or evidence
          prepared. No organization-wide certification is claimed as solely owned.
        </motion.p>
      </div>
    </section>
  );
}

function Arsenal() {
  const reveal = useReveal();
  return (
    <section className="section" id="arsenal">
      <div className="shell">
        <Head label="007 / Arsenal" right="Evidence map · not a logo grid" reveal={reveal} />
        <motion.div className="legend" {...reveal(0.04)}>
          <span className="meta"><span className="dot hands" style={{ marginRight: 9 }} />Hands-on · professional</span>
          <span className="meta"><span className="dot" style={{ marginRight: 9 }} />Lab / POC / learning</span>
          <span className="meta dim plain">Every tool below is attached to work described elsewhere on this page.</span>
        </motion.div>
        <div>
          {ARSENAL.map((row, i) => (
            <motion.div className="ar-row" key={row.cat} {...reveal(i * 0.03)}>
              <div>
                <div className="meta paper">{row.cat}</div>
                <div className="meta dim" style={{ marginTop: 8 }}>{row.level}</div>
              </div>
              <div className="ar-tools">
                {row.tools.map((t) => (
                  <span className="ar-tool" key={row.cat + t}>
                    <span className={cx("dot", row.level.indexOf("Hands-on") === 0 && "hands")} />{t}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
        <motion.p className="scope-note" {...reveal(0.06)}>
          Honesty rule / “Hands-on” can mean a focused task rather than deep specialization. Lab-tier tools — Kubernetes, kind,
          Helm, Argo CD, Proxmox, Talos, Go — are practised in reproducible environments but are not claimed as enterprise
          production experience. The evidence is stronger when each tool is attached to a real problem solved.
        </motion.p>
      </div>
    </section>
  );
}

function Lab() {
  const reveal = useReveal();
  return (
    <section className="section surface-sec" id="lab">
      <div className="shell">
        <Head label="008 / Exploration" right="Personal · not employer work" reveal={reveal} />
        <motion.p className="sec-lead" {...reveal(0.04)}>
          Self-directed work that broadens the professional stack: a reproducible Proxmox and Talos Kubernetes lab, a multi-agent
          code-analysis application combining AST-oriented checks with retrieval, and Terraform modules for compute. Everything
          here is labelled POC, designed, or learning, and is kept deliberately separate from employer deliverables.
        </motion.p>
        <div className="lab-grid">
          {LAB.map((c, i) => (
            <motion.article className="lab-card" key={c.title} {...reveal(0.04 + i * 0.045)}>
              <span className="st" style={{ color: stColor(c.status) }}><i />{c.status}</span>
              <h3 className="lab-title">{c.title}</h3>
              <p className="lab-body">{c.body}</p>
              <span className="meta dim plain" style={{ marginTop: "auto", paddingTop: 10 }}>{c.stack}</span>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Notes() {
  const reveal = useReveal();
  return (
    <section className="section" id="notes">
      <div className="shell">
        <Head label="009 / Field notes" right="Lessons from production work" reveal={reveal} />
        <motion.p className="sec-lead" {...reveal(0.04)}>
          The reusable part of the job is not the tooling list — it is the failure modes. These are the lessons I still apply
          when designing a platform, writing a pipeline, or investigating an incident.
        </motion.p>
        <div>
          {NOTES.map((n, i) => (
            <motion.article className="note" key={n.h} {...reveal(i * 0.035)}>
              <div>
                <span className="meta dim">{String(i + 1).padStart(2, "0")}</span>
                <div className="meta accent" style={{ marginTop: 8 }}>Lesson</div>
              </div>
              <div>
                <h3 className="note-h">{n.h}</h3>
                <p className="note-b">{n.b}</p>
                <div className="meta note-ev plain dim">{n.ev}</div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Credentials({ onTxt, onJson }) {
  const reveal = useReveal();
  const links = [
    { label: PROFILE.github.label, handle: PROFILE.github.handle, url: PROFILE.github.url },
    { label: PROFILE.linkedin.label, handle: PROFILE.linkedin.handle, url: PROFILE.linkedin.url },
  ].concat(PROFILE.elsewhere);
  return (
    <section className="section surface-sec" id="credentials">
      <div className="shell">
        <Head label="010 / Credentials" right="Education · Certifications · Elsewhere" reveal={reveal} />
        <div className="cred">
          <motion.div {...reveal(0.04)}>
            <span className="meta dim">Education</span>
            {EDUCATION.concat(SCHOOL).map((e) => (
              <div className="cred-item" key={e.org + e.deg}>
                <div className="meta">{e.dates}</div>
                <h3 className="cred-t">{e.org}</h3>
                <div className="meta paper plain" style={{ marginTop: 6, fontSize: 13 }}>{e.deg}</div>
                <div className="meta dim" style={{ marginTop: 5 }}>{e.note}</div>
              </div>
            ))}
            <span className="meta dim" style={{ display: "block", marginTop: 26 }}>Elsewhere</span>
            <div style={{ marginTop: 13, display: "flex", flexDirection: "column", gap: 12 }}>
              {links.map((l) => (
                <a key={l.label + l.url} href={l.url} target="_blank" rel="noreferrer noopener" className="meta link-row">
                  <span className="accent">{l.label}</span>
                  <span className="dim">/ {l.handle}</span>
                  <Ico n="upRight" s={12} />
                </a>
              ))}
            </div>
          </motion.div>
          <motion.div {...reveal(0.08)}>
            <span className="meta dim">Certifications</span>
            <div style={{ marginTop: 15 }}>
              {CERTS.map((c) => (
                <div className="cert" key={c.name}>
                  <span className="cert-t">{c.name}</span>
                  <span className="meta dim">{c.issuer}</span>
                </div>
              ))}
            </div>
            <span className="meta dim" style={{ display: "block", marginTop: 30 }}>Machine readable</span>
            <p style={{ margin: "10px 0 0", fontSize: 13.4, lineHeight: 1.65, color: "rgba(231,238,247,.68)", fontWeight: 300, maxWidth: "48ch" }}>
              The resume is generated from the same data that renders this page, so it can never drift out of date.
            </p>
            <div style={{ marginTop: 15, display: "flex", gap: 11, flexWrap: "wrap" }}>
              <button className="btn sm" type="button" onClick={onJson}><Ico n="json" s={13} /> resume.json</button>
              <button className="btn sm" type="button" onClick={onTxt}><Ico n="file" s={13} /> resume.txt</button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ResumeBand({ onOpen, onPdf, onTxt }) {
  const reveal = useReveal();
  return (
    <section className="section" id="resume">
      <div className="shell">
        <motion.div className="res-band" {...reveal(0)}>
          <div>
            <span className="meta">011 / Resume</span>
            <h2 className="res-h">
              The resume is built into the site.
              <span className="accent" style={{ display: "block" }}>Read it here, or print it to PDF.</span>
            </h2>
            <p style={{ margin: "18px 0 0", maxWidth: "56ch", fontWeight: 300, fontSize: 15.4, lineHeight: 1.72, color: "rgba(231,238,247,.78)" }}>
              No gated download and no stale attachment. The document renders as a print-optimized A4 sheet, exports as plain
              text for applicant tracking systems, and exports as structured JSON for anything that parses it.
            </p>
            <div className="btn-row">
              <button className="btn solid" type="button" onClick={onOpen}><Ico n="eye" s={14} /> View resume</button>
              <button className="btn" type="button" onClick={onPdf}><Ico n="printer" s={14} /> Print / PDF</button>
              <button className="btn" type="button" onClick={onTxt}><Ico n="file" s={14} /> Download TXT</button>
            </div>
          </div>
          <div className="res-toc">
            <span className="meta dim">Contents</span>
            {RESUME_TOC.map((t, i) => (
              <span className="meta" key={t} style={{ display: "flex", gap: 13 }}>
                <span className="dim">{String(i + 1).padStart(2, "0")}</span> {t}
              </span>
            ))}
            <span className="meta dim" style={{ marginTop: 12 }}>Shortcut / press R anywhere</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Contact({ onCopyEmail }) {
  const reduce = useReducedMotion();
  return (
    <section className="section" id="contact" style={{ paddingTop: 0 }}>
      <div className="shell">
        <motion.div className="contact"
          initial={reduce ? false : { opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: EASE }}>
          <div className="contact-in">
            <div style={{ minWidth: 0 }}>
              <span className="meta">012 / Contact</span>
              <div style={{ marginTop: 18 }}>
                <a className="contact-mail" href={"mailto:" + PROFILE.email}>{PROFILE.email}</a>
              </div>
              <div className="meta" style={{ marginTop: 20, display: "flex", gap: 20, flexWrap: "wrap", color: "rgba(4,20,12,.66)" }}>
                <a href={"tel:" + PROFILE.phoneHref} style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                  <Ico n="phone" s={13} /> {PROFILE.phone}
                </a>
                <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                  <Ico n="pin" s={13} /> {PROFILE.location}
                </span>
              </div>
            </div>
            <div className="contact-links">
              <button type="button" onClick={onCopyEmail}><Ico n="copy" s={13} /> Copy email</button>
              <a href={PROFILE.github.url} target="_blank" rel="noreferrer noopener">GitHub <Ico n="upRight" s={13} /></a>
              <a href={PROFILE.linkedin.url} target="_blank" rel="noreferrer noopener">LinkedIn <Ico n="upRight" s={13} /></a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer>
      <PacketLine rest />
      <div className="shell">
        <div className="foot-markwrap"><div className="foot-mark" aria-hidden="true">{PROFILE.footmark}</div></div>
        <div className="foot-end">
          <span className="meta dim">{PROFILE.name} / {PROFILE.role}</span>
          <span className="meta dim">React · Vite · Motion · Deployed on Vercel</span>
          <span className="meta dim">Updated {PROFILE.updated}</span>
        </div>
      </div>
    </footer>
  );
}

function ToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 700);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.a href="#top" className="totop" aria-label="Back to top"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.3, ease: EASE }}>
          <Ico n="up" s={15} sw={1.7} />
        </motion.a>
      )}
    </AnimatePresence>
  );
}

/* ============================ resume overlay ============================ */

function ResumeLayer({ open, onClose, onPdf, onTxt, onMd, onJson, toast }) {
  const closeRef = useRef(null);
  useEffect(() => {
    if (open && closeRef.current) window.setTimeout(() => closeRef.current && closeRef.current.focus(), 80);
  }, [open]);
  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div className="res-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }} role="dialog" aria-modal="true" aria-label="Resume">
            <div className="res-bar">
              <button className="btn sm" onClick={onMd} type="button"><Ico n="copy" s={13} /> Copy MD</button>
              <button className="btn sm" onClick={onTxt} type="button"><Ico n="file" s={13} /> TXT</button>
              <button className="btn sm" onClick={onJson} type="button"><Ico n="json" s={13} /> JSON</button>
              <button className="btn solid sm" onClick={onPdf} type="button"><Ico n="printer" s={13} /> Print / PDF</button>
              <button className="btn sm" onClick={onClose} type="button" ref={closeRef} aria-label="Close resume">
                <Ico n="close" s={14} /> Close
              </button>
            </div>
            <motion.article className="res-sheet" id="resume-sheet"
              initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 12, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}>
              <header>
                <h1>{PROFILE.name}</h1>
                <div className="res-role">{PROFILE.role} · {PROFILE.location}</div>
                <div className="res-links">
                  <a href={"mailto:" + PROFILE.email}>{PROFILE.email}</a>
                  <a href={"tel:" + PROFILE.phoneHref}>{PROFILE.phone}</a>
                  <a href={PROFILE.github.url}>github.com/{PROFILE.github.handle}</a>
                  <a href={PROFILE.linkedin.url}>linkedin.com/in/{PROFILE.linkedin.handle}</a>
                  <span>leetcode / hackerrank / gfg: ryuga__</span>
                </div>
              </header>

              <section className="res-sec">
                <h2>Summary</h2>
                <p style={{ margin: 0, fontSize: 12.9, lineHeight: 1.6 }}>{RESUME_SUMMARY}</p>
              </section>

              <section className="res-sec">
                <h2>Skills &amp; Expertise</h2>
                <dl className="res-sk">
                  {RESUME_SKILLS.map((s) => (
                    <React.Fragment key={s.g}><dt>{s.g}</dt><dd>{s.v}</dd></React.Fragment>
                  ))}
                </dl>
              </section>

              <section className="res-sec">
                <h2>Experience</h2>
                {RESUME_JOBS.map((j) => (
                  <div className="res-job" key={j.org}>
                    <div className="res-job-h">
                      <span className="res-job-t">{j.org}</span>
                      <span className="res-job-d">{j.dates}</span>
                    </div>
                    <div className="res-job-r">{j.role}</div>
                    {j.sub ? <div className="res-job-r" style={{ marginTop: 5 }}>{j.sub}</div> : null}
                    <ul>{j.bullets.map((b, bi) => <li key={j.org + bi}>{b}</li>)}</ul>
                  </div>
                ))}
              </section>

              <section className="res-sec">
                <h2>Selected Projects</h2>
                <div className="res-2col">
                  {RESUME_PROJECTS.map((p) => (
                    <div className="res-proj" key={p.n}><b>{p.n}</b><span>{p.d}</span></div>
                  ))}
                </div>
              </section>

              <section className="res-sec">
                <h2>Compliance &amp; Assurance</h2>
                <ul>{RESUME_COMPLIANCE.map((c, ci) => <li key={ci}>{c}</li>)}</ul>
              </section>

              <section className="res-sec">
                <div className="res-2col">
                  <div>
                    <h2>Education</h2>
                    {EDUCATION.concat(SCHOOL).map((e) => (
                      <div className="res-job" key={e.org + e.deg}>
                        <div className="res-job-h">
                          <span className="res-job-t">{e.org}</span>
                          <span className="res-job-d">{e.dates}</span>
                        </div>
                        <div className="res-job-r">{e.deg} · {e.note}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h2>Certifications</h2>
                    <ul>{CERTS.map((c) => <li key={c.name}>{c.name} · {c.issuer}</li>)}</ul>
                  </div>
                </div>
              </section>

              <p className="res-foot">
                Updated {PROFILE.updated} · Cost and efficiency figures are reported values from the referenced comparison
                windows and are not independently audited. Employer identifiers, account details, and internal topology are
                intentionally omitted.
              </p>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {toast ? (
          <motion.div className="toast" role="status" aria-live="polite"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: EASE }}>
            <Ico n="check" s={13} sw={2.2} /> {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function useResume() {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");
  const lastFocus = useRef(null);
  useLockBody(open);

  useEffect(() => {
    if (open && lastFocus.current === null) lastFocus.current = document.activeElement;
    if (!open && lastFocus.current && lastFocus.current.focus) { lastFocus.current.focus(); lastFocus.current = null; }
  }, [open]);

  const flash = useCallback((m) => { setToast(m); window.setTimeout(() => setToast(""), 2400); }, []);

  const pdf = useCallback(() => {
    if (!open) { setOpen(true); window.setTimeout(() => window.print(), 520); }
    else window.print();
  }, [open]);

  const txt = useCallback(() => flash(download(PROFILE.name.replace(/\s+/g, "-") + "-resume.txt", resumeText()) ? "TXT downloaded" : "Download failed"), [flash]);
  const json = useCallback(() => flash(download(PROFILE.name.replace(/\s+/g, "-") + "-resume.json", resumeJSON(), "application/json;charset=utf-8") ? "JSON downloaded" : "Download failed"), [flash]);
  const md = useCallback(async () => flash((await copyText(resumeMarkdown())) ? "Markdown copied" : "Copy failed"), [flash]);
  const mail = useCallback(async () => flash((await copyText(PROFILE.email)) ? "Email copied" : "Copy failed"), [flash]);

  return { open, setOpen, pdf, txt, json, md, mail, toast };
}

function useActiveSection() {
  const [active, setActive] = useState("");
  useEffect(() => {
    const ids = NAV.map((n) => n.id).concat(["philosophy", "lab", "credentials", "resume", "contact"]);
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return undefined;
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (vis) setActive(vis.target.id);
    }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return active;
}

function useDocumentMeta() {
  useEffect(() => {
    const title = PROFILE.name + " — " + PROFILE.role;
    const desc = "DevSecOps and platform engineer working across AWS and Azure infrastructure, ECS container platforms, CI/CD, observability, identity and endpoint security, and cloud cost optimization.";
    document.title = title;
    const setMeta = (attr, key, val) => {
      let el = document.head.querySelector("meta[" + attr + '="' + key + '"]');
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.setAttribute("content", val);
    };
    setMeta("name", "description", desc);
    setMeta("name", "author", PROFILE.name);
    setMeta("name", "theme-color", "#070A0E");
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:type", "profile");
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", desc);

    const origin = (typeof window !== "undefined" && window.location && window.location.origin) || "";
    const ld = {
      "@context": "https://schema.org", "@type": "Person", name: PROFILE.name,
      jobTitle: PROFILE.role, email: "mailto:" + PROFILE.email, telephone: PROFILE.phoneHref,
      address: { "@type": "PostalAddress", addressLocality: "Lucknow", addressCountry: "IN" },
      sameAs: [PROFILE.github.url, PROFILE.linkedin.url, "https://leetcode.com/ryuga__", "https://www.hackerrank.com/ryuga__"],
      knowsAbout: ["AWS", "Azure", "DevSecOps", "ECS", "CI/CD", "Observability", "Terraform", "Kubernetes", "Zero Trust", "FinOps"],
      alumniOf: { "@type": "CollegeOrUniversity", name: EDUCATION[0].org },
      worksFor: { "@type": "Organization", name: "NIIT Limited" },
      url: origin || undefined,
    };
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.id = "person-ld";
    s.text = JSON.stringify(ld);
    document.head.appendChild(s);
    return () => { const ex = document.getElementById("person-ld"); if (ex) ex.remove(); };
  }, []);
}

/* ================================ app =================================== */

export default function App() {
  const active = useActiveSection();
  const res = useResume();
  const [cmd, setCmd] = useState(false);
  useDocumentMeta();
  useLockBody(cmd);

  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      const typing = t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable);
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setCmd((v) => !v); return; }
      if (e.key === "Escape") { setCmd(false); return; }
      if (!typing && !e.metaKey && !e.ctrlKey && !e.altKey && (e.key === "r" || e.key === "R")) {
        e.preventDefault();
        res.setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [res]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="grid-bg" aria-hidden="true" />
      <a className="skip" href="#work">Skip to content</a>
      <div className="site-root">
        <Nav active={active} onOpenResume={() => res.setOpen(true)} onOpenCmd={() => setCmd(true)} />
        <main>
          <Hero />
          <PacketLine />
          <Signals />
          <SelectedWork />
          <CaseFiles />
          <Philosophy />
          <Experience />
          <ProjectIndex />
          <Compliance />
          <Arsenal />
          <Lab />
          <Notes />
          <Credentials onTxt={res.txt} onJson={res.json} />
          <ResumeBand onOpen={() => res.setOpen(true)} onPdf={res.pdf} onTxt={res.txt} />
          <Contact onCopyEmail={res.mail} />
        </main>
        <Footer />
        <ToTop />
      </div>
      <CommandMenu open={cmd} onClose={() => setCmd(false)} onOpenResume={() => res.setOpen(true)}
        onCopyEmail={res.mail} onDownloadTxt={res.txt} onDownloadJson={res.json} />
      <ResumeLayer open={res.open} onClose={() => res.setOpen(false)} onPdf={res.pdf}
        onTxt={res.txt} onMd={res.md} onJson={res.json} toast={res.toast} />
    </>
  );
}

