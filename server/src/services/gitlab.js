import config from '../config.js';
import db from '../database.js';
import logger from '../utils/logger.js';


function getConfig() {
  const getVal = (key, fallback) => {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    return row?.value || fallback;
  };

  const token = getVal('gitlab_token', config.gitlab.token);
  const baseUrl = getVal('gitlab_url', config.gitlab.url).replace(/\/+$/, '');

  if (!token) {
    throw new Error('GitLab token not configured. Set it in Settings or GITLAB_TOKEN env var.');
  }

  return { token, baseUrl };
}


async function gitlabFetch(path, options = {}) {
  const { token, baseUrl } = getConfig();
  const url = `${baseUrl}/api/v4${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'PRIVATE-TOKEN': token,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitLab API error ${response.status}: ${body}`);
  }

  return response.json();
}


export async function fetchMRChanges(projectId, mrIid) {
  const data = await gitlabFetch(
    `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/changes`
  );
  logger.info('Fetched MR changes', { projectId, mrIid, fileCount: data.changes?.length || 0 });
  return data;
}


export async function fetchMR(projectId, mrIid) {
  return gitlabFetch(`/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}`);
}


export async function fetchMRDiffs(projectId, mrIid) {
  const data = await gitlabFetch(
    `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/diffs`
  );
  return data;
}


export async function postMRNote(projectId, mrIid, body) {
  await gitlabFetch(
    `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/notes`,
    {
      method: 'POST',
      body: JSON.stringify({ body }),
    }
  );
  logger.info('Posted MR note', { projectId, mrIid });
}


export async function postMRDiscussion(projectId, mrIid, issue, diffRefs) {
  const position = {
    base_sha: diffRefs.base_sha,
    head_sha: diffRefs.head_sha,
    start_sha: diffRefs.start_sha,
    position_type: 'text',
    new_path: issue.file,
    new_line: issue.line,
  };

  await gitlabFetch(
    `/projects/${encodeURIComponent(projectId)}/merge_requests/${mrIid}/discussions`,
    {
      method: 'POST',
      body: JSON.stringify({
        body: formatIssueComment(issue),
        position,
      }),
    }
  );
}


export async function postReview(projectId, mrIid, issues, diffRefs) {
  
  await postMRNote(projectId, mrIid, formatReviewSummary(issues));

  
  for (const issue of issues) {
    if (!issue.file || !issue.line) continue;
    try {
      await postMRDiscussion(projectId, mrIid, issue, diffRefs);
    } catch (error) {
      
      logger.warn('Failed to post inline discussion', {
        file: issue.file,
        line: issue.line,
        error: error.message,
      });
    }
  }

  logger.info('Posted MR review', { projectId, mrIid, issueCount: issues.length });
}


export async function testConnection() {
  try {
    const data = await gitlabFetch('/user');
    return { success: true, user: data.username, name: data.name };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function formatIssueComment(issue) {
  const severityEmoji = { critical: '🔴', high: '🟠', medium: '🟡' };
  const emoji = severityEmoji[issue.severity] || '⚪';
  return [
    `${emoji} **${issue.severity.toUpperCase()}** — ${issue.title}`,
    '',
    `**Category:** ${issue.category} | **Confidence:** ${issue.confidence}`,
    '',
    issue.description,
    '',
    '**Suggestion:**',
    issue.suggestion,
  ].join('\n');
}

function formatReviewSummary(issues) {
  const counts = { critical: 0, high: 0, medium: 0 };
  issues.forEach((i) => {
    if (counts[i.severity] !== undefined) counts[i.severity]++;
  });

  const lines = [
    '## 🤖 AI Code Review Summary',
    '',
    `| Severity | Count |`,
    `|----------|-------|`,
    `| 🔴 Critical | ${counts.critical} |`,
    `| 🟠 High | ${counts.high} |`,
    `| 🟡 Medium | ${counts.medium} |`,
    `| **Total** | **${issues.length}** |`,
    '',
  ];

  if (issues.length === 0) {
    lines.push('✅ No significant issues found. Code looks good!');
  } else {
    lines.push('See inline comments for details and suggested fixes.');
  }

  lines.push('', '---', '*Powered by AI Code Review Assistant*');
  return lines.join('\n');
}
