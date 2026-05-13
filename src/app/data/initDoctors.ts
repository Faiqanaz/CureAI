// ─── initDoctors.ts ──────────────────────────────────────────────────────────
// Call initDoctorAccounts() once at app startup (e.g. in App.tsx useEffect or main.tsx)
// This seeds all 6 doctor accounts into localStorage so they can log in.

export const DOCTOR_ROSTER = [
  {
    name: "Jane Doe",
    email: "janedoe@gmail.com",
    specialty: "General Practitioner",
    experience: "15 years",
    rating: 4.9,
    reviews: 234,
    availability: "Available Tomorrow",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80",
  },
  {
    name: "Michael Chen",
    email: "michaelchen@gmail.com",
    specialty: "Cardiologist",
    experience: "12 years",
    rating: 4.8,
    reviews: 189,
    availability: "Available Today",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80",
  },
  {
    name: "Sarah Williams",
    email: "sarahwilliams@gmail.com",
    specialty: "Dentist",
    experience: "10 years",
    rating: 4.9,
    reviews: 312,
    availability: "Available Tomorrow",
    image: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&q=80",
  },
  {
    name: "Emily Park",
    email: "emilypark@gmail.com",
    specialty: "Pediatrician",
    experience: "8 years",
    rating: 5.0,
    reviews: 156,
    availability: "Available Today",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80",
  },
  {
    name: "Robert Martinez",
    email: "robertmartinez@gmail.com",
    specialty: "Dermatologist",
    experience: "14 years",
    rating: 4.7,
    reviews: 203,
    availability: "Available Tomorrow",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80",
  },
  {
    name: "Lisa Anderson",
    email: "lisaanderson@gmail.com",
    specialty: "Psychiatrist",
    experience: "11 years",
    rating: 4.9,
    reviews: 178,
    availability: "Available Tomorrow",
    image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&q=80",
  },
];

/** Seeds all 6 doctor accounts into cureai_users (skips any that already exist) */
export function initDoctorAccounts() {
  try {
    const existing: any[] = JSON.parse(localStorage.getItem("cureai_users") || "[]");
    let changed = false;

    DOCTOR_ROSTER.forEach(doc => {
      if (!existing.find((u: any) => u.email === doc.email)) {
        existing.push({
          name:     doc.name,
          email:    doc.email,
          password: "12345678",
          role:     "doctor",
          age:      35,
          gender:   "other",
          specialty: doc.specialty,
        });
        changed = true;
      }
    });

    if (changed) localStorage.setItem("cureai_users", JSON.stringify(existing));
  } catch (e) {
    console.warn("initDoctorAccounts failed:", e);
  }
}

/** Storage key for a doctor's appointments */
export function apptKey(doctorName: string) {
  // Strip "Dr. " prefix if present
  const clean = doctorName.replace(/^Dr\.\s*/i, "").trim();
  return `cureai_appts_${clean}`;
}

/** Get all appointments for a doctor by their name */
export function getDoctorAppointments(doctorName: string): any[] {
  try {
    return JSON.parse(localStorage.getItem(apptKey(doctorName)) || "[]");
  } catch { return []; }
}

/** Save appointments for a doctor */
export function saveDoctorAppointments(doctorName: string, appts: any[]) {
  localStorage.setItem(apptKey(doctorName), JSON.stringify(appts));
}

/** Add a single appointment to a doctor's list */
export function addDoctorAppointment(doctorName: string, appt: any) {
  const existing = getDoctorAppointments(doctorName);
  existing.unshift(appt); // newest first
  saveDoctorAppointments(doctorName, existing);
}