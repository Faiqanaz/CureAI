import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

  @keyframes fadeUp    { from{opacity:0;transform:translateY(22px)}  to{opacity:1;transform:translateY(0)} }
  @keyframes cardIn    { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes drift     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
  @keyframes pulse     { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }
  @keyframes countUp   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes sideIn    { from{opacity:0;transform:translateX(-100%)} to{opacity:1;transform:translateX(0)} }
  @keyframes overlayIn { from{opacity:0} to{opacity:1} }
  @keyframes modalUp   { from{opacity:0;transform:translateY(28px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes bellRing  { 0%,100%{transform:rotate(0)} 20%{transform:rotate(-14deg)} 40%{transform:rotate(14deg)} 60%{transform:rotate(-8deg)} 80%{transform:rotate(8deg)} }
  @keyframes checkPop  { 0%{transform:scale(0) rotate(-15deg)} 70%{transform:scale(1.2) rotate(4deg)} 100%{transform:scale(1) rotate(0)} }
  @keyframes shimmerLine { 0%{background-position:200% center} 100%{background-position:-200% center} }

  html,body{height:100%}
  body,.pd-root{font-family:'Sora',sans-serif;background:#050d1a;color:#fff;min-height:100vh;overflow-x:hidden}
  .pd-root{display:flex;min-height:100vh}

  /* sidebar */
  .pd-sidebar{width:256px;min-height:100vh;background:rgba(7,14,28,.95);border-right:1px solid rgba(255,255,255,.06);display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:50;animation:sideIn .45s cubic-bezier(.34,1.2,.64,1) both}
  .pd-sidebar-top{padding:28px 20px 20px}
  .pd-brand{display:flex;align-items:center;gap:10px;margin-bottom:32px;cursor:pointer}
  .pd-brand-icon{width:38px;height:38px;border-radius:11px;background:linear-gradient(135deg,#38b6ff,#6366f1);display:flex;align-items:center;justify-content:center;font-size:17px;box-shadow:0 5px 16px rgba(56,182,255,.35);flex-shrink:0}
  .pd-brand-name{font-family:'Instrument Serif',serif;font-size:21px;color:#fff}
  .pd-nav{display:flex;flex-direction:column;gap:4px}
  .pd-nav-item{display:flex;align-items:center;gap:11px;padding:11px 14px;border-radius:12px;cursor:pointer;transition:all .2s;border:1px solid transparent;font-size:13.5px;color:rgba(255,255,255,.45);font-weight:500;position:relative;overflow:hidden}
  .pd-nav-item:hover{background:rgba(255,255,255,.05);color:rgba(255,255,255,.8);border-color:rgba(255,255,255,.06)}
  .pd-nav-item.active{background:rgba(56,182,255,.1);color:#38b6ff;border-color:rgba(56,182,255,.2)}
  .pd-nav-item.active::before{content:'';position:absolute;left:0;top:20%;bottom:20%;width:3px;background:linear-gradient(#38b6ff,#6366f1);border-radius:0 3px 3px 0}
  .pd-nav-icon{width:18px;height:18px;flex-shrink:0;display:flex;align-items:center;justify-content:center}
  .pd-nav-badge{margin-left:auto;background:rgba(248,113,113,.15);color:#f87171;font-size:10px;font-weight:600;padding:2px 7px;border-radius:10px;border:1px solid rgba(248,113,113,.2)}
  .pd-sidebar-divider{height:1px;background:rgba(255,255,255,.05);margin:12px 20px}
  .pd-sidebar-bottom{margin-top:auto;padding:20px}
  .pd-user-card{display:flex;align-items:center;gap:10px;padding:12px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);margin-bottom:12px}
  .pd-user-av{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#38b6ff,#6366f1);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;font-family:'Instrument Serif',serif;flex-shrink:0}
  .pd-user-name{font-size:13px;color:#fff;font-weight:600}
  .pd-user-role{font-size:11px;color:rgba(255,255,255,.35)}
  .pd-logout{width:100%;padding:10px;border-radius:11px;border:1.5px solid rgba(255,255,255,.08);background:transparent;color:rgba(255,255,255,.4);font-size:13px;font-family:'Sora',sans-serif;font-weight:500;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px}
  .pd-logout:hover{border-color:rgba(248,113,113,.4);color:#f87171;background:rgba(248,113,113,.06)}

  /* main */
  .pd-main{flex:1;margin-left:256px;padding:32px 36px;min-height:100vh;position:relative}
  @media(max-width:900px){.pd-sidebar{display:none}.pd-main{margin-left:0;padding:20px}}
  .pd-orb{position:fixed;border-radius:50%;filter:blur(90px);pointer-events:none;z-index:0}
  .pd-orb1{width:400px;height:400px;background:radial-gradient(circle,rgba(56,182,255,.08) 0%,transparent 70%);top:-100px;right:0;animation:drift 12s ease-in-out infinite}
  .pd-orb2{width:300px;height:300px;background:radial-gradient(circle,rgba(99,102,241,.07) 0%,transparent 70%);bottom:0;left:280px;animation:drift 14s ease-in-out infinite reverse}

  /* topbar */
  .pd-topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:32px;animation:fadeUp .5s .05s both;position:relative;z-index:1}
  .pd-topbar-left h1{font-family:'Instrument Serif',serif;font-size:28px;color:#fff;line-height:1.15}
  .pd-topbar-left p{font-size:13.5px;color:rgba(255,255,255,.38);margin-top:3px}
  .pd-topbar-right{display:flex;align-items:center;gap:10px}
  .pd-notif-btn{width:40px;height:40px;border-radius:11px;border:1.5px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);display:flex;align-items:center;justify-content:center;font-size:17px;cursor:pointer;position:relative;transition:all .2s}
  .pd-notif-btn:hover{border-color:rgba(56,182,255,.3);background:rgba(56,182,255,.07)}
  .pd-notif-dot{position:absolute;top:6px;right:6px;width:8px;height:8px;background:#f87171;border-radius:50%;border:1.5px solid #070e1c;animation:pulse 2s ease-in-out infinite}
  .pd-date-badge{padding:8px 14px;border-radius:11px;background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.07);font-size:12.5px;color:rgba(255,255,255,.4)}

  /* hero */
  .pd-hero{border-radius:22px;background:linear-gradient(135deg,#0f2a4a 0%,#0d1e38 40%,#111830 100%);border:1px solid rgba(56,182,255,.15);padding:32px 36px;margin-bottom:28px;position:relative;overflow:hidden;animation:fadeUp .5s .1s both;z-index:1}
  .pd-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 80% 50%,rgba(56,182,255,.12),transparent 60%);pointer-events:none}
  .pd-hero-inner{display:flex;align-items:center;justify-content:space-between;gap:20px;position:relative}
  .pd-hero-text h2{font-family:'Instrument Serif',serif;font-size:clamp(22px,3vw,32px);color:#fff;margin-bottom:6px}
  .pd-hero-text h2 em{font-style:italic;color:#38b6ff}
  .pd-hero-text p{font-size:14px;color:rgba(255,255,255,.45);line-height:1.6;max-width:420px}
  .pd-hero-pill{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:20px;background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.2);font-size:11.5px;color:#34d399;margin-bottom:10px}
  .pd-hero-pill-dot{width:5px;height:5px;border-radius:50%;background:#34d399;animation:pulse 2s ease-in-out infinite}
  .pd-hero-stats{display:flex;gap:20px;flex-wrap:wrap}
  .pd-hero-stat{text-align:center;padding:12px 18px;border-radius:14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08)}
  .pd-hero-stat-num{font-family:'Instrument Serif',serif;font-size:24px;color:#38b6ff}
  .pd-hero-stat-lbl{font-size:10.5px;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:.5px;margin-top:2px}

  /* stat grid */
  .pd-stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px}
  @media(max-width:1100px){.pd-stat-grid{grid-template-columns:repeat(2,1fr)}}
  .pd-stat-card{border-radius:18px;background:rgba(255,255,255,.03);border:1.5px solid rgba(255,255,255,.07);padding:20px;transition:all .25s;position:relative;overflow:hidden;z-index:1}
  .pd-stat-card:hover{transform:translateY(-3px);border-color:rgba(56,182,255,.22);box-shadow:0 16px 40px rgba(0,0,0,.25)}
  .pd-stat-card::before{content:'';position:absolute;inset:0;opacity:0;transition:opacity .3s;border-radius:18px;pointer-events:none}
  .pd-stat-card:hover::before{opacity:1}
  .pd-stat-card.s1::before{background:radial-gradient(ellipse at top left,rgba(56,182,255,.07),transparent 60%)}
  .pd-stat-card.s2::before{background:radial-gradient(ellipse at top left,rgba(52,211,153,.07),transparent 60%)}
  .pd-stat-card.s3::before{background:radial-gradient(ellipse at top left,rgba(251,191,36,.07),transparent 60%)}
  .pd-stat-card.s4::before{background:radial-gradient(ellipse at top left,rgba(167,139,250,.07),transparent 60%)}
  .pd-stat-icon{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:19px;margin-bottom:14px}
  .pd-stat-icon.c1{background:rgba(56,182,255,.12);border:1px solid rgba(56,182,255,.2)}
  .pd-stat-icon.c2{background:rgba(52,211,153,.12);border:1px solid rgba(52,211,153,.2)}
  .pd-stat-icon.c3{background:rgba(251,191,36,.12);border:1px solid rgba(251,191,36,.2)}
  .pd-stat-icon.c4{background:rgba(167,139,250,.12);border:1px solid rgba(167,139,250,.2)}
  .pd-stat-num{font-family:'Instrument Serif',serif;font-size:30px;color:#fff}
  .pd-stat-lbl{font-size:12px;color:rgba(255,255,255,.35);margin-top:3px}
  .pd-stat-trend{display:inline-flex;align-items:center;gap:4px;font-size:11px;margin-top:8px;padding:2px 8px;border-radius:8px}
  .pd-stat-trend.up{background:rgba(52,211,153,.1);color:#34d399}
  .pd-stat-trend.neu{background:rgba(255,255,255,.06);color:rgba(255,255,255,.4)}

  /* content grid */
  .pd-content-grid{display:grid;grid-template-columns:1fr 360px;gap:20px}
  @media(max-width:1100px){.pd-content-grid{grid-template-columns:1fr}}

  /* cards */
  .pd-card{border-radius:20px;background:rgba(255,255,255,.03);border:1.5px solid rgba(255,255,255,.07);padding:24px;margin-bottom:20px;transition:border-color .2s;z-index:1;position:relative}
  .pd-card:hover{border-color:rgba(255,255,255,.1)}
  .pd-card-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
  .pd-card-title{font-size:15px;font-weight:700;color:#fff;display:flex;align-items:center;gap:8px}
  .pd-view-all{font-size:12px;color:#38b6ff;cursor:pointer;padding:5px 11px;border-radius:8px;border:1px solid rgba(56,182,255,.2);background:rgba(56,182,255,.07);transition:all .15s;text-decoration:none}
  .pd-view-all:hover{background:rgba(56,182,255,.15)}

  /* quick actions */
  .pd-actions-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .pd-action-btn{border-radius:16px;border:1.5px solid rgba(255,255,255,.07);background:rgba(255,255,255,.03);padding:20px;cursor:pointer;transition:all .25s;text-align:left;position:relative;overflow:hidden}
  .pd-action-btn:hover{transform:translateY(-3px);box-shadow:0 14px 36px rgba(0,0,0,.25)}
  .pd-action-btn.a1:hover{border-color:rgba(56,182,255,.3);background:rgba(56,182,255,.06)}
  .pd-action-btn.a2:hover{border-color:rgba(52,211,153,.3);background:rgba(52,211,153,.06)}
  .pd-action-btn.a3:hover{border-color:rgba(251,191,36,.3);background:rgba(251,191,36,.06)}
  .pd-action-btn.a4:hover{border-color:rgba(167,139,250,.3);background:rgba(167,139,250,.06)}
  .pd-action-icon{width:40px;height:40px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:12px}
  .pd-action-icon.ai1{background:rgba(56,182,255,.12);border:1px solid rgba(56,182,255,.2)}
  .pd-action-icon.ai2{background:rgba(52,211,153,.12);border:1px solid rgba(52,211,153,.2)}
  .pd-action-icon.ai3{background:rgba(251,191,36,.12);border:1px solid rgba(251,191,36,.2)}
  .pd-action-icon.ai4{background:rgba(167,139,250,.12);border:1px solid rgba(167,139,250,.2)}
  .pd-action-title{font-size:14px;font-weight:600;color:#fff;margin-bottom:4px}
  .pd-action-sub{font-size:12px;color:rgba(255,255,255,.38)}
  .pd-action-arrow{position:absolute;top:16px;right:16px;font-size:14px;color:rgba(255,255,255,.2);transition:all .2s}
  .pd-action-btn:hover .pd-action-arrow{color:#38b6ff;transform:translateX(3px)}

  /* appointments */
  .pd-appt-item{display:flex;align-items:center;gap:14px;padding:14px;border-radius:14px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);transition:all .2s;margin-bottom:10px}
  .pd-appt-item:last-child{margin-bottom:0}
  .pd-appt-item:hover{border-color:rgba(56,182,255,.2);background:rgba(56,182,255,.04)}
  .pd-appt-img{width:46px;height:46px;border-radius:12px;object-fit:cover;flex-shrink:0;border:1.5px solid rgba(255,255,255,.1)}
  .pd-appt-name{font-size:13.5px;font-weight:600;color:#fff;margin-bottom:2px}
  .pd-appt-spec{font-size:11.5px;color:rgba(255,255,255,.38)}
  .pd-appt-right{margin-left:auto;text-align:right}
  .pd-appt-date{font-size:12.5px;color:rgba(255,255,255,.6);font-weight:500}
  .pd-appt-time{font-size:11.5px;color:#38b6ff;margin-top:2px}
  .pd-appt-badge{display:inline-block;padding:2px 9px;border-radius:8px;font-size:10.5px;font-weight:600}
  .pd-appt-badge.confirmed{background:rgba(52,211,153,.1);color:#34d399;border:1px solid rgba(52,211,153,.2)}
  .pd-appt-badge.pending{background:rgba(251,191,36,.1);color:#fbbf24;border:1px solid rgba(251,191,36,.2)}

  /* activity */
  .pd-activity-item{display:flex;gap:12px;padding-bottom:14px;position:relative}
  .pd-activity-item:not(:last-child)::after{content:'';position:absolute;left:7px;top:18px;bottom:0;width:1px;background:rgba(255,255,255,.06)}
  .pd-activity-dot{width:15px;height:15px;border-radius:50%;flex-shrink:0;margin-top:2px}
  .pd-activity-dot.d1{background:rgba(56,182,255,.15);border:1.5px solid rgba(56,182,255,.4)}
  .pd-activity-dot.d2{background:rgba(52,211,153,.15);border:1.5px solid rgba(52,211,153,.4)}
  .pd-activity-dot.d3{background:rgba(251,191,36,.15);border:1.5px solid rgba(251,191,36,.4)}
  .pd-activity-dot.d4{background:rgba(167,139,250,.15);border:1.5px solid rgba(167,139,250,.4)}
  .pd-activity-text{font-size:13px;color:rgba(255,255,255,.7);line-height:1.5}
  .pd-activity-time{font-size:11px;color:rgba(255,255,255,.28);margin-top:2px}

  /* health score */
  .pd-health-score{text-align:center;padding:24px 16px}
  .pd-score-ring{width:120px;height:120px;margin:0 auto 16px;position:relative}
  .pd-score-ring svg{transform:rotate(-90deg)}
  .pd-score-ring circle{fill:none;stroke-width:10;stroke-linecap:round}
  .pd-score-ring .track{stroke:rgba(255,255,255,.07)}
  .pd-score-ring .fill{stroke:url(#scoreGrad);stroke-dasharray:314;transition:stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)}
  .pd-score-num{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
  .pd-score-val{font-family:'Instrument Serif',serif;font-size:28px;color:#fff}
  .pd-score-label{font-size:10px;color:rgba(255,255,255,.35);letter-spacing:.5px;text-transform:uppercase}
  .pd-score-txt{font-size:13px;color:rgba(255,255,255,.45);margin-bottom:16px}
  .pd-score-bars{display:flex;flex-direction:column;gap:10px}
  .pd-score-bar-row{display:flex;align-items:center;gap:10px}
  .pd-score-bar-lbl{font-size:11.5px;color:rgba(255,255,255,.45);width:76px;text-align:right;flex-shrink:0}
  .pd-score-bar-track{flex:1;height:6px;background:rgba(255,255,255,.07);border-radius:3px;overflow:hidden}
  .pd-score-bar-fill{height:100%;border-radius:3px;transition:width 1.2s cubic-bezier(.4,0,.2,1)}
  .pd-score-bar-val{font-size:11px;color:rgba(255,255,255,.4);width:28px;flex-shrink:0}

  /* reminders */
  .pd-reminder-item{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:12px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);margin-bottom:8px;transition:all .18s}
  .pd-reminder-item:hover{border-color:rgba(56,182,255,.2)}
  .pd-reminder-icon{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
  .pd-reminder-name{font-size:13px;font-weight:600;color:#fff}
  .pd-reminder-dose{font-size:11px;color:rgba(255,255,255,.35);margin-top:1px}
  .pd-reminder-time{margin-left:auto;font-size:11.5px;color:#38b6ff;font-weight:500}
  .pd-reminder-check{width:20px;height:20px;border-radius:6px;border:1.5px solid rgba(255,255,255,.15);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:11px;transition:all .15s;flex-shrink:0}
  .pd-reminder-check.done{background:rgba(52,211,153,.15);border-color:rgba(52,211,153,.4);color:#34d399}

  /* ══ REMINDERS MODAL ══ */
  .rm-overlay{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.7);backdrop-filter:blur(10px);animation:overlayIn .22s both;display:flex;align-items:center;justify-content:center;padding:20px}
  .rm-modal{background:#070e1c;border:1px solid rgba(255,255,255,.1);border-radius:26px;width:100%;max-width:460px;max-height:88vh;overflow-y:auto;animation:modalUp .3s cubic-bezier(.34,1.4,.64,1) both;box-shadow:0 40px 100px rgba(0,0,0,.65)}
  .rm-modal::-webkit-scrollbar{width:4px}
  .rm-modal::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:4px}
  .rm-header{padding:26px 26px 18px;border-bottom:1px solid rgba(255,255,255,.07);display:flex;align-items:center;gap:14px}
  .rm-header-icon{width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,rgba(248,113,113,.2),rgba(251,191,36,.15));border:1px solid rgba(248,113,113,.25);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;animation:bellRing .6s .3s both}
  .rm-header-text h3{font-family:'Instrument Serif',serif;font-size:20px;color:#fff;margin-bottom:3px}
  .rm-header-text p{font-size:12px;color:rgba(255,255,255,.35)}
  .rm-close{margin-left:auto;width:30px;height:30px;border-radius:8px;border:none;background:rgba(255,255,255,.06);color:rgba(255,255,255,.45);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;line-height:1;flex-shrink:0}
  .rm-close:hover{background:rgba(255,255,255,.12);color:#fff}
  .rm-body{padding:20px 26px 26px}
  .rm-section-label{font-size:11px;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:.8px;font-weight:600;margin-bottom:12px;margin-top:20px}
  .rm-section-label:first-child{margin-top:0}
  .rm-item{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:14px;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.02);margin-bottom:8px;transition:all .2s;cursor:pointer}
  .rm-item:hover{border-color:rgba(56,182,255,.2);background:rgba(56,182,255,.03)}
  .rm-item.overdue{border-color:rgba(248,113,113,.2);background:rgba(248,113,113,.04)}
  .rm-item.overdue:hover{border-color:rgba(248,113,113,.35);background:rgba(248,113,113,.08)}
  .rm-icon{width:40px;height:40px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}
  .rm-name{font-size:13.5px;font-weight:600;color:#fff;margin-bottom:2px}
  .rm-meta{font-size:11.5px;color:rgba(255,255,255,.38)}
  .rm-right{margin-left:auto;text-align:right;flex-shrink:0}
  .rm-time{font-size:12.5px;font-weight:600;color:#38b6ff}
  .rm-status{font-size:10.5px;margin-top:3px;padding:2px 8px;border-radius:8px;display:inline-block}
  .rm-status.due{background:rgba(251,191,36,.12);color:#fbbf24;border:1px solid rgba(251,191,36,.2)}
  .rm-status.taken{background:rgba(52,211,153,.12);color:#34d399;border:1px solid rgba(52,211,153,.2)}
  .rm-status.overdue{background:rgba(248,113,113,.12);color:#f87171;border:1px solid rgba(248,113,113,.2)}
  .rm-check{width:22px;height:22px;border-radius:7px;border:1.5px solid rgba(255,255,255,.15);display:flex;align-items:center;justify-content:center;font-size:12px;transition:all .18s;flex-shrink:0;cursor:pointer}
  .rm-check.done{background:rgba(52,211,153,.15);border-color:rgba(52,211,153,.4);color:#34d399;animation:checkPop .3s cubic-bezier(.34,1.56,.64,1) both}
  .rm-progress-row{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:14px;background:rgba(56,182,255,.05);border:1px solid rgba(56,182,255,.12);margin-bottom:20px}
  .rm-progress-info{flex:1}
  .rm-progress-label{font-size:12.5px;color:rgba(255,255,255,.5);margin-bottom:6px}
  .rm-progress-bar{height:6px;background:rgba(255,255,255,.07);border-radius:3px;overflow:hidden}
  .rm-progress-fill{height:100%;background:linear-gradient(90deg,#38b6ff,#6366f1);border-radius:3px;transition:width .8s cubic-bezier(.4,0,.2,1)}
  .rm-progress-num{font-size:18px;font-weight:700;font-family:'Instrument Serif',serif;color:#38b6ff;flex-shrink:0}
  .rm-footer{padding:0 26px 26px;display:flex;gap:10px}
  .rm-btn-sec{flex:1;padding:11px;border-radius:12px;border:1.5px solid rgba(255,255,255,.1);background:transparent;color:rgba(255,255,255,.55);font-size:13px;font-family:'Sora',sans-serif;cursor:pointer;transition:all .15s}
  .rm-btn-sec:hover{border-color:rgba(255,255,255,.22);color:#fff}
  .rm-btn-pri{flex:2;padding:11px;border-radius:12px;border:none;background:linear-gradient(135deg,#38b6ff,#6366f1);color:#fff;font-size:13px;font-family:'Sora',sans-serif;font-weight:600;cursor:pointer;transition:transform .15s,box-shadow .15s}
  .rm-btn-pri:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(56,182,255,.35)}
`;

// ── data ──────────────────────────────────────────────────────────────────────
const NAV = [
  { icon:"🏠", label:"Dashboard",       path:"/patient/dashboard",       active:true  },
  { icon:"🤖", label:"Symptom Checker",  path:"/patient/symptom-checker", active:false },
  { icon:"📅", label:"Appointments",     path:"/patient/appointments",    active:false },
  { icon:"🗂️", label:"Medical History",  path:"/patient/medical-history", active:false },
  { icon:"💊", label:"Reminders",        path:"#reminders",               active:false, badge:"3" },
];

const STATS = [
  { cls:"s1", icls:"c1", icon:"📅", num:"2",    lbl:"Upcoming Appts",   trend:"+1 this week", dir:"up"  },
  { cls:"s2", icls:"c2", icon:"💊", num:"4",    lbl:"Active Meds",      trend:"On schedule",  dir:"neu" },
  { cls:"s3", icls:"c3", icon:"🏃", num:"6,240",lbl:"Steps Today",       trend:"+12% vs avg",  dir:"up"  },
  { cls:"s4", icls:"c4", icon:"❤️", num:"72",   lbl:"Heart Rate (bpm)",  trend:"Normal range", dir:"neu" },
];

const APPOINTMENTS = [
  { id:1, doctor:"Dr. Sarah Smith",  spec:"General Practitioner", date:"Apr 28, 2026", time:"10:00 AM", status:"confirmed",
    img:"https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80" },
  { id:2, doctor:"Dr. Michael Chen", spec:"Cardiologist",          date:"May 3, 2026",  time:"2:30 PM",  status:"pending",
    img:"https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80" },
];

const ACTIVITY = [
  { cls:"d1", text:"Amoxicillin reminder set for 8:00 AM",           time:"2 hours ago" },
  { cls:"d2", text:"Lab results uploaded to Medical Records",          time:"1 day ago"   },
  { cls:"d3", text:"Appointment confirmed with Dr. Sarah Smith",       time:"2 days ago"  },
  { cls:"d4", text:"Symptom check completed — Low severity detected",  time:"3 days ago"  },
];

const REMINDER_DATA = [
  { icon:"💊", bg:"rgba(248,113,113,.12)", border:"rgba(248,113,113,.2)",  name:"Amoxicillin",  dose:"500mg · 1 capsule",  time:"8:00 AM",  status:"overdue", done:true  },
  { icon:"🩺", bg:"rgba(52,211,153,.12)",  border:"rgba(52,211,153,.2)",   name:"Vitamin D3",   dose:"1000 IU · 1 tablet", time:"12:00 PM", status:"due",     done:false },
  { icon:"💉", bg:"rgba(251,191,36,.12)",  border:"rgba(251,191,36,.2)",   name:"Metformin",    dose:"850mg · 2 tablets",  time:"8:00 PM",  status:"due",     done:false },
  { icon:"🫀", bg:"rgba(99,102,241,.12)",  border:"rgba(99,102,241,.2)",   name:"Aspirin",      dose:"75mg · 1 tablet",    time:"9:00 PM",  status:"due",     done:false },
];

const ACTIONS = [
  { cls:"a1", icls:"ai1", icon:"🤖", title:"Symptom Checker",  sub:"AI-powered analysis",      path:"/patient/symptom-checker" },
  { cls:"a2", icls:"ai2", icon:"📅", title:"Book Appointment", sub:"Find available doctors",    path:"/patient/appointments"   },
  { cls:"a3", icls:"ai3", icon:"🗂️", title:"Medical Records", sub:"View your health history",  path:"/patient/medical-history"},
  { cls:"a4", icls:"ai4", icon:"📊", title:"Health Report",    sub:"Download PDF summary",      path:"#"                       },
];

const HEALTH_BARS = [
  { lbl:"Sleep",      val:78, color:"linear-gradient(90deg,#38b6ff,#6366f1)" },
  { lbl:"Nutrition",  val:62, color:"linear-gradient(90deg,#34d399,#38b6ff)" },
  { lbl:"Activity",   val:84, color:"linear-gradient(90deg,#fbbf24,#f59e0b)" },
  { lbl:"Stress",     val:45, color:"linear-gradient(90deg,#f87171,#ef4444)" },
];

// ── component ─────────────────────────────────────────────────────────────────
export default function PatientDashboard() {
  const navigate = useNavigate();
  const [reminders,     setReminders]     = useState(REMINDER_DATA.map(r => ({ ...r })));
  const [scoreVisible,  setScoreVisible]  = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  const scoreRef = useRef<HTMLDivElement>(null);

  const user     = (() => { try { return JSON.parse(localStorage.getItem("cureai_user") || "{}"); } catch { return {}; } })();
  const userName = user?.name || "Sarah";
  const today    = new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" });

  useEffect(() => {
    const id = "pd-styles";
    if (!document.getElementById(id)) {
      const s = document.createElement("style"); s.id = id; s.textContent = STYLES;
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setScoreVisible(true); }, { threshold:0.3 });
    if (scoreRef.current) obs.observe(scoreRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const cards = document.querySelectorAll(".pd-stat-card,.pd-card");
    const obs = new IntersectionObserver(entries => {
      entries.forEach((e, i) => {
        if (e.isIntersecting)
          (e.target as HTMLElement).style.animation = `cardIn .5s ${i * 0.06}s cubic-bezier(.34,1.2,.64,1) both`;
      });
    }, { threshold:0.08 });
    cards.forEach(c => obs.observe(c));
    return () => obs.disconnect();
  }, []);

  const logout = () => { localStorage.removeItem("cureai_user"); navigate("/"); };
  const toggleRem = (i: number) => setReminders(p => p.map((r, idx) => idx === i ? { ...r, done:!r.done } : r));

  const takenCount = reminders.filter(r => r.done).length;
  const score = 78;
  const circumference = 314;
  const offset = circumference - (circumference * score) / 100;

  const handleNavClick = (path: string) => {
    if (path === "#reminders") { setShowReminders(true); return; }
    if (path !== "#") navigate(path);
  };

  return (
    <div className="pd-root">
      <style>{STYLES}</style>
      <div className="pd-orb pd-orb1"/><div className="pd-orb pd-orb2"/>

      {/* ── Sidebar ── */}
      <aside className="pd-sidebar">
        <div className="pd-sidebar-top">
          <div className="pd-brand" onClick={() => navigate("/")}>
            <div className="pd-brand-icon">🩺</div>
            <span className="pd-brand-name">CureAI</span>
          </div>
          <nav className="pd-nav">
            {NAV.map((item, i) => (
              <div
                key={item.label}
                className={`pd-nav-item${item.active ? " active" : ""}`}
                onClick={() => handleNavClick(item.path)}
                style={{ animationDelay:`${i * 0.05}s` }}
              >
                <span className="pd-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && <span className="pd-nav-badge">{item.badge}</span>}
              </div>
            ))}
          </nav>
        </div>

        <div className="pd-sidebar-divider"/>

        <div className="pd-sidebar-bottom">
          <div className="pd-user-card">
            <div className="pd-user-av">{userName[0]}</div>
            <div>
              <div className="pd-user-name">{userName}</div>
              <div className="pd-user-role">Patient</div>
            </div>
          </div>
          <button className="pd-logout" onClick={logout}>
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="pd-main">
        {/* Topbar */}
        <div className="pd-topbar">
          <div className="pd-topbar-left">
            <h1>Good morning, <em style={{fontStyle:"italic",color:"#38b6ff"}}>{userName}</em> 👋</h1>
            <p>{today}</p>
          </div>
          <div className="pd-topbar-right">
            <div className="pd-notif-btn" onClick={() => setShowReminders(true)}>
              🔔<span className="pd-notif-dot"/>
            </div>
            <div className="pd-date-badge">🟢 Health: Good</div>
          </div>
        </div>

        {/* Hero */}
        <div className="pd-hero" style={{animation:"fadeUp .5s .12s both"}}>
          <div className="pd-hero-inner">
            <div className="pd-hero-text">
              <div className="pd-hero-pill"><span className="pd-hero-pill-dot"/>All systems normal</div>
              <h2>Your health is <em>on track</em> today.</h2>
              <p>You have 2 upcoming appointments and all medications are scheduled. Keep it up!</p>
            </div>
            <div className="pd-hero-stats">
              <div className="pd-hero-stat"><div className="pd-hero-stat-num">2</div><div className="pd-hero-stat-lbl">Appts</div></div>
              <div className="pd-hero-stat"><div className="pd-hero-stat-num">78</div><div className="pd-hero-stat-lbl">Health Score</div></div>
              <div className="pd-hero-stat"><div className="pd-hero-stat-num">{takenCount}/{reminders.length}</div><div className="pd-hero-stat-lbl">Meds Taken</div></div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="pd-stat-grid" style={{animation:"fadeUp .5s .2s both"}}>
          {STATS.map(s => (
            <div className={`pd-stat-card ${s.cls}`} key={s.lbl}>
              <div className={`pd-stat-icon ${s.icls}`}>{s.icon}</div>
              <div className="pd-stat-num">{s.num}</div>
              <div className="pd-stat-lbl">{s.lbl}</div>
              <div className={`pd-stat-trend ${s.dir}`}>
                {s.dir === "up" ? "↑" : "·"} {s.trend}
              </div>
            </div>
          ))}
        </div>

        {/* Content grid */}
        <div className="pd-content-grid">
          <div>
            {/* Quick Actions */}
            <div className="pd-card" style={{opacity:0}}>
              <div className="pd-card-head">
                <div className="pd-card-title"><span>⚡</span> Quick Actions</div>
              </div>
              <div className="pd-actions-grid">
                {ACTIONS.map(a => (
                  <button key={a.title} className={`pd-action-btn ${a.cls}`} onClick={() => a.path !== "#" && navigate(a.path)}>
                    <div className={`pd-action-icon ${a.icls}`}>{a.icon}</div>
                    <div className="pd-action-title">{a.title}</div>
                    <div className="pd-action-sub">{a.sub}</div>
                    <span className="pd-action-arrow">→</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Appointments */}
            <div className="pd-card" style={{opacity:0}}>
              <div className="pd-card-head">
                <div className="pd-card-title"><span>📅</span> Upcoming Appointments</div>
                <span className="pd-view-all" onClick={() => navigate("/patient/appointments")}>View all →</span>
              </div>
              {APPOINTMENTS.map(a => (
                <div className="pd-appt-item" key={a.id}>
                  <img src={a.img} alt={a.doctor} className="pd-appt-img"
                    onError={e => { (e.target as HTMLImageElement).style.display="none"; }}/>
                  <div>
                    <div className="pd-appt-name">{a.doctor}</div>
                    <div className="pd-appt-spec">{a.spec}</div>
                    <div style={{marginTop:"5px"}}>
                      <span className={`pd-appt-badge ${a.status}`}>{a.status === "confirmed" ? "✓ Confirmed" : "⏳ Pending"}</span>
                    </div>
                  </div>
                  <div className="pd-appt-right">
                    <div className="pd-appt-date">{a.date}</div>
                    <div className="pd-appt-time">🕐 {a.time}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="pd-card" style={{opacity:0}}>
              <div className="pd-card-head">
                <div className="pd-card-title"><span>🕐</span> Recent Activity</div>
              </div>
              {ACTIVITY.map((a, i) => (
                <div className="pd-activity-item" key={i}>
                  <div className={`pd-activity-dot ${a.cls}`}/>
                  <div>
                    <div className="pd-activity-text">{a.text}</div>
                    <div className="pd-activity-time">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div>
            {/* Health Score */}
            <div className="pd-card" ref={scoreRef} style={{opacity:0}}>
              <div className="pd-card-head">
                <div className="pd-card-title"><span>💚</span> Health Score</div>
              </div>
              <div className="pd-health-score">
                <div className="pd-score-ring">
                  <svg viewBox="0 0 120 120" width="120" height="120">
                    <defs>
                      <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#38b6ff"/>
                        <stop offset="100%" stopColor="#6366f1"/>
                      </linearGradient>
                    </defs>
                    <circle className="track" cx="60" cy="60" r="50"/>
                    <circle className="fill"  cx="60" cy="60" r="50"
                      style={{ strokeDashoffset: scoreVisible ? offset : circumference } as any}/>
                  </svg>
                  <div className="pd-score-num">
                    <span className="pd-score-val">{score}</span>
                    <span className="pd-score-label">/ 100</span>
                  </div>
                </div>
                <p className="pd-score-txt">Good — Keep up your healthy habits!</p>
                <div className="pd-score-bars">
                  {HEALTH_BARS.map(b => (
                    <div className="pd-score-bar-row" key={b.lbl}>
                      <span className="pd-score-bar-lbl">{b.lbl}</span>
                      <div className="pd-score-bar-track">
                        <div className="pd-score-bar-fill" style={{
                          width: scoreVisible ? `${b.val}%` : "0%",
                          background: b.color,
                        }}/>
                      </div>
                      <span className="pd-score-bar-val">{b.val}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Today's Medications (inline) */}
            <div className="pd-card" style={{opacity:0}}>
              <div className="pd-card-head">
                <div className="pd-card-title"><span>💊</span> Today's Medications</div>
                <span style={{fontSize:"11px",color:"rgba(255,255,255,.28)"}}>{takenCount}/{reminders.length} taken</span>
              </div>
              {reminders.map((r, i) => (
                <div className="pd-reminder-item" key={i}>
                  <div className="pd-reminder-icon" style={{background:r.bg, border:`1px solid ${r.border}`}}>{r.icon}</div>
                  <div>
                    <div className="pd-reminder-name">{r.name}</div>
                    <div className="pd-reminder-dose">{r.dose}</div>
                  </div>
                  <div className="pd-reminder-time">{r.time}</div>
                  <div className={`pd-reminder-check${r.done ? " done" : ""}`} onClick={() => toggleRem(i)}>
                    {r.done ? "✓" : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* ══ REMINDERS POPUP MODAL ══ */}
      {showReminders && (
        <div className="rm-overlay" onClick={() => setShowReminders(false)}>
          <div className="rm-modal" onClick={e => e.stopPropagation()}>

            {/* header */}
            <div className="rm-header">
              <div className="rm-header-icon">🔔</div>
              <div className="rm-header-text">
                <h3>Medication Reminders</h3>
                <p>{new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" })}</p>
              </div>
              <button className="rm-close" onClick={() => setShowReminders(false)}>×</button>
            </div>

            <div className="rm-body">
              {/* Progress */}
              <div className="rm-progress-row">
                <div className="rm-progress-info">
                  <div className="rm-progress-label">Today's progress — {takenCount} of {reminders.length} taken</div>
                  <div className="rm-progress-bar">
                    <div className="rm-progress-fill" style={{ width:`${(takenCount / reminders.length) * 100}%` }}/>
                  </div>
                </div>
                <div className="rm-progress-num">{Math.round((takenCount / reminders.length) * 100)}%</div>
              </div>

              {/* Overdue */}
              {reminders.some(r => r.status === "overdue" && !r.done) && (
                <>
                  <div className="rm-section-label">⚠️ Overdue</div>
                  {reminders.map((r, i) => r.status === "overdue" && !r.done && (
                    <div className="rm-item overdue" key={i}>
                      <div className="rm-icon" style={{background:r.bg, border:`1px solid ${r.border}`}}>{r.icon}</div>
                      <div>
                        <div className="rm-name">{r.name}</div>
                        <div className="rm-meta">{r.dose}</div>
                      </div>
                      <div className="rm-right">
                        <div className="rm-time">{r.time}</div>
                        <div className="rm-status overdue">Overdue</div>
                      </div>
                      <div className={`rm-check${r.done ? " done" : ""}`} onClick={() => toggleRem(i)}>
                        {r.done ? "✓" : ""}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Upcoming */}
              <div className="rm-section-label">📋 All Reminders</div>
              {reminders.map((r, i) => (
                <div className={`rm-item${r.status === "overdue" && !r.done ? " overdue" : ""}`} key={i}>
                  <div className="rm-icon" style={{background:r.bg, border:`1px solid ${r.border}`}}>{r.icon}</div>
                  <div>
                    <div className="rm-name">{r.name}</div>
                    <div className="rm-meta">{r.dose}</div>
                  </div>
                  <div className="rm-right">
                    <div className="rm-time">{r.time}</div>
                    <div className={`rm-status${r.done ? " taken" : r.status === "overdue" ? " overdue" : " due"}`}>
                      {r.done ? "✓ Taken" : r.status === "overdue" ? "Overdue" : "Due"}
                    </div>
                  </div>
                  <div className={`rm-check${r.done ? " done" : ""}`} onClick={() => toggleRem(i)}>
                    {r.done ? "✓" : ""}
                  </div>
                </div>
              ))}
            </div>

            <div className="rm-footer">
              <button className="rm-btn-sec" onClick={() => setShowReminders(false)}>Close</button>
              <button className="rm-btn-pri" onClick={() => { setShowReminders(false); navigate("/patient/appointments"); }}>
                Book Follow-up →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}