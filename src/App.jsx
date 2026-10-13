/* ============================================================================
   RYUGA — DevSecOps & Platform Engineering portfolio
   ============================================================================ */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

/* ============================== tokens ================================== */

const EASE = [0.22, 1, 0.36, 1];
const cx = (...a) => a.filter(Boolean).join(" ");

const STYLES = `
@page{size:A4;margin:13mm}

:root{
  --ink:#0B0F14; --paper:#E2E8F0; --accent:#00FF9D; --on-accent:#0B0F14;
  --surface:#161B22; --muted:#8B949E; --line:rgba(226,232,240,.1);
  --radius:4px; --ease:cubic-bezier(.22,1,.36,1); --gut:32px;
  --doc:#F3F5F8; --doc-ink:#0B0F14; --doc-muted:#5A6673; --doc-line:rgba(11,15,20,.14);
  --mono:'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace;
  --disp:'Archivo','Inter',system-ui,sans-serif;
  --body:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif;
}
*,*::before,*::after{box-sizing:border-box}
html{background:var(--ink);scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{margin:0;background:var(--ink);color:var(--paper);overflow-x:hidden;
  font-family:var(--body);font-size:16px;line-height:1.65;font-weight:400;
  -webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
a{color:inherit;text-decoration:none}
button{font:inherit;color:inherit;background:none;border:0;cursor:pointer;padding:0}
img,svg{display:block}
::selection{background:var(--accent);color:var(--on-accent)}
:focus-visible{outline:1px solid var(--accent);outline-offset:3px}

.shell{width:100%;max-width:1164px;margin:0 auto;padding:0 var(--gut)}
.section{padding:96px 0;scroll-margin-top:64px;position:relative}
.surface-sec{background:var(--surface);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.meta{font-family:var(--mono);font-weight:500;font-size:12px;text-transform:uppercase;
  letter-spacing:.08em;color:var(--muted);line-height:1.5}
.meta.dim{color:rgba(139,148,158,.62)}
.meta.paper{color:var(--paper)}
.meta.plain{text-transform:none;letter-spacing:.04em}
.accent{color:var(--accent)}
.display{font-family:var(--disp);font-weight:900;font-size:clamp(48px,6vw,96px);
  line-height:.95;letter-spacing:-.03em;margin:0}
.sec-head{display:flex;align-items:center;gap:20px;margin-bottom:44px;flex-wrap:wrap}
.sec-head .grow{flex:1;height:1px;background:var(--line);min-width:24px}
.sec-lead{margin:0 0 36px;max-width:66ch;font-weight:300;font-size:16.5px;line-height:1.72;color:rgba(226,232,240,.78)}

.nav{position:fixed;top:0;left:0;right:0;height:64px;z-index:70;border-bottom:1px solid transparent;
  transition:background .45s var(--ease),border-color .45s var(--ease)}
.nav.solid{background:var(--ink);border-bottom-color:var(--line)}
.nav-in{height:64px;display:flex;align-items:center;justify-content:space-between;gap:16px}
.wordmark{font-family:var(--disp);font-weight:700;font-size:18px;letter-spacing:.16em;
  display:inline-flex;align-items:center;gap:9px}
.wordmark i{width:5px;height:5px;background:var(--accent);display:block}
.nav-links{display:flex;align-items:center;gap:24px}
.nav-link{position:relative;padding:6px 0;transition:color .3s var(--ease)}
.nav-link::after{content:"";position:absolute;left:0;bottom:0;width:100%;height:1px;background:var(--accent);
  transform:scaleX(0);transform-origin:left;transition:transform .4s var(--ease)}
.nav-link:hover{color:var(--paper)}
.nav-link:hover::after,.nav-link.on::after{transform:scaleX(1)}
.nav-link.on{color:var(--accent)}
.nav-cta{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--line);
  border-radius:var(--radius);padding:8px 13px;transition:border-color .35s var(--ease),color .35s var(--ease)}
.nav-cta:hover{border-color:var(--accent);color:var(--accent)}
.burger{display:none;width:38px;height:38px;align-items:center;justify-content:center;
  border:1px solid var(--line);border-radius:var(--radius)}
.burger span{display:block;width:15px;height:1px;background:var(--paper);position:relative}
.burger span::before,.burger span::after{content:"";position:absolute;left:0;width:15px;height:1px;
  background:var(--paper);transition:transform .3s var(--ease)}
.burger span::before{top:-5px}.burger span::after{top:5px}
.burger.open span{background:transparent}
.burger.open span::before{transform:translateY(5px) rotate(45deg)}
.burger.open span::after{transform:translateY(-5px) rotate(-45deg)}
.nav-drawer{overflow:hidden;background:var(--ink);border-bottom:1px solid var(--line)}
.nav-drawer a{padding:15px 0;border-bottom:1px solid var(--line);display:flex;
  justify-content:space-between;align-items:center}
.nav-drawer a:last-child{border-bottom:0}

.hero{min-height:clamp(500px,75vh,700px);display:flex;align-items:stretch;padding-top:64px;position:relative}
.hero-in{display:flex;flex-direction:column;justify-content:space-between;width:100%;
  padding-top:44px;padding-bottom:26px;gap:36px}
.hero-grid{display:grid;grid-template-columns:minmax(0,1fr) 258px;gap:56px;align-items:end}
.hero h1{max-width:min(780px,100%)}
.hero h1 span.ln{display:block}
.hero-sub{margin:26px 0 0;max-width:62ch;font-weight:300;font-size:clamp(15px,1.3vw,17px);
  line-height:1.72;color:rgba(226,232,240,.78)}
.hero-rail{border-left:1px solid var(--line);padding-left:22px;display:flex;flex-direction:column;gap:22px}
.rail-role{font-family:var(--disp);font-weight:500;font-size:15px;letter-spacing:-.01em;margin-top:6px}
.rail-org{font-family:var(--mono);font-size:11px;letter-spacing:.07em;text-transform:uppercase;
  color:var(--muted);margin-top:3px}
.hero-foot{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
.scroll-cue{display:inline-flex;align-items:center;gap:8px}
.scroll-cue svg{animation:bob 2.8s var(--ease) infinite}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(4px)}}

.packet-track{position:relative;height:1px;background:var(--line);width:100%}
.packet{position:absolute;top:-1.5px;left:-4px;width:4px;height:4px;background:var(--accent);
  animation:packetRun 30s steps(72,end) infinite}
.packet.rest{animation:none;left:auto;right:0}
@keyframes packetRun{0%{left:-4px;opacity:1}17%{left:100%;opacity:1}17.6%{left:100%;opacity:0}99%{left:-4px;opacity:0}100%{left:-4px;opacity:1}}

.signals{border-bottom:1px solid var(--line);padding:34px 0}
.sig-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:26px 20px;margin-top:20px}
.sig-v{font-family:var(--disp);font-weight:700;font-size:clamp(19px,2vw,26px);letter-spacing:-.02em;line-height:1.1}
.sig-l{margin-top:6px;font-size:10.5px;line-height:1.45}

.work-grid{display:grid;grid-template-columns:minmax(0,1.02fr) minmax(0,1fr);gap:56px;align-items:start}
.work-row{display:grid;grid-template-columns:38px minmax(0,1fr);gap:14px;align-items:baseline;width:100%;
  border-top:1px solid var(--line);padding:22px 0;text-align:left;color:var(--muted);
  transition:color .35s var(--ease)}
.work-list .work-row:last-child{border-bottom:1px solid var(--line)}
.work-row:hover,.work-row.on{color:var(--paper)}
.work-idx{font-family:var(--mono);font-size:12px;letter-spacing:.08em;color:var(--muted);transition:color .35s var(--ease)}
.work-row.on .work-idx{color:var(--accent)}
.work-tw{display:flex;align-items:center;gap:13px}
.work-sq{width:6px;height:6px;background:var(--accent);flex:0 0 auto;opacity:0;transform:scale(.3);transition:.35s var(--ease)}
.work-row.on .work-sq,.work-row:hover .work-sq{opacity:1;transform:scale(1)}
.work-title{font-family:var(--disp);font-weight:700;font-size:clamp(20px,2.3vw,31px);
  line-height:1.1;letter-spacing:-.02em;margin:0}
.work-tags{display:none;flex-wrap:wrap;gap:6px;margin-top:13px}
.tag{font-family:var(--mono);font-size:10px;letter-spacing:.07em;text-transform:uppercase;
  color:var(--muted);border:1px solid var(--line);border-radius:var(--radius);padding:4px 7px}
.tag.hot{color:var(--accent);border-color:rgba(0,255,157,.32)}
.work-panel{position:relative;height:580px;border:1px solid var(--line);border-radius:var(--radius);
  background:rgba(226,232,240,.02);overflow:hidden}
.panel-in{position:absolute;inset:0;padding:22px;display:flex;flex-direction:column;gap:15px}
.panel-top{display:flex;align-items:center;justify-content:space-between;gap:12px}
.badge{font-family:var(--mono);font-size:10px;font-weight:500;letter-spacing:.09em;border:1px solid var(--muted);
  color:var(--muted);border-radius:var(--radius);padding:4px 8px;white-space:nowrap}
.badge.hot{border-color:rgba(0,255,157,.55);color:var(--accent)}
.badge.live{border-color:rgba(226,232,240,.45);color:var(--paper)}
.panel-art{flex:1;min-height:0;display:flex;flex-direction:column;gap:12px;justify-content:center}
.panel-art svg{width:100%;height:100%;flex:1;min-height:0}
.panel-copy{margin:0;font-size:14.5px;line-height:1.62;color:rgba(226,232,240,.76);font-weight:300}
.panel-foot{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;
  border-top:1px solid var(--line);padding-top:13px}
.snippet{margin:0;height:100%;overflow:auto;font-family:var(--mono);font-size:11.5px;line-height:1.75;white-space:pre}
.sn-num{display:inline-block;width:26px;color:rgba(139,148,158,.45);font-size:10px;user-select:none}
.sn-k,.sn-a{color:var(--accent)}.sn-v{color:var(--paper)}.sn-d,.sn-c{color:rgba(139,148,158,.85)}

.case{border-top:1px solid var(--line)}
.case:last-child{border-bottom:1px solid var(--line)}
.case-head{width:100%;display:grid;grid-template-columns:64px minmax(0,1fr) auto;gap:18px;
  align-items:center;padding:26px 0;text-align:left;transition:color .3s var(--ease)}
.case-head:hover .case-title{color:var(--accent)}
.case-title{font-family:var(--disp);font-weight:700;font-size:clamp(19px,2.1vw,27px);
  letter-spacing:-.02em;line-height:1.15;margin:0;transition:color .3s var(--ease)}
.case-chev{transition:transform .4s var(--ease);color:var(--muted)}
.case-chev.open{transform:rotate(90deg);color:var(--accent)}
.case-body{overflow:hidden}
.case-in{padding:0 0 34px;display:grid;grid-template-columns:64px minmax(0,1fr);gap:18px}
.fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 40px}
.field{border-top:1px solid var(--line);padding:16px 0}
.field p{margin:7px 0 0;font-size:14.5px;line-height:1.65;font-weight:300;color:rgba(226,232,240,.8)}
.case-meta{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:8px;align-items:center}

.phil{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);gap:48px;align-items:start}
.phil p{margin:0;font-size:clamp(18px,1.7vw,22px);line-height:1.55;letter-spacing:-.01em;max-width:36ch}

.exp{border-top:1px solid var(--line)}
.exp-item{border-bottom:1px solid var(--line);padding:38px 0;display:grid;
  grid-template-columns:minmax(0,.72fr) minmax(0,1.9fr);gap:44px}
.exp-org{font-family:var(--disp);font-weight:700;font-size:clamp(24px,2.6vw,34px);
  letter-spacing:-.02em;line-height:1.05;margin:8px 0 0}
.exp-role{font-family:var(--disp);font-weight:500;font-size:16px;letter-spacing:-.01em;margin-top:8px}
.exp-scope{margin-top:14px;padding-top:14px;border-top:1px solid var(--line);font-size:11px;line-height:1.6}
.grp{border-top:1px solid var(--line);padding:18px 0;display:grid;grid-template-columns:132px minmax(0,1fr);gap:20px}
.grp:last-child{border-bottom:1px solid var(--line)}
.grp ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:11px}
.grp li{display:grid;grid-template-columns:14px minmax(0,1fr);gap:11px;font-size:14.8px;
  line-height:1.62;color:rgba(226,232,240,.82);font-weight:300}
.grp li i{display:block;width:5px;height:5px;background:var(--accent);margin-top:9px}

.filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:26px}
.chip{font-family:var(--mono);font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;
  border:1px solid var(--line);border-radius:var(--radius);padding:7px 11px;color:var(--muted);transition:.3s var(--ease)}
.chip:hover{color:var(--paper);border-color:rgba(226,232,240,.3)}
.chip.on{color:var(--on-accent);background:var(--accent);border-color:var(--accent)}
.pi-row{display:grid;grid-template-columns:44px minmax(0,1.9fr) minmax(0,.85fr) minmax(0,1.5fr) 132px;
  gap:18px;align-items:baseline;border-top:1px solid var(--line);padding:16px 0;transition:background .3s var(--ease)}
.pi-row:last-child{border-bottom:1px solid var(--line)}
.pi-row:hover{background:rgba(226,232,240,.025)}
.pi-name{font-family:var(--disp);font-weight:500;font-size:15.5px;letter-spacing:-.01em;line-height:1.35}
.pi-stack{font-family:var(--mono);font-size:11px;color:rgba(139,148,158,.9);line-height:1.6}
.pi-head{border-top:0;padding-bottom:10px}
.pi-head:hover{background:none}
.st{font-family:var(--mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;
  display:inline-flex;align-items:center;gap:7px;color:var(--muted)}
.st::before{content:"";width:5px;height:5px;border-radius:50%;background:var(--muted)}
.st.PRODUCTION::before,.st.OPERATED::before{background:var(--accent)}
.st.IMPLEMENTED::before{background:rgba(226,232,240,.75)}
.st.PRODUCTION,.st.OPERATED{color:var(--accent)}

.cmp-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:0 48px}
.cmp-row{border-top:1px solid var(--line);padding:18px 0;display:grid;
  grid-template-columns:minmax(0,1fr) auto;gap:16px;align-items:baseline}
.cmp-name{font-family:var(--disp);font-weight:500;font-size:16px;letter-spacing:-.01em}
.cmp-detail{grid-column:1/-1;margin:7px 0 0;font-size:13.8px;line-height:1.6;color:rgba(226,232,240,.7);font-weight:300}
.stack-wrap{border:1px solid var(--line);border-radius:var(--radius);padding:22px;background:rgba(11,15,20,.3);margin-bottom:44px}
.scope-note{margin-top:28px;border-left:1px solid var(--accent);padding-left:18px;
  font-size:13px;line-height:1.65;color:rgba(226,232,240,.7);font-weight:300}

.ar-row{display:grid;grid-template-columns:minmax(0,.6fr) minmax(0,2fr);gap:32px;align-items:start;
  border-top:1px solid var(--line);padding:22px 0}
.ar-row:last-child{border-bottom:1px solid var(--line)}
.ar-tools{display:flex;flex-wrap:wrap;gap:9px 20px}
.ar-tool{display:inline-flex;align-items:center;gap:9px;font-family:var(--mono);font-size:12px;
  letter-spacing:.03em;color:rgba(226,232,240,.86)}
.dot{width:5px;height:5px;border-radius:50%;flex:0 0 auto;background:var(--muted);display:inline-block}
.dot.hands{background:var(--accent)}
.legend{display:flex;gap:22px;align-items:center;margin-bottom:26px;flex-wrap:wrap}

.lab-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-top:34px}
.lab-card{border:1px solid var(--line);border-radius:var(--radius);padding:22px;background:rgba(11,15,20,.35);
  display:flex;flex-direction:column;gap:11px;transition:border-color .4s var(--ease),transform .4s var(--ease)}
.lab-card:hover{border-color:rgba(0,255,157,.4);transform:translateY(-2px)}
.lab-title{font-family:var(--disp);font-weight:700;font-size:17px;letter-spacing:-.015em;line-height:1.22;margin:0}
.lab-body{margin:0;font-size:13.5px;line-height:1.6;color:rgba(226,232,240,.72);font-weight:300}

.note{border-top:1px solid var(--line);padding:28px 0;display:grid;grid-template-columns:120px minmax(0,1fr);gap:26px}
.note:last-child{border-bottom:1px solid var(--line)}
.note-h{font-family:var(--disp);font-weight:700;font-size:clamp(18px,1.9vw,24px);letter-spacing:-.02em;line-height:1.2;margin:0}
.note-b{margin:11px 0 0;font-size:14.8px;line-height:1.68;color:rgba(226,232,240,.78);font-weight:300;max-width:72ch}
.note-ev{margin-top:13px;font-size:10.5px}

.cred{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:44px}
.cred-item{border-top:1px solid var(--line);padding:18px 0}
.cred-t{font-family:var(--disp);font-weight:500;font-size:17px;letter-spacing:-.01em;margin:8px 0 0}
.cert{display:flex;justify-content:space-between;gap:18px;align-items:baseline;border-top:1px solid var(--line);padding:14px 0}
.cert-t{font-family:var(--disp);font-weight:500;font-size:15.5px;letter-spacing:-.01em}
.link-row{display:flex;gap:8px;align-items:center;transition:color .3s var(--ease)}
.link-row:hover{color:var(--accent)}

.res-band{border:1px solid var(--line);border-radius:var(--radius);padding:38px 34px;
  background:rgba(226,232,240,.02);display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);
  gap:40px;align-items:center}
.res-h{font-family:var(--disp);font-weight:900;font-size:clamp(28px,3.6vw,46px);
  letter-spacing:-.03em;line-height:1.02;margin:16px 0 0}
.btn{display:inline-flex;align-items:center;gap:9px;border:1px solid var(--line);border-radius:var(--radius);
  padding:12px 17px;font-family:var(--mono);font-size:11.5px;font-weight:500;letter-spacing:.09em;
  text-transform:uppercase;transition:.35s var(--ease)}
.btn:hover{border-color:var(--accent);color:var(--accent)}
.btn.solid{background:var(--accent);color:var(--on-accent);border-color:var(--accent)}
.btn.solid:hover{background:transparent;color:var(--accent)}
.btn-row{display:flex;gap:12px;flex-wrap:wrap;margin-top:24px}
.res-toc{border-left:1px solid var(--line);padding-left:26px;display:flex;flex-direction:column;gap:9px}

.contact{background:var(--accent);color:var(--on-accent);border-radius:var(--radius);padding:46px 38px}
.contact-in{display:flex;align-items:flex-end;justify-content:space-between;gap:32px;flex-wrap:wrap}
.contact .meta{color:rgba(11,15,20,.62)}
.contact-mail{font-family:var(--disp);font-weight:700;font-size:clamp(19px,3.2vw,44px);letter-spacing:-.03em;
  line-height:1.05;color:var(--on-accent);display:inline-block;border-bottom:2px solid rgba(11,15,20,.25);
  padding-bottom:6px;transition:border-color .35s var(--ease);word-break:break-word}
.contact-mail:hover{border-bottom-color:var(--on-accent)}
.contact-links{display:flex;gap:22px;flex-wrap:wrap}
.contact-links a{display:inline-flex;align-items:center;gap:7px;font-family:var(--mono);font-size:12px;
  font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:var(--on-accent);opacity:.78;
  transition:opacity .3s var(--ease)}
.contact-links a:hover{opacity:1}
.foot-markwrap{overflow:hidden;margin-top:44px}
.foot-mark{font-family:var(--disp);font-weight:900;font-size:clamp(72px,17vw,225px);line-height:.82;
  letter-spacing:-.045em;color:var(--paper);opacity:.1;margin:0 0 -.16em;white-space:nowrap;user-select:none}
.foot-end{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:22px 0 38px;flex-wrap:wrap}
.totop{position:fixed;right:22px;bottom:22px;z-index:65;width:42px;height:42px;border:1px solid var(--line);
  border-radius:var(--radius);background:var(--ink);display:flex;align-items:center;justify-content:center;
  color:var(--muted);transition:.35s var(--ease)}
.totop:hover{border-color:var(--accent);color:var(--accent)}

.res-overlay{position:fixed;inset:0;z-index:100;background:rgba(4,7,10,.88);overflow-y:auto;padding:40px 20px}
.res-bar{position:sticky;top:0;z-index:2;max-width:860px;margin:0 auto 18px;display:flex;gap:10px;
  justify-content:flex-end;flex-wrap:wrap}
.res-sheet{max-width:860px;margin:0 auto;background:var(--doc);color:var(--doc-ink);
  border-radius:var(--radius);padding:46px 48px;font-family:var(--body);font-size:13.2px;line-height:1.58}
.res-sheet h1{font-family:var(--disp);font-weight:900;font-size:34px;letter-spacing:-.03em;margin:0;line-height:1}
.res-role{font-family:var(--mono);font-size:11px;letter-spacing:.09em;text-transform:uppercase;
  color:var(--doc-muted);margin-top:9px}
.res-links{display:flex;flex-wrap:wrap;gap:6px 16px;margin-top:14px;padding-top:13px;
  border-top:1px solid var(--doc-line);font-family:var(--mono);font-size:10.5px;color:var(--doc-muted);letter-spacing:.03em}
.res-links a{color:var(--doc-ink);border-bottom:1px solid var(--doc-line)}
.res-sec{margin-top:26px}
.res-sec>h2{font-family:var(--mono);font-size:10.5px;font-weight:500;letter-spacing:.13em;text-transform:uppercase;
  color:var(--doc-ink);margin:0 0 12px;padding-bottom:7px;border-bottom:1px solid var(--doc-line)}
.res-job{margin-bottom:18px}
.res-job-h{display:flex;justify-content:space-between;gap:16px;align-items:baseline;flex-wrap:wrap}
.res-job-t{font-family:var(--disp);font-weight:700;font-size:15px;letter-spacing:-.01em}
.res-job-d{font-family:var(--mono);font-size:10.5px;color:var(--doc-muted);letter-spacing:.05em}
.res-job-r{font-size:12.4px;color:var(--doc-muted);margin-top:2px}
.res-sheet ul{margin:9px 0 0;padding:0;list-style:none}
.res-sheet li{position:relative;padding-left:14px;margin-bottom:6px;font-size:12.8px;line-height:1.55}
.res-sheet li::before{content:"";position:absolute;left:0;top:7px;width:4px;height:4px;background:var(--doc-ink)}
.res-sk{display:grid;grid-template-columns:158px minmax(0,1fr);gap:7px 16px;margin:0}
.res-sk dt{font-family:var(--mono);font-size:10.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--doc-muted)}
.res-sk dd{margin:0;font-size:12.6px}
.res-2col{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 28px}
.res-proj{margin-bottom:11px}
.res-proj b{font-family:var(--disp);font-weight:700;font-size:13px}
.res-proj span{display:block;font-size:12.4px;color:var(--doc-muted);margin-top:2px}
.res-foot{margin-top:22px;padding-top:12px;border-top:1px solid var(--doc-line);font-size:10.5px;
  color:var(--doc-muted);font-family:var(--mono);letter-spacing:.04em}
.toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:120;background:var(--accent);
  color:var(--on-accent);font-family:var(--mono);font-size:11px;letter-spacing:.09em;text-transform:uppercase;
  padding:11px 16px;border-radius:var(--radius);display:inline-flex;align-items:center;gap:8px}

@media (max-width:1024px){
  .work-panel{height:520px}
  .work-grid{gap:40px}
  .lab-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .pi-row{grid-template-columns:38px minmax(0,1.6fr) minmax(0,.8fr) 122px}
  .pi-stack{display:none}
}
@media (max-width:900px){
  .work-grid{grid-template-columns:minmax(0,1fr)}
  .work-panel{height:470px}
  .hero-grid{grid-template-columns:minmax(0,1fr);gap:34px}
  .hero-rail{border-left:0;border-top:1px solid var(--line);padding-left:0;padding-top:22px;
    flex-direction:row;flex-wrap:wrap;gap:26px}
  .phil,.exp-item,.ar-row,.res-band,.cmp-grid,.fields{grid-template-columns:minmax(0,1fr)}
  .res-band{gap:28px}
  .res-toc{border-left:0;border-top:1px solid var(--line);padding-left:0;padding-top:22px}
  .grp{grid-template-columns:minmax(0,1fr);gap:11px}
  .sig-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
  .cred,.res-2col{grid-template-columns:minmax(0,1fr)}
  .case-head{grid-template-columns:48px minmax(0,1fr) auto;gap:12px}
  .case-in{grid-template-columns:minmax(0,1fr)}
  .note{grid-template-columns:minmax(0,1fr);gap:12px}
  .nav-links{display:none}
  .burger{display:flex}
}
@media (max-width:768px){
  :root{--gut:20px}
  .section{padding:64px 0}
  .packet{animation-duration:60s}
  .work-panel{display:none}
  .work-tags{display:flex}
  .work-row{padding:19px 0;grid-template-columns:30px minmax(0,1fr)}
  .pi-row{grid-template-columns:30px minmax(0,1fr) 104px;gap:12px}
  .pi-dom{display:none}
  .contact{padding:30px 22px}
  .res-sheet{padding:30px 22px}
  .res-overlay{padding:20px 12px}
  .sig-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:22px 16px}
  .res-sk{grid-template-columns:minmax(0,1fr);gap:3px}
  .res-sk dd{margin-bottom:9px}
  .totop{right:14px;bottom:14px}
  .case-head{grid-template-columns:40px minmax(0,1fr) auto}
}
@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  .packet{display:none}
  .scroll-cue svg{animation:none}
  *,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;
    transition-duration:.001ms!important}
}
@media print{
  html,body{background:#fff!important}
  .site-root,.res-bar,.toast,.totop{display:none!important}
  .res-overlay{position:static!important;background:#fff!important;padding:0!important;
    overflow:visible!important;display:block!important}
  .res-sheet{max-width:none!important;width:100%!important;padding:0!important;border-radius:0!important;background:#fff!important}
  .res-sec,.res-job{break-inside:avoid}
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
};
const Ico = ({ n, s = 14, sw = 1.8 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={PATHS[n]} />
  </svg>
);

/* ================================ data ================================== */

const PROFILE = {
  name: "Ayush Kumar Srivastava",
  wordmark: "AYUSH KUMAR SRIVASTAVA",
  email: "ayush.kumar.srivastava150@gmail.com",
  location: "Lucknow, India",
  site: "https://ryuga-portfolio.vercel.app",
  updated: "14 October 2026",
  github: { label: "GitHub", handle: "heroaks", url: "https://github.com/heroaks" },
  linkedin: { label: "LinkedIn", handle: "ayush-srivastava-150", url: "https://www.linkedin.com/in/ayush-srivastava-150" },
  elsewhere: [
    { label: "LeetCode", handle: "ryuga__", url: "https://leetcode.com/ryuga__" },
    { label: "HackerRank", handle: "ryuga__", url: "https://www.hackerrank.com/ryuga__" },
    { label: "GeeksforGeeks", handle: "ryuga__", url: "https://auth.geeksforgeeks.org/user/ryuga__" },
  ],
};
const RESUME_PDF = "/resume.pdf"; /* set to "/resume.pdf" if you drop a real file in public/ */

const HERO = {
  meta: "DEVSECOPS & PLATFORM ENGINEERING",
  lineA: "Building secure, observable, and cost-conscious",
  lineB: "cloud infrastructure.",
  sub: "I am an infrastructure-focused engineer whose work spans cloud operations, DevSecOps, platform engineering, CI/CD, endpoint security, and operational automation. I favor practical controls, role-based access, and evidence-based troubleshooting.",
  rail: [
    { k: "Current", role: "DevOps Engineer", org: "NIIT Limited" },
    { k: "Previous", role: "Associate DevSecOps Engineer", org: "Castler" },
    { k: "Focus", role: "AWS · Azure · ECS · MSK", org: "CI/CD · Observability · Zero Trust" },
  ],
};

const SIGNALS = [
  { v: "110+", l: "VMs under management" },
  { v: "10+", l: "Enterprise applications" },
  { v: "~60%", l: "Azure spend decrease, NIIT (reported)" },
  { v: "~25%", l: "AWS spend decrease, NIIT (reported)" },
  { v: "100+", l: "Endpoints in Intune scope" },
  { v: "30+", l: "Security baselines" },
  { v: "10+", l: "SSO and access integrations" },
  { v: "~87%", l: "Azure spend decrease, Castler (reported)" },
  { v: "100+", l: "Custom SIEM alert rules" },
  { v: "50+", l: "Developers moved to browser bastion" },
];

const WORK = [
  {
    n: "01", kind: "Architecture", art: "micro", status: "PRODUCTION", badge: "hot",
    title: "Spring Boot Microservices Platform on ECS",
    copy: "Deploying and managing an ECS cluster for a Spring Boot microservice estate covering authentication, transactions, scheduling, and change data capture, with API gateway integration, Amazon MSK, Redis, and Consul for discovery and configuration.",
    tech: "AWS ECS, Spring Boot, API Gateway, Amazon MSK, Redis, Consul, Jenkins",
  },
  {
    n: "02", kind: "Data path", art: "stream", status: "PRODUCTION", badge: "hot",
    title: "Event Backbone with MSK, Debezium & Redis",
    copy: "A durable change data capture and eventing path that decouples transaction processing from downstream consumers, keeping the event path separate from the synchronous request path and using idempotent consumers with explicit offset commits.",
    tech: "Amazon MSK, Kafka, Debezium, Redis, RDS PostgreSQL, ECS",
  },
  {
    n: "03", kind: "Architecture", art: "ecs", status: "IN PROGRESS", badge: "",
    title: "AWS ECS Platform Engineering & Revamp",
    copy: "Operating and evolving an ECS-based application platform, from container delivery and load balancing to production troubleshooting, logging, and a more secure, repeatable target architecture.",
    tech: "AWS ECS, ARM64, ALB, GitLab CI/CD",
  },
  {
    n: "04", kind: "Pipeline", art: "cicd", status: "IMPLEMENTED", badge: "live",
    title: "GitLab CI/CD to ECR & ECS",
    copy: "Built a self-hosted delivery workflow that separates image creation from controlled deployment and uses AWS roles instead of static runner credentials.",
    tech: "GitLab, Docker, AWS IAM, ECS",
  },
  {
    n: "05", kind: "Identity map", art: "identity", status: "PRODUCTION", badge: "hot",
    title: "Endpoint, Identity & Zero Trust Foundation",
    copy: "Established centralized endpoint and identity controls for a growing fintech team, turning scattered device access into a managed, policy-driven model.",
    tech: "Microsoft Intune, Entra ID, Conditional Access",
  },
  {
    n: "06", kind: "Evidence", art: "incident", status: "PRODUCTION", badge: "hot",
    title: "Production Performance Investigation",
    copy: "Investigated a production slowdown by correlating application and infrastructure metrics with ALB logs and Athena queries, building a clearer picture of request volume and latency.",
    tech: "AWS Athena, ALB Logs, CloudWatch",
  },
];

const CASES = [
  {
    id: "CF-01",
    title: "Spring Boot Microservices on ECS with MSK, Redis and Consul",
    status: "PRODUCTION",
    summary: "A transaction-heavy microservice estate moved onto a managed ECS cluster with a real event backbone, centralized discovery, and pipeline-driven releases.",
    stack: "AWS ECS · Spring Boot · API Gateway · Amazon MSK · Kafka · Debezium · Redis · Consul · Jenkins · ECR",
    fields: [
      ["Context", "A platform composed of Spring Boot microservices covering authentication, transaction processing, scheduling, and change data capture. Each service needed an independent release path while sharing eventing, caching, and discovery."],
      ["Problem", "Services reached each other through shared ingress paths and static configuration. Deployments were manual, credentials travelled with environment files, and there was no durable event path for state changes that other services depended on."],
      ["My role", "Deployed and operated the ECS cluster, defined task definitions and capacity, integrated the API gateway, stood up MSK, Redis, and Consul, and built the Jenkins delivery path. Application design decisions were made jointly with the service owners."],
      ["Architecture", "API gateway and ALB in the public path. ECS services in private subnets. Consul for registration, health checking, and configuration. Amazon MSK carrying change data capture and domain events. Redis for hot lookups and short-lived state. RDS PostgreSQL as the system of record. No account IDs, cluster names, topics, or private endpoints are published."],
      ["Implementation", "Debezium runs as Kafka Connect workers on ECS and publishes table changes to MSK topics. Transaction and scheduler services consume with explicit offset commits and idempotent handlers. Each service uses its own task role rather than shared credentials, secrets live in Secrets Manager, images are ARM64, and Jenkins builds, scans, publishes to ECR, then updates the intended container by name in a new task definition revision."],
      ["Challenges", "Multi-container task definitions include a log router sidecar, so an index-based container update mutated the wrong container. Consul health and ALB target health disagreed during rollouts until draining and deregistration delays were tuned. Consumer group rebalances showed up as latency spikes during deploys."],
      ["Outcome", "Repeatable Jenkins-driven releases, a durable event path that decouples transaction processing from downstream consumers, centralized discovery and configuration, and internal traffic that no longer traverses public ingress components."],
      ["Lessons", "Select containers by name, never by array index. Validate the whole path from host bootstrap through agent health, registration, capacity, placement, image pull, secret retrieval, and container health. Discovery health and load balancer health are two different signals."],
    ],
  },
  {
    id: "CF-02",
    title: "Production Performance Investigation with ALB Logs and Athena",
    status: "PRODUCTION",
    summary: "Severe slowness and intermittent 502s during elevated traffic, resolved with evidence rather than by adding capacity first.",
    stack: "ALB Access Logs · Athena SQL · CloudWatch · ECS · FireLens / Fluent Bit",
    fields: [
      ["Context", "A production web platform serving customer traffic through CloudFront and an Application Load Balancer into ECS, with a Next.js frontend, a Strapi CMS, and a Fastify gateway."],
      ["Problem", "Users reported severe slowness and intermittent failures during elevated traffic. There was no single view connecting request volume, route behavior, target latency, and service resource usage."],
      ["My role", "Led the investigation across logs, metrics, and configuration, correlated the evidence, and produced the analysis. Remediation was agreed with the application owners."],
      ["Architecture", "CloudFront to ALB to ECS tasks in private subnets, with RDS PostgreSQL and S3 behind them and FireLens plus Fluent Bit shipping container logs to a centralized store."],
      ["Implementation", "Queried ALB access logs with Athena SQL, breaking results down by route, status code, and target response time. Compared request volume against service CPU and memory in the same window. Reviewed health check thresholds and intervals. Inspected internal service-to-service paths that were unnecessarily crossing shared ingress."],
      ["Challenges", "One observation window recorded typical traffic around 1.5K to 2K requests per minute with a spike above 10K. A separate window recorded a typical average near 1.18K with peaks around 2.5K and spikes near 7.93K. The two windows are different and must never be merged into a single baseline. Health check configuration and dependency latency contributed as much as raw volume."],
      ["Outcome", "A clear, evidence-based picture of which routes failed, when 502 responses appeared, and how target latency related to request volume during the incident window."],
      ["Lessons", "A traffic graph is one piece of evidence, not a root cause. Correlate volume, latency, status codes, target health, and resource data inside the same window. Adding instances does not fix every overload pattern."],
    ],
  },
  {
    id: "CF-03",
    title: "Zero Trust, Detection and Compliance Foundation at a Fintech",
    status: "PRODUCTION",
    summary: "Endpoint, identity, detection, and audit evidence work in a small regulated environment with one primary security resource.",
    stack: "Intune · Entra ID · Conditional Access · Defender EDR · Sentinel · Wazuh · Purview DLP · Trivy · Snyk · OWASP ZAP",
    fields: [
      ["Context", "A fintech startup under 250+ employees expanding into regulated banking relationships, with device access and application sign-on managed informally."],
      ["Problem", "No centralized endpoint management, inconsistent local administrator control, scattered application credentials, and audit evidence assembled manually at request time."],
      ["My role", "Initially the primary security-focused resource. Built the Intune and Entra ID foundation, integrated security tooling into delivery, configured data loss prevention, and prepared technical evidence for audits. Certification ownership remained with the business."],
      ["Architecture", "Entra ID as the identity plane, Conditional Access as the policy layer, Intune as the endpoint plane, SSO and SAML in front of 10+ applications, Defender for Endpoint and Wazuh for detection, and scanning gates inside the build pipeline."],
      ["Implementation", "100+ endpoints enrolled. 30+ baseline controls including BitLocker, Defender for Endpoint, LAPS, application installation restrictions, web filtering, and removable media control. SSO, SAML, and Conditional Access across 10+ tools. Trivy, Snyk, and OWASP ZAP inside Jenkins. Purview DLP with custom sensitive information types. Wazuh with 100+ custom alert rules across EC2, RDS, CloudWatch, and CloudTrail."],
      ["Challenges", "One person connecting endpoint, server, cloud, and identity evidence. Balancing control strictness against developer friction. Demonstrating data residency for RBI expectations while services spanned multiple clouds."],
      ["Outcome", "Centrally applied, auditable policy across endpoints and identities, earlier visibility of vulnerabilities in the delivery path, and evidence available without ad hoc collection. Supported technical preparation for ISO/IEC 27001:2022, PCI DSS v4.0, SOC 2 Type II, and AWS FTR, with RBI data localization work completed."],
      ["Lessons", "Policy applied centrally beats policy documented in a wiki. Evidence should be a byproduct of the control, not a separate project. Use supported and prepared evidence for unless you formally owned the certification."],
    ],
  },
];

const EXPERIENCE = [
  {
    n: "01", org: "NIIT Limited", role: "DevOps Engineer", dates: "Feb 2026 – Present",
    scope: "Scope / Multi-cloud estate of roughly 110 VMs and 10+ enterprise applications across AWS and Azure, with platform, delivery, observability, access, and cost responsibilities.",
    groups: [
      { label: "Platform", bullets: [
        "Deploy and manage an ECS cluster for a Spring Boot microservice estate covering auth, transaction, scheduler, and Debezium CDC services, integrating API gateway routing.",
        "Stand up and operate Amazon MSK for change data capture and domain events, Redis for hot lookups and short-lived state, and Consul for service registration, health checking, and configuration.",
        "Contribute to an ECS-on-EC2 application platform running a Next.js frontend, Strapi CMS, and Fastify gateway, with ECR images, ALB and CloudFront ingress, private networking, RDS PostgreSQL, S3 media, and centralized container logging.",
        "Build ARM64 Graviton-compatible images, a golden Ubuntu ECS host image, launch templates, and cluster registration configuration, moving toward awsvpc networking with Service Connect and Cloud Map.",
        "Prefer ECS task roles for application-level AWS access, keep secrets in Secrets Manager, and separate secrets from ordinary environment configuration.",
      ]},
      { label: "Delivery", bullets: [
        "Migrate source control and CI/CD from AWS CodeCommit and CodeBuild to self-hosted GitLab with GitLab Runners, adding Trivy, SonarQube, and Snyk gates for container scanning, static analysis, and vulnerability detection.",
        "Build Jenkins pipelines for the microservice estate, separating image creation from a controlled deployment stage that registers a new task definition revision.",
        "Author infrastructure as code for a Next.js, Strapi, and Fastify platform using Pulumi and AWS ECS, alongside Terraform modules for compute with encrypted storage and IMDSv2.",
        "Account for multi-container task definitions so automation updates the intended application container by name rather than by array position.",
      ]},
      { label: "Observability", bullets: [
        "Replace a licensed monitoring stack with a centralized open-source platform using Grafana, Loki, Prometheus, Fluent Bit, and Uptime Kuma.",
        "Build alert routing through AWS SNS, SendGrid, Microsoft Teams, and Telegram, with signals around ALB target response time, unhealthy target count, 5xx rates, and running versus desired task counts.",
        "Design EC2 service discovery so monitoring targets follow Auto Scaling events, and plan Node Exporter coverage across AMD64 and ARM64 hosts.",
      ]},
      { label: "Cost", bullets: [
        "Reduce reported Azure spend by approximately 60% and AWS spend by approximately 25% through rightsizing, consolidation, archival strategies, and migration to open-source alternatives.",
        "Decommission 20 to 30 legacy servers and migrate managed Redis and database backup workloads onto existing infrastructure, lowering recurring cloud service cost.",
        "Assess storage growth and backup retention for a self-hosted GitLab service, distinguishing active application data from older backup data and weighing archival cost against restore requirements.",
      ]},
      { label: "Access", bullets: [
        "Design and operate containerized browser-based bastion infrastructure using Apache Guacamole on Linux, migrating 50+ developers off legacy Windows bastion and VPN workflows and removing the associated licensing overhead.",
        "Run self-hosted engineering services on EC2 and Docker with persistent volumes, file ownership, TLS, Nginx reverse proxy, backups, and image cleanup.",
      ]},
      { label: "Investigation", bullets: [
        "Investigate production performance using ALB access logs, Athena SQL, request volume and status code trends, target latency, health checks, and service resource metrics.",
        "Resolve ECS host registration and task placement failures across host bootstrap, agent health, capacity provider association, subnet capacity, security groups, image pull, and secret retrieval.",
        "Lead modernization of legacy .NET Framework applications on Windows toward Node.js-based containerized services on AWS Linux environments.",
      ]},
    ],
  },
  {
    n: "02", org: "Castler", role: "Associate DevSecOps Engineer", dates: "Jul 2024 – Jan 2026",
    scope: "Progression / Campus-hired as a Trainee Engineer, then progressed into DevSecOps responsibilities and title. Fintech environment under 250+ employees where DevOps, IT, and security overlapped, and I was initially the primary security-focused resource.",
    groups: [
      { label: "Identity", bullets: [
        "Implement Microsoft Intune organization-wide with 30+ Zero Trust policies and integrate SSO with Conditional Access across 10+ applications, strengthening identity governance and reducing credential sprawl.",
        "Bring 100+ endpoints under managed configuration and policy coverage with baselines for BitLocker, Defender for Endpoint, LAPS, application installation restrictions, web filtering, and removable media.",
        "Centralize AWS multi-account governance with enforced tagging, IAM Identity Center SSO, and DNS routing for secure, compliant operations.",
      ]},
      { label: "Detection", bullets: [
        "Deploy Microsoft Defender EDR, Sentinel SIEM, and XDR for unified threat detection, automated response, and cross-domain investigation, reducing incident detection and response time by approximately 60%.",
        "Design and implement Wazuh SIEM as the primary monitoring platform across production cloud resources including EC2, RDS, CloudWatch, and CloudTrail, with 100+ custom alert rules and Grafana plus Prometheus dashboards.",
        "Route alerts through Teams, Discord, Telegram, and email, and align AWS multi-account monitoring with AWS FTR best practices.",
      ]},
      { label: "DevSecOps", bullets: [
        "Manage ECS and Docker workloads, migrate CI/CD from Azure DevOps to Jenkins, and automate vulnerability scanning with Snyk and Trivy, reducing deployment time from 10 to 30 minutes down to 5 to 15 minutes.",
        "Integrate OWASP ZAP dynamic testing and Nessus scanning into delivery workflows so findings surface before release.",
        "Author Ansible playbooks for OS and system hardening across Amazon Linux, RHEL 9, and Ubuntu 22 and 24.",
      ]},
      { label: "Compliance", bullets: [
        "Complete RBI data localization compliance work and lead technical preparation for PCI DSS v4.0, ISO/IEC 27001:2022, SOC 2 Type II, and external bank audits.",
        "Implement Microsoft Purview DLP with custom sensitive information types and organization-wide policies.",
        "Conduct quarterly VAPT cycles, BCP and DR drills, and org-wide security training, and contribute to AWS Foundational Technical Review preparation.",
      ]},
      { label: "Cost & Network", bullets: [
        "Lead cost optimization across AWS, Azure, GCP, Cloudflare, and Microsoft 365, achieving an approximately 87% reduction in Azure spend and 30%+ AWS savings.",
        "Replace a paid uptime monitor with Uptime Kuma and multi-channel alerting, cutting annual monitoring cost by roughly $180.",
        "Configure a FortiGate 80F environment with dual ISP connectivity and VPN access, migrate from OpenVPN toward FortiClient, and operate private VPC boundaries with ALB and Cloudflare DNS.",
      ]},
      { label: "Automation", bullets: [
        "Automate an approval workflow with Power Automate, with a reported reduction of roughly 40% in manual effort or turnaround.",
        "Build an Ollama and n8n workflow to summarize downtime logs and explore more consistent incident report preparation.",
        "Migrate an internal CRM workload from a VM-based setup to a local Kubernetes environment using kind.",
      ]},
    ],
  },
  {
    n: "03", org: "Independent Engineering", role: "Personal Projects & Lab", dates: "2024 – Present",
    scope: "Scope / Self-directed work outside employment. Clearly separated from professional deliverables and labelled as POC, design, or learning.",
    groups: [
      { label: "Software & AI", bullets: [
        "Build a multi-agent code quality and optimization application combining AST-oriented static analysis, hybrid retrieval, specialist review agents, confidence validation, and source attribution behind FastAPI, PostgreSQL, and Docker.",
        "Deliver a multi-file implementation with CLI and browser interfaces plus an automated test suite covering inefficient algorithms, N+1 query patterns, duplication, coverage gaps, and circular dependencies.",
      ]},
      { label: "Infrastructure", bullets: [
        "Build a reproducible Proxmox and Talos Kubernetes lab to practice VM provisioning, cluster lifecycle, and infrastructure as code with Terraform and talosctl.",
        "Develop a reusable Terraform configuration for AWS compute with explicit networking, encrypted gp3 storage, variables, outputs, and IMDSv2 hardening.",
      ]},
    ],
  },
];

const INDEX = [
  { n: "01", name: "Spring Boot Microservices Platform on ECS", domain: "Platform", stack: "ECS, Spring Boot, API Gateway, Consul, Jenkins", status: "PRODUCTION" },
  { n: "02", name: "Event Backbone with MSK, Debezium & Redis", domain: "Data / Streaming", stack: "Amazon MSK, Kafka, Debezium, Redis, PostgreSQL", status: "PRODUCTION" },
  { n: "03", name: "Jenkins Delivery Pipelines for Microservices", domain: "Delivery", stack: "Jenkins, Docker, ECR, Trivy, Snyk, OWASP ZAP", status: "PRODUCTION" },
  { n: "04", name: "AWS ECS Platform Engineering & Revamp", domain: "Platform", stack: "ECS, ARM64, ALB, CloudFront, GitLab CI/CD", status: "IN PROGRESS" },
  { n: "05", name: "Self-hosted GitLab CI/CD to ECR & ECS", domain: "Delivery", stack: "GitLab, Runner, Docker, AWS IAM, ECS", status: "IMPLEMENTED" },
  { n: "06", name: "Open-Source Observability Platform", domain: "Observability", stack: "Grafana, Loki, Prometheus, Fluent Bit, Uptime Kuma", status: "PRODUCTION" },
  { n: "07", name: "Wazuh SIEM & AWS Multi-Account Governance", domain: "Security", stack: "Wazuh, CloudTrail, Sentinel, IAM Identity Center", status: "PRODUCTION" },
  { n: "08", name: "Endpoint, Identity & Zero Trust Foundation", domain: "Security", stack: "Intune, Entra ID, Conditional Access, SAML SSO", status: "PRODUCTION" },
  { n: "09", name: "Browser Bastion with Apache Guacamole", domain: "Access", stack: "Guacamole, Docker, Linux, Nginx, TLS", status: "PRODUCTION" },
  { n: "10", name: "Cloud Cost & Estate Modernization", domain: "FinOps", stack: "AWS, Azure, Rightsizing, Archival, Open Source", status: "IN PROGRESS" },
  { n: "11", name: "Infrastructure as Code with Pulumi & Terraform", domain: "IaC", stack: "Pulumi, Terraform, AWS ECS, EC2, IMDSv2", status: "IMPLEMENTED" },
  { n: "12", name: "Production Performance Investigation", domain: "Investigation", stack: "ALB Access Logs, Athena SQL, CloudWatch", status: "PRODUCTION" },
  { n: "13", name: "Compliance & Audit Evidence Programme", domain: "Assurance", stack: "ISO 27001, PCI DSS v4.0, SOC 2, RBI, AWS FTR", status: "OPERATED" },
  { n: "14", name: "Ansible Hardening & Configuration Playbooks", domain: "Automation", stack: "Ansible, Amazon Linux, RHEL 9, Ubuntu", status: "PRODUCTION" },
  { n: "15", name: "SonarQube Community in CI", domain: "Quality", stack: "SonarQube, PostgreSQL, SonarScanner, OpenJDK 17", status: "IMPLEMENTED" },
  { n: "16", name: "GitLab Storage, Backup & Retention Assessment", domain: "Operations", stack: "EBS, S3, AMI Lifecycle, Archival Analysis", status: "IMPLEMENTED" },
  { n: "17", name: "Serverless Deployment Notifications", domain: "Automation", stack: "Lambda, Python, Secrets Manager, Teams Webhook", status: "POC" },
  { n: "18", name: "AI-Assisted Downtime Log Summarization", domain: "Exploration", stack: "Ollama, n8n, Local LLM, Operational Logs", status: "POC" },
  { n: "19", name: "Autonomous Code Quality & Optimization System", domain: "Software / AI", stack: "Python, FastAPI, PostgreSQL, AST, Docker", status: "POC" },
  { n: "20", name: "Cloud Billing Analytics Path", domain: "FinOps", stack: "Billing Exports, CloudQuery, PostgreSQL, Metabase", status: "DESIGNED" },
  { n: "21", name: "Monthly Uptime Reporting Automation", domain: "Automation", stack: "Uptime Kuma, SQLite, EC2, Scheduling", status: "DESIGNED" },
  { n: "22", name: "Cross-Account EC2 Start/Stop Automation", domain: "Automation", stack: "EC2, IAM Roles, Cross-Account Access, Scheduling", status: "DESIGNED" },
  { n: "23", name: "Proxmox & Talos Kubernetes Homelab", domain: "Lab", stack: "Proxmox VE, Talos Linux, Kubernetes, Terraform", status: "LEARNING" },
  { n: "24", name: "Ubuntu Application & DevOps Lab", domain: "Lab", stack: "kind, Helm, Jenkins, Argo CD, Grafana", status: "LEARNING" },
  { n: "25", name: "Icinga Deployment Pattern Evaluation", domain: "Evaluation", stack: "Proxmox, LXC, Virtual Machines, Docker", status: "LEARNING" },
];
const FILTERS = ["ALL", "PRODUCTION", "IMPLEMENTED", "IN PROGRESS", "OPERATED", "POC", "DESIGNED", "LEARNING"];

const COMPLIANCE_LEAD = "Security work is only credible when the control, the evidence, and the owner are all named. This is the assurance layer I built and operated: identity and endpoint policy, detection, data protection, secure delivery, and audit evidence, with the wording kept deliberately precise about what I owned versus supported.";

const COMPLIANCE = [
  { name: "ISO/IEC 27001:2022", status: "EVIDENCE PREPARED", detail: "Led technical preparation and control evidence across the ISMS audit cycle, mapping infrastructure and identity controls to requirements." },
  { name: "PCI DSS v4.0", status: "EVIDENCE PREPARED", detail: "Technical control mapping and evidence collection for cardholder data environment requirements, including access control, logging, and scanning." },
  { name: "SOC 2 Type II", status: "SUPPORTED", detail: "Supported control evidence across security, availability, and confidentiality criteria and responded to auditor technical questions." },
  { name: "RBI Data Localization", status: "COMPLETED", detail: "Technical owner for data residency work relevant to Indian payment data, covering storage location, retention, and access boundaries." },
  { name: "AWS Foundational Technical Review", status: "SUPPORTED", detail: "Contributed to FTR preparation and to responses for bank and customer audits, including evidence collection across accounts." },
  { name: "Quarterly VAPT", status: "OPERATED", detail: "Coordinated vulnerability assessment and penetration testing cycles, triaged findings, and tracked remediation to closure with development teams." },
  { name: "BCP / DR Drills", status: "OPERATED", detail: "Ran business continuity and disaster recovery exercises, validating restore paths and documenting gaps for follow-up." },
  { name: "Security Awareness Training", status: "DELIVERED", detail: "Delivered organization-wide security training covering credential hygiene, phishing, device policy, and safe handling of customer data." },
  { name: "Data Loss Prevention", status: "IMPLEMENTED", detail: "Configured Microsoft Purview DLP with custom sensitive information types and organization-wide policies covering data at rest and in transit." },
  { name: "SIEM & Threat Detection", status: "PRODUCTION", detail: "Wazuh as the primary monitoring platform across EC2, RDS, CloudWatch, and CloudTrail with 100+ custom alert rules, alongside Defender for Endpoint EDR, Sentinel, XDR, and ClamAV host scanning." },
  { name: "Identity Governance", status: "PRODUCTION", detail: "Entra ID Conditional Access, SSO and SAML across 10+ applications, privileged access controls, IAM Identity Center, enforced tagging, and multi-account AWS governance." },
  { name: "Secure Delivery", status: "PRODUCTION", detail: "Trivy, Snyk, OWASP ZAP, Nessus, and SonarQube gates inside Jenkins and GitLab pipelines so findings surface before release rather than after." },
  { name: "Network Boundary", status: "OPERATED", detail: "FortiGate 80F with dual ISP and VPN access, OpenVPN to FortiClient migration, private VPC boundaries, ALB exposure control, Cloudflare DNS, and TLS termination at Nginx reverse proxies." },
  { name: "Secrets & Runtime Config", status: "PRODUCTION", detail: "Secrets Manager backed configuration, task and instance roles instead of long-lived static credentials, build context exclusions for environment files, and least-privilege policy per service." },
];

const ARSENAL = [
  { cat: "AWS Infrastructure", level: "Hands-on", tools: ["EC2", "ECS", "ECR", "ALB", "CloudFront", "VPC", "IAM", "S3", "RDS PostgreSQL", "Secrets Manager", "Lambda", "EventBridge", "CloudWatch", "Athena", "Amazon MSK", "IAM Identity Center"] },
  { cat: "Microsoft Cloud & Identity", level: "Hands-on", tools: ["Azure VMs", "Entra ID", "Intune", "Conditional Access", "Purview DLP", "Defender for Endpoint", "Sentinel", "LAPS", "BitLocker"] },
  { cat: "Containers & Orchestration", level: "Hands-on", tools: ["Docker", "Docker Compose", "ECS Task Definitions", "Sidecars & FireLens", "Consul", "ECR Image Builds", "ARM64 / Graviton"] },
  { cat: "CI/CD & Automation", level: "Hands-on", tools: ["Jenkins", "GitLab CI/CD", "GitLab Runner", "Ansible", "Ansible Semaphore", "Power Automate", "n8n", "Bash Scripting"] },
  { cat: "Infrastructure as Code", level: "Hands-on", tools: ["Terraform", "HCL", "AWS Provider", "Pulumi", "Launch Templates", "Golden Images"] },
  { cat: "Observability", level: "Hands-on", tools: ["Grafana", "Loki", "Prometheus", "Fluent Bit", "CloudWatch", "Uptime Kuma", "Node Exporter", "ECS Container Insights"] },
  { cat: "Security & Compliance", level: "Hands-on", tools: ["Wazuh", "Trivy", "Snyk", "OWASP ZAP", "Nessus", "SonarQube", "ClamAV", "Burp Suite", "Wireshark", "ISO 27001:2022", "PCI DSS v4.0", "SOC 2 Type II", "AWS FTR"] },
  { cat: "Data & Messaging", level: "Hands-on", tools: ["Kafka", "Debezium CDC", "Redis", "PostgreSQL", "MySQL", "SQLite", "Athena SQL", "Metabase", "CloudQuery"] },
  { cat: "Network & Access", level: "Hands-on", tools: ["FortiGate 80F", "FortiClient", "VPN", "Cloudflare DNS", "Nginx", "TLS", "Apache Guacamole", "Security Groups"] },
  { cat: "Languages & Scripting", level: "Hands-on", tools: ["Python", "Bash", "SQL", "YAML", "JavaScript", "Node.js", "FastAPI"] },
  { cat: "Systems, Lab & Learning", level: "Lab / POC", tools: ["Proxmox VE", "Talos Linux", "Kubernetes", "kind", "Helm", "Argo CD", "Go", "Java", "Icinga", "Twingate", "Ubuntu", "RHEL", "Arch", "Kali", "Neovim"] },
];

const LAB = [
  { status: "Learning / In progress", title: "Proxmox & Talos Kubernetes Homelab", body: "A non-HA cluster on Proxmox VE targeting one Talos control plane node and two workers, with VM templates, networking, talosctl, and Terraform for repeatable provisioning.", stack: "Proxmox VE · Talos Linux · Kubernetes · Terraform" },
  { status: "POC", title: "Autonomous Code Quality & Optimization Intelligence", body: "A multi-agent code analysis application pairing AST-oriented static checks with retrieval, confidence validation, and source attribution behind FastAPI, PostgreSQL, and Docker.", stack: "Python · FastAPI · PostgreSQL · Docker" },
  { status: "Partly built", title: "Ubuntu Application & DevOps Lab", body: "A small Ubuntu Server environment for container and Kubernetes practice using Docker, Twingate, kind, and Helm, with a planned stack of Jenkins, Argo CD, Grafana, and Prometheus.", stack: "Ubuntu · kind · Helm · Argo CD" },
  { status: "Hands-on practice", title: "Terraform AWS Compute Module", body: "A reusable Terraform configuration for an EC2 instance in an existing VPC and private subnet, with security group rules, encrypted gp3 storage, variables, outputs, and IMDSv2.", stack: "Terraform · HCL · AWS Provider" },
  { status: "Designed / Proposed", title: "Cross-Account EC2 Start/Stop Automation", body: "Centralized scheduled start and stop for EC2 instances across multiple AWS accounts, orchestrated through a management environment and cross-account role assumption to cut idle compute.", stack: "EC2 · IAM Roles · EventBridge" },
  { status: "Prototype", title: "AI-Assisted Downtime Log Summarization", body: "A local Ollama and n8n workflow that summarizes downtime logs to explore more consistent incident report preparation without sending operational data to a hosted model.", stack: "Ollama · n8n · Local LLM" },
];

const NOTES = [
  { h: "An ACTIVE container instance does not prove a task can be placed.", b: "A custom Ubuntu ECS host joined the Auto Scaling Group but never registered because the agent service was disabled in the image. Enabling and restarting it restored registration. A later deployment still sat in provisioning with pending tasks and no assigned container instance. Validate the whole path: boot, agent startup, registration, capacity provider association, placement constraints, subnet IP capacity, security groups, image pull, secret retrieval, and container health.", ev: "Evidence / ECS agent state, launch template, capacity provider, task placement" },
  { h: "Select the container by name, never by array index.", b: "The task definition holds an application container and a log router sidecar. Deployment scripting that assumed the first array element was the application mutated the wrong container image. Locating the container by name is a small change that removes a whole class of silent pipeline failure.", ev: "Evidence / Task definition revision diffs, pipeline deployment stage" },
  { h: "A traffic graph is one piece of evidence, not a root cause.", b: "During a production slowdown, request volume, target latency, status codes, target health, and service CPU and memory only made sense when correlated inside the same window. Two separate observation windows were recorded and are reported separately rather than merged into one baseline. Health check configuration and dependency latency contributed as much as raw volume.", ev: "Evidence / ALB access logs, Athena SQL, CloudWatch metrics" },
  { h: "If .env can reach the build context, assume it reached the image.", b: "A container packaging review found that .dockerignore did not exclude .env, so build context and resulting images could carry environment files. The durable fix is structural: secrets in Secrets Manager, task roles for cloud access, no static credentials in configuration, and least privilege per service, followed by verification of published artifacts and rotation where needed.", ev: "Evidence / Build context review, image history, secret rotation record" },
  { h: "The backup question is not whether it can be compressed.", b: "A storage review found a large live GitLab footprint alongside an older backup set holding several hundred gigabytes. The useful questions were which data is live, which is duplicated, which restore points are actually required, what daily AMI snapshots and lifecycle policies already cover, how quickly archived data must be restored, and what the total retrieval cost is.", ev: "Evidence / Live versus backup data comparison, snapshot lifecycle policy" },
  { h: "Roles and secret managers beat long-lived credentials.", b: "Runner authentication moved to instance-role-based AWS access in place of static keys. Application-level access moved to ECS task roles. Webhook URLs moved out of source into Secrets Manager with environment-driven selection. Every one of these removes a credential that would otherwise need rotation and audit.", ev: "Evidence / Runner auth model, task role policies, secret references" },
  { h: "Keep monitoring retention proportional to operational value.", b: "Replacing a licensed monitoring suite is not only a cost decision. Coverage, ownership, retention, alert routing, and who is paged at 3am all have to be answered before a tool is retired. The open-source path only wins if the alerts are as trustworthy as the ones it replaces.", ev: "Evidence / Alert signal inventory, routing matrix, retention policy" },
  { h: "Separate what is deployed from what is designed.", b: "Some of the work here is running in production, some is configured but not customer facing, some is a proof of concept, and some is an architecture on paper. Status labels are attached to every project on this site because the distinction is the difference between an engineer and a brochure.", ev: "Evidence / Status labels on every project entry" },
];

const EDUCATION = [{ org: "Amity University Lucknow", deg: "B.Tech, Computer Engineering", dates: "Sep 2020 – Jun 2024", note: "CGPA 8.27 / 10" }];
const CERTS = [
  { name: "SQLi Attacks", issuer: "EC-Council" },
  { name: "Docker Fundamentals", issuer: "Cantrill" },
  { name: "Introduction to Cybersecurity", issuer: "Cisco" },
  { name: "CCNA: Introduction to Networks", issuer: "Cisco" },
];

const RESUME_SUMMARY = "DevOps and DevSecOps engineer working across AWS and Azure infrastructure, container platforms, CI/CD automation, observability, and security-minded operations. Experience spans fintech security foundations and enterprise cloud and platform work, from endpoint and identity controls to ECS delivery workflows, production troubleshooting, and cloud cost optimization. I turn manual, fragile processes into repeatable systems using automation, role-based access, infrastructure as code, and evidence-driven monitoring.";

const RESUME_SKILLS = [
  { g: "Cloud & Infrastructure", v: "AWS (EC2, ECS, ECR, ALB, CloudFront, VPC, IAM, S3, RDS, MSK, Lambda, Athena, CloudWatch, Secrets Manager), Azure, GCP exposure, Cloudflare" },
  { g: "DevSecOps & Automation", v: "Jenkins, GitLab CI/CD, GitLab Runner, Docker, Ansible, Ansible Semaphore, Terraform, Pulumi, Power Automate, n8n" },
  { g: "Security & Compliance", v: "ISO 27001:2022, PCI DSS v4.0, SOC 2 Type II, RBI data localization, Intune, Entra ID, Defender EDR, Sentinel, Wazuh, Trivy, Snyk, OWASP ZAP, Nessus, SonarQube, Purview DLP, VAPT" },
  { g: "Observability", v: "Grafana, Loki, Prometheus, Fluent Bit, CloudWatch, Uptime Kuma, Node Exporter, ALB access log analysis" },
  { g: "Data & Messaging", v: "Amazon MSK, Kafka, Debezium, Redis, PostgreSQL, MySQL, SQLite, Athena SQL, Metabase" },
  { g: "Languages & Systems", v: "Python, Bash, SQL, YAML, JavaScript / Node.js, Java fundamentals, Go (learning), Linux (Ubuntu, RHEL, Amazon Linux, Arch, Kali)" },
];

const RESUME_JOBS = [
  {
    org: "NIIT Limited", role: "DevOps Engineer", dates: "Feb 2026 – Present", sub: "",
    bullets: [
      "Modernize and operate multi-cloud infrastructure across AWS and Azure covering 110+ VMs and 10+ enterprise applications, reducing reported Azure spend by approximately 60% and AWS spend by approximately 25% through rightsizing, consolidation, archival, and open-source replacements.",
      "Deploy and manage an ECS cluster for a Spring Boot microservice estate including auth, transaction, scheduler, and Debezium CDC services, integrating API gateway routing, Amazon MSK, Redis, and Consul, with delivery through Jenkins.",
      "Migrate source control and CI/CD from AWS CodeCommit and CodeBuild to self-hosted GitLab with GitLab Runners, integrating Trivy, SonarQube, and Snyk gates for container scanning, static analysis, and vulnerability detection.",
      "Replace a licensed monitoring stack with a centralized open-source observability platform using Grafana, Loki, Prometheus, Fluent Bit, and Uptime Kuma, with alert routing through AWS SNS, SendGrid, Microsoft Teams, and Telegram.",
      "Design and operate a containerized browser-based bastion using Apache Guacamole on Linux, migrating 50+ developers off legacy Windows bastion and VPN workflows and eliminating the associated licensing overhead.",
      "Containerize backend services with Docker, build GitLab CI/CD pipelines replacing manual deployment, and author infrastructure as code for a Next.js, Strapi, and Fastify platform using Pulumi and AWS ECS.",
      "Decommission 20 to 30 legacy servers and migrate managed Redis and database backup workloads onto existing infrastructure, reducing recurring cloud service cost.",
      "Investigate production performance using ALB access logs, Athena SQL, and service resource metrics, and resolve ECS host registration and task placement failures across bootstrap, agent health, capacity, and network layers.",
    ],
  },
  {
    org: "Castler", role: "Associate DevSecOps Engineer", dates: "Jul 2024 – Jan 2026",
    sub: "Progressed from a campus-hired Trainee Engineer role into DevSecOps responsibilities in a fintech environment under 250+ employees.",
    bullets: [
      "Implement Microsoft Intune organization-wide with 30+ Zero Trust policies and integrate SSO with Conditional Access across 10+ applications, covering 100+ endpoints and reducing credential sprawl.",
      "Deploy Microsoft Defender EDR, Sentinel SIEM, and XDR for unified threat detection, automated response, and cross-domain investigation, reducing incident detection and response time by approximately 60%.",
      "Design and implement Wazuh SIEM as the primary monitoring platform across production cloud resources (EC2, RDS, CloudWatch, CloudTrail) with 100+ custom alert rules and Grafana plus Prometheus dashboards.",
      "Manage ECS and Docker workloads, migrate CI/CD from Azure DevOps to Jenkins, and automate vulnerability scanning with Snyk and Trivy, reducing deployment time from 10 to 30 minutes down to 5 to 15 minutes.",
      "Author Ansible playbooks for OS and system hardening across Amazon Linux, RHEL 9, and Ubuntu 22 and 24, ensuring secure and consistent deployment.",
      "Lead cost optimization across AWS, Azure, GCP, Cloudflare, and Microsoft 365, achieving an approximately 87% reduction in Azure spend and 30%+ AWS savings.",
      "Complete RBI data localization compliance and lead technical preparation for PCI DSS v4.0, ISO/IEC 27001:2022, SOC 2 Type II, and external bank audits; run quarterly VAPT, BCP and DR drills, and org-wide security training.",
      "Centralize AWS multi-account governance with enforced tagging, IAM Identity Center SSO, and DNS routing; configure FortiGate 80F with dual ISP and VPN access.",
    ],
  },
];

const RESUME_PROJECTS = [
  { n: "Spring Boot Microservices Platform on ECS", d: "ECS cluster for auth, transaction, scheduler, and Debezium CDC services with API gateway, Amazon MSK, Redis, and Consul, delivered through Jenkins." },
  { n: "Event Backbone with MSK, Debezium & Redis", d: "Change data capture from PostgreSQL into Kafka topics with idempotent consumers, explicit offset commits, and a request path kept separate from the event path." },
  { n: "Autonomous Code Quality & Optimization System", d: "Multi-agent code analysis combining AST-oriented static checks, hybrid retrieval, confidence validation, and source attribution behind FastAPI, PostgreSQL, and Docker." },
  { n: "Proxmox & Talos Kubernetes Homelab", d: "Reproducible lab for VM provisioning, cluster lifecycle, and infrastructure as code using Proxmox VE, Talos Linux, Terraform, and talosctl." },
];

const RESUME_COMPLIANCE = [
  "ISO/IEC 27001:2022, PCI DSS v4.0, SOC 2 Type II technical preparation and control evidence",
  "RBI data localization compliance, technical ownership",
  "AWS Foundational Technical Review preparation and bank / customer audit responses",
  "Quarterly VAPT coordination, remediation tracking, BCP and DR drills",
  "Microsoft Purview DLP with custom sensitive information types",
  "Organization-wide security awareness training",
];

const RESUME_TOC = ["Summary", "Skills", "Experience", "Selected Projects", "Compliance & Assurance", "Education", "Certifications"];

const NAV = [
  { id: "work", label: "Work" },
  { id: "cases", label: "Case Files" },
  { id: "experience", label: "Experience" },
  { id: "compliance", label: "Compliance" },
  { id: "arsenal", label: "Arsenal" },
  { id: "lab", label: "Lab" },
  { id: "notes", label: "Notes" },
];

/* ============================== utilities =============================== */

function useReveal() {
  const reduce = useReducedMotion();
  return (delay = 0, y = 24) =>
    reduce ? {} : {
      initial: { opacity: 0, y },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true, amount: 0.12 },
      transition: { duration: 0.8, delay, ease: EASE },
    };
}

const wrap = (s, w = 96) => {
  const out = [];
  let cur = "";
  s.split(/\s+/).forEach((word) => {
    if ((cur + " " + word).trim().length > w) { out.push(cur.trim()); cur = word; }
    else cur += " " + word;
  });
  if (cur.trim()) out.push(cur.trim());
  return out.join("\n");
};
const indent = (s) => s.replace(/^/gm, "  ");

function resumeText() {
  const R = "=".repeat(78);
  const L = [];
  L.push(PROFILE.name.toUpperCase());
  L.push("DevSecOps & Platform Engineer");
  L.push(PROFILE.email + " | " + PROFILE.location);
  L.push("GitHub: " + PROFILE.github.handle + " | LinkedIn: " + PROFILE.linkedin.handle);
  L.push(R, "", "SUMMARY", "", indent(wrap(RESUME_SUMMARY)), "");
  L.push(R, "", "SKILLS", "");
  RESUME_SKILLS.forEach((s) => L.push(s.g + ":", indent(wrap(s.v, 74))));
  L.push("", R, "", "EXPERIENCE", "");
  RESUME_JOBS.forEach((j) => {
    L.push(j.org + " | " + j.role + " | " + j.dates);
    if (j.sub) L.push(wrap(j.sub, 78));
    j.bullets.forEach((b) => L.push(indent(wrap("* " + b, 76))));
    L.push("");
  });
  L.push(R, "", "SELECTED PROJECTS", "");
  RESUME_PROJECTS.forEach((p) => { L.push("* " + p.n); L.push(indent(wrap(p.d, 74))); });
  L.push("", R, "", "COMPLIANCE & ASSURANCE", "");
  RESUME_COMPLIANCE.forEach((c) => L.push(indent(wrap("* " + c, 76))));
  L.push("", R, "", "EDUCATION", "");
  EDUCATION.forEach((e) => L.push(e.org + " | " + e.deg + " | " + e.dates + " | " + e.note));
  L.push("", R, "", "CERTIFICATIONS", "");
  CERTS.forEach((c) => L.push("* " + c.name + " - " + c.issuer));
  L.push("", R);
  L.push("Updated " + PROFILE.updated + ". Figures are reported values from the referenced comparison windows.");
  return L.join("\n");
}

function resumeMarkdown() {
  const L = [];
  L.push("# " + PROFILE.name, "**DevSecOps & Platform Engineer**", "");
  L.push("`" + PROFILE.email + "` · " + PROFILE.location + " · [GitHub](" + PROFILE.github.url + ") · [LinkedIn](" + PROFILE.linkedin.url + ")", "");
  L.push("## Summary", RESUME_SUMMARY, "", "## Skills");
  RESUME_SKILLS.forEach((s) => L.push("- **" + s.g + ":** " + s.v));
  L.push("", "## Experience");
  RESUME_JOBS.forEach((j) => {
    L.push("### " + j.org + " — " + j.role, "`" + j.dates + "`", "");
    if (j.sub) L.push("_" + j.sub + "_", "");
    j.bullets.forEach((b) => L.push("- " + b));
    L.push("");
  });
  L.push("## Selected Projects");
  RESUME_PROJECTS.forEach((p) => L.push("- **" + p.n + "** — " + p.d));
  L.push("", "## Compliance & Assurance");
  RESUME_COMPLIANCE.forEach((c) => L.push("- " + c));
  L.push("", "## Education");
  EDUCATION.forEach((e) => L.push("- **" + e.org + "** — " + e.deg + ", " + e.dates + " (" + e.note + ")"));
  L.push("", "## Certifications");
  CERTS.forEach((c) => L.push("- " + c.name + " — " + c.issuer));
  L.push("", "---", "_Updated " + PROFILE.updated + ". Figures are reported values from the referenced comparison windows._");
  return L.join("\n");
}

function download(filename, content) {
  try {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    return true;
  } catch (e) { return false; }
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; }
  catch (e) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (e2) { return false; }
  }
}

/* ============================ diagram kit =============================== */

const DC = {
  fill: "rgba(226,232,240,0.035)", fillHot: "rgba(0,255,157,0.06)",
  stroke: "rgba(226,232,240,0.20)", soft: "rgba(226,232,240,0.13)",
  hot: "rgba(0,255,157,0.45)", paper: "#E2E8F0", muted: "#8B949E", accent: "#00FF9D",
};
const MONO = "'JetBrains Mono',ui-monospace,monospace";

function Bx({ x, y, w, h, label, hot, sub }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="3" fill={hot ? DC.fillHot : DC.fill}
        stroke={hot ? DC.hot : DC.stroke} strokeWidth="1" />
      <text x={x + 10} y={sub ? y + h / 2 - 1 : y + h / 2 + 3.4} fontFamily={MONO} fontSize="9.5"
        letterSpacing="0.08em" fill={hot ? DC.accent : DC.paper}>{label}</text>
      {sub ? (
        <text x={x + 10} y={y + h / 2 + 11} fontFamily={MONO} fontSize="8" letterSpacing="0.07em"
          fill={DC.muted}>{sub}</text>
      ) : null}
    </g>
  );
}
function Wr({ pts, hot, node }) {
  const d = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0] + "," + p[1]).join(" ");
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
      fill={tone === "accent" ? DC.accent : tone === "paper" ? DC.paper : DC.muted}>{children}</text>
  );
}

function DiagramMicro() {
  const svc = [["AUTH SERVICE", "SPRING BOOT"], ["TRANSACTION SERVICE", "SPRING BOOT"], ["SCHEDULER SERVICE", "SPRING BOOT"], ["DEBEZIUM CONNECT", "KAFKA CONNECT"], ["NOTIFICATION SERVICE", "SPRING BOOT"]];
  const infra = [["AMAZON MSK", "KAFKA TOPICS"], ["REDIS", "CACHE / STATE"], ["RDS POSTGRESQL", "SYSTEM OF RECORD"], ["CONSUL", "DISCOVERY / CONFIG"], ["S3", "ARCHIVE / EXPORTS"]];
  const ys = [138, 174, 210, 246, 282];
  return (
    <svg viewBox="0 0 560 400" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Spring Boot microservices on ECS">
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
      <Lb x={424} y={86} anchor="end">PUBLISH</Lb>
      <rect x={16} y={104} width={528} height={232} rx="3" fill="rgba(226,232,240,0.015)" stroke={DC.soft} strokeWidth="1" />
      <Lb x={28} y={124}>PRIVATE SUBNETS · ECS CLUSTER · SPRING BOOT ON ARM64</Lb>
      {ys.map((y, i) => (
        <g key={y}>
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
      <Lb x={16} y={364} tone="paper">JENKINS → ECR → NEW TASK DEFINITION REVISION → CONTROLLED DEPLOY</Lb>
      <Lb x={16} y={384}>CDC PATH: POSTGRESQL → DEBEZIUM → MSK TOPICS → IDEMPOTENT CONSUMERS</Lb>
    </svg>
  );
}

function DiagramStream() {
  const topics = ["auth.events", "txn.events", "cdc.outbox"];
  return (
    <svg viewBox="0 0 560 350" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Event backbone with MSK and Debezium">
      <Bx x={16} y={20} w={150} h={32} label="RDS POSTGRESQL" sub="WAL / LOGICAL REPL." />
      <Bx x={205} y={20} w={150} h={32} label="DEBEZIUM CONNECT" sub="WORKERS ON ECS" />
      <Bx x={394} y={20} w={150} h={32} label="AMAZON MSK" sub="MANAGED KAFKA" hot />
      <Wr pts={[[166, 36], [205, 36]]} node />
      <Wr pts={[[355, 36], [394, 36]]} node />
      <Wr pts={[[469, 52], [469, 66]]} />
      <rect x={394} y={66} width={150} height={84} rx="3" fill="rgba(226,232,240,0.02)" stroke={DC.soft} strokeWidth="1" />
      <Lb x={404} y={84}>TOPICS</Lb>
      {topics.map((t, i) => (
        <g key={t}>
          <rect x={404} y={92 + i * 18} width={130} height={14} rx="2" fill={DC.fill} stroke={DC.stroke} strokeWidth="1" />
          <text x={412} y={102 + i * 18} fontFamily={MONO} fontSize="8.5" letterSpacing="0.06em" fill={DC.paper}>{t}</text>
        </g>
      ))}
      <path d="M469,150 L469,164 L86,164 L86,178" stroke={DC.soft} strokeWidth="1" fill="none" />
      <path d="M280,164 L280,178" stroke={DC.soft} strokeWidth="1" fill="none" />
      <path d="M469,164 L469,178" stroke={DC.soft} strokeWidth="1" fill="none" />
      <rect x={84} y={162} width="4" height="4" fill={DC.accent} />
      <Bx x={16} y={178} w={150} h={32} label="TRANSACTION SVC" sub="CONSUMER" />
      <Bx x={205} y={178} w={150} h={32} label="SCHEDULER SVC" sub="CONSUMER" />
      <Bx x={394} y={178} w={150} h={32} label="ARCHIVE / S3" sub="SINK" />
      <Wr pts={[[86, 210], [86, 250]]} node />
      <Wr pts={[[280, 210], [280, 250]]} />
      <Wr pts={[[469, 210], [469, 250]]} />
      <Bx x={16} y={250} w={150} h={32} label="REDIS" sub="HOT LOOKUPS" />
      <Bx x={205} y={250} w={150} h={32} label="CONSUL" sub="DISCOVERY / CONFIG" />
      <Bx x={394} y={250} w={150} h={32} label="API GATEWAY" sub="PUBLIC PATH" hot />
      <Lb x={16} y={314} tone="paper">OFFSET COMMITS + RETRY · IDEMPOTENT CONSUMERS · PARTITION KEY BY AGGREGATE ID</Lb>
      <Lb x={16} y={334}>THE EVENT PATH IS DELIBERATELY SEPARATE FROM THE SYNCHRONOUS REQUEST PATH</Lb>
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
      <rect x={16} y={124} width={488} height={212} rx="3" fill="rgba(226,232,240,0.015)" stroke={DC.soft} strokeWidth="1" />
      <Lb x={28} y={144}>PRIVATE SUBNETS · ECS ON EC2 · ARM64 GRAVITON</Lb>
      {rows.map((r) => (
        <g key={r.y}>
          <Bx x={40} y={r.y} w={150} h={30} label={r.l} />
          <Bx x={330} y={r.y} w={150} h={30} label={r.r} />
          <Wr pts={[[190, r.y + 15], [330, r.y + 15]]} node />
        </g>
      ))}
      <Lb x={40} y={300} tone="paper">LOGS → FIRELENS / FLUENT BIT → LOKI</Lb>
      <Lb x={40} y={318}>TASK ROLES FOR APP ACCESS · SECRETS OUTSIDE ENV CONFIG</Lb>
    </svg>
  );
}

const CICD = [
  [["stages:", "k"]],
  [["  - ", "d"], ["build", "v"]],
  [["  - ", "d"], ["publish", "v"]],
  [["  - ", "d"], ["deploy", "v"]],
  [[]],
  [["publish:", "k"]],
  [["  image: ", "d"], ["docker:27", "v"]],
  [["  script:", "d"]],
  [["    - ", "d"], ["docker build --platform linux/arm64 \\", "v"]],
  [["        -t ", "v"], ["\"$REG/$SVC:$CI_COMMIT_SHA\"", "v"], [" .", "v"]],
  [["    - ", "d"], ["docker push ", "v"], ["\"$REG/$SVC:$CI_COMMIT_SHA\"", "v"]],
  [[]],
  [["deploy:", "k"]],
  [["  stage: ", "d"], ["deploy", "v"]],
  [["  when: ", "d"], ["manual", "a"], ["    # controlled release gate", "c"]],
  [["  script:", "d"]],
  [["    - ", "d"], ["./scripts/register-task-def.sh", "v"]],
  [["    - ", "d"], ["./scripts/update-ecs-service.sh", "v"]],
  [[]],
  [["# select the app container by name, not by array index", "c"]],
  [["# runner auth via EC2 instance role, no static keys", "c"]],
];
function SnippetCICD() {
  return (
    <pre className="snippet">
      {CICD.map((segs, i) => (
        <div key={i}>
          <span className="sn-num">{String(i + 1).padStart(2, "0")}</span>
          {segs.map((s, j) => <span key={j} className={"sn-" + s[1]}>{s[0]}</span>)}
        </div>
      ))}
    </pre>
  );
}

function DiagramIdentity() {
  const chips = ["BITLOCKER", "DEFENDER", "LAPS", "WEB FILTER", "MEDIA CTRL"];
  return (
    <svg viewBox="0 0 520 360" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Endpoint and identity foundation">
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
      <rect x={30} y={254} width={460} height={88} rx="3" fill="rgba(226,232,240,0.02)" stroke={DC.soft} strokeWidth="1" />
      <Lb x={44} y={276} tone="paper">MICROSOFT INTUNE · 30+ BASELINES</Lb>
      {chips.map((c, i) => (
        <g key={c}>
          <rect x={44 + i * 90} y={290} width={82} height={26} rx="3" fill={DC.fill} stroke={DC.stroke} strokeWidth="1" />
          <text x={44 + i * 90 + 41} y={307} textAnchor="middle" fontFamily={MONO} fontSize="8" letterSpacing="0.06em" fill={DC.paper}>{c}</text>
        </g>
      ))}
      <Lb x={30} y={356}>PRIVILEGED ACCESS CONTROLS · AUDITABLE, CENTRALLY APPLIED POLICY</Lb>
    </svg>
  );
}

const TRAFFIC = [1500, 1700, 1600, 1900, 1750, 1600, 10400, 2000, 1800, 1650, 1900, 1700, 1600, 1850, 1750, 1600];
function ChartIncident() {
  const base = 220, top = 40, max = 11000;
  const sc = (v) => base - (v / max) * (base - top);
  return (
    <svg viewBox="0 0 520 300" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Request volume during the incident window">
      {[10000, 5000, 0].map((v) => (
        <g key={v}>
          <line x1={40} y1={sc(v)} x2={500} y2={sc(v)} stroke={DC.soft} strokeWidth="1" />
          <Lb x={32} y={sc(v) + 3.5} anchor="end">{v === 0 ? "0" : v / 1000 + "K"}</Lb>
        </g>
      ))}
      <rect x={40} y={sc(2000)} width={460} height={sc(1500) - sc(2000)} fill="rgba(0,255,157,0.07)" />
      <Lb x={44} y={sc(2000) - 7} tone="accent">TYPICAL 1.5K TO 2K REQ/MIN</Lb>
      {TRAFFIC.map((v, i) => (
        <rect key={i} x={44 + i * 28} y={sc(v)} width={18} height={base - sc(v)}
          fill={v > 5000 ? DC.accent : "rgba(226,232,240,0.24)"} />
      ))}
      <Wr pts={[[215, sc(10400) - 6], [215, 24], [300, 24]]} hot />
      <Lb x={306} y={27} tone="paper">SPIKE ABOVE 10K REQ/MIN</Lb>
      <Lb x={44} y={250}>WINDOW A · REQUESTS PER MINUTE · ALB ACCESS LOGS</Lb>
      <Lb x={44} y={270}>502 RATE, TARGET LATENCY, AND HEALTH CHECKS CORRELATED IN ATHENA SQL</Lb>
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
    <svg viewBox="0 0 560 252" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Layered control stack"
      style={{ width: "100%", height: "auto" }}>
      <line x1={5} y1={8} x2={5} y2={238} stroke={DC.soft} strokeWidth="1" />
      {LAYERS.map((l, i) => {
        const y = 8 + i * 33;
        const last = i === LAYERS.length - 1;
        return (
          <g key={l[0]}>
            <rect x={14} y={y} width={540} height={28} rx="3" fill={last ? DC.fillHot : DC.fill}
              stroke={last ? DC.hot : DC.stroke} strokeWidth="1" />
            <rect x={1} y={y + 12} width={7} height={4} fill={last ? DC.accent : DC.muted} />
            <text x={26} y={y + 18} fontFamily={MONO} fontSize="9.5" letterSpacing="0.09em"
              fill={last ? DC.accent : DC.paper}>{l[0]}</text>
            <text x={546} y={y + 18} textAnchor="end" fontFamily={MONO} fontSize="8.5" letterSpacing="0.06em"
              fill={DC.muted}>{l[1]}</text>
          </g>
        );
      })}
    </svg>
  );
}

const ART = {
  micro: DiagramMicro, stream: DiagramStream, ecs: DiagramECS,
  cicd: SnippetCICD, identity: DiagramIdentity, incident: ChartIncident,
};

/* ============================== sections ================================ */

function Nav({ active, onOpenResume }) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 80);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const all = [...NAV, { id: "resume", label: "Resume" }, { id: "contact", label: "Contact" }];
  return (
    <header className={cx("nav", (solid || open) && "solid")}>
      <div className="shell nav-in">
        <a href="#top" className="wordmark" onClick={() => setOpen(false)}>{PROFILE.wordmark}<i /></a>
        <nav className="nav-links">
          {NAV.slice(0, 5).map((l) => (
            <a key={l.id} href={"#" + l.id} className={cx("nav-link meta", active === l.id && "on")}>{l.label}</a>
          ))}
          <button className="nav-cta meta" onClick={onOpenResume} type="button">
            Resume <Ico n="upRight" s={13} />
          </button>
        </nav>
        <button className={cx("burger", open && "open")} onClick={() => setOpen((v) => !v)}
          aria-label="Menu" aria-expanded={open}><span /></button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div className="nav-drawer" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}>
            <div className="shell">
              {all.map((l, i) => (
                <a key={l.id} href={"#" + l.id} className="meta" onClick={() => setOpen(false)}>
                  <span className={active === l.id ? "accent" : undefined}>{l.label}</span>
                  <span className="dim">{String(i).padStart(2, "0")}</span>
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
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
    initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 },
    transition: { duration: 1, delay: d, ease: EASE },
  };
  return (
    <section className="hero" id="top">
      <div className="shell hero-in">
        <motion.div className="meta" {...rise(0.05)}>{HERO.meta}</motion.div>
        <div className="hero-grid">
          <div>
            <h1 className="display">
              <motion.span className="ln" {...rise(0.12)}>{HERO.lineA}</motion.span>
              <motion.span className="ln accent" {...rise(0.24)}>{HERO.lineB}</motion.span>
            </h1>
            <motion.p className="hero-sub" {...rise(0.4)}>{HERO.sub}</motion.p>
          </div>
          <motion.aside className="hero-rail" {...rise(0.55)}>
            {HERO.rail.map((r) => (
              <div key={r.k}>
                <span className="meta dim">{r.k}</span>
                <div className="rail-role">{r.role}</div>
                <div className="rail-org">{r.org}</div>
              </div>
            ))}
          </motion.aside>
        </div>
        <motion.div className="hero-foot" {...rise(0.7)}>
          <span className="meta scroll-cue">Scroll <Ico n="down" s={13} sw={1.6} /></span>
          <span className="meta dim">Press R for resume · Updated {PROFILE.updated}</span>
        </motion.div>
      </div>
    </section>
  );
}

function Signals() {
  const reveal = useReveal();
  return (
    <section className="signals">
      <div className="shell">
        <motion.div {...reveal(0)}>
          <span className="meta">Reported outcomes</span>
          <p className="meta dim plain" style={{ margin: "8px 0 0", maxWidth: "74ch", lineHeight: 1.6 }}>
            Figures below are reported values from referenced comparison windows, not independently audited metrics. The qualifier is kept intentionally.
          </p>
        </motion.div>
        <div className="sig-grid">
          {SIGNALS.map((s, i) => (
            <motion.div key={s.l} {...reveal(0.03 + i * 0.02)}>
              <div className="sig-v">{s.v}</div>
              <div className="meta sig-l">{s.l}</div>
            </motion.div>
          ))}
        </div>
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
        <Head label="000/ Selected Work" right={String(WORK.length).padStart(2, "0") + " Projects · Sanitized"} reveal={reveal} />
        <div className="work-grid">
          <motion.div className="work-list" {...reveal(0.05)}>
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
                  <span className="work-tags">
                    <span className={cx("tag", w.status === "PRODUCTION" && "hot")}>{w.status}</span>
                    {w.tech.split(",").map((t) => <span className="tag" key={t}>{t.trim()}</span>)}
                  </span>
                </span>
              </button>
            ))}
          </motion.div>

          <motion.div className="work-panel" {...reveal(0.1)}>
            <AnimatePresence initial={false}>
              <motion.div key={active} className="panel-in"
                initial={reduce ? false : { opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: reduce ? 0 : 0.2, ease: EASE }}>
                <div className="panel-top">
                  <span className="meta">{p.n} / {p.kind}</span>
                  <span className={cx("badge", p.badge)}>{p.status}</span>
                </div>
                <div className="panel-art"><ArtC /></div>
                <p className="panel-copy">{p.copy}</p>
                <div className="panel-foot">
                  <span className="meta dim">{p.tech}</span>
                  <span className="meta dim">Index {p.n} of {String(WORK.length).padStart(2, "0")}</span>
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
    <section className="section" id="cases">
      <div className="shell">
        <Head label="001/ Case Files" right="Context · Problem · Role · Outcome · Lessons" reveal={reveal} />
        <motion.p className="sec-lead" {...reveal(0.04)}>
          Three pieces of work written up in full, using the same structure for each: what the system was, what broke or was missing, what I owned, how it was built, what made it hard, and what changed in my approach. Identifiers, account details, and proprietary configuration are omitted.
        </motion.p>
        <div>
          {CASES.map((c, i) => {
            const isOpen = open === c.id;
            return (
              <motion.div className="case" key={c.id} {...reveal(i * 0.05)}>
                <button className="case-head" onClick={() => setOpen(isOpen ? null : c.id)} aria-expanded={isOpen} type="button">
                  <span className="meta accent">{c.id}</span>
                  <span>
                    <h3 className="case-title">{c.title}</h3>
                    <span className="meta dim plain" style={{ display: "block", marginTop: 8 }}>{c.summary}</span>
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span className={cx("badge", c.status === "PRODUCTION" && "hot")}>{c.status}</span>
                    <Ico n="right" s={17} sw={1.6} />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div className="case-body" initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}>
                      <div className="case-in">
                        <span />
                        <div>
                          <div className="case-meta">
                            <span className="tag">Stack</span>
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
    <section className="section surface-sec">
      <div className="shell">
        <motion.div className="phil" {...reveal(0)}>
          <span className="meta">002/ Philosophy</span>
          <p>
            I approach infrastructure <span className="accent">as a system rather than a collection of consoles</span>: build repeatable hosts and pipelines, keep access and secrets explicit, instrument services so failures can be investigated, and measure cost and operational impact. I clearly separate production work from experiments and ongoing designs.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function Experience() {
  const reveal = useReveal();
  return (
    <section className="section" id="experience">
      <div className="shell">
        <Head label="003/ Experience" right="02 Employers · 01 Independent Track" reveal={reveal} />
        <div className="exp">
          {EXPERIENCE.map((e, i) => (
            <motion.article className="exp-item" key={e.org} {...reveal(i * 0.06)}>
              <div>
                <span className="meta dim">{e.n}</span>
                <h3 className="exp-org">{e.org}</h3>
                <div className="exp-role">{e.role}</div>
                <div className="meta" style={{ marginTop: 7 }}>{e.dates}</div>
                <div className="meta exp-scope plain">{e.scope}</div>
              </div>
              <div>
                {e.groups.map((g) => (
                  <div className="grp" key={g.label}>
                    <span className="meta accent">{g.label}</span>
                    <ul>
                      {g.bullets.map((b) => <li key={b.slice(0, 30)}><i /><span>{b}</span></li>)}
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
  const rows = useMemo(() => (f === "ALL" ? INDEX : INDEX.filter((r) => r.status === f)), [f]);
  return (
    <section className="section" id="index">
      <div className="shell">
        <Head label="004/ Project Index"
          right={String(rows.length).padStart(2, "0") + " / " + String(INDEX.length).padStart(2, "0") + " Entries"}
          reveal={reveal} />
        <motion.div className="filters" {...reveal(0.04)}>
          {FILTERS.map((x) => (
            <button key={x} type="button" className={cx("chip", f === x && "on")} onClick={() => setF(x)}>{x}</button>
          ))}
        </motion.div>
        <div>
          <div className="pi-row pi-head">
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
                transition={{ duration: 0.22, ease: EASE }}>
                <span className="meta dim">{r.n}</span>
                <span className="pi-name">{r.name}</span>
                <span className="meta pi-dom">{r.domain}</span>
                <span className="pi-stack">{r.stack}</span>
                <span className={cx("st", r.status)}>{r.status}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function Compliance() {
  const reveal = useReveal();
  return (
    <section className="section surface-sec" id="compliance">
      <div className="shell">
        <Head label="005/ Compliance & Assurance" right="Controls · Evidence · Ownership" reveal={reveal} />
        <motion.p className="sec-lead" {...reveal(0.04)}>{COMPLIANCE_LEAD}</motion.p>
        <motion.div className="stack-wrap" {...reveal(0.08)}>
          <span className="meta dim">Control stack / layered view</span>
          <div style={{ marginTop: 16 }}><ControlStack /></div>
        </motion.div>
        <div className="cmp-grid">
          {COMPLIANCE.map((c, i) => (
            <motion.div className="cmp-row" key={c.name} {...reveal(0.02 + i * 0.02)}>
              <span className="cmp-name">{c.name}</span>
              <span className="meta accent" style={{ fontSize: 10.5, whiteSpace: "nowrap" }}>{c.status}</span>
              <p className="cmp-detail">{c.detail}</p>
            </motion.div>
          ))}
        </div>
        <motion.p className="scope-note" {...reveal(0.1)}>
          Scope note / Wording is kept deliberately precise. Where I built and operated the control, it says implemented or operated. Where I contributed technical evidence for a programme owned by the business, it says supported or evidence prepared. No organization-wide certification is claimed as solely owned.
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
        <Head label="006/ Arsenal" right="Evidence Map · Not A Logo Grid" reveal={reveal} />
        <motion.div className="legend" {...reveal(0.04)}>
          <span className="meta"><span className="dot hands" style={{ marginRight: 9 }} />Hands-on</span>
          <span className="meta"><span className="dot" style={{ marginRight: 9 }} />Lab / POC</span>
          <span className="meta dim plain">Each tool is attached to work described elsewhere on this page.</span>
        </motion.div>
        <div>
          {ARSENAL.map((row, i) => (
            <motion.div className="ar-row" key={row.cat} {...reveal(i * 0.04)}>
              <div>
                <div className="meta paper">{row.cat}</div>
                <div className="meta dim" style={{ marginTop: 7 }}>{row.level}</div>
              </div>
              <div className="ar-tools">
                {row.tools.map((t) => (
                  <span className="ar-tool" key={t}>
                    <span className={cx("dot", row.level === "Hands-on" && "hands")} />{t}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Lab() {
  const reveal = useReveal();
  return (
    <section className="section surface-sec" id="lab">
      <div className="shell">
        <Head label="007/ Exploration" right="Personal · Not Employer Work" reveal={reveal} />
        <motion.p className="sec-lead" {...reveal(0.04)}>
          Building a reproducible Proxmox/Talos Kubernetes lab to practice VM provisioning and infrastructure as code. Additionally developing a multi-agent code-analysis application combining AST-oriented checks and retrieval behind a FastAPI interface. Everything here is labelled POC, design, or learning, and is kept separate from professional deliverables.
        </motion.p>
        <div className="lab-grid">
          {LAB.map((c, i) => (
            <motion.article className="lab-card" key={c.title} {...reveal(0.05 + i * 0.05)}>
              <span className="meta">{c.status}</span>
              <h3 className="lab-title">{c.title}</h3>
              <p className="lab-body">{c.body}</p>
              <span className="meta dim plain" style={{ marginTop: "auto", paddingTop: 8 }}>{c.stack}</span>
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
        <Head label="008/ Field Notes" right="Lessons From Production Work" reveal={reveal} />
        <div>
          {NOTES.map((n, i) => (
            <motion.article className="note" key={n.h} {...reveal(i * 0.04)}>
              <div>
                <span className="meta dim">{String(i + 1).padStart(2, "0")}</span>
                <div className="meta accent" style={{ marginTop: 7 }}>Lesson</div>
              </div>
              <div>
                <h3 className="note-h">{n.h}</h3>
                <p className="note-b">{n.b}</p>
                <div className="meta note-ev plain">{n.ev}</div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Credentials({ onTxt }) {
  const reveal = useReveal();
  const links = [
    { label: PROFILE.github.label, handle: PROFILE.github.handle, url: PROFILE.github.url },
    { label: PROFILE.linkedin.label, handle: PROFILE.linkedin.handle, url: PROFILE.linkedin.url },
    ...PROFILE.elsewhere,
  ];
  return (
    <section className="section" id="credentials" style={{ paddingTop: 0 }}>
      <div className="shell">
        <Head label="009/ Credentials" right="Education · Certifications · Elsewhere" reveal={reveal} />
        <div className="cred">
          <motion.div {...reveal(0.04)}>
            <span className="meta dim">Education</span>
            {EDUCATION.map((e) => (
              <div className="cred-item" key={e.org}>
                <div className="meta">{e.dates}</div>
                <h3 className="cred-t">{e.org}</h3>
                <div className="meta" style={{ marginTop: 6 }}>{e.deg}</div>
                <div className="meta dim" style={{ marginTop: 5 }}>{e.note}</div>
              </div>
            ))}
            <span className="meta dim" style={{ display: "block", marginTop: 22 }}>Elsewhere</span>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 11 }}>
              {links.map((l) => (
                <a key={l.label + l.url} href={l.url} target="_blank" rel="noreferrer noopener" className="meta link-row">
                  <span className="accent">{l.label}</span>
                  <span className="dim">/ {l.handle}</span>
                  <Ico n="upRight" s={12} />
                </a>
              ))}
            </div>
          </motion.div>

          <motion.div {...reveal(0.09)}>
            <span className="meta dim">Certifications</span>
            <div style={{ marginTop: 14 }}>
              {CERTS.map((c) => (
                <div className="cert" key={c.name}>
                  <span className="cert-t">{c.name}</span>
                  <span className="meta dim">{c.issuer}</span>
                </div>
              ))}
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
    <section className="section" id="resume" style={{ paddingTop: 0 }}>
      <div className="shell">
        <motion.div className="res-band" {...reveal(0)}>
          <div>
            <span className="meta">010/ Resume</span>
            <h2 className="res-h">
              The resume is built into the site.
              <span className="accent" style={{ display: "block" }}>Read it here, or print it to PDF.</span>
            </h2>
            <p style={{ margin: "18px 0 0", maxWidth: "54ch", fontWeight: 300, fontSize: 15.5, lineHeight: 1.7, color: "rgba(226,232,240,.78)" }}>
              No gated download, no stale attachment. The document renders as a print-optimized sheet, exports as plain text for applicant tracking systems.
            </p>
            <div className="btn-row">
              <button className="btn solid" type="button" onClick={onOpen}><Ico n="eye" /> View resume</button>
              <button className="btn" type="button" onClick={onPdf}><Ico n="printer" /> Download PDF</button>
              <button className="btn" type="button" onClick={onTxt}><Ico n="file" /> Download TXT</button>
            </div>
          </div>
          <div className="res-toc">
            <span className="meta dim">Contents</span>
            {RESUME_TOC.map((t, i) => (
              <span className="meta" key={t} style={{ display: "flex", gap: 12 }}>
                <span className="dim">{String(i + 1).padStart(2, "0")}</span> {t}
              </span>
            ))}
            <span className="meta dim" style={{ marginTop: 10 }}>Shortcut / press R anywhere</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Contact() {
  const reduce = useReducedMotion();
  return (
    <section className="section" id="contact" style={{ paddingTop: 0 }}>
      <div className="shell">
        <motion.div className="contact"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.8, ease: EASE }}>
          <div className="contact-in">
            <div style={{ minWidth: 0 }}>
              <span className="meta">011/ Contact</span>
              <div style={{ marginTop: 18 }}>
                <a className="contact-mail" href={"mailto:" + PROFILE.email}>{PROFILE.email}</a>
              </div>
            </div>
            <div className="contact-links">
              <a href={PROFILE.github.url} target="_blank" rel="noreferrer noopener">GitHub <Ico n="upRight" /></a>
              <a href={PROFILE.linkedin.url} target="_blank" rel="noreferrer noopener">LinkedIn <Ico n="upRight" /></a>
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
        <div className="foot-markwrap"><div className="foot-mark">{PROFILE.wordmark}</div></div>
        <div className="foot-end">
          <span className="meta dim">{PROFILE.wordmark} / {HERO.meta}</span>
          <span className="meta dim">React · Vite · Tailwind · Motion · Vercel</span>
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
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.a href="#top" className="totop" aria-label="Back to top"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}>
          <Ico n="up" s={15} sw={1.7} />
        </motion.a>
      )}
    </AnimatePresence>
  );
}

/* ============================ resume overlay ============================ */

function ResumeLayer({ open, onClose, onPdf, onTxt, onMd, toast }) {
  const closeRef = useRef(null);
  useEffect(() => {
    if (open && closeRef.current) closeRef.current.focus();
  }, [open]);
  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div className="res-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }} role="dialog" aria-modal="true" aria-label="Resume">
            <div className="res-bar no-print">
              <button className="btn" onClick={onMd} type="button"><Ico n="copy" /> Copy MD</button>
              <button className="btn" onClick={onTxt} type="button"><Ico n="file" /> TXT</button>
              <button className="btn solid" onClick={onPdf} type="button"><Ico n="printer" /> Download PDF</button>
              <button className="btn" onClick={onClose} type="button" ref={closeRef} aria-label="Close resume">
                <Ico n="close" s={15} /> Close
              </button>
            </div>
            <motion.article className="res-sheet" id="resume-sheet"
              initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 12, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}>
              <header>
                <h1>{PROFILE.name}</h1>
                <div className="res-role">DevSecOps &amp; Platform Engineer · {PROFILE.location}</div>
                <div className="res-links">
                  <a href={"mailto:" + PROFILE.email}>{PROFILE.email}</a>
                  <a href={PROFILE.github.url}>github.com/{PROFILE.github.handle}</a>
                  <a href={PROFILE.linkedin.url}>linkedin.com/in/{PROFILE.linkedin.handle}</a>
                  <a href={PROFILE.site}>{PROFILE.site.replace("https://", "")}</a>
                  <span>leetcode / hackerrank / gfg: ryuga__</span>
                </div>
              </header>

              <section className="res-sec">
                <h2>Summary</h2>
                <p style={{ margin: 0, fontSize: 12.9 }}>{RESUME_SUMMARY}</p>
              </section>

              <section className="res-sec">
                <h2>Skills</h2>
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
                    {j.sub ? <div className="res-job-r" style={{ marginTop: 4 }}>{j.sub}</div> : null}
                    <ul>{j.bullets.map((b) => <li key={b.slice(0, 32)}>{b}</li>)}</ul>
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
                <ul>{RESUME_COMPLIANCE.map((c) => <li key={c.slice(0, 26)}>{c}</li>)}</ul>
              </section>

              <section className="res-sec">
                <div className="res-2col">
                  <div>
                    <h2>Education</h2>
                    {EDUCATION.map((e) => (
                      <div className="res-job" key={e.org}>
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
                Updated {PROFILE.updated} · Cost and efficiency figures are reported values from the referenced comparison windows and are not independently audited.
              </p>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast ? (
          <motion.div className="toast no-print" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.25, ease: EASE }}>
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

  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      const typing = t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName);
      if (e.key === "Escape") setOpen(false);
      if (!typing && !e.metaKey && !e.ctrlKey && !e.altKey && (e.key === "r" || e.key === "R")) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      lastFocus.current = document.activeElement;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      if (lastFocus.current && lastFocus.current.focus) lastFocus.current.focus();
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const flash = (m) => { setToast(m); window.setTimeout(() => setToast(""), 2200); };

  const pdf = () => {
    if (RESUME_PDF) { window.open(RESUME_PDF, "_blank", "noopener"); return; }
    if (!open) { setOpen(true); window.setTimeout(() => window.print(), 450); }
    else window.print();
  };
  const txt = () => flash(download(PROFILE.wordmark + "-resume.txt", resumeText()) ? "TXT downloaded" : "Download failed");
  const md = async () => flash((await copyText(resumeMarkdown())) ? "Markdown copied" : "Copy failed");

  return { open, setOpen, pdf, txt, md, toast };
}

/* ================================ app =================================== */

export default function App() {
  const [active, setActive] = useState("");
  const res = useResume();

  useEffect(() => {
    const ids = [...NAV.map((n) => n.id), "resume", "contact"];
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis) setActive(vis.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.15, 0.5] }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <style>{STYLES}</style>
      <div className="site-root">
        <Nav active={active} onOpenResume={() => res.setOpen(true)} />
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
          <Credentials onTxt={res.txt} />
          <ResumeBand onOpen={() => res.setOpen(true)} onPdf={res.pdf} onTxt={res.txt} />
          <Contact />
        </main>
        <Footer />
        <ToTop />
      </div>
      <ResumeLayer open={res.open} onClose={() => res.setOpen(false)}
        onPdf={res.pdf} onTxt={res.txt} onMd={res.md} toast={res.toast} />
    </>
  );
}

