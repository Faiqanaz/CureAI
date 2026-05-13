import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";

// ─── Styles ──────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeUp    { from{ opacity:0; transform:translateY(28px); } to{ opacity:1; transform:translateY(0); } }
  @keyframes fadeIn    { from{ opacity:0; } to{ opacity:1; } }
  @keyframes drift     { 0%,100%{ transform:translateY(0) rotate(0deg); } 50%{ transform:translateY(-20px) rotate(4deg); } }
  @keyframes drift2    { 0%,100%{ transform:translateY(0) rotate(0deg); } 50%{ transform:translateY(16px) rotate(-5deg); } }
  @keyframes drift3    { 0%,100%{ transform:translateY(0) rotate(0deg); } 50%{ transform:translateY(-12px) rotate(8deg); } }
  @keyframes float     { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-10px); } }
  @keyframes pulse     { 0%,100%{ opacity:.6; transform:scale(1); } 50%{ opacity:1; transform:scale(1.04); } }
  @keyframes slideRight{ from{ width:0; } to{ width:56px; } }
  @keyframes navDown   { from{ opacity:0; transform:translateY(-16px); } to{ opacity:1; transform:translateY(0); } }
  @keyframes cardIn    { from{ opacity:0; transform:translateY(32px) scale(.97); } to{ opacity:1; transform:translateY(0) scale(1); } }
  @keyframes exitPage  { from{ opacity:1; transform:scale(1); } to{ opacity:0; transform:scale(1.03) translateY(-10px); } }
  @keyframes marquee   { from{ transform:translateX(0); } to{ transform:translateX(-50%); } }
  @keyframes popUp     { from{ opacity:0; transform:translateY(20px) scale(.95); } to{ opacity:1; transform:translateY(0) scale(1); } }
  @keyframes msgIn     { from{ opacity:0; transform:translateY(8px); } to{ opacity:1; transform:translateY(0); } }
  @keyframes typingDot { 0%,80%,100%{ transform:scale(0); opacity:.3; } 40%{ transform:scale(1); opacity:1; } }
  @keyframes overlayIn { from{ opacity:0; } to{ opacity:1; } }
  @keyframes alertIn   { from{ opacity:0; transform:scale(.88); } to{ opacity:1; transform:scale(1); } }
  @keyframes fabGlow   { 0%,100%{ box-shadow:0 8px 32px rgba(56,182,255,.45); } 50%{ box-shadow:0 8px 52px rgba(56,182,255,.75),0 0 0 8px rgba(56,182,255,.1); } }
  @keyframes streamIn  { from{ opacity:0; } to{ opacity:1; } }

  .page-exit { animation: exitPage .35s cubic-bezier(.4,0,.2,1) both !important; pointer-events:none; }
  html { scroll-behavior: smooth; }
  body,.la-root { font-family:'Sora',sans-serif; background:#050d1a; color:#fff; min-height:100vh; overflow-x:hidden; }

  .la-grid { position:fixed; inset:0; z-index:0; pointer-events:none;
    background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);
    background-size:52px 52px; }
  .la-orb  { position:fixed; border-radius:50%; filter:blur(100px); pointer-events:none; z-index:0; }
  .la-orb1 { width:560px; height:560px; background:radial-gradient(circle,rgba(56,182,255,.13) 0%,transparent 70%); top:-180px; left:-120px; animation:drift 11s ease-in-out infinite; }
  .la-orb2 { width:420px; height:420px; background:radial-gradient(circle,rgba(99,102,241,.12) 0%,transparent 70%); bottom:-100px; right:-80px; animation:drift2 13s ease-in-out infinite; }
  .la-orb3 { width:300px; height:300px; background:radial-gradient(circle,rgba(56,240,180,.08) 0%,transparent 70%); top:45%; left:55%; animation:drift3 9s ease-in-out infinite; }

  .la-nav { position:fixed; top:0; left:0; right:0; z-index:100; animation:navDown .5s .1s both;
    background:rgba(5,13,26,.78); backdrop-filter:blur(18px); border-bottom:1px solid rgba(255,255,255,.06); }
  .la-nav-inner { max-width:1200px; margin:0 auto; padding:0 28px; height:68px; display:flex; align-items:center; justify-content:space-between; }
  .la-nav-logo  { display:flex; align-items:center; gap:11px; text-decoration:none; cursor:pointer; }
  .la-nav-icon  { width:40px; height:40px; border-radius:12px; background:linear-gradient(135deg,#38b6ff,#6366f1); display:flex; align-items:center; justify-content:center; font-size:18px; box-shadow:0 6px 20px rgba(56,182,255,.35); flex-shrink:0; }
  .la-nav-name  { font-family:'Instrument Serif',serif; font-size:23px; color:#fff; }
  .la-nav-links { display:flex; align-items:center; gap:8px; }
  .la-nav-ghost { padding:8px 18px; border-radius:10px; border:1.5px solid rgba(255,255,255,.1); background:transparent; color:rgba(255,255,255,.6); font-size:13.5px; font-family:'Sora',sans-serif; font-weight:500; cursor:pointer; transition:all .2s; text-decoration:none; }
  .la-nav-ghost:hover { border-color:rgba(255,255,255,.25); color:#fff; background:rgba(255,255,255,.05); }
  .la-nav-cta   { padding:9px 22px; border-radius:10px; border:none; background:linear-gradient(135deg,#38b6ff,#6366f1); color:#fff; font-size:13.5px; font-family:'Sora',sans-serif; font-weight:600; cursor:pointer; transition:transform .18s,box-shadow .18s; text-decoration:none; display:inline-block; }
  .la-nav-cta:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(56,182,255,.32); }
  @media(max-width:560px){ .la-nav-ghost{ display:none; } }

  .la-section { position:relative; z-index:1; }
  .la-hero { min-height:100vh; display:flex; align-items:center; padding:100px 28px 60px; max-width:1200px; margin:0 auto; }
  .la-hero-inner { display:grid; grid-template-columns:1fr 1fr; gap:60px; align-items:center; width:100%; }
  @media(max-width:860px){ .la-hero-inner{ grid-template-columns:1fr; } .la-hero-right{ display:none; } }

  .la-hero-tag { display:inline-flex; align-items:center; gap:8px; padding:6px 14px; border-radius:20px; background:rgba(56,182,255,.1); border:1px solid rgba(56,182,255,.2); font-size:12px; color:#38b6ff; font-weight:500; margin-bottom:24px; animation:fadeUp .6s .2s both; }
  .la-hero-tag-dot { width:6px; height:6px; border-radius:50%; background:#38b6ff; animation:pulse 2s ease-in-out infinite; }
  .la-hero-title { font-family:'Instrument Serif',serif; font-size:clamp(42px,5.5vw,72px); line-height:1.08; color:#fff; margin-bottom:22px; animation:fadeUp .6s .3s both; }
  .la-hero-title em { font-style:italic; background:linear-gradient(135deg,#38b6ff,#a5b4fc); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .la-hero-sub { font-size:17px; color:rgba(255,255,255,.45); line-height:1.75; max-width:460px; margin-bottom:36px; animation:fadeUp .6s .4s both; }
  .la-hero-btns { animation:fadeUp .6s .5s both; }

  .la-btn-primary { padding:13px 28px; border-radius:12px; border:none; background:linear-gradient(135deg,#38b6ff,#6366f1); color:#fff; font-size:15px; font-family:'Sora',sans-serif; font-weight:600; cursor:pointer; transition:transform .18s,box-shadow .18s; position:relative; overflow:hidden; text-decoration:none; display:inline-flex; align-items:center; gap:8px; }
  .la-btn-primary:hover { transform:translateY(-2px); box-shadow:0 14px 36px rgba(56,182,255,.35); }
  .la-btn-primary::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,.1),transparent); pointer-events:none; }
  .la-btn-outline { padding:13px 28px; border-radius:12px; border:1.5px solid rgba(255,255,255,.12); background:rgba(255,255,255,.04); color:rgba(255,255,255,.7); font-size:15px; font-family:'Sora',sans-serif; font-weight:500; cursor:pointer; transition:all .2s; text-decoration:none; display:inline-flex; align-items:center; gap:8px; }
  .la-btn-outline:hover { border-color:rgba(255,255,255,.3); color:#fff; background:rgba(255,255,255,.08); }

  .la-hero-right { position:relative; display:flex; align-items:center; justify-content:center; animation:fadeIn .8s .5s both; }
  .la-hero-img-wrap { position:relative; width:100%; max-width:460px; }
  .la-hero-img { width:100%; border-radius:24px; object-fit:cover; aspect-ratio:4/5; display:block; box-shadow:0 40px 100px rgba(0,0,0,.5); border:1px solid rgba(255,255,255,.08); }
  .la-img-glow { position:absolute; inset:-2px; border-radius:26px; background:linear-gradient(135deg,rgba(56,182,255,.25),rgba(99,102,241,.2),transparent); pointer-events:none; }
  .la-float-card { position:absolute; background:rgba(7,14,28,.88); backdrop-filter:blur(14px); border:1px solid rgba(255,255,255,.1); border-radius:14px; padding:12px 16px; display:flex; align-items:center; gap:10px; box-shadow:0 16px 40px rgba(0,0,0,.4); }
  .la-float-card-1 { bottom:24px; left:-32px; animation:float 5s ease-in-out infinite; }
  .la-float-card-2 { top:40px; right:-28px; animation:float 6s ease-in-out infinite .8s; }
  .la-float-icon { width:36px; height:36px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
  .la-float-text strong { display:block; font-size:13px; color:#fff; font-weight:600; }
  .la-float-text span { font-size:11px; color:rgba(255,255,255,.4); }

  .la-ticker { border-top:1px solid rgba(255,255,255,.05); border-bottom:1px solid rgba(255,255,255,.05); padding:14px 0; overflow:hidden; background:rgba(255,255,255,.02); }
  .la-ticker-inner { display:flex; width:max-content; animation:marquee 28s linear infinite; }
  .la-ticker-item { display:flex; align-items:center; gap:8px; padding:0 32px; font-size:12.5px; color:rgba(255,255,255,.35); white-space:nowrap; }
  .la-ticker-dot { width:4px; height:4px; border-radius:50%; background:rgba(56,182,255,.5); }

  .la-stats { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:rgba(255,255,255,.05); border-radius:20px; overflow:hidden; }
  @media(max-width:700px){ .la-stats{ grid-template-columns:repeat(2,1fr); } }
  .la-stat-item { background:#070e1c; padding:32px 24px; text-align:center; }
  .la-stat-num { font-family:'Instrument Serif',serif; font-size:42px; background:linear-gradient(135deg,#38b6ff,#a5b4fc); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .la-stat-lbl { font-size:12.5px; color:rgba(255,255,255,.35); margin-top:6px; letter-spacing:.4px; text-transform:uppercase; }

  .la-features { max-width:1200px; margin:0 auto; padding:80px 28px; }
  .la-section-head { text-align:center; margin-bottom:56px; }
  .la-section-tag { display:inline-block; font-size:11.5px; color:#38b6ff; text-transform:uppercase; letter-spacing:1px; font-weight:600; margin-bottom:12px; }
  .la-section-title { font-family:'Instrument Serif',serif; font-size:clamp(32px,4vw,50px); line-height:1.12; color:#fff; margin-bottom:14px; }
  .la-section-title em { font-style:italic; color:#a5b4fc; }
  .la-section-sub { font-size:15px; color:rgba(255,255,255,.38); max-width:500px; margin:0 auto; line-height:1.7; }
  .la-divider { width:0; height:2px; background:linear-gradient(90deg,#38b6ff,#6366f1); border-radius:2px; margin:0 auto 28px; animation:slideRight .8s .3s both; }
  .la-feat-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
  @media(max-width:900px){ .la-feat-grid{ grid-template-columns:repeat(2,1fr); } }
  @media(max-width:580px){ .la-feat-grid{ grid-template-columns:1fr; } }

  .la-feat-card { background:rgba(255,255,255,.03); border:1.5px solid rgba(255,255,255,.07); border-radius:20px; padding:28px; transition:all .28s; cursor:pointer; position:relative; overflow:hidden; user-select:none; }
  .la-feat-card::before { content:''; position:absolute; inset:0; opacity:0; transition:opacity .3s; border-radius:20px; pointer-events:none; }
  .la-feat-card:hover { transform:translateY(-4px); border-color:rgba(56,182,255,.3); box-shadow:0 20px 60px rgba(0,0,0,.3); }
  .la-feat-card:hover::before { opacity:1; }
  .la-feat-card.c1::before { background:radial-gradient(ellipse at top left,rgba(56,182,255,.09),transparent 60%); }
  .la-feat-card.c2::before { background:radial-gradient(ellipse at top left,rgba(52,211,153,.09),transparent 60%); }
  .la-feat-card.c3::before { background:radial-gradient(ellipse at top left,rgba(99,102,241,.09),transparent 60%); }
  .la-feat-card.c4::before { background:radial-gradient(ellipse at top left,rgba(251,191,36,.09),transparent 60%); }
  .la-feat-card.c5::before { background:radial-gradient(ellipse at top left,rgba(248,113,113,.09),transparent 60%); }
  .la-feat-card.c6::before { background:radial-gradient(ellipse at top left,rgba(167,139,250,.09),transparent 60%); }
  .la-feat-icon { width:48px; height:48px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:22px; margin-bottom:18px; }
  .la-feat-icon.i1 { background:rgba(56,182,255,.12); border:1px solid rgba(56,182,255,.2); }
  .la-feat-icon.i2 { background:rgba(52,211,153,.12); border:1px solid rgba(52,211,153,.2); }
  .la-feat-icon.i3 { background:rgba(99,102,241,.12); border:1px solid rgba(99,102,241,.2); }
  .la-feat-icon.i4 { background:rgba(251,191,36,.12); border:1px solid rgba(251,191,36,.2); }
  .la-feat-icon.i5 { background:rgba(248,113,113,.12); border:1px solid rgba(248,113,113,.2); }
  .la-feat-icon.i6 { background:rgba(167,139,250,.12); border:1px solid rgba(167,139,250,.2); }
  .la-feat-title { font-size:16px; font-weight:700; color:#fff; margin-bottom:8px; }
  .la-feat-desc  { font-size:13.5px; color:rgba(255,255,255,.42); line-height:1.65; }
  .la-feat-lock  { display:inline-flex; align-items:center; gap:5px; font-size:11.5px; color:rgba(255,255,255,.2); margin-top:14px; transition:color .2s; }
  .la-feat-card:hover .la-feat-lock { color:#38b6ff; }

  .la-how { max-width:1200px; margin:0 auto; padding:80px 28px; }
  .la-steps { display:grid; grid-template-columns:repeat(3,1fr); margin-top:56px; }
  @media(max-width:700px){ .la-steps{ grid-template-columns:1fr; gap:24px; } .la-step-line{ display:none !important; } }
  .la-step { text-align:center; padding:0 24px; position:relative; }
  .la-step-num { width:56px; height:56px; border-radius:50%; border:1.5px solid rgba(56,182,255,.35); background:rgba(56,182,255,.08); display:flex; align-items:center; justify-content:center; font-family:'Instrument Serif',serif; font-size:22px; color:#38b6ff; margin:0 auto 20px; position:relative; z-index:1; }
  .la-step-line { position:absolute; top:28px; left:50%; right:-50%; height:1px; background:linear-gradient(90deg,rgba(56,182,255,.3),rgba(99,102,241,.2)); z-index:0; }
  .la-step:last-child .la-step-line { display:none; }
  .la-step-title { font-size:16px; font-weight:600; color:#fff; margin-bottom:8px; }
  .la-step-desc  { font-size:13px; color:rgba(255,255,255,.38); line-height:1.65; }

  .la-testi { max-width:1200px; margin:0 auto; padding:80px 28px; }
  .la-testi-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
  @media(max-width:900px){ .la-testi-grid{ grid-template-columns:1fr 1fr; } }
  @media(max-width:560px){ .la-testi-grid{ grid-template-columns:1fr; } }
  .la-testi-card { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:18px; padding:24px; transition:transform .2s; }
  .la-testi-card:hover { transform:translateY(-3px); }
  .la-stars { color:#f59e0b; font-size:13px; margin-bottom:12px; letter-spacing:2px; }
  .la-testi-text { font-size:13.5px; color:rgba(255,255,255,.55); line-height:1.7; margin-bottom:16px; font-style:italic; }
  .la-testi-author { display:flex; align-items:center; gap:10px; }
  .la-testi-avatar { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#38b6ff,#6366f1); display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:700; color:#fff; flex-shrink:0; font-family:'Instrument Serif',serif; }
  .la-testi-name { font-size:13px; color:#fff; font-weight:600; }
  .la-testi-role { font-size:11px; color:rgba(255,255,255,.3); }

  .la-cta { padding:80px 28px; }
  .la-cta-box { max-width:900px; margin:0 auto; border-radius:28px; background:linear-gradient(135deg,rgba(56,182,255,.1),rgba(99,102,241,.15),rgba(56,182,255,.08)); border:1px solid rgba(56,182,255,.2); padding:72px 48px; text-align:center; position:relative; overflow:hidden; }
  .la-cta-box::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at 50% 0%,rgba(56,182,255,.12),transparent 60%); pointer-events:none; }
  .la-cta-title { font-family:'Instrument Serif',serif; font-size:clamp(30px,4vw,52px); color:#fff; margin-bottom:16px; line-height:1.12; position:relative; }
  .la-cta-title em { font-style:italic; color:#a5b4fc; }
  .la-cta-sub { font-size:15px; color:rgba(255,255,255,.42); margin-bottom:36px; position:relative; }
  .la-cta-btns { display:flex; justify-content:center; gap:12px; flex-wrap:wrap; position:relative; }

  .la-footer { border-top:1px solid rgba(255,255,255,.06); padding:40px 28px; }
  .la-footer-inner { max-width:1200px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; }
  .la-footer-links { display:flex; gap:24px; }
  .la-footer-link { font-size:12.5px; color:rgba(255,255,255,.28); text-decoration:none; transition:color .15s; }
  .la-footer-link:hover { color:rgba(255,255,255,.6); }
  .la-footer-copy { font-size:12px; color:rgba(255,255,255,.2); }

  /* ══ CHAT FAB ══ */
  .chat-fab { position:fixed; bottom:28px; right:28px; z-index:200; width:60px; height:60px; border-radius:50%; border:none; background:linear-gradient(135deg,#38b6ff,#6366f1); display:flex; align-items:center; justify-content:center; font-size:26px; cursor:pointer; animation:fabGlow 2.5s ease-in-out infinite; transition:transform .2s; }
  .chat-fab:hover { transform:scale(1.1) translateY(-3px); }
  .chat-fab-badge { position:absolute; top:2px; right:2px; width:14px; height:14px; background:#34d399; border-radius:50%; border:2.5px solid #050d1a; }

  /* ══ CHAT POPUP ══ */
  .chat-popup { position:fixed; bottom:104px; right:28px; z-index:200; width:390px; height:570px; border-radius:22px; background:#070e1c; border:1px solid rgba(255,255,255,.1); box-shadow:0 32px 80px rgba(0,0,0,.65),0 0 0 1px rgba(56,182,255,.08); display:flex; flex-direction:column; overflow:hidden; animation:popUp .32s cubic-bezier(.34,1.4,.64,1) both; }
  @media(max-width:480px){ .chat-popup{ width:calc(100vw - 24px); right:12px; bottom:90px; height:74vh; } }

  .chat-header { padding:16px 18px; background:linear-gradient(135deg,rgba(56,182,255,.1),rgba(99,102,241,.08)); border-bottom:1px solid rgba(255,255,255,.07); display:flex; align-items:center; gap:12px; flex-shrink:0; }
  .chat-avatar { width:42px; height:42px; border-radius:13px; background:linear-gradient(135deg,#38b6ff,#6366f1); display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; box-shadow:0 4px 14px rgba(56,182,255,.3); }
  .chat-head-info strong { display:block; font-size:14px; color:#fff; font-weight:600; }
  .chat-head-info span   { font-size:11.5px; color:#34d399; }
  .chat-head-right { margin-left:auto; display:flex; align-items:center; gap:6px; }
  .chat-powered { font-size:10px; color:rgba(255,255,255,.25); background:rgba(255,255,255,.05); padding:3px 8px; border-radius:6px; border:1px solid rgba(255,255,255,.07); }
  .chat-close-btn { width:30px; height:30px; border-radius:8px; border:none; background:rgba(255,255,255,.06); color:rgba(255,255,255,.5); font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .15s; line-height:1; }
  .chat-close-btn:hover { background:rgba(255,255,255,.12); color:#fff; }

  .chat-messages { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:12px; scroll-behavior:smooth; }
  .chat-messages::-webkit-scrollbar { width:4px; }
  .chat-messages::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1); border-radius:4px; }

  .chat-msg { display:flex; gap:10px; animation:msgIn .25s ease both; max-width:93%; }
  .chat-msg.user { align-self:flex-end; flex-direction:row-reverse; }
  .chat-msg-av { width:28px; height:28px; border-radius:8px; background:linear-gradient(135deg,#38b6ff,#6366f1); display:flex; align-items:center; justify-content:center; font-size:13px; flex-shrink:0; margin-top:2px; }
  .chat-msg.user .chat-msg-av { background:linear-gradient(135deg,#6366f1,#a78bfa); }
  .chat-bubble { padding:10px 14px; border-radius:14px; font-size:13.5px; line-height:1.65; }
  .chat-msg.ai   .chat-bubble { background:rgba(255,255,255,.06); color:rgba(255,255,255,.88); border-radius:4px 14px 14px 14px; border:1px solid rgba(255,255,255,.07); }
  .chat-msg.user .chat-bubble { background:linear-gradient(135deg,rgba(56,182,255,.2),rgba(99,102,241,.2)); color:#fff; border-radius:14px 4px 14px 14px; border:1px solid rgba(56,182,255,.2); }
  .chat-msg.ai .chat-bubble strong { color:#38b6ff; }
  .chat-msg.ai .chat-bubble ul,.chat-msg.ai .chat-bubble ol { padding-left:16px; margin-top:4px; }
  .chat-msg.ai .chat-bubble li { margin-bottom:3px; }

  .chat-typing { display:flex; align-items:center; gap:5px; padding:12px 14px; background:rgba(255,255,255,.05); border-radius:4px 14px 14px 14px; border:1px solid rgba(255,255,255,.07); }
  .chat-typing span { width:7px; height:7px; border-radius:50%; background:#38b6ff; animation:typingDot 1.2s ease-in-out infinite; }
  .chat-typing span:nth-child(2){ animation-delay:.2s; }
  .chat-typing span:nth-child(3){ animation-delay:.4s; }

  /* loading state for puter */
  .chat-init { display:flex; align-items:center; gap:10px; padding:14px 16px; background:rgba(56,182,255,.05); border:1px solid rgba(56,182,255,.12); border-radius:12px; font-size:12.5px; color:rgba(255,255,255,.5); animation:fadeIn .3s both; }
  .chat-init-dot { width:8px; height:8px; border-radius:50%; background:#38b6ff; animation:pulse 1.2s ease-in-out infinite; flex-shrink:0; }

  .chat-input-row { padding:12px 14px; border-top:1px solid rgba(255,255,255,.07); display:flex; gap:10px; align-items:flex-end; flex-shrink:0; background:rgba(5,13,26,.6); }
  .chat-input { flex:1; background:rgba(255,255,255,.05); border:1.5px solid rgba(255,255,255,.08); border-radius:12px; padding:10px 14px; color:#fff; font-size:13.5px; font-family:'Sora',sans-serif; outline:none; transition:border-color .2s; resize:none; max-height:80px; min-height:42px; }
  .chat-input::placeholder { color:rgba(255,255,255,.22); }
  .chat-input:focus { border-color:#38b6ff; }
  .chat-send { width:42px; height:42px; border-radius:12px; border:none; background:linear-gradient(135deg,#38b6ff,#6366f1); display:flex; align-items:center; justify-content:center; font-size:17px; cursor:pointer; flex-shrink:0; transition:transform .15s,box-shadow .15s; }
  .chat-send:hover:not(:disabled) { transform:scale(1.08); box-shadow:0 6px 18px rgba(56,182,255,.35); }
  .chat-send:disabled { opacity:.4; cursor:not-allowed; }

  /* ══ AUTH GATE ══ */
  .gate-overlay { position:fixed; inset:0; z-index:300; background:rgba(0,0,0,.7); backdrop-filter:blur(8px); animation:overlayIn .2s both; display:flex; align-items:center; justify-content:center; padding:20px; }
  .gate-modal  { background:#070e1c; border:1px solid rgba(255,255,255,.1); border-radius:24px; padding:40px 36px; max-width:400px; width:100%; text-align:center; animation:alertIn .3s cubic-bezier(.34,1.4,.64,1) both; box-shadow:0 40px 100px rgba(0,0,0,.6); position:relative; }
  .gate-icon   { width:68px; height:68px; border-radius:20px; background:linear-gradient(135deg,rgba(56,182,255,.15),rgba(99,102,241,.15)); border:1px solid rgba(56,182,255,.25); display:flex; align-items:center; justify-content:center; font-size:30px; margin:0 auto 20px; }
  .gate-title  { font-family:'Instrument Serif',serif; font-size:24px; color:#fff; margin-bottom:10px; }
  .gate-sub    { font-size:13.5px; color:rgba(255,255,255,.45); line-height:1.65; margin-bottom:20px; }
  .gate-feat   { display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:20px; background:rgba(56,182,255,.08); border:1px solid rgba(56,182,255,.2); font-size:12.5px; color:#38b6ff; margin-bottom:24px; }
  .gate-btns   { display:flex; flex-direction:column; gap:10px; }
  .gate-login  { padding:13px; border-radius:12px; border:none; background:linear-gradient(135deg,#38b6ff,#6366f1); color:#fff; font-size:14px; font-family:'Sora',sans-serif; font-weight:600; cursor:pointer; transition:transform .15s,box-shadow .15s; }
  .gate-login:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(56,182,255,.35); }
  .gate-signup { padding:13px; border-radius:12px; border:1.5px solid rgba(255,255,255,.1); background:transparent; color:rgba(255,255,255,.6); font-size:14px; font-family:'Sora',sans-serif; font-weight:500; cursor:pointer; transition:all .15s; }
  .gate-signup:hover { border-color:rgba(255,255,255,.25); color:#fff; background:rgba(255,255,255,.05); }
  .gate-x { position:absolute; top:16px; right:16px; width:28px; height:28px; border-radius:8px; border:none; background:rgba(255,255,255,.06); color:rgba(255,255,255,.4); font-size:17px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .15s; line-height:1; }
  .gate-x:hover { background:rgba(255,255,255,.12); color:#fff; }
`;

// ─── Data ─────────────────────────────────────────────────────────────────────
const FEATURES = [
  { cls:"c1", icon:"🤖", icls:"i1", title:"AI Symptom Checker",  desc:"Describe how you feel and get instant, evidence-backed health insights from our medical AI.",      link:"/patient/symptom-checker" },
  { cls:"c2", icon:"📅", icls:"i2", title:"Smart Booking",        desc:"Book with the right doctor in seconds — filtered by specialty, rating, and availability.",           link:"/patient/appointments" },
  { cls:"c3", icon:"🗂️", icls:"i3", title:"Medical Records",     desc:"Your complete health history, test results, and prescriptions — encrypted and always accessible.",  link:"/patient/records" },
  { cls:"c4", icon:"💊", icls:"i4", title:"Medication Reminders", desc:"Never miss a dose. Smart alerts keep your treatment on track across all your devices.",             link:"/patient/reminders" },
  { cls:"c5", icon:"🚨", icls:"i5", title:"Emergency Detection",  desc:"Critical symptom flags trigger instant alerts and direct access to emergency services.",            link:"/patient/emergency" },
  { cls:"c6", icon:"👨‍⚕️",icls:"i6", title:"Doctor Dashboard",   desc:"A full command center for healthcare professionals — patient list, notes, schedules and more.",    link:"/doctor/dashboard" },
];
const STEPS = [
  { n:"1", title:"Create Your Profile", desc:"Sign up in 60 seconds. Tell us about your age, gender, and health baseline." },
  { n:"2", title:"Describe Symptoms",   desc:"Chat with our AI, which asks the right questions to understand your condition." },
  { n:"3", title:"Get Care Instantly",  desc:"Receive guidance, book a doctor, or escalate to emergency — all from one screen." },
];
const TESTIMONIALS = [
  { stars:5, text:"CureAI flagged my chest pain as potentially serious and got me to a cardiologist within hours. It genuinely saved my life.", name:"Sarah K.",    role:"Patient",      init:"S" },
  { stars:5, text:"Managing 120+ patients used to mean chaos. Now my dashboard handles scheduling, records, and alerts automatically.",        name:"Dr. Raza M.", role:"Cardiologist", init:"R" },
  { stars:5, text:"The medication reminders actually work. I haven't missed a dose in three months — first time in years.",                     name:"Ahmed T.",    role:"Patient",      init:"A" },
];
const TICKER = ["AI-Powered Diagnostics","50,000+ Patients","2,400 Certified Doctors","HIPAA Compliant","256-bit Encryption","Smart Appointments","24/7 Emergency Alerts","Secure Health Records"];

const SYSTEM_PROMPT = `You are CureAI, a warm and knowledgeable AI medical assistant.

You help users with:
- Symptom analysis and possible conditions
- General health and wellness advice  
- Medication information (uses, side effects, interactions)
- When to see a doctor vs go to emergency
- Mental health support and guidance

Rules:
- Be empathetic, concise, and clear
- Use **bold** for key medical terms
- NEVER definitively diagnose — give possibilities and guidance
- Always recommend consulting a real doctor for serious/persistent issues
- If symptoms suggest emergency (chest pain, stroke signs, severe breathing difficulty), URGENTLY tell them to call emergency services (1122 in Pakistan, 911 in USA, 999 in UK)
- Keep responses focused and under 180 words
- Format nicely with bullet points and line breaks where helpful`;

interface ChatMsg  { role:"ai"|"user"; text:string; }
interface GateInfo { icon:string; title:string; link:string; }

// ─── Component ────────────────────────────────────────────────────────────────
export default function Landing() {
  const [exiting,      setExiting]      = useState(false);
  const [chatOpen,     setChatOpen]     = useState(false);
  const [messages,     setMessages]     = useState<ChatMsg[]>([
    { role:"ai", text:"👋 Hi! I'm **CureAI**, your personal medical assistant.\n\nI can help you with:\n• Symptom checking & analysis\n• General health advice\n• Medication information\n• When to see a doctor\n\nHow are you feeling today?" }
  ]);
  const [input,        setInput]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [gate,         setGate]         = useState<GateInfo|null>(null);
  const msgEnd  = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // ── inject styles ──
  useEffect(() => {
    const id = "cure-ai-ls";
    if (!document.getElementById(id)) {
      const s = document.createElement("style"); s.id = id; s.textContent = STYLES;
      document.head.appendChild(s);
    }
  }, []);


  // ── scroll chat to bottom ──
  useEffect(() => { msgEnd.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading]);

  // ── scroll-triggered card animations ──
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) (e.target as HTMLElement).style.animation = "cardIn .55s cubic-bezier(.34,1.2,.64,1) both";
      });
    }, { threshold:0.1 });
    document.querySelectorAll(".la-feat-card,.la-testi-card,.la-stat-item").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const go = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault(); setExiting(true);
    setTimeout(() => navigate(path), 350);
  };

  const onFeature = (f: typeof FEATURES[0]) => {
    if (localStorage.getItem("cureai_user")) { navigate(f.link); return; }
    setGate({ icon:f.icon, title:f.title, link:f.link });
  };

  // ── markdown-lite formatter ──
  const fmt = (t: string) =>
    t.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
     .replace(/\n/g, "<br/>");

  // ── send message via puter.js (GPT-4o-mini, completely free) ──
  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    const newMsg: ChatMsg = { role:"user", text:q };
    setMessages(p => [...p, newMsg]);
    setLoading(true);

    try {
 const response = await fetch("http://localhost:5000/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.slice(-8).map(m => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text
      })),
      { role: "user", content: q }
    ]
  })
});

const data = await response.json();
const reply = data.reply;
      setMessages(p => [...p, { role:"ai", text: reply }]);
    } catch (err: any) {
      console.error("Chat error:", err);
      setMessages(p => [...p, {
        role:"ai",
        text: "⚠️ I'm having trouble connecting right now. Please make sure you're online and try again in a moment.\n\nIf this persists, try refreshing the page."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className={`la-root${exiting ? " page-exit" : ""}`}>
      <style>{STYLES}</style>
      <div className="la-grid"/>
      <div className="la-orb la-orb1"/><div className="la-orb la-orb2"/><div className="la-orb la-orb3"/>

      {/* NAV */}
      <nav className="la-nav">
        <div className="la-nav-inner">
          <div className="la-nav-logo" onClick={go("/")}>
            <div className="la-nav-icon">🩺</div>
            <span className="la-nav-name">CureAI</span>
          </div>
          <div className="la-nav-links">
            <a href="#features" className="la-nav-ghost">Features</a>
            <a href="#how"      className="la-nav-ghost">How it works</a>
            <a href="/login"    className="la-nav-ghost" onClick={go("/login")}>Login</a>
            <a href="/signup"   className="la-nav-cta"   onClick={go("/signup")}>Get Started</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="la-section">
        <div className="la-hero">
          <div className="la-hero-inner">
            <div>
              <div className="la-hero-tag"><span className="la-hero-tag-dot"/>Made by Shayan</div>
              <h1 className="la-hero-title">Healthcare that's<br/><em>intelligent</em> by<br/>design.</h1>
              <p className="la-hero-sub">CureAI combines medical AI with real doctors so you get the right care at the right moment — not hours later.</p>
              <div className="la-hero-btns">
                <button className="la-btn-primary" onClick={() => setChatOpen(true)}>
                  Chat with AI <span>🤖</span>
                </button>
              </div>
            </div>
            <div className="la-hero-right">
              <div className="la-hero-img-wrap">
                <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&q=80"
                  alt="Doctor" className="la-hero-img"
                  onError={e=>{ (e.target as HTMLImageElement).src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80"; }}/>
                <div className="la-img-glow"/>
                <div className="la-float-card la-float-card-1">
                  <div className="la-float-icon" style={{background:"rgba(52,211,153,.12)",border:"1px solid rgba(52,211,153,.2)"}}>✅</div>
                  <div className="la-float-text"><strong>AI Diagnosis Ready</strong><span>Instant symptom analysis</span></div>
                </div>
                <div className="la-float-card la-float-card-2">
                  <div className="la-float-icon" style={{background:"rgba(56,182,255,.12)",border:"1px solid rgba(56,182,255,.2)"}}>📅</div>
                  <div className="la-float-text"><strong>Dr. Raza — Available</strong><span>Next slot: 2:30 PM</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="la-ticker la-section">
        <div className="la-ticker-inner">
          {[...TICKER,...TICKER].map((t,i)=>(<div className="la-ticker-item" key={i}><span className="la-ticker-dot"/>{t}</div>))}
        </div>
      </div>

      {/* STATS */}
      <div className="la-section" style={{padding:"60px 28px 0"}}>
        <div className="la-stats">
          {[["50K+","Patients Helped"],["2,400+","Certified Doctors"],["99.9%","Uptime SLA"],["4.9★","Average Rating"]].map(([n,l])=>(
            <div className="la-stat-item" key={l} style={{opacity:0}}><div className="la-stat-num">{n}</div><div className="la-stat-lbl">{l}</div></div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" className="la-section la-features">
        <div className="la-section-head">
          <div className="la-section-tag">Platform Features</div>
          <div className="la-divider"/>
          <h2 className="la-section-title">Everything your health<br/><em>needs in one place</em></h2>
          <p className="la-section-sub">From first symptom to full recovery — CureAI has every step covered.</p>
        </div>
        <div className="la-feat-grid">
          {FEATURES.map(f=>(
            <div className={`la-feat-card ${f.cls}`} key={f.title} onClick={()=>onFeature(f)} style={{opacity:0}}>
              <div className={`la-feat-icon ${f.icls}`}>{f.icon}</div>
              <div className="la-feat-title">{f.title}</div>
              <div className="la-feat-desc">{f.desc}</div>
              <div className="la-feat-lock">🔒 Login to access →</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="la-section la-how">
        <div className="la-section-head">
          <div className="la-section-tag">Simple Process</div>
          <div className="la-divider"/>
          <h2 className="la-section-title">Up and running<br/><em>in minutes</em></h2>
        </div>
        <div className="la-steps">
          {STEPS.map((s,i)=>(
            <div className="la-step" key={s.n}>
              {i<STEPS.length-1 && <div className="la-step-line"/>}
              <div className="la-step-num">{s.n}</div>
              <div className="la-step-title">{s.title}</div>
              <div className="la-step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="la-section la-testi">
        <div className="la-section-head">
          <div className="la-section-tag">Real Stories</div>
          <div className="la-divider"/>
          <h2 className="la-section-title">Trusted by<br/><em>patients & doctors</em></h2>
        </div>
        <div className="la-testi-grid">
          {TESTIMONIALS.map(t=>(
            <div className="la-testi-card" key={t.name} style={{opacity:0}}>
              <div className="la-stars">{"★".repeat(t.stars)}</div>
              <p className="la-testi-text">"{t.text}"</p>
              <div className="la-testi-author">
                <div className="la-testi-avatar">{t.init}</div>
                <div><div className="la-testi-name">{t.name}</div><div className="la-testi-role">{t.role}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="la-section la-cta">
        <div className="la-cta-box">
          <h2 className="la-cta-title">Ready to take control<br/><em>of your health?</em></h2>
          <p className="la-cta-sub">Join 50,000+ people who trust CureAI for smarter, faster healthcare.</p>
          <div className="la-cta-btns">
            <a href="/signup" className="la-btn-primary" onClick={go("/signup")}>Create free account →</a>
            <a href="/login"  className="la-btn-outline" onClick={go("/login")}>Sign in</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="la-section la-footer">
        <div className="la-footer-inner">
          <div style={{display:"flex",alignItems:"center",gap:"10px",cursor:"pointer"}} onClick={go("/")}>
            <div className="la-nav-icon" style={{width:"34px",height:"34px",fontSize:"16px"}}>🩺</div>
            <span style={{fontFamily:"'Instrument Serif',serif",fontSize:"20px",color:"rgba(255,255,255,.6)"}}>CureAI</span>
          </div>
          <div className="la-footer-links">
            {["Privacy","Terms","Contact","Blog"].map(l=>(<a href="#" className="la-footer-link" key={l}>{l}</a>))}
          </div>
          <span className="la-footer-copy">© 2026 CureAI. All rights reserved.</span>
        </div>
      </footer>

      {/* ══ CHAT FAB ══ */}
      {!chatOpen && (
        <button className="chat-fab" onClick={()=>setChatOpen(true)} title="Chat with AI">
          🩺<span className="chat-fab-badge"/>
        </button>
      )}

      {/* ══ CHAT POPUP ══ */}
      {chatOpen && (
        <div className="chat-popup">
          {/* header */}
          <div className="chat-header">
            <div className="chat-avatar">🩺</div>
            <div className="chat-head-info">
              <strong>CureAI Assistant</strong>
            <span>● Online — Ready to help</span>
            </div>
            <div className="chat-head-right">
              <span className="chat-powered">GPT-4o mini</span>
              <button className="chat-close-btn" onClick={()=>setChatOpen(false)}>×</button>
            </div>
          </div>

          {/* messages */}
          <div className="chat-messages">
            {messages.map((m,i)=>(
              <div className={`chat-msg ${m.role}`} key={i}>
                <div className="chat-msg-av">{m.role==="ai"?"🩺":"👤"}</div>
                <div className="chat-bubble" dangerouslySetInnerHTML={{ __html: fmt(m.text) }}/>
              </div>
            ))}
            {loading && (
              <div className="chat-msg ai">
                <div className="chat-msg-av">🩺</div>
                <div className="chat-typing"><span/><span/><span/></div>
              </div>
            )}
            <div ref={msgEnd}/>
          </div>

          {/* input */}
          <div className="chat-input-row">
            <textarea
              className="chat-input"
              placeholder="Describe your symptoms…"
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={onKey}
              rows={1}
              disabled={loading}
            />
            <button className="chat-send" onClick={send} disabled={loading || !input.trim()}>➤</button>
          </div>
        </div>
      )}

      {/* ══ AUTH GATE MODAL ══ */}
      {gate && (
        <div className="gate-overlay" onClick={()=>setGate(null)}>
          <div className="gate-modal" onClick={e=>e.stopPropagation()}>
            <button className="gate-x" onClick={()=>setGate(null)}>×</button>
            <div className="gate-icon">🔐</div>
            <h2 className="gate-title">Login Required</h2>
            <p className="gate-sub">You need a CureAI account to access this feature. Sign in or create a free account to continue.</p>
            <div className="gate-feat"><span>{gate.icon}</span><span>{gate.title}</span></div>
            <div className="gate-btns">
              <button className="gate-login"  onClick={()=>{ setGate(null); setExiting(true); setTimeout(()=>navigate("/login"),350); }}>Sign In →</button>
              <button className="gate-signup" onClick={()=>{ setGate(null); setExiting(true); setTimeout(()=>navigate("/signup"),350); }}>Create free account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}