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
    status TEXT CHECK(status IN ('active', 'blocked')) DEFAULT 'active',
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
    is_featured INTEGER DEFAULT 0,
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

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    property_id INTEGER,
    amount REAL NOT NULL,
    type TEXT CHECK(type IN ('promotion', 'subscription')) NOT NULL,
    status TEXT CHECK(status IN ('pending', 'completed', 'failed')) DEFAULT 'completed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(property_id) REFERENCES properties(id)
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    property_id INTEGER,
    user_id INTEGER,
    reason TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(property_id) REFERENCES properties(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Migration: Add status column to users if it doesn't exist
try {
  db.prepare("ALTER TABLE users ADD COLUMN status TEXT CHECK(status IN ('active', 'blocked')) DEFAULT 'active'").run();
} catch (err) {}

try {
  db.prepare("ALTER TABLE properties ADD COLUMN is_approved INTEGER DEFAULT 0").run();
} catch (err) {}

try {
  db.prepare("ALTER TABLE properties ADD COLUMN is_featured INTEGER DEFAULT 0").run();
} catch (err) {}

// Seed Admin if not exists
const adminEmail = "admin@primeproperty.com";
const existingAdmin = db.prepare("SELECT * FROM users WHERE email = ?").get(adminEmail);
if (!existingAdmin) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)").run(
    "System Admin",
    adminEmail,
    hashedPassword,
    "admin",
    "active"
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
    
    // Check if user is blocked
    const user: any = db.prepare("SELECT status FROM users WHERE id = ?").get((decoded as any).id);
    if (user?.status === 'blocked') {
      return res.status(403).json({ error: "Your account has been blocked" });
    }
    
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// --- Auth Routes ---
app.get("/api/auth/profile", authenticate, (req: any, res) => {
  const user = db.prepare("SELECT id, name, email, role, status FROM users WHERE id = ?").get(req.user.id);
  res.json(user);
});

app.put("/api/auth/profile", authenticate, (req: any, res) => {
  const { name, email } = req.body;
  try {
    db.prepare("UPDATE users SET name = ?, email = ? WHERE id = ?").run(name, email, req.user.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: "Email already in use" });
  }
});

app.put("/api/auth/password", authenticate, (req: any, res) => {
  const { currentPassword, newPassword } = req.body;
  const user: any = db.prepare("SELECT password FROM users WHERE id = ?").get(req.user.id);
  
  if (!bcrypt.compareSync(currentPassword, user.password)) {
    return res.status(400).json({ error: "Incorrect current password" });
  }

  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashedPassword, req.user.id);
  res.json({ success: true });
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = db.prepare("INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)").run(
      name, email, hashedPassword, role || 'buyer', 'active'
    );
    const user = { id: result.lastInsertRowid, name, email, role: role || 'buyer', status: 'active' };
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
  if (user.status === 'blocked') {
    return res.status(403).json({ error: "Your account has been blocked" });
  }
  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, JWT_SECRET);
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
});

