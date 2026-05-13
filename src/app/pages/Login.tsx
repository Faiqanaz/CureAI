import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { DB } from "../data/database.ts";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

  @keyframes fadeUp    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes drift     { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-18px) rotate(4deg)} }
  @keyframes drift2    { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(14px) rotate(-6deg)} }
  @keyframes scaleIn   { from{transform:scale(.93);opacity:0} to{transform:scale(1);opacity:1} }
  @keyframes shimmer   { 0%{background-position:200% center} 100%{background-position:-200% center} }
  @keyframes checkPop  { 0%{transform:scale(0) rotate(-20deg)} 70%{transform:scale(1.25) rotate(5deg)} 100%{transform:scale(1) rotate(0)} }
  @keyframes shake     { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
  @keyframes slideRight{ from{width:0} to{width:100%} }
  @keyframes slideOut  { from{opacity:1;transform:scale(1)} to{opacity:0;transform:scale(1.04) translateY(-12px)} }
  @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes rotateSlow{ from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes overlayIn { from{opacity:0} to{opacity:1} }
  @keyframes modalUp   { from{opacity:0;transform:scale(.9) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes stepSlide { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:translateX(0)} }
  @keyframes pulse     { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.2)} }

  .page-exit { animation:slideOut .38s cubic-bezier(.4,0,.2,1) both !important; }

  .li-root { font-family:'Sora',sans-serif; min-height:100vh; background:#050d1a; display:flex; align-items:center; justify-content:center; padding:24px; overflow:hidden; position:relative; }
  .li-grid { position:fixed; inset:0; z-index:0; background-image:linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px); background-size:48px 48px; }
  .li-orb  { position:fixed; border-radius:50%; filter:blur(90px); pointer-events:none; z-index:0; }
  .li-orb1 { width:460px; height:460px; background:radial-gradient(circle,rgba(99,102,241,.18) 0%,transparent 70%); top:-100px; right:-100px; animation:drift 10s ease-in-out infinite; }
  .li-orb2 { width:360px; height:360px; background:radial-gradient(circle,rgba(56,182,255,.14) 0%,transparent 70%); bottom:-80px; left:-80px; animation:drift2 12s ease-in-out infinite; }
  .li-orb3 { width:220px; height:220px; background:radial-gradient(circle,rgba(56,240,200,.09) 0%,transparent 70%); top:40%; left:10%; animation:drift 14s ease-in-out infinite reverse; }

  .li-wrap { position:relative; z-index:1; width:100%; max-width:980px; display:grid; grid-template-columns:1fr 1fr; border-radius:28px; overflow:hidden; box-shadow:0 40px 120px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.07); animation:scaleIn .55s cubic-bezier(.34,1.56,.64,1) both; }
  @media(max-width:720px){ .li-wrap{grid-template-columns:1fr} .li-right{display:none} }

  .li-left { background:#070e1c; padding:48px 42px; position:relative; }

  .li-brand { display:flex; align-items:center; gap:12px; margin-bottom:32px; animation:fadeUp .5s .1s both; }
  .li-logo  { width:42px; height:42px; border-radius:13px; background:linear-gradient(135deg,#38b6ff,#6366f1); display:flex; align-items:center; justify-content:center; font-size:19px; box-shadow:0 6px 20px rgba(56,182,255,.38); }
  .li-brand-name { font-family:'Instrument Serif',serif; font-size:25px; color:#fff; }
  .li-brand-tag  { font-size:10.5px; color:rgba(255,255,255,.35); letter-spacing:.7px; text-transform:uppercase; }

  .li-head { margin-bottom:28px; animation:fadeUp .5s .18s both; }
  .li-head h1 { font-size:26px; font-weight:700; color:#fff; margin-bottom:5px; }
  .li-head p  { font-size:13px; color:rgba(255,255,255,.35); }

  .li-label { display:block; font-size:11.5px; color:rgba(255,255,255,.45); text-transform:uppercase; letter-spacing:.6px; margin-bottom:7px; font-weight:500; }
  .li-field { margin-bottom:16px; }

  .li-input { width:100%; background:rgba(255,255,255,.04); border:1.5px solid rgba(255,255,255,.08); border-radius:12px; padding:11px 14px; color:#fff; font-size:14px; font-family:'Sora',sans-serif; transition:border-color .2s,box-shadow .2s; outline:none; }
  .li-input::placeholder { color:rgba(255,255,255,.2); }
  .li-input:focus { border-color:#6366f1; background:rgba(99,102,241,.05); box-shadow:0 0 0 3px rgba(99,102,241,.13); }
  .li-input.shake { animation:shake .4s ease both; border-color:rgba(255,107,107,.6) !important; }

  .li-pass-wrap { position:relative; }
  .li-pass-wrap .li-input { padding-right:46px; }
  .li-eye { position:absolute; right:13px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:rgba(255,255,255,.28); font-size:16px; display:flex; align-items:center; padding:0; transition:color .18s; line-height:1; }
  .li-eye:hover { color:rgba(255,255,255,.7); }

  .li-role-wrap { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .li-role-btn { padding:11px; border-radius:12px; border:1.5px solid rgba(255,255,255,.08); background:rgba(255,255,255,.03); color:rgba(255,255,255,.45); font-size:13px; font-family:'Sora',sans-serif; font-weight:500; cursor:pointer; transition:all .22s; display:flex; align-items:center; justify-content:center; gap:8px; }
  .li-role-btn:hover { border-color:rgba(99,102,241,.45); color:rgba(255,255,255,.75); }
  .li-role-btn.active { border-color:#6366f1; background:rgba(99,102,241,.14); color:#a5b4fc; }
  .li-role-btn .dot { width:7px; height:7px; border-radius:50%; background:rgba(255,255,255,.2); transition:background .2s; }
  .li-role-btn.active .dot { background:#6366f1; }

  .li-submit { width:100%; padding:13px; border:none; border-radius:14px; background:linear-gradient(135deg,#6366f1,#38b6ff); color:#fff; font-size:14.5px; font-family:'Sora',sans-serif; font-weight:600; cursor:pointer; transition:transform .18s,box-shadow .18s,opacity .18s; margin-top:6px; position:relative; overflow:hidden; animation:fadeUp .5s .42s both; }
  .li-submit::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,.1),transparent); pointer-events:none; }
  .li-submit:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 32px rgba(99,102,241,.38); }
  .li-submit:disabled { opacity:.6; cursor:not-allowed; }
  .li-submit .shimmer { position:absolute; inset:0; background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent); background-size:200% 100%; animation:shimmer 1.5s linear infinite; }

  .li-err { font-size:11.5px; color:#ff6b6b; margin-top:-8px; margin-bottom:10px; padding:8px 12px; background:rgba(255,107,107,.08); border:1px solid rgba(255,107,107,.2); border-radius:8px; animation:fadeUp .3s both; }

  .li-footer { text-align:center; font-size:12.5px; color:rgba(255,255,255,.3); margin-top:20px; animation:fadeUp .5s .48s both; }
  .li-footer a { color:#6cd4ff; font-weight:600; text-decoration:none; }
  .li-footer a:hover { color:#a5b4fc; }
  .li-forgot-btn { display:block; margin-bottom:8px; cursor:pointer; background:none; border:none; font-family:'Sora',sans-serif; font-size:12.5px; color:rgba(255,255,255,.28); transition:color .15s; width:100%; }
  .li-forgot-btn:hover { color:#6cd4ff; }

  .li-success { position:absolute; inset:0; background:#070e1c; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; z-index:10; animation:fadeIn .3s both; }
  .li-check { width:68px; height:68px; border-radius:50%; background:linear-gradient(135deg,#6366f1,#38b6ff); display:flex; align-items:center; justify-content:center; font-size:30px; animation:checkPop .5s cubic-bezier(.34,1.56,.64,1) both; box-shadow:0 0 0 16px rgba(99,102,241,.1); }
  .li-success h2 { font-size:21px; color:#fff; font-weight:700; }
  .li-success p  { font-size:13px; color:rgba(255,255,255,.38); }

  .li-right { background:linear-gradient(145deg,#0f1f3d 0%,#0a1628 40%,#0d1f3a 100%); padding:52px 44px; display:flex; flex-direction:column; justify-content:center; gap:28px; border-left:1px solid rgba(255,255,255,.06); }
  .li-r-divider { width:48px; height:2px; background:linear-gradient(90deg,#6366f1,#38b6ff); border-radius:2px; animation:slideRight .8s .3s both; }
  .li-r-title { font-family:'Instrument Serif',serif; font-size:36px; line-height:1.15; color:#fff; animation:fadeUp .6s .2s both; }
  .li-r-title em { color:#a5b4fc; font-style:italic; }
  .li-r-sub { font-size:13.5px; color:rgba(255,255,255,.42); line-height:1.7; animation:fadeUp .6s .3s both; }
  .li-shield-wrap { display:flex; justify-content:center; animation:fadeUp .6s .35s both; }
  .li-shield { width:130px; height:130px; position:relative; animation:float 4s ease-in-out infinite; }
  .li-shield-bg { width:100%; height:100%; border-radius:24px; background:linear-gradient(135deg,rgba(99,102,241,.2),rgba(56,182,255,.1)); border:1.5px solid rgba(99,102,241,.3); display:flex; align-items:center; justify-content:center; font-size:58px; box-shadow:0 20px 60px rgba(99,102,241,.2); }
  .li-ring { position:absolute; inset:-12px; border-radius:32px; border:1px solid rgba(99,102,241,.15); animation:rotateSlow 12s linear infinite; }
  .li-ring::after { content:''; position:absolute; top:-3px; left:50%; width:6px; height:6px; background:#6366f1; border-radius:50%; transform:translateX(-50%); }
  .li-stat-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; animation:fadeUp .6s .45s both; }
  .li-stat { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); border-radius:14px; padding:14px 16px; }
  .li-stat-num { font-size:20px; font-weight:700; color:#a5b4fc; font-family:'Instrument Serif',serif; }
  .li-stat-lbl { font-size:11px; color:rgba(255,255,255,.35); margin-top:2px; }

  /* ── Forgot Password Modal ── */
  .fp-overlay { position:fixed; inset:0; z-index:500; background:rgba(0,0,0,.75); backdrop-filter:blur(12px); animation:overlayIn .22s both; display:flex; align-items:center; justify-content:center; padding:20px; }
  .fp-modal   { background:#070e1c; border:1px solid rgba(255,255,255,.1); border-radius:26px; width:100%; max-width:420px; box-shadow:0 40px 100px rgba(0,0,0,.7); animation:modalUp .32s cubic-bezier(.34,1.4,.64,1) both; overflow:hidden; }
  .fp-progress { height:3px; background:rgba(255,255,255,.06); }
  .fp-progress-fill { height:100%; background:linear-gradient(90deg,#6366f1,#38b6ff); border-radius:3px; transition:width .4s; }
  .fp-header { padding:26px 26px 0; display:flex; align-items:flex-start; justify-content:space-between; }
  .fp-icon { width:52px; height:52px; border-radius:15px; display:flex; align-items:center; justify-content:center; font-size:24px; flex-shrink:0; }
  .fp-icon.s1 { background:rgba(99,102,241,.15); border:1.5px solid rgba(99,102,241,.3); }
  .fp-icon.s2 { background:rgba(56,182,255,.15); border:1.5px solid rgba(56,182,255,.3); }
  .fp-icon.s3 { background:rgba(52,211,153,.15); border:1.5px solid rgba(52,211,153,.3); }
  .fp-close { width:30px; height:30px; border-radius:8px; border:none; background:rgba(255,255,255,.06); color:rgba(255,255,255,.4); font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all .15s; line-height:1; }
  .fp-close:hover { background:rgba(255,255,255,.12); color:#fff; }
  .fp-body { padding:20px 26px 26px; }
  .fp-step { animation:stepSlide .28s ease both; }
  .fp-title { font-family:'Instrument Serif',serif; font-size:22px; color:#fff; margin-bottom:5px; margin-top:14px; }
  .fp-sub   { font-size:13px; color:rgba(255,255,255,.4); line-height:1.6; margin-bottom:22px; }
  .fp-label { display:block; font-size:11.5px; color:rgba(255,255,255,.42); text-transform:uppercase; letter-spacing:.6px; margin-bottom:7px; font-weight:500; }
  .fp-input { width:100%; background:rgba(255,255,255,.04); border:1.5px solid rgba(255,255,255,.08); border-radius:12px; padding:11px 14px; color:#fff; font-size:14px; font-family:'Sora',sans-serif; outline:none; transition:border-color .2s,box-shadow .2s; margin-bottom:14px; }
  .fp-input::placeholder { color:rgba(255,255,255,.2); }
  .fp-input:focus { border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,.13); }
  .fp-input.error { border-color:rgba(248,113,113,.6) !important; animation:shake .4s ease both; }
  .fp-err { font-size:12px; color:#f87171; padding:9px 13px; background:rgba(248,113,113,.08); border:1px solid rgba(248,113,113,.2); border-radius:10px; margin-bottom:14px; animation:fadeUp .25s both; }
  .fp-strength-bar { height:4px; background:rgba(255,255,255,.07); border-radius:3px; overflow:hidden; margin-bottom:5px; }
  .fp-strength-fill { height:100%; border-radius:3px; transition:width .3s,background .3s; }
  .fp-strength-lbl { font-size:11px; margin-bottom:12px; }
  .fp-hints { margin-bottom:18px; display:flex; flex-direction:column; gap:6px; }
  .fp-hint { display:flex; align-items:center; gap:7px; font-size:12px; color:rgba(255,255,255,.35); transition:color .2s; }
  .fp-hint.ok { color:#34d399; }
  .fp-hint-dot { width:6px; height:6px; border-radius:50%; background:rgba(255,255,255,.2); flex-shrink:0; transition:background .2s; }
  .fp-hint.ok .fp-hint-dot { background:#34d399; }
  .fp-btn { width:100%; padding:13px; border:none; border-radius:13px; background:linear-gradient(135deg,#6366f1,#38b6ff); color:#fff; font-size:14px; font-family:'Sora',sans-serif; font-weight:600; cursor:pointer; transition:transform .18s,opacity .18s; }
  .fp-btn:hover:not(:disabled) { transform:translateY(-2px); }
  .fp-btn:disabled { opacity:.45; cursor:not-allowed; }
  .fp-success-icon { width:72px; height:72px; border-radius:50%; background:linear-gradient(135deg,#34d399,#38b6ff); display:flex; align-items:center; justify-content:center; font-size:30px; margin:0 auto 20px; animation:checkPop .5s cubic-bezier(.34,1.56,.64,1) both; box-shadow:0 0 0 16px rgba(52,211,153,.1); }
  .fp-success-title { font-family:'Instrument Serif',serif; font-size:24px; color:#fff; text-align:center; margin-bottom:8px; }
  .fp-success-sub   { font-size:13px; color:rgba(255,255,255,.4); text-align:center; margin-bottom:24px; }
  .fp-dots { display:flex; align-items:center; gap:6px; justify-content:center; margin-top:16px; }
  .fp-dot { width:6px; height:6px; border-radius:50%; background:rgba(255,255,255,.12); transition:all .25s; }
  .fp-dot.active { background:#6366f1; width:18px; border-radius:3px; }
  .fp-dot.done   { background:rgba(52,211,153,.6); }
`;

function passwordStrength(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p)) s++;
  if (/[0-9]/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#f87171", "#fbbf24", "#38b6ff", "#34d399"];
  return { score: s, label: labels[s] || "", color: colors[s] || "", width: `${s * 25}%` };
}

function ForgotPassword({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [fpEmail, setFpEmail] = useState("");
  const [fpName, setFpName] = useState("");
  const [fpAge, setFpAge] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [fpErr, setFpErr] = useState("");
  const [fpLoading, setFpLoading] = useState(false);
  const [matchedUser, setMatchedUser] = useState<any>(null);
  const [shake, setShake] = useState(false);

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 450); };

  const handleVerify = () => {
    setFpErr("");
    if (!fpEmail || !fpName || !fpAge) {
      setFpErr("Please fill in all fields.");
      triggerShake();
      return;
    }
    const match = DB.findUserForReset(fpEmail, fpName, fpAge);
    if (!match) {
      setFpErr("No account found matching those details.");
      triggerShake();
      return;
    }
    setMatchedUser(match);
    setStep(2);
  };

  const handleReset = () => {
    setFpErr("");
    if (!newPass || !confirmPass) { setFpErr("Please fill both fields."); triggerShake(); return; }
    if (newPass.length < 8) { setFpErr("Password must be at least 8 characters."); triggerShake(); return; }
    if (newPass !== confirmPass) { setFpErr("Passwords do not match."); triggerShake(); return; }
    setFpLoading(true);
    setTimeout(() => {
      DB.updatePassword(matchedUser.email, newPass);
      setFpLoading(false);
      setStep(3);
    }, 900);
  };

  const strength = passwordStrength(newPass);
  const hints = [
    { text: "At least 8 characters", ok: newPass.length >= 8 },
    { text: "One uppercase letter", ok: /[A-Z]/.test(newPass) },
    { text: "One number", ok: /[0-9]/.test(newPass) },
    { text: "Passwords match", ok: newPass.length > 0 && newPass === confirmPass },
  ];
  const progress = step === 1 ? "33%" : step === 2 ? "66%" : "100%";

  return (
    <div className="fp-overlay" onClick={onClose}>
      <div className="fp-modal" onClick={e => e.stopPropagation()}>
        <div className="fp-progress">
          <div className="fp-progress-fill" style={{ width: progress }} />
        </div>
        <div className="fp-header">
          <div className={`fp-icon s${step}`}>
            {step === 1 ? "🔍" : step === 2 ? "🔑" : "✅"}
          </div>
          {step < 3 && <button className="fp-close" onClick={onClose}>×</button>}
        </div>
        <div className="fp-body">

          {/* Step 1 — verify identity */}
          {step === 1 && (
            <div className="fp-step">
              <div className="fp-title">Forgot Password?</div>
              <p className="fp-sub">Enter your registered email, full name, and age to verify your identity.</p>
              {fpErr && <div className="fp-err">⚠ {fpErr}</div>}
              <label className="fp-label">Email</label>
              <input className={`fp-input${shake ? " error" : ""}`} type="email" placeholder="you@example.com" value={fpEmail} onChange={e => setFpEmail(e.target.value)} autoComplete="off" />
              <label className="fp-label">Full Name</label>
              <input className={`fp-input${shake ? " error" : ""}`} type="text" placeholder="As entered during signup" value={fpName} onChange={e => setFpName(e.target.value)} autoComplete="off" />
              <label className="fp-label">Age</label>
              <input className={`fp-input${shake ? " error" : ""}`} type="number" placeholder="Your age" value={fpAge} onChange={e => setFpAge(e.target.value)} autoComplete="off" style={{ marginBottom: 0 }} />
              <div style={{ marginTop: 18 }}>
                <button className="fp-btn" onClick={handleVerify}>Verify Identity →</button>
              </div>
              <div className="fp-dots">
                <div className="fp-dot active" /><div className="fp-dot" /><div className="fp-dot" />
              </div>
            </div>
          )}

          {/* Step 2 — new password */}
          {step === 2 && (
            <div className="fp-step">
              <div className="fp-title">Set New Password</div>
              <p className="fp-sub">Hi <strong style={{ color: "#a5b4fc" }}>{matchedUser?.name}</strong>! Choose a strong new password.</p>
              {fpErr && <div className="fp-err">⚠ {fpErr}</div>}
              <label className="fp-label">New Password</label>
              <input className={`fp-input${shake ? " error" : ""}`} type="password" placeholder="Min. 8 characters" value={newPass} onChange={e => setNewPass(e.target.value)} autoComplete="new-password" />
              {newPass && (
                <>
                  <div className="fp-strength-bar"><div className="fp-strength-fill" style={{ width: strength.width, background: strength.color }} /></div>
                  <div className="fp-strength-lbl" style={{ color: strength.color }}>{strength.label}</div>
                </>
              )}
              <label className="fp-label">Confirm Password</label>
              <input className={`fp-input${shake ? " error" : ""}`} type="password" placeholder="Re-enter password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} autoComplete="new-password" style={{ marginBottom: 12 }} />
              <div className="fp-hints">
                {hints.map(h => (
                  <div key={h.text} className={`fp-hint${h.ok ? " ok" : ""}`}>
                    <span className="fp-hint-dot" />{h.text}
                  </div>
                ))}
              </div>
              <button className="fp-btn" onClick={handleReset} disabled={fpLoading || strength.score < 2 || newPass !== confirmPass}>
                {fpLoading ? "Updating…" : "Reset Password →"}
              </button>
              <div className="fp-dots">
                <div className="fp-dot done" /><div className="fp-dot active" /><div className="fp-dot" />
              </div>
            </div>
          )}

          {/* Step 3 — success */}
          {step === 3 && (
            <div className="fp-step" style={{ textAlign: "center", paddingTop: 8 }}>
              <div className="fp-success-icon">✓</div>
              <div className="fp-success-title">Password Updated!</div>
              <p className="fp-success-sub">Your password has been reset. Sign in with your new password.</p>
              <button className="fp-btn" onClick={onClose}>Back to Sign In →</button>
              <div className="fp-dots" style={{ marginTop: 16 }}>
                <div className="fp-dot done" /><div className="fp-dot done" /><div className="fp-dot active" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const id = "li-styles";
    if (!document.getElementById(id)) {
      const s = document.createElement("style"); s.id = id; s.textContent = STYLES;
      document.head.appendChild(s);
    }
  }, []);

  const goToSignup = (e: React.MouseEvent) => {
    e.preventDefault();
    setExiting(true);
    setTimeout(() => navigate("/signup"), 360);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1️⃣ Try the backend first
      try {
        const res = await axios.post("http://localhost:8080/api/login", { email, password, role });
        if (res.data && res.data.success) {
          DB.setSession({ email, role, name: res.data.name });
          setSuccess(true);
          setTimeout(() => navigate(role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard"), 2000);
          return;
        } else {
          setError(res.data.message || "Invalid credentials.");
          setShake(true);
          setTimeout(() => setShake(false), 500);
          return;
        }
      } catch {
        // Backend unavailable — fall through to local DB
      }

      // 2️⃣ Check local database
      const match = DB.findUser(email, password, role);
      if (match) {
        if (match.verified === false) {
          setError("Your doctor account is pending verification. Please wait for admin approval.");
          setShake(true);
          setTimeout(() => setShake(false), 500);
          return;
        }
        DB.setSession({ email, role, name: match.name });
        setSuccess(true);
        setTimeout(() => navigate(role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard"), 2000);
        return;
      }

      // 3️⃣ Both failed
      setError("Invalid email or password.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      // Always release the loading state unless we navigated away
      setLoading(false);
    }
  };

  return (
    <>
      <div className="li-root">
        <style>{STYLES}</style>
        <div className="li-grid" />
        <div className="li-orb li-orb1" /><div className="li-orb li-orb2" /><div className="li-orb li-orb3" />

        <div className={`li-wrap${exiting ? " page-exit" : ""}`}>

          {/* ── Left: Form ── */}
          <div className="li-left">
            {success && (
              <div className="li-success">
                <div className="li-check">✓</div>
                <h2>Welcome back!</h2>
                <p>Taking you to your dashboard…</p>
              </div>
            )}

            <div className="li-brand">
              <div className="li-logo">🩺</div>
              <div>
                <div className="li-brand-name" style={{ fontFamily: "'Instrument Serif',serif" }}>CureAI</div>
                <div className="li-brand-tag">Intelligent Healthcare</div>
              </div>
            </div>

            <div className="li-head">
              <h1>Welcome back</h1>
              <p>Sign in to access your account</p>
            </div>

            <form onSubmit={handleLogin} autoComplete="off">
              <div className="li-field">
                <label className="li-label">Email Address</label>
                <input className={`li-input${shake ? " shake" : ""}`} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="off" required />
              </div>

              <div className="li-field">
                <label className="li-label">Password</label>
                <div className="li-pass-wrap">
                  <input className={`li-input${shake ? " shake" : ""}`} type={showPass ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" required />
                  <button type="button" className="li-eye" onClick={() => setShowPass(p => !p)} tabIndex={-1}>
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {error && <div className="li-err">⚠ {error}</div>}

              <div className="li-field">
                <label className="li-label">Sign in as</label>
                <div className="li-role-wrap">
                  <button type="button" className={`li-role-btn${role === "patient" ? " active" : ""}`} onClick={() => setRole("patient")}>
                    <span className="dot" /><span>🧑‍⚕️ Patient</span>
                  </button>
                  <button type="button" className={`li-role-btn${role === "doctor" ? " active" : ""}`} onClick={() => setRole("doctor")}>
                    <span className="dot" /><span>👨‍⚕️ Doctor</span>
                  </button>
                </div>
              </div>

              <button type="submit" className="li-submit" disabled={loading}>
                {loading ? <><span className="shimmer" /><span>Authenticating…</span></> : "Sign In →"}
              </button>

              <div className="li-footer">
                <button type="button" className="li-forgot-btn" onClick={() => setShowForgot(true)}>
                  Forgot password?
                </button>
                Don't have an account?{" "}
                <a href="/signup" onClick={goToSignup}>Create one →</a>
              </div>
            </form>
          </div>

          {/* ── Right: Visual panel ── */}
          <div className="li-right">
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: "18px", color: "rgba(255,255,255,.5)" }}>
              Trusted by 50,000+ patients
            </div>
            <div className="li-r-divider" />
            <h2 className="li-r-title">Secure.<br /><em>Intelligent.</em><br />Always on.</h2>
            <p className="li-r-sub">Your health records, doctor connections, and AI-powered insights — protected with enterprise-grade encryption.</p>
            <div className="li-shield-wrap">
              <div className="li-shield">
                <div className="li-ring" />
                <div className="li-shield-bg">🔐</div>
              </div>
            </div>
            <div className="li-stat-row">
              {[["99.9%", "Uptime SLA"], ["256-bit", "Encryption"], ["2,400+", "Doctors"], ["HIPAA", "Compliant"]].map(([n, l]) => (
                <div className="li-stat" key={l}>
                  <div className="li-stat-num">{n}</div>
                  <div className="li-stat-lbl">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showForgot && <ForgotPassword onClose={() => setShowForgot(false)} />}
    </>
  );
}