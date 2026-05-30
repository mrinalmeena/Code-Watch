
import { api } from '../api.js';
import { severityBadge, statusBadge, platformBadge, timeAgo, emptyState, loadingSkeleton } from '../components/ui.js';

export async function renderDashboard() {
  let data;
  try {
    data = await api.getAnalytics();
  } catch {
    return `
      <div class="page-header">
        <h2>Dashboard</h2>
        <p>Overview of your code review activity</p>
      </div>
      <div class="page-body">
        ${emptyState(
          `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
          'Unable to load analytics',
          'Make sure the server is running on port 3000.'
        )}
      </div>`;
  }

  const { totals, severity, categories, reviewsPerDay, recentReviews, queueStatus } = data;

  
  const totalSeverity = severity.critical + severity.high + severity.medium;
  let donutGradient = 'var(--bg-surface)';
  if (totalSeverity > 0) {
    const critPct = (severity.critical / totalSeverity) * 100;
    const highPct = (severity.high / totalSeverity) * 100;
    donutGradient = `conic-gradient(
      var(--severity-critical) 0% ${critPct}%,
      var(--severity-high) ${critPct}% ${critPct + highPct}%,
      var(--severity-medium) ${critPct + highPct}% 100%
    )`;
  }

  
  const maxCount = Math.max(...reviewsPerDay.map((d) => d.count), 1);
  const bars = reviewsPerDay.map((d) => {
    const height = Math.max(2, (d.count / maxCount) * 100);
    return `<div class="bar" style="height: ${height}%" data-tooltip="${d.date}: ${d.count} reviews"></div>`;
  }).join('');

  
  const maxCat = Math.max(...Object.values(categories), 1);
  const catColors = {
    security: 'var(--cat-security)',
    bug: 'var(--cat-bug)',
    performance: 'var(--cat-performance)',
    'code-smell': 'var(--cat-code-smell)',
  };
  const catBars = Object.entries(categories).map(([cat, count]) => {
    const pct = (count / maxCat) * 100;
    return `
      <div class="h-bar-row">
        <span class="h-bar-label">${cat === 'code-smell' ? 'Code Smell' : cat}</span>
        <div class="h-bar-track">
          <div class="h-bar-fill" style="width: ${pct}%; background: ${catColors[cat]}"></div>
        </div>
        <span class="h-bar-value">${count}</span>
      </div>`;
  }).join('');

  
  const recentList = recentReviews.length > 0
    ? recentReviews.map((r) => `
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
            ${r.issue_count > 0 ? `<span>${r.issue_count} issues</span>` : ''}
          </div>
        </a>`).join('')
    : emptyState(
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
        'No reviews yet',
        'Reviews will appear here when PRs are submitted via webhook or manual trigger.'
      );

  return `
    <div class="page-header">
      <h2>Dashboard</h2>
      <p>Overview of your code review activity</p>
    </div>
    <div class="page-body">
      <!-- Stat Cards -->
      <div class="stat-grid">
        <div class="glass-card stat-card accent-purple">
          <div class="stat-label">Total Reviews</div>
          <div class="stat-value">${totals.total_reviews}</div>
          <div class="stat-change">${queueStatus.active > 0 ? `${queueStatus.active} in progress` : 'Queue idle'}</div>
        </div>
        <div class="glass-card stat-card accent-cyan">
          <div class="stat-label">Issues Found</div>
          <div class="stat-value">${totals.total_issues}</div>
          <div class="stat-change">${totals.avg_issues_per_review} avg per review</div>
        </div>
        <div class="glass-card stat-card accent-red">
          <div class="stat-label">Critical Issues</div>
          <div class="stat-value text-critical">${severity.critical}</div>
          <div class="stat-change">${severity.high} high severity</div>
        </div>
        <div class="glass-card stat-card accent-amber">
          <div class="stat-label">Completed</div>
          <div class="stat-value text-high">${totals.completed_reviews}</div>
          <div class="stat-change">${totals.failed_reviews} failed</div>
        </div>
      </div>

      <!-- Live Demo Card -->
      <div class="demo-card glass-card">
        <div class="demo-card-inner">
          <div class="demo-heading">⚡ Try a Live Review</div>
          <div class="demo-sub">Paste any GitHub PR diff or pick a sample to see CodeSentry AI analyze it in real time.</div>
          <div class="demo-warning">⚠ Demo mode — never expose API keys in production.</div>
          <div class="demo-input-row">
            <input type="text" class="demo-input" id="demo-repo" placeholder="GitHub repo (e.g. facebook/react)" />
            <input type="text" class="demo-input demo-input-sm" id="demo-pr" placeholder="PR number (e.g. 42)" />
            <button class="demo-btn" id="demo-btn">Fetch &amp; Review</button>
          </div>
          <div class="demo-divider">
            <div class="demo-divider-line"></div>
            <span class="demo-divider-text">OR USE A SAMPLE DIFF</span>
            <div class="demo-divider-line"></div>
          </div>
          <div class="demo-samples">
            <button class="demo-sample-btn" id="sample-1">SQL Injection Bug</button>
            <button class="demo-sample-btn" id="sample-2">N+1 Query Pattern</button>
            <button class="demo-sample-btn" id="sample-3">Null Dereference</button>
          </div>
          <div id="demo-results"></div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid-2" style="margin-bottom: var(--space-xl);">
        <div class="glass-card chart-container">
          <div class="chart-title">Reviews — Last 30 Days</div>
          <div class="bar-chart">${bars}</div>
        </div>

        <div class="glass-card chart-container" style="text-align: center;">
          <div class="chart-title" style="text-align: left;">Severity Distribution</div>
          <div class="donut-chart" style="background: ${donutGradient};">
            <div class="donut-center">
              <span class="value">${totalSeverity}</span>
              <span class="label">Issues</span>
            </div>
          </div>
          <div class="chart-legend">
            <div class="legend-item"><div class="legend-dot" style="background: var(--severity-critical);"></div> Critical (${severity.critical})</div>
            <div class="legend-item"><div class="legend-dot" style="background: var(--severity-high);"></div> High (${severity.high})</div>
            <div class="legend-item"><div class="legend-dot" style="background: var(--severity-medium);"></div> Medium (${severity.medium})</div>
          </div>
        </div>
      </div>

      <!-- Category Breakdown + Recent -->
      <div class="grid-2">
        <div class="glass-card chart-container">
          <div class="chart-title">Issues by Category</div>
          <div class="h-bar-chart">${catBars}</div>
        </div>

        <div>
          <div class="chart-title" style="margin-bottom: var(--space-md);">Recent Reviews</div>
          <div class="review-list">${recentList}</div>
        </div>
      </div>
    </div>`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Initialize dashboard interactivity — Live Demo card.
 */
export function initDashboard() {
  const SAMPLE_DIFFS = {
    'sample-1': {
      filename: 'src/db/userRepository.js',
      language: 'JavaScript',
      diff: `@@ -24,7 +24,7 @@ class UserRepository {
-  async getUserById(id) {
-    const query = "SELECT * FROM users WHERE id = " + id;
-    return await this.db.execute(query);
+  async getUserById(id) {
+    const query = \`SELECT * FROM users WHERE id = \${id}\`;
+    return await this.db.execute(query);
   }`
    },
    'sample-2': {
      filename: 'src/services/orderService.js',
      language: 'JavaScript',
      diff: `@@ -15,8 +15,10 @@ class OrderService {
   async getOrdersWithUsers(orderIds) {
     const orders = await Order.findAll({ where: { id: orderIds } });
+    for (const order of orders) {
+      order.user = await User.findById(order.userId);
+    }
     return orders;
   }`
    },
    'sample-3': {
      filename: 'src/api/responseHandler.js',
      language: 'JavaScript',
      diff: `@@ -8,6 +8,7 @@ function handleApiResponse(response) {
   const data = response.data;
+  const userName = data.user.profile.name;
+  return { message: \`Welcome \${userName}\` };
 }`
    }
  };

  async function runDemoReview(diff, filename, language) {
    const systemPrompt = `You are an elite code reviewer. Analyze this diff and return ONLY a valid JSON array. Each item: { "file": string, "line": number, "severity": "critical"|"high"|"medium", "category": "security"|"bug"|"performance"|"code-smell", "title": string, "description": string, "suggestion": string, "confidence": number }. Return [] if no issues. JSON only, no markdown.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'YOUR_KEY_HERE',
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: `File: ${filename} (${language})\n\nDiff:\n${diff}` }]
      })
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '[]';
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  }

  function showDemoLoading(msg) {
    const results = document.getElementById('demo-results');
    if (!results) return;
    results.style.display = 'block';
    results.innerHTML = `
      <div style="text-align:center;padding:32px;color:var(--text-secondary)">
        <div class="demo-spinner"></div>
        <p style="margin-top:12px;font-size:13px">${escapeHtml(msg)}</p>
      </div>`;
  }

  function showDemoError(msg) {
    const results = document.getElementById('demo-results');
    if (!results) return;
    results.style.display = 'block';
    results.innerHTML = `
      <div style="background:rgba(255,107,107,0.08);border:1px solid rgba(255,107,107,0.2);
           border-radius:10px;padding:14px 16px;color:#fca5a5;font-size:13px">
        ⚠ ${escapeHtml(msg)}
      </div>`;
  }

  function renderDemoResults(issues) {
    const SEV_COLOUR = { critical: '#ff6b6b', high: '#ff9f43', medium: '#f9ca24' };
    const results = document.getElementById('demo-results');
    if (!results) return;

    if (!issues.length) {
      results.innerHTML = `<p style="color:var(--status-success);font-size:14px;
        text-align:center;padding:24px">✓ No issues found above threshold.</p>`;
      return;
    }

    results.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <span style="font-size:15px;font-weight:600;color:var(--text-primary)">AI Review Results</span>
        <span style="background:rgba(165,148,249,0.15);border:1px solid rgba(165,148,249,0.3);
             border-radius:20px;padding:3px 12px;font-size:12px;color:var(--accent-primary)">
          ${issues.length} issue${issues.length > 1 ? 's' : ''} found</span>
      </div>
      ${issues.map(issue => `
        <div style="background:rgba(255,255,255,0.03);
             border-left:3px solid ${SEV_COLOUR[issue.severity] || '#48dbfb'};
             border-radius:0 10px 10px 0;padding:16px;margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
            <span style="font-size:14px;font-weight:600;color:var(--text-primary)">${escapeHtml(issue.title || '')}</span>
            <span style="font-size:10px;padding:2px 8px;border-radius:4px;
                 background:${(SEV_COLOUR[issue.severity] || '#48dbfb')}22;
                 color:${SEV_COLOUR[issue.severity] || '#48dbfb'};
                 border:1px solid ${(SEV_COLOUR[issue.severity] || '#48dbfb')}44;
                 text-transform:uppercase;font-weight:600;white-space:nowrap;margin-left:12px">
              ${escapeHtml(issue.severity || '')}</span>
          </div>
          <p style="font-size:12px;color:var(--text-secondary);margin-bottom:10px;line-height:1.6">
            ${escapeHtml(issue.description || '')}</p>
          ${issue.suggestion ? `
          <div style="background:rgba(165,148,249,0.06);border:1px solid rgba(165,148,249,0.15);
               border-radius:8px;padding:10px 12px">
            <span style="font-size:10px;color:var(--accent-primary);letter-spacing:0.08em">💡 SUGGESTION</span>
            <p style="font-size:12px;color:var(--text-secondary);margin-top:6px;
               font-family:var(--font-mono);line-height:1.5">${escapeHtml(issue.suggestion)}</p>
          </div>` : ''}
        </div>
      `).join('')}
    `;
  }

  async function triggerReview(diff, filename, language) {
    showDemoLoading('Analyzing with Claude...');
    try {
      const issues = await runDemoReview(diff, filename, language);
      renderDemoResults(issues);
    } catch (e) {
      showDemoError('Analysis failed. Check console for details.');
      console.error(e);
    }
  }

  // Wire up sample buttons
  ['sample-1', 'sample-2', 'sample-3'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', async () => {
        const sample = SAMPLE_DIFFS[id];
        await triggerReview(sample.diff, sample.filename, sample.language);
      });
    }
  });

  // Wire up Fetch & Review button
  const demoBtn = document.getElementById('demo-btn');
  if (demoBtn) {
    demoBtn.addEventListener('click', async () => {
      const repo = document.getElementById('demo-repo')?.value.trim();
      const pr = document.getElementById('demo-pr')?.value.trim();
      if (!repo || !pr) {
        showDemoError('Please enter both a repo and PR number.');
        return;
      }
      try {
        showDemoLoading('Fetching PR diff from GitHub...');
        const res = await fetch(
          `https://api.github.com/repos/${repo}/pulls/${pr}`,
          { headers: { Accept: 'application/vnd.github.v3.diff' } }
        );
        if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
        const diff = await res.text();
        await triggerReview(diff.slice(0, 3000), `${repo} PR #${pr}`, 'auto-detected');
      } catch (e) {
        showDemoError(`Could not fetch PR: ${e.message}`);
      }
    });
  }
}
