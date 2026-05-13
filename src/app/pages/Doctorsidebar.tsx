// ─── DoctorSidebar.tsx  ───────────────────────────────────────────────────────
// Shared sidebar + global styles injected once.
// Import this in every doctor page: <DoctorSidebar active="dashboard" />

import { useNavigate } from "react-router";

export const DOCTOR_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

  @keyframes fadeUp    { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes cardIn    { from{opacity:0;transform:translateY(20px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes drift     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
  @keyframes drift2    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(10px)} }
  @keyframes pulse     { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.18)} }
  @keyframes sideIn    { from{opacity:0;transform:translateX(-100%)} to{opacity:1;transform:translateX(0)} }
  @keyframes overlayIn { from{opacity:0} to{opacity:1} }
  @keyframes modalUp   { from{opacity:0;transform:scale(.94) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes checkPop  { 0%{transform:scale(0) rotate(-15deg)} 70%{transform:scale(1.2) rotate(4deg)} 100%{transform:scale(1) rotate(0)} }
  @keyframes countUp   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  html,body { height:100%; }
  body, .dr-root {
    font-family:'Sora',sans-serif;
    background:#050d1a;
    color:#fff;
    min-height:100vh;
    overflow-x:hidden;
  }
  .dr-root { display:flex; min-height:100vh; }

  /* ── sidebar ── */
  .dr-sidebar {
    width:256px; min-height:100vh;
    background:rgba(7,14,28,.96);
    border-right:1px solid rgba(255,255,255,.06);
    display:flex; flex-direction:column;
    position:fixed; top:0; left:0; bottom:0; z-index:50;
    animation:sideIn .45s cubic-bezier(.34,1.2,.64,1) both;
  }
  .dr-sidebar-top { padding:28px 20px 20px; }
  .dr-brand { display:flex; align-items:center; gap:10px; margin-bottom:32px; cursor:pointer; }
  .dr-brand-icon { width:38px; height:38px; border-radius:11px; background:linear-gradient(135deg,#38b6ff,#6366f1); display:flex; align-items:center; justify-content:center; font-size:17px; box-shadow:0 5px 16px rgba(56,182,255,.35); flex-shrink:0; }
  .dr-brand-name { font-family:'Instrument Serif',serif; font-size:21px; color:#fff; }
  .dr-brand-tag  { font-size:10px; color:rgba(255,255,255,.3); letter-spacing:.5px; text-transform:uppercase; margin-top:1px; }
  .dr-nav { display:flex; flex-direction:column; gap:4px; }
  .dr-nav-item {
    display:flex; align-items:center; gap:11px;
    padding:11px 14px; border-radius:12px; cursor:pointer;
    transition:all .2s; border:1px solid transparent;
    font-size:13.5px; color:rgba(255,255,255,.45); font-weight:500;
    position:relative; overflow:hidden;
  }
  .dr-nav-item:hover { background:rgba(255,255,255,.05); color:rgba(255,255,255,.8); border-color:rgba(255,255,255,.06); }
  .dr-nav-item.active { background:rgba(56,182,255,.1); color:#38b6ff; border-color:rgba(56,182,255,.2); }
  .dr-nav-item.active::before {
    content:''; position:absolute; left:0; top:20%; bottom:20%;
    width:3px; background:linear-gradient(#38b6ff,#6366f1);
    border-radius:0 3px 3px 0;
  }
  .dr-nav-icon { width:18px; height:18px; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
  .dr-nav-badge { margin-left:auto; background:rgba(248,113,113,.15); color:#f87171; font-size:10px; font-weight:600; padding:2px 7px; border-radius:10px; border:1px solid rgba(248,113,113,.2); }
  .dr-sidebar-divider { height:1px; background:rgba(255,255,255,.05); margin:12px 20px; }
  .dr-sidebar-bottom { margin-top:auto; padding:20px; }
  .dr-user-card { display:flex; align-items:center; gap:10px; padding:12px; border-radius:14px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07); margin-bottom:12px; }
  .dr-user-av { width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg,#6366f1,#38b6ff); display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:700; font-family:'Instrument Serif',serif; flex-shrink:0; }
  .dr-user-name { font-size:13px; color:#fff; font-weight:600; }
  .dr-user-role { font-size:11px; color:rgba(255,255,255,.35); }
  .dr-logout { width:100%; padding:10px; border-radius:11px; border:1.5px solid rgba(255,255,255,.08); background:transparent; color:rgba(255,255,255,.4); font-size:13px; font-family:'Sora',sans-serif; font-weight:500; cursor:pointer; transition:all .2s; display:flex; align-items:center; justify-content:center; gap:8px; }
  .dr-logout:hover { border-color:rgba(248,113,113,.4); color:#f87171; background:rgba(248,113,113,.06); }

  /* ── main wrapper ── */
  .dr-main { flex:1; margin-left:256px; padding:32px 36px; min-height:100vh; position:relative; }
  @media(max-width:900px){ .dr-sidebar{display:none;} .dr-main{margin-left:0;padding:20px;} }

  /* ── background ── */
  .dr-grid { position:fixed; inset:0; z-index:0; pointer-events:none;
    background-image:linear-gradient(rgba(255,255,255,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.022) 1px,transparent 1px);
    background-size:52px 52px; }
  .dr-orb { position:fixed; border-radius:50%; filter:blur(90px); pointer-events:none; z-index:0; }
  .dr-orb1 { width:420px; height:420px; background:radial-gradient(circle,rgba(56,182,255,.09) 0%,transparent 70%); top:-100px; right:0; animation:drift 12s ease-in-out infinite; }
  .dr-orb2 { width:320px; height:320px; background:radial-gradient(circle,rgba(99,102,241,.08) 0%,transparent 70%); bottom:0; left:270px; animation:drift2 14s ease-in-out infinite; }

  /* ── topbar ── */
  .dr-topbar { display:flex; align-items:center; justify-content:space-between; margin-bottom:28px; animation:fadeUp .5s .05s both; position:relative; z-index:1; }
  .dr-topbar-title { font-family:'Instrument Serif',serif; font-size:28px; color:#fff; line-height:1.15; }
  .dr-topbar-sub   { font-size:13px; color:rgba(255,255,255,.35); margin-top:3px; }
  .dr-topbar-right { display:flex; align-items:center; gap:10px; }
  .dr-date-badge { padding:8px 14px; border-radius:11px; background:rgba(255,255,255,.04); border:1.5px solid rgba(255,255,255,.07); font-size:12.5px; color:rgba(255,255,255,.4); }
  .dr-status-badge { padding:8px 14px; border-radius:11px; background:rgba(52,211,153,.08); border:1.5px solid rgba(52,211,153,.18); font-size:12.5px; color:#34d399; display:flex; align-items:center; gap:6px; }
  .dr-status-dot { width:6px; height:6px; border-radius:50%; background:#34d399; animation:pulse 2s ease-in-out infinite; }

  /* ── hero card ── */
  .dr-hero { border-radius:22px; background:linear-gradient(135deg,#0e2540 0%,#0c1c35 40%,#101828 100%); border:1px solid rgba(56,182,255,.14); padding:30px 34px; margin-bottom:26px; position:relative; overflow:hidden; animation:fadeUp .5s .1s both; z-index:1; }
  .dr-hero::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse at 80% 50%,rgba(99,102,241,.12),transparent 60%); pointer-events:none; }
  .dr-hero-inner { display:flex; align-items:center; justify-content:space-between; gap:20px; position:relative; flex-wrap:wrap; }
  .dr-hero-text h2 { font-family:'Instrument Serif',serif; font-size:clamp(20px,3vw,30px); color:#fff; margin-bottom:6px; }
  .dr-hero-text h2 em { font-style:italic; color:#38b6ff; }
  .dr-hero-text p { font-size:13.5px; color:rgba(255,255,255,.42); line-height:1.6; }
  .dr-hero-pill { display:inline-flex; align-items:center; gap:6px; padding:4px 12px; border-radius:20px; background:rgba(99,102,241,.1); border:1px solid rgba(99,102,241,.2); font-size:11px; color:#a5b4fc; margin-bottom:8px; }
  .dr-hero-stats { display:flex; gap:16px; flex-wrap:wrap; }
  .dr-hero-stat { text-align:center; padding:11px 16px; border-radius:14px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.08); }
  .dr-hero-stat-num { font-family:'Instrument Serif',serif; font-size:22px; color:#38b6ff; }
  .dr-hero-stat-lbl { font-size:10px; color:rgba(255,255,255,.3); text-transform:uppercase; letter-spacing:.5px; margin-top:2px; }

  /* ── stat grid ── */
  .dr-stat-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:26px; }
  @media(max-width:1100px){.dr-stat-grid{grid-template-columns:repeat(2,1fr)}}
  .dr-stat-card { border-radius:18px; background:rgba(255,255,255,.03); border:1.5px solid rgba(255,255,255,.07); padding:20px; transition:all .25s; position:relative; overflow:hidden; z-index:1; opacity:0; }
  .dr-stat-card:hover { transform:translateY(-3px); border-color:rgba(56,182,255,.22); box-shadow:0 16px 40px rgba(0,0,0,.25); }
  .dr-stat-card::before { content:''; position:absolute; inset:0; opacity:0; transition:opacity .3s; border-radius:18px; pointer-events:none; }
  .dr-stat-card:hover::before { opacity:1; }
  .dr-stat-card.s1::before{background:radial-gradient(ellipse at top left,rgba(56,182,255,.07),transparent 60%)}
  .dr-stat-card.s2::before{background:radial-gradient(ellipse at top left,rgba(52,211,153,.07),transparent 60%)}
  .dr-stat-card.s3::before{background:radial-gradient(ellipse at top left,rgba(251,191,36,.07),transparent 60%)}
  .dr-stat-card.s4::before{background:radial-gradient(ellipse at top left,rgba(167,139,250,.07),transparent 60%)}
  .dr-stat-icon { width:42px; height:42px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:19px; margin-bottom:14px; }
  .dr-stat-icon.c1{background:rgba(56,182,255,.12);border:1px solid rgba(56,182,255,.2)}
  .dr-stat-icon.c2{background:rgba(52,211,153,.12);border:1px solid rgba(52,211,153,.2)}
  .dr-stat-icon.c3{background:rgba(251,191,36,.12);border:1px solid rgba(251,191,36,.2)}
  .dr-stat-icon.c4{background:rgba(167,139,250,.12);border:1px solid rgba(167,139,250,.2)}
  .dr-stat-num { font-family:'Instrument Serif',serif; font-size:30px; color:#fff; }
  .dr-stat-lbl  { font-size:12px; color:rgba(255,255,255,.35); margin-top:3px; }
  .dr-stat-trend { display:inline-flex; align-items:center; gap:4px; font-size:11px; margin-top:8px; padding:2px 8px; border-radius:8px; }
  .dr-stat-trend.up  { background:rgba(52,211,153,.1); color:#34d399; }
  .dr-stat-trend.neu { background:rgba(255,255,255,.06); color:rgba(255,255,255,.4); }

  /* ── shared card ── */
  .dr-card { border-radius:20px; background:rgba(255,255,255,.03); border:1.5px solid rgba(255,255,255,.07); padding:24px; margin-bottom:20px; transition:border-color .2s; z-index:1; position:relative; opacity:0; }
  .dr-card:hover { border-color:rgba(255,255,255,.1); }
  .dr-card-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
  .dr-card-title { font-size:15px; font-weight:700; color:#fff; display:flex; align-items:center; gap:8px; }
  .dr-card-action { font-size:12px; color:#38b6ff; cursor:pointer; padding:5px 11px; border-radius:8px; border:1px solid rgba(56,182,255,.2); background:rgba(56,182,255,.07); transition:all .15s; }
  .dr-card-action:hover { background:rgba(56,182,255,.15); }

  /* ── table ── */
  .dr-table-wrap { overflow-x:auto; }
  .dr-table { width:100%; border-collapse:collapse; }
  .dr-table th { font-size:11px; color:rgba(255,255,255,.35); text-transform:uppercase; letter-spacing:.6px; font-weight:600; padding:0 16px 12px 0; text-align:left; white-space:nowrap; }
  .dr-table td { padding:12px 16px 12px 0; border-top:1px solid rgba(255,255,255,.05); font-size:13.5px; color:rgba(255,255,255,.7); vertical-align:middle; }
  .dr-table tr:hover td { background:rgba(255,255,255,.02); }

  /* ── badge ── */
  .dr-badge { display:inline-flex; align-items:center; padding:3px 10px; border-radius:10px; font-size:10.5px; font-weight:600; white-space:nowrap; }
  .dr-badge.green  { background:rgba(52,211,153,.12); color:#34d399; border:1px solid rgba(52,211,153,.2); }
  .dr-badge.yellow { background:rgba(251,191,36,.12); color:#fbbf24; border:1px solid rgba(251,191,36,.2); }
  .dr-badge.red    { background:rgba(248,113,113,.12); color:#f87171; border:1px solid rgba(248,113,113,.2); }
  .dr-badge.blue   { background:rgba(56,182,255,.12); color:#38b6ff; border:1px solid rgba(56,182,255,.2); }
  .dr-badge.purple { background:rgba(167,139,250,.12); color:#a78bfa; border:1px solid rgba(167,139,250,.2); }

  /* ── buttons ── */
  .dr-btn-primary { padding:9px 18px; border-radius:11px; border:none; background:linear-gradient(135deg,#38b6ff,#6366f1); color:#fff; font-size:13px; font-family:'Sora',sans-serif; font-weight:600; cursor:pointer; transition:transform .18s,box-shadow .18s; position:relative; overflow:hidden; display:inline-flex; align-items:center; gap:6px; }
  .dr-btn-primary::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,.1),transparent); pointer-events:none; }
  .dr-btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(56,182,255,.35); }
  .dr-btn-ghost  { padding:7px 14px; border-radius:10px; border:1.5px solid rgba(255,255,255,.09); background:transparent; color:rgba(255,255,255,.5); font-size:12.5px; font-family:'Sora',sans-serif; cursor:pointer; transition:all .18s; display:inline-flex; align-items:center; gap:5px; }
  .dr-btn-ghost:hover { border-color:rgba(255,255,255,.22); color:#fff; }
  .dr-btn-danger { padding:7px 14px; border-radius:10px; border:1.5px solid rgba(248,113,113,.2); background:rgba(248,113,113,.07); color:#f87171; font-size:12.5px; font-family:'Sora',sans-serif; cursor:pointer; transition:all .18s; display:inline-flex; align-items:center; gap:5px; }
  .dr-btn-danger:hover { background:rgba(248,113,113,.15); border-color:rgba(248,113,113,.4); }
  .dr-btn-success { padding:7px 14px; border-radius:10px; border:1.5px solid rgba(52,211,153,.2); background:rgba(52,211,153,.08); color:#34d399; font-size:12.5px; font-family:'Sora',sans-serif; cursor:pointer; transition:all .18s; display:inline-flex; align-items:center; gap:5px; }
  .dr-btn-success:hover { background:rgba(52,211,153,.16); border-color:rgba(52,211,153,.4); }

  /* ── search ── */
  .dr-search-wrap { position:relative; flex:1; min-width:200px; }
  .dr-search-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); font-size:14px; pointer-events:none; }
  .dr-search { width:100%; background:rgba(255,255,255,.04); border:1.5px solid rgba(255,255,255,.08); border-radius:12px; padding:10px 14px 10px 38px; color:#fff; font-size:13.5px; font-family:'Sora',sans-serif; outline:none; transition:border-color .2s,box-shadow .2s; }
  .dr-search::placeholder { color:rgba(255,255,255,.22); }
  .dr-search:focus { border-color:#38b6ff; box-shadow:0 0 0 3px rgba(56,182,255,.1); }

  /* ── input / select / textarea ── */
  .dr-input { width:100%; background:rgba(255,255,255,.04); border:1.5px solid rgba(255,255,255,.08); border-radius:12px; padding:11px 14px; color:#fff; font-size:13.5px; font-family:'Sora',sans-serif; outline:none; transition:border-color .2s,box-shadow .2s; }
  .dr-input::placeholder { color:rgba(255,255,255,.22); }
  .dr-input:focus { border-color:#38b6ff; box-shadow:0 0 0 3px rgba(56,182,255,.1); }
  .dr-textarea { width:100%; background:rgba(255,255,255,.04); border:1.5px solid rgba(255,255,255,.08); border-radius:12px; padding:11px 14px; color:#fff; font-size:13.5px; font-family:'Sora',sans-serif; outline:none; resize:none; transition:border-color .2s; }
  .dr-textarea:focus { border-color:#38b6ff; }
  .dr-textarea::placeholder { color:rgba(255,255,255,.22); }
  .dr-select { width:100%; background:rgba(255,255,255,.04); border:1.5px solid rgba(255,255,255,.08); border-radius:12px; padding:11px 14px; color:#fff; font-size:13.5px; font-family:'Sora',sans-serif; outline:none; cursor:pointer; transition:border-color .2s; }
  .dr-select:focus { border-color:#38b6ff; }
  .dr-select option { background:#0a1628; }
  .dr-label { font-size:11.5px; color:rgba(255,255,255,.42); text-transform:uppercase; letter-spacing:.6px; font-weight:600; margin-bottom:7px; display:block; }

  /* ── modal overlay ── */
  .dr-overlay { position:fixed; inset:0; z-index:200; background:rgba(0,0,0,.72); backdrop-filter:blur(10px); animation:overlayIn .22s both; display:flex; align-items:center; justify-content:center; padding:20px; }
  .dr-modal { background:#070e1c; border:1px solid rgba(255,255,255,.1); border-radius:26px; max-width:500px; width:100%; max-height:90vh; overflow-y:auto; animation:modalUp .3s cubic-bezier(.34,1.4,.64,1) both; box-shadow:0 40px 100px rgba(0,0,0,.65); }
  .dr-modal::-webkit-scrollbar { width:4px; }
  .dr-modal::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1); border-radius:4px; }
  .dr-modal-header { padding:26px 26px 18px; border-bottom:1px solid rgba(255,255,255,.07); display:flex; align-items:center; gap:14px; }
  .dr-modal-icon { width:48px; height:48px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0; }
  .dr-modal-title { font-family:'Instrument Serif',serif; font-size:20px; color:#fff; margin-bottom:3px; }
  .dr-modal-sub { font-size:12px; color:rgba(255,255,255,.35); }
  .dr-modal-close { margin-left:auto; width:30px; height:30px; border-radius:8px; border:none; background:rgba(255,255,255,.06); color:rgba(255,255,255,.45); font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .15s; line-height:1; flex-shrink:0; }
  .dr-modal-close:hover { background:rgba(255,255,255,.12); color:#fff; }
  .dr-modal-body { padding:22px 26px; }
  .dr-modal-footer { padding:0 26px 26px; display:flex; gap:10px; }
  .dr-modal-cancel { flex:1; padding:11px; border-radius:12px; border:1.5px solid rgba(255,255,255,.1); background:transparent; color:rgba(255,255,255,.55); font-size:13px; font-family:'Sora',sans-serif; cursor:pointer; transition:all .15s; }
  .dr-modal-cancel:hover { border-color:rgba(255,255,255,.22); color:#fff; }
  .dr-modal-confirm { flex:2; padding:11px; border-radius:12px; border:none; background:linear-gradient(135deg,#38b6ff,#6366f1); color:#fff; font-size:13px; font-family:'Sora',sans-serif; font-weight:600; cursor:pointer; transition:transform .15s,box-shadow .15s; position:relative; overflow:hidden; }
  .dr-modal-confirm::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,.1),transparent); pointer-events:none; }
  .dr-modal-confirm:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(56,182,255,.35); }
  .dr-form-row { margin-bottom:16px; }
  .dr-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
  @media(max-width:480px){.dr-form-grid{grid-template-columns:1fr}}

  /* ── toast ── */
  .dr-toast { position:fixed; bottom:28px; right:28px; z-index:400; padding:14px 20px; border-radius:14px; background:#070e1c; border:1px solid rgba(52,211,153,.3); color:#34d399; font-size:13px; font-family:'Sora',sans-serif; font-weight:500; box-shadow:0 16px 48px rgba(0,0,0,.5); animation:fadeUp .3s both; display:flex; align-items:center; gap:10px; }
  .dr-toast.error { border-color:rgba(248,113,113,.3); color:#f87171; }

  /* ── avatar initials ── */
  .dr-av { width:38px; height:38px; border-radius:11px; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; font-family:'Instrument Serif',serif; flex-shrink:0; }
  .dr-av.a1{background:rgba(56,182,255,.15);color:#38b6ff;border:1.5px solid rgba(56,182,255,.25)}
  .dr-av.a2{background:rgba(52,211,153,.15);color:#34d399;border:1.5px solid rgba(52,211,153,.25)}
  .dr-av.a3{background:rgba(251,191,36,.15);color:#fbbf24;border:1.5px solid rgba(251,191,36,.25)}
  .dr-av.a4{background:rgba(167,139,250,.15);color:#a78bfa;border:1.5px solid rgba(167,139,250,.25)}
  .dr-av.a5{background:rgba(248,113,113,.15);color:#f87171;border:1.5px solid rgba(248,113,113,.25)}

  /* ── patient / appt row ── */
  .dr-row { display:flex; align-items:center; gap:14px; padding:14px 16px; border-radius:14px; border:1px solid rgba(255,255,255,.06); background:rgba(255,255,255,.02); transition:all .2s; margin-bottom:8px; }
  .dr-row:last-child { margin-bottom:0; }
  .dr-row:hover { border-color:rgba(56,182,255,.2); background:rgba(56,182,255,.03); }
  .dr-row-name { font-size:13.5px; font-weight:600; color:#fff; }
  .dr-row-sub  { font-size:11.5px; color:rgba(255,255,255,.38); margin-top:2px; }
  .dr-row-right { margin-left:auto; text-align:right; flex-shrink:0; }

  /* ── empty state ── */
  .dr-empty { text-align:center; padding:60px 20px; }
  .dr-empty-icon { font-size:48px; margin-bottom:14px; }
  .dr-empty-title { font-family:'Instrument Serif',serif; font-size:20px; color:#fff; margin-bottom:6px; }
  .dr-empty-sub { font-size:13px; color:rgba(255,255,255,.35); }
`;

const NAV_ITEMS = [
  { icon:"🏠", label:"Dashboard",     path:"/doctor/dashboard",     key:"dashboard" },
  { icon:"👥", label:"Patients",      path:"/doctor/patients",      key:"patients"  },
  { icon:"📅", label:"Appointments",  path:"/doctor/appointments",  key:"appointments" },
  { icon:"📋", label:"Prescriptions", path:"/doctor/prescriptions", key:"prescriptions" },
];

interface Props { active: "dashboard"|"patients"|"appointments"|"prescriptions"; }

export function DoctorSidebar({ active }: Props) {
  const navigate = useNavigate();
  const user = (() => { try { return JSON.parse(localStorage.getItem("cureai_user") || "{}"); } catch { return {}; } })();
  const name = user?.name || "Dr. Smith";

  const logout = () => { localStorage.removeItem("cureai_user"); navigate("/"); };

  return (
    <aside className="dr-sidebar">
      <div className="dr-sidebar-top">
        <div className="dr-brand" onClick={() => navigate("/")}>
          <div className="dr-brand-icon">🩺</div>
          <div>
            <div className="dr-brand-name">CureAI</div>
            <div className="dr-brand-tag">Doctor Portal</div>
          </div>
        </div>
        <nav className="dr-nav">
          {NAV_ITEMS.map((item, i) => (
            <div
              key={item.key}
              className={`dr-nav-item${active === item.key ? " active" : ""}`}
              onClick={() => navigate(item.path)}
              style={{ animationDelay:`${i * 0.05}s` }}
            >
              <span className="dr-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
      </div>
      <div className="dr-sidebar-divider"/>
      <div className="dr-sidebar-bottom">
        <div className="dr-user-card">
          <div className="dr-user-av">{name[0]}</div>
          <div>
            <div className="dr-user-name">{name}</div>
            <div className="dr-user-role">Doctor</div>
          </div>
        </div>
        <button className="dr-logout" onClick={logout}>
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}