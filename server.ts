import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("database.db");
const JWT_SECRET = process.env.JWT_SECRET || "prime-property-secret-key";

// Initialize Database Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('buyer', 'seller', 'admin')) DEFAULT 'buyer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    location TEXT NOT NULL,
    type TEXT CHECK(type IN ('house', 'land', 'apartment', 'office', 'commercial')) NOT NULL,
    status TEXT CHECK(status IN ('for sale', 'for rent', 'sold')) DEFAULT 'for sale',
    images TEXT, -- JSON array of URLs
    seller_id INTEGER,
    is_approved INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(seller_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS favorites (
    user_id INTEGER,
    property_id INTEGER,
    PRIMARY KEY(user_id, property_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(property_id) REFERENCES properties(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER,
    receiver_id INTEGER,
    property_id INTEGER,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(sender_id) REFERENCES users(id),
    FOREIGN KEY(receiver_id) REFERENCES users(id),
    FOREIGN KEY(property_id) REFERENCES properties(id)
  );
`);

// Seed Admin if not exists
const adminEmail = "admin@primeproperty.com";
const existingAdmin = db.prepare("SELECT * FROM users WHERE email = ?").get(adminEmail);
if (!existingAdmin) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run(
    "System Admin",
    adminEmail,
    hashedPassword,
    "admin"
  );
}

const app = express();
app.use(express.json());

// Auth Middleware
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// --- Auth Routes ---
app.post("/api/auth/register", (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run(
      name, email, hashedPassword, role || 'buyer'
    );
    const user = { id: result.lastInsertRowid, name, email, role: role || 'buyer' };
    const token = jwt.sign(user, JWT_SECRET);
    res.json({ user, token });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET);
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
});

// --- Property Routes ---
app.get("/api/properties", (req, res) => {
  const { location, type, minPrice, maxPrice, sort } = req.query;
  let query = "SELECT * FROM properties WHERE is_approved = 1";
  const params: any[] = [];

  if (location) {
    query += " AND location LIKE ?";
    params.push(`%${location}%`);
  }
  if (type) {
    query += " AND type = ?";
    params.push(type);
  }
  if (minPrice) {
    query += " AND price >= ?";
    params.push(minPrice);
  }
  if (maxPrice) {
    query += " AND price <= ?";
    params.push(maxPrice);
  }

  if (sort === "newest") query += " ORDER BY created_at DESC";
  else if (sort === "price_asc") query += " ORDER BY price ASC";
  else if (sort === "price_desc") query += " ORDER BY price DESC";

  const properties = db.prepare(query).all(...params);
  res.json(properties);
});

app.get("/api/properties/:id", (req, res) => {
  const property = db.prepare("SELECT p.*, u.name as seller_name, u.email as seller_email FROM properties p JOIN users u ON p.seller_id = u.id WHERE p.id = ?").get(req.params.id);
  if (!property) return res.status(404).json({ error: "Property not found" });
  res.json(property);
});

app.post("/api/properties", authenticate, (req: any, res) => {
  const { title, description, price, location, type, images } = req.body;
  const result = db.prepare(`
    INSERT INTO properties (title, description, price, location, type, images, seller_id, is_approved)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(title, description, price, location, type, JSON.stringify(images || []), req.user.id, req.user.role === 'admin' ? 1 : 0);
  res.json({ id: result.lastInsertRowid });
});

app.put("/api/properties/:id", authenticate, (req: any, res) => {
  const { title, description, price, location, type, status, images } = req.body;
  const property: any = db.prepare("SELECT * FROM properties WHERE id = ?").get(req.params.id);
  if (!property || (property.seller_id !== req.user.id && req.user.role !== 'admin')) {
    return res.status(403).json({ error: "Forbidden" });
  }
  db.prepare(`
    UPDATE properties SET title = ?, description = ?, price = ?, location = ?, type = ?, status = ?, images = ?
    WHERE id = ?
  `).run(title, description, price, location, type, status, JSON.stringify(images), req.params.id);
  res.json({ success: true });
});

app.delete("/api/properties/:id", authenticate, (req: any, res) => {
  const property: any = db.prepare("SELECT * FROM properties WHERE id = ?").get(req.params.id);
  if (!property || (property.seller_id !== req.user.id && req.user.role !== 'admin')) {
    return res.status(403).json({ error: "Forbidden" });
  }
  db.prepare("DELETE FROM properties WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// --- Admin Routes ---
app.get("/api/admin/pending", authenticate, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
  const properties = db.prepare("SELECT * FROM properties WHERE is_approved = 0").all();
  res.json(properties);
});

app.post("/api/admin/approve/:id", authenticate, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
  db.prepare("UPDATE properties SET is_approved = 1 WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// --- Favorites ---
app.get("/api/favorites", authenticate, (req: any, res) => {
  const favorites = db.prepare(`
    SELECT p.* FROM properties p
    JOIN favorites f ON p.id = f.property_id
    WHERE f.user_id = ?
  `).all(req.user.id);
  res.json(favorites);
});

app.post("/api/favorites/:id", authenticate, (req: any, res) => {
  try {
    db.prepare("INSERT INTO favorites (user_id, property_id) VALUES (?, ?)").run(req.user.id, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Already favorited" });
  }
});

app.delete("/api/favorites/:id", authenticate, (req: any, res) => {
  db.prepare("DELETE FROM favorites WHERE user_id = ? AND property_id = ?").run(req.user.id, req.params.id);
  res.json({ success: true });
});

// --- Messages ---
app.post("/api/messages", authenticate, (req: any, res) => {
  const { receiver_id, property_id, content } = req.body;
  db.prepare("INSERT INTO messages (sender_id, receiver_id, property_id, content) VALUES (?, ?, ?, ?)").run(
    req.user.id, receiver_id, property_id, content
  );
  res.json({ success: true });
});

app.get("/api/messages", authenticate, (req: any, res) => {
  const messages = db.prepare(`
    SELECT m.*, u.name as sender_name, p.title as property_title
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    JOIN properties p ON m.property_id = p.id
    WHERE m.receiver_id = ? OR m.sender_id = ?
    ORDER BY m.created_at DESC
  `).all(req.user.id, req.user.id);
  res.json(messages);
});

// --- Vite Integration ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
