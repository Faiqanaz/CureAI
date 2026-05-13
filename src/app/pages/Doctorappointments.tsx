// ─── DoctorAppointments.tsx ───────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { DoctorSidebar, DOCTOR_STYLES } from "./DoctorSidebar";
import { getDoctorAppointments, saveDoctorAppointments } from "../data/initDoctors";



type ApptStatus = "pending" | "accepted" | "rejected" | "completed";

interface Appointment {
  id: number; patient: string; initials: string; avCls: string;
  date: string; time: string; type: string;
  status: ApptStatus; notes: string;
}

const STATUS_COLOR: Record<string, string> = {
  pending: "yellow", accepted: "green", rejected: "red", completed: "blue",
};

export default function DoctorAppointments() {
  const [appts,       setAppts]       = useState<Appointment[]>([]);
  const [filter,      setFilter]      = useState("all");
  const [search,      setSearch]      = useState("");
  const [modal,       setModal]       = useState<Appointment | null>(null);
  const [reschedDate, setReschedDate] = useState("");
  const [reschedTime, setReschedTime] = useState("");
  const [toast,       setToast]       = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  // Get logged-in doctor's name (strip "Dr. " if present)
  const user       = (() => { try { return JSON.parse(localStorage.getItem("cureai_user") || "{}"); } catch { return {}; } })();
  const doctorName = (user?.name || "").replace(/^Dr\.\s*/i, "").trim();

  // ── Load & poll ──────────────────────────────────────────────────────────────
  const load = () => {
    const stored = getDoctorAppointments(doctorName);
    setAppts(stored);
  };

  useEffect(() => {
    const id = "dr-styles";
    if (!document.getElementById(id)) {
      const s = document.createElement("style"); s.id = id; s.textContent = DOCTOR_STYLES;
      document.head.appendChild(s);
    }
    load();

    // Poll every 3 s so new bookings from the patient side appear live
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
  }, [appts]);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updateAndSave = (updated: Appointment[]) => {
    setAppts(updated);
    saveDoctorAppointments(doctorName, updated);
  };

  const act = (id: number, status: "accepted" | "rejected" | "completed") => {
    const updated = appts.map(a => a.id === id ? { ...a, status } : a);
    updateAndSave(updated);
    const name = appts.find(a => a.id === id)?.patient;
    showToast(
      status === "accepted"  ? `✓ Accepted — ${name}` :
      status === "rejected"  ? `✗ Rejected — ${name}` :
                               `✓ Marked complete — ${name}`,
      status === "rejected" ? "err" : "ok"
    );
  };

  const reschedule = () => {
    if (!modal || !reschedDate || !reschedTime) return;
    const updated = appts.map(a =>
      a.id === modal.id ? { ...a, date: reschedDate, time: reschedTime, status: "accepted" as ApptStatus } : a
    );
    updateAndSave(updated);
    showToast(`📅 Rescheduled ${modal.patient} to ${reschedDate} at ${reschedTime}`);
    setModal(null);
  };

  // ── Derived ──────────────────────────────────────────────────────────────────
  const filtered = appts.filter(a => {
    const q = search.toLowerCase();
    return (a.patient.toLowerCase().includes(q) || a.type?.toLowerCase().includes(q)) &&
           (filter === "all" || a.status === filter);
  });

  const counts = {
    all:       appts.length,
    pending:   appts.filter(a => a.status === "pending").length,
    accepted:  appts.filter(a => a.status === "accepted").length,
    completed: appts.filter(a => a.status === "completed").length,
    rejected:  appts.filter(a => a.status === "rejected").length,
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="dr-root">
      <style>{DOCTOR_STYLES}</style>
      <div className="dr-grid"/>
      <div className="dr-orb dr-orb1"/><div className="dr-orb dr-orb2"/>
      <DoctorSidebar active="appointments"/>

      <main className="dr-main">
        {/* Topbar */}
        <div className="dr-topbar">
          <div>
            <div className="dr-topbar-title">Appointments</div>
            <div className="dr-topbar-sub">
              Real-time schedule · {appts.length} total
              {counts.pending > 0 && (
                <span style={{marginLeft:10,padding:"2px 10px",borderRadius:8,background:"rgba(248,113,113,.1)",color:"#f87171",border:"1px solid rgba(248,113,113,.2)",fontSize:11,fontWeight:600}}>
                  {counts.pending} pending
                </span>
              )}
            </div>
          </div>
          <div className="dr-topbar-right">
            <div className="dr-date-badge">📅 Live Schedule</div>
          </div>
        </div>

        {/* Stats */}
        <div className="dr-stat-grid">
          {[
            { cls:"s1", icls:"c1", icon:"📋", num:counts.all,       lbl:"Total",     trend:"All appointments",      dir:"neu" },
            { cls:"s2", icls:"c3", icon:"⏳", num:counts.pending,    lbl:"Pending",   trend:"Awaiting your action",  dir:counts.pending>0?"up":"neu" },
            { cls:"s3", icls:"c2", icon:"✅", num:counts.accepted,   lbl:"Accepted",  trend:"Confirmed",             dir:"up" },
            { cls:"s4", icls:"c4", icon:"🏁", num:counts.completed,  lbl:"Completed", trend:"Done",                  dir:"neu" },
          ].map(s => (
            <div
              key={s.lbl}
              className={`dr-stat-card ${s.cls}`}
              style={{ cursor:"pointer" }}
              onClick={() => setFilter(s.lbl === "Total" ? "all" : s.lbl.toLowerCase())}
            >
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
            <input
              className="dr-search"
              placeholder="Search patient or appointment type…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
            {["all","pending","accepted","completed","rejected"].map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding:"8px 14px", borderRadius:"20px", cursor:"pointer",
                fontSize:"12px", fontFamily:"'Sora',sans-serif", fontWeight:500,
                transition:"all .18s", textTransform:"capitalize",
                border:  filter===f ? "1.5px solid #38b6ff" : "1.5px solid rgba(255,255,255,.08)",
                background: filter===f ? "rgba(56,182,255,.12)" : "rgba(255,255,255,.03)",
                color:   filter===f ? "#38b6ff" : "rgba(255,255,255,.5)",
              }}>{f}</button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="dr-card">
          {appts.length === 0 ? (
            /* ── No appointments at all ── */
            <div className="dr-empty">
              <div className="dr-empty-icon">📭</div>
              <div className="dr-empty-title">No appointments yet</div>
              <div className="dr-empty-sub">
                Appointments booked by patients will appear here in real time.<br/>
                Ask patients to log in and book through the patient portal.
              </div>
            </div>
          ) : filtered.length === 0 ? (
            /* ── Filter/search returned nothing ── */
            <div className="dr-empty">
              <div className="dr-empty-icon">🔍</div>
              <div className="dr-empty-title">No matches</div>
              <div className="dr-empty-sub">Try a different search term or filter.</div>
            </div>
          ) : (
            filtered.map(a => (
              <div className="dr-row" key={a.id}>
                {/* Avatar */}
                <div className={`dr-av ${a.avCls || "a1"}`}>{a.initials || "?"}</div>

                {/* Info */}
                <div style={{ flex:1 }}>
                  <div className="dr-row-name">{a.patient}</div>
                  <div className="dr-row-sub">{a.type || "Appointment"}{a.notes && a.notes !== "—" ? ` · ${a.notes}` : ""}</div>
                </div>

                {/* Date / time / actions */}
                <div style={{ display:"flex", alignItems:"center", gap:"10px", flexShrink:0 }}>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:"12.5px", color:"#38b6ff", fontWeight:600 }}>📅 {a.date}</div>
                    <div style={{ fontSize:"11.5px", color:"rgba(255,255,255,.4)", marginTop:2 }}>🕐 {a.time}</div>
                  </div>

                  <span className={`dr-badge ${STATUS_COLOR[a.status] || "yellow"}`}>{a.status}</span>

                  {a.status === "pending" && (
                    <div style={{ display:"flex", gap:"5px" }}>
                      <button className="dr-btn-success" onClick={() => act(a.id, "accepted")}>✓ Accept</button>
                      <button className="dr-btn-danger"  onClick={() => act(a.id, "rejected")}>✗ Reject</button>
                      <button className="dr-btn-ghost"   onClick={() => { setModal(a); setReschedDate(""); setReschedTime(""); }}>📅 Reschedule</button>
                    </div>
                  )}
                  {a.status === "accepted" && (
                    <button className="dr-btn-ghost" onClick={() => act(a.id, "completed")}>✓ Mark Done</button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* ── Reschedule modal ── */}
      {modal && (
        <div className="dr-overlay" onClick={() => setModal(null)}>
          <div className="dr-modal" onClick={e => e.stopPropagation()} style={{ maxWidth:420 }}>
            <div className="dr-modal-header">
              <div className="dr-modal-icon" style={{ background:"rgba(56,182,255,.12)", border:"1px solid rgba(56,182,255,.2)" }}>📅</div>
              <div>
                <div className="dr-modal-title">Reschedule Appointment</div>
                <div className="dr-modal-sub">{modal.patient} · {modal.type || "Appointment"}</div>
              </div>
              <button className="dr-modal-close" onClick={() => setModal(null)}>×</button>
            </div>

            <div className="dr-modal-body">
              <div className="dr-form-row">
                <label className="dr-label">New Date</label>
                <input
                  type="date" className="dr-input"
                  min={new Date().toISOString().split("T")[0]}
                  value={reschedDate}
                  onChange={e => setReschedDate(e.target.value)}
                  style={{ colorScheme:"dark" }}
                />
              </div>
              <div className="dr-form-row">
                <label className="dr-label">New Time Slot</label>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                  {["9:00 AM","10:00 AM","11:00 AM","12:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"].map(t => (
                    <button key={t} onClick={() => setReschedTime(t)} style={{
                      padding:"8px 4px", borderRadius:"10px", cursor:"pointer",
                      fontSize:"12px", fontFamily:"'Sora',sans-serif", transition:"all .15s", textAlign:"center",
                      border:      reschedTime===t ? "1.5px solid #38b6ff" : "1.5px solid rgba(255,255,255,.08)",
                      background:  reschedTime===t ? "rgba(56,182,255,.14)" : "rgba(255,255,255,.03)",
                      color:       reschedTime===t ? "#38b6ff" : "rgba(255,255,255,.5)",
                    }}>{t}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="dr-modal-footer">
              <button className="dr-modal-cancel" onClick={() => setModal(null)}>Cancel</button>
              <button
                className="dr-modal-confirm"
                disabled={!reschedDate || !reschedTime}
                onClick={reschedule}
                style={{ opacity: (!reschedDate || !reschedTime) ? .5 : 1 }}
              >
                Confirm Reschedule →
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`dr-toast${toast.type === "err" ? " error" : ""}`}>{toast.msg}</div>}
    </div>
  );
}