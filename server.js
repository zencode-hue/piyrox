import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Server } from 'socket.io';
import http from 'http';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

// Initialize database
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        plan VARCHAR(50) DEFAULT 'free',
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255),
        api_key VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        path VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS files (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id),
        name VARCHAR(255) NOT NULL,
        path VARCHAR(500),
        content TEXT,
        language VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Database initialized');
  } catch (error) {
    console.error('❌ Database error:', error);
  }
}

initDatabase();

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const apiKey = require('crypto').randomBytes(32).toString('hex');

    const result = await pool.query(
      'INSERT INTO users (name, email, password, api_key) VALUES ($1, $2, $3, $4) RETURNING id, name, email, plan',
      [name, email, hashedPassword, apiKey]
    );

    const token = jwt.sign({ userId: result.rows[0].id }, process.env.JWT_SECRET || 'secret');

    res.json({
      success: true,
      message: 'Account created',
      user: result.rows[0],
      token,
      apiKey
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret');

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        apiKey: user.api_key
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Plan Management
app.get('/api/plans', async (req, res) => {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      features: ['Basic IDE', '5 Projects', '1GB Storage', 'Community Support']
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 29,
      features: ['Advanced IDE', 'Unlimited Projects', '100GB Storage', 'Priority Support', 'AI Assistant']
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99,
      features: ['Full IDE', 'Unlimited Everything', 'Team Collaboration', '24/7 Support', 'Custom AI']
    }
  ];
  res.json({ success: true, plans });
});

app.post('/api/plans/upgrade', async (req, res) => {
  try {
    const { userId, planId } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    await pool.query(
      'UPDATE users SET plan = $1 WHERE id = $2',
      [planId, decoded.userId]
    );

    res.json({ success: true, message: 'Plan upgraded' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Project Routes
app.get('/api/projects', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    const result = await pool.query(
      'SELECT * FROM projects WHERE user_id = $1',
      [decoded.userId]
    );

    res.json({ success: true, projects: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const { name, description } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    const result = await pool.query(
      'INSERT INTO projects (user_id, name, description) VALUES ($1, $2, $3) RETURNING *',
      [decoded.userId, name, description]
    );

    res.json({ success: true, project: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// File Routes
app.get('/api/files/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const result = await pool.query(
      'SELECT * FROM files WHERE project_id = $1',
      [projectId]
    );
    res.json({ success: true, files: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/files', async (req, res) => {
  try {
    const { projectId, name, content, language } = req.body;
    const result = await pool.query(
      'INSERT INTO files (project_id, name, content, language) VALUES ($1, $2, $3, $4) RETURNING *',
      [projectId, name, content, language]
    );
    res.json({ success: true, file: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/files/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;
    const { content } = req.body;
    const result = await pool.query(
      'UPDATE files SET content = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [content, fileId]
    );
    res.json({ success: true, file: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// WebSocket for real-time collaboration
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('file-change', (data) => {
    socket.broadcast.emit('file-change', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '2.1.0' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 PiyRox IDE Server running on port ${PORT}`);
});
