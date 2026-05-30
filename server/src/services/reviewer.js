import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config.js';
import db from '../database.js';
import logger from '../utils/logger.js';
import * as github from './github.js';
import * as gitlab from './gitlab.js';

const SYSTEM_PROMPT = `You are an elite Staff-level software engineer and security researcher with 15+ years of experience. You approach every code review with the precision of a formal verification expert.

Your reviews are surgical — you identify the 20% of issues that cause 80% of production incidents.

Before producing output, reason through:
1. THREAT MODEL — Who can reach this code? What data does it touch?
2. EXECUTION PATHS — Trace happy path, error path, and adversarial path.
3. INTENT VS IMPLEMENTATION — Does the code achieve its stated goal?
4. BLAST RADIUS — What is the worst realistic outcome if this bug ships?
5. CONFIDENCE CHECK — Could this be handled upstream?

Detect issues across these categories (descending priority):
🔴 SECURITY — Injection, auth bypass, hardcoded secrets, XSS, SSRF, crypto misuse
🟠 BUGS — Logic errors, null dereference, race conditions, resource leaks
🟡 PERFORMANCE — O(n²), N+1 queries, blocking in async, missing pagination
🔵 CODE SMELLS — Long functions, deep nesting, magic numbers, dead code

Return ONLY a valid JSON array. No markdown fences, no preamble.
Minimum severity: MEDIUM. Maximum issues per file: 10.
If no issues meet the threshold, return: []

Each object must match:
{
  "file": "string — relative path",
  "line": number,
  "severity": "critical" | "high" | "medium",
  "category": "security" | "bug" | "performance" | "code-smell",
  "title": "string — ≤60 chars, imperative mood",
  "description": "string — 2-3 sentences with exact problem, mechanism, and impact",
  "suggestion": "string — concrete fix with code snippet when non-obvious",
  "confidence": "high" | "medium" | "low"
}

HARD CONSTRAINTS:
- NEVER hallucinate line numbers — only reference lines in the diff.
- NEVER flag issues on deleted lines (- prefix in diff).
- NEVER produce vague comments — every issue must include a specific fix.
- NEVER omit the suggestion field.
- If the diff is empty or only formatting/deletion, return [].`;


function getModel() {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'gemini_api_key'").get();
  const apiKey = row?.value || config.gemini.apiKey;
  if (!apiKey) {
    throw new Error('Gemini API key not configured. Set it in Settings or GEMINI_API_KEY env var.');
  }

  const modelRow = db.prepare("SELECT value FROM settings WHERE key = 'gemini_model'").get();
  const modelName = modelRow?.value || config.gemini.model;

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
}


function detectLanguage(filename) {
  const ext = filename.split('.').pop()?.toLowerCase();
  const map = {
    js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
    py: 'python', rb: 'ruby', go: 'go', rs: 'rust', java: 'java',
    kt: 'kotlin', swift: 'swift', cs: 'csharp', cpp: 'cpp', c: 'c',
    php: 'php', sql: 'sql', sh: 'bash', yml: 'yaml', yaml: 'yaml',
    json: 'json', html: 'html', css: 'css', scss: 'scss',
    md: 'markdown', tf: 'terraform', dockerfile: 'dockerfile',
  };
  return map[ext] || 'unknown';
}


function shouldIgnoreFile(filename) {
  const row = db.prepare("SELECT value FROM settings WHERE key = 'ignore_patterns'").get();
  const patterns = (row?.value || '').split(',').map((p) => p.trim()).filter(Boolean);

  return patterns.some((pattern) => {
    
    const regex = new RegExp(
      '^' + pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*').replace(/\?/g, '.') + '$'
    );
    return regex.test(filename);
  });
}


async function analyzeFileDiff(model, filename, patch, prDescription) {
  const language = detectLanguage(filename);

  const prompt = `Review this code diff:

filename: ${filename}
language: ${language}
${prDescription ? `pr_description: ${prDescription}` : ''}

diff:
\`\`\`
${patch}
\`\`\`

Return a JSON array of issues found. Follow the schema in your instructions exactly.`;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
      },
    });

    const text = result.response.text().trim();
    const issues = JSON.parse(text);

    if (!Array.isArray(issues)) {
      logger.warn('AI returned non-array response', { filename, response: text.slice(0, 200) });
      return [];
    }

    
    return issues
      .filter((issue) =>
        issue.file && issue.line && issue.severity && issue.category &&
        issue.title && issue.description && issue.suggestion
      )
      .map((issue) => ({
        ...issue,
        file: issue.file || filename,
        confidence: issue.confidence || 'medium',
      }));
  } catch (error) {
    logger.error('AI analysis failed for file', { filename, error: error.message });
    return [];
  }
}


