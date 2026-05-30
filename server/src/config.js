import 'dotenv/config';

const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',

  github: {
    token: process.env.GITHUB_TOKEN || '',
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET || '',
  },

  gitlab: {
    token: process.env.GITLAB_TOKEN || '',
    url: process.env.GITLAB_URL || 'https://gitlab.com',
    webhookSecret: process.env.GITLAB_WEBHOOK_SECRET || '',
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  },
};

export default config;
