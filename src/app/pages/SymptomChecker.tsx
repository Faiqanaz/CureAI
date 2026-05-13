import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";


// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes fadeUp    { from{ opacity:0; transform:translateY(18px); } to{ opacity:1; transform:translateY(0); } }
  @keyframes fadeIn    { from{ opacity:0; } to{ opacity:1; } }
  @keyframes msgIn     { from{ opacity:0; transform:translateY(10px); } to{ opacity:1; transform:translateY(0); } }
  @keyframes typingDot { 0%,80%,100%{ transform:scale(0); opacity:.3; } 40%{ transform:scale(1); opacity:1; } }
  @keyframes pulse     { 0%,100%{ opacity:.5; transform:scale(1); } 50%{ opacity:1; transform:scale(1.2); } }
  @keyframes drift     { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(-14px); } }
  @keyframes drift2    { 0%,100%{ transform:translateY(0); } 50%{ transform:translateY(10px); } }
  @keyframes shimmer   { 0%{ background-position:200% center; } 100%{ background-position:-200% center; } }
  @keyframes popIn     { from{ opacity:0; transform:scale(.85); } to{ opacity:1; transform:scale(1); } }
  @keyframes slideUp   { from{ opacity:0; transform:translateY(30px); } to{ opacity:1; transform:translateY(0); } }

  html,body { height:100%; overflow:hidden; }
  body,.sc-root { font-family:'Sora',sans-serif; background:#050d1a; color:#fff; height:100vh; display:flex; flex-direction:column; overflow:hidden; }

  /* ── bg ── */
  .sc-grid { position:fixed; inset:0; z-index:0; pointer-events:none;
    background-image:linear-gradient(rgba(255,255,255,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.022) 1px,transparent 1px);
    background-size:52px 52px; }
  .sc-orb  { position:fixed; border-radius:50%; filter:blur(100px); pointer-events:none; z-index:0; }
  .sc-orb1 { width:450px; height:450px; background:radial-gradient(circle,rgba(56,182,255,.1) 0%,transparent 70%);  top:-120px; right:-80px;  animation:drift  11s ease-in-out infinite; }
  .sc-orb2 { width:350px; height:350px; background:radial-gradient(circle,rgba(99,102,241,.09) 0%,transparent 70%); bottom:-80px; left:-60px; animation:drift2 13s ease-in-out infinite; }

  /* ── header ── */
  .sc-header { position:relative; z-index:10; background:rgba(5,13,26,.85); backdrop-filter:blur(20px); border-bottom:1px solid rgba(255,255,255,.06); padding:0 28px; height:68px; display:flex; align-items:center; justify-content:space-between; flex-shrink:0; animation:fadeUp .4s both; }
  .sc-header-left { display:flex; align-items:center; gap:14px; }
  .sc-back { width:36px; height:36px; border-radius:10px; border:1.5px solid rgba(255,255,255,.1); background:rgba(255,255,255,.04); display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:16px; transition:all .18s; flex-shrink:0; }
  .sc-back:hover { border-color:rgba(56,182,255,.4); background:rgba(56,182,255,.08); }
  .sc-agent { display:flex; align-items:center; gap:12px; }
  .sc-agent-av { width:42px; height:42px; border-radius:13px; background:linear-gradient(135deg,#38b6ff,#6366f1); display:flex; align-items:center; justify-content:center; font-size:20px; box-shadow:0 4px 16px rgba(56,182,255,.35); flex-shrink:0; }
  .sc-agent-name { font-size:15px; font-weight:700; color:#fff; }
  .sc-agent-status { font-size:11.5px; color:#34d399; display:flex; align-items:center; gap:5px; margin-top:1px; }
  .sc-agent-dot { width:6px; height:6px; border-radius:50%; background:#34d399; animation:pulse 2s ease-in-out infinite; }
  .sc-header-right { display:flex; align-items:center; gap:8px; }
  .sc-model-badge { font-size:11px; padding:4px 10px; border-radius:8px; background:rgba(56,182,255,.08); border:1px solid rgba(56,182,255,.18); color:#38b6ff; }
  .sc-clear-btn { padding:6px 14px; border-radius:9px; border:1.5px solid rgba(255,255,255,.08); background:transparent; color:rgba(255,255,255,.4); font-size:12px; font-family:'Sora',sans-serif; cursor:pointer; transition:all .18s; }
  .sc-clear-btn:hover { border-color:rgba(248,113,113,.35); color:#f87171; background:rgba(248,113,113,.06); }

  /* ── quick prompts ── */
  .sc-quick-bar { position:relative; z-index:5; padding:10px 28px; border-bottom:1px solid rgba(255,255,255,.04); background:rgba(5,13,26,.6); display:flex; align-items:center; gap:8px; overflow-x:auto; flex-shrink:0; scrollbar-width:none; }
  .sc-quick-bar::-webkit-scrollbar { display:none; }
  .sc-quick-lbl { font-size:11px; color:rgba(255,255,255,.28); white-space:nowrap; flex-shrink:0; }
  .sc-quick-pill { padding:5px 13px; border-radius:16px; border:1px solid rgba(255,255,255,.08); background:rgba(255,255,255,.03); color:rgba(255,255,255,.45); font-size:11.5px; font-family:'Sora',sans-serif; cursor:pointer; white-space:nowrap; transition:all .18s; flex-shrink:0; }
  .sc-quick-pill:hover { border-color:rgba(56,182,255,.35); color:#38b6ff; background:rgba(56,182,255,.07); }

  /* ── messages area ── */
  .sc-messages { flex:1; overflow-y:auto; padding:24px 28px; display:flex; flex-direction:column; gap:18px; position:relative; z-index:1; scroll-behavior:smooth; }
  .sc-messages::-webkit-scrollbar { width:4px; }
  .sc-messages::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1); border-radius:4px; }

  /* ── message ── */
  .sc-msg { display:flex; gap:12px; animation:msgIn .28s ease both; max-width:80%; }
  .sc-msg.user { align-self:flex-end; flex-direction:row-reverse; }
  @media(max-width:640px){ .sc-msg{ max-width:95%; } }

  .sc-msg-av { width:34px; height:34px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; margin-top:2px; }
  .sc-msg.ai   .sc-msg-av { background:linear-gradient(135deg,#38b6ff,#6366f1); box-shadow:0 3px 12px rgba(56,182,255,.25); }
  .sc-msg.user .sc-msg-av { background:linear-gradient(135deg,#6366f1,#a78bfa); }

  .sc-bubble { padding:13px 16px; border-radius:16px; font-size:13.5px; line-height:1.7; position:relative; }
  .sc-msg.ai   .sc-bubble { background:rgba(255,255,255,.06); color:rgba(255,255,255,.9); border:1px solid rgba(255,255,255,.08); border-radius:4px 16px 16px 16px; }
  .sc-msg.user .sc-bubble { background:linear-gradient(135deg,rgba(56,182,255,.22),rgba(99,102,241,.22)); color:#fff; border:1px solid rgba(56,182,255,.22); border-radius:16px 4px 16px 16px; }
  .sc-bubble strong { color:#38b6ff; }
  .sc-bubble ul,.sc-bubble ol { padding-left:18px; margin-top:6px; }
  .sc-bubble li { margin-bottom:4px; }
  .sc-bubble p+p { margin-top:8px; }
  .sc-msg-time { font-size:10.5px; color:rgba(255,255,255,.22); margin-top:5px; padding:0 4px; }
  .sc-msg.user .sc-msg-time { text-align:right; }

  /* ── typing ── */
  .sc-typing { display:flex; align-items:center; gap:5px; padding:13px 16px; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.08); border-radius:4px 16px 16px 16px; }
  .sc-typing span { width:7px; height:7px; border-radius:50%; background:#38b6ff; animation:typingDot 1.2s ease-in-out infinite; }
  .sc-typing span:nth-child(2){ animation-delay:.2s; }
  .sc-typing span:nth-child(3){ animation-delay:.4s; }

  /* ── disclaimer chip ── */
  .sc-disclaimer { display:flex; align-items:flex-start; gap:10px; padding:12px 16px; border-radius:14px; background:rgba(251,191,36,.06); border:1px solid rgba(251,191,36,.15); font-size:12px; color:rgba(255,255,255,.45); line-height:1.55; animation:popIn .5s .4s both; opacity:0; }
  .sc-disclaimer-icon { font-size:16px; flex-shrink:0; margin-top:1px; }

  /* ── book appointment card ── */
  .sc-book-card { background:rgba(56,182,255,.06); border:1px solid rgba(56,182,255,.18); border-radius:14px; padding:14px 16px; margin-top:8px; display:flex; align-items:center; gap:12px; cursor:pointer; transition:all .2s; animation:popIn .4s both; }
  .sc-book-card:hover { background:rgba(56,182,255,.12); border-color:rgba(56,182,255,.35); transform:translateY(-2px); }
  .sc-book-card-icon { width:38px; height:38px; border-radius:10px; background:linear-gradient(135deg,#38b6ff,#6366f1); display:flex; align-items:center; justify-content:center; font-size:17px; flex-shrink:0; }
  .sc-book-card-text strong { display:block; font-size:13px; color:#fff; font-weight:600; }
  .sc-book-card-text span   { font-size:11.5px; color:rgba(255,255,255,.4); }
  .sc-book-arrow { margin-left:auto; font-size:16px; color:#38b6ff; }

  /* ── init loading ── */
  .sc-init { display:flex; align-items:center; gap:10px; padding:13px 16px; background:rgba(56,182,255,.05); border:1px solid rgba(56,182,255,.1); border-radius:14px; font-size:12.5px; color:rgba(255,255,255,.4); animation:fadeIn .3s both; }
  .sc-init-dot { width:8px; height:8px; border-radius:50%; background:#38b6ff; animation:pulse 1.2s ease-in-out infinite; flex-shrink:0; }

  /* ── input area ── */
  .sc-input-area { position:relative; z-index:10; background:rgba(5,13,26,.92); backdrop-filter:blur(20px); border-top:1px solid rgba(255,255,255,.06); padding:16px 28px 20px; flex-shrink:0; }
  .sc-input-row { display:flex; gap:10px; align-items:flex-end; }
  .sc-textarea { flex:1; background:rgba(255,255,255,.05); border:1.5px solid rgba(255,255,255,.08); border-radius:14px; padding:12px 16px; color:#fff; font-size:13.5px; font-family:'Sora',sans-serif; outline:none; resize:none; min-height:48px; max-height:120px; transition:border-color .2s, box-shadow .2s; line-height:1.5; }
  .sc-textarea::placeholder { color:rgba(255,255,255,.22); }
  .sc-textarea:focus { border-color:#38b6ff; box-shadow:0 0 0 3px rgba(56,182,255,.1); background:rgba(56,182,255,.04); }
  .sc-send { width:46px; height:46px; border-radius:13px; border:none; background:linear-gradient(135deg,#38b6ff,#6366f1); display:flex; align-items:center; justify-content:center; font-size:18px; cursor:pointer; flex-shrink:0; transition:transform .18s, box-shadow .18s; position:relative; overflow:hidden; }
  .sc-send::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,.12),transparent); }
  .sc-send:hover:not(:disabled) { transform:translateY(-2px) scale(1.05); box-shadow:0 10px 24px rgba(56,182,255,.4); }
  .sc-send:disabled { opacity:.4; cursor:not-allowed; transform:none; }
  .sc-input-hint { font-size:11px; color:rgba(255,255,255,.2); text-align:center; margin-top:8px; }
`;

// ─── Data ─────────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are CureAI, a warm, knowledgeable, and empathetic AI medical symptom checker built into a healthcare app.

Your role:
- Help users understand their symptoms through intelligent, conversational analysis
- Ask clarifying questions one step at a time (don't overwhelm with many questions at once)
- Suggest possible conditions (non-definitively), home remedies, and when to seek care
- Recognize medical emergencies immediately and urgently direct to emergency services

Formatting rules:
- Use **bold** for key medical terms and important info
- Use bullet points (•) for lists
- Use emojis sparingly for readability: 🔍 for analysis, ⚠️ for warnings, 💊 for medication, 🏥 for doctor advice
- Keep responses concise (under 200 words) unless listing conditions/recommendations
- Always end with a helpful follow-up question or action

Safety rules:
- NEVER definitively diagnose
- For potential emergencies (chest pain, stroke, severe breathing issues, overdose, suicidal ideation) — IMMEDIATELY tell them to call emergency services (1122 Pakistan, 911 USA, 999 UK)
- Always recommend consulting a real doctor for persistent or serious symptoms
- Remind users you're an AI assistant, not a replacement for medical care`;

const QUICK_PROMPTS = [
  "I have a headache and fever 🤒",
  "My stomach has been hurting",
  "I feel very tired and dizzy",
  "I have a sore throat and cough",
  "I'm having chest pain",
  "I can't sleep well lately",
];

interface Message {
  id: number;
  role: "ai" | "user";
  text: string;
  time: string;
  showBook?: boolean;
}

const INIT_MSG: Message = {
  id: 1,
  role: "ai",
  text: "👋 Hello! I'm **CureAI**, your AI medical assistant.\n\nI can help you understand your symptoms, possible causes, and when to see a doctor.\n\nDescribe what you're feeling and I'll guide you through it. Remember — I'm here to help, but I'm not a replacement for professional medical care. 🩺",
  time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function SymptomChecker() {
  const navigate    = useNavigate();
  const [messages,  setMessages]  = useState<Message[]>([INIT_MSG]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const msgEndRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // inject styles
  useEffect(() => {
    const id = "sc-styles";
    if (!document.getElementById(id)) {
      const s = document.createElement("style"); s.id = id; s.textContent = STYLES;
      document.head.appendChild(s);
    }
  }, []);


  // scroll to bottom
  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  // auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "48px";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const fmt = (t: string) =>
    t.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
     .replace(/•\s*/g, "• ")
     .replace(/\n/g, "<br/>");

  const sendMessage = async (text?: string) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "48px";

    const userMsg: Message = { id: Date.now(), role: "user", text: q, time: now() };
    setMessages(p => [...p, userMsg]);
    setLoading(true);

    try {
      // Build history for context
      const history = [
        { role: "user",      content: SYSTEM_PROMPT + "\n\nStart helping the patient now." },
        { role: "assistant", content: "Understood. I'm CureAI, your medical assistant. Please describe your symptoms and I'll help you." },
        ...messages.slice(-12).map(m => ({
          role:    m.role === "user" ? "user" : "assistant",
          content: m.text,
        })),
        { role: "user", content: q },
      ];

      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: history }),
    });

if (!response.ok) {
  throw new Error("Backend error");
}

const data = await response.json();

const reply =
  data?.reply ||
  data?.choices?.[0]?.message?.content ||
  "I had trouble processing that. Please try again.";
      // detect if AI suggests booking
      const shouldBook = /book.*appointment|see.*doctor|schedule.*visit|consult.*doctor/i.test(reply);

      setMessages(p => [...p, {
        id: Date.now() + 1,
        role: "ai",
        text: reply,
        time: now(),
        showBook: shouldBook,
      }]);
    } catch {
      setMessages(p => [...p, {
        id: Date.now() + 1,
        role: "ai",
        text: "⚠️ I'm having trouble connecting right now. Please check your internet and try again.",
        time: now(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => setMessages([INIT_MSG]);

  return (
    <div className="sc-root">
      <style>{STYLES}</style>
      <div className="sc-grid"/>
      <div className="sc-orb sc-orb1"/><div className="sc-orb sc-orb2"/>

      {/* ── Header ── */}
      <header className="sc-header">
        <div className="sc-header-left">
          <button className="sc-back" onClick={() => navigate("/patient/dashboard")}>←</button>
          <div className="sc-agent">
            <div className="sc-agent-av">🩺</div>
            <div>
              <div className="sc-agent-name">AI Symptom Checker</div>
              <div className="sc-agent-status">
                <span className="sc-agent-dot"/>
                {"Online — Ready to help" }
              </div>
            </div>
          </div>
        </div>
        <div className="sc-header-right">
          <span className="sc-model-badge">GPT-4o mini</span>
          <button className="sc-clear-btn" onClick={clearChat}>Clear chat</button>
        </div>
      </header>

      {/* ── Quick Prompts ── */}
      <div className="sc-quick-bar">
        <span className="sc-quick-lbl">Try:</span>
        {QUICK_PROMPTS.map(p => (
          <button key={p} className="sc-quick-pill" onClick={() => sendMessage(p)} disabled={loading}>
            {p}
          </button>
        ))}
      </div>

      {/* ── Messages ── */}
      <div className="sc-messages">

        {/* Disclaimer */}
        <div className="sc-disclaimer">
          <span className="sc-disclaimer-icon">⚠️</span>
          <span>This AI provides general health information only and is <strong style={{color:"#fbbf24"}}>not a substitute for professional medical advice</strong>. Always consult a qualified doctor for diagnosis and treatment.</span>
        </div>

        {/* Messages */}
        {messages.map(m => (
          <div key={m.id}>
            <div className={`sc-msg ${m.role}`}>
              <div className="sc-msg-av">{m.role === "ai" ? "🩺" : "👤"}</div>
              <div>
                <div className="sc-bubble" dangerouslySetInnerHTML={{ __html: fmt(m.text) }}/>
                <div className="sc-msg-time">{m.time}</div>

                {/* Book appointment prompt */}
                {m.showBook && (
                  <div className="sc-book-card" onClick={() => navigate("/patient/appointments")}>
                    <div className="sc-book-card-icon">📅</div>
                    <div className="sc-book-card-text">
                      <strong>Book an Appointment</strong>
                      <span>Find available doctors near you</span>
                    </div>
                    <span className="sc-book-arrow">→</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="sc-msg ai">
            <div className="sc-msg-av">🩺</div>
            <div className="sc-typing"><span/><span/><span/></div>
          </div>
        )}

        <div ref={msgEndRef}/>
      </div>

      {/* ── Input ── */}
      <div className="sc-input-area">
        <div className="sc-input-row">
          <textarea
            ref={textareaRef}
            value={input}
            className="sc-textarea"
            placeholder="Describe your symptoms… (Enter to send)"
            onChange={handleInput}
            onKeyDown={onKey}
            rows={1}
            disabled={loading}
          />
          <button
            className="sc-send"
            onClick={() => sendMessage()}
           disabled={loading}
          >
            ➤
          </button>
        </div>
        <div className="sc-input-hint">
          Press <strong style={{color:"rgba(255,255,255,.4)"}}>Enter</strong> to send · <strong style={{color:"rgba(255,255,255,.4)"}}>Shift+Enter</strong> for new line · Powered by Puter.js (free, no API key)
        </div>
      </div>
    </div>
  );
}