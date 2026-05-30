
import { api } from '../api.js';
import { showToast } from '../components/toast.js';

export async function renderSettings() {
  let settings = {};
  try {
    const data = await api.getSettings();
    settings = data.settings || {};
  } catch {
    
  }

  const getValue = (key) => settings[key]?.value || '';
  const isSensitive = (key) => settings[key]?.sensitive || false;

  const serverUrl = window.location.origin;

  return `
    <div class="page-header">
      <h2>Settings</h2>
      <p>Configure your integrations and review preferences</p>
    </div>
    <div class="page-body">

      <!-- GitHub Section -->
      <div class="settings-section">
        <div class="settings-section-header">
          <div class="settings-section-icon">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
          </div>
          <div>
            <div class="settings-section-title">GitHub Integration</div>
            <div class="settings-section-desc">Connect your GitHub account to review pull requests</div>
          </div>
        </div>
        <div class="glass-card" style="padding: var(--space-lg);">
          <div class="form-group">
            <label class="form-label">Personal Access Token</label>
            <input type="password" class="form-input form-input-mono" id="setting-github_token" placeholder="ghp_xxxxxxxxxxxx" value="${escapeAttr(getValue('github_token'))}" />
            <div class="form-hint">Requires <code>repo</code> scope for private repos, <code>public_repo</code> for public repos.</div>
          </div>
          <div class="form-group">
            <label class="form-label">Webhook Secret</label>
            <input type="password" class="form-input form-input-mono" id="setting-github_webhook_secret" placeholder="your-webhook-secret" value="${escapeAttr(getValue('github_webhook_secret'))}" />
          </div>
          <div class="webhook-url">
            <span style="font-weight: 600; color: var(--text-secondary);">Webhook URL:</span>
            <code id="github-webhook-url">${serverUrl}/api/webhooks/github</code>
            <button class="btn btn-sm btn-secondary" onclick="navigator.clipboard.writeText('${serverUrl}/api/webhooks/github').then(()=>document.getElementById('copy-gh').textContent='Copied!').catch(()=>{})">
              <span id="copy-gh">Copy</span>
            </button>
          </div>
          <div style="margin-top: var(--space-md);">
            <button class="btn btn-sm btn-secondary" id="test-github">Test Connection</button>
          </div>
          <div id="github-connection-status"></div>
        </div>
      </div>

      <!-- GitLab Section -->
      <div class="settings-section">
        <div class="settings-section-header">
          <div class="settings-section-icon" style="color: var(--gitlab-color);">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z"/></svg>
          </div>
          <div>
            <div class="settings-section-title">GitLab Integration</div>
            <div class="settings-section-desc">Connect your GitLab instance to review merge requests</div>
          </div>
        </div>
        <div class="glass-card" style="padding: var(--space-lg);">
          <div class="form-group">
            <label class="form-label">GitLab URL</label>
            <input type="url" class="form-input form-input-mono" id="setting-gitlab_url" placeholder="https://gitlab.com" value="${escapeAttr(getValue('gitlab_url'))}" />
            <div class="form-hint">Use your self-hosted GitLab URL or leave as gitlab.com</div>
          </div>
          <div class="form-group">
            <label class="form-label">Personal Access Token</label>
            <input type="password" class="form-input form-input-mono" id="setting-gitlab_token" placeholder="glpat-xxxxxxxxxxxx" value="${escapeAttr(getValue('gitlab_token'))}" />
            <div class="form-hint">Requires <code>api</code> scope</div>
          </div>
          <div class="form-group">
            <label class="form-label">Webhook Secret</label>
            <input type="password" class="form-input form-input-mono" id="setting-gitlab_webhook_secret" placeholder="your-webhook-secret" value="${escapeAttr(getValue('gitlab_webhook_secret'))}" />
          </div>
          <div class="webhook-url">
            <span style="font-weight: 600; color: var(--text-secondary);">Webhook URL:</span>
            <code>${serverUrl}/api/webhooks/gitlab</code>
            <button class="btn btn-sm btn-secondary" onclick="navigator.clipboard.writeText('${serverUrl}/api/webhooks/gitlab').then(()=>document.getElementById('copy-gl').textContent='Copied!').catch(()=>{})">
              <span id="copy-gl">Copy</span>
            </button>
          </div>
          <div style="margin-top: var(--space-md);">
            <button class="btn btn-sm btn-secondary" id="test-gitlab">Test Connection</button>
          </div>
          <div id="gitlab-connection-status"></div>
        </div>
      </div>

      <!-- AI Section -->
      <div class="settings-section">
        <div class="settings-section-header">
          <div class="settings-section-icon" style="color: var(--accent-primary);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.57-3.25 3.92L12 10v2"/><circle cx="12" cy="16" r="2"/><path d="M6 12a6 6 0 0 1 12 0"/><path d="M2 16a10 10 0 0 1 20 0"/></svg>
          </div>
          <div>
            <div class="settings-section-title">AI Configuration</div>
            <div class="settings-section-desc">Configure the AI model used for code analysis</div>
          </div>
        </div>
        <div class="glass-card" style="padding: var(--space-lg);">
          <div class="form-group">
            <label class="form-label">Gemini API Key</label>
            <input type="password" class="form-input form-input-mono" id="setting-gemini_api_key" placeholder="AIzaSy..." value="${escapeAttr(getValue('gemini_api_key'))}" />
            <div class="form-hint">Get your key from <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Google AI Studio</a></div>
          </div>
          <div class="form-group">
            <label class="form-label">Model</label>
            <select class="form-input" id="setting-gemini_model">
              <option value="gemini-2.5-flash" ${getValue('gemini_model') === 'gemini-2.5-flash' ? 'selected' : ''}>Gemini 2.5 Flash (Fast)</option>
              <option value="gemini-2.5-pro" ${getValue('gemini_model') === 'gemini-2.5-pro' ? 'selected' : ''}>Gemini 2.5 Pro (Deep)</option>
              <option value="gemini-2.0-flash" ${getValue('gemini_model') === 'gemini-2.0-flash' ? 'selected' : ''}>Gemini 2.0 Flash</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Preferences Section -->
      <div class="settings-section">
        <div class="settings-section-header">
          <div class="settings-section-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <div>
            <div class="settings-section-title">Review Preferences</div>
            <div class="settings-section-desc">Customize how reviews are triggered and reported</div>
          </div>
        </div>
        <div class="glass-card" style="padding: var(--space-lg);">
          <div class="toggle-wrapper" style="margin-bottom: var(--space-md);">
            <div class="toggle-info">
              <div class="toggle-label">Auto-review on PR/MR events</div>
              <div class="toggle-desc">Automatically review when a PR is opened or updated</div>
            </div>
            <label class="toggle">
              <input type="checkbox" id="setting-auto_review" ${getValue('auto_review') === 'true' ? 'checked' : ''} />
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="form-group">
            <label class="form-label">Minimum Severity to Report</label>
            <select class="form-input" id="setting-min_severity">
              <option value="medium" ${getValue('min_severity') === 'medium' ? 'selected' : ''}>Medium & Above</option>
              <option value="high" ${getValue('min_severity') === 'high' ? 'selected' : ''}>High & Above</option>
              <option value="critical" ${getValue('min_severity') === 'critical' ? 'selected' : ''}>Critical Only</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">File Patterns to Ignore</label>
            <input type="text" class="form-input form-input-mono" id="setting-ignore_patterns" placeholder="*.lock,*.min.js,dist/**" value="${escapeAttr(getValue('ignore_patterns'))}" />
            <div class="form-hint">Comma-separated glob patterns. Files matching these patterns will be skipped.</div>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div style="display: flex; justify-content: flex-end; margin-top: var(--space-lg);">
        <button class="btn btn-primary" id="save-settings">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Save Settings
        </button>
      </div>
    </div>`;
}

