import pg from 'pg';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, 'data.json');

let pool;
let useNeon = false;

function loadLocal() {
  if (!existsSync(DATA_FILE)) return {};
  try {
    return JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

function saveLocal(data) {
  mkdirSync(dirname(DATA_FILE), { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export async function initDB() {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    try {
      pool = new pg.Pool({ connectionString: dbUrl });
      await pool.query(`
        CREATE TABLE IF NOT EXISTS resumes (
          id TEXT PRIMARY KEY,
          title TEXT,
          personal_details JSONB,
          summary TEXT,
          experience JSONB,
          education JSONB,
          skills JSONB,
          template TEXT,
          score INTEGER DEFAULT 0,
          score_feedback JSONB,
          user_id TEXT NOT NULL,
          created_date TIMESTAMP DEFAULT NOW(),
          updated_date TIMESTAMP DEFAULT NOW()
        )
      `);
      useNeon = true;
      console.log('Using PostgreSQL database');
      return;
    } catch (err) {
      console.log('Database not available (' + err.message + '), falling back to local JSON storage.');
    }
  } else {
    console.log('No DATABASE_URL set, using local JSON storage.');
  }
}

export function isTableReady() { return useNeon; }

export async function listResumes(userId) {
  if (useNeon) {
    const { rows } = await pool.query('SELECT * FROM resumes WHERE user_id = $1 ORDER BY updated_date DESC NULLS LAST', [userId]);
    return rows;
  }
  const data = loadLocal();
  const userResumes = Object.values(data).filter(r => r.user_id === userId);
  return userResumes.sort((a, b) => new Date(b.updated_date || 0) - new Date(a.updated_date || 0));
}

export async function getResume(id, userId) {
  if (useNeon) {
    const { rows } = await pool.query('SELECT * FROM resumes WHERE id = $1 AND user_id = $2', [id, userId]);
    return rows[0] || null;
  }
  const data = loadLocal();
  const r = data[id];
  return r && r.user_id === userId ? r : null;
}

export async function createResume(userId, data) {
  const id = `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  const resume = {
    id, user_id: userId,
    title: data.title || 'Untitled Resume',
    template: data.template || 'modern-blue',
    personal_details: data.personal_details || {},
    summary: data.summary || '',
    experience: data.experience || [],
    education: data.education || [],
    skills: data.skills || [],
    score: data.score || 0,
    score_feedback: data.score_feedback || {},
    created_date: now,
    updated_date: now,
  };

  if (useNeon) {
    const { rows } = await pool.query(
      `INSERT INTO resumes (id, user_id, title, template, personal_details, summary, experience, education, skills, created_date, updated_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [id, userId, resume.title, resume.template, JSON.stringify(resume.personal_details), resume.summary, JSON.stringify(resume.experience), JSON.stringify(resume.education), JSON.stringify(resume.skills), now, now]
    );
    return rows[0];
  }

  const data_store = loadLocal();
  data_store[id] = resume;
  saveLocal(data_store);
  return resume;
}

export async function updateResume(id, userId, data) {
  if (useNeon) {
    const existing = await getResume(id, userId);
    if (!existing) return null;
    const merged = { ...existing, ...data, id, user_id: userId, updated_date: new Date().toISOString() };
    const { rows } = await pool.query(
      `UPDATE resumes SET
        title = $1, template = $2, personal_details = $3, summary = $4,
        experience = $5, education = $6, skills = $7,
        score = $8, score_feedback = $9, updated_date = $10
      WHERE id = $11 AND user_id = $12
      RETURNING *`,
      [merged.title, merged.template, JSON.stringify(merged.personal_details), merged.summary,
       JSON.stringify(merged.experience), JSON.stringify(merged.education), JSON.stringify(merged.skills),
       merged.score || 0, JSON.stringify(merged.score_feedback || {}), merged.updated_date, id, userId]
    );
    return rows[0];
  }

  const data_store = loadLocal();
  const existing = data_store[id];
  if (!existing || existing.user_id !== userId) return null;
  const merged = { ...existing, ...data, id, user_id: userId, updated_date: new Date().toISOString() };
  data_store[id] = merged;
  saveLocal(data_store);
  return merged;
}

export async function deleteResume(id, userId) {
  if (useNeon) {
    await pool.query('DELETE FROM resumes WHERE id = $1 AND user_id = $2', [id, userId]);
    return { success: true };
  }
  const data_store = loadLocal();
  if (data_store[id] && data_store[id].user_id === userId) {
    delete data_store[id];
    saveLocal(data_store);
  }
  return { success: true };
}
