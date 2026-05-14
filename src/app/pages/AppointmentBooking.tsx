import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { initDoctorAccounts, addDoctorAppointment } from "../data/initDoctors";



// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeUp    { from{ opacity:0; transform:translateY(22px); } to{ opacity:1; transform:translateY(0); } }
  @keyframes fadeIn    { from{ opacity:0; } to{ opacity:1; } }
  @keyframes cardIn    { from{ opacity:0; transform:translateY(24px) scale(.97); } to{ opacity:1; transform:translateY(0) scale(1); } }
  @keyframes drift     { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-16px); } }
  @keyframes drift2    { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(12px); } }
  @keyframes pulse     { 0%,100%{ opacity:.5; transform:scale(1); } 50%{ opacity:1; transform:scale(1.2); } }
  @keyframes modalIn   { from{ opacity:0; transform:scale(.92) translateY(16px); } to{ opacity:1; transform:scale(1) translateY(0); } }
  @keyframes overlayIn { from{ opacity:0; } to{ opacity:1; } }
  @keyframes checkPop  { 0%{ transform:scale(0) rotate(-15deg); } 70%{ transform:scale(1.2) rotate(4deg); } 100%{ transform:scale(1) rotate(0); } }
  @keyframes marquee   { from{ transform:translateX(0); } to{ transform:translateX(-50%); } }
  @keyframes navDown   { from{ opacity:0; transform:translateY(-16px); } to{ opacity:1; transform:translateY(0); } }

  html,body { height:100%; 
            overflow-y: auto;}
  body {
        overflow-x: hidden;
        }
  body,.ab-root { font-family:'Sora',sans-serif; background:#050d1a; color:#fff; min-height:100vh; overflow-x:hidden; }
  
  .ab-root {
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
  }
  .ab-grid { position:fixed; inset:0; z-index:0; pointer-events:none;
    background-image:linear-gradient(rgba(255,255,255,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.022) 1px,transparent 1px);
    background-size:52px 52px; }
  .ab-orb  { position:fixed; border-radius:50%; filter:blur(100px); pointer-events:none; z-index:0; }
  .ab-orb1 { width:500px; height:500px; background:radial-gradient(circle,rgba(56,182,255,.11) 0%,transparent 70%); top:-160px; right:-80px; animation:drift 11s ease-in-out infinite; }
  .ab-orb2 { width:380px; height:380px; background:radial-gradient(circle,rgba(99,102,241,.1) 0%,transparent 70%);  bottom:-80px; left:-60px; animation:drift2 13s ease-in-out infinite; }

  .ab-header { position:sticky; top:0; z-index:40; background:rgba(5,13,26,.82); backdrop-filter:blur(20px); border-bottom:1px solid rgba(255,255,255,.06); padding:0 36px; height:68px; display:flex; align-items:center; justify-content:space-between; animation:fadeUp .4s both; }
  .ab-header-left { display:flex; align-items:center; gap:16px; }
  .ab-back { width:36px; height:36px; border-radius:10px; border:1.5px solid rgba(255,255,255,.1); background:rgba(255,255,255,.04); display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:16px; transition:all .18s; flex-shrink:0; }
  .ab-back:hover { border-color:rgba(56,182,255,.4); background:rgba(56,182,255,.08); }
  .ab-header-title { font-family:'Instrument Serif',serif; font-size:22px; color:#fff; }
  .ab-header-sub { font-size:12px; color:rgba(255,255,255,.3); margin-top:1px; }
  .ab-result-count { font-size:12.5px; color:rgba(255,255,255,.35); padding:6px 14px; border-radius:10px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07); }

  .ab-main { max-width:1280px; margin:0 auto; padding:32px 36px; position:relative; z-index:1; }
  @media(max-width:700px){ .ab-main{ padding:20px 16px; } }

  .ab-search-wrap { position:relative; margin-bottom:28px; animation:fadeUp .45s .08s both; }
  .ab-search-icon { position:absolute; left:16px; top:50%; transform:translateY(-50%); font-size:17px; pointer-events:none; }
  .ab-search { width:100%; background:rgba(255,255,255,.04); border:1.5px solid rgba(255,255,255,.08); border-radius:14px; padding:13px 16px 13px 46px; color:#fff; font-size:14px; font-family:'Sora',sans-serif; outline:none; transition:border-color .2s,box-shadow .2s; }
  .ab-search::placeholder { color:rgba(255,255,255,.22); }
  .ab-search:focus { border-color:#38b6ff; box-shadow:0 0 0 3px rgba(56,182,255,.1); background:rgba(56,182,255,.04); }

  .ab-filters { margin-bottom:32px; animation:fadeUp .45s .14s both; }
  .ab-filters-label { font-size:11.5px; color:rgba(255,255,255,.4); text-transform:uppercase; letter-spacing:.7px; font-weight:600; margin-bottom:12px; }
  .ab-filter-pills { display:flex; flex-wrap:wrap; gap:8px; }
  .ab-pill { padding:7px 16px; border-radius:20px; border:1.5px solid rgba(255,255,255,.08); background:rgba(255,255,255,.03); color:rgba(255,255,255,.5); font-size:12.5px; font-family:'Sora',sans-serif; font-weight:500; cursor:pointer; transition:all .2s; white-space:nowrap; }
  .ab-pill:hover { border-color:rgba(56,182,255,.35); color:rgba(255,255,255,.8); background:rgba(56,182,255,.06); }
  .ab-pill.active { border-color:#38b6ff; background:rgba(56,182,255,.12); color:#38b6ff; box-shadow:0 0 0 3px rgba(56,182,255,.08); }

  .ab-grid-cards { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
  @media(max-width:1050px){ .ab-grid-cards{ grid-template-columns:repeat(2,1fr); } }
  @media(max-width:640px) { .ab-grid-cards{ grid-template-columns:1fr; } }

  .ab-doc-card { border-radius:20px; background:rgba(255,255,255,.03); border:1.5px solid rgba(255,255,255,.07); overflow:hidden; transition:all .28s; cursor:default; position:relative; opacity:0; }
  .ab-doc-card:hover { transform:translateY(-5px); border-color:rgba(56,182,255,.25); box-shadow:0 22px 60px rgba(0,0,0,.35); }
  .ab-doc-img-wrap { position:relative; height:200px; overflow:hidden; background:rgba(255,255,255,.04); }
  .ab-doc-img { width:100%; height:100%; object-fit:cover; object-position:top; transition:transform .4s; }
  .ab-doc-card:hover .ab-doc-img { transform:scale(1.04); }
  .ab-avail-badge { position:absolute; top:12px; right:12px; padding:4px 11px; border-radius:20px; font-size:11px; font-weight:600; backdrop-filter:blur(8px); }
  .ab-avail-badge.today    { background:rgba(52,211,153,.2); color:#34d399; border:1px solid rgba(52,211,153,.3); }
  .ab-avail-badge.tomorrow { background:rgba(56,182,255,.2); color:#38b6ff; border:1px solid rgba(56,182,255,.3); }
  .ab-doc-body { padding:20px; }
  .ab-doc-name { font-size:16px; font-weight:700; color:#fff; margin-bottom:3px; }
  .ab-doc-spec { font-size:12.5px; color:#38b6ff; margin-bottom:12px; font-weight:500; }
  .ab-doc-meta { display:flex; align-items:center; gap:12px; margin-bottom:14px; flex-wrap:wrap; }
  .ab-doc-rating { display:flex; align-items:center; gap:4px; font-size:13px; color:#fff; font-weight:600; }
  .ab-doc-rating span { color:#fbbf24; font-size:14px; }
  .ab-doc-reviews { font-size:12px; color:rgba(255,255,255,.35); }
  .ab-doc-exp { font-size:12px; color:rgba(255,255,255,.38); padding:3px 9px; border-radius:8px; background:rgba(255,255,255,.05); border:1px solid rgba(255,255,255,.07); }
  .ab-book-btn { width:100%; padding:11px; border-radius:12px; border:none; background:linear-gradient(135deg,#38b6ff,#6366f1); color:#fff; font-size:13.5px; font-family:'Sora',sans-serif; font-weight:600; cursor:pointer; transition:transform .18s,box-shadow .18s; position:relative; overflow:hidden; }
  .ab-book-btn::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,.1),transparent); pointer-events:none; }
  .ab-book-btn:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(56,182,255,.35); }

  .ab-empty { text-align:center; padding:80px 20px; animation:fadeIn .4s both; }
  .ab-empty-icon { font-size:52px; margin-bottom:16px; }
  .ab-empty-title { font-family:'Instrument Serif',serif; font-size:24px; color:#fff; margin-bottom:8px; }
  .ab-empty-sub { font-size:14px; color:rgba(255,255,255,.35); }

  /* ── modal ── */
  .ab-overlay { position:fixed; inset:0; z-index:200; background:rgba(0,0,0,.72); backdrop-filter:blur(10px); animation:overlayIn .22s both; display:flex; align-items:center; justify-content:center; padding:20px; }
  .ab-modal { background:#070e1c; border:1px solid rgba(255,255,255,.1); border-radius:26px; max-width:480px; width:100%; max-height:90vh; overflow-y:auto; animation:modalIn .3s cubic-bezier(.34,1.4,.64,1) both; box-shadow:0 40px 100px rgba(0,0,0,.65); }
  .ab-modal::-webkit-scrollbar { width:4px; }
  .ab-modal::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1); border-radius:4px; }

  .ab-modal-header { padding:28px 28px 20px; border-bottom:1px solid rgba(255,255,255,.06); display:flex; align-items:center; gap:16px; }
  .ab-modal-doc-img { width:56px; height:56px; border-radius:14px; object-fit:cover; object-position:top; border:1.5px solid rgba(255,255,255,.1); flex-shrink:0; }
  .ab-modal-doc-name { font-size:16px; font-weight:700; color:#fff; margin-bottom:3px; }
  .ab-modal-doc-spec { font-size:12.5px; color:#38b6ff; }
  .ab-modal-close { margin-left:auto; width:32px; height:32px; border-radius:9px; border:none; background:rgba(255,255,255,.06); color:rgba(255,255,255,.45); font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .15s; line-height:1; flex-shrink:0; }
  .ab-modal-close:hover { background:rgba(255,255,255,.12); color:#fff; }

  .ab-modal-body { padding:24px 28px; }
  .ab-modal-section { margin-bottom:22px; }
  .ab-modal-label { font-size:11.5px; color:rgba(255,255,255,.42); text-transform:uppercase; letter-spacing:.6px; font-weight:600; margin-bottom:10px; }
  .ab-date-input { width:100%; background:rgba(255,255,255,.04); border:1.5px solid rgba(255,255,255,.08); border-radius:12px; padding:11px 14px; color:#fff; font-size:14px; font-family:'Sora',sans-serif; outline:none; transition:border-color .2s,box-shadow .2s; color-scheme:dark; }
  .ab-date-input:focus { border-color:#38b6ff; box-shadow:0 0 0 3px rgba(56,182,255,.1); }

  .ab-time-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
  .ab-time-btn { padding:9px 6px; border-radius:10px; border:1.5px solid rgba(255,255,255,.08); background:rgba(255,255,255,.03); color:rgba(255,255,255,.5); font-size:12.5px; font-family:'Sora',sans-serif; font-weight:500; cursor:pointer; transition:all .18s; text-align:center; }
  .ab-time-btn:hover { border-color:rgba(56,182,255,.35); color:rgba(255,255,255,.8); background:rgba(56,182,255,.06); }
  .ab-time-btn.selected { border-color:#38b6ff; background:rgba(56,182,255,.14); color:#38b6ff; box-shadow:0 0 0 3px rgba(56,182,255,.08); }

  .ab-reason-input { width:100%; background:rgba(255,255,255,.04); border:1.5px solid rgba(255,255,255,.08); border-radius:12px; padding:11px 14px; color:#fff; font-size:13.5px; font-family:'Sora',sans-serif; outline:none; resize:none; height:80px; transition:border-color .2s; }
  .ab-reason-input::placeholder { color:rgba(255,255,255,.2); }
  .ab-reason-input:focus { border-color:#38b6ff; }

  .ab-modal-footer { padding:0 28px 28px; display:flex; gap:10px; }
  .ab-cancel-btn { flex:1; padding:12px; border-radius:12px; border:1.5px solid rgba(255,255,255,.1); background:transparent; color:rgba(255,255,255,.55); font-size:13.5px; font-family:'Sora',sans-serif; font-weight:500; cursor:pointer; transition:all .18s; }
  .ab-cancel-btn:hover { border-color:rgba(255,255,255,.22); color:#fff; }
  .ab-confirm-btn { flex:2; padding:12px; border-radius:12px; border:none; background:linear-gradient(135deg,#38b6ff,#6366f1); color:#fff; font-size:13.5px; font-family:'Sora',sans-serif; font-weight:600; cursor:pointer; transition:transform .18s,box-shadow .18s; position:relative; overflow:hidden; }
  .ab-confirm-btn::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,.1),transparent); pointer-events:none; }
  .ab-confirm-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 28px rgba(56,182,255,.35); }
  .ab-confirm-btn:disabled { opacity:.5; cursor:not-allowed; }

  .ab-success { text-align:center; padding:40px 28px; }
  .ab-success-check { width:72px; height:72px; border-radius:50%; background:linear-gradient(135deg,#34d399,#38b6ff); display:flex; align-items:center; justify-content:center; font-size:30px; margin:0 auto 18px; animation:checkPop .5s cubic-bezier(.34,1.56,.64,1) both; box-shadow:0 0 0 16px rgba(52,211,153,.1); }
  .ab-success-title { font-family:'Instrument Serif',serif; font-size:24px; color:#fff; margin-bottom:8px; }
  .ab-success-sub { font-size:13.5px; color:rgba(255,255,255,.42); line-height:1.65; margin-bottom:20px; }
  .ab-success-detail { display:flex; align-items:center; gap:10px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:14px 16px; margin-bottom:24px; }
  .ab-success-detail-img { width:42px; height:42px; border-radius:11px; object-fit:cover; object-position:top; flex-shrink:0; }
  .ab-success-detail-name { font-size:13.5px; font-weight:600; color:#fff; }
  .ab-success-detail-info { font-size:12px; color:rgba(255,255,255,.38); margin-top:2px; }
  .ab-success-done { width:100%; padding:12px; border-radius:12px; border:none; background:linear-gradient(135deg,#38b6ff,#6366f1); color:#fff; font-size:14px; font-family:'Sora',sans-serif; font-weight:600; cursor:pointer; transition:transform .18s,box-shadow .18s; }
  .ab-success-done:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(56,182,255,.35); }

  /* notify banner */
  .ab-notify { position:fixed; bottom:24px; right:24px; z-index:300; background:#070e1c; border:1px solid rgba(52,211,153,.3); border-radius:14px; padding:14px 20px; font-size:13px; color:#34d399; font-family:'Sora',sans-serif; box-shadow:0 16px 48px rgba(0,0,0,.5); animation:fadeUp .3s both; display:flex; align-items:center; gap:10px; }
`;

// ─── Data ─────────────────────────────────────────────────────────────────────
interface Doctor {
  id:number; name:string; specialty:string; rating:number;
  reviews:number; experience:string; availability:string; image:string;
}

const DOCTORS: Doctor[] = [
  { id:1, name:"Dr. Jane Doe",        specialty:"General Practitioner", rating:4.9, reviews:234, experience:"15 years", availability:"Available Tomorrow",
    image:"https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80" },
  { id:2, name:"Dr. Michael Chen",    specialty:"Cardiologist",         rating:4.8, reviews:189, experience:"12 years", availability:"Available Today",
    image:"https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80" },
  { id:3, name:"Dr. Sarah Williams",  specialty:"Dentist",              rating:4.9, reviews:312, experience:"10 years", availability:"Available Tomorrow",
    image:"https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&q=80" },
  { id:4, name:"Dr. Emily Park",      specialty:"Pediatrician",         rating:5.0, reviews:156, experience:"8 years",  availability:"Available Today",
    image:"https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80" },
  { id:5, name:"Dr. Robert Martinez", specialty:"Dermatologist",        rating:4.7, reviews:203, experience:"14 years", availability:"Available Tomorrow",
    image:"https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80" },
  { id:6, name:"Dr. Lisa Anderson",   specialty:"Psychiatrist",         rating:4.9, reviews:178, experience:"11 years", availability:"Available Tomorrow",
    image:"https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&q=80" },
];

const SPECIALTIES = ["All","General Practitioner","Cardiologist","Dentist","Pediatrician","Dermatologist","Psychiatrist"];
const TIME_SLOTS  = ["9:00 AM","10:00 AM","11:00 AM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM"];

// avatar colours cycle
const AV_COLORS = ["a1","a2","a3","a4","a5"];

// ─── Component ────────────────────────────────────────────────────────────────
export default function AppointmentBooking() {
  const navigate = useNavigate();
  const [search,   setSearch]   = useState("");
  const [spec,     setSpec]     = useState("All");
  const [selected, setSelected] = useState<Doctor|null>(null);
  const [date,     setDate]     = useState("");
  const [time,     setTime]     = useState("");
  const [reason,   setReason]   = useState("");
  const [booked,   setBooked]   = useState(false);
  const [notify,   setNotify]   = useState("");

  // inject styles + seed doctor accounts
  useEffect(() => {
    const id = "ab-styles";
    if (!document.getElementById(id)) {
      const s = document.createElement("style"); s.id = id; s.textContent = STYLES;
      document.head.appendChild(s);
    }
    initDoctorAccounts(); // ensure doctor accounts exist in localStorage
  }, []);

  // card animations
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement;
          el.style.animation = `cardIn .5s ${parseInt(el.dataset.idx||"0") * 0.07}s cubic-bezier(.34,1.2,.64,1) both`;
        }
      });
    }, { threshold:0.08 });
    document.querySelectorAll(".ab-doc-card").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });

  const filtered = DOCTORS.filter(d => {
    const q = search.toLowerCase();
    return (d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q)) &&
           (spec === "All" || d.specialty === spec);
  });

  const openModal = (doc: Doctor) => {
    setSelected(doc); setDate(""); setTime(""); setReason(""); setBooked(false);
  };

  const confirm = () => {
    if (!selected || !date || !time) return;

    // ── get logged-in patient info ──
    const userRaw = localStorage.getItem("cureai_user");
    const patient = userRaw ? JSON.parse(userRaw) : { name:"Patient", email:"" };

    // ── build appointment object ──
    const initials = (patient.name as string)
      .split(" ").map((n: string) => n[0]).join("").slice(0,2).toUpperCase();
    const avCls = AV_COLORS[Math.floor(Math.random() * AV_COLORS.length)];

    const appt = {
      id:           Date.now(),
      patient:      patient.name || "Patient",
      patientEmail: patient.email || "",
      initials,
      avCls,
      date:         new Date(date + "T00:00:00").toLocaleDateString("en-US",{ month:"short", day:"numeric", year:"numeric" }),
      time,
      type:         reason.trim() || "Appointment",
      notes:        reason.trim() || "—",
      status:       "pending",
      bookedAt:     new Date().toISOString(),
    };

    // ── save to doctor-specific localStorage key ──
    const doctorName = selected.name.replace(/^Dr\.\s*/i, "").trim();
    addDoctorAppointment(doctorName, appt);

    // ── save patient info to doctor's patient list ──
    const patientKey = `cureai_patients_${doctorName.toLowerCase().replace(/\s+/g,"_")}`;
    const patientList: any[] = JSON.parse(localStorage.getItem(patientKey) || "[]");
    const alreadyExists = patientList.find((p: any) => p.email === patient.email);
    if (!alreadyExists) {
      const userFull: any = JSON.parse(localStorage.getItem("cureai_users") || "[]")
        .find((u: any) => u.email === patient.email) || {};
      patientList.unshift({
        name:      patient.name || "Patient",
        email:     patient.email || "",
        age:       userFull.age || "—",
        gender:    userFull.gender || "—",
        condition: reason.trim() || "General",
        lastVisit: new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),
        status:    "Active",
        initials:  initials,
        avCls:     avCls,
        notes:     reason.trim() || "Booked via patient portal.",
      });
      localStorage.setItem(patientKey, JSON.stringify(patientList));
    } else {
      // update last visit + condition
      const updated = patientList.map((p: any) =>
        p.email === patient.email
          ? { ...p, lastVisit: new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}), condition: reason.trim() || p.condition }
          : p
      );
      localStorage.setItem(patientKey, JSON.stringify(updated));
    }

    // ── also update patient's own appointment list ──
    const patientAppts = JSON.parse(localStorage.getItem("cureai_appointments") || "[]");
    patientAppts.push({ ...appt, doctor: selected.name, spec: selected.specialty, img: selected.image });
    localStorage.setItem("cureai_appointments", JSON.stringify(patientAppts));

    setBooked(true);

    // show notify toast briefly
    setNotify(`✓ Appointment sent to ${selected.name}'s dashboard!`);
    setTimeout(() => setNotify(""), 4000);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="ab-root">
      <style>{STYLES}</style>
      <div className="ab-grid"/>
      <div className="ab-orb ab-orb1"/><div className="ab-orb ab-orb2"/>

      {/* ── Header ── */}
      <header className="ab-header">
        <div className="ab-header-left">
          <button className="ab-back" onClick={() => navigate("/patient/dashboard")}>←</button>
          <div>
            <div className="ab-header-title">Find & Book Doctors</div>
            <div className="ab-header-sub">Browse specialists and schedule instantly</div>
          </div>
        </div>
        <div className="ab-result-count">{filtered.length} doctor{filtered.length!==1?"s":""} found</div>
      </header>

      {/* ── Main ── */}
      <main className="ab-main">
        {/* Search */}
        <div className="ab-search-wrap">
          <span className="ab-search-icon">🔍</span>
          <input className="ab-search" placeholder="Search by name or specialty…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>

        {/* Specialty pills */}
        <div className="ab-filters">
          <div className="ab-filters-label">⚕ Specialty</div>
          <div className="ab-filter-pills">
            {SPECIALTIES.map(s=>(
              <button key={s} className={`ab-pill${spec===s?" active":""}`} onClick={()=>setSpec(s)}>{s}</button>
            ))}
          </div>
        </div>

        {/* Cards */}
        {filtered.length>0 ? (
          <div className="ab-grid-cards">
            {filtered.map((doc,i)=>(
              <div className="ab-doc-card" key={doc.id} data-idx={String(i)}>
                <div className="ab-doc-img-wrap">
                  <img src={doc.image} alt={doc.name} className="ab-doc-img"
                    onError={e=>{(e.target as HTMLImageElement).src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80";}}/>
                  <div className={`ab-avail-badge ${doc.availability.includes("Today")?"today":"tomorrow"}`}>
                    {doc.availability.includes("Today")?"● ":"◌ "}{doc.availability}
                  </div>
                </div>
                <div className="ab-doc-body">
                  <div className="ab-doc-name">{doc.name}</div>
                  <div className="ab-doc-spec">{doc.specialty}</div>
                  <div className="ab-doc-meta">
                    <div className="ab-doc-rating"><span>★</span>{doc.rating}<span className="ab-doc-reviews" style={{marginLeft:4}}>({doc.reviews})</span></div>
                    <div className="ab-doc-exp">🩺 {doc.experience}</div>
                  </div>
                  <button className="ab-book-btn" onClick={()=>openModal(doc)}>📅 Book Appointment</button>
                </div>
              </div>
            ))}
          </div>
        ):(
          <div className="ab-empty">
            <div className="ab-empty-icon">🔍</div>
            <div className="ab-empty-title">No doctors found</div>
            <div className="ab-empty-sub">Try adjusting your search or specialty filter</div>
          </div>
        )}
      </main>

      {/* ── Booking Modal ── */}
      {selected && (
        <div className="ab-overlay" onClick={()=>setSelected(null)}>
          <div className="ab-modal" onClick={e=>e.stopPropagation()}>
            {!booked ? (
              <>
                <div className="ab-modal-header">
                  <img src={selected.image} alt={selected.name} className="ab-modal-doc-img"
                    onError={e=>{(e.target as HTMLImageElement).src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80";}}/>
                  <div>
                    <div className="ab-modal-doc-name">{selected.name}</div>
                    <div className="ab-modal-doc-spec">{selected.specialty}</div>
                    <div style={{marginTop:5,fontSize:12,color:"rgba(255,255,255,.5)"}}>
                      <span style={{color:"#fbbf24"}}>★</span> {selected.rating} · {selected.experience} exp
                    </div>
                  </div>
                  <button className="ab-modal-close" onClick={()=>setSelected(null)}>×</button>
                </div>

                <div className="ab-modal-body">
                  <div className="ab-modal-section">
                    <div className="ab-modal-label">📅 Select Date</div>
                    <input type="date" className="ab-date-input" min={today} value={date} onChange={e=>setDate(e.target.value)}/>
                  </div>
                  <div className="ab-modal-section">
                    <div className="ab-modal-label">🕐 Select Time Slot</div>
                    <div className="ab-time-grid">
                      {TIME_SLOTS.map(t=>(
                        <button key={t} className={`ab-time-btn${time===t?" selected":""}`} onClick={()=>setTime(t)}>{t}</button>
                      ))}
                    </div>
                  </div>
                  <div className="ab-modal-section" style={{marginBottom:0}}>
                    <div className="ab-modal-label">📝 Reason for Visit <span style={{color:"rgba(255,255,255,.25)",textTransform:"none",letterSpacing:0}}>(optional)</span></div>
                    <textarea className="ab-reason-input" placeholder="Brief description of your symptoms…" value={reason} onChange={e=>setReason(e.target.value)}/>
                  </div>
                </div>

                <div className="ab-modal-footer">
                  <button className="ab-cancel-btn" onClick={()=>setSelected(null)}>Cancel</button>
                  <button className="ab-confirm-btn" disabled={!date||!time} onClick={confirm}>
                    {!date||!time ? "Select date & time →" : "Confirm Booking →"}
                  </button>
                </div>
              </>
            ):(
              <div className="ab-success">
                <div className="ab-success-check">✓</div>
                <div className="ab-success-title">Appointment Confirmed!</div>
                <p className="ab-success-sub">
                  Your appointment request has been sent to <strong style={{color:"#38b6ff"}}>{selected.name}</strong>'s dashboard. You'll be notified when it's accepted.
                </p>
                <div className="ab-success-detail">
                  <img src={selected.image} alt={selected.name} className="ab-success-detail-img"
                    onError={e=>{(e.target as HTMLImageElement).src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80";}}/>
                  <div>
                    <div className="ab-success-detail-name">{selected.name}</div>
                    <div className="ab-success-detail-info">
                      {new Date(date+"T00:00:00").toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})} · {time}
                    </div>
                  </div>
                </div>
                <button className="ab-success-done" onClick={()=>setSelected(null)}>Done 🎉</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Toast notification ── */}
      {notify && <div className="ab-notify">📬 {notify}</div>}
    </div>
  );
}