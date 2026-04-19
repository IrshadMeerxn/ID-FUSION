import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import supabase from "./supabase.js";

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow localhost for dev
    if (origin.includes("localhost")) return callback(null, true);
    // Allow all vercel.app deployments for this project
    if (origin.includes("vercel.app")) return callback(null, true);
    // Allow the configured frontend URL
    if (origin === process.env.FRONTEND_URL) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json());

// ── Auth ──────────────────────────────────────────────────────────────────────

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Username and password required" });

  const { data, error } = await supabase
    .from("credentials")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !data) return res.status(401).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, data.password_hash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  res.json({ role: data.role, username: data.username });
});

// ── Credentials (admin only) ──────────────────────────────────────────────────

app.get("/api/credentials", async (req, res) => {
  const { data, error } = await supabase
    .from("credentials")
    .select("id, username, role")
    .neq("role", "admin");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/credentials", async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) return res.status(400).json({ error: "username, password, role required" });
  const password_hash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
    .from("credentials")
    .insert({ id: uuidv4(), username, password_hash, role })
    .select("id, username, role")
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

app.put("/api/credentials/:id", async (req, res) => {
  const { username, password } = req.body;
  const updates = {};
  if (username) updates.username = username;
  if (password) updates.password_hash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
    .from("credentials")
    .update(updates)
    .eq("id", req.params.id)
    .neq("role", "admin")
    .select("id, username, role")
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete("/api/credentials/:id", async (req, res) => {
  const { error } = await supabase
    .from("credentials")
    .delete()
    .eq("id", req.params.id)
    .neq("role", "admin");
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
});

// ── Persons ───────────────────────────────────────────────────────────────────

app.get("/api/persons", async (req, res) => {
  const { q } = req.query;
  let query = supabase.from("persons").select("*, cards(*)");
  if (q) query = query.ilike("name", `%${q}%`);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(formatPerson));
});

app.get("/api/persons/:personId", async (req, res) => {
  const { data, error } = await supabase
    .from("persons")
    .select("*, cards(*)")
    .eq("person_id", req.params.personId)
    .single();
  if (error) return res.status(404).json({ error: "Person not found" });
  res.json(formatPerson(data));
});

app.post("/api/persons", async (req, res) => {
  const { personId, name, dateOfBirth, address, ...cards } = req.body;
  if (!personId || !name || !dateOfBirth || !address)
    return res.status(400).json({ error: "personId, name, dateOfBirth, address required" });

  const { data: existing } = await supabase
    .from("persons")
    .select("person_id")
    .eq("person_id", personId)
    .single();
  if (existing) return res.status(409).json({ error: "Person already exists" });

  const { data: person, error } = await supabase
    .from("persons")
    .insert({ person_id: personId, name, date_of_birth: dateOfBirth, address })
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });

  await upsertCards(personId, cards);
  const full = await getFullPerson(personId);
  res.status(201).json(full);
});

app.put("/api/persons/:personId", async (req, res) => {
  const { name, dateOfBirth, address, ...cards } = req.body;
  const { error } = await supabase
    .from("persons")
    .update({ name, date_of_birth: dateOfBirth, address })
    .eq("person_id", req.params.personId);
  if (error) return res.status(500).json({ error: error.message });

  await upsertCards(req.params.personId, cards);
  const full = await getFullPerson(req.params.personId);
  res.json(full);
});

app.delete("/api/persons/:personId", async (req, res) => {
  const { error } = await supabase
    .from("persons")
    .delete()
    .eq("person_id", req.params.personId);
  if (error) return res.status(500).json({ error: error.message });
  res.status(204).end();
});

// ── Image Upload ──────────────────────────────────────────────────────────────

app.post("/api/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file provided" });
  const key = `${uuidv4()}-${req.file.originalname}`;
  const { error } = await supabase.storage
    .from("card-photos")
    .upload(key, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
  if (error) return res.status(500).json({ error: error.message });
  const { data } = supabase.storage.from("card-photos").getPublicUrl(key);
  res.json({ url: data.publicUrl, key });
});

// ── Helpers ───────────────────────────────────────────────────────────────────

const CARD_TYPES = ["aadhaarCard", "panCard", "rationCard", "voterID", "drivingLicense", "rcCard", "passport"];

async function upsertCards(personId, cards) {
  for (const type of CARD_TYPES) {
    const card = cards[type];
    if (!card) continue;
    await supabase.from("cards").upsert(
      { person_id: personId, card_type: type, card_number: card.cardNumber, photo_front_url: card.photoFrontUrl ?? null, photo_back_url: card.photoBackUrl ?? null },
      { onConflict: "person_id,card_type" }
    );
  }
}

async function getFullPerson(personId) {
  const { data } = await supabase
    .from("persons")
    .select("*, cards(*)")
    .eq("person_id", personId)
    .single();
  return formatPerson(data);
}

function formatPerson(row) {
  if (!row) return null;
  const person = {
    personId: row.person_id,
    name: row.name,
    dateOfBirth: row.date_of_birth,
    address: row.address,
  };
  for (const type of CARD_TYPES) {
    const card = row.cards?.find((c) => c.card_type === type);
    person[type] = card ? { cardNumber: card.card_number, photoFrontUrl: card.photo_front_url, photoBackUrl: card.photo_back_url } : null;
  }
  return person;
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
