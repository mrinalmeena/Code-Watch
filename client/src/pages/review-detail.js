
import { api } from '../api.js';
import { severityBadge, statusBadge, platformBadge, categoryBadge, confidenceIndicator, timeAgo, emptyState } from '../components/ui.js';

export async function renderReviewDetail(params) {
  const { id } = params;

  let data;
  try {
    data = await api.getReview(id);
  } catch (error) {
    return `
      <div class="page-header">
        <h2>Review Detail</h2>
      </div>
      <div class="page-body">
        ${emptyState(
          `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
          'Review not found',
          error.message
        )}
      </div>`;
  }

  const { review, logs } = data;
  const issues = review.issues_found || [];

  
  const severityCounts = { critical: 0, high: 0, medium: 0 };
  const categoryCounts = {};
  issues.forEach((i) => {
    if (severityCounts[i.severity] !== undefined) severityCounts[i.severity]++;
    categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
  });

  
  const issueCards = issues.length > 0
    ? issues.map((issue, idx) => `
        <div class="glass-card issue-card severity-${issue.severity}" id="issue-${idx}">
          <div class="issue-header">
            ${severityBadge(issue.severity)}
            ${categoryBadge(issue.category)}
            ${confidenceIndicator(issue.confidence)}
          </div>
          <div class="issue-title">${escapeHtml(issue.title)}</div>
          <div class="issue-location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle;"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>
            ${escapeHtml(issue.file)}${issue.line ? `:${issue.line}` : ''}
          </div>
          <div class="issue-description">${escapeHtml(issue.description)}</div>
          <div class="issue-suggestion">
            <div class="issue-suggestion-label">💡 Suggestion</div>
            <pre>${escapeHtml(issue.suggestion)}</pre>
          </div>
        </div>`).join('')
    : emptyState(
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
        'No issues found',
        'The AI review found no significant issues in this PR. Code looks good! ✅'
      );

  
  const timeline = logs.map((log) => `
    <div class="timeline-item">
      <div class="timeline-event">${escapeHtml(log.event.replace(/_/g, ' '))}</div>
      <div class="timeline-details">${escapeHtml(log.details || '')}</div>
      <div class="timeline-time">${timeAgo(log.created_at)}</div>
    </div>`).join('');

  return `
    <div class="page-header">
      <div style="display: flex; align-items: center; gap: var(--space-md); margin-bottom: var(--space-sm);">
        <a href="#/reviews" class="btn btn-icon" aria-label="Back to reviews">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </a>
        <div>
          <h2>${escapeHtml(review.pr_title || `PR #${review.pr_number}`)}</h2>
          <p>${escapeHtml(review.repo)} #${review.pr_number}${review.branch ? ` • ${escapeHtml(review.branch)}` : ''}</p>
        </div>
      </div>
    </div>
    <div class="page-body">
      <!-- Review Meta -->
      <div class="glass-card" style="padding: var(--space-lg); margin-bottom: var(--space-xl);">
        <div style="display: flex; align-items: center; gap: var(--space-md); flex-wrap: wrap;">
          ${statusBadge(review.status)}
          ${platformBadge(review.platform)}
          ${review.pr_author ? `<span style="font-size: 13px; color: var(--text-secondary);">by <strong>${escapeHtml(review.pr_author)}</strong></span>` : ''}
          <span style="font-size: 13px; color: var(--text-tertiary);">Created ${timeAgo(review.created_at)}</span>
          ${review.completed_at ? `<span style="font-size: 13px; color: var(--text-tertiary);">Completed ${timeAgo(review.completed_at)}</span>` : ''}
          ${review.pr_url ? `<a href="${review.pr_url}" target="_blank" rel="noopener" class="btn btn-sm btn-secondary" style="margin-left: auto;">View PR ↗</a>` : ''}
        </div>
        ${review.summary ? `<p style="margin-top: var(--space-md); font-size: 14px; color: var(--text-secondary); line-height: 1.7;">${escapeHtml(review.summary)}</p>` : ''}
        ${review.error_message ? `<div class="connection-status error" style="margin-top: var(--space-md);">⚠ ${escapeHtml(review.error_message)}</div>` : ''}
      </div>

      <!-- Issues Summary Bar -->
      ${issues.length > 0 ? `
        <div style="display: flex; gap: var(--space-lg); margin-bottom: var(--space-xl); flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: var(--space-sm);">
            <span style="font-size: 13px; color: var(--text-secondary);">Issues:</span>
            <strong style="font-size: 15px;">${issues.length}</strong>
          </div>
          ${severityCounts.critical > 0 ? `<div style="display: flex; align-items: center; gap: var(--space-xs);">${severityBadge('critical')} <span style="font-size: 13px;">${severityCounts.critical}</span></div>` : ''}
          ${severityCounts.high > 0 ? `<div style="display: flex; align-items: center; gap: var(--space-xs);">${severityBadge('high')} <span style="font-size: 13px;">${severityCounts.high}</span></div>` : ''}
          ${severityCounts.medium > 0 ? `<div style="display: flex; align-items: center; gap: var(--space-xs);">${severityBadge('medium')} <span style="font-size: 13px;">${severityCounts.medium}</span></div>` : ''}
          <span style="font-size: 13px; color: var(--text-tertiary);">•</span>
          <span style="font-size: 13px; color: var(--text-secondary);">${review.files_reviewed} files reviewed</span>
        </div>
      ` : ''}

      <!-- Main Content Grid -->
      <div class="grid-3" style="grid-template-columns: 1fr 300px;">
        <div>
          <h3 style="font-size: 16px; font-weight: 600; margin-bottom: var(--space-lg);">Issues</h3>
          ${issueCards}
        </div>

        <div>
          <h3 style="font-size: 16px; font-weight: 600; margin-bottom: var(--space-lg);">Timeline</h3>
          <div class="glass-card" style="padding: var(--space-lg);">
            <div class="timeline">
              ${timeline || '<p style="color: var(--text-tertiary); font-size: 13px;">No events recorded</p>'}
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
