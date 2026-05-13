// ─── DoctorPrescriptions.tsx ─────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { DoctorSidebar, DOCTOR_STYLES } from "./DoctorSidebar";

// ── helpers ───────────────────────────────────────────────────────────────────
function patientKey(doctorName: string) {
  const clean = doctorName.replace(/^Dr\.\s*/i, "").trim().toLowerCase().replace(/\s+/g, "_");
  return `cureai_patients_${clean}`;
}
function getDoctorPatients(doctorName: string): any[] {
  try {
    const data = localStorage.getItem(patientKey(doctorName));
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

interface Prescription {
  id: number; patient: string; initials: string; avCls: string;
  medication: string; dosage: string; frequency: string; duration: string;
  date: string; status: "Active" | "Completed" | "Cancelled";
  reason: string; notes: string;
}

const FREQ_OPTIONS = ["Once daily","Twice daily","Three times daily","Four times daily","As needed (PRN)","Every 8 hours","Every 12 hours","With meals","At bedtime"];
const DUR_OPTIONS  = ["7 days","10 days","14 days","30 days","60 days","90 days","6 months","Indefinite"];

const RX_STORAGE_KEY = (doctorName: string) =>
  `cureai_rx_${doctorName.replace(/^Dr\.\s*/i,"").trim().toLowerCase().replace(/\s+/g,"_")}`;

function getRxList(doctorName: string): Prescription[] {
  try { return JSON.parse(localStorage.getItem(RX_STORAGE_KEY(doctorName)) || "[]"); }
  catch { return []; }
}
function saveRxList(doctorName: string, list: Prescription[]) {
  localStorage.setItem(RX_STORAGE_KEY(doctorName), JSON.stringify(list));
}

export default function DoctorPrescriptions() {
  const navigate  = useNavigate();

  const user       = (() => { try { return JSON.parse(localStorage.getItem("cureai_user") || "{}"); } catch { return {}; } })();
  const doctorName = (user?.name || "").replace(/^Dr\.\s*/i, "").trim();

  const [rxList,      setRxList]      = useState<Prescription[]>([]);
  const [patientOpts, setPatientOpts] = useState<any[]>([]);
  const [filter,      setFilter]      = useState("All");
  const [search,      setSearch]      = useState("");
  const [showForm,    setShowForm]    = useState(false);
  const [viewRx,      setViewRx]      = useState<Prescription | null>(null);
  const [toast,       setToast]       = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  // form state
  const [fPatient,  setFPatient]  = useState("");
  const [fMed,      setFMed]      = useState("");
  const [fDosage,   setFDosage]   = useState("");
  const [fFreq,     setFFreq]     = useState("");
  const [fDur,      setFDur]      = useState("");
  const [fReason,   setFReason]   = useState("");
  const [fNotes,    setFNotes]    = useState("");

  const load = () => {
    setRxList(getRxList(doctorName));
    setPatientOpts(getDoctorPatients(doctorName));
  };

  useEffect(() => {
    const id = "dr-styles";
    if (!document.getElementById(id)) {
      const s = document.createElement("style"); s.id = id; s.textContent = DOCTOR_STYLES;
      document.head.appendChild(s);
    }
    load();
    // Poll every 3s so new patients appear immediately in dropdown
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
  }, [rxList]);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const submitRx = () => {
    if (!fPatient || !fMed || !fDosage || !fFreq || !fDur || !fReason) {
      showToast("Please fill all required fields", "err"); return;
    }

    // Find patient data for initials/avCls
    const pData = patientOpts.find((p: any) => p.name === fPatient);
    const initials = pData?.initials || fPatient.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
    const avCls    = pData?.avCls || "a1";

    const newRx: Prescription = {
      id:         Date.now(),
      patient:    fPatient,
      initials,
      avCls,
      medication: fMed,
      dosage:     fDosage,
      frequency:  fFreq,
      duration:   fDur,
      date:       new Date().toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }),
      status:     "Active",
      reason:     fReason,
      notes:      fNotes,
    };

    const updated = [newRx, ...rxList];
    setRxList(updated);
    saveRxList(doctorName, updated);
    showToast(`✓ Prescription written for ${fPatient}`);
    setShowForm(false);
    setFPatient(""); setFMed(""); setFDosage(""); setFFreq(""); setFDur(""); setFReason(""); setFNotes("");
  };

  const cancelRx = (id: number) => {
    const name    = rxList.find(r => r.id === id)?.patient;
    const updated = rxList.map(r => r.id === id ? { ...r, status: "Cancelled" as const } : r);
    setRxList(updated);
    saveRxList(doctorName, updated);
    showToast(`Prescription cancelled for ${name}`, "err");
  };

  const printRx = (rx: Prescription) => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Prescription</title></head>
      <body style="font-family:Arial;max-width:600px;margin:40px auto;padding:20px;border:2px solid #333">
        <h2 style="color:#1a3c6e">CureAI — Official Prescription</h2><hr/>
        <p><strong>Patient:</strong> ${rx.patient}</p>
        <p><strong>Date:</strong> ${rx.date}</p>
        <p><strong>Medication:</strong> ${rx.medication} ${rx.dosage}</p>
        <p><strong>Frequency:</strong> ${rx.frequency}</p>
        <p><strong>Duration:</strong> ${rx.duration}</p>
        <p><strong>Reason:</strong> ${rx.reason}</p>
        ${rx.notes ? `<p><strong>Notes:</strong> ${rx.notes}</p>` : ""}
        <hr/><p style="font-size:12px;color:#666">Computer-generated prescription — CureAI</p>
      </body></html>`);
    win.document.close(); win.print();
  };

  const filtered = rxList.filter(r => {
    const q = search.toLowerCase();
    return (r.patient.toLowerCase().includes(q) || r.medication.toLowerCase().includes(q)) &&
           (filter === "All" || r.status === filter);
  });

  const counts = {
    active:    rxList.filter(r => r.status === "Active").length,
    completed: rxList.filter(r => r.status === "Completed").length,
  };

  return (
    <div className="dr-root">
      <style>{DOCTOR_STYLES}</style>
      <div className="dr-grid"/>
      <div className="dr-orb dr-orb1"/><div className="dr-orb dr-orb2"/>
      <DoctorSidebar active="prescriptions"/>

      <main className="dr-main">
        {/* Topbar */}
        <div className="dr-topbar">
          <div>
            <div className="dr-topbar-title">Prescriptions</div>
            <div className="dr-topbar-sub">
              Write and manage patient prescriptions
              {patientOpts.length > 0 && (
                <span style={{marginLeft:10,padding:"2px 10px",borderRadius:8,background:"rgba(52,211,153,.1)",color:"#34d399",border:"1px solid rgba(52,211,153,.2)",fontSize:11,fontWeight:600}}>
                  {patientOpts.length} patient{patientOpts.length!==1?"s":""} available
                </span>
              )}
            </div>
          </div>
          <button
            className="dr-btn-primary"
            onClick={() => setShowForm(true)}
            disabled={patientOpts.length === 0}
            title={patientOpts.length === 0 ? "No patients yet — patients must book an appointment first" : ""}
            style={{ opacity: patientOpts.length === 0 ? .5 : 1, cursor: patientOpts.length === 0 ? "not-allowed" : "pointer" }}
          >
            ✏️ Write Prescription
          </button>
        </div>

        {/* Stats */}
        <div className="dr-stat-grid">
          {[
            { cls:"s1", icls:"c1", icon:"📋", num:rxList.length,    lbl:"Total Rx",    trend:"All time",              dir:"neu" },
            { cls:"s2", icls:"c2", icon:"🟢", num:counts.active,    lbl:"Active",       trend:"Currently prescribed",  dir:"up"  },
            { cls:"s3", icls:"c4", icon:"✅", num:counts.completed, lbl:"Completed",    trend:"Finished course",       dir:"neu" },
            { cls:"s4", icls:"c3", icon:"👥", num:patientOpts.length,lbl:"My Patients",  trend:"Booked patients",       dir:"neu" },
          ].map(s => (
            <div className={`dr-stat-card ${s.cls}`} key={s.lbl}>
              <div className={`dr-stat-icon ${s.icls}`}>{s.icon}</div>
              <div className="dr-stat-num">{s.num}</div>
              <div className="dr-stat-lbl">{s.lbl}</div>
              <div className={`dr-stat-trend ${s.dir}`}>{s.trend}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{display:"flex",gap:"12px",marginBottom:"22px",flexWrap:"wrap",alignItems:"center",animation:"fadeUp .4s .18s both"}}>
          <div className="dr-search-wrap">
            <span className="dr-search-icon">🔍</span>
            <input className="dr-search" placeholder="Search patient or medication…" value={search} onChange={e => setSearch(e.target.value)}/>
          </div>
          <div style={{display:"flex",gap:"6px"}}>
            {["All","Active","Completed","Cancelled"].map(f => (
              <button key={f} style={{
                padding:"8px 14px", borderRadius:"20px", cursor:"pointer",
                fontSize:"12px", fontFamily:"'Sora',sans-serif", fontWeight:500, transition:"all .18s",
                border:     filter===f ? "1.5px solid #38b6ff" : "1.5px solid rgba(255,255,255,.08)",
                background: filter===f ? "rgba(56,182,255,.12)" : "rgba(255,255,255,.03)",
                color:      filter===f ? "#38b6ff" : "rgba(255,255,255,.5)",
              }} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
          <div style={{marginLeft:"auto",fontSize:"12px",color:"rgba(255,255,255,.3)"}}>
            {filtered.length} prescription{filtered.length!==1?"s":""}
          </div>
        </div>

        {/* List */}
        <div className="dr-card">
          {rxList.length === 0 ? (
            <div className="dr-empty">
              <div className="dr-empty-icon">📋</div>
              <div className="dr-empty-title">No prescriptions yet</div>
              <div className="dr-empty-sub">
                {patientOpts.length === 0
                  ? "Patients must book an appointment first before you can write prescriptions."
                  : "Click \"Write Prescription\" to create one for your patients."}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="dr-empty">
              <div className="dr-empty-icon">🔍</div>
              <div className="dr-empty-title">No matches</div>
              <div className="dr-empty-sub">Try a different search or filter.</div>
            </div>
          ) : (
            filtered.map(rx => (
              <div className="dr-row" key={rx.id} style={{cursor:"pointer"}} onClick={() => setViewRx(rx)}>
                <div className={`dr-av ${rx.avCls}`}>{rx.initials}</div>
                <div style={{flex:1}}>
                  <div className="dr-row-name">{rx.patient}</div>
                  <div className="dr-row-sub">{rx.medication} {rx.dosage} · {rx.frequency} · {rx.duration}</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:"12px",color:"rgba(255,255,255,.4)"}}>{rx.date}</div>
                    <span className={`dr-badge ${rx.status==="Active"?"green":rx.status==="Completed"?"blue":"red"}`}>{rx.status}</span>
                  </div>
                  <div style={{display:"flex",gap:"5px"}} onClick={e => e.stopPropagation()}>
                    <button className="dr-btn-ghost" onClick={() => printRx(rx)}>🖨 Print</button>
                    {rx.status === "Active" && (
                      <button className="dr-btn-danger" onClick={() => cancelRx(rx.id)}>Cancel</button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* ── Write Prescription modal ── */}
      {showForm && (
        <div className="dr-overlay" onClick={() => setShowForm(false)}>
          <div className="dr-modal" onClick={e => e.stopPropagation()}>
            <div className="dr-modal-header">
              <div className="dr-modal-icon" style={{background:"rgba(167,139,250,.12)",border:"1px solid rgba(167,139,250,.2)"}}>📋</div>
              <div>
                <div className="dr-modal-title">Write Prescription</div>
                <div className="dr-modal-sub">
                  {patientOpts.length} patient{patientOpts.length!==1?"s":""} available
                </div>
              </div>
              <button className="dr-modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>

            <div className="dr-modal-body">
              {/* Patient dropdown — populated from real booked patients */}
              <div className="dr-form-row">
                <label className="dr-label">Patient *</label>
                <select className="dr-select" value={fPatient} onChange={e => setFPatient(e.target.value)}>
                  <option value="">Select patient…</option>
                  {patientOpts.map((p: any) => (
                    <option key={p.email || p.name} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="dr-form-grid">
                <div className="dr-form-row">
                  <label className="dr-label">Medication *</label>
                  <input className="dr-input" placeholder="e.g. Amoxicillin" value={fMed} onChange={e => setFMed(e.target.value)}/>
                </div>
                <div className="dr-form-row">
                  <label className="dr-label">Dosage *</label>
                  <input className="dr-input" placeholder="e.g. 500mg" value={fDosage} onChange={e => setFDosage(e.target.value)}/>
                </div>
              </div>

              <div className="dr-form-grid">
                <div className="dr-form-row">
                  <label className="dr-label">Frequency *</label>
                  <select className="dr-select" value={fFreq} onChange={e => setFFreq(e.target.value)}>
                    <option value="">Select…</option>
                    {FREQ_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div className="dr-form-row">
                  <label className="dr-label">Duration *</label>
                  <select className="dr-select" value={fDur} onChange={e => setFDur(e.target.value)}>
                    <option value="">Select…</option>
                    {DUR_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="dr-form-row">
                <label className="dr-label">Reason / Diagnosis *</label>
                <input className="dr-input" placeholder="e.g. Respiratory Infection" value={fReason} onChange={e => setFReason(e.target.value)}/>
              </div>

              <div className="dr-form-row" style={{marginBottom:0}}>
                <label className="dr-label">
                  Clinical Notes{" "}
                  <span style={{color:"rgba(255,255,255,.25)",textTransform:"none",letterSpacing:0}}>(optional)</span>
                </label>
                <textarea
                  className="dr-textarea" rows={3}
                  placeholder="Special instructions, warnings, monitoring notes…"
                  value={fNotes} onChange={e => setFNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="dr-modal-footer">
              <button className="dr-modal-cancel" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="dr-modal-confirm" onClick={submitRx}>Issue Prescription →</button>
            </div>
          </div>
        </div>
      )}

      {/* ── View / Print detail modal ── */}
      {viewRx && (
        <div className="dr-overlay" onClick={() => setViewRx(null)}>
          <div className="dr-modal" onClick={e => e.stopPropagation()}>
            <div className="dr-modal-header">
              <div className={`dr-av ${viewRx.avCls}`} style={{width:48,height:48,borderRadius:14,fontSize:17}}>{viewRx.initials}</div>
              <div>
                <div className="dr-modal-title">{viewRx.patient}</div>
                <div className="dr-modal-sub">{viewRx.medication} {viewRx.dosage}</div>
              </div>
              <span className={`dr-badge ${viewRx.status==="Active"?"green":viewRx.status==="Completed"?"blue":"red"}`} style={{marginLeft:"auto",marginRight:8}}>
                {viewRx.status}
              </span>
              <button className="dr-modal-close" onClick={() => setViewRx(null)}>×</button>
            </div>
            <div className="dr-modal-body">
              {[
                ["Medication", `${viewRx.medication} ${viewRx.dosage}`],
                ["Frequency",  viewRx.frequency],
                ["Duration",   viewRx.duration],
                ["Prescribed", viewRx.date],
                ["Reason",     viewRx.reason],
                ["Notes",      viewRx.notes || "—"],
              ].map(([k, v]) => (
                <div key={k} style={{display:"flex",gap:"12px",padding:"10px 14px",borderRadius:"11px",background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",marginBottom:"8px"}}>
                  <span style={{fontSize:"11px",color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".6px",fontWeight:600,width:90,flexShrink:0,paddingTop:2}}>{k}</span>
                  <span style={{fontSize:"13.5px",color:"rgba(255,255,255,.8)"}}>{v}</span>
                </div>
              ))}
            </div>
            <div className="dr-modal-footer">
              <button className="dr-modal-cancel" onClick={() => setViewRx(null)}>Close</button>
              <button className="dr-modal-confirm" onClick={() => { printRx(viewRx); setViewRx(null); }}>🖨 Print Prescription</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`dr-toast${toast.type === "err" ? " error" : ""}`}>{toast.msg}</div>}
    </div>
  );
}