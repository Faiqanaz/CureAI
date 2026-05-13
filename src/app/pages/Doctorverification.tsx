// ─── DoctorVerification.tsx ──────────────────────────────────────────────────
// Developer / Admin tool to approve or reject pending doctor registrations.
// Add this route in your router:
//   <Route path="/admin/verify-doctors" element={<DoctorVerification />} />
// Then open: http://localhost:5173/admin/verify-doctors

import { useState, useEffect } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

  @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes cardIn  { from{opacity:0;transform:translateY(16px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes checkPop{ 0%{transform:scale(0) rotate(-15deg)} 70%{transform:scale(1.2) rotate(4deg)} 100%{transform:scale(1) rotate(0)} }
  @keyframes pulse   { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.2)} }

  html,body,.dv-root { font-family:'Sora',sans-serif; background:#050d1a; color:#fff; min-height:100vh; }
  .dv-root { padding:32px 36px; }

  .dv-grid { position:fixed; inset:0; z-index:0; pointer-events:none;
    background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);
    background-size:52px 52px; }

  /* header */
  .dv-header { position:relative; z-index:1; max-width:900px; margin:0 auto 36px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; animation:fadeUp .4s both; }
  .dv-brand  { display:flex; align-items:center; gap:12px; }
  .dv-brand-icon { width:44px; height:44px; border-radius:13px; background:linear-gradient(135deg,#38b6ff,#6366f1); display:flex; align-items:center; justify-content:center; font-size:20px; box-shadow:0 5px 16px rgba(56,182,255,.35); }
  .dv-brand-text { font-family:'Instrument Serif',serif; font-size:22px; color:#fff; }
  .dv-brand-sub  { font-size:11px; color:rgba(255,255,255,.35); letter-spacing:.6px; text-transform:uppercase; margin-top:1px; }
  .dv-admin-badge { padding:6px 14px; border-radius:10px; background:rgba(248,113,113,.1); border:1.5px solid rgba(248,113,113,.25); font-size:12px; color:#f87171; font-weight:600; }

  /* stat row */
  .dv-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; max-width:900px; margin:0 auto 28px; }
  @media(max-width:600px){ .dv-stats{ grid-template-columns:1fr; } }
  .dv-stat { border-radius:16px; background:rgba(255,255,255,.03); border:1.5px solid rgba(255,255,255,.07); padding:18px 20px; position:relative; z-index:1; animation:cardIn .4s both; }
  .dv-stat-num { font-family:'Instrument Serif',serif; font-size:32px; color:#fff; }
  .dv-stat-lbl { font-size:12px; color:rgba(255,255,255,.35); margin-top:3px; text-transform:uppercase; letter-spacing:.5px; }

  /* empty */
  .dv-empty { text-align:center; padding:80px 20px; position:relative; z-index:1; animation:fadeIn .4s both; }
  .dv-empty-icon  { font-size:52px; margin-bottom:16px; }
  .dv-empty-title { font-family:'Instrument Serif',serif; font-size:24px; color:#fff; margin-bottom:8px; }
  .dv-empty-sub   { font-size:14px; color:rgba(255,255,255,.35); }

  /* doctor cards */
  .dv-list { max-width:900px; margin:0 auto; position:relative; z-index:1; }
  .dv-section-title { font-size:12px; color:rgba(255,255,255,.35); text-transform:uppercase; letter-spacing:.8px; font-weight:600; margin-bottom:12px; }

  .dv-card { border-radius:18px; background:rgba(255,255,255,.03); border:1.5px solid rgba(255,255,255,.07); padding:22px 24px; margin-bottom:12px; transition:all .22s; animation:cardIn .4s both; }
  .dv-card.pending  { border-color:rgba(251,191,36,.2); }
  .dv-card.approved { border-color:rgba(52,211,153,.2); background:rgba(52,211,153,.03); }
  .dv-card.rejected { border-color:rgba(248,113,113,.15); background:rgba(248,113,113,.02); opacity:.7; }

  .dv-card-top { display:flex; align-items:center; gap:16px; margin-bottom:16px; }
  .dv-av { width:46px; height:46px; border-radius:13px; background:linear-gradient(135deg,#38b6ff,#6366f1); display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:700; font-family:'Instrument Serif',serif; color:#fff; flex-shrink:0; }
  .dv-av.approved { background:linear-gradient(135deg,#34d399,#38b6ff); }
  .dv-av.rejected { background:rgba(255,255,255,.08); }
  .dv-name { font-size:16px; font-weight:700; color:#fff; margin-bottom:3px; }
  .dv-email{ font-size:12.5px; color:rgba(255,255,255,.45); }
  .dv-badge { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:10px; font-size:10.5px; font-weight:600; margin-left:auto; white-space:nowrap; }
  .dv-badge.pending  { background:rgba(251,191,36,.12); color:#fbbf24; border:1px solid rgba(251,191,36,.25); }
  .dv-badge.approved { background:rgba(52,211,153,.12); color:#34d399; border:1px solid rgba(52,211,153,.25); }
  .dv-badge.rejected { background:rgba(248,113,113,.12); color:#f87171; border:1px solid rgba(248,113,113,.25); }
  .dv-badge-dot { width:5px; height:5px; border-radius:50%; background:currentColor; animation:pulse 2s ease-in-out infinite; }

  .dv-details { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:16px; }
  @media(max-width:600px){ .dv-details{ grid-template-columns:1fr 1fr; } }
  .dv-detail { background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.06); border-radius:10px; padding:9px 12px; }
  .dv-detail-key { font-size:10.5px; color:rgba(255,255,255,.3); text-transform:uppercase; letter-spacing:.5px; margin-bottom:3px; }
  .dv-detail-val { font-size:13px; color:rgba(255,255,255,.8); font-weight:500; }

  .dv-actions { display:flex; gap:10px; flex-wrap:wrap; }
  .dv-btn-approve { padding:10px 22px; border-radius:11px; border:none; background:linear-gradient(135deg,#34d399,#38b6ff); color:#fff; font-size:13px; font-family:'Sora',sans-serif; font-weight:600; cursor:pointer; transition:transform .18s,box-shadow .18s; display:flex; align-items:center; gap:6px; }
  .dv-btn-approve:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(52,211,153,.35); }
  .dv-btn-reject  { padding:10px 22px; border-radius:11px; border:1.5px solid rgba(248,113,113,.25); background:rgba(248,113,113,.08); color:#f87171; font-size:13px; font-family:'Sora',sans-serif; font-weight:600; cursor:pointer; transition:all .18s; display:flex; align-items:center; gap:6px; }
  .dv-btn-reject:hover  { background:rgba(248,113,113,.16); border-color:rgba(248,113,113,.45); }
  .dv-btn-undo    { padding:10px 18px; border-radius:11px; border:1.5px solid rgba(255,255,255,.1); background:transparent; color:rgba(255,255,255,.45); font-size:13px; font-family:'Sora',sans-serif; cursor:pointer; transition:all .18s; }
  .dv-btn-undo:hover { border-color:rgba(255,255,255,.25); color:#fff; }
  .dv-approved-stamp { display:flex; align-items:center; gap:8px; font-size:13px; color:#34d399; }
  .dv-approved-check { width:28px; height:28px; border-radius:50%; background:linear-gradient(135deg,#34d399,#38b6ff); display:flex; align-items:center; justify-content:center; font-size:14px; animation:checkPop .4s cubic-bezier(.34,1.56,.64,1) both; }

  /* toast */
  .dv-toast { position:fixed; bottom:24px; right:24px; z-index:400; padding:13px 20px; border-radius:13px; background:#070e1c; border:1px solid rgba(52,211,153,.3); color:#34d399; font-size:13px; font-family:'Sora',sans-serif; font-weight:500; box-shadow:0 16px 48px rgba(0,0,0,.5); animation:fadeUp .3s both; display:flex; align-items:center; gap:10px; }
  .dv-toast.err { border-color:rgba(248,113,113,.3); color:#f87171; }

  /* refresh btn */
  .dv-refresh { padding:9px 18px; border-radius:10px; border:1.5px solid rgba(255,255,255,.1); background:rgba(255,255,255,.04); color:rgba(255,255,255,.55); font-size:12.5px; font-family:'Sora',sans-serif; cursor:pointer; transition:all .18s; }
  .dv-refresh:hover { border-color:rgba(56,182,255,.35); color:#38b6ff; background:rgba(56,182,255,.07); }

  /* how-to box */
  .dv-howto { max-width:900px; margin:0 auto 28px; background:rgba(56,182,255,.05); border:1px solid rgba(56,182,255,.15); border-radius:16px; padding:18px 22px; position:relative; z-index:1; animation:fadeUp .4s .1s both; }
  .dv-howto-title { font-size:12px; color:#38b6ff; text-transform:uppercase; letter-spacing:.7px; font-weight:600; margin-bottom:8px; }
  .dv-howto-text  { font-size:13px; color:rgba(255,255,255,.5); line-height:1.65; }
  .dv-howto-text code { background:rgba(255,255,255,.08); padding:1px 6px; border-radius:5px; font-size:12px; color:#a5b4fc; }
`;

interface PendingDoctor {
  name:         string;
  email:        string;
  age:          number;
  gender:       string;
  registeredAt: string;
  status:       "pending" | "approved" | "rejected";
}

export default function DoctorVerification() {
  const [doctors, setDoctors] = useState<PendingDoctor[]>([]);
  const [toast,   setToast]   = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  useEffect(() => {
    const id = "dv-styles";
    if (!document.getElementById(id)) {
      const s = document.createElement("style"); s.id = id; s.textContent = STYLES;
      document.head.appendChild(s);
    }
    load();
  }, []);

  const load = () => {
    const raw = localStorage.getItem("cureai_pending_doctors");
    setDoctors(raw ? JSON.parse(raw) : []);
  };

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Approve: set verified:true in cureai_users, update status ──
  const approve = (email: string) => {
    // 1. Update cureai_pending_doctors
    const updated = doctors.map(d =>
      d.email === email ? { ...d, status: "approved" as const } : d
    );
    setDoctors(updated);
    localStorage.setItem("cureai_pending_doctors", JSON.stringify(updated));

    // 2. Update cureai_users → set verified:true
    const users: any[] = JSON.parse(localStorage.getItem("cureai_users") || "[]");
    const updatedUsers = users.map((u: any) =>
      u.email === email ? { ...u, verified: true } : u
    );
    localStorage.setItem("cureai_users", JSON.stringify(updatedUsers));

    const doc = doctors.find(d => d.email === email);
    showToast(`✓ Dr. ${doc?.name} approved — they can now log in`);
  };

  // ── Reject: set verified:false, mark rejected ──
  const reject = (email: string) => {
    const updated = doctors.map(d =>
      d.email === email ? { ...d, status: "rejected" as const } : d
    );
    setDoctors(updated);
    localStorage.setItem("cureai_pending_doctors", JSON.stringify(updated));

    const users: any[] = JSON.parse(localStorage.getItem("cureai_users") || "[]");
    const updatedUsers = users.map((u: any) =>
      u.email === email ? { ...u, verified: false } : u
    );
    localStorage.setItem("cureai_users", JSON.stringify(updatedUsers));

    const doc = doctors.find(d => d.email === email);
    showToast(`✗ Dr. ${doc?.name} rejected`, "err");
  };

  // ── Undo (back to pending) ──
  const undo = (email: string) => {
    const updated = doctors.map(d =>
      d.email === email ? { ...d, status: "pending" as const } : d
    );
    setDoctors(updated);
    localStorage.setItem("cureai_pending_doctors", JSON.stringify(updated));

    const users: any[] = JSON.parse(localStorage.getItem("cureai_users") || "[]");
    const updatedUsers = users.map((u: any) =>
      u.email === email ? { ...u, verified: false } : u
    );
    localStorage.setItem("cureai_users", JSON.stringify(updatedUsers));
    showToast("↩ Status reset to pending");
  };

  const pending  = doctors.filter(d => d.status === "pending");
  const approved = doctors.filter(d => d.status === "approved");
  const rejected = doctors.filter(d => d.status === "rejected");

  const fmtDate = (iso: string) => {
    try { return new Date(iso).toLocaleString("en-US", { month:"short", day:"numeric", year:"numeric", hour:"2-digit", minute:"2-digit" }); }
    catch { return iso; }
  };

  const renderCard = (doc: PendingDoctor, idx: number) => (
    <div key={doc.email} className={`dv-card ${doc.status}`} style={{ animationDelay:`${idx * 0.06}s` }}>
      <div className="dv-card-top">
        <div className={`dv-av ${doc.status !== "pending" ? doc.status : ""}`}>
          {doc.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
        </div>
        <div>
          <div className="dv-name">Dr. {doc.name}</div>
          <div className="dv-email">{doc.email}</div>
        </div>
        <span className={`dv-badge ${doc.status}`}>
          <span className="dv-badge-dot"/>
          {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
        </span>
      </div>

      <div className="dv-details">
        <div className="dv-detail">
          <div className="dv-detail-key">Age</div>
          <div className="dv-detail-val">{doc.age}</div>
        </div>
        <div className="dv-detail">
          <div className="dv-detail-key">Gender</div>
          <div className="dv-detail-val" style={{textTransform:"capitalize"}}>{doc.gender}</div>
        </div>
        <div className="dv-detail">
          <div className="dv-detail-key">Applied</div>
          <div className="dv-detail-val" style={{fontSize:11.5}}>{fmtDate(doc.registeredAt)}</div>
        </div>
      </div>

      <div className="dv-actions">
        {doc.status === "pending" && (
          <>
            <button className="dv-btn-approve" onClick={() => approve(doc.email)}>
              ✓ Approve Account
            </button>
            <button className="dv-btn-reject" onClick={() => reject(doc.email)}>
              ✗ Reject
            </button>
          </>
        )}
        {doc.status === "approved" && (
          <>
            <div className="dv-approved-stamp">
              <div className="dv-approved-check">✓</div>
              Account approved — doctor can log in
            </div>
            <button className="dv-btn-undo" onClick={() => undo(doc.email)}>↩ Undo</button>
          </>
        )}
        {doc.status === "rejected" && (
          <>
            <span style={{fontSize:13,color:"rgba(255,255,255,.35)"}}>✗ Application rejected</span>
            <button className="dv-btn-undo" onClick={() => undo(doc.email)}>↩ Undo</button>
            <button className="dv-btn-approve" onClick={() => approve(doc.email)} style={{marginLeft:"auto"}}>
              ✓ Approve Instead
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="dv-root">
      <style>{STYLES}</style>
      <div className="dv-grid"/>

      {/* Header */}
      <div className="dv-header">
        <div className="dv-brand">
          <div className="dv-brand-icon">🩺</div>
          <div>
            <div className="dv-brand-text">CureAI</div>
            <div className="dv-brand-sub">Doctor Verification Portal</div>
          </div>
        </div>
        <div style={{display:"flex",gap:"10px",alignItems:"center"}}>
          <button className="dv-refresh" onClick={load}>⟳ Refresh</button>
          <span className="dv-admin-badge">🔐 Dev / Admin Tool</span>
        </div>
      </div>

      {/* How-to */}
      <div className="dv-howto">
        <div className="dv-howto-title">📌 How to use this tool</div>
        <div className="dv-howto-text">
          This page shows all doctor accounts that registered via the signup page. 
          Click <strong style={{color:"#34d399"}}>Approve Account</strong> to allow a doctor to log in — their <code>verified</code> flag in <code>localStorage</code> is set to <code>true</code>.
          Pre-seeded doctors (Jane Doe, Michael Chen, etc.) are already verified and are not shown here.
          Route: <code>/admin/verify-doctors</code>
        </div>
      </div>

      {/* Stats */}
      <div className="dv-stats">
        <div className="dv-stat">
          <div className="dv-stat-num">{pending.length}</div>
          <div className="dv-stat-lbl">⏳ Pending Review</div>
        </div>
        <div className="dv-stat">
          <div className="dv-stat-num" style={{color:"#34d399"}}>{approved.length}</div>
          <div className="dv-stat-lbl">✅ Approved</div>
        </div>
        <div className="dv-stat">
          <div className="dv-stat-num" style={{color:"#f87171"}}>{rejected.length}</div>
          <div className="dv-stat-lbl">✗ Rejected</div>
        </div>
      </div>

      {/* List */}
      <div className="dv-list">
        {doctors.length === 0 ? (
          <div className="dv-empty">
            <div className="dv-empty-icon">📭</div>
            <div className="dv-empty-title">No applications yet</div>
            <div className="dv-empty-sub">
              When a new user signs up as a Doctor,<br/>their application will appear here for you to review.
            </div>
          </div>
        ) : (
          <>
            {pending.length > 0 && (
              <>
                <div className="dv-section-title">⏳ Pending Review ({pending.length})</div>
                {pending.map((d, i) => renderCard(d, i))}
              </>
            )}
            {approved.length > 0 && (
              <div style={{marginTop:24}}>
                <div className="dv-section-title">✅ Approved ({approved.length})</div>
                {approved.map((d, i) => renderCard(d, i))}
              </div>
            )}
            {rejected.length > 0 && (
              <div style={{marginTop:24}}>
                <div className="dv-section-title">✗ Rejected ({rejected.length})</div>
                {rejected.map((d, i) => renderCard(d, i))}
              </div>
            )}
          </>
        )}
      </div>

      {toast && <div className={`dv-toast${toast.type === "err" ? " err" : ""}`}>{toast.msg}</div>}
    </div>
  );
}