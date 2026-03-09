import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database('crowdcare.db');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password TEXT NOT NULL,
    trust_score INTEGER DEFAULT 85,
    notif_critical INTEGER DEFAULT 1,
    notif_community INTEGER DEFAULT 1,
    notif_weather INTEGER DEFAULT 0,
    notif_reports INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    category TEXT NOT NULL,
    description TEXT,
    severity TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    address TEXT,
    status TEXT DEFAULT 'active',
    is_anonymous INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    user_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incident_id) REFERENCES incidents (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  );
`);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  app.use(express.json());

  // Socket.io connection handling
  io.on('connection', (socket) => {
    socket.on('join_incident_chat', (incidentId) => {
      socket.join(`incident_${incidentId}`);
    });

    socket.on('send_message', (data) => {
      const { incident_id, user_id, user_name, content } = data;
      try {
        const stmt = db.prepare('INSERT INTO messages (incident_id, user_id, user_name, content) VALUES (?, ?, ?, ?)');
        const result = stmt.run(incident_id, user_id, user_name, content);
        const newMessage = {
          id: result.lastInsertRowid,
          incident_id,
          user_id,
          user_name,
          content,
          created_at: new Date().toISOString()
        };
        io.to(`incident_${incident_id}`).emit('new_message', newMessage);
      } catch (error) {
        console.error('Failed to save message:', error);
      }
    });
  });

  // API Routes
  app.get('/api/incidents/:id/messages', (req, res) => {
    const { id } = req.params;
    try {
      const messages = db.prepare('SELECT * FROM messages WHERE incident_id = ? ORDER BY created_at ASC').all(id);
      res.json(messages);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });
  app.post('/api/auth/register', (req, res) => {
    const { name, email, phone, password } = req.body;
    try {
      const stmt = db.prepare('INSERT INTO users (name, email, phone, password, trust_score) VALUES (?, ?, ?, ?, ?)');
      const result = stmt.run(name, email, phone, password, 85);
      res.json({ id: result.lastInsertRowid, name, email, trust_score: 85 });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(email, password) as any;
    if (user) {
      res.json({ 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        phone: user.phone,
        trust_score: user.trust_score,
        notif_critical: !!user.notif_critical,
        notif_community: !!user.notif_community,
        notif_weather: !!user.notif_weather,
        notif_reports: !!user.notif_reports
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });

  app.get('/api/incidents', (req, res) => {
    const incidents = db.prepare('SELECT * FROM incidents ORDER BY created_at DESC').all();
    res.json(incidents);
  });

  app.get('/api/users/:id/incidents', (req, res) => {
    const { id } = req.params;
    try {
      const incidents = db.prepare('SELECT * FROM incidents WHERE user_id = ? ORDER BY created_at DESC').all(id);
      res.json(incidents);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    try {
      const stmt = db.prepare('UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?');
      stmt.run(name, email, phone, id);
      const updatedUser = db.prepare('SELECT id, name, email, phone, trust_score, notif_critical, notif_community, notif_weather, notif_reports FROM users WHERE id = ?').get(id) as any;
      res.json({
        ...updatedUser,
        notif_critical: !!updatedUser.notif_critical,
        notif_community: !!updatedUser.notif_community,
        notif_weather: !!updatedUser.notif_weather,
        notif_reports: !!updatedUser.notif_reports
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch('/api/users/:id/password', (req, res) => {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    try {
      const user = db.prepare('SELECT * FROM users WHERE id = ? AND password = ?').get(id, currentPassword);
      if (!user) {
        return res.status(401).json({ error: 'Current password incorrect' });
      }
      db.prepare('UPDATE users SET password = ? WHERE id = ?').run(newPassword, id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch('/api/users/:id/notifications', (req, res) => {
    const { id } = req.params;
    const { notif_critical, notif_community, notif_weather, notif_reports } = req.body;
    try {
      const stmt = db.prepare(`
        UPDATE users SET 
          notif_critical = ?, 
          notif_community = ?, 
          notif_weather = ?, 
          notif_reports = ? 
        WHERE id = ?
      `);
      stmt.run(
        notif_critical ? 1 : 0, 
        notif_community ? 1 : 0, 
        notif_weather ? 1 : 0, 
        notif_reports ? 1 : 0, 
        id
      );
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/incidents', (req, res) => {
    const { user_id, category, description, severity, latitude, longitude, address, is_anonymous } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO incidents (user_id, category, description, severity, latitude, longitude, address, is_anonymous)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const result = stmt.run(user_id || null, category, description, severity, latitude, longitude, address, is_anonymous ? 1 : 0);
      const newIncident = {
        id: result.lastInsertRowid,
        user_id,
        category,
        description,
        severity,
        latitude,
        longitude,
        address,
        is_anonymous,
        created_at: new Date().toISOString(),
        status: 'active'
      };
      
      // Broadcast to all clients
      io.emit('new_incident', newIncident);
      
      res.json(newIncident);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = 3000;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
