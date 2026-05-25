import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function initDb() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        plan VARCHAR(50) DEFAULT 'free',
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        message_count INTEGER DEFAULT 0,
        last_message_date DATE
      );
    `);

    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS message_count INTEGER DEFAULT 0;`);
    await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_message_date DATE;`);

    await query(`
      CREATE TABLE IF NOT EXISTS chats (
        id VARCHAR(255) PRIMARY KEY,
        user_id INTEGER,
        title VARCHAR(255) NOT NULL,
        messages JSONB DEFAULT '[]',
        created_at BIGINT
      );
    `);
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}
