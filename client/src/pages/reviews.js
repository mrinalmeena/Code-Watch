
import { api } from '../api.js';
import { severityBadge, statusBadge, platformBadge, timeAgo, emptyState, loadingSkeleton } from '../components/ui.js';
import { showToast } from '../components/toast.js';

let currentFilters = { page: 1, limit: 20, platform: '', status: '', search: '' };

export async function renderReviews() {
  return `
    <div class="page-header">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: var(--space-md);">
        <div>
          <h2>Reviews</h2>
          <p>Browse and search your code review history</p>
        </div>
        <button class="btn btn-primary" id="btn-manual-review">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Manual Review
        </button>
      </div>
    </div>
    <div class="page-body">
      <!-- Filter Bar -->
      <div class="filter-bar">
        <div class="search-input">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="filter-search" placeholder="Search repos, PR titles, authors..." value="${currentFilters.search}" />
        </div>
        <select class="filter-select" id="filter-platform">
          <option value="">All Platforms</option>
          <option value="github" ${currentFilters.platform === 'github' ? 'selected' : ''}>GitHub</option>
          <option value="gitlab" ${currentFilters.platform === 'gitlab' ? 'selected' : ''}>GitLab</option>
        </select>
        <select class="filter-select" id="filter-status">
          <option value="">All Status</option>
          <option value="completed" ${currentFilters.status === 'completed' ? 'selected' : ''}>Completed</option>
          <option value="pending" ${currentFilters.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="reviewing" ${currentFilters.status === 'reviewing' ? 'selected' : ''}>Reviewing</option>
          <option value="failed" ${currentFilters.status === 'failed' ? 'selected' : ''}>Failed</option>
        </select>
      </div>

      <!-- Reviews List -->
      <div id="reviews-container">
        ${loadingSkeleton(3)}
      </div>

      <!-- Manual Review Modal -->
      <div id="manual-review-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:500; display:none; align-items:center; justify-content:center;">
        <div class="glass-card" style="width: 100%; max-width: 500px; padding: var(--space-xl);">
          <h3 style="margin-bottom: var(--space-lg); font-size: 18px;">Trigger Manual Review</h3>
          <div class="form-group">
            <label class="form-label">Platform</label>
            <select class="form-input" id="manual-platform">
              <option value="github">GitHub</option>
              <option value="gitlab">GitLab</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Repository</label>
            <input type="text" class="form-input form-input-mono" id="manual-repo" placeholder="owner/repo (GitHub) or project ID (GitLab)" />
          </div>
          <div class="form-group">
            <label class="form-label">PR / MR Number</label>
            <input type="number" class="form-input" id="manual-pr-number" placeholder="1" min="1" />
          </div>
          <div style="display: flex; gap: var(--space-md); justify-content: flex-end;">
            <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
            <button class="btn btn-primary" id="modal-submit">Start Review</button>
          </div>
        </div>
      </div>
    </div>`;
}

export function initReviews() {
  loadReviews();

  
  const searchInput = document.getElementById('filter-search');
  const platformSelect = document.getElementById('filter-platform');
  const statusSelect = document.getElementById('filter-status');

  let searchTimeout;
  searchInput?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentFilters.search = e.target.value;
      currentFilters.page = 1;
      loadReviews();
    }, 300);
  });

  platformSelect?.addEventListener('change', (e) => {
    currentFilters.platform = e.target.value;
    currentFilters.page = 1;
    loadReviews();
  });

  statusSelect?.addEventListener('change', (e) => {
    currentFilters.status = e.target.value;
    currentFilters.page = 1;
    loadReviews();
  });

  
  const modal = document.getElementById('manual-review-modal');
  document.getElementById('btn-manual-review')?.addEventListener('click', () => {
    modal.style.display = 'flex';
  });
  document.getElementById('modal-cancel')?.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  document.getElementById('modal-submit')?.addEventListener('click', async () => {
    const platform = document.getElementById('manual-platform').value;
    const repo = document.getElementById('manual-repo').value.trim();
    const prNumber = document.getElementById('manual-pr-number').value;

    if (!repo || !prNumber) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    try {
      await api.triggerManualReview({ platform, repo, prNumber: parseInt(prNumber) });
      showToast('Review enqueued successfully!', 'success');
      modal.style.display = 'none';
      loadReviews();
    } catch (error) {
      showToast(error.message, 'error');
    }
  });
}

