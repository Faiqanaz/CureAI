import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

  @keyframes fadeUp    { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes cardIn    { from{opacity:0;transform:translateY(24px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes drift     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
  @keyframes drift2    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(12px)} }
  @keyframes pulse     { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.2)} }
  @keyframes lineGrow  { from{height:0} to{height:100%} }
  @keyframes dotPop    { from{transform:scale(0) rotate(-20deg)} 70%{transform:scale(1.2) rotate(5deg)} to{transform:scale(1) rotate(0)} }
  @keyframes overlayIn { from{opacity:0} to{opacity:1} }
  @keyframes modalUp   { from{opacity:0;transform:scale(.94) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes shimmer   { 0%{background-position:200% center} 100%{background-position:-200% center} }

  html,body{height:100%}
  body,.mh-root{font-family:'Sora',sans-serif;background:#050d1a;color:#fff;min-height:100vh;overflow-x:hidden}

  /* bg */
  .mh-grid{position:fixed;inset:0;z-index:0;pointer-events:none;
    background-image:linear-gradient(rgba(255,255,255,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.022) 1px,transparent 1px);
    background-size:52px 52px}
  .mh-orb{position:fixed;border-radius:50%;filter:blur(100px);pointer-events:none;z-index:0}
  .mh-orb1{width:500px;height:500px;background:radial-gradient(circle,rgba(56,182,255,.1) 0%,transparent 70%);top:-150px;right:-80px;animation:drift 11s ease-in-out infinite}
  .mh-orb2{width:380px;height:380px;background:radial-gradient(circle,rgba(99,102,241,.09) 0%,transparent 70%);bottom:-80px;left:-60px;animation:drift2 13s ease-in-out infinite}

  /* header */
  .mh-header{position:sticky;top:0;z-index:40;background:rgba(5,13,26,.85);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,.06);padding:0 36px;height:68px;display:flex;align-items:center;justify-content:space-between;animation:fadeUp .4s both;flex-shrink:0}
  .mh-header-left{display:flex;align-items:center;gap:16px}
  .mh-back{width:36px;height:36px;border-radius:10px;border:1.5px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;transition:all .18s;flex-shrink:0}
  .mh-back:hover{border-color:rgba(56,182,255,.4);background:rgba(56,182,255,.08)}
  .mh-header-title{font-family:'Instrument Serif',serif;font-size:22px;color:#fff}
  .mh-header-sub{font-size:12px;color:rgba(255,255,255,.3);margin-top:1px}
  .mh-header-right{display:flex;align-items:center;gap:10px}
  .mh-export-btn{padding:9px 18px;border-radius:11px;border:1.5px solid rgba(56,182,255,.2);background:rgba(56,182,255,.07);color:#38b6ff;font-size:12.5px;font-family:'Sora',sans-serif;font-weight:600;cursor:pointer;transition:all .18s;display:flex;align-items:center;gap:6px}
  .mh-export-btn:hover{background:rgba(56,182,255,.15);border-color:rgba(56,182,255,.4)}

  /* ── Transparent Scrollbar (ONLY ADD THIS) ── */

/* Chrome / Edge / Safari */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.10);
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: content-box;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(56, 182, 255, 0.35);
  background-clip: content-box;
}

/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.15) transparent;
}
  /* main */
  .mh-main{max-width:1100px;margin:0 auto;padding:36px 36px;position:relative;z-index:1}
  @media(max-width:700px){.mh-main{padding:20px 16px}}

  /* stat cards */
  .mh-stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:32px}
  @media(max-width:900px){.mh-stat-grid{grid-template-columns:repeat(2,1fr)}}
  .mh-stat-card{border-radius:18px;background:rgba(255,255,255,.03);border:1.5px solid rgba(255,255,255,.07);padding:20px 18px;transition:all .25s;position:relative;overflow:hidden;cursor:pointer;opacity:0}
  .mh-stat-card:hover{transform:translateY(-3px);box-shadow:0 16px 40px rgba(0,0,0,.25)}
  .mh-stat-card.active-filter{border-color:rgba(56,182,255,.4);background:rgba(56,182,255,.08)}
  .mh-stat-card::before{content:'';position:absolute;inset:0;opacity:0;transition:opacity .3s;border-radius:18px;pointer-events:none}
  .mh-stat-card:hover::before,.mh-stat-card.active-filter::before{opacity:1}
  .mh-stat-card.t1::before{background:radial-gradient(ellipse at top left,rgba(99,102,241,.1),transparent 60%)}
  .mh-stat-card.t2::before{background:radial-gradient(ellipse at top left,rgba(52,211,153,.1),transparent 60%)}
  .mh-stat-card.t3::before{background:radial-gradient(ellipse at top left,rgba(56,182,255,.1),transparent 60%)}
  .mh-stat-card.t4::before{background:radial-gradient(ellipse at top left,rgba(248,113,113,.1),transparent 60%)}
  .mh-stat-icon{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:19px;margin-bottom:12px}
  .mh-stat-icon.i1{background:rgba(99,102,241,.12);border:1px solid rgba(99,102,241,.2)}
  .mh-stat-icon.i2{background:rgba(52,211,153,.12);border:1px solid rgba(52,211,153,.2)}
  .mh-stat-icon.i3{background:rgba(56,182,255,.12);border:1px solid rgba(56,182,255,.2)}
  .mh-stat-icon.i4{background:rgba(248,113,113,.12);border:1px solid rgba(248,113,113,.2)}
  .mh-stat-num{font-family:'Instrument Serif',serif;font-size:30px;color:#fff;margin-bottom:3px}
  .mh-stat-lbl{font-size:12px;color:rgba(255,255,255,.35)}
  .mh-stat-hint{font-size:10.5px;color:rgba(255,255,255,.22);margin-top:5px}

  /* search & filter bar */
  .mh-toolbar{display:flex;align-items:center;gap:12px;margin-bottom:28px;animation:fadeUp .45s .18s both;flex-wrap:wrap}
  .mh-search-wrap{position:relative;flex:1;min-width:200px}
  .mh-search-icon{position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:15px;pointer-events:none}
  .mh-search{width:100%;background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.08);border-radius:12px;padding:11px 14px 11px 40px;color:#fff;font-size:13.5px;font-family:'Sora',sans-serif;outline:none;transition:border-color .2s,box-shadow .2s}
  .mh-search::placeholder{color:rgba(255,255,255,.22)}
  .mh-search:focus{border-color:#38b6ff;box-shadow:0 0 0 3px rgba(56,182,255,.1)}
  .mh-filter-pills{display:flex;gap:6px;flex-wrap:wrap}
  .mh-pill{padding:7px 14px;border-radius:20px;border:1.5px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:rgba(255,255,255,.5);font-size:12px;font-family:'Sora',sans-serif;font-weight:500;cursor:pointer;transition:all .18s;white-space:nowrap}
  .mh-pill:hover{border-color:rgba(56,182,255,.35);color:rgba(255,255,255,.8)}
  .mh-pill.active{border-color:#38b6ff;background:rgba(56,182,255,.12);color:#38b6ff}

  /* timeline */
  .mh-timeline-wrap{position:relative}
  .mh-timeline-item{display:flex;gap:20px;position:relative;margin-bottom:0}
  .mh-timeline-left{display:flex;flex-direction:column;align-items:center;flex-shrink:0;width:48px}
  .mh-timeline-dot{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:19px;z-index:1;flex-shrink:0;animation:dotPop .4s cubic-bezier(.34,1.56,.64,1) both}
  .mh-timeline-dot.c1{background:rgba(99,102,241,.15);border:2px solid rgba(99,102,241,.4)}
  .mh-timeline-dot.c2{background:rgba(52,211,153,.15);border:2px solid rgba(52,211,153,.4)}
  .mh-timeline-dot.c3{background:rgba(56,182,255,.15);border:2px solid rgba(56,182,255,.4)}
  .mh-timeline-dot.c4{background:rgba(248,113,113,.15);border:2px solid rgba(248,113,113,.4)}
  .mh-timeline-line{width:2px;flex:1;background:linear-gradient(rgba(255,255,255,.08),rgba(255,255,255,.03));min-height:28px;margin-top:6px;border-radius:2px}
  .mh-timeline-content{flex:1;padding-bottom:28px}
  .mh-event-card{border-radius:18px;background:rgba(255,255,255,.03);border:1.5px solid rgba(255,255,255,.07);padding:20px 22px;transition:all .25s;cursor:pointer;position:relative;overflow:hidden}
  .mh-event-card:hover{transform:translateY(-2px);border-color:rgba(56,182,255,.22);box-shadow:0 14px 40px rgba(0,0,0,.25)}
  .mh-event-card::before{content:'';position:absolute;inset:0;opacity:0;transition:opacity .25s;border-radius:18px;pointer-events:none}
  .mh-event-card:hover::before{opacity:1}
  .mh-event-card.c1::before{background:radial-gradient(ellipse at top left,rgba(99,102,241,.07),transparent 60%)}
  .mh-event-card.c2::before{background:radial-gradient(ellipse at top left,rgba(52,211,153,.07),transparent 60%)}
  .mh-event-card.c3::before{background:radial-gradient(ellipse at top left,rgba(56,182,255,.07),transparent 60%)}
  .mh-event-card.c4::before{background:radial-gradient(ellipse at top left,rgba(248,113,113,.07),transparent 60%)}
  .mh-event-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px}
  .mh-event-title{font-size:15px;font-weight:700;color:#fff;margin-bottom:4px}
  .mh-event-date{display:flex;align-items:center;gap:5px;font-size:12px;color:rgba(255,255,255,.38)}
  .mh-event-badge{padding:3px 10px;border-radius:10px;font-size:10.5px;font-weight:600;white-space:nowrap;flex-shrink:0}
  .mh-event-badge.checkup{background:rgba(99,102,241,.12);color:#a5b4fc;border:1px solid rgba(99,102,241,.2)}
  .mh-event-badge.prescription{background:rgba(52,211,153,.12);color:#34d399;border:1px solid rgba(52,211,153,.2)}
  .mh-event-badge.test{background:rgba(56,182,255,.12);color:#38b6ff;border:1px solid rgba(56,182,255,.2)}
  .mh-event-badge.diagnosis{background:rgba(248,113,113,.12);color:#f87171;border:1px solid rgba(248,113,113,.2)}
  .mh-event-desc{font-size:13px;color:rgba(255,255,255,.55);line-height:1.65;margin-bottom:8px}
  .mh-event-doctor{font-size:12px;color:rgba(255,255,255,.35);display:flex;align-items:center;gap:5px}
  .mh-event-arrow{position:absolute;bottom:18px;right:18px;font-size:13px;color:rgba(255,255,255,.2);transition:all .2s}
  .mh-event-card:hover .mh-event-arrow{color:#38b6ff;transform:translateX(3px)}

  /* empty */
  .mh-empty{text-align:center;padding:80px 20px;animation:fadeIn .4s both}
  .mh-empty-icon{font-size:52px;margin-bottom:16px}
  .mh-empty-title{font-family:'Instrument Serif',serif;font-size:22px;color:#fff;margin-bottom:8px}
  .mh-empty-sub{font-size:13.5px;color:rgba(255,255,255,.35)}

  /* detail modal */
  .mh-overlay{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.72);backdrop-filter:blur(10px);animation:overlayIn .22s both;display:flex;align-items:center;justify-content:center;padding:20px}
  .mh-modal{background:#070e1c;border:1px solid rgba(255,255,255,.1);border-radius:26px;max-width:500px;width:100%;animation:modalUp .3s cubic-bezier(.34,1.4,.64,1) both;box-shadow:0 40px 100px rgba(0,0,0,.65);overflow:hidden}
  .mh-modal-header{padding:26px 26px 20px;border-bottom:1px solid rgba(255,255,255,.07);display:flex;align-items:center;gap:14px}
  .mh-modal-dot{width:52px;height:52px;border-radius:15px;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0}
  .mh-modal-dot.c1{background:rgba(99,102,241,.15);border:1.5px solid rgba(99,102,241,.3)}
  .mh-modal-dot.c2{background:rgba(52,211,153,.15);border:1.5px solid rgba(52,211,153,.3)}
  .mh-modal-dot.c3{background:rgba(56,182,255,.15);border:1.5px solid rgba(56,182,255,.3)}
  .mh-modal-dot.c4{background:rgba(248,113,113,.15);border:1.5px solid rgba(248,113,113,.3)}
  .mh-modal-title{font-family:'Instrument Serif',serif;font-size:20px;color:#fff;margin-bottom:4px}
  .mh-modal-type{font-size:12px;color:rgba(255,255,255,.38)}
  .mh-modal-close{margin-left:auto;width:30px;height:30px;border-radius:8px;border:none;background:rgba(255,255,255,.06);color:rgba(255,255,255,.45);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;line-height:1;flex-shrink:0}
  .mh-modal-close:hover{background:rgba(255,255,255,.12);color:#fff}
  .mh-modal-body{padding:24px 26px}
  .mh-detail-row{display:flex;align-items:flex-start;gap:12px;padding:12px 14px;border-radius:12px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);margin-bottom:8px}
  .mh-detail-label{font-size:11px;color:rgba(255,255,255,.35);text-transform:uppercase;letter-spacing:.6px;font-weight:600;width:90px;flex-shrink:0;padding-top:1px}
  .mh-detail-val{font-size:13.5px;color:rgba(255,255,255,.8);line-height:1.55}
  .mh-modal-footer{padding:0 26px 26px;display:flex;gap:10px}
  .mh-modal-btn-sec{flex:1;padding:11px;border-radius:12px;border:1.5px solid rgba(255,255,255,.1);background:transparent;color:rgba(255,255,255,.55);font-size:13px;font-family:'Sora',sans-serif;cursor:pointer;transition:all .15s}
  .mh-modal-btn-sec:hover{border-color:rgba(255,255,255,.22);color:#fff}
  .mh-modal-btn-pri{flex:2;padding:11px;border-radius:12px;border:none;background:linear-gradient(135deg,#38b6ff,#6366f1);color:#fff;font-size:13px;font-family:'Sora',sans-serif;font-weight:600;cursor:pointer;transition:transform .15s,box-shadow .15s;position:relative;overflow:hidden}
  .mh-modal-btn-pri::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.1),transparent);pointer-events:none}
  .mh-modal-btn-pri:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(56,182,255,.35)}
`;

// ── data ──────────────────────────────────────────────────────────────────────
interface MedicalEvent {
  id: number; type:"checkup"|"prescription"|"test"|"diagnosis";
  icon:string; color:string; dotCls:string;
  title:string; doctor:string; date:string; description:string;
  details: Record<string,string>;
}

const HISTORY: MedicalEvent[] = [
  { id:1, type:"test",         icon:"🧪", color:"c3", dotCls:"c3",
    title:"Blood Test Results",          doctor:"Dr. Sarah Smith",      date:"March 5, 2026",
    description:"Complete Blood Count — All values within normal range.",
    details:{ Result:"All values normal", "Hemoglobin":"14.2 g/dL", "WBC":"6,500/μL", "Platelets":"210,000/μL", Notes:"No follow-up required" } },
  { id:2, type:"prescription", icon:"💊", color:"c2", dotCls:"c2",
    title:"Prescribed Amoxicillin",       doctor:"Dr. Michael Chen",     date:"Feb 20, 2026",
    description:"500mg, 3 times daily for 7 days — Respiratory Infection.",
    details:{ Medication:"Amoxicillin 500mg", Frequency:"3× daily", Duration:"7 days", Reason:"Respiratory Infection", Refills:"None" } },
  { id:3, type:"checkup",      icon:"🩺", color:"c1", dotCls:"c1",
    title:"Annual General Checkup",       doctor:"Dr. Sarah Smith",      date:"Jan 10, 2026",
    description:"Annual physical examination — No issues found, all vitals normal.",
    details:{ BP:"118/76 mmHg", Pulse:"72 bpm", Weight:"68 kg", BMI:"22.4", Outcome:"No concerns" } },
  { id:4, type:"diagnosis",    icon:"🤒", color:"c4", dotCls:"c4",
    title:"Seasonal Flu Diagnosis",       doctor:"Dr. Emily Williams",   date:"Dec 15, 2025",
    description:"Diagnosed with seasonal influenza. Prescribed rest and medication.",
    details:{ Diagnosis:"Influenza Type A", Severity:"Moderate", Treatment:"Tamiflu 75mg + rest", "Follow-up":"Dec 22, 2025", Outcome:"Resolved" } },
  { id:5, type:"test",         icon:"🫁", color:"c3", dotCls:"c3",
    title:"Chest X-Ray",                  doctor:"Dr. Robert Martinez",  date:"Nov 8, 2025",
    description:"Chest X-ray completed — No abnormalities detected.",
    details:{ Result:"Clear", Findings:"No infiltrates or masses", Radiologist:"Dr. Martinez", Report:"Normal", "Next scan":"Annually" } },
  { id:6, type:"prescription", icon:"💊", color:"c2", dotCls:"c2",
    title:"Prescribed Ibuprofen",         doctor:"Dr. Sarah Smith",      date:"Oct 22, 2025",
    description:"400mg as needed for pain management — Minor back strain.",
    details:{ Medication:"Ibuprofen 400mg", Frequency:"As needed (max 3×/day)", Duration:"2 weeks", Reason:"Minor lumbar strain", Notes:"Apply heat, avoid heavy lifting" } },
  { id:7, type:"checkup",      icon:"🦷", color:"c1", dotCls:"c1",
    title:"Dental Checkup",               doctor:"Dr. Sarah Williams",   date:"Sep 5, 2025",
    description:"Routine dental examination and cleaning — Good oral health.",
    details:{ Cavities:"None", Cleaning:"Completed", Xrays:"Normal", Recommendation:"6-month follow-up", Outcome:"Excellent" } },
  { id:8, type:"test",         icon:"❤️", color:"c3", dotCls:"c3",
    title:"24-hr Blood Pressure Monitor", doctor:"Dr. Michael Chen",     date:"Aug 12, 2025",
    description:"24-hour blood pressure monitoring — Readings within normal limits.",
    details:{ "Avg Daytime":"122/79 mmHg", "Avg Nighttime":"108/68 mmHg", "Peak":"138/86 mmHg", Variability:"Normal", Conclusion:"No hypertension" } },
];

const STAT_TYPES = [
  { key:"all",          label:"All Records",   icon:"🗂️", cls:"t1", icls:"i1", hint:"Click to show all" },
  { key:"checkup",      label:"Checkups",      icon:"🩺", cls:"t2", icls:"i2", hint:"Tap to filter" },
  { key:"prescription", label:"Prescriptions", icon:"💊", cls:"t3", icls:"i3", hint:"Tap to filter" },
  { key:"test",         label:"Tests",         icon:"🧪", cls:"t4", icls:"i4", hint:"Tap to filter" },
  // diagnosises lumped under separate state handled in component
];

const TYPE_LABELS: Record<string,string> = {
  checkup:"Checkup", prescription:"Prescription", test:"Test", diagnosis:"Diagnosis"
};

// ── component ─────────────────────────────────────────────────────────────────
export default function MedicalHistory() {
  const navigate = useNavigate();
  const [filter,   setFilter]   = useState("all");
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState<MedicalEvent | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = "mh-styles";
    if (!document.getElementById(id)) {
      const s = document.createElement("style"); s.id = id; s.textContent = STYLES;
      document.head.appendChild(s);
    }
  }, []);

  // stagger card animations
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement;
          el.style.animation = `cardIn .5s ${i * 0.06}s cubic-bezier(.34,1.2,.64,1) both`;
        }
      });
    }, { threshold:0.08 });
    document.querySelectorAll(".mh-stat-card,.mh-event-card").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });

  const counts = {
    all:          HISTORY.length,
    checkup:      HISTORY.filter(e => e.type === "checkup").length,
    prescription: HISTORY.filter(e => e.type === "prescription").length,
    test:         HISTORY.filter(e => e.type === "test").length,
    diagnosis:    HISTORY.filter(e => e.type === "diagnosis").length,
  };

  const filtered = HISTORY.filter(e => {
    const q = search.toLowerCase();
    const matchSearch = e.title.toLowerCase().includes(q) ||
                        e.doctor.toLowerCase().includes(q) ||
                        e.description.toLowerCase().includes(q);
    const matchFilter = filter === "all" || e.type === filter;
    return matchSearch && matchFilter;
  });

  const handleExport = () => {
    const lines = ["CureAI — Medical History Export", "=" .repeat(40), ""];
    filtered.forEach(e => {
      lines.push(`[${e.date}] ${e.title}`);
      lines.push(`Type: ${TYPE_LABELS[e.type]}  |  Provider: ${e.doctor}`);
      lines.push(e.description);
      lines.push("");
    });
    const blob = new Blob([lines.join("\n")], { type:"text/plain" });
    const a    = document.createElement("a");
    a.href     = URL.createObjectURL(blob);
    a.download = "medical-history.txt";
    a.click();
  };

  return (
    <div className="mh-root">
      <style>{STYLES}</style>
      <div className="mh-grid"/>
      <div className="mh-orb mh-orb1"/><div className="mh-orb mh-orb2"/>

      {/* ── Header ── */}
      <header className="mh-header">
        <div className="mh-header-left">
          <button className="mh-back" onClick={() => navigate("/patient/dashboard")}>←</button>
          <div>
            <div className="mh-header-title">Medical History</div>
            <div className="mh-header-sub">Your complete health timeline</div>
          </div>
        </div>
        <div className="mh-header-right">
          <button className="mh-export-btn" onClick={handleExport}>
            📄 Export
          </button>
        </div>
      </header>

      <main className="mh-main" ref={mainRef}>

        {/* Stat filter cards */}
        <div className="mh-stat-grid" style={{animation:"fadeUp .5s .08s both"}}>
          {[
            { key:"all",          label:"All Records",   icon:"🗂️", cls:"t1", icls:"i1", count: counts.all },
            { key:"checkup",      label:"Checkups",      icon:"🩺", cls:"t2", icls:"i2", count: counts.checkup },
            { key:"prescription", label:"Prescriptions", icon:"💊", cls:"t3", icls:"i3", count: counts.prescription },
            { key:"test",         label:"Tests & Labs",  icon:"🧪", cls:"t4", icls:"i4", count: counts.test },
          ].map(s => (
            <div
              key={s.key}
              className={`mh-stat-card ${s.cls}${filter === s.key ? " active-filter" : ""}`}
              onClick={() => setFilter(s.key)}
            >
              <div className={`mh-stat-icon ${s.icls}`}>{s.icon}</div>
              <div className="mh-stat-num">{s.count}</div>
              <div className="mh-stat-lbl">{s.label}</div>
              <div className="mh-stat-hint">{filter === s.key ? "✓ Active filter" : "Click to filter"}</div>
            </div>
          ))}
        </div>

        {/* Search + filter pills */}
        <div className="mh-toolbar">
          <div className="mh-search-wrap">
            <span className="mh-search-icon">🔍</span>
            <input
              className="mh-search"
              placeholder="Search by title, doctor, or description…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="mh-filter-pills">
            {(["all","checkup","prescription","test","diagnosis"] as const).map(t => (
              <button
                key={t}
                className={`mh-pill${filter === t ? " active" : ""}`}
                onClick={() => setFilter(t)}
              >
                {t === "all" ? "All" : TYPE_LABELS[t] + "s"}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        {filtered.length > 0 ? (
          <div className="mh-timeline-wrap">
            {filtered.map((event, i) => (
              <div className="mh-timeline-item" key={event.id}>
                <div className="mh-timeline-left">
                  <div
                    className={`mh-timeline-dot ${event.dotCls}`}
                    style={{ animationDelay:`${i * 0.05}s` }}
                  >
                    {event.icon}
                  </div>
                  {i < filtered.length - 1 && <div className="mh-timeline-line"/>}
                </div>

                <div className="mh-timeline-content">
                  <div
                    className={`mh-event-card ${event.color}`}
                    style={{opacity:0}}
                    onClick={() => setSelected(event)}
                  >
                    <div className="mh-event-top">
                      <div>
                        <div className="mh-event-title">{event.title}</div>
                        <div className="mh-event-date">📅 {event.date}</div>
                      </div>
                      <span className={`mh-event-badge ${event.type}`}>{TYPE_LABELS[event.type]}</span>
                    </div>
                    <div className="mh-event-desc">{event.description}</div>
                    <div className="mh-event-doctor">🩺 {event.doctor}</div>
                    <span className="mh-event-arrow">→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mh-empty">
            <div className="mh-empty-icon">🔍</div>
            <div className="mh-empty-title">No records found</div>
            <div className="mh-empty-sub">Try adjusting your search or filter</div>
          </div>
        )}
      </main>

      {/* ── Detail Modal ── */}
      {selected && (
        <div className="mh-overlay" onClick={() => setSelected(null)}>
          <div className="mh-modal" onClick={e => e.stopPropagation()}>
            <div className="mh-modal-header">
              <div className={`mh-modal-dot ${selected.dotCls}`}>{selected.icon}</div>
              <div>
                <div className="mh-modal-title">{selected.title}</div>
                <div className="mh-modal-type">
                  <span className={`mh-event-badge ${selected.type}`} style={{fontSize:"11px"}}>
                    {TYPE_LABELS[selected.type]}
                  </span>
                </div>
              </div>
              <button className="mh-modal-close" onClick={() => setSelected(null)}>×</button>
            </div>

            <div className="mh-modal-body">
              {/* Core details */}
              <div className="mh-detail-row">
                <span className="mh-detail-label">Date</span>
                <span className="mh-detail-val">📅 {selected.date}</span>
              </div>
              <div className="mh-detail-row">
                <span className="mh-detail-label">Provider</span>
                <span className="mh-detail-val">🩺 {selected.doctor}</span>
              </div>
              <div className="mh-detail-row">
                <span className="mh-detail-label">Summary</span>
                <span className="mh-detail-val">{selected.description}</span>
              </div>

              {/* Extra details */}
              {Object.entries(selected.details).map(([k, v]) => (
                <div className="mh-detail-row" key={k}>
                  <span className="mh-detail-label">{k}</span>
                  <span className="mh-detail-val">{v}</span>
                </div>
              ))}
            </div>

            <div className="mh-modal-footer">
              <button className="mh-modal-btn-sec" onClick={() => setSelected(null)}>Close</button>
              <button
                className="mh-modal-btn-pri"
                onClick={() => { setSelected(null); navigate("/patient/appointments"); }}
              >
                Book Follow-up →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}