// Central API client — talks to the Render backend

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "https://idfusion-backend.onrender.com";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type IDFusionRole = "admin" | "general" | "rto" | "passport" | "voter";

export interface Card {
  cardNumber: string;
  photoUrl: string | null;
}

export interface Person {
  personId: string;
  name: string;
  dateOfBirth: string;
  address: string;
  aadhaarCard: Card | null;
  panCard: Card | null;
  rationCard: Card | null;
  voterID: Card | null;
  drivingLicense: Card | null;
  rcCard: Card | null;
  passport: Card | null;
}

export interface Credential {
  id: string;
  username: string;
  role: IDFusionRole;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function login(username: string, password: string): Promise<{ role: IDFusionRole; username: string }> {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

// ── Credentials ───────────────────────────────────────────────────────────────

export async function listCredentials(): Promise<Credential[]> {
  return request("/api/credentials");
}

export async function createCredential(username: string, password: string, role: IDFusionRole): Promise<Credential> {
  return request("/api/credentials", {
    method: "POST",
    body: JSON.stringify({ username, password, role }),
  });
}

export async function updateCredential(id: string, username: string, password: string): Promise<Credential> {
  return request(`/api/credentials/${id}`, {
    method: "PUT",
    body: JSON.stringify({ username, password }),
  });
}

export async function deleteCredential(id: string): Promise<void> {
  return request(`/api/credentials/${id}`, { method: "DELETE" });
}

// ── Persons ───────────────────────────────────────────────────────────────────

export async function listPersons(search?: string): Promise<Person[]> {
  const qs = search ? `?q=${encodeURIComponent(search)}` : "";
  return request(`/api/persons${qs}`);
}

export async function getPerson(personId: string): Promise<Person> {
  return request(`/api/persons/${personId}`);
}

export async function createPerson(person: Person): Promise<Person> {
  return request("/api/persons", { method: "POST", body: JSON.stringify(person) });
}

export async function updatePerson(personId: string, person: Partial<Person>): Promise<Person> {
  return request(`/api/persons/${personId}`, { method: "PUT", body: JSON.stringify(person) });
}

export async function deletePerson(personId: string): Promise<void> {
  return request(`/api/persons/${personId}`, { method: "DELETE" });
}

// ── Image Upload ──────────────────────────────────────────────────────────────

export async function uploadImage(file: File): Promise<{ url: string; key: string }> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE_URL}/api/upload`, { method: "POST", body: form });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Upload failed");
  }
  return res.json();
}
