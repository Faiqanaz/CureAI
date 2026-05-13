// ─── DoctorPatients.tsx ───────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { DoctorSidebar, DOCTOR_STYLES } from "./DoctorSidebar";

// ── helpers ───────────────────────────────────────────────────────────────────
function patientKey(doctorName: string) {
  // Normalize: strip "Dr." prefix, lowercase, replace spaces with underscores
  // Must match exactly how AppointmentBooking.tsx writes the key
  const clean = doctorName.replace(/^Dr\.\s*/i, "").trim().toLowerCase().replace(/\s+/g, "_");
  return `cureai_patients_${clean}`;
}
function getDoctorPatients(doctorName: string): any[] {
  try {
    const key = patientKey(doctorName);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }
  catch { return []; }
}

const STATUS_COLORS: Record<string, string> = {
  Active: "green", Monitoring: "yellow", Recovered: "blue",
};

export default function DoctorPatients() {
  const navigate  = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [search,   setSearch]   = useState("");
  const [filter,   setFilter]   = useState("All");
  const [selected, setSelected] = useState<any | null>(null);
  const [toast,    setToast]    = useState<string | null>(null);

  const user       = (() => { try { return JSON.parse(localStorage.getItem("cureai_user") || "{}"); } catch { return {}; } })();
  const doctorName = (user?.name || "").replace(/^Dr\.\s*/i, "").trim();

  const load = () => setPatients(getDoctorPatients(doctorName));

  useEffect(() => {
    const id = "dr-styles";
    if (!document.getElementById(id)) {
      const s = document.createElement("style"); s.id = id; s.textContent = DOCTOR_STYLES;
      document.head.appendChild(s);
    }
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [doctorName]);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach((e, i) => {
        if (e.isIntersecting)
          (e.target as HTMLElement).style.animation = `cardIn .5s ${i * 0.07}s cubic-bezier(.34,1.2,.64,1) both`;
      });
    }, { threshold: 0.08 });
    document.querySelectorAll(".dr-stat-card,.dr-card").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [patients]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    return (p.name?.toLowerCase().includes(q) || p.condition?.toLowerCase().includes(q)) &&
           (filter === "All" || p.status === filter);
  });

  const counts = {
    total:     patients.length,
    active:    patients.filter(p => p.status === "Active").length,
    monitoring:patients.filter(p => p.status === "Monitoring").length,
    recovered: patients.filter(p => p.status === "Recovered").length,
  };

  // update status directly
  const updateStatus = (email: string, status: string) => {
    const all = getDoctorPatients(doctorName);
    const updated = all.map(p => p.email === email ? { ...p, status } : p);
    localStorage.setItem(patientKey(doctorName), JSON.stringify(updated));
    setPatients(updated);
    if (selected?.email === email) setSelected({ ...selected, status });
    showToast(`✓ Status updated to ${status}`);
  };

  return (
    <div className="dr-root">
      <style>{DOCTOR_STYLES}</style>
      <div className="dr-grid"/>
      <div className="dr-orb dr-orb1"/><div className="dr-orb dr-orb2"/>
      <DoctorSidebar active="patients"/>

      <main className="dr-main">
        {/* Topbar */}
        <div className="dr-topbar">
          <div>
            <div className="dr-topbar-title">Patients</div>
            <div className="dr-topbar-sub">
              {patients.length} patient{patients.length !== 1 ? "s" : ""} in your care · Updates live
            </div>
          </div>
          <div className="dr-topbar-right">
            <div className="dr-date-badge">👥 Live Records</div>
          </div>
        </div>

        {/* Stat cards — clickable filters */}
        <div className="dr-stat-grid">
          {[
            { cls:"s1", icls:"c1", icon:"👥", num:counts.total,      lbl:"Total Patients", key:"All",        dir:"neu" },
            { cls:"s2", icls:"c2", icon:"🟢", num:counts.active,     lbl:"Active",          key:"Active",     dir:"up"  },
            { cls:"s3", icls:"c3", icon:"👁️",num:counts.monitoring,  lbl:"Monitoring",      key:"Monitoring", dir:"neu" },
            { cls:"s4", icls:"c4", icon:"✅", num:counts.recovered,   lbl:"Recovered",       key:"Recovered",  dir:"up"  },
          ].map(s => (
            <div
              key={s.key}
              className={`dr-stat-card ${s.cls}`}
              style={{ cursor:"pointer", outline: filter === s.key ? "2px solid #38b6ff" : "none" }}
              onClick={() => setFilter(s.key)}
            >
              <div className={`dr-stat-icon ${s.icls}`}>{s.icon}</div>
              <div className="dr-stat-num">{s.num}</div>
              <div className="dr-stat-lbl">{s.lbl}</div>
              <div className={`dr-stat-trend ${s.dir}`}>{filter === s.key ? "✓ Active filter" : "Click to filter"}</div>
            </div>
          ))}
        </div>

        {/* Search + filter pills */}
        <div style={{display:"flex",gap:"12px",marginBottom:"24px",flexWrap:"wrap",alignItems:"center",animation:"fadeUp .45s .18s both"}}>
          <div className="dr-search-wrap">
            <span className="dr-search-icon">🔍</span>
            <input className="dr-search" placeholder="Search by name or condition…" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
          <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
            {["All","Active","Monitoring","Recovered"].map(f => (
              <button key={f} style={{
                padding:"8px 16px", borderRadius:"20px", cursor:"pointer",
                fontSize:"12.5px", fontFamily:"'Sora',sans-serif", fontWeight:500, transition:"all .18s",
                border:      filter===f ? "1.5px solid #38b6ff" : "1.5px solid rgba(255,255,255,.08)",
                background:  filter===f ? "rgba(56,182,255,.12)" : "rgba(255,255,255,.03)",
                color:       filter===f ? "#38b6ff" : "rgba(255,255,255,.5)",
              }} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
          <div style={{marginLeft:"auto",fontSize:"12px",color:"rgba(255,255,255,.3)"}}>
            {filtered.length} shown
          </div>
        </div>

        {/* Patient list */}
        <div className="dr-card">
          {patients.length === 0 ? (
            <div className="dr-empty">
              <div className="dr-empty-icon">📭</div>
              <div className="dr-empty-title">No patients yet</div>
              <div className="dr-empty-sub">
                Patients will appear here automatically when they book an appointment with you.<br/>
                Ask them to log into the patient portal and book.
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="dr-empty">
              <div className="dr-empty-icon">🔍</div>
              <div className="dr-empty-title">No matches</div>
              <div className="dr-empty-sub">Try a different search or filter.</div>
            </div>
          ) : (
            filtered.map((p, i) => (
              <div className="dr-row" key={p.email || i} style={{cursor:"pointer"}} onClick={() => setSelected(p)}>
                <div className={`dr-av ${p.avCls || "a1"}`}>{p.initials || p.name?.[0] || "?"}</div>
                <div style={{flex:1}}>
                  <div className="dr-row-name">{p.name}</div>
                  <div className="dr-row-sub">
                    {p.condition || "General"} · Age {p.age || "—"} · {p.gender || "—"}
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
                  <span className={`dr-badge ${STATUS_COLORS[p.status] || "yellow"}`}>{p.status || "Active"}</span>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:"11px",color:"rgba(255,255,255,.3)"}}>Last visit</div>
                    <div style={{fontSize:"12px",color:"rgba(255,255,255,.55)",marginTop:2}}>{p.lastVisit || "—"}</div>
                  </div>
                  <span style={{fontSize:14,color:"rgba(255,255,255,.2)"}}>→</span>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Patient detail modal */}
      {selected && (
        <div className="dr-overlay" onClick={() => setSelected(null)}>
          <div className="dr-modal" onClick={e => e.stopPropagation()}>
            <div className="dr-modal-header">
              <div className={`dr-av ${selected.avCls || "a1"}`} style={{width:50,height:50,borderRadius:14,fontSize:18}}>
                {selected.initials || selected.name?.[0] || "?"}
              </div>
              <div>
                <div className="dr-modal-title">{selected.name}</div>
                <div className="dr-modal-sub">{selected.condition || "General"} · Age {selected.age || "—"}</div>
              </div>
              <span className={`dr-badge ${STATUS_COLORS[selected.status] || "yellow"}`} style={{marginLeft:"auto",marginRight:8}}>
                {selected.status || "Active"}
              </span>
              <button className="dr-modal-close" onClick={() => setSelected(null)}>×</button>
            </div>

            <div className="dr-modal-body">
              {[
                ["Gender",     selected.gender    || "—"],
                ["Age",        selected.age       || "—"],
                ["Email",      selected.email     || "—"],
                ["Last Visit", selected.lastVisit || "—"],
                ["Condition",  selected.condition || "—"],
              ].map(([k, v]) => (
                <div key={k} style={{display:"flex",gap:"12px",padding:"10px 14px",borderRadius:"11px",background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",marginBottom:"8px"}}>
                  <span style={{fontSize:"11px",color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".6px",fontWeight:600,width:90,flexShrink:0,paddingTop:2}}>{k}</span>
                  <span style={{fontSize:"13.5px",color:"rgba(255,255,255,.8)"}}>{v}</span>
                </div>
              ))}

              {/* Clinical notes */}
              <div style={{padding:"12px 14px",borderRadius:"11px",background:"rgba(56,182,255,.05)",border:"1px solid rgba(56,182,255,.12)",marginTop:4,marginBottom:16}}>
                <div style={{fontSize:"11px",color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".6px",fontWeight:600,marginBottom:6}}>Notes</div>
                <div style={{fontSize:"13px",color:"rgba(255,255,255,.65)",lineHeight:1.65}}>{selected.notes || "No notes recorded."}</div>
              </div>

              {/* Status update */}
              <div style={{marginBottom:0}}>
                <div style={{fontSize:"11px",color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".6px",fontWeight:600,marginBottom:8}}>Update Status</div>
                <div style={{display:"flex",gap:"8px"}}>
                  {["Active","Monitoring","Recovered"].map(s => (
                    <button key={s} onClick={() => updateStatus(selected.email, s)} style={{
                      flex:1, padding:"9px", borderRadius:"10px", cursor:"pointer",
                      fontFamily:"'Sora',sans-serif", fontSize:"12px", fontWeight:500, transition:"all .18s",
                      border:     selected.status===s ? `1.5px solid ${s==="Active"?"#34d399":s==="Monitoring"?"#fbbf24":"#38b6ff"}` : "1.5px solid rgba(255,255,255,.08)",
                      background: selected.status===s ? (s==="Active"?"rgba(52,211,153,.12)":s==="Monitoring"?"rgba(251,191,36,.12)":"rgba(56,182,255,.12)") : "rgba(255,255,255,.03)",
                      color:      selected.status===s ? (s==="Active"?"#34d399":s==="Monitoring"?"#fbbf24":"#38b6ff") : "rgba(255,255,255,.45)",
                    }}>{s}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="dr-modal-footer">
              <button className="dr-modal-cancel" onClick={() => setSelected(null)}>Close</button>
              <button className="dr-modal-confirm" onClick={() => {
                setSelected(null);
                showToast(`📋 Opening prescriptions for ${selected.name}`);
                navigate("/doctor/prescriptions");
              }}>
                Write Prescription →
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="dr-toast">{toast}</div>}
    </div>
  );
}