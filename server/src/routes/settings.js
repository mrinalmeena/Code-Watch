import { Router } from 'express';
import db from '../database.js';
import * as github from '../services/github.js';
import * as gitlab from '../services/gitlab.js';
import logger from '../utils/logger.js';

const router = Router();


const SENSITIVE_KEYS = ['github_token', 'gitlab_token', 'gemini_api_key', 'github_webhook_secret', 'gitlab_webhook_secret'];


router.get('/', (req, res) => {
  const rows = db.prepare('SELECT key, value, updated_at FROM settings ORDER BY key').all();
  const settings = {};

  for (const row of rows) {
    settings[row.key] = {
      value: SENSITIVE_KEYS.includes(row.key) ? maskValue(row.value) : row.value,
      updated_at: row.updated_at,
      sensitive: SENSITIVE_KEYS.includes(row.key),
    };
  }

  res.json({ settings });
});


router.put('/', (req, res) => {
  const updates = req.body;

  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ error: 'Request body must be an object of key-value pairs' });
  }

  const stmt = db.prepare(
    "INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = datetime('now')"
  );

  const update = db.transaction((entries) => {
    for (const [key, value] of entries) {
      stmt.run(key, String(value), String(value));
    }
  });

  const entries = Object.entries(updates).filter(([key]) => {
    
    return typeof key === 'string';
  });

  update(entries);
  logger.info('Settings updated', { keys: entries.map(([k]) => k) });

  res.json({ message: 'Settings updated', updated: entries.length });
});


router.post('/test-connection', async (req, res) => {
  const { platform } = req.body;

  if (!platform || !['github', 'gitlab'].includes(platform)) {
    return res.status(400).json({ error: 'Platform must be "github" or "gitlab"' });
  }

  try {
    let result;
    if (platform === 'github') {
      result = await github.testConnection();
    } else {
      result = await gitlab.testConnection();
    }

    res.json({ platform, ...result });
  } catch (error) {
    res.json({ platform, success: false, error: error.message });
  }
});

function maskValue(value) {
  if (!value) return '';
  if (value.length <= 8) return '••••••••';
  return value.slice(0, 4) + '••••••••' + value.slice(-4);
}

export default router;
