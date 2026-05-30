import { Octokit } from '@octokit/rest';
import config from '../config.js';
import db from '../database.js';
import logger from '../utils/logger.js';


function getOctokit() {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'github_token'").get();
  const token = row?.value || config.github.token;
  if (!token) {
    throw new Error('GitHub token not configured. Set it in Settings or GITHUB_TOKEN env var.');
  }
  return new Octokit({ auth: token });
}


export async function fetchPRFiles(owner, repo, prNumber) {
  const octokit = getOctokit();
  const files = [];
  let page = 1;

  while (true) {
    const { data } = await octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber,
      per_page: 100,
      page,
    });

    files.push(...data);
    if (data.length < 100) break;
    page++;
  }

  logger.info('Fetched PR files', { owner, repo, prNumber, fileCount: files.length });
  return files;
}


export async function fetchPR(owner, repo, prNumber) {
  const octokit = getOctokit();
  const { data } = await octokit.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  });
  return data;
}


export async function postReviewComments(owner, repo, prNumber, commitSha, issues) {
  const octokit = getOctokit();

  
  const comments = issues
    .filter((issue) => issue.file && issue.line)
    .map((issue) => ({
      path: issue.file,
      line: issue.line,
      side: 'RIGHT',
      body: formatIssueComment(issue),
    }));

  
  if (comments.length > 0) {
    await octokit.pulls.createReview({
      owner,
      repo,
      pull_number: prNumber,
      commit_id: commitSha,
      event: 'COMMENT',
      body: formatReviewSummary(issues),
      comments,
    });
  } else {
    
    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body: formatReviewSummary(issues),
    });
  }

  logger.info('Posted review comments', { owner, repo, prNumber, commentCount: comments.length });
}


export async function testConnection() {
  try {
    const octokit = getOctokit();
    const { data } = await octokit.users.getAuthenticated();
    return { success: true, user: data.login, name: data.name };
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