// --- Property Routes ---
app.get("/api/properties", (req, res) => {
  const { location, type, minPrice, maxPrice, sort, featured } = req.query;
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
  if (featured === 'true') {
    query += " AND is_featured = 1";
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
    INSERT INTO properties (title, description, price, location, type, images, seller_id, is_approved, is_featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(title, description, price, location, type, JSON.stringify(images || []), req.user.id, req.user.role === 'admin' ? 1 : 0, 0);
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

app.post("/api/properties/:id/promote", authenticate, (req: any, res) => {
  const property: any = db.prepare("SELECT * FROM properties WHERE id = ?").get(req.params.id);
  if (!property || (property.seller_id !== req.user.id && req.user.role !== 'admin')) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // Record payment
  db.prepare("INSERT INTO payments (user_id, property_id, amount, type, status) VALUES (?, ?, ?, ?, ?)").run(
    req.user.id, req.params.id, 49.99, 'promotion', 'completed'
  );

  // Feature the property
  db.prepare("UPDATE properties SET is_featured = 1 WHERE id = ?").run(req.params.id);
  
  res.json({ success: true });
});

// --- Admin Routes ---
app.get("/api/admin/stats", authenticate, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
  const totalProperties = db.prepare("SELECT COUNT(*) as count FROM properties").get();
  const pendingProperties = db.prepare("SELECT COUNT(*) as count FROM properties WHERE is_approved = 0").get();
  const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get();
  const totalSales = db.prepare("SELECT SUM(amount) as sum FROM payments WHERE status = 'completed'").get();
  const reportedCount = db.prepare("SELECT COUNT(*) as count FROM reports").get();
  
  res.json({
    totalProperties: (totalProperties as any).count,
    pendingApproval: (pendingProperties as any).count,
    totalUsers: (totalUsers as any).count,
    totalSales: (totalSales as any).sum || 0,
    reportedCount: (reportedCount as any).count
  });
});

app.get("/api/admin/users", authenticate, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
  const users = db.prepare(`
    SELECT u.id, u.name, u.email, u.role, u.status, u.created_at,
    (SELECT COUNT(*) FROM properties WHERE seller_id = u.id) as property_count
    FROM users u
  `).all();
  res.json(users);
});

app.put("/api/admin/users/:id", authenticate, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
  const { role, status } = req.body;
  db.prepare("UPDATE users SET role = ?, status = ? WHERE id = ?").run(role, status, req.params.id);
  res.json({ success: true });
});

app.delete("/api/admin/users/:id", authenticate, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
  db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

app.get("/api/admin/properties", authenticate, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
  const properties = db.prepare("SELECT p.*, u.name as seller_name FROM properties p JOIN users u ON p.seller_id = u.id").all();
  res.json(properties);
});

app.post("/api/admin/approve/:id", authenticate, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
  db.prepare("UPDATE properties SET is_approved = 1 WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

app.put("/api/admin/properties/:id/feature", authenticate, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
  const { is_featured } = req.body;
  db.prepare("UPDATE properties SET is_featured = ? WHERE id = ?").run(is_featured ? 1 : 0, req.params.id);
  res.json({ success: true });
});

app.get("/api/admin/payments", authenticate, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
  const payments = db.prepare(`
    SELECT pay.*, u.name as user_name, p.title as property_title 
    FROM payments pay 
    JOIN users u ON pay.user_id = u.id 
    LEFT JOIN properties p ON pay.property_id = p.id
    ORDER BY pay.created_at DESC
  `).all();
  res.json(payments);
});

app.get("/api/admin/reports", authenticate, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
  const reports = db.prepare(`
    SELECT r.*, u.name as user_name, p.title as property_title 
    FROM reports r 
    JOIN users u ON r.user_id = u.id 
    JOIN properties p ON r.property_id = p.id
    ORDER BY r.created_at DESC
  `).all();
  res.json(reports);
});

app.post("/api/admin/announcements", authenticate, (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: "Forbidden" });
  const { title, content } = req.body;
  db.prepare("INSERT INTO announcements (title, content) VALUES (?, ?)").run(title, content);
  res.json({ success: true });
});

app.get("/api/announcements", (req, res) => {
  const announcements = db.prepare("SELECT * FROM announcements ORDER BY created_at DESC").all();
  res.json(announcements);
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

app.post("/api/messages/:id/reply", authenticate, (req: any, res) => {
  const { content } = req.body;
  const originalMessage: any = db.prepare("SELECT * FROM messages WHERE id = ?").get(req.params.id);
  
  if (!originalMessage) return res.status(404).json({ error: "Message not found" });
  
  // The receiver of the reply is the sender of the original message
  // unless the current user is the sender, then it's the receiver
  const receiver_id = originalMessage.sender_id === req.user.id ? originalMessage.receiver_id : originalMessage.sender_id;

  db.prepare("INSERT INTO messages (sender_id, receiver_id, property_id, content) VALUES (?, ?, ?, ?)").run(
    req.user.id, receiver_id, originalMessage.property_id, content
  );
  res.json({ success: true });
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
