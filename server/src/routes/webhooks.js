import { Router } from 'express';
import config from '../config.js';
import db from '../database.js';
import { verifyGitHubSignature, verifyGitLabToken } from '../utils/crypto.js';
import logger from '../utils/logger.js';
import reviewQueue from '../services/queue.js';

const router = Router();


router.post('/github', (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const event = req.headers['x-github-event'];
  const deliveryId = req.headers['x-github-delivery'];

  
  const row = db.prepare("SELECT value FROM settings WHERE key = 'github_webhook_secret'").get();
  const secret = row?.value || config.github.webhookSecret;

  
  if (secret) {
    const rawBody = req.rawBody;
    if (!rawBody || !verifyGitHubSignature(rawBody, signature, secret)) {
      logger.warn('GitHub webhook signature verification failed', { deliveryId });
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  
  if (event !== 'pull_request') {
    return res.status(200).json({ message: `Ignored event: ${event}` });
  }

  const payload = req.body;
  const action = payload.action;

  
  if (!['opened', 'synchronize', 'reopened'].includes(action)) {
    return res.status(200).json({ message: `Ignored action: ${action}` });
  }

  
  const autoReview = db.prepare("SELECT value FROM settings WHERE key = 'auto_review'").get();
  if (autoReview?.value === 'false') {
    return res.status(200).json({ message: 'Auto-review is disabled' });
  }

  const pr = payload.pull_request;
  const repo = payload.repository?.full_name;

  
  if (!pr || !repo || !pr.number || !pr.user?.login || !pr.head?.ref) {
    logger.warn('GitHub webhook payload missing required fields', { deliveryId });
    return res.status(400).json({ error: 'Malformed webhook payload: missing required pull_request fields' });
  }

  
  const result = db.prepare(`
    INSERT INTO reviews (platform, repo, pr_number, pr_title, pr_author, pr_url, branch, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
  `).run('github', repo, pr.number, pr.title, pr.user.login, pr.html_url, pr.head.ref);

  const reviewId = result.lastInsertRowid;

  db.prepare('INSERT INTO review_logs (review_id, event, details) VALUES (?, ?, ?)').run(
    reviewId, 'webhook_received', `GitHub PR #${pr.number} ${action} by ${pr.user.login}`
  );

  
  reviewQueue.enqueue('review', {
    reviewId: Number(reviewId),
    platform: 'github',
    repo,
    prNumber: pr.number,
    prTitle: pr.title,
    prAuthor: pr.user.login,
    prUrl: pr.html_url,
  });

  logger.info('GitHub PR review enqueued', { repo, prNumber: pr.number, reviewId: Number(reviewId) });
  res.status(202).json({ message: 'Review enqueued', reviewId: Number(reviewId) });
});


router.post('/gitlab', (req, res) => {
  const token = req.headers['x-gitlab-token'];
  const event = req.headers['x-gitlab-event'];

  
  const row = db.prepare("SELECT value FROM settings WHERE key = 'gitlab_webhook_secret'").get();
  const secret = row?.value || config.gitlab.webhookSecret;

  
  if (secret) {
    if (!verifyGitLabToken(token, secret)) {
      logger.warn('GitLab webhook token verification failed');
      return res.status(401).json({ error: 'Invalid token' });
    }
  }

  const payload = req.body;

  
  if (payload.object_kind !== 'merge_request') {
    return res.status(200).json({ message: `Ignored event: ${payload.object_kind}` });
  }

  const action = payload.object_attributes?.action;
  if (!['open', 'update', 'reopen'].includes(action)) {
    return res.status(200).json({ message: `Ignored action: ${action}` });
  }

  
  const autoReview = db.prepare("SELECT value FROM settings WHERE key = 'auto_review'").get();
  if (autoReview?.value === 'false') {
    return res.status(200).json({ message: 'Auto-review is disabled' });
  }

  const mr = payload.object_attributes;
  const project = payload.project;

  
  if (!mr || !project?.id || !mr.iid || !mr.title) {
    logger.warn('GitLab webhook payload missing required fields');
    return res.status(400).json({ error: 'Malformed webhook payload: missing required merge_request fields' });
  }

  
  const result = db.prepare(`
    INSERT INTO reviews (platform, repo, pr_number, pr_title, pr_author, pr_url, branch, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
  `).run('gitlab', String(project.id), mr.iid, mr.title, payload.user?.username || '', mr.url, mr.source_branch);

  const reviewId = result.lastInsertRowid;

  db.prepare('INSERT INTO review_logs (review_id, event, details) VALUES (?, ?, ?)').run(
    reviewId, 'webhook_received', `GitLab MR !${mr.iid} ${action} by ${payload.user?.username || 'unknown'}`
  );

  
  reviewQueue.enqueue('review', {
    reviewId: Number(reviewId),
    platform: 'gitlab',
    repo: String(project.id),
    prNumber: mr.iid,
    prTitle: mr.title,
    prAuthor: payload.user?.username || '',
    prUrl: mr.url,
  });

  logger.info('GitLab MR review enqueued', { projectId: project.id, mrIid: mr.iid, reviewId: Number(reviewId) });
  res.status(202).json({ message: 'Review enqueued', reviewId: Number(reviewId) });
});

export default router;