export async function reviewPR(jobData) {
  const { reviewId, platform, repo, prNumber, prTitle, prAuthor, prUrl } = jobData;

  
  db.prepare("UPDATE reviews SET status = 'reviewing' WHERE id = ?").run(reviewId);
  db.prepare('INSERT INTO review_logs (review_id, event, details) VALUES (?, ?, ?)').run(
    reviewId, 'review_started', `Starting review of ${repo}#${prNumber}`
  );

  try {
    let files = [];
    let commitSha = '';
    let diffRefs = null;
    let prDescription = prTitle;

    if (platform === 'github') {
      const [owner, repoName] = repo.split('/');
      const pr = await github.fetchPR(owner, repoName, prNumber);
      commitSha = pr.head.sha;
      prDescription = pr.body || pr.title;
      files = (await github.fetchPRFiles(owner, repoName, prNumber)).map((f) => ({
        filename: f.filename,
        patch: f.patch || '',
        status: f.status,
      }));
    } else if (platform === 'gitlab') {
      const mrData = await gitlab.fetchMRChanges(repo, prNumber);
      diffRefs = mrData.diff_refs;
      prDescription = mrData.description || mrData.title;
      files = (mrData.changes || []).map((c) => ({
        filename: c.new_path,
        patch: c.diff || '',
        status: c.new_file ? 'added' : c.deleted_file ? 'removed' : 'modified',
      }));
    }

    
    const reviewableFiles = files.filter(
      (f) => f.patch && f.status !== 'removed' && !shouldIgnoreFile(f.filename)
    );

    logger.info('Reviewing files', {
      total: files.length,
      reviewable: reviewableFiles.length,
      ignored: files.length - reviewableFiles.length,
    });

    
    const model = getModel();
    const allIssues = [];

    for (const file of reviewableFiles) {
      const issues = await analyzeFileDiff(model, file.filename, file.patch, prDescription);
      allIssues.push(...issues);
    }

    
    const summary = generateSummary(allIssues, reviewableFiles.length);

    
    try {
      if (platform === 'github') {
        const [owner, repoName] = repo.split('/');
        await github.postReviewComments(owner, repoName, prNumber, commitSha, allIssues);
      } else if (platform === 'gitlab') {
        await gitlab.postReview(repo, prNumber, allIssues, diffRefs);
      }
      db.prepare('INSERT INTO review_logs (review_id, event, details) VALUES (?, ?, ?)').run(
        reviewId, 'comments_posted', `Posted ${allIssues.length} issue(s) to ${platform}`
      );
    } catch (postError) {
      logger.error('Failed to post review comments', { error: postError.message });
      db.prepare('INSERT INTO review_logs (review_id, event, details) VALUES (?, ?, ?)').run(
        reviewId, 'post_failed', `Failed to post comments: ${postError.message}`
      );
    }

    
    db.prepare(`
      UPDATE reviews
      SET status = 'completed', issues_found = ?, summary = ?,
          files_reviewed = ?, completed_at = datetime('now')
      WHERE id = ?
    `).run(JSON.stringify(allIssues), summary, reviewableFiles.length, reviewId);

    db.prepare('INSERT INTO review_logs (review_id, event, details) VALUES (?, ?, ?)').run(
      reviewId, 'review_completed', `Found ${allIssues.length} issue(s) across ${reviewableFiles.length} file(s)`
    );

    logger.info('Review completed', { reviewId, issueCount: allIssues.length });
    return { issues: allIssues, summary };
  } catch (error) {
    logger.error('Review failed', { reviewId, error: error.message });

    db.prepare("UPDATE reviews SET status = 'failed', error_message = ? WHERE id = ?")
      .run(error.message, reviewId);
    db.prepare('INSERT INTO review_logs (review_id, event, details) VALUES (?, ?, ?)').run(
      reviewId, 'review_failed', error.message
    );

    throw error;
  }
}

function generateSummary(issues, filesReviewed) {
  const counts = { critical: 0, high: 0, medium: 0 };
  const categories = { security: 0, bug: 0, performance: 0, 'code-smell': 0 };

  issues.forEach((issue) => {
    if (counts[issue.severity] !== undefined) counts[issue.severity]++;
    if (categories[issue.category] !== undefined) categories[issue.category]++;
  });

  const parts = [`Reviewed ${filesReviewed} file(s). Found ${issues.length} issue(s).`];

  if (issues.length > 0) {
    parts.push(
      `Severity: ${counts.critical} critical, ${counts.high} high, ${counts.medium} medium.`
    );
    parts.push(
      `Categories: ${categories.security} security, ${categories.bug} bugs, ${categories.performance} performance, ${categories['code-smell']} code smells.`
    );
  } else {
    parts.push('No significant issues found — code looks good!');
  }

  return parts.join(' ');
}
