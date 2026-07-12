import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClerkClient } from '@clerk/backend';
import { initDB, isTableReady, listResumes, getResume, createResume, updateResume, deleteResume } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || process.env.API_PORT || 3001;

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
const MAX_PHOTO_SIZE = 512000; // 500KB base64 data URL cap

async function requireAuth(req, res, next) {
  try {
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const requestState = await clerk.authenticateRequest(
      { url: fullUrl, method: req.method, headers: req.headers },
      { publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY }
    );
    if (requestState.status !== 'signed-in') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const authObj = requestState.toAuth();
    req.auth = { userId: authObj.userId };
    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', storage: isTableReady() ? 'neon' : 'local' });
});

app.get('/api/resumes', requireAuth, async (req, res) => {
  try {
    const resumes = await listResumes(req.auth.userId);
    res.json(resumes);
  } catch (err) {
    console.error('Error listing resumes:', err);
    res.status(500).json({ error: 'Failed to list resumes' });
  }
});

app.get('/api/resumes/:id', requireAuth, async (req, res) => {
  try {
    const resume = await getResume(req.params.id, req.auth.userId);
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    res.json(resume);
  } catch (err) {
    console.error('Error getting resume:', err);
    res.status(500).json({ error: 'Failed to get resume' });
  }
});

function validatePhoto(personal) {
  if (personal?.photo_url && personal.photo_url.length > MAX_PHOTO_SIZE) {
    throw Object.assign(new Error('photo_url exceeds 500KB limit'), { status: 400 });
  }
}

app.post('/api/resumes', requireAuth, async (req, res) => {
  try {
    validatePhoto(req.body.personal_details);
    const resume = await createResume(req.auth.userId, req.body);
    res.status(201).json(resume);
  } catch (err) {
    console.error('Error creating resume:', err);
    if (err.status === 400) return res.status(400).json({ error: err.message });
    res.status(500).json({ error: 'Failed to create resume' });
  }
});

app.put('/api/resumes/:id', requireAuth, async (req, res) => {
  try {
    validatePhoto(req.body.personal_details);
    const resume = await updateResume(req.params.id, req.auth.userId, req.body);
    if (!resume) return res.status(404).json({ error: 'Resume not found' });
    res.json(resume);
  } catch (err) {
    console.error('Error updating resume:', err);
    if (err.status === 400) return res.status(400).json({ error: err.message });
    res.status(500).json({ error: 'Failed to update resume' });
  }
});

app.delete('/api/resumes/:id', requireAuth, async (req, res) => {
  try {
    await deleteResume(req.params.id, req.auth.userId);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting resume:', err);
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

// Serve built frontend in production
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

async function start() {
  await initDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
