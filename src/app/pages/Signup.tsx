import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeUp   { from { opacity:0; transform:translateY(28px);  } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes drift    { 0%,100% { transform:translateY(0) rotate(0deg); } 50% { transform:translateY(-18px) rotate(4deg); } }
  @keyframes drift2   { 0%,100% { transform:translateY(0) rotate(0deg); } 50% { transform:translateY(14px) rotate(-6deg); } }
  @keyframes shimmer  { 0% { background-position:200% center; } 100% { background-position:-200% center; } }
  @keyframes scaleIn  { from { transform:scale(.92); opacity:0; } to { transform:scale(1); opacity:1; } }
  @keyframes slideRight { from { width:0; } to { width:100%; } }
  @keyframes checkPop { 0%{ transform:scale(0) rotate(-20deg); } 70%{ transform:scale(1.25) rotate(5deg); } 100%{ transform:scale(1) rotate(0); } }
  @keyframes shake { 0%,100%{ transform:translateX(0); } 20%,60%{ transform:translateX(-6px); } 40%,80%{ transform:translateX(6px); } }
  @keyframes spin  { 0%{ transform:rotate(0deg); } 100%{ transform:rotate(360deg); } }
  @keyframes pulse { 0%,100%{ opacity:.5; transform:scale(1); } 50%{ opacity:1; transform:scale(1.15); } }
  @keyframes pendingIn { from{ opacity:0; transform:scale(.9) translateY(20px); } to{ opacity:1; transform:scale(1) translateY(0); } }

  .su-root { font-family:'Sora',sans-serif; min-height:100vh; background:#050d1a; display:flex; align-items:center; justify-content:center; padding:24px; overflow:hidden; position:relative; }
  .su-orb { position:fixed; border-radius:50%; filter:blur(90px); pointer-events:none; z-index:0; }
  .su-orb1 { width:480px; height:480px; background:radial-gradient(circle,rgba(56,182,255,.18) 0%,transparent 70%); top:-120px; left:-120px; animation:drift 9s ease-in-out infinite; }
  .su-orb2 { width:380px; height:380px; background:radial-gradient(circle,rgba(147,99,255,.15) 0%,transparent 70%); bottom:-80px; right:-80px; animation:drift2 11s ease-in-out infinite; }
  .su-orb3 { width:260px; height:260px; background:radial-gradient(circle,rgba(56,240,200,.10) 0%,transparent 70%); top:50%; right:8%; animation:drift 13s ease-in-out infinite reverse; }
  .su-grid { position:fixed; inset:0; z-index:0; background-image:linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px); background-size:48px 48px; }

  .su-wrap { position:relative; z-index:1; width:100%; max-width:980px; display:grid; grid-template-columns:1fr 1fr; gap:0; border-radius:28px; overflow:hidden; box-shadow:0 40px 120px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.07); animation:scaleIn .55s cubic-bezier(.34,1.56,.64,1) both; }
  @media(max-width:720px){ .su-wrap{ grid-template-columns:1fr; } .su-left{ display:none; } }

  .su-left { background:linear-gradient(145deg,#0f1f3d 0%,#0a1628 40%,#0d1f3a 100%); padding:52px 44px; display:flex; flex-direction:column; justify-content:center; gap:28px; border-right:1px solid rgba(255,255,255,.06); }
  .su-brand { display:flex; align-items:center; gap:12px; animation:fadeUp .6s .1s both; }
  .su-logo  { width:44px; height:44px; border-radius:14px; background:linear-gradient(135deg,#38b6ff,#6366f1); display:flex; align-items:center; justify-content:center; font-size:20px; box-shadow:0 8px 24px rgba(56,182,255,.4); }
  .su-brand-name { font-family:'Instrument Serif',serif; font-size:26px; color:#fff; letter-spacing:-.3px; }
  .su-brand-tag  { font-size:11px; color:rgba(255,255,255,.4); letter-spacing:.6px; text-transform:uppercase; margin-top:2px; }
  .su-hero-title { font-family:'Instrument Serif',serif; font-size:38px; line-height:1.15; color:#fff; animation:fadeUp .6s .2s both; }
  .su-hero-title em { color:#38b6ff; font-style:italic; }
  .su-hero-sub { font-size:13.5px; color:rgba(255,255,255,.45); line-height:1.7; animation:fadeUp .6s .3s both; }
  .su-feature { display:flex; align-items:flex-start; gap:12px; animation:fadeUp .6s .4s both; }
  .su-feat-icon { width:36px; height:36px; border-radius:10px; background:rgba(56,182,255,.1); border:1px solid rgba(56,182,255,.2); display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
  .su-feat-text { font-size:13px; color:rgba(255,255,255,.5); line-height:1.5; }
  .su-feat-text strong { color:rgba(255,255,255,.8); display:block; font-size:13.5px; margin-bottom:2px; }
  .su-divider { width:48px; height:2px; background:linear-gradient(90deg,#38b6ff,#6366f1); border-radius:2px; animation:slideRight .8s .5s both; }

  .su-right { background:#070e1c; padding:44px 40px; }
  .su-form-head { margin-bottom:28px; animation:fadeUp .6s .15s both; }
  .su-form-head h1 { font-size:24px; font-weight:700; color:#fff; margin-bottom:6px; }
  .su-form-head p  { font-size:13px; color:rgba(255,255,255,.35); }

  .su-field { margin-bottom:16px; animation:fadeUp .5s both; }
  .su-field:nth-child(1){ animation-delay:.2s; }
  .su-field:nth-child(2){ animation-delay:.25s; }
  .su-field:nth-child(3){ animation-delay:.3s; }
  .su-field:nth-child(4){ animation-delay:.35s; }
  .su-field:nth-child(5){ animation-delay:.4s; }

  .su-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .su-label { display:block; font-size:11.5px; color:rgba(255,255,255,.45); text-transform:uppercase; letter-spacing:.6px; margin-bottom:7px; font-weight:500; }

  .su-input { width:100%; background:rgba(255,255,255,.04); border:1.5px solid rgba(255,255,255,.08); border-radius:12px; padding:11px 14px; color:#fff; font-size:14px; font-family:'Sora',sans-serif; transition:border-color .2s,box-shadow .2s,background .2s; outline:none; }
  .su-input::placeholder { color:rgba(255,255,255,.2); }
  .su-input:focus { border-color:#38b6ff; background:rgba(56,182,255,.05); box-shadow:0 0 0 3px rgba(56,182,255,.12); }
  .su-input:hover:not(:focus) { border-color:rgba(255,255,255,.15); }
  .su-input.su-error { animation:shake .4s ease both; border-color:rgba(255,107,107,.6) !important; }
  select.su-input option { background:#0a1628; color:#fff; }
  select.su-input option[value=""] { color:rgba(255,255,255,.3); }

  .su-role-wrap { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .su-role-btn { padding:11px; border-radius:12px; border:1.5px solid rgba(255,255,255,.08); background:rgba(255,255,255,.03); color:rgba(255,255,255,.45); font-size:13px; font-family:'Sora',sans-serif; font-weight:500; cursor:pointer; transition:all .22s; display:flex; align-items:center; justify-content:center; gap:8px; }
  .su-role-btn:hover { border-color:rgba(56,182,255,.4); color:rgba(255,255,255,.75); background:rgba(56,182,255,.06); }
  .su-role-btn.active { border-color:#38b6ff; background:rgba(56,182,255,.12); color:#38b6ff; box-shadow:0 0 0 3px rgba(56,182,255,.1); }
  .su-role-btn.active .su-role-dot { background:#38b6ff; }
  .su-role-dot { width:7px; height:7px; border-radius:50%; background:rgba(255,255,255,.2); transition:background .2s; }

  .su-submit { width:100%; padding:13px; border:none; border-radius:14px; background:linear-gradient(135deg,#38b6ff 0%,#6366f1 100%); color:#fff; font-size:14.5px; font-family:'Sora',sans-serif; font-weight:600; cursor:pointer; letter-spacing:.2px; transition:transform .18s,box-shadow .18s,opacity .18s; margin-top:4px; position:relative; overflow:hidden; animation:fadeUp .5s .5s both; }
  .su-submit::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,.12),transparent); pointer-events:none; }
  .su-submit:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 32px rgba(56,182,255,.35); }
  .su-submit:disabled { opacity:.6; cursor:not-allowed; }
  .su-submit .shimmer { position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent); background-size:200% 100%; animation:shimmer 1.5s linear infinite; }

  /* patient success (quick redirect) */
  .su-success { position:absolute; inset:0; background:#070e1c; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:16px; z-index:10; border-radius:0 28px 28px 0; animation:fadeIn .3s both; }
  .su-check { width:72px; height:72px; border-radius:50%; background:linear-gradient(135deg,#38b6ff,#6366f1); display:flex; align-items:center; justify-content:center; font-size:32px; animation:checkPop .5s cubic-bezier(.34,1.56,.64,1) both; box-shadow:0 0 0 16px rgba(56,182,255,.1); }
  .su-success h2 { font-size:22px; color:#fff; font-weight:700; }
  .su-success p  { font-size:13px; color:rgba(255,255,255,.4); }

  /* doctor pending verification screen */
  .su-pending { position:absolute; inset:0; background:#070e1c; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 36px; z-index:10; border-radius:0 28px 28px 0; animation:pendingIn .4s cubic-bezier(.34,1.2,.64,1) both; text-align:center; }
  .su-pending-icon { width:80px; height:80px; border-radius:50%; background:linear-gradient(135deg,rgba(251,191,36,.15),rgba(248,113,113,.1)); border:2px solid rgba(251,191,36,.35); display:flex; align-items:center; justify-content:center; font-size:36px; margin:0 auto 20px; box-shadow:0 0 0 16px rgba(251,191,36,.06); }
  .su-pending h2 { font-family:'Instrument Serif',serif; font-size:24px; color:#fff; margin-bottom:10px; }
  .su-pending-sub { font-size:13.5px; color:rgba(255,255,255,.45); line-height:1.7; max-width:320px; margin:0 auto 24px; }
  .su-pending-steps { width:100%; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:16px; padding:20px; margin-bottom:24px; text-align:left; }
  .su-pending-step { display:flex; align-items:flex-start; gap:12px; margin-bottom:14px; }
  .su-pending-step:last-child { margin-bottom:0; }
  .su-pending-step-num { width:26px; height:26px; border-radius:50%; background:rgba(251,191,36,.12); border:1.5px solid rgba(251,191,36,.3); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:#fbbf24; flex-shrink:0; margin-top:1px; }
  .su-pending-step-text { font-size:13px; color:rgba(255,255,255,.55); line-height:1.55; }
  .su-pending-step-text strong { color:rgba(255,255,255,.85); display:block; margin-bottom:2px; font-size:13.5px; }
  .su-pending-email { display:flex; align-items:center; gap:8px; background:rgba(56,182,255,.07); border:1px solid rgba(56,182,255,.18); border-radius:12px; padding:11px 16px; margin-bottom:22px; font-size:13px; color:#38b6ff; word-break:break-all; }
  .su-pending-back { width:100%; padding:12px; border-radius:12px; border:1.5px solid rgba(255,255,255,.1); background:transparent; color:rgba(255,255,255,.55); font-size:13.5px; font-family:'Sora',sans-serif; font-weight:500; cursor:pointer; transition:all .18s; }
  .su-pending-back:hover { border-color:rgba(255,255,255,.25); color:#fff; background:rgba(255,255,255,.05); }

  .su-footer { text-align:center; font-size:12.5px; color:rgba(255,255,255,.3); margin-top:20px; animation:fadeUp .5s .55s both; }
  .su-footer a { color:#38b6ff; font-weight:600; text-decoration:none; transition:color .15s; }
  .su-footer a:hover { color:#6cd4ff; }
  .su-err-msg { font-size:11.5px; color:#ff6b6b; margin-top:6px; padding:8px 12px; background:rgba(255,107,107,.08); border:1px solid rgba(255,107,107,.2); border-radius:8px; }

  /* doctor role warning hint */
  .su-dr-hint { display:flex; align-items:flex-start; gap:8px; padding:10px 13px; background:rgba(251,191,36,.06); border:1px solid rgba(251,191,36,.18); border-radius:10px; font-size:12px; color:rgba(251,191,36,.8); line-height:1.55; margin-top:8px; }
  .su-dr-hint-icon { flex-shrink:0; font-size:14px; margin-top:1px; }

  .su-pass-wrap { position:relative; }
  .su-pass-wrap .su-input { padding-right:44px; }
  .su-eye-btn { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; padding:0; color:rgba(255,255,255,.28); line-height:1; transition:color .18s; display:flex; align-items:center; }
  .su-eye-btn:hover { color:rgba(255,255,255,.7); }
  .su-eye-btn svg { width:18px; height:18px; stroke:currentColor; fill:none; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }
`;

const EyeOpen = () => (
  <svg viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOff = () => (
  <svg viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export default function Signup() {
  const [name,       setName]       = useState("");
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [age,        setAge]        = useState("");
  const [gender,     setGender]     = useState<"male"|"female"|"other"|"">("");
  const [role,       setRole]       = useState<"patient"|"doctor">("patient");
  const [loading,    setLoading]    = useState(false);
  const [success,    setSuccess]    = useState(false);   // patient success
  const [pending,    setPending]    = useState(false);   // doctor pending
  const [error,      setError]      = useState("");
  const [showPass,   setShowPass]   = useState(false);
  const [regEmail,   setRegEmail]   = useState("");      // remember for pending screen

  const navigate = useNavigate();

  useEffect(() => {
    const id = "cure-ai-signup-styles";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id; s.textContent = STYLES;
      document.head.appendChild(s);
    }
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gender) { setError("Please select your gender."); return; }
    setLoading(true);
    setError("");

    // ── check duplicate ──
    const existing: any[] = JSON.parse(localStorage.getItem("cureai_users") || "[]");
    if (existing.find((u: any) => u.email === email)) {
      setError("This email is already registered.");
      setLoading(false);
      return;
    }

    // ── build payload ──
    // Doctors get verified:false — they cannot log in until approved
    const payload: any = {
      name, email, password, role,
      age:      parseInt(age),
      gender,
      verified: role === "patient" ? true : false, // patients auto-verified, doctors pending
    };

    existing.push(payload);
    localStorage.setItem("cureai_users", JSON.stringify(existing));

    // If doctor, also add to pending queue so the admin tool can see them
    if (role === "doctor") {
      const pending: any[] = JSON.parse(localStorage.getItem("cureai_pending_doctors") || "[]");
      pending.push({
        name,
        email,
        age: parseInt(age),
        gender,
        registeredAt: new Date().toISOString(),
        status: "pending",
      });
      localStorage.setItem("cureai_pending_doctors", JSON.stringify(pending));
    }

    try {
      await axios.post("http://localhost:8080/api/signup", payload);
    } catch {
      console.warn("Backend unavailable — saved locally.");
    }

    setLoading(false);
    setRegEmail(email);

    if (role === "patient") {
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2200);
    } else {
      // Doctor → show pending verification screen (do NOT redirect to login)
      setPending(true);
    }
  };

  return (
    <div className="su-root">
      <style>{STYLES}</style>
      <div className="su-grid" />
      <div className="su-orb su-orb1" />
      <div className="su-orb su-orb2" />
      <div className="su-orb su-orb3" />

      <div className="su-wrap">
        {/* ── Left panel ── */}
        <div className="su-left">
          <div className="su-brand">
            <div className="su-logo">🩺</div>
            <div>
              <div className="su-brand-name">CureAI</div>
              <div className="su-brand-tag">Intelligent Healthcare</div>
            </div>
          </div>
          <div className="su-divider" />
          <h2 className="su-hero-title">Your health,<br /><em>intelligently</em><br />managed.</h2>
          <p className="su-hero-sub">Connect with certified doctors, get AI-powered insights, and take control of your wellness journey.</p>
          <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
            {[
              { icon:"🔒", title:"Private & Secure", sub:"End-to-end encrypted records" },
              { icon:"🤖", title:"AI Diagnostics",   sub:"Smart symptom analysis" },
              { icon:"📅", title:"Instant Booking",  sub:"Appointments in seconds" },
            ].map(f => (
              <div className="su-feature" key={f.title}>
                <div className="su-feat-icon">{f.icon}</div>
                <div className="su-feat-text"><strong>{f.title}</strong>{f.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="su-right" style={{position:"relative"}}>

          {/* Patient → success overlay */}
          {success && (
            <div className="su-success">
              <div className="su-check">✓</div>
              <h2>You're all set!</h2>
              <p>Redirecting to login…</p>
            </div>
          )}

          {/* Doctor → pending verification overlay */}
          {pending && (
            <div className="su-pending">
              <div className="su-pending-icon">⏳</div>
              <h2>Application Submitted!</h2>
              <p className="su-pending-sub">
                Your doctor account has been registered and is <strong style={{color:"#fbbf24"}}>pending verification</strong>. You cannot log in until approved.
              </p>

              <div className="su-pending-steps">
                <div className="su-pending-step">
                  <div className="su-pending-step-num">1</div>
                  <div className="su-pending-step-text">
                    <strong>Application Received</strong>
                    Your details have been saved and sent for review.
                  </div>
                </div>
                <div className="su-pending-step">
                  <div className="su-pending-step-num">2</div>
                  <div className="su-pending-step-text">
                    <strong>Identity Verification</strong>
                    Our team will verify your medical credentials and license.
                  </div>
                </div>
                <div className="su-pending-step">
                  <div className="su-pending-step-num">3</div>
                  <div className="su-pending-step-text">
                    <strong>You Will Be Contacted</strong>
                    Once approved, you'll receive a confirmation and can log in.
                  </div>
                </div>
              </div>

              <p style={{fontSize:"12px",color:"rgba(255,255,255,.35)",marginBottom:10}}>Registered email:</p>
              <div className="su-pending-email">
                <span>✉️</span>
                <span>{regEmail}</span>
              </div>

              <button className="su-pending-back" onClick={() => navigate("/login")}>
                Back to Login →
              </button>
            </div>
          )}

          <div className="su-form-head">
            <h1>Create Account</h1>
            <p>Start your health journey today</p>
          </div>

          <form onSubmit={handleSignup} autoComplete="off">
            {/* Name + Age */}
            <div className="su-field">
              <div className="su-row">
                <div>
                  <label className="su-label">Full Name</label>
                  <input
                    className="su-input" placeholder="Your full name"
                    value={name} onChange={e => setName(e.target.value)}
                    autoComplete="off" required
                  />
                </div>
                <div>
                  <label className="su-label">Age</label>
                  <input
                    className="su-input" type="number" placeholder="28"
                    min={1} max={120} autoComplete="off"
                    value={age} onChange={e => setAge(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="su-field">
              <label className="su-label">Email Address</label>
              <input
                className={`su-input${error ? " su-error" : ""}`}
                type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                autoComplete="off" required
              />
            </div>

            {/* Password */}
            <div className="su-field">
              <label className="su-label">Password</label>
              <div className="su-pass-wrap">
                <input
                  className="su-input"
                  type={showPass ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  value={password} onChange={e => setPassword(e.target.value)}
                  minLength={8} required
                />
                <button type="button" className="su-eye-btn" onClick={() => setShowPass(p => !p)} tabIndex={-1}>
                  {showPass ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>
            </div>

            {/* Gender */}
            <div className="su-field">
              <label className="su-label">Gender</label>
              <select
                className={`su-input${!gender && error ? " su-error" : ""}`}
                value={gender} onChange={e => setGender(e.target.value as any)}
                required
              >
                <option value="" disabled>Select gender…</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other / Prefer not to say</option>
              </select>
            </div>

            {/* Role */}
            <div className="su-field">
              <label className="su-label">I am a…</label>
              <div className="su-role-wrap">
                <button type="button" className={`su-role-btn${role==="patient"?" active":""}`} onClick={() => setRole("patient")}>
                  <span className="su-role-dot"/><span>🧑‍⚕️ Patient</span>
                </button>
                <button type="button" className={`su-role-btn${role==="doctor"?" active":""}`} onClick={() => setRole("doctor")}>
                  <span className="su-role-dot"/><span>👨‍⚕️ Doctor</span>
                </button>
              </div>

              {/* Show warning when doctor is selected */}
              {role === "doctor" && (
                <div className="su-dr-hint">
                  <span className="su-dr-hint-icon">⚠️</span>
                  <span>Doctor accounts require <strong>manual verification</strong>. You won't be able to log in until our team reviews and approves your application.</span>
                </div>
              )}
            </div>

            {error && <div className="su-err-msg">⚠ {error}</div>}

            <button type="submit" className="su-submit" disabled={loading} style={{marginTop:"18px"}}>
              {loading
                ? <><span className="shimmer"/><span>Submitting…</span></>
                : role === "doctor"
                  ? "Submit Application →"
                  : "Create My Account →"
              }
            </button>

            <div className="su-footer">
              Already have an account?{" "}
              <Link to="/login">Sign in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}