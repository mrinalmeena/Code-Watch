import { Router } from 'express';
import config from '../config.js';

const router = Router();

router.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'No code provided' });

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id:     config.github.clientId,
        client_secret: config.github.clientSecret,
        code
      })
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      return res.status(401).json({ error: tokenData.error_description || 'OAuth token exchange failed' });
    }

    const token = tokenData.access_token;

    const userRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: 'Bearer ' + token }
    });

    const user = await userRes.json();

    res.json({
      token,
      user: {
        login:      user.login,
        name:       user.name || user.login,
        avatar_url: user.avatar_url,
        plan:       user.plan?.name || 'free'
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'OAuth callback failed: ' + err.message });
  }
});

router.post('/review', async (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated. Sign in with GitHub.' });
  }

  const ghToken = authHeader.slice(7);
  const { diff, source } = req.body;

  if (!diff || !diff.trim()) {
    return res.status(400).json({ error: 'No diff provided.' });
  }

  const systemPrompt =
    'You are an expert code reviewer. Analyze this diff and ' +
    'return ONLY a valid JSON array of issues. No markdown. ' +
    'Each item: { "file": string, "line": number, ' +
    '"severity": "critical"|"high"|"medium", ' +
    '"category": "security"|"bug"|"performance"|"code-smell", ' +
    '"title": string max 60 chars, ' +
    '"description": string 2-3 sentences, ' +
    '"suggestion": string with code snippet, ' +
    '"confidence": "high"|"medium"|"low" } ' +
    'Return [] if no issues above medium severity. JSON only.';

  try {
    const modelRes = await fetch('https://models.inference.ai.azure.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + ghToken
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Source: ' + (source || 'unknown') + '\n\nDiff:\n' + diff.slice(0, 4000) }
        ],
        temperature: 0.1,
        max_tokens: 1500,
        response_format: { type: 'json_object' }
      })
    });

    if (modelRes.status === 429) {
      return res.status(429).json({
        error: 'GitHub Models rate limit reached. Try again in a few minutes, or upgrade to GitHub Pro for higher limits.'
      });
    }

    if (!modelRes.ok) {
      const errData = await modelRes.json().catch(() => ({}));
      throw new Error(errData.error?.message || 'GitHub Models API error: ' + modelRes.status);
    }

    const modelData = await modelRes.json();
    const text = modelData.choices?.[0]?.message?.content || '[]';

    let issues;
    try {
      const parsed = JSON.parse(text);
      issues = Array.isArray(parsed) ? parsed : (parsed.issues || parsed.results || []);
    } catch {
      issues = [];
    }

    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Analysis failed.' });
  }
});

export default router;
