# CodeSentry AI — Setup Guide

## 1. Create a GitHub OAuth App

1. Go to [github.com/settings/developers](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name:** CodeSentry AI
   - **Homepage URL:** `http://localhost:5173`
   - **Authorization callback URL:** `http://localhost:5173/auth.html?callback=github`
4. Click **Register application**
5. Copy the **Client ID** → paste into `.env` as `GITHUB_CLIENT_ID`
6. Click **Generate a new client secret** → paste into `.env` as `GITHUB_CLIENT_SECRET`
7. Open `client/auth.html` and replace `YOUR_GITHUB_CLIENT_ID` on the first script line with your actual Client ID

## 2. Install and run

```bash
npm install
cp .env.example .env
```

Edit `.env` and fill in your GitHub OAuth credentials, then:

```bash
npm run dev
```

This starts:
- **Node server** on `http://localhost:3000`
- **Vite client** on `http://localhost:5173`

## 3. Open the app

Open `http://localhost:5173/landing.html` in your browser.

Click **Sign up free** or **Get Started** → you land on `auth.html`.

Click **Continue with GitHub** → authorise the OAuth App → you land on the dashboard.

## 4. Test the live AI demo

In the **Dashboard** tab, scroll down to the **Live AI Code Review** card:

- Click any sample button (**SQL Injection**, **N+1 Query**, **Null Dereference**) for instant pre-computed results (no network call)
- Or enter a public GitHub repo + PR number (e.g. `expressjs/express` + `5390`) and click **Analyze PR**
- The diff is fetched from the GitHub API using your OAuth token
- The analysis is performed by **GitHub Models (gpt-4o)** — free with your account
- Results appear in 3–5 seconds with severity badges, descriptions, and fix suggestions

## 5. GitHub Models limits

| Account Type | AI Requests/Day |
|---|---|
| GitHub Free | ~150 |
| GitHub Pro | ~450 |

Rate limit errors are caught and displayed as friendly messages in the results area.

## 6. How the flowchart works

Scroll down past the demo card on the Dashboard to see the **How CodeSentry Works** visual flowchart. It animates in on scroll and shows the full lifecycle: PR opened → webhook → diff fetch → AI analysis → decision → comments or approval.

## 7. Push to GitHub

```bash
git add .
git commit -m "feat: GitHub Models integration, flowchart, OAuth sign-in, no API key"
git push origin main
```
