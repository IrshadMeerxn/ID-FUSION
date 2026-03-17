// Run once: node seed-admin.js
// Seeds the admin credential into Supabase
import "dotenv/config";
import bcrypt from "bcryptjs";
import supabase from "./supabase.js";

const hash = await bcrypt.hash("Irshad1327", 10);
const { error } = await supabase.from("credentials").upsert(
  { username: "Irshad", password_hash: hash, role: "admin" },
  { onConflict: "username" }
);
if (error) console.error("Seed failed:", error.message);
else console.log("Admin seeded successfully");
