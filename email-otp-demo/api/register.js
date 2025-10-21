import { readFileSync, writeFileSync, existsSync } from "fs";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Method Not Allowed" });

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: "All fields are required" });

  const file = "./users.json";
  let users = existsSync(file) ? JSON.parse(readFileSync(file)) : [];
  if (users.find(u => u.email === email)) return res.json({ success: false, message: "Email already exists" });

  users.push({ email, password });
  writeFileSync(file, JSON.stringify(users, null, 2));
  return res.json({ success: true });
}
