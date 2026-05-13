// src/app/data/database.ts

const USERS_KEY = "cureai_users";
const SESSION_KEY = "cureai_session";

export interface UserRecord {
  email: string;
  password: string;
  role: "patient" | "doctor";
  name: string;
  age?: string;
  verified?: boolean; // doctors need verification
}

export interface Session {
  email: string;
  role: "patient" | "doctor";
  name: string;
}

function loadUsers(): UserRecord[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveUsers(users: UserRecord[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export const DB = {
  API_URL: "http://localhost:3001",

  // ── HTTP helpers ────────────────────────────────────────────────
  async get(endpoint: string) {
    const response = await fetch(`${this.API_URL}${endpoint}`);
    return response.json();
  },

  async post(endpoint: string, data: unknown) {
    const response = await fetch(`${this.API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // ── User management ─────────────────────────────────────────────

  /** Register a new user. Returns false if email+role already exists. */
  addUser(user: UserRecord): boolean {
    const users = loadUsers();
    const exists = users.some(
      (u) => u.email === user.email && u.role === user.role
    );
    if (exists) return false;
    users.push(user);
    saveUsers(users);
    return true;
  },

  /** Find a user matching email + password + role. Returns the record or null. */
  findUser(
    email: string,
    password: string,
    role: "patient" | "doctor"
  ): UserRecord | null {
    const users = loadUsers();
    return (
      users.find(
        (u) =>
          u.email === email &&
          u.password === password &&
          u.role === role
      ) ?? null
    );
  },

  /** Look up a user for password-reset by email + name + age. */
  findUserForReset(
    email: string,
    name: string,
    age: string
  ): UserRecord | null {
    const users = loadUsers();
    return (
      users.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.name.toLowerCase() === name.toLowerCase() &&
          String(u.age) === String(age)
      ) ?? null
    );
  },

  /** Update the password for a given email (all roles). */
  updatePassword(email: string, newPassword: string) {
    const users = loadUsers();
    const updated = users.map((u) =>
      u.email.toLowerCase() === email.toLowerCase()
        ? { ...u, password: newPassword }
        : u
    );
    saveUsers(updated);
  },

  // ── Session management ──────────────────────────────────────────

  setSession(session: Session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },

  getSession(): Session | null {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch {
      return null;
    }
  },

  clearSession() {
    localStorage.removeItem(SESSION_KEY);
  },

  // ── Doctor verification (admin) ─────────────────────────────────

  getPendingDoctors(): UserRecord[] {
    return loadUsers().filter(
      (u) => u.role === "doctor" && u.verified === false
    );
  },

  verifyDoctor(email: string) {
    const users = loadUsers().map((u) =>
      u.email === email && u.role === "doctor"
        ? { ...u, verified: true }
        : u
    );
    saveUsers(users);
  },
};