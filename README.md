# AI Code Review Assistant

A premium automated AI code review platform that provides real-time checks on security, performance, code quality, and readability.

---

# Key Features

- **Automated AI Reviews**: Evaluates code changes (diffs) instantly for vulnerabilities like SQL injection, N+1 queries, and null pointer dereferences.
- **Interactive Live Demo**: Input any custom code diff or load a GitHub pull request URL to get live feedback powered by the Claude API.
- **Unified Dark Mode Design**: A premium dark-mode interface with a cohesive sage-green, teal, and peach color palette across all pages.
- **Analytics & Metrics**: Visual breakdown of code issue severity (Critical, High, Medium), categories (Security, Performance, Style), and historical reviews.
- **Password Recovery & Social Sign-In**: Fully integrated authentication system with a custom password reset flow and mock social authentication (GitHub, GitLab, Google).

---

# Project Structure

```text
├── client/                 # Frontend SPA (Vite + Vanilla CSS & JS)
│   ├── src/                # Frontend source code
│   │   ├── components/     # Reusable UI widgets (sidebar, toast, badges)
│   │   ├── pages/          # Application views (dashboard, auth, settings)
│   │   └── styles/         # Styled stylesheets (index.css, auth.css)
│   ├── landing.html        # Product Landing Page
│   └── auth.html           # Standalone authentication page
├── server/                 # Backend Node.js Express server
│   ├── src/                # Backend controller & service layer
│   │   ├── routes/         # API endpoints (reviews, analytics, auth)
│   │   └── services/       # Review queue & platform integrations
└── package.json            # Main workspace setup
```

---

# Getting Started

# 1. Installation
Install dependencies in the root, client, and server directories:
```bash
npm install
cd client && npm install
cd ../server && npm install
```

# 2. Configuration
Copy the sample environment file and adjust keys:
```bash
cp .env.example .env
```

# 3. Running Locally
Run the developer environments for the frontend and backend simultaneously:
```bash
# Start backend server
cd server && npm run dev

# Start frontend (Vite)
cd client && npm run dev
```

The frontend will start at `http://localhost:5174/` (or next available port).
