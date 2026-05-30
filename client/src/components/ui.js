

export function severityBadge(severity, size = '') {
  const cls = `badge badge-${severity} ${size ? `badge-${size}` : ''}`;
  return `<span class="${cls}">${severity}</span>`;
}

export function statusBadge(status) {
  return `<span class="badge-status badge-${status}">${status}</span>`;
}

export function categoryBadge(category) {
  return `<span class="badge-category badge-${category}">${category}</span>`;
}

export function platformBadge(platform) {
  const icons = {
    github: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>`,
    gitlab: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z"/></svg>`,
  };
  return `<span class="badge-platform badge-${platform}">${icons[platform] || ''} ${platform}</span>`;
}

export function confidenceIndicator(confidence) {
  const levels = { high: 3, medium: 2, low: 1 };
  const filled = levels[confidence] || 0;
  const dots = [1, 2, 3].map((i) =>
    `<div class="confidence-dot ${i <= filled ? 'filled' : ''}"></div>`
  ).join('');
  return `<span class="confidence"><span class="confidence-dots">${dots}</span> ${confidence}</span>`;
}

export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr + (dateStr.endsWith('Z') ? '' : 'Z'));
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export function emptyState(icon, title, description) {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">${icon}</div>
      <h3>${title}</h3>
      <p>${description}</p>
    </div>`;
}

export function loadingSkeleton(count = 3) {
  return Array(count).fill('').map(() => `
    <div class="glass-card" style="padding: var(--space-lg); margin-bottom: var(--space-md);">
      <div class="skeleton skeleton-text-lg"></div>
      <div class="skeleton skeleton-text" style="width: 80%;"></div>
      <div class="skeleton skeleton-text-sm" style="margin-top: var(--space-md);"></div>
    </div>`
  ).join('');
}
