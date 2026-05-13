import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import * as XLSX from "xlsx"; // XLSX often works best with the namespace import
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    const completion = await client.chat.completions.create({
      model: "deepseek-chat", // or deepseek-reasoner (depends on your plan)
      messages,
    });

    res.json({
      reply: completion.choices[0].message.content,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running...");
});

// Fix for ES Modules: Define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────────────────────────────────────
// DATA FOLDER — created automatically next to server.js
// ─────────────────────────────────────────────────────────────────────────────

const DATA_DIR = path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

// File paths
const FILES = {
  users:          path.join(DATA_DIR, "users.json"),
  appointments:   path.join(DATA_DIR, "appointments.json"),
  patients:       path.join(DATA_DIR, "patients.json"),
  prescriptions:  path.join(DATA_DIR, "prescriptions.json"),
  pendingDoctors: path.join(DATA_DIR, "pending_doctors.json"),
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function readFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return [];
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
}

function writeFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

function normDoctor(name) {
  return name.replace(/^Dr\.\s*/i, "").trim().toLowerCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// SEED BUILT-IN DOCTORS (runs once at startup)
// ─────────────────────────────────────────────────────────────────────────────

function seedDoctors() {
  const BUILT_IN = [
    { name:"Jane Doe",        email:"janedoe@gmail.com",        password:"12345678", role:"doctor", age:35, gender:"other",  verified:true, specialty:"General Practitioner" },
    { name:"Michael Chen",    email:"michaelchen@gmail.com",    password:"12345678", role:"doctor", age:40, gender:"male",   verified:true, specialty:"Cardiologist"          },
    { name:"Sarah Williams",  email:"sarahwilliams@gmail.com",  password:"12345678", role:"doctor", age:38, gender:"female", verified:true, specialty:"Dentist"              },
    { name:"Emily Park",      email:"emilypark@gmail.com",      password:"12345678", role:"doctor", age:33, gender:"female", verified:true, specialty:"Pediatrician"         },
    { name:"Robert Martinez", email:"robertmartinez@gmail.com", password:"12345678", role:"doctor", age:45, gender:"male",   verified:true, specialty:"Dermatologist"        },
    { name:"Lisa Anderson",   email:"lisaanderson@gmail.com",   password:"12345678", role:"doctor", age:42, gender:"female", verified:true, specialty:"Psychiatrist"          },
  ];
  const users   = readFile(FILES.users);
  let   changed = false;
  BUILT_IN.forEach(d => {
    if (!users.find(u => u.email === d.email)) {
      users.push({ ...d, createdAt: new Date().toISOString() });
      changed = true;
    }
  });
  if (changed) {
    writeFile(FILES.users, users);
    console.log("✅ Built-in doctor accounts seeded.");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ── USERS ────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

// Add this under your other app.get routes
app.get("/api/", (req, res) => {
  res.json({ message: "Welcome to the CureAI API!" });
});

// GET all users
app.get("/api/users", (req, res) => {
  res.json(readFile(FILES.users));
});

// POST register new user
app.post("/api/users/register", (req, res) => {
  const users = readFile(FILES.users);
  const { email } = req.body;
  if (users.find(u => u.email === email)) {
    return res.status(409).json({ ok: false, error: "Email already registered." });
  }
  const user = { ...req.body, createdAt: new Date().toISOString() };
  users.push(user);
  writeFile(FILES.users, users);
  console.log(`👤 New user registered: ${user.name} (${user.role})`);
  res.json({ ok: true });
});

// POST login
app.post("/api/users/login", (req, res) => {
  const { email, password, role } = req.body;
  const users = readFile(FILES.users);
  const match = users.find(u => u.email === email && u.password === password && u.role === role);
  if (!match)                    return res.status(401).json({ ok: false, error: "Invalid credentials." });
  if (match.verified === false)  return res.status(403).json({ ok: false, error: "Account pending verification." });
  res.json({ ok: true, name: match.name, role: match.role, email: match.email });
});

// POST reset password (verify by name + age + email)
app.post("/api/users/find-for-reset", (req, res) => {
  const { email, name, age } = req.body;
  const users = readFile(FILES.users);
  const match = users.find(u =>
    u.email.toLowerCase().trim() === email.toLowerCase().trim() &&
    u.name.toLowerCase().trim()  === name.toLowerCase().trim()  &&
    String(u.age).trim()         === String(age).trim()
  );
  if (!match) return res.status(404).json({ ok: false, error: "No matching account found." });
  res.json({ ok: true, name: match.name });
});

// PATCH update password
app.patch("/api/users/password", (req, res) => {
  const { email, newPassword } = req.body;
  const users   = readFile(FILES.users);
  const updated = users.map(u => u.email === email ? { ...u, password: newPassword } : u);
  writeFile(FILES.users, updated);
  res.json({ ok: true });
});

// PATCH verify / reject doctor
app.patch("/api/users/verify", (req, res) => {
  const { email, verified } = req.body;
  const users   = readFile(FILES.users);
  const updated = users.map(u => u.email === email ? { ...u, verified } : u);
  writeFile(FILES.users, updated);
  console.log(`🩺 Doctor ${email} verified=${verified}`);
  res.json({ ok: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// ── APPOINTMENTS ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

// GET all  OR  GET ?doctor=name  OR  GET ?patientEmail=email
app.get("/api/appointments", (req, res) => {
  let all = readFile(FILES.appointments);
  if (req.query.doctor) {
    const n = normDoctor(req.query.doctor);
    all = all.filter(a => normDoctor(a.doctor) === n);
  }
  if (req.query.patientEmail) {
    all = all.filter(a => a.patientEmail === req.query.patientEmail);
  }
  res.json(all);
});

// POST add appointment
app.post("/api/appointments", (req, res) => {
  const all  = readFile(FILES.appointments);
  const appt = { ...req.body, id: Date.now() };
  all.unshift(appt);
  writeFile(FILES.appointments, all);
  console.log(`📅 New appointment: ${appt.patient} → Dr. ${appt.doctor}`);
  res.json({ ok: true, appt });
});

// PATCH update status
app.patch("/api/appointments/:id/status", (req, res) => {
  const id       = Number(req.params.id);
  const { status } = req.body;
  const updated = readFile(FILES.appointments).map(a => a.id === id ? { ...a, status } : a);
  writeFile(FILES.appointments, updated);
  res.json({ ok: true });
});

// PATCH reschedule
app.patch("/api/appointments/:id/reschedule", (req, res) => {
  const id           = Number(req.params.id);
  const { date, time } = req.body;
  const updated = readFile(FILES.appointments).map(a =>
    a.id === id ? { ...a, date, time, status: "accepted" } : a
  );
  writeFile(FILES.appointments, updated);
  res.json({ ok: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// ── PATIENTS ─────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

// GET all  OR  GET ?doctor=name
app.get("/api/patients", (req, res) => {
  let all = readFile(FILES.patients);
  if (req.query.doctor) {
    const n = normDoctor(req.query.doctor);
    all = all.filter(p => normDoctor(p.doctor) === n);
  }
  res.json(all);
});

// POST upsert patient (insert or update by email+doctor)
app.post("/api/patients/upsert", (req, res) => {
  const patient = req.body;
  const all     = readFile(FILES.patients);
  const index   = all.findIndex(
    p => p.email === patient.email && normDoctor(p.doctor) === normDoctor(patient.doctor)
  );
  if (index >= 0) {
    all[index] = { ...all[index], ...patient };
  } else {
    all.unshift(patient);
    console.log(`👥 New patient added: ${patient.name} under Dr. ${patient.doctor}`);
  }
  writeFile(FILES.patients, all);
  res.json({ ok: true });
});

// PATCH update patient status
app.patch("/api/patients/status", (req, res) => {
  const { email, doctor, status } = req.body;
  const n       = normDoctor(doctor);
  const updated = readFile(FILES.patients).map(p =>
    p.email === email && normDoctor(p.doctor) === n ? { ...p, status } : p
  );
  writeFile(FILES.patients, updated);
  res.json({ ok: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// ── PRESCRIPTIONS ────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

// GET all  OR  GET ?doctor=name
app.get("/api/prescriptions", (req, res) => {
  let all = readFile(FILES.prescriptions);
  if (req.query.doctor) {
    const n = normDoctor(req.query.doctor);
    all = all.filter(p => normDoctor(p.doctor) === n);
  }
  res.json(all);
});

// POST add prescription
app.post("/api/prescriptions", (req, res) => {
  const all = readFile(FILES.prescriptions);
  const rx  = { ...req.body, id: Date.now() };
  all.unshift(rx);
  writeFile(FILES.prescriptions, all);
  console.log(`💊 New prescription: ${rx.medication} for ${rx.patient}`);
  res.json({ ok: true, rx });
});

// PATCH update prescription status
app.patch("/api/prescriptions/:id/status", (req, res) => {
  const id       = Number(req.params.id);
  const { status } = req.body;
  const updated = readFile(FILES.prescriptions).map(p => p.id === id ? { ...p, status } : p);
  writeFile(FILES.prescriptions, updated);
  res.json({ ok: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// ── PENDING DOCTORS ──────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

// GET all pending doctors
app.get("/api/pending-doctors", (req, res) => {
  res.json(readFile(FILES.pendingDoctors));
});

// POST add to pending list
app.post("/api/pending-doctors", (req, res) => {
  const all = readFile(FILES.pendingDoctors);
  all.push(req.body);
  writeFile(FILES.pendingDoctors, all);
  console.log(`⏳ New doctor application: ${req.body.name}`);
  res.json({ ok: true });
});

// PATCH update status (approve / reject)
app.patch("/api/pending-doctors/status", (req, res) => {
  const { email, status } = req.body;
  const updated = readFile(FILES.pendingDoctors).map(d =>
    d.email === email ? { ...d, status } : d
  );
  writeFile(FILES.pendingDoctors, updated);
  res.json({ ok: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// ── EXCEL EXPORT ─────────────────────────────────────────────────────────────
// GET /export/excel  → downloads CureAI_Export_<date>.xlsx
// ─────────────────────────────────────────────────────────────────────────────

app.get("/export/excel", (req, res) => {
  const wb = XLSX.utils.book_new();

  function addSheet(name, rows) {
    if (!rows || rows.length === 0) {
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["No data yet"]]), name);
      return;
    }
    const ws = XLSX.utils.json_to_sheet(rows);
    const keys = Object.keys(rows[0]);
    ws["!cols"] = keys.map(k => ({
      wch: Math.max(k.length, ...rows.map(r => String(r[k] ?? "").length)) + 2,
    }));
    XLSX.utils.book_append_sheet(wb, ws, name);
  }

  const users         = readFile(FILES.users);
  const appointments  = readFile(FILES.appointments);
  const patients      = readFile(FILES.patients);
  const prescriptions = readFile(FILES.prescriptions);
  const pending       = readFile(FILES.pendingDoctors);
  const exportedAt    = new Date().toLocaleString();

  // 1. Summary
  addSheet("Summary", [
    { Table: "Users",           Records: users.length },
    { Table: "Appointments",    Records: appointments.length },
    { Table: "Patients",        Records: patients.length },
    { Table: "Prescriptions",   Records: prescriptions.length },
    { Table: "PendingDoctors",  Records: pending.length },
    { Table: "Exported At",     Records: exportedAt },
  ]);

  // 2. Users (no passwords exported)
  addSheet("Users", users.map(u => ({
    Name:      u.name,
    Email:     u.email,
    Role:      u.role,
    Age:       u.age,
    Gender:    u.gender,
    Verified:  u.verified ? "Yes" : "No",
    Specialty: u.specialty || "—",
    CreatedAt: u.createdAt || "—",
  })));

  // 3. Appointments
  addSheet("Appointments", appointments.map(a => ({
    ID:           a.id,
    Patient:      a.patient,
    PatientEmail: a.patientEmail,
    Doctor:       a.doctor,
    Date:         a.date,
    Time:         a.time,
    Type:         a.type,
    Status:       a.status,
    Notes:        a.notes,
    BookedAt:     a.bookedAt,
  })));

  // 4. Patients
  addSheet("Patients", patients.map(p => ({
    Name:      p.name,
    Email:     p.email,
    Age:       p.age,
    Gender:    p.gender,
    Doctor:    p.doctor,
    Condition: p.condition,
    Status:    p.status,
    LastVisit: p.lastVisit,
    Notes:     p.notes,
  })));

  // 5. Prescriptions
  addSheet("Prescriptions", prescriptions.map(r => ({
    ID:         r.id,
    Patient:    r.patient,
    Doctor:     r.doctor,
    Medication: r.medication,
    Dosage:     r.dosage,
    Frequency:  r.frequency,
    Duration:   r.duration,
    Reason:     r.reason,
    Status:     r.status,
    Date:       r.date,
    Notes:      r.notes,
  })));

  // 6. Pending Doctors
  addSheet("PendingDoctors", pending.map(d => ({
    Name:          d.name,
    Email:         d.email,
    Age:           d.age,
    Gender:        d.gender,
    Status:        d.status,
    RegisteredAt:  d.registeredAt,
  })));

  const filename = `CureAI_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
  const buffer   = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.send(buffer);
  console.log(`📊 Excel exported: ${filename}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// START
// ─────────────────────────────────────────────────────────────────────────────

seedDoctors();

app.listen(PORT, () => {
  console.log("\n🩺 CureAI Server running!");
  console.log(`   API:    http://localhost:${PORT}/api/`);
  console.log(`   Excel:  http://localhost:${PORT}/export/excel`);
  console.log(`   Data:   ${DATA_DIR}`);
  console.log("\n📁 Files auto-created in /data folder:");
  console.log("   users.json | appointments.json | patients.json");
  console.log("   prescriptions.json | pending_doctors.json\n");
});