async function loadReviews() {
  const container = document.getElementById('reviews-container');
  if (!container) return;

  try {
    const data = await api.getReviews(currentFilters);
    const { reviews, pagination } = data;

    if (reviews.length === 0) {
      container.innerHTML = emptyState(
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
        'No reviews found',
        currentFilters.search ? 'Try adjusting your search or filters.' : 'Reviews will appear here when PRs are analyzed.'
      );
      return;
    }

    const cards = reviews.map((r) => {
      const issuesBadges = [];
      if (r.severityCounts?.critical > 0) issuesBadges.push(severityBadge('critical', 'sm') + `<span style="font-size:11px;color:var(--text-tertiary);">${r.severityCounts.critical}</span>`);
      if (r.severityCounts?.high > 0) issuesBadges.push(severityBadge('high', 'sm') + `<span style="font-size:11px;color:var(--text-tertiary);">${r.severityCounts.high}</span>`);
      if (r.severityCounts?.medium > 0) issuesBadges.push(severityBadge('medium', 'sm') + `<span style="font-size:11px;color:var(--text-tertiary);">${r.severityCounts.medium}</span>`);

      return `
        <a href="#/reviews/${r.id}" class="review-card glass-card" style="text-decoration:none;">
          <div class="review-card-header">
            <div>
              <div class="review-card-title">${escapeHtml(r.pr_title || `PR #${r.pr_number}`)}</div>
              <div class="review-card-repo">${escapeHtml(r.repo)}</div>
            </div>
            ${statusBadge(r.status)}
          </div>
          <div class="review-card-meta">
            ${platformBadge(r.platform)}
            <span>#${r.pr_number}</span>
            ${r.pr_author ? `<span>by ${escapeHtml(r.pr_author)}</span>` : ''}
            <span>${timeAgo(r.created_at)}</span>
            ${r.files_reviewed > 0 ? `<span>${r.files_reviewed} files</span>` : ''}
          </div>
          ${issuesBadges.length > 0 ? `<div class="review-card-issues">${issuesBadges.join('')}</div>` : ''}
        </a>`;
    }).join('');

    
    let paginationHtml = '';
    if (pagination.totalPages > 1) {
      paginationHtml = '<div class="pagination">';
      paginationHtml += `<button class="pagination-btn" data-page="${pagination.page - 1}" ${pagination.page <= 1 ? 'disabled' : ''}>&lt;</button>`;
      for (let i = 1; i <= Math.min(pagination.totalPages, 7); i++) {
        paginationHtml += `<button class="pagination-btn ${i === pagination.page ? 'active' : ''}" data-page="${i}">${i}</button>`;
      }
      paginationHtml += `<button class="pagination-btn" data-page="${pagination.page + 1}" ${pagination.page >= pagination.totalPages ? 'disabled' : ''}>&gt;</button>`;
      paginationHtml += `<span class="pagination-info">${pagination.total} total</span>`;
      paginationHtml += '</div>';
    }

    container.innerHTML = `<div class="review-list">${cards}</div>${paginationHtml}`;

    
    container.querySelectorAll('.pagination-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.dataset.page);
        if (page >= 1 && page <= pagination.totalPages) {
          currentFilters.page = page;
          loadReviews();
        }
      });
    });
  } catch (error) {
    container.innerHTML = emptyState(
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
      'Error loading reviews',
      error.message
    );
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
