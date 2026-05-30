import { Router } from 'express';
import db from '../database.js';
import reviewQueue from '../services/queue.js';
import logger from '../utils/logger.js';

const router = Router();


router.get('/', (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
  const offset = (page - 1) * limit;

  let where = '1=1';
  const params = [];

  if (req.query.platform && ['github', 'gitlab'].includes(req.query.platform)) {
    where += ' AND platform = ?';
    params.push(req.query.platform);
  }

  if (req.query.status && ['pending', 'reviewing', 'completed', 'failed'].includes(req.query.status)) {
    where += ' AND status = ?';
    params.push(req.query.status);
  }

  if (req.query.search) {
    where += ' AND (repo LIKE ? OR pr_title LIKE ? OR pr_author LIKE ?)';
    const term = `%${req.query.search}%`;
    params.push(term, term, term);
  }

  const countRow = db.prepare(`SELECT COUNT(*) as total FROM reviews WHERE ${where}`).get(...params);
  const reviews = db.prepare(
    `SELECT id, platform, repo, pr_number, pr_title, pr_author, pr_url, branch, status,
            summary, files_reviewed, error_message, created_at, completed_at,
            json_array_length(issues_found) as issue_count
     FROM reviews WHERE ${where}
     ORDER BY created_at DESC LIMIT ? OFFSET ?`
  ).all(...params, limit, offset);

  
  const enriched = reviews.map((r) => {
    const issuesRaw = db.prepare('SELECT issues_found FROM reviews WHERE id = ?').get(r.id);
    let severityCounts = { critical: 0, high: 0, medium: 0 };
    try {
      const issues = JSON.parse(issuesRaw.issues_found);
      issues.forEach((i) => {
        if (severityCounts[i.severity] !== undefined) severityCounts[i.severity]++;
      });
    } catch {  }
    return { ...r, severityCounts };
  });

  res.json({
    reviews: enriched,
    pagination: {
      page,
      limit,
      total: countRow.total,
      totalPages: Math.ceil(countRow.total / limit),
    },
  });
});


router.get('/:id', (req, res) => {
  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(req.params.id);
  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }

  
  try {
    review.issues_found = JSON.parse(review.issues_found);
  } catch {
    review.issues_found = [];
  }

  
  const logs = db.prepare(
    'SELECT event, details, created_at FROM review_logs WHERE review_id = ? ORDER BY created_at ASC'
  ).all(review.id);

  res.json({ review, logs });
});


router.post('/manual', (req, res) => {
  const { platform, repo, prNumber } = req.body;

  if (!platform || !repo || !prNumber) {
    return res.status(400).json({ error: 'Missing required fields: platform, repo, prNumber' });
  }

  if (!['github', 'gitlab'].includes(platform)) {
    return res.status(400).json({ error: 'Platform must be "github" or "gitlab"' });
  }

  
  const result = db.prepare(`
    INSERT INTO reviews (platform, repo, pr_number, pr_title, pr_author, pr_url, branch, status)
    VALUES (?, ?, ?, 'Manual review', '', '', '', 'pending')
  `).run(platform, repo, parseInt(prNumber));

  const reviewId = Number(result.lastInsertRowid);

  db.prepare('INSERT INTO review_logs (review_id, event, details) VALUES (?, ?, ?)').run(
    reviewId, 'manual_trigger', `Manual review triggered for ${repo}#${prNumber}`
  );

  reviewQueue.enqueue('review', {
    reviewId,
    platform,
    repo,
    prNumber: parseInt(prNumber),
    prTitle: 'Manual review',
    prAuthor: '',
    prUrl: '',
  });

  logger.info('Manual review enqueued', { platform, repo, prNumber, reviewId });
  res.status(202).json({ message: 'Review enqueued', reviewId });
});

export default router;
