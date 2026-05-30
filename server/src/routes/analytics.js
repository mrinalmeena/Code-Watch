import { Router } from 'express';
import db from '../database.js';
import reviewQueue from '../services/queue.js';

const router = Router();


router.get('/', (req, res) => {
  
  const totals = db.prepare(`
    SELECT
      COUNT(*) as total_reviews,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_reviews,
      COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_reviews,
      COUNT(CASE WHEN status IN ('pending', 'reviewing') THEN 1 END) as active_reviews
    FROM reviews
  `).get();

  
  const completedReviews = db.prepare(
    "SELECT issues_found FROM reviews WHERE status = 'completed'"
  ).all();

  let totalIssues = 0;
  const severityCounts = { critical: 0, high: 0, medium: 0 };
  const categoryCounts = { security: 0, bug: 0, performance: 0, 'code-smell': 0 };

  for (const row of completedReviews) {
    try {
      const issues = JSON.parse(row.issues_found);
      totalIssues += issues.length;
      issues.forEach((issue) => {
        if (severityCounts[issue.severity] !== undefined) severityCounts[issue.severity]++;
        if (categoryCounts[issue.category] !== undefined) categoryCounts[issue.category]++;
      });
    } catch {  }
  }

  const avgIssuesPerReview = totals.completed_reviews > 0
    ? Math.round((totalIssues / totals.completed_reviews) * 10) / 10
    : 0;

  
  const reviewsPerDay = db.prepare(`
    SELECT date(created_at) as date, COUNT(*) as count
    FROM reviews
    WHERE created_at >= datetime('now', '-30 days')
    GROUP BY date(created_at)
    ORDER BY date ASC
  `).all();

  
  const last30Days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const existing = reviewsPerDay.find((r) => r.date === dateStr);
    last30Days.push({ date: dateStr, count: existing?.count || 0 });
  }

  
  const topRepos = db.prepare(`
    SELECT repo, COUNT(*) as review_count
    FROM reviews
    WHERE status = 'completed'
    GROUP BY repo
    ORDER BY review_count DESC
    LIMIT 5
  `).all();

  
  const platformCounts = db.prepare(`
    SELECT platform, COUNT(*) as count
    FROM reviews
    GROUP BY platform
  `).all();

  
  const recentReviews = db.prepare(`
    SELECT id, platform, repo, pr_number, pr_title, pr_author, status,
           json_array_length(issues_found) as issue_count, created_at, completed_at
    FROM reviews
    ORDER BY created_at DESC
    LIMIT 5
  `).all();

  
  const queueStatus = reviewQueue.getStatus();

  res.json({
    totals: {
      ...totals,
      total_issues: totalIssues,
      avg_issues_per_review: avgIssuesPerReview,
    },
    severity: severityCounts,
    categories: categoryCounts,
    reviewsPerDay: last30Days,
    topRepos,
    platformCounts,
    recentReviews,
    queueStatus,
  });
});

export default router;
