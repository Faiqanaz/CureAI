// ─── DoctorDashboard.tsx ──────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { DoctorSidebar, DOCTOR_STYLES } from "./DoctorSidebar";
import { getDoctorAppointments, saveDoctorAppointments, initDoctorAccounts } from "../data/initDoctors";

// Demo fallback appointments (shown when no real ones booked yet)
const DEMO_APPOINTMENTS = [
  { id:101, patient:"Demo Patient",    initials:"DP", avCls:"a1", time:"10:00 AM", type:"General Checkup",  status:"pending", notes:"Sample appointment", date:"Today" },
  { id:102, patient:"Sample Patient",  initials:"SP", avCls:"a2", time:"2:00 PM",  type:"Follow-up",         status:"pending", notes:"Routine follow-up",  date:"Today" },
];

const RECENT_PATIENTS = [
  { name:"Sarah Johnson",   age:34, condition:"Hypertension",    lastVisit:"Apr 20", avCls:"a1" },
  { name:"Michael Chen",    age:52, condition:"Diabetes Type 2", lastVisit:"Apr 19", avCls:"a2" },
  { name:"Emily Williams",  age:28, condition:"Anxiety",          lastVisit:"Apr 18", avCls:"a3" },
];

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [appts, setAppts] = useState<any[]>([]);
  const [toast, setToast] = useState<{msg:string;type:"ok"|"err"}|null>(null);

  const user       = (() => { try { return JSON.parse(localStorage.getItem("cureai_user") || "{}"); } catch { return {}; } })();
  const doctorName = user?.name || "Smith";
  const today      = new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" });

  // Load appointments from localStorage
  const loadAppts = () => {
    const stored = getDoctorAppointments(doctorName);
    // Show stored if any, otherwise show demo
    setAppts(stored.length > 0 ? stored : DEMO_APPOINTMENTS);
  };

  useEffect(() => {
    const id = "dr-styles";
    if (!document.getElementById(id)) {
      const s = document.createElement("style"); s.id = id; s.textContent = DOCTOR_STYLES;
      document.head.appendChild(s);
    }
    initDoctorAccounts();
    loadAppts();

    // Poll every 3s so dashboard auto-updates when patient books
    const interval = setInterval(loadAppts, 3000);
    return () => clearInterval(interval);
  }, [doctorName]);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) (e.target as HTMLElement).style.animation = `cardIn .5s ${i * 0.06}s cubic-bezier(.34,1.2,.64,1) both`;
      });
    }, { threshold:0.08 });
    document.querySelectorAll(".dr-stat-card,.dr-card").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [appts]);

  const showToast = (msg: string, type: "ok"|"err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAppt = (id: number, action: "accepted"|"rejected") => {
    const stored = getDoctorAppointments(doctorName);
    const isDemo = stored.length === 0;

    const updated = appts.map(a => a.id === id ? { ...a, status: action } : a);
    setAppts(updated);

    if (!isDemo) saveDoctorAppointments(doctorName, updated);

    const name = appts.find(a => a.id === id)?.patient;
    showToast(action === "accepted" ? `✓ Appointment with ${name} accepted` : `✗ Appointment with ${name} rejected`, action === "accepted" ? "ok" : "err");
  };

  const pending  = appts.filter(a => a.status === "pending").length;
  const accepted = appts.filter(a => a.status === "accepted").length;
  const realCount = getDoctorAppointments(doctorName).length;

  return (
    <div className="dr-root">
      <style>{DOCTOR_STYLES}</style>
      <div className="dr-grid"/>
      <div className="dr-orb dr-orb1"/><div className="dr-orb dr-orb2"/>
      <DoctorSidebar active="dashboard"/>

      <main className="dr-main">
        {/* Topbar */}
        <div className="dr-topbar">
          <div>
            <div className="dr-topbar-title">
              Good morning, <em style={{fontStyle:"italic",color:"#38b6ff"}}>Dr. {doctorName}</em> 👨‍⚕️
            </div>
            <div className="dr-topbar-sub">{today}</div>
          </div>
          <div className="dr-topbar-right">
            <div className="dr-status-badge"><span className="dr-status-dot"/>On Duty</div>
            {realCount > 0 && (
              <div style={{padding:"8px 14px",borderRadius:"11px",background:"rgba(248,113,113,.08)",border:"1.5px solid rgba(248,113,113,.18)",fontSize:"12.5px",color:"#f87171",display:"flex",alignItems:"center",gap:"6px"}}>
                🔴 {pending} new pending
              </div>
            )}
          </div>
        </div>

        {/* Hero */}
        <div className="dr-hero">
          <div className="dr-hero-inner">
            <div className="dr-hero-text">
              <div className="dr-hero-pill">
                {realCount > 0 ? `🔔 ${realCount} real patient booking${realCount!==1?"s":""}` : "🩺 Today's Overview"}
              </div>
              <h2>You have <em>{appts.length} appointment{appts.length!==1?"s":""}</em> today.</h2>
              <p>{pending} pending · {accepted} accepted · Updates in real time as patients book.</p>
            </div>
            <div className="dr-hero-stats">
              <div className="dr-hero-stat"><div className="dr-hero-stat-num">{appts.length}</div><div className="dr-hero-stat-lbl">Today</div></div>
              <div className="dr-hero-stat"><div className="dr-hero-stat-num">{pending}</div><div className="dr-hero-stat-lbl">Pending</div></div>
              <div className="dr-hero-stat"><div className="dr-hero-stat-num">{accepted}</div><div className="dr-hero-stat-lbl">Accepted</div></div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="dr-stat-grid">
          {[
            { cls:"s1", icls:"c1", icon:"👥", num:"250",  lbl:"Total Patients",   trend:"All time",          dir:"neu" },
            { cls:"s2", icls:"c2", icon:"📅", num:String(appts.length), lbl:"Today's Appts", trend:`${pending} pending`, dir:pending>0?"up":"neu" },
            { cls:"s3", icls:"c3", icon:"📋", num:"48",   lbl:"Prescriptions",    trend:"This week",         dir:"neu" },
            { cls:"s4", icls:"c4", icon:"⭐", num:"4.9",  lbl:"Doctor Rating",    trend:"Last 30 reviews",   dir:"up" },
          ].map(s => (
            <div className={`dr-stat-card ${s.cls}`} key={s.lbl}>
              <div className={`dr-stat-icon ${s.icls}`}>{s.icon}</div>
              <div className="dr-stat-num">{s.num}</div>
              <div className="dr-stat-lbl">{s.lbl}</div>
              <div className={`dr-stat-trend ${s.dir}`}>{s.trend}</div>
            </div>
          ))}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 340px",gap:"20px"}}>
          {/* Appointments */}
          <div className="dr-card">
            <div className="dr-card-head">
              <div className="dr-card-title">
                <span>📅</span> Today's Appointments
                {realCount > 0 && <span style={{fontSize:"11px",color:"#34d399",background:"rgba(52,211,153,.1)",border:"1px solid rgba(52,211,153,.2)",padding:"2px 8px",borderRadius:"8px",marginLeft:4}}>Live</span>}
              </div>
              <span className="dr-card-action" onClick={() => navigate("/doctor/appointments")}>View all →</span>
            </div>

            {appts.length === 0 ? (
              <div className="dr-empty">
                <div className="dr-empty-icon">📅</div>
                <div className="dr-empty-title">No appointments yet</div>
                <div className="dr-empty-sub">Patients can book from the patient portal</div>
              </div>
            ) : appts.map(a => (
              <div className="dr-row" key={a.id}>
                <div className={`dr-av ${a.avCls}`}>{a.initials}</div>
                <div style={{flex:1}}>
                  <div className="dr-row-name">{a.patient}</div>
                  <div className="dr-row-sub">{a.type}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:"12.5px",color:"#38b6ff",fontWeight:600}}>🕐 {a.time}</div>
                    {a.date && a.date !== "Today" && <div style={{fontSize:"11px",color:"rgba(255,255,255,.35)",marginTop:2}}>{a.date}</div>}
                    <span className={`dr-badge ${a.status==="accepted"?"green":a.status==="rejected"?"red":"yellow"}`}>{a.status}</span>
                  </div>
                  {a.status === "pending" && (
                    <div style={{display:"flex",gap:"6px"}}>
                      <button className="dr-btn-success" onClick={() => handleAppt(a.id, "accepted")}>✓</button>
                      <button className="dr-btn-danger"  onClick={() => handleAppt(a.id, "rejected")}>✗</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Right column */}
          <div>
            {/* Quick actions */}
            <div className="dr-card">
              <div className="dr-card-head"><div className="dr-card-title"><span>⚡</span> Quick Actions</div></div>
              {[
                { icon:"📋", label:"Write Prescription",  sub:"Create for a patient",   path:"/doctor/prescriptions", col:"rgba(167,139,250,.12)", bdr:"rgba(167,139,250,.2)" },
                { icon:"👥", label:"View Patients",        sub:"Browse all records",      path:"/doctor/patients",      col:"rgba(52,211,153,.12)",  bdr:"rgba(52,211,153,.2)" },
                { icon:"📅", label:"Manage Appointments",  sub:"View full schedule",      path:"/doctor/appointments",  col:"rgba(56,182,255,.12)",  bdr:"rgba(56,182,255,.2)" },
              ].map(q => (
                <div key={q.label} className="dr-row" style={{cursor:"pointer"}} onClick={()=>navigate(q.path)}>
                  <div style={{width:38,height:38,borderRadius:11,background:q.col,border:`1px solid ${q.bdr}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}}>{q.icon}</div>
                  <div><div className="dr-row-name">{q.label}</div><div className="dr-row-sub">{q.sub}</div></div>
                  <span style={{marginLeft:"auto",fontSize:14,color:"rgba(255,255,255,.2)"}}>→</span>
                </div>
              ))}
            </div>

            {/* Recent patients */}
            <div className="dr-card">
              <div className="dr-card-head">
                <div className="dr-card-title"><span>👥</span> Recent Patients</div>
                <span className="dr-card-action" onClick={()=>navigate("/doctor/patients")}>All →</span>
              </div>
              {RECENT_PATIENTS.map(p => (
                <div className="dr-row" key={p.name}>
                  <div className={`dr-av ${p.avCls}`}>{p.name.split(" ").map(n=>n[0]).join("")}</div>
                  <div><div className="dr-row-name">{p.name}</div><div className="dr-row-sub">{p.condition} · Age {p.age}</div></div>
                  <div className="dr-row-right"><div style={{fontSize:"11.5px",color:"rgba(255,255,255,.3)"}}>{p.lastVisit}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {toast && <div className={`dr-toast${toast.type==="err"?" error":""}`}>{toast.msg}</div>}
    </div>
  );
}