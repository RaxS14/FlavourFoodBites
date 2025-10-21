import { readFileSync, existsSync } from "fs";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Method Not Allowed" });

  const { email, password } = req.body;
  const file = "./users.json";
  if (!existsSync(file)) return res.json({ success: false, message: "No users registered" });

  const users = JSON.parse(readFileSync(file));
  const user = users.find(u => u.email === email && u.password === password);
  if (user) return res.json({ success: true });
  return res.json({ success: false, message: "Invalid email or password" });
}