export function initSettings() {
  
  document.getElementById('save-settings')?.addEventListener('click', async () => {
    const inputs = {
      github_token: document.getElementById('setting-github_token')?.value,
      github_webhook_secret: document.getElementById('setting-github_webhook_secret')?.value,
      gitlab_token: document.getElementById('setting-gitlab_token')?.value,
      gitlab_url: document.getElementById('setting-gitlab_url')?.value,
      gitlab_webhook_secret: document.getElementById('setting-gitlab_webhook_secret')?.value,
      gemini_api_key: document.getElementById('setting-gemini_api_key')?.value,
      gemini_model: document.getElementById('setting-gemini_model')?.value,
      min_severity: document.getElementById('setting-min_severity')?.value,
      auto_review: document.getElementById('setting-auto_review')?.checked ? 'true' : 'false',
      ignore_patterns: document.getElementById('setting-ignore_patterns')?.value,
    };

    
    const updates = {};
    for (const [key, value] of Object.entries(inputs)) {
      if (value !== undefined && !value.includes('••••')) {
        updates[key] = value;
      }
    }

    try {
      await api.updateSettings(updates);
      showToast('Settings saved successfully!', 'success');
    } catch (error) {
      showToast(`Failed to save: ${error.message}`, 'error');
    }
  });

  
  document.getElementById('test-github')?.addEventListener('click', async () => {
    const statusEl = document.getElementById('github-connection-status');
    statusEl.innerHTML = '<div class="connection-status" style="background:var(--bg-surface);color:var(--text-secondary);">Testing...</div>';
    try {
      const result = await api.testConnection('github');
      if (result.success) {
        statusEl.innerHTML = `<div class="connection-status success">✓ Connected as <strong>${result.user}</strong>${result.name ? ` (${result.name})` : ''}</div>`;
      } else {
        statusEl.innerHTML = `<div class="connection-status error">✗ ${result.error}</div>`;
      }
    } catch (error) {
      statusEl.innerHTML = `<div class="connection-status error">✗ ${error.message}</div>`;
    }
  });

  document.getElementById('test-gitlab')?.addEventListener('click', async () => {
    const statusEl = document.getElementById('gitlab-connection-status');
    statusEl.innerHTML = '<div class="connection-status" style="background:var(--bg-surface);color:var(--text-secondary);">Testing...</div>';
    try {
      const result = await api.testConnection('gitlab');
      if (result.success) {
        statusEl.innerHTML = `<div class="connection-status success">✓ Connected as <strong>${result.user}</strong>${result.name ? ` (${result.name})` : ''}</div>`;
      } else {
        statusEl.innerHTML = `<div class="connection-status error">✗ ${result.error}</div>`;
      }
    } catch (error) {
      statusEl.innerHTML = `<div class="connection-status error">✗ ${error.message}</div>`;
    }
  });
}

function escapeAttr(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
